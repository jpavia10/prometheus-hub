/* Atlas signature (2026-11-25): the pay track. The next four months run left to right from today; every payday stands as a column of
   light as tall as what it brings (its usual take-home), moved off weekends and bank holidays the way the bank will pay it; a month
   with a third payday glows; time off banked is the band along the bottom. Tap a payday to read it. Drawn only from Atlas's own
   records (window.ATLAS.data). */
(function () {
  let cols = [];
  const usd = (n) => (n == null ? "" : "$" + Math.round(n).toLocaleString("en-US"));
  PK.stage({
    label: "Every payday in the next four months, as tall as its take-home (tap one)",
    data() { return window.ATLAS ? window.ATLAS.data() : null; },
    readouts(D) {
      const nx = D.next[0], n = nx ? window.ATLAS_PAY.diffDays(D.today, nx.date) : null;
      const pto = D.pto ? window.ATLAS_PAY.ptoOn(D.pto, D.pay, D.today) : null;
      return [
        nx ? { v: n === 0 ? "Today" : n + " d", k: "Next pay · " + new Date(nx.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), tone: n <= 2 ? "good" : "" } : { v: "—", k: "Next pay: set the schedule" },
        { v: D.perMonth != null ? usd(D.perMonth) : "—", k: "Take-home a month" },
        { v: pto != null ? pto + " h" : D.ytd.n ? usd(D.ytd.net) : "—", k: pto != null ? "Time off banked" : "Take-home this year" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, L = 18, R = w - 14, top = 46, base = h - 34, span = 120;
      const X = (d) => L + (R - L) * Math.max(0, Math.min(span, d)) / span, P = window.ATLAS_PAY;
      const sky = g.createLinearGradient(0, top, 0, base); sky.addColorStop(0, "rgba(0,0,0,0)"); sky.addColorStop(1, I.rgba(A, 0.14)); g.fillStyle = sky; g.fillRect(0, top, w, base - top);
      /* months */
      const t0 = D.today; let y = +t0.slice(0, 4), m = +t0.slice(5, 7);
      for (let i = 0; i < 6; i++) {
        const first = `${y}-${String(m).padStart(2, "0")}-01`, dd = P.diffDays(t0, first);
        if (dd > span) break;
        const three = D.three.includes(first.slice(0, 7));
        if (dd > 0) I.line(g, X(dd), top - 6, X(dd), base, "#ffffff", 1, 0.12);
        const lx = X(Math.max(0, dd)) + 4, nextAt = X(P.diffDays(t0, m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`));
        if (lx < R - 30 && !(dd <= 0 && nextAt - lx < (three ? 92 : 44))) I.text(g, new Date(first + "T12:00:00").toLocaleDateString("en-US", { month: "short" }).toUpperCase() + (three ? " · 3 PAYS" : ""), lx, top - 8, { size: 8.5, weight: 700, color: three ? A : "#cfd8ea", alpha: three ? 0.95 : 0.6, spacing: 1.2 });
        m += 1; if (m > 12) { m = 1; y += 1; }
      }
      I.glow(g, A, 10); I.line(g, L, base, R, base, A, 1.5, 0.8); I.noGlow(g);
      I.halo(g, L, base, 22, "#ffffff", 0.5); I.text(g, "NOW", L, base + 12, { size: 8.5, weight: 700, align: "left", color: A, spacing: 1.5 });
      /* paydays */
      cols = [];
      const pays = D.next.filter((p) => P.diffDays(t0, p.date) <= span), max = Math.max(1, ...pays.map((p) => p.net || 0));
      const grow = S.still ? 1 : I.ease(Math.min(1, S.t / 1.2)), labels = [];
      pays.forEach((p, i) => {
        const x = X(P.diffDays(t0, p.date)), frac = p.net ? 0.35 + 0.6 * p.net / max : 0.55, ht = (base - top - 16) * frac * grow, y0 = base - ht;
        const sel = S.pick && S.pick.date === p.date, col = i === 0 ? A : B, flick = S.still ? 1 : 0.88 + 0.12 * Math.sin(S.t * 3 + i);
        const beam = g.createLinearGradient(0, y0, 0, base); beam.addColorStop(0, I.rgba(col, (sel ? 1 : 0.85) * flick)); beam.addColorStop(1, I.rgba(col, 0.06));
        g.fillStyle = beam; g.fillRect(x - (i === 0 ? 4 : 2.5), y0, i === 0 ? 8 : 5, ht);
        I.halo(g, x, y0, i === 0 ? 22 : 14, col, 0.85 * flick); I.dot(g, x, y0, i === 0 ? 3.5 : 2.4, "#ffffff");
        if (p.moved) I.dot(g, x, base + 5, 2, "#ffd27a", 0.9);
        if (i === 0 || sel) labels.push(() => {
          const lab = new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (p.net != null ? " · " + usd(p.net) : "");
          const right = x > w - 150, txt = I.fit(g, lab, 150, 10.5, 600), tw = g.measureText(txt).width, tx = x + (right ? -8 - tw : 8);
          g.fillStyle = "rgba(5,7,14,0.82)"; g.fillRect(tx - 5, y0 - 9, Math.max(tw, p.moved ? 110 : 0) + 10, p.moved ? 31 : 19);
          I.text(g, txt, x + (right ? -8 : 8), y0 + 1, { size: 10.5, weight: 600, align: right ? "right" : "left", color: "#ffffff" });
          if (p.moved) I.text(g, I.fit(g, "moved: " + p.why, 150, 9, 500), x + (right ? -8 : 8), y0 + 15, { size: 9, align: right ? "right" : "left", color: "#ffd27a", alpha: 0.9 });
        });
        cols.push({ date: p.date, x });
      });
      labels.forEach((f) => f());
      /* time off */
      const pto = D.pto ? P.ptoOn(D.pto, D.pay, t0) : null;
      if (pto != null) {
        const cap = D.pto.cap ? +D.pto.cap : Math.max(80, pto * 1.5), fw = (R - L - 60) * Math.min(1, pto / cap);
        g.fillStyle = I.rgba(B, 0.14); g.fillRect(L + 52, h - 14, R - L - 60, 5); g.fillStyle = I.rgba(B, 0.8); g.fillRect(L + 52, h - 14, fw, 5);
        I.text(g, "TIME OFF", L, h - 11, { size: 8, weight: 700, color: B, alpha: 0.8, spacing: 1.2 });
      }
      if (!pays.length) I.text(g, "Set the pay schedule and every payday rises here", w / 2, (top + base) / 2, { size: 11, align: "center", color: "#dfe6f5", alpha: 0.85 });
    },
    tap(x, y, S) {
      const near = cols.reduce((best, c) => (Math.abs(c.x - x) < (best ? Math.abs(best.x - x) : 22) ? c : best), null);
      S.pick = near ? { date: near.date } : null;
    },
  });
})();
