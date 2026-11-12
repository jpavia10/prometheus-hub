/* Integration, in one place: every capability's dated rows merged live from the one store (nothing is copied, so nothing goes stale),
   the per-day load for the runway and the risk view, and the search that reaches anything. */
import { store } from "./store.js";
import { CAPS } from "../caps.js";
import { fixedFeed, risk } from "../models/time.js";
import { addDays, today } from "./dates.js";
import { busRows } from "./legacy.js";
import { PILLARS } from "../pillars.js";
const ROUTES = Object.fromEntries(PILLARS.map((p) => [p.id, p.route]));

let FIXED = [];
export const setFixed = (rows) => { FIXED = rows || []; };
export const fixed = () => FIXED;

/** Every dated row between from and to (inclusive), soonest first; all-day rows before timed ones on the same day. */
export function rows(from, to, { withFixed = true } = {}) {
  const out = withFixed ? fixedFeed(FIXED, from, to) : [];
  for (const c of CAPS) { try { out.push(...c.model.feed(store.get(c.id), from, to)); } catch (e) { console.error("[feed]", c.id, e); } }
  try { out.push(...busRows(from, to, ROUTES)); } catch (e) { console.error("[feed] bus", e); }                  // what the pillars already published on this device
  const holidays = new Map(out.filter((r) => r.tone === "holiday").map((r) => [r.date, r.title]));
  for (const r of out) if (!r.fixed && (r.weight || 0) >= 3 && holidays.has(r.date)) r.holiday = holidays.get(r.date);
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "") || (b.weight || 0) - (a.weight || 0) || a.title.localeCompare(b.title));
}
/** Per-day load from `from` for `n` days. */
export function days(from = today(), n = 7) { const to = addDays(from, n - 1); return risk(rows(from, to), from, to); }
/** Rows due inside the next `hours` hours from the clock (all-day rows count for their whole day). */
export function within(hours, now) {
  const t0 = today(); const all = rows(t0, addDays(t0, Math.ceil(hours / 24) + 1), { withFixed: false }); const end = now.getTime() + hours * 3600000;
  return all.filter((r) => { if (r.done) return false; const [y, m, d] = r.date.split("-").map(Number); const [hh, mm] = (r.time || "23:59").split(":").map(Number); const at = new Date(y, m - 1, d, hh, mm).getTime(); return at >= now.getTime() - (r.time ? 0 : 0) && at <= end || (!r.time && r.date === t0); });
}
/** The next `n` "big" dates: the owner's starred events first, then hard deadlines, then federal holidays to fill. */
export function countdowns(n = 3, from = today()) {
  const all = rows(from, addDays(from, 400)); const pick = []; const seen = new Set();
  const idOf = (r) => (r.ref && r.ref.id) || r.key;                                  // one countdown per thing: the first day of a trip, the next turn of a repeat
  const take = (f) => { for (const r of all) { if (pick.length >= n) return; if (r.done || seen.has(idOf(r)) || !f(r)) continue; seen.add(idOf(r)); pick.push(r); } };
  take((r) => r.big); take((r) => !r.fixed && r.cap === "time" && !r.repeat && (r.weight || 0) >= 3 && r.date > from); take((r) => r.tone === "holiday" && r.date > from);
  return pick.sort((a, b) => a.date.localeCompare(b.date));
}
/** One search over every capability. Returns [{ title, sub, go, cap }] */
export function searchAll(q) {
  q = String(q || "").trim().toLowerCase(); if (q.length < 2) return [];
  const out = [];
  for (const c of CAPS) { try { for (const r of c.model.search(store.get(c.id), q, FIXED) || []) out.push({ ...r, cap: c.id }); } catch (e) { console.error("[search]", c.id, e); } }
  return out.slice(0, 40);
}
