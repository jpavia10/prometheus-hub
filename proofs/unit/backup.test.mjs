import test from "node:test";
import assert from "node:assert/strict";
import { backupAll, previewRestore, restoreAll, rollbackRestore, EXCLUDED_EXTERNAL } from "../../deck/core/reach.js";

function installMockStorage(initialLocal = {}, initialSession = {}) {
  const mk = (seed) => {
    const m = new Map(Object.entries(seed).map(([k, v]) => [k, String(v)]));
    return {
      get length() { return m.size; },
      key(i) { return Array.from(m.keys())[i] ?? null; },
      getItem(k) { return m.has(k) ? m.get(k) : null; },
      setItem(k, v) { m.set(String(k), String(v)); },
      removeItem(k) { m.delete(String(k)); },
      clear() { m.clear(); },
      _dump() { return Object.fromEntries(m.entries()); },
    };
  };
  globalThis.localStorage = mk(initialLocal);
  globalThis.sessionStorage = mk(initialSession);
}

test("unified backupAll preserves prometheus.*, prom.deck.*, hearth.* and Argus photo blobs while excluding external sites", () => {
  const samplePhotos = [
    {
      id: "argus-photo-1",
      pillar: "Hearth",
      caption: "Deck East After L-Flashing",
      at: "2026-11-13T18:00:00.000Z",
      dhash: "a1b2c3d4e5f60718",
      grade: 94,
      pairId: "deck-east",
      pairRole: "after",
      width: 1200,
      height: 900,
      blobDataUrl: "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAACwAgCdASoBAAEALsA=",
    },
  ];
  installMockStorage({
    "prometheus.athenaeum.ideas": JSON.stringify([{ id: "idea-1", title: "Solar Tracker" }]),
    "prom.deck.profile": JSON.stringify({ name: "Joseph" }),
    "hearth.deck.stages.v1": JSON.stringify({ stage: 3 }),
    "prometheus.argus.idbSnapshot": JSON.stringify(samplePhotos),
    "unrelated.browser.pref": "keep-me",
  });

  const archive = backupAll();
  assert.equal(archive.format, "prometheus-device");
  assert.equal(archive.schema, "prometheus-backup");
  assert.equal(archive.v, 2);
  assert.equal(archive.idbCount, 1);
  assert.deepEqual(archive.excludedExternal, EXCLUDED_EXTERNAL);
  assert.ok(archive.integrity.startsWith("fnv2:"));
  assert.equal(archive.keys["unrelated.browser.pref"], undefined);
  assert.equal(archive.idb["prometheus-argus/photos"][0].blobDataUrl, samplePhotos[0].blobDataUrl);

  // Wipe prometheus stores (keeping unrelated key) and restore from archive
  installMockStorage({
    "unrelated.browser.pref": "still-here",
    "prometheus.athenaeum.ideas": JSON.stringify([{ id: "old", title: "Before Wipe" }]),
  });

  const preview = previewRestore(archive);
  assert.ok(preview.add.includes("prom.deck.profile"));
  assert.ok(preview.add.includes("hearth.deck.stages.v1"));
  assert.ok(preview.change.includes("prometheus.athenaeum.ideas"));
  assert.equal(preview.idbCount, 1);
  assert.deepEqual(preview.excludedExternal, ["titan", "midas"]);

  const restored = restoreAll(archive);
  assert.equal(restored.rollbackSaved, true);
  assert.equal(globalThis.localStorage.getItem("unrelated.browser.pref"), "still-here");
  assert.equal(JSON.parse(globalThis.localStorage.getItem("prometheus.athenaeum.ideas"))[0].title, "Solar Tracker");
  assert.equal(JSON.parse(globalThis.localStorage.getItem("prometheus.argus.idbSnapshot"))[0].blobDataUrl, samplePhotos[0].blobDataUrl);

  // Verify rollback restores prior state cleanly
  const rolledBack = rollbackRestore();
  assert.ok(rolledBack >= 1);
  assert.equal(JSON.parse(globalThis.localStorage.getItem("prometheus.athenaeum.ideas"))[0].title, "Before Wipe");
});

test("previewRestore rejects malformed backups and tampered integrity checksums", () => {
  installMockStorage({ "prometheus.kairos.events": "[]" });
  assert.throws(() => previewRestore(null), /not a valid/i);
  assert.throws(() => previewRestore({ format: "unknown", keys: {} }), /not a valid/i);

  const valid = backupAll();
  valid.keys["prometheus.kairos.events"] = '[{"id":"tampered"}]';
  assert.throws(() => previewRestore(valid), /integrity check failed/i);
});

test("kit/bus.js PB.dumpAll and PB.loadAll handle extended namespaces and Argus photo blobs", async () => {
  installMockStorage({
    "prometheus.kairos.events": JSON.stringify([{ id: "e1" }]),
    "prom.deck.profile": JSON.stringify({ name: "Joseph" }),
    "hearth.deck.stages.v1": JSON.stringify({ active: true }),
    "prometheus.argus.idbSnapshot": JSON.stringify([{ id: "p1", blobDataUrl: "data:image/png;base64,iVBOR==" }]),
  });
  await import("../../kit/bus.js");
  const dump = globalThis.PB.dumpAll();
  assert.equal(dump.format, "prometheus-device");
  assert.equal(dump.schema, "prometheus-backup");
  assert.deepEqual(dump.excludedExternal, ["titan", "midas"]);
  assert.equal(dump.idb["prometheus-argus/photos"].length, 1);

  globalThis.localStorage.clear();
  const count = globalThis.PB.loadAll(dump);
  assert.equal(count, 4);
  assert.equal(JSON.parse(globalThis.localStorage.getItem("hearth.deck.stages.v1")).active, true);
});
