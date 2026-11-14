/* Mythos · Creative & Lore Studio (Worldbuilding, Story Arcs, Guitar/Lyric Notebooks, Sylade Lore).
   window.MYTHOS = { ARCS, KINDS, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("mythos"), app = $("#app");

  const ARCS = ["Spark", "Threshold", "Ordeal", "Revelation", "Return"];
  const KINDS = ["World / Setting", "Character / Archetype", "Faction / Order", "Sylade Lore", "Guitar / Lyric Notebook", "Essay / Draft"];

  /* Canon-wall presentation helpers (design pass, 2026-11-14): kind accents come from kit
     tokens only; rich() styles the verbatim "..." runs inside a body without altering a
     single character of the text. */
  const KIND_CLASS = { "World / Setting": "k-world", "Character / Archetype": "k-character", "Faction / Order": "k-faction", "Sylade Lore": "k-lore", "Guitar / Lyric Notebook": "k-guitar", "Essay / Draft": "k-essay" };
  const KIND_HEX = { "World / Setting": "#9fd4e6", "Character / Archetype": "#c9b8ea", "Faction / Order": "#748ffc", "Sylade Lore": "#e599f7", "Guitar / Lyric Notebook": "#e7c4d8", "Essay / Draft": "#f4f7fb" };
  function kindClass(k) { return KIND_CLASS[k] || "k-essay"; }
  const ROMAN_TXT = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  const ARC_X = [40, 180, 320, 460, 600], ARC_Y = [150, 88, 38, 88, 150];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function parseDay(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "")); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function rich(text) {
    return String(text || "").split(/"([^"]*)"/g).map((part, i) => (i % 2 ? h("span.q", null, '"' + part + '"') : part)).filter((x) => x !== "");
  }

  /* Real canon seed (Sebastian, 2026-11-14): the pillar originally seeded INVENTED lore
     (my-1/my-2, mb-1/mb-2). canonSeedV2 removes exactly those invented ids wherever they
     sit and merges in Joseph's real creative canon (canon-data.js) by id — user-added
     entries, beats and edits are never touched, and deletions stick. */
  if (!S.get("canonSeedV2", false)) {
    const INVENTED_E = ["my-1", "my-2"], INVENTED_B = ["mb-1", "mb-2"];
    const CANON = window.MYTHOS_CANON || { entries: [], beats: [] };
    const es = S.list("entries").filter((e) => !INVENTED_E.includes(e.id));
    for (const c of CANON.entries) if (!es.some((e) => e.id === c.id)) es.push({ ...c });
    S.set("entries", es);
    const bs = S.list("beats").filter((b) => !INVENTED_B.includes(b.id));
    for (const c of CANON.beats) if (!bs.some((b) => b.id === c.id)) bs.push({ ...c });
    S.set("beats", bs);
    S.set("seededV1", true);
    S.set("canonSeedV2", true);
  }

  /* canonSeedV3 (Sebastian, 2026-11-14, at Joseph's direction: "Delete xien"): removes the
     myth-xien entry and the myth-b1 beat wherever V2 seeded them, and refreshes the shipped
     myth-shattermind entry — its body named her — to the current shipped text. */
  if (!S.get("canonSeedV3", false)) {
    const es3 = S.list("entries").filter((e) => e.id !== "myth-xien");
    const sm3 = ((window.MYTHOS_CANON || {}).entries || []).find((c) => c.id === "myth-shattermind");
    const ix3 = es3.findIndex((e) => e.id === "myth-shattermind");
    if (sm3 && ix3 >= 0) es3[ix3] = { ...sm3 };
    S.set("entries", es3);
    S.set("beats", S.list("beats").filter((b) => b.id !== "myth-b1"));
    S.set("canonSeedV3", true);
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
      <div class="glass lit span-12">
        <h2>The Canon Wall</h2>
        <p class="sub">His creative canon on one timeline — chapters in the order they were written, every quoted line his own words, traced to the dated thread named on its card.</p>
        <div class="my-legend">${KINDS.map((k) => `<span class="pill ${kindClass(k)}">${k}</span>`).join("")}</div>
        <div id="my-ath-row" style="margin-top:10px"></div>
        <div id="my-entries" class="my-wall"></div>
      </div>
      <div class="glass span-6">
        <h2>Write Lore, Essay or Draft</h2>
        <form class="form" id="my-eform">
          <label class="f">Category<select name="kind">${KINDS.map((k) => `<option>${k}</option>`).join("")}</select></label>
          <label class="f wide">Title<input name="title" required maxlength="120" placeholder="Character, realm, Sylade myth, or chapter title..."></label>
          <label class="f">Tag<input name="tag" maxlength="40" placeholder="canon, draft-1, folk..."></label>
          <label class="f wide">Body<textarea class="ta" name="body" required maxlength="2500" placeholder="Keep voice raw and vivid..."></textarea></label>
          <button class="btn" type="submit">Commit Entry</button>
        </form>
      </div>
      <div class="glass span-6">
        <h2>Lore &amp; Motif Relationship Constellation</h2>
        <p class="sub">Maps entries, story beats, and motifs with resonance links across shared tags and keywords.</p>
        <canvas id="my-graph" style="width:100%;height:260px;display:block;margin-top:8px"></canvas>
      </div>
    </section>
    <section id="my-pane-arcs" class="grid" hidden>
      <div class="glass lit span-12">
        <h2>Dramatic Arc &amp; Scene Beats</h2>
        <p class="sub">Five-movement narrative spine (${ARCS.join(" \u2192 ")}).</p>
        <div class="my-arcbox">
          <svg id="my-arc" viewBox="0 0 640 196" role="img" aria-label="Five-act story arc: Spark, Threshold, Ordeal, Revelation, Return">
            <defs>
              <linearGradient id="my-arc-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#9fd4e6"/><stop offset=".5" stop-color="#e599f7"/><stop offset="1" stop-color="#748ffc"/>
              </linearGradient>
            </defs>
            <path class="my-arc-path" d="M40,150 C150,146 190,50 320,38 C450,26 490,140 600,150" fill="none"/>
            ${ARCS.map((a, i) => `<g class="my-node a${i}"><circle cx="${ARC_X[i]}" cy="${ARC_Y[i]}" r="15"/><text class="my-node-n" x="${ARC_X[i]}" y="${ARC_Y[i] + 4}" text-anchor="middle">${ROMAN_TXT[i]}</text><text class="my-node-t" x="${ARC_X[i]}" y="${ARC_Y[i] + 34}" text-anchor="middle">${a}</text></g>`).join("")}
            <g id="my-arc-dots"></g>
          </svg>
        </div>
        <div id="my-beats" class="my-acts"></div>
      </div>
      <div class="glass span-12">
        <h2>Add a Beat</h2>
        <form class="form" id="my-bform">
          <label class="f">Movement<select name="arc">${ARCS.map((a, idx) => `<option value="${idx}">${idx + 1}. ${a}</option>`).join("")}</select></label>
          <label class="f wide">Scene Beat<input name="title" required maxlength="120" placeholder="What irreversible shift occurs in this scene?"></label>
          <label class="f wide">Summary<input name="summary" maxlength="220" placeholder="Stakes, sensory detail, or emotional turn"></label>
          <button class="btn" type="submit">Add Beat</button>
        </form>
      </div>
    </section>
    <section id="my-pane-motifs" class="grid" hidden>
      <div class="glass span-12">
        <h2>Guitar Tunings, Lyric Hooks &amp; Symbolic Motifs</h2>
        <form class="form" id="my-mform">
          <label class="f">Symbol / Chord / Key<input name="key" required maxlength="60" placeholder="DADGAD \u00b7 Em9, Silver Lantern..."></label>
          <label class="f wide">Fragment / Resonance<input name="note" required maxlength="220" placeholder="Stanza line, capo position, or recurring symbol across chapters"></label>
          <button class="btn" type="submit">Keep Motif</button>
        </form>
        <div id="my-motifs" class="my-motifgrid" style="margin-top:12px"></div>
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
    const cv = document.getElementById("my-graph");
    if (cv) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(240, cv.clientWidth || 440), H = cv.clientHeight || 260;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const all = [
        ...D.entries.map((e) => ({ label: e.title, text: (e.title + " " + e.tag + " " + e.body).toLowerCase(), col: KIND_HEX[e.kind] || "#e599f7" })),
        ...D.beats.map((b) => ({ label: b.title, text: (b.title + " " + (b.summary || "")).toLowerCase(), col: "#748ffc" })),
        ...D.motifs.map((m) => ({ label: m.key, text: (m.key + " " + m.note).toLowerCase(), col: "#ffd43b" }))
      ].slice(0, 14);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
      const pts = all.map((n, i) => {
        const a = -Math.PI / 2 + (i / Math.max(1, all.length)) * Math.PI * 2;
        return { ...n, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const wi = pts[i].text.split(/\W+/).filter((w) => w.length > 3);
          const shared = wi.some((w) => pts[j].text.includes(w));
          if (shared || (i + j) % 5 === 0) {
            g.strokeStyle = shared ? "rgba(229,153,247,0.45)" : "rgba(116,143,252,0.14)";
            g.lineWidth = shared ? 1.6 : 0.8;
            g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[j].x, pts[j].y); g.stroke();
          }
        }
      }
      g.font = "10.5px system-ui, sans-serif";
      pts.forEach((p) => {
        g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, 5, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#eef4ff"; g.fillText(p.label.slice(0, 18), Math.max(6, Math.min(W - 90, p.x - 24)), p.y - 9);
      });
    }
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

    const wall = [...D.entries].map((e, i) => ({ e, i, d: parseDay(e.updated) }))
      .sort((a, b) => (a.d && b.d ? a.d - b.d : a.d ? -1 : b.d ? 1 : a.i - b.i));
    const wallKids = [];
    if (!wall.length) wallKids.push(h("p.empty", null, "No lore or drafts yet."));
    let lastYear = null, chNum = 0;
    for (const { e, d } of wall) {
      const yr = d ? String(d.getFullYear()) : "Undated";
      if (yr !== lastYear) { wallKids.push(h("div.my-year", null, h("span", null, yr))); lastYear = yr; }
      chNum += 1;
      wallKids.push(h("article.my-card " + kindClass(e.kind), null,
        h("div.my-rail", null,
          h("span.my-md", null, d ? MONTHS[d.getMonth()] + " " + d.getDate() : "No date"),
          h("span.my-ch", null, "Chapter " + (ROMAN_TXT[chNum - 1] || chNum)),
          h("span.my-dot", null)),
        h("div.my-main", null,
          h("div.my-meta", null, h("span.pill " + kindClass(e.kind), null, e.kind), e.tag ? h("span.my-tag", null, e.tag) : null),
          h("h3.my-title", null, e.title),
          h("p.my-body", null, ...rich(e.body)),
          h("div.my-actions", null,
            h("button.btn.quiet.small", { type: "button", onclick: () => download(`${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`, `# ${e.title}\n_${e.kind} · ${e.updated || day()}_\n\n${e.body}\n`) }, ".md"),
            h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("entries", e.id); paint(); emitStore(); } }, "Delete")))));
    }
    $("#my-entries").replaceChildren(...wallKids);

    const byArc = ARCS.map(() => []);
    for (const b of [...D.beats].sort((a, b) => (+a.arc || 0) - (+b.arc || 0))) byArc[Math.min(ARCS.length - 1, Math.max(0, +b.arc || 0))].push(b);
    $("#my-beats").replaceChildren(...ARCS.map((name, ai) => h("div.my-act a" + ai, null,
      h("div.my-act-h", null, h("span.my-act-n", null, ROMAN_TXT[ai]), h("span.my-act-name", null, name), byArc[ai].length ? h("span.my-act-c", null, String(byArc[ai].length)) : null),
      ...(byArc[ai].length ? byArc[ai].map((b) => h("div.my-beat", null,
        h("b.my-beat-t", null, b.title),
        b.summary ? h("p.my-beat-s", null, ...rich(b.summary)) : null,
        h("span.my-beat-a", null,
          h("button.btn.quiet.small", { type: "button", disabled: b.arc >= ARCS.length - 1, onclick: () => { S.update("beats", b.id, { arc: b.arc + 1 }); paint(); emitStore(); } }, "Next Act →"),
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("beats", b.id); paint(); emitStore(); } }, "Remove"))))
        : [h("p.my-act-empty", null, "No beats yet")]))));
    const dotsG = document.getElementById("my-arc-dots");
    if (dotsG) {
      const NS = "http://www.w3.org/2000/svg";
      dotsG.replaceChildren();
      byArc.forEach((list, ai) => list.forEach((b, j) => {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", String(ARC_X[ai] + (j - (list.length - 1) / 2) * 13));
        c.setAttribute("cy", String(ARC_Y[ai] - 26));
        c.setAttribute("r", "3.5");
        c.setAttribute("class", "my-dot-c");
        dotsG.appendChild(c);
      }));
    }

    $("#my-motifs").replaceChildren(...(D.motifs.length ? [...D.motifs].reverse().map((m) => h("div.my-motif", null,
      h("b.my-motif-k", null, m.key),
      h("p.my-motif-n", null, m.note),
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
