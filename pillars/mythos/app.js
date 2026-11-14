/* Mythos · Creative & Lore Studio (Worldbuilding, Story Arcs, Guitar/Lyric Notebooks, Sylade Lore).
   window.MYTHOS = { ARCS, KINDS, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("mythos"), app = $("#app");

  const ARCS = ["Spark", "Threshold", "Ordeal", "Revelation", "Return"];
  const KINDS = ["World / Setting", "Character / Archetype", "Faction / Order", "Sylade Lore", "Guitar / Lyric Notebook", "Essay / Draft"];

  if (!S.get("seededV1", false) && !S.list("entries").length) {
    S.set("entries", [
      { id: "my-1", kind: "Sylade Lore", title: "Sylade · Starlight Sanctuary Boundary", body: "Public companion presence remains untouched by engineering chaos; origin folklore & visual symbolism grow here in Mythos.", tag: "canon", updated: day() },
      { id: "my-2", kind: "World / Setting", title: "Frazier Elevation Observatory", body: "High-pine ridge station above the Tejon fault line where cold winter air sharpens constellations and analog notebooks outlast networks.", tag: "setting", updated: day() },
    ]);
    S.set("beats", [
      { id: "mb-1", arc: 0, title: "Ignition above the Valley", summary: "Ordinary craft interrupted by a signal across empty spectrum.", seq: 1 },
      { id: "mb-2", arc: 1, title: "Crossing the Pine Pass", summary: "Leaving familiar dependencies behind with only local notebooks and instruments.", seq: 2 },
    ]);
    S.set("seededV1", true);
  }

  const readAthenaeum = () => {
    try { return JSON.parse(localStorage.getItem("prometheus.athenaeum.ideas") || "[]").filter((x) => !x.archived); } catch (e) { return []; }
  };

  window.MYTHOS = {
    ARCS,
    KINDS,
    data: () => ({
      entries: S.list("entries"),
      beats: S.list("beats"),
      motifs: S.list("motifs"),
    }),
  };

  let tab = "lore";
  app.innerHTML = `
    <div class="tabs" role="tablist" aria-label="Mythos views">
      <button class="tab" type="button" role="tab" data-tab="lore" aria-selected="true">Lore &amp; Drafts</button>
      <button class="tab" type="button" role="tab" data-tab="arcs" aria-selected="false">Story Arc Board</button>
      <button class="tab" type="button" role="tab" data-tab="motifs" aria-selected="false">Guitar, Lyrics &amp; Motifs</button>
    </div>
    <section id="my-pane-lore" class="grid">
      <div class="glass span-12">
        <h2>Write Lore, Essay or Draft</h2>
        <form class="form" id="my-eform">
          <label class="f">Category<select name="kind">${KINDS.map((k) => `<option>${k}</option>`).join("")}</select></label>
          <label class="f wide">Title<input name="title" required maxlength="120" placeholder="Character, realm, Sylade myth, or chapter title..."></label>
          <label class="f">Tag<input name="tag" maxlength="40" placeholder="canon, draft-1, folk..."></label>
          <label class="f wide">Body<textarea class="ta" name="body" required maxlength="2500" placeholder="Keep voice raw and vivid..."></textarea></label>
          <button class="btn" type="submit">Commit Entry</button>
        </form>
        <div id="my-ath-row" style="margin-top:12px"></div>
        <div id="my-entries" style="margin-top:12px"></div>
      </div>
    </section>
    <section id="my-pane-arcs" class="grid" hidden>
      <div class="glass span-12">
        <h2>Dramatic Arc &amp; Scene Beats</h2>
        <p class="sub">Five-movement narrative spine (${ARCS.join(" → ")}).</p>
        <form class="form" id="my-bform">
          <label class="f">Movement<select name="arc">${ARCS.map((a, idx) => `<option value="${idx}">${idx + 1}. ${a}</option>`).join("")}</select></label>
          <label class="f wide">Scene Beat<input name="title" required maxlength="120" placeholder="What irreversible shift occurs in this scene?"></label>
          <label class="f wide">Summary<input name="summary" maxlength="220" placeholder="Stakes, sensory detail, or emotional turn"></label>
          <button class="btn" type="submit">Add Beat</button>
        </form>
        <div id="my-beats" style="margin-top:12px"></div>
      </div>
    </section>
    <section id="my-pane-motifs" class="grid" hidden>
      <div class="glass span-12">
        <h2>Guitar Tunings, Lyric Hooks &amp; Symbolic Motifs</h2>
        <form class="form" id="my-mform">
          <label class="f">Symbol / Chord / Key<input name="key" required maxlength="60" placeholder="DADGAD · Em9, Silver Lantern..."></label>
          <label class="f wide">Fragment / Resonance<input name="note" required maxlength="220" placeholder="Stanza line, capo position, or recurring symbol across chapters"></label>
          <button class="btn" type="submit">Keep Motif</button>
        </form>
        <div id="my-motifs" style="margin-top:12px"></div>
      </div>
    </section>`;

  function switchTab(next) {
    tab = next;
    app.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === next)));
    ["lore", "arcs", "motifs"].forEach((k) => { $("#my-pane-" + k).hidden = k !== next; });
  }
  app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  function emitStore() {
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "mythos", k: "entries" } }));
  }

  function paint() {
    const D = window.MYTHOS.data();
    const ideas = readAthenaeum().slice(0, 12);
    if (ideas.length) {
      const sel = h("select", { "aria-label": "Import Athenaeum idea" }, ...ideas.map((i) => h("option", { value: i.id }, i.title.slice(0, 64))));
      $("#my-ath-row").replaceChildren(h("div.kv", null,
        h("span.stat-s", null, "Seed from Athenaeum without altering it:"),
        h("span", { style: "display:flex;gap:8px;flex-wrap:wrap" }, sel, h("button.btn.quiet.small", { type: "button", onclick: () => {
          const hit = ideas.find((i) => i.id === sel.value);
          if (!hit) return;
          S.add("entries", { kind: "Essay / Draft", title: hit.title, body: hit.body || "", tag: "from-athenaeum", updated: day() });
          toast("Imported into Mythos draft");
          paint();
          emitStore();
        } }, "Copy to Mythos"))
      ));
    } else {
      $("#my-ath-row").replaceChildren();
    }

    $("#my-entries").replaceChildren(...(D.entries.length ? [...D.entries].reverse().map((e) => h("div.kv", null,
      h("span", { style: "flex:1;min-width:200px" }, h("b", null, e.title), " ", h("span.pill", null, e.kind), e.tag ? " " + e.tag : "", h("br"), h("span.stat-s", null, e.body)),
      h("span", { style: "display:flex;gap:6px" },
        h("button.btn.quiet.small", { type: "button", onclick: () => download(`${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`, `# ${e.title}\n_${e.kind} · ${e.updated || day()}_\n\n${e.body}\n`) }, ".md"),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("entries", e.id); paint(); emitStore(); } }, "Delete"))
    )) : [h("p.empty", null, "No lore or drafts yet.")]));

    const beats = [...D.beats].sort((a, b) => (+a.arc || 0) - (+b.arc || 0));
    $("#my-beats").replaceChildren(...(beats.length ? beats.map((b) => h("div.kv", null,
      h("span", null, h("span.pill", null, ARCS[b.arc] || "Spark"), " ", h("b", null, b.title), b.summary ? h("br") : null, b.summary ? h("span.stat-s", null, b.summary) : null),
      h("span", { style: "display:flex;gap:6px" },
        h("button.btn.quiet.small", { type: "button", disabled: b.arc >= ARCS.length - 1, onclick: () => { S.update("beats", b.id, { arc: b.arc + 1 }); paint(); emitStore(); } }, "Next Act →"),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("beats", b.id); paint(); emitStore(); } }, "Remove"))
    )) : [h("p.empty", null, "No dramatic beats mapped yet.")]));

    $("#my-motifs").replaceChildren(...(D.motifs.length ? [...D.motifs].reverse().map((m) => h("div.kv", null,
      h("span", null, h("b", null, m.key), h("br"), h("span.stat-s", null, m.note)),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("motifs", m.id); paint(); emitStore(); } }, "Remove")
    )) : [h("p.empty", null, "No guitar tunings, lyrics or motifs captured yet.")]));
  }

  $("#my-eform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    S.add("entries", { kind: f.kind.value, title: f.title.value.trim(), tag: f.tag.value.trim(), body: f.body.value.trim(), updated: day() });
    if (window.PB && PB.events) PB.events.publish({ type: "mythos.entry", pillar: "mythos", title: f.title.value.trim() });
    f.reset();
    toast("Entry committed");
    paint();
    emitStore();
  });

  $("#my-bform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    S.add("beats", { arc: +f.arc.value || 0, title: f.title.value.trim(), summary: f.summary.value.trim() });
    f.reset();
    toast("Beat added");
    paint();
    emitStore();
  });

  $("#my-mform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    S.add("motifs", { key: f.key.value.trim(), note: f.note.value.trim() });
    f.reset();
    toast("Motif saved");
    paint();
    emitStore();
  });

  $("#export").onclick = () => download(`mythos_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); emitStore(); } catch (e) { toast(e.message); } };

  paint();
})();
