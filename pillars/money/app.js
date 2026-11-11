/* Money · Payoff Simulator (Sebastian, 2026-11-09): dual-model consolidation view, strategy
   comparison on the verified research cases, and the 25-issuer reference. SAMPLE data only. */
(function () {
  "use strict";
  const { $, h, money, day, toast, store, download, pickFile, tabs, field, G, spark } = PK;
  const S = store("money");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.ring(Math.round(n * 0.6), 1), ...G.ring(Math.round(n * 0.4), 0.62)] });

  const DEF = { principal: 15000, apr: 12.99, term: 24, actualPayment: 724.10, extra: 0, useBus: false };
  const cfg = () => ({ ...DEF, ...S.get("cfg", {}) });
  const busSales = () => (window.PB ? Math.max(0, PB.money.total("sale")) : 0);

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-cons" aria-controls="p-cons">The consolidation</button>
      <button class="tab" role="tab" id="t-strat" aria-controls="p-strat">Strategies</button>
      <button class="tab" role="tab" id="t-iss" aria-controls="p-iss">Issuer rules</button>
    </div>
    <section id="p-cons" role="tabpanel" class="grid">
      <div class="glass span-12"><h2>The loan, two ways <span class="sample">SAMPLE</span></h2>
        <form class="form" id="c-form">
          <label class="f">Principal $<input name="principal" type="number" step="0.01" min="0"></label>
          <label class="f">APR %<input name="apr" type="number" step="0.01" min="0"></label>
          <label class="f">Term (months)<input name="term" type="number" step="1" min="1"></label>
          <label class="f">Lender's actual payment $<input name="actualPayment" type="number" step="0.01" min="0"></label>
          <label class="f">Extra per month $<input name="extra" type="number" step="0.01" min="0"></label>
          <label class="f wide"><span id="bus-line"></span></label>
        </form>
        <div class="compare" style="margin-top:14px">
          <div class="glass model"><h3>Textbook amortization</h3><div class="stat-s">Monthly compounding at the stated APR — the formula every online calculator uses.</div><div id="m-text"></div><canvas class="curve" id="cv-text"></canvas></div>
          <div class="glass model"><h3>Lender's actual terms</h3><div class="stat-s">The payment the lender actually charges. On card-based plans interest runs on the average daily balance, so the same APR costs more — the gap is real, not an error.</div><div id="m-flex"></div><canvas class="curve" id="cv-flex"></canvas></div>
        </div>
        <p class="note" id="c-verdict"></p>
      </div>
    </section>
    <section id="p-strat" role="tabpanel" class="grid">
      <div class="glass span-12"><h2>Avalanche, snowball, minimum-only <span class="sample">SAMPLE</span></h2>
        <form class="form"><label class="f wide">Worked example (from the verified research cases)
          <select id="s-case"></select></label>
          <label class="f">Strategy<select id="s-strat"><option value="avalanche">Avalanche (highest APR first)</option><option value="snowball">Snowball (smallest balance first)</option><option value="minimum">Minimums only</option></select></label></form>
        <div id="s-out" style="margin-top:12px"></div>
        <p class="note">The engine behind this page reproduces all 12 of the research's worked payoff cases — payoff months and total interest (11 to the cent; one within a cent over 60 months).</p>
      </div>
    </section>
    <section id="p-iss" role="tabpanel" class="grid">
      <div class="glass span-12"><h2>How the issuers actually compute it</h2>
        <form class="form"><label class="f wide">Search 25 issuers<input id="i-q" type="search" placeholder="Chase, Citi, grace, daily balance…"></label></form>
        <div id="i-list"></div>
        <p class="note">Minimum-payment formulas and interest methods as researched from issuer terms, November 2026. Formulas use B = balance, I = interest charged, F = fees.</p>
      </div>
    </section>`;

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;

  function paintCons() {
    const c = cfg(), f = $("#c-form");
    for (const k of ["principal", "apr", "term", "actualPayment", "extra"]) if (document.activeElement !== f[k]) f[k].value = c[k];
    const lump = c.useBus && busSales() > 0 ? [{ month: 1, amount: busSales() }] : [];
    $("#bus-line").innerHTML = busSales() > 0
      ? `<label><input type="checkbox" id="bus-use" ${c.useBus ? "checked" : ""}> Apply the ${money(busSales())} of sales currently on the money bus as a month-1 lump sum</label>`
      : `The money bus holds no sales yet — when Selling records payouts, they can be applied here as a lump sum.`;
    const busBox = $("#bus-use"); if (busBox) busBox.onchange = () => { S.set("cfg", { ...cfg(), useBus: busBox.checked }); paintCons(); };
    const textPay = MONEY.cents(MONEY.paymentFor(c.principal, c.apr, c.term));
    const tSim = MONEY.simulateLoan({ principal: c.principal, apr: c.apr, payment: textPay, extraMonthly: c.extra, lump });
    const effApr = MONEY.solveApr(c.principal, c.actualPayment, c.term);
    const fSim = MONEY.simulateLoan({ principal: c.principal, apr: effApr, payment: c.actualPayment, extraMonthly: c.extra, lump });
    $("#m-text").innerHTML = kv("Payment", money(textPay)) + kv("Debt-free in", tSim.months + " months") + kv("Total interest", money(tSim.totalInterest));
    $("#m-flex").innerHTML = kv("Payment (actual)", money(c.actualPayment)) + kv("Implied APR", effApr.toFixed(2) + "%") + kv("Debt-free in", fSim.months + " months") + kv("Total interest", money(fSim.totalInterest));
    spark($("#cv-text"), tSim.curve.map((y, x) => ({ x, y })), { empty: "—" });
    spark($("#cv-flex"), fSim.curve.map((y, x) => ({ x, y })), { empty: "—" });
    const saved = MONEY.simulateLoan({ principal: c.principal, apr: effApr, payment: c.actualPayment }).totalInterest - fSim.totalInterest;
    $("#c-verdict").textContent = (c.extra > 0 || lump.length)
      ? `With the extra${lump.length ? " and the bus lump sum" : ""}, the actual-terms loan saves ${money(saved)} of interest and ends ${MONEY.simulateLoan({ principal: c.principal, apr: effApr, payment: c.actualPayment }).months - fSim.months} month(s) sooner. Sample math — your lender's book is the real one.`
      : `At the stated APR the textbook payment would be ${money(textPay)}; the lender charges ${money(c.actualPayment)}. That ${money(c.actualPayment - textPay)}/month gap is the daily-balance effect, worth ${money(fSim.totalInterest - tSim.totalInterest)} over the term. Add extra payments above to see what they buy.`;
  }

  function paintStrat() {
    const sel = $("#s-case");
    if (!sel.options.length) MONEY_CASES.forEach((c) => sel.append(h("option", { value: c.case }, `Case ${c.case} · ${c.debts.length} debts · ${money(c.budget)}/mo budget`)));
    const c = MONEY_CASES.find((x) => x.case === +sel.value) || MONEY_CASES[0];
    const strat = $("#s-strat").value;
    const r = MONEY.payoff({ debts: c.debts, budget: c.budget, strategy: strat });
    const order = Object.entries(r.payoffMonth).sort((a, b) => a[1] - b[1]).map(([n, m]) => `${esc(n)} (month ${m})`).join(" → ");
    $("#s-out").innerHTML = kv("Debts", c.debts.map((d) => `${esc(d.name)} ${money(d.balance)} @ ${d.apr}%`).join(" · "))
      + kv("Strategy", strat) + kv("Debt-free in", r.months + " months") + kv("Total interest", money(r.totalInterest)) + kv("Payoff order", order);
  }

  function paintIss() {
    const q = ($("#i-q").value || "").toLowerCase();
    const rows = MONEY_ISSUERS.filter((e) => !q || JSON.stringify(e).toLowerCase().includes(q));
    $("#i-list").innerHTML = rows.map((e) => `<div class="issuer"><h3>${esc(e.issuer)}</h3>`
      + (e.minimums || []).map((m) => `<div class="formula">${esc(m.formula || "")}</div><div class="stat-s">${esc(m.product || "")}${m.floor_usd ? ` · floor ${money(m.floor_usd, 0)}` : ""}</div>`).join("")
      + (e.interest ? `<div class="stat-s">Interest: ${esc(e.interest.method || "—")}${e.interest.daily ? " · daily compounding" : ""}${e.interest.grace_days ? ` · ${e.interest.grace_days} grace days` : ""}</div>` : "") + `</div>`).join("")
      || `<p class="empty">No issuer matches.</p>`;
  }

  $("#c-form").addEventListener("input", () => { const f = $("#c-form"); const c = { principal: +f.principal.value || 0, apr: +f.apr.value || 0, term: Math.max(1, +f.term.value || 24), actualPayment: +f.actualPayment.value || 0, extra: +f.extra.value || 0, useBus: cfg().useBus }; S.set("cfg", c); paintCons(); });
  $("#s-case").addEventListener("change", paintStrat);
  $("#s-strat").addEventListener("change", paintStrat);
  $("#i-q").addEventListener("input", paintIss);
  // Balance-transfer & hardship landscape (refreshed 2026-11-10, Grok reset-day pass; issuer pages
  // re-read, terms changed vs the November baseline: none). Reference only — no personal data.
  if (window.MONEY_OFFERS) {
    const O = window.MONEY_OFFERS, grid = document.querySelector("#app .grid");
    const sec = h("div.glass.span-12", null, h("h2", null, "Balance transfers & hardship — the current landscape"),
      h("p.note", null, "Advertised terms re-read from issuer pages on 2026-11-10. An issuer listed as unverified was NOT guessed — its terms could not be read from a public page."),
      ...(O.balance_transfer || []).map((r) => h("div.kv", null,
        h("span", null, `${r.issuer} — ${r.product}`, h("span.stat-s", null, ` · ${r.months || "?"} ${r.months_unit || "months"} intro · fee ${r.fee || "?"}`)))),
      ...(O.hardship || []).map((r) => h("div.kv", null,
        h("span", null, `${r.lender} hardship`, h("span.stat-s", null, ` · ${String(r.program || "").slice(0, 90)}`)))),
      ...(O.bt_not_verified || []).map((r) => h("div.kv", null,
        h("span", null, `${r.issuer} — not verified`, h("span.stat-s", null, ` · ${String(r.reason || "").slice(0, 110)}`)))));
    if (grid) grid.append(sec);
  }
  $("#export").onclick = () => download(`money_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintCons(); } catch (e) { toast(e.message); } };
  tabs(app, (id) => { if (id === "p-cons") paintCons(); if (id === "p-strat") paintStrat(); if (id === "p-iss") paintIss(); });
  paintCons(); paintStrat(); paintIss();
})();
