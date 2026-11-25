/* The home (owner, 2026-11-24: "Just have the main hub home be like a full screen town thing but cooler than just town and remove the
   inside the pillars and other shit and shift to system tab. That frees up space and helps to make room for cooler town and more pillars").
   The home is the town, full screen, alive with the real hour and the real weather (realm.js), with the weather chip over it (wxchip.js).
   What used to sit under it (the now line, "Since you were here", "After that", the ticker) is the briefing at the top of System.
   The game menu (owner, 2026-11-16) is one tap away (Levels) and stays the home if chosen; ?home=orbit|menu pins one for the proofs.
   Nothing here is a table, and nothing here is a dollar figure. */
import { put, h, icon, plural } from "../core/ui.js";
import { eventsSince } from "../core/reach.js";
import { clock, today } from "../core/dates.js";
import { nowFacts } from "../core/now.js";
import { untilText } from "./parts.js";
import { boot, ticker } from "./orrery.js";
import { realm } from "./realm.js";
import { menu, unpin, todayRowsFor } from "./menu.js";
import { wxChip } from "./wxchip.js";
import { townSound } from "./townsound.js";
import { pillarStats } from "../core/legacy.js";

const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d"; };
function homeMode() {
  const q = new URLSearchParams(location.search).get("home");
  if (q === "orbit" || q === "menu") return q;
  try { return localStorage.getItem("prom.deck.home") === "menu" ? "menu" : "orbit"; } catch (e) { return "orbit"; }
}

/* when this session began, the visit before it: read once per session, shared by the home and System */
function lastVisit() {
  const key = "prom.deck.lastSeen";
  try {
    let s = sessionStorage.getItem(key + ".s");
    if (s === null) { s = localStorage.getItem(key) || ""; sessionStorage.setItem(key + ".s", s); }
    localStorage.setItem(key, new Date().toISOString());
    return s || null;
  } catch (e) { return null; }
}

/* the briefing: what is true now, what changed since the last visit, what comes after; on System since 2026-11-24 */
export function briefing(ctx) {
  const now = clock.now(), facts = nowFacts(now);
  const eventText = facts.event ? `${facts.event.title}, ${untilText(facts.event, now)}` : "none";
  const deadlineText = facts.deadline ? `${facts.deadline.title}, ${untilText(facts.deadline, now)}` : "none";
  const nowLine = h("p.now-line" + (facts.event ? "" : ".one"), { "aria-label": `Now. Next event ${eventText}. Next deadline ${deadlineText}. ${facts.session.label}.` },
    facts.event ? h("span.now-fact", h("b", "Next event"), " · " + eventText) : null,
    h("span.now-fact", h("b", "Next deadline"), " · " + deadlineText),
    h("span.now-fact.now-session", facts.session.label));
  /* "Lately in the pillars" (owner, 2026-11-24: "is outdated why"): with nothing new since the last visit it used to show the last four
     events ever logged, however old. Now it shows only what changed since the last visit, or in the last three days. */
  const since = lastVisit(), fresh = eventsSince(since || "", 8);
  const recent = fresh.length ? fresh : eventsSince(new Date(clock.now().getTime() - 3 * 864e5).toISOString(), 4);
  const said = [facts.event && facts.event.title, facts.deadline && facts.deadline.title];
  const { rows } = todayRowsFor(now, today(), 3, said);
  const cards = [];
  if (recent.length) cards.push(h("section.panel.since.context-card", { "aria-label": fresh.length ? "Since you were here" : "Lately" },
    h("header.panel-head", h("h2", fresh.length ? "Since you were here" : "In the last three days"), h("small.quiet", fresh.length ? plural(fresh.length, "change") : "")),
    ...recent.slice(0, 4).map((e) => h("a.since-row", { href: e.href }, h("b", e.name), h("span", e.say + (e.title ? ": " + e.title : "")), h("small.quiet", ago(e.at))))));
  cards.push(h("section.panel.context-card.next-card", { "aria-label": "After that, across every pillar" },
    h("header.panel-head", h("h2", "After that"), h("a.link", { href: "#/time/agenda" }, "Agenda")),
    rows.length ? h("div.mn-trows", ...rows) : h("p.quiet", "Nothing dated yet. Add one with +.")));
  return h("div.briefing", { id: "briefing" }, ticker(ctx, today(), pillarStats(today())), nowLine, ...cards);
}

export function render(root, route, ctx) {
  lastVisit();
  if (homeMode() === "menu") {
    const rx = menu(ctx, { rerender: () => { if (rx && rx.cleanup) rx.cleanup(); location.hash = "#/"; dispatchEvent(new HashChangeEvent("hashchange")); } });
    put(root, rx, briefing(ctx));
    return () => { if (rx && rx.cleanup) rx.cleanup(); };
  }
  const rx = realm(ctx); boot(new URLSearchParams(location.search).get("boot") === "1");
  const toMenu = h("button.mn-back.rl-levels", { type: "button", "aria-label": "Levels: the game menu", onclick: () => { try { localStorage.setItem("prom.deck.home", "menu"); } catch (e) { /* this visit */ } unpin(); if (rx.cleanup) rx.cleanup(); location.hash = "#/"; dispatchEvent(new HashChangeEvent("hashchange")); } }, icon("grid", 14), h("span", "Levels"));
  /* a new weather reading swaps the chip in place; the town reads the sky itself (realm.js), so nothing is redrawn */
  let chip = wxChip(ctx); const onWx = () => { const open = chip.classList.contains("open"); const n = wxChip(ctx); chip.replaceWith(n); chip = n; if (open) { const c = n.querySelector(".wx-chip"); if (c && n.querySelector(".wx-panel")) c.click(); } };
  /* the town's sound (2026-11-25): real recordings that follow its sky; off until he turns it on (townsound.js) */
  const snd = townSound(() => rx.sky(), () => { const w = ctx.weather(); return { temp: w && w.now ? w.now.temp : null, season: rx.season ? rx.season().name : "" }; });
  rx.onflash = () => snd.flash();
  const sndB = h("button.rl-sound", { type: "button", "aria-pressed": String(snd.on()), "aria-label": "The town's sound", title: "The town's sound: rain, wind, birds, night" }, icon(snd.on() ? "speaker" : "mute", 15));
  sndB.onclick = () => { const on = snd.toggle(); sndB.setAttribute("aria-pressed", String(on)); sndB.replaceChildren(icon(on ? "speaker" : "mute", 15)); };
  rx.sound = snd;
  put(root, rx, chip, h("div.rl-tools", sndB, toMenu)); rx.fit(); addEventListener("deck:weather", onWx);
  document.body.classList.add("town-home");
  const done = () => { removeEventListener("deck:weather", onWx); document.body.classList.remove("town-home"); snd.cleanup(); if (rx.cleanup) rx.cleanup(); };
  done.refresh = onWx;                                                            // a same-place refresh redraws the chip, never the town (app.js render)
  return done;
}
