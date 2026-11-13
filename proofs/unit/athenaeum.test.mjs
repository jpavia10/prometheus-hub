import test from "node:test"; import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { terms, relate, skeleton, clusters, layout, span, tOf, dateAt, provenance, refinementBy, mentions, parseYear, arm, stats } from "../../pillars/athenaeum/js/model.js";

const load = (file, name) => { const w = {}; new Function("window", "globalThis", readFileSync(new URL("../../pillars/athenaeum/" + file, import.meta.url), "utf8"))(w, w); return w[name]; };
const IDEAS = load("ideas-seed.js", "ATHENAEUM_IDEAS"), MERGE = load("vault.js", "ATH_MERGE"), VAULT = load("vault.js", "VAULT");
const PACK = JSON.parse(readFileSync(new URL("../../pillars/athenaeum/data/cause-event-consequence.json", import.meta.url), "utf8"));
const title = (re) => IDEAS.findIndex((i) => re.test(i.title));

test("relations come from the ideas' own tags and words, with the reason kept", () => {
  const E = relate(IDEAS), a = title(/^Multi-AI collaboration/), b = title(/^Independent blind audits/);
  const e = E.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  assert.ok(e, "the two verification ideas are related");
  assert.ok(e.tags.length || e.terms.length || e.linked, "their tie keeps its reason");
  for (const x of E) { assert.ok(x.w > 0 && x.w <= 1); assert.ok(x.tags.length || x.terms.length || x.linked, "every tie has a reason"); }
  assert.deepEqual(terms("The audits' work is about systems, and time."), ["audit"], "plural, stop words and short words are dropped");
});

test("a link made by hand always counts and is always drawn", () => {
  const a = title(/^Environmental impacts/), b = title(/^History as a way/), mine = IDEAS.map((i, k) => (k === a ? { ...i, links: [IDEAS[b].id] } : i));
  const E = relate(mine), e = E.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  assert.ok(e && e.linked && e.w >= 0.6); assert.ok(skeleton(mine.length, E).includes(e));
});

test("constellations: every idea in exactly one group, named by a tag its members share", () => {
  const E = relate(IDEAS), C = clusters(IDEAS, E);
  assert.ok(C.list.length > 1, "the set forms more than one constellation");
  assert.equal(C.list.reduce((s, c) => s + c.members.length, 0), IDEAS.length); assert.equal(new Set(C.list.flatMap((c) => c.members)).size, IDEAS.length);
  for (const c of C.list) assert.ok(c.members.some((i) => (IDEAS[i].tags || []).includes(c.tag)), c.name);
});

test("the sky is the same every time, fits radius 1, keeps ideas apart, and a new idea barely moves the others", () => {
  const E = skeleton(IDEAS.length, relate(IDEAS)), P = layout(IDEAS, E), P2 = layout(IDEAS, E);
  assert.deepEqual(P, P2); let far = 0, near = 9;
  for (let a = 0; a < P.length; a++) { far = Math.max(far, Math.hypot(...P[a])); for (let b = a + 1; b < P.length; b++) near = Math.min(near, Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1], P[a][2] - P[b][2])); }
  assert.ok(Math.abs(far - 1) < 1e-6, "radius " + far); assert.ok(near > 0.1, "closest pair " + near);
  const more = [...IDEAS, { id: "new1", title: "A note on tides", body: "Unrelated to the rest.", tags: ["ocean"], created: "2026-11-13", chain: [] }];
  const Q = layout(more, skeleton(more.length, relate(more))); let moved = 0; for (let i = 0; i < P.length; i++) moved = Math.max(moved, Math.hypot(P[i][0] - Q[i][0], P[i][1] - Q[i][1], P[i][2] - Q[i][2]));
  assert.ok(moved < 0.6, "largest move when one idea is added: " + moved.toFixed(2));
  assert.deepEqual(layout([], []), []); assert.deepEqual(layout([IDEAS[0]], []), [[0, 0, 0]]);
});

test("time: the slider runs from the first spark to today, and dates map both ways", () => {
  const sp = span(IDEAS, "2026-11-13"); const first = IDEAS.map((i) => i.created).sort()[0];
  assert.equal(sp.days, Math.round((new Date("2026-11-13") - new Date(first)) / 864e5) + 1, "the span runs from the first spark in the set");
  assert.equal(tOf(sp, "2026-11-13"), 1); assert.ok(tOf(sp, first) >= 0 && tOf(sp, first) < 0.01, "the first spark sits at the start");
  assert.equal(dateAt(sp, tOf(sp, "2026-10-23")), "2026-10-23"); assert.equal(span([], "2026-11-13").days, 2);
});

test("provenance: an imported idea says so, a typed one is the owner's, and so are refinements marked as theirs", () => {
  assert.equal(provenance(IDEAS[0]).kind, "imported"); assert.match(provenance(IDEAS[0]).label, /ChatGPT extraction/);
  assert.equal(provenance({ id: "abc", title: "x" }).kind, "typed"); assert.equal(provenance({ id: "imp9", title: "x", origin: "typed" }).kind, "typed");
  assert.equal(refinementBy(IDEAS[0], IDEAS[0].chain[0]), "import"); assert.equal(refinementBy(IDEAS[0], { date: "2026-11-13", text: "t", by: "you" }), "you");
  assert.deepEqual(mentions(IDEAS[0], [{ id: "titan", name: "Titan Reliquary" }, { id: "kairos", name: "Kairos Meridian" }, { id: "athenaeum", name: "Athenaeum" }]).map((p) => p.id), ["titan"]);
});

test("the chronicle: 40 entries, every date read, oldest first along one arm", () => {
  assert.deepEqual(["c. 1200–1150 BCE", "612 BCE", "8th–9th centuries CE", "1633–1639; ended after 1853", "235–284 CE", "1989 CE"].map(parseYear), [-1200, -612, 750, 1633, 235, 1989]);
  const A = arm(PACK.entries); assert.equal(A.length, 40); assert.ok(A.every((e) => Number.isFinite(e.year) && e.pos.every(Number.isFinite)));
  assert.ok(A.every((e, i) => !i || e.year >= A[i - 1].year)); assert.equal(A[0].year, -1200); assert.equal(A[39].year, 1989);
  assert.ok(Math.hypot(A[0].pos[0], A[0].pos[2]) > Math.hypot(A[39].pos[0], A[39].pos[2]), "the arm winds inward toward the present");
  for (const e of PACK.entries) for (const k of ["id", "name", "date", "cause", "event", "consequence", "source"]) assert.ok(e[k], e.id + " " + k);
});

test("import merges and never replaces; a backup of an empty vault restores every record exactly", () => {
  const back = MERGE.mergeIdeas([], IDEAS); assert.equal(back.added, IDEAS.length); assert.equal(JSON.stringify(back.all), JSON.stringify(IDEAS));
  const again = MERGE.mergeIdeas(back.all, IDEAS); assert.equal(again.added, 0); assert.equal(again.updated, 0); assert.equal(JSON.stringify(again.all), JSON.stringify(IDEAS));
  const mine = [{ id: "a1", title: "One", body: "kept", tags: [], created: "2026-01-01", chain: [{ date: "2026-01-02", text: "first" }], lastResurfaced: null, archived: false }];
  const r = MERGE.mergeIdeas(mine, [{ id: "zz", title: " one ", body: "REPLACED?", chain: [{ date: "2026-01-02", text: "first" }, { date: "2026-02-01", text: "second" }] }, { id: "a1", title: "Two", body: "new", chain: [], archived: true, origin: "typed", links: ["a1"] }]);
  assert.equal(r.added, 1); assert.equal(r.updated, 1); assert.equal(r.all[0].body, "kept", "the stored words are not overwritten"); assert.deepEqual(r.all[0].chain.map((c) => c.text), ["first", "second"]);
  assert.notEqual(r.all[1].id, "a1", "an id already in use is not reused"); assert.equal(r.all[1].archived, true); assert.equal(r.all[1].origin, "typed"); assert.deepEqual(r.all[1].links, ["a1"]);
  assert.equal(mine[0].chain.length, 1, "the input list is left alone");
});

test("resurfacing and search keep working as before", () => {
  const list = [{ id: "1", title: "Old", created: "2026-01-01", chain: [], lastResurfaced: null }, { id: "2", title: "Seen", created: "2026-01-02", chain: [], lastResurfaced: "2026-11-01" }, { id: "3", title: "Gone", created: "2026-01-03", chain: [], archived: true, lastResurfaced: null }];
  assert.deepEqual(VAULT.pickResurface(list, "2026-11-13").map((i) => i.id), ["1"]); assert.deepEqual(VAULT.pickResurface(list, "2026-12-05").map((i) => i.id), ["1", "2"]);
  const water = VAULT.search(IDEAS, "water"); assert.ok(water.some((i) => i.title === "Environmental impacts should be compared proportionally"), "the water idea is found");
  for (const i of water) assert.ok(JSON.stringify([i.title, i.body, i.tags, i.chain]).toLowerCase().includes("water"), "every result mentions water: " + i.title);
  assert.deepEqual(stats(list, [{}, {}], [{}]), { ideas: 2, refinements: 0, archived: 1, shelf: 2, chronicle: 1 });
});
