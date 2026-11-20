/* Forge (Claude; rebuilt 2026-11-19 at the owner's word: "I checked the forge it seems dated. I feel like that whole page needs reengineered
   because its never accurate when I check"). The page no longer works anything out from thirty files: tools/forge/build.py reads every queue,
   Titan's research loop and projects, the Gemini agents' workboard, the completions ledger and every score sheet, puts each task in exactly one
   state, and writes docs/agents/forge.json (every 10 minutes with the ledger sync, and on every push). This page only draws that file, says
   how old it is, and lists anything the builder could not place.

   States: todo (late when its due date or lease has passed) · queued (handed out for later) · delivered (the AI says it is done; nobody has
   checked it yet) · done (checked, closed) · withdrawn (taken back; never counted). Your own hand-outs stay on this device and add to "to do".
   window.FORGE = { data, load, STATES } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("forge"), app = $("#app"), Q = new URLSearchParams(location.search);
  const AIS = ["Gemini", "Grok", "Muse", "ChatGPT", "Gemini API", "Argon", "Hydrogen", "Claude"];
  const ROLE_TAG = { Argon: "Gemini agent · orchestrator", Hydrogen: "Gemini agent · executor", "Gemini API": "the API, one sub-source per model" };
  const SRC = { hub: "Prometheus pillars", titan: "Titan · research loop", tproj: "Titan · projects", board: "Gemini agents' workboard", mine: "Your hand-outs" };
  const SRC_SHORT = { hub: "Pillars", titan: "Titan loop", tproj: "Titan projects", board: "Workboard", mine: "Yours" };
  const STATES = { todo: "To do", late: "Late", week: "Due this week", queued: "Later", delivered: "Delivered, not checked", done: "Done", withdrawn: "Withdrawn" };
  const SNAP = Q.get("forge") || "../../docs/agents/forge.json";
  const today = day();
  const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
  const ago = (iso) => { if (!iso) return "never"; const m = Math.round((Date.now() - Date.parse(iso)) / 6e4); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 48 * 60 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`; };
  const when = (iso) => (iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");

  let snap = null, snapState = "loading";
  const D = { tasks: [], scores: [], hubScores: [], scoreState: "loading", queueState: "loading", sources: {}, pillars: [] };

  async function load() {
    try {
      const r = await fetch(SNAP, { cache: "no-cache" }); if (!r.ok) throw new Error("HTTP " + r.status);
      snap = await r.json(); snapState = "ok";
    } catch (e) { snap = null; snapState = "unreachable: " + e.message; }
    const s = snap || {}, src = s.sources || {};
    D.tasks = (s.tasks || []).map((t) => ({ ...t, state: t.status }));
    D.scores = s.scores || [];
    D.hubScores = [...(s.hub_scores || []), ...(s.pending_scores || []).map((p) => ({ ...p, score: null, pending: true }))];
    D.queueState = snap ? "ok" : "unreachable"; D.scoreState = snap ? (D.scores.length ? "ok" : "empty") : "unreachable";
    D.sources = snap ? { hub: `${src.queues.read} of ${src.queues.of} queues read`, titan: `${src.titan_loop.read} of ${src.titan_loop.of} AI files read`, tproj: src.titan_projects ? "read" : "not reached",
      board: src.workboard ? "read" : "not reached", done: `${src.ledger.entries} entries` } : {};
    D.pillars = snap ? Object.keys(s.places || {}).filter((w) => w !== "Titan" && w !== "Workboard").map((w) => ({ name: w, ext: w === "Midas Ledger" })) : [];
    paintAll(); window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "forge", k: "remote" } }));
  }

  /* your own hand-outs (this device) join the list as to-do / done */
  const mineAll = () => S.list("assignments").map((a) => ({ ai: a.ai, src: "mine", where: a.pillar || "Yours", id: a.id, title: a.title, status: a.state === "reviewed" ? "done" : "todo", state: a.state === "reviewed" ? "done" : "todo",
    due: a.due || "", items: 0, late: a.state === "out" && !!a.due && a.due < today, own: a, detail: { what: [a.deliverable, a.branch && "branch " + a.branch, a.commitSha && "commit " + a.commitSha].filter(Boolean).join(" · ") } }));
  const allTasks = () => [...D.tasks, ...mineAll()];
  const isTodo = (t) => t.status === "todo";
  const per = (who) => {
    const all = allTasks().filter((t) => t.ai === who), open = all.filter(isTodo), base = (snap && snap.per && snap.per[who]) || {};
    const sc = [...D.scores, ...D.hubScores.filter((x) => x.score != null)].filter((x) => x.ai === who).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const by = {}; for (const t of open) by[t.src] = (by[t.src] || 0) + 1;
    const r10 = sc.slice(-10);
    return { ai: who, open, mine: open.filter((t) => t.src === "mine"), by, floor: base.floor || 0, probation: !!base.probation, late: open.filter((t) => t.late).length, soon: open.filter((t) => t.due && t.due >= today && days(today, t.due) <= 7).length,
      delivered: all.filter((t) => t.status === "delivered").length, items: open.reduce((s, t) => s + (t.items || 0), 0), done: all.filter((t) => t.status === "done").length,
      sc, n: sc.length, avg: sc.length ? sc.reduce((s, x) => s + x.score, 0) / sc.length : null, recent: r10.length ? r10.reduce((s, x) => s + x.score, 0) / r10.length : null, last: sc[sc.length - 1] };
  };
  window.FORGE = { load, STATES, data: () => ({ ...D, snapshot: snap, snapState, per: AIS.map(per), assignments: S.list("assignments") }) };

  const F = { ai: Q.get("ai") || "all", src: "all", where: "all", state: "todo", q: "" };
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Workload</h2><p class="sub f-fresh" id="f-src"></p><div id="f-warn"></div><div id="f-load"></div></div>
      <div class="glass span-12"><h2>Tasks</h2><div id="f-filters"></div><div id="f-tasks"></div></div>
      <div class="glass span-12"><h2>Pillars</h2><p class="sub">To-do per place and AI, and what is delivered but not checked. A row with nothing to do is a pillar nobody is working on.</p><div id="f-matrix"></div></div>
      <div class="glass span-12"><h2>Scores</h2><p class="sub" id="f-sstate"></p><div id="f-scores"></div></div>
      <div class="glass span-12"><h2>Hand out work</h2>
        <form class="form" id="f-form"><label class="f">To<select name="ai">${AIS.filter((a) => a !== "Gemini API").map((a) => `<option value="${a}">${a}${ROLE_TAG[a] ? " (" + ROLE_TAG[a] + ")" : ""}</option>`).join("")}</select></label>
          <label class="f wide">The task<input name="title" required maxlength="160" placeholder="What exactly, what file back, how you will check it"></label>
          <label class="f">Due back<input name="due" type="date"></label><label class="f">Pillar<input name="pillar" maxlength="40" placeholder="Titan, Kairos…"></label>
          <label class="f">Branch<input name="branch" maxlength="60" placeholder="antigravity/d16-foundations"></label>
          <label class="f">Commit SHA<input name="commitSha" maxlength="40" placeholder="short SHA or pending"></label>
          <label class="f wide">Deliverable / Evidence<input name="deliverable" maxlength="160" placeholder="tests, screenshot paths, REVIEW.md"></label>
          <button class="btn" type="submit">Hand it out</button></form>
        <p class="note">Your hand-outs stay on this device and count in the workload above. Forge never sends anything to an AI.</p>
        <div id="f-mine"></div></div>
    </section>`;

  const rel = (d) => { if (!d) return ""; const n = days(today, d); return n < 0 ? `${-n} d late` : n === 0 ? "due today" : n === 1 ? "due tomorrow" : `due in ${n} d`; };
  const chip = (txt, cls = "") => h("span.pill" + (cls ? "." + cls : ""), null, txt);
  function seg(label, opts, cur, set) { return h("div.seg", { role: "group", "aria-label": label }, ...opts.map(([v, t]) => h("button.segb" + (v === cur ? ".on" : ""), { type: "button", "aria-pressed": String(v === cur), onclick: () => { set(v); paintTasks(); paintFilters(); } }, t))); }

  function paintFresh() {
    const el = $("#f-src"), warn = $("#f-warn");
    if (!snap) { el.textContent = snapState === "loading" ? "Reading the Forge's data…" : `The Forge's data file did not load (${snapState}). Nothing below is current.`; el.dataset.state = snapState === "loading" ? "loading" : "bad"; warn.replaceChildren(); return; }
    const checkedH = (Date.now() - Date.parse(snap.checked)) / 36e5, st = snap.sources;
    el.dataset.state = checkedH > 4 ? "stale" : "ok";
    el.textContent = `As of ${when(snap.built)} (${ago(snap.built)}) · checked ${ago(snap.checked)} · ${st.queues.read}/${st.queues.of} queues, Titan loop ${st.titan_loop.read}/${st.titan_loop.of}, Titan projects ${st.titan_projects ? "read" : "missing"}, workboard ${st.workboard ? "read" : "missing"}, ledger ${st.ledger.entries} entries`
      + (checkedH > 4 ? `. The builder has not run for ${Math.round(checkedH)} h: these numbers may be old.` : "");
    const w = snap.warnings || [];
    warn.replaceChildren(...(w.length ? [h("details.f-warnings", null, h("summary", null, `${w.length} thing${w.length === 1 ? "" : "s"} the builder could not place`), h("ul", null, ...w.map((x) => h("li", null, x))))] : []));
  }
  function paintLoad() {
    const P = AIS.map(per).filter((p) => p.open.length || p.floor || p.delivered);
    const open = allTasks().filter(isTodo), late = open.filter((t) => t.late).length, dlv = allTasks().filter((t) => t.status === "delivered").length;
    const g = P.find((p) => p.ai === "Gemini"), share = open.length && g ? Math.round((100 * g.open.length) / open.length) : 0;
    const plate = h("div.wall-plate.five", null,
      h("div.wp-cell", null, h("span.wp-v", null, String(open.length)), h("span.wp-k", null, "To do now")),
      h("div.wp-cell" + (dlv ? ".warn" : ""), null, h("span.wp-v", null, String(dlv)), h("span.wp-k", null, "Delivered, not checked")),
      h("div.wp-cell" + (late ? ".bad" : ""), null, h("span.wp-v", null, String(late)), h("span.wp-k", null, "Late")),
      h("div.wp-cell", null, h("span.wp-v", null, String(open.filter((t) => t.due && t.due >= today && days(today, t.due) <= 7).length)), h("span.wp-k", null, "Due in 7 days")),
      h("div.wp-cell", null, h("span.wp-v", null, share + "%"), h("span.wp-k", null, "Gemini's share")));
    const max = Math.max(1, ...P.map((p) => Math.max(p.open.length + p.delivered, p.floor)));
    const rows = P.sort((a, b) => b.open.length - a.open.length).map((p) => {
      const low = p.open.length < p.floor;
      const segs = [...Object.keys(SRC).filter((k) => p.by[k]).map((k) => h("i.src-" + k, { style: `width:${(100 * p.by[k]) / max}%`, title: `${SRC[k]}: ${p.by[k]}` })),
        p.delivered ? h("i.src-delivered", { style: `width:${(100 * p.delivered) / max}%`, title: `delivered, not checked: ${p.delivered}` }) : null];
      const note = [p.probation ? "probation" : "", p.late ? `${p.late} late` : "", p.soon ? `${p.soon} this week` : "", p.delivered ? `${p.delivered} delivered` : "", low ? `below ${p.floor}` : ""].filter(Boolean).join(" · ") || "to do";
      return h("button.lrow" + (F.ai === p.ai ? ".on" : "") + (low ? ".low" : ""), { type: "button", onclick: () => { F.ai = F.ai === p.ai ? "all" : p.ai; paintAll(); document.getElementById("f-filters").scrollIntoView({ behavior: "smooth", block: "start" }); } },
        h("span.lname", null, h("b", null, p.ai), ROLE_TAG[p.ai] ? h("small", null, ROLE_TAG[p.ai]) : null),
        h("span.lbar", null, ...segs, p.floor ? h("span.lfloor", { style: `left:${(100 * p.floor) / max}%`, title: `floor ${p.floor}` }) : null),
        h("span.lnum", null, h("b", null, String(p.open.length)), h("small", null, note)));
    });
    const legend = h("div.legend", null, ...Object.keys(SRC).map((k) => h("span", null, h("i.src-" + k), SRC_SHORT[k])), h("span", null, h("i.src-delivered"), "Delivered"), h("span", null, h("i.floor-k"), "floor"));
    $("#f-load").replaceChildren(plate, legend, ...rows);
  }
  const inState = (t, s) => s === "todo" ? isTodo(t) : s === "late" ? isTodo(t) && t.late : s === "week" ? isTodo(t) && t.due && t.due >= today && days(today, t.due) <= 7 : t.status === s;
  function paintFilters() {
    const ais = ["all", ...AIS.filter((a) => allTasks().some((t) => t.ai === a && t.status !== "withdrawn"))];
    const wh = ["all", ...new Set(allTasks().filter((t) => t.status === "todo" || t.status === "delivered").map((t) => t.where))].sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)));
    const sel = h("select.fsel", { "aria-label": "Place", onchange: (e) => { F.where = e.target.value; paintTasks(); } }, ...wh.map((w) => h("option", { value: w, selected: w === F.where }, w === "all" ? "Every place" : w)));
    const q = h("input.fq", { type: "search", placeholder: "Search tasks", value: F.q, oninput: (e) => { F.q = e.target.value; paintTasks(); } });
    $("#f-filters").replaceChildren(
      seg("AI", ais.map((a) => [a, a === "all" ? "All" : a]), F.ai, (v) => (F.ai = v)),
      seg("Source", [["all", "All"], ...Object.keys(SRC).map((k) => [k, SRC_SHORT[k]])], F.src, (v) => (F.src = v)),
      seg("State", [["todo", "To do"], ["late", "Late"], ["week", "This week"], ["delivered", "Delivered"], ["queued", "Later"], ["done", "Done"], ["withdrawn", "Withdrawn"]], F.state, (v) => (F.state = v)),
      h("div.frow2", null, sel, q));
  }
  function paintTasks() {
    const qq = F.q.trim().toLowerCase();
    const L = allTasks().filter((t) => (F.ai === "all" || t.ai === F.ai) && (F.src === "all" || t.src === F.src) && (F.where === "all" || t.where === F.where) && inState(t, F.state)
      && (!qq || (t.title + " " + t.id + " " + t.where + " " + t.ai).toLowerCase().includes(qq)));
    L.sort((a, b) => (a.due ? 0 : 1) - (b.due ? 0 : 1) || String(a.due).localeCompare(String(b.due)) || a.ai.localeCompare(b.ai));
    const head = h("p.sub", null, `${L.length} ${L.length === 1 ? "task" : "tasks"} · ${STATES[F.state].toLowerCase()}${F.ai !== "all" ? " · " + F.ai : ""}${F.where !== "all" ? " · " + F.where : ""}`);
    const shown = L.slice(0, 160);
    $("#f-tasks").replaceChildren(head, ...shown.map((t) => {
      const d = t.detail || {}, dv = t.delivered;
      const body = h("div.tbody", null,
        d.why ? h("p", null, d.why) : null, d.what ? h("p", null, d.what) : null,
        d.steps && d.steps.length ? h("ol", null, ...d.steps.map((s) => h("li", null, s))) : null,
        d.make ? h("p", null, h("b", null, "Make: "), d.make) : null, d.folder ? h("p", null, h("b", null, "Save in: "), d.folder) : null, d.shape ? h("p.mono", null, d.shape) : null,
        d.done ? h("p", null, h("b", null, "Done when: "), d.done) : null,
        dv ? h("p", null, h("b", null, "Delivered: "), `${dv.what || "the file"} · ${String(dv.ts || "").slice(0, 10)} · not checked yet`) : null, t.review ? h("p.review", null, t.review) : null,
        h("p.links", null, d.link ? h("a", { href: d.link, target: "_blank", rel: "noopener" }, "The AI's page") : null, d.sheet ? h("a", { href: d.sheet, target: "_blank", rel: "noopener" }, "Answer sheet") : null,
          t.own ? h("button.btn.quiet.small", { type: "button", onclick: () => advance(t.own) }, t.own.state === "out" ? "It's back" : t.own.state === "back" ? "Score it" : "Clear") : null));
      const label = t.status === "todo" ? (rel(t.due) || "to do") : t.status === "delivered" ? "delivered" : t.status === "queued" ? "later" : t.status;
      return h("details.trow.s-" + t.src + (t.late ? ".late" : "") + (t.status === "todo" || t.status === "delivered" ? "" : ".closed"), null,
        h("summary", null, h("span.tmain", null, h("b", null, t.title), h("span.stat-s", null, `${t.ai} · ${t.where} · ${t.id}`)),
          h("span.tside", null, t.reopened ? chip("sent back", "warn") : null, chip(label, t.late ? "bad" : t.status === "delivered" ? "warn" : t.status === "todo" ? "hot" : ""))), body);
    }), L.length > shown.length ? h("p.sub", null, `${L.length - shown.length} more: narrow it with the filters.`) : null);
  }
  function paintMatrix() {
    const cols = AIS.filter((a) => allTasks().some((t) => t.ai === a && isTodo(t)));
    const cell = (w, a) => allTasks().filter((t) => isTodo(t) && t.where === w && (!a || t.ai === a)).length;
    const dl = (w) => allTasks().filter((t) => t.status === "delivered" && t.where === w).length;
    const places = snap ? Object.keys(snap.places).sort((a, b) => cell(b) - cell(a) || a.localeCompare(b)) : [];
    const head = h("tr", null, h("th", null, "Place"), ...cols.map((c) => h("th", null, c)), h("th", null, "To do"), h("th", null, "Delivered"));
    const body = places.map((w) => { const tot = cell(w), d = dl(w); return h("tr" + (tot ? "" : ".zero"), { onclick: () => { F.where = w; F.ai = "all"; F.state = "todo"; paintAll(); document.getElementById("f-filters").scrollIntoView({ behavior: "smooth" }); } },
      h("td", null, w), ...cols.map((c) => { const n = cell(w, c); return h("td" + (n ? "" : ".nil"), { style: n ? `--k:${Math.min(1, n / 12)}` : "" }, n ? String(n) : "·"); }), h("td", null, h("b", null, String(tot))), h("td" + (d ? ".dl" : ".nil"), null, d ? String(d) : "·")); });
    $("#f-matrix").replaceChildren(h("div.mwrap", null, h("table.matrix", null, h("thead", null, head), h("tbody", null, ...body))));
  }
  function paintScores() {
    const pend = D.hubScores.filter((s) => s.pending);
    $("#f-sstate").textContent = snap ? `${D.scores.length} scored in Titan · ${D.hubScores.length - pend.length} in the Prometheus pillars · ${pend.length} waiting on a score` : "";
    const rows = AIS.map(per).filter((p) => p.n).map((p) => h("div.srow", { style: "margin:10px 0" },
      h("div.kv", null, h("span", null, h("b", null, p.ai), ` · ${p.n} scored${p.probation ? " · on probation" : ""}`), h("b", null, `${p.avg.toFixed(1)} · ${p.recent.toFixed(1)}`)),
      h("div.bar-mini", null, h("i", { style: `width:${p.avg * 10}%` }), h("span.tick", { style: `left:${p.recent * 10}%` })),
      h("span.stat-s", null, `Last: ${p.last.score}/10 · ${p.last.date} · ${p.last.where} · ${String(p.last.what).slice(0, 90)}`)));
    $("#f-scores").replaceChildren(...(rows.length ? [h("div.board-head", null, h("span", null, "AI · submissions"), h("span", null, "All-time · last 10"))] : [h("p.sub", null, "No scores read yet.")]), ...rows,
      ...(pend.length ? [h("div.board-head", { style: "margin-top:14px" }, h("span", null, "Waiting on a score"), h("span", null, String(pend.length))), ...pend.map((s) => h("div.kv", null, h("span", null, h("b", null, s.ai), ` · ${s.where} · ${s.task}`), h("span.stat-s", null, s.note || "")))] : []));
  }
  const STEP = { out: "back", back: "reviewed" };
  function advance(a) {
    if (a.state === "reviewed") { S.remove("assignments", a.id); if (window.PB) PB.deadlines.unpublish("forge", a.id); paintAll(); return; }
    const next = STEP[a.state]; const patch = { state: next };
    if (next === "reviewed") { const v = prompt("Score it out of 10 (place, accepted, accurate, complete, on the sheet):"); if (v === null) return; const n = Math.max(0, Math.min(10, Math.round(+v))); if (!Number.isFinite(n)) return; patch.score = n; patch.reviewed = day(); if (window.PB) PB.deadlines.unpublish("forge", a.id); }
    S.update("assignments", a.id, patch); if (window.PB && PB.events) PB.events.publish({ type: "forge." + next, pillar: "forge", ref: a.id, title: a.title }); paintAll();
  }
  function paintMine() {
    const mine = S.list("assignments").sort((a, b) => String(a.due || "9").localeCompare(String(b.due || "9")));
    $("#f-mine").replaceChildren(...(mine.length ? [h("div.reg-head", null, h("span", null, "Your register"), h("span", null, `${mine.filter((a) => a.state === "out").length} out · ${mine.filter((a) => a.state === "back").length} back · ${mine.filter((a) => a.state === "reviewed").length} reviewed`))] : []),
      ...mine.map((a) => h("div.kv.arow.s-" + a.state, null, h("span", null, h("b", null, a.title), h("br"), h("span.stat-s", null, `${a.ai}${a.pillar ? " · " + a.pillar : ""}${a.due ? " · " + rel(a.due) : ""}${a.score != null ? " · " + a.score + "/10" : ""}`)),
        h("button.btn.quiet.small", { type: "button", onclick: () => advance(a) }, a.state === "out" ? "It's back" : a.state === "back" ? "Score it" : "Clear"))));
  }
  function paintAll() { paintFresh(); paintLoad(); paintFilters(); paintTasks(); paintMatrix(); paintScores(); paintMine(); }

  $("#f-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    const a = S.add("assignments", { ai: f.ai.value, title: f.title.value.trim(), due: f.due.value, pillar: f.pillar.value.trim(), branch: f.branch.value.trim(), commitSha: f.commitSha.value.trim(), deliverable: f.deliverable.value.trim(), state: "out", given: day() });
    if (window.PB && a.due) PB.deadlines.publish({ title: `Back from ${a.ai}: ${a.title}`, date: a.due, source: "forge", kind: "homework", ref: a.id });
    if (window.PB && PB.events) PB.events.publish({ type: "forge.out", pillar: "forge", ref: a.id, title: a.title }); f.reset(); toast("Handed out"); paintAll(); });
  try {
    const raw = sessionStorage.getItem("prometheus.handoff");
    if (raw) { const handoff = JSON.parse(raw); if (handoff && handoff.pillar === "forge") { sessionStorage.removeItem("prometheus.handoff"); const f = $("#f-form"); f.title.value = String(handoff.title || "").slice(0, 160); f.pillar.value = "Athenaeum"; toast("Idea routed from Athenaeum into Forge assignment"); } }
  } catch (e) { /* sessionStorage optional */ }
  $("#export").onclick = () => download(`forge_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintAll(); } catch (e) { toast(e.message); } };
  paintAll(); load();
  setInterval(() => { if (!document.hidden) paintFresh(); }, 60000);   // "as of" keeps counting up
})();
