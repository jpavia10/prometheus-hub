/* Foundry signature: the blueprint floor. Every invention is a block on an isometric drafting grid: on the drawing board it is only
   a blue outline; each stage raises it and fills it with light, until a built one stands solid. The next step of the tallest is shown. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "Inventions as blocks that rise with each stage of the build",
    data() { const D = window.FOUNDRY ? FOUNDRY.data() : null; if (!D) return null; const items = [...D.projects.map((p) => ({ t: p.title, s: p.stage, next: p.next })), ...D.board.map((i) => ({ t: i.title, s: 0 }))]; return { D, items }; },
    readouts(X) { return [{ v: X.D.board.length, k: "On the drawing board" }, { v: X.D.projects.length, k: "Builds on the bench" }, { v: "$" + Math.round(X.D.cost).toLocaleString("en-US"), k: "Parts, all builds" }]; },
    draw(g, S, I) {
      const X = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, n = X.items.length, cols = Math.max(3, Math.ceil(Math.sqrt(n || 1))), cell = Math.min(w / (cols + 1.6), 62), ox = w / 2, oy = h * 0.3;
      const iso = (gx, gy) => [ox + (gx - gy) * cell * 0.86, oy + (gx + gy) * cell * 0.5];
      for (let k = -1; k <= cols + 1; k++) { const [a1, b1] = iso(k, -1), [a2, b2] = iso(k, cols + 1), [c1, d1] = iso(-1, k), [c2, d2] = iso(cols + 1, k); I.line(g, a1, b1, a2, b2, B, 1, 0.12); I.line(g, c1, d1, c2, d2, B, 1, 0.12); }
      const order = X.items.map((it, i) => ({ it, gx: i % cols, gy: Math.floor(i / cols) })).sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
      const grow = S.still ? 1 : I.ease(Math.min(1, S.t / 2)); let tallest = null;
      for (const { it, gx, gy } of order) { const ht = (it.s / 5) * cell * 1.6 * grow, [x, y] = iso(gx + 0.5, gy + 0.5), dx = cell * 0.36, dy = cell * 0.21, solid = it.s / 5;
        const top = [[x, y - dy - ht], [x + dx, y - ht], [x, y + dy - ht], [x - dx, y - ht]], base = [[x + dx, y], [x, y + dy], [x - dx, y]];
        const face = (pts, col, a) => { g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fillStyle = I.rgba(col, a); g.fill(); g.strokeStyle = I.rgba(A, 0.85); g.lineWidth = 1; g.stroke(); };
        if (it.s > 0) { face([[x - dx, y - ht], [x, y + dy - ht], [x, y + dy], [x - dx, y]], A, 0.12 + 0.35 * solid); face([[x + dx, y - ht], [x, y + dy - ht], [x, y + dy], [x + dx, y]], B, 0.1 + 0.3 * solid); }
        I.glow(g, A, it.s ? 10 : 0); face(top, it.s === 5 ? "#ffffff" : A, it.s ? 0.25 + 0.5 * solid : 0.04); I.noGlow(g);
        if (!it.s) { g.setLineDash([3, 3]); face(top, A, 0); g.setLineDash([]); }
        if (it.s && (!tallest || it.s > tallest.it.s)) tallest = { it, x, y: y - ht - dy }; }
      const pulse = S.still ? 0.8 : 0.6 + 0.4 * Math.sin(S.t * 3); if (tallest) { I.halo(g, tallest.x, tallest.y, 26, A, pulse); I.text(g, I.fit(g, tallest.it.t, w - 40, 11.5, 500), w / 2, h - 30, { size: 11.5, align: "center" }); I.text(g, tallest.it.next ? "Next: " + I.fit(g, tallest.it.next, w - 80, 10, 500) : X.D.STAGES[tallest.it.s], w / 2, h - 14, { size: 10, align: "center", color: A }); }
      else I.text(g, n ? `${n} inventions on the drawing board · start a build below` : "Tag an idea as an invention in Athenaeum and it lands here", w / 2, h - 16, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.85 });
    },
  });
})();
