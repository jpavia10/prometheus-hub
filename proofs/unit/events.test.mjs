import test from "node:test";
import assert from "node:assert/strict";

function installMockStorage(initial = {}) {
  const m = new Map(Object.entries(initial).map(([k, v]) => [k, String(v)]));
  globalThis.localStorage = {
    get length() { return m.size; },
    key(i) { return Array.from(m.keys())[i] ?? null; },
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { m.set(String(k), String(v)); },
    removeItem(k) { m.delete(String(k)); },
    clear() { m.clear(); },
  };
}

test("stored bus events gain a {type, pillar, at, v} envelope and a backup round-trips the bytes", async () => {
  const legacy = JSON.stringify([
    { id: "old1", kind: "idea.captured", source: "athenaeum", title: "Old spark", date: "2026-10-01" },
    { type: "scan.done", pillar: "observatory", at: "2026-11-01T00:00:00.000Z", title: "done" },
    { type: "piano.session", pillar: "piano", at: "2026-11-02T00:00:00.000Z", v: 1, id: "ok", ref: "", title: "scales" },
  ]);
  installMockStorage({ "prometheus.bus.events": legacy });
  await import("../../kit/bus.js");
  const list = globalThis.PB.events.list();
  assert.equal(list.length, 3);
  for (const e of list) {
    assert.equal(typeof e.type, "string");
    assert.ok(e.type);
    assert.equal(typeof e.pillar, "string");
    assert.ok(e.pillar);
    assert.equal(typeof e.at, "string");
    assert.ok(e.at);
    assert.equal(e.v, 1);
  }
  assert.equal(list[0].type, "idea.captured");
  assert.equal(list[0].pillar, "athenaeum");
  assert.equal(list[0].at, "2026-10-01T12:00:00.000Z");
  assert.equal(list[0].title, "Old spark");
  assert.equal(list[1].v, 1);
  assert.equal(list[1].type, "scan.done");
  assert.equal(list[2].id, "ok");
  assert.equal(list[2].title, "scales");

  const stored = JSON.parse(globalThis.localStorage.getItem("prometheus.bus.events"));
  assert.equal(stored[2].id, "ok");
  const again = globalThis.PB.events.list();
  assert.equal(again[0].id, list[0].id, "a second read does not mint a new id");

  const published = globalThis.PB.events.publish({ type: "idea.refined", pillar: "athenaeum", ref: "x", title: "next" });
  assert.equal(published.type, "idea.refined");
  assert.equal(published.pillar, "athenaeum");
  assert.equal(published.v, 1);
  assert.match(published.at, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(published.ref, "x");
  assert.throws(() => globalThis.PB.events.publish({ title: "no type" }), /type \+ pillar/);

  const raw = globalThis.localStorage.getItem("prometheus.bus.events");
  const dump = globalThis.PB.dumpAll();
  assert.equal(dump.keys["prometheus.bus.events"], raw);
  globalThis.localStorage.clear();
  globalThis.PB.loadAll(dump);
  assert.equal(globalThis.localStorage.getItem("prometheus.bus.events"), raw);

  const bare = JSON.stringify([{ title: "bare" }]);
  globalThis.localStorage.setItem("prometheus.bus.events", bare);
  const dumped = globalThis.PB.dumpAll();
  assert.equal(dumped.keys["prometheus.bus.events"], bare);
  globalThis.localStorage.removeItem("prometheus.bus.events");
  globalThis.PB.loadAll(dumped);
  assert.equal(globalThis.localStorage.getItem("prometheus.bus.events"), bare, "restore writes the stored string and does not migrate it");
  const migrated = globalThis.PB.events.list();
  assert.equal(migrated[0].type, "event");
  assert.equal(migrated[0].pillar, "hub");
  assert.equal(migrated[0].at, "1970-01-01T00:00:00.000Z");
  assert.equal(migrated[0].v, 1);
  assert.equal(migrated[0].title, "bare");
});
