/* Aegis · Insurance & Cover (Claude, 2026-11-25; owner: "Are there any additional pillars you recommend to add? If yes just do it").
   Hearth now knows what every room holds and Midas knows the cash; nothing knew what protects them. Aegis keeps each policy (premium,
   how often it is billed, deductible, limits, renewal, term), the claims and their state, and reads the warranties Hearth and Records
   already hold. It checks the cover against the other pillars on this device: Hearth's contents worth against the personal-property
   limit, the largest deductible against the floor Midas keeps in cash. It publishes prometheus.aegis.summary (totals and dates only;
   Midas shows the contents cover beside net worth) and puts each renewal on the shared calendar. Arithmetic: cover.js. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const C = window.AEGIS_COVER, S = store("aegis"), app = $("#app");
  const today = () => { const q = new URLSearchParams(location.search).get("today"); return /^\d{4}-\d{2}-\d{2}$/.test(q || "") ? q : day(); };
  const usd = (n, d = 0) => (n == null || !Number.isFinite(+n) ? "—" : (n < 0 ? "−$" : "$") + Math.abs(+n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const nice = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const num = (v) => (v === "" || v == null || !Number.isFinite(+v) ? null : +v);
  const shared = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (_) { return null; } };
  const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));   // a missing line is left out, never written as "null"
  const KINDS = { home: "Home", renters: "Renters", condo: "Condo", auto: "Auto", motorcycle: "Motorcycle", umbrella: "Umbrella", health: "Health", dental: "Dental", vision: "Vision", life: "Life", disability: "Disability", pet: "Pet", travel: "Travel", other: "Other" };
  const BILLED = { month: "monthly", quarter: "quarterly", half: "every six months", year: "yearly" };
  const STATUS = ["filed", "open", "paid", "denied", "closed"];
  const kindName = (p) => (KINDS[p.kind] || "Policy") + (p.carrier ? " · " + p.carrier : "");

  window.AEGIS = {
    data() {
      const t = today(), policies = S.list("policies"), claims = S.list("claims"), hearth = shared("prometheus.hearth.summary"), midas = shared("prometheus.midas.summary");
      const R = C.review(policies, { today: t, hearth, midas, claims });
      const war = C.warranties(shared("prometheus.hearth.assets") || [], shared("prometheus.records.docs") || [], t);
      return { today: t, policies, claims, hearth, midas, R, war };
    },
  };

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12"><h2>Your cover</h2><div id="g-cover"></div></div>
      <div class="glass span-12"><h2>Policies</h2><div id="g-pols"></div>
        <form class="form" id="g-pol" style="margin-top:12px">
          <label class="f">Kind<select name="kind">${Object.entries(KINDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <label class="f">Insurer<input name="carrier" maxlength="40" placeholder="the company"></label>
          <label class="f wide">What it covers<input name="covers" maxlength="80" placeholder="the house, the Sorento, the family…"></label>
          <label class="f">Premium $<input name="premium" type="number" min="0" step="0.01" inputmode="decimal" required></label>
          <label class="f">Billed<select name="every">${Object.entries(BILLED).map(([k, v]) => `<option value="${k}"${k === "month" ? " selected" : ""}>${v}</option>`).join("")}</select></label>
          <label class="f">Deductible $<input name="deductible" type="number" min="0" step="1" inputmode="decimal"></label>
          <label class="f">Renews<input name="renews" type="date"></label>
          <label class="f">Term<select name="term"><option value="12">12 months</option><option value="6">6 months</option></select></label>
          <label class="f" data-home>Dwelling limit $<input name="dwelling" type="number" min="0" step="1" inputmode="decimal"></label>
          <label class="f" data-home>Personal property limit $<input name="contents" type="number" min="0" step="1" inputmode="decimal" placeholder="Coverage C on the declarations"></label>
          <label class="f">Liability limit $<input name="liability" type="number" min="0" step="1" inputmode="decimal"></label>
          <label class="f">Declarations page kept<input name="where" maxlength="60" placeholder="Records, Drive, the file box…"></label>
          <label class="f check"><input name="autopay" type="checkbox"> Paid automatically</label>
          <button class="btn" type="submit">Add the policy</button>
        </form></div>
      <div class="glass span-12"><h2>Claims</h2><div id="g-claims"></div>
        <form class="form" id="g-claim" style="margin-top:12px">
          <label class="f">Policy<select name="policy"></select></label>
          <label class="f">Date of loss<input name="date" type="date" required></label>
          <label class="f wide">What happened<input name="what" required maxlength="120" placeholder="windshield, water in the crawlspace…"></label>
          <label class="f">Claimed $<input name="amount" type="number" min="0" step="0.01" inputmode="decimal"></label>
          <label class="f">State<select name="status">${STATUS.map((s) => `<option>${s}</option>`).join("")}</select></label>
          <button class="btn quiet" type="submit">Add the claim</button>
        </form></div>
      <div class="glass span-12"><h2>Warranties</h2><p class="sub">From Hearth (an item's warranty date) and Records (warranty papers). Edit them there; Aegis only reads.</p><div id="g-war"></div></div>
      <div class="glass span-12"><h2>What the other pillars see</h2><div id="g-share"></div></div>
    </section>`;

  function publish(D) {
    const R = D.R, nx = R.next;
    const sum = { v: 1, at: new Date().toISOString(), policies: D.policies.length, monthly: R.month, yearly: R.year, renewal: nx ? nx.r.date : null, renewalName: nx ? kindName(nx.p) : null,
      contentsCoverage: R.contents.limit, contentsWorth: R.contents.worth, gap: R.contents.gap, maxDeductible: R.deductible.max, openClaims: R.openClaims };
    try { localStorage.setItem("prometheus.aegis.summary", JSON.stringify(sum)); } catch (_) { /* storage blocked: the page still works */ }
    if (window.PB) for (const x of R.list) if (x.r) PB.deadlines.publish({ title: "Renews: " + kindName(x.p) + (x.p.covers ? " (" + x.p.covers + ")" : ""), date: x.r.date, source: "aegis", kind: "renewal", ref: x.p.id });
    return sum;
  }
  const stat = (k, v, tone) => h("div.g-stat" + (tone ? "." + tone : ""), null, h("span.g-k", null, k), h("b.g-v", null, v));

  function paint() {
    const D = window.AEGIS.data(), R = D.R;
    /* the cover at a glance, with the checks against the other pillars */
    const checks = [];
    const ct = R.contents;
    if (ct.policy && ct.limit != null && ct.worth != null) checks.push(h("p" + (ct.gap ? ".g-bad" : ".g-ok"), null, ct.gap
      ? `The house's contents in Hearth are worth ${usd(ct.worth)}, ${usd(ct.gap)} more than the ${usd(ct.limit)} personal-property limit. Raise the limit, or check whether the policy pays replacement cost.`
      : `Hearth's contents (${usd(ct.worth)}) sit inside the ${usd(ct.limit)} personal-property limit: ${Math.round(ct.ratio * 100)}% of it used.`));
    else if (ct.policy && ct.limit == null) checks.push(h("p.sub", null, "Add the personal-property limit (Coverage C on the declarations page) to the home policy and Aegis checks it against Hearth."));
    else if (!ct.policy && ct.worth) checks.push(h("p.g-bad", null, `Hearth records ${usd(ct.worth)} of contents and no home or renters policy is here.`));
    const dd = R.deductible;
    if (dd.max != null && dd.floor != null) checks.push(h("p" + (dd.short ? ".g-bad" : ".g-ok"), null, dd.short
      ? `The largest deductible (${usd(dd.max)}, ${kindName(dd.policy)}) is ${usd(dd.short)} more than the ${usd(dd.floor)} Midas keeps as its cash floor.`
      : `The largest deductible (${usd(dd.max)}, ${kindName(dd.policy)}) fits inside the ${usd(dd.floor)} cash floor Midas keeps.`));
    put($("#g-cover"), 
      h("div.g-stats", null,
        stat("Premiums a month", D.policies.length ? usd(R.month, 2) : "—"), stat("A year", D.policies.length ? usd(R.year) : "—"),
        stat("Next renewal", R.next ? `${R.next.r.days} d` : "—", R.next && R.next.r.days <= 30 ? "warn" : ""), stat("Open claims", String(R.openClaims), R.openClaims ? "warn" : "")),
      R.next ? h("p.sub", null, `${kindName(R.next.p)} renews ${nice(R.next.r.date)}: compare quotes in the month before.`) : null,
      ...checks,
      D.policies.length ? null : h("p.empty", null, "No policies yet. Add each one from its declarations page: premium, deductible, limits and the renewal date."));
    /* policies */
    put($("#g-pols"), ...R.list.slice().sort((a, b) => ((a.r && a.r.date) || "9").localeCompare((b.r && b.r.date) || "9")).map(({ p, c, r }) => h("article.g-pol", null,
      h("div.g-pol-head", null, h("b", null, kindName(p)), h("span.g-pill", null, c.month != null ? usd(c.month, 2) + "/mo" : "—")),
      p.covers ? h("p.stat-s", null, p.covers) : null,
      h("p.stat-s", null, [`${usd(p.premium, 2)} ${BILLED[p.every] || ""}`, p.deductible != null ? `deductible ${usd(p.deductible)}` : "", p.autopay ? "autopay" : ""].filter(Boolean).join(" · ")),
      [p.dwelling, p.contents, p.liability].some((x) => x != null) ? h("p.stat-s", null, [p.dwelling != null ? `dwelling ${usd(p.dwelling)}` : "", p.contents != null ? `personal property ${usd(p.contents)}` : "", p.liability != null ? `liability ${usd(p.liability)}` : ""].filter(Boolean).join(" · ")) : null,
      r ? h("p.stat-s" + (r.days <= 30 ? ".g-warnt" : ""), null, `Renews ${nice(r.date)} · in ${r.days} days · ${r.term}-month term`) : h("p.stat-s", null, "Add the renewal date"),
      p.where ? h("p.stat-s", null, "Declarations: " + p.where) : null,
      h("div.row-actions", null, h("button.btn.quiet.small", { type: "button", "aria-label": "Remove " + kindName(p), onclick: () => { if (!confirm("Remove " + kindName(p) + "?")) return; S.remove("policies", p.id); if (window.PB) PB.deadlines.unpublish("aegis", p.id); paint(); } }, "Remove")))));
    /* claims */
    const cf = $("#g-claim");
    cf.policy.replaceChildren(h("option", { value: "" }, "not listed"), ...D.policies.map((p) => h("option", { value: p.id }, kindName(p))));
    const claims = D.claims.slice().sort((a, b) => b.date.localeCompare(a.date));
    put($("#g-claims"), ...(claims.length ? claims.map((c) => { const p = D.policies.find((x) => x.id === c.policy);
      return h("div.kv", null, h("span", null, h("b", null, c.what), h("br"), h("span.stat-s", null, [nice(c.date), p ? kindName(p) : "", c.amount != null ? "claimed " + usd(c.amount, 2) : "", c.paid != null ? "paid " + usd(c.paid, 2) : ""].filter(Boolean).join(" · "))),
        h("span.row-actions", null,
          h("select", { "aria-label": "State of the claim " + c.what, onchange: (e) => { const st = e.target.value; const patch = { status: st }; if (st === "paid" && c.paid == null) { const v = prompt("Amount paid ($):", c.amount ?? ""); if (v !== null) patch.paid = num(v); } S.update("claims", c.id, patch); paint(); } },
            ...STATUS.map((s) => h("option", s === c.status ? { selected: true } : null, s))),
          h("button.btn.quiet.small", { type: "button", "aria-label": "Remove the claim " + c.what, onclick: () => { S.remove("claims", c.id); paint(); } }, "×"))); })
      : [h("p.empty", null, "No claims. When one is filed, log it here and move it along to paid.")]));
    /* warranties */
    put($("#g-war"), ...(D.war.length ? D.war.map((w) => h("div.kv" + (w.days < 0 ? ".g-past" : ""), null,
      h("span", null, h("b", null, w.name), h("br"), h("span.stat-s", null, `${w.from} · ends ${nice(w.end)} · ${w.days < 0 ? "ended" : w.days === 0 ? "today" : "in " + w.days + " days"}`)),
      h("a.btn.quiet.small", { href: w.from === "Hearth" ? "../hearth/" : "../records/" }, w.from + " →"))) : [h("p.empty", null, "No warranties yet. Add a warranty date to an item in Hearth, or file the paper in Records.")]));
    /* shared */
    const sum = publish(D);
    put($("#g-share"), 
      h("div.kv", null, h("span", null, h("b", null, "Midas"), h("br"), h("span.stat-s", null, sum.contentsCoverage ? `Contents insured for ${usd(sum.contentsCoverage)} shows beside net worth.` : "Shows the contents cover beside net worth once the home policy has its personal-property limit.")), h("a.btn.quiet.small", { href: "../../../midas-ledger/" }, "Midas →")),
      h("div.kv", null, h("span", null, h("b", null, "Hearth"), h("br"), h("span.stat-s", null, D.hearth ? `${D.hearth.items || 0} items worth ${usd(D.hearth.contentsValue)} checked against the cover.` : "Record what each room holds in Hearth and Aegis checks it against the cover.")), h("a.btn.quiet.small", { href: "../hearth/" }, "Hearth →")),
      h("div.kv", null, h("span", null, h("b", null, "Time"), h("br"), h("span.stat-s", null, "Each renewal is on the shared calendar.")), h("a.btn.quiet.small", { href: "../../#/time" }, "Time →")),
      h("p.sub", null, "Shared on this device only: totals, the next renewal, the contents cover and its gap, the largest deductible, open claims. Insurers, limits and claims stay here."));
    homeFields();
  }
  function homeFields() { const f = $("#g-pol"), on = ["home", "renters", "condo"].includes(f.kind.value); f.querySelectorAll("[data-home]").forEach((x) => { x.hidden = !on; }); f.dwelling.closest("label").hidden = !(on && f.kind.value !== "renters"); }
  $("#g-pol").kind.addEventListener("change", homeFields);
  $("#g-pol").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("policies", { kind: f.kind.value, carrier: f.carrier.value.trim(), covers: f.covers.value.trim(), premium: num(f.premium.value), every: f.every.value, deductible: num(f.deductible.value), renews: f.renews.value || null, term: +f.term.value,
      dwelling: num(f.dwelling.value), contents: num(f.contents.value), liability: num(f.liability.value), where: f.where.value.trim(), autopay: f.autopay.checked });
    f.reset(); toast("Policy added"); paint();
  });
  $("#g-claim").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("claims", { policy: f.policy.value, date: f.date.value, what: f.what.value.trim(), amount: num(f.amount.value), status: f.status.value, paid: null }); f.reset(); toast("Claim added"); paint(); });
  window.addEventListener("storage", (e) => { if (e.key && /^prometheus\.(hearth\.(summary|assets)|records\.docs|midas\.summary)$/.test(e.key)) paint(); });
  $("#export").onclick = () => download(`aegis_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (err) { toast(err.message); } };
  paint();
})();
