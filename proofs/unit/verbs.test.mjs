import test from "node:test";
import assert from "node:assert/strict";
import { VERB_NAMES, verbsFor, previewVerb, commitVerb } from "../../deck/core/reach.js";

const kairos = {
  id: "kairos",
  name: "Kairos Meridian",
  route: "pillars/kairos/",
  verbs: [
    { verb: "open", label: "Open Kairos" },
    { verb: "add", label: "Add a date", writes: true, handoff: true, store: "prometheus.hub.captures" },
    { verb: "log", label: "Log in Kairos", writes: true, handoff: true, store: "prometheus.hub.captures" },
    { verb: "find", label: "Find in Kairos" },
    { verb: "start", label: "Start Kairos" },
    { verb: "remind", label: "Remind me in Kairos", writes: true, store: "prometheus.bus.deadlines" },
    { verb: "trade", label: "Not a verb" },
  ],
};

test("the palette verbs are the six names, read from the manifest", () => {
  assert.deepEqual([...VERB_NAMES], ["open", "add", "log", "find", "start", "remind"]);
  assert.deepEqual(verbsFor([kairos], "idea: keep the handoff"), []);
  const open = verbsFor([kairos], "open kairos");
  assert.equal(open.length, 1);
  assert.equal(open[0].verb, "open");
  assert.equal(open[0].writes, false);
  assert.equal(open[0].href, "pillars/kairos/");
  const named = verbsFor([kairos, { ...kairos, id: "apollo", name: "Apollo Temple", route: "pillars/apollo/" }], "log apollo sleep");
  assert.equal(named.length, 1);
  assert.equal(named[0].pillar, "apollo");
  assert.equal(named[0].preview.text, "sleep");
});

test("a writing verb previews the record and stores nothing until commit", () => {
  const [row] = verbsFor([kairos], "remind kairos proof reminder", { today: "2026-11-20" });
  assert.equal(row.writes, true);
  assert.match(row.preview.line, /nothing stored yet/i);
  assert.equal(row.preview.record.title, "proof reminder");
  assert.equal(row.preview.record.date, "2026-11-20");
  assert.equal(row.preview.record.source, "kairos");
  assert.equal(row.preview.store, "prometheus.bus.deadlines");
  assert.ok(row.preview.lines[0].startsWith("Nothing is stored yet"));
  const bare = previewVerb(kairos, kairos.verbs[4], "", "2026-11-20");
  assert.equal(bare.writes, false);
  assert.equal(bare.record, null);

  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    key: (i) => [...store.keys()][i] || null,
    get length() { return store.size; },
  };
  assert.equal(store.size, 0);
  const refused = commitVerb({ writes: false, store: "prometheus.bus.deadlines", record: { title: "no" } });
  assert.equal(refused.wrote, false);
  assert.equal(store.size, 0);
  const saved = commitVerb(row.preview);
  assert.equal(saved.wrote, true);
  const rows = JSON.parse(store.get("prometheus.bus.deadlines"));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, "proof reminder");
  assert.equal(rows[0].source, "kairos");
  assert.equal(rows[0].date, "2026-11-20");
  assert.ok(rows[0].id);
  store.set("prometheus.apollo.days", "{}");
  const blocked = commitVerb({ ...row.preview, store: "prometheus.apollo.days" });
  assert.equal(blocked.wrote, false);
  assert.equal(store.get("prometheus.apollo.days"), "{}");
});
