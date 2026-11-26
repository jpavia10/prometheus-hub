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
    const R = ups(root);
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
      return (BL[id] = { g, d, via: b.via, text: t, side: g >= 2 ? sideOf[b.via] || "" : "" });
    }
    const RL = {};
    function rel(id, opts) {
      const withSide = !opts || opts.side !== false;
      const key = id + (withSide ? "+" : "-");
      if (RL[key] != null) return RL[key];
      const b = blood(id);
      if (b) return (RL[key] = withSide && b.side ? `${b.text} (${b.side})` : b.text);
      /* by marriage: the partner of someone who is family */
      for (const f of families) {
        if (!f.partners.includes(id)) continue;
        for (const q of f.partners) {
          if (q === id || !P[q]) continue;
          const ex = f.ended ? "ex-" : "", w = f.unmarried ? "partner" : sx(id, "husband", "wife", "partner");
          if (q === root) return (RL[key] = `Your ${ex}${w}`);
          const qb = blood(q);
          if (qb) return (RL[key] = `${qb.text}'s ${ex}${w}` + (withSide && qb.side ? ` (${qb.side})` : "")); /* which aunt: your father's sister's husband or your mother's sister's */
        }
      }
      /* a child of your partner: a stepchild */
      const pr = parents(id);
      for (const f of families) if (f.partners.includes(root)) for (const q of f.partners) if (q !== root && pr.includes(q)) return (RL[key] = `Your ${sx(id, "stepson", "stepdaughter", "stepchild")}`);
      return (RL[key] = "");
    }
    return { rel, blood, parents };
  }
  window.KinKinship = { make };
})();
