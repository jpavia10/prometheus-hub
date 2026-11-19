import test from "node:test";
import assert from "node:assert/strict";
import { brief, loadBrief, spoken, dayStreak, RULES } from "../../deck/models/brief.js";

const TODAY = "2026-11-20";
const NOW = "2026-11-20T17:00:00.000Z";

function base(more = {}) {
  return {
    today: TODAY,
    now: NOW,
    lastSeen: "",
    deadlines: [],
    events: [],
    meta: {},
    away: null,
    time: { events: [], focus: { log: [] } },
    money: { plan: null, events: [], bills: [] },
    fixed: [],
    sessions: [],
    days: {},
    ...more,
  };
}

const rules = (lines) => lines.map((l) => l.rule);

test("the five brief rules are the ones the model ranks", () => {
  assert.deepEqual(RULES, ["overdue", "collision", "away", "since", "streak"]);
});

test("a clean device, reference dates, and a single future deadline invent nothing", () => {
  assert.deepEqual(brief({}), []);
  assert.deepEqual(brief(base()), []);
  const quiet = brief(base({
    deadlines: [
      { id: "fix", title: "Sample holiday", date: "2026-11-01", source: "kairos-fixed", done: false },
      { id: "soon", title: "Sample oil change", date: "2026-12-01", source: "garage", ref: "oil", done: false },
    ],
    fixed: [{ date: "2026-11-26", name: "Thanksgiving Day", kind: "federal holiday" }],
    events: [{ type: "idea.captured", pillar: "athenaeum", at: "2026-11-19T12:00:00.000Z", v: 1, id: "e", ref: "x", title: "Sample idea" }],
    time: { events: [], focus: { log: [{ at: "2026-11-19T18:00:00.000Z", minutes: 25 }] } },
    away: false,
    meta: { awayMode: false, away: null },
  }));
  assert.deepEqual(quiet, []);
  assert.equal(spoken(quiet), "");
  const read = () => null;
  assert.deepEqual(loadBrief(read, { today: TODAY, now: NOW, time: base().time, money: base().money, fixed: [] }), []);
});

test("overdue: an open past obligation links to its record, and a finished one does not", () => {
  const lines = brief(base({
    deadlines: [
      { id: "smog", title: "Sample smog check", date: "2026-11-01", source: "garage", ref: "smog", done: false },
      { id: "done", title: "Sample filter", date: "2026-11-02", source: "garage", ref: "filter", done: true },
      { id: "fix", title: "Veterans Day", date: "2026-11-11", source: "kairos-fixed", done: false },
      { id: "coins", title: "Sample coins", date: "2026-11-03", source: "titan", done: false },
    ],
    time: {
      events: [
        { id: "form", title: "Sample form due", date: "2026-11-04", kind: "deadline", time: null, allDay: true },
        { id: "met", title: "Sample form met", date: "2026-11-05", kind: "deadline", time: null, allDay: true, done: { "2026-11-05": true } },
        { id: "weekly", title: "Sample weekly due", date: "2026-10-01", kind: "deadline", rule: { freq: "WEEKLY", interval: 1 } },
        { id: "same", title: "Sample smog check", date: "2026-11-01", kind: "deadline", time: null, allDay: true },
      ],
      focus: { log: [] },
    },
  }));
  assert.deepEqual(rules(lines), ["overdue", "overdue"]);
  const smog = lines.find((l) => l.ref === "smog");
  assert.equal(smog.href, "pillars/garage/");
  assert.match(smog.text, /Sample smog check/);
  assert.equal(smog.label, "Overdue");
  const form = lines.find((l) => l.ref === "form");
  assert.equal(form.href, "#/time/day/2026-11-04");
  assert.ok(lines[0].rank > lines[1].rank, "the older miss ranks first");
  assert.ok(!lines.some((l) => /coins|Veterans|filter|met|weekly/i.test(l.text)));
});

test("date collisions: two obligations on one day, or one obligation on a federal holiday", () => {
  const doubled = brief(base({
    deadlines: [
      { id: "oil", title: "Sample oil change", date: "2026-12-02", source: "garage", ref: "oil", done: false },
      { id: "insp", title: "Sample inspection", date: "2026-12-02", source: "garage", ref: "insp", done: false },
      { id: "solo", title: "Sample registration", date: "2026-12-10", source: "records", ref: "reg", done: false },
    ],
  }));
  assert.equal(doubled.length, 1);
  assert.equal(doubled[0].rule, "collision");
  assert.equal(doubled[0].href, "#/time/day/2026-12-02");
  assert.match(doubled[0].text, /Sample oil change/);
  assert.match(doubled[0].text, /Sample inspection/);
  assert.equal(doubled[0].ref.includes("oil") && doubled[0].ref.includes("insp"), true);

  const onHoliday = brief(base({
    fixed: [{ date: "2026-11-26", name: "Thanksgiving Day", kind: "federal holiday" }],
    time: { events: [{ id: "school", title: "Sample sign-up closes", date: "2026-11-26", kind: "school", time: null, allDay: true }], focus: { log: [] } },
  }));
  assert.equal(onHoliday.length, 1);
  assert.equal(onHoliday[0].href, "#/time/day/2026-11-26");
  assert.match(onHoliday[0].text, /Sample sign-up closes/);
  assert.match(onHoliday[0].text, /Thanksgiving Day/);

  const withBill = brief(base({
    time: { events: [{ id: "school", title: "Sample sign-up closes", date: "2026-12-03", kind: "school", time: null, allDay: true }], focus: { log: [] } },
    money: { plan: null, events: [], bills: [{ id: "w", name: "Sample water", amount: 64.2, every: "month", anchor: "2026-12-03", kind: "bill" }] },
  }));
  assert.equal(withBill.length, 1);
  assert.match(withBill[0].text, /Sample water/);
  assert.match(withBill[0].text, /Sample sign-up closes/);
  assert.equal(withBill[0].text.includes("64"), false);
  assert.equal(withBill[0].href, "#/time/day/2026-12-03");
});

test("since the last visit: only a later event, and it opens that pillar", () => {
  const events = [
    { type: "idea.captured", pillar: "athenaeum", at: "2026-11-19T15:00:00.000Z", v: 1, id: "new", ref: "idea1", title: "Sample idea" },
    { type: "idea.captured", pillar: "athenaeum", at: "2026-11-01T15:00:00.000Z", v: 1, id: "old", ref: "old", title: "Old idea" },
    { type: "ledger.added", pillar: "titan", at: "2026-11-19T16:00:00.000Z", v: 1, id: "t", ref: "c", title: "Sample coin" },
  ];
  assert.deepEqual(brief(base({ events, lastSeen: "" })), []);
  const lines = brief(base({ events, lastSeen: "2026-11-18T12:00:00.000Z" }));
  assert.equal(lines.length, 1);
  assert.equal(lines[0].rule, "since");
  assert.equal(lines[0].href, "pillars/athenaeum/");
  assert.equal(lines[0].ref, "idea1");
  assert.equal(lines[0].where, "Athenaeum");
  assert.match(lines[0].say, /Sample idea/);
  assert.match(lines[0].text, /Sample idea/);
  assert.equal(/coin|Old idea/.test(lines[0].text), false);
});

test("streaks: two or more logged days count, a gap or a single day does not", () => {
  assert.equal(dayStreak(["2026-11-19", "2026-11-18", "2026-11-17"], TODAY), 3);
  assert.equal(dayStreak(["2026-11-19", "2026-11-17"], TODAY), 1);
  assert.equal(dayStreak(["2026-11-20", "2026-11-19"], TODAY), 2);
  const lines = brief(base({
    time: { events: [], focus: { log: [
      { at: "2026-11-19T18:00:00.000Z", minutes: 25 },
      { at: "2026-11-18T18:00:00.000Z", minutes: 25 },
      { at: "2026-11-17T18:00:00.000Z", minutes: 50 },
    ] } },
    sessions: [
      { id: "s1", date: "2026-11-19", minutes: 20 },
      { id: "s2", date: "2026-11-18", minutes: 15 },
    ],
    days: { "2026-11-19": { sleep: 7 }, "2026-11-18": { steps: 1000 }, "2026-11-10": { sleep: 6 }, "2026-11-16": {} },
  }));
  assert.deepEqual(rules(lines), ["streak", "streak", "streak"]);
  const focus = lines.find((l) => l.href === "#/time/focus");
  const piano = lines.find((l) => l.href === "pillars/piano/");
  const apollo = lines.find((l) => l.href === "pillars/apollo/");
  assert.match(focus.text, /Focus · 3 days/);
  assert.match(piano.text, /Piano · 2 days/);
  assert.equal(piano.ref, "s1");
  assert.match(apollo.text, /Apollo · 2 days/);
  assert.equal(apollo.ref, "2026-11-19");
  assert.equal(apollo.text.includes("1000"), false);
  const one = brief(base({ sessions: [{ id: "only", date: "2026-11-19", minutes: 10 }] }));
  assert.deepEqual(one, []);
});

test("away mode links to the trip, and an ended trip is not away", () => {
  const on = brief(base({ away: { active: true, tripId: "trip-sample", name: "Sample coast", until: "2026-11-28" } }));
  assert.equal(on.length, 1);
  assert.equal(on[0].rule, "away");
  assert.equal(on[0].href, "pillars/odyssey/");
  assert.equal(on[0].ref, "trip-sample");
  assert.match(on[0].text, /Sample coast/);
  assert.match(on[0].text, /Nov 28/);
  assert.deepEqual(brief(base({ away: { active: false, tripId: "trip-sample", name: "Sample coast" } })), []);
  const flagged = brief(base({ meta: { awayMode: true } }));
  assert.equal(flagged.length, 1);
  assert.equal(flagged[0].text, "Away mode is on");
  assert.equal(flagged[0].href, "pillars/odyssey/");
});

test("rank is overdue, then a collision, then away, then a change, then a streak", () => {
  const lines = brief(base({
    lastSeen: "2026-11-18T12:00:00.000Z",
    deadlines: [
      { id: "late", title: "Sample smog check", date: "2026-11-01", source: "garage", ref: "smog", done: false },
      { id: "oil", title: "Sample oil change", date: "2026-12-02", source: "garage", ref: "oil", done: false },
      { id: "insp", title: "Sample inspection", date: "2026-12-02", source: "garage", ref: "insp", done: false },
    ],
    events: [{ type: "idea.captured", pillar: "athenaeum", at: "2026-11-19T15:00:00.000Z", v: 1, id: "new", ref: "idea1", title: "Sample idea" }],
    away: { active: true, tripId: "trip-sample", name: "Sample coast" },
    sessions: [{ id: "s1", date: "2026-11-19" }, { id: "s2", date: "2026-11-18" }],
  }));
  assert.deepEqual(rules(lines), ["overdue", "collision", "away", "since", "streak"]);
  for (const l of lines) {
    assert.equal(typeof l.href, "string");
    assert.ok(l.href.length > 1);
    assert.equal(l.text.includes("$"), false);
  }
  const said = spoken(lines);
  assert.match(said, /^Overdue\. /);
  assert.equal(said.includes("$"), false);
  assert.match(said, /Sample idea/);
});

test("loadBrief reads the bus and the pillar stores and does not invent from an empty map", () => {
  const stored = {
    "prometheus.bus.deadlines": JSON.stringify([{ id: "smog", title: "Sample smog check", date: "2026-11-01", source: "garage", done: false }]),
    "prometheus.bus.events": JSON.stringify([{ type: "piano.session", pillar: "piano", at: "2026-11-19T12:00:00.000Z", v: 1, id: "p", ref: "s9", title: "Sample scales" }]),
    "prometheus.bus.meta": JSON.stringify({}),
    "prometheus.odyssey.away": JSON.stringify({ active: true, tripId: "trip-sample", name: "Sample coast" }),
    "prometheus.piano.sessions": JSON.stringify([{ id: "s1", date: "2026-11-19" }, { id: "s2", date: "2026-11-18" }]),
    "prometheus.apollo.days": JSON.stringify({ "2026-11-19": { sleep: 7 }, "2026-11-18": { sleep: 8 } }),
  };
  const lines = loadBrief((k) => (k in stored ? stored[k] : null), {
    today: TODAY, now: NOW, lastSeen: "2026-11-18T00:00:00.000Z",
    time: { events: [], focus: { log: [] } }, money: { plan: null, bills: [] }, fixed: [],
  });
  assert.deepEqual(rules(lines), ["overdue", "away", "since", "streak", "streak"]);
  assert.equal(lines.find((l) => l.rule === "since").href, "pillars/piano/");
  assert.equal(lines.find((l) => l.rule === "since").ref, "s9");
});
