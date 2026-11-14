/* Polis signature: concentric jurisdiction radar (Local -> County -> State) plotting tracked watches. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "Jurisdictional civic watch radar across Local, County, and State levels",
    data() {
      const D = window.POLIS ? window.POLIS.data() : { watches: [], notes: [], directory: [] };
      const open = D.watches.filter((w) => w.status !== "resolved");
      const action = D.watches.filter((w) => w.status === "action-needed");
      return { watches: D.watches, open, action, notes: D.notes, dirCount: D.directory.length };
    },
    readouts(X) {
      return [
        { v: X.dirCount, k: "Public agencies indexed" },
        { v: X.open.length, k: "Open watches" },
        { v: X.action.length, k: "Action needed", tone: X.action.length ? "warn" : "good" },
        { v: X.notes.length, k: "Ballot & policy notes" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w * 0.44, S.h * 0.43);
      const A = S.accent, B = S.accent2;
      I.halo(g, cx, cy, R * 1.6, A, 0.16);
      [0.38, 0.68, 0.98].forEach((k) => I.arc(g, cx, cy, R * k, 0, Math.PI * 2, A, 1, 0.25));

      const ringOf = { Local: 0.38, County: 0.68, State: 0.98, Federal: 0.98 };
      D.watches.forEach((w, idx) => {
        const rr = R * (ringOf[w.jurisdiction] || 0.68);
        const ang = (idx / Math.max(1, D.watches.length)) * Math.PI * 2 + (S.still ? 0 : S.t * 0.1);
        const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
        const col = w.status === "action-needed" ? "#ffb8a0" : w.status === "resolved" ? "#7dffc0" : A;
        I.halo(g, x, y, 14, col, 0.7);
        I.dot(g, x, y, 3.4, col, 0.95);
      });

      const sweep = (S.still ? 0 : S.t * 0.45) % (Math.PI * 2);
      I.glow(g, B, 14);
      I.arc(g, cx, cy, R * 0.98, sweep, sweep + 0.55, B, 2, 0.75);
      I.noGlow(g);
      I.text(g, `${D.open.length} ACTIVE`, cx, cy - 6, { size: 14, weight: 600, align: "center", color: "#ffffff" });
      I.text(g, `${D.action.length} ACTION · ${D.dirCount} AGENCIES`, cx, cy + 12, { size: 10, align: "center", color: A });
    },
  });
})();
