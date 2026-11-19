/* The brief: ranked lines from the bus and the pillar stores. Pure. No network, no model, no invented rows.
   A line exists only when a stored record supports it, and every line links to that record.
   Rules, highest first: overdue, date collision, away mode, changes since the last visit, streaks.
   Reference dates (source "kairos-fixed", federal holidays) are never overdue and never a collision on their own.
   Titan and Midas are not read. */
import { PILLARS } from "../pillars.js";
import { addDays, diffDays, fmtDay } from "../core/dates.js";
import { feed as timeFeed } from "./time.js";
import { feed as moneyFeed } from "./money.js";

export const RULES = ["overdue", "collision", "away", "since", "streak"];
const SKIP = new Set(["titan", "midas"]);
const ROUTES = Object.fromEntries(PILLARS.filter((p) => !p.ext).map((p) => [p.id, p.route]));
const NAMES = Object.fromEntries(PILLARS.map((p) => [p.id, p.short || p.name]));
const HARD = 3;
const WINDOW = 120;
const STREAK_MIN = 2;

const asArray = (v) => (Array.isArray(v) ? v : []);
const pillarId = (source) => String(source || "").split(/[-:./ ]/)[0].toLowerCase();
const routeOf = (id) => (id && !SKIP.has(id) ? ROUTES[id] || `pillars/${id}/` : "");
const nameOf = (id) => NAMES[id] || id;
const dayKey = (s) => (typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "");
const titleOf = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 140);
const sayOf = (type) => String(type || "update").replace(/[.:]/g, " ").replace(/\s+/g, " ").trim();

function line(rule, rank, label, text, href, ref, extra = {}) {
  return { rule, rank, label, text, href, ref: ref == null ? "" : String(ref), ...extra };
}

/** Consecutive logged days ending today, or yesterday when today is still open. */
export function dayStreak(dates, today) {
  const has = new Set((dates || []).map(dayKey).filter(Boolean));
  let n = 0;
  for (let i = has.has(today) ? 0 : 1; i < 400; i++) {
    const d = addDays(today, -i);
    if (!has.has(d)) break;
    n++;
  }
  return n;
}

function loggedDates(days) {
  if (!days || typeof days !== "object" || Array.isArray(days)) return [];
  const out = [];
  for (const [k, v] of Object.entries(days)) {
    if (!dayKey(k) || !v || typeof v !== "object") continue;
    const filled = Object.values(v).some((x) => x != null && x !== "" && !(Array.isArray(x) && !x.length));
    if (filled) out.push(k);
  }
  return out;
}

function overdueLines(input, today) {
  const out = [];
  const seen = new Set();
  const push = (title, date, href, ref) => {
    const name = titleOf(title);
    if (!name || !dayKey(date) || date >= today) return;
    const key = `${date}|${name.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    const late = diffDays(date, today);
    out.push(line("overdue", 5000 + Math.min(late, 400), "Overdue", `${name} · ${fmtDay(date)}`, href, ref));
  };
  for (const d of asArray(input.deadlines)) {
    if (!d || d.done || d.source === "kairos-fixed") continue;
    const id = pillarId(d.source);
    if (SKIP.has(id)) continue;
    push(d.title, d.date, routeOf(id) || `#/time/day/${d.date}`, d.id || d.ref);
  }
  for (const ev of asArray(input.time && input.time.events)) {
    if (!ev || ev.rule) continue;
    const kind = ev.kind || "event";
    if (kind !== "deadline" && kind !== "school") continue;
    if (ev.done && ev.done[ev.date]) continue;
    push(ev.title, ev.date, `#/time/day/${ev.date}`, ev.id);
  }
  return out.sort((a, b) => b.rank - a.rank).slice(0, 8);
}

function hardRows(input, from, to) {
  const rows = [];
  try {
    for (const r of timeFeed(input.time || { events: [] }, from, to)) {
      if (r.done || (r.weight || 0) < HARD) continue;
      rows.push({ date: r.date, title: titleOf(r.title), href: r.go || `#/time/day/${r.date}`, ref: (r.ref && r.ref.id) || r.key });
    }
  } catch (e) { /* a broken time row does not invent the rest of the brief */ }
  try {
    for (const r of moneyFeed(input.money || { bills: [] }, from, to)) {
      if ((r.weight || 0) < HARD) continue;
      rows.push({ date: r.date, title: titleOf(r.title), href: r.go || "#/money/bills", ref: r.key });
    }
  } catch (e) { /* a broken bill does not invent the rest of the brief */ }
  for (const d of asArray(input.deadlines)) {
    if (!d || d.done || d.source === "kairos-fixed" || !dayKey(d.date) || d.date < from || d.date > to) continue;
    const id = pillarId(d.source);
    if (SKIP.has(id)) continue;
    rows.push({ date: d.date, title: titleOf(d.title), href: routeOf(id) || `#/time/day/${d.date}`, ref: d.id || d.ref });
  }
  return rows.filter((r) => r.title);
}

function collisionLines(input, today) {
  const to = addDays(today, WINDOW);
  const holidays = new Map();
  for (const f of asArray(input.fixed)) if (f && f.kind === "federal holiday" && dayKey(f.date)) holidays.set(f.date, titleOf(f.name));
  const by = new Map();
  for (const r of hardRows(input, today, to)) {
    const list = by.get(r.date) || [];
    if (!list.some((x) => x.title.toLowerCase() === r.title.toLowerCase())) list.push(r);
    by.set(r.date, list);
  }
  const out = [];
  for (const [date, items] of by) {
    const holiday = holidays.get(date) || "";
    if (items.length < 2 && !holiday) continue;
    if (!items.length) continue;
    const names = items.map((x) => x.title);
    const shown = names.slice(0, 2).join(" and ");
    const more = names.length > 2 ? ` and ${names.length - 2} more` : "";
    const text = items.length === 1 ? `${shown} falls on ${holiday}` : `${fmtDay(date)} · ${shown}${more}`;
    const until = diffDays(today, date);
    out.push(line("collision", 4000 + Math.max(0, 200 - Math.min(until, 200)), "Collision", text, `#/time/day/${date}`, items.map((x) => x.ref).filter(Boolean).join(",")));
  }
  return out.sort((a, b) => b.rank - a.rank).slice(0, 6);
}

function awayRecord(input) {
  const meta = input.meta && typeof input.meta === "object" ? input.meta : {};
  const odyssey = input.away === true ? { active: true } : (input.away && typeof input.away === "object" ? input.away : null);
  const fromMeta = meta.away === true ? { active: true } : (meta.away && typeof meta.away === "object" ? meta.away : null);
  const fromFlag = meta.awayMode === true ? { active: true } : null;
  const rec = odyssey || fromMeta || fromFlag;
  if (!rec || rec.active === false) return null;
  return rec;
}

function awayLine(input) {
  const rec = awayRecord(input);
  if (!rec) return [];
  const name = titleOf(rec.name);
  const until = dayKey(rec.until || rec.end || "");
  const text = name ? (until ? `${name} · until ${fmtDay(until)}` : name) : "Away mode is on";
  return [line("away", 3000, "Away", text, routeOf("odyssey") || "pillars/odyssey/", rec.tripId || rec.id || "away")];
}

function sinceLines(input) {
  const since = typeof input.lastSeen === "string" ? input.lastSeen : "";
  if (!since) return [];
  const now = input.now ? new Date(input.now).getTime() : NaN;
  const out = [];
  for (const e of asArray(input.events)) {
    if (!e || typeof e.at !== "string" || !(e.at > since)) continue;
    const id = pillarId(e.pillar);
    if (!id || SKIP.has(id)) continue;
    const href = routeOf(id);
    if (!href) continue;
    const title = titleOf(e.title);
    const say = `${sayOf(e.type)}${title ? ": " + title : ""}`;
    const at = new Date(e.at).getTime();
    const mins = Number.isFinite(now) && Number.isFinite(at) ? Math.max(0, Math.round((now - at) / 60000)) : 0;
    const when = mins < 60 ? mins + " min" : mins < 1440 ? Math.round(mins / 60) + " h" : Math.round(mins / 1440) + " d";
    const where = nameOf(id);
    out.push(line("since", 2000 + Math.max(0, 500 - Math.min(mins, 500)), "Since", `${where} · ${say}`, href, e.ref || e.id || "", { where, say, when }));
  }
  return out.sort((a, b) => b.rank - a.rank).slice(0, 8);
}

function streakLine(label, dates, today, href, ref) {
  const n = dayStreak(dates, today);
  if (n < STREAK_MIN) return null;
  return line("streak", 1000 + Math.min(n, 400), "Streak", `${label} · ${n} days`, href, ref || label.toLowerCase());
}

function streakLines(input, today) {
  const out = [];
  const logs = asArray(input.time && input.time.focus && input.time.focus.log);
  const focus = streakLine("Focus", logs.map((l) => l && l.at), today, "#/time/focus", (logs[logs.length - 1] && logs[logs.length - 1].at) || "focus");
  if (focus) out.push(focus);
  const sessions = asArray(input.sessions).filter((s) => s && dayKey(s.date || s.at));
  const latest = sessions.slice().sort((a, b) => dayKey(b.date || b.at).localeCompare(dayKey(a.date || a.at)))[0];
  const piano = streakLine("Piano", sessions.map((s) => s.date || s.at), today, routeOf("piano") || "pillars/piano/", latest && (latest.id || dayKey(latest.date || latest.at)));
  if (piano) out.push(piano);
  const days = loggedDates(input.days);
  const apollo = streakLine("Apollo", days, today, routeOf("apollo") || "pillars/apollo/", days.slice().sort().pop() || "apollo");
  if (apollo) out.push(apollo);
  return out.sort((a, b) => b.rank - a.rank);
}

/** Ranked brief lines. Empty when nothing on the device supports a line. */
export function brief(input = {}) {
  const today = dayKey(input.today);
  if (!today) return [];
  const lines = [
    ...overdueLines(input, today),
    ...collisionLines(input, today),
    ...awayLine(input),
    ...sinceLines(input),
    ...streakLines(input, today),
  ];
  return lines.sort((a, b) => b.rank - a.rank || a.label.localeCompare(b.label) || a.text.localeCompare(b.text));
}

/** Read the bus and the pillar stores through `read(key) -> stored string`, then rank. */
export function loadBrief(read, extra = {}) {
  const get = (k, d) => {
    try {
      const v = read(k);
      if (v == null || v === "") return d;
      const parsed = JSON.parse(v);
      return parsed == null ? d : parsed;
    } catch (e) { return d; }
  };
  return brief({
    today: extra.today,
    now: extra.now,
    lastSeen: extra.lastSeen || "",
    deadlines: get("prometheus.bus.deadlines", []),
    events: get("prometheus.bus.events", []),
    meta: get("prometheus.bus.meta", {}),
    away: get("prometheus.odyssey.away", null),
    time: extra.time,
    money: extra.money,
    fixed: extra.fixed,
    sessions: get("prometheus.piano.sessions", []),
    days: get("prometheus.apollo.days", {}),
  });
}

/** One paragraph for on-device speech. Titles and dates only. */
export function spoken(lines) {
  return asArray(lines).map((l) => [l.label, l.text].filter(Boolean).join(". ").replace(/\s+/g, " ").trim()).filter(Boolean).join(". ");
}
