/* Odyssey v2: trip files -> deadlines bus + auto-pulled Bastion Car Kit & Garage service status + synced Away Mode (PB.meta & prometheus.odyssey.away).
   Design (Sebastian, 2026-11-14): departure-board / atlas presentation — home base as the anchor card,
   trip files as journey cards (route arc + day-tick timeline), routes as scaled distance bars,
   places as a gazetteer. Presentation only: store keys, ids, data and the TRIP API are unchanged. */
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
      <div class="span-12" id="o-board"></div>
      <div class="glass lit span-12"><h2>Home base — the anchor</h2><div id="o-home"></div></div>
      <div class="glass span-12"><h2>Trip files — the board</h2><div id="o-list"></div></div>
      <div class="glass span-12"><h2>Regular routes — distances from home</h2><div id="o-routes"></div></div>
      <div class="glass span-12"><h2>Atlas — places on record</h2><div id="o-places"></div></div>
      <div class="glass span-12"><h2>File a new trip</h2>
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
    </section>`;

  function publishTrip(t) {
    if (!window.PB) return;
    PB.deadlines.publish({ title: "Depart: " + t.name, date: t.start, source: "odyssey", kind: "trip", ref: t.id + ":out" });
    PB.deadlines.publish({ title: "Return: " + t.name, date: t.end, source: "odyssey", kind: "trip", ref: t.id + ":back" });
  }

  /* ---------- departure-board helpers (presentation only) ---------- */
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dparse = (ds) => new Date(ds + "T12:00:00");
  const dlabel = (ds) => { const d = dparse(ds); return MON[d.getMonth()] + " " + d.getDate(); };
  const nights = (t) => Math.max(0, Math.round((dparse(t.end) - dparse(t.start)) / 864e5));

  /* The one fully-dated journey on record gets its real legs (from its own filed notes);
     every other trip flies the generic home -> destination arc. */
  const SEED_LEGS = [
    { at: "2024-08-30", code: "LAX", name: "Los Angeles", note: "Out of LAX, late night" },
    { at: "2024-09-01", code: "MNL", name: "Manila", note: "Lands Manila · Hotel Okura" },
    { at: "2024-09-02", code: "ENI", name: "El Nido", note: "El Nido Sep 2–6 · Tour A, canopy walk, Nagkalit-kalit Falls" },
    { at: "2024-09-09", code: "FP", name: "Frazier Park", note: "Back via BGC (Sep 7) · out of NAIA Sep 9" },
  ];

  function arcSVG(t) {
    // Quadratic great-circle arc, home on the left; waypoint dots ride the curve.
    const W = 640, H = 118, x0 = 34, x1 = W - 34, yb = 96, yc = 6;
    const pt = (f) => { const u = 1 - f; return { x: u * u * x0 + 2 * u * f * ((x0 + x1) / 2) + f * f * x1, y: u * u * yb + 2 * u * f * yc + f * f * yb }; };
    const legs = t.id === "seed-philippines-2024" ? SEED_LEGS : null;
    const stops = legs
      ? [{ code: "FP", name: "Frazier Park", f: 0 }, ...legs.map((l, i) => ({ code: l.code, name: l.name, f: (i + 1) / legs.length }))]
      : [{ code: "FP", name: "Frazier Park", f: 0 }, { code: "", name: (t.dest || t.name || "Away"), f: 1 }];
    const dots = stops.map((s) => {
      const p = pt(s.f);
      return `<circle class="arc-node" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${s.f === 0 || s.f === 1 ? 4.5 : 3.5}"/><text class="arc-code" x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle">${esc(s.code)}</text>`;
    }).join("");
    return `<svg class="arc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Route arc from Frazier Park to ${esc(t.dest || t.name || "")}">
      <path class="arc-line" d="M ${x0} ${yb} Q ${(x0 + x1) / 2} ${yc} ${x1} ${yb}"/>
      <path class="arc-ghost" d="M ${x0} ${yb} Q ${(x0 + x1) / 2} ${yc + 34} ${x1} ${yb}"/>${dots}
      <text class="arc-name" x="${x0}" y="${H - 2}">FRAZIER PARK</text>
      <text class="arc-name" x="${x1}" y="${H - 2}" text-anchor="end">${esc((stops[stops.length - 1].name || "").toUpperCase())}</text></svg>`;
  }

  function timelineHTML(t) {
    const n = nights(t), days = n + 1;
    const ticks = Math.min(days, 62);
    let cells = "";
    for (let i = 0; i < ticks; i++) cells += `<span class="tl-tick${i === 0 || i === ticks - 1 ? " end" : ""}"></span>`;
    const legs = t.id === "seed-philippines-2024" ? SEED_LEGS : null;
    const legRows = legs ? `<div class="legs">${legs.map((l) => `<div class="leg"><span class="leg-date">${dlabel(l.at)}</span><span class="leg-note"><b>${esc(l.code)}</b> · ${esc(l.note)}</span></div>`).join("")}</div>` : "";
    return `<div class="tl"><div class="tl-head"><span>${dlabel(t.start)} ${dparse(t.start).getFullYear()}</span><span class="tl-mid">${days} DAYS · ${n} NIGHTS</span><span>${dlabel(t.end)} ${dparse(t.end).getFullYear()}</span></div><div class="tl-track">${cells}</div>${legRows}</div>`;
  }

  function paint() {
    const trips = S.list("trips").sort((a, b) => a.start.localeCompare(b.start));
    const el = $("#o-list");
    el.innerHTML = trips.length ? "" : `<p class="empty">No trips yet.</p>`;
    const health = readPillarHealth();
    const awayMeta = window.PB && PB.meta.get("away");

    /* Departure-board strip: the anchor + the state of the board, at a glance. */
    const board = $("#o-board");
    const totalNights = trips.reduce((s, t) => s + nights(t), 0);
    board.innerHTML = `<div class="board">
      <div class="board-cell"><span class="board-k">Home base</span><span class="board-v">${OD ? esc(OD.home.name.split(",")[0]) : "—"}</span></div>
      <div class="board-cell"><span class="board-k">Coordinates</span><span class="board-v board-coords">${OD ? OD.home.lat.toFixed(5) + "° N · " + Math.abs(OD.home.lon).toFixed(5) + "° W" : "—"}</span></div>
      <div class="board-cell"><span class="board-k">Trips filed</span><span class="board-v">${trips.length}</span></div>
      <div class="board-cell"><span class="board-k">Nights on record</span><span class="board-v">${totalNights}</span></div>
      <div class="board-cell"><span class="board-k">Away mode</span><span class="board-v ${awayMeta ? "board-away" : ""}">${awayMeta ? "ON" : "OFF"}</span></div>
    </div>`;

    for (const t of trips) {
      const packs = t.packState || {};
      const isAway = !!(awayMeta && awayMeta.tripId === t.id);
      const roadNote = t.car
        ? `Bastion car kit: ${health.carItems} item(s) packed · Vehicle services due <=500 mi: ${health.sDue}`
        : "";
      const card = h("div.trip", null,
        h("div.trip-head", null,
          h("div.trip-route", null,
            h("span.trip-from", null, "FRAZIER PARK"),
            h("span.trip-arrow", null, "⟶"),
            h("span.trip-to", null, (t.dest || t.name || "").toUpperCase())
          ),
          isAway ? h("span.pill.soon", null, "Away mode on · Home screen prioritized") : null
        ),
        h("h3", null, t.name),
        h("div.stat-s", null, `${t.dest ? esc(t.dest) + " · " : ""}${t.start} → ${t.end}${roadNote ? " · " + roadNote : ""}`)
      );
      const arc = h("div.journey", null); arc.innerHTML = arcSVG(t); card.append(arc);
      const tl = h("div", null); tl.innerHTML = timelineHTML(t); card.append(tl);
      if (t.notes) card.append(h("p.trip-notes", null, t.notes));
      card.append(h("div.checks", null,
        h("div.check-col", null,
          h("h4", null, "Packing — generated from this trip"),
          ...TRIP.packingList(t).map((p) => h("label.check", null,
            h("input", { type: "checkbox", ...(packs[p] ? { checked: "" } : {}), onchange: (ev) => { t.packState = t.packState || {}; t.packState[p] = ev.target.checked; S.set("trips", trips); } }),
            " ", p
          ))
        ),
        h("div.check-col", null,
          h("h4", null, "Before you leave — the house"),
          ...TRIP.HOME_CHECKS.map((c) => h("label.check", null,
            h("input", { type: "checkbox", ...((t.homeState || {})[c] ? { checked: "" } : {}), onchange: (ev) => { t.homeState = t.homeState || {}; t.homeState[c] = ev.target.checked; S.set("trips", trips); } }),
            " ", c
          ))
        )
      ));
      card.append(h("div.row-actions", { style: "margin-top:8px" },
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
      ));
      el.append(card);
    }
  }

  /* Shipped dataset panels (odyssey-data.js): read-only — his record, rendered as an
     atlas. Home base is the anchor card; routes are distance bars scaled to the longest
     run (116 mi); places are a numbered gazetteer. The trip files above are where new
     plans go. */
  function paintDataset() {
    if (!OD) return;
    const home = $("#o-home");
    home.innerHTML = "";
    const anchor = h("div.anchor", null,
      h("div.anchor-main", null,
        h("span.stat-k", null, "Anchor point"),
        h("div.anchor-name", null, OD.home.name),
        h("div.anchor-coords", null, `${OD.home.lat.toFixed(5)}° N`, h("span.anchor-dot", null, "·"), `${Math.abs(OD.home.lon).toFixed(5)}° W`),
        h("span.pill", null, "Home base")
      ),
      h("div.anchor-glyph", { "aria-hidden": "true" })
    );
    anchor.querySelector(".anchor-glyph").innerHTML = `<svg viewBox="0 0 120 120" class="glyph">
      <ellipse class="g-ring" cx="60" cy="60" rx="52" ry="17"/><ellipse class="g-ring" cx="60" cy="60" rx="52" ry="34"/><ellipse class="g-ring faint" cx="60" cy="60" rx="52" ry="50"/>
      <circle class="g-orbit" cx="60" cy="60" r="56"/><circle class="g-core" cx="60" cy="60" r="5"/>
      <circle class="g-sat" cx="103" cy="33" r="3"/><text class="g-lab" x="60" y="112" text-anchor="middle">FP · 34.8°N</text></svg>`;
    home.append(anchor);
    const log = h("div.anchor-log", null);
    OD.home.notes.forEach((n, i) => log.append(h("div.log-row", null, h("span.log-ix", null, "0" + (i + 1)), h("span", null, n))));
    home.append(log);

    const routes = $("#o-routes");
    routes.innerHTML = "";
    const maxMi = Math.max(...OD.routes.map((r) => r.miles));
    for (const r of OD.routes) {
      routes.append(h("div.route", null,
        h("div.route-top", null,
          h("span.route-dest", null, r.dest),
          h("span.route-miles", null, (r.miles >= 100 && !Number.isInteger(r.miles) ? "~" : "") + r.miles + " MI")
        ),
        h("div.route-meta", null,
          h("span", null, r.label),
          h("span.pill", null, r.inferred ? "Destination inferred" : "His route")
        ),
        h("div.bar", null, h("span.bar-fill", { style: `width:${Math.max(6, Math.round((r.miles / maxMi) * 100))}%` }))
      ));
      const chain = waypointChain(r);
      if (chain) {
        const wp = h("div.waypoints", null);
        wp.innerHTML = chain.map((w) => `<span class="wp"><i></i>${esc(w)}</span>`).join('<span class="wp-link"></span>');
        routes.append(wp);
      }
      routes.append(h("div.stat-s route-note", null, r.note));
    }

    const pl = $("#o-places");
    pl.innerHTML = "";
    const gaz = h("div.gazetteer", null);
    OD.places.forEach((p, i) => {
      gaz.append(h("div.place", null,
        h("div.place-head", null,
          h("span.place-ix", null, String(i + 1).padStart(2, "0")),
          h("span.place-name", null, p.name),
          h("span.place-kind", null, p.kind)
        ),
        h("p.place-note", null, p.note)
      ));
    });
    pl.append(gaz);
  }

  /* The home loop's own waypoint chain lives in its note, after the colon — lift it out
     as a dot-line under the bar. Any other route simply has no chain. */
  function waypointChain(r) {
    if (r.inferred || !r.note) return null;
    const m = r.note.match(/:\s*(.+)/);
    if (!m || !m[1].includes("→")) return null;
    return m[1].replace(/\.$/, "").split("→").map((s) => s.trim()).filter(Boolean);
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
