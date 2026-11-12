/* What already exists, read as it is: the pillars' own storage on this device (kit store: prometheus.<pillar>.<name>), the shared
   deadline bus they publish to (prometheus.bus.deadlines), and Titan's published ledger (same origin on the live site).
   Read only: the hub never rewrites a pillar's data. */
const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const pid = (source) => String(source || "").split(/[-:./ ]/)[0].toLowerCase();

/** Open deadlines on the bus between two days, as feed rows. Kairos's fixed list is left out (the hub reads the same dates itself). */
export function busRows(from, to, routes = {}) {
  return read("prometheus.bus.deadlines", []).filter((r) => r && r.date >= from && r.date <= to && r.source !== "kairos-fixed" && r.title)
    .map((r) => ({ key: "bus:" + (r.id || r.source + r.ref), date: r.date, time: /^\d\d:\d\d$/.test(r.time || "") ? r.time : null, title: r.title, cap: pid(r.source) || "bus", tone: r.amount != null ? "bill" : "deadline",
      weight: 2, done: !!r.done, amount: typeof r.amount === "number" ? r.amount : null, go: routes[pid(r.source)] || null, bus: true }));
}
/** Per pillar: how much it holds on this device and its next open date on the bus. { kairos: { records, next: { date, title } } } */
export function pillarStats(today) {
  const out = {}; const at = (id) => out[id] || (out[id] = { records: 0, next: null });
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k || !k.startsWith("prometheus.") || k.startsWith("prometheus.bus.")) continue;
    const id = k.split(".")[1]; const v = read(k, null); if (Array.isArray(v)) at(id).records += v.length; else if (v && typeof v === "object") at(id).records += Object.values(v).filter((x) => Array.isArray(x)).reduce((n, x) => n + x.length, 0); } } catch (e) { /* storage blocked: no stats */ }
  for (const r of read("prometheus.bus.deadlines", [])) { if (!r || r.done || r.date < today || r.source === "kairos-fixed") continue; const s = at(pid(r.source)); if (!s.next || r.date < s.next.date) s.next = { date: r.date, title: r.title }; }
  return out;
}
/** Titan's ledger as published by its own pipeline. null when it cannot be reached (offline, or a local test server). */
let titanAsked = null;
export function titan() {
  return titanAsked || (titanAsked = (async () => {
    try { const c = JSON.parse(sessionStorage.getItem("prom.deck.titan") || "null"); if (c && Date.now() - c.at < 30 * 60000) return c; } catch (e) { /* no cache */ }
    try { const base = new URL("/titan-reliquary-preview/", location.origin).href; const r = await fetch(base + "data/index.json", { cache: "no-cache" }); if (!r.ok) return null; const d = await r.json();
      const flips = d.flips || []; const newest = flips.filter((c) => c.thumb).sort((a, b) => String(b.added).localeCompare(String(a.added)) || String(b.scan).localeCompare(String(a.scan))).slice(0, 4).map((c) => ({ label: c.label, img: base + c.thumb.replace("photos/p1/", "photos/cut/") }));
      const out = { at: Date.now(), total: d.board && d.board.grand, pieces: d.counts && d.counts.vault, flips: flips.length, countries: d.counts && d.counts.countries, ag: d.metals && d.metals.oz && d.metals.oz.ag, au: d.metals && d.metals.oz && d.metals.oz.au, newest, url: base };
      try { sessionStorage.setItem("prom.deck.titan", JSON.stringify(out)); } catch (e) { /* fine */ } return out;
    } catch (e) { return null; }
  })());
}
