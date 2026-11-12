/* iCalendar (RFC 5545) in and out, for the deck's calendar. Pure: no DOM, no storage.

   parseICS(text)            -> { events, zones: { TZID: [raw lines] }, problems: [..] }
   buildICS(events, zones)   -> text (CRLF, folded at 75 octets), written from the deck's own model
   wallToLocal(date, time, tz) -> { date, time } on this device, for an event kept in its own zone
   sameEvent(a, b)           -> [] or the list of fields that differ (the round-trip proof uses it)

   The model keeps an event in ITS OWN zone (date + time as the wall clock there, tz = an IANA name, "UTC", or null for a floating
   or all-day event), so a file goes out with exactly the times it came in with. Properties the deck has no field for are kept
   verbatim (extra) and written back. */

const pad = (n) => String(n).padStart(2, "0");
const unesc = (s) => String(s).replace(/\\([\\;,nN])/g, (m, c) => (c === "n" || c === "N" ? "\n" : c));
const esc = (s) => String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const WD = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** Split on a separator that is not inside double quotes. */
function splitOut(s, sep) {
  const out = []; let cur = "", q = false;
  for (const ch of s) { if (ch === '"') q = !q; if (ch === sep && !q) { out.push(cur); cur = ""; } else cur += ch; }
  out.push(cur); return out;
}
function parseLine(line) {
  let i = 0, q = false;
  for (; i < line.length; i++) { const ch = line[i]; if (ch === '"') q = !q; else if (ch === ":" && !q) break; }
  if (i >= line.length) return null;
  const head = splitOut(line.slice(0, i), ";"); const params = {};
  for (const p of head.slice(1)) { const k = p.indexOf("="); if (k > 0) params[p.slice(0, k).toUpperCase()] = p.slice(k + 1).replace(/^"(.*)"$/, "$1"); }
  return { name: head[0].toUpperCase(), params, value: line.slice(i + 1) };
}
const dOf = (v) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
const tOf = (v) => (v.length >= 13 ? `${v.slice(9, 11)}:${v.slice(11, 13)}` : null);

/* ---- zones: wall clock in an IANA zone <-> the instant <-> this device ---- */
const fmtCache = new Map();
function partsIn(tz, ms) {
  let f = fmtCache.get(tz);
  if (!f) { f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }); fmtCache.set(tz, f); }
  const o = {}; for (const p of f.formatToParts(new Date(ms))) if (p.type !== "literal") o[p.type] = Number(p.value);
  return o;
}
/** The instant (ms) at which the wall clock in `tz` reads date + time. A time skipped by a clock change resolves forward. */
export function wallToInstant(date, time, tz) {
  const [y, m, d] = date.split("-").map(Number); const [h, mi] = (time || "00:00").split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  if (!tz) return new Date(y, m - 1, d, h, mi).getTime();                        // floating: this device's own clock
  if (tz === "UTC") return guess;
  const off = (ms) => { const p = partsIn(tz, ms); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms; };
  let ms = guess - off(guess); const o2 = off(ms); if (guess - o2 !== ms) ms = guess - o2;
  return ms;
}
/** { date, time } on this device for a wall clock kept in `tz`. */
export function wallToLocal(date, time, tz) {
  if (!time || !tz) return { date, time: time || null };
  const d = new Date(wallToInstant(date, time, tz));
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}
export function validZone(tz) { try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch (e) { return false; } }

/* ---- RRULE ---- */
export function parseRule(value, tz) {
  const r = {}; const known = new Set(["FREQ", "INTERVAL", "COUNT", "UNTIL", "BYDAY", "BYMONTHDAY", "BYMONTH", "BYSETPOS", "WKST"]); let odd = false;
  for (const part of value.split(";")) {
    const k = part.indexOf("="); if (k < 0) continue; const key = part.slice(0, k).toUpperCase(), v = part.slice(k + 1);
    if (!known.has(key)) { odd = true; continue; }
    if (key === "FREQ") r.freq = v.toUpperCase();
    else if (key === "INTERVAL") r.interval = Number(v) || 1;
    else if (key === "COUNT") r.count = Number(v) || undefined;
    else if (key === "WKST") r.wkst = v.toUpperCase();
    else if (key === "UNTIL") {
      if (v.length > 8 && /Z$/i.test(v) && tz && tz !== "UTC") { const p = partsIn(tz, Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), +v.slice(9, 11), +v.slice(11, 13), +v.slice(13, 15) || 0)); r.until = `${p.year}-${pad(p.month)}-${pad(p.day)}`; }
      else r.until = dOf(v);
    } else if (key === "BYDAY") r.byday = v.split(",").map((x) => { const m = /^([+-]?\d{1,2})?([A-Z]{2})$/i.exec(x.trim()); return m ? (m[1] ? { d: m[2].toUpperCase(), n: Number(m[1]) } : { d: m[2].toUpperCase() }) : null; }).filter(Boolean);
    else r[key.toLowerCase()] = v.split(",").map(Number).filter((n) => !isNaN(n));
  }
  if (!["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(r.freq)) odd = true;
  r.src = value; if (odd) r.unsupported = true;
  return r;
}
export function ruleToICS(r) {
  if (r.src) return r.src;                                                       // untouched since import: written back exactly
  const p = ["FREQ=" + r.freq];
  if (r.interval && r.interval !== 1) p.push("INTERVAL=" + r.interval);
  if (r.byday && r.byday.length) p.push("BYDAY=" + r.byday.map((b) => (b.n ? b.n : "") + b.d).join(","));
  if (r.bymonthday && r.bymonthday.length) p.push("BYMONTHDAY=" + r.bymonthday.join(","));
  if (r.bymonth && r.bymonth.length) p.push("BYMONTH=" + r.bymonth.join(","));
  if (r.bysetpos && r.bysetpos.length) p.push("BYSETPOS=" + r.bysetpos.join(","));
  if (r.wkst) p.push("WKST=" + r.wkst);
  if (r.count) p.push("COUNT=" + r.count);
  if (r.until) p.push("UNTIL=" + r.until.replace(/-/g, ""));
  return p.join(";");
}

/* ---- parse ---- */
export function parseICS(text) {
  const problems = []; const zones = {}; const events = []; const overrides = [];
  const lines = String(text).replace(/\r\n?/g, "\n").split("\n"); const un = [];
  for (const l of lines) { if (/^[ \t]/.test(l) && un.length) un[un.length - 1] += l.slice(1); else if (l !== "") un.push(l); }
  if (!un.some((l) => /^BEGIN:VCALENDAR/i.test(l))) problems.push("No VCALENDAR in this file.");
  let i = 0;
  const block = (name) => { const out = []; let depth = 1; for (i++; i < un.length; i++) { if (new RegExp("^BEGIN:" + name + "$", "i").test(un[i])) depth++; if (new RegExp("^END:" + name + "$", "i").test(un[i])) { depth--; if (!depth) break; } out.push(un[i]); } return out; };
  for (; i < un.length; i++) {
    if (/^BEGIN:VTIMEZONE$/i.test(un[i])) { const b = block("VTIMEZONE"); const id = b.map(parseLine).find((p) => p && p.name === "TZID"); if (id) zones[id.value] = b; }
    else if (/^BEGIN:VEVENT$/i.test(un[i])) {
      const b = block("VEVENT"); const ev = readEvent(b, problems);
      if (ev) (ev.recurrenceId ? overrides : events).push(ev);
    }
  }
  for (const o of overrides) {                                                    // a changed instance of a repeating event
    const master = events.find((e) => e.uid === o.uid);
    if (!master) { events.push(o); continue; }
    master.overrides = master.overrides || {};
    master.overrides[o.recurrenceId] = { ...(o.date !== o.recurrenceId ? { date: o.date } : {}), ...(o.time !== master.time ? { time: o.time } : {}), ...(o.title !== master.title ? { title: o.title } : {}), ...(o.notes !== master.notes ? { notes: o.notes } : {}) };
  }
  return { events, zones, problems };
}

function readEvent(lines, problems) {
  const ev = { title: "", notes: "", place: "", allDay: false, date: null, time: null, tz: null, end: null, dur: null, status: "", extra: [], alarms: [] };
  let exd = [], rd = [], j = 0, stamp = null;
  for (; j < lines.length; j++) {
    if (/^BEGIN:VALARM$/i.test(lines[j])) { const a = []; for (j++; j < lines.length && !/^END:VALARM$/i.test(lines[j]); j++) a.push(lines[j]); ev.alarms.push(a); continue; }
    const p = parseLine(lines[j]); if (!p) continue;
    const zone = (pp) => (/Z$/i.test(pp.value) ? "UTC" : pp.params.TZID || null);
    switch (p.name) {
      case "UID": ev.uid = p.value; break;
      case "SUMMARY": ev.title = unesc(p.value); break;
      case "DESCRIPTION": ev.notes = unesc(p.value); break;
      case "LOCATION": ev.place = unesc(p.value); break;
      case "STATUS": ev.status = p.value.toUpperCase(); break;
      case "DTSTAMP": stamp = p.value; break;
      case "DTSTART": ev.date = dOf(p.value); ev.allDay = p.params.VALUE === "DATE" || p.value.length === 8; ev.time = ev.allDay ? null : tOf(p.value); ev.tz = ev.allDay ? null : zone(p); break;
      case "DTEND": ev.end = { date: dOf(p.value), time: p.value.length === 8 ? null : tOf(p.value), tz: p.value.length === 8 ? null : zone(p) }; break;
      case "DURATION": ev.dur = p.value; break;
      case "RRULE": ev._rule = p.value; break;
      case "EXDATE": exd.push(...p.value.split(",").map((v) => dOf(v.trim()))); break;
      case "RDATE": rd.push(...p.value.split(",").map((v) => dOf(v.trim()))); break;
      case "RECURRENCE-ID": ev.recurrenceId = dOf(p.value); break;
      default: ev.extra.push([p.name, p.params, p.value]);
    }
  }
  if (!ev.date) { problems.push(`An event without a start was skipped${ev.title ? ` ("${ev.title}")` : ""}.`); return null; }
  if (ev.tz && ev.tz !== "UTC" && !validZone(ev.tz)) { problems.push(`"${ev.title}": this device does not know the zone ${ev.tz}; kept as a floating time.`); ev.tz = null; }
  if (ev._rule) { ev.rule = parseRule(ev._rule, ev.tz); if (ev.rule.unsupported) problems.push(`"${ev.title}": this repeat rule has parts the deck does not expand (${ev._rule}); it is kept and written back unchanged.`); }
  delete ev._rule;
  if (exd.length) ev.exdates = exd; if (rd.length) ev.rdates = rd;
  if (stamp) ev.stamp = stamp;
  if (!ev.uid) ev.uid = "deck-" + Math.random().toString(36).slice(2, 12) + "@prometheus-deck";
  return ev;
}

/* ---- build ---- */
function fold(line) {
  const enc = new TextEncoder(); if (enc.encode(line).length <= 75) return [line];
  const out = []; let cur = "", n = 0, limit = 75;
  for (const ch of line) { const b = enc.encode(ch).length; if (n + b > limit) { out.push(cur); cur = " "; n = 1; limit = 75; } cur += ch; n += b; }
  out.push(cur); return out;
}
const basic = (d) => d.replace(/-/g, "");
function stampOf(date, time, tz, allDay) {
  if (allDay || !time) return { params: ";VALUE=DATE", value: basic(date) };
  const v = `${basic(date)}T${time.replace(":", "")}00`;
  return tz === "UTC" ? { params: "", value: v + "Z" } : tz ? { params: ";TZID=" + tz, value: v } : { params: "", value: v };
}
const paramText = (params) => Object.entries(params || {}).map(([k, v]) => `;${k}=${/[:;,]/.test(v) ? `"${v}"` : v}`).join("");

export function buildICS(events, zones = {}, now = new Date()) {
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Prometheus//Deck//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  const used = new Set(events.map((e) => e.tz).filter((z) => z && z !== "UTC"));
  for (const z of used) if (zones[z]) out.push("BEGIN:VTIMEZONE", ...zones[z], "END:VTIMEZONE");
  const nowStamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const one = (e, over) => {
    const s = stampOf(e.date, e.time, e.tz, e.allDay || !e.time);
    out.push("BEGIN:VEVENT", "UID:" + e.uid, "DTSTAMP:" + (e.stamp || nowStamp));
    if (over) { const r = stampOf(over.base, e.baseTime, e.tz, e.allDay || !e.baseTime); out.push(`RECURRENCE-ID${r.params}:${r.value}`); }
    out.push("SUMMARY:" + esc(e.title), `DTSTART${s.params}:${s.value}`);
    if (e.dur) out.push("DURATION:" + e.dur);
    else if (e.end) { const x = stampOf(e.end.date, e.end.time, e.end.tz !== undefined ? e.end.tz : e.tz, !e.end.time); out.push(`DTEND${x.params}:${x.value}`); }
    else if (e.allDay || !e.time) { const d = new Date(Date.UTC(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1, +e.date.slice(8, 10) + 1)); out.push("DTEND;VALUE=DATE:" + d.toISOString().slice(0, 10).replace(/-/g, "")); }
    if (e.rule && !over) out.push("RRULE:" + ruleToICS(e.rule));
    if (!over) for (const [key, list] of [["EXDATE", e.exdates], ["RDATE", e.rdates]]) if (list && list.length) {
      const first = stampOf(list[0], e.time, e.tz, e.allDay || !e.time);
      out.push(`${key}${first.params}:` + list.map((d) => stampOf(d, e.time, e.tz, e.allDay || !e.time).value).join(","));
    }
    if (e.notes) out.push("DESCRIPTION:" + esc(e.notes));
    if (e.place) out.push("LOCATION:" + esc(e.place));
    if (e.status) out.push("STATUS:" + e.status);
    for (const [name, params, value] of e.extra || []) out.push(name + paramText(params) + ":" + value);
    for (const a of e.alarms || []) out.push("BEGIN:VALARM", ...a, "END:VALARM");
    out.push("END:VEVENT");
  };
  for (const e of events) {
    const uid = e.uid || `deck-${e.id}@prometheus-deck`; const ex = [...(e.exdates || [])];
    for (const [base, o] of Object.entries(e.overrides || {})) if (o.skipped && !ex.includes(base)) ex.push(base);
    one({ ...e, uid, exdates: ex });
    for (const [base, o] of Object.entries(e.overrides || {})) if (!o.skipped)
      one({ ...e, uid, date: o.date || base, time: o.time !== undefined ? o.time : e.time, baseTime: e.time, title: o.title || e.title, notes: o.notes !== undefined ? o.notes : e.notes, end: null, dur: e.dur, rule: null, extra: [], alarms: [] }, { base });
  }
  out.push("END:VCALENDAR");
  return out.flatMap(fold).join("\r\n") + "\r\n";
}

/* ---- compare (for the round-trip proof and for "already imported?" checks) ---- */
const norm = (v) => JSON.stringify(v == null ? null : v);
export function sameEvent(a, b) {
  const diff = []; const rule = (r) => (r ? { freq: r.freq, interval: r.interval || 1, count: r.count || null, until: r.until || null, byday: r.byday || [], bymonthday: r.bymonthday || [], bymonth: r.bymonth || [], bysetpos: r.bysetpos || [], wkst: r.wkst || null } : null);
  const f = { uid: (e) => e.uid, title: (e) => e.title, notes: (e) => e.notes || "", place: (e) => e.place || "", allDay: (e) => !!e.allDay, start: (e) => [e.date, e.time, e.tz], end: (e) => (e.end ? [e.end.date, e.end.time, e.end.tz] : null),
    duration: (e) => e.dur || null, rule: (e) => rule(e.rule), exdates: (e) => [...(e.exdates || [])].sort(), rdates: (e) => [...(e.rdates || [])].sort(), status: (e) => e.status || "", stamp: (e) => e.stamp || null,
    extra: (e) => (e.extra || []).map((x) => [x[0], x[1], x[2]]), alarms: (e) => e.alarms || [], overrides: (e) => e.overrides || {} };
  for (const [k, get] of Object.entries(f)) { if (k === "stamp" && (!a.stamp || !b.stamp)) continue; if (norm(get(a)) !== norm(get(b))) diff.push(k); }   // a file without DTSTAMP gets one on the way out
  return diff;
}
export { WD as ICS_WEEKDAYS };
