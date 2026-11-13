/* Records signature: the horizon. The next twelve months laid out ahead; every document with a renewal or due date stands as a beacon
   at its day, taller and hotter the closer it is; anything overdue burns at the edge. Documents without a date rest along the ground. */
(function () {
  const S = PK.store("records"), I = PK.ink, COL = { overdue: "#ff7a8c", urgent: "#ff9d5c", soon: "#ffd27a", ok: null, none: "#8b93a7" };
  PK.stage({
    label: "Every document's next date over the coming year",
    data() { const today = I.today(), docs = S.list("docs").map((d) => ({ d, c: window.RECORDS ? RECORDS.classify(d, today) : { flag: "none", days: null } })); return { today, docs,
      over: docs.filter((x) => x.c.flag === "overdue").length, soon: docs.filter((x) => x.c.flag === "soon" || x.c.flag === "urgent").length }; },
    readouts(D) { const next = D.docs.filter((x) => x.c.days != null && x.c.days >= 0).sort((a, b) => a.c.days - b.c.days)[0];
      return [{ v: D.docs.length, k: "Documents kept" }, { v: D.soon, k: "Due within 30 days", tone: D.soon ? "warn" : "" }, next ? { v: next.c.days + " d", k: next.d.title } : { v: D.over, k: "Overdue", tone: D.over ? "bad" : "" }]; },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, gy = h * 0.74, L = 28, R = w - 16, X = (d) => L + (R - L) * Math.sqrt(Math.max(0, Math.min(365, d)) / 365);
      const sky = g.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, "rgba(0,0,0,0)"); sky.addColorStop(1, I.rgba(A, 0.18)); g.fillStyle = sky; g.fillRect(0, 0, w, gy);
      I.glow(g, A, 14); I.line(g, 0, gy, w, gy, A, 1.5, 0.8); I.noGlow(g);
      const start = new Date(D.today + "T12:00:00"); for (let m = 1; m <= 12; m++) { const d0 = new Date(start.getFullYear(), start.getMonth() + m, 1, 12), dd = Math.round((d0 - start) / 864e5); if (dd > 365) break; const x = X(dd);
        I.line(g, x, gy, x, gy + 5, "#ffffff", 1, 0.35); if (m <= 3 || m % 3 === 0) I.text(g, d0.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), x, gy + 14, { size: 8.5, weight: 600, align: "center", color: "#cfd8ea", alpha: 0.65, spacing: 1 }); }
      I.halo(g, L, gy, 26, "#ffffff", 0.6); I.text(g, "NOW", L, gy + 14, { size: 8.5, weight: 700, align: "center", color: A, spacing: 1.5 });
      const dated = D.docs.filter((x) => x.c.days != null).sort((a, b) => a.c.days - b.c.days), grow = S.still ? 1 : I.ease(Math.min(1, S.t / 1.4)), used = [];
      dated.forEach((x, i) => { const d = x.c.days, col = COL[x.c.flag] || B, px = d < 0 ? 12 + (i % 3) * 5 : X(d), ht = (gy - 28) * Math.max(0.18, 1 - Math.sqrt(Math.max(0, d)) / 19.1) * grow, top = gy - ht, flick = S.still ? 1 : 0.85 + 0.15 * Math.sin(S.t * 5 + i);
        const beam = g.createLinearGradient(0, top, 0, gy); beam.addColorStop(0, I.rgba(col, 0.9 * flick)); beam.addColorStop(1, I.rgba(col, 0.05)); g.fillStyle = beam; g.fillRect(px - 1.5, top, 3, ht);
        I.halo(g, px, top, 14, col, 0.8 * flick); I.dot(g, px, top, 2.5, "#ffffff");
        if (!used.some((u) => Math.abs(u.top - top) < 14 && Math.abs(px - u.x) < 80)) { const lab = I.fit(g, x.d.title, 120, 10, 500); I.text(g, lab, px + (px > w - 130 ? -6 : 6), top, { size: 10, align: px > w - 130 ? "right" : "left", color: col }); used.push({ x: px, top }); } });
      D.docs.filter((x) => x.c.days == null).slice(0, 18).forEach((x, i) => I.dot(g, L + 14 + i * 12, gy + 26, 2, "#8b93a7", 0.7));
      if (!D.docs.length) I.text(g, "Add a document with a renewal date and it rises on the horizon", w / 2, gy - 40, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.8 });
    },
  });
})();
