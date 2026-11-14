/* Icarus Stake (unified ledger, 30 live rule checks, risk-of-ruin contour, NYSE calendar).
   A trading journal ONLY: never places trades, never connects to a broker, never gives financial advice. */
(function () {
  "use strict";
  const { $, h, money, num, day, toast, store, download, pickFile, tabs, spark, field, G } = PK;
  const S = store("icarus");
  const app = $("#app");

  // Wing feather field
  field({
    count: 900,
    at: [0.74, 0.36],
    scale: 0.3,
    glyph: (n) => Array.from({ length: 9 }, (_, i) => {
      const a = -0.25 - i * 0.13, L = 1.05 - i * 0.07;
      return G.line(Math.round(n / 9), -0.55, 0.45, -0.55 + Math.cos(a) * L * 1.5, 0.45 + Math.sin(a) * L);
    }).flat(),
  });

  const DEFAULT_RULES = [
    "Risk at most 1% of the bankroll on one trade.",
    "Every trade has a stop before it is entered.",
    "No more than 3 trades a day.",
    "No revenge trade after a loss.",
    "Write the reason before the entry.",
  ];
  if (!S.get("rules")) S.set("rules", DEFAULT_RULES.map((t, i) => ({ id: "r" + i, text: t })));
  if (S.get("bankroll") == null) S.set("bankroll", 10000);

  // Merge any orphaned entries from prometheus.icarus.journal into canonical S.list("trades")
  (function migrateLegacyJournal() {
    try {
      const raw = JSON.parse(localStorage.getItem("prometheus.icarus.journal") || "[]");
      if (!Array.isArray(raw) || !raw.length) return;
      const existing = S.list("trades");
      const sig = new Set(existing.map((t) => `${t.date}|${t.sym}|${t.entry}|${t.qty}|${t.exit}`));
      let added = 0;
      for (const j of raw) {
        const sym = String(j.symbol || j.sym || "").trim().toUpperCase();
        const key = `${j.date}|${sym}|${j.entry}|${j.qty}|${j.exit}`;
        if (!sig.has(key) && sym) {
          S.add("trades", {
            date: j.date,
            sym,
            side: j.side || "long",
            qty: +j.qty || 0,
            entry: +j.entry || 0,
            stop: j.stop == null || j.stop === "" ? null : +j.stop,
            exit: j.exit == null || j.exit === "" ? "" : +j.exit,
            fees: +j.fees || 0,
            kept: j.kept || "yes",
            why: j.why || "",
          });
          added++;
        }
      }
      if (added) localStorage.removeItem("prometheus.icarus.journal");
    } catch (_) { /* ignore */ }
  })();

  // Benchmark 20-trade dataset illustrating discipline kept vs violations (all net arithmetic transparent)
  const BENCHMARK_20 = [
    { date: "2026-10-01", sym: "SPY", side: "long", qty: 5, entry: 570, stop: 566, exit: 578, fees: 1, kept: "yes", why: "Opening range reclaim above VWAP with 2R target" },
    { date: "2026-10-02", sym: "TSLA", side: "long", qty: 4, entry: 250, stop: 245, exit: 238, fees: 1, kept: "no", why: "Moved stop hoping rebound into afternoon selloff" },
    { date: "2026-10-03", sym: "AAPL", side: "long", qty: 6, entry: 226, stop: 223, exit: 232, fees: 1, kept: "yes", why: "Daily trend pullback to 20 EMA with volume" },
    { date: "2026-10-04", sym: "NVDA", side: "long", qty: 5, entry: 120, stop: 116, exit: 129, fees: 1, kept: "yes", why: "Breakout from multi-day compression above 120" },
    { date: "2026-10-05", sym: "AMD", side: "long", qty: 20, entry: 150, stop: 147, exit: 147, fees: 1, kept: "yes", why: "Post-windfall oversized scalp attempt into resistance" },
    { date: "2026-10-06", sym: "META", side: "short", qty: 2, entry: 590, stop: 598, exit: 605, fees: 1, kept: "no", why: "Ignored stop and shorted strength on chatroom tip" },
    { date: "2026-10-07", sym: "MSFT", side: "long", qty: 8, entry: 380, stop: 374, exit: 392, fees: 1, kept: "yes", why: "Higher low bounce off prior day close" },
    { date: "2026-10-08", sym: "QQQ", side: "long", qty: 3, entry: 492, stop: 486, exit: 477, fees: 1, kept: "no", why: "Hoping FOMC drift recovers past stop" },
    { date: "2026-10-09", sym: "AMZN", side: "long", qty: 10, entry: 185, stop: 181, exit: 191, fees: 1, kept: "yes", why: "Opening flag continuation on sector leader" },
    { date: "2026-10-10", sym: "IWM", side: "long", qty: 12, entry: 220, stop: 217, exit: 225, fees: 1, kept: "yes", why: "Small-cap breadth expansion hold" },
    { date: "2026-10-13", sym: "GOOGL", side: "short", qty: 8, entry: 168, stop: 171, exit: 171, fees: 1, kept: "yes", why: "Failed gap fill short stopped at planned level" },
    { date: "2026-10-14", sym: "NFLX", side: "long", qty: 2, entry: 470, stop: 460, exit: 495, fees: 1, kept: "yes", why: "Pre-earnings drift base breakout cleanly trailed" },
    { date: "2026-10-15", sym: "COIN", side: "long", qty: 10, entry: 130, stop: 124, exit: 118, fees: 1, kept: "no", why: "FOMO chase without stop discipline; froze on drop" },
    { date: "2026-10-16", sym: "SMCI", side: "short", qty: 6, entry: 48, stop: 51, exit: 45, fees: 1, kept: "yes", why: "Lower high rejection below VWAP" },
    { date: "2026-10-17", sym: "BA", side: "long", qty: 6, entry: 156, stop: 152, exit: 149, fees: 1, kept: "yes", why: "Overnight gap past protective stop" },
    { date: "2026-10-18", sym: "JPM", side: "long", qty: 8, entry: 210, stop: 207, exit: 215, fees: 1, kept: "yes", why: "Bank earnings follow-through higher low" },
    { date: "2026-10-20", sym: "AVGO", side: "long", qty: 10, entry: 175, stop: 172, exit: 170.5, fees: 1, kept: "no", why: "Revenge size-up after BA gap loss" },
    { date: "2026-10-21", sym: "AAPL", side: "long", qty: 4, entry: 230, stop: 226, exit: 230, fees: 1, kept: "yes", why: "Flat scratch after stalled momentum" },
    { date: "2026-10-22", sym: "CRM", side: "short", qty: 6, entry: 290, stop: 295, exit: 280, fees: 1, kept: "yes", why: "Parabolic extension short back to EMA" },
    { date: "2026-10-23", sym: "TSLA", side: "long", qty: 5, entry: 244, stop: 238, exit: 232, fees: 1, kept: "no", why: "Repeat ticker chase hoping rebound; blew 2R loss" },
  ];

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pl = (t) => (t.exit === "" || t.exit == null ? null : ((+t.exit - +t.entry) * +t.qty * (t.side === "short" ? -1 : 1)) - (+t.fees || 0));
  const riskOf = (t) => (t.stop != null && t.stop !== "" && +t.stop > 0 ? Math.abs(+t.entry - +t.stop) * +t.qty : null);

  function envFor(t, hist) {
    const prev = hist[hist.length - 1] || null;
    const dayCount = hist.filter((x) => x.date === t.date).length + 1;
    let cum = 0;
    for (const x of hist) cum += pl(x) || 0;
    const sym = String(t.sym || t.symbol || "").toUpperCase();
    const sameSym = [...hist].reverse().find((x) => String(x.sym || x.symbol || "").toUpperCase() === sym);
    const rMult = (p) => { const r = riskOf(p); const v = pl(p); return r && r > 0 && v != null ? v / r : 0; };
    return {
      ...t,
      symbol: sym,
      exit: t.exit === "" || t.exit == null ? +t.entry : +t.exit,
      prev_pnl: prev ? (pl(prev) || 0) : 0,
      prev_qty: prev ? +prev.qty : 0,
      prev_entry: prev ? +prev.entry : 0,
      prev_stop: prev ? (prev.stop == null ? 0 : +prev.stop) : 0,
      prev_date: prev ? prev.date : "",
      prev_kept: prev ? prev.kept : "yes",
      prev_cum_pnl: cum,
      day_trade_count: dayCount,
      prev_same_sym_pnl: sameSym ? (pl(sameSym) || 0) : 0,
      prev_r_multiple: prev ? rMult(prev) : 0,
    };
  }

  function scaleFormula(formula, bk) {
    const b = bk > 0 ? bk : 10000;
    return formula
      .replace(/2500\.00/g, String(b * 0.25))
      .replace(/600\.00/g, String(b * 0.06))
      .replace(/200\.00/g, String(b * 0.02))
      .replace(/100\.00/g, String(b * 0.01));
  }

  function evalTradeRules(t, hist, bk) {
    if (!window.RULE_EVAL || !window.RULE_CHECKS) return [];
    const env = envFor(t, hist);
    const hits = [];
    for (const r of window.RULE_CHECKS) {
      try {
        if (window.RULE_EVAL.evaluate(scaleFormula(r.formula, bk), env)) hits.push(r);
      } catch (_) { /* ignore unparsable */ }
    }
    return hits;
  }

  // Geometric Markov approximation of Risk of Ruin to drawdown threshold DD (fraction, e.g. 0.5)
  // Using discrete fractional risk r (e.g. 0.01), payoff ratio b (avgWin / avgLoss), win prob w:
  function calcRiskOfRuin(w, r, b, ddTarget) {
    if (w <= 0) return 100;
    if (w >= 1) return 0;
    const steps = Math.max(1, Math.round(ddTarget / Math.max(0.001, r)));
    const pWin = w;
    const pLose = 1 - w;
    // Asymmetric random walk drift per trade in R units: E = w*b - (1-w)*1
    // Solve exponential martingale E[s^X] = 1 for s in (0, 1): w*s^b + (1-w)*s^-1 = 1
    const edge = pWin * b - pLose;
    if (edge <= 0) return 100;
    let lo = 0.0001, hi = 0.999999;
    for (let it = 0; it < 48; it++) {
      const mid = (lo + hi) * 0.5;
      const val = pWin * Math.pow(mid, b) + pLose / mid - 1;
      if (val > 0) lo = mid; else hi = mid;
    }
    const q = (lo + hi) * 0.5;
    return Math.min(100, Math.max(0, Math.pow(q, steps) * 100));
  }

  window.ICARUS = {
    pl,
    riskOf,
    evalTradeRules,
    getTrades: () => S.list("trades").sort((a, b) => (String(a.date) + String(a.at)).localeCompare(String(b.date) + String(b.at))),
    getBankroll: () => +S.get("bankroll", 0) || 10000,
    notify: () => { paint(); window.dispatchEvent(new CustomEvent("icarus:updated")); },
  };

  app.innerHTML = `
    <p class="note disclaimer">Discipline journal only: connects to zero brokers, executes zero orders, and computes pure arithmetic on the trades you enter.</p>
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-sum" aria-controls="p-sum">Summary</button>
      <button class="tab" role="tab" id="t-log" aria-controls="p-log">Log Trade</button>
      <button class="tab" role="tab" id="t-rules" aria-controls="p-rules">Rules & Cost</button>
      <button class="tab" role="tab" id="t-ruin" aria-controls="p-ruin">Risk of Ruin</button>
      <button class="tab" role="tab" id="t-market" aria-controls="p-market">Ledger & NYSE</button>
    </div>

    <section id="p-sum" role="tabpanel" class="grid">
      <div class="glass lit span-8">
        <div class="row-actions" style="justify-content:space-between">
          <div><div class="stat-k">Net result (closed trades)</div><div class="stat-v big" id="i-net">—</div><div class="stat-s" id="i-net-s"></div></div>
          <button class="btn quiet small" id="i-bench" type="button">Load 20-Trade Benchmark</button>
        </div>
        <canvas class="spark" id="i-curve" style="margin-top:12px"></canvas>
      </div>
      <div class="glass span-4">
        <h2>Discipline delta</h2>
        <div class="stat-k">Rules kept</div><div class="stat-v" id="i-kept">—</div><div class="stat-s" id="i-kept-s"></div>
        <div class="stat-k" style="margin-top:12px">Rules broken</div><div class="stat-v" id="i-broke">—</div><div class="stat-s" id="i-broke-s"></div>
      </div>
      <div class="glass span-3"><div class="stat-k">Win rate</div><div class="stat-v" id="i-win">—</div><div class="stat-s" id="i-win-s"></div></div>
      <div class="glass span-3"><div class="stat-k">Expectancy</div><div class="stat-v" id="i-exp">—</div><div class="stat-s" id="i-exp-s">avg net $ per trade</div></div>
      <div class="glass span-3"><div class="stat-k">Profit factor</div><div class="stat-v" id="i-pf">—</div><div class="stat-s">gross wins / losses</div></div>
      <div class="glass span-3"><div class="stat-k">SQN & Drawdown</div><div class="stat-v" id="i-dd">—</div><div class="stat-s" id="i-sqn">SQN —</div></div>
      <div class="glass span-12"><h2>Open trades</h2><ul class="list" id="i-open"></ul></div>
    </section>

    <section id="p-log" role="tabpanel" class="grid">
      <div class="glass span-12">
        <h2>Log a trade (checked live against 30 discipline rules)</h2>
        <form class="form" id="i-form">
          <label class="f">Day<input name="date" type="date" required></label>
          <label class="f">Symbol<input name="sym" required maxlength="16" placeholder="BTC, TSLA"></label>
          <label class="f">Side<select name="side"><option value="long">Long</option><option value="short">Short</option></select></label>
          <label class="f">Quantity<input name="qty" type="number" step="any" min="0" required></label>
          <label class="f">Entry<input name="entry" type="number" step="any" min="0" required></label>
          <label class="f">Stop<input name="stop" type="number" step="any" min="0"></label>
          <label class="f">Exit (blank = open)<input name="exit" type="number" step="any" min="0"></label>
          <label class="f">Fees<input name="fees" type="number" step="any" min="0" value="1"></label>
          <label class="f">Rules kept?<select name="kept"><option value="yes">Yes, all of them</option><option value="no">No, I broke one</option></select></label>
          <label class="f wide">Why I took it<textarea name="why" maxlength="600" placeholder="Write the thesis before entry (min 10 chars, avoid FOMO/tip phrasing)"></textarea></label>
          <div class="wide note" id="i-risk"></div>
          <div class="wide" id="i-precheck"></div>
          <button class="btn" type="submit">Save to unified ledger</button>
        </form>
      </div>
    </section>

    <section id="p-rules" role="tabpanel" class="grid">
      <div class="glass span-6">
        <h2>Bankroll & 1% Risk Cap</h2>
        <form class="form" id="i-bank"><label class="f wide">Dedicated trading bankroll ($)<input name="b" type="number" step="any" min="0"></label><button class="btn small" type="submit">Save bankroll</button></form>
        <p class="note" id="i-bank-s"></p>
        <h2 style="margin-top:16px">Your Personal Rules</h2>
        <ul class="list" id="i-rules"></ul>
        <form class="form" id="i-rule" style="margin-top:10px"><label class="f wide">Add a personal rule<input name="t" maxlength="160" required></label><button class="btn small" type="submit">Add</button></form>
      </div>
      <div class="glass span-6">
        <h2>Violation Cost Ledger (30 Automated Checks)</h2>
        <p class="sub">Each closed trade is evaluated against all 30 <code>RULE_CHECKS</code> scaled to your bankroll.</p>
        <div id="i-rule-ledger"></div>
      </div>
      <div class="span-12" id="icarus-analytics"></div>
    </section>

    <section id="p-ruin" role="tabpanel" class="grid">
      <div class="glass span-12">
        <h2>Risk-of-Ruin Contour Matrix (135 Cells)</h2>
        <p class="sub">Probability (%) of hitting a drawdown threshold before doubling edge. Your current win rate &times; avg risk% is outlined in white.</p>
        <form class="form" style="margin-bottom:10px">
          <label class="f">Payoff ratio (b = Win/Loss)<input id="r-payoff" type="number" min="0.5" max="5" step="0.1" value="1.5"></label>
          <label class="f">Drawdown ruin threshold<select id="r-dd"><option value="0.25">25% Drawdown</option><option value="0.5" selected>50% Drawdown</option><option value="1">100% Blowout</option></select></label>
        </form>
        <div class="scroll-x" id="i-ruin-box"></div>
      </div>
    </section>

    <section id="p-market" role="tabpanel" class="grid">
      <div class="glass span-12">
        <div class="row-actions" style="justify-content:space-between">
          <h2>Every trade in unified ledger</h2>
          <button class="btn quiet small" id="i-clear" type="button">Clear all trades</button>
        </div>
        <div class="scroll-x">
          <table class="t">
            <thead><tr><th>Day</th><th>Trade</th><th class="n">Entry</th><th class="n">Exit</th><th class="n">Result</th><th>Flags</th><th></th></tr></thead>
            <tbody id="i-rows"></tbody>
          </table>
        </div>
      </div>
      <div class="span-12" id="icarus-market"></div>
    </section>
  `;

  function paintRuinMatrix(winPct, avgRiskPct) {
    const box = $("#i-ruin-box");
    const b = Math.max(0.4, +$("#r-payoff").value || 1.5);
    const dd = Math.max(0.1, +$("#r-dd").value || 0.5);
    const winGrid = [30, 35, 40, 45, 50, 55, 60, 65, 70]; // 9 rows
    const riskGrid = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.5]; // 15 cols -> 9x15 = 135 cells
    const nearest = (arr, v) => arr.reduce((a, c) => (Math.abs(c - v) < Math.abs(a - v) ? c : a), arr[0]);
    const youW = winPct != null ? nearest(winGrid, winPct) : null;
    const youR = avgRiskPct != null ? nearest(riskGrid, avgRiskPct) : null;
    const rowsHtml = winGrid.map((w) => {
      const cells = riskGrid.map((r) => {
        const ruin = calcRiskOfRuin(w / 100, r / 100, b, dd);
        const bg = ruin >= 50 ? "rgba(255,107,134,0.28)" : ruin >= 10 ? "rgba(255,197,82,0.2)" : "rgba(125,255,192,0.16)";
        const isYou = youW === w && youR === r;
        return `<td class="ruin-cell${isYou ? " you" : ""}" style="background:${bg}" title="Win ${w}% · Risk ${r}% · b=${b} -> ${ruin.toFixed(1)}%">${ruin < 0.1 ? "<0.1" : ruin.toFixed(0)}%</td>`;
      }).join("");
      return `<tr><th>${w}%</th>${cells}</tr>`;
    }).join("");
    box.innerHTML = `<table class="ruin-grid"><thead><tr><th>Win \\ Risk</th>${riskGrid.map((r) => `<th>${r}%</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
  }

  function paint() {
    const trades = window.ICARUS.getTrades();
    const closed = trades.filter((t) => pl(t) != null);
    const res = closed.map(pl);
    const net = res.reduce((a, b) => a + b, 0);
    const wins = res.filter((x) => x > 0), losses = res.filter((x) => x < 0);
    const bank = +S.get("bankroll", 0);

    $("#i-net").textContent = closed.length ? money(net) : "—";
    $("#i-net").className = "stat-v big " + (net > 0 ? "up" : net < 0 ? "down" : "");
    $("#i-net-s").textContent = closed.length ? `${closed.length} closed${bank ? ` · ${num((net / bank) * 100, 1)}% of bankroll` : ""}` : "No closed trades yet.";

    let eq = 0, peak = 0, dd = 0;
    const curve = [{ x: 0, y: 0 }];
    res.forEach((r, i) => { eq += r; peak = Math.max(peak, eq); dd = Math.min(dd, eq - peak); curve.push({ x: i + 1, y: eq }); });
    spark($("#i-curve"), closed.length ? curve : [], { zero: 0, empty: "Equity curve starts with your first closed trade (or load benchmark)." });

    const winRate = closed.length ? (wins.length / closed.length) * 100 : null;
    $("#i-win").textContent = winRate != null ? num(winRate, 0) + "%" : "—";
    $("#i-win-s").textContent = closed.length ? `${wins.length} won · ${losses.length} lost` : "";
    $("#i-exp").textContent = closed.length ? money(net / closed.length) : "—";
    const rMultiples = closed.map((t) => { const r = riskOf(t); return r ? pl(t) / r : null; }).filter((x) => x != null);
    const avgR = rMultiples.length ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : null;
    const sdR = rMultiples.length > 1 ? Math.sqrt(rMultiples.reduce((a, x) => a + (x - avgR) ** 2, 0) / (rMultiples.length - 1)) : 0;
    const sqn = rMultiples.length >= 2 && sdR > 0 ? (Math.sqrt(rMultiples.length) * avgR) / sdR : null;
    $("#i-exp-s").textContent = avgR != null ? `avg ${num(avgR, 2)}R per trade` : "avg net $ per trade";

    const gw = wins.reduce((a, b) => a + b, 0);
    const gl = -losses.reduce((a, b) => a + b, 0);
    $("#i-pf").textContent = closed.length ? (gl ? num(gw / gl, 2) : wins.length ? "∞" : "—") : "—";
    $("#i-dd").textContent = closed.length ? money(dd) : "—";
    $("#i-sqn").textContent = sqn != null ? `SQN ${num(sqn, 2)}` : "SQN —";

    const kept = closed.filter((t) => t.kept === "yes"), broke = closed.filter((t) => t.kept !== "yes");
    const sumPL = (list) => list.reduce((a, t) => a + (pl(t) || 0), 0);
    $("#i-kept").textContent = kept.length ? money(sumPL(kept)) : "—";
    $("#i-kept").className = "stat-v " + (sumPL(kept) >= 0 ? "up" : "down");
    $("#i-kept-s").textContent = `${kept.length} trades`;
    $("#i-broke").textContent = broke.length ? money(sumPL(broke)) : "—";
    $("#i-broke").className = "stat-v " + (sumPL(broke) >= 0 ? "up" : "down");
    $("#i-broke-s").textContent = broke.length ? `${broke.length} trades · ${sumPL(broke) < 0 ? "cost" : "made"} ${money(Math.abs(sumPL(broke)))}` : "Zero broken rules.";

    // Evaluate 30 rules across every closed trade
    const hist = [];
    const ruleTotals = {};
    const tradeHits = new Map();
    for (const t of closed) {
      const hits = evalTradeRules(t, hist, bank || 10000);
      tradeHits.set(t.id, hits);
      const tPL = pl(t) || 0;
      for (const hr of hits) {
        if (!ruleTotals[hr.n]) ruleTotals[hr.n] = { n: hr.n, name: hr.name, count: 0, netPL: 0 };
        ruleTotals[hr.n].count++;
        ruleTotals[hr.n].netPL += tPL;
      }
      hist.push(t);
    }

    const hitRows = Object.values(ruleTotals).sort((a, b) => a.netPL - b.netPL || b.count - a.count);
    $("#i-rule-ledger").innerHTML = hitRows.length
      ? hitRows.map((x) => `<div class="bill ${x.netPL < 0 ? "rule-hit" : "rule-ok"}"><div class="bill-when">#${x.n} ${esc(x.name)} (${x.count}&times;)</div><div class="stat-s">Realized P/L on flagged trades: <b class="${x.netPL < 0 ? "down" : "up"}">${money(x.netPL)}</b></div></div>`).join("")
      : `<p class="empty">No 30-rule flags triggered on your closed trades yet.</p>`;

    const avgRiskPct = bank > 0 && closed.some((t) => riskOf(t) != null)
      ? (closed.map((t) => riskOf(t) || 0).reduce((a, b) => a + b, 0) / closed.length / bank) * 100
      : null;
    if (avgRiskPct != null && losses.length && wins.length) {
      const aw = gw / wins.length, al = gl / losses.length;
      if (al > 0) $("#r-payoff").value = Math.max(0.5, Math.min(5, +(aw / al).toFixed(2)));
    }
    paintRuinMatrix(winRate, avgRiskPct);

    const open = trades.filter((t) => pl(t) == null);
    $("#i-open").innerHTML = "";
    if (!open.length) $("#i-open").append(h("li.empty", null, "No open trades."));
    open.forEach((t) => {
      const r = riskOf(t);
      $("#i-open").append(h("li", null,
        h("span", null, `${t.side === "short" ? "Short" : "Long"} ${t.qty} ${t.sym} @ ${t.entry}`),
        h("span.meta", null, r != null ? `risk ${money(r)}${bank ? ` (${num((r / bank) * 100, 2)}%)` : ""}` : "no stop"),
        h("button.btn.quiet.small", { type: "button", onclick: () => { const x = prompt(`Exit price for ${t.sym}?`); if (x && !isNaN(+x)) { S.update("trades", t.id, { exit: +x }); window.ICARUS.notify(); } } }, "Close")
      ));
    });

    $("#i-rows").innerHTML = trades.slice().reverse().map((t) => {
      const r = pl(t);
      const flags = tradeHits.get(t.id) || [];
      return `<tr><td>${esc(t.date)}</td><td>${t.side === "short" ? "Short" : "Long"} ${esc(t.qty)} ${esc(t.sym)}${t.why ? `<div class="meta">${esc(t.why)}</div>` : ""}</td>
        <td class="n">${esc(t.entry)}</td><td class="n">${t.exit === "" || t.exit == null ? "open" : esc(t.exit)}</td>
        <td class="n ${r > 0 ? "up" : r < 0 ? "down" : ""}">${r == null ? "—" : money(r)}</td>
        <td>${t.kept === "yes" ? "kept" : '<span class="warn">broken</span>'}${flags.length ? `<div class="meta">${flags.map((f) => "#" + f.n).join(", ")}</div>` : ""}</td>
        <td><button class="btn quiet small" data-del="${t.id}">Del</button></td></tr>`;
    }).join("") || `<tr><td colspan="7" class="empty">No trades yet.</td></tr>`;

    $("#i-rows").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { if (confirm("Delete this trade?")) { S.remove("trades", b.dataset.del); window.ICARUS.notify(); } }));

    $("#i-rules").innerHTML = "";
    S.get("rules", []).forEach((r, i) => $("#i-rules").append(h("li", null, h("span", null, `${i + 1}. ${r.text}`),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.set("rules", S.get("rules", []).filter((x) => x.id !== r.id)); paint(); } }, "Remove"))));

    $("#i-bank").b.value = bank || "";
    $("#i-bank-s").textContent = bank ? `1% risk cap = ${money(bank / 100)} per trade · Elder 6% monthly cap = ${money(bank * 0.06)}.` : "Set bankroll to enforce 1%, 2%, and 6% rules.";
    riskHint();
  }

  const F = $("#i-form");
  F.date.value = day();
  function riskHint() {
    const t = { date: F.date.value, sym: F.sym.value, side: F.side.value, entry: +F.entry.value || 0, stop: F.stop.value ? +F.stop.value : null, qty: +F.qty.value || 0, exit: F.exit.value === "" ? "" : +F.exit.value, fees: +F.fees.value || 0, kept: F.kept.value, why: F.why.value };
    const r = riskOf(t), bank = +S.get("bankroll", 0) || 10000, el = $("#i-risk"), pre = $("#i-precheck");
    if (!F.entry.value || !F.qty.value) { el.textContent = ""; pre.innerHTML = ""; return; }
    if (r == null) el.innerHTML = '<span class="warn">No stop set — Rule #1 fails immediately.</span>';
    else {
      const pct = bank ? (r / bank) * 100 : null;
      el.innerHTML = `Risk to stop: <b>${money(r)}</b>${pct != null ? ` = ${num(pct, 2)}% of bankroll` : ""}${pct != null && pct > 1 ? ' <span class="warn">Over 1% rule</span>' : ""}`;
    }
    const hits = evalTradeRules(t, window.ICARUS.getTrades(), bank);
    pre.innerHTML = hits.length
      ? `<div class="bill rule-hit"><div class="bill-when">${hits.length} pre-entry/closed check(s) would trigger:</div><div class="stat-s">${hits.map((x) => `#${x.n} ${esc(x.name)}`).join(" · ")}</div></div>`
      : `<div class="bill rule-ok"><div class="bill-when">Clean against all 30 automated checks.</div></div>`;
  }

  ["date", "sym", "side", "entry", "stop", "qty", "exit", "fees", "kept", "why"].forEach((n) => F[n].addEventListener("input", riskHint));
  F.addEventListener("submit", (e) => {
    e.preventDefault();
    S.add("trades", {
      date: F.date.value,
      sym: F.sym.value.trim().toUpperCase(),
      side: F.side.value,
      qty: +F.qty.value,
      entry: +F.entry.value,
      stop: F.stop.value ? +F.stop.value : null,
      exit: F.exit.value === "" ? "" : +F.exit.value,
      fees: +F.fees.value || 0,
      kept: F.kept.value,
      why: F.why.value.trim(),
    });
    ["sym", "qty", "entry", "stop", "exit", "why"].forEach((n) => (F[n].value = ""));
    toast("Saved to ledger");
    window.ICARUS.notify();
  });

  $("#i-bench").onclick = () => {
    if (S.list("trades").length && !confirm("Append the 20-trade Discipline Benchmark to your ledger?")) return;
    if (!S.get("bankroll")) S.set("bankroll", 10000);
    for (const b of BENCHMARK_20) S.add("trades", b);
    toast("20 benchmark trades loaded");
    window.ICARUS.notify();
  };
  $("#i-clear").onclick = () => {
    if (confirm("Remove every trade from the local Icarus ledger?")) { S.set("trades", []); window.ICARUS.notify(); }
  };
  $("#r-payoff").addEventListener("input", () => paint());
  $("#r-dd").addEventListener("change", () => paint());
  $("#i-bank").addEventListener("submit", (e) => { e.preventDefault(); S.set("bankroll", +e.target.b.value || 0); toast("Bankroll saved"); window.ICARUS.notify(); });
  $("#i-rule").addEventListener("submit", (e) => { e.preventDefault(); S.set("rules", [...S.get("rules", []), { id: "r" + Date.now(), text: e.target.t.value.trim() }]); e.target.t.value = ""; paint(); });
  $("#export").onclick = () => download(`icarus_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); window.ICARUS.notify(); } catch (e) { toast(e.message); } };

  tabs(app, () => requestAnimationFrame(paint));
  paint();
})();
