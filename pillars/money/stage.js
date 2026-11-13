/* Money signature: the descent. The balance falling month by month to zero at the payment you set, against the payment the lender's
   rate implies, with the day it reaches zero marked. Uses the same engine as the simulator below it. */
(function () {
  const S = PK.store("money"), I = PK.ink, DEF = { principal: 5000, apr: 6, term: 12, actualPayment: 440, extra: 0 };
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  PK.stage({
    label: "The balance falling to zero at your payment",
    data() { const c = { ...DEF, ...S.get("cfg", {}) }, M = window.MONEY; if (!M) return null;
      const mine = M.simulateLoan({ principal: +c.principal, apr: +c.apr, payment: +c.actualPayment, extraMonthly: +c.extra || 0 }), book = M.simulateLoan({ principal: +c.principal, apr: +c.apr, payment: M.paymentFor(+c.principal, +c.apr, +c.term) });
      const end = new Date(I.today() + "T12:00:00"); end.setMonth(end.getMonth() + mine.months);
      return { c, mine, book, end: end.toLocaleDateString("en-US", { month: "short", year: "numeric" }), endShort: end.toLocaleDateString("en-US", { month: "short" }) + " '" + String(end.getFullYear()).slice(2), sample: !S.get("cfg") }; },
    readouts(D) { return D ? [{ v: D.mine.months + " mo", k: "To zero" }, { v: usd(D.mine.totalInterest), k: "Interest paid" }, { v: D.endShort, k: D.sample ? "Debt-free, sample" : "Debt-free" }] : []; },
    draw(g, S, I) {
      const D = S.data; if (!D) return; const w = S.w, h = S.h, A = S.accent, B = S.accent2, L = 46, R = w - 18, T = 26, Bt = h - 30, maxM = Math.max(D.mine.months, D.book.months, 1), top = D.c.principal;
      const X = (m) => L + (R - L) * (m / maxM), Y = (v) => Bt - (Bt - T) * (v / top);
      for (let k = 0; k <= 4; k++) { const v = top * k / 4, y = Y(v); I.line(g, L, y, R, y, "#ffffff", 1, 0.06); I.text(g, usd(v), L - 6, y, { size: 9, align: "right", color: "#cfd8ea", alpha: 0.55 }); }
      const prog = S.still ? 1 : I.ease(Math.min(1, S.t / 2.2)), path = (curve, upto) => { g.beginPath(); curve.forEach((v, m) => { if (m > upto) return; m ? g.lineTo(X(m), Y(v)) : g.moveTo(X(m), Y(v)); }); };
      g.setLineDash([4, 5]); path(D.book.curve, maxM); g.strokeStyle = I.rgba(B, 0.55); g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
      const upto = Math.floor(D.mine.months * prog); path(D.mine.curve, upto); g.lineTo(X(Math.min(upto, D.mine.months)), Bt); g.lineTo(X(0), Bt); g.closePath();
      const fill = g.createLinearGradient(0, T, 0, Bt); fill.addColorStop(0, I.rgba(A, 0.38)); fill.addColorStop(1, I.rgba(A, 0)); g.fillStyle = fill; g.fill();
      I.glow(g, A, 14); path(D.mine.curve, upto); g.strokeStyle = I.rgba(A, 1); g.lineWidth = 2.5; g.stroke(); I.noGlow(g);
      const m = Math.min(upto, D.mine.months), hx = X(m), hy = Y(D.mine.curve[m] || 0); I.halo(g, hx, hy, 22, A, 0.9); I.dot(g, hx, hy, 4, "#ffffff");
      const run = S.still ? 0 : (S.t * 0.35) % 1, rm = Math.floor(run * D.mine.months); I.halo(g, X(rm), Y(D.mine.curve[rm] || 0), 12, "#ffffff", 0.5);
      if (prog >= 1) { I.line(g, X(D.mine.months), T, X(D.mine.months), Bt, A, 1, 0.5); I.text(g, "ZERO · " + D.end.toUpperCase(), Math.min(X(D.mine.months), R - 4), T - 10, { size: 9.5, weight: 700, align: "right", color: A, spacing: 1.5 }); }
      I.text(g, "your payment", L + 6, Bt - 10, { size: 9.5, color: A }); I.text(g, "lender's schedule", L + 6, Bt - 24, { size: 9.5, color: B, alpha: 0.8 });
      for (let k = 0; k <= maxM; k += Math.max(1, Math.ceil(maxM / 6))) I.text(g, k + "m", X(k), Bt + 12, { size: 9, align: "center", color: "#cfd8ea", alpha: 0.55 });
    },
  });
})();
