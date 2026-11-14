/* Apollo Temple v3: 1-tap quick-fill presets, 7-axis Biometric Radar canvas, Weekly Clinical Review + Health Connect JSON import, USDA foods & 40 biomarkers. */
(function () {
  "use strict";
  const { $, h, num, day, toast, store, download, pickFile, tabs, spark, field, G } = PK;
  const S = store("apollo");
  const app = $("#app");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  field({ count: 950, at: [0.76, 0.3], scale: 0.25, glyph: (n) => Array.from({ length: 7 }, (_, i) => G.ring(Math.round(n / 7), 0.16 + i * 0.11)).flat() });

  const FIELDS = [
    ["weight", "Weight", "lb", "0.1"],
    ["sleep", "Sleep", "h", "0.1"],
    ["steps", "Steps", "", "1"],
    ["train", "Training", "min", "1"],
    ["calories", "Calories", "kcal", "1"],
    ["protein", "Protein", "g", "1"],
    ["water", "Water", "cups", "1"],
    ["mood", "Mood", "1-5", "1"]
  ];
  const GOALS = { weight: null, sleep: 7.5, steps: 8000, train: 30, calories: 2200, protein: 150, water: 8, mood: 4 };
  if (!S.get("goals")) S.set("goals", GOALS);

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-today" aria-controls="p-today">Today &amp; Radar</button>
      <button class="tab" role="tab" id="t-trend" aria-controls="p-trend">Review &amp; Trends</button>
      <button class="tab" role="tab" id="t-data" aria-controls="p-data">Foods &amp; 40 Labs</button>
      <button class="tab" role="tab" id="t-hist" aria-controls="p-hist">History &amp; Goals</button>
    </div>

    <section id="p-today" role="tabpanel" class="grid">
      <div class="glass lit span-4"><div class="stat-k">Logging Streak</div><div class="stat-v big" id="a-streak">0</div><div class="stat-s" id="a-streak-s">days logged in a row</div></div>
      <div class="glass span-4"><h2>7-Axis Biometric Radar</h2><canvas id="a-radar" style="width:100%;height:220px;display:block"></canvas></div>
      <div class="glass span-4"><h2>This Week vs Targets</h2><div id="a-goalbars"></div></div>

      <div class="glass span-12">
        <h2>Log a Day — 1-Tap Quick-Fill</h2>
        <div class="row-actions" style="flex-wrap:wrap;gap:8px;margin:8px 0 12px">
          <button class="btn small" id="aq-peak" type="button">Peak Day (8h · 10k · 45m · 165g P)</button>
          <button class="btn quiet small" id="aq-recov" type="button">Recovery Day (8.5h · 6k · 150g P)</button>
          <button class="btn quiet small" id="aq-copy" type="button">Carry Forward Yesterday</button>
          <button class="btn quiet small" id="aq-water" type="button">+2 Cups Water</button>
          <button class="btn quiet small" id="aq-steps" type="button">+2,000 Steps</button>
        </div>
        <form class="form" id="a-form">
          <label class="f">Day<input name="date" type="date" required></label>
          ${FIELDS.map(([k, l, u, st]) => `<label class="f">${l}${u ? " (" + u + ")" : ""}<input name="${k}" type="number" step="${st}" min="0" ${k === "mood" ? 'max="5"' : ""}></label>`).join("")}
          <label class="f wide">Training / food note<input name="what" maxlength="120" placeholder="Upper push + 800ml water + high-protein breakfast"></label>
          <div class="wide row-actions"><button class="btn" type="submit">Save day</button></div>
        </form>
      </div>
    </section>

    <section id="p-trend" role="tabpanel" class="grid">
      <div class="glass lit span-6"><h2>Weekly Clinical &amp; Habit Review (7d vs 30d)</h2><div id="a-review"></div></div>
      <div class="glass span-6"><h2>Import Health Connect / Apple Health JSON</h2>
        <p class="sub">Paste or load JSON array/object of dated vitals ({date, steps, sleep, weight, calories, protein}). Merged safely on this device.</p>
        <form class="form" id="a-hc-form">
          <label class="f wide"><textarea id="a-hc-json" rows="4" placeholder='[{"date":"2026-11-12","steps":9400,"sleep":7.8,"weight":181.5}]'></textarea></label>
          <div class="wide row-actions"><button class="btn small" type="submit">Merge JSON</button><button class="btn quiet small" id="a-hc-file" type="button">Load JSON file</button></div>
        </form>
      </div>
      ${["weight", "sleep", "steps", "train", "protein", "calories"].map((k) => `<div class="glass span-4"><div class="stat-k">${FIELDS.find((f) => f[0] === k)[1]}</div><div class="stat-v" id="at-${k}-v">—</div><div class="stat-s" id="at-${k}-s"></div><canvas class="spark" id="at-${k}" style="width:100%;height:70px;display:block"></canvas></div>`).join("")}
    </section>

    <section id="p-data" role="tabpanel" class="grid">
      <div id="apollo-data" class="span-12"></div>
      <div id="apollo-biomarkers" class="glass span-12"></div>
    </section>

    <section id="p-hist" role="tabpanel" class="grid">
      <div class="glass span-8 scroll-x"><h2>Logged Days</h2>
        <table class="t"><thead><tr><th>Day</th>${FIELDS.map((f) => `<th>${f[1]}</th>`).join("")}<th></th></tr></thead><tbody id="a-rows"></tbody></table>
      </div>
      <div class="glass span-4"><h2>Your Targets</h2>
        <form class="form" id="a-goals">${Object.keys(GOALS).map((k) => `<label class="f">${FIELDS.find((f) => f[0] === k)?.[1] || k}<input name="${k}" type="number" step="0.1" min="0"></label>`).join("")}
          <div class="wide row-actions"><button class="btn" type="submit">Save targets</button></div>
        </form>
      </div>
    </section>`;

  const days = () => S.get("days", {});
  const notify = () => window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "apollo", k: "days" } }));
  const backDate = (n) => { const d = new Date(day() + "T12:00:00"); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

  function lastN(d, k, n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) { const dt = backDate(i), r = d[dt]; if (r && r[k] != null) out.push({ d: dt, y: +r[k] }); }
    return out;
  }
  const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x.y, 0) / arr.length : null);
  function streak(d) {
    let n = 0;
    for (let i = 0; i < 365; i++) { const dt = backDate(i); if (d[dt]) n++; else if (i > 0) break; }
    return n;
  }

  function drawRadar(d, g) {
    const cv = document.getElementById("a-radar"); if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(220, cv.clientWidth || 260), H = cv.clientHeight || 220;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const axes = [
      ["Sleep", avg(lastN(d, "sleep", 7)), g.sleep || 7.5],
      ["Steps", avg(lastN(d, "steps", 7)), g.steps || 8000],
      ["Train", avg(lastN(d, "train", 7)), g.train || 30],
      ["Protein", avg(lastN(d, "protein", 7)), g.protein || 150],
      ["Water", avg(lastN(d, "water", 7)), g.water || 8],
      ["Kcal", avg(lastN(d, "calories", 7)), g.calories || 2200],
      ["Mood", avg(lastN(d, "mood", 7)), g.mood || 4]
    ];
    const cx = W / 2, cy = H / 2 + 4, R = Math.min(W, H) * 0.34;
    const cs = getComputedStyle(document.body), ac = cs.getPropertyValue("--accent").trim() || "#ff9d5c", ac2 = cs.getPropertyValue("--accent-2").trim() || "#4de8ff";
    c.strokeStyle = "rgba(255,255,255,0.1)"; c.lineWidth = 1;
    [0.33, 0.66, 1].forEach((f) => {
      c.beginPath();
      axes.forEach((_, i) => {
        const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
        const x = cx + Math.cos(a) * R * f, y = cy + Math.sin(a) * R * f;
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      });
      c.closePath(); c.stroke();
    });
    c.font = "10px system-ui, sans-serif"; c.fillStyle = "#b8c4de"; c.textAlign = "center";
    axes.forEach(([label], i) => {
      const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke();
      c.fillText(label, cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 14) + 3);
    });
    c.beginPath();
    axes.forEach(([, v, tgt], i) => {
      const ratio = v == null ? 0.1 : Math.max(0.1, Math.min(1.1, v / Math.max(1, tgt)));
      const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * R * ratio, y = cy + Math.sin(a) * R * ratio;
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    });
    c.closePath(); c.fillStyle = ac2 + "33"; c.fill(); c.strokeStyle = ac; c.lineWidth = 2; c.stroke();
  }

  function paint() {
    const d = days(), g = { ...GOALS, ...S.get("goals", GOALS) };
    const st = streak(d);
    $("#a-streak").textContent = st;
    $("#a-streak-s").textContent = Object.keys(d).length + " total days captured";
    $("#a-goalbars").innerHTML = ["sleep", "steps", "train", "protein", "water"].map((k) => {
      const a = avg(lastN(d, k, 7)), goal = g[k], f = FIELDS.find((x) => x[0] === k);
      if (!goal || !f) return "";
      const pct = a == null ? 0 : Math.min(100, (a / goal) * 100);
      return `<div class="gb"><div class="gb-h"><span>${f[1]}</span><span class="meta">${a == null ? "—" : num(a, k === "sleep" ? 1 : 0)} / ${goal} ${f[2]}</span></div><div class="gb-t"><div class="gb-f" style="width:${pct}%"></div></div></div>`;
    }).join("");
    drawRadar(d, g);

    const revRows = ["weight", "sleep", "steps", "train", "protein", "water"].map((k) => {
      const f = FIELDS.find((x) => x[0] === k), a7 = avg(lastN(d, k, 7)), a30 = avg(lastN(d, k, 30));
      const dec = k === "weight" || k === "sleep" ? 1 : 0;
      const delta = a7 != null && a30 != null ? a7 - a30 : null;
      const tgt = g[k] ? ` (target ${g[k]})` : "";
      return `<div class="kv"><span>${f[1]}${tgt}</span><b>7d: ${a7 == null ? "—" : num(a7, dec)} · 30d: ${a30 == null ? "—" : num(a30, dec)}${delta != null ? ` (${delta >= 0 ? "+" : ""}${num(delta, dec)})` : ""}</b></div>`;
    });
    const lastW = lastN(d, "weight", 30).slice(-1)[0]?.y;
    if (lastW) revRows.push(`<div class="kv"><span>Recommended protein anchor (~0.8g/lb)</span><b>${Math.round(lastW * 0.8)} g/day</b></div>`);
    $("#a-review").innerHTML = revRows.join("");

    for (const k of ["weight", "sleep", "steps", "train", "protein", "calories"]) {
      const l = lastN(d, k, 30), a = avg(l), f = FIELDS.find((x) => x[0] === k);
      const dec = k === "weight" || k === "sleep" ? 1 : 0;
      $("#at-" + k + "-v").textContent = a == null ? "—" : num(a, dec) + (f[2] ? " " + f[2] : "");
      $("#at-" + k + "-s").textContent = l.length ? `${l.length}d · range ${num(Math.min(...l.map((x) => x.y)), dec)}–${num(Math.max(...l.map((x) => x.y)), dec)}` : "no entries yet";
      spark($("#at-" + k), l.map((x, i) => ({ x: i, y: x.y })));
    }

    const keys = Object.keys(d).sort().reverse().slice(0, 45);
    $("#a-rows").innerHTML = keys.map((k) => `<tr><td>${k}${d[k].what ? `<div class="meta">${esc(d[k].what)}</div>` : ""}</td>${FIELDS.map((f) => `<td>${d[k][f[0]] ?? "—"}</td>`).join("")}<td><button class="btn quiet small" data-del="${k}" type="button">×</button></td></tr>`).join("")
      || `<tr><td colspan="${FIELDS.length + 2}" class="empty">No days logged yet.</td></tr>`;
    $("#a-rows").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => {
      if (confirm("Delete " + b.dataset.del + "?")) { const x = days(); delete x[b.dataset.del]; S.set("days", x); toast("Deleted"); paint(); notify(); }
    }));

    const G2 = $("#a-goals"); for (const k of Object.keys(GOALS)) if (G2[k]) G2[k].value = g[k] ?? "";
  }

  const F = $("#a-form"); F.date.value = day();
  function fill() { const r = days()[F.date.value] || {}; for (const [k] of FIELDS) F[k].value = r[k] ?? ""; F.what.value = r.what || ""; }
  F.date.addEventListener("change", fill); fill();

  function saveForm(msg) {
    const x = days(), r = {};
    for (const [k] of FIELDS) if (F[k].value !== "") r[k] = +F[k].value;
    if (F.what.value.trim()) r.what = F.what.value.trim();
    if (!Object.keys(r).length) { toast("Nothing to save"); return; }
    x[F.date.value] = r; S.set("days", x); toast(msg || "Saved " + F.date.value); paint(); notify();
  }
  F.addEventListener("submit", (e) => { e.preventDefault(); saveForm(); });

  $("#aq-peak").onclick = () => {
    const lastW = lastN(days(), "weight", 30).slice(-1)[0]?.y;
    if (lastW && !F.weight.value) F.weight.value = lastW;
    F.sleep.value = 8; F.steps.value = 10000; F.train.value = 45; F.calories.value = 2250; F.protein.value = 165; F.water.value = 10; F.mood.value = 5;
    F.what.value = F.what.value || "Peak training + clean nutrition";
    saveForm("Peak Day saved");
  };
  $("#aq-recov").onclick = () => {
    const lastW = lastN(days(), "weight", 30).slice(-1)[0]?.y;
    if (lastW && !F.weight.value) F.weight.value = lastW;
    F.sleep.value = 8.5; F.steps.value = 6000; F.train.value = 20; F.protein.value = 150; F.water.value = 8; F.mood.value = 4;
    F.what.value = F.what.value || "Mobility & active recovery";
    saveForm("Recovery Day saved");
  };
  $("#aq-copy").onclick = () => {
    const d = days(), prev = Object.keys(d).filter((k) => k < F.date.value).sort().reverse()[0];
    if (!prev) { toast("No earlier day to copy"); return; }
    const r = d[prev]; for (const [k] of FIELDS) if (r[k] != null) F[k].value = r[k];
    saveForm("Carried forward from " + prev);
  };
  $("#aq-water").onclick = () => { F.water.value = (+F.water.value || 0) + 2; saveForm("+2 cups water"); };
  $("#aq-steps").onclick = () => { F.steps.value = (+F.steps.value || 0) + 2000; saveForm("+2,000 steps"); };

  function mergeHealthJson(rawText) {
    const parsed = JSON.parse(rawText);
    const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.days) ? parsed.days : Object.entries(parsed).map(([date, obj]) => ({ date, ...(obj || {}) })));
    const cur = days(); let count = 0;
    for (const row of list) {
      const dt = String(row.date || row.day || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) continue;
      const next = { ...(cur[dt] || {}) };
      for (const [k] of FIELDS) if (row[k] != null && !Number.isNaN(+row[k])) next[k] = +row[k];
      if (row.sleepHours != null) next.sleep = +row.sleepHours;
      if (row.stepCount != null) next.steps = +row.stepCount;
      cur[dt] = next; count++;
    }
    S.set("days", cur); toast(`Merged ${count} health days`); fill(); paint(); notify();
  }
  $("#a-hc-form").addEventListener("submit", (e) => {
    e.preventDefault();
    try { mergeHealthJson($("#a-hc-json").value); $("#a-hc-json").value = ""; }
    catch (err) { toast("Invalid JSON: " + err.message); }
  });
  $("#a-hc-file").onclick = async () => {
    const f = await pickFile(); if (!f) return;
    try { mergeHealthJson(await f.text()); } catch (err) { toast("Import error: " + err.message); }
  };

  $("#a-goals").addEventListener("submit", (e) => {
    e.preventDefault(); const g = {};
    for (const k of Object.keys(GOALS)) g[k] = e.target[k].value === "" ? null : +e.target[k].value;
    S.set("goals", g); toast("Targets saved"); paint(); notify();
  });

  $("#export").onclick = () => download(`apollo_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); fill(); paint(); notify(); } catch (e) { toast(e.message); } };

  tabs(app, (id) => { if (id === "p-today" || id === "p-trend") { fill(); paint(); } });
  paint();
})();
