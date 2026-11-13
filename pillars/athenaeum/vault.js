/* Athenaeum vault logic (Sebastian, 2026-11-10): pure resurfacing + search. No DOM.
   window.VAULT = { pickResurface, search } */
(function () {
  "use strict";
  /** Ideas not resurfaced in 30+ days (or never), oldest spark first, up to n. */
  function pickResurface(ideas, today, n = 3) {
    const age = (d) => Math.round((new Date(today + "T12:00:00") - new Date(d + "T12:00:00")) / 864e5);
    return ideas.filter((i) => !i.archived && (i.lastResurfaced == null || age(i.lastResurfaced) >= 30))
      .sort((a, b) => a.created.localeCompare(b.created)).slice(0, n);
  }
  function search(items, q) {
    const s = String(q || "").toLowerCase(); if (!s) return items;
    return items.filter((i) => JSON.stringify(i).toLowerCase().includes(s));
  }
  const V = { pickResurface, search };
  if (typeof window !== "undefined") window.VAULT = V;
  if (typeof globalThis !== "undefined") globalThis.VAULT = V;
})();

/* Athenaeum import merge (Sebastian, 2026-11-10; ids kept since 2026-11-13): imports MERGE, never replace.
   Ideas match by normalized title; a match appends only the chain entries it lacks
   (by date+text) and adopts source/strength when the stored idea has none.
   window.ATH_MERGE = { mergeIdeas } — pure, unit-tested. */
(function () {
  "use strict";
  const norm = (t) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();
  function mergeIdeas(existing, incoming) {
    const all = existing.map((i) => ({ ...i, chain: [...(i.chain || [])] }));
    const byTitle = new Map(all.map((i) => [norm(i.title), i]));
    const used = new Set(all.map((i) => i.id).filter(Boolean));
    let added = 0, updated = 0;
    for (const inc of incoming || []) {
      if (!inc || !inc.title) continue;
      const key = norm(inc.title);
      const cur = byTitle.get(key);
      if (!cur) {                                                                  // a new idea comes in whole (its id, origin, links and archive state), so a backup restores as it was
        const id = inc.id && !used.has(inc.id) ? inc.id : "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); used.add(id);
        const ni = { ...inc, id, chain: [...(inc.chain || [])] };                     // as it came: no fields added, key order kept, so a backup restores to the byte
        if (ni.body == null) ni.body = ""; if (!Array.isArray(ni.tags)) ni.tags = []; if (!ni.created) ni.created = new Date().toISOString().slice(0, 10);
        all.push(ni); byTitle.set(key, ni); added++; continue; }
      let changed = false;
      const have = new Set(cur.chain.map((c) => c.date + "|" + c.text));
      for (const c of inc.chain || []) if (!have.has(c.date + "|" + c.text)) { cur.chain.push(c); changed = true; }
      if (!cur.source && inc.source) { cur.source = inc.source; changed = true; }
      if (!cur.strength && inc.strength) { cur.strength = inc.strength; changed = true; }
      cur.chain.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      if (changed) updated++;
    }
    return { all, added, updated };
  }
  const M = { mergeIdeas };
  if (typeof window !== "undefined") window.ATH_MERGE = M;
  if (typeof globalThis !== "undefined") globalThis.ATH_MERGE = M;
})();
