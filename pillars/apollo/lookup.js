/* Apollo data lookup v2 (2026-11-13): USDA foods with portion gram scaling -> carries kcal & protein directly
   into today's Apollo day log; MET exercises scaled to latest logged weight in lb -> kg; plus 40-biomarker reference panel. */
(function () {
  "use strict";
  const { $, num, day, toast, store } = PK;
  const S = store("apollo");
  const root = document.getElementById("apollo-data"); if (!root) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function latestWeightKg() {
    const days = S.get("days", {});
    for (const d of Object.keys(days).sort().reverse()) {
      const w = Number(days[d] && days[d].weight);
      if (w > 40) return { lb: w, kg: +(w / 2.20462).toFixed(1), from: d };
    }
    return { lb: 198, kg: 90, from: null };
  }

  const wInfo = latestWeightKg();
  root.innerHTML = `<div class="glass"><h2>Food lookup — 900 USDA foods (scalable portion)</h2>
    <form class="form"><label class="f wide">Search foods<input id="fd-q" type="search" placeholder="chicken breast, oats, salmon…"></label>
    <label class="f">Portion (g)<input id="fd-g" type="number" value="100" min="5" max="2000" step="5"></label></form>
    <div id="fd-list"></div>
    <h3 style="margin-top:16px">Meal builder</h3><div id="fd-meal" class="stat-s">Tap a food to add your chosen portion.</div>
    <div class="row-actions" style="margin-top:8px"><button class="btn small" id="fd-save" type="button">Save meal & add to today's day log</button><button class="btn quiet small" id="fd-clear" type="button">Clear</button></div>
    <div id="fd-saved" class="stat-s" style="margin-top:8px"></div></div>
  <div class="glass" style="margin-top:14px"><h2>Exercise lookup — 450 activities (MET · auto weight)</h2>
    <form class="form"><label class="f wide">Search activities<input id="ex-q" type="search" placeholder="walking, rowing, cycling…"></label>
    <label class="f">Weight (kg) ${wInfo.from ? `· from ${wInfo.lb} lb (${wInfo.from})` : ""}<input id="ex-kg" type="number" value="${wInfo.kg}" min="30" max="300" step="0.5"></label>
    <label class="f">Minutes<input id="ex-min" type="number" value="30" min="1" max="600"></label></form>
    <div id="ex-list"></div>
    <p class="note">Energy is MET × 3.5 × kg ÷ 200 per minute. Tap "+ log" on any exercise to add its minutes to today's Apollo training ring.</p></div>`;

  let meal = [];
  const totals = () => meal.reduce((t, f) => ({ kcal: t.kcal + f.kcal, p: t.p + f.p, c: t.c + f.c, f: t.f + f.f, fib: t.fib + f.fib }), { kcal: 0, p: 0, c: 0, f: 0, fib: 0 });

  function paintMeal() {
    const t = totals();
    $("#fd-meal").innerHTML = meal.length
      ? meal.map((f, i) => `${esc(f.n)} (${f.grams}g) <button class="btn quiet small" data-rm="${i}" type="button">×</button>`).join("<br>")
        + `<br><b>${Math.round(t.kcal)} kcal · protein ${num(t.p, 0)} g · carbs ${num(t.c, 0)} g · fat ${num(t.f, 0)} g · fiber ${num(t.fib, 0)} g</b>`
      : "Tap a food above to build a meal. Totals sync to Today when saved.";
    $("#fd-meal").querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { meal.splice(+b.dataset.rm, 1); paintMeal(); }));
    const saved = S.list("meals").filter((m) => m.date === day());
    $("#fd-saved").textContent = saved.length ? `Saved today: ${saved.map((m) => `${m.items.length} items (${Math.round(m.totals.kcal)} kcal, ${Math.round(m.totals.p)}g P)`).join(" · ")}` : "";
  }

  function paintFoods() {
    const q = ($("#fd-q").value || "").toLowerCase();
    const g = Math.max(1, +$("#fd-g").value || 100), k = g / 100;
    const rows = (window.APOLLO_FOODS || []).filter((f) => !q || f.n.toLowerCase().includes(q)).slice(0, 12);
    $("#fd-list").innerHTML = rows.map((f) => `<div class="kv"><span>${esc(f.n)} <small class="meta">(${g}g)</small></span><b>${Math.round(f.kcal * k)} kcal · P ${num(f.p * k, 1)} · C ${num(f.c * k, 1)} · F ${num(f.f * k, 1)}</b> <button class="btn quiet small" data-add="${esc(f.n)}" type="button">+ ${g}g</button></div>`).join("")
      || `<p class="empty">No matches.</p>`;
    $("#fd-list").querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => {
      const f = (window.APOLLO_FOODS || []).find((x) => x.n === b.dataset.add);
      if (!f) return;
      meal.push({ n: f.n, grams: g, kcal: f.kcal * k, p: f.p * k, c: f.c * k, f: f.f * k, fib: (f.fib || 0) * k });
      paintMeal();
    }));
  }

  function paintEx() {
    const q = ($("#ex-q").value || "").toLowerCase(), kg = +$("#ex-kg").value || 90, min = +$("#ex-min").value || 30;
    const rows = (window.APOLLO_EXERCISES || []).filter((e) => !q || e.n.toLowerCase().includes(q)).slice(0, 12);
    $("#ex-list").innerHTML = rows.map((e) => {
      const kcal = Math.round(e.met * 3.5 * kg / 200 * min);
      return `<div class="kv"><span>${esc(e.n)}</span><b>MET ${e.met} · ~${kcal} kcal / ${min}m</b> <button class="btn quiet small" data-ex="${esc(e.n)}" data-kcal="${kcal}" type="button">+ ${min}m</button></div>`;
    }).join("") || `<p class="empty">No matches.</p>`;
    $("#ex-list").querySelectorAll("[data-ex]").forEach((b) => (b.onclick = () => {
      const today = day(), days = S.get("days", {}), cur = days[today] || {};
      cur.train = Math.round((+cur.train || 0) + min);
      cur.what = [cur.what, `${b.dataset.ex} (${min}m ~${b.dataset.kcal} kcal)`].filter(Boolean).join(" · ").slice(0, 160);
      days[today] = cur; S.set("days", days);
      toast(`Added ${min} min training to Today`);
    }));
  }

  $("#fd-q").addEventListener("input", paintFoods);
  $("#fd-g").addEventListener("input", paintFoods);
  $("#ex-q").addEventListener("input", paintEx); $("#ex-kg").addEventListener("input", paintEx); $("#ex-min").addEventListener("input", paintEx);
  $("#fd-clear").onclick = () => { meal = []; paintMeal(); };
  $("#fd-save").onclick = () => {
    if (!meal.length) { toast("Build a meal first"); return; }
    const t = totals(), today = day();
    S.add("meals", { date: today, items: meal.map((f) => `${f.n} (${f.grams}g)`), totals: t });
    const days = S.get("days", {}), cur = days[today] || {};
    cur.calories = Math.round((+cur.calories || 0) + t.kcal);
    cur.protein = Math.round((+cur.protein || 0) + t.p);
    days[today] = cur; S.set("days", days);
    const form = document.getElementById("a-form");
    if (form && form.date.value === today) { form.calories.value = cur.calories; form.protein.value = cur.protein; }
    meal = []; paintMeal(); toast(`Saved meal & synced +${Math.round(t.kcal)} kcal, +${Math.round(t.p)}g P to Today`);
  };

  /* 40-Biomarker Longevity & Clinical Reference (APO-GEM-02) */
  const BIO = [
    ["ApoB", "Lipids", "< 90 mg/dL", "40–70 mg/dL"], ["Lp(a)", "Lipids", "< 30 mg/dL", "< 20 mg/dL"], ["LDL-C", "Lipids", "< 100 mg/dL", "50–80 mg/dL"], ["HDL-C", "Lipids", "> 40 mg/dL", "55–80 mg/dL"], ["Triglycerides", "Lipids", "< 150 mg/dL", "45–80 mg/dL"], ["non-HDL-C", "Lipids", "< 130 mg/dL", "< 90 mg/dL"], ["TG/HDL Ratio", "Lipids", "< 3.0", "< 1.5"],
    ["Fasting Glucose", "Metabolic", "65–99 mg/dL", "72–88 mg/dL"], ["HbA1c", "Metabolic", "< 5.7 %", "4.8–5.3 %"], ["Fasting Insulin", "Metabolic", "2.6–24.9 uIU/mL", "2.0–6.0 uIU/mL"], ["HOMA-IR", "Metabolic", "< 2.5", "< 1.2"], ["Uric Acid", "Metabolic", "3.5–7.2 mg/dL", "4.0–5.8 mg/dL"],
    ["hs-CRP", "Inflammation", "< 3.0 mg/L", "< 0.6 mg/L"], ["Homocysteine", "Inflammation", "< 15 umol/L", "5–8 umol/L"], ["ESR", "Inflammation", "0–15 mm/hr", "0–8 mm/hr"],
    ["Ferritin", "Iron & Blood", "30–400 ng/mL", "60–150 ng/mL"], ["Serum Iron", "Iron & Blood", "50–175 ug/dL", "80–140 ug/dL"], ["TIBC", "Iron & Blood", "250–450 ug/dL", "260–360 ug/dL"], ["Transferrin Sat", "Iron & Blood", "15–55 %", "25–42 %"], ["Hemoglobin", "Iron & Blood", "13.5–17.5 g/dL", "14.5–16.5 g/dL"], ["Hematocrit", "Iron & Blood", "38.8–50.0 %", "42–48 %"], ["WBC", "Iron & Blood", "3.8–10.8 K/uL", "4.5–7.0 K/uL"], ["Platelets", "Iron & Blood", "140–400 K/uL", "180–300 K/uL"], ["RDW", "Iron & Blood", "11.5–15.4 %", "11.5–13.0 %"],
    ["ALT", "Liver & Kidney", "7–55 U/L", "12–25 U/L"], ["AST", "Liver & Kidney", "8–48 U/L", "14–28 U/L"], ["GGT", "Liver & Kidney", "0–65 U/L", "10–24 U/L"], ["Bilirubin Total", "Liver & Kidney", "0.2–1.2 mg/dL", "0.4–1.0 mg/dL"], ["Creatinine", "Liver & Kidney", "0.7–1.3 mg/dL", "0.8–1.15 mg/dL"], ["eGFR", "Liver & Kidney", "> 60 mL/min", "> 90 mL/min"], ["Cystatin C", "Liver & Kidney", "0.5–1.0 mg/L", "0.6–0.85 mg/L"],
    ["TSH", "Thyroid", "0.45–4.5 mIU/L", "0.8–2.2 mIU/L"], ["Free T4", "Thyroid", "0.82–1.77 ng/dL", "1.1–1.5 ng/dL"], ["Free T3", "Thyroid", "2.0–4.4 pg/mL", "2.9–3.9 pg/mL"],
    ["Total Testosterone", "Hormones", "264–916 ng/dL", "500–850 ng/dL"], ["Free Testosterone", "Hormones", "8.7–25.1 pg/mL", "14–24 pg/mL"], ["SHBG", "Hormones", "16.5–55.9 nmol/L", "25–45 nmol/L"], ["AM Cortisol", "Hormones", "6.2–19.4 ug/dL", "10–16 ug/dL"],
    ["25-OH Vitamin D", "Micronutrients", "30–100 ng/mL", "45–70 ng/mL"], ["RBC Magnesium", "Micronutrients", "4.2–6.8 mg/dL", "5.4–6.5 mg/dL"]
  ];
  const bioBox = document.getElementById("apollo-biomarkers");
  if (bioBox) {
    bioBox.innerHTML = `<h2>Biomarker Reference — 40 Markers (Clinical vs Longevity Target)</h2>
      <form class="form"><label class="f wide">Filter 40 markers<input id="bio-q" type="search" placeholder="ApoB, ferritin, thyroid, testosterone…"></label></form>
      <div class="scroll-x"><table class="t"><thead><tr><th>Marker</th><th>Panel</th><th>Clinical</th><th>Optimal</th><th>Your latest</th></tr></thead><tbody id="bio-rows"></tbody></table></div>`;
    const paintBio = () => {
      const q = ($("#bio-q").value || "").toLowerCase(), vals = S.get("labs", {});
      const rows = BIO.filter((b) => !q || b[0].toLowerCase().includes(q) || b[1].toLowerCase().includes(q));
      $("#bio-rows").innerHTML = rows.map(([m, p, c, o]) => `<tr><td><b>${m}</b></td><td>${p}</td><td>${c}</td><td><b>${o}</b></td><td><input class="bio-in" data-bio="${m}" value="${esc(vals[m] || "")}" placeholder="—" style="max-width:90px"></td></tr>`).join("");
      $("#bio-rows").querySelectorAll(".bio-in").forEach((inp) => inp.addEventListener("change", () => {
        const cur = S.get("labs", {}); if (inp.value.trim()) cur[inp.dataset.bio] = inp.value.trim(); else delete cur[inp.dataset.bio]; S.set("labs", cur); toast("Saved biomarker");
      }));
    };
    $("#bio-q").addEventListener("input", paintBio);
    paintBio();
  }

  paintFoods(); paintEx(); paintMeal();
})();
