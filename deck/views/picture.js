/* The picture: the arrival view. Today across everything, read live from the one store.
   Order is deliberate: what is due within a day and any weather warning first, the seven-day runway and the countdowns next,
   the payoff second tier, then the ambient instruments. Nothing here is a copy: every number is computed from the capabilities' own data. */
import { h, icon, ring, dial, bars, spark, chip, moneyC, pct, monthsText, plural, countUp } from "../core/ui.js";
import { clock, today, fmtDay, diffDays, monName } from "../core/dates.js";
import { days, within, countdowns } from "../core/feeds.js";
import { rowItem, runway, locationSheet, skySheet } from "./parts.js";
import { position, milestone } from "../models/money.js";
import { focusStats, focusView } from "../models/time.js";
import * as wx from "../core/weather.js";
import { WORDS } from "../data/money-words.js";

export function render(root, route, ctx) {
  const { store } = ctx; const profile = store.get("profile"); const now = clock.now(); const t = today();
  if (store.pristine() && !profile.seed) return firstRun(root, ctx);

  const hour = now.getHours(); const hello = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const w = ctx.weather(); const soon = within(24, now); const alerts = (w && w.alerts) || [];
  const hard = soon.filter((r) => (r.weight || 0) >= 2).length;

  /* tier 1: the next 24 hours */
  const first = h("section.tier1.panel.glow-ember", { "aria-label": "The next 24 hours" },
    h("p.kicker", h("span", hello + (profile.name ? ", " + profile.name : "")), h("span.num", fmtDay(t, "long"))),
    h("h1.headline", soon.length ? [h("span.num.big", String(soon.length)), ` ${soon.length === 1 ? "thing" : "things"} in the next 24 hours`, hard ? h("small", ` · ${hard} that cannot slip`) : null] : "Clear for the next 24 hours."),
    ...alerts.slice(0, 2).map((a) => h("button.alert", { type: "button", onclick: () => skySheet(ctx) }, icon("alert", 18), h("span", h("b", a.event), h("small", a.ends ? "until " + new Date(a.ends).toLocaleString("en-US", { weekday: "short", hour: "numeric" }) : "active now")))),
    soon.length ? h("div.items", soon.slice(0, 5).map((r) => rowItem(r, { rel: true })), soon.length > 5 ? h("a.more", { href: `#/time/day/${t}` }, `${soon.length - 5} more today and tomorrow`) : null) : null);

  /* the runway and the countdowns */
  const week = days(t, 7);
  const run = h("section.panel", { "aria-label": "The next seven days" }, h("header.panel-head", h("h2", "Runway"), h("a.link", { href: "#/time/risk" }, "Risk view")), runway(week, { rowOpts: {} }));
  const cds = countdowns(3, t);
  const count = cds.length ? h("section.panel", { "aria-label": "Countdowns" }, h("header.panel-head", h("h2", "Countdowns"), h("a.link", { href: "#/time/agenda" }, "Agenda")),
    h("div.countdowns", cds.map((r) => { const n = diffDays(t, r.date); const num = h("span.num.cd-num"); countUp(num, n);
      return h("a.countdown", { href: r.go || "#/time" }, ring({ value: 1 - Math.min(1, n / 90), size: 92, stroke: 6, tone: r.tone === "holiday" ? "ice" : r.big ? "violet" : "ember", center: h("div", num, h("small", n === 1 ? "day" : "days")), label: `${n} days to ${r.title}` }), h("b", r.title), h("small", fmtDay(r.date))); }))) : null;

  /* tier 2: the payoff */
  const m = store.get("money"); const pos = m.plan ? position(m.plan, m.events, t) : null; let payoff;
  if (pos) {
    const ms = milestone(pos.pct); const [fy, fm] = (pos.freeMonth || "").split("-").map(Number); const pctEl = h("span.num.dial-pct"); countUp(pctEl, pos.pct * 100, (v) => v.toFixed(v >= 99.95 ? 0 : 1) + "%");
    payoff = h("section.panel.payoff.glow-mint", { "aria-label": "The payoff" },
      h("header.panel-head", h("h2", "Payoff"), m.plan.sample ? chip("sample preset") : m.plan.label ? chip(m.plan.label) : null, h("a.link", { href: "#/money" }, "Open")),
      h("a.dial-box", { href: "#/money", "aria-label": `Payoff: ${pct(pos.pct, 1)} paid by schedule` }, dial({ value: pos.pct, width: 280, tone: "mint", label: "Share of the starting debt paid" }), h("div.dial-center", pctEl, h("small", "paid, by schedule"))),
      h("div.stats3",
        h("div", h("small", "Debt-free"), h("b.num", pos.done ? "Done" : pos.freeMonth ? `${monName(fm, 1)} ${fy}` : "never at this payment"), h("small", pos.done ? "" : monthsText(pos.monthsLeft) + " left")),
        h("div", h("small", "Next payment"), h("b.num", pos.next ? moneyC(pos.next.amountC) : "—"), h("small", pos.next ? (pos.next.in === 0 ? "due today" : pos.next.in === 1 ? "due tomorrow" : `in ${pos.next.in} days`) : "")),
        h("div", h("small", "Interest left"), h("b.num", moneyC(pos.interestLeftC)), h("small", pos.windfallC ? `${moneyC(pos.windfallC, 0)} extra applied` : "on the plan"))),
      ms.hit ? h("p.voice", WORDS.pct[ms.hit]) : null);
  } else payoff = h("section.panel.invite", h("header.panel-head", h("h2", "Payoff")), h("p.quiet", "No payoff plan on this device yet."), h("a.btn", { href: "#/money" }, "Set up the plan"));

  /* ambient tier */
  const tiles = [];
  // storm watch
  if (w && w.now) { const d = wx.describe(w.now.code, w.now.isDay); const hrs = w.hours || [];
    tiles.push(h("button.tile.sky", { type: "button", id: "sky-watch", onclick: () => skySheet(ctx), "aria-label": "Storm watch: open the full reading" },
      h("span.tile-head", h("span", "Storm watch"), h("small", profile.place ? profile.place.label : "")),
      h("span.tile-main", icon(d.icon, 34), h("span", h("b.num.big", Math.round(w.now.temp) + "°"), h("small", d.text))),
      h("span.tile-line" + (alerts.length ? ".warn" : ""), wx.headline(w)),
      bars(hrs.slice(0, 24).map((x) => x.pop || 0), { w: 150, h: 26, tone: alerts.length ? "ember" : "ice", max: 100 }),
      h("small.quiet", `gusts to ${Math.round(Math.max(0, ...hrs.map((x) => x.gust || 0)))} mph${w.stale ? " · last known reading" : ""}`)));
  } else tiles.push(h("button.tile.sky.invite", { type: "button", id: "sky-watch", onclick: () => (profile.place ? ctx.reloadWeather(true) : locationSheet(ctx)) },
    h("span.tile-head", h("span", "Storm watch")), h("span.tile-main", icon("cloud", 34), h("span", h("b", profile.place ? "No reading yet" : "Set home"), h("small", profile.place ? "Offline, or the weather service did not answer. Tap to try again." : "One point on the map turns on the storm watch and the live sky.")))));
  // focus
  const tm = store.get("time"); const fs = focusStats(tm, t); const fv = focusView(tm);
  tiles.push(h("a.tile.focus", { href: "#/time/focus", "aria-label": "Focus clock" },
    h("span.tile-head", h("span", "Focus"), h("small", fs.streak ? plural(fs.streak, "day") + " running" : "")),
    h("span.tile-main", icon("flame", 34), h("span", h("b.num.big", fv ? Math.ceil(fv.leftMs / 60000) + "′" : String(fs.today)), h("small", fv ? `${fv.phase === "work" ? "working" : "on a break"} · ${fv.method.name}` : "minutes today"))),
    bars(fs.week.map((x) => x.minutes), { w: 150, h: 26, tone: "violet" }), h("small.quiet", "the last seven days")));
  // capability tiles (each finished capability can add one through its model)
  for (const c of ctx.caps || []) if (c.model.tile) { try { const el = c.model.tile(store.get(c.id), t, { h, icon, ring, bars, spark, chip }); if (el) tiles.push(el); } catch (e) { console.error(e); } }
  const ambient = h("section.ambient", { "aria-label": "Ambient instruments" }, tiles);

  root.append(first, run, count, payoff, ambient, h("footer.foot", h("a.link", { href: "#/system" }, profile.demo ? "Sample data · load your own" : "Your data stays on this device"), h("a.link", { href: "https://jpavia10.github.io/titan-reliquary-preview/", rel: "noopener" }, "Titan Reliquary")));
}

/* The first run: a scene, not a blank. Three honest ways in. */
function firstRun(root, ctx) {
  root.append(h("section.first", { "aria-label": "First run" },
    h("div.first-mark", { "aria-hidden": "true" }),
    h("h1.first-title", "Prometheus"),
    h("p.first-sub", "Your day, your deadlines, your money and your house on one deck. Everything stays on this device."),
    h("div.first-actions",
      h("button.btn.big", { type: "button", onclick: () => ctx.loadSeedFile() }, icon("upload", 20), h("span", h("b", "Load my deck"), h("small", "Pick your deck file (from Drive or this device)"))),
      h("button.btn.big.ghost", { type: "button", onclick: () => ctx.startDemo() }, icon("play", 20), h("span", h("b", "Fly the demo"), h("small", "Sample data, clearly marked, removable in one tap"))),
      h("a.btn.big.ghost", { href: "#/time" }, icon("plus", 20), h("span", h("b", "Start empty"), h("small", "Add your first event in Time"))))));
}
