/* The demo deck: invented sample data, built around today's date so it is always alive. It exists so the deck can be flown and
   proven without anyone's real life in it. Every row here is made up; the owner's own presets live in his private seed file. */
import { addDays, addMonths, dow, WEEKDAYS } from "../core/dates.js";
import { paymentFor } from "../models/money.js";

export function demoDeck(today, fixed = []) {
  let n = 0; const id = (p) => p + "demo" + (n++).toString(36);
  const holiday = (fixed.find((r) => r.kind === "federal holiday" && r.date >= addDays(today, 2)) || { date: addDays(today, 9), name: "a holiday" });
  const trash = addDays(today, 1); const lesson = addDays(today, 2);
  const ev = (title, date, time, more = {}) => ({ id: id("e"), title, date, time: time || null, allDay: !time, tz: null, end: null, dur: null, notes: "", place: "", kind: "event", big: false, ...more });
  const events = [
    ev("Dentist", addDays(today, 3), "15:00", { kind: "appointment", place: "Sample Dental" }),
    ev("Trash to the curb", trash, "07:00", { rule: { freq: "WEEKLY", interval: 1, byday: [{ d: WEEKDAYS[dow(trash)] }] }, overrides: { [addDays(trash, 14)]: { date: addDays(trash, 15), title: "Trash to the curb (holiday week)" }, [addDays(trash, 28)]: { skipped: true } } }),
    ev("Piano lesson", lesson, "17:30", { rule: { freq: "WEEKLY", interval: 1, byday: [{ d: WEEKDAYS[dow(lesson)] }] } }),
    ev("Conference sign-up closes", holiday.date, null, { kind: "school", notes: "Sign-up window for parent conferences. Sample." }),
    ev("Library books due", addDays(today, 5), null, { kind: "deadline" }),
    ev("Smog check due", addDays(today, 12), null, { kind: "deadline" }),
    ev("Furnace filter", addDays(today, 6), null, { rule: { freq: "MONTHLY", interval: 3 } }),
    ev("Weekend on the coast", addDays(today, 40), null, { big: true, end: { date: addDays(today, 43), time: null }, notes: "Sample trip." }),
    ev("Call the roofer", today, "16:30"),
  ];
  const first = addMonths(today.slice(0, 8) + "05", -6); const pay = Math.ceil(paymentFor(12000, 9.99, 24) * 100) / 100;
  const bill = (name, amount, every, anchor, kind = "bill", more = {}) => ({ id: id("b"), name, amount, every, anchor, kind, autopay: false, note: "", ...more });
  const money = {
    plan: { label: "Sample consolidation", sample: true, start: first, strategy: "avalanche", order: [], budget: null, extra: 0,
      debts: [{ id: id("d"), name: "Sample consolidation loan", kind: "loan", balance: 12000, apr: 9.99, min: pay }] },
    events: [{ id: id("m"), date: addDays(today, -20), amount: 180, kind: "sale", label: "Sample: sold a table saw", applied: true }],
    bills: [
      bill("Water", 64.2, "month", addMonths(holiday.date, -3)),
      bill("Power", 118.4, "month", addMonths(addDays(today, 4), -5), "bill", { autopay: true }),
      bill("Internet", 70, "month", addMonths(addDays(today, 16), -8), "bill", { autopay: true }),
      bill("Car insurance", 612, "6months", addMonths(addDays(today, 25), -6)),
      bill("Streaming", 15.99, "month", addMonths(addDays(today, 2), -14), "sub", { lastUsed: addDays(today, -3) }),
      bill("Cloud storage", 2.99, "month", addMonths(addDays(today, 9), -30), "sub", { lastUsed: addDays(today, -1) }),
      bill("Music lessons app", 12.99, "month", addMonths(addDays(today, 19), -7), "sub", { lastUsed: addDays(today, -95), note: "Still using this?" }),
    ],
    seen: { pct: 0 },
  };
  return { app: "prometheus-deck", format: 1, kind: "seed", label: "Demo deck (sample data)", slices: {
    profile: { schema: 1, data: { name: "", place: { label: "Mount Washington, NH (sample)", lat: 44.2706, lon: -71.3033 }, demo: true, seed: { label: "Demo deck (sample data)", loaded: new Date().toISOString() } } },
    time: { schema: 1, data: { events, zones: {}, focus: { method: "pomodoro", run: null, log: [{ at: new Date(Date.now() - 26 * 3600e3).toISOString(), minutes: 50, method: "pomodoro", label: "Sample" }, { at: new Date(Date.now() - 50 * 3600e3).toISOString(), minutes: 25, method: "pomodoro", label: "Sample" }] }, prefs: { weekStart: 0 } } },
    money: { schema: 1, data: money },
  } };
}
