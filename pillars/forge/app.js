/* Forge (Claude, 2026-11-13; owner lifted the Fleet pause for it the same day): the AI work floor. Reads, never writes, the homework
   queues this hub publishes (docs/agents/queues.json and each pillar's own) and Titan's score sheet (same site, read as text); keeps
   the owner's own assignments here. Nothing on this page talks to an AI. window.FORGE = { parseScores, load, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("forge"), app = $("#app"), AIS = ["Grok", "Gemini", "Muse", "ChatGPT", "Gemini API", "Claude"];
  const QUEUES = [["Hub", "../../docs/agents/queues.json"], ...["kairos", "apollo", "hermes", "icarus", "argus", "hearth"].map((p) => [p[0].toUpperCase() + p.slice(1), `../${p}/docs/agents/queues.json`])];
  const SCORES = new URLSearchParams(location.search).get("scores") || new URL("/titan-reliquary-preview/collaborators/CONTRIBUTOR_SCORES.md", location.origin).href;
  const D = { tasks: [], scores: [], scoreState: "loading", queueState: "loading" };
  /** Titan's score sheet: "## Name (note)" sections, then rows "| n | date | submission | **x / 10** ... | notes |". */
  function parseScores(md) {
    const out = []; let ai = null, probation = false;
    for (const line of String(md).split("\n")) {
      const sec = line.match(/^## (.+?)\s*(\((.*)\))?\s*$/); if (sec) { const name = sec[1].trim(); ai = AIS.includes(name) ? name : null; probation = /on probation/i.test(sec[3] || "") && !/not on probation/i.test(sec[3] || ""); continue; }
      if (!ai || !/^\|\s*\d+\s*\|/.test(line)) continue;
      const cells = line.split("|").map((c) => c.trim()), m = line.match(/\*\*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/); if (!m) continue;
      out.push({ ai, probation, n: +cells[1], date: cells[2], what: cells[3].replace(/`/g, ""), score: +m[1] });
    }
    return out;
  }
  async function load() {
    const got = await Promise.all(QUEUES.map(([where, url]) => fetch(url).then((r) => (r.ok ? r.json() : null)).then((q) => ({ where, q })).catch(() => ({ where, q: null }))));
    D.tasks = []; for (const { where, q } of got) if (q && Array.isArray(q.agents)) for (const a of q.agents) for (const t of a.tasks || []) D.tasks.push({ ai: a.name || a.id, where, id: t.id, title: t.title, state: t.state || "next", due: t.due || "", why: t.why || "" });
    D.queueState = got.some((g) => g.q) ? "ok" : "unreachable";
    try {
      const explicitScores = new URLSearchParams(location.search).get("scores");
      if (!explicitScores && /^(localhost|127\.0\.0\.1)$/i.test(location.hostname)) { D.scores = []; D.scoreState = "local"; }
      else { const r = await fetch(SCORES); if (!r.ok) throw new Error(r.status); D.scores = parseScores(await r.text()); D.scoreState = D.scores.length ? "ok" : "empty"; }
    } catch (e) { D.scores = []; D.scoreState = "unreachable"; }
    paint(); window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "forge", k: "remote" } }));
  }
  const per = (ai) => { const sc = D.scores.filter((s) => s.ai === ai), open = D.tasks.filter((t) => t.ai === ai && t.state !== "done"), mine = S.list("assignments").filter((a) => a.ai === ai && a.state !== "reviewed");
    const last10 = sc.slice(-10); return { ai, sc, n: sc.length, avg: sc.length ? sc.reduce((s, x) => s + x.score, 0) / sc.length : null, recent: last10.length ? last10.reduce((s, x) => s + x.score, 0) / last10.length : null, last: sc[sc.length - 1] || null, probation: sc.length ? sc[sc.length - 1].probation : false, open, mine, done: D.tasks.filter((t) => t.ai === ai && t.state === "done").length }; };
  window.FORGE = { parseScores, load, data: () => ({ ...D, per: AIS.map(per), assignments: S.list("assignments") }) };

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>The floor</h2><div id="f-floor"></div></div>
      <div class="glass span-12"><h2>Homework out</h2><p class="sub" id="f-qstate"></p><div id="f-tasks"></div></div>
      <div class="glass span-12"><h2>Hand out work</h2>
        <form class="form" id="f-form"><label class="f">To<select name="ai">${AIS.filter((a) => a !== "Gemini API").map((a) => `<option>${a}</option>`).join("")}</select></label>
          <label class="f wide">The task<input name="title" required maxlength="160" placeholder="What exactly, what file back, how you will check it"></label>
          <label class="f">Due back<input name="due" type="date"></label><label class="f">Pillar<input name="pillar" maxlength="40" placeholder="Titan, Kairos…"></label>
          <button class="btn" type="submit">Hand it out</button></form><div id="f-mine"></div></div>
      <div class="glass span-12"><h2>Scores</h2><p class="sub" id="f-sstate"></p><div id="f-scores"></div></div>
    </section>`;
  const STEP = { out: "back", back: "reviewed" };
  function paint() {
    const P = AIS.map(per).filter((p) => p.n || p.open.length || p.mine.length || p.done);
    $("#f-floor").replaceChildren(...(P.length ? P.map((p) => h("div.kv", null, h("span", null, h("b", null, p.ai), p.probation ? h("span.pill.hot", null, " on probation") : null, h("br"),
      h("span.stat-s", null, `${p.open.length} open · ${p.mine.length} of yours out · ${p.done} done${p.last ? " · last " + p.last.score + "/10 on " + p.last.date : ""}`)),
      h("b", null, p.avg == null ? "—" : p.avg.toFixed(1) + " avg"))) : [h("p.empty", null, "No queues or scores reached yet.")]));
    $("#f-qstate").textContent = D.queueState === "loading" ? "Reading the queues…" : D.queueState === "ok" ? `${D.tasks.length} tasks across ${new Set(D.tasks.map((t) => t.where)).size} queues, read from this site.` : "The queues could not be read just now.";
    const open = D.tasks.filter((t) => t.state !== "done").sort((a, b) => (a.state === "now" ? 0 : 1) - (b.state === "now" ? 0 : 1) || String(a.due).localeCompare(String(b.due)));
    $("#f-tasks").replaceChildren(...(open.length ? open.map((t) => h("div.kv", null, h("span", null, h("b", null, t.title), h("br"), h("span.stat-s", null, `${t.ai} · ${t.where} · ${t.id}${t.due ? " · due " + t.due : ""}`)), h("span.pill" + (t.state === "now" ? ".hot" : ""), null, t.state))) : [h("p.empty", null, D.queueState === "ok" ? "Every published task is done." : "")]));
    const mine = S.list("assignments").sort((a, b) => String(a.due || "9").localeCompare(String(b.due || "9")));
    $("#f-mine").replaceChildren(...mine.map((a) => h("div.kv", null, h("span", null, h("b", null, a.title), h("br"), h("span.stat-s", null, `${a.ai}${a.pillar ? " · " + a.pillar : ""}${a.due ? " · due " + a.due : ""} · ${a.state}${a.score != null ? " · scored " + a.score + "/10" : ""}`)),
      a.state === "reviewed" ? h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("assignments", a.id); if (window.PB) PB.deadlines.unpublish("forge", a.id); paint(); } }, "Clear")
        : h("button.btn.quiet.small", { type: "button", onclick: () => { const next = STEP[a.state]; let patch = { state: next };
          if (next === "reviewed") { const v = prompt("Score it out of 10 (place, accepted, accurate, complete, on the sheet):"); if (v === null) return; const n = Math.max(0, Math.min(10, Math.round(+v))); if (!Number.isFinite(n)) return; patch.score = n; patch.reviewed = day(); if (window.PB) PB.deadlines.unpublish("forge", a.id); }
          S.update("assignments", a.id, patch); if (window.PB && PB.events) PB.events.publish({ type: "forge." + next, pillar: "forge", ref: a.id, title: a.title }); paint(); } }, a.state === "out" ? "It's back" : "Score it"))));
    $("#f-sstate").textContent = D.scoreState === "ok" ? `${D.scores.length} scored submissions from Titan's ledger.` : D.scoreState === "loading" ? "Reading Titan's ledger…" : "Titan's ledger could not be read just now.";
    $("#f-scores").replaceChildren(...AIS.map(per).filter((p) => p.n).map((p) => h("div", { style: "margin:10px 0" }, h("div.kv", null, h("span", null, h("b", null, p.ai), ` · ${p.n} scored`), h("b", null, `${p.avg.toFixed(1)} all · ${p.recent.toFixed(1)} last 10`)),
      h("div.bar-mini", null, h("i", { style: `width:${p.avg * 10}%` })), h("span.stat-s", null, "Last: " + (p.last ? `${p.last.score}/10 · ${p.last.what.slice(0, 90)}` : "")))));
  }
  $("#f-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    const a = S.add("assignments", { ai: f.ai.value, title: f.title.value.trim(), due: f.due.value, pillar: f.pillar.value.trim(), state: "out", given: day() });
    if (window.PB && a.due) PB.deadlines.publish({ title: `Back from ${a.ai}: ${a.title}`, date: a.due, source: "forge", kind: "homework", ref: a.id });
    if (window.PB && PB.events) PB.events.publish({ type: "forge.out", pillar: "forge", ref: a.id, title: a.title }); f.reset(); toast("Handed out"); paint(); });
  try {
    const raw = sessionStorage.getItem("prometheus.handoff");
    if (raw) {
      const handoff = JSON.parse(raw);
      if (handoff && handoff.pillar === "forge") {
        sessionStorage.removeItem("prometheus.handoff");
        const f = $("#f-form");
        f.title.value = String(handoff.title || "").slice(0, 160);
        f.pillar.value = "Athenaeum";
        toast("Idea routed from Athenaeum into Forge assignment");
      }
    }
  } catch (e) { /* sessionStorage optional */ }
  $("#export").onclick = () => download(`forge_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint(); load();
})();
