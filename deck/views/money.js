/* Money moved into Midas (owner, 2026-11-25: "Replace money at the bottom with midas and just incorporate whatever the goal of that was
   into Midas"). The Payoff Console's rooms live in Midas Ledger now (jpavia10/midas-ledger: the plan on Debt, What if, the recurring
   charges on Spend, the library), and the bills are still this device's `prom.deck.money` slice, which Midas reads and writes and Time
   still shows. Every old route forwards to the matching Midas room, so links in Time, search and old bookmarks land in the right place. */
import { put, h } from "../core/ui.js";

const ROOM = { plan: "plan", whatif: "whatif", bills: "bills", library: "library" };
export const midasUrl = (tab) => new URL(`../midas-ledger/#${ROOM[tab] || "today"}`, location.href).href;

export function render(root, route) {
  const url = midasUrl(route && route.tab);
  put(root, h("div.empty.scene", h("h2", "Money lives in Midas now"), h("p", "The plan, what if, bills and subscriptions, and the library moved into Midas Ledger."), h("a.btn", { href: url }, "Open Midas")));
  setTimeout(() => { if (/#\/money/.test(location.hash)) location.replace(url); }, 60);
}
