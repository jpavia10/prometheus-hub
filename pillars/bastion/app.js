/* Bastion (Sebastian, 2026-11-09): preparedness inventory with live weights, expiry radar on the
   deadlines bus, scenario readiness checklists, paste-import, and a foreground NWS panel for
   Frazier Park (34.82057, -118.94543). No background monitoring is promised or implied. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("bastion");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.poly(Math.round(n * 0.7), [[-0.8, 0.6], [0, -0.8], [0.8, 0.6], [-0.8, 0.6]]), ...G.ring(Math.round(n * 0.3), 0.18)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CATS = ["water", "food", "shelter", "warmth", "power", "light", "medical", "tools", "comms", "documents", "other"];
  const LOCS = ["bag", "house", "car"];
  const SCENARIOS = {
    "72-hour bag": ["Water (3L+)", "Filtration or purification", "Food for 3 days", "Shelter / tarp", "Warm layer + rain shell", "Headlamp + batteries", "First aid kit", "Fire kit", "Knife / multitool", "Cash + documents copies", "Phone battery bank", "Meds (7-day buffer)"],
    "Car kit": ["Water (1 gal)", "Blanket", "Jumper pack", "Tire repair + inflator", "Flashlight", "Snacks", "Ice scraper / chains as season needs", "Paper map of the mountain exits"],
    "House shelter-in": ["Water storage filled", "Pantry buffer (2 weeks)", "Propane / heat backup checked", "Flashlights + lantern batteries", "Generator or power station charged", "Pipes / freeze prep done", "Car fueled above half", "Medications buffer"],
  };

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Storm watch — Frazier Park</h2><div id="b-wx" class="stat-s">Loading the National Weather Service outlook…</div></div>
      <div class="glass span-12"><h2>Inventory</h2><div id="b-sum"></div><div id="b-list" style="margin-top:8px"></div></div>
      <div class="glass span-6"><h2>Add an item</h2>
        <form class="form" id="b-form">
          <label class="f wide">Name<input name="name" required maxlength="100"></label>
          <label class="f">Category<select name="category">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
          <label class="f">Location<select name="location">${LOCS.map((l) => `<option>${l}</option>`).join("")}</select></label>
          <label class="f">Qty<input name="qty" type="number" min="1" value="1"></label>
          <label class="f">Weight each (oz)<input name="weightOz" type="number" step="0.1" min="0" value="0"></label>
          <label class="f">Expires<input name="expiry" type="date"></label>
          <button class="btn" type="submit">Add</button></form></div>
      <div class="glass span-6"><h2>Paste-import a list</h2>
        <p class="stat-s">One item per line — from your "Bugout gear" list or anywhere. Understands "2x Name", "Name x2", "Name — 3". Imported items land in the bag with no weight until you set it.</p>
        <textarea class="ta" id="b-paste" placeholder="2x Water filter&#10;Headlamp&#10;MRE — 4"></textarea>
        <div class="row-actions" style="margin-top:8px"><button class="btn" id="b-import-list" type="button">Import lines</button></div></div>
      <div class="glass span-12"><h2>Readiness</h2><div id="b-scen"></div></div>
    </section>`;

  function paint() {
    const list = S.list("items");
    const w = BASTION.totalWeight(list);
    const soon = list.filter((i) => i.expiry && i.expiry <= PB_safe_add(day(), 90));
    $("#b-sum").innerHTML = `<div class="kv"><span>Total weight (all locations)</span><b>${BASTION.fmtWeight(w.totalOz)}</b></div>`
      + LOCS.map((l) => `<div class="kv"><span>${l}</span><b>${BASTION.fmtWeight(w.byLoc[l] || 0)} · ${list.filter((i) => (i.location || "bag") === l).length} items</b></div>`).join("")
      + (soon.length ? `<div class="kv"><span>Expiring within 90 days</span><b>${soon.length}</b></div>` : "");
    for (const it of list) if (window.PB && it.expiry) PB.deadlines.publish({ title: "Expires: " + it.name, date: it.expiry, source: "bastion", kind: "expiry", ref: it.id });
    $("#b-list").innerHTML = list.length ? "" : `<p class="empty">Nothing inventoried yet.</p>`;
    for (const it of list) {
      const st = !it.expiry ? "" : it.expiry < day() ? `<span class="pill over">expired ${it.expiry}</span>` : it.expiry <= PB_safe_add(day(), 90) ? `<span class="pill soon">expires ${it.expiry}</span>` : `<span class="pill">to ${it.expiry}</span>`;
      $("#b-list").append(h("div.kv", null,
        h("span", null, `${it.name} ×${it.qty || 1} `, h("span.stat-s", null, `${it.category} · ${it.location || "bag"} · ${BASTION.fmtWeight((it.weightOz || 0) * (it.qty || 1))}`)),
        h("span", null, st, " ", h("button.btn.quiet.small", { type: "button", onclick: () => { const prev = S.list("items"); S.remove("items", it.id); if (window.PB) PB.deadlines.unpublish("bastion", it.id); paint(); toast("Removed", 6000, () => { S.set("items", prev); paint(); }); } }, "Remove"))));
    }
    const checks = S.get("checks", {});
    $("#b-scen").innerHTML = "";
    for (const [name, entries] of Object.entries(SCENARIOS)) {
      const box = h("div", null, h("h3", null, `${name} — ${BASTION.readiness(Object.fromEntries(entries.map((e) => [e, !!(checks[name] || {})[e]])))}%`));
      for (const e of entries) box.append(h("label.check", null,
        h("input", { type: "checkbox", ...(checks[name] && checks[name][e] ? { checked: "" } : {}), onchange: (ev) => { const c = S.get("checks", {}); c[name] = c[name] || {}; c[name][e] = ev.target.checked; S.set("checks", c); paint(); } }), e));
      $("#b-scen").append(box);
    }
  }
  const PB_safe_add = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  $("#b-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("items", { name: f.name.value.trim(), category: f.category.value, location: f.location.value, qty: +f.qty.value || 1, weightOz: +f.weightOz.value || 0, expiry: f.expiry.value || null });
    f.reset(); f.qty.value = 1; toast("Added"); paint(); });
  $("#b-import-list").onclick = () => { const rows = BASTION.parseImport($("#b-paste").value);
    if (!rows.length) { toast("Nothing to import"); return; }
    for (const r of rows) S.add("items", { name: r.name, qty: r.qty, category: "other", location: "bag", weightOz: 0, expiry: null });
    $("#b-paste").value = ""; toast(`Imported ${rows.length} items`); paint(); };
  $("#export").onclick = () => download(`bastion_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();

  // NWS storm watch (foreground fetch; honest about freshness and failure)
  (async () => {
    const el = $("#b-wx");
    try {
      const pt = await (await fetch("https://api.weather.gov/points/34.82057,-118.94543", { headers: { "Accept": "application/geo+json" } })).json();
      const [fc, al] = await Promise.all([
        fetch(pt.properties.forecast, { headers: { "Accept": "application/geo+json" } }).then((r) => r.json()),
        fetch("https://api.weather.gov/alerts/active?point=34.82057,-118.94543", { headers: { "Accept": "application/geo+json" } }).then((r) => r.json()),
      ]);
      const periods = (fc.properties.periods || []).slice(0, 4);
      const alerts = al.features || [];
      el.innerHTML = (alerts.length ? alerts.map((a) => `<div class="kv"><span><b>${esc(a.properties.event)}</b> — ${esc(a.properties.headline || "")}</span></div>`).join("") : `<div class="kv"><span>Active alerts</span><b>None</b></div>`)
        + periods.map((p) => `<div class="kv"><span>${esc(p.name)}</span><b>${p.temperature}°${p.temperatureUnit} · ${esc(p.shortForecast)}</b></div>`).join("")
        + `<div class="stat-s" style="margin-top:6px">National Weather Service · fetched ${new Date().toLocaleTimeString("en-US")} · refresh by reopening this page.</div>`;
    } catch (_) { el.textContent = "Weather unavailable right now (offline or the Weather Service did not answer). Your inventory and checklists below work regardless."; }
  })();
})();
