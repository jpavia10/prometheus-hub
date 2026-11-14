/* Odyssey signature: departure board orbit + geodesic departure arc from Frazier Park origin. */
(function () {
  const S = PK.store("odyssey"), I = PK.ink;
  PK.stage({
    label: "Trips ahead on one orbit, with departure route arc",
    data() {
      const today = I.today();
      const trips = S.list("trips").filter((t) => t.start).map((t) => ({ ...t, d: I.days(today, t.start), n: t.end ? Math.max(0, I.days(t.start, t.end)) : 0 })).sort((a, b) => a.d - b.d);
      const ahead = trips.filter((t) => t.d >= 0 || I.days(today, t.end || t.start) >= 0);
      const away = window.PB && PB.meta ? PB.meta.get("away") : null;
      return { ahead, away: !!(away && away.tripId), nights: ahead.reduce((s, t) => s + t.n, 0) };
    },
    readouts(D) {
      const n = D.ahead[0];
      return [
        { v: n ? (n.d <= 0 ? "Now" : n.d + " d") : "—", k: n ? (n.name || n.dest || "Next trip") : "No trip planned" },
        { v: D.ahead.length, k: "Trips ahead" },
        { v: D.away ? "Held" : D.nights, k: D.away ? "Away mode on" : "Nights away planned", tone: D.away ? "warn" : "" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, cx = w / 2, cy = h / 2 + 6, R = Math.min(w, h) * 0.24, A = S.accent, B = S.accent2, spin = S.still ? 0.6 : S.t * 0.25;
      I.halo(g, cx, cy, R * 2.4, A, 0.18);
      const body = g.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, I.rgba(A, 0.35)); body.addColorStop(1, "rgba(4,8,18,.95)");
      g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy - R * Math.sin(lat * Math.PI / 180), rx = R * Math.cos(lat * Math.PI / 180);
        g.beginPath(); g.ellipse(cx, y, rx, rx * 0.12, 0, 0, Math.PI * 2); g.strokeStyle = I.rgba(A, 0.22); g.lineWidth = 1; g.stroke();
      }
      for (let k = 0; k < 12; k++) {
        const lon = spin + k * Math.PI / 6, c = Math.cos(lon);
        if (Math.sin(lon) < 0) continue;
        g.beginPath(); g.ellipse(cx, cy, Math.abs(R * c), R, 0, 0, Math.PI * 2); g.strokeStyle = I.rgba(A, 0.08 + 0.25 * Math.sin(lon)); g.stroke();
      }
      I.glow(g, A, 18); I.arc(g, cx, cy, R, 0, Math.PI * 2, A, 1.5, 0.8); I.noGlow(g);
      const OR = Math.min(w * 0.44, h * 0.44), tilt = 0.32;
      g.beginPath(); g.ellipse(cx, cy, OR, OR * tilt, 0, 0, Math.PI * 2); g.strokeStyle = I.rgba(B, 0.45); g.lineWidth = 1; g.stroke();
      const pos = (d) => { const a = -Math.PI / 2 + (Math.max(0, d) / 365) * Math.PI * 2; return { x: cx + Math.cos(a) * OR, y: cy + Math.sin(a) * OR * tilt, front: Math.sin(a) > 0 }; };
      const here = pos(0); I.dot(g, here.x, here.y, 3, "#ffffff"); I.text(g, "FP 34.8°N", here.x, here.y - 14, { size: 8.5, weight: 700, align: "center", color: A, spacing: 1.5 });
      D.ahead.slice(0, 12).forEach((t, i) => {
        const p = pos(t.d), first = i === 0, col = first ? "#ffc552" : B, pulse = S.still ? 1 : 0.7 + 0.3 * Math.sin(S.t * 3 + i);
        if (first) {
          g.save();
          g.strokeStyle = I.rgba("#ffc552", 0.55);
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(cx, cy - R * 0.5);
          g.quadraticCurveTo((cx + p.x) / 2, Math.min(cy, p.y) - 38, p.x, p.y);
          g.stroke();
          g.restore();
        }
        I.halo(g, p.x, p.y, first ? 22 : 12, col, (p.front ? 0.9 : 0.4) * pulse);
        I.dot(g, p.x, p.y, first ? 4.5 : 3, "#ffffff", p.front ? 1 : 0.5);
        if (first) {
          const lab = I.fit(g, (t.name || t.dest || "Trip") + (t.d > 0 ? ` · ${t.d} d` : " · now"), 160, 11, 500);
          const ly = p.y > cy - 4 ? p.y + 18 : Math.abs(p.x - here.x) < 90 ? p.y + 18 : p.y - 16;
          I.text(g, lab, I.clamp(p.x, 90, w - 90), ly, { size: 11, align: "center", color: "#ffe2a3" });
        }
      });
      if (!D.ahead.length) I.text(g, "File a trip below to project its orbital route", cx, h - 14, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.8 });
      if (D.away) I.text(g, "AWAY · HOME VIEW PRIORITIZED", cx, 18, { size: 9.5, weight: 700, align: "center", color: "#ffd27a", spacing: 2 });
    },
  });
})();
