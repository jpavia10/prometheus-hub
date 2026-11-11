/* Apollo data lookup (Sebastian, 2026-11-09): the researched food + exercise datasets as a working
   reference under Apollo's own log. Meal builder totals nutrients; meals save to Apollo's store
   under their own key (the day-log schema is untouched). Energy figures are MET estimates. */
(function () {
  "use strict";
  const { $, h, num, day, toast, store } = PK;
  const S = store("apollo");
  const root = document.getElementById("apollo-data"); if (!root) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Food lookup — 900 USDA foods (per 100 g)</h2>
    <form class="form"><label class="f wide">Search foods<input id="fd-q" type="search" placeholder="chicken breast, oats, salmon…"></label></form>
    <div id="fd-list"></div>
    <h3 style="margin-top:16px">Meal builder</h3><div id="fd-meal" class="stat-s">Tap a food to add 100 g. Totals update as you build.</div>
    <div class="row-actions" style="margin-top:8px"><button class="btn small" id="fd-save" type="button">Save meal to Apollo</button><button class="btn quiet small" id="fd-clear" type="button">Clear</button></div>
    <div id="fd-saved" class="stat-s" style="margin-top:8px"></div></div>
  <div class="glass" style="margin-top:14px"><h2>Exercise lookup — 450 activities (MET)</h2>
    <form class="form"><label class="f wide">Search activities<input id="ex-q" type="search" placeholder="walking, rowing, cycling…"></label>
    <label class="f">Your weight (kg)<input id="ex-kg" type="number" value="90" min="30" max="300"></label>
    <label class="f">Minutes<input id="ex-min" type="number" value="30" min="1" max="600"></label></form>
    <div id="ex-list"></div>
    <p class="note">Energy is the standard MET estimate (MET × 3.5 × kg ÷ 200 per minute) — an estimate, not a measurement.</p></div>`;
  let meal = [];
  const totals = () => meal.reduce((t, f) => ({ kcal: t.kcal + f.kcal, p: t.p + f.p, c: t.c + f.c, f: t.f + f.f, fib: t.fib + f.fib }), { kcal: 0, p: 0, c: 0, f: 0, fib: 0 });
  function paintMeal() {
    const t = totals();
    $("#fd-meal").innerHTML = meal.length
      ? meal.map((f, i) => `${esc(f.n)} <button class="btn quiet small" data-rm="${i}" type="button">×</button>`).join("<br>")
        + `<br><b>${Math.round(t.kcal)} kcal · protein ${num(t.p, 0)} g · carbs ${num(t.c, 0)} g · fat ${num(t.f, 0)} g · fiber ${num(t.fib, 0)} g</b>`
      : "Tap a food to add 100 g. Totals update as you build.";
    $("#fd-meal").querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { meal.splice(+b.dataset.rm, 1); paintMeal(); }));
    const saved = S.list("meals").filter((m) => m.date === day());
    $("#fd-saved").textContent = saved.length ? `Saved today: ${saved.map((m) => `${m.items.length} foods, ${Math.round(m.totals.kcal)} kcal`).join(" · ")}` : "";
  }
  function paintFoods() {
    const q = ($("#fd-q").value || "").toLowerCase();
    const rows = APOLLO_FOODS.filter((f) => !q || f.n.toLowerCase().includes(q)).slice(0, 12);
    $("#fd-list").innerHTML = rows.map((f) => `<div class="kv"><span>${esc(f.n)}</span><b>${f.kcal} kcal · P ${f.p} · C ${f.c} · F ${f.f}</b> <button class="btn quiet small" data-add="${esc(f.n)}" type="button">+ add</button></div>`).join("") || `<p class="empty">No food matches.</p>`;
    $("#fd-list").querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => { const f = APOLLO_FOODS.find((x) => x.n === b.dataset.add); if (f) { meal.push(f); paintMeal(); } }));
  }
  function paintEx() {
    const q = ($("#ex-q").value || "").toLowerCase(), kg = +$("#ex-kg").value || 90, min = +$("#ex-min").value || 30;
    const rows = APOLLO_EXERCISES.filter((e) => !q || e.n.toLowerCase().includes(q)).slice(0, 12);
    $("#ex-list").innerHTML = rows.map((e) => { const kcal = Math.round(e.met * 3.5 * kg / 200 * min); return `<div class="kv"><span>${esc(e.n)}</span><b>MET ${e.met} · ~${kcal} kcal / ${min} min</b></div>`; }).join("") || `<p class="empty">No activity matches.</p>`;
  }
  $("#fd-q").addEventListener("input", paintFoods);
  $("#ex-q").addEventListener("input", paintEx); $("#ex-kg").addEventListener("input", paintEx); $("#ex-min").addEventListener("input", paintEx);
  $("#fd-clear").onclick = () => { meal = []; paintMeal(); };
  $("#fd-save").onclick = () => { if (!meal.length) { toast("Build a meal first"); return; } S.add("meals", { date: day(), items: meal.map((f) => f.n), totals: totals() }); meal = []; paintMeal(); toast("Meal saved"); };
  paintFoods(); paintEx(); paintMeal();
})();
