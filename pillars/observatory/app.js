/* Observatory (Claude, 2026-11-13): the subjects your ideas keep returning to, and what is happening in them. Subjects start from the
   commonest tags in Athenaeum; you can add or drop any. Headlines arrive only when you press Scan: each subject word is sent to the
   public Hacker News search (hn.algolia.com) and nothing else leaves the device. Every headline is marked unverified; your own notes
   are kept apart and marked verified, opinion or question. Subjects ship seeded from the Athenaeum canon
   (subjects-seed.js: the real tag clusters with counts, spans, and the strongest thread's own words), so the dome
   stands on its own; Scan still refreshes signals on top. window.OBSERVATORY = { data, scan, classifySignal, filterView }
   Design (Sebastian, 2026-11-14): the pillar reads as an instrument in two layers — the CANON layer (the Dome
   constellation chart + subject readouts, derived from Athenaeum, stored on-device) and the LIVE SKY (the HN
   scan feed, external and unverified), visually distinct. Subject colors match stage.js so page and dome agree.
   Presentation only: every DOM id, store key, and the API above are unchanged. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("observatory"), app = $("#app"), SKIP = new Set(["ideas", "worldview", "philosophy", "software", "systems", "method", "frameworks", "meta", "legacy", "writing", "manifesto"]);
  const API = new URLSearchParams(location.search).get("hn") || "https://hn.algolia.com/api/v1/search_by_date";
  const SCAN_TIMEOUT_MS = 8000;
  const fromIdeas = () => { let l = []; try { l = JSON.parse(localStorage.getItem("prometheus.athenaeum.ideas") || "[]"); } catch (e) { l = []; } if (!l.length) l = window.ATHENAEUM_IDEAS || [];
    const tally = new Map(); for (const i of l) for (const t of new Set((i.tags || []).map((x) => String(x).toLowerCase().trim()))) if (t && !SKIP.has(t)) tally.set(t, (tally.get(t) || 0) + 1);
    return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => ({ id: "t-" + t, name: t.replace(/-/g, " ").replace(/\bai\b/g, "AI"), q: t.replace(/-/g, " "), ideas: n, from: "athenaeum" })); };
  const subjects = () => S.get("subjects", null) || fromIdeas();
  const signals = () => S.get("signals", []);

  /* Seed-once (Sebastian, 2026-11-14): the shipped canon subjects land in an empty subjects store exactly once.
     A stored list — seeded, derived-and-edited, or hand-built — is never overwritten, and dropping every
     subject sticks (the flag stays set). Guarded so harnesses without the seed file behave as before. */
  const OBS_SEED = (typeof window !== "undefined" && window.OBSERVATORY_SUBJECTS) || (typeof globalThis !== "undefined" && globalThis.OBSERVATORY_SUBJECTS) || null;
  if (Array.isArray(OBS_SEED) && OBS_SEED.length && !S.get("subjectsSeedV1")) {
    if (!S.get("subjects", null)) S.set("subjects", OBS_SEED.map((s) => ({ ...s })));
    S.set("subjectsSeedV1", 1);
  }

  let st = "idle";
  let lastError = "";
  let filterMode = "all";

  function classifySignal(item) {
    if (!item || typeof item !== "object") return "unverified-signal";
    const k = String(item.kind || "").toLowerCase().trim();
    if (k === "verified" || k === "verified-fact" || item.verified === true) return "verified-fact";
    if (k === "opinion") return "opinion";
    if (k === "question" || k === "open-question") return "question";
    return "unverified-signal";
  }

  function normalizeFilter(mode) {
    const m = String(mode || "all").toLowerCase().trim();
    if (m === "unverified" || m === "unverified-signals" || m === "unverified-signal" || m === "signals") return "unverified";
    if (m === "verified" || m === "verified-notes" || m === "verified-fact" || m === "notes") return "verified";
    return "all";
  }

  function getFiltered() {
    const allSig = signals();
    const allNotes = S.list("notes").sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    if (filterMode === "unverified") {
      return { mode: filterMode, signals: allSig.filter((x) => classifySignal(x) === "unverified-signal"), notes: [] };
    }
    if (filterMode === "verified") {
      return { mode: filterMode, signals: allSig.filter((x) => classifySignal(x) === "verified-fact"), notes: allNotes.filter((n) => classifySignal(n) === "verified-fact") };
    }
    return { mode: filterMode, signals: allSig, notes: allNotes };
  }

  function filterView(mode) {
    if (mode !== undefined) {
      filterMode = normalizeFilter(mode);
      paint();
    }
    return getFiltered();
  }

  const API_OBJ = {
    data: () => ({ subjects: subjects(), signals: signals(), notes: S.list("notes"), scanned: S.get("scanned", null), state: st, error: lastError || null, filter: filterMode }),
    scan,
    classifySignal,
    filterView,
  };
  if (typeof window !== "undefined") window.OBSERVATORY = API_OBJ;
  if (typeof globalThis !== "undefined") globalThis.OBSERVATORY = API_OBJ;

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12 o-dome"><h2>The Dome · Canon</h2>
        <p class="note">Your canon, charted as a sky. Each star is a subject your ideas keep returning to — its size is the idea count, its label the span those ideas cover. This layer is derived from your Athenaeum canon and stored on this device; the live sky below is separate.</p>
        <div id="o-chart" role="img" aria-label="Constellation chart of your canon subjects, sized by idea count and labeled with their spans"></div>
        <p class="stat-s o-chart-cap" id="o-chart-cap"></p></div>
      <div class="glass span-12"><h2>Subjects · Canon readouts</h2><div id="o-subjects"></div>
        <form class="form" id="o-add"><label class="f wide">Add a subject<input name="name" required maxlength="60" placeholder="battery chemistry, desalination…"></label><button class="btn quiet" type="submit">Watch it</button></form></div>
      <div class="glass span-12 o-live"><h2>Live Sky · Signals</h2>
        <div class="o-livebar"><span class="o-pulse" aria-hidden="true"></span><span>Live sky — external feed</span><span class="o-live-src">hn.algolia.com</span></div>
        <p class="sub" id="o-state"></p><button class="btn" id="o-scan" type="button">Scan now</button>
        <p class="note" style="margin-top:8px">Scanning sends each subject's words to the public Hacker News search at hn.algolia.com. Nothing else leaves this device. Headlines are other people's claims: unverified until you note them.</p>
        <div id="o-filter" class="row-actions" role="group" aria-label="Filter signals and notes" style="margin:10px 0 8px"><button class="btn small" data-filter="all" type="button" aria-pressed="true">All</button><button class="btn quiet small" data-filter="unverified" type="button" aria-pressed="false">Unverified Signals</button><button class="btn quiet small" data-filter="verified" type="button" aria-pressed="false">Verified Notes</button></div>
        <div id="o-signals"></div></div>
      <div class="glass span-12"><h2>Your observations</h2>
        <form class="form" id="o-note"><label class="f">Subject<select name="subject"></select></label><label class="f">Kind<select name="kind"><option value="verified">verified fact</option><option value="opinion">opinion</option><option value="question">open question</option></select></label>
          <label class="f wide">The note<input name="text" required maxlength="240"></label><label class="f wide">Source link<input name="url" type="url" maxlength="300" placeholder="https://…"></label><button class="btn" type="submit">Keep it</button></form><div id="o-notes"></div></div>
    </section>`;

  async function fetchSubjectSignals(s, timeoutMs) {
    const ac = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ac ? setTimeout(() => ac.abort(), timeoutMs) : null;
    try {
      const url = `${API}?query=${encodeURIComponent(s.q || s.name)}&tags=story&hitsPerPage=6`;
      const r = await fetch(url, ac ? { signal: ac.signal } : undefined);
      if (!r || !r.ok) throw new Error(`HTTP ${r ? r.status : "error"}`);
      const ct = r.headers && typeof r.headers.get === "function" ? String(r.headers.get("content-type") || "") : "";
      if (ct && /html/i.test(ct) && !/json/i.test(ct)) throw new Error("Unexpected HTML response");
      const j = typeof r.json === "function" ? await r.json() : JSON.parse(await r.text());
      if (!Array.isArray(j && j.hits)) throw new Error("Malformed response: missing hits array");
      const items = [];
      for (const x of j.hits) {
        if (x && x.title) {
          items.push({
            subject: s.id,
            title: x.title,
            url: x.url || (x.objectID ? `https://news.ycombinator.com/item?id=${x.objectID}` : "#"),
            at: x.created_at || "",
            points: x.points || 0,
            source: "Hacker News",
            kind: "unverified-signal",
          });
        }
      }
      return items;
    } finally {
      if (timer != null) clearTimeout(timer);
    }
  }

  async function scan(opts) {
    if (st === "scanning") return;
    const timeoutMs = Number(opts && opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : SCAN_TIMEOUT_MS;
    st = "scanning";
    lastError = "";
    paint();
    const subs = subjects();
    if (!subs.length) {
      st = "idle";
      paint();
      toast("Add at least one subject to scan");
      return;
    }
    const got = [];
    let ok = 0;
    let errNote = "";
    try {
      for (const s of subs) {
        try {
          const items = await fetchSubjectSignals(s, timeoutMs);
          ok++;
          got.push(...items);
        } catch (e) {
          errNote = e && e.name === "AbortError" ? "request timed out (8s)" : (e && e.message) || "network error";
        }
      }
      if (ok > 0) {
        S.set("signals", got.sort((a, b) => String(b.at || "").localeCompare(String(a.at || ""))).slice(0, 80));
        S.set("scanned", new Date().toISOString());
        if (window.PB && PB.events) PB.events.publish({ type: "scan.done", pillar: "observatory", title: `${got.length} signals on ${ok} subjects` });
        st = "idle";
        lastError = "";
      } else {
        st = "failed";
        lastError = errNote || "news search unreachable";
      }
    } catch (e) {
      st = "failed";
      lastError = (e && e.message) || "scan failed";
    }
    paint();
    toast(ok > 0 ? `${got.length} signals on ${ok} of ${subs.length} subjects` : `Scan failed (${lastError}) — cached signals kept`);
  }

  const ago = (iso) => {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return "unknown time";
    const m = Math.max(0, Math.round((Date.now() - t) / 6e4));
    return m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
  };

  /* The Dome chart (design, 2026-11-14): the same palette and sky geometry as stage.js, drawn as a precise
     instrument — concentric dome arcs and spokes, a deterministic starfield, one star per subject placed along
     the arc (alternating radius, as in the stage dome), star size proportional to the idea count, and each star
     labeled with its name, count, and canon span. All figures come straight from the subject records. */
  const COL = ["#9c8cff", "#5ee7ff", "#ffc552", "#ff8fb8", "#7dffc0", "#ff9d5c", "#c9b8ea"];
  const colAt = (i) => COL[((i % COL.length) + COL.length) % COL.length];
  const colOf = (subs, id) => colAt(Math.max(0, subs.findIndex((s) => s.id === id)));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function paintChart(subs) {
    const host = $("#o-chart"), cap = $("#o-chart-cap");
    if (!host) return;
    const W = 720, H = 364, cx = W / 2, cy = 330, R = 316, K = 0.86;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let g = "";
    for (let i = 0; i < 64; i++) { const a = rnd() * Math.PI, rr = 0.12 + rnd() * 0.86, x = cx + Math.cos(a) * R * rr, y = cy - Math.sin(a) * R * K * rr; g += `<circle class="o-field" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + rnd() * 0.9).toFixed(2)}" opacity="${(0.12 + rnd() * 0.3).toFixed(2)}"/>`; }
    for (let j = 1; j <= 3; j++) { const rx = (R * j) / 3, ry = (R * K * j) / 3; g += `<path class="o-arc" d="M ${(cx - rx).toFixed(1)} ${cy} A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(cx + rx).toFixed(1)} ${cy}"/>`; }
    for (let j = 1; j < 6; j++) { const a = (Math.PI * j) / 6; g += `<line class="o-spoke" x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy - Math.sin(a) * R * K).toFixed(1)}"/>`; }
    const sa = Math.PI * 0.7; g += `<line class="o-sweep" x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(sa) * R * 1.03).toFixed(1)}" y2="${(cy - Math.sin(sa) * R * K * 1.03).toFixed(1)}"/>`;
    g += `<line class="o-horizon" x1="10" y1="${cy}" x2="${W - 10}" y2="${cy}"/>`;
    if (!subs.length) {
      g += `<text class="o-chart-empty" x="${cx}" y="${H * 0.48}" text-anchor="middle">Add a subject below to start watching</text>`;
    } else {
      const n = subs.length;
      const pts = subs.map((s, i) => { const a = Math.PI - ((i + 0.5) / n) * Math.PI, rf = 0.62 + 0.22 * (i % 2); return { s, i, x: cx + Math.cos(a) * R * rf, y: cy - Math.sin(a) * R * K * rf, r: 3.5 + (s.ideas || 2) * 0.55, col: colAt(i) }; });
      g += `<polyline class="o-link" points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}"/>`;
      for (const p of pts) {
        const anchor = p.x < 96 ? "start" : p.x > W - 96 ? "end" : "middle";
        const span = p.s.spanStart && p.s.spanEnd ? `${p.s.spanStart.slice(0, 4)} – ${p.s.spanEnd.slice(0, 4)}` : "";
        const meta = typeof p.s.ideas === "number" ? `${p.s.ideas} ideas${span ? " · " + span : ""}` : span;
        g += `<circle class="o-halo" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.r * 2.3).toFixed(1)}" fill="${p.col}"/>`
          + `<circle class="o-core" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" fill="${p.col}"/>`
          + `<circle class="o-heart" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.r * 0.34).toFixed(1)}"/>`
          + `<text class="o-name" x="${p.x.toFixed(1)}" y="${(p.y - p.r - 9).toFixed(1)}" text-anchor="${anchor}" fill="${p.col}">${esc(p.s.name)}</text>`
          + (meta ? `<text class="o-meta" x="${p.x.toFixed(1)}" y="${(p.y + p.r + 15).toFixed(1)}" text-anchor="${anchor}">${esc(meta)}</text>` : "");
      }
    }
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="presentation" aria-hidden="true">${g}</svg>`;
    const total = subs.reduce((a, s) => a + (typeof s.ideas === "number" ? s.ideas : 0), 0);
    const starts = subs.map((s) => s.spanStart).filter(Boolean).sort(), ends = subs.map((s) => s.spanEnd).filter(Boolean).sort();
    cap.textContent = !subs.length ? "" : `${subs.length} subject${subs.length === 1 ? "" : "s"}${total ? ` · ${total} ideas behind them` : ""}${starts.length ? ` · canon spans ${starts[0]} – ${ends[ends.length - 1]}` : ""} · star size ∝ ideas`;
  }

  function paint() {
    const subs = subjects(), sig = signals(), sc = S.get("scanned", null), name = (id) => (subs.find((s) => s.id === id) || {}).name || "—";
    $("#o-state").textContent = st === "scanning"
      ? "Scanning…"
      : st === "failed"
        ? `Scan failed (${lastError || "news search unreachable"}) — existing cached signals (${sig.length}) were preserved.`
        : sc ? `${sig.length} signals from the last scan, ${ago(sc)}.` : "No scan yet.";
    $("#o-scan").disabled = st === "scanning";
    $("#o-filter").querySelectorAll("[data-filter]").forEach((btn) => {
      const on = btn.dataset.filter === filterMode;
      btn.classList.toggle("quiet", !on);
      btn.setAttribute("aria-pressed", String(on));
    });
    paintChart(subs);
    const view = getFiltered();
    const sigEls = view.signals.slice(0, 24).map((x) => h("div.kv.o-sig", { style: `--sc:${colOf(subs, x.subject)}` }, h("span", null, h("span.o-sig-dot", { style: `background:${colOf(subs, x.subject)};color:${colOf(subs, x.subject)}` }), h("a", { href: x.url, target: "_blank", rel: "noopener" }, x.title), h("br"), h("span.stat-s", null, `${name(x.subject)} · ${x.source}, ${classifySignal(x)} · ${ago(x.at)}${x.points ? " · " + x.points + " points" : ""}`))));
    if (!sigEls.length) {
      const emptyMsg = filterMode === "verified"
        ? (S.list("notes").some((n) => classifySignal(n) === "verified-fact") ? "Unverified headlines hidden — see verified facts in Your observations." : "No verified notes yet.")
        : (st === "failed" ? "No cached signals yet; failed scan made no changes." : "No signals yet. Press Scan now.");
      sigEls.push(h("p.empty", null, emptyMsg));
    }
    $("#o-signals").replaceChildren(...sigEls);
    const maxIdeas = Math.max(1, ...subs.map((s) => (typeof s.ideas === "number" ? s.ideas : 0)));
    $("#o-subjects").replaceChildren(...subs.map((s, i) => {
      const col = colAt(i), canon = s.from === "athenaeum";
      return h("div.kv.o-subj", { style: `--sc:${col}` }, h("span.o-subj-main", null,
        h("span.o-subj-head", null,
          h("span.o-dot", { style: `background:${col};color:${col}` }),
          h("b", null, s.name),
          canon ? h("span.o-mag", null, h("b.o-mag-n", null, String(s.ideas)), h("span.o-mag-k", null, "ideas")) : null),
        h("br"), h("span.stat-s", null, canon ? `from ${s.ideas} of your ideas${s.spanStart ? ` · ${s.spanStart} – ${s.spanEnd}` : ""}` : "added by you"),
        canon ? h("span.bar-mini.o-magbar", null, h("i", { style: `width:${Math.max(4, Math.round((s.ideas / maxIdeas) * 100))}%;background:${col}` })) : null,
        ...(s.quote ? [h("span.o-quote", null,
          h("span.o-quote-k", null, "Strongest thread"),
          h("span.o-quote-text", null, `\u201C${s.quote}\u201D`),
          h("span.stat-s.o-quote-attr", null, `— ${s.top || "strongest thread"}${s.quoteDate ? ` · ${s.quoteDate}` : ""}`))] : [])),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.set("subjects", subs.filter((x) => x.id !== s.id)); paint(); } }, "Drop"));
    }));
    const sel = $("#o-note").subject; sel.replaceChildren(...subs.map((s) => h("option", { value: s.id }, s.name)));
    const noteEls = view.notes.length
      ? view.notes.map((n) => h("div.kv.o-note.o-note-" + classifySignal(n), null, h("span", null, n.text, h("br"), h("span.stat-s", null, `${name(n.subject)} · ${classifySignal(n)}${n.url ? " · " : ""}`, n.url ? h("a", { href: n.url, target: "_blank", rel: "noopener" }, "source") : null)),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("notes", n.id); paint(); } }, "Remove")))
      : [h("p.empty", null, filterMode === "unverified" ? "Filtered to Unverified Signals — switch filter to All or Verified Notes to view observations." : filterMode === "verified" ? "No verified facts noted yet." : "Nothing noted yet.")];
    $("#o-notes").replaceChildren(...noteEls);
  }

  $("#o-scan").addEventListener("click", () => scan());
  $("#o-filter").querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => filterView(btn.dataset.filter));
  });
  $("#o-add").addEventListener("submit", (e) => { e.preventDefault(); const v = e.target.name.value.trim(); if (!v) return; S.set("subjects", [...subjects(), { id: "u-" + Date.now().toString(36), name: v, q: v, from: "you" }]); e.target.reset(); paint(); });
  try {
    const raw = sessionStorage.getItem("prometheus.handoff");
    if (raw) {
      const handoff = JSON.parse(raw);
      if (handoff && handoff.pillar === "observatory") {
        sessionStorage.removeItem("prometheus.handoff");
        $("#o-add").name.value = String(handoff.title || "").slice(0, 60);
        toast("Idea routed from Athenaeum — click Watch it to add subject");
      }
    }
  } catch (e) { /* sessionStorage optional */ }
  $("#o-note").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("notes", { subject: f.subject.value, kind: f.kind.value, text: f.text.value.trim(), url: f.url.value.trim() }); f.text.value = ""; f.url.value = ""; toast("Kept"); paint(); });
  $("#export").onclick = () => download(`observatory_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
