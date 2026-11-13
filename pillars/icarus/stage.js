/* Icarus signature: the flight. Every closed trade lifts or drops the line from your starting bankroll; wins and losses mark where it
   turned; the sun stands at the top as the reminder the pillar is named for. The next day the market is closed sits on the horizon.
   A journal, not advice: nothing here suggests a trade. */
(function () {
  const S = PK.store("icarus"), I = PK.ink;
  const pnl = (t) => (t.exit === "" || t.exit == null || t.entry == null) ? null : (+t.exit - +t.entry) * (+t.qty || 0) * (t.side === "short" ? -1 : 1);
  PK.stage({
    label: "Your trades as one line from your starting bankroll",
    data() { const bank = +S.get("bankroll", 0) || 0, closed = S.list("trades").filter((t) => pnl(t) != null).sort((a, b) => String(a.date).localeCompare(String(b.date))), today = I.today();
      let eq = bank; const pts = [bank, ...closed.map((t) => (eq += pnl(t)))]; const wins = closed.filter((t) => pnl(t) > 0).length;
      const shut = (window.ICARUS_MARKET_DAYS || []).find((d) => d.date >= today); return { bank, pts, closed, wins, shut, today, open: S.list("trades").length - closed.length }; },
    readouts(D) { const net = D.pts[D.pts.length - 1] - D.pts[0]; return [{ v: D.closed.length ? Math.round(D.wins / D.closed.length * 100) + "%" : "—", k: `Win rate, ${D.closed.length} closed` }, { v: (net >= 0 ? "+" : "−") + "$" + Math.abs(Math.round(net)).toLocaleString("en-US"), k: "Net since start", tone: net > 0 ? "good" : net < 0 ? "bad" : "" }, { v: D.shut ? new Date(D.shut.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", k: D.shut ? "Market " + (D.shut.kind || "closed") : "Market calendar" }]; },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, sx = w * 0.78, sy = h * 0.2, horizon = h * 0.78;
      for (let k = 6; k > 0; k--) I.halo(g, sx, sy, 20 + k * 14, "#ffc552", 0.06 * k); I.dot(g, sx, sy, 16, "#fff1c4"); I.glow(g, "#ffb43c", 30); I.dot(g, sx, sy, 12, "#fffaf0"); I.noGlow(g);
      const hz = g.createLinearGradient(0, horizon - 40, 0, h); hz.addColorStop(0, I.rgba(A, 0)); hz.addColorStop(1, I.rgba(A, 0.22)); g.fillStyle = hz; g.fillRect(0, horizon - 40, w, h);
      I.line(g, 0, horizon, w, horizon, A, 1, 0.45);
      const P = D.pts, lo = Math.min(...P), hi = Math.max(...P), span = hi - lo || Math.max(1, Math.abs(hi) * 0.1) || 1, L = 22, R = w - 22, T = h * 0.3, Bt = horizon - 10;
      const X = (i) => L + (R - L) * (P.length > 1 ? i / (P.length - 1) : 0.5), Y = (v) => Bt - (Bt - T) * ((v - lo) / span);
      if (P.length > 1) { const grow = S.still ? 1 : I.ease(Math.min(1, S.t / 2)), upto = Math.max(1, Math.round((P.length - 1) * grow));
        g.beginPath(); for (let i = 0; i <= upto; i++) i ? g.lineTo(X(i), Y(P[i])) : g.moveTo(X(i), Y(P[i])); I.glow(g, B, 16); g.strokeStyle = I.rgba(B, 1); g.lineWidth = 2.5; g.stroke(); I.noGlow(g);
        for (let i = 1; i <= upto; i++) { const up = P[i] >= P[i - 1]; I.halo(g, X(i), Y(P[i]), 10, up ? "#7dffc0" : "#ff7a8c", 0.7); I.dot(g, X(i), Y(P[i]), 2.5, up ? "#7dffc0" : "#ff7a8c"); }
        I.text(g, "$" + Math.round(P[0]).toLocaleString("en-US"), X(0), Y(P[0]) + 14, { size: 9.5, color: "#cfd8ea", alpha: 0.7 }); }
      else { const wing = S.still ? 0 : Math.sin(S.t * 1.6) * 6; g.beginPath(); g.moveTo(w * 0.18, horizon - 30); g.quadraticCurveTo(w * 0.33, horizon - 70 - wing, w * 0.5, horizon - 46); g.quadraticCurveTo(w * 0.36, horizon - 52 + wing, w * 0.18, horizon - 30); I.glow(g, B, 14); g.strokeStyle = I.rgba(B, 0.9); g.lineWidth = 1.5; g.stroke(); I.noGlow(g);
        I.text(g, D.bank ? "Close a trade and the line begins at $" + Math.round(D.bank).toLocaleString("en-US") : "Set a bankroll and log a trade: the line starts there", w / 2, horizon + 18, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.8 }); }
      if (D.shut) I.text(g, `NEXT CLOSURE · ${D.shut.name.toUpperCase()}`, 14, h - 10, { size: 8.5, weight: 700, color: A, alpha: 0.8, spacing: 1.5 });
      I.text(g, "A JOURNAL, NOT ADVICE", w - 14, h - 10, { size: 8.5, weight: 700, align: "right", color: "#cfd8ea", alpha: 0.5, spacing: 1.5 });
    },
  });
})();
