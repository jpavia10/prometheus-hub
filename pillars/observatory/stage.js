/* Observatory signature: the dome. Your subjects stand as stars along the sky's arc, brighter the more of your ideas they come from;
   each headline from the last scan is a meteor that has fallen toward its subject, newest brightest; the telescope sweeps the dome. */
(function () {
  const I = PK.ink, COL = ["#9c8cff", "#5ee7ff", "#ffc552", "#ff8fb8", "#7dffc0", "#ff9d5c", "#c9b8ea"];
  PK.stage({
    label: "Your subjects across the sky, with the latest signals falling toward them",
    data() { const D = window.OBSERVATORY ? OBSERVATORY.data() : null; return D; },
    readouts(D) { const v = D.notes.filter((n) => n.kind === "verified").length; return [{ v: D.subjects.length, k: "Subjects watched" }, { v: D.signals.length, k: D.scanned ? "Signals, last scan" : "Signals · press Scan" }, { v: `${v} / ${D.notes.length}`, k: "Your notes verified" }]; },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, cx = w / 2, cy = h * 0.97, R = w * 0.47, k = Math.min(1.9, (h * 0.86) / R), n = Math.max(1, D.subjects.length), A = S.accent;   // k stretches the dome to fill a tall frame
      const dome = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.1); dome.addColorStop(0, I.rgba(A, 0.18)); dome.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = dome; g.fillRect(0, 0, w, h);
      for (let j = 1; j <= 3; j++) { g.beginPath(); g.ellipse(cx, cy, R * j / 3, R * k * j / 3, 0, Math.PI, Math.PI * 2); g.strokeStyle = I.rgba(A, 0.12); g.lineWidth = 1; g.stroke(); }
      for (let j = 1; j < 6; j++) { const a = Math.PI + j / 6 * Math.PI; I.line(g, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R * k, A, 1, 0.08); }
      const rnd = I.rand(5); for (let i = 0; i < 70; i++) { const a = Math.PI + rnd() * Math.PI, r = rnd() * R; I.dot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r * k, rnd() * 1.1 + 0.2, "#ffffff", 0.2 + rnd() * 0.4); }
      const sweep = Math.PI + ((S.still ? 0.3 : S.t * 0.12) % 1) * Math.PI; I.glow(g, A, 14); I.line(g, cx, cy, cx + Math.cos(sweep) * R * 1.05, cy + Math.sin(sweep) * R * 1.05 * k, A, 1.5, 0.6); I.noGlow(g);
      const pos = D.subjects.map((s, i) => { const a = Math.PI + (i + 0.5) / n * Math.PI, r = R * (0.62 + 0.22 * (i % 2)); return { s, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * k, col: COL[i % COL.length] }; });
      const newest = D.signals.length ? new Date(D.signals[0].at).getTime() : 0;
      D.signals.slice(0, 40).forEach((x, k) => { const p = pos.find((q) => q.s.id === x.subject); if (!p) return; const r = I.rand(k * 7 + 3), a = r() * Math.PI * 2, d = 24 + r() * 46, fresh = newest ? Math.max(0.15, 1 - (newest - new Date(x.at).getTime()) / 6048e5) : 0.4;
        const fall = S.still ? 1 : Math.min(1, ((S.t * 0.5 + r()) % 2)), tx = p.x + Math.cos(a) * d * (1 - 0.6 * fall), ty = p.y + Math.sin(a) * d * (1 - 0.6 * fall);
        const tail = g.createLinearGradient(tx, ty, tx + Math.cos(a) * 18, ty + Math.sin(a) * 18); tail.addColorStop(0, I.rgba(p.col, 0.8 * fresh)); tail.addColorStop(1, I.rgba(p.col, 0)); g.strokeStyle = tail; g.lineWidth = 1.5; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(a) * 18, ty + Math.sin(a) * 18); g.stroke(); I.dot(g, tx, ty, 1.6, "#ffffff", fresh); });
      pos.forEach((p, i) => { const tw = S.still ? 1 : 0.8 + 0.2 * Math.sin(S.t * 2 + i), big = 6 + Math.min(10, (p.s.ideas || 2) * 0.9); I.halo(g, p.x, p.y, big * 3, p.col, 0.6 * tw); I.dot(g, p.x, p.y, 3, "#ffffff");
        I.text(g, I.fit(g, p.s.name, 110, 11, 600), p.x, p.y - 14, { size: 11, weight: 600, align: "center", color: p.col }); const c = D.signals.filter((x) => x.subject === p.s.id).length; if (c) I.text(g, c + " signals", p.x, p.y + 14, { size: 9, align: "center", color: "#cfd8ea", alpha: 0.75 }); });
      if (!D.subjects.length) I.text(g, "Add a subject below to start watching", cx, h * 0.5, { size: 11, align: "center", color: "#dfe6f5" });
      else if (!D.scanned) I.text(g, "Press Scan to bring in the latest signals", cx, h - 14, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.85 });
    },
  });
})();
