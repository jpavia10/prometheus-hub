/* Kairos calendar export + recurring events (Sebastian, 2026-11-10).
   Pure core (window.KICS): RFC 5545 text for the pillar's events, and recurrence expansion.
   Format follows the researched test calendar (kairos testcal): VCALENDAR/VEVENT, all-day
   DTSTART;VALUE=DATE, CRLF line endings, escaped text. Recurring events expand into dated
   occurrences stored like any other event (the pillar's model is dated entries, so expansion
   keeps the bus and countdowns truthful). */
(function () {
  "use strict";
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const basic = (d) => d.replace(/-/g, "");
  function buildICS(events, stamp) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Prometheus Hub//Kairos//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    for (const e of events) {
      lines.push("BEGIN:VEVENT",
        "UID:kairos-" + e.id + "@prometheus-hub",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + basic(e.date),
        "SUMMARY:" + esc(e.title),
        ...(e.note ? ["DESCRIPTION:" + esc(e.note)] : []),
        "END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    return lines.join("\r\n") + "\r\n";
  }
  function expandRecurring(start, freq, count) {
    const out = []; const d0 = new Date(start + "T12:00:00");
    for (let i = 0; i < count; i++) {
      const d = new Date(d0);
      if (freq === "weekly") d.setDate(d.getDate() + 7 * i);
      else if (freq === "monthly") { d.setMonth(d.getMonth() + i); if (d.getDate() !== d0.getDate()) d.setDate(0); }
      else if (freq === "yearly") { d.setFullYear(d.getFullYear() + i); }
      out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    }
    return out;
  }
  const K = { buildICS, expandRecurring, esc };
  if (typeof window !== "undefined") window.KICS = K;
  if (typeof globalThis !== "undefined") globalThis.KICS = K;
  if (typeof document === "undefined") return;
  const bar = document.createElement("div");
  bar.className = "glass"; bar.style.marginTop = "14px";
  bar.innerHTML = `<h2>Take Time with you — calendar export & recurring events</h2>
    <div class="row-actions"><button class="btn small" id="ki-export" type="button">Download .ics of my events</button></div>
    <p class="note">An RFC 5545 file any calendar app imports (Google Calendar: Settings → Import). Fixed dates (federal, tax, clock changes) are reference data — the export carries YOUR events.</p>
    <form class="form" id="ki-form">
      <label class="f wide">Recurring event<input name="title" required maxlength="90"></label>
      <label class="f">First date<input name="start" type="date" required></label>
      <label class="f">Repeats<select name="freq"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
      <label class="f">Occurrences<input name="count" type="number" min="2" max="52" value="8" required></label>
      <button class="btn" type="submit">Add occurrences</button></form>
    <p class="note">Recurring events expand into dated occurrences, so countdowns, the bus, and exports all stay exact.</p>`;
  const main = document.querySelector("main#app") || document.querySelector("main") || document.body;
  main.after(bar);
  document.getElementById("ki-export").onclick = () => {
    let events = []; try { events = JSON.parse(localStorage.getItem("prometheus.kairos.events") || "[]"); } catch (_) { /* empty */ }
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "") + "";
    const blob = new Blob([KICS.buildICS(events, stamp.replace("Z", "Z"))], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "kairos-events.ics";
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  };
  document.getElementById("ki-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    let events = []; try { events = JSON.parse(localStorage.getItem("prometheus.kairos.events") || "[]"); } catch (_) { /* empty */ }
    const dates = KICS.expandRecurring(f.start.value, f.freq.value, Math.min(52, Math.max(2, Number(f.count.value) || 8)));
    for (const date of dates) {
      const ev = { id: "k" + Math.random().toString(36).slice(2, 9), title: f.title.value.trim(), date, note: "" };
      events.push(ev);
      if (window.PB) PB.deadlines.publish({ title: ev.title, date, source: "kairos", kind: "event", ref: ev.id });
    }
    localStorage.setItem("prometheus.kairos.events", JSON.stringify(events));
    alert(dates.length + " occurrences added — reload Time to see them in the list.");
    location.reload();
  });
})();
