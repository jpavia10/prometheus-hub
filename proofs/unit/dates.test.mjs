import test from "node:test"; import assert from "node:assert/strict";
import { clock, addDays, addMonths, diffDays, ruleDates, occurrences, quickAdd, ruleText, startOfWeek, fmtDay, fmtTime } from "../../deck/core/dates.js";

clock.set("2026-11-12T09:00:00");                        // a Thursday
test("day math", () => {
  assert.equal(addDays("2026-12-30", 3), "2027-01-02"); assert.equal(diffDays("2026-11-12", "2026-11-26"), 14);
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28"); assert.equal(addMonths("2024-01-31", 1), "2024-02-29"); assert.equal(addMonths("2026-11-15", 3), "2027-02-15");
  assert.equal(startOfWeek("2026-11-12", 0), "2026-11-08"); assert.equal(startOfWeek("2026-11-12", 1), "2026-11-09");
  assert.equal(addDays("2026-03-08", 1), "2026-03-09");  // across the clock change
  assert.equal(fmtDay("2026-11-12"), "Thu, Nov 12"); assert.equal(fmtDay("2027-01-01", "long"), "Friday, January 1, 2027"); assert.equal(fmtTime("15:05"), "3:05 PM"); assert.equal(fmtTime("00:00"), "12:00 AM");
});
test("rules", () => {
  assert.deepEqual(ruleDates("2026-11-12", { freq: "DAILY", count: 3 }, "2027-01-01"), ["2026-11-12", "2026-11-13", "2026-11-14"]);
  assert.deepEqual(ruleDates("2026-11-12", { freq: "WEEKLY", interval: 2, byday: [{ d: "TU" }, { d: "TH" }], count: 4 }, "2027-01-01"), ["2026-11-12", "2026-11-24", "2026-11-26", "2026-12-08"]);
  assert.deepEqual(ruleDates("2026-01-31", { freq: "MONTHLY", count: 4 }, "2027-01-01"), ["2026-01-31", "2026-03-31", "2026-05-31", "2026-07-31"]);     // months without a 31st are skipped (RFC 5545)
  assert.deepEqual(ruleDates("2026-11-01", { freq: "MONTHLY", bymonthday: [-1], count: 3 }, "2027-06-01"), ["2026-11-30", "2026-12-31", "2027-01-31"]);
  assert.deepEqual(ruleDates("2026-11-10", { freq: "MONTHLY", byday: [{ d: "TU", n: 2 }], count: 3 }, "2027-06-01"), ["2026-11-10", "2026-12-08", "2027-01-12"]);
  assert.deepEqual(ruleDates("2026-11-27", { freq: "MONTHLY", byday: [{ d: "FR", n: -1 }], count: 3 }, "2027-06-01"), ["2026-11-27", "2026-12-25", "2027-01-29"]);
  assert.deepEqual(ruleDates("2024-02-29", { freq: "YEARLY", count: 2 }, "2033-01-01"), ["2024-02-29", "2028-02-29"]);
  assert.deepEqual(ruleDates("2026-11-26", { freq: "YEARLY", bymonth: [11], byday: [{ d: "TH", n: 4 }], count: 3 }, "2030-01-01"), ["2026-11-26", "2027-11-25", "2028-11-23"]);   // Thanksgiving
  assert.deepEqual(ruleDates("2026-11-12", { freq: "WEEKLY", until: "2026-11-26" }, "2027-01-01"), ["2026-11-12", "2026-11-19", "2026-11-26"]);
  assert.deepEqual(ruleDates("2026-11-02", { freq: "MONTHLY", byday: ["MO","TU","WE","TH","FR"].map((d) => ({ d })), bysetpos: [-1], count: 2 }, "2027-06-01"), ["2026-11-30", "2026-12-31"]);  // last weekday
  assert.equal(ruleText({ freq: "WEEKLY", interval: 2, byday: [{ d: "TU" }, { d: "TH" }], count: 10 }), "every 2 weeks on Tue and Thu, 10 times");
});
test("exceptions", () => {
  const ev = { title: "Trash", date: "2026-11-12", time: "07:00", rule: { freq: "WEEKLY" }, exdates: ["2026-11-19"], overrides: { "2026-11-26": { date: "2026-11-27", title: "Trash (holiday week)" }, "2026-12-03": { skipped: true }, "2026-12-10": { time: "08:30" } } };
  const o = occurrences(ev, "2026-11-12", "2026-12-17");
  assert.deepEqual(o.map((x) => [x.date, x.time, x.title]), [["2026-11-12", "07:00", "Trash"], ["2026-11-27", "07:00", "Trash (holiday week)"], ["2026-12-10", "08:30", "Trash"], ["2026-12-17", "07:00", "Trash"]]);
  assert.equal(o[1].moved, true); assert.equal(o[2].edited, true);
  assert.deepEqual(occurrences({ title: "One", date: "2026-11-20" }, "2026-11-01", "2026-11-30").map((x) => x.date), ["2026-11-20"]);
});
test("quick add", () => {
  const q = (t) => quickAdd(t, "2026-11-12");
  assert.deepEqual(q("dentist Tue 3pm"), { title: "dentist", date: "2026-11-17", time: "15:00", rule: null });
  assert.deepEqual(q("pay water bill friday"), { title: "pay water bill", date: "2026-11-13", time: null, rule: null });
  assert.deepEqual(q("tomorrow 9:30 call roofer"), { title: "call roofer", date: "2026-11-13", time: "09:30", rule: null });
  assert.deepEqual(q("smog check dec 5"), { title: "smog check", date: "2026-12-05", time: null, rule: null });
  assert.deepEqual(q("conference sign-up 11/20 8am"), { title: "conference sign-up", date: "2026-11-20", time: "08:00", rule: null });
  assert.deepEqual(q("taxes 4/15/2027"), { title: "taxes", date: "2027-04-15", time: null, rule: null });
  assert.deepEqual(q("oil change in 3 weeks"), { title: "oil change", date: "2026-12-03", time: null, rule: null });
  assert.deepEqual(q("lunch thursday at noon"), { title: "lunch", date: "2026-11-12", time: "12:00", rule: null });
  assert.deepEqual(q("lunch next thursday"), { title: "lunch", date: "2026-11-19", time: null, rule: null });
  assert.deepEqual(q("jan 3 new year cleanup"), { title: "new year cleanup", date: "2027-01-03", time: null, rule: null });
  assert.deepEqual(q("trash every tue 7am"), { title: "trash", date: "2026-11-17", time: "07:00", rule: { freq: "WEEKLY", interval: 1, byday: [{ d: "TU" }] } });
  assert.deepEqual(q("piano daily 7pm"), { title: "piano", date: "2026-11-12", time: "19:00", rule: { freq: "DAILY", interval: 1 } });
  assert.deepEqual(q("filter every 3 months nov 20"), { title: "filter", date: "2026-11-20", time: null, rule: { freq: "MONTHLY", interval: 3 } });
  assert.deepEqual(q("rent on the 1st monthly"), { title: "rent", date: "2026-12-01", time: null, rule: { freq: "MONTHLY", interval: 1 } });
  assert.deepEqual(q("movie tonight"), { title: "movie", date: "2026-11-12", time: "19:00", rule: null });
  assert.equal(q("just a thought"), null); assert.equal(q("3pm"), null); assert.equal(q(""), null);
  assert.deepEqual(q("call mom 15:45 sat"), { title: "call mom", date: "2026-11-14", time: "15:45", rule: null });
  assert.deepEqual(q("Feb 30 thing"), null);
});
