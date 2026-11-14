/* The arrival view. The core, one line of what is true right now, and one card.
   Runway, countdowns, focus and the day ring live on Time. Storm, homestead, the counts and the atlas live on System.
   The payoff ring lives on Money. Nothing here is a table, and nothing here is a dollar figure. */
import { put, h, plural } from "../core/ui.js";
import { eventsSince } from "../core/reach.js";
import { clock } from "../core/dates.js";
import { nowFacts } from "../core/now.js";
import { untilText } from "./parts.js";
import { reactor, boot } from "./orrery.js";

const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d"; };

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
  const fresh = eventsSince(lastSeen || "", 8), lately = (fresh.length ? fresh : eventsSince("", 4)).slice(0, 2);
  const w = ctx.weather(); const alerts = (w && w.alerts) || [];
  const away = (() => { try { return JSON.parse(localStorage.getItem("prometheus.odyssey.away") || "false") === true || (JSON.parse(localStorage.getItem("prometheus.bus.meta") || "{}").awayMode === true); } catch { return false; } })();

  let card;
  if (lately.length) {
    card = h("section.panel.since.context-card", { "aria-label": fresh.length ? "Since you were here" : "Lately" },
      h("header.panel-head", h("h2", fresh.length ? "Since you were here" : "Lately in the pillars"), h("small.quiet", fresh.length ? plural(fresh.length, "change") : "")),
      ...lately.map((e) => h("a.since-row", { href: e.href }, h("b", e.name), h("span", e.say + (e.title ? ": " + e.title : "")), h("small.quiet", ago(e.at)))));
  } else if (away) {
    card = h("section.panel.context-card.away-banner", { "aria-label": "Away" },
      h("header.panel-head", h("h2", "Away"), h("a.link", { href: "pillars/odyssey/" }, "Checklist")),
      h("p.quiet", "Travel is on. The checklist is in Odyssey."));
  } else if (alerts.length) {
    card = h("section.panel.context-card", { "aria-label": "Weather alert" },
      h("header.panel-head", h("h2", alerts[0].event), h("a.link", { href: "#/system" }, "Storm watch")),
      h("p.quiet", alerts[0].headline || "A weather alert is active."));
  } else {
    card = h("section.panel.context-card", { "aria-label": "On this device" },
      h("header.panel-head", h("h2", "On this device"), h("a.link", { href: "#/time" }, "Time")),
      h("p.quiet", "The core is home. Runway, countdowns and focus are in Time. Storm, homestead and the counts are in System."));
  }

  const rx = reactor(ctx); boot(new URLSearchParams(location.search).get("boot") === "1");
  put(root, rx, nowLine, card);
  return () => { if (rx.cleanup) rx.cleanup(); };
}
