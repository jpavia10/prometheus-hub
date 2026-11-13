/* Forge signature: the crucibles. One per AI, filled with molten metal to its average score out of ten (from Titan's ledger); a white
   line marks its last ten; embers rise for every task still open; a cracked rim when it is on probation. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "Each AI as a crucible filled to its average score",
    data() { const D = window.FORGE ? FORGE.data() : null; if (!D) return null; const show = D.per.filter((p) => p.n || p.open.length || p.mine.length); return { D, show, open: D.tasks.filter((t) => t.state !== "done").length + D.assignments.filter((a) => a.state !== "reviewed").length }; },
    readouts(X) { const all = X.D.scores, avg = all.length ? all.reduce((s, x) => s + x.score, 0) / all.length : null, best = X.show.filter((p) => p.recent != null).sort((a, b) => b.recent - a.recent)[0];
      return [{ v: X.open, k: "Tasks out now" }, { v: all.length ? all.length : "—", k: all.length ? "Submissions scored" : "Scores loading" }, { v: best ? best.ai : "—", k: best ? `Best, last 10 · ${best.recent.toFixed(1)}` : "Best recent" }]; },
    draw(g, S, I) {
      const X = S.data, list = X.show.length ? X.show : ["Grok", "Gemini", "Muse", "ChatGPT"].map((ai) => ({ ai, avg: null, recent: null, open: [], mine: [], n: 0 })), n = list.length, w = S.w, h = S.h, gap = w / n, top = h * 0.26, bot = h - 46, A = S.accent;
      const floor = g.createLinearGradient(0, bot - 20, 0, h); floor.addColorStop(0, "rgba(0,0,0,0)"); floor.addColorStop(1, I.rgba(A, 0.25)); g.fillStyle = floor; g.fillRect(0, bot - 20, w, h);
      list.forEach((p, i) => { const cx = gap * (i + 0.5), cw = Math.min(64, gap * 0.62), lvl = p.avg == null ? 0 : p.avg / 10, grow = S.still ? 1 : I.ease(Math.min(1, S.t / 1.8 - i * 0.08)), fillTop = bot - (bot - top) * lvl * grow;
        const heat = I.mix("#ff3d1f", "#ffe9a8", lvl), body = () => { g.beginPath(); g.moveTo(cx - cw / 2, top); g.lineTo(cx - cw * 0.38, bot); g.quadraticCurveTo(cx, bot + 14, cx + cw * 0.38, bot); g.lineTo(cx + cw / 2, top); };
        g.save(); body(); g.clip(); const m = g.createLinearGradient(0, fillTop, 0, bot + 14); m.addColorStop(0, I.rgba(heat, 1)); m.addColorStop(1, I.rgba("#ff3d1f", 0.9)); g.fillStyle = m; g.fillRect(cx - cw, fillTop, cw * 2, bot - fillTop + 20);
        if (!S.still) for (let k = 0; k < 3; k++) { const yy = fillTop + 3 + Math.sin(S.t * 2 + k + i) * 2; I.line(g, cx - cw / 2, yy + k * 4, cx + cw / 2, yy + k * 4 + Math.sin(S.t + k) * 2, "#ffffff", 1, 0.18); } g.restore();
        if (lvl) I.halo(g, cx, fillTop, cw * 1.4, heat, 0.55);
        I.glow(g, p.probation ? "#ff7a8c" : A, 12); body(); g.strokeStyle = I.rgba(p.probation ? "#ff7a8c" : "#ffd36b", 0.9); g.lineWidth = 2; g.stroke(); I.noGlow(g);
        if (p.probation) { I.line(g, cx + cw * 0.3, top, cx + cw * 0.18, top + 10, "#ff7a8c", 1.5, 0.9); I.line(g, cx + cw * 0.18, top + 10, cx + cw * 0.26, top + 18, "#ff7a8c", 1.5, 0.9); }
        if (p.recent != null) { const ry = bot - (bot - top) * (p.recent / 10); I.line(g, cx - cw / 2 - 6, ry, cx + cw / 2 + 6, ry, "#ffffff", 1.5, 0.85); }
        const embers = p.open.length + p.mine.length; for (let k = 0; k < Math.min(14, embers * 2); k++) { const r = I.rand(i * 99 + k)(), life = S.still ? r : ((S.t * (0.25 + r * 0.3) + r) % 1), ex = cx + (r - 0.5) * cw * 0.8 + Math.sin(S.t * 2 + k) * 4, ey = top - life * (top - 8);
          I.halo(g, ex, ey, 6, "#ffb347", (1 - life) * 0.9); I.dot(g, ex, ey, 1.4, "#fff4d6", 1 - life); }
        I.text(g, p.ai, cx, bot + 22, { size: 11.5, weight: 600, align: "center" });
        I.text(g, p.avg == null ? (p.open.length ? p.open.length + " open" : "no scores") : p.avg.toFixed(1) + " / 10", cx, bot + 37, { size: 10, align: "center", color: lvl ? heat : "#cfd8ea", alpha: 0.9 }); });
    },
  });
})();
