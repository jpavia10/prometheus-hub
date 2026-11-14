/* Ludus signature: the launch orbit around the GTA VI release beacon & library constellation. */
(function () {
  const S = PK.store("games"), I = PK.ink;
  const ST_COL = { playing: "#5ee7ff", preloaded: "#ffb347", finished: "#7dffc0", dropped: "#ff7a8c", wishlist: "#b9a2ff", unknown: "#8b93a7" };
  PK.stage({
    label: "GTA VI orbital launch ring & game constellation",
    data() {
      const D = window.GAMES_DATA || { games: [], now: {} };
      const cd = D.now.countdown || { title: "GTA VI", date: "2026-11-18" };
      const daysLeft = Math.max(0, Math.ceil((new Date(cd.date + "T00:00:00") - Date.now()) / 864e5));
      const games = D.games || [];
      const active = games.filter((g) => g.status === "playing" || g.status === "preloaded").length;
      const backlog = (S.get("backlog", []) || []).length;
      return { cd, daysLeft, games, active, backlog };
    },
    readouts(X) {
      return [
        { v: X.daysLeft === 0 ? "LIVE" : X.daysLeft + " d", k: X.cd.title + " unlock", tone: X.daysLeft <= 14 ? "good" : "" },
        { v: X.games.length, k: "Verified library titles" },
        { v: `${X.active} · +${X.backlog}`, k: "Active · Personal queue" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w * 0.44, S.h * 0.42);
      const A = S.accent, B = S.accent2;
      I.halo(g, cx, cy, R * 1.8, A, 0.2);
      I.arc(g, cx, cy, R, 0, Math.PI * 2, B, 1.2, 0.25);
      I.arc(g, cx, cy, R * 0.62, 0, Math.PI * 2, A, 1, 0.22);

      // Orbital progress toward launch (scaled across 365-day arc)
      const pct = 1 - Math.min(1, D.daysLeft / 365);
      const sweepEnd = -Math.PI / 2 + pct * Math.PI * 2;
      I.glow(g, A, 18);
      I.arc(g, cx, cy, R, -Math.PI / 2, sweepEnd, A, 2.5, 0.9);
      I.noGlow(g);

      D.games.forEach((gm, i) => {
        const a = (i / Math.max(1, D.games.length)) * Math.PI * 2 + (S.still ? 0 : S.t * 0.08);
        const rr = gm.status === "playing" || gm.status === "preloaded" ? R * 0.62 : R * 0.85;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        const col = ST_COL[gm.status] || "#8b93a7";
        I.halo(g, x, y, gm.status === "preloaded" ? 16 : 9, col, 0.75);
        I.dot(g, x, y, gm.status === "preloaded" ? 3.5 : 2.3, col, 0.95);
      });

      I.text(g, D.cd.title, cx, cy - 8, { size: 15, weight: 600, align: "center", color: "#ffffff" });
      I.text(g, D.daysLeft ? `${D.daysLeft}d · ${D.cd.date}` : "UNLOCKED", cx, cy + 11, { size: 10, align: "center", color: A });
    },
  });
})();
