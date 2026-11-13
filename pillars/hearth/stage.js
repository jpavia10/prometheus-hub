/* Hearth signature: the plan, drawn only from measurements. The deck to its specified size (23 x 10 ft, 21 courses of 2x6x12, rows
   alternating 11+12 and 5+12+6 with every joint on framing) under the house wall, its boards solid as the stages are done and dashed
   until then; above it, every room you have measured, to the same scale, lit by its projects and dotted with its items. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "The house plan from your measurements, with the deck to scale",
    data() { if (!window.HEARTH) return null; const D = HEARTH.data(), st = (id) => (D.deck[id] || {}).done; const done = HEARTH.DECK.stages.filter((s) => st(s.id)).length, next = HEARTH.DECK.stages.find((s) => !st(s.id));
      const measured = D.rooms.filter((r) => r.w > 0 && r.l > 0); return { D, st, done, next, measured, area: measured.reduce((s, r) => s + r.w * r.l, 0) }; },
    readouts(X) { return [{ v: `${X.done} / ${HEARTH.DECK.stages.length}`, k: "Deck stages done", tone: X.done === HEARTH.DECK.stages.length ? "good" : "" }, { v: X.measured.length ? Math.round(X.area).toLocaleString("en-US") + " ft²" : "—", k: `${X.measured.length} of ${X.D.rooms.length} rooms measured` }, { v: X.D.assets.length, k: "Items recorded" }]; },
    draw(g, S, I) {
      const X = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, DK = HEARTH.DECK, pad = 18;
      const rooms = X.measured.slice().sort((a, b) => (a.floor - b.floor) || (b.w * b.l - a.w * a.l)), rowW = Math.max(DK.widthFt, Math.sqrt(X.area || 1) * 1.4);
      let x = 0, y = 0, rowH = 0; const placed = rooms.map((r) => { if (x > 0 && x + r.w > rowW) { x = 0; y += rowH + 1.5; rowH = 0; } const p = { r, x, y }; x += r.w + 1.5; rowH = Math.max(rowH, r.l); return p; }); const roomsH = placed.length ? y + rowH + 3 : 0;
      const totalW = Math.max(rowW, DK.widthFt), totalH = roomsH + DK.depthFt + 2, sc = Math.min((w - pad * 2) / totalW, (h - pad * 2 - 34) / totalH), ox = (w - totalW * sc) / 2, oy = pad + 4 + (h - pad * 2 - 34 - totalH * sc) / 2;
      for (let gx = 0; gx <= totalW; gx += 1) I.line(g, ox + gx * sc, oy, ox + gx * sc, oy + totalH * sc, B, 1, gx % 5 ? 0.04 : 0.1);
      for (let gy = 0; gy <= totalH; gy += 1) I.line(g, ox, oy + gy * sc, ox + totalW * sc, oy + gy * sc, B, 1, gy % 5 ? 0.04 : 0.1);
      placed.forEach(({ r, x, y }, i) => { const rx = ox + x * sc, ry = oy + y * sc, rw = r.w * sc, rh = r.l * sc, busy = X.D.projects.some((p) => p.room === r.id && !p.done), items = X.D.assets.filter((a) => a.room === r.id).length, pulse = S.still ? 0.8 : 0.6 + 0.4 * Math.sin(S.t * 2 + i);
        g.fillStyle = I.rgba(busy ? A : B, busy ? 0.16 * pulse + 0.06 : 0.07); g.fillRect(rx, ry, rw, rh); if (busy) I.glow(g, A, 12); g.strokeStyle = I.rgba(busy ? A : B, 0.9); g.lineWidth = 1.5; g.strokeRect(rx, ry, rw, rh); I.noGlow(g);
        I.text(g, I.fit(g, r.name, rw - 6, 10.5, 600), rx + rw / 2, ry + rh / 2 - 6, { size: 10.5, weight: 600, align: "center" }); I.text(g, `${r.w}×${r.l}`, rx + rw / 2, ry + rh / 2 + 8, { size: 9, align: "center", color: "#cfd8ea", alpha: 0.7 });
        for (let k = 0; k < Math.min(items, 12); k++) I.dot(g, rx + 5 + (k % 6) * 6, ry + rh - 6 - Math.floor(k / 6) * 6, 1.8, "#ffffff", 0.85); });
      const dx = ox + (totalW - DK.widthFt) * sc / 2, dy = oy + roomsH * sc + 1 * sc, dw = DK.widthFt * sc, dd = DK.depthFt * sc, row = dd / DK.courses;
      I.glow(g, "#ffffff", 8); I.line(g, dx - 6, dy, dx + dw + 6, dy, "#ffffff", 3, 0.85); I.noGlow(g); I.text(g, "HOUSE WALL · LEDGER", dx + dw / 2, dy - 8, { size: 8.5, weight: 700, align: "center", color: "#ffffff", alpha: 0.75, spacing: 1.5 });
      const all = X.st("courses"), first = X.st("first-board"), sweep = S.still ? -1 : ((S.t * 0.25) % 1.4) * dw;
      for (let i = 0; i < DK.courses; i++) { const lens = i % 2 ? [5, 12, 6] : [11, 12]; let bx = dx; const by = dy + 2 + i * row;
        lens.forEach((L, k) => { const bw = (L / DK.widthFt) * dw, solid = all || (first && i === 0 && k === 0), lit = sweep >= 0 && Math.abs(bx + bw / 2 - dx - sweep) < bw / 2 + 10;
          if (solid) { g.fillStyle = I.rgba(I.mix("#c98a4a", A, 0.35), lit ? 1 : 0.85); g.fillRect(bx + 0.5, by + 0.4, bw - 1, row - 0.8); }
          else { g.setLineDash([3, 3]); g.strokeStyle = I.rgba(B, lit ? 0.75 : 0.35); g.lineWidth = 1; g.strokeRect(bx + 0.5, by + 0.4, bw - 1, row - 0.8); g.setLineDash([]); }
          bx += bw; }); }
      const railCol = X.st("railing") ? "#7dffc0" : B, dashed = !X.st("railing");
      if (dashed) g.setLineDash([5, 4]); I.line(g, dx, dy, dx, dy + dd + 4, railCol, 2, 0.8); I.line(g, dx, dy + dd + 4, dx + dw, dy + dd + 4, railCol, 2, 0.8); g.setLineDash([]); I.line(g, dx + dw, dy, dx + dw, dy + dd + 4, "#7dffc0", 2, 0.9);   // the 2x8 bottom rail on the right is already in
      for (let k = 0; k <= 4; k++) { const px = dx + dw * k / 4; I.dot(g, px, dy + dd + 4, 3, railCol, 0.9); }
      I.text(g, `${DK.widthFt} ft`, dx + dw / 2, dy + dd + 16, { size: 9, align: "center", color: "#cfd8ea", alpha: 0.7 }); I.text(g, `${DK.depthFt} ft`, dx + dw + 6, dy + dd / 2, { size: 9, color: "#cfd8ea", alpha: 0.7 });
      I.text(g, X.next ? "Next: " + I.fit(g, X.next.name, w - 70, 10.5, 500) : "The deck is done", w / 2, h - 12, { size: 10.5, align: "center", color: X.next ? A : "#7dffc0" });
      if (!X.D.rooms.length) I.text(g, "Add rooms with their sizes below and they appear here, to scale", w / 2, h - 28, { size: 10, align: "center", color: "#dfe6f5", alpha: 0.8 });
    },
  });
})();
