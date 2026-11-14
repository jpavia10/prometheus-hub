/* Odyssey v2: trip files -> deadlines bus + auto-pulled Bastion Car Kit & Garage service status + synced Away Mode (PB.meta & prometheus.odyssey.away). */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("odyssey");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.poly(Math.round(n * 0.6), [[-0.9, 0.5], [-0.2, -0.4], [0.5, 0.2], [0.9, -0.6]]), ...G.ring(Math.round(n * 0.4), 0.12)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Real-history seed (Sebastian, 2026-11-14): Joseph's own dated trip, mined from his
     ChatGPT export (see odyssey-data.js for the evidence notes). Once-only, Athenaeum-style
     flag; merged by id so his edits and deletions stick — nothing is silently overwritten. */
  const OD = window.ODYSSEY_DATA || null;
  if (OD && !S.get("tripsSeedV1")) {
    const cur = S.list("trips");
    const have = new Set(cur.map((t) => t.id));
    S.set("trips", [...cur, ...OD.seedTrips.filter((t) => !have.has(t.id))]);
    S.set("tripsSeedV1", 1);
  }

  function readPillarHealth() {
    let carItems = 0, sDue = 0;
    try {
      const bItems = JSON.parse(localStorage.getItem("prometheus.bastion.items") || "[]");
      carItems = bItems.filter((i) => i.location === "car").length;
    } catch (_) {}
    try {
      const svcs = JSON.parse(localStorage.getItem("prometheus.garage.services") || "[]");
      const hist = JSON.parse(localStorage.getItem("prometheus.garage.history") || "[]");
      const odo = JSON.parse(localStorage.getItem("prometheus.garage.odometer") || "0");
      for (const s of svcs) {
        const last = hist.filter((x) => x.service === s.name).sort((a, b) => b.date.localeCompare(a.date))[0];
        if (last && s.miles && (last.odometer + s.miles - odo) <= 500) sDue++;
      }
    } catch (_) {}
    return { carItems, sDue };
  }

  function setAway(trip) {
    const val = trip ? { active: true, tripId: trip.id, name: trip.name, dest: trip.dest || "", until: trip.end } : null;
    if (window.PB) PB.meta.set("away", val);
    try {
      if (val) localStorage.setItem("prometheus.odyssey.away", JSON.stringify(val));
      else localStorage.removeItem("prometheus.odyssey.away");
    } catch (_) {}
  }

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Plan a trip</h2>
        <form class="form" id="o-form">
          <label class="f wide">Trip name<input name="name" required maxlength="100" placeholder="Bakersfield run, coast weekend…"></label>
          <label class="f wide">Destination<input name="dest" maxlength="100" placeholder="Monterey, Kern, Pasadena…"></label>
          <label class="f">Depart<input name="start" type="date" required></label>
          <label class="f">Return<input name="end" type="date" required></label>
          <label class="f">Context</label>
          <div class="row-actions">
            <label class="check"><input type="checkbox" name="cold"> Cold</label>
            <label class="check"><input type="checkbox" name="rain"> Rain</label>
            <label class="check"><input type="checkbox" name="beach"> Beach</label>
            <label class="check"><input type="checkbox" name="work"> Work</label>
            <label class="check"><input type="checkbox" name="car"> Driving</label>
            <label class="check"><input type="checkbox" name="kids"> Violet coming</label>
          </div>
          <button class="btn" type="submit">Create trip file</button>
        </form>
      </div>
      <div class="glass span-12"><h2>Trip files</h2><div id="o-list"></div></div>
      <div class="glass span-12"><h2>Home base &amp; regular routes</h2><div id="o-home"></div></div>
      <div class="glass span-12"><h2>Places</h2><div id="o-places"></div></div>
    </section>`;

  function publishTrip(t) {
    if (!window.PB) return;
    PB.deadlines.publish({ title: "Depart: " + t.name, date: t.start, source: "odyssey", kind: "trip", ref: t.id + ":out" });
    PB.deadlines.publish({ title: "Return: " + t.name, date: t.end, source: "odyssey", kind: "trip", ref: t.id + ":back" });
  }

  function paint() {
    const trips = S.list("trips").sort((a, b) => a.start.localeCompare(b.start));
    const el = $("#o-list");
    el.innerHTML = trips.length ? "" : `<p class="empty">No trips yet.</p>`;
    const health = readPillarHealth();
    const awayMeta = window.PB && PB.meta.get("away");
    for (const t of trips) {
      const packs = t.packState || {};
      const isAway = !!(awayMeta && awayMeta.tripId === t.id);
      const roadNote = t.car
        ? `Bastion car kit: ${health.carItems} item(s) packed · Vehicle services due <=500 mi: ${health.sDue}`
        : "";
      el.append(h("div.trip", null,
        h("h3", null, `${t.name} `, isAway ? h("span.pill.soon", null, "Away mode on · Home screen prioritized") : null),
        h("div.stat-s", null, `${t.dest ? esc(t.dest) + " · " : ""}${t.start} → ${t.end}${roadNote ? " · " + roadNote : ""}`),
        t.notes ? h("div.stat-s", null, t.notes) : null,
        h("h4", null, "Packing — generated from this trip"),
        ...TRIP.packingList(t).map((p) => h("label.check", null,
          h("input", { type: "checkbox", ...(packs[p] ? { checked: "" } : {}), onchange: (ev) => { t.packState = t.packState || {}; t.packState[p] = ev.target.checked; S.set("trips", trips); } }),
          " ", p
        )),
        h("h4", null, "Before you leave — the house"),
        ...TRIP.HOME_CHECKS.map((c) => h("label.check", null,
          h("input", { type: "checkbox", ...((t.homeState || {})[c] ? { checked: "" } : {}), onchange: (ev) => { t.homeState = t.homeState || {}; t.homeState[c] = ev.target.checked; S.set("trips", trips); } }),
          " ", c
        )),
        h("div.row-actions", { style: "margin-top:8px" },
          isAway
            ? h("button.btn.quiet.small", { type: "button", onclick: () => { setAway(null); paint(); } }, "End away mode")
            : h("button.btn.small", { type: "button", onclick: () => { setAway(t); toast("Away mode ON — Hub Picture panel switched"); paint(); } }, "Set away mode"),
          h("button.btn.quiet.small", {
            type: "button",
            onclick: () => {
              const prev = S.list("trips");
              if (window.PB) { PB.deadlines.unpublish("odyssey", t.id + ":out"); PB.deadlines.unpublish("odyssey", t.id + ":back"); }
              if (isAway) setAway(null);
              S.remove("trips", t.id); paint();
              toast("Trip deleted", 6000, () => { S.set("trips", prev); prev.forEach((x) => publishTrip(x)); paint(); });
            },
          }, "Delete trip")
        )
      ));
    }
  }

  /* Shipped dataset panels (odyssey-data.js): read-only, rendered in the pillar's own
     kv/stat-s idioms. Home base + his Garage route presets, then the places his own
     messages put him. Nothing here is editable because nothing here is a guess he made
     in this app — it is his record, and the trip files above are where new plans go. */
  function paintDataset() {
    if (!OD) return;
    const home = $("#o-home");
    home.innerHTML = "";
    home.append(h("div.kv", null,
      h("span", null, h("b", null, OD.home.name), ` · ${OD.home.lat.toFixed(5)}, ${OD.home.lon.toFixed(5)}`),
      h("span.pill", null, "Home base")));
    for (const n of OD.home.notes) home.append(h("div.stat-s", null, n));
    for (const r of OD.routes) {
      home.append(h("div.kv", null,
        h("span", null, h("b", null, r.label), ` — ${esc(r.dest)}`),
        h("span.pill", null, r.inferred ? "Destination inferred" : "His route")));
      home.append(h("div.stat-s", null, r.note));
    }
    const pl = $("#o-places");
    pl.innerHTML = "";
    for (const p of OD.places) {
      pl.append(h("div.kv", null, h("span", null, h("b", null, p.name)), h("span.pill", null, p.kind)));
      pl.append(h("div.stat-s", null, p.note));
    }
  }

  $("#o-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    const t = S.add("trips", { name: f.name.value.trim(), dest: f.dest.value.trim(), start: f.start.value, end: f.end.value, cold: f.cold.checked, rain: f.rain.checked, beach: f.beach.checked, work: f.work.checked, car: f.car.checked, kids: f.kids.checked });
    publishTrip(t); f.reset(); toast("Trip filed"); paint();
  });
  $("#export").onclick = () => download(`odyssey_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); for (const t of S.list("trips")) publishTrip(t); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paintDataset();
  paint();
})();
