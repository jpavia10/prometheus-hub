/* Odyssey signature (2026-11-23): your travel world. A globe with the real coastlines (globe.js, Natural Earth 1:110m) turns from one
   trip to the next in the order you took them. Each trip is drawn as great-circle arcs lifted off the surface, from where you left to
   every stop in order; the trip in view is lit and a spark travels it; every place you have been is a light on the surface; home is
   marked. A trip ahead is drawn in gold. Tap for the next trip. Reduced motion: one still view, and a tap still turns to the next trip.
   Data: the trips in this browser and the legs Odyssey ships for them (odyssey-data.js); nothing here writes anything. */
(function () {
  const S = PK.store("odyssey"), OD = window.ODYSSEY_DATA || null, LAND = window.ODYSSEY_GLOBE || [];
  const RAD = Math.PI / 180, GOLD = "#ffc552";
  const FROM = { DTW: [42.2124, -83.3534], LAX: [33.9416, -118.4085], LA: [34.0522, -118.2437], LGB: [33.7529, -118.1897] };
  const home = OD && OD.home ? [OD.home.lat, OD.home.lon] : [34.82, -118.95];
  const vec = (lat, lon) => { const a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)]; };
  const toLL = (v) => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return [Math.asin(v[2] / n) / RAD, Math.atan2(v[1], v[0]) / RAD]; };
  const seedOf = (t) => (OD && OD.seedTrips.find((x) => x.id === t.id)) || null;
  /* the coastlines as unit vectors, once */
  const COAST = LAND.map((r) => { const o = []; for (let i = 0; i < r.length; i += 2) o.push(vec(r[i + 1] / 10, r[i] / 10)); return o; });

  /* great-circle points from a to b, lifted off the surface by up to a fifth of the radius on long legs */
  function arc(a, b) {
    const va = vec(a[0], a[1]), vb = vec(b[0], b[1]), om = Math.acos(Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
    const n = Math.max(4, Math.round(om * 48)), hi = Math.min(0.2, 0.02 + om * 0.16), out = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n, k1 = om < 1e-6 ? 1 - s : Math.sin((1 - s) * om) / Math.sin(om), k2 = om < 1e-6 ? s : Math.sin(s * om) / Math.sin(om);
      out.push({ v: [va[0] * k1 + vb[0] * k2, va[1] * k1 + vb[1] * k2, va[2] * k1 + vb[2] * k2], lift: 1 + hi * Math.sin(Math.PI * s) });
    }
    return out;
  }

  /* trips with places on the map, oldest first: the route (where you left, then each stop) and the point the globe turns to */
  function tripsOnGlobe(I, today) {
    return S.list("trips").filter((t) => t.start).map((t) => {
      const sd = seedOf(t), legs = ((t.legs && t.legs.length ? t.legs : sd && sd.legs) || []).filter((l) => !l.home && Number.isFinite(l.lat) && Number.isFinite(l.lon));
      if (!legs.length) return null;
      const f = FROM[((t.from || (sd && sd.from)) || {}).code] || home, pts = [f, ...legs.map((l) => [l.lat, l.lon])];
      let path = []; for (let i = 1; i < pts.length; i++) { const seg = arc(pts[i - 1], pts[i]); path = path.concat(i > 1 ? seg.slice(1) : seg); }
      const c = legs.reduce((s, l) => { const v = vec(l.lat, l.lon); return [s[0] + v[0], s[1] + v[1], s[2] + v[2]]; }, [0, 0, 0]);
      return { id: t.id, name: t.name || t.dest || "Trip", start: t.start, year: t.start.slice(0, 4), days: (t.end ? Math.max(0, I.days(t.start, t.end)) : 0) + 1,
               ahead: I.days(today, t.end || t.start) >= 0, path, stops: legs.map((l) => ({ lat: l.lat, lon: l.lon, country: l.country || "" })), focus: toLL(c) };
    }).filter(Boolean).sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
  }

  /* the view: the globe's centre (lat, lon), eased from one trip to the next */
  const view = { lat: 24, lon: -100, fLat: 24, fLon: -100, tLat: 24, tLon: -100, k: 1, i: -1, at: 0 };
  const aim = (f) => [Math.max(-35, Math.min(48, f[0] * 0.85)), f[1]];
  function goTo(D, i, t, snap) {
    if (!D.trips.length) return;
    view.i = ((i % D.trips.length) + D.trips.length) % D.trips.length; const [la, lo] = aim(D.trips[view.i].focus);
    view.fLat = view.lat; view.fLon = view.lon; view.tLat = la; view.tLon = view.fLon + ((((lo - view.fLon) % 360) + 540) % 360 - 180);
    view.k = snap ? 1 : 0; view.at = t; if (snap) { view.lat = view.tLat; view.lon = view.tLon; }
  }
  function project(cx, cy, R) {
    const la = view.lat * RAD, lo = view.lon * RAD, sl = Math.sin(lo), cl = Math.cos(lo), sa = Math.sin(la), ca = Math.cos(la);
    return (v, lift) => {
      const h = lift || 1, x = -v[0] * sl + v[1] * cl, y0 = v[0] * cl + v[1] * sl, y = -y0 * sa + v[2] * ca, z = y0 * ca + v[2] * sa;
      /* a lifted point is seen while it is in front of the globe or out past its rim */
      return { x: cx + R * h * x, y: cy - R * h * y, z, vis: z > 0 || (h > 1 && (x * x + y * y) * h * h > 1) };
    };
  }
  const stroke = (g, P, test) => { g.beginPath(); let on = false; for (const p of P) { if (test(p)) { on ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); on = true; } else on = false; } };

  PK.stage({
    label: "Your travel world: every trip on a globe, from where you left to each stop. Tap for the next trip.",
    data(St) {
      const I = PK.ink, today = I.today();
      const all = S.list("trips").filter((t) => t.start).map((t) => ({ ...t, d: I.days(today, t.start), n: t.end ? Math.max(0, I.days(t.start, t.end)) : 0 })).sort((a, b) => a.d - b.d);
      const ahead = all.filter((t) => I.days(today, t.end || t.start) >= 0);
      const away = window.PB && PB.meta ? PB.meta.get("away") : null;
      const trips = tripsOnGlobe(I, today), places = [];
      for (const t of trips) for (const s of t.stops) if (!places.some((p) => Math.abs(p.lat - s.lat) < 0.2 && Math.abs(p.lon - s.lon) < 0.2)) places.push({ ...s, v: vec(s.lat, s.lon) });
      const countries = new Set(trips.flatMap((t) => t.stops.map((s) => s.country).filter(Boolean)));
      return { ahead, away: !!(away && away.tripId), trips, places, countries: countries.size, past: all.length - ahead.length };
    },
    readouts(D) {
      const n = D.ahead[0];
      return [
        { v: n ? (n.d <= 0 ? "Now" : n.d + " d") : "—", k: n ? (n.name || n.dest || "Next trip") : "No trip planned" },
        { v: D.past, k: "Trips on record" },
        D.away ? { v: "Held", k: "Away mode on", tone: "warn" } : { v: D.countries, k: D.countries === 1 ? "Country" : "Countries" },
      ];
    },
    tap(x, y, St) {
      const D = St.data; if (!D || !D.trips.length) return;
      if (St.w >= 720 && x < St.w / 2 - Math.min(St.w * 0.38, St.h * 0.38) - 20) {          /* a row in the list: that trip */
        const row = Math.min(22, (St.h - 70) / D.trips.length), y0 = St.h / 2 - (row * D.trips.length) / 2 + row / 2, i = Math.round((y - y0) / row);
        if (i >= 0 && i < D.trips.length) return goTo(D, i, St.t, St.still);
      }
      goTo(D, view.i + 1, St.t, St.still);
    },
    draw(g, St, I) {
      const D = St.data, w = St.w, h = St.h, A = St.accent, B = St.accent2, t = St.t;
      const cx = w / 2, cy = h / 2 + 4, R = Math.min(w * 0.38, h * 0.38);
      /* first frame: start on the trip ahead, else the latest one */
      if (view.i < 0 && D.trips.length) { const k = D.trips.findIndex((x) => x.ahead); goTo(D, k >= 0 ? k : D.trips.length - 1, t, true); }
      if (view.i >= D.trips.length) view.i = D.trips.length - 1;
      /* the tour: the next trip every 6.5 s, a turn takes 1.9 s, and between turns the globe drifts slowly east */
      if (!St.still && D.trips.length > 1 && t - view.at > 6.5) goTo(D, view.i + 1, t);
      if (view.k < 1) { view.k = Math.min(1, view.k + (St.dt || 0.016) / 1.9); const e = I.ease(view.k); view.lat = I.lerp(view.fLat, view.tLat, e); view.lon = I.lerp(view.fLon, view.tLon, e); }
      else if (!St.still) view.lon += (St.dt || 0) * 0.9;
      const cur = D.trips[view.i] || null, P = project(cx, cy, R), CUR = cur && cur.ahead ? GOLD : A;

      /* the sphere: an atmosphere, a body lit from the upper left, a terminator shade */
      I.halo(g, cx, cy, R * 1.5, A, 0.14);
      const body = g.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.05, cx, cy, R);
      body.addColorStop(0, I.rgba(A, 0.26)); body.addColorStop(0.5, "rgba(10,20,40,.96)"); body.addColorStop(1, "rgba(3,6,14,.99)");
      g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();

      /* graticule every 30 degrees, near side only */
      g.lineWidth = 0.6; g.strokeStyle = I.rgba(A, 0.09);
      for (let lon = -180; lon < 180; lon += 30) { const L = []; for (let lat = -80; lat <= 80; lat += 6) L.push(P(vec(lat, lon))); stroke(g, L, (p) => p.z > 0); g.stroke(); }
      for (let lat = -60; lat <= 60; lat += 30) { const L = []; for (let lon = -180; lon <= 180; lon += 6) L.push(P(vec(lat, lon))); stroke(g, L, (p) => p.z > 0); g.stroke(); }

      /* coastlines: the far side faint through the glass, the near side lit and filled */
      const rings = COAST.map((r) => r.map((v) => P(v)));
      g.beginPath(); for (const r of rings) { let on = false; for (const p of r) { if (p.z <= 0) { on ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); on = true; } else on = false; } }
      g.strokeStyle = I.rgba(A, 0.07); g.lineWidth = 0.7; g.stroke();
      g.beginPath(); for (const r of rings) { let on = false; for (const p of r) { if (p.z > 0) { on ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); on = true; } else on = false; } }
      I.glow(g, A, 5); g.strokeStyle = I.rgba(A, 0.6); g.lineWidth = 1; g.stroke(); I.noGlow(g);

      /* every trip's route: faint; a trip ahead in gold */
      for (const tr of D.trips) {
        if (tr === cur) continue;
        stroke(g, tr.path.map((q) => P(q.v, q.lift)), (p) => p.vis);
        g.strokeStyle = I.rgba(tr.ahead ? GOLD : B, tr.ahead ? 0.5 : 0.2); g.lineWidth = 0.9; g.stroke();
      }
      /* the trip in view: lit, and a spark travels it from where you left to the last stop */
      if (cur) {
        const CP = cur.path.map((q) => P(q.v, q.lift));
        stroke(g, CP, (p) => p.vis); I.glow(g, CUR, 9); g.strokeStyle = I.rgba(CUR, 0.95); g.lineWidth = 1.7; g.stroke(); I.noGlow(g);
        if (!St.still && CP.length > 1) {
          const k = Math.min(1, ((t - view.at) % 6.5) / 4.5), p = CP[Math.min(CP.length - 1, Math.round(k * (CP.length - 1)))];
          if (p.vis) { I.halo(g, p.x, p.y, 14, CUR, 0.9); I.dot(g, p.x, p.y, 2.2, "#ffffff"); }
        }
      }
      /* every place you have been: a light on the surface; the stops of the trip in view brighter */
      for (const s of D.places) {
        const p = P(s.v); if (p.z <= 0.02) continue;
        const on = cur && cur.stops.some((q) => Math.abs(q.lat - s.lat) < 0.2 && Math.abs(q.lon - s.lon) < 0.2);
        I.halo(g, p.x, p.y, on ? 9 : 5, on ? CUR : B, (on ? 0.85 : 0.4) * Math.min(1, p.z * 3));
        I.dot(g, p.x, p.y, on ? 2 : 1.2, "#ffffff", (on ? 1 : 0.65) * Math.min(1, p.z * 3));
      }
      /* home, with a slow pulse */
      const hp = P(vec(home[0], home[1]));
      if (hp.z > 0.02) {
        const pulse = St.still ? 0.45 : (t * 0.55) % 1;
        I.arc(g, hp.x, hp.y, 3.5 + pulse * 13, 0, Math.PI * 2, "#ffffff", 1, 0.5 * (1 - pulse));
        I.dot(g, hp.x, hp.y, 2.6, "#ffffff"); I.text(g, "HOME", hp.x + 7, hp.y - 7, { size: 8.5, weight: 700, color: "#ffffff", alpha: 0.85, spacing: 1.4 });
      }
      I.glow(g, A, 12); I.arc(g, cx, cy, R, 0, Math.PI * 2, A, 1.1, 0.5); I.noGlow(g);

      /* wide screens: every trip down the left in the order you took them, the one in view lit */
      if (w >= 720 && D.trips.length) {
        const row = Math.min(22, (h - 70) / D.trips.length), y0 = h / 2 - (row * D.trips.length) / 2 + row / 2;
        I.text(g, "EVERY TRIP", 28, y0 - row - 2, { size: 8.5, weight: 700, color: A, spacing: 2, alpha: 0.8 });
        D.trips.forEach((tr, i) => {
          const y = y0 + i * row, on = i === view.i, col = tr.ahead ? GOLD : on ? A : "#dfe6f5";
          if (on) { I.halo(g, 22, y, 10, col, 0.8); I.dot(g, 22, y, 2.2, "#ffffff"); } else I.dot(g, 22, y, 1.3, col, 0.5);
          I.text(g, tr.year, 34, y, { size: 9, weight: 700, color: col, alpha: on ? 0.95 : 0.45, spacing: 1 });
          I.text(g, I.fit(g, tr.name, Math.min(240, cx - R - 110), 10.5, on ? 600 : 500), 66, y, { size: 10.5, weight: on ? 600 : 500, color: on ? "#f4f1ea" : "#dfe6f5", alpha: on ? 1 : 0.5 });
        });
      }

      /* words: the whole record at the top, the trip in view at the bottom */
      I.text(g, `${D.trips.length} ${D.trips.length === 1 ? "TRIP" : "TRIPS"} · ${D.places.length} PLACES · ${D.countries} ${D.countries === 1 ? "COUNTRY" : "COUNTRIES"}`, w - 14, 18, { size: 8.5, weight: 700, align: "right", color: "#dfe6f5", spacing: 1.4, alpha: 0.6 });
      if (cur) {
        I.text(g, I.fit(g, cur.name, w - 36, 13.5, 600), cx, h - 31, { size: 13.5, weight: 600, align: "center", color: cur.ahead ? "#ffe2a3" : "#f4f1ea" });
        const sub = `${cur.ahead ? "AHEAD · " : ""}${cur.year} · ${cur.days} ${cur.days === 1 ? "DAY" : "DAYS"} · ${cur.stops.length} ${cur.stops.length === 1 ? "STOP" : "STOPS"} · ${view.i + 1} OF ${D.trips.length}`;
        I.text(g, sub, cx, h - 14, { size: 8.5, weight: 600, align: "center", color: "#dfe6f5", spacing: 1.3, alpha: 0.62 });
      } else I.text(g, "File a trip below to see it on the globe", cx, h - 16, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.8 });
      if (D.away) I.text(g, "AWAY · HOME VIEW PRIORITIZED", cx, 36, { size: 9.5, weight: 700, align: "center", color: "#ffd27a", spacing: 2 });
    },
  });
})();
