/* The capabilities on the deck. One entry per finished capability: its slice of state, its pure model (feed + search) and its view,
   loaded on demand. A capability is added here only when its proof passes (STATUS.md); nothing unfinished is listed. */
import * as time from "./models/time.js";
import * as money from "./models/money.js";
import * as profile from "./models/profile.js";

export const CAPS = [
  { id: "time", name: "Time", icon: "time", tone: "ember", model: time, view: () => import("./views/time.js") },
  { id: "money", name: "Money", icon: "money", tone: "mint", model: money, view: () => import("./views/money.js") },
];
export const SLICES = [{ id: "profile", model: profile }, ...CAPS.map((c) => ({ id: c.id, model: c.model }))];
export const cap = (id) => CAPS.find((c) => c.id === id);
