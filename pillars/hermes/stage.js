/* Hermes signature: the signal scope. Every open message that needs an answer is a blip, closer to the centre the sooner it is due
   (the inner ring is today); the sweep passes over them. Faint in the outer field: the 97 senders Hermes already knows how to recognise. */
(function () {
  const S = PK.store("hermes"), I = PK.ink, KIND = { pay: "#ffc552", reply: "#5ee7ff", wait: "#b9a2ff", read: "#cfd8ea" };
  let blips = [];
  PK.stage({
    label: "Open messages by how soon they are due",
    data() { const today = I.today(), open = S.list("mail").filter((m) => !m.done).map((m) => ({ ...m, d: m.due ? I.days(today, m.due) : null }));
      return { open, soon: open.filter((m) => m.d != null && m.d <= 7).length, late: open.filter((m) => m.d != null && m.d < 0).length, billers: (window.BILLERS || []).length, ops: (window.HERMES_OPERATORS || []).length }; },
    readouts(D) { return [{ v: D.open.length, k: "Waiting on you" }, { v: D.soon, k: "Due within 7 days", tone: D.late ? "bad" : D.soon ? "warn" : "" }, { v: D.billers, k: "Senders it recognises" }]; },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w * 0.46, S.h * 0.44), A = S.accent, B = S.accent2, sweep = S.still ? 1.1 : S.t * 1.1;
      I.halo(g, cx, cy, R * 1.3, A, 0.18);
      const rnd = I.rand(97); for (let i = 0; i < D.billers; i++) { const a = rnd() * Math.PI * 2 + S.t * 0.01, r = R * (1.05 + rnd() * 0.5); I.dot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.9, B, 0.35); }
      [0.25, 0.5, 0.75, 1].forEach((k, i) => { I.arc(g, cx, cy, R * k, 0, Math.PI * 2, A, 1, 0.22); I.text(g, ["today", "3 d", "7 d", "30 d+"][i], cx + 4, cy - R * k + 9, { size: 8.5, color: A, alpha: 0.6 }); });
      I.line(g, cx - R, cy, cx + R, cy, A, 1, 0.12); I.line(g, cx, cy - R, cx, cy + R, A, 1, 0.12);
      const gr = g.createConicGradient ? g.createConicGradient(sweep - 0.9, cx, cy) : null;                     // the sweep's trail
      if (gr) { gr.addColorStop(0, I.rgba(A, 0)); gr.addColorStop(0.14, I.rgba(A, 0.3)); gr.addColorStop(0.145, I.rgba(A, 0)); gr.addColorStop(1, I.rgba(A, 0)); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill(); }
      I.glow(g, A, 12); I.line(g, cx, cy, cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R, A, 1.5, 0.9); I.noGlow(g);
      blips = []; const rr = (d) => d == null ? 0.92 : d < 0 ? 0.12 : d <= 3 ? 0.25 + d / 3 * 0.25 : d <= 7 ? 0.5 + (d - 3) / 4 * 0.25 : Math.min(0.98, 0.75 + (d - 7) / 23 * 0.25);
      D.open.forEach((m, i) => { const a = ((I.rand(i * 31 + String(m.from || "").length)()) * Math.PI * 2), r = R * rr(m.d), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, col = m.d != null && m.d < 0 ? "#ff7a8c" : KIND[m.kind] || "#cfd8ea";
        const since = ((sweep - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), flash = S.still ? 0.8 : Math.max(0.25, 1 - since / 2.2);
        I.halo(g, x, y, 16, col, flash); I.dot(g, x, y, 3, "#ffffff", 0.6 + 0.4 * flash); blips.push({ x, y, m });
        if (flash > 0.6 || S.pick === m) I.text(g, I.fit(g, m.from || m.about || "message", 110, 10, 500), x + 8, y - 8, { size: 10, color: col, alpha: flash }); });
      if (!D.open.length) { I.text(g, "Nothing waiting on you", cx, cy - 6, { size: 14, weight: 400, align: "center" }); I.text(g, "Log a bill or a reply below and it lands on the scope", cx, cy + 13, { size: 10, align: "center", color: "#cfd8ea", alpha: 0.7 }); }
    },
    tap(x, y, S) { let best = null, bd = 24 * 24; for (const b of blips) { const d = (b.x - x) ** 2 + (b.y - y) ** 2; if (d < bd) { bd = d; best = b.m; } } S.pick = best; },
  });
})();
