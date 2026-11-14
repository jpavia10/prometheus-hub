/* Aether signature: seasonal solar horizon arc & battery bank autonomy ring (tap canvas to cycle season). */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "Frazier Park solar horizon arc and battery autonomy ring",
    data() {
      const D = window.AETHER ? window.AETHER.data() : { budget: { arrayW: 400, bankWh: 2048, yieldWh: 1800, loadWh: 1500, netWh: 300, autonomyH: 32, autonomyDays: 1.4, season: { label: "Autumn", peakSunH: 5.5 } }, alerts: [] };
      const activeAlerts = (D.alerts || []).filter((a) => a.status !== "clear").length;
      return { B: D.budget, activeAlerts, alerts: D.alerts || [] };
    },
    readouts(X) {
      return [
        { v: `${X.B.yieldWh} Wh`, k: `${X.B.arrayW}W solar yield/d` },
        { v: X.B.autonomyDays >= 99 ? "∞" : `${X.B.autonomyH}h`, k: `${X.B.bankWh} Wh bank`, tone: X.B.autonomyH >= 24 ? "good" : "" },
        { v: `${X.B.netWh >= 0 ? "+" : ""}${X.B.netWh} Wh`, k: "Net balance/d", tone: X.B.netWh >= 0 ? "good" : "warn" },
        { v: X.activeAlerts ? `${X.activeAlerts} watch` : "Clear", k: "Mountain pass corridors", tone: X.activeAlerts ? "warn" : "good" },
      ];
    },
    draw(g, S, I) {
      const { B } = S.data, cx = S.w / 2, cy = S.h * 0.56, R = Math.min(S.w * 0.42, S.h * 0.62);
      const A = S.accent, C = B.netWh >= 0 ? "#4be38a" : "#ffd166";

      I.halo(g, cx, cy, R * 1.4, A, 0.18);
      // Horizon arc (180 deg dome)
      I.arc(g, cx, cy, R, Math.PI, Math.PI * 2, A, 1.3, 0.28);
      const ratio = Math.max(0.05, Math.min(1, B.yieldWh / Math.max(1, B.loadWh * 1.4)));
      I.glow(g, C, 16);
      I.arc(g, cx, cy, R, Math.PI, Math.PI + Math.PI * ratio, C, 3, 0.9);
      I.noGlow(g);

      // Sun marker along solar dome
      const sunAngle = Math.PI + Math.PI * Math.min(0.95, 0.15 + 0.7 * (S.still ? 0.5 : (0.5 + 0.35 * Math.sin(S.t * 0.45))));
      const sx = cx + Math.cos(sunAngle) * R, sy = cy + Math.sin(sunAngle) * R;
      I.halo(g, sx, sy, 18, "#ffd166", 0.75);
      I.dot(g, sx, sy, 4, "#fff2b2", 0.98);

      // Inner battery ring
      I.arc(g, cx, cy, R * 0.62, Math.PI, Math.PI * 2, "#7bdcff", 1.5, 0.25);
      const bankPct = Math.min(1, B.autonomyH / 48);
      I.arc(g, cx, cy, R * 0.62, Math.PI, Math.PI + Math.PI * bankPct, "#7bdcff", 2.5, 0.85);

      I.text(g, `${B.season.peakSunH}h peak sun`, cx, cy - R * 0.28, { size: 13, weight: 600, align: "center", color: "#ffffff" });
      I.text(g, B.season.label + " · Tap to cycle", cx, cy - R * 0.12, { size: 10, align: "center", color: A });
    },
    tap() {
      window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "aether", k: "cycleSeason" } }));
    },
  });
})();
