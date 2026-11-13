/* Kairos signature: the Meridian. The year ahead as one ring that starts at today (top) and runs clockwise for 365 days: the 58 fixed
   dates (holidays, tax deadlines, clock changes), your own events and every pillar's deadline on it; inside, today's 24 hours with
   the hand on now. Tap a mark to read it. */
(function () {
  const { store } = PK, S = store("kairos"), I = PK.ink, KIND = { "federal holiday": "#ffc552", "tax deadline": "#ff7a8c", "clock change": "#5ee7ff" };
  const label = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  let marks = [];
  PK.stage({
    label: "The year ahead from today, with every fixed date, event and deadline",
    data() {
      const today = I.today(), out = [];
      for (const f of window.KAIROS_FIXED || []) { const d = I.days(today, f.date); if (d >= 0 && d <= 365) out.push({ d, name: f.name, date: f.date, color: KIND[f.kind] || "#c9b8ea", kind: f.kind, fixed: true }); }
      for (const e of S.list("events")) { const d = I.days(today, e.date); if (d >= 0 && d <= 365) out.push({ d, name: e.title, date: e.date, time: e.time, color: "#ffffff", kind: "event" }); }
      for (const b of (window.PB ? PB.deadlines.list() : [])) { if (b.done || b.source === "kairos-fixed") continue; const d = I.days(today, b.date); if (d >= 0 && d <= 365) out.push({ d, name: b.title, date: b.date, color: "#7dffc0", kind: b.source || "deadline" }); }
      out.sort((a, b) => a.d - b.d); const focus = S.list("focus").filter((f) => f.date === today).reduce((s, f) => s + (+f.minutes || 0), 0);
      return { today, marks: out, focus, todays: S.list("events").filter((e) => e.date === today) };
    },
    readouts(D) { const fx = D.marks.find((m) => m.fixed), mine = D.marks.filter((m) => !m.fixed && m.d <= 30).length;
      return [{ v: fx ? (fx.d === 0 ? "Today" : fx.d + " d") : "—", k: fx ? fx.name : "No fixed date ahead" }, { v: mine, k: "Your dates, next 30 days" }, { v: D.focus + " min", k: "Focus today" }]; },
    draw(g, S, I) {
      const D = S.data, cx = S.w / 2, cy = S.h / 2 + 4, R = Math.min(S.w * 0.43, S.h * 0.43), t = S.t, A = S.accent, B = S.accent2, ang = (d) => -Math.PI / 2 + (d / 365) * Math.PI * 2;
      I.halo(g, cx, cy, R * 1.5, A, 0.16);
      for (let k = 0; k < 3; k++) I.arc(g, cx, cy, R + 6 + k * 7, 0, Math.PI * 2, B, 1, 0.07);
      const start = new Date(D.today + "T12:00:00");                                   // month boundaries on the ring
      for (let m = 0; m <= 12; m++) { const first = new Date(start.getFullYear(), start.getMonth() + m, 1, 12), d = Math.round((first - start) / 864e5); if (d < 0 || d > 365) continue; const a = ang(d); if (d < 20) continue;
        I.line(g, cx + Math.cos(a) * (R - 7), cy + Math.sin(a) * (R - 7), cx + Math.cos(a) * (R + 7), cy + Math.sin(a) * (R + 7), "#ffffff", 1, 0.35);
        const mid = ang(d + 15); I.text(g, first.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), cx + Math.cos(mid) * (R - 19), cy + Math.sin(mid) * (R - 19), { size: 9, weight: 600, align: "center", color: "#cfd8ea", alpha: 0.7, spacing: 1.5 }); }
      I.glow(g, A, 14); I.arc(g, cx, cy, R, -Math.PI / 2, Math.PI * 1.5, A, 2, 0.55); I.noGlow(g);
      const sweep = ((t * 0.08) % 1) * Math.PI * 2; I.arc(g, cx, cy, R, -Math.PI / 2 + sweep - 0.5, -Math.PI / 2 + sweep, "#ffffff", 3, 0.5);
      marks = [];
      D.marks.forEach((m, i) => { const a = ang(m.d), r = R + (m.fixed ? 0 : 10 + (i % 2) * 6), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, pulse = S.still ? 1 : 0.75 + 0.25 * Math.sin(t * 2 + i);
        I.halo(g, x, y, m.fixed ? 9 : 13, m.color, 0.55 * pulse); I.dot(g, x, y, m.fixed ? 2.2 : 3, m.color, 1); marks.push({ x, y, m }); });
      const r2 = R * 0.62; I.arc(g, cx, cy, r2, 0, Math.PI * 2, "#ffffff", 1, 0.12);   // today, 24 hours
      for (let hh = 0; hh < 24; hh++) { const a = -Math.PI / 2 + hh / 24 * Math.PI * 2, L = hh % 6 === 0 ? 7 : 3; I.line(g, cx + Math.cos(a) * (r2 - L), cy + Math.sin(a) * (r2 - L), cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, "#ffffff", 1, hh % 6 ? 0.25 : 0.6); }
      for (const e of D.todays) if (e.time) { const [hh, mm] = e.time.split(":").map(Number), a = -Math.PI / 2 + (hh + mm / 60) / 24 * Math.PI * 2; I.dot(g, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, 3.5, B); }
      const now = new Date(), a = -Math.PI / 2 + (now.getHours() + now.getMinutes() / 60) / 24 * Math.PI * 2;
      I.glow(g, A, 10); I.line(g, cx, cy, cx + Math.cos(a) * (r2 - 4), cy + Math.sin(a) * (r2 - 4), A, 2, 0.9); I.noGlow(g); I.dot(g, cx, cy, 3, "#ffffff");
      const d0 = new Date(D.today + "T12:00:00");
      I.text(g, d0.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(), cx, cy - 16, { size: 9.5, weight: 600, align: "center", color: "#cfd8ea", alpha: 0.75, spacing: 2 });
      I.text(g, d0.toLocaleDateString("en-US", { month: "long", day: "numeric" }), cx, cy + 4, { size: 19, weight: 400, align: "center" });
      const next = D.marks[0]; if (next) I.text(g, I.fit(g, (next.d === 0 ? "today: " : `in ${next.d} d: `) + next.name, r2 * 1.5, 10.5, 500), cx, cy + 24, { size: 10.5, align: "center", color: next.color, alpha: 0.95 });
      I.dot(g, cx + Math.cos(-Math.PI / 2) * R, cy - R, 4, "#ffffff"); I.text(g, "TODAY", cx, cy - R - 13, { size: 8.5, weight: 700, align: "center", color: A, spacing: 2 });
      if (S.pick) { const p = S.pick, w = Math.min(S.w - 20, g.measureText(p.m.name).width + 90); I.text(g, "", 0, 0); g.fillStyle = "rgba(5,7,16,.82)"; const bx = I.clamp(p.x - w / 2, 10, S.w - w - 10), by = I.clamp(p.y - 44, 6, S.h - 40); g.beginPath(); g.roundRect(bx, by, w, 32, 10); g.fill();
        I.text(g, I.fit(g, p.m.name, w - 78, 11.5, 500), bx + 10, by + 16, { size: 11.5 }); I.text(g, label(p.m.date), bx + w - 10, by + 16, { size: 10.5, align: "right", color: p.m.color }); }
    },
    tap(x, y, S) { let best = null, bd = 22 * 22; for (const k of marks) { const d = (k.x - x) ** 2 + (k.y - y) ** 2; if (d < bd) { bd = d; best = k; } } S.pick = best; },
  });
})();
