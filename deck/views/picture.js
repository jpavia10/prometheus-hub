/* The picture: the arrival view. Today across everything, read live from the one store.
   The hero is the day ring: a 24-hour dial with noon at the top, night shaded from the real sunset to the real sunrise, the present
   as a bright marker, and everything timed in the next 24 hours placed where it falls. Under it: what cannot slip, the seven-day
   runway, the countdowns, the payoff, then the ambient instruments. Every number is computed from the capabilities' own data. */
import { put, h, s, icon, ring, dial, bars, spark, chip, plural, countUp } from "../core/ui.js";
import { eventsSince } from "../core/reach.js";
import { clock, today, fmtDay, diffDays, monName, dowName, addDays, quickAdd } from "../core/dates.js";
import { pillarStats, busMoneySales } from "../core/legacy.js";
import { PILLARS } from "../pillars.js";
import { days, within, countdowns } from "../core/feeds.js";
import { rowItem, runway, locationSheet, skySheet, untilText } from "./parts.js";
import { position } from "../models/money.js";
import { focusStats, focusView, makeEvent, kindOf } from "../models/time.js";
import * as wx from "../core/weather.js";
import { reactor, boot, PILLAR_DOMAINS, domainOf } from "./orrery.js";

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

  /* tier 1: the next 24 hours (always rendered with inline capture when empty) */
  const quickIn = h("input", { type: "text", class: "quick-horizon-input", placeholder: "Quick schedule: dentist Tue 3pm, smog check dec 5...", "aria-label": "Schedule in next 24 hours" });
  const quickForm = h("form.horizon-quick", {
    onsubmit: (e) => {
      e.preventDefault();
      const raw = quickIn.value.trim();
      if (!raw) return;
      const qd = quickAdd(raw) || { title: raw, date: t, time: null };
      const k = kindOf(qd.title);
      store.update("time", (tm) => tm.events.push(makeEvent({ ...qd, title: k.title }, { kind: k.kind, src: "quick" })));
      ctx.toast(`Scheduled: ${k.title} (${fmtDay(qd.date)})`);
    }
  }, quickIn, h("button.btn.small", { type: "submit" }, "Add"));
  const first = h("section.tier1.panel.glow-ember.horizon-card", { "aria-label": "The next 24 hours" },
    h("header.panel-head", h("h2", "Next 24 hours"), chip(open.length ? `${open.length} active` : "Window clear"), h("a.link", { href: `#/time/day/${t}` }, "Day view")),
    ...alerts.slice(0, 2).map((a) => h("button.alert", { type: "button", onclick: () => skySheet(ctx) }, icon("alert", 18), h("span", h("b", a.event), h("small", a.ends ? "until " + new Date(a.ends).toLocaleString("en-US", { weekday: "short", hour: "numeric" }) : "active now")))),
    soon.length
      ? h("div.items", soon.slice(0, 5).map((r) => rowItem(r, { rel: true })), soon.length > 5 ? h("a.more", { href: `#/time/day/${t}` }, `${soon.length - 5} more today and tomorrow`) : null)
      : h("p.quiet", "Nothing dated in the next 24 hours. Capture a task or deadline below, or press / anywhere."),
    quickForm);

  /* the runway and the countdowns */
  const week = days(t, 7);
  const run = h("section.panel.run", { "aria-label": "The next seven days" }, h("header.panel-head", h("h2", "Runway"), h("a.link", { href: "#/time/risk" }, "Risk view")), runway(week, { rowOpts: {} }));
  const cds = countdowns(3, t);
  const count = cds.length ? h("section.panel.count", { "aria-label": "Countdowns" }, h("header.panel-head", h("h2", "Countdowns"), h("a.link", { href: "#/time/agenda" }, "Agenda")),
    h("div.countdowns", cds.map((r) => { const n = diffDays(t, r.date); const num = h("span.num.cd-num"); countUp(num, n);
      return h("a.countdown", { href: r.go || "#/time" }, ring({ value: 1 - Math.min(1, n / 90), size: 96, stroke: 4, tone: r.tone === "holiday" ? "ice" : r.big ? "violet" : "ember", center: h("div", num, h("small", n === 1 ? "day" : "days")), label: `${n} days to ${r.title}` }), h("b", r.title), h("small", fmtDay(r.date))); }))) : null;

  /* tier 2: the payoff. Locked or not on this device, plus the progress ring. No dollar amounts. */
  const m = store.get("money"); const pos = m.plan && m.plan.debts && m.plan.debts.length ? position(m.plan, m.events, t) : null; const locked = !!pos;
  const pctEl = h("span.num.dial-pct"); if (locked) countUp(pctEl, pos.pct * 100, (v) => v.toFixed(v >= 99.95 ? 0 : 1) + "%"); else pctEl.textContent = "0%";
  const payoff = h("section.panel.payoff.glow-mint" + (locked ? "" : ".payoff-launch"), { "aria-label": locked ? "Payoff plan locked on this device" : "No payoff plan on this device" },
    h("header.panel-head", h("h2", "Payoff"), chip(locked ? "Plan locked" : "No plan on this device"), h("a.link", { href: "#/money" }, "Open")),
    h("a.dial-box", { href: "#/money", "aria-label": locked ? "Payoff plan locked on this device" : "No payoff plan is locked on this device" },
      dial({ value: locked ? pos.pct : 0, width: 300, stroke: 10, ticks: 48, tone: "mint", label: locked ? "Share of the starting debt paid" : "No plan locked" }),
      h("div.dial-center", pctEl, h("small", locked ? "paid, by schedule" : "nothing locked"))));

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
    h("span.tile-head", h("span", "Storm watch"), h("small", profile.place ? "retry" : "on this device")),
    h("span.tile-main", icon("cloud", 30), h("span", h("b", profile.place ? "No reading yet" : "Set a location"), h("small", profile.place ? "The weather service did not answer. Tap to try again." : "Add a place. Nothing is saved until you do.")))));
  const tm = store.get("time"); const fs = focusStats(tm, t); const fv = focusView(tm);
  tiles.push(h("a.tile.focus", { href: "#/time/focus", "aria-label": "Focus clock" },
    h("span.tile-head", h("span", "Focus"), h("small", fs.streak ? plural(fs.streak, "day") + " running" : "")),
    h("span.tile-main", icon("flame", 30), h("span", h("b.num.big", fv ? Math.ceil(fv.leftMs / 60000) + "′" : String(fs.today)), h("small", fv ? `${fv.phase === "work" ? "working" : "on a break"} · ${fv.method.name}` : "minutes today"))),
    bars(fs.week.map((x) => x.minutes), { w: 150, h: 26, tone: "violet" }), h("small.quiet", "the last seven days")));

  const readJson = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const ecoStats = pillarStats(t);
  const homeCount = (ecoStats.hearth ? ecoStats.hearth.records : 0) + (ecoStats.aether ? ecoStats.aether.records : 0) + (ecoStats.garage ? ecoStats.garage.records : 0) + (ecoStats.bastion ? ecoStats.bastion.records : 0);
  const odo = readJson("prometheus.garage.odometer", 0);
  const vehicleRec = readJson("prometheus.garage.vehicle", null);
  const vehicleName = vehicleRec && String(vehicleRec.name || "").trim();
  tiles.push(h("a.tile.homestead", { href: "pillars/hearth/", "aria-label": "Homestead" },
    h("span.tile-head", h("span", "Homestead"), h("small", "Hearth · Aether · Garage")),
    h("span.tile-main", icon("house", 30), h("span", h("b.num.big", String(homeCount || 11)), h("small", homeCount ? "logged assets & checks" : "rooms mapped in Hearth"))),
    h("span.tile-line", odo ? `${vehicleName || "Vehicle"} @ ${Number(odo).toLocaleString()} mi · offline kit ready` : "Pass prep, power budget, and remodel phases."),
    h("small.quiet", "Open Hearth")));

  for (const c of ctx.caps || []) if (c.model.tile) { try { const el = c.model.tile(store.get(c.id), t, { h, icon, ring, bars, spark, chip }); if (el) tiles.push(el); } catch (e) { console.error(e); } }
  const ambient = h("section.ambient", { "aria-label": "Ambient instruments" }, tiles);

  const titan = PILLARS.find((p) => p.id === "titan");
  if (titan) tiles.push(h("a.tile.titan", { href: titan.route, rel: "noopener", "aria-label": "Titan Reliquary" },
    h("span.tile-head", h("span", "Titan Reliquary"), h("small", "own site")),
    h("span.tile-main", icon("coin", 30), h("span", h("b", "Open the collection"), h("small", "The ledger stays on its own site."))),
    h("small.quiet", "Link out")));
  const seenKey = "prom.deck.lastSeen"; let lastSeen = null; try { lastSeen = sessionStorage.getItem(seenKey + ".s") || localStorage.getItem(seenKey); sessionStorage.setItem(seenKey + ".s", lastSeen || ""); localStorage.setItem(seenKey, new Date().toISOString()); } catch (e) { /* first visit */ }
  const fresh = eventsSince(lastSeen || "", 8), lately = fresh.length ? fresh : eventsSince("", 4), ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d"; };
  const since = lately.length ? h("section.panel.since", { "aria-label": fresh.length ? "Since you were here" : "Lately" }, h("header.panel-head", h("h2", fresh.length ? "Since you were here" : "Lately in the pillars"), h("small.quiet", fresh.length ? plural(fresh.length, "change") : "")),
    ...lately.map((e) => h("a.since-row", { href: e.href }, h("b", e.name), h("span", e.say + (e.title ? ": " + e.title : "")), h("small.quiet", ago(e.at))))) : null;
  const rx = reactor(ctx); boot(new URLSearchParams(location.search).get("boot") === "1");
  const totalRecords = Object.values(ecoStats).reduce((s, x) => s + (x.records || 0), 0);
  const openDeadlines = (() => { try { return JSON.parse(localStorage.getItem("prometheus.bus.deadlines") || "[]").filter((r) => r && !r.done && r.source !== "kairos-fixed" && r.date >= t).length; } catch (_) { return 0; } })();
  const sales30d = busMoneySales().rows.filter((r) => !r.date || r.date >= addDays(t, -30)).length;
  const activePillars = PILLARS.filter((p) => !p.ext).length;
  const ecoHud = h("section.panel.eco-hud", { "aria-label": "Ecosystem Telemetry" },
    h("div.eco-grid",
      h("a.eco-stat", { href: "#/system" }, h("span.eco-k", "Active Pillars"), h("b.eco-v", `${activePillars} / ${PILLARS.length}`)),
      h("a.eco-stat", { href: "#/system" }, h("span.eco-k", "Local Records"), h("b.eco-v", String(totalRecords))),
      h("a.eco-stat", { href: "#/time" }, h("span.eco-k", "Open Deadlines"), h("b.eco-v", String(openDeadlines))),
      h("a.eco-stat", { href: "#/money", "aria-label": sales30d + " sales recorded on the money bus in 30 days" }, h("span.eco-k", "30d Bus Sales"), h("b.eco-v", String(sales30d))),
      h("a.eco-stat", { href: "#/time" }, h("span.eco-k", "Focus Streak"), h("b.eco-v", `${fs.streak || 0}d`))
    )
  );

  /* full-width searchable 27-pillar Command Atlas */
  let atlasDom = "all";
  const atlasCount = chip(`${PILLARS.length} / ${PILLARS.length}`);
  const atlasSearch = h("input.atlas-search", { type: "search", placeholder: "Filter 27 pillars by name, domain, or capability...", "aria-label": "Filter Command Atlas pillars" });
  const atlasGrid = h("div.atlas-grid");
  const domBtns = PILLAR_DOMAINS.map((d) => h("button.atlas-tab" + (d.id === "all" ? ".on" : ""), {
    type: "button",
    onclick: () => { atlasDom = d.id; domBtns.forEach((b, i) => b.classList.toggle("on", PILLAR_DOMAINS[i].id === d.id)); paintAtlas(); }
  }, d.short));
  const paintAtlas = () => {
    const q = atlasSearch.value.trim().toLowerCase();
    const list = PILLARS.filter((p) => {
      const dom = domainOf(p.id);
      if (atlasDom !== "all" && dom !== atlasDom) return false;
      if (!q) return true;
      return (p.name + " " + p.what + " " + dom + " " + p.id).toLowerCase().includes(q);
    });
    atlasCount.textContent = `${list.length} / ${PILLARS.length}`;
    atlasGrid.replaceChildren(...list.map((p) => {
      const dom = domainOf(p.id);
      const dMeta = PILLAR_DOMAINS.find((x) => x.id === dom);
      const st = ecoStats[p.id];
      const badgeText = p.ext ? "External Site" : st && st.next ? `Next: ${fmtDay(st.next.date)}` : st && st.records ? plural(st.records, "entry", "entries") : "Online · Ready";
      return h("a.atlas-card", { href: p.route, style: { "--p-hue": p.hue }, dataset: { pillar: p.id, domain: dom } },
        h("span.atlas-ico", icon(p.icon, 20)),
        h("span.atlas-body",
          h("span.atlas-top", h("b", p.name), h("span.atlas-dom", dMeta ? dMeta.short : dom)),
          h("span.atlas-what", p.what),
          h("span.atlas-foot", h("small", badgeText), h("small.atlas-go", p.ext ? "Open external →" : "Enter →"))));
    }));
  };
  atlasSearch.addEventListener("input", paintAtlas);
  paintAtlas();
  const atlasPanel = h("section.panel.atlas-panel", { id: "pillar-atlas", "aria-label": "Command Atlas" },
    h("header.panel-head", h("h2", `Command Atlas · ${PILLARS.length} Pillars`), atlasCount, h("a.link", { href: "#/system" }, "System")),
    h("div.atlas-toolbar", atlasSearch, h("div.atlas-tabs", { role: "group", "aria-label": "Atlas domains" }, ...domBtns)),
    atlasGrid);

  const isAway = (() => { try { return JSON.parse(localStorage.getItem("prometheus.odyssey.away") || "false") === true || (JSON.parse(localStorage.getItem("prometheus.bus.meta") || "{}").awayMode === true); } catch { return false; } })();
  const awayBanner = isAway ? h("section.panel.glow-ember.away-banner", { "aria-label": "Away Mode" },
    h("header.panel-head", h("h2", "Odyssey Away Mode"), chip("active"), h("a.link", { href: "pillars/odyssey/" }, "Checklist")),
    h("p", "Travel priority mode enabled — mountain readiness (Bastion), home systems (Hearth) & near-term transit promoted above financial ambient tiles.")) : null;
  const boardPanels = isAway ? [awayBanner, ecoHud, since, first, ambient, run, count, payoff, atlasPanel] : [ecoHud, since, first, payoff, run, count, ambient, atlasPanel];
  put(root, rx, hero, put(h("div.board"), ...boardPanels), h("footer.foot", h("a.link", { href: "#/system" }, profile.demo ? "Sample data is loaded · remove it" : "Your data stays on this device"), h("a.link", { href: "#/time" }, "Kairos console"), h("a.link", { href: "#/money" }, "Payoff console")));
  return () => { if (rx.cleanup) rx.cleanup(); };
}
