/* RFC 5545 section 3.8.5.3: every worked recurrence example, with the RFC's own answers (Gemini Neon, KAI-GEM-12, checked by Claude
   against python-dateutil on 2026-11-19: 38 of 39 match; #33 is the RFC's own misprint, 15:00 is past UNTIL 17:00Z = 13:00 EDT).
   The deck's engine works in days, so each example is compared by date. Sub-daily rules (HOURLY, MINUTELY, BYHOUR) must be flagged
   unsupported, never expanded wrong. */
import test from "node:test"; import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { parseRule, ruleToICS } from "../../deck/core/ics.js";
import { ruleDates, ruleText } from "../../deck/core/dates.js";

const cases = JSON.parse(readFileSync(new URL("../fixtures/kairos_gemini_rrule-tests_20261119-0922.json", import.meta.url), "utf8"));
const day = (dt) => dt.split(":").pop().replace(/^(\d{4})(\d\d)(\d\d).*/, "$1-$2-$3");

test("the file holds all 39 RFC examples in order", () => {
  assert.equal(cases.length, 39); assert.deepEqual(cases.map((c) => c.n), Array.from({ length: 39 }, (_, i) => i + 1));
  assert.match(cases[0].description, /^Daily for 10 occurrences/);
});
test("every day-level RFC example lands on the RFC's own dates", () => {
  const fails = [], unsupported = [];
  for (const c of cases) {
    const r = parseRule(c.rrule.replace(/^RRULE:/, ""), "America/New_York");
    if (r.unsupported) { unsupported.push(c.n); continue; }
    const want = [...new Set(c.occurrences.map((o) => o.slice(0, 10)))];
    const got = ruleDates(day(c.dtstart), r, "2100-01-01").slice(0, want.length);
    if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(`#${c.n} ${c.rrule}: want ${want.slice(0, 4)} got ${got.slice(0, 4)}`);
  }
  assert.deepEqual(fails, []);
  assert.deepEqual(unsupported, [33, 34, 35, 36], "only the hourly / minutely / BYHOUR examples are outside a date engine");
});
test("the 20th Monday, day 1/100/200 of the year and ISO week 20 (the three the engine missed before this file)", () => {
  const c = (n) => cases.find((x) => x.n === n);
  for (const n of [23, 24, 25]) {
    const r = parseRule(c(n).rrule.replace(/^RRULE:/, ""), "America/New_York"); assert.ok(!r.unsupported, `#${n} is supported`);
    assert.ok(ruleText(r).length > 0); assert.equal(ruleToICS({ ...r, src: undefined }).includes(n === 23 ? "BYYEARDAY=1,100,200" : n === 25 ? "BYWEEKNO=20" : "BYDAY=20MO"), true);
  }
  assert.deepEqual(ruleDates("1997-05-19", parseRule("FREQ=YEARLY;BYDAY=20MO"), "2000-01-01"), ["1997-05-19", "1998-05-18", "1999-05-17"]);
  assert.deepEqual(ruleDates("1997-05-12", parseRule("FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO"), "2000-01-01"), ["1997-05-12", "1998-05-11", "1999-05-17"]);
});
test("the RFC's second ('or') forms give the same dates (added by Claude: the file kept only the first form)", () => {
  const c = (n) => cases.find((x) => x.n === n); const want = (n) => [...new Set(c(n).occurrences.map((o) => o.slice(0, 10)))];
  assert.deepEqual(ruleDates("1998-01-01", parseRule("FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1", "America/New_York"), "2100-01-01").slice(0, 20), want(5));   // #5 is truncated at 20
  assert.deepEqual(ruleDates("1997-09-02", parseRule("FREQ=WEEKLY;COUNT=10;WKST=SU;BYDAY=TU,TH", "America/New_York"), "2100-01-01"), want(9));
});
