/* Pieces more than one view uses: a dated row, the day runway, the home-location sheet, the sky sheet. */
import { h, icon, sheet, field, toast, money, chip, bars, spark } from "../core/ui.js";
import { clock, today, fmtDay, fmtTime, relDay, addDays, dowName, diffDays } from "../core/dates.js";
import * as wx from "../core/weather.js";

export const TONE_LABEL = { event: "Event", deadline: "Deadline", school: "School", appointment: "Appointment", bill: "Bill", sub: "Subscription", holiday: "Federal holiday", tax: "Tax date", clock: "Clock change", service: "Service", upkeep: "Upkeep", project: "Project", paper: "Paperwork" };

/** "in 3 h 20 m", "now", "today", "tomorrow", "in 4 days" for a row. */
export function untilText(r, now = clock.now()) {
  const t = today();
  if (r.time && diffDays(t, r.date) <= 1) { const [y, m, d] = r.date.split("-").map(Number); const [hh, mm] = r.time.split(":").map(Number); const mins = Math.round((new Date(y, m - 1, d, hh, mm) - now) / 60000);
    if (mins < -1) return `${fmtTime(r.time)} (passed)`; if (mins <= 1) return "now"; if (mins < 60) return `in ${mins} m`; if (mins < 36 * 60) return `in ${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} m` : ""}`; }
  return relDay(r.date, t);
}
/** One dated row. opts: { day: show the date, rel: show time-until, onopen } */
export function rowItem(r, opts = {}) {
  const meta = [];
  if (opts.day) meta.push(fmtDay(r.date));
  meta.push(r.time ? fmtTime(r.time) + (r.endTime ? "–" + fmtTime(r.endTime.replace("+", "")) + (r.endTime.endsWith("+") ? " (next day)" : "") : "") : r.span ? `day ${r.span[0]} of ${r.span[1]}` : r.fixed ? TONE_LABEL[r.tone] : "all day");
  if (!r.fixed && r.tone !== "event") meta.push(TONE_LABEL[r.tone] || r.tone);
  if (r.place) meta.push(r.place);
  const tags = [];
  if (r.amount != null) tags.push(h("span.amt.num", money(r.amount)));
  if (r.auto) tags.push(chip("autopay"));
  if (r.repeat) tags.push(h("span.tag-ic", { title: "Repeats", "aria-label": "repeats" }, icon("repeat", 14)));
  if (r.moved) tags.push(chip("moved"));
  if (r.holiday) tags.push(chip("on " + r.holiday, "warn"));
  if (opts.rel) tags.push(h("span.until.num", untilText(r)));
  const el = h((opts.onopen || r.go ? "a" : "div") + ".item.tone-" + (r.tone || "event") + (r.done ? ".done" : "") + (r.fixed ? ".fixed" : ""), { href: opts.onopen ? "#" : r.go || null, dataset: { key: r.key },
    onclick: opts.onopen ? (e) => { e.preventDefault(); opts.onopen(r); } : null },
    h("span.pip", { "aria-hidden": "true" }), h("span.item-main", h("b", r.title), h("small", meta.filter(Boolean).join(" · "))), tags.length ? h("span.item-tags", tags) : null);
  return el;
}

/** The runway: n days as columns with their load; tapping a day shows its rows below. days = feeds.days(...). */
export function runway(days, { selected, onselect, rowOpts = {} } = {}) {
  let sel = selected || days[0].date; const t = today();
  const list = h("div.runway-list"); const strip = h("div.runway-strip", { role: "tablist", "aria-label": "The next days" });
  const draw = () => {
    strip.replaceChildren(...days.map((d) => { const open = d.rows.filter((r) => !r.done); const pips = open.filter((r) => !r.fixed).slice(0, 5);
      return h("button.day.level-" + d.level + (d.date === sel ? ".on" : "") + (d.date === t ? ".today" : "") + (d.holiday ? ".holiday" : ""), { type: "button", role: "tab", "aria-selected": String(d.date === sel),
        "aria-label": `${fmtDay(d.date, "long")}: ${open.filter((r) => !r.fixed).length} items${d.holiday ? ", " + d.holiday : ""}${d.why ? ", " + d.why : ""}`, onclick: () => { sel = d.date; draw(); if (onselect) onselect(sel); } },
        h("span.day-name", d.date === t ? "Today" : dowName(d.date, 1)), h("span.day-num.num", String(Number(d.date.slice(8)))),
        h("span.day-pips", pips.map((r) => h("i.tone-" + r.tone)), open.filter((r) => !r.fixed).length > 5 ? h("i.more") : null), d.holiday ? h("span.day-flag", { title: d.holiday }) : null); }));
    const d = days.find((x) => x.date === sel) || days[0];
    list.replaceChildren(h("div.runway-head", h("b", d.date === t ? "Today" : fmtDay(d.date, "long")), d.why ? chip(d.why, d.level >= 3 ? "danger" : "warn") : null),
      ...(d.rows.length ? d.rows.map((r) => rowItem(r, rowOpts)) : [h("p.quiet", d.date === t ? "Nothing dated today." : "Nothing dated this day.")]));
  };
  draw(); return h("div.runway", strip, list);
}

/** Set the home location (for the storm watch and the sky): this device's own location, or typed coordinates. Stored on the device only. */
export function locationSheet(ctx) {
  const p = ctx.store.get("profile"); const cur = p.place || {};
  const label = h("input", { type: "text", value: cur.label || "", placeholder: "Home", maxlength: 60 }), lat = h("input", { type: "number", step: "any", min: -90, max: 90, value: cur.lat != null ? cur.lat : "", inputmode: "decimal" }), lon = h("input", { type: "number", step: "any", min: -180, max: 180, value: cur.lon != null ? cur.lon : "", inputmode: "decimal" });
  const save = (close) => { const la = Number(lat.value), lo = Number(lon.value); if (lat.value === "" || lon.value === "" || isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { toast("Latitude is −90 to 90 and longitude −180 to 180.", { tone: "warn" }); return; }
    ctx.store.update("profile", (x) => { x.place = { label: label.value.trim() || "Home", lat: Math.round(la * 1000) / 1000, lon: Math.round(lo * 1000) / 1000 }; }); close(); ctx.weather() || 0; ctx.refresh(); ctxReload(ctx); };
  sheet({ title: "Home location", body: (close) => h("div.stack",
    h("p.lead", "The storm watch and the sky read the weather for one point. It stays on this device; it is never sent anywhere but the two weather services, as coordinates."),
    "geolocation" in navigator ? h("button.btn", { type: "button", onclick: (e) => { const b = e.currentTarget; b.disabled = true; navigator.geolocation.getCurrentPosition((pos) => { lat.value = pos.coords.latitude.toFixed(3); lon.value = pos.coords.longitude.toFixed(3); b.disabled = false; toast("Location read. Save to use it."); }, () => { b.disabled = false; toast("This device did not share its location. Type the coordinates instead.", { tone: "warn" }); }, { maximumAge: 600000, timeout: 15000 }); } }, icon("picture", 18), "Use this device's location") : null,
    field("Name", label), h("div.grid2", field("Latitude", lat), field("Longitude", lon)),
    h("div.row.end", p.place ? h("button.btn.ghost", { type: "button", onclick: () => { ctx.store.update("profile", (x) => { x.place = null; }); close(); ctxReload(ctx); } }, "Remove") : null, h("button.btn", { type: "button", onclick: () => save(close) }, "Save"))) });
}
const ctxReload = (ctx) => { if (ctx.reloadWeather) ctx.reloadWeather(true); };

/** The storm watch in full: now, the next 24 hours, three days, and every active alert with its instruction. */
export function skySheet(ctx) {
  const w = ctx.weather(); const p = ctx.store.get("profile").place;
  if (!w) return locationSheet(ctx);
  const d = wx.describe(w.now.code, w.now.isDay); const hrs = w.hours || [];
  sheet({ title: `Storm watch · ${p ? p.label : ""}`, body: () => h("div.stack",
    ...(w.alerts || []).map((a) => h("div.alert", h("b", a.event), h("small", [a.headline, a.ends ? "Until " + new Date(a.ends).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }) : ""].filter(Boolean).join(" · ")), a.instruction ? h("p", a.instruction) : null)),
    h("div.wx-now", icon(d.icon, 40), h("div", h("div.wx-temp.num", Math.round(w.now.temp) + "°F"), h("small", `${d.text} · feels ${Math.round(w.now.feels)}° · wind ${Math.round(w.now.wind)} mph, gusts ${Math.round(w.now.gust)} · humidity ${Math.round(w.now.humidity)}%`))),
    h("div.panel-sub", h("h3", "Next 24 hours"), h("div.wx-row", h("small", "Chance of precipitation"), bars(hrs.map((x) => x.pop || 0), { w: 300, h: 44, tone: "ice", max: 100, labels: hrs.map((x) => x.t.slice(11, 13) + "h") })),
      h("div.wx-row", h("small", "Gusts (mph)"), spark(hrs.map((x) => x.gust || 0), { w: 300, h: 44, tone: "ember", min: 0 })), h("div.wx-row", h("small", "Temperature (°F)"), spark(hrs.map((x) => x.temp), { w: 300, h: 44, tone: "mint" }))),
    h("div.panel-sub", h("h3", "Three days"), ...(w.days || []).map((x) => { const dd = wx.describe(x.code); return h("div.item", icon(dd.icon, 18), h("span.item-main", h("b", fmtDay(x.date)), h("small", `${dd.text} · ${Math.round(x.lo)}° to ${Math.round(x.hi)}° · gusts ${Math.round(x.gust)} mph${x.snow ? ` · snow ${x.snow.toFixed(1)}"` : ""}${x.rain ? ` · rain ${x.rain.toFixed(2)}"` : ""}`))); })),
    h("p.quiet", `Read ${new Date(w.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}${w.stale ? " (offline: last known reading)" : ""}. Forecast: Open-Meteo. Alerts: US National Weather Service${w.alertsFailed ? " (alerts did not load this time)" : ""}.`),
    h("div.row.end", h("button.btn.ghost", { type: "button", onclick: () => locationSheet(ctx) }, "Change location"), h("button.btn", { type: "button", onclick: async (e) => { e.currentTarget.disabled = true; await ctx.reloadWeather(true); toast("Weather refreshed."); } }, "Refresh"))) });
}
export { addDays };
