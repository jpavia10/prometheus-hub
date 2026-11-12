/* Weather for the storm watch and the sky. Two public, key-free services read straight from the browser:
   Open-Meteo (forecast, sunrise and sunset) and the US National Weather Service (active alerts for the point).
   The home location comes from the owner's profile (set on the device or loaded from his seed file); it is never in this repository.
   Results are cached on the device for 20 minutes and kept as the last known reading when offline. */
import { clock } from "./dates.js";

const KEY = "prom.deck.wx";
const WMO = { 0: ["Clear", "sun"], 1: ["Mostly clear", "sun"], 2: ["Partly cloudy", "cloud"], 3: ["Overcast", "cloud"], 45: ["Fog", "cloud"], 48: ["Freezing fog", "cloud"],
  51: ["Light drizzle", "rain"], 53: ["Drizzle", "rain"], 55: ["Heavy drizzle", "rain"], 56: ["Freezing drizzle", "rain"], 57: ["Freezing drizzle", "rain"],
  61: ["Light rain", "rain"], 63: ["Rain", "rain"], 65: ["Heavy rain", "rain"], 66: ["Freezing rain", "rain"], 67: ["Freezing rain", "rain"],
  71: ["Light snow", "snow"], 73: ["Snow", "snow"], 75: ["Heavy snow", "snow"], 77: ["Snow grains", "snow"], 80: ["Showers", "rain"], 81: ["Showers", "rain"], 82: ["Violent showers", "rain"],
  85: ["Snow showers", "snow"], 86: ["Heavy snow showers", "snow"], 95: ["Thunderstorm", "bolt"], 96: ["Thunderstorm, hail", "bolt"], 99: ["Thunderstorm, hail", "bolt"] };
export const describe = (code, isDay = true) => { const w = WMO[code] || ["—", "cloud"]; return { text: w[0], icon: w[1] === "sun" && !isDay ? "moon" : w[1] }; };

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
const write = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage full: live reading only */ } };

/** The last reading for this place (may be old), or null. */
export function cached(place) { const c = read(); return c && place && c.lat === place.lat && c.lon === place.lon ? c : null; }

/** Fetch (or reuse a reading younger than 20 minutes). Resolves the reading, or the cached one marked stale, or null. */
export async function load(place, { force = false } = {}) {
  if (!place || typeof place.lat !== "number" || typeof place.lon !== "number") return null;
  const old = cached(place); const now = Date.now();
  if (old && !force && now - old.at < 20 * 60000) return old;
  const q = `latitude=${place.lat}&longitude=${place.lon}`;
  const url = `https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,cloud_cover,precipitation,snowfall,is_day,relative_humidity_2m` +
    `&hourly=temperature_2m,precipitation_probability,precipitation,snowfall,wind_gusts_10m,weather_code&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_gusts_10m_max,weather_code` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=3`;
  try {
    const [fx, al] = await Promise.all([
      fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error("forecast " + r.status)))),
      fetch(`https://api.weather.gov/alerts/active?point=${place.lat},${place.lon}`, { headers: { Accept: "application/geo+json" } }).then((r) => (r.ok ? r.json() : { features: [] })).catch(() => ({ features: [], failed: true })),
    ]);
    const c = fx.current || {}; const hNow = (fx.hourly && fx.hourly.time ? fx.hourly.time.findIndex((t) => t >= (c.time || "").slice(0, 13)) : 0) || 0;
    const hours = []; for (let i = Math.max(0, hNow); i < Math.min((fx.hourly.time || []).length, hNow + 24); i++)
      hours.push({ t: fx.hourly.time[i], temp: fx.hourly.temperature_2m[i], pop: fx.hourly.precipitation_probability ? fx.hourly.precipitation_probability[i] : null, rain: fx.hourly.precipitation[i], snow: fx.hourly.snowfall[i], gust: fx.hourly.wind_gusts_10m[i], code: fx.hourly.weather_code[i] });
    const days = (fx.daily.time || []).map((t, i) => ({ date: t, hi: fx.daily.temperature_2m_max[i], lo: fx.daily.temperature_2m_min[i], rain: fx.daily.precipitation_sum[i], snow: fx.daily.snowfall_sum[i], gust: fx.daily.wind_gusts_10m_max[i], code: fx.daily.weather_code[i], sunrise: fx.daily.sunrise[i], sunset: fx.daily.sunset[i] }));
    const alerts = (al.features || []).map((f) => f.properties || {}).map((p) => ({ event: p.event, severity: p.severity, headline: p.headline, onset: p.onset, ends: p.ends || p.expires, instruction: p.instruction || "", area: p.areaDesc || "" }))
      .sort((a, b) => rank(b) - rank(a));
    const out = { at: now, lat: place.lat, lon: place.lon, now: { temp: c.temperature_2m, feels: c.apparent_temperature, code: c.weather_code, wind: c.wind_speed_10m, gust: c.wind_gusts_10m, cloud: c.cloud_cover, rain: c.precipitation, snow: c.snowfall, isDay: c.is_day !== 0, humidity: c.relative_humidity_2m },
      hours, days, alerts, alertsFailed: !!al.failed, tz: fx.timezone };
    write(out); return out;
  } catch (e) { return old ? { ...old, stale: true } : null; }
}
const rank = (a) => ({ Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 }[a.severity] || 0) + (/warning/i.test(a.event || "") ? 0.5 : 0);

/** What the sky should show for a reading: { cloud, rain, snow, wind, storm } each 0..1. */
export function skyOf(wx) {
  if (!wx || !wx.now) return { cloud: 0.12, rain: 0, snow: 0, wind: 0.1, storm: 0 };
  const n = wx.now; const kind = (WMO[n.code] || [])[1];
  return { cloud: Math.min(1, (n.cloud || 0) / 100), rain: kind === "rain" || kind === "bolt" ? Math.min(1, 0.35 + (n.rain || 0) * 4) : 0, snow: kind === "snow" ? Math.min(1, 0.4 + (n.snow || 0) * 2) : 0,
    wind: Math.min(1, (n.gust || n.wind || 0) / 55), storm: kind === "bolt" ? 1 : 0 };
}
/** Day phase 0..1 (0 midnight, .25 sunrise, .5 solar noon, .75 sunset) from the reading's sunrise and sunset, or from the clock alone. */
export function phaseOf(wx, date = clock.now()) {
  const mins = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60; let rise = 6.5 * 60, set = 18 * 60;
  const d = wx && wx.days && wx.days[0]; const hm = (iso) => { const m = /T(\d{2}):(\d{2})/.exec(iso || ""); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  if (d && hm(d.sunrise) != null && hm(d.sunset) != null) { rise = hm(d.sunrise); set = hm(d.sunset); }
  if (mins >= rise && mins <= set) return 0.25 + ((mins - rise) / (set - rise)) * 0.5;
  const night = 1440 - (set - rise); const since = mins > set ? mins - set : mins + 1440 - set;
  return (0.75 + (since / night) * 0.5) % 1;
}
/** One line for the picture: the thing to know about the next 24 hours. */
export function headline(wx) {
  if (!wx) return "";
  if (wx.alerts && wx.alerts.length) return wx.alerts[0].event;
  const h = wx.hours || []; const snow = h.reduce((s, x) => s + (x.snow || 0), 0), rain = h.reduce((s, x) => s + (x.rain || 0), 0), gust = Math.max(0, ...h.map((x) => x.gust || 0)), pop = Math.max(0, ...h.map((x) => x.pop || 0));
  if (snow >= 0.3) return `${snow.toFixed(1)}" of snow in the next 24 h`;
  if (rain >= 0.1) return `${rain.toFixed(2)}" of rain in the next 24 h`;
  if (gust >= 35) return `Gusts to ${Math.round(gust)} mph`;
  if (pop >= 40) return `${Math.round(pop)}% chance of precipitation`;
  return "Quiet for the next 24 hours";
}
