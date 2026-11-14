/* Foundry (Claude, 2026-11-13): inventions turned into builds. The drawing board is every idea tagged as an invention in Athenaeum (read
   from this browser's Athenaeum, or the ideas it ships); starting a build makes a project here that moves through six stages with its
   parts, their cost, a log and the one next step. Athenaeum's records are only read. window.FOUNDRY = { STAGES, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("foundry"), app = $("#app"), STAGES = ["Drawing board", "Research", "Design", "Prototype", "Test", "Built"];
  const usd = (n) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US");
  const ideas = () => { let l = []; try { l = JSON.parse(localStorage.getItem("prometheus.athenaeum.ideas") || "[]"); } catch (e) { l = []; } if (!l.length) l = window.ATHENAEUM_IDEAS || []; return l.filter((i) => !i.archived && (i.tags || []).some((t) => /invent/i.test(t))); };
  const projects = () => S.list("projects");
  const cost = (p) => (p.parts || []).reduce((s, x) => s + (+x.cost || 0), 0);
  window.FOUNDRY = { STAGES, data: () => { const P = projects(), started = new Set(P.map((p) => p.ideaId).filter(Boolean)); return { STAGES, projects: P, board: ideas().filter((i) => !started.has(i.id)), ideas: ideas(), cost: P.reduce((s, p) => s + cost(p), 0) }; } };
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>On the bench</h2><div id="y-bench"></div></div>
      <div class="glass span-12"><h2>Drawing board</h2><p class="sub">Every idea you tagged as an invention in Athenaeum. Starting a build keeps the idea as it is and links back to it.</p><div id="y-board"></div></div>
      <div class="glass span-12"><h2>Start from scratch</h2>
        <form class="form" id="y-form"><label class="f wide">What it is<input name="title" required maxlength="120"></label>
          <label class="f wide">The first next step<input name="next" maxlength="160" placeholder="The one thing that moves it forward"></label><button class="btn" type="submit">Start the build</button></form></div>
    </section>`;
  const log = (p, text) => [...(p.log || []), { date: day(), text }];
  function card(p) {
    const parts = p.parts || [], tot = cost(p), have = parts.filter((x) => x.have).length;
    const step = (d) => h("button.btn.quiet.small", { type: "button", disabled: d < 0 ? p.stage <= 0 : p.stage >= STAGES.length - 1, onclick: () => { const s = p.stage + d; S.update("projects", p.id, { stage: s, log: log(p, (d > 0 ? "Moved to " : "Back to ") + STAGES[s]) }); if (window.PB && PB.events) PB.events.publish({ type: "build.stage", pillar: "foundry", ref: p.id, title: `${p.title}: ${STAGES[s]}` }); paint(); } }, d < 0 ? "◀" : "▶");
    const pname = h("input", { placeholder: "Part or material", maxlength: "80" }), pcost = h("input", { type: "number", min: "0", step: "0.01", placeholder: "Cost $" }), next = h("input", { value: p.next || "", maxlength: "160", placeholder: "The one next step" });
    return h("div", { style: "padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)" },
      h("div.kv", null, h("span", null, h("b", null, p.title), h("br"), h("span.stat-s", null, `${STAGES[p.stage]} · started ${p.started}${p.ideaId ? " · from Athenaeum" : ""}`)), h("span", null, step(-1), " ", step(1))),
      h("div.bar-mini", null, h("i", { style: `width:${(p.stage / (STAGES.length - 1)) * 100}%` })),
      h("form.form", { style: "margin-top:8px", onsubmit: (e) => { e.preventDefault(); S.update("projects", p.id, { next: next.value.trim(), log: log(p, "Next: " + next.value.trim()) }); toast("Next step saved"); paint(); } }, h("label.f.wide", null, "Next step", next), h("button.btn.quiet.small", { type: "submit" }, "Save")),
      h("div", { style: "margin-top:6px" }, ...parts.map((x, k) => h("div.kv", null, h("label", null, h("input", { type: "checkbox", ...(x.have ? { checked: "" } : {}), onchange: (e) => { const l = [...parts]; l[k] = { ...x, have: e.target.checked }; S.update("projects", p.id, { parts: l }); paint(); } }), " ", x.name), h("span.stat-s", null, x.cost ? usd(+x.cost) : "")))),
      h("form.form", { onsubmit: (e) => { e.preventDefault(); if (!pname.value.trim()) return; S.update("projects", p.id, { parts: [...parts, { name: pname.value.trim(), cost: +pcost.value || 0, have: false }] }); paint(); } }, h("label.f", null, "Part", pname), h("label.f", null, "Cost", pcost), h("button.btn.quiet.small", { type: "submit" }, "Add part")),
      h("p.stat-s", null, `${parts.length} parts · ${have} in hand · ${usd(tot)}${(p.log || []).length ? " · last: " + p.log[p.log.length - 1].text : ""}`));
  }
  function paint() {
    const D = window.FOUNDRY.data();
    $("#y-bench").replaceChildren(...(D.projects.length ? D.projects.sort((a, b) => b.stage - a.stage).map(card) : [h("p.empty", null, "Nothing on the bench yet. Start one from the drawing board.")]));
    $("#y-board").replaceChildren(...(D.board.length ? D.board.map((i) => h("div.kv", null, h("span", null, h("b", null, i.title), h("br"), h("span.stat-s", null, `kept ${i.created || ""}${i.strength ? " · strength " + i.strength : ""}`)),
      h("button.btn.quiet.small", { type: "button", onclick: () => { const p = S.add("projects", { title: i.title, ideaId: i.id, stage: 1, next: "", parts: [], started: day(), log: [{ date: day(), text: "Started from the idea kept " + (i.created || "") }] }); if (window.PB && PB.events) PB.events.publish({ type: "build.started", pillar: "foundry", ref: p.id, title: p.title }); toast("On the bench"); paint(); } }, "Start the build"))) : [h("p.empty", null, D.ideas.length ? "Every invention is on the bench." : "No ideas tagged invention in Athenaeum yet.")]));
  }
  $("#y-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("projects", { title: f.title.value.trim(), ideaId: f.dataset.ideaId || null, stage: 0, next: f.next.value.trim(), parts: [], started: day(), log: [{ date: day(), text: f.dataset.ideaId ? "Started from Athenaeum handoff" : "Started" }] }); delete f.dataset.ideaId; f.reset(); toast("On the bench"); paint(); });
  try {
    const raw = sessionStorage.getItem("prometheus.handoff");
    if (raw) {
      const handoff = JSON.parse(raw);
      if (handoff && handoff.pillar === "foundry") {
        sessionStorage.removeItem("prometheus.handoff");
        const f = $("#y-form");
        f.title.value = String(handoff.title || "").slice(0, 120);
        f.next.value = String(handoff.text || "").slice(0, 160);
        if (handoff.ideaId) f.dataset.ideaId = String(handoff.ideaId);
        toast("Routed from Athenaeum — ready to start build");
      }
    }
  } catch (e) { /* sessionStorage optional */ }
  $("#export").onclick = () => download(`foundry_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
