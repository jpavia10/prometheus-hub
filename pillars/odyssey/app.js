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

  /* Real-history seeds (Sebastian, 2026-11-14; two more trips 2026-11-19): Joseph's own dated trips (see odyssey-data.js for the
     evidence notes). Each seed is filed once, by id, and its id is remembered in tripsSeeded, so his edits and deletions stick and a
     new seed reaches a phone that already had the first one (tripsSeedV1 = the Philippines September trip). Only the trip's own fields
     are stored; its legs, budget and planning notes stay in the shipped file and are looked up by id. */
  const OD = window.ODYSSEY_DATA || null;
  /* A seed with a higher rev (2026-11-19: his corrections, his bookings, his photos) refreshes the fields the app ships on a phone
     that already has it (name, dates, notes, stops); his own marks on it (packing, house checks) stay as they are. */
  const KEEP = ["id", "rev", "name", "dest", "start", "end", "cold", "rain", "beach", "work", "car", "kids", "notes"];
  const shipped = (t) => {
    const r = Object.fromEntries(KEEP.filter((k) => k in t).map((k) => [k, t[k]]));
    if (t.legs) r.stops = [...new Set(t.legs.filter((l) => !l.home).map((l) => l.name))].join(", ");   // for the hub's search
    return r;
  };
  if (OD) {
    const done = S.get("tripsSeeded", null) || (S.get("tripsSeedV1") ? ["seed-philippines-2024"] : []);
    const fresh = OD.seedTrips.filter((t) => !done.includes(t.id));
    let cur = S.list("trips"), changed = false;
    if (fresh.length) {
      const have = new Set(cur.map((t) => t.id));
      cur = [...cur, ...fresh.filter((t) => !have.has(t.id)).map(shipped)];
      S.set("tripsSeeded", [...done, ...fresh.map((t) => t.id)]); changed = true;
    }
    cur = cur.map((t) => {
      const sd = OD.seedTrips.find((x) => x.id === t.id);
      if (!sd || (t.rev || 1) >= (sd.rev || 1)) return t;
      changed = true; return { ...t, ...shipped(sd) };
    });
    if (changed) S.set("trips", cur);
  }
  const seedOf = (t) => (OD && OD.seedTrips.find((x) => x.id === t.id)) || null;
  const legsOf = (t) => t.legs || (seedOf(t) || {}).legs || null;
  const fromOf = (t) => t.from || (seedOf(t) || {}).from || { code: "FP", name: "Frazier Park" };
  const TODAY = day();
  const isPast = (t) => !!t.end && t.end < TODAY;

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

  /* ODY-GEM-01 gate (2026-11-17): away mode will not arm while a critical freeze or
     pet-care check is unticked — the first click names what's missing, the second
     click (same trip, same paint) overrides. Ending away mode is never gated, and
     clearing always clears PB.meta too (§H: no stale away state after return). */
  let awayWarnedFor = null;
  function setAway(trip, force) {
    if (trip && !force) {
      const missing = TRIP.HOME_CHECKS.filter((c) => c.critical && !(trip.homeState || {})[c.task]);
      if (missing.length) {
        if (awayWarnedFor !== trip.id) {
          awayWarnedFor = trip.id;
          toast(`Away gate: ${missing.length} critical check${missing.length === 1 ? "" : "s"} unticked — ${missing.slice(0, 2).map((c) => c.task.slice(0, 42)).join("; ")}${missing.length > 2 ? "…" : ""} Click Set Away again to override.`, 6000);
          return;
        }
      }
    }
    awayWarnedFor = null;
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
      <div class="glass span-12"><h2>Atlas — every place you have been</h2><div id="o-atlas"></div><h3 class="at-h3">Notes on the places</h3><div id="o-places"></div></div>
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

  /* A trip with legs on record (odyssey-data.js) draws them: on a map when its stops have coordinates and a base map covers them,
     else on the arc; every other trip flies the generic home -> destination arc. */
  const MODE = { flight: "Flight", train: "Train", bus: "Bus", ferry: "Ferry", car: "Drive", cruise: "Cruise" };
  const money = (v) => "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const r2 = (v) => Math.round(v * 100) / 100;
  const miles = (a, b) => {                                    // great-circle distance between two stops, statute miles
    const R = 3958.8, f = Math.PI / 180, dLat = (b.lat - a.lat) * f, dLon = (b.lon - a.lon) * f;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * f) * Math.cos(b.lat * f) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  function arcSVG(t) {
    // Quadratic great-circle arc, home on the left; waypoint dots ride the curve.
    const W = 640, H = 118, x0 = 34, x1 = W - 34, yb = 96, yc = 6;
    const pt = (f) => { const u = 1 - f; return { x: u * u * x0 + 2 * u * f * ((x0 + x1) / 2) + f * f * x1, y: u * u * yb + 2 * u * f * yc + f * f * yb }; };
    const legs = legsOf(t), from = fromOf(t);
    const stops = legs && legs.length <= 6
      ? [{ code: from.code, name: from.name, f: 0 }, ...legs.map((l, i) => ({ code: l.code, name: l.name, f: (i + 1) / legs.length }))]
      : [{ code: from.code, name: from.name, f: 0 }, { code: "", name: (t.dest || t.name || "Away"), f: 1 }];
    const dots = stops.map((s) => {
      const p = pt(s.f);
      return `<circle class="arc-node" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${s.f === 0 || s.f === 1 ? 4.5 : 3.5}"/><text class="arc-code" x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle">${esc(s.code)}</text>`;
    }).join("");
    return `<svg class="arc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Route arc from ${esc(from.name)} to ${esc(t.dest || t.name || "")}">
      <path class="arc-line" d="M ${x0} ${yb} Q ${(x0 + x1) / 2} ${yc} ${x1} ${yb}"/>
      <path class="arc-ghost" d="M ${x0} ${yb} Q ${(x0 + x1) / 2} ${yc + 34} ${x1} ${yb}"/>${dots}
      <text class="arc-name" x="${x0}" y="${H - 2}">${esc(from.name.toUpperCase())}</text>
      <text class="arc-name" x="${x1}" y="${H - 2}" text-anchor="end">${esc((stops[stops.length - 1].name || "").toUpperCase())}</text></svg>`;
  }

  /* The route on a map (2026-11-19): the trip's stops at their real coordinates (equirectangular, cos(mid-latitude)), over the
     Natural Earth outlines in basemap.js when one region holds the whole view. Out and back between two stops bow to opposite sides,
     so a return shows as its own line. Labels take the first free spot around their dot, longest stays first; a stop with no room keeps
     its dot and its name in the logbook below. */
  function mapSVG(t) {
    const legs = legsOf(t); if (!legs) return null;
    const pts = legs.filter((l) => !l.home && Number.isFinite(l.lat) && Number.isFinite(l.lon));
    if (pts.length < 2) return null;
    const lats = pts.map((p) => p.lat), lons = pts.map((p) => p.lon);
    const k = Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * Math.PI / 180);
    const X = (lon) => lon * 100 * k, Y = (lat) => -lat * 100;
    let x0 = X(Math.min(...lons)), x1 = X(Math.max(...lons)), y0 = Y(Math.max(...lats)), y1 = Y(Math.min(...lats));
    const pad = Math.max(x1 - x0, y1 - y0) * 0.1 + 45; x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    let W = x1 - x0, H = y1 - y0;
    if (H / W > 1.2) { const a = (H / 1.2 - W) / 2; x0 -= a; x1 += a; W = x1 - x0; }
    if (H / W < 0.72) { const a = (W * 0.72 - H) / 2; y0 -= a; y1 += a; H = y1 - y0; }
    const west = x0 / k / 100, east = x1 / k / 100, north = -y0 / 100, south = -y1 / 100;
    const base = (window.ODYSSEY_BASEMAP || []).find((r) => west >= r.bbox[0] && east <= r.bbox[2] && south >= r.bbox[1] && north <= r.bbox[3]);
    const fs = W / 29, rad = fs * 0.3, f1 = (v) => v.toFixed(1);
    let g = "";                                                 // graticule: every 5 degrees, or 2 on a small map
    const step = (east - west) > 12 ? 5 : 2;
    for (let lo = Math.ceil(west / step) * step; lo <= east; lo += step) g += `M${f1(X(lo))} ${f1(y0)}V${f1(y1)}`;
    for (let la = Math.ceil(south / step) * step; la <= north; la += step) g += `M${f1(x0)} ${f1(Y(la))}H${f1(x1)}`;
    let segs = "";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], ax = X(a.lon), ay = Y(a.lat), bx = X(b.lon), by = Y(b.lat), dx = bx - ax, dy = by - ay;
      const bow = b.by === "flight" ? 0.2 : 0.09, cx = (ax + bx) / 2 + dy * bow, cy = (ay + by) / 2 - dx * bow;
      segs += `<path class="map-seg ${b.by || "land"}" data-i="${i}" vector-effect="non-scaling-stroke" d="M${f1(ax)} ${f1(ay)}Q${f1(cx)} ${f1(cy)} ${f1(bx)} ${f1(by)}"><title>${esc(a.name)} → ${esc(b.name)}${b.by ? " · " + MODE[b.by] : ""}</title></path>`;
    }
    const uniq = []; for (const p of pts) if (!uniq.some((u) => u.code === p.code)) uniq.push({ ...p, stay: pts.filter((q) => q.code === p.code).reduce((s, q) => s + (q.nights || 0), 0) });
    const boxes = uniq.map((p) => ({ x: X(p.lon) - rad * 1.3, y: Y(p.lat) - rad * 1.3, w: rad * 2.6, h: rad * 2.6 }));
    const hit = (b) => b.x < x0 + 4 || b.y < y0 + 4 || b.x + b.w > x1 - 4 || b.y + b.h > y1 - 4 || boxes.some((o) => b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h);
    let labels = "", named = 0;
    for (const p of [...uniq].sort((a, b) => b.stay - a.stay)) {
      const px = X(p.lon), py = Y(p.lat), tw = p.name.length * fs * 0.56, gap = rad + fs * 0.3;
      const spots = [[gap, fs * 0.36, "start"], [-gap, fs * 0.36, "end"], [0, -gap, "middle"], [0, gap + fs * 0.75, "middle"],
        [gap * 0.8, -gap * 0.6, "start"], [gap * 0.8, gap * 0.6 + fs * 0.7, "start"], [-gap * 0.8, -gap * 0.6, "end"], [-gap * 0.8, gap * 0.6 + fs * 0.7, "end"]];
      for (const [dx, dy, anchor] of spots) {
        const lx = px + dx, ly = py + dy, bx = anchor === "start" ? lx : anchor === "end" ? lx - tw : lx - tw / 2;
        const box = { x: bx - fs * 0.1, y: ly - fs * 0.82, w: tw + fs * 0.2, h: fs * 1.02 };
        if (hit(box)) continue;
        boxes.push(box); named++;
        labels += `<text class="map-lab" x="${f1(lx)}" y="${f1(ly)}" text-anchor="${anchor}" font-size="${f1(fs)}" stroke-width="${f1(fs * 0.24)}">${esc(p.name)}</text>`;
        break;
      }
    }
    /* landmarks from the trip's photos (odyssey-extra.js): small diamonds under the stops, each with its name */
    const lms = (window.ODYSSEY_LANDMARKS || []).filter((m) => m.trips.includes(t.id) && X(m.lon) > x0 && X(m.lon) < x1 && Y(m.lat) > y0 && Y(m.lat) < y1);
    const lmk = lms.map((m) => { const cx = X(m.lon), cy = Y(m.lat), r = rad * 0.85; return `<path class="map-lm" vector-effect="non-scaling-stroke" d="M${f1(cx)} ${f1(cy - r)}L${f1(cx + r)} ${f1(cy)}L${f1(cx)} ${f1(cy + r)}L${f1(cx - r)} ${f1(cy)}Z"><title>${esc(m.name)}</title></path>`; }).join("");
    const dots = uniq.map((p, i) => `<circle class="map-dot${i === 0 ? " start" : ""}${p.approx ? " approx" : ""}" data-code="${esc(p.code)}" vector-effect="non-scaling-stroke" cx="${f1(X(p.lon))}" cy="${f1(Y(p.lat))}" r="${f1(rad)}"><title>${esc(p.name)}${p.country ? ", " + esc(p.country) : ""}${p.approx ? " (approximate)" : ""}</title></circle>`).join("");
    let dist = 0; for (let i = 1; i < pts.length; i++) dist += miles(pts[i - 1], pts[i]);
    const used = [...new Set(pts.slice(1).map((p) => p.by).filter(Boolean))];
    const key = used.map((m) => `<span class="mk"><svg viewBox="0 0 26 8" aria-hidden="true"><path class="map-seg ${m}" d="M1 4H25"/></svg>${MODE[m]} ${pts.slice(1).filter((p) => p.by === m).length}</span>`).join("");
    const svg = `<svg class="tmap" viewBox="${f1(x0)} ${f1(y0)} ${f1(W)} ${f1(H)}" role="img" data-stops="${uniq.length}" data-named="${named}" aria-label="Map of the route: ${esc(uniq.map((p) => p.name).join(", "))}">
      <rect class="map-sea" x="${f1(x0)}" y="${f1(y0)}" width="${f1(W)}" height="${f1(H)}"/>
      ${base ? `<path class="map-land" vector-effect="non-scaling-stroke" transform="scale(${k.toFixed(5)} 1)" d="${base.d}"/>` : ""}${base && base.b ? `<path class="map-border" vector-effect="non-scaling-stroke" transform="scale(${k.toFixed(5)} 1)" d="${base.b}"/>` : ""}
      <path class="map-grat" vector-effect="non-scaling-stroke" d="${g}"/>${segs}${lmk}<circle class="map-here" r="${f1(rad * 2.4)}" cx="${f1(x0 - 999)}" cy="${f1(y0 - 999)}"/>${dots}${labels}</svg>`;
    return `<figure class="tmap-wrap">${svg}<figcaption class="map-key">${key}<span class="mk">${Math.round(dist).toLocaleString("en-US")} mi stop to stop, straight-line</span>${lms.length ? `<span class="mk"><svg viewBox="0 0 10 10" aria-hidden="true"><path class="map-lm" d="M5 1L9 5L5 9L1 5Z"/></svg>Landmark ${lms.length}</span>` : ""}${base ? "" : '<span class="mk">no outline map for this region yet</span>'}</figcaption></figure>`;
  }

  /* The logbook: every leg as its source records it (date, how, times, fare, where he stayed), and anything the source contradicts. */
  function legsHTML(legs) {
    return `<div class="legs">${legs.map((l) => {
      const rich = l.nights != null || l.by || l.stay;
      if (!rich) return `<div class="leg"><span class="leg-date">${dlabel(l.at)}</span><span class="leg-note"><b>${esc(l.code)}</b> · ${esc(l.note || l.name)}</span></div>`;
      const head = `<b>${esc(l.code)}</b> ${esc(l.name)}${l.country ? `<span class="leg-c">, ${esc(l.country)}</span>` : ""}${l.nights != null ? ` · ${l.nights === 0 ? "day stop" : l.nights + (l.nights === 1 ? " night" : " nights")}` : l.home ? " · home" : ""}`;
      const how = [l.by ? MODE[l.by] : "", l.ref || "", l.dep && l.arr ? `${l.dep} → ${l.arr}` : "", l.fare != null ? money(l.fare) : (l.by && !l.home && l.dep ? "no fare listed" : "")].filter(Boolean).join(" · ");
      const stay = [l.stay ? l.stay + (l.booked ? ` (${l.booked})` : "") : "", l.note || ""].filter(Boolean).join(" · ");
      return `<div class="leg rich"><span class="leg-date">${dlabel(l.at)}</span><span class="leg-note"><span class="leg-h">${head}</span>${how ? `<span class="leg-how">${esc(how)}</span>` : ""}${stay ? `<span class="leg-stay">${esc(stay)}</span>` : ""}${l.check ? `<span class="leg-check"><span class="pill warn">check</span> ${esc(l.check)}</span>` : ""}${l.fixed ? `<span class="leg-check"><span class="pill ok">settled</span> ${esc(l.fixed)}</span>` : ""}</span></div>`;
    }).join("")}</div>`;
  }

  /* The planned budget, added up here from the sheet's own rows and set against the total the sheet shows. */
  function budgetHTML(b, legs) {
    const daily = b.perDay.reduce((s, r) => s + r[1], 0), plan = r2(daily * b.nights);
    const booked = r2(b.booked.reduce((s, r) => s + r[1], 0)), total = r2(plan + booked), withC = r2(total * (1 + b.contingency));
    const pct = Math.round(b.contingency * 100) + "%";
    const diff = r2(total - b.sheetTotal), gone = b.booked.find((r) => Math.abs(r[1] - diff) < 0.005);
    const priced = (legs || []).filter((l) => l.fare != null), fares = r2(priced.reduce((s, l) => s + l.fare, 0));
    const row = (k, v, cls) => `<div class="kv${cls ? " " + cls : ""}"><span>${esc(k)}</span><b>${v}</b></div>`;
    return `<div class="budget"><h4>The plan's budget</h4>
      ${b.perDay.map((r) => row(`${r[0]} · $${r[1]} a day × ${b.nights}`, money(r[1] * b.nights))).join("")}
      ${b.booked.map((r) => row(r[0], money(r[1]))).join("")}
      ${row("Total", money(total), "sum")}${row(`With ${pct} for the unexpected`, money(withC), "sum")}
      ${diff ? `<p class="budget-check"><span class="pill warn">check</span> The sheet's own total is ${money(b.sheetTotal)} (${money(b.sheetWithContingency)} with ${pct}): ${gone ? `it leaves out the ${esc(gone[0].split(",")[0].toLowerCase())} row, ${money(gone[1])}.` : `${money(Math.abs(diff))} ${diff > 0 ? "less" : "more"} than its rows add up to.`}</p>` : ""}
      ${priced.length ? `<p class="stat-s">Fares on the legs: ${money(fares)} over ${priced.length} legs; ${legs.length - priced.length} list none.</p>` : ""}</div>`;
  }

  /* The journey (2026-11-19): his own photos from the trip (photos.js), in time order. A stage with the photo over a blurred copy of
     itself (any shape fits), its place, day and caption; a filmstrip; a scrubber; Play walks the trip with a slow push-in; tap the stage
     for full screen (swipe, arrow keys, Escape). The map follows: the route is drawn up to the photo's stop and that stop is ringed;
     tapping a stop jumps to its first photo. Reduced motion: no push-in. */
  const PH = window.ODYSSEY_PHOTOS || {};
  const timers = new Set();
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const longDate = (ds) => { const d = dparse(ds); return `${DOW[d.getDay()]}, ${MON[d.getMonth()][0] + MON[d.getMonth()].slice(1).toLowerCase()} ${d.getDate()}, ${d.getFullYear()}`; };
  const calm = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  function journey(t, card) {
    const photos = PH[t.id]; if (!photos || !photos.length) return null;
    const pts = (legsOf(t) || []).filter((l) => !l.home && Number.isFinite(l.lat));
    const legOf = (p) => { let k = 0; pts.forEach((l, i) => { if (l.at <= p.at && (!p.leg || l.code === p.leg)) k = i; }); return k; };
    const dayOf = (p) => Math.round((dparse(p.at) - dparse(t.start)) / 864e5) + 1, days = nights(t) + 1;
    const root = h("div.jr", { "data-n": photos.length });
    root.innerHTML = `<div class="jr-stage" tabindex="0" role="button" aria-label="Open this photo full screen">
        <img class="jr-bg" alt="" aria-hidden="true"><img class="jr-img a" alt=""><img class="jr-img b" alt="" aria-hidden="true">
        <div class="jr-cap"><span class="jr-place"></span><b class="jr-title"></b><span class="jr-when"></span></div>
        <button class="jr-nav prev" type="button" aria-label="Previous photo">‹</button><button class="jr-nav next" type="button" aria-label="Next photo">›</button>
        <span class="jr-count"></span></div>
      <div class="jr-bar"><button class="btn small jr-play" type="button" aria-pressed="false">▶ Play the trip</button>
        <input class="jr-scrub" type="range" min="0" max="${photos.length - 1}" step="1" value="0" aria-label="Move through the trip's photos"></div>
      <div class="jr-strip" role="listbox" aria-label="Photos from this trip">${photos.map((p, i) => `<button class="jr-th" type="button" role="option" data-i="${i}" aria-label="${esc(p.cap)}" style="--ar:${(p.w / p.h).toFixed(3)}"><img loading="lazy" decoding="async" src="photos/t/${p.id}.webp" alt=""></button>`).join("")}</div>`;
    const $$ = (q) => root.querySelector(q), stage = $$(".jr-stage"), A = $$(".jr-img.a"), B = $$(".jr-img.b"), bg = $$(".jr-bg");
    let cur = -1, front = A, timer = 0;
    const map = () => card.querySelector(".tmap");
    const paintMap = (k) => {
      const m = map(); if (!m) return;
      m.querySelectorAll(".map-seg").forEach((sg) => sg.classList.toggle("todo", +sg.dataset.i > k));
      m.querySelectorAll(".map-dot").forEach((d) => d.classList.toggle("here", d.dataset.code === pts[k].code));
      const d = m.querySelector(`.map-dot[data-code="${CSS.escape(pts[k].code)}"]`), ring = m.querySelector(".map-here");
      if (d && ring) { ring.setAttribute("cx", d.getAttribute("cx")); ring.setAttribute("cy", d.getAttribute("cy")); }
    };
    const go = (i, quiet) => {
      i = (i + photos.length) % photos.length; if (i === cur) return; cur = i;
      const p = photos[i], k = legOf(p), l = pts[k] || {}, src = `photos/${p.id}.webp`;
      const back = front === A ? B : A;
      back.classList.remove("kb"); back.onload = () => { back.classList.add("on"); front.classList.remove("on"); if (timer && !calm()) back.classList.add("kb"); front = back; };
      back.src = src; back.alt = p.cap; bg.src = `photos/t/${p.id}.webp`;
      $$(".jr-place").textContent = `${l.name || ""}${l.country ? " · " + l.country : ""}`.toUpperCase();
      $$(".jr-title").textContent = p.cap;
      $$(".jr-when").textContent = `${longDate(p.at)} · ${p.t} · day ${dayOf(p)} of ${days}`;
      $$(".jr-count").textContent = `${i + 1} / ${photos.length}`;
      $$(".jr-scrub").value = i;
      root.querySelectorAll(".jr-th").forEach((b) => { const on = +b.dataset.i === i; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
      const th = root.querySelector(`.jr-th[data-i="${i}"]`), strip = $$(".jr-strip");
      if (th && !quiet) strip.scrollTo({ left: th.offsetLeft - strip.clientWidth / 2 + th.offsetWidth / 2, behavior: calm() ? "auto" : "smooth" });
      paintMap(k);
      if (photos[i + 1]) { const pre = new Image(); pre.src = `photos/${photos[i + 1].id}.webp`; }
    };
    const stop = () => { if (!timer) return; clearInterval(timer); timers.delete(timer); timer = 0; const b = $$(".jr-play"); b.textContent = "▶ Play the trip"; b.setAttribute("aria-pressed", "false"); root.classList.remove("playing"); };
    const play = () => {
      if (timer) return stop();
      if (cur === photos.length - 1) go(0);
      timer = setInterval(() => { if (document.hidden) return; if (cur >= photos.length - 1) return stop(); go(cur + 1); }, 4200); timers.add(timer);
      const b = $$(".jr-play"); b.textContent = "❚❚ Pause"; b.setAttribute("aria-pressed", "true"); root.classList.add("playing");
      if (!calm()) front.classList.add("kb");
    };
    $$(".jr-play").onclick = play;
    $$(".jr-nav.prev").onclick = (e) => { e.stopPropagation(); stop(); go(cur - 1); };
    $$(".jr-nav.next").onclick = (e) => { e.stopPropagation(); stop(); go(cur + 1); };
    $$(".jr-scrub").oninput = (e) => { stop(); go(+e.target.value); };
    $$(".jr-strip").onclick = (e) => { const b = e.target.closest(".jr-th"); if (b) { stop(); go(+b.dataset.i); } };
    stage.onclick = () => { stop(); lightbox(photos, cur, (i) => go(i, true), pts, legOf); };
    stage.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stage.click(); } else if (e.key === "ArrowRight") { stop(); go(cur + 1); } else if (e.key === "ArrowLeft") { stop(); go(cur - 1); } };
    let sx = null; stage.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    stage.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) { stop(); go(cur + (dx < 0 ? 1 : -1)); stage.dataset.swiped = "1"; setTimeout(() => delete stage.dataset.swiped, 0); } });
    stage.addEventListener("click", (e) => { if (stage.dataset.swiped) e.stopImmediatePropagation(); }, true);
    root.bindMap = () => {
      const m = map(); if (!m) return;
      m.querySelectorAll(".map-dot").forEach((d) => {
        const i = photos.findIndex((p) => pts[legOf(p)].code === d.dataset.code);
        if (i < 0) return;
        d.classList.add("has-ph"); d.setAttribute("tabindex", "0"); d.setAttribute("role", "button"); d.setAttribute("aria-label", "Show the photos from " + (pts[legOf(photos[i])].name || d.dataset.code));
        const jump = () => { stop(); go(i); root.scrollIntoView({ block: "nearest", behavior: calm() ? "auto" : "smooth" }); };
        d.addEventListener("click", jump); d.addEventListener("keydown", (e) => { if (e.key === "Enter") jump(); });
      });
      paintMap(legOf(photos[Math.max(cur, 0)]));
    };
    root.start = () => go(0, true);
    return root;
  }

  function lightbox(photos, at, sync, pts, legOf) {
    const lb = h("div.jr-lb", { role: "dialog", "aria-modal": "true", "aria-label": "Trip photos" });
    lb.innerHTML = `<img class="jr-lb-img" alt=""><div class="jr-lb-cap"><span class="jr-place"></span><b></b><span class="jr-when"></span></div>
      <button class="jr-lb-x" type="button" aria-label="Close">×</button><button class="jr-nav prev" type="button" aria-label="Previous photo">‹</button><button class="jr-nav next" type="button" aria-label="Next photo">›</button>`;
    const img = lb.querySelector(".jr-lb-img"); let i = at;
    const show = (k) => {
      i = (k + photos.length) % photos.length; const p = photos[i], l = pts[legOf(p)] || {};
      img.src = `photos/${p.id}.webp`; img.alt = p.cap;
      lb.querySelector(".jr-place").textContent = `${l.name || ""}${l.country ? " · " + l.country : ""}`.toUpperCase();
      lb.querySelector("b").textContent = p.cap; lb.querySelector(".jr-when").textContent = `${longDate(p.at)} · ${p.t} · ${i + 1} / ${photos.length}`;
      sync(i);
    };
    const close = () => { document.removeEventListener("keydown", key); lb.remove(); document.body.style.overflow = ""; };
    const key = (e) => { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") show(i + 1); else if (e.key === "ArrowLeft") show(i - 1); };
    lb.querySelector(".jr-lb-x").onclick = close;
    lb.querySelector(".prev").onclick = () => show(i - 1); lb.querySelector(".next").onclick = () => show(i + 1);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    let sx = null; img.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    img.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
    document.addEventListener("keydown", key); document.body.appendChild(lb); document.body.style.overflow = "hidden";
    show(at); lb.querySelector(".jr-lb-x").focus();
  }

  function timelineHTML(t) {
    const n = nights(t), days = n + 1;
    const ticks = Math.min(days, 62);
    let cells = "";
    for (let i = 0; i < ticks; i++) cells += `<span class="tl-tick${i === 0 || i === ticks - 1 ? " end" : ""}"></span>`;
    const legs = legsOf(t);
    const legRows = legs ? legsHTML(legs) : "";
    return `<div class="tl"><div class="tl-head"><span>${dlabel(t.start)} ${dparse(t.start).getFullYear()}</span><span class="tl-mid">${days} ${days === 1 ? "DAY" : "DAYS"} · ${n} ${n === 1 ? "NIGHT" : "NIGHTS"}</span><span>${dlabel(t.end)} ${dparse(t.end).getFullYear()}</span></div><div class="tl-track">${cells}</div>${legRows}</div>`;
  }

  /* Day by day from the photos and the landmarks in them (odyssey-extra.js, from Gemini's Nov 21 read; 2026-11-23). */
  const DAYS = window.ODYSSEY_DAYS || {}, LMS = window.ODYSSEY_LANDMARKS || [];
  function daysHTML(t) {
    const rows = DAYS[t.id]; if (!rows || !rows.length) return "";
    return `<details class="days"><summary>Day by day, from your photos <span class="stat-s">${rows.length} days</span></summary><div class="day-list">${rows.map((r) =>
      `<div class="day"><span class="day-d">${dlabel(r.d)}</span><span class="day-b"><b>${esc(r.c)}</b><span class="day-p">${esc(r.p)}</span>${r.n ? `<span class="day-n">${r.n} photo${r.n === 1 ? "" : "s"}${r.t0 ? ` · ${esc(r.t0)} – ${esc(r.t1 || "")}` : ""}</span>` : ""}</span></div>`).join("")}</div></details>`;
  }
  function landmarksHTML(t) {
    const ms = LMS.filter((m) => m.trips.includes(t.id)); if (!ms.length) return "";
    return `<details class="lms"><summary>Landmarks in your photos <span class="stat-s">${ms.length}</span></summary><div class="lm-list">${ms.map((m) =>
      `<div class="lm"><div class="lm-h"><b>${esc(m.name)}</b><span class="stat-s">${esc(m.city)}${m.year ? " · " + esc(/^\d/.test(m.year) ? "since " + m.year : m.year) : ""}${m.unesco ? " · UNESCO" : ""}</span></div><p>${esc(m.fact)}</p><a class="stat-s" href="${esc(m.url)}" target="_blank" rel="noopener">official page ↗</a></div>`).join("")}</div>
      <p class="stat-s lm-src">Facts from each place's official page, gathered by Gemini from your photos (Nov 21); not second-read yet.</p></details>`;
  }

  /* The index (2026-11-23): every trip at a glance, newest first after anything ahead, each row opening its file below. A trip
     file opens one at a time (its photos load when it opens); a trip ahead or in progress starts open. */
  const open = new Set();
  const span = (t) => { const a = dparse(t.start), b = dparse(t.end), sm = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    return `${MON[a.getMonth()][0] + MON[a.getMonth()].slice(1).toLowerCase()} ${a.getDate()}${sm ? "" : " – " + MON[b.getMonth()][0] + MON[b.getMonth()].slice(1).toLowerCase() + " " + b.getDate()}${sm && b.getDate() !== a.getDate() ? "–" + b.getDate() : ""}, ${b.getFullYear()}`; };
  function indexHTML(trips) {
    const rows = trips.map((t) => {
      const ph = PH[t.id] || [], legs = (legsOf(t) || []).filter((l) => !l.home), n = nights(t);
      const countries = [...new Set(legs.map((l) => l.country).filter(Boolean))];
      const cover = ph.length ? `<img loading="lazy" decoding="async" src="photos/t/${ph[0].id}.webp" alt="">` : `<span class="ix-glyph" aria-hidden="true">${esc((t.dest || t.name || "?").slice(0, 1))}</span>`;
      return `<button class="ix-row${isPast(t) ? "" : " ahead"}" type="button" data-open="${esc(t.id)}">${cover}<span class="ix-b"><b>${esc(t.name)}</b>
        <span class="ix-m">${span(t)} · ${n + 1}\u00a0${n ? "days" : "day"}${legs.length ? ` · ${legs.length}\u00a0${legs.length === 1 ? "stop" : "stops"}` : ""}${ph.length ? ` · ${ph.length}\u00a0${ph.length === 1 ? "photo" : "photos"}` : ""}</span>
        <span class="ix-c">${esc(countries.join(" · ") || t.dest || "")}</span></span><span class="ix-go" aria-hidden="true">›</span></button>`;
    }).join("");
    const years = [...new Set(trips.map((t) => t.start.slice(0, 4)))].sort();
    return `<div class="ix"><div class="ix-years" aria-hidden="true">${years.map((y) => `<span>${y}<i>${trips.filter((t) => t.start.startsWith(y)).length}</i></span>`).join("")}</div>${rows}</div>`;
  }
  function toggle(id, force) {
    const card = document.querySelector(`.trip[data-trip="${CSS.escape(id)}"]`); if (!card) return;
    const on = force != null ? force : !card.classList.contains("open");
    card.classList.toggle("open", on); card.querySelector(".trip-toggle").setAttribute("aria-expanded", on);
    card.querySelector(".trip-toggle").textContent = on ? "Close trip file" : "Open trip file";
    if (on) { open.add(id); if (card._jr && !card._jr.started) { card._jr.started = true; card._jr.start(); card._jr.bindMap(); } } else open.delete(id);
  }

  function paint() {
    timers.forEach((x) => clearInterval(x)); timers.clear();
    const all = S.list("trips");
    const trips = [...all.filter((t) => !isPast(t)).sort((a, b) => a.start.localeCompare(b.start)), ...all.filter(isPast).sort((a, b) => b.start.localeCompare(a.start))];
    const el = $("#o-list");
    el.innerHTML = trips.length ? indexHTML(trips) : `<p class="empty">No trips yet.</p>`;
    el.querySelectorAll(".ix-row").forEach((b) => b.addEventListener("click", () => {
      toggle(b.dataset.open, true);
      const c = document.querySelector(`.trip[data-trip="${CSS.escape(b.dataset.open)}"]`);
      if (c) c.scrollIntoView({ block: "start", behavior: calm() ? "auto" : "smooth" });
    }));
    const health = readPillarHealth();
    const awayMeta = window.PB && PB.meta.get("away");

    /* Departure-board strip: the anchor + the state of the board, at a glance. */
    const board = $("#o-board");
    const totalNights = trips.reduce((s, t) => s + nights(t), 0);
    const countries = new Set(trips.flatMap((t) => (legsOf(t) || []).filter((l) => !l.home && l.country).map((l) => l.country)));
    board.innerHTML = `<div class="board">
      <div class="board-cell"><span class="board-k">Home base</span><span class="board-v">${OD ? esc(OD.home.name.split(",")[0]) : "—"}</span></div>
      <div class="board-cell"><span class="board-k">Coordinates</span><span class="board-v board-coords">${OD ? OD.home.lat.toFixed(5) + "° N · " + Math.abs(OD.home.lon).toFixed(5) + "° W" : "—"}</span></div>
      <div class="board-cell"><span class="board-k">Trips filed</span><span class="board-v">${trips.length}</span></div>
      <div class="board-cell"><span class="board-k">Nights on record</span><span class="board-v">${totalNights}</span></div>
      <div class="board-cell"><span class="board-k">Countries</span><span class="board-v">${countries.size}</span></div>
      <div class="board-cell"><span class="board-k">Away mode</span><span class="board-v ${awayMeta ? "board-away" : ""}">${awayMeta ? "ON" : "OFF"}</span></div>
    </div>`;

    for (const t of trips) {
      const packs = t.packState || {};
      const isAway = !!(awayMeta && awayMeta.tripId === t.id);
      const past = isPast(t), seed = seedOf(t), from = fromOf(t);
      const roadNote = t.car && !past   // a trip on record needs no packing count
        ? `Bastion car kit: ${health.carItems} item(s) packed · Vehicle services due <=500 mi: ${health.sDue}`
        : "";
      const card = h("div.trip" + (past ? ".past" : ""), { "data-trip": t.id },
        h("div.trip-head", null,
          h("div.trip-route", null,
            h("span.trip-from", null, from.name.toUpperCase()),
            h("span.trip-arrow", null, "⟶"),
            h("span.trip-to", null, (t.dest || t.name || "").toUpperCase())
          ),
          isAway ? h("span.pill.soon", null, "Away mode on · Home screen prioritized") : past ? h("span.pill.rec", null, "On record · " + t.start.slice(0, 4)) : null
        ),
        h("h3", null, t.name),
        h("div.stat-s", null, `${t.dest ? esc(t.dest) + " · " : ""}${span(t)}${roadNote ? " · " + roadNote : ""}`),
        h("button.btn.quiet.small.trip-toggle", { type: "button", "aria-expanded": "false", onclick: () => toggle(t.id) }, "Open trip file")
      );
      const body = h("div.trip-body", null);
      const jr = journey(t, card); if (jr) body.append(jr);
      const arc = h("div.journey", null); arc.innerHTML = mapSVG(t) || arcSVG(t); body.append(arc);
      card._jr = jr;
      if (t.notes && past) body.append(h("p.trip-notes", null, t.notes));          // a trip on record: what it was, then its log
      const tl = h("div", null); tl.innerHTML = timelineHTML(t) + daysHTML(t) + landmarksHTML(t); body.append(tl);
      card.append(body);
      if (t.notes && !past) body.append(h("p.trip-notes", null, t.notes));
      if (seed && seed.budget) { const b = h("div", null); b.innerHTML = budgetHTML(seed.budget, legsOf(t)); body.append(b); }
      if (seed && seed.plans) {
        const d = h("details.plans", null, h("summary", null, `Planning notes from the sheet (${seed.plans.length})`));
        for (const p of seed.plans) d.append(h("p", null, h("b", null, p.at), " · ", p.text));
        body.append(d);
      }
      if (seed && seed.source) body.append(h("p.stat-s.trip-src", null, "Source: " + seed.source));
      if (!past) body.append(h("div.checks", null,
        h("div.check-col", null,
          h("h4", null, "Packing — generated from this trip"),
          ...TRIP.packingList(t).map((p) => h("label.check", null,
            h("input", { type: "checkbox", ...(packs[p] ? { checked: "" } : {}), onchange: (ev) => { t.packState = t.packState || {}; t.packState[p] = ev.target.checked; S.set("trips", trips); } }),
            " ", p
          ))
        ),
        h("div.check-col", null,
          h("h4", null, "Before you leave — the house (winter countdown)"),
          ...[7, 5, 4, 3, 2, 1, 0].flatMap((d) => {
            const group = TRIP.HOME_CHECKS.filter((c) => c.daysBefore === d);
            if (!group.length) return [];
            return [h("p.stat-s", { style: "margin:8px 0 2px;font-weight:700" }, d === 0 ? "Departure day" : `${d} day${d === 1 ? "" : "s"} before`),
              ...group.map((c) => h("label.check", null,
                h("input", { type: "checkbox", ...((t.homeState || {})[c.task] ? { checked: "" } : {}), onchange: (ev) => { t.homeState = t.homeState || {}; t.homeState[c.task] = ev.target.checked; S.set("trips", trips); } }),
                " ", c.task, c.critical ? h("span.pill over", null, " critical") : null,
                c.url ? h("a", { href: c.url, target: "_blank", rel: "noopener", class: "stat-s" }, " source ↗") : null
              ))];
          })
        )
      ));
      body.append(h("div.row-actions", { style: "margin-top:8px" },
        isAway
          ? h("button.btn.quiet.small", { type: "button", onclick: () => { setAway(null); paint(); } }, "End away mode")
          : past ? null : h("button.btn.small", { type: "button", onclick: () => { setAway(t); toast("Away mode ON — Hub Picture panel switched"); paint(); } }, "Set away mode"),
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
      if (open.has(t.id) || (!past && !open.size)) toggle(t.id, true);
    }
    if (typeof paintAtlas === "function" && atlasReady) paintAtlas();
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
          h("span.pill", null, r.inferred ? "Destination inferred" : "Your route")
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

  /* The atlas (2026-11-23): every stop of every trip, one detailed map per region (the outlines in basemap.js), the routes faint and
     the trip you pick lit, the landmarks from your photos as diamonds. Tap a place for its visits and a way into each trip file.
     Distances are straight-line between stops; nothing here is stored. */
  const REG = [["europe", "Europe"], ["philippines", "Philippines"], ["west", "US West & Mexico"], ["east", "US East"]];
  const at = { reg: null, trip: null, pl: null };
  var atlasReady = false;                                     // paint() may run before this point is reached; the atlas waits
  function atlasData() {
    const trips = S.list("trips").filter((t) => t.start).sort((a, b) => a.start.localeCompare(b.start)), places = [], base = window.ODYSSEY_BASEMAP || [];
    let dist = 0;
    for (const t of trips) {
      const L = (legsOf(t) || []).filter((l) => !l.home && Number.isFinite(l.lat) && Number.isFinite(l.lon));
      for (let i = 1; i < L.length; i++) dist += miles(L[i - 1], L[i]);
      for (const l of L) {
        let q = places.find((x) => Math.abs(x.lat - l.lat) < 0.2 && Math.abs(x.lon - l.lon) < 0.2);
        if (!q) places.push(q = { id: "p" + places.length, name: l.name, country: l.country || "", lat: l.lat, lon: l.lon, approx: !!l.approx, visits: [] });
        const v = q.visits.find((x) => x.t.id === t.id);
        if (v) { v.nights += l.nights || 0; v.last = l.at; } else q.visits.push({ t, at: l.at, last: l.at, nights: l.nights || 0 });
      }
    }
    for (const q of places) { const r = base.find((b) => q.lon >= b.bbox[0] && q.lon <= b.bbox[2] && q.lat >= b.bbox[1] && q.lat <= b.bbox[3]); q.reg = r ? r.id : null; q.stay = q.visits.reduce((a, v) => a + v.nights, 0); }
    const far = OD ? places.reduce((m, q) => { const d = miles(OD.home, q); return d > m.d ? { q, d } : m; }, { q: null, d: 0 }) : { q: null, d: 0 };
    return { trips, places, dist, far, countries: new Set(places.map((q) => q.country).filter(Boolean)).size };
  }
  function atlasMap(A, reg) {
    const base = (window.ODYSSEY_BASEMAP || []).find((b) => b.id === reg), pl = A.places.filter((q) => q.reg === reg);
    if (!base || !pl.length) return "";
    const lats = pl.map((q) => q.lat), lons = pl.map((q) => q.lon), k = Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * Math.PI / 180);
    const X = (lon) => lon * 100 * k, Y = (lat) => -lat * 100, f1 = (v) => v.toFixed(1);
    let x0 = X(Math.min(...lons)), x1 = X(Math.max(...lons)), y0 = Y(Math.max(...lats)), y1 = Y(Math.min(...lats));
    const pad = Math.max(x1 - x0, y1 - y0) * 0.12 + 60; x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    let W = x1 - x0, H = y1 - y0;
    if (H / W > 1.05) { const a = (H / 1.05 - W) / 2; x0 -= a; x1 += a; } else if (H / W < 0.66) { const a = (W * 0.66 - H) / 2; y0 -= a; y1 += a; }
    x0 = Math.max(x0, X(base.bbox[0])); x1 = Math.min(x1, X(base.bbox[2])); y0 = Math.max(y0, Y(base.bbox[3])); y1 = Math.min(y1, Y(base.bbox[1]));
    W = x1 - x0; H = y1 - y0;
    const fs = W / 30, rad = fs * 0.28, sel = at.trip, inTrip = (q) => !sel || q.visits.some((v) => v.t.id === sel);
    let routes = "";
    for (const t of A.trips) {
      const L = (legsOf(t) || []).filter((l) => !l.home && Number.isFinite(l.lat) && pl.some((q) => Math.abs(q.lat - l.lat) < 0.2 && Math.abs(q.lon - l.lon) < 0.2));
      let d = "";
      for (let i = 1; i < L.length; i++) {
        const a = L[i - 1], b = L[i], ax = X(a.lon), ay = Y(a.lat), bx = X(b.lon), by = Y(b.lat), bow = b.by === "flight" ? 0.18 : 0.08;
        if (Math.hypot(bx - ax, by - ay) < 1) continue;
        d += `M${f1(ax)} ${f1(ay)}Q${f1((ax + bx) / 2 + (by - ay) * bow)} ${f1((ay + by) / 2 - (bx - ax) * bow)} ${f1(bx)} ${f1(by)}`;
      }
      if (d) routes += `<path class="at-route${sel === t.id ? " on" : sel ? " off" : ""}" vector-effect="non-scaling-stroke" d="${d}"/>`;
    }
    const lms = (window.ODYSSEY_LANDMARKS || []).filter((m) => X(m.lon) > x0 && X(m.lon) < x1 && Y(m.lat) > y0 && Y(m.lat) < y1 && (!sel || m.trips.includes(sel)));
    const lmk = lms.map((m) => { const cx = X(m.lon), cy = Y(m.lat), r = rad * 0.8; return `<path class="map-lm" vector-effect="non-scaling-stroke" d="M${f1(cx)} ${f1(cy - r)}L${f1(cx + r)} ${f1(cy)}L${f1(cx)} ${f1(cy + r)}L${f1(cx - r)} ${f1(cy)}Z"><title>${esc(m.name)}</title></path>`; }).join("");
    const size = (q) => rad * (1 + Math.min(1, q.stay / 8) * 0.7);
    const boxes = pl.map((q) => { const r = size(q) * 1.3; return { x: X(q.lon) - r, y: Y(q.lat) - r, w: r * 2, h: r * 2 }; });
    const hit = (b) => b.x < x0 + 4 || b.y < y0 + 4 || b.x + b.w > x1 - 4 || b.y + b.h > y1 - 4 || boxes.some((o) => b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h);
    let labels = "";
    for (const q of [...pl].sort((a, b) => (b.id === at.pl) - (a.id === at.pl) || inTrip(b) - inTrip(a) || b.visits.length - a.visits.length || b.stay - a.stay)) {
      const px = X(q.lon), py = Y(q.lat), tw = q.name.length * fs * 0.55, gap = size(q) + fs * 0.3;
      for (const [dx, dy, an] of [[gap, fs * 0.36, "start"], [-gap, fs * 0.36, "end"], [0, -gap, "middle"], [0, gap + fs * 0.75, "middle"]]) {
        const lx = px + dx, ly = py + dy, bx = an === "start" ? lx : an === "end" ? lx - tw : lx - tw / 2, box = { x: bx - fs * 0.1, y: ly - fs * 0.82, w: tw + fs * 0.2, h: fs * 1.02 };
        if (hit(box)) continue;
        boxes.push(box); labels += `<text class="map-lab${inTrip(q) ? "" : " off"}" x="${f1(lx)}" y="${f1(ly)}" text-anchor="${an}" font-size="${f1(fs)}" stroke-width="${f1(fs * 0.24)}">${esc(q.name)}</text>`; break;
      }
    }
    const dots = pl.map((q) => `<circle class="at-dot${inTrip(q) ? (sel ? " on" : "") : " off"}${q.id === at.pl ? " sel" : ""}${q.approx ? " approx" : ""}" data-pl="${q.id}" vector-effect="non-scaling-stroke" cx="${f1(X(q.lon))}" cy="${f1(Y(q.lat))}" r="${f1(size(q))}"><title>${esc(q.name)}${q.country ? ", " + esc(q.country) : ""}</title></circle>`).join("");
    const hitArea = pl.map((q) => `<circle class="at-hit" data-pl="${q.id}" cx="${f1(X(q.lon))}" cy="${f1(Y(q.lat))}" r="${f1(Math.max(rad * 3, W / 26))}"/>`).join("");
    return `<svg class="tmap at-map" viewBox="${f1(x0)} ${f1(y0)} ${f1(W)} ${f1(H)}" role="img" data-region="${reg}" data-places="${pl.length}" aria-label="Map of ${esc(REG.find((r) => r[0] === reg)[1])}: ${esc(pl.map((q) => q.name).join(", "))}">
      <rect class="map-sea" x="${f1(x0)}" y="${f1(y0)}" width="${f1(W)}" height="${f1(H)}"/>
      <path class="map-land" vector-effect="non-scaling-stroke" transform="scale(${k.toFixed(5)} 1)" d="${base.d}"/>${base.b ? `<path class="map-border" vector-effect="non-scaling-stroke" transform="scale(${k.toFixed(5)} 1)" d="${base.b}"/>` : ""}
      ${routes}${lmk}${dots}${labels}${hitArea}</svg>`;
  }
  const md = (ds) => { const d = dparse(ds); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
  function paintAtlas() {
    const box = $("#o-atlas"); if (!box) return;
    const A = atlasData(), counts = Object.fromEntries(REG.map(([id]) => [id, A.places.filter((q) => q.reg === id).length]));
    if (!A.places.length) { box.innerHTML = `<p class="empty">File a trip with stops and its places land here.</p>`; return; }
    if (!at.reg || !counts[at.reg]) at.reg = REG.map((r) => r[0]).sort((a, b) => counts[b] - counts[a])[0];
    const here = A.places.filter((q) => q.reg === at.reg), trips = A.trips.filter((t) => here.some((q) => q.visits.some((v) => v.t.id === t.id)));
    if (at.trip && !trips.some((t) => t.id === at.trip)) at.trip = null;
    const pick = A.places.find((q) => q.id === at.pl && q.reg === at.reg) || null;
    const nm = (t) => esc(t.name || t.dest || "Trip");
    box.innerHTML = `
      <div class="at-stats">
        <div><b>${A.places.length}</b><span>places</span></div><div><b>${A.countries}</b><span>countries</span></div>
        <div><b>${A.trips.length}</b><span>trips</span></div><div><b>${(window.ODYSSEY_LANDMARKS || []).length}</b><span>landmarks</span></div>
        <div><b>${Math.round(A.dist).toLocaleString("en-US")}</b><span>miles between stops</span></div>
        ${A.far.q ? `<div><b>${Math.round(A.far.d).toLocaleString("en-US")}</b><span>miles from home: ${esc(A.far.q.name)}, the farthest</span></div>` : ""}
      </div>
      <div class="at-regs" role="tablist" aria-label="Region">${REG.filter(([id]) => counts[id]).map(([id, name]) => `<button type="button" class="at-reg${id === at.reg ? " on" : ""}" role="tab" aria-selected="${id === at.reg}" data-reg="${id}">${esc(name)} <i>${counts[id]}</i></button>`).join("")}</div>
      <figure class="tmap-wrap at-wrap">${atlasMap(A, at.reg)}
        <figcaption class="map-key"><span class="mk"><svg viewBox="0 0 10 10" aria-hidden="true"><circle class="at-dot" cx="5" cy="5" r="3.4"/></svg>A place (bigger: more nights)</span><span class="mk"><svg viewBox="0 0 10 10" aria-hidden="true"><path class="map-lm" d="M5 1L9 5L5 9L1 5Z"/></svg>Landmark in your photos</span><span class="mk">straight-line routes between stops</span></figcaption></figure>
      <div class="at-trips" aria-label="Light one trip">${trips.length > 1 ? `<button type="button" class="chip${at.trip ? "" : " on"}" aria-pressed="${!at.trip}" data-trip="">All trips</button>` : ""}${trips.map((t) => `<button type="button" class="chip${at.trip === t.id ? " on" : ""}" aria-pressed="${at.trip === t.id}" data-trip="${esc(t.id)}">${t.start.slice(0, 4)} · ${nm(t)}</button>`).join("")}</div>
      <div class="at-pick" aria-live="polite">${pick ? `<b>${esc(pick.name)}</b>${pick.country ? `<span class="stat-s"> · ${esc(pick.country)}${pick.approx ? " · approximate spot" : ""}</span>` : ""}
        ${pick.visits.map((v) => `<div class="at-visit"><span>${nm(v.t)} · ${md(v.at)}${v.last !== v.at ? "–" + md(v.last) : ""}, ${v.at.slice(0, 4)}${v.nights ? ` · ${v.nights} night${v.nights === 1 ? "" : "s"}` : ""}</span><button type="button" class="pk-ref-btn" data-open="${esc(v.t.id)}">Open trip file</button></div>`).join("")}`
        : `<span class="stat-s">Tap a place on the map for when you were there.</span>`}</div>`;
  }
  $("#o-atlas") && $("#o-atlas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-reg],[data-trip],[data-pl],[data-open]"); if (!b) return;
    if (b.dataset.reg) { at.reg = b.dataset.reg; at.trip = null; at.pl = null; }
    else if (b.dataset.trip != null && b.matches("[data-trip]")) { at.trip = b.dataset.trip || null; at.pl = null; }
    else if (b.dataset.pl) at.pl = at.pl === b.dataset.pl ? null : b.dataset.pl;
    else if (b.dataset.open) { const id = b.dataset.open; toggle(id, true); const c = document.querySelector(`.trip[data-trip="${CSS.escape(id)}"]`); if (c) c.scrollIntoView({ block: "start", behavior: calm() ? "auto" : "smooth" }); return; }
    paintAtlas();
  });

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
  atlasReady = true;
  paint();
})();
