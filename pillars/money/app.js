/* Money: an empty consolidation form, a neutral worked example from deck/data/payoff-cases.json,
   3-way Avalanche/Snowball/Minimum comparison, windfall allocator, deferred-interest trap, issuer rules, bills audit.
   Nothing here is prefilled from a real account. */
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

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-cons" aria-controls="p-cons">Consolidation</button>
      <button class="tab" role="tab" id="t-strat" aria-controls="p-strat">Strategies &amp; Windfall</button>
      <button class="tab" role="tab" id="t-iss" aria-controls="p-iss">BT, Traps &amp; Hardship</button>
      <button class="tab" role="tab" id="t-bills" aria-controls="p-bills">Bills Audit</button>
    </div>

    <section id="p-cons" role="tabpanel" class="grid">
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
      $("#m-cons-out").innerHTML = `<p class="empty">The form is empty. Type your own figures, or read the worked example above. Nothing here is an account.</p>`;
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
      <div class="kv"><span>Textbook payment @ ${num(c.apr, 2)}% (${c.term}m)</span><b>${money(textbook)}/mo</b></div>
      <div class="kv"><span>Actual payment (${money(c.actualPayment)}/mo) implies APR</span><b>${num(impliedApr, 2)}%</b></div>
      <div class="kv"><span>Monthly quote delta vs textbook</span><b>${gapMonth >= 0 ? "+" : ""}${money(gapMonth)}/mo</b></div>
      <div class="kv"><span>Interest at textbook vs your plan</span><b>${money(atBook.totalInterest)} vs ${money(atQuoted.totalInterest)}</b></div>
      <div class="kv"><span>Payoff horizon (with $${+c.extra || 0}/mo extra)</span><b>${atQuoted.months} months</b></div>
      ${c.useBus ? `<div class="kv"><span>Money Bus sales applied</span><b>${money(salesTotal)}</b></div>` : ""}`;
    drawCurves("m-cons-cv", [
      { label: "Quoted Base", color: "#ff9d5c", curve: M.simulateLoan({ principal: c.principal, apr: c.apr, payment: c.actualPayment }).curve },
      { label: "Your Plan (+Extra/Bus)", color: "#4de8ff", curve: atQuoted.curve }
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
      { label: `Minimum (${mn.months}m)`, color: "#ff7a8c", curve: mn.curve, width: 1.8 },
      { label: `Snowball (${sn.months}m)`, color: "#75f547", curve: sn.curve, width: 2 },
      { label: `Avalanche (${av.months}m)`, color: "#4de8ff", curve: av.curve, width: 2.6 }
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
        h("span", null, h("b", null, b.name), b.cuttable ? " [cuttable]" : "", ` · ${money(b.amount)}/${b.cadence}`, b.due ? ` · due ${b.due}` : ""),
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
    if (id === "p-cons") paintCons();
    if (id === "p-strat") paintStrat();
    if (id === "p-iss") { paintDeferred(); paintIssuers(); }
    if (id === "p-bills") paintBills();
  });
  fetch("../../deck/data/payoff-cases.json").then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then((cases) => {
    const c = cases && cases[0]; const box = $("#m-example"); if (!box || !c) return;
    box.innerHTML = `<p>Case ${esc(c.case)} of ${cases.length} · ${esc(c.method)} · budget ${money(c.budget)} a month.</p>`
      + (c.debts || []).map((d) => `<div class="kv"><span>${esc(d.name)}</span><b>${money(d.balance)} at ${num(d.apr, 2)}% · min ${money(d.min)}</b></div>`).join("");
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "money" } }));
  }).catch(() => { const box = $("#m-example"); if (box) box.textContent = "The worked example could not be loaded."; });
  paintCons();
})();
