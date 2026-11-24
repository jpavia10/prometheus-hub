/* Foundry blueprints (Claude, 2026-11-24; owner: "I want the foundry revamped"). One concept sketch per invention on the drawing
   board, drawn on the drafting table line by line (stage.js). Each sketch is built only from what the idea itself says (its title
   and his words in Athenaeum): the labels name parts he named, never a measurement nobody made, and every sheet says
   "concept sketch, not to scale". Coordinates: x -1..1, y -0.62..0.62 (y down). window.FOUNDRY_DWG.forTitle(title) -> sketch. */
(function () {
  "use strict";
  const TAU = Math.PI * 2;
  function sketch(name, note) {
    const P = [], T = [];
    const api = {
      name, note, P, T,
      line(x1, y1, x2, y2, o) { P.push({ pts: [[x1, y1], [x2, y2]], ...o }); return api; },
      poly(pts, closed, o) { P.push({ pts: closed ? [...pts, pts[0]] : pts, ...o }); return api; },
      rect(x, y, w, h, o) { return api.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true, o); },
      ell(cx, cy, rx, ry, o, a0 = 0, a1 = TAU) { const n = Math.max(10, Math.round(44 * Math.abs(a1 - a0) / TAU)), pts = [];
        for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } P.push({ pts, ...o }); return api; },
      circ(cx, cy, r, o) { return api.ell(cx, cy, r, r, o); },
      hex(cx, cy, r, o) { const pts = []; for (let i = 0; i < 6; i++) { const a = TAU * i / 6 + Math.PI / 6; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return api.poly(pts, true, o); },
      /* a leader line from a part to its name; the name shows once the line before it is drawn */
      call(x, y, tx, ty, text) { api.line(x, y, tx, ty, { tone: 1, w: 0.7 }); T.push({ x: tx, y: ty, text, align: tx < x ? "right" : "left", after: P.length }); return api; },
      /* a dimension in words (no invented numbers): extension ticks, a line with end marks, the words over it */
      dim(x1, y1, x2, y2, text) { api.line(x1, y1, x2, y2, { tone: 1, w: 0.7, dash: 1 }); const nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1, e = 0.03;
        api.line(x1 - nx / l * e, y1 - ny / l * e, x1 + nx / l * e, y1 + ny / l * e, { tone: 1, w: 0.7 }); api.line(x2 - nx / l * e, y2 - ny / l * e, x2 + nx / l * e, y2 + ny / l * e, { tone: 1, w: 0.7 });
        T.push({ x: (x1 + x2) / 2 + nx / l * 0.045, y: (y1 + y2) / 2 + ny / l * 0.045, text, align: "center", after: P.length, dim: true }); return api; },
    };
    return api;
  }
  const DWG = {};

  DWG.conveyor = () => { const s = sketch("Self-expanding conveyor", "Trailer modules that hitch end to end; each one carries a belt section that lifts onto the last.");
    s.line(-1, 0.44, 1, 0.44, { tone: 1, dash: 1 });
    [-0.92, -0.32, 0.28].forEach((x, i) => { s.rect(x, 0.24, 0.5, 0.1, {}).circ(x + 0.1, 0.38, 0.055, {}).circ(x + 0.4, 0.38, 0.055, {}); if (i < 2) s.line(x + 0.5, 0.29, x + 0.6, 0.29, { w: 1.4 }); });
    const belt = [[-0.86, 0.2], [-0.42, 0.08], [0.18, -0.08], [0.74, -0.3], [0.92, -0.38]];
    s.poly(belt, false, { w: 1.6 }).poly(belt.map(([x, y]) => [x + 0.02, y - 0.06]), false, { w: 1.1 });
    for (let k = 0; k < 9; k++) { const t = k / 8, i = Math.min(3, Math.floor(t * 4)), f = t * 4 - i, a = belt[i], b = belt[i + 1]; s.circ(a[0] + (b[0] - a[0]) * f + 0.01, a[1] + (b[1] - a[1]) * f - 0.03, 0.022, { tone: 1 }); }
    [-0.66, -0.06, 0.54].forEach((x) => s.line(x, 0.24, x + 0.06, 0.02 - (x + 0.6) * 0.18, { tone: 1, w: 0.9 }));
    s.line(0.74, -0.3, 0.96, -0.46, { dash: 1 }).poly([[0.9, -0.47], [0.96, -0.46], [0.95, -0.4]], false, {});
    s.call(0.84, -0.4, 0.62, -0.52, "expands: the next section lifts on").call(-0.07, 0.34, -0.2, 0.54, "trailer module").call(-0.42, 0.08, -0.7, -0.14, "belt section");
    return s; };

  DWG.ship = () => { const s = sketch("Ocean-cleanup freighter", "A freighter as the mother ship; drones fan out, collect, and bring it back to the hold.");
    const wave = []; for (let i = 0; i <= 40; i++) { const x = -1 + i / 20; wave.push([x, 0.22 + Math.sin(i * 0.9) * 0.012]); } s.poly(wave, false, { tone: 1 });
    s.poly([[-0.84, 0.02], [0.6, 0.02], [0.86, -0.12], [0.74, 0.34], [-0.76, 0.34]], true, { w: 1.6 });
    s.rect(-0.72, -0.26, 0.26, 0.28, {}).line(-0.69, -0.18, -0.49, -0.18, { tone: 1 }).rect(-0.2, 0.08, 0.66, 0.18, { dash: 1, tone: 1 });
    s.line(0.1, 0.02, 0.1, -0.2, {}).line(0.1, -0.2, 0.34, -0.2, {}).line(0.34, -0.2, 0.34, 0.02, {});
    [[-0.1, -0.44], [0.42, -0.5], [0.74, -0.36], [-0.4, -0.5]].forEach(([x, y], i) => { const r = 0.045; s.line(x - r, y - r * 0.6, x + r, y + r * 0.6, {}).line(x - r, y + r * 0.6, x + r, y - r * 0.6, {}).circ(x - r, y - r * 0.6, 0.016, { tone: 1 }).circ(x + r, y + r * 0.6, 0.016, { tone: 1 });
      s.poly([[x, y + 0.04], [x + (i % 2 ? -0.12 : 0.1), 0.0], [x + (i % 2 ? -0.2 : 0.16), 0.2]], false, { tone: 1, dash: 1 }); });
    s.line(0.62, 0.06, 0.96, 0.3, {}).rect(0.9, 0.26, 0.1, 0.05, {}).line(-0.84, 0.06, -0.98, 0.28, {});
    s.call(0.42, -0.5, 0.6, -0.58, "drone collectors").call(0.95, 0.31, 0.7, 0.5, "collection boom").call(0.1, 0.17, -0.2, 0.5, "the hold");
    return s; };

  DWG.devices = () => { const s = sketch("Paid idle-device network", "Phones and laptops that sit idle take a slice of a job; the owner of each device is paid for its share.");
    s.circ(0, 0, 0.13, { w: 1.6 }).circ(0, 0, 0.07, { tone: 1 });
    for (let i = 0; i < 8; i++) { const a = TAU * i / 8 - Math.PI / 2, x = Math.cos(a) * 0.72, y = Math.sin(a) * 0.42;
      s.line(Math.cos(a) * 0.14, Math.sin(a) * 0.14, x * 0.84, y * 0.84, { tone: 1, dash: 1 });
      if (i % 2) s.rect(x - 0.045, y - 0.075, 0.09, 0.15, {}).line(x - 0.015, y + 0.055, x + 0.015, y + 0.055, { tone: 1 });
      else s.poly([[x - 0.09, y - 0.05], [x + 0.09, y - 0.05], [x + 0.09, y + 0.04], [x - 0.09, y + 0.04]], true, {}).line(x - 0.12, y + 0.07, x + 0.12, y + 0.07, {}); }
    s.call(0.72, 0, 0.84, 0.22, "idle device").call(0.1, -0.1, 0.34, -0.3, "job scheduler").call(-0.36, 0.3, -0.7, 0.56, "paid for its share");
    return s; };

  DWG.nano = () => { const s = sketch("Atmospheric alchemy", "A swarm that turns carbon in the air into something useful, and stops itself when the CO₂ ratio is where it should be.");
    for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) { if (Math.abs(r + c) > 3) continue; s.hex(-0.45 + c * 0.11 + r * 0.055, r * 0.095, 0.05, { tone: c === 0 && r === 0 ? 0 : 1 }); }
    s.hex(0.46, -0.04, 0.2, { w: 1.6 }).circ(0.46, -0.04, 0.07, {}).line(0.46, -0.11, 0.46, -0.04, {});
    [0, 1, 2, 3, 4, 5].forEach((i) => { const a = TAU * i / 6, x = 0.46 + Math.cos(a) * 0.2, y = -0.04 + Math.sin(a) * 0.2; s.line(x, y, 0.46 + Math.cos(a) * 0.28, -0.04 + Math.sin(a) * 0.28, { tone: 1 }); });
    s.ell(0.1, 0.42, 0.2, 0.2, {}, Math.PI, TAU).line(0.1, 0.42, 0.24, 0.3, { w: 1.4 }).line(-0.1, 0.42, 0.3, 0.42, { tone: 1 });
    s.poly([[-0.2, 0.0], [0.26, -0.02]], false, { tone: 1, dash: 1 }).poly([[0.24, 0.3], [0.38, 0.14]], false, { tone: 1, dash: 1 });
    s.call(-0.56, -0.2, -0.74, -0.44, "the swarm").call(0.46, -0.04, 0.78, -0.46, "kill switch").call(0.1, 0.24, -0.3, 0.52, "CO₂ ratio sets the stop");
    return s; };

  DWG.aircraft = () => { const s = sketch("Mach 20 aircraft", "A wing the size of an airbase at Mach 20, inside its own plasma sheath.");
    s.poly([[0.86, 0], [-0.62, -0.46], [-0.48, 0], [-0.62, 0.46]], true, { w: 1.7 }).line(-0.5, 0, 0.86, 0, { tone: 1 });
    s.rect(-0.62, -0.16, 0.1, 0.1, {}).rect(-0.62, 0.06, 0.1, 0.1, {});
    const sheath = []; for (let i = -16; i <= 16; i++) { const t = i / 16; sheath.push([1 - 1.85 * t * t, t * 0.6]); } s.poly(sheath, false, { dash: 1 });
    const sheath2 = []; for (let i = -16; i <= 16; i++) { const t = i / 16; sheath2.push([0.95 - 1.7 * t * t, t * 0.55]); } s.poly(sheath2, false, { tone: 1 });
    s.dim(-0.62, 0.54, 0.86, 0.54, "airbase-sized").call(0.78, -0.24, 0.48, -0.5, "plasma sheath").call(-0.57, -0.11, -0.8, -0.4, "engines").call(0.86, 0, 0.96, 0.14, "Mach 20");
    return s; };

  DWG.bio = () => { const s = sketch("Biology as factories", "Mycelium and insects grown as factories: the network does the making, the colony does the moving.");
    const grow = (x, y, a, l, d) => { if (d > 4) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; s.line(x, y, x2, y2, { tone: d > 2 ? 1 : 0, w: 1.6 - d * 0.25 }); grow(x2, y2, a - 0.45 - d * 0.05, l * 0.72, d + 1); grow(x2, y2, a + 0.4 + d * 0.04, l * 0.7, d + 1); };
    s.line(-0.92, 0.42, 0.0, 0.42, { tone: 1, dash: 1 }); grow(-0.46, 0.42, -Math.PI / 2, 0.26, 0);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s.hex(0.32 + c * 0.12 + (r % 2) * 0.06, -0.24 + r * 0.105, 0.06, { tone: (r + c) % 3 ? 1 : 0 });
    s.rect(0.24, 0.28, 0.6, 0.16, {}).line(0.0, 0.36, 0.22, 0.36, {}).poly([[0.17, 0.32], [0.22, 0.36], [0.17, 0.4]], false, {});
    s.call(-0.46, 0.1, -0.84, -0.3, "mycelium network").call(0.56, -0.3, 0.7, -0.52, "insect colony").call(0.54, 0.44, 0.2, 0.58, "what they make");
    return s; };

  DWG.health = () => { const s = sketch("A health manager you can't ignore", "An agent that keeps after you: reads the signs, nudges, then nudges again.");
    [0.22, 0.34, 0.46].forEach((r, i) => s.ell(0, 0, r * 1.5, r, { tone: i ? 1 : 0, dash: i === 2 ? 1 : 0 }));
    s.rect(-0.07, -0.13, 0.14, 0.26, { w: 1.6 }).line(-0.03, 0.09, 0.03, 0.09, { tone: 1 });
    s.poly([[-1, 0.4], [-0.7, 0.4], [-0.64, 0.3], [-0.6, 0.5], [-0.55, 0.22], [-0.5, 0.4], [-0.2, 0.4]], false, { w: 1.3 });
    [[0.5, -0.32], [0.68, -0.08], [0.6, 0.24]].forEach(([x, y]) => s.ell(x, y, 0.05, 0.05, { tone: 0 }, Math.PI * 1.1, Math.PI * 1.9).line(x - 0.03, y + 0.02, x + 0.03, y + 0.02, { tone: 1 }));
    s.call(0, -0.13, -0.3, -0.5, "the manager").call(-0.6, 0.3, -0.84, 0.0, "vitals in").call(0.68, -0.08, 0.86, -0.42, "it keeps asking");
    return s; };

  DWG.verify = () => { const s = sketch("Fragments, checked three ways", "A job cut into fragments; each fragment runs on three machines at once, and only answers that agree go on.");
    s.rect(-0.98, -0.12, 0.24, 0.24, { w: 1.6 });
    [-0.36, 0, 0.36].forEach((y, i) => { s.line(-0.74, 0, -0.56, y, {}).rect(-0.56, y - 0.06, 0.14, 0.12, { tone: 1 });
      [-0.1, 0, 0.1].forEach((dy) => s.line(-0.42, y, -0.12, y + dy, { tone: 1, dash: 1 }).circ(-0.08, y + dy, 0.035, {}));
      s.line(-0.04, y, 0.3, y, { tone: 1 }).poly([[0.3, y], [0.38, y - 0.07], [0.46, y], [0.38, y + 0.07]], true, {}).line(0.46, y, 0.66, 0, { tone: 1 }); });
    s.rect(0.66, -0.12, 0.3, 0.24, { w: 1.6 });
    s.call(-0.86, -0.12, -0.96, -0.4, "the job").call(-0.08, -0.46, -0.3, -0.58, "three machines per fragment").call(0.38, 0.29, 0.2, 0.56, "agree or rerun").call(0.81, 0.12, 0.84, 0.4, "verified answer");
    return s; };

  DWG.space = () => { const s = sketch("Field-drive spacecraft and mining array", "A craft that moves by its own field, with a solar array big enough to power mining in deep space.");
    s.ell(-0.2, 0, 0.14, 0.08, { w: 1.6 });
    [-1, 1].forEach((sgn) => { const y0 = sgn * 0.12, y1 = sgn * 0.5; s.line(-0.2, sgn * 0.08, -0.2, y0, {}).rect(-0.62, Math.min(y0, y1), 0.84, Math.abs(y1 - y0), {});
      for (let k = 1; k < 6; k++) s.line(-0.62 + k * 0.14, Math.min(y0, y1), -0.62 + k * 0.14, Math.max(y0, y1), { tone: 1 }); });
    s.ell(-0.2, 0, 0.32, 0.16, { tone: 1, dash: 1 }).ell(-0.2, 0, 0.5, 0.24, { tone: 1, dash: 1 });
    s.poly([[0.68, -0.1], [0.8, -0.2], [0.94, -0.12], [0.96, 0.06], [0.84, 0.16], [0.7, 0.1]], true, { w: 1.4 }).line(-0.06, 0, 0.68, 0, { dash: 1 });
    s.call(-0.2, -0.5, -0.5, -0.6, "solar array").call(0.3, 0.06, 0.4, 0.4, "drive field").call(0.84, -0.2, 0.62, -0.46, "the rock to mine");
    return s; };

  DWG.farm = () => { const s = sketch("Double-dip farmland", "Pivot circles fill the field; the corners they leave dry get wind turbines.");
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const x = -0.62 + c * 0.52, y = -0.26 + r * 0.52; s.rect(x - 0.26, y - 0.26, 0.52, 0.52, { tone: 1, w: 0.7 }).circ(x, y, 0.24, {}).line(x, y, x + 0.17, y - 0.17, { tone: 1 }); }
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -0.88 + c * 0.52, y = -0.52 + r * 0.52, bl = 0.05;
      s.circ(x, y, 0.012, {}); for (let k = 0; k < 3; k++) { const a = TAU * k / 3 - Math.PI / 2; s.line(x, y, x + Math.cos(a) * bl, y + Math.sin(a) * bl, { w: 1.3 }); } }
    s.call(-0.45, -0.43, -0.6, -0.58, "pivot circle").call(-0.36, 0.0, -0.1, 0.6, "turbine in the dry corner");
    return s; };

  DWG.sweeper = () => { const s = sketch("Street sweeper, 10,000 years out", "A design exercise: what sweeps a street ten thousand years from now.");
    const hull = []; for (let i = 0; i <= 30; i++) { const a = Math.PI + Math.PI * i / 30; hull.push([Math.cos(a) * 0.78, 0.12 + Math.sin(a) * 0.36]); } s.poly([...hull, [0.78, 0.12], [-0.78, 0.12]], false, { w: 1.7 });
    s.ell(0.12, -0.04, 0.34, 0.14, {}, Math.PI, TAU).line(-0.22, -0.04, 0.46, -0.04, { tone: 1 });
    [-0.5, 0.5].forEach((x) => { s.circ(x, 0.24, 0.1, {}); for (let k = 0; k < 6; k++) { const a = TAU * k / 6; s.line(x, 0.24, x + Math.cos(a) * 0.1, 0.24 + Math.sin(a) * 0.1, { tone: 1 }); } });
    [0.4, 0.48].forEach((y) => s.line(-0.7, y, 0.7, y, { tone: 1, dash: 1 })); s.rect(0.7, 0.04, 0.16, 0.1, {});
    s.call(0.5, 0.34, 0.74, 0.56, "brush discs").call(-0.2, 0.44, -0.5, 0.58, "it hovers").call(0.12, -0.18, 0.3, -0.5, "canopy");
    return s; };

  DWG.gear = () => { const s = sketch("Invention", "A concept on the drawing board.");
    const pts = []; for (let i = 0; i < 24; i++) { const a = TAU * i / 24, r = i % 2 ? 0.3 : 0.36; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } s.poly(pts, true, { w: 1.6 }).circ(0, 0, 0.1, { tone: 1 });
    return s; };

  const MATCH = [[/conveyor/, "conveyor"], [/ocean|freighter/, "ship"], [/idle.device|device compute/, "devices"], [/nanobot|alchemy/, "nano"], [/mach|aircraft|plasma/, "aircraft"],
    [/mycelium|insect|biology/, "bio"], [/health/, "health"], [/fragment|verification/, "verify"], [/spacecraft|mining/, "space"], [/farmland|pivot|turbine/, "farm"], [/sweeper/, "sweeper"]];
  const made = new Map();
  window.FOUNDRY_DWG = {
    kind(title) { const t = String(title || "").toLowerCase(); const m = MATCH.find(([re]) => re.test(t)); return m ? m[1] : "gear"; },
    forTitle(title) { const k = this.kind(title); if (!made.has(k)) made.set(k, DWG[k]()); return made.get(k); },
  };
})();
