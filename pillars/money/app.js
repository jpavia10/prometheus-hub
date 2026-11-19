/* Money: the owner's real consolidation loan (Citi Flex, seeded once from real.js at Joseph's
   2026-11-14 direction) driving a dual-model simulator — textbook amortization vs the plan's
   actual payment, both labeled — plus a neutral worked example from deck/data/payoff-cases.json,
   3-way Avalanche/Snowball/Minimum comparison, windfall allocator, deferred-interest trap,
   issuer rules, bills audit. */
(function () {
  "use strict";
  const { $, h, money, num, day, toast, store, download, pickFile, tabs, field, G } = PK;
  const S = store("money");
  const app = $("#app");
  const M = window.MONEY;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  field({ count: 900, at: [0.76, 0.3], scale: 0.25, glyph: (n) => [...G.ring(Math.round(n * 0.65), 0.72), ...G.line(Math.round(n * 0.35), -0.4, 0, 0.4, 0)] });

  const EMPTY = { principal: "", apr: "", term: "", actualPayment: "", extra: "", useBus: false };
  const cfg = () => ({ ...EMPTY, ...(S.get("cfg", {}) || {}) });
  const loanReady = (c) => Number(c.principal) > 0 && Number(c.term) > 0 && c.apr !== "" && c.actualPayment !== "";

  /* Seed-once (Sebastian, 2026-11-14): a fresh device opens on the real Citi Flex Loan and the
     real Starlink bill. Existing profiles are never overwritten, and the flag keeps a profile
     the owner later cleared from being re-seeded. */
  const R = window.MONEY_REAL || null;
  if (R && !S.get("realSeedV1")) {
    if (!S.get("cfg")) S.set("cfg", { principal: R.loan.principal, apr: R.loan.apr, term: R.loan.term, actualPayment: R.loan.actualPayment, extra: "", useBus: false });
    if (!S.list("bills").length) for (const b of R.bills) S.add("bills", { name: b.name, amount: b.amount, cadence: b.cadence, due: b.due, cuttable: b.cuttable, note: b.note });
    S.set("realSeedV1", 1);
  }

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-cons" aria-controls="p-cons">Consolidation</button>
      <button class="tab" role="tab" id="t-strat" aria-controls="p-strat">Strategies &amp; Windfall</button>
      <button class="tab" role="tab" id="t-iss" aria-controls="p-iss">BT, Traps &amp; Hardship</button>
      <button class="tab" role="tab" id="t-bills" aria-controls="p-bills">Bills Audit</button>
    </div>

    <section id="p-cons" role="tabpanel" class="grid">
      <div class="glass lit span-12 statement">
        <h2>Your Consolidation Loan <span class="sample real">REAL</span></h2>
        <div id="m-real"></div>
      </div>
      <div class="glass span-12">
        <h2>Worked example <span class="sample">EXAMPLE</span></h2>
        <p class="note">A neutral case from the research set (deck/data/payoff-cases.json). It is not an account, and it is not loaded into the form.</p>
        <div id="m-example" class="stat-s">Loading the worked example…</div>
      </div>
      <div class="glass span-6"><h2>The Consolidation Loan</h2>
        <form class="form" id="m-cons">
          <label class="f">Principal $<input name="principal" type="number" step="0.01" min="1" required></label>
          <label class="f">Quoted APR %<input name="apr" type="number" step="0.01" min="0" required></label>
          <label class="f">Term (months)<input name="term" type="number" min="1" max="360" required></label>
          <label class="f">Actual payment $<input name="actualPayment" type="number" step="0.01" min="1" required></label>
          <label class="f">Extra monthly $<input name="extra" type="number" step="1" min="0"></label>
          <label class="f wide"><input type="checkbox" name="useBus"> Apply shared Money Bus sales toward extra payoff</label>
          <div class="wide row-actions"><button class="btn" type="submit">Simulate</button></div>
        </form>
      </div>
      <div class="glass lit span-6"><h2>Quoted vs Implied Reality</h2><div id="m-cons-out"></div></div>
      <div class="glass span-12"><h2>Principal Amortization (Quoted vs Accelerated)</h2><canvas id="m-cons-cv" style="width:100%;height:190px;display:block"></canvas></div>
    </section>

    <section id="p-strat" role="tabpanel" class="grid">
      <div class="glass span-6"><h2>3-Way Comparison (Avalanche vs Snowball vs Min)</h2>
        <canvas id="m-cmp-cv" style="width:100%;height:220px;display:block;margin-bottom:10px"></canvas>
        <div id="m-strat-kpis"></div>
      </div>
      <div class="glass span-6"><h2>Strategy &amp; Windfall Allocator</h2>
        <form class="form" id="m-strat-form">
          <label class="f">Extra monthly $<input id="m-extra" type="number" min="0" step="10" value="150"></label>
          <label class="f">One-time windfall (Mo 1) $<input id="m-windfall" type="number" min="0" step="50" value="0"></label>
          <label class="f wide">Load MID-GEM worked case (1–12)<select id="m-cases"><option value="">Choose a worked example…</option></select></label>
        </form>
        <div class="row-actions" style="flex-wrap:wrap;gap:6px;margin-top:8px">
          <button class="btn quiet small" data-wf="250" type="button">+$250 windfall</button>
          <button class="btn quiet small" data-wf="500" type="button">+$500 windfall</button>
          <button class="btn quiet small" data-wf="1000" type="button">+$1,000 windfall</button>
          <button class="btn quiet small" data-wf="0" type="button">Clear windfall</button>
        </div>
        <div id="m-wf-impact" class="stat-s" style="margin-top:10px"></div>
      </div>
      <div class="glass span-12"><h2>Debts in Simulator</h2>
        <form class="form" id="m-add-debt">
          <label class="f">Account label<input name="name" required maxlength="48" placeholder="Card A, Auto Loan…"></label>
          <label class="f">Balance $<input name="balance" type="number" step="0.01" min="1" required></label>
          <label class="f">APR %<input name="apr" type="number" step="0.01" min="0" required></label>
          <label class="f">Min payment $<input name="min" type="number" step="0.01" min="1" required></label>
          <button class="btn" type="submit">Add debt</button>
        </form>
        <div id="m-debt-list" style="margin-top:12px"></div>
      </div>
    </section>

    <section id="p-iss" role="tabpanel" class="grid">
      <div class="glass lit span-6"><h2>Deferred-Interest Trap Simulator ("No Interest If Paid in Full")</h2>
        <p class="sub">Retail promo plans charge retroactive interest from Day 1 if even $1 remains after Month N.</p>
        <form class="form" id="m-def-form">
          <label class="f">Promo balance $<input id="d-bal" type="number" min="100" step="50" value="1800"></label>
          <label class="f">Promo months<input id="d-mo" type="number" min="3" max="36" value="12"></label>
          <label class="f">Go-to APR %<input id="d-apr" type="number" min="1" max="40" step="0.01" value="29.99"></label>
          <label class="f">Your monthly payment $<input id="d-pay" type="number" min="10" step="5" value="140"></label>
        </form>
        <div id="m-def-out" style="margin-top:10px"></div>
      </div>
      <div class="glass span-6"><h2>25 Issuers — Filter BT Offers &amp; Hardship</h2>
        <form class="form"><label class="f wide">Filter by issuer / product / lender<input id="m-iss-q" type="search" placeholder="Citi, Chase, Wells Fargo, BoA…"></label></form>
        <div id="m-iss-summary" class="stat-s" style="margin-top:8px"></div>
      </div>
      <div class="glass span-6"><h2>0% Balance Transfer Offers</h2><div id="m-bt-list"></div></div>
      <div class="glass span-6"><h2>Hardship Programs &amp; Minimum Rules</h2><div id="m-hard-list"></div></div>
      <div class="glass span-12"><h2>Citi Flex Plan — Rules &amp; Implied-APR Traps (MID-GEM-09)</h2><div id="m-flex-list"></div></div>
    </section>

    <section id="p-bills" role="tabpanel" class="grid">
      <div class="glass span-6"><h2>Recurring Bills &amp; Subscriptions</h2>
        <form class="form" id="m-bill-form">
          <label class="f">Service / Bill<input name="name" required maxlength="60" placeholder="Car Insurance, Streaming…"></label>
          <label class="f">Amount $<input name="amount" type="number" step="0.01" min="0.01" required></label>
          <label class="f">Cadence<select name="cadence"><option value="monthly">Monthly</option><option value="annual">Annual (/12)</option><option value="weekly">Weekly (×4.33)</option></select></label>
          <label class="f">Next due (optional)<input name="due" type="date"></label>
          <label class="f wide"><input type="checkbox" name="cuttable"> Non-essential (candidate to cut &rarr; redirect to debt)</label>
          <button class="btn" type="submit">Add bill</button>
        </form>
      </div>
      <div class="glass lit span-6"><h2>Burn &amp; Redirection Impact</h2><div id="m-bill-sum"></div></div>
      <div class="glass span-12"><h2>Active Subscriptions &amp; Bills</h2><div id="m-bill-list"></div></div>
    </section>`;

  const cssVar = (n, fb) => { const v = (getComputedStyle(document.body).getPropertyValue(n) || "").trim(); return v || fb; };
  const monthLabel = (iso, addMonths) => { const d = new Date(iso + "T12:00:00"); d.setMonth(d.getMonth() + addMonths); return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }); };

  /* The hero descent: both models drawn from the engine's own amortization. The textbook curve
     runs at the quoted APR and textbook payment; the plan curve runs at the plan's actual payment
     and the APR that payment implies (the same "implied reality" the simulator reports), so its
     total matches the plan's real total of payments. The vertical gap between the curves is the
     plan's structure made visible. */
  function heroSims(L) {
    if (!window.MONEY) return null;
    const book = M.simulateLoan({ principal: L.principal, apr: L.apr, payment: L.textbookPayment });
    const plan = M.simulateLoan({ principal: L.principal, apr: M.solveApr(L.principal, L.actualPayment, L.term), payment: L.actualPayment });
    return { book, plan };
  }

  function drawHero() {
    const cv = document.getElementById("m-hero-cv"); if (!cv || !R) return;
    const sims = heroSims(R.loan); if (!sims) return;
    const { book, plan } = sims, L = R.loan;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(260, cv.clientWidth || 560), H = cv.clientHeight || 230;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const ACC = cssVar("--accent", "#47ffa9"), LAV = cssVar("--lavender", "#c9b8ea");
    const maxM = Math.max(book.curve.length, plan.curve.length) - 1, maxV = L.principal;
    const padL = 46, padR = 14, padT = 14, padB = 24;
    const x = (m) => padL + (m / Math.max(1, maxM)) * (W - padL - padR);
    const y = (v) => padT + (1 - v / maxV) * (H - padT - padB);
    g.font = "10px system-ui, sans-serif";
    for (let i = 0; i <= 4; i++) {
      const v = maxV * i / 4, yy = y(v);
      g.strokeStyle = i === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)";
      g.beginPath(); g.moveTo(padL, yy); g.lineTo(W - padR, yy); g.stroke();
      g.fillStyle = "rgba(205,220,245,0.6)"; g.fillText(i === 0 ? "$0" : "$" + (v / 1000) + "k", 8, yy + 3);
    }
    for (let m = 0; m <= maxM; m += 6) { g.fillStyle = "rgba(205,220,245,0.6)"; g.fillText(m === 0 ? "now" : "mo " + m, x(m) - (m === 0 ? 0 : 10), H - 8); }
    const trace = (curve) => { g.beginPath(); curve.forEach((v, m) => (m === 0 ? g.moveTo(x(m), y(v)) : g.lineTo(x(m), y(v)))); };
    // plan area fill, then textbook (dashed lavender), then plan (solid accent)
    trace(plan.curve); g.lineTo(x(maxM), y(0)); g.lineTo(x(0), y(0)); g.closePath();
    const rgb = [1, 3, 5].map((i) => parseInt(ACC.slice(i, i + 2), 16));
    const grad = g.createLinearGradient(0, padT, 0, H - padB); grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.20)`); grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    g.fillStyle = grad; g.fill();
    // the delta as a visible sliver: fill between the two curves before stroking them
    g.beginPath();
    plan.curve.forEach((v, m) => (m === 0 ? g.moveTo(x(m), y(v)) : g.lineTo(x(m), y(v))));
    for (let m = maxM; m >= 0; m--) g.lineTo(x(m), y(book.curve[m] || 0));
    g.closePath(); g.fillStyle = "rgba(201,184,234,0.16)"; g.fill();
    g.setLineDash([5, 5]); trace(book.curve); g.strokeStyle = LAV; g.lineWidth = 1.8; g.stroke(); g.setLineDash([]);
    trace(plan.curve); g.strokeStyle = ACC; g.lineWidth = 2.4; g.stroke();
    // the delta, bracketed at the midpoint and called out into the open upper right
    const mid = Math.floor(maxM / 2), xb = x(mid), yPlan = y(plan.curve[mid] || 0), yBook = y(book.curve[mid] || 0);
    g.strokeStyle = "rgba(244,247,251,0.75)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(xb, yPlan); g.lineTo(xb, yBook); g.moveTo(xb - 4, yPlan); g.lineTo(xb + 4, yPlan); g.moveTo(xb - 4, yBook); g.lineTo(xb + 4, yBook); g.stroke();
    const tx = Math.min(xb + 92, W - padR - 128), ty = padT + 12;
    g.strokeStyle = "rgba(244,247,251,0.35)";
    g.beginPath(); g.moveTo(xb + 3, yPlan); g.lineTo(tx - 8, ty + 12); g.stroke();
    g.fillStyle = "#f4f7fb"; g.font = "600 12px system-ui, sans-serif";
    const dTxt = "+$" + (L.actualPayment - L.textbookPayment).toFixed(2) + "/mo";
    g.fillText(dTxt, tx, ty + 4);
    g.font = "10px system-ui, sans-serif"; g.fillStyle = "rgba(205,220,245,0.8)";
    const dSub = "Δ balance at mo " + mid + " · $" + Math.round((plan.curve[mid] || 0) - (book.curve[mid] || 0)).toLocaleString("en-US");
    g.fillText(dSub, tx, ty + 18);
    g.fillStyle = ACC; g.beginPath(); g.arc(x(0), y(maxV), 3, 0, Math.PI * 2); g.fill();
  }

  function paintReal() {
    const box = $("#m-real"); if (!box) return;
    if (!R) { box.innerHTML = `<p class="empty">The real dataset did not load.</p>`; return; }
    const L = R.loan, delta = L.actualPayment - L.textbookPayment;
    const sims = heroSims(L);
    const extraInterest = sims ? sims.plan.totalInterest - sims.book.totalInterest : null;
    box.innerHTML = `
      <div class="stmt-head">
        <div class="stmt-id">
          <div class="stmt-name">${esc(L.name)} <span class="stmt-plan">${esc(L.plan)}</span></div>
          <div class="stmt-acct">${esc(L.account)} · ${esc(L.purpose)} · activated ${esc(L.activated)}</div>
        </div>
        <div class="stmt-principal"><span class="stat-k">Principal</span><div class="stmt-amt num">${money(L.principal)}</div></div>
      </div>
      <div class="statband">
        <div class="stat"><span class="stat-k">Quoted APR</span><div class="stat-n num">${num(L.apr, 2)}%</div></div>
        <div class="stat"><span class="stat-k">Plan payment</span><div class="stat-n num">${money(L.actualPayment)}<small>/mo</small></div></div>
        <div class="stat"><span class="stat-k">Total of ${L.term} payments</span><div class="stat-n num">${money(L.totalPaid)}</div></div>
        <div class="stat"><span class="stat-k">Final payment</span><div class="stat-n num">${monthLabel(L.activated, L.term)}</div></div>
      </div>
      <canvas id="m-hero-cv" class="hero-cv" role="img" aria-label="Balance descent: the Citi Flex Plan's actual payment against textbook amortization"></canvas>
      <div class="hero-legend">
        <span class="lg"><i class="sw plan"></i>Plan actual — ${money(L.actualPayment)}/mo</span>
        <span class="lg"><i class="sw book"></i>Textbook — ${money(L.textbookPayment)}/mo @ ${num(L.apr, 2)}%</span>
        <span class="delta-chip">Delta <b>+${money(delta)}/mo</b>${extraInterest != null ? ` · <b>+${money(extraInterest)}</b> interest over the term` : ""} — the plan's structure, not the rate</span>
      </div>
      <div class="goal-line"><span>${esc(R.goal.label)} — the loan is the payoff vehicle</span><b class="num">${money(R.goal.target)}</b></div>
      <p class="note">${esc(L.fundsNote)} ${esc(R.goal.note)}</p>
      <h3 class="ledger-head">Recently paid — closed</h3>
      <div class="ledger">
        ${R.paid.map((x) => `<div class="ledger-row"><div class="ledger-main"><b>${esc(x.label)}</b><span class="stat-s">${esc(x.detail)}</span></div><div class="ledger-amt num">${money(x.amount)}</div><span class="stamp">${esc(x.status)}</span></div>`).join("")}
      </div>
      <p class="note">${esc(R.paidNote)}</p>
      <h3 class="ledger-head">Coming up — autopay</h3>
      <div class="rail">
        ${R.autopays.map((x) => `<div class="rail-card"><div class="rail-date">${esc(x.detail)}</div><div class="rail-label">${esc(x.label)}</div><div class="rail-amt num">${x.amount != null ? money(x.amount) : esc(x.amountNote)}</div></div>`).join("")}
      </div>`;
    requestAnimationFrame(drawHero);
  }

  function notify() { window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "money", k: "cfg" } })); }
  function syncCfg(patch) {
    const next = { ...cfg(), ...patch, _ts: Date.now(), from: "pillar" };
    S.set("cfg", next); notify();
  }

  function drawCurves(canvasId, seriesList) {
    const cv = document.getElementById(canvasId); if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(260, cv.clientWidth || 560), H = cv.clientHeight || 200;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const maxLen = Math.max(2, ...seriesList.map((s) => s.curve.length));
    const maxVal = Math.max(100, ...seriesList.flatMap((s) => s.curve));
    const padL = 52, padR = 16, padT = 18, padB = 26;
    const x = (i) => padL + (i / Math.max(1, maxLen - 1)) * (W - padL - padR);
    const y = (v) => padT + (1 - v / maxVal) * (H - padT - padB);
    g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 1;
    g.font = "10px system-ui, sans-serif"; g.fillStyle = "rgba(205,220,245,0.65)";
    for (let i = 0; i <= 4; i++) {
      const val = maxVal * (i / 4), yy = y(val);
      g.beginPath(); g.moveTo(padL, yy); g.lineTo(W - padR, yy); g.stroke();
      g.fillText("$" + Math.round(val / 1000 * 10) / 10 + "k", 6, yy + 3);
    }
    seriesList.forEach((s) => {
      g.strokeStyle = s.color; g.lineWidth = s.width || 2.2;
      g.beginPath();
      s.curve.forEach((v, idx) => (idx === 0 ? g.moveTo(x(idx), y(v)) : g.lineTo(x(idx), y(v))));
      g.stroke();
    });
    let lx = padL;
    seriesList.forEach((s) => {
      g.fillStyle = s.color; g.fillRect(lx, 5, 10, 3);
      g.fillStyle = "#eef4ff"; g.fillText(s.label, lx + 14, 9);
      lx += g.measureText(s.label).width + 32;
    });
  }

  function paintCons() {
    const c = cfg(), F = $("#m-cons");
    ["principal", "apr", "term", "actualPayment", "extra"].forEach((k) => { if (document.activeElement !== F[k]) F[k].value = c[k] ?? ""; });
    F.useBus.checked = !!c.useBus;
    if (!loanReady(c)) {
      $("#m-cons-out").innerHTML = `<p class="empty">Enter loan figures to run the simulation — a fresh device starts prefilled with your Citi Flex Loan (Plan 4) from the panel above.</p>`;
      const cv = document.getElementById("m-cons-cv"); if (cv) { const g = cv.getContext("2d"); if (g) g.clearRect(0, 0, cv.width, cv.height); }
      return;
    }
    const salesTotal = window.PB ? Math.max(0, PB.money.total("sale")) : 0;
    const busLump = c.useBus && salesTotal > 0 ? [{ month: 1, amount: salesTotal }] : [];
    const textbook = M.paymentFor(c.principal, c.apr, c.term);
    const impliedApr = M.solveApr(c.principal, c.actualPayment, c.term);
    const atBook = M.simulateLoan({ principal: c.principal, apr: c.apr, payment: textbook });
    const atQuoted = M.simulateLoan({ principal: c.principal, apr: c.apr, payment: c.actualPayment, extraMonthly: +c.extra || 0, lump: busLump });
    const gapMonth = c.actualPayment - textbook;
    $("#m-cons-out").innerHTML = `
      <div class="kv"><span>Model 1 — Textbook amortization @ ${num(c.apr, 2)}% (${c.term}m)</span><b>${money(textbook)}/mo</b></div>
      <div class="kv"><span>Model 2 — Plan's actual payment (${money(c.actualPayment)}/mo) implies APR</span><b>${num(impliedApr, 2)}%</b></div>
      <div class="kv"><span>Monthly delta, actual vs textbook</span><b>${gapMonth >= 0 ? "+" : ""}${money(gapMonth)}/mo</b></div>
      <div class="kv"><span>Interest at textbook vs your plan</span><b>${money(atBook.totalInterest)} vs ${money(atQuoted.totalInterest)}</b></div>
      <div class="kv"><span>Payoff horizon (with $${+c.extra || 0}/mo extra)</span><b>${atQuoted.months} months</b></div>
      ${c.useBus ? `<div class="kv"><span>Money Bus sales applied</span><b>${money(salesTotal)}</b></div>` : ""}`;
    drawCurves("m-cons-cv", [
      { label: "Quoted Base", color: "#c9b8ea", curve: M.simulateLoan({ principal: c.principal, apr: c.apr, payment: c.actualPayment }).curve },
      { label: "Your Plan (+Extra/Bus)", color: "#47ffa9", curve: atQuoted.curve }
    ]);
  }

  function runWithWindfall(debts, strategy, extraMonthly, windfall) {
    if (!debts.length) return { months: 0, totalInterest: 0, curve: [0] };
    const clone = debts.map((d) => ({ ...d }));
    if (windfall > 0 && strategy !== "minimum") {
      const sorted = [...clone].sort((a, b) => strategy === "avalanche" ? b.apr - a.apr || a.balance - b.balance : a.balance - b.balance || b.apr - a.apr);
      let rem = windfall;
      for (const d of sorted) { const hit = Math.min(rem, d.balance); d.balance = Math.max(0, +(d.balance - hit).toFixed(2)); rem -= hit; if (rem <= 0) break; }
    }
    const minSum = clone.reduce((s, d) => s + (+d.min || 0), 0);
    return M.payoff({ debts: clone, strategy, budget: minSum + (+extraMonthly || 0) });
  }

  function paintStrat() {
    let debts = S.list("debts");
    const extra = +$("#m-extra").value || 0;
    const wf = +$("#m-windfall").value || 0;
    const selCases = $("#m-cases");
    if (selCases.options.length <= 1 && window.MONEY_CASES) {
      window.MONEY_CASES.forEach((cs, idx) => selCases.append(h("option", { value: String(idx) }, `Case #${cs.case || idx + 1} · ${cs.debts.length} debts · $${cs.budget}/mo (${cs.method})`)));
    }
    const av = runWithWindfall(debts, "avalanche", extra, wf);
    const sn = runWithWindfall(debts, "snowball", extra, wf);
    const mn = runWithWindfall(debts, "minimum", 0, 0);
    const noWf = wf > 0 ? runWithWindfall(debts, "avalanche", extra, 0) : av;

    drawCurves("m-cmp-cv", [
      { label: `Minimum (${mn.months}m)`, color: "#f2a7a7", curve: mn.curve, width: 1.8 },
      { label: `Snowball (${sn.months}m)`, color: "#9fe6c2", curve: sn.curve, width: 2 },
      { label: `Avalanche (${av.months}m)`, color: "#9fd4e6", curve: av.curve, width: 2.6 }
    ]);

    const savedVsMin = Math.max(0, mn.totalInterest - av.totalInterest);
    $("#m-strat-kpis").innerHTML = debts.length ? `
      <div class="kv"><span>Avalanche total interest (${av.months}m)</span><b>${money(av.totalInterest)}</b></div>
      <div class="kv"><span>Snowball total interest (${sn.months}m)</span><b>${money(sn.totalInterest)}</b></div>
      <div class="kv"><span>Minimums-only interest (${mn.months}m)</span><b>${money(mn.totalInterest)}</b></div>
      <div class="kv"><span>Interest saved vs minimums</span><b class="up">${money(savedVsMin)} (${Math.max(0, mn.months - av.months)}m faster)</b></div>`
      : `<p class="empty">Add a debt below or load one of the 12 MID-GEM worked cases above.</p>`;

    $("#m-wf-impact").innerHTML = wf > 0 && debts.length
      ? `Applying a <b>${money(wf)}</b> Day-1 windfall to the top target saves <b>${money(Math.max(0, noWf.totalInterest - av.totalInterest))}</b> more interest and cuts <b>${Math.max(0, noWf.months - av.months)} mo</b>.`
      : `Add a one-time windfall (tax refund, bonus, or resale batch payout) to model instant Avalanche compression.`;

    $("#m-debt-list").innerHTML = "";
    if (!debts.length) { $("#m-debt-list").innerHTML = `<p class="empty">No debts added yet.</p>`; return; }
    debts.forEach((d) => {
      $("#m-debt-list").append(h("div.kv", null,
        h("span", null, h("b", null, d.name), ` · ${money(d.balance)} @ ${num(d.apr, 2)}% (min ${money(d.min)})`),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("debts", d.id); paintStrat(); notify(); } }, "Remove")
      ));
    });
  }

  function paintDeferred() {
    const bal = +$("#d-bal").value || 0, mo = Math.max(1, +$("#d-mo").value || 12), apr = +$("#d-apr").value || 0, pay = +$("#d-pay").value || 0;
    const reqMonthly = bal / mo;
    let rem = bal, accrued = 0;
    const r = apr / 100 / 12;
    for (let m = 1; m <= mo; m++) {
      accrued += rem * r;
      rem = Math.max(0, rem - pay);
    }
    const cleared = rem <= 0.01;
    $("#m-def-out").innerHTML = `
      <div class="kv"><span>Required payment to clear in ${mo}m</span><b>${money(reqMonthly)}/mo</b></div>
      <div class="kv"><span>Remaining principal at Month ${mo}</span><b class="${cleared ? "up" : "down"}">${money(rem)}</b></div>
      <div class="kv"><span>Status at cutoff</span><b class="${cleared ? "up" : "down"}">${cleared ? "SAFE — $0 retroactive interest" : `TRAP TRIGGERED — +${money(accrued)} back-interest hit`}</b></div>`;
  }

  function paintIssuers() {
    const q = ($("#m-iss-q").value || "").trim().toLowerCase();
    const bt = ((window.MONEY_OFFERS && window.MONEY_OFFERS.balance_transfer) || []).filter((o) => !q || `${o.issuer} ${o.product} ${o.fee}`.toLowerCase().includes(q));
    const hs = ((window.MONEY_OFFERS && window.MONEY_OFFERS.hardship) || []).filter((o) => !q || `${o.lender} ${o.program} ${o.offers}`.toLowerCase().includes(q));
    const mins = (window.MONEY_ISSUERS || []).filter((x) => !q || x.issuer.toLowerCase().includes(q));
    $("#m-iss-summary").textContent = `Showing ${bt.length} balance transfers · ${hs.length} verified hardship programs · ${mins.length} issuer interest formulas.`;
    $("#m-bt-list").innerHTML = bt.slice(0, 12).map((o) => `<div class="kv"><span><b>${esc(o.issuer)}</b> · ${esc(o.product)}<br><small class="stat-s">${esc(o.quote || "")} · Fee: ${esc(o.fee || "")} · Go-to ${esc(o.go_to_apr_range || "")}%</small></span><b>${o.months || "—"}m</b></div>`).join("") || `<p class="empty">No matching offers.</p>`;
    $("#m-hard-list").innerHTML = [
      ...hs.slice(0, 10).map((o) => `<div class="kv"><span><b>${esc(o.lender)}</b> · ${esc(o.program)}<br><small class="stat-s">${esc(o.offers || "")}<br>Ask: ${esc(o.how_to_ask || "Call card back number")}</small></span></div>`),
      ...mins.slice(0, 6).map((x) => `<div class="kv"><span><b>${esc(x.issuer)}</b> · Min formula<br><small class="stat-s">${esc((x.interest && x.interest.method) || "")} (${x.interest && x.interest.grace_days || "—"}d grace)</small></span></div>`)
    ].join("") || `<p class="empty">No matching issuers.</p>`;
  }

  /* MID-GEM-09 (2026-11-17): the Flex rules reference (flex.js, window.MONEY_FLEX),
     rendered with the issuers panel. §H honored: no same-issuer transfer advice is
     generated here — this is published-rules reference only. */
  function paintFlex() {
    const box = $("#m-flex-list"); if (!box) return;
    box.innerHTML = (window.MONEY_FLEX || []).map((r) => `<div class="kv"><span><b>${esc(r.topic)}</b><br><small class="stat-s">${esc(r.rule)}</small>${r.corrected ? `<br><small class="stat-s">Integration note: ${esc(r.corrected)}</small>` : ""}</span><a class="stat-s" href="${esc(r.url)}" target="_blank" rel="noopener">source ↗</a></div>`).join("") || `<p class="empty">Flex rules not loaded.</p>`;
  }

  function paintBills() {
    const list = S.list("bills");
    const normMo = (b) => b.cadence === "annual" ? b.amount / 12 : b.cadence === "weekly" ? b.amount * 4.333 : b.amount;
    const totalMo = list.reduce((s, b) => s + normMo(b), 0);
    const cutMo = list.filter((b) => b.cuttable).reduce((s, b) => s + normMo(b), 0);
    const c = cfg();
    const baseLoan = loanReady(c) ? M.simulateLoan({ principal: c.principal, apr: c.apr, payment: c.actualPayment, extraMonthly: +c.extra || 0 }) : { months: 0, totalInterest: 0 };
    const cutLoan = loanReady(c) && cutMo > 0 ? M.simulateLoan({ principal: c.principal, apr: c.apr, payment: c.actualPayment, extraMonthly: (+c.extra || 0) + cutMo }) : baseLoan;
    $("#m-bill-sum").innerHTML = `
      <div class="kv"><span>Total recurring burn</span><b>${money(totalMo)}/mo (${money(totalMo * 12)}/yr)</b></div>
      <div class="kv"><span>Non-essential cuttable pool</span><b class="warn">${money(cutMo)}/mo</b></div>
      <div class="kv"><span>If cut &rarr; applied to loan extra</span><b class="up">${loanReady(c) ? `${Math.max(0, baseLoan.months - cutLoan.months)} mo faster · ${money(Math.max(0, baseLoan.totalInterest - cutLoan.totalInterest))} saved` : "Enter a loan on the consolidation form first."}</b></div>`;
    const box = $("#m-bill-list"); box.innerHTML = "";
    if (!list.length) { box.innerHTML = `<p class="empty">No recurring bills logged yet.</p>`; return; }
    list.forEach((b) => {
      box.append(h("div.kv", null,
        h("span", null, h("b", null, b.name), b.cuttable ? " [cuttable]" : "", ` · ${money(b.amount)}/${b.cadence}`, b.due ? ` · due ${b.due}` : "", b.note ? h("small.stat-s", null, " — " + b.note) : null),
        h("span.row-actions", null,
          b.due && window.PB ? h("button.btn.quiet.small", { type: "button", onclick: () => { PB.deadlines.publish({ title: "Bill: " + b.name, date: b.due, source: "money", kind: "bill", ref: b.id, amount: b.amount }); toast("Pushed due date to Kairos"); } }, "-> Kairos") : null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("bills", b.id); paintBills(); } }, "Remove")
        )
      ));
    });
  }

  $("#m-cons").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    syncCfg({ principal: +f.principal.value, apr: +f.apr.value, term: +f.term.value, actualPayment: +f.actualPayment.value, extra: +f.extra.value || 0, useBus: f.useBus.checked });
    toast("Simulation updated"); paintCons();
  });
  $("#m-extra").addEventListener("input", paintStrat);
  $("#m-windfall").addEventListener("input", paintStrat);
  document.querySelectorAll("[data-wf]").forEach((b) => (b.onclick = () => { $("#m-windfall").value = b.dataset.wf; paintStrat(); }));
  $("#m-cases").addEventListener("change", (e) => {
    const idx = e.target.value; if (idx === "" || !window.MONEY_CASES) return;
    const cs = window.MONEY_CASES[+idx]; if (!cs) return;
    S.set("debts", cs.debts.map((d) => ({ ...d, id: Math.random().toString(36).slice(2, 9) })));
    const minSum = cs.debts.reduce((s, d) => s + (+d.min || 0), 0);
    $("#m-extra").value = Math.max(0, Math.round(cs.budget - minSum));
    toast(`Loaded Case #${cs.case}`); paintStrat(); notify();
  });
  $("#m-add-debt").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("debts", { name: f.name.value.trim(), balance: +f.balance.value, apr: +f.apr.value, min: +f.min.value });
    f.reset(); toast("Debt added"); paintStrat(); notify();
  });
  ["d-bal", "d-mo", "d-apr", "d-pay"].forEach((id) => $("#" + id).addEventListener("input", paintDeferred));
  $("#m-iss-q").addEventListener("input", paintIssuers);
  $("#m-bill-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("bills", { name: f.name.value.trim(), amount: +f.amount.value, cadence: f.cadence.value, due: f.due.value || "", cuttable: f.cuttable.checked });
    f.reset(); toast("Bill saved"); paintBills();
  });

  $("#export").onclick = () => download(`money_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintCons(); paintStrat(); paintBills(); notify(); } catch (e) { toast(e.message); } };

  tabs(app, (id) => {
    if (id === "p-cons") { paintReal(); paintCons(); }
    if (id === "p-strat") paintStrat();
    if (id === "p-iss") { paintDeferred(); paintIssuers(); paintFlex(); }
    if (id === "p-bills") paintBills();
  });
  fetch("../../deck/data/payoff-cases.json").then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then((cases) => {
    const c = cases && cases[0]; const box = $("#m-example"); if (!box || !c) return;
    box.innerHTML = `<p>Case ${esc(c.case)} of ${cases.length} · ${esc(c.method)} · budget ${money(c.budget)} a month.</p>`
      + (c.debts || []).map((d) => `<div class="kv"><span>${esc(d.name)}</span><b>${money(d.balance)} at ${num(d.apr, 2)}% · min ${money(d.min)}</b></div>`).join("");
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "money" } }));
  }).catch(() => { const box = $("#m-example"); if (box) box.textContent = "The worked example could not be loaded."; });
  let heroResizeT = 0;
  window.addEventListener("resize", () => { clearTimeout(heroResizeT); heroResizeT = setTimeout(drawHero, 160); });
  paintReal();
  paintCons();
})();
