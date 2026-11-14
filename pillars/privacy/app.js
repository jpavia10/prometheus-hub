/* Privacy v2: CA DROP + 45-day statutory deadline clock + 40-broker ledger + Hermes Opt-Out Intake queue + Account Hygiene (>365d password rotation) + Galaxy S24 Ultra checklist.
   Never stores real credentials, DROP IDs, or private tokens — dates and states only. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("privacy");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.ring(Math.round(n * 0.5), 0.7), ...G.line(Math.round(n * 0.5), -0.3, 0.3, 0.3, -0.3)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  if (!S.get("brokers")) {
    S.set("brokers", ["Acxiom", "LexisNexis Risk Solutions", "Epsilon", "Experian", "Equifax", "TransUnion", "Whitepages", "BeenVerified", "Spokeo", "PeopleFinders", "TruthFinder", "Intelius"]
      .map((name) => ({ id: Math.random().toString(36).slice(2, 8), name, state: "not started", recheck: null })));
  }
  const STATES = ["not started", "opt-out sent", "confirmed removed", "recheck due"];
  if (!S.get("brokersV2")) {
    const bs = S.get("brokers", []);
    const have = new Set(bs.map((b) => b.name));
    for (const n of ["Spokeo", "AnyWho", "Whitepages", "TruthFinder", "Instant Checkmate", "Intelius", "US Search", "PeopleFinders", "MyLife", "FastPeopleSearch", "SearchPeopleFree", "SmartBackgroundChecks", "USA People Search", "FastBackgroundCheck", "CyberBackgroundChecks", "PeopleSearchNow", "USPhoneBook", "Veripages", "CheckPeople", "InfoTracer", "Social Catfish", "SearchQuarry", "Archives.com", "PropertyRecs", "LocateFamily", "Sync.me", "PeopleWhiz", "FreePeopleDirectory", "Pipl", "PimEyes", "FaceCheck.ID", "Acxiom", "LexisNexis Risk Solutions", "Epsilon", "Experian", "TransUnion", "OptOutPrescreen (credit-bureau prescreen opt-out)", "ZoomInfo", "RocketReach", "Apollo.io"]) {
      if (!have.has(n)) bs.push({ id: Math.random().toString(36).slice(2, 8), name: n, state: "not started", recheck: null });
    }
    S.set("brokers", bs); S.set("brokersV2", 1);
  }

  const S24_CHECKS = [
    "SIM PIN lock enabled (carrier theft protection)",
    "Private DNS set to encrypted resolver (Quad9 / Cloudflare)",
    "Passkeys enabled on Google, Apple & financial accounts",
    "Google Find My Device offline network enabled",
    "Auto Blocker & USB Restricted Mode ON",
    "RCS end-to-end encryption verified in Messages",
  ];

  const daysBetween = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5);

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-6"><h2>California DROP (45-Day Statutory Clock)</h2><div id="v-drop"></div>
        <form class="form" id="v-drop-form">
          <label class="f">Status<select name="status"><option>not submitted</option><option>submitted</option><option>processing</option><option>complete</option></select></label>
          <label class="f">Submission date<input name="submitted" type="date"></label>
          <label class="f">Last checked<input name="checked" type="date"></label>
          <button class="btn" type="submit">Save</button>
        </form>
        <p class="note">Never store your DROP ID here. Submit at <a href="https://privacy.ca.gov/drop/" target="_blank" rel="noopener">privacy.ca.gov/drop</a>; broker statutory window starts 45 days post-submission.</p>
      </div>

      <div class="glass span-6"><h2>Galaxy S24 Ultra Hardening &amp; Hermes Intake</h2>
        <div id="v-s24"></div>
        <h3 style="margin-top:12px">Queued from Hermes Opt-Out</h3>
        <div id="v-intake"></div>
      </div>

      <div class="glass span-12"><h2>Account Inventory (2FA &amp; >365d Rotation Hygiene)</h2>
        <form class="form" id="v-acct-form">
          <label class="f">Service<input name="service" required maxlength="80"></label>
          <label class="f">Email used<input name="email" maxlength="80"></label>
          <label class="f">2FA<select name="tfa"><option>on</option><option>off</option><option>unknown</option></select></label>
          <label class="f">Last rotated<input name="rotated" type="date"></label>
          <label class="f">Status<select name="status"><option>active</option><option>closing</option><option>closed</option></select></label>
          <button class="btn" type="submit">Add</button>
        </form>
        <div id="v-accts" style="margin-top:10px"></div>
      </div>

      <div class="glass span-12"><h2>Data Broker Ledger (40+ Brokers · 6-Mo Recheck)</h2><div id="v-brokers"></div>
        <form class="form" id="v-broker-form" style="margin-top:10px"><label class="f wide">Add broker / sender<input name="name" required maxlength="80"></label><button class="btn" type="submit">Add</button></form>
      </div>
    </section>`;

  function getIntake() {
    try { return JSON.parse(localStorage.getItem("prometheus.privacy.intake") || "[]"); } catch (_) { return []; }
  }
  function saveIntake(arr) {
    try { localStorage.setItem("prometheus.privacy.intake", JSON.stringify(arr)); } catch (_) {}
  }

  function paint() {
    const today = day();
    const d = S.get("drop", { status: "not submitted", submitted: "", checked: "" });
    let clockStr = "";
    if (d.submitted && window.PB) {
      const target45 = PB.addDays(d.submitted, 45);
      const rem = daysBetween(today, target45);
      clockStr = `<div class="kv"><span>45-Day Statutory Window</span><b>${rem >= 0 ? `${rem} days left (${target45})` : `Window passed (${target45})`}</b></div>`;
      PB.deadlines.publish({ title: "CA DROP 45-day check", date: target45, source: "privacy", kind: "drop", ref: "ca-drop-45" });
    }
    $("#v-drop").innerHTML = `<div class="kv"><span>Status</span><b>${esc(d.status)}</b></div>`
      + (d.submitted ? `<div class="kv"><span>Submitted</span><b>${d.submitted}</b></div>` : "")
      + clockStr
      + (d.checked ? `<div class="kv"><span>Last checked</span><b>${d.checked}</b></div>` : "");

    const f = $("#v-drop-form");
    f.status.value = d.status; f.submitted.value = d.submitted || ""; f.checked.value = d.checked || "";

    // S24 Ultra checklist
    const s24 = S.get("s24", {});
    $("#v-s24").innerHTML = "";
    S24_CHECKS.forEach((c) => {
      $("#v-s24").append(h("label.check", null,
        h("input", { type: "checkbox", ...(s24[c] ? { checked: "" } : {}), onchange: (ev) => { const m = S.get("s24", {}); m[c] = ev.target.checked; S.set("s24", m); } }),
        " ", c
      ));
    });

    // Hermes Intake Queue
    const intake = getIntake();
    $("#v-intake").innerHTML = "";
    if (!intake.length) $("#v-intake").append(h("p.empty", null, "No unsubscribe requests queued from Hermes yet."));
    intake.forEach((q) => {
      $("#v-intake").append(h("div.kv", null,
        h("span", null, h("b", null, q.sender), h("span.stat-s", null, ` (${q.box || "mail"})`)),
        h("span", null,
          h("button.btn.quiet.small", {
            type: "button",
            onclick: () => {
              const bs = S.get("brokers", []);
              if (!bs.some((b) => b.name.toLowerCase() === q.sender.toLowerCase())) {
                bs.unshift({ id: Math.random().toString(36).slice(2, 8), name: q.sender, state: "opt-out sent", recheck: window.PB ? PB.addDays(day(), 30) : null });
                S.set("brokers", bs);
              }
              saveIntake(intake.filter((x) => x.id !== q.id));
              toast("Moved to broker ledger"); paint();
            },
          }, "Add to ledger"), " ",
          h("button.btn.quiet.small", { type: "button", onclick: () => { saveIntake(intake.filter((x) => x.id !== q.id)); paint(); } }, "Dismiss")
        )
      ));
    });

    // Accounts (>365d rotation stale check)
    const accts = S.list("accounts");
    $("#v-accts").innerHTML = accts.map((a) => {
      const age = a.rotated ? daysBetween(a.rotated, today) : null;
      const stale = a.status === "active" && age != null && age > 365;
      return `<div class="kv"><span><b>${esc(a.service)}</b> · ${esc(a.email || "")}${stale ? ' <span class="pill over">Rotate (&gt;365d)</span>' : ""}${a.tfa === "off" ? ' <span class="pill soon">No 2FA</span>' : ""}</span><b>2FA ${esc(a.tfa)} · ${esc(a.status)}</b></div>`;
    }).join("") || `<p class="empty">No accounts inventoried yet.</p>`;

    // Brokers
    const brokers = S.get("brokers", []);
    $("#v-brokers").innerHTML = "";
    for (const b of brokers) {
      $("#v-brokers").append(h("div.kv", null,
        h("span", null, `${b.name} `, h("span.pill", null, b.state),
          (window.BROKER_OPTOUTS && window.BROKER_OPTOUTS[b.name]) ? h("a", { href: window.BROKER_OPTOUTS[b.name], target: "_blank", rel: "noopener", class: "stat-s" }, " opt out ↗") : null,
          b.recheck ? h("span.stat-s", null, ` recheck ${b.recheck}`) : null),
        h("button.btn.quiet.small", {
          type: "button",
          onclick: () => {
            const i = STATES.indexOf(b.state);
            b.state = STATES[(i + 1) % STATES.length];
            if (b.state === "confirmed removed" && window.PB) {
              b.recheck = PB.addDays(day(), 182);
              PB.deadlines.publish({ title: "Recheck broker removal: " + b.name, date: b.recheck, source: "privacy", kind: "recheck", ref: b.id });
            }
            S.set("brokers", brokers); paint();
          },
        }, "Advance")
      ));
    }
  }

  $("#v-drop-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.set("drop", { status: f.status.value, submitted: f.submitted.value, checked: f.checked.value }); toast("DROP status saved"); paint(); });
  $("#v-broker-form").addEventListener("submit", (e) => { e.preventDefault(); const bs = S.get("brokers", []); bs.push({ id: Math.random().toString(36).slice(2, 8), name: e.target.name.value.trim(), state: "not started", recheck: null }); S.set("brokers", bs); e.target.reset(); paint(); });
  $("#v-acct-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("accounts", { service: f.service.value.trim(), email: f.email.value.trim(), tfa: f.tfa.value, rotated: f.rotated.value, status: f.status.value }); f.reset(); paint(); });
  $("#export").onclick = () => download(`privacy_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const fl = await pickFile(); if (!fl) return; try { S.load(JSON.parse(await fl.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
