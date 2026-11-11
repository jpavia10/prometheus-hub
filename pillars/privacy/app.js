/* Privacy (Sebastian, 2026-11-10): DROP tracker, broker removal ledger with recheck dates on the
   deadlines bus, and an account inventory. Dates and states only — never a DROP ID, never credentials. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("privacy");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.ring(Math.round(n * 0.5), 0.7), ...G.line(Math.round(n * 0.5), -0.3, 0.3, 0.3, -0.3)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (!S.get("brokers")) S.set("brokers", ["Acxiom", "LexisNexis Risk Solutions", "Epsilon", "Experian", "Equifax", "TransUnion", "Whitepages", "BeenVerified", "Spokeo", "PeopleFinders", "TruthFinder", "Intelius"]
    .map((name) => ({ id: Math.random().toString(36).slice(2, 8), name, state: "not started", recheck: null })));
  const STATES = ["not started", "opt-out sent", "confirmed removed", "recheck due"];
  // Broker expansion (2026-11-10): union in the verified 40-site ledger (Grok reset-day pass).
  // Existing brokers and their states are never touched — only missing names are added.
  if (!S.get("brokersV2")) { const bs = S.get("brokers", []); const have = new Set(bs.map((b) => b.name));
    for (const n of ["Spokeo", "AnyWho", "Whitepages", "TruthFinder", "Instant Checkmate", "Intelius", "US Search", "PeopleFinders", "MyLife", "FastPeopleSearch", "SearchPeopleFree", "SmartBackgroundChecks", "USA People Search", "FastBackgroundCheck", "CyberBackgroundChecks", "PeopleSearchNow", "USPhoneBook", "Veripages", "CheckPeople", "InfoTracer", "Social Catfish", "SearchQuarry", "Archives.com", "PropertyRecs", "LocateFamily", "Sync.me", "PeopleWhiz", "FreePeopleDirectory", "Pipl", "PimEyes", "FaceCheck.ID", "Acxiom", "LexisNexis Risk Solutions", "Epsilon", "Experian", "TransUnion", "OptOutPrescreen (credit-bureau prescreen opt-out)", "ZoomInfo", "RocketReach", "Apollo.io"]) if (!have.has(n)) bs.push({ id: Math.random().toString(36).slice(2, 8), name: n, state: "not started", recheck: null });
    S.set("brokers", bs); S.set("brokersV2", 1); }
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>California DROP</h2><div id="v-drop"></div>
        <form class="form" id="v-drop-form">
          <label class="f">Status<select name="status"><option>not submitted</option><option>submitted</option><option>processing</option><option>complete</option></select></label>
          <label class="f">Submission date<input name="submitted" type="date"></label>
          <label class="f">Last checked<input name="checked" type="date"></label>
          <button class="btn" type="submit">Save</button></form>
        <p class="note">Submit and check status at the official portal: <a href="https://privacy.ca.gov/drop/" target="_blank" rel="noopener">privacy.ca.gov/drop</a>. Brokers can take up to ~90 days to process; the portal is the only source of truth — this page tracks your dates.</p></div>
      <div class="glass span-12"><h2>Broker ledger</h2><div id="v-brokers"></div>
        <form class="form" id="v-broker-form"><label class="f wide">Add a broker / people-search site<input name="name" required maxlength="80"></label><button class="btn" type="submit">Add</button></form>
        <p class="note">Advancing a broker to "confirmed removed" sets a 6-month recheck on the shared calendar — brokers relist people; the recheck is the point.</p></div>
      <div class="glass span-12"><h2>Account inventory</h2>
        <form class="form" id="v-acct-form"><label class="f wide">Service<input name="service" required maxlength="80"></label>
        <label class="f">Email used<input name="email" maxlength="80"></label>
        <label class="f">2FA<select name="tfa"><option>on</option><option>off</option><option>unknown</option></select></label>
        <label class="f">Status<select name="status"><option>active</option><option>closing</option><option>closed</option></select></label>
        <button class="btn" type="submit">Add</button></form>
        <div id="v-accts" style="margin-top:10px"></div></div>
    </section>`;
  function paint() {
    const d = S.get("drop", { status: "not submitted", submitted: "", checked: "" });
    $("#v-drop").innerHTML = `<div class="kv"><span>Status</span><b>${esc(d.status)}</b></div>`
      + (d.submitted ? `<div class="kv"><span>Submitted</span><b>${d.submitted}</b></div>` : "")
      + (d.checked ? `<div class="kv"><span>Last checked</span><b>${d.checked}</b></div>` : "");
    const f = $("#v-drop-form"); f.status.value = d.status; f.submitted.value = d.submitted || ""; f.checked.value = d.checked || "";
    const brokers = S.get("brokers", []);
    $("#v-brokers").innerHTML = "";
    for (const b of brokers) $("#v-brokers").append(h("div.kv", null,
      h("span", null, `${b.name} `, h("span.pill", null, b.state), (window.BROKER_OPTOUTS && window.BROKER_OPTOUTS[b.name]) ? h("a", { href: window.BROKER_OPTOUTS[b.name], target: "_blank", rel: "noopener", class: "stat-s" }, " opt out \u2197") : null, b.recheck ? h("span.stat-s", null, ` recheck ${b.recheck}`) : null),
      h("span", null, h("button.btn.quiet.small", { type: "button", onclick: () => {
        const i = STATES.indexOf(b.state); b.state = STATES[(i + 1) % STATES.length];
        if (b.state === "confirmed removed" && window.PB) { b.recheck = PB.addDays(day(), 182); PB.deadlines.publish({ title: "Recheck broker removal: " + b.name, date: b.recheck, source: "privacy", kind: "recheck", ref: b.id }); }
        S.set("brokers", brokers); paint(); } }, "Advance state"))));
    const accts = S.list("accounts");
    $("#v-accts").innerHTML = accts.map((a) => `<div class="kv"><span><b>${esc(a.service)}</b> · ${esc(a.email || "")}</span><b>2FA ${esc(a.tfa)} · ${esc(a.status)}</b></div>`).join("") || `<p class="empty">No accounts inventoried yet.</p>`;
  }
  $("#v-drop-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.set("drop", { status: f.status.value, submitted: f.submitted.value, checked: f.checked.value }); toast("Saved"); paint(); });
  $("#v-broker-form").addEventListener("submit", (e) => { e.preventDefault(); const bs = S.get("brokers", []);
    bs.push({ id: Math.random().toString(36).slice(2, 8), name: e.target.name.value.trim(), state: "not started", recheck: null }); S.set("brokers", bs); e.target.reset(); paint(); });
  $("#v-acct-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("accounts", { service: f.service.value.trim(), email: f.email.value.trim(), tfa: f.tfa.value, status: f.status.value }); f.reset(); paint(); });
  $("#export").onclick = () => download(`privacy_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const fl = await pickFile(); if (!fl) return; try { S.load(JSON.parse(await fl.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
