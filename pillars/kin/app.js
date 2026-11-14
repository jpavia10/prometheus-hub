/* Kin (Claude, 2026-11-13): family logistics. Who has the kids on each day (from a repeating pattern you set), the people, dated things
   (school, activities, appointments, handoffs) published to the shared calendar, and what other pillars already hold: school documents
   from Records and trips marked "kids" in Odyssey (read only). Names stay in this browser. window.KIN = { PATTERNS, whoHas, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("kin"), app = $("#app");
  const PATTERNS = { "alt-weeks": { label: "Alternating weeks", cycle: [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0] }, "2-2-3": { label: "2-2-3", cycle: [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0] }, "2-2-5-5": { label: "2-2-5-5", cycle: [1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0] }, "5-2": { label: "Weekdays / weekends", cycle: [1, 1, 1, 1, 1, 0, 0] }, "every-day": { label: "Every day", cycle: [1] } };
  const KINDS = ["school", "activity", "appointment", "handoff", "birthday", "other"];
  const addDays = (d, n) => { const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + n); return day(x); };
  const diff = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5);
  function whoHas(date, sch) { if (!sch || !PATTERNS[sch.pattern] || !sch.start) return null; const c = PATTERNS[sch.pattern].cycle, k = ((diff(sch.start, date) % c.length) + c.length) % c.length; return c[k] ? "you" : "other"; }
  const other = (key, pid) => { try { return JSON.parse(localStorage.getItem(`prometheus.${pid}.${key}`) || "[]"); } catch (e) { return []; } };
  window.KIN = { PATTERNS, whoHas, data: () => { const today = new URLSearchParams(location.search).get("today") || day(); return { today, sch: S.get("schedule", null), people: S.list("people"), items: S.list("items"), school: other("docs", "records").filter((d) => d.category === "school"), trips: other("trips", "odyssey").filter((t) => t.kids) }; } };
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>The next two weeks</h2><div id="k-days"></div></div>
      <div class="glass span-12"><h2>Add a date</h2>
        <form class="form" id="k-item"><label class="f wide">What<input name="title" required maxlength="120" placeholder="Field trip form, soccer, dentist, handoff at school…"></label>
          <label class="f">Kind<select name="kind">${KINDS.map((k) => `<option>${k}</option>`).join("")}</select></label><label class="f">For<select name="who"><option value="">everyone</option></select></label>
          <label class="f">Date<input name="date" type="date" required></label><label class="f">Time<input name="time" type="time"></label><button class="btn" type="submit">Add</button></form></div>
      <div class="glass span-12"><h2>The schedule</h2><p class="sub">The repeating pattern for who has the kids. The first day of the pattern is a day they are with you.</p>
        <form class="form" id="k-sch"><label class="f">Pattern<select name="pattern"><option value="">none set</option>${Object.entries(PATTERNS).map(([k, p]) => `<option value="${k}">${p.label}</option>`).join("")}</select></label>
          <label class="f">Starting<input name="start" type="date"></label><button class="btn quiet" type="submit">Save the pattern</button></form></div>
      <div class="glass span-12"><h2>The family</h2><div id="k-people"></div>
        <form class="form" id="k-person"><label class="f">Name<input name="name" required maxlength="40"></label><label class="f">Who<select name="role"><option value="kid">kid</option><option value="co-parent">co-parent</option><option value="family">family</option></select></label>
          <label class="f">Birthday<input name="born" type="date"></label><button class="btn quiet" type="submit">Add</button></form></div>
      <div class="glass span-12"><h2>From the other pillars</h2><div id="k-other"></div></div>
    </section>`;
  const nextBirthday = (born, today) => { if (!born) return null; let d = today.slice(0, 4) + born.slice(4); if (d < today) d = String(+today.slice(0, 4) + 1) + born.slice(4); return { date: d, days: diff(today, d), age: +d.slice(0, 4) - +born.slice(0, 4) }; };
  function paint() {
    const D = window.KIN.data(), name = (id) => (D.people.find((p) => p.id === id) || {}).name || "";
    $("#k-days").replaceChildren(...Array.from({ length: 14 }, (_, n) => { const d = addDays(D.today, n), who = whoHas(d, D.sch), its = D.items.filter((i) => i.date === d), sch = D.school.filter((s) => s.due === d), tr = D.trips.filter((t) => t.start <= d && (t.end || t.start) >= d);
      const bds = D.people.map((p) => ({ p, b: nextBirthday(p.born, D.today) })).filter((x) => x.b && x.b.date === d);
      if (!who && !its.length && !sch.length && !tr.length && !bds.length && n > 0) return null;
      return h("div.kv", null, h("span", null, h("b", null, n === 0 ? "Today" : n === 1 ? "Tomorrow" : new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })), h("br"),
        h("span.stat-s", null, [...its.map((i) => `${i.time ? i.time + " " : ""}${i.title}${i.who ? " (" + name(i.who) + ")" : ""}`), ...sch.map((s) => "School: " + s.title), ...tr.map((t) => "Trip: " + (t.name || t.dest)), ...bds.map((x) => `${x.p.name} turns ${x.b.age}`)].join(" · ") || "Nothing dated")),
        who ? h("span.pill" + (who === "you" ? ".hot" : ""), null, who === "you" ? "with you" : "with the other parent") : null); }).filter(Boolean));
    $("#k-item").who.replaceChildren(h("option", { value: "" }, "everyone"), ...D.people.filter((p) => p.role === "kid").map((p) => h("option", { value: p.id }, p.name)));
    const f = $("#k-sch"); if (D.sch) { f.pattern.value = D.sch.pattern || ""; f.start.value = D.sch.start || ""; }
    $("#k-people").replaceChildren(...D.people.map((p) => { const b = nextBirthday(p.born, D.today); return h("div.kv", null, h("span", null, h("b", null, p.name), h("br"), h("span.stat-s", null, `${p.role}${b ? ` · birthday in ${b.days} d, turns ${b.age}` : ""}`)), h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("people", p.id); paint(); } }, "Remove")); }));
    $("#k-other").replaceChildren(...(D.school.length || D.trips.length ? [
      ...D.school.map((s) => h("div.kv", null, h("span", null, h("b", null, s.title), h("br"), h("span.stat-s", null, `Records · school${s.due ? " · due " + s.due : ""}`)), h("a.btn.quiet.small", { href: "../records/" }, "Open Records →"))),
      ...D.trips.map((t) => h("div.kv", null, h("span", null, h("b", null, t.name || t.dest), h("br"), h("span.stat-s", null, `Odyssey · with the kids · ${t.start}${t.end ? " to " + t.end : ""}`)), h("a.btn.quiet.small", { href: "../odyssey/" }, "Open Odyssey →")))
    ] : [
      h("p.empty", null, "School documents in Records and trips marked kids in Odyssey show up here."),
      h("div.kv", null, h("span.stat-s", null, "Add school records or family trips in linked pillars:"), h("span", null, h("a.btn.quiet.small", { href: "../records/" }, "Records →"), " ", h("a.btn.quiet.small", { href: "../odyssey/" }, "Odyssey →")))
    ]));
  }
  $("#k-item").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; const it = S.add("items", { title: f.title.value.trim(), kind: f.kind.value, who: f.who.value, date: f.date.value, time: f.time.value });
    if (window.PB) PB.deadlines.publish({ title: (it.kind === "school" ? "School: " : "") + it.title, date: it.date, time: it.time || undefined, source: "kin", kind: it.kind, ref: it.id }); f.reset(); toast("Added"); paint(); });
  try {
    const raw = sessionStorage.getItem("prometheus.handoff");
    if (raw) {
      const handoff = JSON.parse(raw);
      if (handoff && handoff.pillar === "kin") {
        sessionStorage.removeItem("prometheus.handoff");
        $("#k-item").title.value = String(handoff.title || "").slice(0, 120);
        toast("Routed from Athenaeum into Kin date planner");
      }
    }
  } catch (e) { /* sessionStorage optional */ }
  $("#k-sch").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.set("schedule", f.pattern.value ? { pattern: f.pattern.value, start: f.start.value || day() } : null); toast("Pattern saved"); paint(); });
  $("#k-person").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("people", { name: f.name.value.trim(), role: f.role.value, born: f.born.value }); f.reset(); paint(); });
  $("#export").onclick = () => download(`kin_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
