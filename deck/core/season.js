/* The town's season (owner's briefing c4, 2026-11-25: "Rain and wind you can hear, snow on the roofs in winter, lit windows at night").
   The town is one painting; autumn and winter are the same painting repainted for the season (art/realm/realm_autumn.webp and
   realm_winter.webp, Nano Banana Pro, aligned to the original to half a pixel) and the town blends to them by the calendar at the home
   place, and to winter by the real snow there: snow on the ground (Open-Meteo snow_depth) or snow falling now. Spring and summer are
   the painting as it was made. Northern dates; a home south of the equator is shifted half a year. Nothing here draws anything. */
const DAY = 864e5;
export const dayOfYear = (d) => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / DAY);
const ramp = (x, a, b) => Math.max(0, Math.min(1, (x - a) / (b - a)));
/* ?season= pins one look (the proofs, and a look at any season) */
const PINS = { spring: { kind: null, amt: 0, name: "Spring" }, summer: { kind: null, amt: 0, name: "Summer" },
  autumn: { kind: "autumn", amt: 1, name: "Autumn" }, winter: { kind: "winter", amt: 1, name: "Winter" }, snow: { kind: "winter", amt: 1, name: "Snow on the ground", real: true } };

/** Which season the town shows: { kind: "autumn" | "winter" | null, amt 0..1, name, real (winter from real snow) }.
    date: the local date; lat: the home place's latitude; now: the weather reading's now (snowDepth in cm, snow falling in inches);
    snowing: 0..1 from the sky; pin: a key of PINS. Autumn runs Sep 5-25 up, full to Nov 25, down by Dec 5; winter rises from Dec 5,
    full from Dec 21 to Feb 20, gone by Mar 15. The two never overlap, so only one season painting is ever loaded. */
export function seasonOf(date, lat = 35, now = null, snowing = 0, pin = null) {
  if (pin && PINS[pin]) return { ...PINS[pin] };
  let d = dayOfYear(date); if (lat < 0) d = ((d + 181) % 365) + 1;
  const aut = Math.min(ramp(d, 248, 268), 1 - ramp(d, 329, 339));
  const win = d >= 300 ? ramp(d, 339, 355) : 1 - ramp(d, 51, 74);
  let real = 0;
  if (now) { const cm = Number(now.snowDepth) || 0; if (cm > 0.5) real = Math.min(1, 0.4 + cm / 20); if ((Number(now.snow) || 0) > 0) real = Math.max(real, 0.55); }
  if (snowing > 0.2) real = Math.max(real, 0.5 + snowing * 0.4);
  const w = Math.max(win, real);
  if (w > 0.01) return { kind: "winter", amt: Math.min(1, w), name: real > win ? "Snow on the ground" : "Winter", real: real > win };
  if (aut > 0.01) return { kind: "autumn", amt: aut, name: "Autumn" };
  return { kind: null, amt: 0, name: d >= 74 && d < 172 ? "Spring" : "Summer" };
}

/** Late at night most windows go dark, one by one from about 22:30, the darkest from 01:00 to 05:00, back on by 06:30 (local clock). 0..1. */
export function lateOf(date) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 22.5) return ramp(h, 22.5, 25);
  if (h < 5) return Math.min(1, ramp(h + 24, 22.5, 25));
  return 1 - ramp(h, 5, 6.5);
}
