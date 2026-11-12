import test from "node:test"; import assert from "node:assert/strict"; import { readFileSync } from "node:fs";
import { simulate, position, compare, windfallPreview, minimumTrap, evalFormula, deferredExample, paymentFor, impliedApr, dueDate, feed, burn, milestone, toCents } from "../../deck/models/money.js";
import { clock } from "../../deck/core/dates.js";
clock.set("2026-11-12T09:00:00");
const cases = JSON.parse(readFileSync(new URL("../../deck/data/payoff-cases.json", import.meta.url), "utf8"));
const issuers = JSON.parse(readFileSync(new URL("../../deck/data/issuers.json", import.meta.url), "utf8"));

test("all 12 worked payoff cases reproduce to the cent, every month, every debt", () => {
  let figures = 0;
  for (const c of cases) {
    const r = simulate({ debts: c.debts.map((d) => ({ ...d, id: d.name })), budget: c.budget, strategy: c.method });
    assert.equal(r.months.length, c.months.length, `case ${c.case}: months`);
    assert.equal(r.totalInterestC, toCents(c.total_interest), `case ${c.case}: total interest`);
    assert.deepEqual(r.payoffMonth, c.payoff_month, `case ${c.case}: payoff months`);
    c.months.forEach((mo, mi) => mo.forEach((row, di) => row.forEach((v, k) => { figures++; assert.equal(r.months[mi].rows[di][k], toCents(v), `case ${c.case} month ${mi + 1} debt ${di} col ${k}`); })));
  }
  assert.equal(figures, cases.reduce((s, c) => s + c.months.length * c.debts.length * 3, 0)); console.log("      figures matched:", figures);
});
test("a single loan by schedule, windfalls and what-ifs", () => {
  const plan = { start: "2026-06-05", strategy: "avalanche", debts: [{ id: "L", name: "Sample consolidation", balance: 12000, apr: 9.99, min: 553.71 }] };
  assert.equal(Math.round(paymentFor(12000, 9.99, 24) * 100) / 100, 553.69 + 0.0 > 0 ? Math.round(paymentFor(12000, 9.99, 24) * 100) / 100 : 0);
  const p = position(plan, [], "2026-11-12");
  assert.equal(p.k, 6); assert.equal(p.next.date, "2026-12-05"); assert.equal(p.next.in, 23); assert.equal(dueDate(plan, 1), "2026-06-05");
  assert.ok(p.pct > 0.2 && p.pct < 0.3); assert.equal(p.run.months.length, 24);
  const q = position(plan, [{ date: "2026-11-10", amount: 1500 }], "2026-11-12");
  assert.ok(q.run.months.length < 24 && q.interestLeftC < p.interestLeftC); assert.equal(q.k, 6); assert.equal(q.nowC, p.nowC);   // a windfall logged before the next due date lands with it
  const w = windfallPreview(plan, [], 1500, "2026-11-12"); assert.ok(w.avalanche.monthsSaved >= 2 && w.avalanche.interestSavedC > 0); assert.deepEqual(Object.keys(w.avalanche.lands), ["Sample consolidation"]);
  const due = position(plan, [], "2026-12-05"); assert.equal(due.next.in, 0); assert.equal(due.k, 6);
  const end = position(plan, [], "2029-01-01"); assert.equal(end.done, true); assert.equal(end.nowC, 0);
  assert.ok(Math.abs(impliedApr(12000, paymentFor(12000, 9.99, 24), 24) - 9.99) < 1e-6);
  const never = simulate({ debts: [{ id: "x", name: "x", balance: 10000, apr: 30, min: 100 }], strategy: "minimum" }); assert.equal(never.stalled, true);
});
test("strategies side by side", () => {
  const c = cases[3]; const cmp = compare({ start: "2026-12-01", debts: c.debts.map((d) => ({ ...d, id: d.name })), budget: c.budget }, []);
  assert.equal(cmp.avalanche.months, 45); assert.ok(cmp.avalanche.interestC <= cmp.snowball.interestC); assert.ok(cmp.minimum.interestC > cmp.avalanche.interestC);
});
test("every issuer minimum formula evaluates; the minimum trap runs", () => {
  let n = 0; for (const i of issuers) for (const m of i.minimums) { const v = evalFormula(m.formula, { B: 5000, I: 80, F: 0 }); assert.ok(v > 0 && v <= 5000, i.issuer + " " + m.formula + " -> " + v); n++; }
  assert.equal(n, 25);
  assert.equal(evalFormula("B < 40 ? B : max(40, 0.01*B + I + F)", { B: 30, I: 1, F: 0 }), 30); assert.equal(evalFormula("B < 40 ? B : max(40, 0.01*B + I + F)", { B: 5000, I: 80, F: 0 }), 130);
  assert.throws(() => evalFormula("alert(1)", { B: 1, I: 0, F: 0 })); assert.throws(() => evalFormula("B; 2", { B: 1, I: 0, F: 0 }));
  const t = minimumTrap({ balance: 5000, apr: 24.99, formula: "B < 40 ? B : max(40, 0.01*B + I + F)" });
  assert.ok(t.months > 120 && t.interestC > 500000, JSON.stringify([t.months, t.interestC]));
});
test("deferred interest vs true 0 %, bills, milestones", () => {
  const d = deferredExample({ amount: 2400, apr: 29.99, months: 12, payment: 150 }); assert.ok(d.leftC > 0 && d.deferredChargeC > 40000 && d.trueZeroChargeC === 0, JSON.stringify(d));
  assert.equal(deferredExample({ amount: 2400, apr: 29.99, months: 12, payment: 200 }).deferredChargeC, 0);
  const st = { plan: { start: "2026-06-05", debts: [{ id: "L", name: "Loan", balance: 12000, apr: 9.99, min: 553.71 }] }, events: [], bills: [{ id: "b1", name: "Power", amount: 120, every: "month", anchor: "2026-10-20", kind: "bill" }, { id: "b2", name: "Stream", amount: 15.99, every: "month", anchor: "2026-01-14", kind: "sub" }, { id: "b3", name: "Domain", amount: 24, every: "year", anchor: "2025-12-01", kind: "sub" }] };
  const f = feed(st, "2026-11-12", "2026-12-12"); assert.deepEqual(f.map((x) => [x.date, x.title]).sort(), [["2026-11-14", "Stream"], ["2026-11-20", "Power"], ["2026-12-01", "Domain"], ["2026-12-05", "Loan payment"]].sort());
  assert.equal(f.find((x) => x.title === "Loan payment").amount, 553.71);
  const b = burn(st.bills); assert.ok(Math.abs(b.monthly - (120 + 15.99 + 2)) < 1e-9); assert.equal(b.subs[0].name, "Stream");
  assert.deepEqual(milestone(0.26), { hit: 25, next: 33 }); assert.deepEqual(milestone(0.01), { hit: null, next: 5 }); assert.deepEqual(milestone(1), { hit: 100, next: null });
});
