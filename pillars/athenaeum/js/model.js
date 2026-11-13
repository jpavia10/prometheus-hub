/* Athenaeum model. Pure functions, no DOM, no storage: how ideas relate (shared tags and shared words, worked out on this
   device), where each one sits in the sky, what the sky looked like on any past day, where a record came from, and the chronicle's
   years. Nothing here changes an idea: the stored records stay exactly as they were kept. */

const STOP = new Set(("about above after again against also among because been before being below between both cannot could does doing down during " +
  "each from further have having here into itself just more most much must only other over same should some such than that their them then there " +
  "these they this those through under until very were what when where which while with would your yours onto upon like well even ever every " +
  "across around within without rather toward towards whose whom shall will might want wants make makes made many thing things something " +
  "around system systems using used uses based instead including include includes become becomes rather simply everything whole time need needs work works " +
  "think place defined separate request requests keep kept part parts want take taken give given first second third next last still always never").split(" "));

/** Words worth comparing: lower case, four letters or more, plural s dropped. */
export function terms(text) {
  const out = [];
  for (let w of String(text || "").toLowerCase().match(/[a-z][a-z0-9']{3,}/g) || []) {
    w = w.replace(/'s$/, "").replace(/[^a-z0-9]/g, "");
    if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) w = w.slice(0, -1);
    if (w.length >= 4 && !STOP.has(w)) out.push(w);
  }
  return out;
}

/** One weighted word vector per idea (title counts three times, the idea twice, each refinement once), length 1. */
export function vectors(ideas) {
  const docs = ideas.map((i) => {
    const tf = new Map(); const add = (txt, w) => { for (const t of terms(txt)) tf.set(t, (tf.get(t) || 0) + w); };
    add(i.title, 3); add(i.body, 2); for (const c of i.chain || []) add(c.text, 1); return tf;
  });
  const df = new Map(); for (const d of docs) for (const t of d.keys()) df.set(t, (df.get(t) || 0) + 1);
  const n = docs.length;
  return docs.map((d) => {
    const v = new Map(); let norm = 0;
    for (const [t, f] of d) { const w = (1 + Math.log(f)) * Math.log((n + 1) / ((df.get(t) || 0) + 0.5)); if (w > 0) { v.set(t, w); norm += w * w; } }
    norm = Math.sqrt(norm) || 1; for (const [t, w] of v) v.set(t, w / norm); return v;
  });
}

/** Every pair that has something in common, with the reason kept: the shared tags, the shared words, a link made by hand. */
export function relate(ideas) {
  const vec = vectors(ideas), edges = [];
  for (let a = 0; a < ideas.length; a++) for (let b = a + 1; b < ideas.length; b++) {
    const A = ideas[a], B = ideas[b], ta = new Set(A.tags || []), tb = B.tags || [];
    const tags = tb.filter((t) => ta.has(t));
    const tagScore = tags.length ? tags.length / Math.sqrt(Math.max(1, ta.size) * Math.max(1, tb.length)) : 0;
    let cos = 0; const shared = []; const [small, big] = vec[a].size < vec[b].size ? [vec[a], vec[b]] : [vec[b], vec[a]];
    for (const [t, w] of small) { const w2 = big.get(t); if (w2) { cos += w * w2; shared.push([t, w * w2]); } }
    shared.sort((x, y) => y[1] - x[1]);
    const linked = (A.links || []).includes(B.id) || (B.links || []).includes(A.id);
    const w = Math.min(1, 0.6 * tagScore + 0.9 * cos + (linked ? 0.6 : 0));
    if (w > 0.03) edges.push({ a, b, w, cos, tags, terms: shared.slice(0, 4).map((x) => x[0]), linked });
  }
  return edges.sort((x, y) => y.w - x.w);
}

/** The lines worth drawing: each idea keeps its strongest ties (at most k), plus every link made by hand. */
export function skeleton(n, edges, k = 2, min = 0.07) {
  const count = new Array(n).fill(0), keep = new Set();
  for (const e of edges) if (e.linked) keep.add(e);
  for (let i = 0; i < n; i++) {
    let got = 0;
    for (const e of edges) { if (got >= k) break; if ((e.a === i || e.b === i) && e.w >= min) { keep.add(e); got++; } }
    count[i] = got;
  }
  return edges.filter((e) => keep.has(e));
}

/** Constellations: every idea joins its single strongest tie; what ends up connected is one constellation, named by its commonest tag. */
export function clusters(ideas, edges) {
  const n = ideas.length, parent = ideas.map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const best = new Array(n).fill(null);
  for (const e of edges) { if (!best[e.a]) best[e.a] = e; if (!best[e.b]) best[e.b] = e; }
  for (let i = 0; i < n; i++) if (best[i] && best[i].w >= 0.1) parent[find(best[i].a)] = find(best[i].b);
  const groups = new Map(); for (let i = 0; i < n; i++) { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); }
  const used = new Set(); const nice = (t) => (t.length <= 3 ? t.toUpperCase() : t.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()));
  const list = [...groups.values()].sort((x, y) => y.length - x.length || x[0] - y[0]).map((members) => {
    const tally = new Map(); for (const i of members) for (const t of ideas[i].tags || []) tally.set(t, (tally.get(t) || 0) + 1);
    const ranked = [...tally.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
    const pick = ranked.find(([t]) => !used.has(t)) || ranked[0]; const tag = pick ? pick[0] : "";
    if (tag) used.add(tag);
    return { members, tag, name: tag ? nice(tag) : "Unsorted" };
  });
  const of = new Array(n).fill(0); list.forEach((c, k) => { c.index = k; for (const i of c.members) of[i] = k; });
  return { list, of };
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

/** Where each idea sits: related ideas pull together, all push apart, the same ideas always give the same sky. Radius 1. */
export function layout(ideas, edges) {
  const n = ideas.length; if (!n) return [];
  if (n === 1) return [[0, 0, 0]];
  const P = ideas.map((i, k) => { const key = String(i.id || i.title || k), u = hash(key + "a") * 2 - 1, th = hash(key + "b") * 6.2832, r = Math.sqrt(Math.max(0, 1 - u * u)) * 0.85; return [Math.cos(th) * r, u * 0.85, Math.sin(th) * r]; });   // each idea starts from its own place, so a new one barely moves the rest
  const steps = n > 300 ? 120 : n > 120 ? 220 : 420;
  for (let s = 0; s < steps; s++) {
    const cool = 0.06 * (1 - s / steps) + 0.004, F = P.map(() => [0, 0, 0]);
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      let dx = P[a][0] - P[b][0], dy = P[a][1] - P[b][1], dz = P[a][2] - P[b][2]; const d2 = dx * dx + dy * dy + dz * dz + 0.0004, d = Math.sqrt(d2), f = 0.5 / d2 / n * 4;
      dx /= d; dy /= d; dz /= d; F[a][0] += dx * f; F[a][1] += dy * f; F[a][2] += dz * f; F[b][0] -= dx * f; F[b][1] -= dy * f; F[b][2] -= dz * f;
    }
    for (const e of edges) {
      const a = e.a, b = e.b; let dx = P[b][0] - P[a][0], dy = P[b][1] - P[a][1], dz = P[b][2] - P[a][2]; const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const rest = 0.95 - 0.7 * e.w, f = (d - rest) * e.w * 1.6; dx /= d; dy /= d; dz /= d;
      F[a][0] += dx * f; F[a][1] += dy * f; F[a][2] += dz * f; F[b][0] -= dx * f; F[b][1] -= dy * f; F[b][2] -= dz * f;
    }
    for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) { F[i][k] -= P[i][k] * 0.35; const m = Math.max(-1, Math.min(1, F[i][k])); P[i][k] += m * cool; } }
  }
  let cx = 0, cy = 0, cz = 0; for (const p of P) { cx += p[0]; cy += p[1]; cz += p[2]; } cx /= n; cy /= n; cz /= n;
  let max = 1e-6; for (const p of P) { p[0] -= cx; p[1] -= cy; p[2] -= cz; p[1] *= 0.72; max = Math.max(max, Math.hypot(p[0], p[1], p[2])); }
  for (const p of P) { p[0] /= max; p[1] /= max; p[2] /= max; }
  return P;
}

const DAY = 864e5, at = (d) => new Date(String(d).slice(0, 10) + "T12:00:00").getTime();
/** The span the time slider covers: the first spark to today. */
export function span(ideas, today) {
  let lo = at(today); for (const i of ideas) { if (i.created && at(i.created) < lo) lo = at(i.created); for (const c of i.chain || []) if (c.date && at(c.date) < lo) lo = at(c.date); }
  const hi = Math.max(at(today), lo + DAY); return { lo: lo - DAY, hi, days: Math.round((hi - lo) / DAY) + 1 };
}
export const tOf = (sp, date) => Math.max(0, Math.min(1, (at(date) - sp.lo) / (sp.hi - sp.lo)));
export const dateAt = (sp, t) => new Date(sp.lo + t * (sp.hi - sp.lo)).toISOString().slice(0, 10);

/** Where a record came from. Typed here, or imported with its stated source; a refinement is the owner's when it says so or when the idea was typed. */
export function provenance(idea) {
  if (idea.origin === "typed" || (!idea.source && !/^imp/.test(String(idea.id || "")))) return { kind: "typed", label: "Typed by you on this device" };
  return { kind: "imported", label: "Imported" + (idea.source ? " · " + idea.source : "") };
}
export const refinementBy = (idea, c) => (c.by === "you" || provenance(idea).kind === "typed" ? "you" : "import");

/** Pillars an idea names in its own words (a mention, not a claim about the pillar). */
export function mentions(idea, pillars) {
  const text = [idea.title, idea.body, ...(idea.chain || []).map((c) => c.text)].join(" \n ");
  return pillars.filter((p) => p.id !== "athenaeum" && new RegExp("\\b" + p.name.split(" ")[0].replace(/[^A-Za-z]/g, "") + "\\b").test(text));
}

/** The first year in a written date: "c. 1200–1150 BCE" is -1200, "8th–9th centuries CE" is 750. */
export function parseYear(s) {
  const m = String(s || "").match(/(\d{1,4})(st|nd|rd|th)?/); if (!m) return null;
  let y = +m[1]; if (m[2]) y = (y - 1) * 100 + 50;
  return /BCE|B\.C\.|\bBC\b/.test(s) ? -y : y;
}

/** The chronicle as a spiral arm that winds in toward the present: oldest far out and low, newest close and high. */
export function arm(entries) {
  const list = entries.map((e) => ({ ...e, year: parseYear(e.date) })).sort((a, b) => (a.year ?? 0) - (b.year ?? 0)), n = list.length;
  list.forEach((e, i) => { const u = n > 1 ? i / (n - 1) : 1, ang = -u * Math.PI * 2 * 1.5 + 0.6, r = 2.35 - 0.95 * u; e.u = u; e.pos = [Math.cos(ang) * r, -1.45 + 1.15 * u, Math.sin(ang) * r]; });
  return list;
}

export function stats(ideas, shelf, chron) {
  const live = ideas.filter((i) => !i.archived);
  return { ideas: live.length, refinements: live.reduce((s, i) => s + (i.chain || []).length, 0), archived: ideas.length - live.length, shelf: shelf.length, chronicle: chron.length };
}
