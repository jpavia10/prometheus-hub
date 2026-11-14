/* The picture: the arrival view. Today across everything, read live from the one store.
   The hero is the day ring: a 24-hour dial with noon at the top, night shaded from the real sunset to the real sunrise, the present
   as a bright marker, and everything timed in the next 24 hours placed where it falls. Under it: what cannot slip, the seven-day
   runway, the countdowns, the payoff, then the ambient instruments. Every number is computed from the capabilities' own data. */
import { put, h, s, icon, ring, dial, bars, spark, chip, moneyC, pct, monthsText, plural, countUp } from "../core/ui.js";
import { eventsSince } from "../core/reach.js";
import { clock, today, fmtDay, diffDays, monName, dowName } from "../core/dates.js";
import { days, within, countdowns } from "../core/feeds.js";
import { rowItem, runway, locationSheet, skySheet, untilText } from "./parts.js";
import { position, milestone } from "../models/money.js";
import { focusStats, focusView } from "../models/time.js";
import * as wx from "../core/weather.js";
import { WORDS } from "../data/money-words.js";
import { reactor, titanTile, boot } from "./orrery.js";

/** The day ring. soon = rows in the next 24 hours; w = the weather reading (for sunrise and sunset) or null. */
function dayRing(now, soon, w, t) {
  const S = 340, c = S / 2, R = 140;
  const deg = (hrs) => ((hrs / 24) * 360 + 180) % 360;                              // clockwise from the top; noon is up, midnight is down
  const pt = (d, r) => { const a = ((d - 90) * Math.PI) / 180; return [c + Math.cos(a) * r, c + Math.sin(a) * r]; };
  const arc = (a0, a1, r) => { let d = (a1 - a0 + 360) % 360; if (d < 0.01) d = 359.99; const [x0, y0] = pt(a0, r), [x1, y1] = pt(a0 + d, r); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${d > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const hm = (iso) => (iso && iso.length >= 16 ? Number(iso.slice(11, 13)) + Number(iso.slice(14, 16)) / 60 : null);
  const d0 = w && w.days ? w.days.find((x) => x.date === t) : null;
  const rise = (d0 && hm(d0.sunrise)) || 6.5, set = (d0 && hm(d0.sunset)) || 17.75;
  const hrs = now.getHours() + now.getMinutes() / 60; const nowDeg = deg(hrs); const isDay = hrs >= rise && hrs < set;
  const g = [];
  g.push(s("circle", { cx: c, cy: c, r: R - 26, class: "dr-inner" }));
  g.push(s("path", { d: arc(deg(set), deg(rise), R), class: "dr-night" }), s("path", { d: arc(deg(rise), deg(set), R), class: "dr-day" }));
  for (let i = 0; i < 96; i++) { const major = i % 4 === 0, card = i % 24 === 0; const [x1, y1] = pt(i * 3.75, R + 9), [x2, y2] = pt(i * 3.75, R + (card ? 21 : major ? 15 : 12)); g.push(s("line", { x1, y1, x2, y2, class: "dr-tick" + (card ? " card" : major ? " major" : "") })); }
  for (const [label, hr] of [["12", 12], ["18", 18], ["00", 0], ["06", 6]]) { const [x, y] = pt(deg(hr), R - 15); g.push(s("text", { x, y: y + 3.5, class: "dr-label", "text-anchor": "middle" }, label)); }
  for (let k = 0; k < 8; k++) g.push(s("path", { d: arc(nowDeg + k * 11.25, nowDeg + (k + 1) * 11.25 + 0.4, R), class: "dr-ahead", style: `opacity:${(0.5 * (1 - k / 8)).toFixed(3)}` }));   // the next six hours, fading out
  for (const [hr, cls] of [[rise, "rise"], [set, "set"]]) { const [x, y] = pt(deg(hr), R); g.push(s("circle", { cx: x, cy: y, r: 2.6, class: "dr-sun " + cls })); }
  const timed = soon.filter((r) => r.time && !r.done);
  timed.forEach((r, i) => { const [hh, mm] = r.time.split(":").map(Number); const [x, y] = pt(deg(hh + mm / 60), R); const hard = (r.weight || 0) >= 2;
    g.push(s("g", { class: "dr-pip tone-" + (r.tone || "event") + (hard ? " hard" : ""), style: `--i:${i}` }, s("circle", { cx: x, cy: y, r: hard ? 11 : 8, class: "halo" }), s("circle", { cx: x, cy: y, r: hard ? 5 : 3.6, class: "dot" }))); });
  const [nx1, ny1] = pt(nowDeg, R - 20), [nx2, ny2] = pt(nowDeg, R + 24), [nx, ny] = pt(nowDeg, R);
  g.push(s("g", { class: "dr-now" + (isDay ? " day" : " night") }, s("line", { x1: nx1, y1: ny1, x2: nx2, y2: ny2 }), s("circle", { cx: nx, cy: ny, r: 13, class: "glow" }), s("circle", { cx: nx, cy: ny, r: 5.2, class: "core" })));
  const h12 = now.getHours() % 12 || 12; const allDay = soon.filter((r) => !r.time && !r.done).length;
  const label = `${fmtDay(t, "long")}, ${h12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() < 12 ? "AM" : "PM"}. ${timed.length} timed and ${allDay} all-day in the next 24 hours.`;
  return h("div.dayring", { role: "img", "aria-label": label },
    h("div.dr-sweep", { style: `--now:${nowDeg}deg`, "aria-hidden": "true" }),
    s("svg", { viewBox: `0 0 ${S} ${S}`, class: "dr-svg", "aria-hidden": "true" }, ...g),
    h("div.dr-center", { "aria-hidden": "true" },
      h("span.dr-date", `${dowName(t, 1)} · ${monName(Number(t.slice(5, 7)), 1)} ${Number(t.slice(8))}`),
      h("span.dr-time.num", `${h12}:${String(now.getMinutes()).padStart(2, "0")}`, h("small", now.getHours() < 12 ? "AM" : "PM")),
      h("span.dr-sun-times.num", icon("sun", 12), fmtHour(rise), h("i"), icon("moon", 12), fmtHour(set))));
}
const fmtHour = (x) => { const hh = Math.floor(x), mm = Math.min(59, Math.round((x - hh) * 60)); return `${hh % 12 || 12}:${String(mm).padStart(2, "0")}`; };

export function render(root, route, ctx) {
  const { store } = ctx; const profile = store.get("profile"); const now = clock.now(); const t = today();

  const hour = now.getHours(); const hello = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const w = ctx.weather(); const soon = within(24, now); const alerts = (w && w.alerts) || [];
  const open = soon.filter((r) => !r.done); const hard = open.filter((r) => (r.weight || 0) >= 2).length; const next = open.find((r) => r.time) || open[0];

  /* the hero: the day ring and the one sentence */
  const hero = h("section.hero", { "aria-label": "Now" },
    dayRing(now, soon, w, t),
    h("p.kicker", hello + (profile.name ? ", " + profile.name : "")),
    h("h1.headline", open.length ? [h("span.num.big", String(open.length)), h("span", ` ${open.length === 1 ? "thing" : "things"} in the next 24 hours`)] : "Clear for the next 24 hours"),
    next ? h("p.hero-sub" + (hard ? "" : ".calm"), hard ? h("i.pulse") : null, hard ? `${hard} cannot slip · ` : "", `next: ${next.title}, ${untilText(next, now)}`) : null);

  /* tier 1: the next 24 hours */
  const first = alerts.length || soon.length ? h("section.tier1.panel.glow-ember", { "aria-label": "The next 24 hours" },
    h("header.panel-head", h("h2", "Next 24 hours"), h("a.link", { href: `#/time/day/${t}` }, "Day view")),
    ...alerts.slice(0, 2).map((a) => h("button.alert", { type: "button", onclick: () => skySheet(ctx) }, icon("alert", 18), h("span", h("b", a.event), h("small", a.ends ? "until " + new Date(a.ends).toLocaleString("en-US", { weekday: "short", hour: "numeric" }) : "active now")))),
    soon.length ? h("div.items", soon.slice(0, 5).map((r) => rowItem(r, { rel: true })), soon.length > 5 ? h("a.more", { href: `#/time/day/${t}` }, `${soon.length - 5} more today and tomorrow`) : null) : null) : null;

  /* the runway and the countdowns */
  const week = days(t, 7);
  const run = h("section.panel.run", { "aria-label": "The next seven days" }, h("header.panel-head", h("h2", "Runway"), h("a.link", { href: "#/time/risk" }, "Risk view")), runway(week, { rowOpts: {} }));
  const cds = countdowns(3, t);
  const count = cds.length ? h("section.panel.count", { "aria-label": "Countdowns" }, h("header.panel-head", h("h2", "Countdowns"), h("a.link", { href: "#/time/agenda" }, "Agenda")),
    h("div.countdowns", cds.map((r) => { const n = diffDays(t, r.date); const num = h("span.num.cd-num"); countUp(num, n);
      return h("a.countdown", { href: r.go || "#/time" }, ring({ value: 1 - Math.min(1, n / 90), size: 96, stroke: 4, tone: r.tone === "holiday" ? "ice" : r.big ? "violet" : "ember", center: h("div", num, h("small", n === 1 ? "day" : "days")), label: `${n} days to ${r.title}` }), h("b", r.title), h("small", fmtDay(r.date))); }))) : null;

  /* tier 2: the payoff */
  const m = store.get("money"); const pos = m.plan ? position(m.plan, m.events, t) : null; const saleSum = (m.events || []).filter((e) => e.kind === "sale" && e.applied !== false).reduce((s, e) => s + (Number(e.amount) || 0), 0); let payoff;
  if (pos) {
    const ms = milestone(pos.pct); const [fy, fm] = (pos.freeMonth || "").split("-").map(Number); const pctEl = h("span.num.dial-pct"); countUp(pctEl, pos.pct * 100, (v) => v.toFixed(v >= 99.95 ? 0 : 1) + "%");
    payoff = h("section.panel.payoff.glow-mint", { "aria-label": "The payoff" },
      h("header.panel-head", h("h2", "Payoff"), m.plan.sample ? chip("sample preset") : m.plan.label ? chip(m.plan.label) : null, saleSum > 0 ? chip(`+${moneyC(Math.round(saleSum * 100), 0)} sales`) : null, h("a.link", { href: "#/money" }, "Open")),
      h("a.dial-box", { href: "#/money", "aria-label": `Payoff: ${pct(pos.pct, 1)} paid by schedule` }, dial({ value: pos.pct, width: 300, stroke: 10, ticks: 48, tone: "mint", label: "Share of the starting debt paid" }), h("div.dial-center", pctEl, h("small", "paid, by schedule"))),
      h("div.stats3",
        h("div", h("small", "Debt-free"), h("b.num", pos.done ? "Done" : pos.freeMonth ? `${monName(fm, 1)} ${fy}` : "never"), h("small", pos.done ? "" : monthsText(pos.monthsLeft) + " left")),
        h("div", h("small", "Next due"), h("b.num", pos.next ? moneyC(pos.next.amountC) : "—"), h("small", pos.next ? (pos.next.in === 0 ? "due today" : pos.next.in === 1 ? "due tomorrow" : `in ${pos.next.in} days`) : "")),
        h("div", h("small", "Interest left"), h("b.num", moneyC(pos.interestLeftC)), h("small", pos.windfallC ? `${moneyC(pos.windfallC, 0)} extra applied` : "on the plan"))),
      ms.hit ? h("p.voice", WORDS.pct[ms.hit]) : null);
  } else payoff = null;

  /* ambient tier */
  const tiles = [];
  if (w && w.now) { const d = wx.describe(w.now.code, w.now.isDay); const hrs = w.hours || [];
    tiles.push(h("button.tile.sky", { type: "button", id: "sky-watch", onclick: () => skySheet(ctx), "aria-label": "Storm watch: open the full reading" },
      h("span.tile-head", h("span", "Storm watch")),
      h("span.tile-main", icon(d.icon, 30), h("span", h("b.num.big", Math.round(w.now.temp) + "°"), h("small", d.text))),
      h("span.tile-line" + (alerts.length ? ".warn" : ""), wx.headline(w)),
      bars(hrs.slice(0, 24).map((x) => x.pop || 0), { w: 150, h: 26, tone: alerts.length ? "ember" : "ice", max: 100 }),
      h("small.quiet", `gusts to ${Math.round(Math.max(0, ...hrs.map((x) => x.gust || 0)))} mph${w.stale ? " · last known reading" : profile.place ? " · " + profile.place.label : ""}`)));
  } else tiles.push(h("button.tile.sky.invite", { type: "button", id: "sky-watch", onclick: () => (profile.place ? ctx.reloadWeather(true) : locationSheet(ctx)) },
    h("span.tile-head", h("span", "Storm watch")), h("span.tile-main", icon("cloud", 30), h("span", h("b", profile.place ? "No reading yet" : "Set home"), h("small", profile.place ? "The weather service did not answer. Tap to try again." : "One point on the map turns on the storm watch and the live sky.")))));
  const tm = store.get("time"); const fs = focusStats(tm, t); const fv = focusView(tm);
  tiles.push(h("a.tile.focus", { href: "#/time/focus", "aria-label": "Focus clock" },
    h("span.tile-head", h("span", "Focus"), h("small", fs.streak ? plural(fs.streak, "day") + " running" : "")),
    h("span.tile-main", icon("flame", 30), h("span", h("b.num.big", fv ? Math.ceil(fv.leftMs / 60000) + "′" : String(fs.today)), h("small", fv ? `${fv.phase === "work" ? "working" : "on a break"} · ${fv.method.name}` : "minutes today"))),
    bars(fs.week.map((x) => x.minutes), { w: 150, h: 26, tone: "violet" }), h("small.quiet", "the last seven days")));
  for (const c of ctx.caps || []) if (c.model.tile) { try { const el = c.model.tile(store.get(c.id), t, { h, icon, ring, bars, spark, chip }); if (el) tiles.push(el); } catch (e) { console.error(e); } }
  const ambient = h("section.ambient", { "aria-label": "Ambient instruments" }, tiles);

  tiles.push(titanTile(null));                                                       // filled from Titan's own ledger when it answers
  const seenKey = "prom.deck.lastSeen"; let lastSeen = null; try { lastSeen = sessionStorage.getItem(seenKey + ".s") || localStorage.getItem(seenKey); sessionStorage.setItem(seenKey + ".s", lastSeen || ""); localStorage.setItem(seenKey, new Date().toISOString()); } catch (e) { /* first visit */ }
  const fresh = eventsSince(lastSeen || "", 8), lately = fresh.length ? fresh : eventsSince("", 4), ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d"; };
  const since = lately.length ? h("section.panel.since", { "aria-label": fresh.length ? "Since you were here" : "Lately" }, h("header.panel-head", h("h2", fresh.length ? "Since you were here" : "Lately in the pillars"), h("small.quiet", fresh.length ? plural(fresh.length, "change") : "")),
    ...lately.map((e) => h("a.since-row", { href: e.href }, h("b", e.name), h("span", e.say + (e.title ? ": " + e.title : "")), h("small.quiet", ago(e.at))))) : null;
  const rx = reactor(ctx); boot(new URLSearchParams(location.search).get("boot") === "1");
  const isAway = (() => { try { return JSON.parse(localStorage.getItem("prometheus.odyssey.away") || "false") === true || (JSON.parse(localStorage.getItem("prometheus.bus.meta") || "{}").awayMode === true); } catch { return false; } })();
  const awayBanner = isAway ? h("section.panel.glow-ember.away-banner", { "aria-label": "Away Mode" },
    h("header.panel-head", h("h2", "Odyssey Away Mode"), chip("active"), h("a.link", { href: "pillars/odyssey/" }, "Checklist")),
    h("p", "Travel priority mode enabled — mountain readiness (Bastion), home systems (Hearth) & near-term transit promoted above financial ambient tiles.")) : null;
  const boardPanels = isAway ? [awayBanner, since, first, ambient, run, count, payoff] : [since, first, run, count, payoff, ambient];
  put(root, rx, hero, put(h("div.board"), ...boardPanels), h("footer.foot", h("a.link", { href: "#/system" }, profile.demo ? "Sample data is loaded · remove it" : "Your data stays on this device"), h("a.link", { href: "#/time" }, "Kairos console"), h("a.link", { href: "#/money" }, "Payoff console")));
  return () => { if (rx.cleanup) rx.cleanup(); };
}
