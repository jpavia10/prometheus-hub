/* Time: the calendar. Quick add on top, then Day, Week, Month, Agenda, Risk and the Focus clock.
   Every dated row on the deck shows here, whichever capability owns it; rows Time owns open for editing, the others lead home. */
import { put, h, $, icon, sheet, toast, field, seg, chip, ring, bars, download, pickFile, ask, plural } from "../core/ui.js";
import { clock, today, addDays, addMonths, fmtDay, fmtTime, dow, dowName, monName, startOfWeek, startOfMonth, endOfMonth, quickAdd, ruleText, isDay, diffDays, WEEKDAYS } from "../core/dates.js";
import { rows, days, fixed } from "../core/feeds.js";
import { rowItem, runway } from "./parts.js";
import { KINDS, makeEvent, kindOf, newId, focusStart, focusTick, focusStop, focusPause, focusView, focusStats, method, phases, loops } from "../models/time.js";
import { parseICS, buildICS } from "../core/ics.js";
import { FOCUS } from "../data/focus.js";

const TABS = [["day", "Day"], ["week", "Week"], ["month", "Month"], ["agenda", "Agenda"], ["risk", "Risk"], ["focus", "Focus"]];

export function render(root, route, ctx) {
  const { store } = ctx; const t = today(); const tab = TABS.some((x) => x[0] === route.tab) ? route.tab : "day"; const arg = isDay(route.arg) ? route.arg : t;
  let timer = null;
  const open = (r) => { if (r.cap === "time" && r.ref) eventSheet(ctx, r.ref.id, r.ref.base); else if (r.go && !r.fixed) ctx.go(r.go); else if (r.fixed) fixedSheet(r); };

  const tabs = h("nav.tabs", { "aria-label": "Time views" }, TABS.map(([id, name]) => h("a" + (id === tab ? ".on" : ""), { href: `#/time/${id}${id === "day" || id === "week" || id === "month" ? "/" + arg : ""}`, "aria-current": id === tab ? "page" : null }, name)));
  const body = h("section.time-body.panel");
  const tools = h("div.row.tools", h("button.btn.ghost.small", { type: "button", onclick: () => eventSheet(ctx, null, null, arg) }, icon("plus", 16), "New event"), h("button.btn.ghost.small", { type: "button", onclick: () => filesSheet(ctx) }, icon("file", 16), "Calendar files"));
  put(root, tabs, body, tools);

  const nav = (prev, next, title, extra) => h("header.cal-nav", h("a.icon-btn", { href: prev, "aria-label": "Earlier" }, icon("left")), h("h2", title), h("a.icon-btn", { href: next, "aria-label": "Later" }, icon("right")), extra || null);
  const todayLink = (id) => (arg !== t ? h("a.btn.ghost.small", { href: `#/time/${id}/${t}` }, "Today") : null);

  if (tab === "day") {
    const d = days(arg, 1)[0]; const mine = [...d.rows].sort((x, y) => (x.time ? 1 : 0) - (y.time ? 1 : 0) || (x.time || "").localeCompare(y.time || ""));
    const nowT = clock.now(); const hm = `${String(nowT.getHours()).padStart(2, "0")}:${String(nowT.getMinutes()).padStart(2, "0")}`; const list = mine.map((r) => rowItem(r, { onopen: open, rel: arg === t }));
    if (arg === t && mine.length) { const at = mine.findIndex((r) => r.time && r.time > hm); list.splice(at < 0 ? list.length : at, 0, h("div.now-line", { "aria-label": "Now" }, h("i"), h("span.num", "Now · " + fmtTime(hm)))); }
    put(body, nav(`#/time/day/${addDays(arg, -1)}`, `#/time/day/${addDays(arg, 1)}`, arg === t ? "Today · " + fmtDay(arg) : fmtDay(arg, "long"), todayLink("day")),
      d.why ? h("div.banner.level-" + d.level, icon("alert", 18), h("span", h("b", d.level >= 3 ? "Collision day" : "Heavy day"), h("small", d.why))) : null,
      h("div.items.day-list.timeline", mine.length ? list : h("div.empty", icon("calendar", 30), h("p", arg === t ? "Nothing dated today." : "Nothing dated this day."), h("button.btn.ghost.small", { type: "button", onclick: () => eventSheet(ctx, null, null, arg) }, "Add something here"))));
  } else if (tab === "week") {
    const ws = startOfWeek(arg, store.get("time").prefs.weekStart || 0); const wk = days(ws, 7);
    put(body, nav(`#/time/week/${addDays(ws, -7)}`, `#/time/week/${addDays(ws, 7)}`, `${fmtDay(ws, "md")} – ${fmtDay(addDays(ws, 6), "md")}`, todayLink("week")),
      ...wk.map((d) => h("div.week-day.level-" + d.level + (d.date === t ? ".today" : ""), h("header", h("a", { href: `#/time/day/${d.date}` }, h("b", d.date === t ? "Today" : dowName(d.date)), h("small.num", fmtDay(d.date, "md"))), d.why ? chip(d.why, d.level >= 3 ? "danger" : "warn") : null),
        d.rows.length ? h("div.items", d.rows.map((r) => rowItem(r, { onopen: open }))) : h("p.quiet", "—"))));
  } else if (tab === "month") {
    const ms = startOfMonth(arg), me = endOfMonth(arg); const gs = startOfWeek(ms, store.get("time").prefs.weekStart || 0); const n = Math.ceil((diffDays(gs, me) + 1) / 7) * 7; const grid = days(gs, n);
    const [y, m] = ms.split("-").map(Number); const ws0 = store.get("time").prefs.weekStart || 0;
    put(body, nav(`#/time/month/${addMonths(ms, -1)}`, `#/time/month/${addMonths(ms, 1)}`, `${monName(m)} ${y}`, todayLink("month")),
      h("div.month", { role: "grid", "aria-label": `${monName(m)} ${y}` }, ...[0, 1, 2, 3, 4, 5, 6].map((i) => h("span.month-dow", { role: "columnheader" }, ["S", "M", "T", "W", "T", "F", "S"][(i + ws0) % 7])),
        ...grid.map((d) => { const mineRows = d.rows.filter((r) => !r.fixed && !r.done);
          return h("a.cell.level-" + d.level + (d.date === t ? ".today" : "") + (d.date < ms || d.date > me ? ".out" : "") + (d.holiday ? ".holiday" : ""), { href: `#/time/day/${d.date}`, role: "gridcell", "aria-label": `${fmtDay(d.date, "long")}: ${mineRows.length} items${d.holiday ? ", " + d.holiday : ""}${d.why ? ", " + d.why : ""}` },
            h("span.num", String(Number(d.date.slice(8)))), h("span.day-pips", mineRows.slice(0, 4).map((r) => h("i.tone-" + r.tone)))); })),
      (() => { const flagged = grid.filter((d) => d.level >= 2 && d.date >= ms && d.date <= me); return flagged.length ? h("div.panel-sub", h("h3", "Days to watch this month"), ...flagged.map((d) => h("a.item.tone-deadline", { href: `#/time/day/${d.date}` }, h("span.pip"), h("span.item-main", h("b", fmtDay(d.date, "long")), h("small", d.why))))) : null; })());
  } else if (tab === "agenda") {
    const all = rows(t, addDays(t, 120)); const by = new Map(); for (const r of all) { if (!by.has(r.date)) by.set(r.date, []); by.get(r.date).push(r); }
    put(body, h("header.cal-nav.plain", h("h2", "The next 120 days")), ...[...by.entries()].map(([date, list]) => h("div.agenda-day", h("header", h("a", { href: `#/time/day/${date}` }, h("b", date === t ? "Today" : fmtDay(date, "long")), h("small.num", date === t ? "" : `in ${diffDays(t, date)} ${diffDays(t, date) === 1 ? "day" : "days"}`))), h("div.items", list.map((r) => rowItem(r, { onopen: open }))))),
      by.size ? null : h("div.empty", icon("list", 30), h("p", "Nothing dated in the next 120 days.")));
  } else if (tab === "risk") {
    const ws = startOfWeek(t, 0); const win = days(ws, 42); const flagged = win.filter((d) => d.date >= t && d.level >= 2);
    put(body, h("header.cal-nav.plain", h("h2", "Deadline risk · six weeks")),
      h("p.quiet", "A day glows when it is overloaded, when two hard deadlines land together, or when a deadline falls on a federal holiday (offices and banks closed)."),
      h("div.heat", { role: "grid", "aria-label": "Six weeks of load" }, ...win.map((d) => h("a.heat-cell.level-" + d.level + (d.date === t ? ".today" : "") + (d.date < t ? ".past" : ""), { href: `#/time/day/${d.date}`, role: "gridcell", "aria-label": `${fmtDay(d.date, "long")}: ${["clear", "busy", "heavy", "critical"][d.level]}${d.why ? ", " + d.why : ""}` }, h("span.num", String(Number(d.date.slice(8))))))),
      h("div.legend", ["clear", "busy", "heavy", "critical"].map((n, i) => h("span", h("i.heat-cell.level-" + i), n))),
      flagged.length ? h("div.panel-sub", h("h3", plural(flagged.length, "day") + " to get ahead of"), ...flagged.map((d) => h("div.risk-day.level-" + d.level, h("header", h("a", { href: `#/time/day/${d.date}` }, h("b", fmtDay(d.date, "long")), h("small.num", `in ${diffDays(t, d.date)} days`)), chip(d.why, d.level >= 3 ? "danger" : "warn")), h("div.items", d.rows.filter((r) => !r.done).map((r) => rowItem(r, { onopen: open }))))))
        : h("div.empty", icon("shield", 30), h("p", "No overloaded or colliding days in the next six weeks.")));
  } else if (tab === "focus") {
    const box = h("div.focus"); put(body, box);
    const draw = () => {
      const st = store.get("time"); const evs = focusTick(st); if (evs.length) { store.update("time", () => {}); announce(evs); return; }
      const v = focusView(st); const m = v ? v.method : method(st.focus.method); const stats = focusStats(st, today());
      const mm = (ms) => { const s2 = Math.ceil(ms / 1000); return `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}`; };
      const label = h("input", { type: "text", placeholder: "What is this block for?", maxlength: 80, value: v ? v.label || "" : "", "aria-label": "Label for this block" });
      const keep = document.activeElement && document.activeElement.matches && document.activeElement.matches(".focus input, .focus select");
      if (keep && v) { const c = $(".focus-time", box); if (c) { c.textContent = mm(v.leftMs); const arc = $(".focus-ring .ring-arc", box); return; } }
      box.replaceChildren(
        h("div.focus-ring", ring({ value: v ? v.frac : 0, size: 236, stroke: 10, tone: v && v.phase !== "work" ? "mint" : "ember", label: v ? `${mm(v.leftMs)} left` : "Focus clock",
          center: h("div", h("div.focus-time.num", v ? mm(v.leftMs) : mm(m.work * 60000)), h("small", v ? (v.paused ? "paused" : v.phase === "work" ? `work${v.of ? ` ${v.n} of ${v.of}` : v.set > 1 ? ` · round ${v.set}` : ""}` : v.phase === "long" ? "long break" : "break") : `${fmtMin(m.work)} of work`)) })),
        h("div.row.center", v ? [h("button.btn", { type: "button", onclick: () => { store.update("time", (x) => focusPause(x)); } }, icon(v.paused ? "play" : "pause", 18), v.paused ? "Resume" : "Pause"),
          h("button.btn.ghost", { type: "button", onclick: () => { let brk = null; store.update("time", (x) => { brk = focusStop(x); }); toast(brk ? `Block logged. Flowtime says take ${brk} minutes.` : "Stopped."); } }, icon("stop", 18), "Stop")]
          : [label, h("button.btn", { type: "button", onclick: () => { store.update("time", (x) => focusStart(x, x.focus.method, label.value.trim())); if (navigator.vibrate) navigator.vibrate(30); } }, icon("play", 18), "Start")]),
        h("div.method", h("header", h("b", m.name), chip(m.timed ? "timing from the source" : "deck default block", m.timed ? "" : "warn")),
          h("p.num", phases(m).map((p) => `${fmtMin(p.minutes)} ${p.phase === "work" ? "work" : p.phase === "long" ? "long break" : "break"}`).join(" → ") + (loops(m) ? " → again" : "")),
          m.note ? h("p", m.note) : null, h("blockquote", "“" + m.quote + "”"), h("p.source", h("a", { href: m.url, target: "_blank", rel: "noopener noreferrer" }, m.source, icon("out", 14)))),
        v ? null : h("div.panel-sub", h("h3", "The 20 researched methods"), h("div.methods", FOCUS.map((x) => h("button.method-pick" + (x.id === m.id ? ".on" : ""), { type: "button", "aria-pressed": String(x.id === m.id), onclick: () => store.update("time", (s2) => { s2.focus.method = x.id; }) }, h("b", x.name), h("small.num", `${fmtMin(x.work)}${x.short ? " / " + fmtMin(x.short) : ""}${x.cycles && x.cycles > 1 ? " × " + x.cycles : ""}`))))),
        h("div.panel-sub", h("h3", "Logged"), h("div.stats3", h("div", h("small", "Today"), h("b.num", stats.today + " min")), h("div", h("small", "Streak"), h("b.num", plural(stats.streak, "day"))), h("div", h("small", "Seven days"), bars(stats.week.map((x) => x.minutes), { w: 120, h: 30, tone: "violet", labels: stats.week.map((x) => dowName(x.date, 1)) })))));
    };
    const announce = (evs) => { const last = evs[evs.length - 1]; if (navigator.vibrate) navigator.vibrate([60, 40, 60]); toast(last.type === "done" ? "Set complete. Well done." : last.phase === "work" ? "Break over. Next block." : "Block done. Take the break."); };
    draw(); timer = setInterval(() => { if (!document.hidden) { const st = store.get("time"); if (st.focus.run) { const evs = focusTick(st); if (evs.length) { store.update("time", () => {}); announce(evs); } else { const v = focusView(st); const c = $(".focus-time", box); if (c && v) { const s2 = Math.ceil(v.leftMs / 1000); c.textContent = `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}`; const a = $(".focus-ring .ring-arc", box); if (a) { const len = a.getTotalLength ? a.getTotalLength() : 0; if (len) { a.style.transition = "none"; a.style.strokeDasharray = `${len * v.frac} ${len}`; } } } } } } }, 1000);
  }
  return () => { if (timer) clearInterval(timer); };
}
const fmtMin = (m) => (Math.abs(m - Math.round(m)) < 0.01 ? `${Math.round(m)} min` : `${Math.floor(m)} min ${Math.round((m % 1) * 60)} s`);

function fixedSheet(r) {
  sheet({ title: r.title, body: () => h("div.stack", h("p.lead", `${fmtDay(r.date, "long")}. A fixed reference date (${r.tone === "holiday" ? "federal holiday: offices and banks closed" : r.tone === "tax" ? "federal tax calendar" : "clock change"}).`), r.url ? h("p", h("a", { href: r.url, target: "_blank", rel: "noopener noreferrer" }, "Source", icon("out", 14))) : null) });
}

/* ------------------------------------------------------------------ the event sheet ------------------------------------------------------------------ */
const REPEATS = [["", "Does not repeat"], ["DAILY:1", "Every day"], ["WEEKLY:1", "Every week"], ["WEEKLY:2", "Every 2 weeks"], ["MONTHLY:1", "Every month"], ["MONTHLY:3", "Every 3 months"], ["YEARLY:1", "Every year"]];
export function eventSheet(ctx, id, base, onDate) {
  const { store } = ctx; const st = store.get("time"); const ev = id ? st.events.find((e) => e.id === id) : null;
  if (id && !ev) return;
  if (ev && ev.rule && base) return instanceSheet(ctx, ev, base);
  const title = h("input", { type: "text", value: ev ? ev.title : "", maxlength: 140, required: true, autofocus: !ev }), date = h("input", { type: "date", value: ev ? ev.date : onDate || today(), required: true }), time = h("input", { type: "time", value: ev && ev.time ? ev.time : "" });
  const notes = h("textarea", { rows: 3, maxlength: 2000 }, ev ? ev.notes || "" : ""), place = h("input", { type: "text", value: ev ? ev.place || "" : "", maxlength: 140 });
  let kind = ev ? ev.kind || "event" : "event"; let big = ev ? !!ev.big : false;
  const repKey = ev && ev.rule ? `${ev.rule.freq}:${ev.rule.interval || 1}` : ""; const custom = ev && ev.rule && (!REPEATS.some((r) => r[0] === repKey) || ev.rule.byday && ev.rule.byday.length > 1 || ev.rule.bymonthday || ev.rule.bysetpos || ev.rule.count);
  const rep = h("select", null, ...REPEATS.map(([v, l]) => h("option", { value: v, selected: !custom && v === repKey }, l)), custom ? h("option", { value: "keep", selected: true }, "As imported: " + ruleText(ev.rule)) : null);
  const until = h("input", { type: "date", value: ev && ev.rule && ev.rule.until ? ev.rule.until : "" });
  const save = (close) => {
    if (!title.value.trim() || !isDay(date.value)) { toast("A title and a date are needed.", { tone: "warn" }); return; }
    let rule = null; if (rep.value === "keep") rule = ev.rule; else if (rep.value) { const [freq, n] = rep.value.split(":"); rule = { freq, interval: Number(n) }; if (freq === "WEEKLY") rule.byday = [{ d: WEEKDAYS[dow(date.value)] }]; }
    if (rule && rep.value !== "keep" && until.value) rule.until = until.value; else if (rule && rep.value === "keep" && until.value !== (ev.rule.until || "")) { rule = { ...rule, until: until.value || undefined, src: undefined }; }
    store.update("time", (s2) => {
      const patch = { title: title.value.trim(), date: date.value, time: time.value || null, allDay: !time.value, notes: notes.value.trim(), place: place.value.trim(), kind, big, rule: rule || undefined };
      if (ev) { const e = s2.events.find((x) => x.id === ev.id); const moved = e.date !== patch.date || e.time !== patch.time; Object.assign(e, patch); if (!rule) { delete e.rule; delete e.overrides; delete e.exdates; } if (moved && e.tz) { e.tz = null; } if (moved) { e.end = null; e.dur = null; } }
      else s2.events.push(makeEvent(patch, { kind, big, notes: patch.notes, place: patch.place, src: "form" }));
    });
    close(); toast(ev ? "Saved." : "Added."); if (!ev) ctx.go(`#/time/day/${date.value}`);
  };
  sheet({ title: ev ? "Edit" : "New event", body: (close) => h("form.stack", { onsubmit: (e) => { e.preventDefault(); save(close); } },
    field("Title", title), h("div.grid2", field("Date", date), field("Time (optional)", time)),
    field("Kind", seg(Object.entries(KINDS).map(([k, v]) => [k, v.label]), kind, (v) => { kind = v; }, "Kind"), "Deadlines and school dates count as hard: they light the risk view."),
    h("div.grid2", field("Repeats", rep), field("Until (optional)", until)),
    field("Place", place), field("Notes", notes),
    h("label.check", h("input", { type: "checkbox", checked: big, onchange: (e) => { big = e.target.checked; } }), h("span", "Count down to this on the picture")),
    ev && ev.tz ? h("p.quiet", `Kept in its own zone (${ev.tz}): shown here on this device's clock.`) : null,
    h("div.row.end", ev ? h("button.btn.ghost.danger", { type: "button", onclick: async () => { if (await ask("Delete this event?", ev.rule ? "Every occurrence goes with it." : ev.title, "Delete", "danger")) { const copy = JSON.parse(JSON.stringify(ev)); store.update("time", (s2) => { s2.events = s2.events.filter((x) => x.id !== ev.id); }); if (ev.kairosId) { try { const ke = JSON.parse(localStorage.getItem("prometheus.kairos.events") || "[]").filter((k) => String(k.id) !== String(ev.kairosId)); localStorage.setItem("prometheus.kairos.events", JSON.stringify(ke)); } catch {} } close(); toast("Deleted.", { undo: () => store.update("time", (s2) => s2.events.push(copy)) }); } } }, icon("trash", 16), "Delete") : null,
      ev && !ev.rule ? h("button.btn.ghost", { type: "button", onclick: () => { store.update("time", (s2) => { const e = s2.events.find((x) => x.id === ev.id); e.done = e.done || {}; if (e.done[e.date]) delete e.done[e.date]; else e.done[e.date] = true; }); close(); } }, icon("check", 16), ev.done && ev.done[ev.date] ? "Not done" : "Done") : null,
      h("button.btn", { type: "submit" }, "Save"))) });
}
/* One occurrence of a repeating event: done, skip, move, edit this one, or open the series. */
function instanceSheet(ctx, ev, base) {
  const { store } = ctx; const o = (ev.overrides || {})[base] || {}; const done = !!(ev.done && ev.done[base]);
  const date = h("input", { type: "date", value: o.date || base }), time = h("input", { type: "time", value: o.time !== undefined ? o.time || "" : ev.time || "" }), title = h("input", { type: "text", value: o.title || ev.title, maxlength: 140 });
  const set = (fn, msg, close) => { store.update("time", (s2) => { const e = s2.events.find((x) => x.id === ev.id); e.overrides = e.overrides || {}; fn(e); }); close(); toast(msg); };
  sheet({ title: ev.title, body: (close) => h("div.stack",
    h("p.lead", `${fmtDay(o.date || base, "long")}${ev.time ? " · " + fmtTime(o.time !== undefined && o.time ? o.time : ev.time) : ""} · repeats ${ruleText(ev.rule)}.`),
    h("div.row", h("button.btn", { type: "button", onclick: () => set((e) => { e.done = e.done || {}; if (done) delete e.done[base]; else e.done[base] = true; }, done ? "Marked not done." : "Done.", close) }, icon("check", 16), done ? "Not done" : "Done"),
      h("button.btn.ghost", { type: "button", onclick: () => set((e) => { e.overrides[base] = { skipped: true }; }, "Skipped this one.", close) }, "Skip this one")),
    h("div.panel-sub", h("h3", "Change only this one"), field("Title", title), h("div.grid2", field("Date", date), field("Time", time)),
      h("div.row.end", o.date || o.time !== undefined || o.title ? h("button.btn.ghost", { type: "button", onclick: () => set((e) => { delete e.overrides[base]; }, "Back to the series.", close) }, "Reset") : null,
        h("button.btn", { type: "button", onclick: () => { if (!isDay(date.value)) return; set((e) => { const ov = {}; if (date.value !== base) ov.date = date.value; if ((time.value || null) !== (ev.time || null)) ov.time = time.value || null; if (title.value.trim() && title.value.trim() !== ev.title) ov.title = title.value.trim(); if (Object.keys(ov).length) e.overrides[base] = ov; else delete e.overrides[base]; }, "This one changed.", close); } }, "Save this one"))),
    h("div.row.end", h("button.btn.ghost", { type: "button", onclick: () => { close(); setTimeout(() => eventSheet(ctx, ev.id, null), 240); } }, icon("repeat", 16), "Edit the whole series"))) });
}

/* ------------------------------------------------------------------ calendar files ------------------------------------------------------------------ */
function filesSheet(ctx) {
  const { store } = ctx;
  const importIcs = async (close) => {
    const f = await pickFile(".ics,text/calendar"); if (!f) return; const res = parseICS(f.text);
    if (!res.events.length) { toast(res.problems[0] || "No events in that file.", { tone: "warn" }); return; }
    let added = 0, updated = 0;
    store.update("time", (st) => { Object.assign(st.zones, res.zones);
      for (const e of res.events) { const i = st.events.findIndex((x) => x.uid && x.uid === e.uid);
        if (i >= 0) { st.events[i] = { ...st.events[i], ...e, id: st.events[i].id }; updated++; } else { st.events.push({ id: newId(), kind: "event", big: false, src: "ics", ...e }); added++; } } });
    close(); sheet({ title: "Calendar file read", body: () => h("div.stack", h("p.lead", `${f.name}: ${plural(res.events.length, "event")} read. ${added} added, ${updated} already here and refreshed.`),
      res.problems.length ? h("div.panel-sub", h("h3", "Named problems"), ...res.problems.map((p) => h("p", p))) : h("p.quiet", "No problems: every event kept its fields, zone and repeat rule."), h("div.row.end", h("a.btn", { href: "#/time/agenda", onclick: () => history.back() }, "See the agenda"))) });
  };
  const exportIcs = () => { const st = store.get("time"); if (!st.events.length) { toast("No events of your own to export yet."); return; } download(`prometheus-time-${today()}.ics`, buildICS(st.events, st.zones, clock.now()), "text/calendar"); toast(`${plural(st.events.length, "event")} written as an .ics file.`); };
  sheet({ title: "Calendar files", body: (close) => h("div.stack",
    h("p.lead", "Bring a calendar in, or take yours out, as a standard .ics file (Google Calendar, Apple, Outlook all read and write it)."),
    h("div.row", h("button.btn", { type: "button", onclick: () => importIcs(close) }, icon("upload", 18), "Import .ics"), h("button.btn.ghost", { type: "button", onclick: exportIcs }, icon("download", 18), "Export .ics")),
    h("p.quiet", "Events keep their own time zones, repeat rules, exceptions and reminders. Importing the same file twice refreshes the events instead of doubling them. A static app cannot sync live with a calendar account: files are the honest bridge."),
    h("div.panel-sub", h("h3", "This capability's data"), h("div.row", h("button.btn.ghost.small", { type: "button", onclick: () => download(`prometheus-time-${today()}.json`, store.exportSlice("time")) }, icon("download", 16), "Export Time (.json)"), h("button.btn.ghost.small", { type: "button", onclick: async () => { close(); await ctx.loadSeedFile(); } }, icon("upload", 16), "Import (.json)"))),
    h("p.quiet", `${plural(fixed().length, "fixed date")} (federal holidays, tax deadlines, clock changes, 2026–2028) are built in as reference rows and stay out of your export.`)) });
}
export { runway };
