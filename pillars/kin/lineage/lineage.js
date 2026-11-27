/* Kin · Lineage (Claude, 2026-11-24): the family tree as a research instrument. The tree (pan, pinch, zoom; your line lit), a dossier for
   each person (names in every spelling, life events with the evidence for each, the journey on a map, the documents, the conflicts and
   their proofs, the open questions), the sources with full citations and transcriptions, and the research plan. Data: lineage/data.js
   (window.KIN_LINEAGE). Your own additions (names for the placeholders, new relatives) stay in this browser (store "kin", key
   "lineage") and travel in the GEDCOM 7 export. Method: pillars/kin/docs/LINEAGE_METHOD.md. window.KIN_LINEAGE_UI for the proofs. */
(function () {
  "use strict";
  const L = window.KIN_LINEAGE, PK = window.PK;
  if (!L || !PK) return;
  /* the world around the family (owner, 2026-11-24: "no reason to generate it when it can be higher quality and denser"): Kin keeps no
     history of its own; it takes the entries of the one world-history dataset (Athenaeum's, kit/history.js) that touch the family's own
     places (Lithuania, Malta, Michigan, Tennessee, Virginia ...) from 1600 on, closest first: 2 a family region, 1 the United States, 0 the world */
  if (window.PKHistory) {
    /* a region counts only in the years the family was there: from the dated events at its places, a generation before to a decade after
       (Joseph Termena's 1918 service in France brings in the First World War there, not the French Revolution) */
    const H = window.PKHistory, PLN = {}; for (const p of L.places) PLN[p.id] = [p.name, p.hist, p.now].join(" ");
    const when = {}, mark = (r, y) => { const w = when[r] || (when[r] = [y, y]); w[0] = Math.min(w[0], y); w[1] = Math.max(w[1], y); };
    for (const e of L.events) { const y = +String((e.date && e.date.sort) || "").slice(0, 4); if (y && e.place && PLN[e.place]) for (const r of H.regionsOf([PLN[e.place]])) mark(r, y); }
    for (const p of L.people) { const ys = (String(p.summary || "").match(/\b(1[5-9]\d\d|20[0-2]\d)\b/g) || []).map(Number); if (ys.length) for (const r of H.regionsOf([p.summary])) { mark(r, Math.min(...ys)); mark(r, Math.max(...ys)); } }
    const regs = H.regionsOf(Object.values(PLN).concat(L.people.map((p) => p.summary || ""))), own = (r) => regs.includes(r) && r !== "united-states" && r !== "american-colonies";
    const near = (x) => x.w < 2 || (x.e.regions || []).some((r) => { if (!own(r)) return false; const w = when[r], y = H.year(x.e.date); return !w || (y >= w[0] - 40 && y <= w[1] + 50); });
    L.context = H.forRegions(regs, 1600, 2100).filter(near).map((x) => ({ date: String(x.e.date), text: x.text, title: x.e.title, w: x.w, id: x.e.id, regions: x.e.regions || [],
      url: ((x.e.sources || []).find((s) => s.url) || {}).url || "", unsourced: !/^(sourced|checked)/.test(x.e.check || "") }));
    L.contextRegions = regs; L.contextWhen = when;
  } else L.context = [];
  const { h, toast, store } = PK;
  const S = store("kin");
  const DOCS = "lineage/docs/";
  /* a face for everyone the album has one for (album.js, data.js): shown on the tree cards, the person's page and the photo wall */
  const FACE = {}; for (const m of L.media || []) if (m.face && m.person && !FACE[m.person]) FACE[m.person] = m.face;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const by = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
  const TYPE = { birth: "Born", emigration: "Left Europe", immigration: "Arrived", declaration: "Declared intention", draft: "Draft registration", enlistment: "Enlisted", service: "Service", naturalization: "Naturalized", discharge: "Discharged", residence: "Lived", marriage: "Married", occupation: "Worked", death: "Died", burial: "Buried", will: "Made a will", bonus: "State bonus" };
  const CONF = { proven: "Proven", probable: "Probable", possible: "Possible", family: "From the family", inferred: "Not yet known", placeholder: "To name", named: "Named by you", self: "You" };
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
    const families = L.families.map((f) => ({ id: f.id, partners: f.partners.slice(), children: f.children.slice(), events: (f.events || []).slice(), uncertain: f.uncertain || {}, ended: !!f.ended, unmarried: !!f.unmarried, adopted: (f.adopted || []).slice() })).concat(loc.families.map((f) => Object.assign({ local: true, events: [] }, f)));
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
    while (cur.length) { const nx = []; for (const pid of cur) { const f = parentsOf(M, pid); if (f) for (const q of f.partners) if (!set.has(q) && M.P[q] && M.P[q].status !== "possible" && !M.P[q].ghost) { set.add(q); nx.push(q); } } cur = nx; }
    return set;
  }

  /* ------------------------------------------------------------------ layout: ancestors above you, each couple over its children */
  const W = 168, H = 76, GX = 22, GY = 58;
  function layout(M) {
    const pos = {}, aw = {};
    function width(pid, seen) {
      if (aw[pid] != null) return aw[pid];
      if (seen.has(pid)) return W; seen.add(pid);
      const f = pOf(pid); let w = W;
      if (f && f.partners.length) w = Math.max(W, f.partners.reduce((s, q) => s + width(q, seen), 0) + GX * (f.partners.length - 1));
      return (aw[pid] = w);
    }
    const vroot = ui.vroot && M.P[ui.vroot] ? ui.vroot : L.root;
    /* the window: the root's ancestors up to depth() generations; anyone older waits behind an "↑ older" pill */
    const D = depth(), win = { [vroot]: 0 }; { let cur = [vroot]; while (cur.length) { const nx = []; for (const pid of cur) { if (win[pid] >= D) continue; const f = parentsOf(M, pid); if (f) for (const q of f.partners) if (win[q] == null) { win[q] = win[pid] + 1; nx.push(q); } } cur = nx; } }
    const anc = new Set(); { let cur = [vroot]; while (cur.length) { const nx = []; for (const pid of cur) { const f = parentsOf(M, pid); if (f) for (const q of f.partners) if (!anc.has(q)) { anc.add(q); nx.push(q); } } cur = nx; } }
    const pOf = (pid) => (win[pid] != null && win[pid] < D ? parentsOf(M, pid) : null);
    function place(pid, x0, gen) {
      const w = width(pid, new Set()); pos[pid] = { x: x0 + w / 2, gen };
      const f = pOf(pid);
      if (f) { let x = x0 + (w - (f.partners.reduce((s, q) => s + width(q, new Set()), 0) + GX * (f.partners.length - 1))) / 2; for (const q of f.partners) { if (!pos[q]) place(q, x, gen + 1); x += width(q, new Set()) + GX; } }
    }
    place(vroot, 0, 0);
    /* an unknown parent has no ancestry of its own: it stands beside its partner, as a couple does, not at the far end of the family's span */
    for (const p of M.people) {
      if (!p.ghost || !pos[p.id] || parentsOf(M, p.id)) continue;
      const f = familiesOf(M, p.id)[0], sp = f && f.partners.find((q) => q !== p.id && pos[q]); if (!sp) continue;
      const side = f.partners.indexOf(p.id) < f.partners.indexOf(sp) ? -1 : 1, nx = pos[sp].x + side * (W + GX), gen = pos[p.id].gen;
      if (!Object.entries(pos).some(([k, q]) => k !== p.id && q.gen === gen && Math.abs(q.x - nx) < W + GX - 1)) pos[p.id].x = nx;
    }
    /* everyone not yet placed (a sibling, a spouse, a child someone added) goes beside the nearest placed relative */
    let guard = 0; const placeable = (p) => !pos[p.id] && !anc.has(p.id) && p.id !== vroot; let left = M.people.filter(placeable);
    /* partners first, so a wife or husband stands next to the one they married before brothers and sisters take the places beside */
    const wed = (p) => (familiesOf(M, p.id).some((g) => g.partners.some((q) => q !== p.id && pos[q])) ? 0 : 1);
    while (left.length && guard++ < 20) {
      /* re-ranked after every placement: a husband or wife whose partner was placed a moment ago goes next, before the partner's
         brothers and sisters take the places beside them (owner, 2026-11-26: Kathleen beside Joe, Jim and Mark beside Jennifer) */
      /* and a brother or sister of someone already placed goes before a cousin, so a family's children stay side by side (owner,
         2026-11-26: Stacy had landed between Tania and her sister Michelle) */
      /* placed brothers and sisters: full ones, or half ones (same mother or same father) for a child with one known parent */
      const placedSibs = (p, f) => {
        const full = f ? f.children.filter((c) => c !== p.id && pos[c]) : [], couple = f && f.partners.filter((q) => pos[q]).length > 1;
        return full.length || couple || !f ? full : M.families.filter((g) => g.partners.some((q) => f.partners.includes(q))).flatMap((g) => g.children).filter((c) => c !== p.id && pos[c]);
      };
      const rank = (p) => {
        if (!wed(p)) return 0;
        const f = parentsOf(M, p.id);
        if (placedSibs(p, f).length) return 1;
        if ((f && f.partners.some((q) => pos[q])) || familiesOf(M, p.id).some((g) => g.children.some((c) => pos[c]))) return 2;
        return 3;
      };
      const todo = left.slice();
      while (todo.length) {
        let bi = 0, br = rank(todo[0]); for (let i = 1; i < todo.length && br; i++) { const r = rank(todo[i]); if (r < br) { bi = i; br = r; } }
        if (br === 3) break;
        const p = todo.splice(bi, 1)[0];
        if (pos[p.id]) continue;
        const f = parentsOf(M, p.id);
        /* a brother or sister to stand beside, one who is not on your own line first, the latest of them, so a family's children stay
           together; half brothers and sisters too (same mother or same father) for a child with one known parent (owner, 2026-11-26:
           your mother's brothers Tim and Michael have other fathers, not named) */
        /* half brothers and sisters only for a child with one known parent: a couple's children stand under the couple */
        const sibs = placedSibs(p, f);
        const sib = sibs.filter((c) => !anc.has(c)).pop() || sibs[0];
        const sp = familiesOf(M, p.id).map((g) => g.partners.find((q) => q !== p.id && pos[q])).find(Boolean);
        const kid = familiesOf(M, p.id).map((g) => g.children.find((c) => pos[c])).find(Boolean);
        /* a child of someone already placed goes in the row below them, under the couple (owner, 2026-11-26: the tree showed only
           ancestors, not his daughter, his sisters or his great-grandmother's other children and their children) */
        const pp = !sib && !sp && f ? f.partners.filter((q) => pos[q]) : [], pmid = pp.length ? pp.reduce((s, q) => s + pos[q].x, 0) / pp.length : null;
        const anchor = sib || sp || null, gen = sib ? pos[sib].gen : sp ? pos[sp].gen : pmid != null ? pos[pp[0]].gen - 1 : kid ? pos[kid].gen + 1 : null;
        if (gen == null) continue;
        const row = Object.values(pos).filter((q) => q.gen === gen).map((q) => q.x);
        const near = anchor ? pos[anchor].x : pmid != null ? pmid : pos[kid].x;
        /* a sibling or spouse goes on the side away from the anchor's partner, never between a couple */
        const aid = anchor || kid, mate = aid && familiesOf(M, aid).flatMap((g) => g.partners).find((q) => q !== aid && q !== p.id && pos[q]);
        /* never inside a couple: the span between two partners in the same row counts as taken */
        const spans = M.families.map((g) => g.partners.filter((q) => pos[q] && pos[q].gen === gen).map((q) => pos[q].x)).filter((xs) => xs.length > 1).map((xs) => [Math.min(...xs), Math.max(...xs)]);
        const busy = (x) => row.some((r) => Math.abs(r - x) < W + GX - 1) || spans.some(([lo, hi]) => x > lo - 1 && x < hi + 1);
        /* the nearest free place on either side, the preferred side (away from the anchor's partner) winning a tie */
        const dir = mate && pos[mate].x > near ? -1 : 1, x0 = pmid != null && !anchor ? near : near + dir * (W + GX);
        let x = x0; if (busy(x)) { let a = x0, c = x0 - 2 * dir * (W + GX); for (let i = 0; i < 400; i++) { if (!busy(a)) { x = a; break; } if (!busy(c)) { x = c; break; } a += dir * (W + GX); c -= dir * (W + GX); } }
        pos[p.id] = { x, gen };
      }
      left = M.people.filter(placeable);
    }
    const gens = Object.values(pos).map((q) => q.gen), top = Math.max(...gens), bottom = Math.min(0, ...gens);
    for (const k in pos) pos[k].y = (top - pos[k].gen) * (H + GY) + H / 2;
    const xs = Object.values(pos).map((q) => q.x);
    const older = Object.keys(pos).filter((pid) => win[pid] === D && parentsOf(M, pid) && parentsOf(M, pid).partners.some((q) => M.P[q]));
    return { pos, minX: Math.min(...xs) - W / 2, maxX: Math.max(...xs) + W / 2, height: (top - bottom + 1) * (H + GY) - GY, vroot, older };
  }

  /* ------------------------------------------------------------------ the tree */
  let openSheet = () => {}, closeSheet = () => {};
  const ui = { sel: L.root, view: { s: 1, x: 0, y: 0 }, M: null, lay: null, expand: new Set(), vroot: null };
  const depth = () => (window.innerWidth < 600 ? 2 : 3); /* the tree shows the person it is rooted on and two generations above on a phone (three on a wide screen); "↑ older" climbs, "You" comes back */
  function drawTree(root) {
    const M = ui.M = model(), lay = ui.lay = layout(M), lit = ui.lit = line(M);
    const NS = "http://www.w3.org/2000/svg";
    const svg = root.querySelector("svg.ln-svg"), g = svg.querySelector("g.ln-world");
    g.innerHTML = "";
    if (!svg.querySelector("#ln-faceclip")) svg.insertAdjacentHTML("afterbegin", `<defs><clipPath id="ln-faceclip" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath></defs>`);
    const add = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (parent || g).appendChild(e); return e; };
    /* family connectors: partners joined by a bar, a stem down to the children */
    const pills = [], pillBox = [];
    for (const f of M.families) {
      const ps = f.partners.map((q) => lay.pos[q]).filter(Boolean), cs = f.children.map((c) => lay.pos[c]).filter(Boolean);
      if (!ps.length) continue;
      const midX = ps.reduce((s, q) => s + q.x, 0) / ps.length, y0 = ps[0].y + H / 2;
      const onLine = f.children.some((c) => lit.has(c)) && f.partners.some((q) => lit.has(q));
      if (ps.length > 1) add("path", { d: `M${ps[0].x + W / 2} ${ps[0].y}H${ps[ps.length - 1].x - W / 2}`, class: "ln-wed" + (onLine ? " lit" : "") });
      if (cs.length && ps.length) pills.push(() => { /* how many children are known, and that more may not be: tap for the family (drawn over the lines) */
        const k = f.children.filter((c) => M.P[c]).length, t = `${k} ${k === 1 ? "child" : "children"} known · more?`, fw = 18 + t.length * 6.4;
        /* two families of one person (a first and a second marriage) put their pills side by side: the later one steps down */
        let py = y0 + 11; while (pillBox.some((q) => Math.abs(q.y - py) < 21 && Math.abs(q.x - midX) < (q.w + fw) / 2 + 4)) py += 22; pillBox.push({ x: midX, y: py, w: fw });
        const fp = add("g", { class: "ln-fampill", transform: `translate(${midX} ${py})`, tabindex: "0", role: "button", "data-fam": f.id, "aria-label": `Family: ${t}` });
        add("rect", { x: -fw / 2, y: -10, width: fw, height: 20, rx: 10 }, fp); const ft = add("text", { y: 4 }, fp); ft.textContent = t;
      });
      for (const c of cs) {
        const cid = f.children[cs.indexOf(c)], lt = onLine && lit.has(cid), un = f.uncertain && f.uncertain[cid], my = (y0 + c.y - H / 2) / 2;
        add("path", { d: `M${midX} ${ps.length > 1 ? ps[0].y : y0}V${my}H${c.x}V${c.y - H / 2}`, class: "ln-stem" + (lt ? " lit" : "") + (un ? " unsure" : "") });
        if (un) { /* a link the records have not settled: drawn dashed, with the question on it */
          const q = add("g", { class: "ln-unsure", transform: `translate(${c.x} ${my + (c.y - H / 2 - my) / 2})` });
          add("rect", { x: -108, y: -12, width: 216, height: 24, rx: 12 }, q); const t = add("text", { y: 5 }, q); t.textContent = un;
        }
      }
    }
    pills.forEach((fn) => fn());
    for (const p of M.people) {
      const q = lay.pos[p.id]; if (!q) continue;
      if (lay.older && lay.older.includes(p.id)) { /* known parents above the window: a tap climbs to them */
        const ub = add("g", { class: "ln-stub ln-up", transform: `translate(${q.x} ${q.y - H / 2 - 17})`, tabindex: "0", role: "button", "data-up": p.id, "aria-label": `Show ${nm(p)}'s parents and older` });
        add("path", { d: `M0 9V18`, class: "ln-stubline" }, ub); add("rect", { x: -50, y: -9, width: 100, height: 18, rx: 9 }, ub); const ut = add("text", { y: 4 }, ub); ut.textContent = "↑ older";
      }
      if (M.stubs && M.stubs.includes(p.id)) { /* everyone has a mother and a father: a stub above the card shows them on a tap */
        const sb = add("g", { class: "ln-stub", transform: `translate(${q.x} ${q.y - H / 2 - 17})`, tabindex: "0", role: "button", "data-x": p.id, "aria-label": `Show ${nm(p)}'s parents` });
        add("path", { d: `M0 9V18`, class: "ln-stubline" }, sb); add("rect", { x: -62, y: -9, width: 124, height: 18, rx: 9 }, sb); const st = add("text", { y: 4 }, sb); st.textContent = "+ mother and father";
      }
      const k = add("g", { class: `ln-node st-${p.status}` + (p.ghost ? " ghost" : "") + (lit.has(p.id) ? " lit" : "") + (ui.sel === p.id ? " sel" : ""), transform: `translate(${q.x - W / 2} ${q.y - H / 2})`, tabindex: "0", role: "button", "data-id": p.id, "aria-label": `${nm(p)} ${life(M, p)}` });
      add("rect", { width: W, height: H, rx: 14, class: "ln-card" }, k);
      add("rect", { width: 5, height: H - 24, x: 0, y: 12, rx: 2.5, class: "ln-tab" }, k);
      const fc = FACE[p.id];
      if (fc) { /* their face, in a ring at the card's right */
        add("circle", { cx: W - 27, cy: H / 2, r: 21, class: "ln-facering" }, k);
        add("image", { href: `${DOCS}t/${fc}.webp`, x: W - 46, y: H / 2 - 19, width: 38, height: 38, "clip-path": "url(#ln-faceclip)", preserveAspectRatio: "xMidYMid slice" }, k);
      }
      const t1 = add("text", { x: 16, y: 27, class: "ln-name" }, k); t1.textContent = trunc(p.status === "placeholder" || (p.ghost && p.status === "inferred") ? p.placeholder : nm(p), fc ? 15 : 21);
      const t2 = add("text", { x: 16, y: 47, class: "ln-life" }, k); t2.textContent = p.status === "placeholder" || (p.ghost && p.status === "inferred") ? (p.hint || "tap to name") : life(M, p) || " ";
      const t3 = add("text", { x: 16, y: 64, class: "ln-badge" }, k); t3.textContent = (CONF[p.status] || p.status).toUpperCase();
    }
    /* the generations, named down the left edge */
    const GEN = ["You", "Parents", "Grandparents", "Great-grandparents"], topGen = Math.max(...Object.values(lay.pos).map((q) => q.gen));
    const stubGen = new Set((M.stubs || []).map((id) => lay.pos[id] && lay.pos[id].gen));
    const g0 = gensFrom(M)[lay.vroot] || 0, upGen = new Set((lay.older || []).map((id) => lay.pos[id].gen));
    const lowGen = Math.min(0, ...Object.values(lay.pos).map((q) => q.gen)), DOWN = ["Children", "Grandchildren", "Great-grandchildren"];
    for (let gi = lowGen; gi < 0; gi++) { const gy = (topGen - gi) * (H + GY) - 12, tx = add("text", { x: lay.minX, y: gy, class: "ln-genl" }); tx.textContent = (DOWN[-gi - 1] || `${-gi - 2}× great-grandchildren`).toUpperCase(); }
    for (let gi = 0; gi <= topGen; gi++) { const ag = g0 + gi, gy = (topGen - gi) * (H + GY) - (stubGen.has(gi) || upGen.has(gi) ? 34 : 12), tx = add("text", { x: lay.minX, y: gy, class: "ln-genl" }); tx.textContent = (GEN[ag] || `${ag - 2}× great-grandparents`).toUpperCase(); }
    const vb = { x: lay.minX - 30, y: -50, w: lay.maxX - lay.minX + 60, h: lay.height + 80 };
    svg.dataset.vb = JSON.stringify(vb);
    apply(root);
    const fan = root.querySelector("svg.ln-fan"); if (fan) { fan.setAttribute("viewBox", "-180 -180 360 360"); fan.innerHTML = fanSvg(M); }
    const cp = root.querySelector("#ln-complete"); if (cp) { const open = cp.open; cp.innerHTML = completeHtml(M); cp.open = open; }
    const tm = root.querySelector("#ln-time"); if (tm && !tm.innerHTML) tm.innerHTML = timeHtml(M);
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
    const lg = root.querySelector(".ln-legend"), top = 64, bot = (lg ? lg.offsetHeight : 20) + 16, ah = Math.max(120, r.height - top - bot); /* clear of the buttons above and the legend below */
    const sc = Math.min(r.width / vb.w, ah / vb.h, 1.2); ui.view = { s: sc, x: (r.width - vb.w * sc) / 2 - vb.x * sc, y: top + (ah - vb.h * sc) / 2 - vb.y * sc }; animate(root);
  }
  /* the first view: the whole tree when it is still readable, else your lit line (you up to the furthest researched ancestor and the
     partner beside them), never smaller than a scale where names can be read */
  function first(root) {
    /* the whole window when it reads at a glance; otherwise the person the tree is rooted on at the bottom, their parents just above */
    const svg = root.querySelector("svg.ln-svg"), r = svg.getBoundingClientRect(), vb = JSON.parse(svg.dataset.vb || "{}");
    const lg = root.querySelector(".ln-legend"), top = 64, bot = (lg ? lg.offsetHeight : 20) + 20, ah = Math.max(160, r.height - top - bot);
    if (Math.min(r.width / vb.w, ah / vb.h) >= 0.6) return fit(root);
    const P = ui.lay.pos, v = ui.lay.vroot, f = parentsOf(ui.M, v), ps = f ? f.partners.filter((q) => P[q]) : [];
    if (!P[v]) return fit(root);
    /* frame the parents, the person and their children (Violet under you), centred in the space between the buttons and the legend */
    const kids = familiesOf(ui.M, v).flatMap((f) => f.children).filter((c) => P[c]);
    const xs = [P[v].x, ...ps.map((q) => P[q].x), ...kids.map((c) => P[c].x)], x0 = Math.min(...xs) - W / 2 - 12, x1 = Math.max(...xs) + W / 2 + 12;
    const ys = [P[v].y, ...ps.map((q) => P[q].y), ...kids.map((c) => P[c].y)], y0 = Math.min(...ys) - H / 2 - 34, y1 = Math.max(...ys) + H / 2 + 30;
    const sc = Math.max(0.45, Math.min(0.72, r.width / (x1 - x0), ah / (y1 - y0)));
    ui.view = { s: sc, x: r.width / 2 - ((x0 + x1) / 2) * sc, y: top + Math.max(0, (ah - (y1 - y0) * sc) / 2) - y0 * sc }; animate(root);
  }
  function animate(root) { const g = root.querySelector("g.ln-world"); g.classList.add("glide"); apply(root); clearTimeout(ui.t); ui.t = setTimeout(() => g.classList.remove("glide"), 420); }
  function zoomAt(root, k, cx, cy) {
    const v = ui.view, s = Math.max(0.3, Math.min(2.6, v.s * k)), f = s / v.s; ui.view = { s, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f }; apply(root);
  }
  function wire(root, onPick) {
    const svg = root.querySelector("svg.ln-svg"), pts = new Map(); let drag = null, moved = 0, pinch = null;
    let hit = null; /* the card under the finger at pointerdown: once the svg captures the pointer, pointerup's target is the svg itself */
    svg.addEventListener("pointerdown", (e) => { hit = (e.target.closest && e.target.closest(".ln-node, .ln-fampill, .ln-stub, .ln-up")) || null; try { svg.setPointerCapture(e.pointerId); } catch (_) { /* a synthetic pointer */ } pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0;
      if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, vx: ui.view.x, vy: ui.view.y };
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: ui.view.s }; drag = null; } });
    svg.addEventListener("pointermove", (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && pts.size === 2) { const [a, b] = [...pts.values()], r = svg.getBoundingClientRect(), d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt(root, (pinch.s * d / pinch.d) / ui.view.s, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); moved = 99; return; }
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); ui.view.x = drag.vx + dx; ui.view.y = drag.vy + dy; apply(root); } });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) {
        if (moved < 6 && hit) onPick(hit); hit = null;
        drag = null; } };
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    svg.addEventListener("wheel", (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(root, Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    svg.addEventListener("keydown", (e) => { const n = e.target.closest && e.target.closest(".ln-node, .ln-fampill, .ln-stub"); if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPick(n); } });
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
    /* the family album (album.js): every picture this person is in, once each */
    const pics = (L.media || []).filter((m) => m.album && (m.person === pid || (m.people || []).includes(pid))).filter((m, i, a) => a.findIndex((x) => x.img === m.img) === i).sort((a, b) => (a.year || 0) - (b.year || 0));
    const cons = L.conflicts.filter((c) => c.person === pid), qs = L.questions.filter((q) => q.person === pid).sort((a, b) => a.p - b.p);
    const K = window.KinKinship ? window.KinKinship.make(M.families, M.P, L.root) : null, toYou = pid === L.root ? "" : K ? K.rel(pid) : "";
    const sibs = (() => { const own = parentsOf(M, pid); return own ? M.families.filter((f) => f.partners.some((q) => own.partners.includes(q))).flatMap((f) => f.children).filter((c, i, a) => c !== pid && a.indexOf(c) === i) : []; })();
    const fam = { parents: (parentsOf(M, pid) || { partners: [] }).partners, spouses: familiesOf(M, pid).flatMap((f) => f.partners.filter((q) => q !== pid)), kids: familiesOf(M, pid).flatMap((f) => f.children) };
    const rel = (ids, label) => ids.length ? `<p class="ln-rel"><span>${label}</span>${ids.map((q) => `<button type="button" class="ln-link" data-go="${q}">${esc(M.P[q] ? (M.P[q].status === "placeholder" ? M.P[q].placeholder : nm(M.P[q])) : q)}</button>`).join("")}</p>` : "";
    /* one birth name that only repeats the heading says nothing: the chips show when there is more than one name, or a note */
    const nl = (p.names || []).filter((n) => n.given || n.surname), plain = nl.length === 1 && !nl[0].note && (nl[0].type || "birth") === "birth";
    const names = (plain ? [] : nl).map((n) => `<span class="ln-name-chip" title="${esc(n.note || "")}">${esc(`${n.given} ${n.surname}`.trim())}<small>${esc(n.type)}</small></span>`).join("");
    el.innerHTML = `
      <header class="ln-dhead${FACE[pid] ? " has-face" : ""}">${FACE[pid] ? `<img class="ln-dface" src="${DOCS}${FACE[pid]}.webp" alt="" decoding="async">` : ""}<div><p class="ln-kick">${toYou ? `${esc(toYou)} · ` : ""}${esc(CONF[p.status] || p.status)}${p.local ? " · added on this device" : ""}</p>
        <h3>${esc(p.status === "placeholder" ? p.placeholder : nm(p))}</h3><p class="ln-dlife">${esc(life(M, p))}${p.born_est ? ` · born ${esc(p.born_est.text)}` : ""}</p></div>
        ${names ? `<div class="ln-names">${names}</div>` : ""}</header>
      ${pics.length ? `<div class="ln-strip" role="list" aria-label="Pictures of ${esc(firstName(p))}">${pics.map((m) => `<button type="button" role="listitem" class="ln-doc ln-shot" data-img="${m.img}" data-src="${m.src}" data-cap="${esc(m.caption)}" aria-label="${esc(m.caption)}"><img loading="lazy" decoding="async" src="${DOCS}t/${m.img}.webp" alt=""><span>${esc(m.when || m.year || "")}</span></button>`).join("")}<a class="ln-strip-more" href="album/#${pid}">${pics.length > 1 ? `All ${pics.length} in the album` : "In the album"} ›</a></div>` : ""}
      ${p.summary ? `<p class="ln-sum">${esc(p.summary)}</p>` : ""}${storyLinks(pid)}${p.note ? `<p class="ln-note">${esc(p.note)}</p>` : ""}${p.note_local ? `<p class="ln-note">${esc(p.note_local)}</p>` : ""}
      ${p.born_est ? `<p class="ln-note">Basis for the estimate: ${esc(p.born_est.basis)}.</p>` : ""}
      ${p.infer && p.infer.length ? `<h4>What can be inferred</h4><ul class="ln-infer">${p.infer.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${rel(fam.parents, "Parents")}${rel(sibs, "Brothers and sisters")}${rel(fam.spouses, "Spouse")}${rel(fam.kids, "Children")}
      ${namer(p)}
      ${ev.length ? `<h4>Life in the records</h4><ol class="ln-tl">${ev.map((e) => `
        <li class="ln-ev c-${e.confidence}"><div class="ln-evh"><time>${esc(e.date.text)}</time><b>${esc(TYPE[e.type] || e.type)}</b><span class="ln-conf">${esc(CONF[e.confidence] || e.confidence)}</span></div>
          <p class="ln-evc">${esc(e.conclusion)}</p>${e.place && M.PL[e.place] ? `<p class="ln-pl">${esc(M.PL[e.place].hist)}${e.placeNote ? ` <em>(${esc(e.placeNote)})</em>` : ""}</p>` : ""}
          <details class="ln-evd"><summary>Evidence · ${e.assert.length} source${e.assert.length === 1 ? "" : "s"}${e.conflict ? ` · conflict ${e.conflict}` : ""}</summary>
            <ul>${e.assert.map((a) => `<li><button type="button" class="ln-link" data-src="${a.src}">${esc((M.SRC[a.src] || {}).short || a.src)}</button><q>${esc(a.value)}</q><span class="ln-chips">${chips(a)}</span>${a.note ? `<em>${esc(a.note)}</em>` : ""}</li>`).join("")}</ul></details></li>`).join("")}</ol>` : ""}
      ${ev.length ? journey(M, p) : ""}
      ${imgs.length ? `<h4>Documents</h4><div class="ln-docs">${imgs.map((d) => `<button type="button" class="ln-doc" data-img="${d.i}" data-src="${d.s}" aria-label="${esc((M.SRC[d.s] || {}).short || d.i)}"><img loading="lazy" src="${DOCS}t/${d.i}.webp" alt=""><span>${esc((M.SRC[d.s] || {}).short || "")}</span></button>`).join("")}</div>` : ""}
      ${cons.length ? `<h4>Conflicts and proofs</h4>${cons.map(conflictHtml).join("")}` : ""}
      ${qs.length ? `<h4>Open questions</h4><ul class="ln-qs">${qs.map((q) => `<li><b>${q.id}</b><span class="ln-pri p${q.p}">P${q.p}</span> ${esc(q.q)}<small>${esc(q.sources)} · ${esc(q.task === "owner" ? "for you" : q.task)}${(() => { const n = (L.log || []).filter((x) => x.q === q.id); return n.length ? ` · ${n.length} search${n.length > 1 ? "es" : ""} logged (${n.filter((x) => x.result === "found").length} found)` : ""; })()}</small></li>`).join("")}</ul>` : ""}
      <details class="ln-addd"><summary>Add a relative of ${esc(firstName(p))}</summary>${addForm(p)}</details>`;
  }
  /* a family: who is in it, what is known about its children and what is not */
  function famDossier(el, fid) {
    const M = ui.M, f = M.F[fid]; if (!f) return;
    const who = (q) => M.P[q] ? (M.P[q].ghost && M.P[q].status === "inferred" ? M.P[q].placeholder : nm(M.P[q])) : q;
    const kids = f.children.filter((c) => M.P[c]), m = (f.events || []).map((e) => M.E[e]).find((e) => e && e.type === "marriage");
    const ends = f.partners.map((q) => L.events.find((e) => e.who.includes(q) && e.type === "death")).filter(Boolean).map((e) => +e.date.sort.slice(0, 4));
    const span = m && ends.length ? [+m.date.sort.slice(0, 4), Math.min(...ends)] : null, isYours = f.children.includes(L.root);
    const unknown = isYours ? "Your brothers and sisters, if you have any, are not on the tree yet. Each one you add is a new branch for your own children to follow."
      : span ? `Married ${span[1] - span[0]} years (${span[0]} to ${span[1]}). How many children they had is not known yet: families then often had two to four. Every census taken while they were together lists the household (Q4).`
      : "How many children they had is not known. Add any you know of; the census that lists their household will name the rest.";
    el.innerHTML = `<header class="ln-dhead"><p class="ln-kick">A family</p><h3>${f.partners.map((q) => esc(who(q))).join(" &amp; ")}</h3>
        ${m ? `<p class="ln-dlife">Married ${esc(m.date.text)}${m.place && M.PL[m.place] ? `, ${esc(M.PL[m.place].name)}` : ""}</p>` : ""}</header>
      <p class="ln-rel"><span>Partners</span>${f.partners.map((q) => `<button type="button" class="ln-link" data-go="${q}">${esc(who(q))}</button>`).join("")}</p>
      <h4>Children</h4><p class="ln-rel"><span>${kids.length} known</span>${kids.map((c) => `<button type="button" class="ln-link" data-go="${c}">${esc(who(c))}${f.uncertain && f.uncertain[c] ? " (?)" : ""}</button>`).join("")}</p>
      <p class="ln-note">${esc(unknown)}</p>
      ${addForm(M.P[f.partners.find((q) => M.P[q] && !M.P[q].ghost) || f.partners[0]] || M.P[kids[0]], "child")}`;
  }
  function conflictHtml(c) { return `<details class="ln-con s-${c.status}"><summary><b>${c.id}</b> ${esc(c.q)}<span>${esc(c.status)}: ${esc(c.conclusion)}</span></summary><p>${esc(c.argument)}</p></details>`; }
  function namer(p) {
    if (!["placeholder", "family", "inferred"].includes(p.status) && !(local().names[p.id])) return "";
    const n = local().names[p.id] || {};
    return `<form class="form ln-namer" data-pid="${p.id}"><p class="ln-kick">${p.status === "family" ? "Add what you know" : p.ghost ? `Do you know ${esc(p.placeholder.replace(/^Your/, "your"))}? Name them` : "Name this person"}</p>
      <label class="f">Given names<input name="given" maxlength="80" value="${esc(n.given || "")}" autocomplete="off"></label>
      <label class="f">Surname at birth<input name="surname" maxlength="80" value="${esc(n.surname || "")}" autocomplete="off"></label>
      <label class="f">Born (year)<input name="born" maxlength="12" inputmode="numeric" value="${esc(n.born || "")}"></label>
      <label class="f">Sex<select name="sex"><option value="">—</option><option value="F"${n.sex === "F" ? " selected" : ""}>Female</option><option value="M"${n.sex === "M" ? " selected" : ""}>Male</option></select></label>
      <label class="f wide">What you know<input name="note" maxlength="300" value="${esc(n.note || "")}" placeholder="Where they lived, a story, where the papers are"></label>
      <button class="btn" type="submit">Save</button></form>`;
  }
  function addForm(p, rel) {
    const o = (v, t) => `<option value="${v}"${rel === v ? " selected" : ""}>${t}</option>`;
    return `<form class="form ln-add" data-pid="${p.id}"><p class="ln-kick">Add a relative of ${esc(firstName(p))}</p>
      <label class="f">Relation<select name="rel">${o("child", "child")}${o("parent", "parent")}${o("spouse", "spouse")}${o("sibling", "brother or sister")}</select></label>
      <label class="f">Given names<input name="given" required maxlength="80" autocomplete="off"></label><label class="f">Surname<input name="surname" maxlength="80" autocomplete="off"></label>
      <label class="f">Born (year)<input name="born" maxlength="12" inputmode="numeric"></label>
      <label class="f">Sex<select name="sex"><option value="">—</option><option value="F">Female</option><option value="M">Male</option></select></label>
      <button class="btn quiet" type="submit">Add</button></form>`;
  }

  /* ------------------------------------------------------------------ documents: a full-screen viewer with zoom */
  function viewer(img, srcId, cap) {
    const s0 = ui.M.SRC[srcId] || {}, s = cap ? Object.assign({}, s0, { short: cap.length > 90 ? cap.slice(0, 87) + "…" : cap, read: cap.length > 90 ? cap : "" }) : s0;   /* a picture from a story or the album speaks with its own caption */
    const box = h("div", { class: "ln-view", role: "dialog", "aria-modal": "true", "aria-label": s.short || img, tabindex: "-1" });
    box.innerHTML = `<div class="ln-vstage"><img src="${DOCS}${img}.webp" alt="${esc(s.short || img)}" draggable="false"></div>
      <aside class="ln-vcap"><b>${esc(s.short || "")}</b><p>${esc(s.read || "")}</p><p class="ln-cite">${esc(s.cite || "")}</p>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">Open the record</a>` : ""}</aside>
      <button type="button" class="ln-vx" aria-label="Close">×</button>`;
    document.body.appendChild(box); box.focus();
    const im = box.querySelector("img"), st = { s: 1, x: 0, y: 0 }, pts = new Map(); let d0 = null, p0 = null;
    const ap = () => { im.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.s})`; };
    box.querySelector(".ln-vstage").addEventListener("wheel", (e) => { e.preventDefault(); st.s = Math.max(1, Math.min(6, st.s * Math.exp(-e.deltaY * 0.002))); ap(); }, { passive: false });
    im.addEventListener("pointerdown", (e) => { try { im.setPointerCapture(e.pointerId); } catch (_) { /* a synthetic pointer */ } pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 1) p0 = { x: e.clientX - st.x, y: e.clientY - st.y }; if (pts.size === 2) { const [a, b] = [...pts.values()]; d0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: st.s }; } });
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
      <h4>Research log</h4><p class="sub">Every search, found or not, so none is repeated and the search can be shown to be reasonably exhaustive.</p>
      <ul class="ln-log">${(L.log || []).slice().reverse().map((x) => `<li class="r-${esc(x.result.replace(/\s+/g, "-"))}"><b>${esc(x.id)}</b> <span>${esc(x.date)} · ${esc(x.by)} · ${esc(x.q)}</span> ${esc(x.terms)} <em>in ${esc(x.where)}</em>: <strong>${esc(x.result)}</strong>${x.note ? `<small>${esc(x.note)}</small>` : ""}</li>`).join("")}</ul>
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
    const out1 = (p) => !(p.ghost && p.status === "inferred"), keep = new Set(M.people.filter(out1).map((p) => p.id));
    for (const p of M.people.filter(out1)) {
      out.push(`0 ${xid(p.id)} INDI`);
      for (const n of (p.names || []).filter((x) => x.given || x.surname)) { out.push(`1 NAME ${n.given || ""} /${n.surname || ""}/`.replace(/\s+\//, " /")); const nt = { married: "MARRIED", anglicized: "IMMIGRANT", variant: "AKA" }[n.type]; if (nt) out.push(`2 TYPE ${nt}`); else if (n.type && n.type !== "birth" && n.type !== "preferred") out.push(`2 TYPE OTHER`, `3 PHRASE ${n.type}`); }
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
      for (const f of M.families.filter((x) => x.partners.includes(p.id) && x.partners.concat(x.children).filter((q) => keep.has(q)).length > 1)) out.push(`1 FAMS ${xid(f.id)}`);
      const pf = parentsOf(M, p.id); if (pf && pf.partners.some((q) => keep.has(q))) { out.push(`1 FAMC ${xid(pf.id)}`); if (pf.uncertain && pf.uncertain[p.id]) out.push("2 STAT CHALLENGED", `3 PHRASE ${pf.uncertain[p.id]}`); }
    }
    for (const f of M.families.filter((x) => x.partners.concat(x.children).filter((q) => keep.has(q)).length > 1)) {
      out.push(`0 ${xid(f.id)} FAM`);
      f.partners.filter((q) => keep.has(q)).forEach((q) => { const s = (M.P[q] || {}).sex; out.push(`1 ${s === "F" ? "WIFE" : "HUSB"} ${xid(q)}`); });
      for (const c of f.children) out.push(`1 CHIL ${xid(c)}`);
      for (const eid of f.events || []) { const e = M.E[eid]; if (!e) continue; out.push("1 MARR", `2 DATE ${gedDate(e.date)}`); if (e.place && M.PL[e.place]) out.push(`2 PLAC ${M.PL[e.place].hist}`); for (const a of e.assert) out.push(`2 SOUR ${xid(a.src)}`, `3 PAGE ${a.value}`); }
    }
    for (const s of L.sources) { out.push(`0 ${xid(s.id)} SOUR`, `1 TITL ${s.short}`, `1 TEXT ${s.cite}`); if (s.repo) out.push(`1 NOTE ${s.repo}`); if (s.read) out.push(`1 NOTE ${s.read}`); }
    out.push("0 TRLR");
    return out.map((l) => l.replace(/\n/g, " ")).join("\n") + "\n";
  }

  /* ------------------------------------------------------------------ the fan: every ancestor's place, five generations above you
     Ahnentafel numbering: you are 1, your father 2 and mother 3, and anyone's father and mother are 2n and 2n + 1. A place with no one in it
     is drawn empty, so the chart shows at a glance how much of your ancestry is known, and on which side. */
  const FAN_G = 7; /* seven generations: 254 places; names are written for the inner four, a tap reads the rest */
  function ahnen(M) {
    const at = { 1: L.root };
    for (let n = 1; n < 2 ** FAN_G; n++) {
      const pid = at[n]; if (!pid) continue; const f = parentsOf(M, pid); if (!f) continue;
      const ps = f.partners.map((q) => M.P[q]).filter(Boolean), fa = ps.find((q) => q.sex === "M"), mo = ps.find((q) => q.sex === "F"), rest = ps.filter((q) => q !== fa && q !== mo);
      const F = fa || rest.shift(), Mo = mo || rest.shift(); if (F) at[2 * n] = F.id; if (Mo) at[2 * n + 1] = Mo.id;
    }
    return at;
  }
  function relName(n) {
    if (n === 1) return "You"; const b = n.toString(2).slice(1), g = b.length, who = b[g - 1] === "0" ? "father" : "mother", side = b[0] === "0" ? "father's" : "mother's";
    if (g === 1) return "Your " + who; if (g === 2) return `Your ${side} ${who}`; return `Your ${g > 3 ? g - 2 + "× " : ""}great-grand${who} (${side} side)`;
  }
  const knownP = (p) => p && !(p.ghost && p.status === "inferred");
  function fanSvg(M) {
    const at = ahnen(M), r0 = 30, rw = (172 - r0) / FAN_G, NS = "http://www.w3.org/2000/svg", pt = (r, a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    let out = `<defs><radialGradient id="fan-glow"><stop offset="0" stop-color="rgba(231,194,122,.22)"/><stop offset="1" stop-color="rgba(231,194,122,0)"/></radialGradient></defs><circle r="180" fill="url(#fan-glow)"/>`;
    for (let g = 1; g <= FAN_G; g++) {
      const cnt = 2 ** g, d = (2 * Math.PI) / cnt, ri = r0 + (g - 1) * rw + 1.2, ro = r0 + g * rw - 1.2;
      for (let i = 0; i < cnt; i++) {
        const n = cnt + i, pid = at[n], p = pid && M.P[pid], a0 = Math.PI / 2 + i * d + 0.012, a1 = a0 + d - 0.024, lg = d > Math.PI ? 1 : 0;
        const kid = at[n >> 1], kf = kid && parentsOf(M, kid), unsure = !!(kf && kf.uncertain && kf.uncertain[kid]);
        const cls = "fan-seg" + (p ? ` st-${p.status}` : " empty") + (p && p.ghost && p.status === "inferred" ? " ghost" : "") + (unsure ? " unsure" : "") + (p && p.id === ui.sel ? " sel" : "");
        const label = `${relName(n)}: ${p ? (knownP(p) ? nm(p) : "not yet known") : "not known"}`;
        out += `<path class="${cls}" d="M${pt(ro, a0)}A${ro} ${ro} 0 ${lg} 1 ${pt(ro, a1)}L${pt(ri, a1)}A${ri} ${ri} 0 ${lg} 0 ${pt(ri, a0)}Z" ${p ? `data-id="${p.id}"` : `data-slot="${n}"`} tabindex="0" role="button" aria-label="${esc(label)}"><title>${esc(label)}</title></path>`;
        if (g <= 4 && p) { /* names curved along the arc (owner, 2026-11-24: "Curve the text on the fan"), upright on both halves */
          const am = (a0 + a1) / 2, rm = (ri + ro) / 2, fs = [0, 12.5, 11, 9.5, 7.5][g], top = Math.sin(am) < -1e-6;
          const rr = top ? rm - fs * 0.34 : rm + fs * 0.34, pad = 0.015, s0 = top ? a0 + pad : a1 - pad, s1 = top ? a1 - pad : a0 + pad;
          const t = knownP(p) ? firstName(p) : "?", max = [0, 18, 14, 12, 9][g], txt = t.length > max ? t.slice(0, max - 1) + "…" : t;
          out += `<path id="fp${n}" d="M${pt(rr, s0)}A${rr} ${rr} 0 ${lg} ${top ? 1 : 0} ${pt(rr, s1)}" fill="none" stroke="none"/><text class="fan-t g${g}${knownP(p) ? "" : " unk"}"><textPath href="#fp${n}" startOffset="50%">${esc(txt)}</textPath></text>`;
        }
      }
    }
    const me = M.P[L.root];
    out += `<circle class="fan-me${ui.sel === L.root ? " sel" : ""}" r="${r0 - 1}" data-id="${L.root}" tabindex="0" role="button" aria-label="You"/><text class="fan-t me" dy="-2">${esc(firstName(me))}</text><text class="fan-t me2" dy="12">you</text>`;
    return out;
  }
  /* how much of your ancestry is known, generation by generation (pedigree completeness) */
  function completeness(M) {
    const at = ahnen(M), GEN = ["You", "Parents", "Grandparents", "Great-grandparents"];
    const rows = []; let k = 0, t = 0;
    for (let g = 1; g <= FAN_G; g++) { let n = 0; for (let i = 2 ** g; i < 2 ** (g + 1); i++) if (knownP(M.P[at[i]])) n++; rows.push({ g, name: GEN[g] || `${g - 2}× great-grandparents`, n, of: 2 ** g }); k += n; t += 2 ** g; }
    return { rows, k, t, pct: Math.round((100 * k) / t) };
  }
  function completeHtml(M) {
    const c = completeness(M);
    return `<summary>How much of your ancestry is known: <b>${c.k} of ${c.t}</b> in seven generations (${c.pct}%)</summary>
      <ul>${c.rows.map((r) => `<li><span>${esc(r.name)}</span><i style="--p:${(100 * r.n) / r.of}%"></i><b>${r.n} of ${r.of}</b></li>`).join("")}</ul>
      <p class="sub">A place counts as known when a person is in it (from the records or from you), not when it is only inferred. Joseph and Della sit in their places on the assumption that Barbara is their daughter (C10); if she is their granddaughter, they move up a generation.</p>`;
  }

  /* the family through time: every dated event, in order, with the world around it */
  function timeHtml(M) {
    const ev = L.events.map((e) => ({ k: "e", sort: e.date.sort, e })).concat((L.context || []).map((c) => ({ k: "c", sort: c.date, c })));
    ev.sort((a, b) => a.sort.localeCompare(b.sort) || (a.k === "c" ? -1 : 1));
    let dec = null, html = "";
    for (const x of ev) {
      const d = x.sort.slice(0, 3) + "0s"; if (d !== dec) { dec = d; html += `<li class="tl-dec">${d}</li>`; }
      if (x.k === "c") { html += `<li class="tl-ctx"><time>${esc(x.sort.slice(0, 4))}</time><span>${esc(x.c.text)}${/^https:\/\//.test(x.c.url || "") ? ` <a class="tl-src" href="${esc(x.c.url)}" target="_blank" rel="noopener">source</a>` : x.c.unsourced ? ` <small class="tl-src">(source still to find)</small>` : ""}</span></li>`; continue; }
      const e = x.e, who = e.who.map((q) => M.P[q] ? firstName(M.P[q]) : q).join(" & "), pl = e.place && M.PL[e.place] ? M.PL[e.place].name : "";
      html += `<li class="tl-ev c-${e.confidence}"><time>${esc(e.date.text)}</time><button type="button" class="ln-link" data-go="${e.who[0]}">${esc(who)}</button> <b>${esc(TYPE[e.type] || e.type)}</b>${pl ? ` · ${esc(pl)}` : ""}</li>`;
    }
    const span = ev.length ? `${ev[0].sort.slice(0, 4)} to ${ev[ev.length - 1].sort.slice(0, 4)}` : "";
    return `<summary>The family through time: <b>${L.events.length} events</b>, ${span}, with the world around them</summary><ol class="tl">${html}</ol>`;
  }

  /* the legend names only the kinds of card the tree shows, plus the unsettled link when there is one */
  function legend(tree) {
    const M = ui.M, has = new Set(M.people.map((p) => p.status)), order = ["proven", "probable", "possible", "family", "named", "inferred", "placeholder"];
    const un = M.families.some((f) => f.uncertain && Object.keys(f.uncertain).length);
    tree.querySelector(".ln-legend").innerHTML = order.filter((k) => has.has(k)).map((k) => `<span class="st-${k}">${CONF[k]}</span>`).join("") + (un ? `<span class="st-unsure">Not yet settled</span>` : "");
  }
  /* ------------------------------------------------------------------ family stories (stories.js; owner, 26 Nov 2026: "Is there only a
     timeline story ... there's room for more and theres no historical links integration"). One story per line, in chapters: the text,
     the people in it with what each is to you, the records and pictures (they open in the viewer), the history around it (checked
     outside articles, then the shared world-history entries for the same years and places), and what is still open. */
  function storiesPanel(el) {
    const ST = L.stories || []; if (!ST.length) { el.hidden = true; return; }
    const M = ui.M, box = el.querySelector(".st-box");
    const K = window.KinKinship ? window.KinKinship.make(M.families.filter((f) => !f.ghost), M.people.filter((p) => !p.ghost), L.root) : null;
    const rel = (id) => (id === L.root ? "You" : K ? K.rel(id) : "");
    const ALB = Object.fromEntries(((L.album && L.album.items) || []).map((x) => [x.id, x]));
    const Q = Object.fromEntries(L.questions.map((q) => [q.id, q]));
    const sideTxt = (s) => (s.side === "mother" ? "Your mother's side" : "Your father's side");
    const nPeople = (s) => new Set(s.chapters.flatMap((c) => c.people)).size, nLinks = (s) => s.chapters.reduce((n, c) => n + c.h.length, 0);
    const card = (s) => `<button type="button" class="st-card" data-story="${s.id}">${s.cover ? `<img loading="lazy" decoding="async" src="${DOCS}t/${s.cover}.webp" alt="">` : `<span class="st-noimg" aria-hidden="true">${esc(s.title[0])}</span>`}<span class="st-cin"><span class="st-kick">${sideTxt(s)} · ${esc(s.span)}</span><b>${esc(s.title)}</b><span class="st-lead">${esc(s.lead)}</span><span class="st-meta">${s.chapters.length} chapters · ${nPeople(s)} people · ${nLinks(s)} history links</span></span></button>`;
    const list = () => { box.innerHTML = `<div class="st-list">${ST.map(card).join("")}</div>`; };
    /* the shared world history (Athenaeum's) for the chapter's years, nearest regions first, only for chapters of a lifetime or less */
    /* a story names its own regions (stories.js): its chapters draw the events of those places first, then the country's, never another
       line's (Joseph Termenas's Detroit years get Michigan's 1921 bonus, not Malta's dockyards) */
    const WIDE = new Set(["united-states", "world", "europe", "american-colonies"]);
    const ctx = (s, c, used) => { const [a, b] = c.y; if (used) for (const id of c.told || []) used.add(id); /* told in the chapter itself */ if (b - a > 60) return []; const own = new Set(c.regions || s.regions || []), fam = new Set(L.contextRegions || []);
      const mine = (x) => (x.regions || []).some((r) => own.has(r));
      /* how much an event belongs to this story: its places in the story count for it, places of another family line against it */
      const fit = (x) => (x.regions || []).reduce((n, r) => n + (own.has(r) ? 1 : !WIDE.has(r) && fam.has(r) ? -1.5 : 0), 0);
      const out = (L.context || []).filter((x) => { const y = +String(x.date).slice(0, 4); return y >= a && y <= b && x.w >= 1 && !(used && used.has(x.id)) && (!own.size || mine(x) || x.w === 1); })
        .sort((p, q) => (Math.min(fit(q), 1) - Math.min(fit(p), 1)) || q.w - p.w || String(p.date).localeCompare(String(q.date))).slice(0, 3);
      if (used) for (const x of out) used.add(x.id);   /* one story never shows the same event twice */
      return out.sort((p, q) => String(p.date).localeCompare(String(q.date))); };
    const chapter = (s, c, i) => {
      const recs = c.src.flatMap((sid) => (((M.SRC[sid] || {}).img) || []).slice(0, 2).map((img) => ({ img, sid, cap: (M.SRC[sid] || {}).short || "" })));
      const pics = (c.album || []).map((id) => ALB[id]).filter(Boolean).map((a) => ({ img: a.img, sid: a.src, cap: a.cap }));
      const docs = recs.concat(pics), cx = ctx(s, c, s._used), qs = (c.q || []).filter((q) => Q[q]);
      const short = (s2) => (s2.length > 64 ? s2.slice(0, 61).replace(/\s+\S*$/, "") + "…" : s2);
      return `<article class="st-ch" id="st-${s.id}-${i}"><p class="st-when">${esc(c.when)}</p><h3>${esc(c.title)}</h3><p class="st-text">${esc(c.text)}</p>
        ${c.people.length ? `<div class="st-ppl">${c.people.filter((id) => M.P[id]).map((id) => `<button type="button" class="st-p" data-go="${id}"><b>${esc(nm(M.P[id]))}</b><small>${esc(rel(id))}</small></button>`).join("")}</div>` : ""}
        ${docs.length ? `<div class="ln-docs st-docs">${docs.map((d) => `<button type="button" class="ln-doc" data-img="${d.img}" data-src="${d.sid || ""}" data-cap="${esc(d.cap)}" aria-label="${esc(d.cap)}"><img loading="lazy" decoding="async" src="${DOCS}t/${d.img}.webp" alt=""><span>${esc(short(d.cap))}</span></button>`).join("")}</div>` : ""}
        ${c.h.length || cx.length ? `<div class="st-hist"><p class="st-hk">The history around it</p><ul>${c.h.map(([ti, u, n]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(ti)}<span aria-hidden="true"> ↗</span></a>${n ? `<small>${esc(n)}</small>` : ""}</li>`).join("")}${cx.map((x) => `<li class="st-ctx"><time>${esc(String(x.date).slice(0, 4))}</time> ${esc(x.text)}${/^https:\/\//.test(x.url || "") ? ` <a href="${esc(x.url)}" target="_blank" rel="noopener">source<span aria-hidden="true"> ↗</span></a>` : ""}</li>`).join("")}</ul></div>` : ""}
        ${qs.length ? `<details class="st-open"><summary>Still open here (${qs.length})</summary><ul class="ln-qs">${qs.map((q) => `<li><b>${q}</b> ${esc(Q[q].q)}</li>`).join("")}</ul></details>` : ""}</article>`;
    };
    const open = (id, at) => {
      const k = ST.findIndex((x) => x.id === id), s = ST[k]; if (!s) { list(); return; }
      const nx = ST[(k + 1) % ST.length];
      box.innerHTML = `<div class="st-read"><button type="button" class="btn quiet small st-back">← All stories</button>
        <header class="st-head">${s.cover ? `<img src="${DOCS}${s.cover}.webp" alt="" decoding="async">` : ""}<div><p class="st-kick">${sideTxt(s)} · ${esc(s.span)}</p><p class="st-title">${esc(s.title)}</p><p class="st-lead">${esc(s.lead)}</p><p class="st-meta">${s.chapters.length} chapters · ${nPeople(s)} people · ${nLinks(s)} history links</p></div></header>
        <nav class="st-rail" aria-label="Chapters">${s.chapters.map((c, i) => `<button type="button" data-ch="${i}"><b>${esc(c.when)}</b><span>${esc(c.title)}</span></button>`).join("")}</nav>
        ${(s._used = new Set(), s.chapters.map((c, i) => chapter(s, c, i)).join(""))}
        <p class="st-foot"><button type="button" class="btn small" data-story="${nx.id}">Next: ${esc(nx.title)}</button></p></div>`;
      try { localStorage.setItem("kin.story", id); } catch (_) {}
      const tgt = at != null ? box.querySelector(`#st-${s.id}-${at}`) : box;
      requestAnimationFrame(() => tgt && tgt.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    box.addEventListener("click", (e) => {
      const sc = e.target.closest("[data-story]"); if (sc) { open(sc.dataset.story); return; }
      if (e.target.closest(".st-back")) { list(); box.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      const ch = e.target.closest(".st-rail [data-ch]"); if (ch) { const a = box.querySelector(`.st-read article:nth-of-type(${+ch.dataset.ch + 1})`); if (a) a.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    ui.openStory = open;
    list();
  }
  /* the stories a person appears in, for their page */
  function storyLinks(pid) {
    const hits = (L.stories || []).map((s) => { const i = s.chapters.findIndex((c) => c.people.includes(pid)); return i >= 0 ? { s, i } : null; }).filter(Boolean);
    return hits.length ? `<p class="st-in"><span>In the family stories</span>${hits.map(({ s, i }) => `<button type="button" class="ln-link" data-story-open="${s.id}" data-ch="${i}">${esc(s.title)}</button>`).join("")}</p>` : "";
  }
  /* ------------------------------------------------------------------ how are we related? (Thanksgiving 2026: owner, "impress me and them")
     Any two people: what each is to the other, the common ancestor, and the line between them, every step a link into the tree; a step
     through a link not yet settled (drawn dashed in the tree) is marked so. Worked out by kinship.js from the families alone. */
  function relate(a, b) {
    const M = ui.M, K0 = window.KinKinship; if (!K0) return "";
    const people = M.people.filter((p) => !p.ghost), fams = M.families.filter((f) => !f.ghost);
    const A = M.P[a], B = M.P[b]; if (!A || !B) return "";
    if (a === b) return `<p class="ln-rsay">That is the same person.</p>`;
    const KA = K0.make(fams, people, a), KB = K0.make(fams, people, b);
    const fn = (p) => firstName(p).split(" ")[0];   /* "Violet", not "Violet Joy" */
    const say = (K, x, me) => { const t = K.rel(x); return t ? t.replace(/\b[Yy]our\b/g, `${fn(me)}'s`) : ""; };
    const ab = say(KA, b, A), ba = say(KB, a, B);
    if (!ab) return `<p class="ln-rsay">${esc(nm(B))} and ${esc(nm(A))} are not linked in the tree yet.</p><p class="sub">Tell Joseph how they are related and it goes in.</p>`;
    const go = (id) => `<button type="button" class="ln-link" data-go="${id}">${esc(nm(M.P[id]))}</button>`;
    const up = (K, from, to) => { const prev = { [from]: null }; let cur = [from];
      while (cur.length) { const nx = []; for (const x of cur) { if (x === to) { const out = []; let y = to; while (y != null) { out.unshift(y); y = prev[y]; } return out; } for (const q of K.parents(x)) if (!(q in prev)) { prev[q] = x; nx.push(q); } } cur = nx; }
      return null; };
    const unsure = (child, parent) => fams.some((f) => f.children.includes(child) && f.partners.includes(parent) && f.uncertain && f.uncertain[child]);
    const steps = (chain) => chain.map((id, i) => (i ? `<span class="ln-rarr${unsure(chain[i - 1], id) ? " unsure" : ""}" title="${unsure(chain[i - 1], id) ? "a link not yet settled" : "parent"}">→</span>` : "") + go(id)).join("");
    let path = "", note = "";
    const bl = KA.blood(b);
    if (bl) {
      const ca = up(KA, a, bl.via), cb = up(KA, b, bl.via);
      if (ca && cb) {
        const shaky = [...ca.slice(1).map((id, i) => unsure(ca[i], id)), ...cb.slice(1).map((id, i) => unsure(cb[i], id))].some(Boolean);
        path = bl.g && bl.d ? `<div class="ln-rpath">${steps(ca)}</div><div class="ln-rpath">${steps(cb)}</div>` : `<div class="ln-rpath">${steps(bl.g ? ca : cb)}</div>`;
        note = bl.g && bl.d ? `Both come down from ${go(bl.via)}: ${bl.g} generation${bl.g > 1 ? "s" : ""} up from ${esc(fn(A))}, ${bl.d} from ${esc(fn(B))}.` : `${bl.g || bl.d} generation${(bl.g || bl.d) > 1 ? "s" : ""} apart, in a straight line.`;
        if (shaky) note += ` <span class="ln-rshaky">The line passes through a link not yet settled (dashed), so this is how it looks so far.</span>`;
      }
    } else {
      /* by marriage: the line to the relative they married */
      const sp = fams.filter((f) => f.partners.includes(b)).flatMap((f) => f.partners.filter((q) => q !== b && (q === a || KA.blood(q))).map((q) => ({ q, ended: f.ended, un: f.unmarried })))[0];
      if (sp) {
        const x = sp.q === a ? null : KA.blood(sp.q), ca = x ? up(KA, a, x.via) : null, cb = x ? up(KA, sp.q, x.via) : null;
        const tie = `<div class="ln-rpath">${go(sp.q)}<span class="ln-rarr">${sp.ended ? "was married to" : sp.un ? "is with" : "married"}</span>${go(b)}</div>`;
        path = (ca && cb ? (x.g && x.d ? `<div class="ln-rpath">${steps(ca)}</div><div class="ln-rpath">${steps(cb)}</div>` : `<div class="ln-rpath">${steps(x.g ? ca : cb)}</div>`) : "") + tie;
        note = "Family by marriage."; }
    }
    return `<p class="ln-rsay">${esc(nm(B))} is <b>${esc(ab)}</b>.</p>${ba ? `<p class="ln-rsay2">And ${esc(nm(A))} is ${esc(ba)}.</p>` : ""}${path}${note ? `<p class="sub ln-rnote">${note}</p>` : ""}`;
  }
  function relatePanel(el) {
    const M = ui.M, ppl = M.people.filter((p) => !p.ghost && (p.names || []).some((n) => n.given || n.surname)).sort((x, y) => nm(x).localeCompare(nm(y)));
    const opts = (sel) => ppl.map((p) => `<option value="${p.id}"${p.id === sel ? " selected" : ""}>${esc(nm(p))}${p.id === L.root ? " (you)" : ""}</option>`).join("");
    let a = L.root, b = "P-tania"; try { const s = JSON.parse(localStorage.getItem("kin.relate") || "null"); if (s && M.P[s[0]] && M.P[s[1]]) { a = s[0]; b = s[1]; } } catch (_) {}
    if (!M.P[b]) b = ppl.find((p) => p.id !== a).id;
    el.innerHTML = `<div class="ln-relf"><label class="ln-rl">One person<select id="ln-ra">${opts(a)}</select></label><button type="button" class="btn quiet small ln-rswap" id="ln-rswap" aria-label="Swap the two people">⇄</button><label class="ln-rl">and another<select id="ln-rb">${opts(b)}</select></label></div><div class="ln-rout" id="ln-rout" aria-live="polite"></div>`;
    const ra = el.querySelector("#ln-ra"), rb = el.querySelector("#ln-rb"), out = el.querySelector("#ln-rout");
    const run = () => { out.innerHTML = relate(ra.value, rb.value); try { localStorage.setItem("kin.relate", JSON.stringify([ra.value, rb.value])); } catch (_) {} };
    ra.addEventListener("change", run); rb.addEventListener("change", run);
    el.querySelector("#ln-rswap").addEventListener("click", () => { const x = ra.value; ra.value = rb.value; rb.value = x; run(); });
    run();
  }
  /* the questions only the family can answer, grouped by whom to ask (data: L.askTable); ticks stay on this device */
  function askPanel(el) {
    const T = L.askTable || []; if (!T.length) { el.hidden = true; return; }
    let done = {}; try { done = JSON.parse(localStorage.getItem("kin.asked") || "{}") || {}; } catch (_) {}
    const key = (g, i) => `${g.who}|${i}`;
    el.querySelector(".ln-ask").innerHTML = T.map((g) => `<section class="ln-askg"><h4>${esc(g.who)}</h4><p class="sub">${esc(g.why || "")}</p><ul>${g.ask.map((x, i) => `<li><label><input type="checkbox" data-k="${esc(key(g, i))}"${done[key(g, i)] ? " checked" : ""}><span>${esc(x.q)}</span></label></li>`).join("")}</ul></section>`).join("");
    el.addEventListener("change", (e) => { const c = e.target.closest("input[data-k]"); if (!c) return; if (c.checked) done[c.dataset.k] = 1; else delete done[c.dataset.k]; try { localStorage.setItem("kin.asked", JSON.stringify(done)); } catch (_) {} });
  }
  /* ------------------------------------------------------------------ mount */
  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid) return;
    const panel = (id, title, sub, inner) => { const d = h("div", { class: "glass span-12 ln-panel", id }); d.innerHTML = `<h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}${inner}`; return d; };
    const tree = panel("ln-tree", "The family tree", "Your line, generation by generation, from the records. Drag to move, pinch or scroll to zoom, tap a person for everything known about them and how it is known.",
      `<div class="ln-stage"><svg class="ln-svg" role="group" aria-label="Family tree"><g class="ln-world"></g></svg>
        <svg class="ln-fan" role="group" aria-label="Fan chart: every ancestor's place for seven generations" hidden></svg>
        <div class="ln-view-sw" role="group" aria-label="View"><button type="button" class="segb on" data-v="tree" aria-pressed="true">Tree</button><button type="button" class="segb" data-v="fan" aria-pressed="false">Fan</button></div>
        <div class="ln-tools"><button type="button" class="btn quiet small" data-z="in" aria-label="Zoom in">+</button><button type="button" class="btn quiet small" data-z="out" aria-label="Zoom out">−</button><button type="button" class="btn quiet small" data-z="fit">Whole tree</button><button type="button" class="btn quiet small" data-z="me">You</button></div>
        <p class="ln-legend"></p>
        <div class="ln-peek" hidden><div><p class="ln-kick"></p><b></b><span></span></div><button type="button" class="btn small" data-peek="open">Full story</button><button type="button" class="btn quiet small ln-px" data-peek="close" aria-label="Close">×</button></div></div>
      <details class="ln-complete" id="ln-complete"></details>
      <details class="ln-complete ln-time" id="ln-time"></details>
      <div class="ln-dossier" id="ln-dossier" aria-live="polite"></div>
      <div class="ln-foot"><button type="button" class="btn quiet small" id="ln-ged">Export GEDCOM 7</button><button type="button" class="btn quiet small" id="ln-share">Send my additions</button><button type="button" class="btn quiet small" id="ln-load">Add someone's additions</button><span>${L.people.length} people · ${L.events.length} events · ${L.sources.length} sources · ${L.conflicts.length} conflicts weighed</span></div>`);
    const src = panel("ln-sources", "Sources of the family history", "Every record behind the tree, with its full citation, where it is kept, a transcription and the image.", `<div id="ln-srcs"></div>`);
    const plan = panel("ln-plan", "Family research plan", "", `<div id="ln-planx"></div>`);
    const askp = panel("ln-askp", "Ask at the table", "What only the family can answer, by who to ask. Tick them off as you go (the ticks stay on this phone); tell Joseph what they say and it goes into the tree.", `<div class="ln-ask"></div>`);
    const storp = panel("ln-stories", "Family stories", "Each line of the family told in chapters: the people in it and what they are to you, the records and pictures behind every chapter, and the history around it, with links out to read more.", `<div class="st-box"></div>`);
    grid.insertBefore(plan, grid.firstChild); grid.insertBefore(src, plan); grid.insertBefore(askp, src); grid.insertBefore(storp, askp); grid.insertBefore(tree, storp);
    /* how are we related? sits right under the tree, in the same section, so nobody has to find a tab for it */
    const relp = h("section", { class: "ln-relate", id: "ln-relate", "aria-label": "How are we related?" });
    relp.innerHTML = `<h4>How are we related?</h4><p class="sub">Pick any two people. The tree works out what each is to the other and shows the line between them; tap a name to find them in the tree.</p><div id="ln-relx"></div><p class="ln-askgo"><button type="button" class="btn small" id="ln-askgo">Questions to ask at the table</button></p>`;
    tree.insertBefore(relp, tree.querySelector("#ln-complete"));
    relp.querySelector("#ln-askgo").addEventListener("click", () => { const tb = document.querySelector('.pk-tabs [aria-controls="ln-askp"]'); if (tb) tb.click(); else askp.scrollIntoView({ behavior: "smooth", block: "start" }); });
    /* the door to the family tree in three dimensions (tree/), the main way in since 2026-11-24 */
    const door = h("a", { class: "ln-door", href: "tree/" });
    door.innerHTML = `<img src="tree/poster.webp" alt="" loading="lazy" decoding="async"><span class="ln-door-in"><span class="kicker">In three dimensions</span><b>Walk through the family tree</b><span class="ln-door-p">${L.people.length} people across ${Math.max(...Object.values(gensFrom(model())))} generations, set in time: every life from birth to death, every record beside the person it proves, the journeys on a globe, and what is still open.</span><span class="btn">Enter the tree</span></span>`;
    tree.insertBefore(door, tree.querySelector(".ln-stage"));
    /* the door to the family album (album/, 2026-11-25): every picture from the Kin media folder, and the show for the television */
    if (L.album) {
      const al = L.album, cover = (al.items.find((x) => x.id === "M-bill-mary-portrait") || al.items[0]).img;
      const adoor = h("a", { class: "ln-door ln-door-album", href: "album/" });
      adoor.innerHTML = `<img src="${DOCS}${cover}.webp" alt="" loading="lazy" decoding="async"><span class="ln-door-in"><span class="kicker">The family album</span><b>${al.items.length} pictures, and a show for the table</b><span class="ln-door-p">Bill and Mary Culberson, Ada and Chester Moss, Peter Culberson's cavalry company, the aunts and uncles, Joseph Termenas's convoy: every picture from the Kin folder checked by hand and linked to the person in the tree. ${al.items.filter((x) => x.who).length} are still waiting for someone to say who they are.</span><span class="btn">Open the album</span></span>`;
      tree.insertBefore(adoor, tree.querySelector(".ln-stage"));
    }
    const root = tree, dos = tree.querySelector("#ln-dossier");
    /* the person sheet: a person's full page over the page you are on; closing it leaves you exactly where you were */
    const sheet = h("div", { class: "ln-sheet", role: "dialog", "aria-modal": "true", "aria-label": "Person" }); sheet.hidden = true;
    sheet.innerHTML = `<div class="ln-sheet-in" tabindex="-1"><div class="ln-sheet-bar"><p class="ln-sheet-who" aria-hidden="true"><b></b><small></small></p><button type="button" class="btn small" data-sheet="tree">In the tree</button><button type="button" class="btn quiet small ln-sheet-x" data-sheet="close" aria-label="Close">×</button></div><div class="ln-dossier ln-sheet-body" aria-live="polite"></div></div>`;
    document.body.appendChild(sheet);   /* on <body>: #app carries a transform, which would pin a fixed sheet to it instead of the screen */
    const sheetIn = sheet.querySelector(".ln-sheet-in");
    let sheetBack = null;
    const sheetBody = sheet.querySelector(".ln-sheet-body"), sheetWho = sheet.querySelector(".ln-sheet-who");
    const relTop = (el) => el.getBoundingClientRect().top - sheetIn.getBoundingClientRect().top;
    /* Going from one person to a relative inside the sheet keeps your place (owner, 26 Nov: "everytime I click someones name it
       scrolls to the top"): the family rows you tapped in stay where they were on screen, now showing the new person's family,
       and the strip at the top says whose page it is. Opening from the page (not from inside the sheet) starts at the top. */
    openSheet = (pid, from) => {
      if (!ui.M.P[pid]) return;
      const inside = from && !sheet.hidden && sheet.contains(from), oldRow = inside && from.closest(".ln-rel") ? sheetBody.querySelector(".ln-rel") : null;
      const keep = oldRow ? relTop(oldRow) : null;
      if (sheet.hidden) sheetBack = document.activeElement;
      ui.sheetPid = pid; ui.sel = pid; dossier(sheetBody, pid);
      const P = ui.M.P[pid], K = window.KinKinship ? window.KinKinship.make(ui.M.families, ui.M.P, L.root) : null;
      sheetWho.querySelector("b").textContent = pid === L.root ? "You" : P.status === "placeholder" ? P.placeholder : nm(P);
      sheetWho.querySelector("small").textContent = pid === L.root || !K ? "" : K.rel(pid, { side: false }) || "";
      sheet.hidden = false; document.body.classList.add("ln-sheet-on");
      const newRow = keep != null ? sheetBody.querySelector(".ln-rel") : null;
      sheetIn.scrollTop = 0;
      if (newRow) sheetIn.scrollTop = Math.max(0, relTop(newRow) - keep);
      sheet.classList.toggle("ln-scrolled", sheetIn.scrollTop > 70);
      if (inside) { sheetBody.classList.remove("ln-swap"); void sheetBody.offsetWidth; sheetBody.classList.add("ln-swap"); }
      sheetIn.focus({ preventScroll: true });
    };
    sheetIn.addEventListener("scroll", () => sheet.classList.toggle("ln-scrolled", sheetIn.scrollTop > 70), { passive: true });
    closeSheet = () => { if (sheet.hidden) return; sheet.hidden = true; document.body.classList.remove("ln-sheet-on"); if (sheetBack && sheetBack.focus) sheetBack.focus({ preventScroll: true }); };
    sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
    const pick = (pid, center) => { ui.sel = pid; drawTree(root); dossier(dos, pid); if (center) focus(root, pid); };
    /* a tap on the tree opens a small card over it (the tree stays where it is); "Full story" goes to the dossier below */
    const pk = tree.querySelector(".ln-peek");
    const peek = (kick, name, line) => { pk.querySelector(".ln-kick").textContent = kick; pk.querySelector("b").textContent = name; pk.querySelector("span").textContent = line; pk.hidden = false; };
    const peekPerson = (pid) => { const M = ui.M, p = M.P[pid]; if (!p) return; const gh = p.ghost && p.status === "inferred";
      peek(CONF[p.status] || p.status, gh ? p.placeholder : nm(p), gh ? (p.infer[0] || "Not yet known") : [life(M, p), (p.summary || p.note || "").split(/(?<=\.)\s/)[0]].filter(Boolean).join(" · ")); };
    pk.addEventListener("click", (e) => { const b = e.target.closest("[data-peek]"); if (!b) return; pk.hidden = true; if (b.dataset.peek !== "close" && ui.sel) openSheet(ui.sel); });
    const onTree = (el) => {
      if (el.dataset.up) { ui.vroot = el.dataset.up; drawTree(root); legend(tree); pk.hidden = true; first(root); toast(`${nm(ui.M.P[el.dataset.up])} and the generations above. "You" comes back.`); return; }
      if (el.dataset.x) { ui.expand.add(el.dataset.x); drawTree(root); legend(tree); toast(`${nm(ui.M.P[el.dataset.x])}'s mother and father, not yet known: tap one to name them.`); return; }
      if (el.dataset.fam) { const f = ui.M.F[el.dataset.fam]; famDossier(dos, el.dataset.fam); const k = f.children.filter((c) => ui.M.P[c]).length;
        peek("A family", f.partners.map((q) => { const P = ui.M.P[q]; return P ? (P.ghost && P.status === "inferred" ? P.placeholder : firstName(P)) : q; }).join(" & "), `${k} ${k === 1 ? "child" : "children"} known; how many more is not known yet`); return; }
      pick(el.dataset.id, false); peekPerson(el.dataset.id);
    };
    drawTree(root); dossier(dos, ui.sel); legend(tree); relatePanel(relp.querySelector("#ln-relx")); askPanel(askp); storiesPanel(storp);
    /* a link to a story from anywhere (the tree in three dimensions, a person's page): ?story=termenas[&ch=3] */
    const showPanel = (id) => { const tb = document.querySelector(`.pk-tabs [aria-controls="${id}"]`); if (tb) tb.click(); };
    try { const u = new URLSearchParams(location.search), sid = u.get("story"); if (sid && ui.openStory) setTimeout(() => { showPanel("ln-stories"); ui.openStory(sid, u.get("ch") != null ? +u.get("ch") : null); }, 60); } catch (_) {} src.querySelector("#ln-srcs").innerHTML = sourcesHtml(); plan.querySelector("#ln-planx").innerHTML = planHtml();
    requestAnimationFrame(() => first(root));
    wire(root, onTree);
    /* the fan: a tap on a place opens that person, or says whose parent is missing */
    const fanEl = tree.querySelector("svg.ln-fan");
    const fanTap = (e) => { const el = e.target.closest && e.target.closest("[data-id], [data-slot]"); if (!el) return;
      if (el.dataset.id) { onTree(el); return; }
      const n = +el.dataset.slot, kid = ahnen(ui.M)[n >> 1], K = kid && ui.M.P[kid];
      if (K) { pick(kid, false); const kl = knownP(K) ? nm(K) : K.placeholder.replace(/^Your/, "your");
        peek("Not known", relName(n), `Nobody is in this place yet: ${kl}'s ${n % 2 ? "mother" : "father"}. ${knownP(K) ? `Add them as a parent on ${firstName(K)}'s page below.` : `Name ${kl} first, then add their parents.`}`); } };
    fanEl.addEventListener("click", fanTap);
    fanEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fanTap(e); } });
    tree.querySelector(".ln-view-sw").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; const fanOn = b.dataset.v === "fan";
      for (const x of tree.querySelectorAll(".ln-view-sw [data-v]")) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); }
      root.querySelector("svg.ln-svg").toggleAttribute("hidden", fanOn); fanEl.toggleAttribute("hidden", !fanOn); /* an svg has no .hidden property: the attribute is what hides it */ tree.querySelector(".ln-tools").hidden = fanOn; tree.classList.toggle("fan-on", fanOn); pk.hidden = true;
      try { localStorage.setItem("kin.lineage.view", b.dataset.v); } catch (_) {} if (!fanOn) first(root); });
    try { const v = localStorage.getItem("kin.lineage.view"); if (v === "fan") tree.querySelector('.ln-view-sw [data-v="fan"]').click(); } catch (_) {}   /* the tree opens on the family; the fan (direct ancestors only) is one tap away. Until 26 Nov 2026 a big tree opened on the fan, which hid everyone but the ancestors (owner: "heavily biased to Joseph Termens") */
    tree.querySelector(".ln-tools").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const svg = root.querySelector("svg.ln-svg").getBoundingClientRect();
      if (b.dataset.z === "in") { zoomAt(root, 1.25, svg.width / 2, svg.height / 2); } if (b.dataset.z === "out") zoomAt(root, 0.8, svg.width / 2, svg.height / 2); if (b.dataset.z === "fit") fit(root); if (b.dataset.z === "me") { ui.vroot = null; pick(L.root, false); first(root); } });
    const appClick = (e) => {
      /* a name anywhere opens that person in a sheet over the page, where you are: the page never jumps (owner, 26 Nov 2026: "everytime
         I click someone's name it scrolls to the top ... its so annoying to use"); "Show in the tree" is the one way to the tree */
      const go = e.target.closest("[data-go]"); if (go) { openSheet(go.dataset.go, go); return; }
      const st = e.target.closest("[data-sheet]"); if (st) { if (st.dataset.sheet === "tree") { const pid = ui.sheetPid; closeSheet(); const tb = document.querySelector('.pk-tabs [aria-controls="ln-tree"]'); if (tb) tb.click(); pick(pid, true); root.scrollIntoView({ behavior: "smooth", block: "start" }); } else closeSheet(); return; }
      const so = e.target.closest("[data-story-open]"); if (so && ui.openStory) { const tb = document.querySelector('.pk-tabs [aria-controls="ln-stories"]'); if (tb) tb.click(); ui.openStory(so.dataset.storyOpen, so.dataset.ch != null ? +so.dataset.ch : null); return; }
      const im = e.target.closest(".ln-doc"); if (im) { viewer(im.dataset.img, im.dataset.src, im.dataset.cap); return; }
      const sb = e.target.closest(".ln-link[data-src]"); if (sb) { const s = ui.M.SRC[sb.dataset.src]; if (s && s.img && s.img.length) viewer(s.img[0], s.id); else toast(s ? s.cite : ""); }
    };
    document.querySelector("#app").addEventListener("click", appClick); sheet.addEventListener("click", appClick);   /* the sheet lives on <body> (see below), so it gets the same handling */
    /* the photo wall (owner, 26 Nov: "Make the layout better and incorporate more media"): the family's own faces and pictures, first
       thing under the title. A face opens the person; a picture or record opens full size with its caption. */
    (function wall() {
      const hero = document.querySelector(".shell .hero"); if (!hero || document.querySelector(".kin-wall")) return;
      const MM = model(), K = window.KinKinship ? window.KinKinship.make(MM.families, MM.P, L.root) : null, med = Object.fromEntries((L.media || []).map((m) => [m.id, m]));
      const order = ["P-glenda", "P-chester", "P-ada", "P-billc", "P-marytt", "P-peterc", "P-charliec", "P-callie", "P-caroline"];
      const faces = order.concat(Object.keys(FACE).filter((id) => !order.includes(id))).filter((id) => FACE[id] && MM.P[id]);
      const shots = ["M-bill-culberson-family-1902", "M-peter-family-postcard", "M-etta-ruby-elizabeth", "M-convoy-1917", "M-bill-mary-portrait", "M-culberson-boys", "M-chester-ada-1950s",
        "M-five-generations-1959", "M-charlie-and-aunt-callie", "M-ada-charlie-callie-1988", "M-charlie-elizabeth-studio", "M-caroline-dembeck", "M-glenda"]
        .map((id) => med[id]).filter(Boolean).map((m) => { const a = ((L.album && L.album.items) || []).find((x) => x.img === m.img) || { w: 3, h: 4 };
          return { img: m.img, src: m.src, cap: m.caption, when: m.when || String(m.year || (m.id === "M-glenda" ? "about 2022" : "")), y: m.year || +String(m.when || "").replace(/\D/g, "").slice(0, 4) || 2022, rec: false, w: a.w, h: a.h }; });
      for (const [img, sid, w, h] of [["draft-1917", "S-draft", 2000, 1014], ["discharge-1919", "S-discharge", 1535, 2000], ["mi-ww1-card", "S-mi-ww1", 1400, 930], ["census-1950-pavia", "S-census-1950-pavia", 2000, 2346]]) {
        const S0 = L.sources.find((x) => x.id === sid); if (S0) shots.push({ img, src: sid, cap: S0.short, when: String(S0.year || ""), y: S0.year || 1950, rec: true, w, h });
      }
      shots.sort((a, b) => a.y - b.y);
      const n = (L.album && L.album.items || []).length, sec = document.createElement("section");
      sec.className = "kin-wall"; sec.setAttribute("aria-label", "The family in pictures");
      sec.innerHTML = `<div class="kw-head"><p class="kw-kick">The family in pictures</p><a class="kw-all" href="album/">All ${n} in the album ›</a></div>
        <div class="kw-faces" role="list">${faces.map((id) => `<button type="button" role="listitem" class="kw-face" data-go="${id}"><img src="${DOCS}t/${FACE[id]}.webp" alt="" decoding="async"><b>${esc(firstName(MM.P[id]))}</b><small>${esc(K ? (K.rel(id, { side: false }) || "").replace(/^Your /, "") : "")}</small></button>`).join("")}</div>
        <div class="kw-strip" role="list">${shots.map((x, i) => `<button type="button" role="listitem" class="ln-doc kw-shot${x.rec ? " rec" : ""}" data-img="${x.img}" data-src="${x.src}" data-cap="${esc(x.cap)}" aria-label="${esc(x.cap)}"><img src="${DOCS}t/${x.img}.webp" width="${Math.round(180 * x.w / x.h)}" height="180" alt="" decoding="async"${i > 3 ? ' loading="lazy"' : ""}><span>${x.rec ? "<i>Record</i> " : ""}${esc(x.when)}</span></button>`).join("")}</div>
        <div class="kw-acts"><a class="btn small" href="album/#show">Play the show</a><a class="btn quiet small" href="tree/">Walk the tree in 3D</a><button type="button" class="btn quiet small" data-kw="stories">Read the family stories</button></div>`;
      hero.after(sec);
      sec.addEventListener("click", (e) => { const t = e.target.closest("[data-kw]"); if (t) { const tb = document.querySelector('.pk-tabs [aria-controls="ln-stories"]'); if (tb) { tb.click(); document.querySelector("#ln-stories").scrollIntoView({ behavior: "smooth", block: "start" }); } return; } appClick(e); });
    })();
    const appSubmit = (e) => {
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
    };
    document.querySelector("#app").addEventListener("submit", appSubmit); sheet.addEventListener("submit", (e) => { appSubmit(e); if (e.defaultPrevented && ui.sheetPid) openSheet(ui.sheetPid); });
    /* your additions travel as a file: send it to family, and add theirs to yours (names, people and links merge; nothing is lost) */
    tree.querySelector("#ln-share").addEventListener("click", () => { const x = local(); PK.download(`family-tree-additions-${new Date().toISOString().slice(0, 10)}.json`, { kind: "kin-lineage-additions", version: 1, made: new Date().toISOString(), ...x }); });
    tree.querySelector("#ln-load").addEventListener("click", async () => {
      try { const f = await PK.pickFile(); if (!f) return; const x = JSON.parse(await f.text()); if (x.kind !== "kin-lineage-additions") throw new Error("not a family-tree additions file");
        const loc = local(), ids = (a) => new Set(a.map((y) => y.id)); let n = 0;
        for (const [k, v] of Object.entries(x.names || {})) if (!loc.names[k]) { loc.names[k] = v; n++; }
        for (const key of ["people", "families"]) { const have = ids(loc[key]); for (const y of x[key] || []) if (!have.has(y.id)) { loc[key].push(y); n++; } }
        const lk = new Set(loc.links.map((y) => JSON.stringify(y))); for (const y of x.links || []) if (!lk.has(JSON.stringify(y))) { loc.links.push(y); n++; }
        saveLocal(loc); drawTree(root); legend(tree); dossier(dos, ui.sel); toast(n ? `${n} additions merged into your tree.` : "Nothing new in that file.");
      } catch (err) { toast("That file could not be added: " + err.message); } });
    tree.querySelector("#ln-ged").addEventListener("click", () => { const a = h("a", { href: URL.createObjectURL(new Blob([gedcom()], { type: "text/plain" })), download: "family-tree.ged" }); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); });
    let lastW = window.innerWidth; window.addEventListener("resize", () => { if (Math.abs(window.innerWidth - lastW) < 40) return; lastW = window.innerWidth; first(root); }); /* a phone's address bar hiding is not a resize worth jumping for */
  }
  /* links added on this device into seed families (a child or a parent of a researched person) */
  const _model = model;
  model = function () { const M = _model(), loc = local(); for (const k of loc.links || []) { const f = M.F[k.fam]; if (!f) continue; if (k.child && !f.children.includes(k.child)) f.children.push(k.child); if (k.partner && !f.partners.includes(k.partner)) f.partners.push(k.partner); } addGhosts(M); return M; };

  /* ------------------------------------------------------------------ everyone has a mother and a father
     Every person with an unknown parent gets one, inferred (owner, 2026-11-24: "do your own inferred placeholder. Everyone has a mom and
     dad"): a dashed card for the near generations, a "+ mother and father" stub above the oldest ones (a tap shows them). An inferred
     parent carries only what follows from the records or from what you said (a surname from the child's birth name, a birth window
     from the child's birth year); name one and it becomes yours, saved on this device and in the GEDCOM export. */
  const OPEN_GEN = 4;
  function gensFrom(M) { const g = { [L.root]: 0 }; let cur = [L.root]; while (cur.length) { const nx = []; for (const pid of cur) { const f = parentsOf(M, pid); if (f) for (const q of f.partners) if (g[q] == null) { g[q] = g[pid] + 1; nx.push(q); } } cur = nx; } return g; }
  const birthYear = (M, p) => { const b = L.events.find((e) => e.who.includes(p.id) && e.type === "birth"); const y = b ? +b.date.sort.slice(0, 4) : +(String(p.born_local || "").match(/\d{4}/) || [0])[0]; return y || null; };
  function addGhosts(M) {
    const loc = local(), gen = gensFrom(M); M.stubs = [];
    for (const p of M.people.filter((x) => !x.ghost && gen[x.id] != null)) {
      const f = parentsOf(M, p.id); if (f && f.uncertain && f.uncertain[p.id]) continue; /* Barbara: who her parents are is the open question (C10) */
      const have = f ? f.partners.map((q) => M.P[q]).filter(Boolean) : [];
      const needF = !have.some((q) => q.sex === "M") && !(have.length === 2), needM = !have.some((q) => q.sex === "F") && !(have.length === 2);
      if (!needF && !needM) continue;
      if (gen[p.id] >= OPEN_GEN && !ui.expand.has(p.id)) { M.stubs.push(p.id); continue; }
      let fam = f; if (!fam) { fam = { id: "GF-" + p.id, partners: [], children: [p.id], events: [], ghost: true, uncertain: {} }; M.families.push(fam); M.F[fam.id] = fam; }
      for (const role of [needF && "father", needM && "mother"].filter(Boolean)) {
        const id = `G-${p.id}-${role}`, n = loc.names[id] || {}, named = !!(n.given || n.surname), kn = (L.known || {})[id] || {};
        const g = { id, ghost: true, of: p.id, role, sex: role === "father" ? "M" : "F", status: named ? "named" : "inferred", placeholder: `${p.id === L.root ? "Your" : firstName(p) + "'s"} ${role}`,
          names: named ? [{ given: n.given || "", surname: n.surname || "", type: "birth", local: true }] : [], hint: kn.hint, infer: (kn.facts || []).concat(inferFor(M, p, role)) };
        if (n.born) g.born_local = n.born; if (n.note) g.note_local = n.note;
        M.people.push(g); M.P[id] = g; if (role === "father") fam.partners.unshift(id); else fam.partners.push(id);
      }
    }
  }
  function inferFor(M, p, role) {
    const out = [], who = p.id === L.root ? "you" : firstName(p), bn = (p.names || []).find((n) => n.type === "birth" || n.type === "as-given" || n.type === "preferred");
    if (role === "father" && bn && bn.surname && !(L.known || {})[`G-${p.id}-father`]) out.push(bn.type === "as-given" ? `If ${bn.surname} is ${who}'s surname at birth, he was a ${bn.surname}.` : `${who === "you" ? "You were" : who + " was"} born a ${bn.surname}, so he was most likely a ${bn.surname}.`);
    if (role === "mother") out.push(`Her surname at birth is not known; ${who === "you" ? "your" : who + "'s"} birth certificate gives it.`);
    const y = birthYear(M, p);
    if (y) out.push(`Born about ${y - 45} to ${y - 16} (a parent is usually 16 to 45 at a child's birth; ${who} was born in ${y}). An estimate, not a record.`);
    else { const kid = familiesOf(M, p.id).flatMap((f) => f.children).map((c) => M.P[c]).find((c) => c && birthYear(M, c)); if (kid) { const c = birthYear(M, kid); out.push(`Born about ${c - 90} to ${c - 32}: two generations before ${firstName(kid)} (born ${c}). An estimate, not a record.`); } }
    out.push(`${who === "you" ? "Your" : who + "'s"} birth or marriage record names both parents.`);
    return out;
  }
  window.KIN_LINEAGE_UI = { model: () => model(), layout: () => layout(model()), gedcom, pick: (pid) => { const d = document.querySelector("#ln-dossier"); if (d) { ui.sel = pid; drawTree(document.querySelector("#ln-tree")); dossier(d, pid); } } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
