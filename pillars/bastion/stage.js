/* Bastion signature: the shield. One sector per scenario (the 72-hour bag, the car kit, sheltering at home, the Red Cross baseline),
   each lit from the centre out by how much of its checklist is done; around the rim, what you store, and a warning spark for anything
   that expires within 60 days. */
(function () {
  const S = PK.store("bastion"), I = PK.ink;
  PK.stage({
    label: "Readiness for each scenario, from your own checklists",
    data() { const sc = window.BASTION_SCENARIOS || {}, checks = S.get("checks", {}), today = I.today(), items = S.list("items");
      const parts = Object.entries(sc).map(([name, list]) => ({ name, total: list.length, done: list.filter((e) => checks[name] && checks[name][e]).length }));
      const soon = items.filter((it) => it.expiry && I.days(today, it.expiry) <= 60);
      return { parts, items, soon, overall: parts.length ? Math.round(parts.reduce((s, p) => s + p.done / (p.total || 1), 0) / parts.length * 100) : 0, weight: window.BASTION && items.length ? BASTION.fmtWeight(BASTION.totalWeight(items).totalOz) : "" }; },
    readouts(D) { return [{ v: D.overall + "%", k: "Ready, all scenarios", tone: D.overall >= 80 ? "good" : D.overall < 40 ? "warn" : "" }, { v: D.items.length, k: "Items stored" + (D.weight ? " · " + D.weight : "") }, { v: D.soon.length, k: "Expire within 60 days", tone: D.soon.length ? "warn" : "" }]; },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2 + 4, R = Math.min(S.w, S.h) * 0.4, A = S.accent, B = S.accent2, n = Math.max(1, D.parts.length), hex = (r) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + k * Math.PI / 3; k ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); };
      I.halo(g, cx, cy, R * 1.7, A, 0.2);
      g.save(); hex(R); g.clip();
      D.parts.forEach((p, i) => { const a0 = -Math.PI / 2 + i / n * Math.PI * 2, a1 = a0 + Math.PI * 2 / n, f = p.total ? p.done / p.total : 0, grow = S.still ? 1 : I.ease(Math.min(1, S.t / 1.5)), col = f >= 0.8 ? "#7dffc0" : f >= 0.4 ? A : "#ff9d5c";
        g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R * 1.2, a0 + 0.02, a1 - 0.02); g.closePath(); g.fillStyle = I.rgba(col, 0.08); g.fill();
        const r = R * 1.2 * f * grow, gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, r)); gr.addColorStop(0, I.rgba(col, 0.15)); gr.addColorStop(1, I.rgba(col, 0.55));
        g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, Math.max(0.5, r), a0 + 0.02, a1 - 0.02); g.closePath(); g.fillStyle = gr; g.fill();
        const mid = (a0 + a1) / 2; I.text(g, Math.round(f * 100) + "%", cx + Math.cos(mid) * R * 0.55, cy + Math.sin(mid) * R * 0.55 - 6, { size: 15, weight: 500, align: "center" });
        const short = p.name.replace(/ baseline$/, ""); I.text(g, I.fit(g, short.toUpperCase(), R * 0.62, 8, 600), cx + Math.cos(mid) * R * 0.55, cy + Math.sin(mid) * R * 0.55 + 10, { size: 8, weight: 600, align: "center", color: col }); });
      const scan = S.still ? 0.5 : (S.t * 0.4) % 1, sy = cy - R + scan * R * 2; const sl = g.createLinearGradient(0, sy - 20, 0, sy); sl.addColorStop(0, I.rgba(A, 0)); sl.addColorStop(1, I.rgba(A, 0.3)); g.fillStyle = sl; g.fillRect(cx - R, sy - 20, R * 2, 20);
      g.restore();
      for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2; I.line(g, cx, cy, cx + Math.cos(a) * R * 1.0, cy + Math.sin(a) * R * 1.0, "#ffffff", 1, 0.2); }
      I.glow(g, A, 16); hex(R); g.strokeStyle = I.rgba(A, 0.95); g.lineWidth = 2; g.stroke(); I.noGlow(g); hex(R * 1.08); g.strokeStyle = I.rgba(B, 0.3); g.lineWidth = 1; g.stroke();
      D.soon.slice(0, 12).forEach((it, k) => { const a = k / 12 * Math.PI * 2 + (S.still ? 0 : S.t * 0.3), r = R * 1.16; I.halo(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 10, "#ff7a8c", 0.8); });
      I.dot(g, cx, cy, 16, "#05070f", 0.9); I.text(g, D.overall + "", cx, cy + 1, { size: 13, weight: 600, align: "center", color: A });
    },
  });
})();
