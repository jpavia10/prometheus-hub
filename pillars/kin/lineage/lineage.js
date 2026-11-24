/* Kin · Lineage (Claude, 2026-11-24): the family tree as a research instrument. The tree (pan, pinch, zoom; your line lit), a dossier for
   each person (names in every spelling, life events with the evidence for each, the journey on a map, the documents, the conflicts and
   their proofs, the open questions), the sources with full citations and transcriptions, and the research plan. Data: lineage/data.js
   (window.KIN_LINEAGE). Your own additions (names for the placeholders, new relatives) stay in this browser (store "kin", key
   "lineage") and travel in the GEDCOM 7 export. Method: pillars/kin/docs/LINEAGE_METHOD.md. window.KIN_LINEAGE_UI for the proofs. */
(function () {
  "use strict";
  const L = window.KIN_LINEAGE, PK = window.PK;
  if (!L || !PK) return;
  const { h, toast, store } = PK;
  const S = store("kin");
  const DOCS = "lineage/docs/";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const by = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
  const TYPE = { birth: "Born", emigration: "Left Europe", immigration: "Arrived", declaration: "Declared intention", draft: "Draft registration", enlistment: "Enlisted", service: "Service", naturalization: "Naturalized", discharge: "Discharged", residence: "Lived", marriage: "Married", occupation: "Worked", death: "Died", burial: "Buried" };
  const CONF = { proven: "Proven", probable: "Probable", possible: "Possible", placeholder: "To name", named: "Named by you", self: "You" };
  const KIND = { original: "Original", derivative: "Derivative", authored: "Authored" };
  const INFO = { primary: "Primary", secondary: "Secondary", undetermined: "Undetermined" };
  const EV = { direct: "Direct", indirect: "Indirect", negative: "Negative" };

  /* ------------------------------------------------------------------ the model: seed + this browser's additions */
  function local() { return Object.assign({ names: {}, people: [], families: [], links: [] }, S.get("lineage", {}) || {}); }
  function saveLocal(x) { S.set("lineage", x); }
  function model() {
    const loc = local();
    const people = L.people.map((p) => {
      const o = JSON.parse(JSON.stringify(p)), n = loc.names[p.id];
      if (n) { o.names = [{ given: n.given || "", surname: n.surname || "", type: "birth", local: true }].concat(o.names.filter((x) => x.given || x.surname)); if (n.sex) o.sex = n.sex; if (n.born) o.born_local = n.born; if (n.note) o.note_local = n.note; if (o.status === "placeholder" && (n.given || n.surname)) o.status = "named"; }
      return o;
    }).concat(loc.people.map((p) => Object.assign({ local: true, status: "named" }, p)));
    const families = L.families.map((f) => ({ id: f.id, partners: f.partners.slice(), children: f.children.slice(), events: (f.events || []).slice() })).concat(loc.families.map((f) => Object.assign({ local: true, events: [] }, f)));
    return { people, P: by(people), families, F: by(families), E: by(L.events), PL: by(L.places), SRC: by(L.sources), C: by(L.conflicts) };
  }
  const nm = (p) => { const n = (p.names || []).find((x) => x.given || x.surname); return n ? `${n.given || ""} ${n.surname || ""}`.trim() : (p.placeholder || "Unnamed"); };
  const firstName = (p) => { const n = (p.names || []).find((x) => x.given || x.surname); return n ? n.given || n.surname : p.placeholder || "Unnamed"; };
  function life(M, p) {
    const ev = L.events.filter((e) => e.who.includes(p.id));
    const b = ev.find((e) => e.type === "birth"), d = ev.find((e) => e.type === "death");
    const by = b ? b.date.sort.slice(0, 4) : p.born_local || (p.born_est ? "c. " + (p.born_est.text.match(/\d{4}/) || [""])[0] : "");
    const dy = d ? d.date.sort.slice(0, 4) : "";
    if (!by && !dy) return p.living ? "living" : "";
    return `${by || "?"}–${dy || (p.living ? "" : "?")}`;
  }
  const parentsOf = (M, pid) => M.families.find((f) => f.children.includes(pid));
  const familiesOf = (M, pid) => M.families.filter((f) => f.partners.includes(pid));
  /* the line from you to the furthest researched ancestor, for the lit path */
  function line(M) {
    const set = new Set([L.root]); let cur = [L.root];
    while (cur.length) { const nx = []; for (const pid of cur) { const f = parentsOf(M, pid); if (f) for (const q of f.partners) if (!set.has(q) && M.P[q] && M.P[q].status !== "possible") { set.add(q); nx.push(q); } } cur = nx; }
    return set;
  }

  /* ------------------------------------------------------------------ layout: ancestors above you, each couple over its children */
  const W = 168, H = 76, GX = 22, GY = 58;
  function layout(M) {
    const pos = {}, aw = {};
    function width(pid, seen) {
      if (aw[pid] != null) return aw[pid];
      if (seen.has(pid)) return W; seen.add(pid);
      const f = parentsOf(M, pid); let w = W;
      if (f && f.partners.length) w = Math.max(W, f.partners.reduce((s, q) => s + width(q, seen), 0) + GX * (f.partners.length - 1));
      return (aw[pid] = w);
    }
    function place(pid, x0, gen) {
      const w = width(pid, new Set()); pos[pid] = { x: x0 + w / 2, gen };
      const f = parentsOf(M, pid);
      if (f) { let x = x0 + (w - (f.partners.reduce((s, q) => s + width(q, new Set()), 0) + GX * (f.partners.length - 1))) / 2; for (const q of f.partners) { if (!pos[q]) place(q, x, gen + 1); x += width(q, new Set()) + GX; } }
    }
    place(L.root, 0, 0);
    /* everyone not yet placed (a sibling, a spouse, a child someone added) goes beside the nearest placed relative */
    let guard = 0, left = M.people.filter((p) => !pos[p.id]);
    while (left.length && guard++ < 20) {
      for (const p of left) {
        const f = parentsOf(M, p.id);
        const sib = f && f.children.find((c) => pos[c]);
        const sp = familiesOf(M, p.id).map((g) => g.partners.find((q) => q !== p.id && pos[q])).find(Boolean);
        const kid = familiesOf(M, p.id).map((g) => g.children.find((c) => pos[c])).find(Boolean);
        const anchor = sib || sp || (kid ? null : null), gen = sib ? pos[sib].gen : sp ? pos[sp].gen : kid ? pos[kid].gen + 1 : null;
        if (gen == null) continue;
        const row = Object.values(pos).filter((q) => q.gen === gen).map((q) => q.x);
        const near = anchor ? pos[anchor].x : pos[kid].x;
        let x = near + W + GX; while (row.some((r) => Math.abs(r - x) < W + GX - 1)) x += W + GX;
        pos[p.id] = { x, gen };
      }
      left = M.people.filter((p) => !pos[p.id]);
    }
    const gens = Object.values(pos).map((q) => q.gen), top = Math.max(...gens);
    for (const k in pos) pos[k].y = (top - pos[k].gen) * (H + GY) + H / 2;
    const xs = Object.values(pos).map((q) => q.x);
    return { pos, minX: Math.min(...xs) - W / 2, maxX: Math.max(...xs) + W / 2, height: (top + 1) * (H + GY) - GY };
  }

  /* ------------------------------------------------------------------ the tree */
  const ui = { sel: "P-joseph", view: { s: 1, x: 0, y: 0 }, M: null, lay: null };
  function drawTree(root) {
    const M = ui.M = model(), lay = ui.lay = layout(M), lit = ui.lit = line(M);
    const NS = "http://www.w3.org/2000/svg";
    const svg = root.querySelector("svg.ln-svg"), g = svg.querySelector("g.ln-world");
    g.innerHTML = "";
    const add = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (parent || g).appendChild(e); return e; };
    /* family connectors: partners joined by a bar, a stem down to the children */
    for (const f of M.families) {
      const ps = f.partners.map((q) => lay.pos[q]).filter(Boolean), cs = f.children.map((c) => lay.pos[c]).filter(Boolean);
      if (!ps.length) continue;
      const midX = ps.reduce((s, q) => s + q.x, 0) / ps.length, y0 = ps[0].y + H / 2;
      const onLine = f.children.some((c) => lit.has(c)) && f.partners.some((q) => lit.has(q));
      if (ps.length > 1) add("path", { d: `M${ps[0].x + W / 2} ${ps[0].y}H${ps[ps.length - 1].x - W / 2}`, class: "ln-wed" + (onLine ? " lit" : "") });
      for (const c of cs) {
        const lt = onLine && lit.has(f.children[cs.indexOf(c)]);
        add("path", { d: `M${midX} ${ps.length > 1 ? ps[0].y : y0}V${(y0 + c.y - H / 2) / 2}H${c.x}V${c.y - H / 2}`, class: "ln-stem" + (lt ? " lit" : "") });
      }
    }
    for (const p of M.people) {
      const q = lay.pos[p.id]; if (!q) continue;
      const k = add("g", { class: `ln-node st-${p.status}` + (lit.has(p.id) ? " lit" : "") + (ui.sel === p.id ? " sel" : ""), transform: `translate(${q.x - W / 2} ${q.y - H / 2})`, tabindex: "0", role: "button", "data-id": p.id, "aria-label": `${nm(p)} ${life(M, p)}` });
      add("rect", { width: W, height: H, rx: 14, class: "ln-card" }, k);
      add("rect", { width: 5, height: H - 24, x: 0, y: 12, rx: 2.5, class: "ln-tab" }, k);
      const t1 = add("text", { x: 16, y: 27, class: "ln-name" }, k); t1.textContent = trunc(p.status === "placeholder" ? p.placeholder : nm(p), 21);
      const t2 = add("text", { x: 16, y: 47, class: "ln-life" }, k); t2.textContent = p.status === "placeholder" ? "tap to name" : life(M, p) || " ";
      const t3 = add("text", { x: 16, y: 64, class: "ln-badge" }, k); t3.textContent = (CONF[p.status] || p.status).toUpperCase();
    }
    const vb = { x: lay.minX - 30, y: -30, w: lay.maxX - lay.minX + 60, h: lay.height + 60 };
    svg.dataset.vb = JSON.stringify(vb);
    apply(root);
  }
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  function apply(root) {
    const svg = root.querySelector("svg.ln-svg"), g = svg.querySelector("g.ln-world"), v = ui.view;
    g.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${v.s})`);
  }
  function focus(root, pid, s) {
    const svg = root.querySelector("svg.ln-svg"), r = svg.getBoundingClientRect(), q = ui.lay && ui.lay.pos[pid]; if (!q) return;
    const sc = s || ui.view.s; ui.view = { s: sc, x: r.width / 2 - q.x * sc, y: r.height * 0.42 - q.y * sc }; animate(root);
  }
  function fit(root) {
    const svg = root.querySelector("svg.ln-svg"), r = svg.getBoundingClientRect(), vb = JSON.parse(svg.dataset.vb || "{}");
    const sc = Math.min(r.width / vb.w, r.height / vb.h, 1.2); ui.view = { s: sc, x: (r.width - vb.w * sc) / 2 - vb.x * sc, y: (r.height - vb.h * sc) / 2 - vb.y * sc }; animate(root);
  }
  /* the first view: the whole tree when it is still readable, else your lit line (you up to the furthest researched ancestor and the
     partner beside them), never smaller than a scale where names can be read */
  function first(root) {
    const svg = root.querySelector("svg.ln-svg"), r = svg.getBoundingClientRect(), vb = JSON.parse(svg.dataset.vb || "{}");
    if (Math.min(r.width / vb.w, r.height / vb.h) >= 0.62) return fit(root);
    const ids = [...(ui.lit || [])].filter((i) => ui.lay.pos[i]); if (!ids.length) return focus(root, ui.sel, 0.66);
    const xs = ids.map((i) => ui.lay.pos[i].x), ys = ids.map((i) => ui.lay.pos[i].y), up = ids.some((i) => parentsOf(ui.M, i) && !ids.includes(parentsOf(ui.M, i).partners[0])) ? H + GY : 0;
    const bx = Math.min(...xs) - W / 2 - 16, bw = Math.max(...xs) - Math.min(...xs) + W + 32, by = Math.min(...ys) - H / 2 - 16 - up, bh = Math.max(...ys) - Math.min(...ys) + H + 32 + up;
    const top = 64, bot = 40, sc = Math.max(0.5, Math.min(r.width / bw, (r.height - top - bot) / bh, 1.1));
    ui.view = { s: sc, x: r.width / 2 - (bx + bw / 2) * sc, y: top - by * sc }; animate(root);
  }
  function animate(root) { const g = root.querySelector("g.ln-world"); g.classList.add("glide"); apply(root); clearTimeout(ui.t); ui.t = setTimeout(() => g.classList.remove("glide"), 420); }
  function zoomAt(root, k, cx, cy) {
    const v = ui.view, s = Math.max(0.3, Math.min(2.6, v.s * k)), f = s / v.s; ui.view = { s, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f }; apply(root);
  }
  function wire(root, onPick) {
    const svg = root.querySelector("svg.ln-svg"), pts = new Map(); let drag = null, moved = 0, pinch = null;
    let hit = null; /* the card under the finger at pointerdown: once the svg captures the pointer, pointerup's target is the svg itself */
    svg.addEventListener("pointerdown", (e) => { hit = (e.target.closest && e.target.closest(".ln-node")) || null; svg.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0;
      if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, vx: ui.view.x, vy: ui.view.y };
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: ui.view.s }; drag = null; } });
    svg.addEventListener("pointermove", (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && pts.size === 2) { const [a, b] = [...pts.values()], r = svg.getBoundingClientRect(), d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt(root, (pinch.s * d / pinch.d) / ui.view.s, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); moved = 99; return; }
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); ui.view.x = drag.vx + dx; ui.view.y = drag.vy + dy; apply(root); } });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) {
        if (moved < 6 && hit) onPick(hit.dataset.id); hit = null;
        drag = null; } };
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    svg.addEventListener("wheel", (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(root, Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    svg.addEventListener("keydown", (e) => { const n = e.target.closest && e.target.closest(".ln-node"); if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPick(n.dataset.id); } });
  }

  /* ------------------------------------------------------------------ the journey map (Odyssey's coastlines, equirectangular) */
  function journey(M, p) {
    const ev = L.events.filter((e) => e.who.includes(p.id) && e.place).sort((a, b) => a.date.sort.localeCompare(b.date.sort));
    const pts = []; for (const e of ev) { const pl = M.PL[e.place]; if (pl && !(pts.length && pts[pts.length - 1].pl === pl)) pts.push({ pl, e }); }
    if (pts.length < 2 || !window.ODYSSEY_GLOBE) return "";
    pts.forEach((q, i) => { q.n = i + 1; q.side = q.pl.lon < -30 ? 1 : 0; });
    /* one panel per side of the Atlantic, each on its own scale, so a Lithuanian town and a Detroit hospital are both readable */
    const sides = [0, 1].filter((sd) => pts.some((q) => q.side === sd));
    const maps = sides.map((sd) => panel(pts, sd, sides.length > 1)).join("");
    const legend = pts.map((q) => `<li><b>${q.n}</b> ${esc(q.pl.name)} <span>${esc(q.e.date.text)}</span></li>`).join("");
    return `<figure class="jr${sides.length > 1 ? " two" : ""}">${maps}<ol class="jr-legend">${legend}</ol></figure>`;
  }
  function panel(pts, sd, both) {
    const mine = pts.filter((q) => q.side === sd), lons = mine.map((q) => q.pl.lon), lats = mine.map((q) => q.pl.lat);
    let x0 = Math.min(...lons), x1 = Math.max(...lons), y0 = Math.min(...lats), y1 = Math.max(...lats);
    const px = Math.max(2.5, (x1 - x0) * 0.2), py = Math.max(1.8, (y1 - y0) * 0.22);
    x0 -= px; x1 += px; y0 -= py; y1 += py;
    if (both) { const m = Math.max(6, (x1 - x0) * 0.38); if (sd === 0) x0 -= m; else x1 += m; } /* open ocean at the crossing edge for the arrows and their labels */
    const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180), Wm = 520;
    /* keep the panel between 1:2.2 and 1:1.1 by widening the short side */
    let Hm = Wm * (y1 - y0) / ((x1 - x0) * k);
    if (Hm < Wm / 2.2) { const need = (Wm / 2.2) * (x1 - x0) * k / Wm - (y1 - y0); y0 -= need / 2; y1 += need / 2; Hm = Wm / 2.2; }
    if (Hm > Wm / 1.1) { const need = (y1 - y0) * Wm / (Wm / 1.1) / k - (x1 - x0); x0 -= need / 2; x1 += need / 2; Hm = Wm / 1.1; }
    Hm = Math.round(Hm);
    const X = (lon) => (lon - x0) / (x1 - x0) * Wm, Y = (lat) => (y1 - lat) / (y1 - y0) * Hm;
    let land = "";
    for (const ring of window.ODYSSEY_GLOBE) {
      let d = "", inb = false;
      for (let i = 0; i < ring.length; i += 2) { const lo = ring[i] / 10, la = ring[i + 1] / 10; if (lo < x0 - 12 || lo > x1 + 12 || la < y0 - 9 || la > y1 + 9) { inb = false; continue; } d += (inb ? "L" : "M") + X(lo).toFixed(1) + " " + Y(la).toFixed(1); inb = true; }
      if (d) land += `<path d="${d}"/>`;
    }
    /* dots: places closer than a dot's width share one marker that lists every visit */
    const cl = [];
    for (const q of mine) { const x = X(q.pl.lon), y = Y(q.pl.lat), c = cl.find((c) => Math.hypot(c.x - x, c.y - y) < 26); if (c) c.n.push(q.n); else cl.push({ x, y, n: [q.n] }); }
    const at = (q) => { const c = cl.find((c) => c.n.includes(q.n)); return [c.x, c.y]; };
    let arcs = "", cross = "";
    const xs = pts.map((q, i) => i && (pts[i - 1].side === sd) !== (q.side === sd) ? i : 0).filter(Boolean);
    pts.forEach((q, i) => {
      if (!i) return; const a = pts[i - 1];
      if (a.side === sd && q.side === sd) {
        const [ax, ay] = at(a), [x, y] = at(q); if (Math.hypot(x - ax, y - ay) < 1) return;
        const mx = (ax + x) / 2, my = (ay + y) / 2 - Math.min(60, Math.hypot(x - ax, y - ay) * 0.3);
        arcs += `<path class="jr-arc" style="--i:${i}" d="M${ax.toFixed(1)} ${ay.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}"/>`;
      } else if (a.side === sd || q.side === sd) {
        /* an Atlantic crossing: an arrow to (or from) the ocean edge of this panel; crossings are spread down the edge so none collide */
        const out = a.side === sd, [px0, py0] = at(out ? a : q), edge = sd === 0 ? 4 : Wm - 4, j = xs.indexOf(i), ey = Hm * (j + 1) / (xs.length + 1);
        const cx = (px0 + edge) / 2, cy = (py0 + ey) / 2 - 22;
        let d;
        if (out) d = `M${px0.toFixed(1)} ${py0.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${edge} ${ey.toFixed(1)}`;
        else { const ux = cx - px0, uy = cy - py0, L0 = Math.hypot(ux, uy) || 1, ex = px0 + ux / L0 * 24, ey2 = py0 + uy / L0 * 24; d = `M${edge} ${ey.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey2.toFixed(1)}`; }
        const yr = (q.e.date.sort || "").slice(0, 4), tx = sd === 0 ? 10 : Wm - 10, ty = ey + (ey > Hm / 2 ? 22 : -10);
        cross += `<path class="jr-cross" marker-end="url(#jr-head-${sd})" style="--i:${i}" d="${d}"/><text class="jr-ctext" x="${tx}" y="${ty.toFixed(1)}" text-anchor="${sd === 0 ? "start" : "end"}">${esc(yr)} ${out ? "to" : "from"} ${sd === 0 ? "America" : "Europe"}</text>`;
      }
    });
    const dots = cl.map((c) => { const t = c.n.join(" · "), w = Math.max(30, 13 + t.length * 8.4);
      return `<g class="jr-dot" style="--i:${c.n[0] - 1}" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})"><rect x="${-w / 2}" y="-13" width="${w}" height="26" rx="13"/><text y="5">${t}</text></g>`; }).join("");
    const title = sd === 0 ? "Europe" : "America";
    const yrs = mine.map((q) => (q.e.date.sort || "").slice(0, 4)).filter(Boolean), span = yrs.length ? (yrs[0] === yrs[yrs.length - 1] ? yrs[0] : `${yrs[0]}–${yrs[yrs.length - 1]}`) : "";
    return `<p class="jr-cap">${title}<span>${span}</span></p><svg viewBox="0 0 ${Wm} ${Hm}" role="img" aria-label="${title}: where his life happened, in order"><defs><marker id="jr-head-${sd}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#e7c27a"/></marker></defs><g class="jr-land">${land}</g>${arcs}${cross}${dots}</svg>`;
  }

  /* ------------------------------------------------------------------ the dossier */
  function chips(a) { const s = ui.M.SRC[a.src] || {}; return `<span class="ln-chip k-${s.kind}">${KIND[s.kind] || "?"}</span><span class="ln-chip i-${a.info}">${INFO[a.info] || "?"}</span><span class="ln-chip e-${a.ev}">${EV[a.ev] || "?"}</span>`; }
  function dossier(el, pid) {
    const M = ui.M, p = M.P[pid]; if (!p) return;
    const ev = L.events.filter((e) => e.who.includes(pid)).sort((a, b) => a.date.sort.localeCompare(b.date.sort));
    const srcIds = [...new Set(ev.flatMap((e) => e.assert.map((a) => a.src)).concat((p.names || []).flatMap((n) => n.src || [])))];
    const imgs = srcIds.flatMap((s) => (M.SRC[s] && M.SRC[s].img || []).map((i) => ({ i, s })));
    const cons = L.conflicts.filter((c) => c.person === pid), qs = L.questions.filter((q) => q.person === pid).sort((a, b) => a.p - b.p);
    const fam = { parents: (parentsOf(M, pid) || { partners: [] }).partners, spouses: familiesOf(M, pid).flatMap((f) => f.partners.filter((q) => q !== pid)), kids: familiesOf(M, pid).flatMap((f) => f.children) };
    const rel = (ids, label) => ids.length ? `<p class="ln-rel"><span>${label}</span>${ids.map((q) => `<button type="button" class="ln-link" data-go="${q}">${esc(M.P[q] ? (M.P[q].status === "placeholder" ? M.P[q].placeholder : nm(M.P[q])) : q)}</button>`).join("")}</p>` : "";
    const names = (p.names || []).filter((n) => n.given || n.surname).map((n) => `<span class="ln-name-chip" title="${esc(n.note || "")}">${esc(`${n.given} ${n.surname}`.trim())}<small>${esc(n.type)}</small></span>`).join("");
    el.innerHTML = `
      <header class="ln-dhead"><p class="ln-kick">${esc(CONF[p.status] || p.status)}${p.local ? " · added on this device" : ""}</p>
        <h3>${esc(p.status === "placeholder" ? p.placeholder : nm(p))}</h3><p class="ln-dlife">${esc(life(M, p))}${p.born_est ? ` · born ${esc(p.born_est.text)}` : ""}</p>
        ${names ? `<div class="ln-names">${names}</div>` : ""}</header>
      ${p.summary ? `<p class="ln-sum">${esc(p.summary)}</p>` : ""}${p.note ? `<p class="ln-note">${esc(p.note)}</p>` : ""}${p.note_local ? `<p class="ln-note">${esc(p.note_local)}</p>` : ""}
      ${p.born_est ? `<p class="ln-note">Basis for the estimate: ${esc(p.born_est.basis)}.</p>` : ""}
      ${rel(fam.parents, "Parents")}${rel(fam.spouses, "Spouse")}${rel(fam.kids, "Children")}
      ${namer(p)}
      ${ev.length ? `<h4>Life in the records</h4><ol class="ln-tl">${ev.map((e) => `
        <li class="ln-ev c-${e.confidence}"><div class="ln-evh"><time>${esc(e.date.text)}</time><b>${esc(TYPE[e.type] || e.type)}</b><span class="ln-conf">${esc(CONF[e.confidence] || e.confidence)}</span></div>
          <p class="ln-evc">${esc(e.conclusion)}</p>${e.place && M.PL[e.place] ? `<p class="ln-pl">${esc(M.PL[e.place].hist)}${e.placeNote ? ` <em>(${esc(e.placeNote)})</em>` : ""}</p>` : ""}
          <details class="ln-evd"><summary>Evidence · ${e.assert.length} source${e.assert.length === 1 ? "" : "s"}${e.conflict ? ` · conflict ${e.conflict}` : ""}</summary>
            <ul>${e.assert.map((a) => `<li><button type="button" class="ln-link" data-src="${a.src}">${esc((M.SRC[a.src] || {}).short || a.src)}</button><q>${esc(a.value)}</q><span class="ln-chips">${chips(a)}</span>${a.note ? `<em>${esc(a.note)}</em>` : ""}</li>`).join("")}</ul></details></li>`).join("")}</ol>` : ""}
      ${ev.length ? journey(M, p) : ""}
      ${imgs.length ? `<h4>Documents</h4><div class="ln-docs">${imgs.map((d) => `<button type="button" class="ln-doc" data-img="${d.i}" data-src="${d.s}" aria-label="${esc((M.SRC[d.s] || {}).short || d.i)}"><img loading="lazy" src="${DOCS}t/${d.i}.webp" alt=""><span>${esc((M.SRC[d.s] || {}).short || "")}</span></button>`).join("")}</div>` : ""}
      ${cons.length ? `<h4>Conflicts and proofs</h4>${cons.map(conflictHtml).join("")}` : ""}
      ${qs.length ? `<h4>Open questions</h4><ul class="ln-qs">${qs.map((q) => `<li><b>${q.id}</b><span class="ln-pri p${q.p}">P${q.p}</span> ${esc(q.q)}<small>${esc(q.sources)} · ${esc(q.task === "owner" ? "for you" : q.task)}</small></li>`).join("")}</ul>` : ""}
      ${addForm(p)}`;
  }
  function conflictHtml(c) { return `<details class="ln-con s-${c.status}"><summary><b>${c.id}</b> ${esc(c.q)}<span>${esc(c.status)}: ${esc(c.conclusion)}</span></summary><p>${esc(c.argument)}</p></details>`; }
  function namer(p) {
    if (p.status !== "placeholder" && !(local().names[p.id])) return "";
    const n = local().names[p.id] || {};
    return `<form class="form ln-namer" data-pid="${p.id}"><p class="ln-kick">Name this person</p>
      <label class="f">Given names<input name="given" maxlength="80" value="${esc(n.given || "")}" autocomplete="off"></label>
      <label class="f">Surname at birth<input name="surname" maxlength="80" value="${esc(n.surname || "")}" autocomplete="off"></label>
      <label class="f">Born (year)<input name="born" maxlength="12" inputmode="numeric" value="${esc(n.born || "")}"></label>
      <label class="f">Sex<select name="sex"><option value="">—</option><option value="F"${n.sex === "F" ? " selected" : ""}>Female</option><option value="M"${n.sex === "M" ? " selected" : ""}>Male</option></select></label>
      <label class="f wide">What you know<input name="note" maxlength="300" value="${esc(n.note || "")}" placeholder="Where they lived, a story, where the papers are"></label>
      <button class="btn" type="submit">Save</button></form>`;
  }
  function addForm(p) {
    return `<form class="form ln-add" data-pid="${p.id}"><p class="ln-kick">Add a relative of ${esc(firstName(p))}</p>
      <label class="f">Relation<select name="rel"><option value="child">child</option><option value="parent">parent</option><option value="spouse">spouse</option><option value="sibling">brother or sister</option></select></label>
      <label class="f">Given names<input name="given" required maxlength="80" autocomplete="off"></label><label class="f">Surname<input name="surname" maxlength="80" autocomplete="off"></label>
      <label class="f">Born (year)<input name="born" maxlength="12" inputmode="numeric"></label>
      <label class="f">Sex<select name="sex"><option value="">—</option><option value="F">Female</option><option value="M">Male</option></select></label>
      <button class="btn quiet" type="submit">Add</button></form>`;
  }

  /* ------------------------------------------------------------------ documents: a full-screen viewer with zoom */
  function viewer(img, srcId) {
    const s = ui.M.SRC[srcId] || {};
    const box = h("div", { class: "ln-view", role: "dialog", "aria-modal": "true", "aria-label": s.short || img, tabindex: "-1" });
    box.innerHTML = `<div class="ln-vstage"><img src="${DOCS}${img}.webp" alt="${esc(s.short || img)}" draggable="false"></div>
      <aside class="ln-vcap"><b>${esc(s.short || "")}</b><p>${esc(s.read || "")}</p><p class="ln-cite">${esc(s.cite || "")}</p>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">Open the record</a>` : ""}</aside>
      <button type="button" class="ln-vx" aria-label="Close">×</button>`;
    document.body.appendChild(box); box.focus();
    const im = box.querySelector("img"), st = { s: 1, x: 0, y: 0 }, pts = new Map(); let d0 = null, p0 = null;
    const ap = () => { im.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.s})`; };
    box.querySelector(".ln-vstage").addEventListener("wheel", (e) => { e.preventDefault(); st.s = Math.max(1, Math.min(6, st.s * Math.exp(-e.deltaY * 0.002))); ap(); }, { passive: false });
    im.addEventListener("pointerdown", (e) => { im.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 1) p0 = { x: e.clientX - st.x, y: e.clientY - st.y }; if (pts.size === 2) { const [a, b] = [...pts.values()]; d0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: st.s }; } });
    im.addEventListener("pointermove", (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (d0 && pts.size === 2) { const [a, b] = [...pts.values()]; st.s = Math.max(1, Math.min(6, d0.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / d0.d)); ap(); return; }
      if (p0 && st.s > 1) { st.x = e.clientX - p0.x; st.y = e.clientY - p0.y; ap(); } });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) d0 = null; if (!pts.size) p0 = null; };
    im.addEventListener("pointerup", up); im.addEventListener("pointercancel", up);
    im.addEventListener("dblclick", () => { st.s = st.s > 1 ? 1 : 2.5; st.x = st.y = 0; ap(); });
    const close = () => { box.remove(); document.removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", key); box.querySelector(".ln-vx").addEventListener("click", close);
  }

  /* ------------------------------------------------------------------ sources, research plan, method */
  function sourcesHtml() {
    const M = ui.M, use = {};
    for (const e of L.events) for (const a of e.assert) (use[a.src] = use[a.src] || []).push(TYPE[e.type] || e.type);
    const groups = ["original", "derivative", "authored"];
    return groups.map((k) => `<h4>${KIND[k]} sources</h4>` + L.sources.filter((s) => s.kind === k).map((s) => `
      <details class="ln-src" id="src-${s.id}"><summary><b>${esc(s.short)}</b><span>${esc((use[s.id] || []).filter((x, i, a) => a.indexOf(x) === i).join(" · ") || "context")}</span></summary>
        <p class="ln-cite">${esc(s.cite)}</p>${s.repo ? `<p class="ln-repo">${esc(s.repo)}</p>` : ""}${s.read ? `<p class="ln-read"><span>Transcription</span>${esc(s.read)}</p>` : ""}
        ${(s.img || []).length ? `<div class="ln-docs">${s.img.map((i) => `<button type="button" class="ln-doc" data-img="${i}" data-src="${s.id}" aria-label="${esc(s.short)}"><img loading="lazy" src="${DOCS}t/${i}.webp" alt=""></button>`).join("")}</div>` : ""}
        ${s.url ? `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">Open the record</a></p>` : ""}</details>`).join("")).join("");
  }
  function planHtml() {
    const qs = L.questions.slice().sort((a, b) => a.p - b.p || a.id.localeCompare(b.id));
    const gps = Object.entries(L.gps).map(([pid, g]) => `<div class="ln-gps"><b>${esc(nm(ui.M.P[pid]))}</b><dl>${[["Reasonably exhaustive search", g.search], ["Citations", g.cite], ["Analysis and correlation", g.analysis], ["Conflicts", g.conflicts], ["Written conclusion", g.written]].map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>`).join("");
    return `<p class="sub">What to find next, in order. Each question names the records that answer it and who is on it (Gemini's homework in Kin, or you).</p>
      <ul class="ln-qs">${qs.map((q) => `<li><b>${q.id}</b><span class="ln-pri p${q.p}">P${q.p}</span> ${esc(q.q)}<small>${esc(q.sources)} · ${esc(q.task === "owner" ? "for you" : q.task)}</small></li>`).join("")}</ul>
      <h4>Hypotheses, not facts</h4><ul class="ln-hyp">${L.hypotheses.map((x) => `<li><b>${x.id}</b> ${esc(x.text)} <small>test: ${esc(x.test)}</small></li>`).join("")}</ul>
      <h4>Every conflict</h4>${L.conflicts.map(conflictHtml).join("")}
      <h4>The proof standard, person by person</h4>${gps}
      <h4>How this tree is kept</h4><ol class="ln-gpsl">${L.standard.elements.map(([k, v]) => `<li><b>${esc(k)}.</b> ${esc(v)}</li>`).join("")}</ol>
      <p class="sub">${esc(L.standard.name)}: ${esc(L.standard.by)}. Each piece of evidence is tagged three ways: the source (${Object.keys(L.standard.classes.source).join(", ")}), the information (${Object.keys(L.standard.classes.info).join(", ")}) and the evidence (${Object.keys(L.standard.classes.evidence).join(", ")}). The full method: <a href="https://github.com/jpavia10/prometheus-hub/blob/main/pillars/kin/docs/LINEAGE_METHOD.md" target="_blank" rel="noopener">LINEAGE_METHOD.md</a>.</p>`;
  }

  /* ------------------------------------------------------------------ GEDCOM 7 */
  function gedDate(t) {
    const M3 = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.sort || "");
    if (/about|c\.|on or about/i.test(t.text) && m) return `ABT ${+m[3]} ${M3[+m[2] - 1]} ${m[1]}`;
    if (/between/i.test(t.text)) return t.text.replace(/between (\d{4}) and (\d{4})/i, "BET $1 AND $2");
    return m ? `${+m[3]} ${M3[+m[2] - 1]} ${m[1]}` : t.text;
  }
  function gedcom() {
    const M = model(), out = ["0 HEAD", "1 GEDC", "2 VERS 7.0", "1 SOUR PROMETHEUS-KIN", "2 NAME Kin · Lineage", `1 DATE ${gedDate({ sort: new Date().toISOString().slice(0, 10), text: "" })}`, "1 LANG en"];
    const tag = { birth: "BIRT", emigration: "EMIG", immigration: "IMMI", declaration: "EVEN", draft: "EVEN", enlistment: "EVEN", service: "EVEN", naturalization: "NATU", discharge: "EVEN", residence: "RESI", occupation: "OCCU", death: "DEAT", burial: "BURI" };
    const xid = (id) => "@" + id.replace(/[^A-Za-z0-9]/g, "") + "@";
    for (const p of M.people) {
      out.push(`0 ${xid(p.id)} INDI`);
      for (const n of (p.names || []).filter((x) => x.given || x.surname)) { out.push(`1 NAME ${n.given || ""} /${n.surname || ""}/`.replace(/\s+\//, " /")); if (n.type && n.type !== "birth" && n.type !== "preferred") out.push(`2 TYPE OTHER`, `3 PHRASE ${n.type}`); }
      if (!(p.names || []).some((x) => x.given || x.surname)) out.push(`1 NAME ${p.placeholder || "Unknown"} //`);
      out.push(`1 SEX ${p.sex === "M" || p.sex === "F" ? p.sex : "U"}`);
      for (const e of L.events.filter((x) => x.who.includes(p.id) && x.type !== "marriage")) {
        const t = tag[e.type] || "EVEN"; out.push(`1 ${t}${t === "OCCU" ? " Furnace attendant, Ford Motor Co." : ""}`);
        if (t === "EVEN") out.push(`2 TYPE ${TYPE[e.type] || e.type}`);
        out.push(`2 DATE ${gedDate(e.date)}`); if (e.place && M.PL[e.place]) out.push(`2 PLAC ${M.PL[e.place].hist}`);
        out.push(`2 NOTE ${e.conclusion}`);
        for (const a of e.assert) { out.push(`2 SOUR ${xid(a.src)}`, `3 PAGE ${a.value}`); }
      }
      if (p.summary) out.push(`1 NOTE ${p.summary}`);
      for (const f of M.families.filter((x) => x.partners.includes(p.id))) out.push(`1 FAMS ${xid(f.id)}`);
      const pf = parentsOf(M, p.id); if (pf) out.push(`1 FAMC ${xid(pf.id)}`);
    }
    for (const f of M.families) {
      out.push(`0 ${xid(f.id)} FAM`);
      f.partners.forEach((q) => { const s = (M.P[q] || {}).sex; out.push(`1 ${s === "F" ? "WIFE" : "HUSB"} ${xid(q)}`); });
      for (const c of f.children) out.push(`1 CHIL ${xid(c)}`);
      for (const eid of f.events || []) { const e = M.E[eid]; if (!e) continue; out.push("1 MARR", `2 DATE ${gedDate(e.date)}`); if (e.place && M.PL[e.place]) out.push(`2 PLAC ${M.PL[e.place].hist}`); for (const a of e.assert) out.push(`2 SOUR ${xid(a.src)}`, `3 PAGE ${a.value}`); }
    }
    for (const s of L.sources) { out.push(`0 ${xid(s.id)} SOUR`, `1 TITL ${s.short}`, `1 TEXT ${s.cite}`); if (s.repo) out.push(`1 NOTE ${s.repo}`); if (s.read) out.push(`1 NOTE ${s.read}`); }
    out.push("0 TRLR");
    return out.map((l) => l.replace(/\n/g, " ")).join("\n") + "\n";
  }

  /* ------------------------------------------------------------------ mount */
  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid) return;
    const panel = (id, title, sub, inner) => { const d = h("div", { class: "glass span-12 ln-panel", id }); d.innerHTML = `<h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}${inner}`; return d; };
    const tree = panel("ln-tree", "The family tree", "Your line, generation by generation, from the records. Drag to move, pinch or scroll to zoom, tap a person for everything known about them and how it is known.",
      `<div class="ln-stage"><svg class="ln-svg" role="group" aria-label="Family tree"><g class="ln-world"></g></svg>
        <div class="ln-tools"><button type="button" class="btn quiet small" data-z="in" aria-label="Zoom in">+</button><button type="button" class="btn quiet small" data-z="out" aria-label="Zoom out">−</button><button type="button" class="btn quiet small" data-z="fit">Whole tree</button><button type="button" class="btn quiet small" data-z="me">You</button></div>
        <p class="ln-legend"><span class="st-proven">Proven</span><span class="st-probable">Probable</span><span class="st-possible">Possible</span><span class="st-placeholder">To name</span></p></div>
      <div class="ln-dossier" id="ln-dossier" aria-live="polite"></div>
      <div class="ln-foot"><button type="button" class="btn quiet small" id="ln-ged">Export GEDCOM 7</button><span>${L.people.length} people · ${L.events.length} events · ${L.sources.length} sources · ${L.conflicts.length} conflicts weighed</span></div>`);
    const src = panel("ln-sources", "Sources of the family history", "Every record behind the tree, with its full citation, where it is kept, a transcription and the image.", `<div id="ln-srcs"></div>`);
    const plan = panel("ln-plan", "Family research plan", "", `<div id="ln-planx"></div>`);
    grid.insertBefore(plan, grid.firstChild); grid.insertBefore(src, plan); grid.insertBefore(tree, src);
    const root = tree, dos = tree.querySelector("#ln-dossier");
    const pick = (pid, center) => { ui.sel = pid; drawTree(root); dossier(dos, pid); if (center) focus(root, pid); };
    drawTree(root); dossier(dos, ui.sel); src.querySelector("#ln-srcs").innerHTML = sourcesHtml(); plan.querySelector("#ln-planx").innerHTML = planHtml();
    requestAnimationFrame(() => first(root));
    wire(root, (pid) => pick(pid, false));
    tree.querySelector(".ln-tools").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const svg = root.querySelector("svg.ln-svg").getBoundingClientRect();
      if (b.dataset.z === "in") { zoomAt(root, 1.25, svg.width / 2, svg.height / 2); } if (b.dataset.z === "out") zoomAt(root, 0.8, svg.width / 2, svg.height / 2); if (b.dataset.z === "fit") fit(root); if (b.dataset.z === "me") pick(L.root, true); });
    document.querySelector("#app").addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]"); if (go) { pick(go.dataset.go, true); root.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      const im = e.target.closest(".ln-doc"); if (im) { viewer(im.dataset.img, im.dataset.src); return; }
      const sb = e.target.closest(".ln-link[data-src]"); if (sb) { const s = ui.M.SRC[sb.dataset.src]; if (s && s.img && s.img.length) viewer(s.img[0], s.id); else toast(s ? s.cite : ""); }
    });
    document.querySelector("#app").addEventListener("submit", (e) => {
      const f = e.target; if (!f.classList.contains("ln-namer") && !f.classList.contains("ln-add")) return; e.preventDefault();
      const fd = Object.fromEntries(new FormData(f).entries()), loc = local(), pid = f.dataset.pid;
      if (f.classList.contains("ln-namer")) { loc.names[pid] = { given: fd.given.trim(), surname: fd.surname.trim(), born: fd.born.trim(), sex: fd.sex, note: fd.note.trim() }; saveLocal(loc); toast("Saved on this device. It goes into the GEDCOM export."); pick(pid, false); return; }
      const id = "LP-" + Date.now().toString(36), M = model();
      loc.people.push({ id, sex: fd.sex || "U", names: [{ given: fd.given.trim(), surname: fd.surname.trim(), type: "birth" }], born_local: fd.born.trim() });
      if (fd.rel === "child") { const f0 = familiesOf(M, pid)[0]; if (f0 && !f0.local) loc.links.push({ fam: f0.id, child: id }); else if (f0) f0.children.push(id); else loc.families.push({ id: "LF-" + id, partners: [pid], children: [id] }); }
      if (fd.rel === "parent") { const f0 = parentsOf(M, pid); if (f0) loc.links.push({ fam: f0.id, partner: id }); else loc.families.push({ id: "LF-" + id, partners: [id], children: [pid] }); }
      if (fd.rel === "spouse") loc.families.push({ id: "LF-" + id, partners: [pid, id], children: [] });
      if (fd.rel === "sibling") { const f0 = parentsOf(M, pid); if (f0) loc.links.push({ fam: f0.id, child: id }); else loc.families.push({ id: "LF-" + id, partners: [], children: [pid, id] }); }
      saveLocal(loc); toast(`${fd.given} added on this device.`); pick(id, true);
    });
    tree.querySelector("#ln-ged").addEventListener("click", () => { const a = h("a", { href: URL.createObjectURL(new Blob([gedcom()], { type: "text/plain" })), download: "family-tree.ged" }); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); });
    let lastW = window.innerWidth; window.addEventListener("resize", () => { if (Math.abs(window.innerWidth - lastW) < 40) return; lastW = window.innerWidth; first(root); }); /* a phone's address bar hiding is not a resize worth jumping for */
  }
  /* links added on this device into seed families (a child or a parent of a researched person) */
  const _model = model;
  model = function () { const M = _model(), loc = local(); for (const k of loc.links || []) { const f = M.F[k.fam]; if (!f) continue; if (k.child && !f.children.includes(k.child)) f.children.push(k.child); if (k.partner && !f.partners.includes(k.partner)) f.partners.push(k.partner); } return M; };
  window.KIN_LINEAGE_UI = { model: () => model(), layout: () => layout(model()), gedcom, pick: (pid) => { const d = document.querySelector("#ln-dossier"); if (d) { ui.sel = pid; drawTree(document.querySelector("#ln-tree")); dossier(d, pid); } } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
