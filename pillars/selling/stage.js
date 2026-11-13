/* Selling signature: the pipeline. Five stations from staged to closed on one lit conduit; every item is a light sitting at its
   station, and the conduit carries the flow forward. Money expected and money banked under it. */
(function () {
  const S = PK.store("selling"), I = PK.ink, NAMES = { staged: "Staged", listed: "Listed", sold: "Sold", shipped: "Shipped", closed: "Closed" };
  const usd = (n) => { const v = Math.round(n * 100) / 100; return "$" + v.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }); };
  PK.stage({
    label: "Items for sale on the way from staged to closed",
    data() { const items = S.list("items"), sum = window.SELLING ? SELLING.summarize(items) : { counts: {}, predictedNet: 0, realizedNet: 0 }; return { items, sum, stages: (window.SELLING && SELLING.STAGES) || Object.keys(NAMES) }; },
    readouts(D) { const live = D.items.filter((x) => x.stage !== "closed").length; return [{ v: live, k: "In the pipeline" }, { v: usd(D.sum.predictedNet), k: "Expected, listed + sold" }, { v: usd(D.sum.realizedNet), k: "Banked, shipped + closed", tone: D.sum.realizedNet > 0 ? "good" : "" }]; },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, n = D.stages.length, y = h * 0.5, x0 = 34, x1 = w - 34, X = (i) => x0 + (x1 - x0) * i / (n - 1);
      I.halo(g, w / 2, y, w * 0.55, A, 0.15);
      I.glow(g, A, 14); I.line(g, x0, y, x1, y, A, 3, 0.55); I.noGlow(g);
      const flow = S.still ? 0.3 : S.t * 0.18; for (let k = 0; k < 18; k++) { const u = ((k / 18) + flow) % 1, x = x0 + (x1 - x0) * u; I.halo(g, x, y, 8, "#ffffff", 0.35 * Math.sin(u * Math.PI)); }
      D.stages.forEach((st, i) => { const x = X(i), c = D.sum.counts[st] || 0, R = 14 + Math.min(16, c * 2.5), col = i === n - 1 ? "#7dffc0" : i >= 2 ? A : B;
        I.halo(g, x, y, R * 2.2, col, c ? 0.55 : 0.18); I.arc(g, x, y, R, 0, Math.PI * 2, col, 2, 0.9); I.dot(g, x, y, R - 4, "#05070f", 0.85);
        I.text(g, String(c), x, y + 0.5, { size: 15, weight: 500, align: "center" }); I.text(g, NAMES[st] || st, x, y + R + 15, { size: 9.5, weight: 600, align: "center", color: col, spacing: 1 });
        const mine = D.items.filter((it) => it.stage === st).slice(0, 8); mine.forEach((it, k) => { const a = -Math.PI / 2 + (k - (mine.length - 1) / 2) * 0.42 + (S.still ? 0 : Math.sin(S.t + k) * 0.04), rr = R + 16; I.dot(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, 3, col, 0.9); });
        if (mine[0]) I.text(g, I.fit(g, mine[0].title, 90, 9.5, 500), x, y - R - 30, { size: 9.5, align: "center", color: "#dfe6f5", alpha: 0.75 }); });
      if (!D.items.length) I.text(g, "Stage the first item below and it appears here", w / 2, h - 16, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.75 });
    },
  });
})();
