/* Continuity signature: concentric cryptographic seal & binder readiness shield. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "Sovereign Vault cryptographic lock ring and emergency binder readiness shield",
    data() {
      const D = window.CONTINUITY ? window.CONTINUITY.data() : { sections: [], pct: 0, vault: null, unlocked: false };
      return D;
    },
    readouts(X) {
      const vState = X.unlocked ? "UNLOCKED" : X.vault ? "SEALED" : "UNSEEDED";
      return [
        { v: `${X.pct}%`, k: "Binder readiness", tone: X.pct >= 80 ? "good" : "warn" },
        { v: vState, k: "AES-256-GCM vault", tone: X.vault ? "good" : "" },
        { v: "250k iter", k: "PBKDF2-SHA256 KDF" },
        { v: X.sections.length, k: "Non-secret locators" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w * 0.42, S.h * 0.43);
      const A = S.accent, col = D.unlocked ? "#ffd166" : D.vault ? "#b8e94a" : "#8b93a7";
      I.halo(g, cx, cy, R * 1.65, A, 0.16);
      I.arc(g, cx, cy, R, 0, Math.PI * 2, A, 1.2, 0.24);
      I.arc(g, cx, cy, R * 0.68, 0, Math.PI * 2, col, 1.4, 0.28);

      const readyFrac = Math.max(0.05, D.pct / 100);
      I.glow(g, col, 16);
      I.arc(g, cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * readyFrac, A, 2.8, 0.9);
      I.noGlow(g);

      // Rotating cipher tumblers
      const spin = S.still ? 0 : S.t * (D.unlocked ? 0.55 : 0.15);
      for (let i = 0; i < 8; i++) {
        const a = spin + (i / 8) * Math.PI * 2;
        const r = R * 0.68;
        I.dot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, col, 0.9);
      }

      I.text(g, D.unlocked ? "UNLOCKED IN RAM" : D.vault ? "AES-GCM SEALED" : "UNINITIALIZED", cx, cy - 6, { size: 13, weight: 600, align: "center", color: "#ffffff" });
      I.text(g, `${D.pct}% BINDER READY · ZERO PLAINTEXT`, cx, cy + 12, { size: 9, align: "center", color: A });
    },
  });
})();
