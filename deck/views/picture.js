/* The arrival view. The core, one line of what is true right now, and one card.
   Runway, countdowns, focus and the day ring live on Time. Storm, homestead, the counts and the atlas live on System.
   The payoff ring lives on Money. Nothing here is a table, and nothing here is a dollar figure.
   The game menu (owner, 2026-11-16) is the other home; ?home=orbit|menu pins one for the proofs. */
import { put, h, icon } from "../core/ui.js";
import { clock, today } from "../core/dates.js";
import { nowFacts } from "../core/now.js";
import { fixed } from "../core/feeds.js";
import { loadBrief } from "../models/brief.js";
import { untilText } from "./parts.js";
import { reactor, boot } from "./orrery.js";
import { menu, unpin } from "./menu.js";

function homeMode() {
  const q = new URLSearchParams(location.search).get("home");
  if (q === "orbit" || q === "menu") return q;
  try { return localStorage.getItem("prom.deck.home") === "orbit" ? "orbit" : "menu"; } catch (e) { return "menu"; }
}

/** The one card. The top ranked line, or a quiet card when the device has nothing to brief. */
function contextCard(lines) {
  const top = lines[0];
  if (!top) return h("section.panel.context-card", { "aria-label": "Brief" }, h("header.panel-head", h("h2", "Brief")), h("p.quiet", "Nothing on the brief."));
  if (top.rule === "since") {
    return h("section.panel.since.context-card", { "aria-label": "Since you were here" },
      h("header.panel-head", h("h2", "Since you were here")),
      h("a.since-row", { href: top.href }, h("b", top.where || top.label), h("span", top.say || top.text), top.when ? h("small.quiet", top.when) : null));
  }
  return h("section.panel.context-card", { "aria-label": top.label },
    h("header.panel-head", h("h2", top.label)),
    h("a.brief-line", { href: top.href }, top.text));
}

export function render(root, route, ctx) {
  const now = clock.now();
  const facts = nowFacts(now);
  const eventText = facts.event ? `${facts.event.title}, ${untilText(facts.event, now)}` : "none";
  const deadlineText = facts.deadline ? `${facts.deadline.title}, ${untilText(facts.deadline, now)}` : "none";
  const nowLine = h("p.now-line", { "aria-label": `Now. Next event ${eventText}. Next deadline ${deadlineText}. ${facts.session.label}.` },
    h("span.now-fact", h("b", "Next event"), " · " + eventText),
    h("span.now-fact", h("b", "Next deadline"), " · " + deadlineText),
    h("span.now-fact.now-session", facts.session.label));

  const seenKey = "prom.deck.lastSeen"; let lastSeen = null;
  try { lastSeen = sessionStorage.getItem(seenKey + ".s") || localStorage.getItem(seenKey); sessionStorage.setItem(seenKey + ".s", lastSeen || ""); localStorage.setItem(seenKey, new Date().toISOString()); } catch (e) { /* first visit */ }
  const lines = loadBrief((k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, {
    today: today(), now: now.toISOString(), lastSeen: lastSeen || "", time: ctx.store.get("time"), money: ctx.store.get("money"), fixed: fixed(),
  });
  const card = contextCard(lines);

  if (homeMode() !== "orbit") {
    const rx = menu(ctx, { rerender: () => { if (rx && rx.cleanup) rx.cleanup(); location.hash = "#/"; dispatchEvent(new HashChangeEvent("hashchange")); } });
    put(root, rx, h("div.briefing", { id: "briefing" }, nowLine, card));
    return () => { if (rx && rx.cleanup) rx.cleanup(); };
  }
  const rx = reactor(ctx); boot(new URLSearchParams(location.search).get("boot") === "1");
  const toMenu = h("button.mn-back", { type: "button", onclick: () => { try { localStorage.setItem("prom.deck.home", "menu"); } catch (e) { /* this visit */ } unpin(); if (rx.cleanup) rx.cleanup(); location.hash = "#/"; dispatchEvent(new HashChangeEvent("hashchange")); } }, icon("grid", 15), h("span", "Menu"));
  put(root, toMenu, rx, nowLine, card);
  return () => { if (rx.cleanup) rx.cleanup(); };
}
