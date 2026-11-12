/* Dates for the deck: local calendar days as "YYYY-MM-DD" strings (no time-zone drift), a clock the proofs can set,
   recurrence expansion (the RFC 5545 subset the calendar uses, with exceptions) and the natural-language quick add.
   Pure: no DOM, no storage. */

const pad = (n) => String(n).padStart(2, "0");
let offset = 0;                                   // proofs pin the clock with ?now=2026-11-20T09:00 (see app.js)

export const clock = {
  now: () => new Date(Date.now() + offset),
  set(iso) { const t = new Date(iso).getTime(); if (!isNaN(t)) offset = t - Date.now(); },
  pinned: () => offset !== 0,
};

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(clock.now());
export const toDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
export const isDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && ymd(toDate(s)) === s;
export const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
export const diffDays = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
export const dow = (s) => toDate(s).getDay();                                     // 0 Sunday .. 6 Saturday
export const daysIn = (y, m) => new Date(y, m, 0).getDate();                      // m 1..12
export const startOfWeek = (s, first = 0) => addDays(s, -((dow(s) - first + 7) % 7));
export const startOfMonth = (s) => s.slice(0, 8) + "01";
export const endOfMonth = (s) => { const [y, m] = s.split("-").map(Number); return `${s.slice(0, 8)}${pad(daysIn(y, m))}`; };
/** Add n months, keeping the day of month (clamped to the month's last day). */
export function addMonths(s, n, keepDay) {
  const [y, m, d] = s.split("-").map(Number); const t = y * 12 + (m - 1) + n; const ny = Math.floor(t / 12), nm = (t % 12 + 12) % 12 + 1;
  return `${ny}-${pad(nm)}-${pad(Math.min(keepDay || d, daysIn(ny, nm)))}`;
}

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const dowName = (s, short) => (short ? DOW[dow(s)].slice(0, 3) : DOW[dow(s)]);
export const monName = (m, short) => (short ? MON[m - 1].slice(0, 3) : MON[m - 1]);
/** "Thu, Nov 12" (short), "Thursday, November 12" (long), with the year when it is not this year. */
export function fmtDay(s, style = "short") {
  const [y, m, d] = s.split("-").map(Number); const yr = y !== clock.now().getFullYear() ? `, ${y}` : "";
  return style === "long" ? `${dowName(s)}, ${monName(m)} ${d}${yr}` : style === "md" ? `${monName(m, 1)} ${d}${yr}` : `${dowName(s, 1)}, ${monName(m, 1)} ${d}${yr}`;
}
/** "3:00 PM" from "15:00". */
export function fmtTime(t) {
  if (!t) return ""; const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}
/** "today", "tomorrow", "in 6 days", "3 days ago". */
export function relDay(s, from = today()) {
  const n = diffDays(from, s);
  return n === 0 ? "today" : n === 1 ? "tomorrow" : n === -1 ? "yesterday" : n > 0 ? `in ${n} days` : `${-n} days ago`;
}

/* ------------------------------------------------------------------ recurrence ------------------------------------------------------------------
   rule: { freq: DAILY|WEEKLY|MONTHLY|YEARLY, interval, count, until "YYYY-MM-DD", byday [{d:"MO", n?}], bymonthday [..], bymonth [..],
           bysetpos [..], wkst "MO" }
   An event may also carry exdates [..], rdates [..] and overrides { "YYYY-MM-DD": { skipped | date | time | title | notes } }
   (a moved instance, a skipped instance, a this-one-only edit). */
const WD = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
export const WEEKDAYS = WD;

function nthWeekdayOfMonth(y, m, wd, n) {                       // n: 1.. or -1.. ; returns day of month or 0
  const len = daysIn(y, m);
  if (n > 0) { const first = new Date(y, m - 1, 1).getDay(); const d = 1 + ((wd - first + 7) % 7) + (n - 1) * 7; return d <= len ? d : 0; }
  const last = new Date(y, m - 1, len).getDay(); const d = len - ((last - wd + 7) % 7) + (n + 1) * 7; return d >= 1 ? d : 0;
}
function monthCandidates(y, m, rule, start) {                   // days of month this rule yields in y-m, ascending
  const len = daysIn(y, m); let days = [];
  if (rule.bymonthday && rule.bymonthday.length) {
    for (const n of rule.bymonthday) { const d = n > 0 ? n : len + 1 + n; if (d >= 1 && d <= len) days.push(d); }
    if (rule.byday && rule.byday.length) { const ok = new Set(rule.byday.map((b) => WD.indexOf(b.d))); days = days.filter((d) => ok.has(new Date(y, m - 1, d).getDay())); }
  } else if (rule.byday && rule.byday.length) {
    for (const b of rule.byday) {
      const wd = WD.indexOf(b.d);
      if (b.n) { const d = nthWeekdayOfMonth(y, m, wd, b.n); if (d) days.push(d); }
      else for (let d = 1; d <= len; d++) if (new Date(y, m - 1, d).getDay() === wd) days.push(d);
    }
  } else { const d = Number(start.slice(8)); if (d <= len) days.push(d); }
  days = [...new Set(days)].sort((a, b) => a - b);
  if (rule.bysetpos && rule.bysetpos.length) days = rule.bysetpos.map((p) => (p > 0 ? days[p - 1] : days[days.length + p])).filter((d) => d != null).sort((a, b) => a - b);
  return days;
}

/** Every date the rule produces from `start` (inclusive) up to `to`, honouring COUNT and UNTIL. Capped at 4000 instances. */
export function ruleDates(start, rule, to) {
  if (!rule || !rule.freq) return start <= to ? [start] : [];
  const out = []; const interval = Math.max(1, rule.interval || 1); const until = rule.until && rule.until < to ? rule.until : to;
  const count = rule.count || Infinity; const push = (d) => { if (d >= start && out.length < count && out.length < 4000) { if (d <= until) out.push(d); return d <= until; } return true; };
  const [sy, sm] = start.split("-").map(Number); let guard = 0;
  if (rule.freq === "DAILY") {
    const okDay = rule.byday && rule.byday.length ? new Set(rule.byday.map((b) => WD.indexOf(b.d))) : null;
    const okMon = rule.bymonth && rule.bymonth.length ? new Set(rule.bymonth) : null;
    for (let d = start; d <= until && out.length < count && guard++ < 40000; d = addDays(d, interval)) {
      if ((okDay && !okDay.has(dow(d))) || (okMon && !okMon.has(Number(d.slice(5, 7))))) continue;
      push(d);
    }
  } else if (rule.freq === "WEEKLY") {
    const wkst = WD.indexOf(rule.wkst || "MO"); const days = (rule.byday && rule.byday.length ? rule.byday.map((b) => WD.indexOf(b.d)) : [dow(start)]);
    const order = days.map((d) => (d - wkst + 7) % 7).sort((a, b) => a - b);
    for (let w = startOfWeek(start, wkst); w <= until && out.length < count && guard++ < 6000; w = addDays(w, 7 * interval))
      for (const o of order) { const d = addDays(w, o); if (d < start) continue; if (!push(d)) break; }
  } else if (rule.freq === "MONTHLY") {
    for (let i = 0; out.length < count && guard++ < 3000; i += interval) {
      const t = sy * 12 + (sm - 1) + i, y = Math.floor(t / 12), m = t % 12 + 1; if (`${y}-${pad(m)}-01` > until) break;
      if (rule.bymonth && rule.bymonth.length && !rule.bymonth.includes(m)) continue;
      for (const d of monthCandidates(y, m, rule, start)) { const s = `${y}-${pad(m)}-${pad(d)}`; if (s < start) continue; if (!push(s)) break; }
    }
  } else if (rule.freq === "YEARLY") {
    const months = rule.bymonth && rule.bymonth.length ? [...rule.bymonth].sort((a, b) => a - b) : [sm];
    for (let y = sy; out.length < count && guard++ < 400; y += interval) {
      if (`${y}-01-01` > until) break;
      for (const m of months) for (const d of monthCandidates(y, m, rule, start)) { const s = `${y}-${pad(m)}-${pad(d)}`; if (s < start) continue; if (!push(s)) break; }
    }
  }
  return out;
}

/** The occurrences of one event between `from` and `to` (inclusive), exceptions applied.
    Each: { date, time, title, notes, base (the rule's own date for this instance), moved, edited } */
export function occurrences(ev, from, to) {
  const ov = ev.overrides || {}; const ex = new Set(ev.exdates || []); const out = [];
  const reach = ev.rule ? to : ev.date;                                           // a moved instance can land in range from outside it
  const bases = ev.rule ? ruleDates(ev.date, ev.rule, addDays(reach, 62)) : [ev.date];
  for (const r of ev.rdates || []) if (!bases.includes(r)) bases.push(r);
  for (const base of bases) {
    if (ex.has(base)) continue; const o = ov[base] || {};
    if (o.skipped) continue;
    const date = o.date || base; if (date < from || date > to) continue;
    out.push({ date, time: o.time !== undefined ? o.time : ev.time || null, title: o.title || ev.title, notes: o.notes !== undefined ? o.notes : ev.notes || "",
      base, moved: !!o.date && o.date !== base, edited: !!(o.title || o.time !== undefined || o.notes !== undefined) });
  }
  return out.sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
}

/** A plain sentence for a rule: "every 2 weeks on Tue and Thu, 10 times". */
export function ruleText(rule) {
  if (!rule || !rule.freq) return "";
  const unit = { DAILY: "day", WEEKLY: "week", MONTHLY: "month", YEARLY: "year" }[rule.freq]; const n = rule.interval || 1;
  let s = n === 1 ? `every ${unit}` : `every ${n} ${unit}s`;
  const names = { SU: "Sun", MO: "Mon", TU: "Tue", WE: "Wed", TH: "Thu", FR: "Fri", SA: "Sat" }; const ord = { 1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth", "-1": "last", "-2": "second-to-last" };
  if (rule.byday && rule.byday.length) s += " on " + rule.byday.map((b) => (b.n ? `the ${ord[b.n] || b.n} ${names[b.d]}` : names[b.d])).join(rule.byday.length > 2 ? ", " : " and ");
  if (rule.bymonthday && rule.bymonthday.length) s += " on day " + rule.bymonthday.map((d) => (d === -1 ? "last" : d)).join(", ");
  if (rule.bymonth && rule.bymonth.length) s += " in " + rule.bymonth.map((m) => monName(m, 1)).join(", ");
  if (rule.count) s += `, ${rule.count} times`;
  if (rule.until) s += `, until ${fmtDay(rule.until, "md")}`;
  return s;
}

/* ------------------------------------------------------------------ quick add ------------------------------------------------------------------
   "dentist Tue 3pm" -> { title: "dentist", date, time: "15:00" }.  Returns null when no date can be read (then nothing is added).
   Reads: today / tonight / tomorrow / weekday names ("next fri") / "nov 20" / "20 nov" / "11/20" / "11/20/2027" / "in 3 days|weeks|months",
          times "3pm" "3:30 pm" "15:00" "noon" "midnight" (with "at"), and repeats "every day|week|month|year", "every tue", "every other fri",
          "weekly", "monthly", "yearly", "daily", "every 2 weeks". */
const DAYWORD = { sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tues: 2, tuesday: 2, wed: 3, weds: 3, wednesday: 3, thu: 4, thur: 4, thurs: 4, thursday: 4, fri: 5, friday: 5, sat: 6, saturday: 6 };
const MONWORD = { jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12 };

export function quickAdd(text, from = today()) {
  let s = " " + String(text || "").replace(/\s+/g, " ").trim() + " "; if (s.trim() === "") return null;
  let date = null, time = null, rule = null; const [fy, fm, fd] = from.split("-").map(Number);
  const take = (re, fn) => { const m = re.exec(s); if (!m) return false; const r = fn(m); if (r === false) return false; s = s.slice(0, m.index) + " " + s.slice(m.index + m[0].length); return true; };
  const nextDow = (wd, strictlyNext) => { let n = (wd - dow(from) + 7) % 7; if (strictlyNext && n === 0) n = 7; return addDays(from, n); };
  const valid = (y, m, d) => m >= 1 && m <= 12 && d >= 1 && d <= daysIn(y, m);
  const soonest = (m, d) => { let y = fy; if (!valid(y, m, d) || `${y}-${pad(m)}-${pad(d)}` < from) y++; return valid(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : null; };

  // repeats first ("every tue" must not also become this Tuesday's date twice)
  take(/ every (other |second |2nd )?(sun|sunday|mon|monday|tue|tues|tuesday|wed|weds|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday)s? /i, (m) => {
    const wd = DAYWORD[m[2].toLowerCase()]; rule = { freq: "WEEKLY", interval: m[1] ? 2 : 1, byday: [{ d: WD[wd] }] }; if (!date) date = nextDow(wd, false); });
  take(/ every (\d{1,2}) (day|week|month|year)s? /i, (m) => { rule = { freq: { day: "DAILY", week: "WEEKLY", month: "MONTHLY", year: "YEARLY" }[m[2].toLowerCase()], interval: Number(m[1]) }; });
  take(/ every (other )?(day|week|month|year|weekday) /i, (m) => {
    const u = m[2].toLowerCase();
    rule = u === "weekday" ? { freq: "WEEKLY", interval: 1, byday: ["MO", "TU", "WE", "TH", "FR"].map((d) => ({ d })) } : { freq: { day: "DAILY", week: "WEEKLY", month: "MONTHLY", year: "YEARLY" }[u], interval: m[1] ? 2 : 1 }; });
  take(/ (daily|weekly|biweekly|fortnightly|monthly|yearly|annually) /i, (m) => {
    const w = m[1].toLowerCase(); rule = { freq: { daily: "DAILY", weekly: "WEEKLY", biweekly: "WEEKLY", fortnightly: "WEEKLY", monthly: "MONTHLY", yearly: "YEARLY", annually: "YEARLY" }[w], interval: /bi|fort/.test(w) ? 2 : 1 }; });

  // times
  take(/ (?:at |@ ?)?(noon|midnight) /i, (m) => { time = m[1].toLowerCase() === "noon" ? "12:00" : "00:00"; });
  take(/ (?:at |@ ?)?(\d{1,2})(?::(\d{2}))? ?(am|pm|a\.m\.|p\.m\.|a|p) /i, (m) => {
    let h = Number(m[1]); const mi = Number(m[2] || 0); if (h < 1 || h > 12 || mi > 59) return false;
    const p = m[3].toLowerCase()[0] === "p"; h = (h % 12) + (p ? 12 : 0); time = `${pad(h)}:${pad(mi)}`; });
  if (!time) take(/ (?:at |@ ?)(\d{1,2}):(\d{2}) /i, (m) => { const h = Number(m[1]), mi = Number(m[2]); if (h > 23 || mi > 59) return false; time = `${pad(h)}:${pad(mi)}`; });
  if (!time) take(/ (\d{1,2}):(\d{2}) /, (m) => { const h = Number(m[1]), mi = Number(m[2]); if (h > 23 || mi > 59) return false; time = `${pad(h)}:${pad(mi)}`; });

  // dates
  take(/ (today|tonight|tomorrow|tmrw) /i, (m) => { const w = m[1].toLowerCase(); date = w.startsWith("to") && w !== "tomorrow" ? from : addDays(from, 1); if (w === "tonight" && !time) time = "19:00"; });
  if (!date) take(/ in (\d{1,3}) (day|week|month)s? /i, (m) => { const n = Number(m[1]); const u = m[2].toLowerCase(); date = u === "day" ? addDays(from, n) : u === "week" ? addDays(from, 7 * n) : addMonths(from, n); });
  if (!date) take(/ (?:on )?(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\.? (\d{1,2})(?:st|nd|rd|th)?(?:,? (\d{4}))? /i, (m) => {
    const mo = MONWORD[m[1].toLowerCase()], d = Number(m[2]); const y = m[3] ? Number(m[3]) : null;
    const r = y ? (valid(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null) : soonest(mo, d); if (!r) return false; date = r; });
  if (!date) take(/ (?:on )?(\d{1,2})(?:st|nd|rd|th)? (?:of )?(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\.?(?:,? (\d{4}))? /i, (m) => {
    const mo = MONWORD[m[2].toLowerCase()], d = Number(m[1]); const y = m[3] ? Number(m[3]) : null;
    const r = y ? (valid(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null) : soonest(mo, d); if (!r) return false; date = r; });
  if (!date) take(/ (?:on )?(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))? /, (m) => {
    const mo = Number(m[1]), d = Number(m[2]); let y = m[3] ? Number(m[3]) : null; if (y != null && y < 100) y += 2000;
    const r = y ? (valid(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null) : soonest(mo, d); if (!r) return false; date = r; });
  if (!date) take(/ (?:on |this )?(next )?(sun|sunday|mon|monday|tue|tues|tuesday|wed|weds|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday) /i, (m) => { date = nextDow(DAYWORD[m[2].toLowerCase()], !!m[1]); });
  if (!date) take(/ (?:on )?the (\d{1,2})(?:st|nd|rd|th) /i, (m) => { const d = Number(m[1]); let r = valid(fy, fm, d) && d >= fd ? `${fy}-${pad(fm)}-${pad(d)}` : null; if (!r) { const n = addMonths(`${fy}-${pad(fm)}-01`, 1); const [y2, m2] = n.split("-").map(Number); r = valid(y2, m2, d) ? `${y2}-${pad(m2)}-${pad(d)}` : null; } if (!r) return false; date = r; });
  if (!date && rule) date = from;                                                 // "trash every week" starts today
  if (!date) return null;
  if (rule && rule.freq === "WEEKLY" && rule.byday && rule.byday.length === 1 && WD[dow(date)] !== rule.byday[0].d) date = nextDow(WD.indexOf(rule.byday[0].d), false);
  if (rule && rule.byday && rule.byday.length > 1) while (!rule.byday.some((b) => b.d === WD[dow(date)])) date = addDays(date, 1);
  const title = s.replace(/\s+/g, " ").trim().replace(/^(?:on|at|by|due|-|–|:)\s+/i, "").replace(/\s+(?:on|at|by|due|-|–)$/i, "").trim();
  if (!title) return null;
  return { title, date, time, rule };
}
