/* Apollo Temple v1 (Claude, 2026-11-05): one line a day (weight, sleep, steps, training, food, water, mood), goals, streaks and
   30-day trends. Health data stays in this browser; Apple Health / Google Fit come once the spec (APO-GEM-01) is checked. */
(function () {
  "use strict";
  const { $, h, num, day, toast, store, download, pickFile, tabs, spark, field, G } = PK;
  const S = store("apollo");
  const app = $("#app");

  // a laurel wreath: two arcs of leaves
  field({ count: 900, at: [0.74, 0.36], scale: 0.27, glyph: (n) => {
    const out = []; const leaves = 16;
    for (const side of [-1, 1]) for (let i = 0; i < leaves; i++) {
      const a = Math.PI / 2 + side * (0.25 + i * 0.16), r = 0.9, cx = Math.cos(a) * r, cy = Math.sin(a) * r * -1 + 0.1;
      out.push(...G.ring(Math.round(n / (leaves * 2)), 0.1, cx, cy, a, a + Math.PI));
    }
    return out; } });

  const FIELDS = [
    ["weight", "Weight", "lb", 0.1], ["sleep", "Sleep", "h", 0.25], ["steps", "Steps", "", 1], ["train", "Training", "min", 1],
    ["protein", "Protein", "g", 1], ["calories", "Calories", "kcal", 1], ["water", "Water", "glasses", 1], ["mood", "Mood", "1-5", 1],
  ];
  const GOALS = { weight: null, sleep: 7.5, steps: 8000, train: 30, protein: 150, water: 8 };
  if (!S.get("goals")) S.set("goals", GOALS);

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-today" aria-controls="p-today">Today</button>
      <button class="tab" role="tab" id="t-trend" aria-controls="p-trend">Trends</button>
      <button class="tab" role="tab" id="t-hist" aria-controls="p-hist">Every day</button>
      <button class="tab" role="tab" id="t-goals" aria-controls="p-goals">Goals</button>
    </div>
    <section id="p-today" role="tabpanel" class="grid">
      <div class="glass lit span-4"><div class="stat-k">Streak</div><div class="stat-v big" id="a-streak">0</div><div class="stat-s" id="a-streak-s">days logged in a row</div></div>
      <div class="glass span-8"><h2>This week against your goals</h2><div id="a-goalbars"></div></div>
      <div class="glass span-12"><h2>Log a day</h2><form class="form" id="a-form"><label class="f">Day<input name="date" type="date" required></label>
        ${FIELDS.map(([k, l, u, st]) => `<label class="f">${l}${u ? " (" + u + ")" : ""}<input name="${k}" type="number" step="${st}" min="0" ${k === "mood" ? 'max="5"' : ""} inputmode="decimal"></label>`).join("")}
        <label class="f wide">Training notes<input name="what" maxlength="160" placeholder="Push day: bench 3x5, rows, 20 min walk"></label>
        <button class="btn" type="submit">Save the day</button></form><p class="note">Saving the same day again updates it.</p></div>
    </section>
    <section id="p-trend" role="tabpanel" class="grid">
      ${["weight", "sleep", "steps", "train", "protein"].map((k) => `<div class="glass span-6"><div class="stat-k">${FIELDS.find((f) => f[0] === k)[1]} · 30 days</div>
        <div class="stat-v" id="tr-${k}">—</div><div class="stat-s" id="tr-${k}-s"></div><canvas class="spark" id="sp-${k}"></canvas></div>`).join("")}
    </section>
    <section id="p-hist" role="tabpanel" class="grid"><div class="glass span-12 scroll-x"><table class="t"><thead><tr><th>Day</th>${FIELDS.map((f) => `<th class="n">${f[1]}</th>`).join("")}<th></th></tr></thead><tbody id="a-rows"></tbody></table></div></section>
    <section id="p-goals" role="tabpanel" class="grid"><div class="glass span-12"><h2>Your goals</h2><form class="form" id="a-goals">
      <label class="f">Target weight (lb)<input name="weight" type="number" step="0.1"></label><label class="f">Sleep (h)<input name="sleep" type="number" step="0.25"></label>
      <label class="f">Steps<input name="steps" type="number"></label><label class="f">Training (min a day)<input name="train" type="number"></label>
      <label class="f">Protein (g)<input name="protein" type="number"></label><label class="f">Water (glasses)<input name="water" type="number"></label>
      <button class="btn" type="submit">Save goals</button></form></div></section>`;

  const days = () => S.get("days", {});
  function streak(d) { let n = 0; const t = new Date(); if (!d[day(t)]) t.setDate(t.getDate() - 1); while (d[day(t)]) { n++; t.setDate(t.getDate() - 1); } return n; }
  function lastN(d, k, n) { const out = []; for (let i = n - 1; i >= 0; i--) { const t = new Date(); t.setDate(t.getDate() - i); const v = d[day(t)]?.[k]; if (v != null && v !== "") out.push({ x: n - i, y: +v }); } return out; }
  const avg = (l) => (l.length ? l.reduce((a, p) => a + p.y, 0) / l.length : null);

  function paint() {
    const d = days(), g = S.get("goals", GOALS);
    const s = streak(d); $("#a-streak").textContent = s; $("#a-streak-s").textContent = s ? `day${s === 1 ? "" : "s"} logged in a row · ${Object.keys(d).length} in all` : "Log today to start one.";
    $("#a-goalbars").innerHTML = ["sleep", "steps", "train", "protein", "water"].map((k) => { const a = avg(lastN(d, k, 7)), goal = +g[k];
      if (!goal) return ""; const pct = a == null ? 0 : Math.min(100, (a / goal) * 100), f = FIELDS.find((x) => x[0] === k);
      return `<div class="gb"><div class="gb-h"><span>${f[1]}</span><span class="meta">${a == null ? "no days yet" : `${num(a, k === "sleep" ? 1 : 0)} of ${goal} ${f[2]}`}</span></div><div class="meter"><i style="width:${pct.toFixed(0)}%"></i></div></div>`; }).join("");
    for (const k of ["weight", "sleep", "steps", "train", "protein"]) {
      const l = lastN(d, k, 30), a = avg(l), f = FIELDS.find((x) => x[0] === k), first = l[0]?.y, last = l[l.length - 1]?.y;
      $("#tr-" + k).textContent = last == null ? "—" : `${num(last, k === "weight" || k === "sleep" ? 1 : 0)} ${f[2]}`;
      $("#tr-" + k + "-s").textContent = l.length ? `30-day average ${num(a, 1)}${l.length > 1 ? ` · ${last - first >= 0 ? "+" : ""}${num(last - first, 1)} since the first day logged` : ""}${k === "weight" && g.weight ? ` · ${num(last - g.weight, 1)} to go` : ""}` : "No days logged yet.";
      spark($("#sp-" + k), l, { empty: "Log a few days to see the line." });
    }
    const keys = Object.keys(d).sort().reverse();
    $("#a-rows").innerHTML = keys.map((k) => `<tr><td>${k}${d[k].what ? `<div class="meta">${esc(d[k].what)}</div>` : ""}</td>${FIELDS.map((f) => `<td class="n">${d[k][f[0]] ?? ""}</td>`).join("")}<td><button class="btn quiet small" data-del="${k}">Delete</button></td></tr>`).join("")
      || `<tr><td colspan="${FIELDS.length + 2}" class="empty">No days yet.</td></tr>`;
    $("#a-rows").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { if (confirm("Delete " + b.dataset.del + "?")) { const x = days(); delete x[b.dataset.del]; S.set("days", x); paint(); } }));
    const G2 = $("#a-goals"); for (const k of Object.keys(GOALS)) G2[k].value = g[k] ?? "";
  }
  function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  const F = $("#a-form");
  function fill() { const r = days()[F.date.value] || {}; for (const [k] of FIELDS) F[k].value = r[k] ?? ""; F.what.value = r.what || ""; }
  F.date.value = day(); fill(); F.date.addEventListener("change", fill);
  F.addEventListener("submit", (e) => { e.preventDefault(); const x = days(), r = {};
    for (const [k] of FIELDS) if (F[k].value !== "") r[k] = +F[k].value; if (F.what.value.trim()) r.what = F.what.value.trim();
    if (!Object.keys(r).length) { toast("Nothing to save yet"); return; } x[F.date.value] = r; S.set("days", x); toast("Saved"); paint(); });
  $("#a-goals").addEventListener("submit", (e) => { e.preventDefault(); const g = {}; for (const k of Object.keys(GOALS)) g[k] = e.target[k].value === "" ? null : +e.target[k].value; S.set("goals", g); toast("Goals saved"); paint(); });
  $("#export").onclick = () => download(`apollo_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  tabs(app, () => requestAnimationFrame(paint));
  paint();
})();
