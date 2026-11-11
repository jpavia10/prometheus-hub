/* Kairos Meridian v1 (Claude, 2026-11-05): the day, every Prometheus deadline (data/deadlines.json, rendered from every pillar's
   homework) next to Joseph's own events (this browser only), and a focus clock. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, tabs, field, G } = PK;
  const S = store("kairos");
  // Revamp (Sebastian, 2026-11-09): publish the fixed dates to the shared deadlines bus, and do the
  // same for Joseph's own events, so the desk and every other capability see one merged calendar.
  if (window.PB && window.KAIROS_FIXED) for (const f of KAIROS_FIXED)
    PB.deadlines.publish({ title: f.name, date: f.date, source: "kairos-fixed", kind: f.kind, ref: f.date + "|" + f.name });
  const app = $("#app");

  // a clock face with hands at 10:10
  field({ count: 900, at: [0.74, 0.34], scale: 0.24, glyph: (n) => [...G.ring(Math.round(n * 0.55), 1), ...G.ring(Math.round(n * 0.08), 0.06),
    ...G.line(Math.round(n * 0.12), 0, 0, -0.5, -0.36), ...G.line(Math.round(n * 0.16), 0, 0, 0.72, -0.5),
    ...Array.from({ length: 12 }, (_, i) => G.line(Math.round(n * 0.0075), Math.cos(i * Math.PI / 6) * 0.84, Math.sin(i * Math.PI / 6) * 0.84, Math.cos(i * Math.PI / 6) * 0.95, Math.sin(i * Math.PI / 6) * 0.95)).flat()] });

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-now" aria-controls="p-now">Now</button>
      <button class="tab" role="tab" id="t-week" aria-controls="p-week">Week</button>
      <button class="tab" role="tab" id="t-due" aria-controls="p-due">Every deadline</button>
      <button class="tab" role="tab" id="t-add" aria-controls="p-add">Add an event</button>
    </div>
    <section id="p-now" role="tabpanel" class="grid">
      <div class="glass lit span-8"><div class="stat-k" id="k-date"></div><div class="stat-v big" id="k-clock">—</div>
        <div class="meter" style="margin:14px 0 6px"><i id="k-daybar" style="width:0"></i></div><div class="stat-s" id="k-daytext"></div></div>
      <div class="glass span-4"><h2>Next up</h2><div id="k-next" class="empty">Nothing due.</div></div>
      <div class="glass span-6"><h2>Focus clock</h2>
        <div class="stat-v" id="f-left">25:00</div><div class="meter" style="margin:10px 0"><i id="f-bar" style="width:0"></i></div>
        <div class="row-actions"><button class="btn small" data-min="25">25 min</button><button class="btn quiet small" data-min="50">50 min</button><button class="btn quiet small" data-min="90">90 min</button><button class="btn quiet small" id="f-stop">Stop</button></div>
        <p class="note" id="f-note">Pick a block. The page keeps time even if you switch tabs.</p></div>
      <div class="glass span-6"><h2>Today</h2><ul class="list" id="k-today"></ul></div>
    </section>
    <section id="p-week" role="tabpanel" class="grid"><div class="glass span-12"><h2>The next 14 days</h2><div id="k-week" class="weekgrid"></div></div></section>
    <section id="p-due" role="tabpanel" class="grid"><div class="glass span-12"><h2>Every open deadline in Prometheus</h2>
      <div class="tabs" id="k-filter"></div><div class="scroll-x"><table class="t"><thead><tr><th>Due</th><th>Pillar</th><th>Who</th><th>Task</th></tr></thead><tbody id="k-due"></tbody></table></div>
      <p class="note" id="k-src"></p></div></section>
    <section id="p-add" role="tabpanel" class="grid"><div class="glass span-12"><h2>Your own event</h2>
      <form class="form" id="k-form"><label class="f wide">What<input name="title" required maxlength="120" placeholder="Dentist, call the lender, Titan photo session"></label>
        <label class="f">Day<input name="date" type="date" required></label><label class="f">Time<input name="time" type="time"></label>
        <label class="f">Pillar<select name="pillar"><option value="">None</option><option>Titan</option><option>Midas</option><option>Hearth</option><option>Apollo</option><option>Hermes</option><option>Icarus</option><option>Argus</option></select></label>
        <button class="btn" type="submit">Add</button></form>
      <h2 style="margin-top:22px">Your events</h2><ul class="list" id="k-mine"></ul></div></section>`;

  let deadlines = [], src = "";
  const daysFrom = (iso) => Math.round((new Date(iso + "T12:00:00") - new Date(day() + "T12:00:00")) / 864e5);
  const rel = (n) => (n === 0 ? "today" : n === 1 ? "tomorrow" : n === -1 ? "yesterday" : n < 0 ? `${-n} days late` : `in ${n} days`);
  const all = () => [...deadlines.map((d) => ({ date: d.due, title: `${d.id} · ${d.title}`, who: d.ai_name, pillar: d.pillar_name, kind: "task" })),
                     ...(window.PB ? PB.deadlines.list().filter((d) => !d.done).map((d) => ({ date: d.date, time: d.time, title: d.title, who: d.source === "kairos-fixed" ? "Fixed date" : d.source, pillar: d.source === "kairos-fixed" ? "Calendar" : "", kind: d.kind || "due" })) : []),
                     ...S.list("events").map((e) => ({ date: e.date, time: e.time, title: e.title, who: "You", pillar: e.pillar || "", kind: "mine", id: e.id }))]
                    .filter((x) => x.date).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));

  function tick() {
    const now = new Date();
    $("#k-clock").textContent = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    $("#k-date").textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const start = new Date(now); start.setHours(7, 0, 0, 0); const end = new Date(now); end.setHours(23, 0, 0, 0);
    const k = Math.max(0, Math.min(1, (now - start) / (end - start)));
    $("#k-daybar").style.width = (k * 100).toFixed(1) + "%";
    $("#k-daytext").textContent = k <= 0 ? "The day has not started (7 AM to 11 PM)." : k >= 1 ? "The waking day is over." : `${Math.round(k * 100)} % of the waking day gone · ${Math.round((end - now) / 36e5 * 10) / 10} h left`;
    focusTick();
  }

  function paint() {
    const items = all(), today = day();
    const next = items.find((x) => x.date >= today);
    $("#k-next").className = next ? "" : "empty";
    $("#k-next").innerHTML = next ? `<h3>${esc(next.title)}</h3><div class="meta">${esc(next.pillar)}${next.pillar ? " · " : ""}${esc(next.who)} · ${rel(daysFrom(next.date))}</div>` : "Nothing due.";
    const late = items.filter((x) => x.date < today && x.kind === "task").length;
    const list = items.filter((x) => x.date === today);
    $("#k-today").innerHTML = (late ? `<li><span class="warn">${late} task${late === 1 ? "" : "s"} past due</span><span class="meta">see Every deadline</span></li>` : "")
      + (list.length ? list.map((x) => `<li><span>${esc(x.title)}</span><span class="meta">${x.time || esc(x.who)}</span></li>`).join("") : `<li class="empty">Nothing on today.</li>`);
    // week grid
    const wk = $("#k-week"); wk.innerHTML = "";
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i); const iso = day(d), its = items.filter((x) => x.date === iso);
      wk.append(h("div.wday" + (i === 0 ? ".today" : ""), null, h("div.wd-h", null, d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })),
        ...its.slice(0, 4).map((x) => h("div.wd-i" + (x.kind === "mine" ? ".mine" : ""), { title: x.title }, x.title)), its.length > 4 ? h("div.meta", null, `+${its.length - 4} more`) : null));
    }
    // all deadlines + filter by pillar
    const pillars = [...new Set(deadlines.map((d) => d.pillar_name))];
    const f = $("#k-filter"); const cur = f.dataset.cur || "";
    f.innerHTML = ""; ["", ...pillars].forEach((p) => f.append(h("button.chip" + (p === cur ? ".on" : ""), { type: "button", onclick: () => { f.dataset.cur = p; paint(); } }, p || "All")));
    $("#k-due").innerHTML = deadlines.filter((d) => !cur || d.pillar_name === cur).map((d) => { const n = daysFrom(d.due);
      return `<tr><td class="${n < 0 ? "warn" : ""}">${d.due}<div class="meta">${rel(n)}</div></td><td>${esc(d.pillar_name)}</td><td>${esc(d.ai_name)}</td><td>${esc(d.id)} · ${esc(d.title)}${d.state === "next" ? ' <span class="chip">waits for its input</span>' : ""}</td></tr>`; }).join("")
      || `<tr><td colspan="4" class="empty">No deadlines loaded.</td></tr>`;
    $("#k-src").textContent = src;
    $("#k-mine").innerHTML = "";
    const mine = S.list("events").sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    if (!mine.length) $("#k-mine").append(h("li.empty", null, "None yet."));
    mine.forEach((e) => $("#k-mine").append(h("li", null, h("span", null, `${e.date}${e.time ? " " + e.time : ""} · ${e.title}`),
      h("button.btn.quiet.small", { type: "button", onclick: () => { const prev = S.list("events"); S.remove("events", e.id); if (window.PB) PB.deadlines.unpublish("kairos", e.id); paint(); toast("Removed", 6000, () => { S.set("events", prev); prev.filter((x) => x.date).forEach((x) => { if (window.PB) PB.deadlines.publish({ title: x.title, date: x.date, time: x.time || undefined, source: "kairos", kind: "mine", ref: x.id }); }); paint(); }); } }, "Remove"))));
  }
  function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  // focus clock: the end time is stored, so a reload or a background tab keeps it
  let fEnd = S.get("focus_end", 0), fLen = S.get("focus_len", 25);
  function focusTick() {
    const left = Math.max(0, fEnd - Date.now());
    $("#f-left").textContent = fEnd ? `${String(Math.floor(left / 60000)).padStart(2, "0")}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}` : `${fLen}:00`;
    $("#f-bar").style.width = fEnd ? (100 - (left / (fLen * 60000)) * 100).toFixed(1) + "%" : "0";
    if (fEnd && left === 0) { fEnd = 0; S.set("focus_end", 0); S.add("focus", { minutes: fLen, date: day() }); toast("Focus block done"); try { navigator.vibrate && navigator.vibrate([80, 60, 80]); } catch (_) {} }
    const done = S.list("focus").filter((x) => x.date === day()).reduce((a, x) => a + x.minutes, 0);
    $("#f-note").textContent = done ? `${done} focused minutes today.` : "Pick a block. The page keeps time even if you switch tabs.";
  }
  app.querySelectorAll("[data-min]").forEach((b) => b.addEventListener("click", () => { fLen = +b.dataset.min; fEnd = Date.now() + fLen * 60000; S.set("focus_end", fEnd); S.set("focus_len", fLen); focusTick(); }));
  $("#f-stop").addEventListener("click", () => { fEnd = 0; S.set("focus_end", 0); focusTick(); });

  $("#k-form").date.value = day();
  $("#k-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    const ev = S.add("events", { title: f.title.value.trim(), date: f.date.value, time: f.time.value, pillar: f.pillar.value });
    if (window.PB) PB.deadlines.publish({ title: ev.title, date: ev.date, time: ev.time || undefined, source: "kairos", kind: "mine", ref: ev.id });
    f.title.value = ""; toast("Added"); paint(); });

  $("#export").onclick = () => download(`kairos_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };

  tabs(app);
  paint(); tick(); setInterval(tick, 1000);
  fetch("../../data/deadlines.json", { cache: "no-cache" }).then((r) => r.json()).then((d) => {
    deadlines = d.tasks || []; src = `From every pillar's homework, rendered ${d.updated || "recently"}.`; paint();
  }).catch(() => { src = "Could not load the deadlines (offline?). Your own events still show."; paint(); });
})();
