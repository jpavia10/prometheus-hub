/* Desk operating-picture strip (Sebastian, 2026-11-09): the desk reads the shared deadlines bus.
   Publishes the fixed dates (idempotent) so a fresh browser still shows the real calendar, then
   renders overdue + the next 14 days. Data comes from kit/bus.js; nothing is hard-coded here. */
(function () {
  "use strict";
  if (!window.PB) return;
  if (window.KAIROS_FIXED) for (const f of KAIROS_FIXED)
    PB.deadlines.publish({ title: f.name, date: f.date, source: "kairos-fixed", kind: f.kind, ref: f.date + "|" + f.name });
  const el = document.getElementById("bus-strip"); if (!el) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const overdue = PB.deadlines.overdue();
  const next = PB.deadlines.upcoming(14);
  if (!overdue.length && !next.length) { el.hidden = true; return; }
  const rel = (d) => { const n = Math.round((new Date(d + "T12:00:00") - new Date(PB.today() + "T12:00:00")) / 864e5); return n === 0 ? "today" : n === 1 ? "tomorrow" : n < 0 ? `${-n}d late` : `in ${n}d`; };
  el.hidden = false;
  el.innerHTML = `<div class="bus-head"><span class="bus-k">Next 14 days</span><a class="bus-link" href="pillars/kairos/">Open Time</a></div>`
    + (overdue.length ? `<div class="bus-late">${overdue.length} overdue · oldest: ${esc(overdue[0].title)} (${rel(overdue[0].date)})</div>` : "")
    + `<ul class="bus-list">` + next.slice(0, 5).map((d) => `<li><span class="bus-when">${esc(d.date.slice(5))} · ${rel(d.date)}</span><span class="bus-what">${esc(d.title)}</span><span class="bus-src">${esc(d.source)}</span></li>`).join("") + `</ul>`
    + (next.length > 5 ? `<div class="bus-more">+ ${next.length - 5} more in Time</div>` : "");
})();
