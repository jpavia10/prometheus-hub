/* Mythos signature: five-act dramatic arc constellation linking canon entries, beats, and motifs. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "Five-act dramatic constellation for Mythos lore, beats, and motifs",
    data() {
      const D = window.MYTHOS ? window.MYTHOS.data() : { entries: [], beats: [], motifs: [] };
      const arcs = window.MYTHOS ? window.MYTHOS.ARCS : ["Spark", "Threshold", "Ordeal", "Revelation", "Return"];
      const covered = new Set((D.beats || []).map((b) => +b.arc || 0)).size;
      return { entries: D.entries, beats: D.beats, motifs: D.motifs, arcs, covered };
    },
    readouts(X) {
      return [
        { v: X.entries.length, k: "Lore & draft nodes" },
        { v: X.beats.length, k: "Story beats" },
        { v: X.motifs.length, k: "Lyrics & motifs" },
        { v: `${X.covered}/${X.arcs.length}`, k: "Acts charted", tone: X.covered >= 4 ? "good" : "" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w * 0.42, S.h * 0.42);
      const A = S.accent, B = S.accent2;
      I.halo(g, cx, cy, R * 1.65, A, 0.16);
      I.arc(g, cx, cy, R * 0.9, 0, Math.PI * 2, A, 1, 0.22);

      // Pentagon vertices for 5 narrative acts
      const pts = D.arcs.map((name, i) => {
        const ang = -Math.PI / 2 + (i / D.arcs.length) * Math.PI * 2 + (S.still ? 0 : Math.sin(S.t * 0.2) * 0.04);
        return { name, idx: i, x: cx + Math.cos(ang) * R * 0.9, y: cy + Math.sin(ang) * R * 0.9 };
      });
      g.save();
      g.strokeStyle = A;
      g.globalAlpha = 0.28;
      g.lineWidth = 1.2;
      g.beginPath();
      pts.forEach((p, idx) => (idx === 0 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y)));
      g.closePath();
      g.stroke();
      g.restore();

      pts.forEach((p) => {
        const has = D.beats.some((b) => (+b.arc || 0) === p.idx);
        I.halo(g, p.x, p.y, has ? 18 : 9, has ? B : A, has ? 0.75 : 0.25);
        I.dot(g, p.x, p.y, has ? 4.2 : 2.6, has ? "#ffffff" : A, has ? 0.95 : 0.55);
      });

      D.entries.slice(0, 12).forEach((e, i) => {
        const a = (i / Math.max(1, Math.min(12, D.entries.length))) * Math.PI * 2 + (S.still ? 0 : S.t * 0.12);
        const r = R * 0.46;
        I.dot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.2, "#eeb8ff", 0.78);
      });

      I.text(g, `${D.entries.length} LORE · ${D.beats.length} BEATS`, cx, cy - 4, { size: 12, weight: 600, align: "center", color: "#ffffff" });
      I.text(g, "5-ACT MYTHOS CONSTELLATION", cx, cy + 12, { size: 9, align: "center", color: A });
    },
  });
})();
