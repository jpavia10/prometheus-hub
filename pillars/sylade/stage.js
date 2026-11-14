/* Sylade signature: the twin mark. Two interlocked rings (the one name many AIs share) turning slowly, with the three public channels
   as lights on their orbit. Presence only: the readouts are the channels themselves. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "The shared mark and its three public channels",
    data() { return { ch: (window.SYLADE && SYLADE.CH) || [] }; },
    readouts(D) { return [{ v: D.ch.length, k: "Public channels" }, { v: "Paused", k: "Fleet Command" }, { v: "None", k: "Data kept here" }]; },
    draw(g, S, I) {
      const cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w, S.h) * 0.24, A = S.accent, B = S.accent2, t = S.still ? 0.8 : S.t;
      I.halo(g, cx, cy, R * 2.6, A, 0.2);
      for (const [dx, col, ph] of [[-R * 0.42, A, 0], [R * 0.42, B, Math.PI]]) { g.save(); g.translate(cx + dx, cy); g.rotate(t * 0.25 + ph); I.glow(g, col, 18); g.beginPath(); g.ellipse(0, 0, R, R * 0.92, 0, 0, Math.PI * 2); g.strokeStyle = I.rgba(col, 0.95); g.lineWidth = 3; g.stroke(); I.noGlow(g); g.restore(); }
      const OR = R * 1.75; g.beginPath(); g.ellipse(cx, cy, OR, OR * 0.34, 0, 0, Math.PI * 2); g.strokeStyle = I.rgba("#ffffff", 0.12); g.lineWidth = 1; g.stroke();
      S.data.ch.forEach(([k, name], i) => { const a = t * 0.3 + i / 3 * Math.PI * 2, x = cx + Math.cos(a) * OR, y = cy + Math.sin(a) * OR * 0.34, front = Math.sin(a) > 0;
        I.halo(g, x, y, front ? 18 : 10, i === 1 ? B : A, front ? 0.9 : 0.4); I.dot(g, x, y, front ? 3.5 : 2.2, "#ffffff", front ? 1 : 0.5); if (front) I.text(g, k.toUpperCase(), x, y - 14, { size: 9, weight: 700, align: "center", color: "#ffffff", spacing: 2 }); });
      I.text(g, "SYLADE", cx, S.h - 16, { size: 12, weight: 600, align: "center", spacing: 6 });
    },
  });
})();
