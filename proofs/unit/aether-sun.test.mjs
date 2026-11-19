/* Aether's offline sun clock (pillars/aether/sun.js, Gemini AET-GEM-07) against the US Naval Observatory: 12 dates x 5 events at Frazier Park,
   fetched by Claude on 2026-11-19 (proofs/fixtures/aether_usno_vectors_20261119.json). The task's bar is 2 minutes. */
import test from "node:test"; import assert from "node:assert/strict"; import { readFileSync } from "node:fs"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const SUN = require("../../pillars/aether/sun.js");
const { vectors } = JSON.parse(readFileSync(new URL("../fixtures/aether_usno_vectors_20261119.json", import.meta.url), "utf8"));
const m = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
test("12 USNO dates, every event within 2 minutes", () => {
  assert.equal(vectors.length, 12); const off = [];
  for (const v of vectors) { const t = SUN.times(v.date, 34.8228, -118.9445, v.tz); for (const [k, u] of Object.entries(v.usno)) { const d = m(t[k]) - m(u); if (Math.abs(d) > 2) off.push(`${v.date} ${k}: USNO ${u}, module ${t[k]}`); } }
  assert.deepEqual(off, []);
});
test("polar day and night give null, not a wrong time", () => {
  const summer = SUN.times("2027-06-21", 78.22, 15.65, 2), winter = SUN.times("2027-12-21", 78.22, 15.65, 1);    // Longyearbyen
  assert.equal(summer.sunset, null); assert.equal(winter.sunrise, null); assert.ok(summer.noon && winter.noon);
});
