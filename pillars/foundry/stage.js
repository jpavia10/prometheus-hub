/* Foundry signature (revamped 2026-11-24, owner: "I want the foundry revamped"): the drafting table. The invention on the table is
   drawn line by line as its concept sketch (blueprints.js), a pen of light at the tip; its title block sits under the drawing and the
   build line runs along the bottom: drawing board, research, design, prototype, test, built, with every invention on its stage.
   Tap the left or right of the table to turn the sheet. (Before: every invention was the same empty outline on an isometric grid.) */
(function () {
  const len = (pts) => { let L = 0; for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return L; };
  PK.stage({
    label: "The drafting table: the invention on the table drawn as its concept sketch; tap the sides to turn the sheet",
    data() { const D = window.FOUNDRY ? FOUNDRY.data() : null; if (!D) return null; const items = FOUNDRY.table(), i = FOUNDRY.focus(); return { D, items, i, it: items[i] || null, since: FOUNDRY.since() }; },
    readouts(X) { return [{ v: X.D.board.length, k: "On the drawing board" }, { v: X.D.projects.length, k: "Builds on the bench" }, { v: "$" + Math.round(X.D.cost).toLocaleString("en-US"), k: "Parts, all builds" }]; },
    tap(x, y, S) { if (!window.FOUNDRY) return; if (x < S.w * 0.3) FOUNDRY.focus(FOUNDRY.focus() - 1, true); else if (x > S.w * 0.7) FOUNDRY.focus(FOUNDRY.focus() + 1, true); },
    draw(g, S, I) {
      const X = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2;
      if (!X.it) { I.text(g, "Tag an idea as an invention in Athenaeum and it lands on this table", w / 2, h / 2, { size: 11, align: "center", color: "#dfe6f5", alpha: 0.85 }); return; }
      const dw = window.FOUNDRY_DWG ? FOUNDRY_DWG.forTitle(X.it.t) : null; if (!dw) return;
      if (!dw.L) { dw.L = dw.P.map((p) => len(p.pts)); dw.total = dw.L.reduce((a, b) => a + b, 0) || 1; }
      const narrow = w < 520, top = 34, bot = narrow ? 92 : 84, side = narrow ? 14 : 34, bw = w - side * 2, bh = h - top - bot;
      const sc = Math.min(bw / 2.15, bh / 1.34), cx = side + bw / 2, cy = top + bh / 2, M = (p) => [cx + p[0] * sc, cy + p[1] * sc];
      /* the sheet: a fine grid and a border, inside the kit's frame */
      g.save(); g.strokeStyle = B; g.lineWidth = 1;
      const gx0 = cx - sc * 1.06, gx1 = cx + sc * 1.06, gy0 = cy - sc * 0.66, gy1 = cy + sc * 0.66, step = sc * 0.1;
      g.globalAlpha = 0.07; g.beginPath(); for (let x = gx0; x <= gx1 + 0.5; x += step) { g.moveTo(x, gy0); g.lineTo(x, gy1); } for (let y = gy0; y <= gy1 + 0.5; y += step) { g.moveTo(gx0, y); g.lineTo(gx1, y); } g.stroke();
      g.globalAlpha = 0.28; g.strokeRect(gx0, gy0, gx1 - gx0, gy1 - gy0); g.restore();
      /* the drawing, revealed by the pen */
      const age = S.still ? 99 : (Date.now() - (X.since || 0)) / 1000, k = Math.min(1, age / 2.6), e = 1 - Math.pow(1 - k, 2.2);
      let budget = e * dw.total, tip = null, doneIx = dw.P.length;
      for (let n = 0; n < dw.P.length; n++) {
        if (budget <= 0) { doneIx = n; break; }
        const pr = dw.P[n], pts = pr.pts.map(M), main = !pr.tone; g.save();
        g.strokeStyle = main ? A : B; g.globalAlpha = main ? 0.95 : 0.6; g.lineWidth = (main ? 1.35 : 0.9) * (pr.w || 1); g.lineJoin = g.lineCap = "round";
        if (pr.dash) g.setLineDash([4, 4]); if (main && !S.lite) I.glow(g, A, 6);
        g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); let rem = budget * sc;
        for (let q = 1; q < pts.length; q++) { const sl = Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]);
          if (rem >= sl) { g.lineTo(pts[q][0], pts[q][1]); rem -= sl; } else { const f = sl ? rem / sl : 0, tx = pts[q - 1][0] + (pts[q][0] - pts[q - 1][0]) * f, ty = pts[q - 1][1] + (pts[q][1] - pts[q - 1][1]) * f; g.lineTo(tx, ty); tip = [tx, ty]; rem = 0; break; } }
        g.stroke(); I.noGlow(g); g.restore(); budget -= dw.L[n];
      }
      /* the names, each once its leader is drawn; words for size, never invented numbers */
      for (const t of dw.T) { if (t.after > doneIx && k < 1) continue; const [x, y] = M([t.x, t.y]), a = S.still ? 1 : Math.min(1, (age - 2.6 * (t.after / dw.P.length)) * 2.5);
        if (a <= 0) continue; const fs = narrow ? 9.5 : 10.5; g.font = `500 ${fs}px Outfit, system-ui, sans-serif`; const tw = g.measureText(t.text).width;
        let lx = x + (t.align === "left" ? 4 : t.align === "right" ? -4 : 0); const l0 = t.align === "left" ? lx : t.align === "right" ? lx - tw : lx - tw / 2;
        lx += Math.max(0, gx0 + 4 - l0) + Math.min(0, gx1 - 4 - (l0 + tw));                 // a name never leaves the sheet
        I.text(g, t.text, lx, y - 1, { size: fs, align: t.align, color: t.dim ? B : "#e8f1ff", alpha: 0.9 * a, weight: 500 }); }
      if (tip && k < 1) I.halo(g, tip[0], tip[1], 12, A, 0.95);
      /* a slow scan once the sheet is drawn */
      if (k >= 1 && !S.still) { const sy = gy0 + ((S.t * 0.12) % 1) * (gy1 - gy0); g.save(); const gr = g.createLinearGradient(0, sy - 14, 0, sy + 2); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, I.rgba(A, 0.18));
        g.fillStyle = gr; g.fillRect(gx0, sy - 14, gx1 - gx0, 16); g.restore(); }
      /* the title block: drawing number, the invention, its state */
      const ty = h - bot + 10, n = X.i + 1, of = X.items.length, stamp = X.it.s ? X.D.STAGES[X.it.s].toUpperCase() : "CONCEPT";
      g.save(); g.strokeStyle = A; g.globalAlpha = 0.5; g.lineWidth = 1; g.strokeRect(side, ty, w - side * 2, 30); g.fillStyle = I.rgba(A, 0.08); g.fillRect(side, ty, w - side * 2, 30); g.restore();
      I.text(g, `DWG-${String(n).padStart(2, "0")}/${of}`, side + 8, ty + 10, { size: 9, color: A, weight: 600, spacing: 1.2 });
      I.text(g, I.fit(g, X.it.t, w - side * 2 - 150, narrow ? 11 : 12.5, 500), side + 8, ty + 23, { size: narrow ? 11 : 12.5, color: "#f2f6ff", weight: 500 });
      I.text(g, stamp, w - side - 8, ty + 10, { size: 9, align: "right", color: A, weight: 700, spacing: 1.6 });
      I.text(g, "concept sketch · not to scale", w - side - 8, ty + 23, { size: 8.5, align: "right", color: "#cfd9ee", alpha: 0.6 });
      /* the build line: six stages, every invention a dot on its stage, the one on the table lit */
      const ly = h - 22, lx0 = side + 6, lx1 = w - side - 6, st = X.D.STAGES, sx = (s) => lx0 + (s / (st.length - 1)) * (lx1 - lx0);
      g.save(); g.strokeStyle = B; g.globalAlpha = 0.35; g.lineWidth = 1; g.beginPath(); g.moveTo(lx0, ly); g.lineTo(lx1, ly); g.stroke(); g.restore();
      const per = st.map(() => 0);
      X.items.forEach((it, j) => { const s = it.s || 0, x = sx(s), y = ly - 6 - per[s] * 4; per[s]++; g.save(); g.fillStyle = j === X.i ? "#ffffff" : A; g.globalAlpha = j === X.i ? 1 : 0.55; g.beginPath(); g.arc(x, y, j === X.i ? 2.6 : 1.6, 0, Math.PI * 2); g.fill(); g.restore(); });
      st.forEach((name, s) => { const x = sx(s); I.line(g, x, ly - 3, x, ly + 3, B, 1, 0.6); const short = narrow ? name.replace("Drawing board", "Board").replace("Prototype", "Proto") : name;
        I.text(g, short, x, ly + 13, { size: 8.5, align: s === 0 ? "left" : s === st.length - 1 ? "right" : "center", color: per[s] ? A : "#c9d3e6", alpha: per[s] ? 0.95 : 0.55, weight: 600 }); });
      const cur = X.it.s || 0; I.halo(g, sx(cur), ly, 9, A, S.still ? 0.7 : 0.55 + 0.35 * Math.sin(S.t * 3));
      /* turn-the-sheet marks */
      if (of > 1) { I.text(g, "‹", side - (narrow ? 6 : 16), cy, { size: 22, align: "center", color: A, alpha: 0.5 }); I.text(g, "›", w - side + (narrow ? 6 : 16), cy, { size: 22, align: "center", color: A, alpha: 0.5 }); }
    },
  });
})();
