/* Atlas · Work & Pay (Claude, 2026-11-25; owner: "Are there any additional pillars you recommend to add? If yes just do it").
   Work carries the rest of the household, and no pillar knew when the pay lands. Atlas keeps the pay schedule, every stub, the time off
   banked and the dates work sets, all in this browser. It publishes prometheus.atlas.summary (the next payday and its usual amount,
   take-home per month, year-to-date totals, hours of time off) for the other pillars on this device: Midas counts only what is due
   before that payday as spoken for. Paydays and work dates go on the shared calendar. Arithmetic: pay.js (window.ATLAS_PAY). */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const P = window.ATLAS_PAY, S = store("atlas"), app = $("#app");
  const today = () => { const q = new URLSearchParams(location.search).get("today"); return /^\d{4}-\d{2}-\d{2}$/.test(q || "") ? q : day(); };
  const usd = (n, d = 0) => (n == null || !Number.isFinite(+n) ? "—" : (n < 0 ? "−$" : "$") + Math.abs(+n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const nice = (s, o = { weekday: "short", month: "short", day: "numeric" }) => new Date(s + "T12:00:00").toLocaleDateString("en-US", o);
  const num = (v) => (v === "" || v == null || !Number.isFinite(+v) ? null : +v);
  const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));   // a missing line is left out, never written as "null"
  const EVERY = { weekly: "Every week", biweekly: "Every two weeks", semimonthly: "Twice a month", monthly: "Once a month" };
  const KINDS = ["benefits", "review", "training", "tax form", "time off", "other"];

  window.ATLAS = {
    data() {
      const t = today(), pay = S.get("pay", null), stubs = S.list("stubs").slice().sort((a, b) => b.date.localeCompare(a.date));
      const next = pay ? P.paydays(pay, t, 120) : [];
      return { today: t, pay, stubs, next, perMonth: P.perMonth(pay), three: pay ? P.threePayMonths(pay, t) : [], ytd: P.ytd(stubs, t.slice(0, 4)), pto: S.get("pto", null), dates: S.list("dates") };
    },
  };

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12"><h2>The next pay</h2><div id="a-next"></div></div>
      <div class="glass span-12"><h2>Pay schedule</h2>
        <p class="sub">Set it once from any recent payday. A payday on a weekend or a bank holiday lands on the business day before, as most employers pay; choose "after" if yours pays late.</p>
        <form class="form" id="a-pay">
          <label class="f">How often<select name="every">${Object.entries(EVERY).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <label class="f" data-for="anchor">A recent payday<input name="anchor" type="date"></label>
          <label class="f" data-for="days">Days of the month<select name="days"><option value="15,last">15th and last day</option><option value="1,15">1st and 15th</option><option value="5,20">5th and 20th</option><option value="10,25">10th and 25th</option></select></label>
          <label class="f" data-for="day">Day of the month<select name="day"><option value="last">last day</option>${Array.from({ length: 28 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}</select></label>
          <label class="f">Usual take-home $<input name="net" type="number" min="0" step="0.01" inputmode="decimal" placeholder="what lands in the bank"></label>
          <label class="f">Usual gross $<input name="gross" type="number" min="0" step="0.01" inputmode="decimal" placeholder="before anything comes out"></label>
          <label class="f">Weekend or holiday<select name="move"><option value="before">paid the business day before</option><option value="after">paid the business day after</option></select></label>
          <label class="f">Employer (optional)<input name="employer" maxlength="60" placeholder="a short name"></label>
          <button class="btn" type="submit">Save the schedule</button>
        </form></div>
      <div class="glass span-12"><h2>Pay stubs</h2><div id="a-ytd"></div><div id="a-stubs"></div>
        <form class="form" id="a-stub" style="margin-top:12px">
          <label class="f">Pay date<input name="date" type="date" required></label>
          <label class="f">Gross $<input name="gross" type="number" min="0" step="0.01" inputmode="decimal" required></label>
          <label class="f">Federal tax $<input name="fed" type="number" min="0" step="0.01" inputmode="decimal"></label>
          <label class="f">State tax and SDI $<input name="state" type="number" min="0" step="0.01" inputmode="decimal"></label>
          <label class="f">Social Security and Medicare $<input name="fica" type="number" min="0" step="0.01" inputmode="decimal"></label>
          <label class="f">Pre-tax (401(k), health) $<input name="pretax" type="number" min="0" step="0.01" inputmode="decimal"></label>
          <label class="f">Take-home $<input name="net" type="number" min="0" step="0.01" inputmode="decimal" required></label>
          <label class="f">Hours<input name="hours" type="number" min="0" step="0.25" inputmode="decimal"></label>
          <button class="btn" type="submit">Add the stub</button>
        </form></div>
      <div class="glass span-12"><h2>Time off</h2><div id="a-pto"></div>
        <form class="form" id="a-ptof">
          <label class="f">Hours banked<input name="hours" type="number" min="0" step="0.25" inputmode="decimal" required></label>
          <label class="f">As of<input name="asof" type="date" required></label>
          <label class="f">Earned each payday<input name="accrue" type="number" min="0" step="0.01" inputmode="decimal" placeholder="hours"></label>
          <label class="f">Cap<input name="cap" type="number" min="0" step="0.25" inputmode="decimal" placeholder="hours, if there is one"></label>
          <button class="btn quiet" type="submit">Save</button>
        </form>
        <label class="f" style="margin-top:10px">How much on<input id="a-pto-on" type="date"></label><p class="sub" id="a-pto-ans"></p></div>
      <div class="glass span-12"><h2>Work dates</h2><p class="sub">Open enrollment, reviews, training, the W-2 (employers must send it by January 31). They go on the shared calendar.</p>
        <div id="a-dates"></div>
        <form class="form" id="a-date"><label class="f wide">What<input name="title" required maxlength="100" placeholder="Open enrollment closes, annual review…"></label>
          <label class="f">Kind<select name="kind">${KINDS.map((k) => `<option>${k}</option>`).join("")}</select></label>
          <label class="f">Date<input name="date" type="date" required></label><button class="btn quiet" type="submit">Add</button></form></div>
      <div class="glass span-12"><h2>What the other pillars see</h2><div id="a-share"></div></div>
    </section>`;

  function publish(D) {
    const nx = D.next[0];
    const sum = { v: 1, at: new Date().toISOString(), nextPay: nx ? { date: nx.date, net: nx.net } : null, every: D.pay ? D.pay.every : null, perMonth: D.perMonth,
      ytd: { year: D.today.slice(0, 4), stubs: D.ytd.n, gross: D.ytd.gross, net: D.ytd.net }, ptoHours: D.pto ? P.ptoOn(D.pto, D.pay, D.today) : null, threePayMonths: D.three };
    try { localStorage.setItem("prometheus.atlas.summary", JSON.stringify(sum)); } catch (_) { /* storage full or blocked: the page still works */ }
    if (window.PB && nx) PB.deadlines.publish({ title: "Payday" + (nx.net != null ? " · " + usd(nx.net) : ""), date: nx.date, source: "atlas", kind: "pay", ref: "next-pay" });
    return sum;
  }

  function paint() {
    const D = window.ATLAS.data(), nx = D.next[0];
    /* the next pay */
    put($("#a-next"), ...(nx ? [
      h("div.a-next", null,
        h("div.a-when", null, h("span.a-wd", null, nice(nx.date, { weekday: "long" })), h("span.a-num", null, String(+nx.date.slice(8))), h("span.a-my", null, nice(nx.date, { month: "long", year: "numeric" }))),
        h("div.a-what", null,
          h("span.a-rel", null, (() => { const n = P.diffDays(D.today, nx.date); return n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`; })()),
          h("b.a-amt", null, nx.net != null ? usd(nx.net, 2) : "Amount not set"),
          h("span.a-sub", null, [EVERY[D.pay.every], D.pay.employer, nx.moved ? `moved from ${nice(nx.scheduled)} (${nx.why})` : ""].filter(Boolean).join(" · ")))),
      h("div.a-list", null, ...D.next.slice(1, 7).map((p) => h("div.a-row", null, h("span", null, nice(p.date)), h("span.stat-s", null, p.moved ? `from ${nice(p.scheduled)}, ${p.why}` : ""), h("b", null, p.net != null ? usd(p.net) : "")))),
      D.three.length ? h("p.sub", null, `Three paydays in ${D.three.map((m) => nice(m + "-01", { month: "long", year: "numeric" })).join(" and ")}: a month with one more pay than usual.`) : null,
      D.perMonth != null ? h("p.sub", null, `About ${usd(D.perMonth)} a month take-home (${usd(D.pay.net)} × ${P.PER_YEAR[D.pay.every]} a year ÷ 12).`) : null,
    ] : [h("p.empty", null, "Set the pay schedule below and the next payday shows here, moved off weekends and bank holidays.")]));
    /* the schedule form */
    const f = $("#a-pay"), pay = D.pay || {};
    if (D.pay) { f.every.value = pay.every; f.anchor.value = pay.anchor || ""; f.days.value = (pay.days || [15, "last"]).join(","); f.day.value = String(pay.day || "last"); f.net.value = pay.net ?? ""; f.gross.value = pay.gross ?? ""; f.move.value = pay.move || "before"; f.employer.value = pay.employer || ""; }
    showFields();
    /* stubs */
    const Y = D.ytd;
    put($("#a-ytd"), h("div.a-stats", null,
      stat("Stubs this year", String(Y.n)), stat("Gross", usd(Y.gross)), stat("Take-home", usd(Y.net)), stat("Tax withheld", Y.taxRate != null ? `${usd(Y.tax)} · ${(Y.taxRate * 100).toFixed(1)}%` : "—")));
    const usual = num(pay.net);
    put($("#a-stubs"), ...(D.stubs.length ? D.stubs.slice(0, 26).map((s) => {
      const c = P.stubCheck(s, usual);
      return h("div.kv" + (c.flag ? ".a-flag" : ""), null,
        h("span", null, h("b", null, nice(s.date, { month: "short", day: "numeric", year: "numeric" })), " ", h("span.stat-s", null, `gross ${usd(s.gross, 2)} · take-home ${usd(s.net, 2)}${c.taxRate != null ? ` · ${(c.taxRate * 100).toFixed(1)}% tax` : ""}${s.hours ? ` · ${s.hours} h` : ""}`),
          c.flag ? h("div.stat-s.a-warn", null, `${c.off > 0 ? "+" : "−"}${Math.abs(c.off * 100).toFixed(1)}% from the usual take-home: check overtime, a bonus or a new deduction.`) : null,
          c.unexplained != null && Math.abs(c.unexplained) >= 1 ? h("div.stat-s", null, `${usd(c.unexplained, 2)} not explained by the taxes and pre-tax entered (post-tax deductions, garnishments or a typo).`) : null),
        h("button.btn.quiet.small", { type: "button", "aria-label": "Remove the stub from " + s.date, onclick: () => { S.remove("stubs", s.id); paint(); } }, "×"));
    }) : [h("p.empty", null, "No stubs yet. Add each one as it comes: the year's totals, the tax rate and any check that differs from the usual show here.")]));
    /* time off */
    const pto = D.pto;
    if (pto) { const g = $("#a-ptof"); g.hours.value = pto.hours; g.asof.value = pto.asof; g.accrue.value = pto.accrue ?? ""; g.cap.value = pto.cap ?? ""; }
    const now = pto ? P.ptoOn(pto, D.pay, D.today) : null;
    put($("#a-pto"), ...(pto ? [h("div.a-stats", null, stat("Banked today", now != null ? `${now} h` : "—"), stat("Days of 8 h", now != null ? (now / 8).toFixed(1) : "—"), stat("Earned a payday", pto.accrue ? `${pto.accrue} h` : "—"), stat("Cap", pto.cap ? `${pto.cap} h` : "none")),
      pto.cap && now != null && now >= +pto.cap ? h("p.sub.a-warn", null, "At the cap: nothing more is earned until some is used.") : null]
      : [h("p.empty", null, "Enter the balance from the last stub and what each payday adds; Atlas projects it forward.")]));
    /* work dates */
    const dates = D.dates.slice().sort((a, b) => a.date.localeCompare(b.date));
    put($("#a-dates"), ...(dates.length ? dates.map((x) => h("div.kv" + (x.date < D.today ? ".a-past" : ""), null,
      h("span", null, h("b", null, x.title), h("br"), h("span.stat-s", null, `${x.kind} · ${nice(x.date, { month: "short", day: "numeric", year: "numeric" })}${x.date >= D.today ? ` · in ${P.diffDays(D.today, x.date)} days` : " · past"}`)),
      h("button.btn.quiet.small", { type: "button", "aria-label": "Remove " + x.title, onclick: () => { S.remove("dates", x.id); if (window.PB) PB.deadlines.unpublish("atlas", x.id); paint(); } }, "×"))) : [h("p.empty", null, "No work dates yet.")]));
    /* what is shared */
    const sum = publish(D);
    put($("#a-share"), 
      h("div.kv", null, h("span", null, h("b", null, "Midas"), h("br"), h("span.stat-s", null, sum.nextPay ? `Next pay ${nice(sum.nextPay.date)}: Midas sets aside what is due before then.` : "No payday yet: Midas looks 14 days ahead instead.")), h("a.btn.quiet.small", { href: "../../../midas-ledger/" }, "Midas →")),
      h("div.kv", null, h("span", null, h("b", null, "Time"), h("br"), h("span.stat-s", null, "The next payday and the work dates are on the shared calendar.")), h("a.btn.quiet.small", { href: "../../#/time" }, "Time →")),
      h("p.sub", null, "Shared on this device only: the next payday, take-home per month, this year's totals and hours of time off. Stubs and the employer stay here."));
  }
  const stat = (k, v) => h("div.a-stat", null, h("span.a-k", null, k), h("b.a-v", null, v));
  function showFields() {
    const f = $("#a-pay"), e = f.every.value;
    f.querySelector('[data-for="anchor"]').hidden = !(e === "weekly" || e === "biweekly");
    f.querySelector('[data-for="days"]').hidden = e !== "semimonthly";
    f.querySelector('[data-for="day"]').hidden = e !== "monthly";
  }
  $("#a-pay").every.addEventListener("change", showFields);
  $("#a-pay").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target, ev = f.every.value;
    if ((ev === "weekly" || ev === "biweekly") && !f.anchor.value) { toast("Pick a recent payday so the two-week rhythm lines up."); return; }
    const days = f.days.value.split(",").map((x) => (x === "last" ? "last" : +x));
    S.set("pay", { every: ev, anchor: f.anchor.value || null, days, day: f.day.value === "last" ? "last" : +f.day.value, net: num(f.net.value), gross: num(f.gross.value), move: f.move.value, employer: f.employer.value.trim() });
    toast("Schedule saved"); paint();
  });
  $("#a-stub").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("stubs", { date: f.date.value, gross: num(f.gross.value), fed: num(f.fed.value), state: num(f.state.value), fica: num(f.fica.value), pretax: num(f.pretax.value), net: num(f.net.value), hours: num(f.hours.value) });
    f.reset(); toast("Stub added"); paint();
  });
  $("#a-ptof").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.set("pto", { hours: num(f.hours.value), asof: f.asof.value, accrue: num(f.accrue.value), cap: num(f.cap.value) }); toast("Time off saved"); paint(); });
  $("#a-pto-on").addEventListener("change", (e) => {
    const D = window.ATLAS.data(), v = e.target.value, n = D.pto ? P.ptoOn(D.pto, D.pay, v) : null;
    $("#a-pto-ans").textContent = !D.pto ? "Enter the balance first." : n == null ? "Pick a day after the balance date." : `On ${nice(v, { month: "short", day: "numeric", year: "numeric" })}: ${n} hours (${(n / 8).toFixed(1)} days of 8 hours), counting every payday's accrual${D.pto.cap ? " up to the cap" : ""}.`;
  });
  $("#a-date").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target, x = S.add("dates", { title: f.title.value.trim(), kind: f.kind.value, date: f.date.value });
    if (window.PB) PB.deadlines.publish({ title: "Work: " + x.title, date: x.date, source: "atlas", kind: x.kind, ref: x.id });
    f.reset(); toast("Added"); paint();
  });
  $("#export").onclick = () => download(`atlas_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (err) { toast(err.message); } };
  paint();
})();
