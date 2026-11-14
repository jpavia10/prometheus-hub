import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL("../../" + rel, import.meta.url), "utf8");
const loadWindow = (rel, name) => {
  const w = {};
  new Function("window", "globalThis", read(rel))(w, w);
  return w[name];
};

const FIELDS = { kcal: "kcal", protein_g: "p", fat_g: "f", carb_g: "c", fiber_g: "fib" };
const NAMES_SHA256 = "a2bf98076107493555e5e27b73b13c031285189fe0d0117560569c2d47cf31f4";

test("every audited Apollo food matches the shipped SR values", () => {
  const foods = loadWindow("pillars/apollo/foods.js", "APOLLO_FOODS");
  const audit = JSON.parse(read("pillars/apollo/data/APOLLO-GROK-foods-shipped-audit_20261110-1711.json"));
  assert.equal(foods.length, 900);
  assert.equal(new Set(foods.map((f) => f.n)).size, 900);
  assert.equal(createHash("sha256").update(foods.map((f) => f.n).join("\n")).digest("hex"), NAMES_SHA256);
  assert.equal(audit.rows.length, 300);

  const audited = new Set();
  let withValues = 0;
  for (const row of audit.rows) {
    const food = foods[row.n - 1];
    assert.equal(food.n, row.description, "row " + row.n);
    audited.add(food.n);
    if (row.status === "description_not_in_SR_Legacy_needs_manual_match") {
      assert.equal(row.sr_values, undefined);
      assert.equal(food.src, "unmatched", row.description);
      assert.equal(Object.hasOwn(food, "fdc"), false, row.description);
      continue;
    }
    assert.ok(row.sr_values, row.description);
    withValues++;
    for (const [srcKey, foodKey] of Object.entries(FIELDS)) {
      const v = row.sr_values[srcKey];
      if (v == null) {
        assert.equal(typeof food[foodKey], "number", row.n + " " + foodKey + " stays a shipped number when SR has none");
      } else {
        assert.equal(food[foodKey], v, row.n + " " + row.description + " " + foodKey);
      }
    }
    const fdc = row.correct_fdc_id != null ? row.correct_fdc_id : row.shipped_fdc_id;
    assert.equal(row.correct_fdc_id != null || row.status === "ok_id_matches_description", true, row.status);
    assert.equal(food.fdc, fdc, row.description);
    assert.equal(food.src, undefined, row.description);
  }
  assert.equal(withValues, audit.rows.filter((r) => r.sr_values).length);
  for (const food of foods) {
    if (audited.has(food.n)) continue;
    assert.equal(Object.hasOwn(food, "fdc"), false, food.n);
    assert.equal(Object.hasOwn(food, "src"), false, food.n);
    for (const key of Object.values(FIELDS)) assert.equal(typeof food[key], "number", food.n + " " + key);
  }
});
