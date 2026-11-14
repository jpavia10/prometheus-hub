/* Money: the payoff machine's engine and state. Pure math in whole cents, so every figure can be checked against a worked ledger.
   This is a SIMULATOR on labelled presets: it never holds an account, a real balance or a credential.

   simulate(plan)              month-by-month payoff for one or many debts (avalanche | snowball | custom | minimum)
   position(plan, events, day) where the plan stands on a given day, by schedule (+ any windfalls logged)
   compare(plan, events)       the three strategies side by side
   minimumTrap(...)            what paying only an issuer's formula minimum costs
   deferredExample(...)        deferred interest vs a true 0 % promo, in dollars
   feed(state, from, to)       dated obligations for Time (loan payments, bills, subscriptions) */
import { addMonths, diffDays, ruleDates, today as todayFn } from "../core/dates.js";

export const toCents = (n) => Math.round(Number(n) * 100);
export const fromCents = (c) => c / 100;
const aprMilli = (apr) => Math.round(Number(apr) * 1000);                         // 6 % -> 6000
/** One month's interest in cents on a balance in cents: apr/12, rounded half up (the rule that reproduces the worked ledgers). */
export const monthInterest = (balC, apr) => Math.floor((balC * aprMilli(apr) + 600000) / 1200000);

function orderOf(strategy, live, debts, bal, custom) {
  if (strategy === "avalanche") return [...live].sort((a, b) => debts[b].apr - debts[a].apr || bal[a] - bal[b]);
  if (strategy === "snowball") return [...live].sort((a, b) => bal[a] - bal[b] || debts[b].apr - debts[a].apr);
  if (custom && custom.length) { const pos = (i) => { const k = custom.indexOf(debts[i].id); return k < 0 ? 1e9 + i : k; }; return [...live].sort((a, b) => pos(a) - pos(b)); }
  return [...live];
}

/** plan: { debts: [{ id, name, balance, apr, min }], budget (dollars; default = the sum of the minimums), strategy, order, extra (dollars a month),
            lumps: { monthNumber: dollars } }   -> { months: [{ m, rows: [[interestC, paidC, balanceC] per debt] }], curve, totalInterestC, totalPaidC, payoffMonth, monthsToFree, stalled } */
export function simulate(plan) {
  const debts = plan.debts.filter((d) => toCents(d.balance) > 0); const n = debts.length;
  const bal = debts.map((d) => toCents(d.balance)); const mins = debts.map((d) => toCents(d.min || 0));
  const strategy = plan.strategy || "avalanche"; const lumps = plan.lumps || {};
  const base = plan.budget != null ? toCents(plan.budget) : mins.reduce((a, b) => a + b, 0);
  const budget = base + toCents(plan.extra || 0);
  const months = []; const curve = [bal.reduce((a, b) => a + b, 0)]; const payoffMonth = {}; let totalInterestC = 0, totalPaidC = 0, m = 0, stalled = false;
  while (bal.some((b) => b > 0) && m < 1200) {
    m++; const rows = bal.map(() => [0, 0, 0]); const before = curve[curve.length - 1];
    for (let i = 0; i < n; i++) if (bal[i] > 0) { const it = monthInterest(bal[i], debts[i].apr); rows[i][0] = it; bal[i] += it; totalInterestC += it; }
    let left = strategy === "minimum" ? Infinity : budget; const pay = (i, amt) => { const p = Math.min(amt, bal[i], left); if (p > 0) { bal[i] -= p; rows[i][1] += p; totalPaidC += p; left -= p; } };
    for (let i = 0; i < n; i++) if (bal[i] > 0) pay(i, mins[i]);
    if (strategy !== "minimum") for (const i of orderOf(strategy, bal.map((b, i) => i).filter((i) => bal[i] > 0), debts, bal, plan.order)) { if (left <= 0) break; pay(i, left); }
    let lump = toCents(lumps[m] || 0);                                             // a windfall goes to the strategy's target, on top of the budget
    if (lump > 0) for (const i of orderOf(strategy === "minimum" ? "avalanche" : strategy, bal.map((b, i) => i).filter((i) => bal[i] > 0), debts, bal, plan.order)) {
      if (lump <= 0) break; const p = Math.min(lump, bal[i]); bal[i] -= p; rows[i][1] += p; totalPaidC += p; lump -= p; }
    for (let i = 0; i < n; i++) { rows[i][2] = bal[i]; if (bal[i] === 0 && payoffMonth[debts[i].id || debts[i].name] == null) payoffMonth[debts[i].id || debts[i].name] = m; }
    months.push({ m, rows }); const after = bal.reduce((a, b) => a + b, 0); curve.push(after);
    if (after >= before && !lumps[m + 1] && m > 3) { stalled = true; break; }       // the payment does not cover the interest: it never ends
  }
  return { debts, months, curve, totalInterestC, totalPaidC, payoffMonth, monthsToFree: stalled ? Infinity : m, stalled };
}

/** The textbook payment for a loan (dollars). */
export function paymentFor(principal, apr, n) { const r = apr / 100 / 12; return r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n)); }
/** The APR (percent) at which `payment` pays off `principal` in exactly n months (bisection). */
export function impliedApr(principal, payment, n) { let lo = 0, hi = 200; for (let i = 0; i < 90; i++) { const mid = (lo + hi) / 2; if (paymentFor(principal, mid, n) < payment) lo = mid; else hi = mid; } return (lo + hi) / 2; }

/* ---- the plan in time: where it stands today, by schedule ---- */
/** Due date of plan month k (1-based): start is the first due date. */
export const dueDate = (plan, k) => addMonths(plan.start, k - 1, Number(plan.start.slice(8)));
function lumpsByMonth(plan, events) {
  const lumps = {};
  for (const e of events || []) { if (!(e.amount > 0) || e.applied === false) continue;
    let k = 1; while (k < 1200 && dueDate(plan, k) < e.date) k++;                  // lands with the first due date on or after its day
    lumps[k] = (lumps[k] || 0) + e.amount; }
  return lumps;
}
export function position(plan, events, day = todayFn()) {
  if (!plan || !plan.debts || !plan.debts.length || !plan.start) return null;
  const run = simulate({ ...plan, lumps: lumpsByMonth(plan, events) });
  let k = 0; while (k < run.months.length && dueDate(plan, k + 1) < day) k++;       // payments whose day has passed
  const startC = run.curve[0], nowC = run.curve[k]; const done = !run.stalled && k >= run.months.length;
  const next = done ? null : { date: dueDate(plan, k + 1), amountC: run.months[k].rows.reduce((s, r) => s + r[1], 0), in: diffDays(day, dueDate(plan, k + 1)) };
  const interestLeftC = run.months.slice(k).reduce((s, mo) => s + mo.rows.reduce((t, r) => t + r[0], 0), 0);
  return { run, k, startC, nowC, paidC: startC - nowC, pct: startC ? (startC - nowC) / startC : 0, next, done,
    freeMonth: run.stalled ? null : dueDate(plan, run.months.length), monthsLeft: run.stalled ? Infinity : run.months.length - k, interestLeftC, totalInterestC: run.totalInterestC,
    windfallC: (events || []).reduce((s, e) => s + (e.amount > 0 && e.applied !== false ? toCents(e.amount) : 0), 0) };
}
/** Avalanche, snowball and minimums-only on the same debts and budget. */
export function compare(plan, events) {
  const out = {};
  for (const s of ["avalanche", "snowball", "minimum"]) { const r = simulate({ ...plan, strategy: s, lumps: s === "minimum" ? {} : lumpsByMonth(plan, events) }); out[s] = { months: r.monthsToFree, interestC: r.totalInterestC, freeMonth: r.stalled ? null : dueDate(plan, r.months.length), curve: r.curve, stalled: r.stalled }; }
  return out;
}
/** A windfall's effect under each strategy, before committing it: months and interest saved, and where the money lands. */
export function windfallPreview(plan, events, amount, day = todayFn()) {
  const out = {};
  for (const s of ["avalanche", "snowball", "custom"]) {
    if (s === "custom" && !(plan.order && plan.order.length)) continue;
    const p = { ...plan, strategy: s }; const a = position(p, events, day); const b = position(p, [...(events || []), { date: day, amount }], day);
    const k = b.k; const lands = {}; const rowsA = a.run.months[k], rowsB = b.run.months[k];
    if (rowsA && rowsB) b.run.debts.forEach((d, i) => { const extra = rowsB.rows[i][1] - (rowsA.rows[i] ? rowsA.rows[i][1] : 0); if (extra > 0) lands[d.name] = extra; });
    out[s] = { monthsSaved: a.run.months.length - b.run.months.length, interestSavedC: a.run.totalInterestC - b.run.totalInterestC, freeMonth: b.freeMonth, lands };
  }
  return out;
}

/* ---- issuer minimums: a tiny, safe formula reader (numbers, B I F, + - * /, < <= > >=, ?:, min(), max()) ---- */
export function evalFormula(src, vars) {
  const s = String(src); let i = 0;
  const ws = () => { while (s[i] === " ") i++; };
  const num = () => { ws(); const m = /^\d*\.?\d+/.exec(s.slice(i)); if (!m) throw new Error("number expected at " + i); i += m[0].length; return Number(m[0]); };
  const prim = () => { ws();
    if (s[i] === "(") { i++; const v = tern(); ws(); if (s[i] !== ")") throw new Error(") expected"); i++; return v; }
    if (s[i] === "-") { i++; return -prim(); }
    const id = /^[A-Za-z]+/.exec(s.slice(i));
    if (id) { i += id[0].length; ws();
      if (s[i] === "(") { i++; const args = [tern()]; ws(); while (s[i] === ",") { i++; args.push(tern()); ws(); } if (s[i] !== ")") throw new Error(") expected"); i++;
        if (id[0] === "min") return Math.min(...args); if (id[0] === "max") return Math.max(...args); throw new Error("unknown function " + id[0]); }
      if (!(id[0] in vars)) throw new Error("unknown name " + id[0]); return vars[id[0]]; }
    return num(); };
  const mul = () => { let v = prim(); for (;;) { ws(); if (s[i] === "*") { i++; v *= prim(); } else if (s[i] === "/") { i++; v /= prim(); } else return v; } };
  const add = () => { let v = mul(); for (;;) { ws(); if (s[i] === "+") { i++; v += mul(); } else if (s[i] === "-") { i++; v -= mul(); } else return v; } };
  const cmp = () => { const a = add(); ws(); const m = /^(<=|>=|<|>)/.exec(s.slice(i)); if (!m) return a; i += m[0].length; const b = add(); return m[0] === "<" ? a < b : m[0] === "<=" ? a <= b : m[0] === ">" ? a > b : a >= b; };
  const tern = () => { const c = cmp(); ws(); if (s[i] !== "?") return c; i++; const a = tern(); ws(); if (s[i] !== ":") throw new Error(": expected"); i++; const b = tern(); return c ? a : b; };
  const v = tern(); ws(); if (i < s.length) throw new Error("unexpected " + s[i]); return v;
}
/** Paying exactly the issuer's formula minimum every month (no new charges, no fees): months, interest, the first payments. */
export function minimumTrap({ balance, apr, formula, cap = 1200 }) {
  let bal = toCents(balance), interestC = 0, m = 0; const first = []; const curve = [bal];
  while (bal > 0 && m < cap) {
    m++; const it = monthInterest(bal, apr); const B = (bal + it) / 100;
    let pay = toCents(evalFormula(formula, { B, I: it / 100, F: 0 })); pay = Math.max(0, Math.min(pay, bal + it));
    if (pay <= it && bal + it - pay >= bal) { return { months: Infinity, interestC, first, curve, stalled: true }; }
    bal = bal + it - pay; interestC += it; if (first.length < 3) first.push(pay); curve.push(bal);
  }
  return { months: m, interestC, first, curve, stalled: bal > 0 };
}
/** A promo purchase: `amount` at `apr`, `months` of promo, paying `payment` a month. Deferred interest charges every month's interest
    back to day one if a cent is left when the promo ends; a true 0 % promo charges nothing for the promo months. */
export function deferredExample({ amount, apr, months, payment }) {
  let bal = toCents(amount), pot = 0;
  for (let m = 1; m <= months; m++) { pot += monthInterest(bal, apr); bal = Math.max(0, bal - toCents(payment)); }
  return { leftC: bal, deferredChargeC: bal > 0 ? pot : 0, trueZeroChargeC: 0, payInFullEvery: Math.ceil(toCents(amount) / months) / 100 };
}

/* ---- bills and subscriptions ---- */
const CYCLE = { week: { freq: "WEEKLY", interval: 1, perMonth: 52 / 12 }, "2weeks": { freq: "WEEKLY", interval: 2, perMonth: 26 / 12 }, month: { freq: "MONTHLY", interval: 1, perMonth: 1 }, quarter: { freq: "MONTHLY", interval: 3, perMonth: 1 / 3 }, "6months": { freq: "MONTHLY", interval: 6, perMonth: 1 / 6 }, year: { freq: "YEARLY", interval: 1, perMonth: 1 / 12 } };
export const CYCLES = Object.keys(CYCLE);
export const cycleText = (c) => ({ week: "weekly", "2weeks": "every 2 weeks", month: "monthly", quarter: "every 3 months", "6months": "every 6 months", year: "yearly" }[c] || c);
export const billDates = (b, from, to) => ruleDates(b.anchor, { freq: CYCLE[b.every || "month"].freq, interval: CYCLE[b.every || "month"].interval }, to).filter((d) => d >= from);
export const monthlyCost = (b) => (Number(b.amount) || 0) * CYCLE[b.every || "month"].perMonth;
export function burn(bills) {
  const subs = bills.filter((b) => b.kind === "sub"); const all = bills.reduce((s, b) => s + monthlyCost(b), 0);
  return { monthly: all, yearly: all * 12, subsMonthly: subs.reduce((s, b) => s + monthlyCost(b), 0), subs: subs.map((b) => ({ ...b, yearly: monthlyCost(b) * 12 })).sort((a, b) => b.yearly - a.yearly) };
}

/* ---- milestones (the words are MID-MUS-01, Muse) ---- */
export const PCT_STEPS = [5, 10, 25, 33, 50, 66, 75, 90, 100];
export function milestone(pct) { let hit = null; for (const s of PCT_STEPS) if (pct * 100 + 1e-9 >= s) hit = s; const next = PCT_STEPS.find((s) => pct * 100 + 1e-9 < s) || null; return { hit, next }; }

/* ---- state ---- */
export const slice = {
  schema: 1,
  init: () => ({ plan: null, events: [], bills: [], seen: { pct: 0 } }),
};
/** Dated obligations for Time. */
export function feed(st, from, to) {
  const out = [];
  if (st.plan && st.plan.start && st.plan.debts && st.plan.debts.length) {
    const pos = position(st.plan, st.events, from);
    if (pos && !pos.run.stalled) for (let k = pos.k; k < pos.run.months.length; k++) {
      const date = dueDate(st.plan, k + 1); if (date > to) break; if (date < from) continue;
      const amt = pos.run.months[k].rows.reduce((s, r) => s + r[1], 0);
      out.push({ key: "money:plan:" + date, date, time: null, title: (st.plan.debts.length === 1 ? st.plan.debts[0].name : "Debt plan") + " payment", cap: "money", tone: "bill", amount: amt / 100, weight: 3, go: "#/money" });
    }
  }
  for (const b of st.bills || []) for (const date of billDates(b, from, to))
    out.push({ key: `money:bill:${b.id}:${date}`, date, time: null, title: b.name, cap: "money", tone: b.kind === "sub" ? "sub" : "bill", amount: Number(b.amount) || 0, weight: b.kind === "sub" ? 1 : 3, auto: !!b.autopay, go: "#/money/bills" });
  return out;
}
export function search(st, q) {
  const out = []; const hit = (s) => String(s || "").toLowerCase().includes(q);
  for (const d of (st.plan && st.plan.debts) || []) if (hit(d.name)) out.push({ title: d.name, sub: `Debt in the payoff plan · ${d.apr}% APR`, go: "#/money" });
  for (const b of st.bills || []) if (hit(b.name)) out.push({ title: b.name, sub: `${b.kind === "sub" ? "Subscription" : "Bill"} · $${Number(b.amount).toFixed(2)} ${cycleText(b.every)}`, go: "#/money/bills" });
  return out;
}
