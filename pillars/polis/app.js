/* Polis · Civic & Legal Watch (Kern County / the mountain community / CA protections). window.POLIS = { DIRECTORY, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("polis"), app = $("#app");

  const DIRECTORY = [
    { id: "kern-bldg", level: "County", agency: "Kern County Building & Safety", scope: "Residential permits, electrical/structural inspections, Hearth rehab compliance", contact: "(661) 862-8650 · kernpublicworks.com" },
    { id: "kern-assessor", level: "County", agency: "Kern County Assessor-Recorder", scope: "Property tax rolls, Prop 19 / exemptions, recorded deeds & parcel maps", contact: "(661) 868-3485 · assessor.kerncounty.com" },
    { id: "kcfd-57", level: "Local", agency: "Kern County Fire Station 57", scope: "PRC 4291 100-ft defensible space inspections & hazard abatement", contact: "(661) 245-3706 · 1420 Mt Pinos Way" },
    { id: "fppud", level: "Local", agency: "local public utility district", scope: "Mountain community water service, meter & boil/conservation advisories", contact: "(661) 245-3734 · 4020 Park Dr" },
    { id: "kern-elections", level: "County", agency: "Kern County Elections & Voter Lookup", scope: "Registration verification, vote-by-mail tracking, local district ballots", contact: "(661) 868-3590 · kernvote.com" },
    { id: "ca-cslb", level: "State", agency: "CA Contractors State License Board (CSLB)", scope: "License bond and workers' comp verification before hiring contractors over 500 dollars", contact: "(800) 321-2752 · cslb.ca.gov" },
    { id: "ca-drop", level: "State", agency: "CA Privacy Protection Agency · DROP", scope: "California Delete Act data-broker mass opt-out compliance watch", contact: "cppa.ca.gov · coordinate with Privacy pillar" },
  ];

  const SEED_WATCHES = [
    { id: "pw-1", jurisdiction: "Local", title: "PRC 4291 100-ft Defensible Space Inspection Window", rule: "Clear dead brush within 30 ft and thin fuels to 100 ft ahead of June inspection", due: "2027-05-15", status: "watching" },
    { id: "pw-2", jurisdiction: "County", title: "Kern County Property Tax Installment Check", rule: "Verify installment schedule in Records pillar (Dec 10 / Apr 10 delinquency cutoffs)", due: "2026-12-10", status: "action-needed" },
    { id: "pw-3", jurisdiction: "State", title: "CSLB Contractor License & Bond Check (Hearth Phase Gate)", rule: "Verify active Class B / C license & workers' comp on cslb.ca.gov before deposits > 10%", due: "", status: "watching" },
  ];

  if (!S.get("seededV1", false) && !S.list("watches").length) {
    S.set("watches", SEED_WATCHES);
    S.set("seededV1", true);
  }

  window.POLIS = {
    DIRECTORY,
    data: () => ({
      watches: S.list("watches"),
      notes: S.list("notes"),
      directory: DIRECTORY,
    }),
  };

  let tab = "watches";
  app.innerHTML = `
    <div class="tabs" role="tablist" aria-label="Polis views">
      <button class="tab" type="button" role="tab" data-tab="watches" aria-selected="true">Ordinances &amp; Protections</button>
      <button class="tab" type="button" role="tab" data-tab="ballot" aria-selected="false">Ballot &amp; Policy Notes</button>
      <button class="tab" type="button" role="tab" data-tab="dir" aria-selected="false">Civic Directory</button>
    </div>
    <section id="po-pane-watches" class="grid">
      <div class="glass span-6">
        <h2>Add Permit, Rule or Consumer Watch</h2>
        <form class="form" id="po-wform">
          <label class="f">Jurisdiction<select name="jurisdiction"><option>Local</option><option>County</option><option>State</option><option>Federal</option></select></label>
          <label class="f wide">Title<input name="title" required maxlength="120" placeholder="Permit check, HOA/CC&amp;R rule, lemon-law / CSLB note..."></label>
          <label class="f">Due / Hearing Date<input name="due" type="date"></label>
          <label class="f wide">Rule / Action Summary<input name="rule" maxlength="200" placeholder="Statutory threshold, inspection item, or protection rule"></label>
          <button class="btn" type="submit">Track Rule</button>
        </form>
      </div>
      <div class="glass lit span-6">
        <h2>Jurisdiction &amp; Urgency Matrix</h2>
        <p class="sub">Distribution across Local, County, State, and Federal watches highlighting urgent action items.</p>
        <canvas id="po-chart" style="width:100%;height:190px;display:block;margin-top:8px"></canvas>
      </div>
      <div class="glass span-12">
        <h2>Active Civic &amp; Statutory Watchlist</h2>
        <div id="po-watches" style="margin-top:8px"></div>
      </div>
    </section>
    <section id="po-pane-ballot" class="grid" hidden>
      <div class="glass span-12">
        <h2>Ballot Measures &amp; Public Hearing Notebook</h2>
        <p class="sub">Separate verified statutory/text facts from open research questions.</p>
        <form class="form" id="po-nform">
          <label class="f">Measure / Topic<input name="topic" required maxlength="80" placeholder="Kern Bond, CA Prop, FPPUD Rate Hearing..."></label>
          <label class="f">Classification<select name="kind"><option value="verified-fact">Verified Fact</option><option value="fiscal-impact">Fiscal Impact</option><option value="open-question">Open Question</option></select></label>
          <label class="f wide">Note<input name="text" required maxlength="240" placeholder="Key language, effective date, or fiscal summary"></label>
          <button class="btn" type="submit">Keep Note</button>
        </form>
        <div id="po-notes" style="margin-top:12px"></div>
      </div>
    </section>
    <section id="po-pane-dir" class="grid" hidden>
      <div class="glass span-12">
        <h2>Local, county, and state directory</h2>
        <div id="po-dir"></div>
      </div>
    </section>`;

  function switchTab(next) {
    tab = next;
    app.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === next)));
    ["watches", "ballot", "dir"].forEach((k) => { $("#po-pane-" + k).hidden = k !== next; });
  }
  app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  function emitStore() {
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "polis", k: "watches" } }));
  }

  const NEXT_STATUS = { watching: "action-needed", "action-needed": "resolved", resolved: "watching" };
  const PILL = { watching: "pill", "action-needed": "pill hot", resolved: "pill good" };

  function paint() {
    const D = window.POLIS.data();
    const cv = document.getElementById("po-chart");
    if (cv) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(220, cv.clientWidth || 420), H = cv.clientHeight || 190;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const lvls = ["Local", "County", "State", "Federal"];
      const counts = lvls.map((l) => {
        const sub = D.watches.filter((w) => (w.jurisdiction || "Local") === l);
        return { l, total: sub.length, urgent: sub.filter((w) => w.status === "action-needed").length };
      });
      const maxC = Math.max(2, ...counts.map((c) => c.total));
      counts.forEach((c, idx) => {
        const y = 26 + idx * 38, bw = (W - 140) * (c.total / maxC), uw = (W - 140) * (c.urgent / maxC);
        g.font = "12px system-ui, sans-serif"; g.fillStyle = "#eef4ff"; g.fillText(`${c.l} (${c.total})`, 10, y + 14);
        g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(105, y, W - 125, 20);
        g.fillStyle = "#ffd43b"; g.fillRect(105, y, bw, 20);
        if (uw > 0) { g.fillStyle = "#ff6b6b"; g.fillRect(105, y, uw, 20); }
      });
      g.font = "10px system-ui, sans-serif"; g.fillStyle = "#ffd43b"; g.fillText("Total Watched", 105, 14);
      g.fillStyle = "#ff6b6b"; g.fillText("Action Needed", 205, 14);
    }
    const watches = [...D.watches].sort((a, b) => (a.status === "action-needed" ? 0 : 1) - (b.status === "action-needed" ? 0 : 1));
    $("#po-watches").replaceChildren(...(watches.length ? watches.map((w) => h("div.kv", null,
      h("span", null, h("b", null, w.title), " ", h("span." + (PILL[w.status] || "pill"), null, w.status), h("br"),
        h("span.stat-s", null, `${w.jurisdiction}${w.due ? " · due " + w.due : ""}${w.rule ? " · " + w.rule : ""}`)),
      h("span", { style: "display:flex;gap:6px;flex-wrap:wrap" },
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("watches", w.id, { status: NEXT_STATUS[w.status] || "watching" }); paint(); emitStore(); } }, "Cycle State"),
        w.due ? h("button.btn.quiet.small", { type: "button", onclick: () => { if (window.PB) PB.deadlines.publish({ title: `Polis: ${w.title}`, date: w.due, source: "polis", kind: "civic", ref: w.id }); toast("Published to shared calendar"); } }, "Calendar") : null,
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("watches", w.id); if (window.PB) PB.deadlines.unpublish("polis", w.id); paint(); emitStore(); } }, "Remove"))
    )) : [h("p.empty", null, "No civic or legal watches tracked yet.")]));

    const notes = [...D.notes].sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    $("#po-notes").replaceChildren(...(notes.length ? notes.map((n) => h("div.kv", null,
      h("span", null, h("b", null, n.topic), " ", h("span.pill", null, n.kind), h("br"), h("span.stat-s", null, n.text)),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("notes", n.id); paint(); emitStore(); } }, "Remove")
    )) : [h("p.empty", null, "No ballot or policy research notes yet.")]));

    $("#po-dir").replaceChildren(...D.directory.map((d) => h("div.kv", null,
      h("span", null, h("b", null, d.agency), " ", h("span.pill", null, d.level), h("br"), h("span.stat-s", null, `${d.scope} · ${d.contact}`)),
      h("button.btn.quiet.small", { type: "button", onclick: () => {
        S.add("watches", { jurisdiction: d.level, title: `Check ${d.agency}`, rule: d.scope, due: "", status: "watching" });
        toast(`Added ${d.agency} to watchlist`);
        switchTab("watches");
        paint();
        emitStore();
      } }, "Watch")
    )));
  }

  $("#po-wform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const w = S.add("watches", { jurisdiction: f.jurisdiction.value, title: f.title.value.trim(), due: f.due.value, rule: f.rule.value.trim(), status: "watching" });
    if (w.due && window.PB && PB.deadlines) PB.deadlines.publish({ title: `Polis: ${w.title}`, date: w.due, source: "polis", kind: "civic", ref: w.id });
    f.reset();
    toast("Civic watch saved");
    paint();
    emitStore();
  });

  $("#po-nform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    S.add("notes", { topic: f.topic.value.trim(), kind: f.kind.value, text: f.text.value.trim(), at: day() });
    f.reset();
    toast("Note kept");
    paint();
    emitStore();
  });

  $("#export").onclick = () => download(`polis_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); emitStore(); } catch (e) { toast(e.message); } };

  paint();
})();
