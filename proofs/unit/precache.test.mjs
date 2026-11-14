import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { checkPrecache, buildPrecache } from "../../tools/registry/precache.mjs";
import { validateRegistry } from "../../tools/registry/validate.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

test("generated precache lists local pillar data and leaves Titan and Midas out", () => {
  const built = buildPrecache(ROOT);
  assert.equal(built.errors.length, 0, built.errors.join("\n"));
  assert.equal(built.local, 25);
  const urls = built.urls.map((u) => (u === "./" ? "./" : "./" + String(u).replace(/^\.\//, "")));
  for (const rel of [
    "./pillars/apollo/foods.js",
    "./pillars/apollo/exercises.js",
    "./pillars/apollo/lookup.js",
    "./pillars/piano/music.js",
    "./pillars/piano/standards.js",
    "./pillars/hearth/data/reference.js",
    "./pillars/privacy/brokers-data.js",
    "./pillars/athenaeum/data/cause-event-consequence.json",
    "./kit/update.js",
    "./sw-precache.js",
  ]) {
    if (rel === "./sw-precache.js") assert.equal(urls.includes(rel), false);
    else assert.equal(urls.includes(rel), true, rel);
  }
  assert.equal(urls.some((u) => u.includes("titan") || u.includes("midas") || u.includes("/fleet")), false);
  assert.equal(urls.filter((u) => u.startsWith("./pillars/") && u.endsWith("/")).length, 25);
  const check = checkPrecache(ROOT);
  assert.equal(check.ok, true, check.errors.join("\n"));
});

test("validator fails when the generated precache is stale", () => {
  const res = validateRegistry({ rootDir: ROOT, precacheText: "self.PRECACHE = [];\n" });
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.includes("sw-precache.js is stale")));
});

test("the shell waits for the Update ready chip instead of skipping the wait", () => {
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  assert.match(sw, /importScripts\("\.\/sw-precache\.js"\)/);
  assert.match(sw, /var CACHE = "prometheus-hub-deck-d21"/);
  assert.match(sw, /SKIP_WAITING/);
  assert.doesNotMatch(sw, /return self\.skipWaiting\(\)/);
  const client = fs.readFileSync(path.join(ROOT, "kit/update.js"), "utf8");
  assert.match(client, /Update ready/);
  assert.match(client, /SKIP_WAITING/);
  for (const rel of ["deck/deck.css", "kit/prometheus.css"]) {
    const css = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const rule = css.match(/button\.update-ready\s*\{[^}]+\}/);
    assert.ok(rule, rel);
    assert.match(rule[0], /var\(--pearl\)/);
    assert.match(rule[0], /var\(--glass\)/);
    assert.match(rule[0], /var\(--cyan\)/);
  }
});
