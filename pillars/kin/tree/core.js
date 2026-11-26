/* Kin · the family tree in three dimensions (owner, 2026-11-24: "redesign the entire project from the ground up ... a worldclass
   aaa flagship interactive design with 3d graphics and motion. Clickable with media and data integrated").
   core.js: the model and the layout. Nothing here is drawn; main.js and globe.js draw it.

   The space: you stand at the centre of the present (the surface, 2026). Each generation back is one ring further out, and
   depth is time: a person sits at the year they were born, with a lifeline rising to the year they died. A child's birth is
   a bridge to both parents' lifelines at that same year, so every bridge shows how old the parents were. Angles are shared
   out by how much is known above each person (a weighted fan), so a well-researched line gets room and an unknown one still
   has its place. The data is the research record (pillars/kin/lineage/data.js) through the same model the plain tree uses
   (window.KIN_LINEAGE_UI.model(): your own additions and the inferred parents included). */

export const L = window.KIN_LINEAGE;
export const NOW = 2026;
export const RS = 5.4; /* one generation, in world units */
export const TS = 0.17; /* one year of depth */
export const yOf = (year) => (year - NOW) * TS;
export const yearOf = (y) => Math.round(NOW + y / TS);

export const STATUS = {
  self: { c: "#fff6e4", t: "You" },
  proven: { c: "#f2cf7e", t: "Proven" },
  probable: { c: "#8fd3ea", t: "Probable" },
  possible: { c: "#b4a1f2", t: "Possible" },
  family: { c: "#8fe3bb", t: "From the family" },
  named: { c: "#f0b5d2", t: "Named by you" },
  inferred: { c: "#6c7b9d", t: "Not yet known" },
  placeholder: { c: "#6c7b9d", t: "To name" },
};
export const TYPE = { birth: "Born", emigration: "Left Europe", immigration: "Arrived", declaration: "Declared intention", draft: "Draft registration", enlistment: "Enlisted", service: "Service", naturalization: "Naturalized", discharge: "Discharged", residence: "Lived", marriage: "Married", occupation: "Worked", death: "Died", burial: "Buried", will: "Made a will" };
export const KIND = { original: "Original", derivative: "Derivative", authored: "Authored" };
export const INFO = { primary: "Primary", secondary: "Secondary", undetermined: "Undetermined" };
export const EV = { direct: "Direct", indirect: "Indirect", negative: "Negative" };

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const nm = (p) => { const n = (p.names || []).find((x) => x.given || x.surname); return n ? `${n.given || ""} ${n.surname || ""}`.trim() : p.placeholder || "Unnamed"; };
export const firstName = (p) => { const n = (p.names || []).find((x) => x.given || x.surname); return n ? (n.given || n.surname).split(" ")[0] : p.placeholder || "Unnamed"; };
export const known = (p) => p && !(p.ghost && p.status === "inferred");
export const initials = (p) => {
  if (!known(p)) return "?";
  const n = (p.names || []).find((x) => x.given || x.surname) || {};
  return ((n.given || "").trim()[0] || "") + ((n.surname || "").trim()[0] || "");
};

/* years: a record first (birth, death or burial event), then the compiled trees' dates written in the summary, then estimates */
function yearsOf(p) {
  const ev = L.events.filter((e) => e.who.includes(p.id));
  const yr = (e) => (e && e.date && e.date.sort ? +e.date.sort.slice(0, 4) : null);
  const b = ev.find((e) => e.type === "birth"), d = ev.find((e) => e.type === "death"), bu = ev.find((e) => e.type === "burial");
  let by = yr(b), dy = yr(d) || yr(bu), bq = by ? "record" : null, dq = dy ? "record" : null;
  const s = p.summary || "";
  if (!by) {
    const m = s.match(/(?:about\s+)?(\d{4})(?:\s*\([^)]*\))?\s+to\s+(?:about\s+|before\s+\w+\s+)?(\d{4})/i);
    if (m) { by = +m[1]; bq = "tree"; if (!dy) { dy = +m[2]; dq = "tree"; } }
  }
  if (!by) {
    const m = s.match(/born (?:about |in |c\. )?(\d{4})(?:\s*-\s*(\d{4}))?/i) || s.match(/\babout (\d{4})\b/i);
    if (m) { by = m[2] ? Math.round((+m[1] + +m[2]) / 2) : +m[1]; bq = "tree"; }
  }
  if (!by && p.born_est) { const m = String(p.born_est.text || p.born_est).match(/\d{4}/); if (m) { by = +m[0]; bq = "estimate"; } }
  if (!by && p.born_local) { const m = String(p.born_local).match(/\d{4}/); if (m) { by = +m[0]; bq = "yours"; } }
  return { by, dy, bq, dq };
}

export function build() {
  const M = window.KIN_LINEAGE_UI.model();
  const P = M.P;
  const famOf = {}; /* the family a person is a child of */
  for (const f of M.families) for (const c of f.children) if (!famOf[c]) famOf[c] = f;
  const parents = (id) => { const f = famOf[id]; return f ? f.partners.filter((q) => P[q]).sort((a, b) => (P[a].sex === "M" ? 0 : 1) - (P[b].sex === "M" ? 0 : 1)) : []; };
  const unsure = (id) => { const f = famOf[id]; return !!(f && f.uncertain && f.uncertain[id]); };
  const spouses = (id) => M.families.filter((f) => f.partners.includes(id)).flatMap((f) => f.partners.filter((q) => q !== id && P[q]));
  const children = (id) => M.families.filter((f) => f.partners.includes(id)).flatMap((f) => f.children.filter((c) => P[c]));
  const siblings = (id) => { const f = famOf[id]; return f ? f.children.filter((c) => c !== id && P[c]) : []; };

  /* generations and Ahnentafel numbers: you are 1, a father 2n, a mother 2n+1 */
  const gen = { [L.root]: 0 }, ahn = { [L.root]: 1 };
  let cur = [L.root];
  while (cur.length) {
    const nx = [];
    for (const id of cur) for (const q of parents(id)) if (gen[q] == null) { gen[q] = gen[id] + 1; ahn[q] = 2 * ahn[id] + (P[q].sex === "F" ? 1 : 0); nx.push(q); }
    cur = nx;
  }
  const side = (id) => { let n = ahn[id]; if (!n || n === 1) return "self"; while (n > 3) n >>= 1; return n === 2 ? "pat" : "mat"; };
  const sideVia = (id) => { let cur = id; for (let i = 0; i < 12 && cur; i++) { if (gen[cur] != null) return side(cur); const q = pos[cur]; cur = q && q.rel ? q.rel.of : null; } return "self"; };

  /* years, then estimates for everyone without one: from children first, then from parents */
  const Y = {};
  for (const p of M.people) Y[p.id] = yearsOf(p);
  for (let it = 0; it < 6; it++) {
    for (const p of M.people) {
      const y = Y[p.id]; if (y.by) continue;
      const kids = children(p.id).map((c) => Y[c] && Y[c].by).filter(Boolean);
      if (kids.length) { y.by = Math.min(...kids) - (p.sex === "F" ? 26 : 29); y.bq = "estimate"; continue; }
      const ps = parents(p.id).map((q) => Y[q] && Y[q].by).filter(Boolean);
      if (ps.length && it > 1) { y.by = Math.max(...ps) + 27; y.bq = "estimate"; continue; }
      const sb = siblings(p.id).map((c) => Y[c] && Y[c].by).filter(Boolean);
      if (sb.length && it > 2) { y.by = sb[0] + 2; y.bq = "estimate"; continue; }
      const sp = spouses(p.id).map((c) => Y[c] && Y[c].by).filter(Boolean);
      if (sp.length && it > 2) { y.by = sp[0] + (p.sex === "F" ? 2 : -2); y.bq = "estimate"; }
    }
  }
  for (const p of M.people) {
    const y = Y[p.id];
    if (!y.by) y.by = NOW - 40, y.bq = "estimate";
    if (y.by > NOW - 1) y.by = NOW - 3, y.bq = "estimate";
    if (p.living || p.id === L.root) { y.dy = NOW; y.dq = "living"; }
    else if (!y.dy) { y.dy = Math.min(NOW, y.by + 72); y.dq = "estimate"; }
    y.dy = Math.max(y.dy, y.by + 1);
  }

  /* the weighted fan: a person's angular room is what is known above them */
  const W = {};
  const up = (id) => parents(id).filter((q) => gen[q] === gen[id] + 1);
  const weight = (id) => { if (W[id] != null) return W[id]; const ps = up(id); return (W[id] = ps.length ? ps.reduce((s, q) => s + weight(q), 0) : P[id].ghost ? 0.75 : 1); };
  const pos = {};
  const place = (id, a0, a1) => {
    const g = gen[id], th = (a0 + a1) / 2, r = RS * (g <= 4 ? g : 4 + (g - 4) * 0.62); /* the far generations closer together, so the tree holds together */
    pos[id] = { th, r, span: a1 - a0 };
    const ps = up(id), tot = ps.reduce((s, q) => s + weight(q), 0);
    let a = a0;
    for (const q of ps) { const sp = id === L.root && ps.length === 2 ? (a1 - a0) / 2 : ((a1 - a0) * weight(q)) / tot; place(q, a, a + sp); a += sp; } /* your father's side and your mother's side each get half */
  };
  const A0 = Math.PI / 2; /* your father's line on the left half, your mother's on the right */
  place(L.root, A0, A0 + 2 * Math.PI);

  /* everyone else beside the one they belong to: siblings just inside, partners just outside */
  for (let it = 0; it < 4; it++) {
    for (const p of M.people) {
      if (pos[p.id]) continue;
      const sib = siblings(p.id).find((s) => pos[s] && gen[s] != null);
      if (sib) {
        const s = pos[sib], g = Math.max(1, gen[sib]), k = siblings(sib).filter((x) => !gen[x] && x !== p.id && pos[x]).length + 1;
        const off = Math.min(0.42, Math.max(0.1, s.span * 0.28)) * (k % 2 ? 1 : -1) * Math.ceil(k / 2) / Math.max(1, g * 0.55);
        pos[p.id] = { th: s.th + off, r: Math.max(2.2, s.r - 1.5), span: 0, rel: { kind: "sibling", of: sib } }; continue;
      }
      const sp = spouses(p.id).find((s) => pos[s]);
      if (sp) { const s = pos[sp], g = Math.max(1, gen[sp] || 1); pos[p.id] = { th: s.th + 0.22 / g, r: s.r + 1.8, span: 0, rel: { kind: "spouse", of: sp } }; continue; }
      /* a child of someone already placed (owner, 2026-11-26: his daughter, his half-sisters, his great-grandmother's other
         children and theirs): one step inside the parent, the children fanned out beside each other */
      const par = parents(p.id).find((q) => pos[q]);
      if (par) {
        const s = pos[par], k = children(par).filter((c) => c !== p.id && pos[c] && pos[c].rel && pos[c].rel.kind === "child").length;
        const off = (k % 2 ? -1 : 1) * Math.ceil(k / 2) * (s.r > 1 ? 0.5 / s.r : 0.9);
        pos[p.id] = s.r > 1 ? { th: s.th + 0.12 / Math.max(1, s.r / RS) + off, r: Math.max(1.4, s.r - 1.6), span: 0, rel: { kind: "child", of: par } }
          : { th: Math.PI / 2 + Math.PI + off, r: 1.8, span: 0, rel: { kind: "child", of: par } }; /* your own children: just in front of you */
        continue;
      }
      const kid = children(p.id).find((c) => pos[c]);
      if (kid) { const s = pos[kid]; pos[p.id] = { th: s.th + 0.15, r: s.r + RS, span: 0, rel: { kind: "parent", of: kid } }; }
    }
  }

  const nodes = [], byId = {};
  for (const p of M.people) {
    const q = pos[p.id]; if (!q) continue;
    const y = Y[p.id], g = gen[p.id];
    const n = {
      id: p.id, p, gen: g != null ? g : null, ahn: ahn[p.id] || null, side: g != null ? side(p.id) : sideVia(p.id),
      th: q.th, r: q.r, x: q.r * Math.cos(q.th), z: q.r * Math.sin(q.th), y: yOf(y.by), by: y.by, dy: y.dy, bq: y.bq, dq: y.dq,
      ghost: !!p.ghost, status: p.id === L.root ? "self" : p.status || "possible", rel: q.rel || null, ancestor: g != null,
    };
    n.size = n.id === L.root ? 2.5 : n.ghost ? 1.05 : n.ancestor ? Math.max(1.25, 2.15 - g * 0.12) : 1.15;
    nodes.push(n); byId[n.id] = n;
  }

  /* links: a child's birth reaches both parents' lifelines at that year */
  const CERT = Object.fromEntries((L.certainty || []).map((c) => [c.child, c]));
  for (const n of nodes) n.cert = CERT[n.id] || null;
  const links = [];
  for (const n of nodes) for (const q of parents(n.id)) if (byId[q]) links.push({ child: n.id, parent: q, unsure: unsure(n.id) || (CERT[n.id] && CERT[n.id].pct < 50), ghost: byId[q].ghost, cert: CERT[n.id] ? CERT[n.id].pct : null });
  const stubs = (M.stubs || []).filter((id) => byId[id]);
  const rMax = Math.max(...nodes.map((n) => n.r)) + 4, yMin = Math.min(...nodes.map((n) => n.y));

  /* who they are to you */
  const great = (k) => (k <= 0 ? "" : k <= 2 ? "great-".repeat(k) : `${k}× great-`);
  const KIN = window.KinKinship ? window.KinKinship.make(M.families, P, L.root) : null;
  const rel = (id) => {
    const n = byId[id]; if (!n) return "";
    const p = n.p, f = p.sex === "F";
    if (id === L.root) return "You";
    if (n.ghost) return p.placeholder || "Not yet known";
    if (n.ancestor) {
      const g = n.gen, sd = n.side === "pat" ? "your father's side" : "your mother's side";
      if (g === 1) return f ? "Your mother" : "Your father";
      if (g === 2) return (f ? "Your grandmother" : "Your grandfather") + ", " + sd;
      return `Your ${great(g - 2)}${f ? "grandmother" : "grandfather"}, ${sd}`;
    }
    if (KIN) { const r = KIN.rel(id); if (r) return r; }
    if (n.rel && n.rel.kind === "sibling") {
      const a = byId[n.rel.of], g = a ? a.gen : 0;
      if (g === 0) return f ? "Your sister" : "Your brother";
      if (g === 1) return f ? "Your aunt" : "Your uncle";
      return `Your ${great(g - 2)}${g >= 2 ? "grand" : ""}${f ? "aunt" : "uncle"}`.replace("grandaunt", "great-aunt").replace("granduncle", "great-uncle");
    }
    if (n.rel && n.rel.kind === "spouse") { const a = byId[n.rel.of]; return a ? `${firstName(a.p)}'s ${f ? "wife" : "husband"}` : ""; }
    return "";
  };

  /* every picture of or about a person: their own media, then every record image cited in their events or names */
  const media = (id) => {
    const out = [], seen = new Set();
    const push = (img, src, cap) => { if (seen.has(img)) return; seen.add(img); out.push({ img, src, cap }); };
    for (const m of L.media || []) if (m.person === id || (m.people || []).includes(id)) push(m.img, m.src, m.caption);
    const srcs = new Set();
    for (const e of L.events) if (e.who.includes(id)) for (const a of e.assert || []) srcs.add(a.src);
    for (const nmx of (P[id] && P[id].names) || []) for (const s of nmx.src || []) srcs.add(s);
    for (const c of L.conflicts) if (c.person === id) for (const a of c.assert || []) srcs.add(a.src);
    const S = Object.fromEntries(L.sources.map((s) => [s.id, s]));
    [...srcs].map((s) => S[s]).filter((s) => s && s.img).sort((a, b) => (a.year || 9999) - (b.year || 9999)).forEach((s) => s.img.forEach((im) => push(im, s.id, s.short)));
    return out;
  };
  const faceOf = (id) => { const m = (L.media || []).find((x) => x.person === id && x.face); return m ? m.face : null; };

  return { M, P, nodes, byId, links, stubs, gen, ahn, parents, children, spouses, siblings, unsure, rel, media, faceOf, rMax, yMin, Y };
}

/* the line from you to a person (both ends included): the path that lights up when they are chosen */
export function pathTo(T, id) {
  const out = new Set([id]);
  const walk = (cur) => { if (cur === L.root) return true; for (const c of T.children(cur)) if (T.byId[c] && T.byId[c].ancestor && T.byId[c].gen === T.byId[cur].gen - 1 && walk(c)) { out.add(c); return true; } return false; };
  const n = T.byId[id];
  if (n && n.ancestor) walk(id);
  else if (n && n.rel) { out.add(n.rel.of); const m = T.byId[n.rel.of]; if (m && m.ancestor) for (const x of pathTo(T, n.rel.of)) out.add(x); }
  return out;
}

/* how much is known, for the research view: of the 254 places in seven generations, how many have a name */
export function completeness(T) {
  const rows = [];
  for (let g = 1; g <= 7; g++) {
    const all = 2 ** g;
    const have = T.nodes.filter((n) => n.ancestor && n.gen === g && known(n.p)).length;
    rows.push({ g, all, have });
  }
  return rows;
}
