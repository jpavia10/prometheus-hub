/* The weather on the home (owner, 2026-11-24: "I want weather on the home page more also as a widget for now"): a glass chip over the
   town (now, the condition, today's high and low) that opens into the next twelve hours, the sun, the wind and any alert. The same
   reading paints the town's sky (realm.js). No place set: one tap sets it. Data: deck/core/weather.js (Open-Meteo, NWS). */
import { h, icon } from "../core/ui.js";
import { fmtTime } from "../core/dates.js";
import * as wx from "../core/weather.js";
import { locationSheet } from "./parts.js";

const t12 = (iso) => fmtTime((iso || "").slice(11, 16)).replace(":00", "");
export function wxChip(ctx) {
  const w = ctx.weather(), place = ctx.store.get("profile").place;
  if (!w || !w.now) {
    return h("div.wx-box", h("button.wx-chip.wx-empty", { type: "button", onclick: () => (place ? ctx.reloadWeather(true) : locationSheet(ctx)) },
      icon("cloud", 18), h("span", place ? "Weather loading…" : "Weather: set your place")));
  }
  const n = w.now, d = wx.describe(n.code, n.isDay), today = (w.days || [])[0] || {}, al = (w.alerts || [])[0];
  const panel = h("div.wx-panel", { hidden: true, role: "dialog", "aria-label": "Weather" },
    h("header.wx-ph", h("div", h("p.wx-k", place && place.label ? place.label : "Here"), h("p.wx-big", h("b", `${Math.round(n.temp)}°`), h("span", d.text)),
      h("p.wx-sub", `Feels ${Math.round(n.feels)}° · wind ${Math.round(n.wind)} mph${n.gust ? `, gusts ${Math.round(n.gust)}` : ""} · ${n.humidity != null ? n.humidity + "% humidity" : ""}`)),
      h("button.wx-x", { type: "button", "aria-label": "Close", onclick: (e) => { e.stopPropagation(); toggle(false); } }, "×")),
    al ? h("p.wx-alert", h("b", al.event), " ", al.headline ? al.headline.replace(al.event, "").replace(/^\s*(issued|by)\b.*?(until|for)\b/i, "until").replace(/\s+by\s+NWS\b.*$/i, "").slice(0, 120) : "") : null,
    h("div.wx-hours", ...(w.hours || []).slice(0, 12).map((x) => { const dd = wx.describe(x.code, true); return h("div.wx-h", h("small", t12(x.t)), icon(dd.icon, 16), h("b", `${Math.round(x.temp)}°`), h("small.wx-pop", x.pop != null && x.pop >= 10 ? `${x.pop}%` : "")); })),
    h("div.wx-days", ...(w.days || []).slice(0, 3).map((x, i) => { const dd = wx.describe(x.code, true); return h("div.wx-d", h("span", i === 0 ? "Today" : new Date(x.date + "T12:00").toLocaleDateString(undefined, { weekday: "short" })), icon(dd.icon, 16), h("small", dd.text), h("b", `${Math.round(x.hi)}° / ${Math.round(x.lo)}°`)); })),
    h("p.wx-sun", today.sunrise ? `Sunrise ${t12(today.sunrise)} · sunset ${t12(today.sunset)}` : "", al ? null : h("span", wx.headline(w))),
    h("p.wx-foot", h("a", { href: "pillars/aether/" }, "Air, fire and the pass in Aether ›"), h("small", w.stale ? "last known reading" : `read ${Math.max(0, Math.round((Date.now() - w.at) / 60000))} min ago`)));
  const chip = h("button.wx-chip" + (al ? ".alert" : ""), { type: "button", "aria-expanded": "false", "aria-label": `Weather: ${Math.round(n.temp)} degrees, ${d.text}. Open the forecast.`, onclick: () => toggle() },
    icon(d.icon, 20), h("b", `${Math.round(n.temp)}°`), h("span", d.text), today.hi != null ? h("small", `${Math.round(today.hi)}° / ${Math.round(today.lo)}°`) : null, al ? h("i.wx-dot", { title: al.event }) : null);
  const box = h("div.wx-box", chip, panel);
  function toggle(open = panel.hidden) { panel.hidden = !open; chip.setAttribute("aria-expanded", String(open)); box.classList.toggle("open", open); }
  return box;
}
