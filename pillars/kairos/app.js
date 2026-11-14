/* Kairos Meridian v2: unified calendar + 20 cited focus methods + NL event quick-add + Deadline Collision & Holiday Overlap Risk radar. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, tabs, field, G } = PK;
  const S = store("kairos");
  const app = $("#app");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  field({ count: 950, at: [0.76, 0.3], scale: 0.24, glyph: (n) => [...G.ring(Math.round(n * 0.72), 0.78), ...G.line(Math.round(n * 0.14), 0, 0, 0, -0.62), ...G.line(Math.round(n * 0.14), 0, 0, 0.45, 0.18)] });

  const METHODS = window.KAIROS_METHODS || [{ id: "pomodoro", name: "Pomodoro (25/5)", work: 25, short: 5, source: "Cirillo (2006)", quote: "25 min work + 5 min rest" }];
  if (window.PB && window.KAIROS_FIXED) {
    for (const f of KAIROS_FIXED) PB.deadlines.publish({ title: f.name, date: f.date, source: "kairos-fixed", kind: f.kind, ref: f.date + "_" + f.name });
  }

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-now" aria-controls="p-now">Now &amp; Focus</button>
      <button class="tab" role="tab" id="t-risk" aria-controls="p-risk">Collisions &amp; Risk</button>
      <button class="tab" role="tab" id="t-week" aria-controls="p-week">Week</button>
      <button class="tab" role="tab" id="t-due" aria-controls="p-due">Every Deadline</button>
      <button class="tab" role="tab" id="t-add" aria-controls="p-add">Add Event</button>
    </div>

    <section id="p-now" role="tabpanel" class="grid">
      <div class="glass span-12">
        <h2>Natural-Language Quick Add</h2>
        <form class="form" id="k-nl-form">
          <label class="f wide">Type naturally<input id="k-nl" required maxlength="140" placeholder="school: TK packet tomorrow · dentist in 4 days 2pm · DMV renew 2026-11-20"></label>
          <button class="btn" type="submit">Parse &amp; Schedule</button>
        </form>
      </div>
      <div class="glass lit span-6"><h2>Today · <span id="k-today-label"></span></h2><div id="k-today"></div></div>
      <div class="glass span-6"><h2>Focus Clock · 20 Cited Methods</h2>
        <label class="f" style="margin-bottom:8px">Protocol<select id="k-method">${METHODS.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join("")}</select></label>
        <div id="k-method-cite" class="stat-s" style="margin-bottom:8px"></div>
        <div class="stat-v big" id="k-clock">25:00</div>
        <div class="stat-s" id="k-clock-s">Ready for your next block</div>
        <div class="row-actions" style="flex-wrap:wrap;gap:6px;margin-top:10px">
          <button class="btn small" id="k-start-method" type="button">Start Method</button>
          <button class="btn quiet small" data-min="25" type="button">25m</button>
          <button class="btn quiet small" data-min="52" type="button">52m</button>
          <button class="btn quiet small" data-min="90" type="button">90m</button>
          <button class="btn quiet small" id="f-stop" type="button">Stop</button>
        </div>
        <div class="stat-s" id="k-focus-stats" style="margin-top:10px"></div>
      </div>
    </section>

    <section id="p-risk" role="tabpanel" class="grid">
      <div class="glass lit span-12"><h2>Deadline Collision &amp; Holiday Overlap Radar</h2>
        <p class="sub">Automatically detects overdue tasks, crowded days (&ge;3 obligations), and deadlines landing on or adjacent to Federal Holidays, Tax Dates, or DST transitions.</p>
        <div id="k-risk-out" style="margin-top:10px"></div>
      </div>
    </section>

    <section id="p-week" role="tabpanel" class="grid"><div class="glass span-12"><h2>Next 14 Days</h2><div id="k-week"></div></div></section>
    <section id="p-due" role="tabpanel" class="grid"><div class="glass span-12"><h2>Every Published Obligation</h2><div id="k-all"></div></div></section>

    <section id="p-add" role="tabpanel" class="grid"><div class="glass span-12"><h2>Add Custom Event</h2>
      <form class="form" id="k-form">
        <label class="f wide">Title<input name="title" required maxlength="100"></label>
        <label class="f">Date<input name="date" type="date" required></label>
        <label class="f">Time<input name="time" type="time"></label>
        <label class="f">Area<input name="pillar" maxlength="30" placeholder="School, Garage, House…"></label>
        <button class="btn" type="submit">Add to calendar</button>
      </form></div></section>`;

  const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const allDeadlines = () => {
    const t = day();
    const bus = (window.PB ? PB.deadlines.list() : []).filter((b) => !b.done && b.source !== "kairos-fixed" && !(b.source === "kairos" && b.date < t));
    const fixed = (window.KAIROS_FIXED || []).filter((f) => f.date >= t).map((f) => ({ id: "fx_" + f.date, title: f.name, date: f.date, source: "kairos-fixed", kind: f.kind, fixed: true }));
    return [...bus, ...fixed].sort((a, b) => a.date.localeCompare(b.date));
  };

  function parseNL(raw) {
    const t = day(); let text = raw.trim(), kind = "event", date = t, time = "";
    const km = text.match(/^(school|deadline|due|appt)\s*:\s*(.+)$/i);
    if (km) { kind = km[1].toLowerCase() === "due" ? "deadline" : km[1].toLowerCase(); text = km[2].trim(); }
    const tm = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (tm) {
      let hh = +tm[1]; const mm = +(tm[2] || 0);
      if (tm[3].toLowerCase() === "pm" && hh < 12) hh += 12;
      if (tm[3].toLowerCase() === "am" && hh === 12) hh = 0;
      time = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      text = text.replace(tm[0], "").trim();
    }
    const iso = text.match(/\b(202\d-\d{2}-\d{2})\b/);
    if (iso) { date = iso[1]; text = text.replace(iso[0], "").trim(); }
    else if (/\btomorrow\b/i.test(text)) { date = addDays(t, 1); text = text.replace(/\btomorrow\b/i, "").trim(); }
    else if (/\btoday\b|\btonight\b/i.test(text)) { date = t; text = text.replace(/\btoday\b|\btonight\b/i, "").trim(); }
    else {
      const inM = text.match(/\bin\s+(\d{1,3})\s+days?\b/i);
      if (inM) { date = addDays(t, +inM[1]); text = text.replace(inM[0], "").trim(); }
      else {
        const wds = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const wM = text.match(/\b(?:next\s+)?(sun|mon|tue|wed|thu|fri|sat)(?:day|nesday|rsday|urday)?\b/i);
        if (wM) {
          const target = wds.indexOf(wM[1].toLowerCase().slice(0, 3));
          const cur = new Date(t + "T12:00:00").getDay();
          let diff = (target - cur + 7) % 7; if (diff === 0) diff = 7;
          date = addDays(t, diff); text = text.replace(wM[0], "").trim();
        }
      }
    }
    return { title: text.replace(/\s+/g, " ").trim() || raw.trim(), date, time, kind };
  }

  function paintMethodInfo() {
    const m = METHODS.find((x) => x.id === $("#k-method").value) || METHODS[0];
    $("#k-method-cite").innerHTML = `<b>${m.work}m</b> work · <b>${m.short}m</b> break — <em>${esc(m.source)}</em><br>"${esc(m.quote)}"`;
    if (!fEnd) { $("#k-clock").textContent = `${String(m.work).padStart(2, "0")}:00`; $("#k-clock-s").textContent = m.name; }
  }

  function paint() {
    const t = day(), rows = allDeadlines();
    $("#k-today-label").textContent = t;
    const todayRows = rows.filter((r) => r.date === t);
    $("#k-today").innerHTML = todayRows.map((r) => `<div class="kv"><span><b>${esc(r.title)}</b> <small class="stat-s">[${r.fixed ? r.kind : r.source}${r.time ? " · " + r.time : ""}]</small></span><b>Today</b></div>`).join("")
      || `<p class="empty">Nothing blocking today.</p>`;

    const wkLimit = addDays(t, 14);
    const wk = rows.filter((r) => r.date >= t && r.date <= wkLimit);
    $("#k-week").innerHTML = wk.map((r) => `<div class="kv"><span>${r.date}${r.time ? " " + r.time : ""} · <b>${esc(r.title)}</b></span><b>${r.fixed ? r.kind : r.source}</b></div>`).join("") || `<p class="empty">Clear for 14 days.</p>`;

    const box = $("#k-all"); box.innerHTML = "";
    rows.slice(0, 80).forEach((r) => {
      box.append(h("div.kv", null,
        h("span", null, `${r.date} · `, h("b", null, r.title), ` `, h("small.stat-s", null, `(${r.fixed ? r.kind : r.source})`)),
        r.fixed ? h("span.stat-s", null, "ref") : h("button.btn.quiet.small", { type: "button", onclick: () => { if (window.PB && r.id) PB.deadlines.setDone(r.id, true); toast("Marked done"); paint(); } }, "Done")
      ));
    });

    // Collision & Holiday Risk Analysis
    const fixedByDate = new Map();
    for (const fx of (window.KAIROS_FIXED || [])) {
      for (const offset of [-1, 0, 1]) {
        const dt = addDays(fx.date, offset);
        if (!fixedByDate.has(dt)) fixedByDate.set(dt, []);
        fixedByDate.get(dt).push(`${fx.name} (${offset === 0 ? "same day" : offset > 0 ? "day after" : "eve"})`);
      }
    }
    const mine = rows.filter((r) => !r.fixed);
    const byDate = {}; mine.forEach((r) => { byDate[r.date] = (byDate[r.date] || []); byDate[r.date].push(r); });
    const riskCards = [];
    const overdue = window.PB ? PB.deadlines.overdue(t) : [];
    overdue.forEach((o) => riskCards.push(`<div class="kv"><span><b class="down">OVERDUE</b> · ${o.date} · ${esc(o.title)}</span><b>${esc(o.source)}</b></div>`));
    Object.entries(byDate).forEach(([dt, list]) => {
      if (list.length >= 3) riskCards.push(`<div class="kv"><span><b class="warn">CLUSTER (${list.length} items)</b> · ${dt}: ${list.map((x) => esc(x.title)).join(", ")}</span><b>Congestion</b></div>`);
      if (fixedByDate.has(dt)) riskCards.push(`<div class="kv"><span><b class="warn">HOLIDAY/TAX OVERLAP</b> · ${dt} (${fixedByDate.get(dt)[0]}): ${list.map((x) => esc(x.title)).join(", ")}</span><b>Check hours</b></div>`);
    });
    $("#k-risk-out").innerHTML = riskCards.join("") || `<p class="empty">Zero overdue obligations, clusters (&ge;3/day), or holiday overlaps detected.</p>`;

    const fs = S.list("focus"), todayM = fs.filter((f) => f.date === t).reduce((s, f) => s + (+f.minutes || 0), 0);
    $("#k-focus-stats").textContent = `Logged today: ${todayM} min · All sessions: ${fs.length}`;
  }

  let fEnd = S.get("focus_end", 0), fLen = S.get("focus_len", 25);
  function focusTick() {
    if (!fEnd) { paintMethodInfo(); return; }
    const left = Math.max(0, Math.round((fEnd - Date.now()) / 1000));
    const m = Math.floor(left / 60), s = left % 60;
    $("#k-clock").textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    $("#k-clock-s").textContent = left ? "Focus block active" : "Block finished!";
    if (left === 0 && fEnd) {
      fEnd = 0; S.set("focus_end", 0); S.add("focus", { minutes: fLen, date: day(), method: $("#k-method").value });
      toast(`Focus block complete (+${fLen} min)`); paint();
    }
  }
  function startFocus(mins) {
    fLen = Math.max(1, mins); fEnd = Date.now() + fLen * 60000;
    S.set("focus_len", fLen); S.set("focus_end", fEnd); focusTick();
  }
  setInterval(focusTick, 1000);

  $("#k-method").addEventListener("change", paintMethodInfo);
  $("#k-start-method").onclick = () => { const m = METHODS.find((x) => x.id === $("#k-method").value) || METHODS[0]; startFocus(m.work); toast("Started " + m.name); };
  app.querySelectorAll("[data-min]").forEach((b) => (b.onclick = () => startFocus(+b.dataset.min)));
  $("#f-stop").onclick = () => { fEnd = 0; S.set("focus_end", 0); paintMethodInfo(); toast("Timer cleared"); };

  $("#k-nl-form").addEventListener("submit", (e) => {
    e.preventDefault(); const raw = $("#k-nl").value.trim(); if (!raw) return;
    const p = parseNL(raw);
    const ev = S.add("events", { title: p.title, date: p.date, time: p.time, pillar: p.kind });
    if (window.PB) PB.deadlines.publish({ title: p.title, date: p.date, time: p.time || null, source: "kairos", kind: p.kind, ref: ev.id });
    $("#k-nl").value = ""; toast(`Scheduled: ${p.title} on ${p.date}`); paint();
  });

  $("#k-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    const ev = S.add("events", { title: f.title.value.trim(), date: f.date.value, time: f.time.value || "", pillar: f.pillar.value.trim() });
    if (window.PB) PB.deadlines.publish({ title: ev.title, date: ev.date, time: ev.time || null, source: "kairos", kind: "event", ref: ev.id });
    f.reset(); toast("Added to calendar"); paint();
  });

  $("#export").onclick = () => download(`kairos_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };

  tabs(app, () => paint());
  paintMethodInfo(); paint(); focusTick();
})();
