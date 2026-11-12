import test from "node:test"; import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { parseICS, buildICS, sameEvent, wallToInstant, wallToLocal, parseRule, ruleToICS } from "../../deck/core/ics.js";
import { occurrences, ruleDates } from "../../deck/core/dates.js";

const text = readFileSync(new URL("../fixtures/kairos_gemini_testcal_20261106-1620.ics", import.meta.url), "utf8");
test("the 40-event research calendar: every event reads", () => {
  const { events, zones, problems } = parseICS(text);
  assert.equal(events.length, 40); assert.deepEqual(Object.keys(zones).sort(), ["America/Los_Angeles", "Asia/Tokyo", "Europe/London"]); assert.deepEqual(problems, []);
  const c = (n) => events.find((e) => e.uid.includes(`case-${String(n).padStart(2, "0")}@`));
  assert.deepEqual([c(1).allDay, c(1).date, c(1).end.date, c(1).time], [true, "2026-11-11", "2026-11-12", null]);
  assert.deepEqual([c(9).date, c(9).time, c(9).tz, c(9).rule.until], ["2026-11-02", "09:00", "America/Los_Angeles", "2027-03-31"]);
  assert.equal(c(40).dur, "PT0S"); assert.equal(c(39).end.time, "17:00");
});
test("round trip, written from the model (not echoed): all 40 keep every field", () => {
  const a = parseICS(text);
  const stripped = a.events.map((e) => ({ ...e, rule: e.rule ? { ...e.rule, src: undefined } : e.rule }));       // force the deck to write its own RRULE text
  const out = buildICS(stripped, a.zones);
  assert.ok(out.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75), "every line folds at 75 octets");
  const b = parseICS(out); assert.equal(b.events.length, 40);
  const fails = [];
  for (const e of a.events) { const f = b.events.find((x) => x.uid === e.uid); const d = f ? sameEvent(e, f) : ["missing"]; if (d.length) fails.push(e.uid + ": " + d.join(",")); }
  assert.deepEqual(fails, []);
});
test("the repeat rules expand as the file describes", () => {
  const { events } = parseICS(text); const c = (n) => events.find((e) => e.uid.includes(`case-${String(n).padStart(2, "0")}@`));
  const n = (k) => occurrences(c(k), "2026-01-01", "2029-01-01");
  assert.equal(n(10).length, 24); assert.equal(n(13).length, 30); assert.equal(n(14).length, 8); assert.equal(n(15).length, 12); assert.equal(n(16).length, 6);
  assert.deepEqual(n(16).map((o) => o.date), ["2026-11-30", "2026-12-31", "2027-01-31", "2027-02-28", "2027-03-31", "2027-04-30"]);
  assert.deepEqual(n(17).slice(0, 4).map((o) => o.date), ["2026-11-06", "2026-11-27", "2026-12-04", "2026-12-25"]);
  assert.deepEqual(n(18).map((o) => o.date), ["2026-11-30", "2026-12-31", "2027-01-29", "2027-02-26", "2027-03-31", "2027-04-30"]);
  assert.equal(n(19).length, 14); assert.ok(!n(19).some((o) => o.date === "2026-11-25" || o.date === "2026-12-23"));
  assert.equal(n(20).length, 9); assert.ok(!n(20).some((o) => o.date === "2026-11-11"));
  assert.deepEqual(n(21).map((o) => o.date), ["2026-11-01", "2026-12-01", "2027-02-01", "2027-03-01", "2027-04-01"]);
  assert.equal(n(9).at(-1).date, "2027-03-31"); assert.equal(n(11).at(-1).date, "2027-03-22"); assert.equal(n(12).at(-1).date, "2027-02-28");
  assert.equal(n(15)[1].date, "2026-11-15");
});
test("zones and clock changes", () => {
  const h = (a, b) => (b - a) / 36e5;
  assert.equal(h(wallToInstant("2026-03-08", "01:30", "America/Los_Angeles"), wallToInstant("2026-03-08", "03:30", "America/Los_Angeles")), 1);   // spring forward
  assert.equal(h(wallToInstant("2026-11-01", "01:30", "America/Los_Angeles"), wallToInstant("2026-11-01", "02:30", "America/Los_Angeles")), 2);   // fall back
  assert.equal(new Date(wallToInstant("2026-11-17", "08:00", "Europe/London")).toISOString(), "2026-11-17T08:00:00.000Z");
  assert.equal(new Date(wallToInstant("2027-03-30", "15:00", "Europe/London")).toISOString(), "2027-03-30T14:00:00.000Z");
  assert.equal(new Date(wallToInstant("2026-11-18", "09:00", "Asia/Tokyo")).toISOString(), "2026-11-18T00:00:00.000Z");
  assert.equal(new Date(wallToInstant("2026-11-16", "08:30", "America/Los_Angeles")).toISOString(), "2026-11-16T16:30:00.000Z");
  assert.equal(new Date(wallToInstant("2026-07-04", "12:00", "UTC")).toISOString(), "2026-07-04T12:00:00.000Z");
});
test("text escapes, folding, alarms and unknown properties survive", () => {
  const src = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "UID:x1", "DTSTAMP:20260101T000000Z", "SUMMARY:Lunch\\, with a semicolon\; and a very long title that needs folding because it runs well past seventy-five octets ☕",
    "DTSTART:20261120T120000Z", "DTEND:20261120T130000Z", "DESCRIPTION:Line one\\nLine two \\\\ backslash", "LOCATION:Café \"Quote\"", "CATEGORIES:FOOD,FRIENDS", "X-CUSTOM;X-P=\"a:b\":keep me",
    "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT15M", "DESCRIPTION:Soon", "END:VALARM", "END:VEVENT",
    "BEGIN:VEVENT", "UID:x2", "SUMMARY:Standup", "DTSTART;TZID=America/Los_Angeles:20261102T090000", "RRULE:FREQ=WEEKLY;BYDAY=MO", "END:VEVENT",
    "BEGIN:VEVENT", "UID:x2", "RECURRENCE-ID;TZID=America/Los_Angeles:20261109T090000", "SUMMARY:Standup (moved)", "DTSTART;TZID=America/Los_Angeles:20261110T100000", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = parseICS(src); assert.equal(a.events.length, 2);
  assert.equal(a.events[0].title, "Lunch, with a semicolon; and a very long title that needs folding because it runs well past seventy-five octets ☕");
  assert.equal(a.events[0].notes, "Line one\nLine two \\ backslash"); assert.equal(a.events[0].tz, "UTC"); assert.equal(a.events[0].alarms.length, 1);
  assert.deepEqual(a.events[1].overrides, { "2026-11-09": { date: "2026-11-10", time: "10:00", title: "Standup (moved)" } });
  const b = parseICS(buildICS(a.events, a.zones));
  for (const e of a.events) assert.deepEqual(sameEvent(e, b.events.find((x) => x.uid === e.uid)), []);
  assert.deepEqual(occurrences(a.events[1], "2026-11-01", "2026-11-20").map((o) => [o.date, o.time, o.title]), [["2026-11-02", "09:00", "Standup"], ["2026-11-10", "10:00", "Standup (moved)"], ["2026-11-16", "09:00", "Standup"]]);
  assert.equal(ruleToICS({ freq: "MONTHLY", interval: 2, byday: [{ d: "FR", n: -1 }], count: 5 }), "FREQ=MONTHLY;INTERVAL=2;BYDAY=-1FR;COUNT=5");
  assert.equal(parseRule("FREQ=YEARLY;BYWEEKNO=20", null).unsupported, true);
});
