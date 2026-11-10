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
