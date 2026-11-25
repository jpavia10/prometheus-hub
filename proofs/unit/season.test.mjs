// The town's season and its late-night windows (deck/core/season.js, 2026-11-25).
import test from "node:test";
import assert from "node:assert/strict";
import { seasonOf, lateOf } from "../../deck/core/season.js";

const at = (s) => new Date(s + "T12:00");

test("the calendar picks one season painting at a time, never two", () => {
  assert.deepEqual(seasonOf(at("2026-11-25")), { kind: "autumn", amt: 1, name: "Autumn" });
  assert.equal(seasonOf(at("2026-12-25")).kind, "winter");
  assert.equal(seasonOf(at("2026-12-25")).amt, 1);
  assert.equal(seasonOf(at("2027-04-20")).kind, null);
  assert.equal(seasonOf(at("2027-04-20")).name, "Spring");
  assert.equal(seasonOf(at("2027-07-04")).name, "Summer");
  for (let d = new Date("2026-01-01T12:00"); d.getFullYear() === 2026; d.setDate(d.getDate() + 1)) {
    const s = seasonOf(d); assert.ok(s.amt >= 0 && s.amt <= 1, d.toISOString());
  }
});

test("real snow at the home place makes it winter in any month", () => {
  const s = seasonOf(at("2027-07-01"), 34.8, { snowDepth: 12 });
  assert.equal(s.kind, "winter"); assert.equal(s.real, true); assert.equal(s.name, "Snow on the ground");
  assert.equal(seasonOf(at("2027-07-01"), 34.8, { snowDepth: 0 }).kind, null);
  assert.ok(seasonOf(at("2026-10-20"), 34.8, null, 0.8).kind === "winter");
});

test("south of the equator the seasons turn half a year", () => {
  assert.equal(seasonOf(at("2027-07-04"), -33.9).kind, "winter");
  assert.equal(seasonOf(at("2026-12-25"), -33.9).kind, null);
});

test("a pin shows any season", () => {
  assert.equal(seasonOf(at("2027-07-04"), 34.8, null, 0, "winter").kind, "winter");
  assert.equal(seasonOf(at("2026-12-25"), 34.8, null, 0, "summer").kind, null);
});

test("windows go dark late at night and come back by morning", () => {
  const h = (x) => lateOf(new Date(`2026-11-25T${x}`));
  assert.equal(h("20:00"), 0); assert.equal(h("03:00"), 1); assert.equal(h("08:00"), 0);
  assert.ok(h("23:30") > 0 && h("23:30") < 1);
});
