/* Time: the deck's calendar and deadline heart. Pure: state in, plain data out.
   Events are kept in their own zone and shown on this device's clock; repeating events expand with their exceptions;
   the fixed dates (58 federal holidays, tax deadlines and clock changes, 2026-2028) are reference rows that never count as "overdue".
   The focus clock is driven by timestamps, so a reload or a locked phone never loses the block. */
import { occurrences, addDays, diffDays, today as todayFn, clock } from "../core/dates.js";
import { wallToLocal } from "../core/ics.js";
import { FOCUS } from "../data/focus.js";

export const KINDS = { event: { label: "Event", weight: 1 }, deadline: { label: "Deadline", weight: 3 }, school: { label: "School", weight: 3 }, appointment: { label: "Appointment", weight: 2 } };

export const slice = {
  schema: 1,
  init: () => ({ events: [], zones: {}, focus: { method: "pomodoro", run: null, log: [] }, prefs: { weekStart: 0 } }),
};
let seq = 0;
export const newId = () => "e" + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 5);

/** A fresh event from the quick add's reading (or a form). */
export function makeEvent(q, more = {}) {
  return { id: newId(), title: q.title, date: q.date, time: q.time || null, allDay: !q.time, tz: null, end: null, dur: null, notes: "", place: "", kind: "event", big: false,
    ...(q.rule ? { rule: q.rule } : {}), created: new Date().toISOString(), ...more };
}
/** Read "school: picture day fri" / "deadline: ..." prefixes and deadline words into a kind. */
export function kindOf(title) {
  const m = /^(school|deadline|due|appt|appointment)\s*[:\-]\s*(.+)$/i.exec(title);
  if (m) return { kind: { school: "school", deadline: "deadline", due: "deadline", appt: "appointment", appointment: "appointment" }[m[1].toLowerCase()], title: m[2].trim() };
  if (/\b(due|deadline|last day|expires?|sign[- ]?up|register by|renew)\b/i.test(title)) return { kind: "deadline", title };
  return { kind: "event", title };
}

/** Occurrences of one event on THIS device's calendar between from and to. Multi-day all-day events yield one row per day. */
export function localOccurrences(ev, from, to) {
  const out = [];
  const span = ev.allDay !== false && !ev.time && ev.end && ev.end.date ? Math.max(1, diffDays(ev.date, ev.end.date)) : 1;
  const raw = occurrences(ev, addDays(from, -span - 1), addDays(to, 1));
  for (const o of raw) {
    const loc = ev.tz && o.time ? wallToLocal(o.date, o.time, ev.tz) : { date: o.date, time: o.time };
    let endTime = null;
    if (o.time && ev.end && ev.end.time && !o.moved) { const e = wallToLocal(addDays(o.date, diffDays(ev.date, ev.end.date)), ev.end.time, ev.end.tz !== undefined && ev.end.tz !== null ? ev.end.tz : ev.tz); endTime = e.date === loc.date ? e.time : e.time + "+"; }
    for (let i = 0; i < span; i++) {
      const date = addDays(loc.date, i); if (date < from || date > to) continue;
      out.push({ ...o, date, time: loc.time, endTime, span: span > 1 ? [i + 1, span] : null, base: o.base });
    }
  }
  return out;
}

/** Dated rows for the deck (this capability's own events). */
export function feed(st, from, to) {
  const out = [];
  for (const ev of st.events) for (const o of localOccurrences(ev, from, to)) {
    const kind = ev.kind || "event";
    out.push({ key: `time:${ev.id}:${o.base}${o.span ? ":" + o.span[0] : ""}`, date: o.date, time: o.time, endTime: o.endTime, title: o.title, cap: "time", tone: kind, weight: (KINDS[kind] || KINDS.event).weight,
      big: !!ev.big, done: !!(ev.done && ev.done[o.base]), repeat: !!ev.rule, moved: o.moved, span: o.span, place: ev.place || "", notes: o.notes, ref: { id: ev.id, base: o.base }, go: `#/time/day/${o.date}` });
  }
  return out;
}
/** The fixed dates as reference rows. */
export function fixedFeed(fixed, from, to) {
  const tone = { "federal holiday": "holiday", "tax deadline": "tax", "clock change": "clock" };
  return (fixed || []).filter((r) => r.date >= from && r.date <= to).map((r) => ({ key: `fixed:${r.date}:${r.name}`, date: r.date, time: null, title: r.name, cap: "fixed", tone: tone[r.kind] || "holiday", weight: 0, fixed: true, url: r.url, go: `#/time/day/${r.date}` }));
}

/** Per-day load for the risk view. rows = everything dated in the window (all capabilities + fixed).
    level 0 clear, 1 busy, 2 heavy, 3 critical; `collision` = two or more hard deadlines the same day, or a hard deadline on a federal holiday. */
export function risk(rows, from, to) {
  const days = {}; for (let d = from; d <= to; d = addDays(d, 1)) days[d] = { date: d, load: 0, hard: 0, holiday: null, rows: [] };
  for (const r of rows) { const x = days[r.date]; if (!x) continue; x.rows.push(r); if (r.done) continue; if (r.tone === "holiday") x.holiday = r.title; x.load += r.weight || 0; if ((r.weight || 0) >= 3) x.hard++; }
  for (const x of Object.values(days)) {
    x.collision = x.hard >= 2 || (x.hard >= 1 && !!x.holiday);
    x.level = x.load >= 9 || (x.collision && x.load >= 6) ? 3 : x.load >= 6 || x.collision ? 2 : x.load >= 3 ? 1 : 0;
    x.why = x.hard >= 2 ? `${x.hard} hard deadlines on one day` : x.hard >= 1 && x.holiday ? `a deadline on ${x.holiday} (offices and banks closed)` : x.load >= 6 ? "a heavy day" : "";
  }
  return Object.values(days);
}

export function search(st, q, fixed) {
  const out = []; const t = todayFn();
  for (const ev of st.events) if ((ev.title + " " + (ev.notes || "") + " " + (ev.place || "")).toLowerCase().includes(q)) {
    const next = occurrences(ev, t, addDays(t, 730))[0] || occurrences(ev, addDays(t, -730), t).pop();
    out.push({ title: ev.title, sub: (KINDS[ev.kind] || KINDS.event).label + (next ? " · " + next.date : ""), date: next && next.date, go: `#/time/day/${next ? next.date : ev.date}` });
  }
  for (const r of fixed || []) if (r.date >= t && r.name.toLowerCase().includes(q)) out.push({ title: r.name, sub: r.kind + " · " + r.date, date: r.date, go: `#/time/day/${r.date}` });
  for (const m of FOCUS) if (m.name.toLowerCase().includes(q)) out.push({ title: m.name, sub: "Focus method", go: "#/time/focus" });
  return out;
}

/* ------------------------------------------------------------------ the focus clock ------------------------------------------------------------------ */
export const method = (id) => FOCUS.find((m) => m.id === id) || FOCUS[0];
/** The phases of one set: [{ phase: work|short|long, minutes }]. A method with no cycle count alternates work and break until stopped. */
export function phases(m) {
  const out = []; const n = m.cycles || 1;
  for (let i = 1; i <= n; i++) { out.push({ phase: "work", minutes: m.work, n: i }); if (i < n && m.short) out.push({ phase: "short", minutes: m.short, n: i }); }
  if (m.cycles && m.long) out.push({ phase: "long", minutes: m.long, n });
  else if (!m.cycles && m.short) out.push({ phase: "short", minutes: m.short, n: 1 });
  return out;
}
export const loops = (m) => !m.cycles && !!m.short;                               // 52/17 and the like: work, break, again
/** Flowtime: the break is sized by the block you just worked (the source's table). */
export const flowBreak = (workedMin) => (workedMin < 25 ? 5 : workedMin < 50 ? 8 : workedMin < 90 ? 10 : 15);

export function focusStart(st, id, label = "", now = clock.now().getTime()) {
  const m = method(id); const ph = phases(m);
  st.focus.method = m.id; st.focus.run = { method: m.id, label, i: 0, startedAt: now, endsAt: now + ph[0].minutes * 60000, set: 1 };
}
/** Advance the clock to `now`: closes finished phases (logging work blocks), returns [{ type: "phase"|"done", phase }] for the UI to announce. */
export function focusTick(st, now = clock.now().getTime()) {
  const ev = []; let r = st.focus.run; let guard = 0;
  while (r && !r.pausedAt && now >= r.endsAt && guard++ < 500) {
    const m = method(r.method); const ph = phases(m); const cur = ph[r.i];
    if (cur.phase === "work") st.focus.log.push({ at: new Date(r.startedAt).toISOString(), minutes: Math.round((r.endsAt - r.startedAt) / 6000) / 10, method: m.id, label: r.label || "" });
    let i = r.i + 1, set = r.set;
    if (i >= ph.length) { if (loops(m)) { i = 0; set++; } else { st.focus.run = null; ev.push({ type: "done", method: m.id }); r = null; break; } }
    const start = r.endsAt; r.i = i; r.set = set; r.startedAt = start; r.endsAt = start + ph[i].minutes * 60000; ev.push({ type: "phase", phase: ph[i].phase, n: ph[i].n });
  }
  if (st.focus.log.length > 2000) st.focus.log.splice(0, st.focus.log.length - 2000);
  return ev;
}
/** Stop now. A work block cut short is logged for the minutes actually worked (a minute or more). Flowtime answers with its break. */
export function focusStop(st, now = clock.now().getTime()) {
  const r = st.focus.run; if (!r) return null; const m = method(r.method); const cur = phases(m)[r.i]; let next = null;
  const until = r.pausedAt || now;
  if (cur.phase === "work") { const mins = Math.round((until - r.startedAt) / 6000) / 10; if (mins >= 1) st.focus.log.push({ at: new Date(r.startedAt).toISOString(), minutes: mins, method: m.id, label: r.label || "" }); if (m.flow && mins >= 1) next = flowBreak(mins); }
  st.focus.run = null; return next;
}
export function focusPause(st, now = clock.now().getTime()) { const r = st.focus.run; if (!r) return; if (r.pausedAt) { const d = now - r.pausedAt; r.startedAt += d; r.endsAt += d; delete r.pausedAt; } else r.pausedAt = now; }
/** What the clock shows now. */
export function focusView(st, now = clock.now().getTime()) {
  const r = st.focus.run; if (!r) return null; const m = method(r.method); const ph = phases(m); const cur = ph[r.i]; const t = r.pausedAt || now;
  const total = r.endsAt - r.startedAt; const left = Math.max(0, r.endsAt - t);
  return { method: m, phase: cur.phase, n: cur.n, of: m.cycles || null, set: r.set, leftMs: left, totalMs: total, frac: total ? 1 - left / total : 1, paused: !!r.pausedAt, label: r.label, next: ph[r.i + 1] || (loops(m) ? ph[0] : null) };
}
/** Minutes of logged focus on a day, and the streak of days with any. */
export function focusStats(st, day = todayFn()) {
  const by = {}; for (const l of st.focus.log) { const d = l.at.slice(0, 10); const local = new Date(l.at); const k = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`; by[k] = (by[k] || 0) + l.minutes; void d; }
  let streak = 0; for (let d = by[day] ? day : addDays(day, -1); by[d]; d = addDays(d, -1)) streak++;
  const week = []; for (let i = 6; i >= 0; i--) { const d = addDays(day, -i); week.push({ date: d, minutes: Math.round(by[d] || 0) }); }
  return { today: Math.round(by[day] || 0), streak, week };
}
