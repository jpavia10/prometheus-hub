/* Hearth signature: interactive scale architectural plan.
   - 2nd-floor deck (23 x 10 ft, 21 courses of 2x6x12 staggered 11+12 / 5+12+6, solid when done, dashed when planned)
   - All measured rooms color-coded by Renovation Phase (P1 active amber, P2..P5 slated)
   - Click any room or the deck on canvas to inspect open field requests and notes! */
(function () {
  const PHASE_COL = { 1: "#ffb347", 2: "#5ee7ff", 3: "#b9a2ff", 4: "#7dffc0", 5: "#f0b9c8" };
  let hitZones = [];

  PK.stage({
    label: "Measured architectural plan & 2nd-floor deck (tap a room to inspect)",
    data() {
      if (!window.HEARTH) return null;
      const D = HEARTH.data();
      const st = (id) => (D.deck[id] || {}).done;
      const done = HEARTH.DECK.stages.filter((s) => st(s.id)).length;
      const next = HEARTH.DECK.stages.find((s) => !st(s.id));
      const measured = D.rooms.filter((r) => r.w > 0 && r.l > 0);
      const openReqs = (D.requests || []).filter((r) => r.status !== "resolved").length;
      return { D, st, done, next, measured, openReqs, area: measured.reduce((s, r) => s + r.w * r.l, 0) };
    },
    readouts(X) {
      return [
        { v: `${X.done} / ${HEARTH.DECK.stages.length}`, k: "Deck stages done", tone: X.done === HEARTH.DECK.stages.length ? "good" : "" },
        { v: X.measured.length ? Math.round(X.area).toLocaleString("en-US") + " ft²" : "—", k: `${X.measured.length} / ${X.D.rooms.length} measured` },
        { v: X.openReqs, k: "Open field requests", tone: X.openReqs > 0 ? "warn" : "good" },
      ];
    },
    draw(g, S, I) {
      const X = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, DK = HEARTH.DECK, pad = 18;
      // Only show interior rooms separate from deck2f so deck2f isn't drawn twice
      const rooms = X.measured.filter((r) => r.id !== "deck2f").slice().sort((a, b) => (a.floor - b.floor) || (b.w * b.l - a.w * a.l));
      const rowW = Math.max(DK.widthFt, Math.sqrt(X.area || 1) * 1.4);
      let x = 0, y = 0, rowH = 0;
      const placed = rooms.map((r) => {
        if (x > 0 && x + r.w > rowW) { x = 0; y += rowH + 1.5; rowH = 0; }
        const p = { r, x, y }; x += r.w + 1.5; rowH = Math.max(rowH, r.l); return p;
      });
      const roomsH = placed.length ? y + rowH + 3 : 0;
      const totalW = Math.max(rowW, DK.widthFt), totalH = roomsH + DK.depthFt + 2.5;
      const sc = Math.min((w - pad * 2) / totalW, (h - pad * 2 - 36) / totalH);
      const ox = (w - totalW * sc) / 2, oy = pad + 4 + (h - pad * 2 - 36 - totalH * sc) / 2;

      for (let gx = 0; gx <= totalW; gx += 1) I.line(g, ox + gx * sc, oy, ox + gx * sc, oy + totalH * sc, B, 1, gx % 5 ? 0.04 : 0.1);
      for (let gy = 0; gy <= totalH; gy += 1) I.line(g, ox, oy + gy * sc, ox + totalW * sc, oy + gy * sc, B, 1, gy % 5 ? 0.04 : 0.1);

      hitZones = [];
      placed.forEach(({ r, x, y }, i) => {
        const rx = ox + x * sc, ry = oy + y * sc, rw = r.w * sc, rh = r.l * sc;
        const pCol = PHASE_COL[r.phase] || B;
        const selected = S.pick && S.pick.id === r.id;
        const pulse = S.still ? 0.8 : 0.65 + 0.35 * Math.sin(S.t * 2 + i);
        g.fillStyle = I.rgba(pCol, selected ? 0.28 : r.phase ? 0.14 * pulse : 0.07);
        g.fillRect(rx, ry, rw, rh);
        if (selected || r.phase) I.glow(g, pCol, selected ? 16 : 8);
        g.strokeStyle = I.rgba(pCol, selected ? 1 : 0.85);
        g.lineWidth = selected ? 2.2 : 1.4;
        g.strokeRect(rx, ry, rw, rh);
        I.noGlow(g);
        I.text(g, I.fit(g, r.name, rw - 6, 10.5, 600), rx + rw / 2, ry + rh / 2 - 6, { size: 10.5, weight: 600, align: "center" });
        I.text(g, `${r.w}×${r.l}${r.phase ? ` · P${r.phase}` : ""}`, rx + rw / 2, ry + rh / 2 + 8, { size: 9, align: "center", color: "#cfd8ea", alpha: 0.8 });
        hitZones.push({ id: r.id, x: rx, y: ry, w: rw, h: rh });
      });

      const dx = ox + (totalW - DK.widthFt) * sc / 2, dy = oy + roomsH * sc + sc, dw = DK.widthFt * sc, dd = DK.depthFt * sc, row = dd / DK.courses;
      hitZones.push({ id: "deck2f", x: dx, y: dy, w: dw, h: dd });
      I.glow(g, "#ffffff", 8); I.line(g, dx - 6, dy, dx + dw + 6, dy, "#ffffff", 3, 0.85); I.noGlow(g);
      I.text(g, "HOUSE WALL · LEDGER (2ND FLOOR DECK)", dx + dw / 2, dy - 8, { size: 8.5, weight: 700, align: "center", color: "#ffffff", alpha: 0.78, spacing: 1.4 });

      const all = X.st("courses"), first = X.st("first-board"), sweep = S.still ? -1 : ((S.t * 0.25) % 1.4) * dw;
      for (let i = 0; i < DK.courses; i++) {
        const lens = i % 2 ? [5, 12, 6] : [11, 12];
        let bx = dx; const by = dy + 2 + i * row;
        lens.forEach((L, k) => {
          const bw = (L / DK.widthFt) * dw, solid = all || (first && i === 0 && k === 0);
          const lit = sweep >= 0 && Math.abs(bx + bw / 2 - dx - sweep) < bw / 2 + 10;
          if (solid) { g.fillStyle = I.rgba(I.mix("#c98a4a", A, 0.35), lit ? 1 : 0.85); g.fillRect(bx + 0.5, by + 0.4, bw - 1, row - 0.8); }
          else { g.setLineDash([3, 3]); g.strokeStyle = I.rgba(B, lit ? 0.75 : 0.35); g.lineWidth = 1; g.strokeRect(bx + 0.5, by + 0.4, bw - 1, row - 0.8); g.setLineDash([]); }
          bx += bw;
        });
      }

      const railCol = X.st("railing") ? "#7dffc0" : B;
      if (!X.st("railing")) g.setLineDash([5, 4]);
      I.line(g, dx, dy, dx, dy + dd + 4, railCol, 2, 0.8);
      I.line(g, dx, dy + dd + 4, dx + dw, dy + dd + 4, railCol, 2, 0.8);
      g.setLineDash([]);
      I.line(g, dx + dw, dy, dx + dw, dy + dd + 4, "#7dffc0", 2, 0.9);
      for (let k = 0; k <= 4; k++) I.dot(g, dx + dw * k / 4, dy + dd + 4, 3, railCol, 0.9);

      I.text(g, `${DK.widthFt} ft`, dx + dw / 2, dy + dd + 16, { size: 9, align: "center", color: "#cfd8ea", alpha: 0.75 });
      I.text(g, `${DK.depthFt} ft`, dx + dw + 6, dy + dd / 2, { size: 9, color: "#cfd8ea", alpha: 0.75 });
      I.text(g, X.next ? "Next: " + I.fit(g, X.next.name, w - 70, 10.5, 500) : "2nd-floor deck complete", w / 2, h - 12, { size: 10.5, align: "center", color: X.next ? A : "#7dffc0" });
    },
    tap(x, y, S) {
      const hit = hitZones.find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);
      S.pick = hit ? { id: hit.id } : null;
      if (window.HEARTH && HEARTH.inspectRoom) HEARTH.inspectRoom(hit ? hit.id : null);
    },
  });
})();
