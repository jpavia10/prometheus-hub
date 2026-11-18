/* Forge (Claude, 2026-11-13; rebuilt 2026-11-16 at the owner's word: "aggressively assign homework ... I want to see clearly on the forge.
   Spend time to level it up"): the AI work floor. It reads, never writes, every place work is handed out: the homework queue of the hub and of
   every pillar (pillars.json lists them), Titan's research loop (each AI's open assignments) and Titan's hand-written projects, the Gemini
   coding agents' workboard (docs/antigravity/WORKBOARD.md), and the score sheets (Titan's ledger and each pillar's). It shows, per AI, how
   much is out and from where, against a floor (Gemini is loaded heaviest), what is due or late, and which pillar has nothing assigned.
   The owner's own hand-outs stay on this device. Nothing on this page talks to an AI. window.FORGE = { parseScores, load, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("forge"), app = $("#app"), Q = new URLSearchParams(location.search);
  const AIS = ["Gemini", "Grok", "Muse", "ChatGPT", "Gemini API", "Argon", "Hydrogen", "Claude"];
  const FLOOR = { Gemini: 30, Grok: 6, Muse: 6, ChatGPT: 2, "Gemini API": 1, Argon: 1, Hydrogen: 1 };     // owner, 2026-11-16: everyone loaded, Gemini very heavy
  const ROLE_TAG = { Argon: "Gemini agent · orchestrator", Hydrogen: "Gemini agent · executor", "Gemini API": "the API, one sub-source per model" };
  const NAME = { gemini: "Gemini", grok: "Grok", muse: "Muse", chatgpt: "ChatGPT", "gemini-api": "Gemini API", claude: "Claude", argon: "Argon", hydrogen: "Hydrogen" };
  const SRC = { titan: "Titan · research loop", tproj: "Titan · projects", hub: "Prometheus pillars", board: "Gemini agents' workboard", mine: "Your hand-outs" };
  const SRC_SHORT = { titan: "Titan loop", tproj: "Titan projects", hub: "Pillars", board: "Workboard", mine: "Yours" };
  const ROOT = "../../";
  const TITAN = Q.get("titan") || new URL("/titan-reliquary-preview/", location.origin).href;
  const TRAW = "https://github.com/jpavia10/titan-reliquary-preview/blob/main/";
  const SCORES = Q.get("scores") || new URL("collaborators/CONTRIBUTOR_SCORES.md", TITAN).href;
  const KIND = { cite: "Cite catalogue facts", catno: "Settle catalogue numbers", verify: "Verify facts others wrote", "read-mint": "Read mint marks from photos", "story-check": "Fact-check stories",
    "plain-story": "Rewrite stories in plain English", research: "Research open questions", value: "Price coins with a dated source", arbitrate: "Third reader on disagreements", contradiction: "Settle contradictions", fill: "Fill Phase 2 facts" };
  const D = { tasks: [], scores: [], hubScores: [], scoreState: "loading", queueState: "loading", sources: {}, pillars: [] };
  const today = day();
  const ai = (x) => NAME[String(x || "").toLowerCase()] || x;
  const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

  /** Titan's score sheet: "## Name (note)" sections, then rows "| n | date | submission | **x / 10** ... | notes |". */
  function parseScores(md) {
    const out = []; let who = null, probation = false;
    for (const line of String(md).split("\n")) {
      const sec = line.match(/^## (.+?)\s*(\((.*)\))?\s*$/); if (sec) { const name = sec[1].trim(); who = AIS.includes(name) ? name : null; probation = /on probation/i.test(sec[3] || "") && !/not on probation/i.test(sec[3] || ""); continue; }
      if (!who || !/^\|\s*\d+\s*\|/.test(line)) continue;
      const cells = line.split("|").map((c) => c.trim()), m = line.match(/\*\*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/); if (!m) continue;
      out.push({ ai: who, probation, n: +cells[1], date: cells[2], what: cells[3].replace(/`/g, ""), score: +m[1], where: "Titan" });
    }
    return out;
  }
  /** A Prometheus pillar's score sheet: "| # | Date | AI | File | Task | Place | Accepted | Accurate | Complete | On sheet | Score | Notes |". */
  function parseHubScores(md, where) {
    const out = [];
    for (const line of String(md).split("\n")) {
      if (!/^\|\s*\d+\s*\|/.test(line)) continue; const c = line.split("|").map((x) => x.trim()); if (c.length < 13) continue;
      const sc = c[11], num = /^\d+(\.\d+)?$/.test(sc) ? +sc : null;
      out.push({ ai: ai(c[3]), date: c[2], what: c[4].replace(/`/g, ""), task: c[5], score: num, pending: num == null, note: sc, where });
    }
    return out;
  }
  /** The workboard table: | `AGY-017` | Sprint 10 | title | owner | STATUS | deps | acceptance | evidence | */
  function parseBoard(md) {
    const out = [];
    for (const line of String(md).split("\n")) {
      const m = line.match(/^\|\s*`(AGY-\d+)`\s*\|/); if (!m) continue; const c = line.split("|").map((x) => x.trim());
      const status = (c[5] || "").toUpperCase(), done = status === "DONE";
      for (const who of (c[4] || "").split("/").map((x) => x.trim()).filter(Boolean))
        out.push({ ai: ai(who), src: "board", where: "Workboard", id: m[1], title: c[3], state: done ? "done" : /WAIT/.test(status) ? "waiting" : "now", status, due: "", items: 0,
          detail: { what: c[7] ? "Done when: " + c[7] : "", link: "https://github.com/jpavia10/prometheus-hub/blob/main/docs/antigravity/WORKBOARD.md" } });
    }
    return out;
  }
  const get = (url, as) => fetch(url, { cache: "no-cache" }).then((r) => (r.ok ? (as === "text" ? r.text() : r.json()) : null)).catch(() => null);

  async function load() {
    const reg = await get(ROOT + "pillars.json"); const list = reg ? (Array.isArray(reg) ? reg : reg.pillars || []) : [];
    D.pillars = list.filter((p) => p.id === "hub" || (p.home && p.state !== "paused" && p.id !== "presence"))   /* Sylade stays presence-only (charter): no homework */.map((p) => ({ id: p.id, name: (p.name || p.id).split(" · ")[0], q: p.id === "hub" ? ROOT + "docs/agents/queues.json" : ROOT + p.home.replace(/\/?$/, "/") + "docs/agents/queues.json",
      scores: p.id === "hub" ? ROOT + "collaborators/CONTRIBUTOR_SCORES.md" : ROOT + p.home.replace(/\/?$/, "/") + "collaborators/CONTRIBUTOR_SCORES.md", page: p.id === "hub" ? "docs/agents/" : p.home.replace(/\/?$/, "/") + "docs/agents/" }));
    const midas = list.find((p) => p.id === "midas");           // Midas keeps its homework in its own repository (owner, 2026-11-16: Midas is Claude's to work on)
    if (midas) D.pillars.push({ id: "midas", name: "Midas Ledger", q: Q.get("midas") || new URL("/midas-ledger/docs/agents/queues.json", location.origin).href, scores: "", page: "", ext: true });
    const tasks = [];
    const hubQ = await Promise.all(D.pillars.map((p) => get(p.q).then((q) => ({ p, q }))));
    let qOK = 0;
    for (const { p, q } of hubQ) { if (!q || !Array.isArray(q.agents)) continue; qOK++;
      for (const a of q.agents) for (const t of a.tasks || []) {
        const dl = t.deliver || {};
        tasks.push({ ai: ai(a.name || a.id), src: "hub", where: p.name, pid: p.id, id: t.id, title: t.title, state: t.state || "next", due: t.due || "", items: t.count || 0, review: t.review || "",
          detail: { why: t.why || "", steps: t.steps || [], make: dl.file || "", folder: dl.folder || "", shape: dl.shape || "", done: t.done_when || "", checks: t.checks || [], link: p.ext ? `https://github.com/jpavia10/midas-ledger/blob/main/docs/agents/QUEUE_${(a.id || "").toLowerCase()}.md` : `https://github.com/jpavia10/prometheus-hub/blob/main/${p.page}QUEUE_${(a.id || "").toLowerCase()}.md` } }); } }
    D.sources.hub = qOK ? `${qOK} of ${D.pillars.length} queues read` : "not reached";
    const tAis = ["gemini", "grok", "muse", "chatgpt", "gemini-api"];
    const tl = await Promise.all(tAis.map((k) => get(TITAN + `docs/agents/homework/${k}.json`).then((j) => ({ k, j }))));
    let tOK = 0;
    for (const { k, j } of tl) { if (!j) continue; tOK++;
      for (const a of j.assignments || []) { const lease = String(a.lease_until || "").slice(0, 10), closed = a.status !== "open";
        tasks.push({ ai: ai(k), src: "titan", where: "Titan", id: a.id, title: `${KIND[a.kind] || a.kind} · ${(a.items || []).length} ${(a.items || []).length === 1 ? "item" : "items"}`, state: closed ? "done" : "now", closedAs: closed ? a.status : "", due: lease, items: (a.items || []).length,
          detail: { why: "Generated by Titan's research loop from a gap in the collection data.", make: `changes_${k}_{YYYYMMDD-HHMM}.jsonl (the answer sheet, filled)`, folder: "Titan Reliquary/collection-incoming (AI change files)/", sheet: `${TRAW}docs/agents/homework/sheets/${a.id}.jsonl`, link: `${TRAW}docs/agents/QUEUE_${k}.md` } }); } }
    D.sources.titan = tOK ? `${tOK} of ${tAis.length} AI files read` : "not reached";
    const tp = await get(TITAN + "docs/agents/queues.json");
    if (tp && Array.isArray(tp.agents)) {
      for (const a of tp.agents) for (const t of a.tasks || []) { const st = t.state || "now", open = ["now", "next", "later", "always"].includes(st);
        tasks.push({ ai: ai(a.id), src: "tproj", where: "Titan", id: "T-" + a.id + "-" + t.n, title: t.title, state: open ? st : "done", closedAs: open ? "" : st, due: t.due || "", items: 0,
          detail: { what: t.what || "", done: t.done_when || "", link: `${TRAW}docs/agents/QUEUE_${a.id}.md` } }); }
      D.sources.tproj = "read";
    } else D.sources.tproj = "not reached";
    const wb = await get(ROOT + "docs/antigravity/WORKBOARD.md", "text"); if (wb) { tasks.push(...parseBoard(wb)); D.sources.board = "read"; } else D.sources.board = "not reached";
    /* The completions ledger (owner, 2026-11-17; read path fixed 2026-11-18): one Drive file every AI appends to when it finishes a task, so Forge shows the work as
       delivered the moment the worker is done, whoever did it, instead of waiting for the integrator to flip the queue in its repo. Forge reads an in-repo mirror
       (docs/agents/completions.json) because Drive download URLs send no CORS headers and browsers block the cross-origin fetch; .github/workflows/ledger.yml copies
       the Drive file into the mirror every 10 minutes (tools/forge/sync_ledger.py, owner 2026-11-18: no waiting on an auditor to fold it in). An entry means
       DELIVERED (the file is in the named folder), not accepted; the repo queue flip stays the permanent record. */
    const LEDGER = Q.get("done") || ROOT + "docs/agents/completions.json";
    const lj = await get(LEDGER);
    if (lj && Array.isArray(lj.done)) {
      const led = new Map(lj.done.filter((e) => e && e.key).map((e) => [e.key, e])); let marked = 0;
      for (const t of tasks) { const e = led.get(t.id); if (e && t.state !== "done") { t.state = "done"; t.closedAs = "delivered"; t.detail = { ...(t.detail || {}), delivered: `${e.what || "the deliverable"} · by ${e.by || "?"} · ${String(e.ts || "").slice(0, 10)} (completions ledger: delivered, awaiting the integrator's check; the queue in its own repo still shows it open until the flip lands)` }; marked++; } }
      const synced = lj.synced ? ` · synced ${new Date(lj.synced).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "";
      D.sources.done = (marked ? `${marked} delivered, awaiting the check` : "read, nothing new") + synced;
    } else D.sources.done = "not reached";
    D.tasks = tasks; D.queueState = tasks.length ? "ok" : "unreachable";
    try {
      if (!Q.get("scores") && /^(localhost|127\.0\.0\.1)$/i.test(location.hostname)) { D.scores = []; D.scoreState = "local"; }
      else { const r = await fetch(SCORES); if (!r.ok) throw new Error(r.status); D.scores = parseScores(await r.text()); D.scoreState = D.scores.length ? "ok" : "empty"; }
    } catch (e) { D.scores = []; D.scoreState = "unreachable"; }
    const hs = await Promise.all(D.pillars.map((p) => (p.scores ? get(p.scores, "text") : Promise.resolve(null)).then((t) => (t ? parseHubScores(t, p.name) : []))));
    D.hubScores = hs.flat();
    paint(); window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "forge", k: "remote" } }));
  }

  const isOpen = (t) => t.state !== "done";
  const mineAll = () => S.list("assignments").map((a) => ({ ai: a.ai, src: "mine", where: a.pillar || "Yours", id: a.id, title: a.title, state: a.state === "reviewed" ? "done" : "now", due: a.due || "", items: 0, own: a,
    detail: { what: [a.deliverable, a.branch && "branch " + a.branch, a.commitSha && "commit " + a.commitSha].filter(Boolean).join(" · ") } }));
  const allTasks = () => [...D.tasks, ...mineAll()];
  const per = (who) => { const sc = D.scores.filter((s) => s.ai === who), all = allTasks().filter((t) => t.ai === who), open = all.filter(isOpen), mine = S.list("assignments").filter((a) => a.ai === who && a.state !== "reviewed");
    const last10 = sc.slice(-10), by = {}; for (const t of open) by[t.src] = (by[t.src] || 0) + 1;
    const late = open.filter((t) => t.due && t.due < today && t.state !== "waiting").length, soon = open.filter((t) => t.due && t.due >= today && days(today, t.due) <= 7).length;
    return { ai: who, sc, n: sc.length, avg: sc.length ? sc.reduce((s, x) => s + x.score, 0) / sc.length : null, recent: last10.length ? last10.reduce((s, x) => s + x.score, 0) / last10.length : null, last: sc[sc.length - 1],
      probation: sc.length ? sc[sc.length - 1].probation : false, open, mine, done: all.filter((t) => !isOpen(t)).length, by, late, soon, items: open.reduce((s, t) => s + (t.items || 0), 0), floor: FLOOR[who] || 0 }; };
  window.FORGE = { parseScores, parseHubScores, parseBoard, load, data: () => ({ ...D, per: AIS.map(per), assignments: S.list("assignments") }) };

  const F = { ai: Q.get("ai") || "all", src: "all", where: "all", state: "open", q: "" };
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Workload</h2><p class="sub" id="f-src"></p><div id="f-load"></div></div>
      <div class="glass span-12"><h2>Tasks</h2><div id="f-filters"></div><div id="f-tasks"></div></div>
      <div class="glass span-12"><h2>Pillars</h2><p class="sub">Open tasks per place and AI. A row with nothing open is a pillar nobody is working on: give it homework.</p><div id="f-matrix"></div></div>
      <div class="glass span-12"><h2>Scores</h2><p class="sub" id="f-sstate"></p><div id="f-scores"></div></div>
      <div class="glass span-12"><h2>Hand out work</h2>
        <form class="form" id="f-form"><label class="f">To<select name="ai">${AIS.filter((a) => a !== "Gemini API").map((a) => `<option value="${a}">${a}${ROLE_TAG[a] ? " (" + ROLE_TAG[a] + ")" : ""}</option>`).join("")}</select></label>
          <label class="f wide">The task<input name="title" required maxlength="160" placeholder="What exactly, what file back, how you will check it"></label>
          <label class="f">Due back<input name="due" type="date"></label><label class="f">Pillar<input name="pillar" maxlength="40" placeholder="Titan, Kairos…"></label>
          <label class="f">Branch<input name="branch" maxlength="60" placeholder="antigravity/d16-foundations"></label>
          <label class="f">Commit SHA<input name="commitSha" maxlength="40" placeholder="short SHA or pending"></label>
          <label class="f wide">Deliverable / Evidence<input name="deliverable" maxlength="160" placeholder="tests, screenshot paths, REVIEW.md"></label>
          <button class="btn" type="submit">Hand it out</button></form>
        <p class="note">Your hand-outs stay on this device and count in the workload above. The queues are read from the published sites; Forge never sends anything to an AI.</p>
        <div id="f-mine"></div></div>
    </section>`;

  const rel = (d) => { if (!d) return ""; const n = days(today, d); return n < 0 ? `${-n} d late` : n === 0 ? "due today" : n === 1 ? "due tomorrow" : `due in ${n} d`; };
  const chip = (txt, cls = "") => h("span.pill" + (cls ? "." + cls : ""), null, txt);
  function seg(label, opts, cur, set) { return h("div.seg", { role: "group", "aria-label": label }, ...opts.map(([v, t]) => h("button.segb" + (v === cur ? ".on" : ""), { type: "button", "aria-pressed": String(v === cur), onclick: () => { set(v); paintTasks(); paintFilters(); } }, t))); }

  function paintLoad() {
    const P = AIS.map(per).filter((p) => p.open.length || p.floor);
    const open = allTasks().filter(isOpen), late = open.filter((t) => t.due && t.due < today && t.state !== "waiting").length, wk = open.filter((t) => t.due && t.due >= today && days(today, t.due) <= 7).length;
    const g = P.find((p) => p.ai === "Gemini"), share = open.length && g ? Math.round((100 * g.open.length) / open.length) : 0;
    const plate = h("div.wall-plate", null,
      h("div.wp-cell", null, h("span.wp-v", null, String(open.length)), h("span.wp-k", null, "Tasks out now")),
      h("div.wp-cell", null, h("span.wp-v", null, String(wk)), h("span.wp-k", null, "Due in 7 days")),
      h("div.wp-cell" + (late ? ".bad" : ""), null, h("span.wp-v", null, String(late)), h("span.wp-k", null, "Late")),
      h("div.wp-cell", null, h("span.wp-v", null, share + "%"), h("span.wp-k", null, "Gemini's share")));
    const max = Math.max(1, ...P.map((p) => Math.max(p.open.length, p.floor)));
    const rows = P.sort((a, b) => b.open.length - a.open.length).map((p) => {
      const low = p.open.length < p.floor, seg_ = Object.keys(SRC).filter((k) => p.by[k]).map((k) => h("i.src-" + k, { style: `width:${(100 * p.by[k]) / max}%`, title: `${SRC[k]}: ${p.by[k]}` }));
      return h("button.lrow" + (F.ai === p.ai ? ".on" : "") + (low ? ".low" : ""), { type: "button", onclick: () => { F.ai = F.ai === p.ai ? "all" : p.ai; paintAll(); document.getElementById("f-filters").scrollIntoView({ behavior: "smooth", block: "start" }); } },
        h("span.lname", null, h("b", null, p.ai), ROLE_TAG[p.ai] ? h("small", null, ROLE_TAG[p.ai]) : null),
        h("span.lbar", null, ...seg_, p.floor ? h("span.lfloor", { style: `left:${(100 * p.floor) / max}%`, title: `floor ${p.floor}` }) : null),
        h("span.lnum", null, h("b", null, String(p.open.length)), h("small", null, low ? `below ${p.floor}` : [p.late ? `${p.late} late` : "", p.soon ? `${p.soon} this week` : "", p.items ? `${p.items} items` : ""].filter(Boolean).join(" · ") || "open")));
    });
    const legend = h("div.legend", null, ...Object.keys(SRC).map((k) => h("span", null, h("i.src-" + k), SRC_SHORT[k])), h("span", null, h("i.floor-k"), "floor"));
    $("#f-load").replaceChildren(plate, legend, ...rows);
    const st = D.sources; $("#f-src").textContent = D.queueState === "loading" ? "Reading every queue…" : `Prometheus: ${st.hub || "…"} · Titan loop: ${st.titan || "…"} · Titan projects: ${st.tproj || "…"} · workboard: ${st.board || "…"} · completions ledger: ${st.done || "…"}`;
  }
  function paintFilters() {
    const ais = ["all", ...AIS.filter((a) => allTasks().some((t) => t.ai === a))];
    const wh = ["all", ...new Set(allTasks().filter(isOpen).map((t) => t.where))].sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)));
    const sel = h("select.fsel", { "aria-label": "Place", onchange: (e) => { F.where = e.target.value; paintTasks(); } }, ...wh.map((w) => h("option", { value: w, selected: w === F.where }, w === "all" ? "Every place" : w)));
    const q = h("input.fq", { type: "search", placeholder: "Search tasks", value: F.q, oninput: (e) => { F.q = e.target.value; paintTasks(); } });
    $("#f-filters").replaceChildren(
      seg("AI", ais.map((a) => [a, a === "all" ? "All" : a]), F.ai, (v) => (F.ai = v)),
      seg("Source", [["all", "All"], ...Object.keys(SRC).map((k) => [k, SRC_SHORT[k]])], F.src, (v) => (F.src = v)),
      seg("State", [["open", "Open"], ["late", "Late"], ["week", "This week"], ["waiting", "Waiting"], ["done", "Done"]], F.state, (v) => (F.state = v)),
      h("div.frow2", null, sel, q));
  }
  function paintTasks() {
    const qq = F.q.trim().toLowerCase();
    const L = allTasks().filter((t) => (F.ai === "all" || t.ai === F.ai) && (F.src === "all" || t.src === F.src) && (F.where === "all" || t.where === F.where)
      && (F.state === "open" ? isOpen(t) : F.state === "done" ? !isOpen(t) : F.state === "late" ? isOpen(t) && t.due && t.due < today && t.state !== "waiting" : F.state === "week" ? isOpen(t) && t.due && t.due >= today && days(today, t.due) <= 7 : F.state === "waiting" ? isOpen(t) && (t.state === "next" || t.state === "waiting" || t.state === "later") : true)
      && (!qq || (t.title + " " + t.id + " " + t.where + " " + t.ai).toLowerCase().includes(qq)));
    L.sort((a, b) => (a.due ? 0 : 1) - (b.due ? 0 : 1) || String(a.due).localeCompare(String(b.due)) || a.ai.localeCompare(b.ai));
    const head = h("p.sub", null, `${L.length} ${L.length === 1 ? "task" : "tasks"}${F.ai !== "all" ? " for " + F.ai : ""}${F.where !== "all" ? " in " + F.where : ""}`);
    const shown = L.slice(0, 160);
    $("#f-tasks").replaceChildren(head, ...shown.map((t) => {
      const d = t.detail || {}, late = isOpen(t) && t.due && t.due < today && t.state !== "waiting";
      const body = h("div.tbody", null,
        d.why ? h("p", null, d.why) : null, d.what ? h("p", null, d.what) : null,
        d.steps && d.steps.length ? h("ol", null, ...d.steps.map((s) => h("li", null, s))) : null,
        d.make ? h("p", null, h("b", null, "Make: "), d.make) : null, d.folder ? h("p", null, h("b", null, "Save in: "), d.folder) : null, d.shape ? h("p.mono", null, d.shape) : null,
        d.done ? h("p", null, h("b", null, "Done when: "), d.done) : null, d.delivered ? h("p", null, h("b", null, "Delivered: "), d.delivered) : null, t.review ? h("p.review", null, t.review) : null,
        h("p.links", null, d.link ? h("a", { href: d.link, target: "_blank", rel: "noopener" }, "The AI's page") : null, d.sheet ? h("a", { href: d.sheet, target: "_blank", rel: "noopener" }, "Answer sheet") : null,
          t.own ? h("button.btn.quiet.small", { type: "button", onclick: () => advance(t.own) }, t.own.state === "out" ? "It's back" : t.own.state === "back" ? "Score it" : "Clear") : null));
      return h("details.trow.s-" + t.src + (late ? ".late" : "") + (isOpen(t) ? "" : ".closed"), null,
        h("summary", null, h("span.tmain", null, h("b", null, t.title), h("span.stat-s", null, `${t.ai} · ${t.where} · ${t.id}`)),
          h("span.tside", null, chip(late ? rel(t.due) : isOpen(t) ? (t.state === "now" ? rel(t.due) || "now" : t.state) : t.closedAs || "done", late ? "bad" : t.state === "now" ? "hot" : ""))), body);
    }), L.length > shown.length ? h("p.sub", null, `${L.length - shown.length} more: narrow it with the filters.`) : null);
  }
  function paintMatrix() {
    const cols = AIS.filter((a) => allTasks().some((t) => t.ai === a && isOpen(t)));
    const places = [...D.pillars.map((p) => p.name), "Titan", "Workboard"];
    const cell = (w, a) => allTasks().filter((t) => isOpen(t) && t.where === w && (!a || t.ai === a)).length;
    const head = h("tr", null, h("th", null, "Place"), ...cols.map((c) => h("th", null, c)), h("th", null, "All"));
    const body = places.map((w) => { const tot = cell(w); return h("tr" + (tot ? "" : ".zero"), { onclick: () => { F.where = w; F.ai = "all"; F.state = "open"; paintAll(); document.getElementById("f-filters").scrollIntoView({ behavior: "smooth" }); } },
      h("td", null, w), ...cols.map((c) => { const n = cell(w, c); return h("td" + (n ? "" : ".nil"), { style: n ? `--k:${Math.min(1, n / 12)}` : "" }, n ? String(n) : "·"); }), h("td", null, h("b", null, String(tot)))); });
    $("#f-matrix").replaceChildren(h("div.mwrap", null, h("table.matrix", null, h("thead", null, head), h("tbody", null, ...body))));
  }
  function paintScores() {
    const all = [...D.scores, ...D.hubScores.filter((s) => s.score != null)];
    $("#f-sstate").textContent = `${D.scores.length} scored in Titan's ledger${D.scoreState === "ok" ? "" : " (" + D.scoreState + ")"} · ${D.hubScores.length} in the Prometheus pillars (${D.hubScores.filter((s) => s.pending).length} waiting on a check)`;
    const rows = AIS.map((a) => { const sc = all.filter((s) => s.ai === a); if (!sc.length) return null; const avg = sc.reduce((s, x) => s + x.score, 0) / sc.length, r10 = sc.slice(-10), rec = r10.reduce((s, x) => s + x.score, 0) / r10.length, last = sc[sc.length - 1];
      return h("div.srow", { style: "margin:10px 0" }, h("div.kv", null, h("span", null, h("b", null, a), ` · ${sc.length} scored`), h("b", null, `${avg.toFixed(1)} · ${rec.toFixed(1)}`)),
        h("div.bar-mini", null, h("i", { style: `width:${avg * 10}%` }), h("span.tick", { style: `left:${rec * 10}%` })), h("span.stat-s", null, `Last: ${last.score}/10 · ${last.where} · ${String(last.what).slice(0, 90)}`)); }).filter(Boolean);
    const pend = D.hubScores.filter((s) => s.pending);
    $("#f-scores").replaceChildren(...(rows.length ? [h("div.board-head", null, h("span", null, "AI · submissions"), h("span", null, "All-time · last 10"))] : [h("p.sub", null, "No scores read yet.")]), ...rows,
      ...(pend.length ? [h("div.board-head", { style: "margin-top:14px" }, h("span", null, "Waiting on Claude's check"), h("span", null, String(pend.length))), ...pend.map((s) => h("div.kv", null, h("span", null, h("b", null, s.ai), ` · ${s.where} · ${s.task}`), h("span.stat-s", null, s.note)))] : []));
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
  function paintAll() { paintLoad(); paintFilters(); paintTasks(); paintMatrix(); paintScores(); paintMine(); }
  const paint = paintAll;

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
  paint(); load();
})();
