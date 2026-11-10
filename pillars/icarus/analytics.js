/* Icarus journal analytics (Sebastian, 2026-11-10): log a closed trade and all 30 researched
   rule checks run against it — formulas are data (rules.js), executed by the safe interpreter
   (eval.js). Previous-trade context (revenge/martingale/streak rules) derives from your own
   journal. The research's bankroll constants assumed $10,000; they scale to your bankroll. */
(function () {
  "use strict";
  const root = document.getElementById("icarus-analytics"); if (!root || !window.RULE_EVAL || !window.RULE_CHECKS) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const JKEY = "prometheus.icarus.journal", BKEY = "prometheus.icarus.bankroll";
  const journal = () => { try { return JSON.parse(localStorage.getItem(JKEY) || "[]"); } catch (_) { return []; } };
  const bankroll = () => Number(localStorage.getItem(BKEY) || 10000) || 10000;
  const scale = (formula, bk) => formula.replace(/2500\.00/g, String(bk * 0.25)).replace(/600\.00/g, String(bk * 0.06)).replace(/200\.00/g, String(bk * 0.02)).replace(/100\.00/g, String(bk * 0.01));
  const pnl = (t) => ((t.side === "long" ? t.exit - t.entry : t.entry - t.exit) * t.qty) - (t.fees || 0);
  function envFor(t, hist) {
    const prev = hist[hist.length - 1] || null;
    const dayCount = hist.filter((x) => x.date === t.date).length + 1;
    let cum = 0; for (const x of hist) cum += pnl(x);
    const sameSym = [...hist].reverse().find((x) => x.symbol === t.symbol);
    const rMult = (p) => { const risk = Math.abs(p.entry - p.stop) * p.qty; return risk > 0 ? pnl(p) / risk : 0; };
    return { ...t,
      prev_pnl: prev ? pnl(prev) : 0, prev_qty: prev ? prev.qty : 0, prev_entry: prev ? prev.entry : 0,
      prev_stop: prev ? prev.stop : 0, prev_date: prev ? prev.date : "", prev_kept: prev ? prev.kept : "yes",
      prev_cum_pnl: cum, day_trade_count: dayCount,
      prev_same_sym_pnl: sameSym ? pnl(sameSym) : 0, prev_r_multiple: prev ? rMult(prev) : 0 };
  }
  function runChecks(t, hist) {
    const env = envFor(t, hist), bk = bankroll(), hits = [];
    for (const r of RULE_CHECKS) { let hit = false; try { hit = RULE_EVAL.evaluate(scale(r.formula, bk), env); } catch (_) { /* unparsable rule stays listed, never faked */ } if (hit) hits.push(r); }
    return hits;
  }
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Trade journal — 30 rule checks, run live</h2>
    <form class="form" id="ia-form">
      <label class="f">Date<input name="date" type="date" required></label>
      <label class="f">Symbol<input name="symbol" required maxlength="10"></label>
      <label class="f">Side<select name="side"><option>long</option><option>short</option></select></label>
      <label class="f">Entry<input name="entry" type="number" step="any" required></label>
      <label class="f">Stop (blank = none)<input name="stop" type="number" step="any"></label>
      <label class="f">Exit<input name="exit" type="number" step="any" required></label>
      <label class="f">Quantity<input name="qty" type="number" step="any" required></label>
      <label class="f">Fees<input name="fees" type="number" step="any" value="0"></label>
      <label class="f">Bankroll $<input name="bankroll" type="number" step="any" value="${bankroll()}"></label>
      <label class="f">Followed your rules?<select name="kept"><option>yes</option><option>no</option></select></label>
      <label class="f wide">Thesis — why this trade?<input name="why" maxlength="240" placeholder="A real thesis, at least a sentence. 'Hot tip' will flag itself."></label>
      <button class="btn" type="submit">Check this trade</button></form>
    <div id="ia-result" style="margin-top:10px"></div>
    <div id="ia-journal" style="margin-top:10px"></div>
    <details style="margin-top:12px"><summary>All 30 rules, with what they catch</summary>
      ${RULE_CHECKS.map((r) => `<div class="bill"><div class="bill-when">${r.n}. ${esc(r.name)}</div><p style="margin:2px 0">${esc(r.catches)}</p><div class="mono">${esc(r.formula)}</div></div>`).join("")}
    </details>
    <details style="margin-top:8px"><summary>The 25 metrics — formulas with worked values</summary>
      ${(window.METRICS || []).map((m) => `<div class="bill"><div class="bill-when">${esc(m.metric)} — worked value: ${m.value}</div><p style="margin:2px 0">${esc(m.formula)}</p></div>`).join("")}
    </details>
    <p class="note">Checks are arithmetic on what you enter — sample discipline tooling, not advice. Journal stays in this browser.</p></div>`;
  function paintJournal() {
    const j = journal();
    document.getElementById("ia-journal").innerHTML = j.length
      ? `<h3 style="margin:6px 0">Journal (${j.length}) — net P/L $${j.reduce((s, t) => s + pnl(t), 0).toFixed(2)}</h3>` +
        j.slice().reverse().slice(0, 8).map((t) => `<div class="bill"><span class="bill-when">${esc(t.date)} ${esc(t.symbol)} ${t.side}</span> — P/L $${pnl(t).toFixed(2)} · flagged: ${t.hits.length ? t.hits.map((x) => esc(x.name)).join("; ") : "none"}</div>`).join("")
      : `<p class="empty">No trades logged yet.</p>`;
  }
  document.getElementById("ia-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    localStorage.setItem(BKEY, String(Number(f.bankroll.value) || 10000));
    const t = { date: f.date.value, symbol: f.symbol.value.trim().toUpperCase(), side: f.side.value,
      entry: Number(f.entry.value), stop: f.stop.value === "" ? null : Number(f.stop.value),
      exit: Number(f.exit.value), qty: Number(f.qty.value), fees: Number(f.fees.value) || 0,
      kept: f.kept.value, why: f.why.value.trim() };
    const hist = journal(); const hits = runChecks(t, hist);
    t.hits = hits.map((x) => ({ n: x.n, name: x.name })); hist.push(t);
    localStorage.setItem(JKEY, JSON.stringify(hist));
    document.getElementById("ia-result").innerHTML = hits.length
      ? `<div class="bill"><div class="bill-when">Net P/L $${pnl(t).toFixed(2)} — ${hits.length} rule(s) flagged:</div>${hits.map((x) => `<p style="margin:2px 0"><b>${esc(x.name)}</b> — ${esc(x.catches)}</p>`).join("")}</div>`
      : `<div class="bill"><div class="bill-when">Net P/L $${pnl(t).toFixed(2)} — clean: no rule flagged.</div></div>`;
    paintJournal();
  });
  paintJournal();
})();
