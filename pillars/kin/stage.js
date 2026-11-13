/* Kin signature: the fortnight ring. Fourteen days around the circle starting at today (top): warm where the kids are with you, cool
   where they are with the other parent; every dated thing sits on its day; the centre says who has them now and when that changes. */
(function () {
  const I = PK.ink;
  PK.stage({
    label: "The next fourteen days: who has the kids, and what is dated",
    data() { if (!window.KIN) return null; const D = KIN.data(), add = (n) => { const x = new Date(D.today + "T12:00:00"); x.setDate(x.getDate() + n); return PK.day(x); };
      const days = Array.from({ length: 14 }, (_, n) => { const d = add(n); return { d, who: KIN.whoHas(d, D.sch), marks: [...D.items.filter((i) => i.date === d).map((i) => i.kind), ...D.school.filter((s) => s.due === d).map(() => "school"), ...D.trips.filter((t) => t.start <= d && (t.end || t.start) >= d).map(() => "trip")] }; });
      let change = null; for (let n = 1; n < 14; n++) if (days[n].who && days[n].who !== days[0].who) { change = n; break; }
      return { D, days, change, kids: D.people.filter((p) => p.role === "kid") }; },
    readouts(X) { const now = X.days[0].who, withYou = X.days.filter((d) => d.who === "you").length, dated = X.days.reduce((s, d) => s + d.marks.length, 0);
      return [{ v: now ? (now === "you" ? "With you" : "Other parent") : "—", k: now ? (X.change ? `Changes in ${X.change} d` : "All fortnight") : "Set the pattern below", tone: now === "you" ? "good" : "" }, { v: withYou + " / 14", k: "Days with you" }, { v: dated, k: "Dated things, 2 weeks" }]; },
    draw(g, S, I) {
      const X = S.data, cx = S.w / 2, cy = S.h / 2 + 4, R = Math.min(S.w, S.h) * 0.4, A = S.accent, COOL = "#8fa6ff", seg = Math.PI * 2 / 14, grow = S.still ? 1 : I.ease(Math.min(1, S.t / 1.4));
      I.halo(g, cx, cy, R * 1.6, A, 0.16);
      X.days.forEach((d, i) => { const a0 = -Math.PI / 2 + i * seg + 0.03, a1 = a0 + seg * grow - 0.06, col = d.who === "you" ? A : d.who === "other" ? COOL : "#5a6276", today = i === 0;
        if (today) I.glow(g, col, 18); I.arc(g, cx, cy, R, a0, a1, col, today ? 18 : 13, d.who ? 0.9 : 0.35); I.noGlow(g);
        const am = a0 + seg / 2, lx = cx + Math.cos(am) * (R + 22), ly = cy + Math.sin(am) * (R + 22), dt = new Date(d.d + "T12:00:00");
        I.text(g, i === 0 ? "TODAY" : dt.toLocaleDateString("en-US", { weekday: "narrow" }), lx, ly, { size: i === 0 ? 8.5 : 9.5, weight: 700, align: "center", color: today ? A : "#cfd8ea", alpha: today ? 1 : 0.7, spacing: today ? 1.5 : 0 });
        d.marks.forEach((m, k) => { const r = R - 20 - k * 9, x = cx + Math.cos(am) * r, y = cy + Math.sin(am) * r, mc = m === "school" ? "#ffd27a" : m === "trip" ? "#5ee7ff" : m === "birthday" ? "#ff8fb8" : "#ffffff"; I.halo(g, x, y, 9, mc, S.still ? 0.8 : 0.6 + 0.3 * Math.sin(S.t * 3 + i)); I.dot(g, x, y, 2.4, mc); }); });
      if (X.change) { const a = -Math.PI / 2 + X.change * seg; I.line(g, cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12), cx + Math.cos(a) * (R + 12), cy + Math.sin(a) * (R + 12), "#ffffff", 2, 0.9); }
      const now = X.days[0].who; I.text(g, now ? (now === "you" ? "With you" : "With the other parent") : "No pattern yet", cx, cy - 6, { size: 17, weight: 400, align: "center" });
      I.text(g, now ? (X.change ? `handoff in ${X.change} ${X.change === 1 ? "day" : "days"}` : "the whole fortnight") : "set it below", cx, cy + 16, { size: 10.5, align: "center", color: now === "you" ? A : COOL });
      if (X.kids.length) I.text(g, X.kids.map((k) => k.name).join(" · "), cx, cy + 34, { size: 10, align: "center", color: "#cfd8ea", alpha: 0.75 });
    },
  });
})();
