/* Aether: Light today + the sensors around Frazier Park (Claude, 2026-11-19).
   Light: window.AETHER_SUN (sun.js, AET-GEM-07) works the day out on the phone, so dawn and dusk are there without signal.
   "Check against USNO" asks the Naval Observatory for the same day when online and keeps the result (prometheus.aether.sunCheck).
   Stations: window.AETHER_STATIONS (stations-data.js, AET-GEM-09) through PK.ref. */
(function () {
  const { h, store } = window.PK; const S = store("aether");
  const HOME = { label: "Frazier Park", lat: 34.8228, lon: -118.9445, tz: "America/Los_Angeles" };
  function zoneOffset(tz, d) {                                        // hours east of UTC for that zone on that day (DST included)
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value]));
      return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - d.getTime()) / 36e5 * 4) / 4;
    } catch (_) { return -d.getTimezoneOffset() / 60; }
  }
  function partsIn(tz, d) { try { const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value])); return { date: `${p.year}-${p.month}-${p.day}`, m: +p.hour * 60 + +p.minute }; } catch (_) { return null; } }
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const mins = (hhmm) => (hhmm ? Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5)) : null);
  const clock = (hhmm) => { if (!hhmm) return "none"; let H = Number(hhmm.slice(0, 2)); const ap = H >= 12 ? "pm" : "am"; H = H % 12 || 12; return `${H}:${hhmm.slice(3, 5)} ${ap}`; };
  const span = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + " min" : ""}`.trim());
  const EVENTS = [["astroDawn", "Astronomical dawn"], ["nauticalDawn", "Nautical dawn"], ["civilDawn", "First light (civil dawn)"], ["sunrise", "Sunrise"], ["noon", "Solar noon"],
    ["sunset", "Sunset"], ["civilDusk", "Last light (civil dusk)"], ["nauticalDusk", "Nautical dusk"], ["astroDusk", "Astronomical dusk"]];

  function place() { const p = window.PK.devicePlace && window.PK.devicePlace(); return p ? { ...p, tz: Intl.DateTimeFormat().resolvedOptions().timeZone } : HOME; }
  function today() {                                                  // the place's own clock: Frazier Park is always Pacific time, whatever zone the phone is set to
    const now = new Date(), p = place(), tz = zoneOffset(p.tz, now), local = partsIn(p.tz, now) || { date: ymd(now), m: now.getHours() * 60 + now.getMinutes() };
    return { now, p, tz, date: local.date, nowM: local.m, t: window.AETHER_SUN ? window.AETHER_SUN.times(local.date, p.lat, p.lon, tz) : null };
  }

  function band(t) {                                                  // the day as colour: night, the three twilights, day; the now-mark on top
    const stops = [];
    const at = (k) => mins(t[k]);
    const pct = (m) => ((m / 1440) * 100).toFixed(2) + "%";
    const seq = [["astroDawn", "var(--ae-astro)"], ["nauticalDawn", "var(--ae-naut)"], ["civilDawn", "var(--ae-civil)"], ["sunrise", "var(--ae-day)"],
      ["sunset", "var(--ae-civil)"], ["civilDusk", "var(--ae-naut)"], ["nauticalDusk", "var(--ae-astro)"], ["astroDusk", "var(--ae-night)"]];
    let last = "var(--ae-night)"; stops.push(`${last} 0%`);
    for (const [k, c] of seq) { const m = at(k); if (m == null) continue; stops.push(`${last} ${pct(m)}`, `${c} ${pct(m)}`); last = c; }
    stops.push(`${last} 100%`);
    return `linear-gradient(90deg, ${stops.join(", ")})`;
  }

  function lightCard(grid) {
    const panel = h("div.glass.lit.span-12.ae-light", null,
      h("h2", null, "Light today"),
      h("p.sub", null, "Dawn, sunrise, sunset and the three twilights for where you are, worked out on the phone (NOAA method), so they are here without signal."));
    const body = h("div.ae-light-body"); panel.append(body); grid.prepend(panel);
    let timer = 0;
    function paint() {
      const D = today(); if (!D.t) { body.replaceChildren(h("p.empty", null, "The sun module did not load.")); return; }
      const nowM = D.nowM;
      const next = EVENTS.map(([k, label]) => ({ k, label, m: mins(D.t[k]) })).filter((e) => e.m != null && e.m > nowM)[0];
      const dayLen = mins(D.t.sunset) != null && mins(D.t.sunrise) != null ? (mins(D.t.sunset) - mins(D.t.sunrise) + 1440) % 1440 : null;
      const bar = h("div.ae-band", { style: `background:${band(D.t)}`, role: "img", "aria-label": `Daylight from ${clock(D.t.sunrise)} to ${clock(D.t.sunset)}` },
        h("i.ae-now", { style: `left:${((nowM / 1440) * 100).toFixed(2)}%` }),
        ...["sunrise", "noon", "sunset"].map((k) => mins(D.t[k]) == null ? null : h("span.ae-tick", { style: `left:${Math.min(92, Math.max(8, (mins(D.t[k]) / 1440) * 100)).toFixed(2)}%` }, clock(D.t[k]))));
      const check = S.get("sunCheck", null);
      body.replaceChildren(
        h("div.ae-light-top", null,
          h("div", null, h("span.stat-s", null, `${D.p.label} · ${D.date}`), h("b.ae-next", null, next ? `${next.label} in ${span(next.m - nowM)}` : "The sun is down for the night"),
            h("span.stat-s", null, dayLen != null ? `${span(dayLen)} of daylight` : "No sunrise or sunset today")),
          h("button.btn.quiet.small", { type: "button", onclick: () => usno(D) }, "Check against USNO")),
        bar,
        h("div.ae-events", null, ...EVENTS.map(([k, label]) => h("div.ae-ev" + (next && next.k === k ? ".next" : "") + (mins(D.t[k]) != null && mins(D.t[k]) <= nowM ? ".past" : ""), null,
          h("span.stat-s", null, label), h("b", null, clock(D.t[k]))))),
        check ? h("p.stat-s.ae-check", null, check.text) : h("p.stat-s.ae-check", null, "Not yet checked against the US Naval Observatory on this phone."));
    }
    async function usno(D) {
      const out = body.querySelector(".ae-check"); out.textContent = "Asking the US Naval Observatory…";
      const url = `https://aa.usno.navy.mil/api/rstt/oneday?date=${D.date}&coords=${D.p.lat.toFixed(4)},${D.p.lon.toFixed(4)}&tz=${D.tz}`;
      try {
        const r = await fetch(url); if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json(); const sd = (j.properties && j.properties.data && j.properties.data.sundata) || [];
        const map = { "Begin Civil Twilight": "civilDawn", Rise: "sunrise", "Upper Transit": "noon", Set: "sunset", "End Civil Twilight": "civilDusk" };
        const diffs = sd.filter((x) => map[x.phen]).map((x) => ({ k: map[x.phen], d: mins(D.t[map[x.phen]]) - mins(x.time.slice(0, 5)) }));
        if (!diffs.length) throw new Error("no sun data in the reply");
        const worst = Math.max(...diffs.map((x) => Math.abs(x.d)));
        const text = `${D.date}: USNO agrees within ${worst} min on ${diffs.length} events (${worst <= 2 ? "inside" : "OUTSIDE"} the 2-minute bar).`;
        S.set("sunCheck", { at: new Date().toISOString(), date: D.date, worst, diffs, text }); out.textContent = text;
      } catch (e) { out.textContent = `USNO could not be reached from this page (${e.message}). The times above still stand; they are worked out on the phone.`; }
    }
    paint();
    const tick = () => { clearTimeout(timer); timer = setTimeout(() => { if (!document.hidden) paint(); tick(); }, 60000); };
    tick(); document.addEventListener("visibilitychange", () => { if (!document.hidden) paint(); });
  }

  function stations(grid) {
    if (!window.AETHER_STATIONS || !window.PK.ref) return;
    const mount = window.PK.refPanel(grid, { title: "Sensors around Frazier Park", sub: "The 12 nearest weather and air stations, closest first: what each measures and its live page." });
    window.PK.ref(mount, {
      rows: window.AETHER_STATIONS, group: (r) => r.network,
      title: (r) => `${r.id} · ${r.name.replace(/\s+/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}`,
      value: (r) => r.measures, meta: (r) => [`${r.dist_mi} mi`, `${Number(r.elev_ft).toLocaleString()} ft`, r.network, `seen ${r.observed}`],
      url: (r) => r.latest_url,
      note: "From Gemini's AET-GEM-09 list (2026-11-19); distances re-checked from the coordinates by Claude.",
    });
  }

  function start() {
    const solar = document.getElementById("ae-pane-solar"), pass = document.getElementById("ae-pane-pass");
    if (!solar || !pass) return;
    lightCard(solar); stations(pass);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
