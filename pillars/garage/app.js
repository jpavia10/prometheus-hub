/* Garage (Sebastian, 2026-11-09): 2025 Sorento Hybrid maintenance + fuel.
   Service items carry dual triggers (miles and/or months since last service). Due dates publish to
   the deadlines bus on every paint, so Time and the desk always show the current next service.
   Intervals are the factory severe-use schedule (2025 Sorento Hybrid manual s.9) since 2026-11-10. */
(function () {
  "use strict";
  const { $, h, money, num, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("garage");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.ring(Math.round(n * 0.55), 1), ...G.line(Math.round(n * 0.45), -0.7, 0.7, 0.7, -0.7)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (!S.get("services")) S.set("services", [
    { name: "Engine oil + filter", miles: 8000, months: 12 }, { name: "Tire rotation", miles: 8000, months: 12 },
    { name: "Cabin air filter", miles: null, months: 12 }, { name: "Engine air filter", miles: 24000, months: 24 },
    { name: "Brake fluid", miles: null, months: 24 }, { name: "Engine coolant", miles: 60000, months: 60 },
    { name: "Spark plugs", miles: 97500, months: null }, { name: "Hybrid system / HSG belt inspection", miles: 7500, months: 12 },
  ].map((x) => ({ id: Math.random().toString(36).slice(2, 8), ...x })));

  // Factory migration (2026-11-10): the starter intervals below were replaced by the 2025 Sorento
  // Hybrid owner's manual schedule (manual section 9), severe-use values — Frazier Park mountain
  // driving meets Kia's severe conditions. Items already serviced keep their name (history links by
  // name) and take the factory interval; unserviced items take the factory name too. Runs once.
  if (!S.get("factoryV2")) {
    const FACTORY = [{"name": "Engine oil + filter", "miles": 5000, "months": 6}, {"name": "Tire rotation", "miles": 8000, "months": 12}, {"name": "Cabin (climate control) air filter - replace", "miles": 16000, "months": 24}, {"name": "Engine air filter - replace", "miles": 24000, "months": 36}, {"name": "Brake fluid - replace", "miles": 48000, "months": 48}, {"name": "Spark plugs", "miles": 48000, "months": null}, {"name": "Engine coolant (first at 120k mi / 120 mo, then 24k/24)", "miles": 120000, "months": 120}, {"name": "Inverter coolant HEV (first at 120k mi / 120 mo, then 24k/24)", "miles": 120000, "months": 120}, {"name": "HSG belt - inspect", "miles": 5000, "months": 6}, {"name": "HSG belt - replace", "miles": 30000, "months": 24}, {"name": "Automatic transmission fluid - replace", "miles": 56000, "months": null}, {"name": "Rear differential oil - replace (AWD)", "miles": 72000, "months": null}, {"name": "Transfer case oil - replace (AWD)", "miles": 72000, "months": null}, {"name": "Multi-point inspection (brakes, suspension, steering, drive/prop shaft)", "miles": 8000, "months": 12}];
    const ALIAS = {"Engine oil + filter": "Engine oil + filter", "Tire rotation": "Tire rotation", "Cabin air filter": "Cabin (climate control) air filter - replace", "Engine air filter": "Engine air filter - replace", "Brake fluid": "Brake fluid - replace", "Spark plugs": "Spark plugs", "Engine coolant": "Engine coolant (first at 120k mi / 120 mo, then 24k/24)", "Hybrid system / HSG belt inspection": "HSG belt - inspect"};
    const serviced = new Set(S.list("history").map((x) => x.service));
    const byName = Object.fromEntries(FACTORY.map((f) => [f.name, f]));
    let svcs = S.get("services", []); const used = new Set();
    svcs = svcs.map((it) => {
      const f = byName[ALIAS[it.name] || it.name]; if (!f) return it;
      used.add(f.name);
      return serviced.has(it.name) ? { ...it, miles: f.miles, months: f.months } : { ...it, name: f.name, miles: f.miles, months: f.months };
    });
    for (const f of FACTORY) if (!used.has(f.name) && !svcs.some((x) => x.name === f.name))
      svcs.push({ id: Math.random().toString(36).slice(2, 8), ...f });
    S.set("services", svcs); S.set("factoryV2", 1);
  }
  const odo = () => S.get("odometer", 0);
  const lastFor = (name) => S.list("history").filter((x) => x.service === name).sort((a, b) => b.date.localeCompare(a.date))[0] || null;

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>The car</h2>
        <form class="form" id="g-odo"><label class="f">Current odometer (mi)<input name="odometer" type="number" min="0" step="1"></label>
        <label class="f">As of<input name="date" type="date"></label><button class="btn" type="submit">Update</button></form>
        <div id="g-fuel-sum" style="margin-top:10px"></div></div>
      <div class="glass span-12"><h2>Maintenance</h2><div id="g-services"></div>
        <p class="note">Factory schedule — 2025 Sorento Hybrid owner's manual, severe-use intervals (mountain driving qualifies; oil at 5,000 mi / 6 mo). Source: Kia manual section 9, via Grok's reset-day extraction. Logging a service resets both of its clocks and republishes the next due date.</p>
        <form class="form" id="g-addsvc"><label class="f wide">New service<input name="name" required maxlength="80"></label>
        <label class="f">Every (miles)<input name="miles" type="number" min="0"></label>
        <label class="f">Every (months)<input name="months" type="number" min="0"></label><button class="btn" type="submit">Add</button></form></div>
      <div class="glass span-12"><h2>Log a service</h2>
        <form class="form" id="g-log"><label class="f wide">Service<select name="service" id="g-log-sel"></select></label>
        <label class="f">Date<input name="date" type="date" required></label>
        <label class="f">Odometer<input name="odometer" type="number" min="0" required></label>
        <label class="f">Cost $<input name="cost" type="number" step="0.01" min="0"></label>
        <label class="f wide">Notes<input name="notes" maxlength="160"></label><button class="btn" type="submit">Log it</button></form>
        <div id="g-history" style="margin-top:10px"></div></div>
      <div class="glass span-12"><h2>Fuel</h2>
        <form class="form" id="g-fuel"><label class="f">Date<input name="date" type="date" required></label>
        <label class="f">Odometer<input name="odometer" type="number" min="0" required></label>
        <label class="f">Gallons<input name="gallons" type="number" step="0.001" min="0" required></label>
        <label class="f">Total cost $<input name="cost" type="number" step="0.01" min="0" required></label>
        <button class="btn" type="submit">Add fill</button></form>
        <div id="g-fills" style="margin-top:10px"></div></div>
    </section>`;

  function paint() {
    const now = { date: day(), odometer: odo() };
    $("#g-odo").odometer.value = odo() || ""; $("#g-odo").date.value = day();
    const svcs = S.get("services", []);
    $("#g-services").innerHTML = svcs.map((it) => {
      const st = GARAGE.dueStatus(it, lastFor(it.name), now);
      if (window.PB && st.dueDate && st.state !== "unknown") PB.deadlines.publish({ title: "Sorento: " + it.name, date: st.dueDate, source: "garage", kind: "service", ref: it.id });
      const cls = st.state === "overdue" ? "over" : st.state === "due soon" ? "soon" : "";
      const detail = st.state === "unknown" ? "no service logged yet" : `due ${st.dueDate || ""}${st.dueMiles ? ` / ${num(st.dueMiles)} mi` : ""} · ${st.milesLeft != null ? num(st.milesLeft) + " mi left" : ""}${st.daysLeft != null ? ` · ${st.daysLeft} days` : ""}`;
      return `<div class="kv"><span>${esc(it.name)} <span class="pill ${cls}">${st.state}</span><br><span class="stat-s">${detail} · every ${it.miles ? num(it.miles) + " mi" : ""}${it.miles && it.months ? " / " : ""}${it.months ? it.months + " mo" : ""}</span></span>
        <span><button class="btn quiet small" data-edit="${it.id}" type="button">Edit interval</button></span></div>`;
    }).join("") || `<p class="empty">No services defined.</p>`;
    $("#g-services").querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => {
      const it = svcs.find((x) => x.id === b.dataset.edit); if (!it) return;
      const mi = prompt("Every how many miles? (blank = none)", it.miles || ""); if (mi === null) return;
      const mo = prompt("Every how many months? (blank = none)", it.months || ""); if (mo === null) return;
      it.miles = mi ? +mi : null; it.months = mo ? +mo : null; S.set("services", svcs); paint();
    }));
    const sel = $("#g-log-sel"); sel.innerHTML = svcs.map((it) => `<option>${esc(it.name)}</option>`).join("");
    const hist = S.list("history").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    $("#g-history").innerHTML = hist.map((x) => `<div class="kv"><span>${x.date} · ${esc(x.service)} @ ${num(x.odometer)} mi</span><b>${x.cost ? money(x.cost) : ""}</b></div>`).join("") || `<p class="empty">No services logged yet.</p>`;
    const fills = S.list("fuel").sort((a, b) => b.odometer - a.odometer);
    const fs = GARAGE.fuelStats(S.list("fuel"));
    $("#g-fuel-sum").innerHTML = fs.mpg ? `<div class="kv"><span>Fuel economy (logged span)</span><b>${num(fs.mpg, 1)} MPG · ${money(fs.costPerMile, 3)}/mi · ${money(fs.totalCost)} over ${num(fs.miles)} mi</b></div>` : `<div class="stat-s">Log two fills to see MPG and cost per mile.</div>`;
    $("#g-fills").innerHTML = fills.slice(0, 10).map((x) => `<div class="kv"><span>${x.date} · ${num(x.odometer)} mi · ${num(x.gallons, 2)} gal</span><b>${money(x.cost)}</b></div>`).join("") || `<p class="empty">No fills logged yet.</p>`;
  }
  $("#g-odo").addEventListener("submit", (e) => { e.preventDefault(); S.set("odometer", +e.target.odometer.value || 0); toast("Odometer updated"); paint(); });
  $("#g-addsvc").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; const svcs = S.get("services", []);
    svcs.push({ id: Math.random().toString(36).slice(2, 8), name: f.name.value.trim(), miles: f.miles.value ? +f.miles.value : null, months: f.months.value ? +f.months.value : null });
    S.set("services", svcs); f.reset(); paint(); });
  $("#g-log").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("history", { service: f.service.value, date: f.date.value, odometer: +f.odometer.value || 0, cost: +f.cost.value || 0, notes: f.notes.value.trim() });
    if (+f.odometer.value > odo()) S.set("odometer", +f.odometer.value);
    toast("Service logged"); paint(); });
  $("#g-fuel").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("fuel", { date: f.date.value, odometer: +f.odometer.value || 0, gallons: +f.gallons.value || 0, cost: +f.cost.value || 0 }); f.reset(); toast("Fill logged"); paint(); });
  $("#g-log").date.value = day(); $("#g-fuel").date.value = day();
  $("#export").onclick = () => download(`garage_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
