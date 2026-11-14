/* Garage signature: the road ahead + hybrid SUV chassis diagram in the upper telemetry band. */
(function () {
  const S = PK.store("garage"), I = PK.ink;
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  PK.stage({
    label: "hybrid SUV road horizon & due services",
    data() {
      const odo = +S.get("odometer", 0) || 0, hist = S.list("history"), today = I.today(), last = {};
      for (const h of hist) if (!last[h.service] || h.date > last[h.service].date) last[h.service] = h;
      const items = S.get("services", []).map((it) => ({ it, st: window.GARAGE ? GARAGE.dueStatus(it, last[it.name], { odometer: odo, date: today }) : { state: "unknown" } }));
      const known = items.filter((x) => x.st.state !== "unknown").sort((a, b) => (a.st.milesLeft ?? 1e9) - (b.st.milesLeft ?? 1e9));
      const fs = window.GARAGE && GARAGE.fuelStats ? GARAGE.fuelStats(S.list("fuel")) : null;
      return { odo, known, unknown: items.filter((x) => x.st.state === "unknown"), mpg: fs && (fs.avgMpg || fs.mpg), logs: hist.length };
    },
    readouts(D) {
      const n = D.known[0];
      return [
        { v: D.odo ? fmt(D.odo) : "—", k: D.odo ? "Miles on the clock" : "Set the odometer" },
        n ? { v: n.st.milesLeft <= 0 ? "Due" : fmt(n.st.milesLeft) + " mi", k: n.it.name, tone: n.st.state === "overdue" ? "bad" : n.st.state === "due soon" ? "warn" : "" }
          : { v: D.unknown.length, k: "Services never logged" },
        { v: D.mpg ? (+D.mpg).toFixed(1) : "—", k: "Average mpg" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, vx = w / 2, vy = h * 0.3, A = S.accent, B = S.accent2, t = S.t, base = h + 2, half = w * 0.62;
      const sky = g.createLinearGradient(0, 0, 0, vy + 30); sky.addColorStop(0, I.rgba(B, 0.08)); sky.addColorStop(1, I.rgba(A, 0.2)); g.fillStyle = sky; g.fillRect(0, 0, w, vy + 30);
      I.halo(g, vx, vy, w * 0.5, A, 0.35);

      // Subtle hybrid SUV chassis blueprint silhouette upper-right
      const cx0 = w - 108, cy0 = 28;
      g.save();
      g.strokeStyle = I.rgba(B, 0.42);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(cx0, cy0 + 18); g.lineTo(cx0 + 12, cy0 + 6); g.lineTo(cx0 + 48, cy0 + 4); g.lineTo(cx0 + 72, cy0 + 14);
      g.lineTo(cx0 + 82, cy0 + 22); g.lineTo(cx0 - 4, cy0 + 22); g.closePath();
      g.stroke();
      I.arc(g, cx0 + 14, cy0 + 24, 6, 0, Math.PI * 2, A, 1.5, 0.8);
      I.arc(g, cx0 + 64, cy0 + 24, 6, 0, Math.PI * 2, A, 1.5, 0.8);
      I.text(g, "HYBRID", cx0 + 38, cy0 - 5, { size: 7.5, weight: 700, align: "center", color: B, alpha: 0.7, spacing: 1 });
      g.restore();

      const rnd = I.rand(7); for (let i = 0; i < 36; i++) I.dot(g, rnd() * w, rnd() * vy * 0.9, rnd() * 1.1 + 0.2, "#ffffff", 0.2 + rnd() * 0.5);
      g.fillStyle = "rgba(6,9,18,.9)"; g.beginPath(); g.moveTo(vx - 3, vy); g.lineTo(vx + 3, vy); g.lineTo(vx + half, base); g.lineTo(vx - half, base); g.closePath(); g.fill();
      const P = (z) => { const k = 1 / (1 + z * 6); return { y: vy + (base - vy) * k, s: k }; };
      I.glow(g, A, 12); for (const sgn of [-1, 1]) I.line(g, vx + sgn * 3, vy, vx + sgn * half, base, A, 2, 0.8); I.noGlow(g);
      const speed = S.still ? 0 : (t * 0.25) % 0.1;
      for (let z = -speed; z < 1; z += 0.1) { const a = P(Math.max(0, z)), b = P(Math.max(0, z + 0.045)); I.line(g, vx, a.y, vx, b.y, "#ffffff", Math.max(0.6, a.s * 4), 0.55 * a.s + 0.1); }
      const span = 12000; const shown = D.known.filter((x) => x.st.milesLeft != null && x.st.milesLeft <= span).slice(0, 6);
      shown.forEach((x, i) => {
        const z = Math.max(0.02, x.st.milesLeft / span), p = P(z), side = i % 2 ? 1 : -1, px = I.clamp(vx + side * (half * p.s * 0.82 + 8), 70, w - 70), col = x.st.state === "overdue" ? "#ff7a8c" : x.st.state === "due soon" ? "#ffd27a" : B;
        I.line(g, px, p.y, px, p.y - 34 * p.s - 8, "#ffffff", 1, 0.5); I.halo(g, px, p.y - 34 * p.s - 8, 16 * p.s + 6, col, 0.7); I.dot(g, px, p.y - 34 * p.s - 8, 2.5 + 2 * p.s, col);
        const room = side > 0 ? w - px - 14 : px - 14, size = 10 + p.s * 2, lbl = I.fit(g, x.it.name.replace(/\s*\(.*?\)\s*/g, " ").replace(/ - replace$/i, "").trim(), Math.max(60, Math.min(130, room)), size, 500), tx = side > 0 ? Math.min(px + 8, w - 8) : Math.max(px - 8, 8);
        I.text(g, lbl, tx, p.y - 34 * p.s - 8, { size, align: side > 0 ? "left" : "right" });
        I.text(g, x.st.milesLeft <= 0 ? "due now" : "+" + fmt(x.st.milesLeft) + " mi", tx, p.y - 34 * p.s + 6, { size: 9 + p.s, align: side > 0 ? "left" : "right", color: col });
      });
      const cy = h - 26, glowA = 0.5 + (S.still ? 0 : 0.1 * Math.sin(t * 3));
      for (const sgn of [-1, 1]) {
        const x = vx + sgn * 26; const beam = g.createLinearGradient(x, cy, vx, vy + 20); beam.addColorStop(0, I.rgba("#fff6dc", 0.28)); beam.addColorStop(1, I.rgba("#fff6dc", 0));
        g.fillStyle = beam; g.beginPath(); g.moveTo(x - 6, cy); g.lineTo(x + 6, cy); g.lineTo(vx + sgn * 26, vy + 40); g.lineTo(vx + sgn * 6, vy + 40); g.closePath(); g.fill();
        I.halo(g, x, cy, 22, "#fff3cf", glowA); I.dot(g, x, cy, 4, "#ffffff");
      }
      I.text(g, D.odo ? fmt(D.odo) + " MI" : "ODOMETER NOT SET", vx, h - 50, { size: 10, weight: 700, align: "center", color: "#ffffff", alpha: 0.85, spacing: 2.5 });
      if (!shown.length) I.text(g, D.logs ? "Nothing due within 12,000 miles" : `${D.unknown.length} factory services waiting for a first log`, vx, vy - 18, { size: 11.5, align: "center", color: "#dfe6f5", alpha: 0.85 });
    },
  });
})();
