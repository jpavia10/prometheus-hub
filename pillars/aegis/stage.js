/* Aegis signature (2026-11-25): the shield. A heater shield drawn in light; each policy is a band across it, soonest renewal at the
   top, its light running from left (just renewed) to right (renewal day) so a policy near renewal burns at the edge, and its width of
   colour follows its share of the premiums. Under the shield, the contents check: Hearth's worth against the personal-property limit
   as a bar, red past the limit. Tap a band to read the policy. Drawn only from Aegis's own records and the summaries it reads. */
(function () {
  let bands = [];
  const usd = (n) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
  const KIND = { home: "Home", renters: "Renters", condo: "Condo", auto: "Auto", motorcycle: "Motorcycle", umbrella: "Umbrella", health: "Health", dental: "Dental", vision: "Vision", life: "Life", disability: "Disability", pet: "Pet", travel: "Travel", other: "Other" };
  PK.stage({
    label: "Every policy as a band across the shield, lit toward its renewal (tap one), and the house's contents against the cover",
    data() { return window.AEGIS ? window.AEGIS.data() : null; },
    readouts(D) {
      const R = D.R, ct = R.contents;
      return [
        { v: D.policies.length ? usd(R.month) : "—", k: "Premiums a month" },
        R.next ? { v: R.next.r.days + " d", k: "Next renewal · " + (KIND[R.next.p.kind] || "Policy"), tone: R.next.r.days <= 30 ? "warn" : "" } : { v: "—", k: "Next renewal" },
        ct.ratio != null ? { v: Math.round(ct.ratio * 100) + "%", k: "Contents vs. the cover", tone: ct.gap ? "bad" : "good" } : { v: D.policies.length, k: "Policies kept" },
      ];
    },
    draw(g, S, I) {
      const D = S.data, R = D.R, w = S.w, h = S.h, A = S.accent, B = S.accent2;
      const sw = Math.min(w * 0.62, 300), cx = w / 2, top = 14, sh = h - 54, L = cx - sw / 2, Rr = cx + sw / 2, mid = top + sh * 0.55;
      const shield = () => { g.beginPath(); g.moveTo(L, top); g.lineTo(Rr, top); g.lineTo(Rr, mid); g.quadraticCurveTo(Rr, top + sh * 0.86, cx, top + sh); g.quadraticCurveTo(L, top + sh * 0.86, L, mid); g.closePath(); };
      shield(); const fill = g.createLinearGradient(0, top, 0, top + sh); fill.addColorStop(0, I.rgba(B, 0.12)); fill.addColorStop(1, I.rgba(A, 0.04)); g.fillStyle = fill; g.fill();
      g.save(); shield(); g.clip();
      bands = [];
      const list = R.soon.length ? R.soon : R.list, n = Math.max(1, list.length), bh = Math.min(30, (sh * 0.82) / n), total = Math.max(1, R.month || 1);
      const pulse = S.still ? 1 : 0.85 + 0.15 * Math.sin(S.t * 2.2);
      list.forEach((x, i) => {
        const y = top + 10 + i * (bh + 3), term = x.r ? x.r.term * 30.4 : 365, left = x.r ? Math.max(0, Math.min(1, 1 - x.r.days / term)) : 0;
        const share = x.c.month ? Math.max(0.25, Math.min(1, x.c.month / total * n * 0.6)) : 0.3, sel = S.pick && S.pick.id === x.p.id, hot = x.r && x.r.days <= 30;
        const gr = g.createLinearGradient(L, 0, Rr, 0); gr.addColorStop(0, I.rgba(B, 0.08)); gr.addColorStop(Math.max(0.02, left), I.rgba(hot ? "#ffb15c" : A, (0.25 + 0.5 * share) * (sel ? 1.2 : 1) * (hot ? pulse : 1))); gr.addColorStop(Math.min(1, left + 0.02), I.rgba(B, 0.05)); gr.addColorStop(1, I.rgba(B, 0.02));
        g.fillStyle = gr; g.fillRect(L, y, sw, bh);
        if (x.r) { const mx = L + sw * left; I.line(g, mx, y + 2, mx, y + bh - 2, "#ffffff", sel ? 2 : 1, 0.8); }
        I.text(g, I.fit(g, (KIND[x.p.kind] || "Policy") + (x.c.month != null ? " · " + usd(x.c.month) + "/mo" : ""), sw - 70, 10, 600), L + 10, y + bh / 2, { size: 10, weight: 600, color: "#ffffff", alpha: 0.92 });
        if (x.r) I.text(g, x.r.days + " d", Rr - 8, y + bh / 2, { size: 9.5, weight: 600, align: "right", color: hot ? "#ffb15c" : "#cfd8ea", alpha: 0.9 });
        bands.push({ id: x.p.id, y, h: bh });
      });
      g.restore();
      shield(); I.glow(g, A, 12); g.strokeStyle = I.rgba(A, 0.85); g.lineWidth = 1.6; g.stroke(); I.noGlow(g);
      I.line(g, cx, top + 2, cx, top + sh - 4, "#ffffff", 1, 0.08);
      if (!D.policies.length) I.text(g, "Add a policy and it takes its place on the shield", cx, top + sh * 0.42, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.85 });
      else {
        const ty = Math.max(top + 10 + n * (bh + 3) + 34, top + sh * 0.62);
        if (ty < top + sh - 40) {
          I.text(g, usd(R.month), cx, ty, { size: 26, weight: 300, align: "center", color: "#ffffff" });
          I.text(g, `A MONTH · ${D.policies.length} ${D.policies.length === 1 ? "POLICY" : "POLICIES"}`, cx, ty + 22, { size: 8.5, weight: 700, align: "center", color: A, alpha: 0.85, spacing: 1.4 });
          if (R.deductible.max != null) I.text(g, `largest deductible ${usd(R.deductible.max)}`, cx, ty + 38, { size: 9.5, align: "center", color: R.deductible.short ? "#ff9aa8" : "#cfd8ea", alpha: 0.85 });
        }
      }
      /* contents vs. the cover */
      const ct = R.contents, by = h - 26, bx = 18, bw = w - 36;
      I.text(g, "CONTENTS VS. COVER", bx, by - 10, { size: 8, weight: 700, color: "#cfd8ea", alpha: 0.7, spacing: 1.2 });
      g.fillStyle = I.rgba("#ffffff", 0.08); g.fillRect(bx, by, bw, 6);
      if (ct.limit && ct.worth != null) {
        const k = Math.min(1.25, ct.worth / ct.limit), lim = bx + bw / 1.25;
        g.fillStyle = I.rgba(ct.gap ? "#ff7a8c" : "#7dffc0", 0.85); g.fillRect(bx, by, bw * k / 1.25, 6);
        I.line(g, lim, by - 4, lim, by + 10, "#ffffff", 1.5, 0.8);
        I.text(g, `${usd(ct.worth)} of ${usd(ct.limit)}`, bx + bw, by - 10, { size: 9, align: "right", color: ct.gap ? "#ff7a8c" : "#7dffc0" });
      } else I.text(g, ct.worth != null ? `Hearth: ${usd(ct.worth)} · no limit set` : "Hearth's contents and the home policy's limit meet here", bx + bw, by - 10, { size: 9, align: "right", color: "#cfd8ea", alpha: 0.7 });
    },
    tap(x, y, S) { const b = bands.find((q) => y >= q.y && y <= q.y + q.h); S.pick = b ? { id: b.id } : null; },
  });
})();
