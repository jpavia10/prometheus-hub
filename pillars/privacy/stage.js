/* Privacy signature: the footprint. Every data broker you track is a point of light on the outer ring until you send the opt-out;
   then it drifts inward, and once removal is confirmed it goes dark in the core. The ring shrinks as the footprint does. */
(function () {
  const S = PK.store("privacy"), I = PK.ink, RING = { "not started": 1, "opt-out sent": 0.68, "recheck due": 0.84, "confirmed removed": 0.2 }, COL = { "not started": "#ff7a8c", "opt-out sent": "#ffd27a", "recheck due": "#ff9d5c", "confirmed removed": "#7dffc0" };
  let pts = [];
  PK.stage({
    label: "Data brokers, from exposed to removed",
    data() { const b = S.get("brokers", []), c = (s) => b.filter((x) => x.state === s).length, drop = S.get("drop", { status: "not submitted" }), acc = S.list("accounts");
      return { b, removed: c("confirmed removed"), sent: c("opt-out sent"), recheck: c("recheck due"), open: c("not started"), drop, tfa: acc.filter((a) => /yes|on|app|key/i.test(String(a.tfa))).length, accounts: acc.length }; },
    readouts(D) { return [{ v: `${D.removed} / ${D.b.length}`, k: "Brokers confirmed removed", tone: D.removed ? "good" : "" }, { v: D.sent, k: "Opt-outs waiting" }, { v: D.recheck, k: "Rechecks due", tone: D.recheck ? "warn" : "" }]; },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2, R = Math.min(S.w * 0.45, S.h * 0.44), A = S.accent, n = Math.max(1, D.b.length), exposed = 1 - (D.removed / n);
      I.halo(g, cx, cy, R * 1.4, "#ff7a8c", 0.12 * exposed + 0.04); I.halo(g, cx, cy, R * 0.5, "#7dffc0", 0.25 * (1 - exposed) + 0.05);
      const fp = R * (0.35 + 0.65 * exposed), breathe = S.still ? 0 : Math.sin(S.t * 1.4) * 2;
      I.glow(g, "#ff7a8c", 18); I.arc(g, cx, cy, fp + breathe, 0, Math.PI * 2, "#ff7a8c", 1.5, 0.6); I.noGlow(g);
      for (const k of [1, 0.68, 0.2]) I.arc(g, cx, cy, R * k, 0, Math.PI * 2, "#ffffff", 1, 0.08);
      I.text(g, "EXPOSED", cx, cy - R - 2 + 10, { size: 8.5, weight: 700, align: "center", color: "#ff7a8c", alpha: 0.7, spacing: 2 }); I.text(g, "REMOVED", cx, cy + 1, { size: 8.5, weight: 700, align: "center", color: "#7dffc0", alpha: 0.8, spacing: 2 });
      pts = []; D.b.forEach((b, i) => { const a = -Math.PI / 2 + i / n * Math.PI * 2 + (S.still ? 0 : S.t * 0.04), k = RING[b.state] || 1, r = R * k + (b.state === "confirmed removed" ? (i % 3) * 5 : 0), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, col = COL[b.state] || "#ffffff";
        const dark = b.state === "confirmed removed"; I.halo(g, x, y, dark ? 6 : 12, col, dark ? 0.35 : 0.75); I.dot(g, x, y, dark ? 1.6 : 2.6, col, dark ? 0.6 : 1); pts.push({ x, y, b }); });
      if (S.pick) { const p = S.pick; I.text(g, `${p.b.name} · ${p.b.state}`, I.clamp(p.x, 80, S.w - 80), p.y - 14, { size: 10.5, align: "center", color: COL[p.b.state] || "#fff" }); }
      I.text(g, "CA DELETE REQUEST · " + String(D.drop.status || "not submitted").toUpperCase(), cx, S.h - 10, { size: 8.5, weight: 700, align: "center", color: A, alpha: 0.75, spacing: 1.5 });
    },
    tap(x, y, S) { let best = null, bd = 20 * 20; for (const p of pts) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p; } } S.pick = best; },
  });
})();
