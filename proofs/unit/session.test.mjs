import test from "node:test";
import assert from "node:assert/strict";
import { nyseSession } from "../../deck/core/session.js";

test("NYSE is open at noon Eastern on a regular Friday and closed outside the session", () => {
  assert.equal(nyseSession(new Date("2026-11-20T17:00:00Z")).label, "NYSE open");
  assert.equal(nyseSession(new Date("2026-11-20T14:00:00Z")).label, "NYSE closed");
  assert.equal(nyseSession(new Date("2026-11-20T21:00:00Z")).label, "NYSE closed");
  assert.equal(nyseSession(new Date("2026-11-21T17:00:00Z")).label, "NYSE closed");
  assert.equal(nyseSession(new Date("2026-11-26T17:00:00Z")).label, "NYSE closed");
  assert.equal(nyseSession(new Date("2026-11-27T16:00:00Z")).label, "NYSE open");
  assert.equal(nyseSession(new Date("2026-11-27T18:30:00Z")).label, "NYSE closed");
});
