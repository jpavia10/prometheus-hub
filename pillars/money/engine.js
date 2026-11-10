/* Money engine (Sebastian, 2026-11-09): pure payoff math for the hub-side simulator. No DOM, no storage.
   SAMPLE data only — this never reads Midas Ledger or any real balance.
   Semantics match the verified research fixtures (MID-GEM payoff cases): interest accrues on the
   start-of-month balance at apr/12, rounded to cents; minimums are paid on every live debt; the
   remaining budget cascades to the strategy target (and, when it dies mid-month, to the next target
   in the same month). window.MONEY = { simulateLoan, solveApr, payoff } */
(function () {
  "use strict";
  const cents = (n) => Math.round(n * 100) / 100;

  /** One loan, fixed payment. Returns {months, totalInterest, totalPaid, curve:[end-of-month balances]}. */
  function simulateLoan(o) {
    let bal = o.principal, months = 0, totalInterest = 0, totalPaid = 0; const curve = [bal];
    const r = o.apr / 100 / 12, lumps = {};
    for (const l of o.lump || []) lumps[l.month] = (lumps[l.month] || 0) + l.amount;
    while (bal > 0.004 && months < 1200) {
      months++;
      const interest = cents(bal * r); bal = cents(bal + interest); totalInterest = cents(totalInterest + interest);
      let pay = Math.min(cents(o.payment + (o.extraMonthly || 0) + (lumps[months] || 0)), bal);
      bal = cents(bal - pay); totalPaid = cents(totalPaid + pay); curve.push(bal);
    }
    return { months, totalInterest, totalPaid, curve };
  }

  /** The textbook monthly payment for principal/apr/months. */
  function paymentFor(principal, apr, months) {
    const r = apr / 100 / 12;
    return r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
  }

  /** Solve the APR whose textbook payment equals `payment` (bisection). Returns APR in percent. */
  function solveApr(principal, payment, months) {
    let lo = 0, hi = 100;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (paymentFor(principal, mid, months) < payment) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  /** Multi-debt payoff. debts: [{name, balance, apr, min}]; strategy: avalanche | snowball | minimum.
      Returns {months, totalInterest, payoffMonth:{name:month}, curve:[total end-of-month balance]}. */
  function payoff(o) {
    const ds = o.debts.map((d) => ({ ...d, bal: d.balance, dead: d.balance <= 0 }));
    let month = 0, totalInterest = 0; const payoffMonth = {}, curve = [ds.reduce((s, d) => s + d.bal, 0)];
    const order = () => ds.filter((d) => !d.dead).sort((a, b) => o.strategy === "avalanche" ? b.apr - a.apr || a.bal - b.bal : o.strategy === "snowball" ? a.bal - b.bal || b.apr - a.apr : 0);
    while (ds.some((d) => !d.dead) && month < 1200) {
      month++;
      for (const d of ds) if (!d.dead) { const i = cents(d.bal * d.apr / 100 / 12); d.bal = cents(d.bal + i); totalInterest = cents(totalInterest + i); }
      let budget = o.budget;
      for (const d of ds) if (!d.dead) { const p = Math.min(d.min, d.bal); d.bal = cents(d.bal - p); budget = cents(budget - p); if (d.bal <= 0.004) { d.bal = 0; d.dead = true; payoffMonth[d.name] = month; } }
      if (o.strategy !== "minimum") for (const d of order()) { if (budget <= 0) break; if (d.dead) continue; const p = Math.min(budget, d.bal); d.bal = cents(d.bal - p); budget = cents(budget - p); if (d.bal <= 0.004) { d.bal = 0; d.dead = true; payoffMonth[d.name] = month; } }
      curve.push(cents(ds.reduce((s, d) => s + d.bal, 0)));
    }
    return { months: month, totalInterest, payoffMonth, curve };
  }

  const MONEY = { simulateLoan, paymentFor, solveApr, payoff, cents };
  if (typeof window !== "undefined") window.MONEY = MONEY;
  if (typeof globalThis !== "undefined") globalThis.MONEY = MONEY;
})();
