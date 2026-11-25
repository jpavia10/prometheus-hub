/* Hearth signature (v2, 2026-11-25): the house in section, floor by floor, drawn from Hearth's own data. The roof over the unfinished
   attic, then the second floor, the first, and the ground level on the grade line. Each room is a cell that fills from the floor up as
   its renovation gets done (its projects' steps; the big deck counts its eight stages), the decks are drawn as plank platforms, and each
   cell carries what is in the room. Tap a room to open it (HEARTH.inspectRoom). */
(function () {
  let hit = [];
  PK.stage({
    label: "The house in section: every room's renovation progress and contents (tap a room)",
    data() {
      if (!window.HEARTH || !HEARTH.house) return null;
      return HEARTH.house();
    },
    readouts(X) {
      return [
        { v: X.facts.pct + "%", k: "Renovation done", tone: X.facts.pct === 100 ? "good" : "" },
        { v: "$" + Math.round(X.facts.value).toLocaleString("en-US"), k: `${X.facts.items} items recorded` },
        { v: X.facts.open, k: "Open steps", tone: X.facts.open ? "warn" : "good" },
      ];
    },
    draw(g, S, I) {
      const X = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, pad = 14;
      const floors = X.floors;
      const roofH = h * 0.15, bodyTop = pad + roofH, bottom = h - pad - 18, wallL = pad + 6, wallR = w - pad - 6;
      const bandH = [0.55, 1.15, 1.1, 0.9], sum = bandH.reduce((a, b) => a + b, 0), unit = (bottom - bodyTop) / sum;
      g.beginPath(); g.moveTo(wallL - 6, bodyTop); g.lineTo((wallL + wallR) / 2, pad); g.lineTo(wallR + 6, bodyTop); g.closePath();
      g.fillStyle = I.rgba(B, 0.08); g.fill(); g.strokeStyle = I.rgba(A, 0.7); g.lineWidth = 1.5; g.stroke();
      hit = []; let y = bodyTop;
      floors.forEach((F, fi) => {
        const bh = bandH[fi] * unit, rooms = F.rooms, n = Math.max(1, rooms.length), cw = (wallR - wallL) / n;
        I.line(g, wallL, y, wallR, y, A, 1, 0.35);
        I.text(g, F.name.toUpperCase(), wallL + 2, y + 10, { size: 8, weight: 700, color: "#cfd8ea", alpha: 0.6, spacing: 1.2 });
        rooms.forEach((r, i) => {
          const x = wallL + i * cw + 2, cy = y + 14, ch = Math.max(16, bh - 18), rw = cw - 4;
          const sel = S.pick && S.pick.id === r.id, pct = r.pct || 0, outdoor = r.type === "outdoor";
          g.fillStyle = I.rgba(outdoor ? "#c98a4a" : B, sel ? 0.22 : 0.07); g.fillRect(x, cy, rw, ch);
          if (pct > 0) { const fh = ch * pct / 100; g.fillStyle = I.rgba(pct === 100 ? "#7dffc0" : A, sel ? 0.5 : 0.32); g.fillRect(x, cy + ch - fh, rw, fh); }
          if (outdoor) for (let k = 1; k < 5; k++) I.line(g, x, cy + ch * k / 5, x + rw, cy + ch * k / 5, "#c98a4a", 1, 0.3);
          if (sel) I.glow(g, A, 12);
          g.strokeStyle = I.rgba(sel ? A : B, sel ? 1 : 0.5); g.lineWidth = sel ? 2 : 1; g.strokeRect(x, cy, rw, ch); I.noGlow(g);
          const small = rw < 58;
          I.text(g, I.fit(g, r.short || r.name, rw - 6, small ? 8.5 : 10, 600), x + rw / 2, cy + ch / 2 - (r.items ? 5 : 0), { size: small ? 8.5 : 10, weight: 600, align: "center" });
          if (r.items) I.text(g, I.fit(g, `${r.items} · $${Math.round(r.value).toLocaleString("en-US")}`, rw - 4, 8, 400), x + rw / 2, cy + ch / 2 + 8, { size: 8, align: "center", color: "#cfd8ea", alpha: 0.75 });
          if (r.pct != null && ch > 34) I.text(g, r.pct + "%", x + rw - 4, cy + 10, { size: 8, align: "right", color: pct === 100 ? "#7dffc0" : A, alpha: 0.9 });
          hit.push({ id: r.id, x, y: cy, w: rw, h: ch });
        });
        y += bh;
      });
      I.line(g, pad, bottom, w - pad, bottom, "#ffffff", 2, 0.55);
      for (let k = pad + 6; k < w - pad; k += 9) I.line(g, k, bottom + 2, k - 5, bottom + 8, "#cfd8ea", 1, 0.25);
      I.text(g, X.next ? "Next: " + I.fit(g, X.next, w - 70, 10, 500) : "Tap a room to open it", w / 2, h - 5, { size: 10, align: "center", color: A });
    },
    tap(x, y, S) {
      const z = hit.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
      S.pick = z ? { id: z.id } : null;
      if (window.HEARTH && HEARTH.inspectRoom) HEARTH.inspectRoom(z ? z.id : null);
    },
  });
})();
