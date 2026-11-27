/* Kin · kinship (Claude, 2026-11-26): what anyone in the tree is to you, worked out from the families alone, for both the plain
   tree (lineage.js) and the tree in three dimensions (tree/core.js). Owner, 2026-11-26: the tree showed his ancestors but not his
   daughter, his sisters, his mother's ex-husband or his great-grandmother's other children. Blood relatives are named by the
   nearest ancestor shared with you (how far up from you, how far down to them): parent, child, sister or half-sister, aunt,
   niece, great-aunt, first cousin once removed. Anyone else is named through the relative they married ("Your mother's
   ex-husband"); a family marked `ended` makes the partner an ex, and one marked `unmarried` a partner rather than a husband or wife. window.KinKinship.make(families, people, root) -> { rel, blood }. */
(function () {
  "use strict";
  const great = (k) => (k <= 0 ? "" : k === 1 ? "great-" : k === 2 ? "great-great-" : `${k}× great-`);
  const ORD = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  const TIMES = ["", "once", "twice", "three times", "four times", "five times", "six times", "seven times", "eight times", "nine times", "ten times"];

  function make(families, people, root) {
    const P = Array.isArray(people) ? Object.fromEntries(people.map((p) => [p.id, p])) : people;
    const pf = {};
    for (const f of families) for (const c of f.children || []) if (!pf[c]) pf[c] = f;
    const parents = (id) => (pf[id] ? pf[id].partners.filter((q) => P[q]) : []);
    const ups = (id) => {
      const d = { [id]: 0 }; let cur = [id];
      while (cur.length) { const nx = []; for (const x of cur) for (const q of parents(x)) if (d[q] == null) { d[q] = d[x] + 1; nx.push(q); } cur = nx; }
      return d;
    };
    /* ancestors reached through an adoption (a family's `adopted` list): kin through them is "by adoption" */
    const viaAdopt = (id) => {
      const s = new Set(), seen = new Set([id]); let cur = [[id, false]];
      while (cur.length) { const nx = []; for (const [x, f] of cur) { const fam = pf[x]; if (!fam) continue; const ad = f || (fam.adopted || []).includes(x);
        for (const q of fam.partners) if (P[q] && !seen.has(q)) { seen.add(q); if (ad) s.add(q); nx.push([q, ad]); } } cur = nx; }
      return s;
    };
    const R = ups(root), RA = viaAdopt(root);
    /* which of your parents an ancestor is reached through: "your father's side" or "your mother's side" */
    const sideOf = {};
    for (const p of parents(root)) { const u = ups(p); for (const a in u) if (!sideOf[a]) sideOf[a] = P[p].sex === "F" ? "your mother's side" : "your father's side"; }
    const sx = (id, m, f, n) => (P[id] && P[id].sex === "F" ? f : P[id] && P[id].sex === "M" ? m : n);
    const BL = {};
    function blood(id) {
      if (BL[id] !== undefined) return BL[id];
      if (id === root) return (BL[id] = { g: 0, d: 0, via: root, text: "You" });
      const T = ups(id); let b = null;
      for (const a in T) if (R[a] != null) { const g = R[a], d = T[a]; if (!b || g + d < b.g + b.d || (g + d === b.g + b.d && g < b.g)) b = { g, d, via: a }; }
      if (!b) return (BL[id] = null);
      const { g, d } = b; let t;
      if (d === 0) t = g === 1 ? sx(id, "Your father", "Your mother", "Your parent") : g === 2 ? sx(id, "Your grandfather", "Your grandmother", "Your grandparent") : `Your ${great(g - 2)}${sx(id, "grandfather", "grandmother", "grandparent")}`;
      else if (g === 0) t = d === 1 ? sx(id, "Your son", "Your daughter", "Your child") : d === 2 ? sx(id, "Your grandson", "Your granddaughter", "Your grandchild") : `Your ${great(d - 2)}${sx(id, "grandson", "granddaughter", "grandchild")}`;
      else if (g === 1 && d === 1) {
        /* a sister through one parent is still a sister (owner: "my two sisters"); which parent is said beside it */
        const a = parents(root), c = parents(id), shared = a.filter((q) => c.includes(q));
        const one = shared.length === 1 && a.length > 1 ? shared[0] : null;
        t = `Your ${sx(id, "brother", "sister", "sibling")}${one ? ` (your ${P[one].sex === "F" ? "mother" : "father"}'s ${sx(id, "son", "daughter", "child")})` : ""}`;
      } else if (g === 1) t = `Your ${great(d - 2)}${sx(id, "nephew", "niece", "nephew or niece")}`;
      else if (d === 1) t = `Your ${great(g - 2)}${sx(id, "uncle", "aunt", "aunt or uncle")}`;
      else { const k = Math.min(g, d) - 1, r = Math.abs(g - d); t = `Your ${ORD[k] || k + "th"} cousin${r ? `, ${TIMES[r] || r + " times"} removed` : ""}`; }
      return (BL[id] = { g, d, via: b.via, text: t, side: g >= 2 ? sideOf[b.via] || "" : "", adopt: RA.has(b.via) || viaAdopt(id).has(b.via) });
    }
    const RL = {}, sub = {};
    let near = null;
    function rel(id, opts) {
      const withSide = !opts || opts.side !== false;
      const key = id + (withSide ? "+" : "-");
      if (RL[key] != null) return RL[key];
      const b = blood(id);
      if (b) { const note = [withSide ? b.side : "", b.adopt ? "by adoption" : ""].filter(Boolean).join(", "); return (RL[key] = note ? `${b.text} (${note})` : b.text); }
      /* by marriage: the partner of someone who is family */
      for (const f of families) {
        if (!f.partners.includes(id)) continue;
        for (const q of f.partners) {
          if (q === id || !P[q]) continue;
          const ex = f.ended ? "ex-" : "", w = f.unmarried ? "partner" : sx(id, "husband", "wife", "partner");
          if (q === root) return (RL[key] = `Your ${ex}${w}`);
          const qb = blood(q);
          /* "Your aunt's husband", but "Wife of your first cousin, twice removed" where a possessive would read badly */
          if (qb) return (RL[key] = (qb.text.includes(",") ? `${(ex + w)[0].toUpperCase()}${(ex + w).slice(1)} of ${qb.text.replace(/^Your /, "your ")}` : `${qb.text}'s ${ex}${w}`) + (withSide && qb.side ? ` (${qb.side})` : "")); /* which aunt: your father's sister's husband or your mother's sister's */
        }
      }
      /* a child of your partner: a stepchild */
      const pr = parents(id);
      for (const f of families) if (f.partners.includes(root)) for (const q of f.partners) if (q !== root && pr.includes(q)) return (RL[key] = `Your ${sx(id, "stepson", "stepdaughter", "stepchild")}`);
      /* family of your half-sister or your child on their other side (owner, 27 Nov: Jeffrey Hinkle's parents and siblings):
         named through them, "Grandfather of your sisters Jessica and Samantha" */
      if (!near) { near = []; for (const x in P) { const b = blood(x); if (b && ((b.g === 1 && b.d === 1) || (b.g === 0 && b.d === 1))) near.push(x); } }
      const by = {};
      for (const x of near) {
        if (!sub[x]) sub[x] = make(families, P, x);
        const t = sub[x].blood(id); if (!t || t.g + t.d === 0) continue;
        const role = blood(x).g === 1 ? sx(x, "brother", "sister", "sibling") : sx(x, "son", "daughter", "child"), k = t.text.replace(/^Your /, "") + "|" + role;
        (by[k] = by[k] || []).push(x);
      }
      const best = Object.keys(by).sort((a, b) => by[b].length - by[a].length)[0];
      if (best) {
        const [what, role] = best.split("|"), xs = by[best], first = (x) => { const n = (P[x].names || []).find((y) => y.given); return n ? n.given.split(" ")[0] : x; };
        const names = xs.length > 1 ? xs.slice(0, -1).map(first).join(", ") + " and " + first(xs[xs.length - 1]) : first(xs[0]);
        return (RL[key] = `${what[0].toUpperCase()}${what.slice(1)} of your ${role}${xs.length > 1 ? "s" : ""} ${names}`);
      }
      /* the later wife or husband of a relative's parent: "Stepmother of your uncle Michael" */
      for (const f of families) {
        if (!f.partners.includes(id)) continue;
        for (const q of f.partners) {
          if (q === id) continue;
          for (const g of families) if (g.partners.includes(q) && !g.partners.includes(id)) for (const c of g.children || []) {
            const cb = blood(c); if (!cb || c === root || cb.text.includes(",")) continue;
            const n = (P[c].names || []).find((y) => y.given), who = n ? " " + n.given.split(" ")[0] : "";
            return (RL[key] = `${sx(id, "Stepfather", "Stepmother", "Step-parent")} of ${cb.text.replace(/^Your /, "your ")}${who}` + (withSide && cb.side ? ` (${cb.side})` : ""));
          }
        }
      }
      return (RL[key] = "");
    }
    return { rel, blood, parents };
  }
  window.KinKinship = { make };
})();
