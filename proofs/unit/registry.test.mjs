import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validateRegistry } from "../../tools/registry/validate.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

function makeSandboxCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "prom-reg-test-"));
  for (const rel of ["pillars.json", "deck/pillars.js", "deck/core/reach.js", "kit/kit.js"]) {
    const dst = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(path.join(ROOT, rel), dst);
  }
  const pillarsDir = path.join(ROOT, "pillars");
  for (const name of fs.readdirSync(pillarsDir)) {
    const srcSub = path.join(pillarsDir, name);
    const dstSub = path.join(dir, "pillars", name);
    fs.mkdirSync(dstSub, { recursive: true });
    for (const f of ["index.html", "pillar.json", "stage.js"]) {
      if (fs.existsSync(path.join(srcSub, f))) fs.copyFileSync(path.join(srcSub, f), path.join(dstSub, f));
    }
    if (name === "athenaeum") {
      fs.mkdirSync(path.join(dstSub, "js"), { recursive: true });
      fs.copyFileSync(path.join(srcSub, "js", "sky.js"), path.join(dstSub, "js", "sky.js"));
    }
  }
  return dir;
}

test("canonical registry passes validation across all 27 destinations and 25 manifests", () => {
  const res = validateRegistry({ rootDir: ROOT });
  assert.equal(res.ok, true, res.errors.join("\n"));
  assert.equal(res.errors.length, 0);
  assert.deepEqual(res.stats, {
    totalRegistryEntries: 29,
    activeDestinations: 27,
    localPillars: 25,
    externalPillars: 2,
    manifests: 25,
    completeManifests: 25,
    capabilities: 26,
  });
});

test("registry validator rejects duplicate IDs and route collisions", () => {
  const tmp = makeSandboxCopy();
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(tmp, "pillars.json"), "utf8"));
    pj.pillars.push({ ...pj.pillars[4] });
    fs.writeFileSync(path.join(tmp, "pillars.json"), JSON.stringify(pj), "utf8");
    const res = validateRegistry({ rootDir: tmp });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes("duplicate pillar id")));
    assert.ok(res.errors.some((e) => e.includes("duplicate route")));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("registry validator rejects active fleet leakage and external boundary violations", () => {
  const tmp = makeSandboxCopy();
  try {
    const deckPath = path.join(tmp, "deck/pillars.js");
    fs.appendFileSync(deckPath, '\n/* test leak: P("fleet", "Fleet", "Fleet", "Test", "https://jpavia10.github.io/fleet-command/", 215, "compass", { ext: true }) */\n');
    const reachPath = path.join(tmp, "deck/core/reach.js");
    const reach = fs.readFileSync(reachPath, "utf8").replace('"pillars/continuity/pillar.json"', '"pillars/continuity/pillar.json", "pillars/titan/pillar.json"');
    fs.writeFileSync(reachPath, reach, "utf8");
    const pjPath = path.join(tmp, "pillars.json");
    const pj = JSON.parse(fs.readFileSync(pjPath, "utf8"));
    pj.pillars.find((p) => p.id === "titan").manifestPath = "pillars/titan/pillar.json";
    fs.writeFileSync(pjPath, JSON.stringify(pj), "utf8");

    const res = validateRegistry({ rootDir: tmp });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes("fleet")));
    assert.ok(res.errors.some((e) => e.includes("titan")));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("registry validator requires records, commands, and events on every local manifest", () => {
  const tmp = makeSandboxCopy();
  try {
    const p = path.join(tmp, "pillars/kairos/pillar.json");
    const man = JSON.parse(fs.readFileSync(p, "utf8"));
    delete man.records;
    delete man.events;
    man.commands = [];
    fs.writeFileSync(p, JSON.stringify(man));
    const res = validateRegistry({ rootDir: tmp });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes("records must be an array")));
    assert.ok(res.errors.some((e) => e.includes("events must be an array")));
    assert.ok(res.errors.some((e) => e.includes("commands must declare")));
    assert.ok(res.stats.completeManifests < 25);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("registry validator detects malformed manifest or missing stage visual", () => {
  const tmp = makeSandboxCopy();
  try {
    fs.writeFileSync(path.join(tmp, "pillars/kairos/pillar.json"), '{"manifest": 2}', "utf8");
    fs.rmSync(path.join(tmp, "pillars/kairos/stage.js"));
    const res = validateRegistry({ rootDir: tmp });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes("manifest version must be 1")));
    assert.ok(res.errors.some((e) => e.includes("missing signature visual")));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
