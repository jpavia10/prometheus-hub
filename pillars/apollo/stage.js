/* Apollo signature: the temple rings. Today against your own goals (sleep, steps, training, water, protein) as five rings that fill
   as you log; around them, the last 30 days as a crown of lights, brighter the more of the day was logged; the streak in the middle. */
(function () {
  const S = PK.store("apollo"), I = PK.ink, RINGS = [["steps", "Steps", "#ffc552"], ["sleep", "Sleep", "#b9a2ff"], ["train", "Training", "#ff7a8c"], ["water", "Water", "#5ee7ff"], ["protein", "Protein", "#7dffc0"]];
  PK.stage({
    label: "Today against your goals, and the last 30 days",
    data() { const days = S.get("days", {}), goals = S.get("goals", {}), today = I.today(), back = (n) => { const d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - n); return PK.day(d); };
      let streak = 0; for (let n = days[today] ? 0 : 1; days[back(n)]; n++) streak++;
      const month = Array.from({ length: 30 }, (_, n) => { const r = days[back(29 - n)]; return r ? Object.keys(r).filter((k) => k !== "what").length : 0; });
      const ws = Object.keys(days).sort().map((d) => days[d].weight).filter((x) => x > 0);
      return { t: days[today] || {}, goals, streak, month, logged: Object.keys(days).length, trend: ws.length > 1 ? ws[ws.length - 1] - ws[Math.max(0, ws.length - 8)] : null }; },
    readouts(D) { const done = RINGS.filter(([k]) => D.goals[k] && D.t[k] >= D.goals[k]).length;
      return [{ v: D.streak + (D.streak === 1 ? " day" : " days"), k: "Logging streak" }, { v: done + " / " + RINGS.length, k: "Goals met today" }, { v: D.trend == null ? "—" : (D.trend > 0 ? "+" : "") + D.trend.toFixed(1) + " lb", k: "Weight, last week" }]; },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2 + 2, R = Math.min(S.w, S.h) * 0.33, grow = S.still ? 1 : I.ease(Math.min(1, S.t / 1.6));
      I.halo(g, cx, cy, R * 1.9, S.accent, 0.2);
      RINGS.forEach(([k, name, col], i) => { const r = R - i * (R * 0.15), goal = +D.goals[k] || 0, v = +D.t[k] || 0, f = goal ? Math.min(1.25, v / goal) * grow : 0, a0 = -Math.PI / 2;
        I.arc(g, cx, cy, r, 0, Math.PI * 2, col, R * 0.1, 0.12);
        if (f > 0) { I.glow(g, col, 16); g.lineCap = "round"; I.arc(g, cx, cy, r, a0, a0 + Math.PI * 2 * Math.min(1, f), col, R * 0.1, 0.95); g.lineCap = "butt"; I.noGlow(g);
          const a = a0 + Math.PI * 2 * Math.min(1, f); I.dot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, R * 0.035, "#ffffff"); }
        I.text(g, name.toUpperCase(), cx - 6, cy - r, { size: 8, weight: 700, align: "right", color: col, alpha: 0.85, spacing: 1.2 }); });
      D.month.forEach((n, i) => { const a = -Math.PI / 2 + (i + 0.5) / 30 * Math.PI * 2, r = R * 1.22, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, today = i === 29, lvl = Math.min(1, n / 6);
        if (n) I.halo(g, x, y, 10 + lvl * 8, today ? "#ffffff" : S.accent, 0.35 + lvl * 0.5); I.dot(g, x, y, n ? 2 + lvl * 2 : 1.2, n ? "#ffffff" : "#8b93a7", n ? 0.95 : 0.4); });
      I.text(g, String(D.streak), cx, cy - 4, { size: 30, weight: 300, align: "center" }); I.text(g, D.streak === 1 ? "DAY STREAK" : "DAY STREAK", cx, cy + 18, { size: 8.5, weight: 700, align: "center", color: S.accent, spacing: 2 });
      if (!D.logged) I.text(g, "Log today below and the rings start to fill", cx, S.h - 12, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.75 });
    },
  });
})();
