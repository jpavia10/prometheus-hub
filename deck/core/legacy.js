/* What already exists, unified two-way with the pillars' storage on this device (prometheus.<pillar>.<name>),
   the shared deadline & money buses (prometheus.bus.deadlines, prometheus.bus.money), and Titan's published ledger. */
const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* quota */ } };
const pid = (source) => String(source || "").split(/[-:./ ]/)[0].toLowerCase();

/** Open deadlines on the bus between two days, as feed rows. Kairos fixed & already-synced kairos rows are deduplicated. */
export function busRows(from, to, routes = {}) {
  const deckTime = read("prom.deck.time", {});
  const syncedKairos = new Set((deckTime.events || []).filter((e) => e && e.kairosId).map((e) => String(e.kairosId)));
  return read("prometheus.bus.deadlines", []).filter((r) => r && r.date >= from && r.date <= to && r.source !== "kairos-fixed" && r.title && !(r.source === "kairos" && syncedKairos.has(String(r.ref))))
    .map((r) => ({ key: "bus:" + (r.id || r.source + r.ref), date: r.date, time: /^\d\d:\d\d$/.test(r.time || "") ? r.time : null, title: r.title, cap: pid(r.source) || "bus", tone: r.amount != null ? "bill" : "deadline",
      weight: 2, done: !!r.done, amount: typeof r.amount === "number" ? r.amount : null, go: routes[pid(r.source)] || null, bus: true }));
}

export function busMoneySales() {
  const rows = read("prometheus.bus.money", []).filter((r) => r && r.type === "sale" && Number(r.amount) > 0);
  const totalC = rows.reduce((s, r) => s + Math.round(Number(r.amount) * 100), 0);
  return { totalC, rows };
}

let bridgeLock = false;
/** Pull external pillar & bus data into the Hub store without clobbering user edits. */
export function syncBridges(store) {
  if (bridgeLock || typeof localStorage === "undefined") return;
  bridgeLock = true;
  try {
    const kEvents = read("prometheus.kairos.events", null);
    if (Array.isArray(kEvents)) {
      const kIds = new Set(kEvents.map((e) => String(e.id)));
      store.update("time", (t) => {
        t.events = (t.events || []).filter((e) => !e.kairosId || kIds.has(String(e.kairosId)));
        const have = new Set(t.events.filter((e) => e.kairosId).map((e) => String(e.kairosId)));
        for (const k of kEvents) {
          if (!k || !k.date || !k.title) continue;
          const sid = String(k.id);
          if (have.has(sid)) {
            const ex = t.events.find((e) => String(e.kairosId) === sid);
            if (ex) { ex.title = k.title; ex.date = k.date; ex.time = k.time || null; ex.allDay = !k.time; ex.notes = k.pillar || ex.notes || ""; }
          } else {
            t.events.push({ id: "k_" + sid, kairosId: sid, src: "kairos", title: k.title, date: k.date, time: k.time || null, allDay: !k.time, kind: "event", notes: k.pillar || "", place: "" });
          }
        }
      }, { silent: true });
    }
    const { rows: sales } = busMoneySales();
    if (sales.length) {
      store.update("money", (m) => {
        const dismissed = new Set(m.dismissedBus || []);
        const have = new Set((m.events || []).filter((e) => e.busId).map((e) => String(e.busId)));
        for (const r of sales) {
          const bid = String(r.id);
          if (!dismissed.has(bid) && !have.has(bid)) {
            m.events.push({ id: "bs_" + bid, busId: bid, date: r.date || new Date().toISOString().slice(0, 10), amount: Number(r.amount), kind: "sale", label: r.note || r.title || "Selling payout", applied: true });
          }
        }
      }, { silent: true });
    }
    const cfg = read("prometheus.money.cfg", null);
    if (cfg && cfg.from === "pillar" && (cfg._ts || 0) > (read("prom.deck.money", {})._ts || 0)) {
      store.update("money", (m) => {
        if (!m.plan) m.plan = { label: "Consolidation plan", sample: false, start: new Date().toISOString().slice(0, 10), strategy: "avalanche", order: [], budget: null, extra: Number(cfg.extra) || 0, debts: [{ id: "d_cons", name: "Consolidation loan", kind: "loan", balance: Number(cfg.principal) || 5000, apr: Number(cfg.apr) || 6, min: Number(cfg.actualPayment) || 440 }] };
        else if (m.plan.debts && m.plan.debts[0]) {
          m.plan.debts[0].balance = Number(cfg.principal) || m.plan.debts[0].balance;
          m.plan.debts[0].apr = Number(cfg.apr) ?? m.plan.debts[0].apr;
          m.plan.debts[0].min = Number(cfg.actualPayment) || m.plan.debts[0].min;
          m.plan.extra = Number(cfg.extra) || 0;
        }
        m._ts = cfg._ts;
      }, { silent: true });
    }
  } finally { bridgeLock = false; }
}

/** Mirror Hub store edits back to Kairos & Money pillar stores + Shared Buses. */
export function mirrorDeckToPillars(store) {
  if (bridgeLock || typeof localStorage === "undefined") return;
  bridgeLock = true;
  try {
    const m = store.get("money");
    if (m && m.plan && m.plan.debts && m.plan.debts[0]) {
      const prevCfg = read("prometheus.money.cfg", {});
      const d0 = m.plan.debts[0];
      const nextCfg = { ...prevCfg, principal: Number(d0.balance) || prevCfg.principal || 5000, apr: Number(d0.apr) ?? prevCfg.apr ?? 6, actualPayment: Number(d0.min) || prevCfg.actualPayment || 440, extra: Number(m.plan.extra) || 0, label: m.plan.label || "", _ts: Date.now(), from: "deck" };
      write("prometheus.money.cfg", nextCfg);
    }
    const t = store.get("time");
    if (t && Array.isArray(t.events)) {
      const existingK = read("prometheus.kairos.events", []);
      const synced = existingK.filter((k) => t.events.some((e) => !e.kairosId || String(e.kairosId) === String(k.id)));
      if (synced.length !== existingK.length) write("prometheus.kairos.events", synced);
    }
  } finally { bridgeLock = false; }
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
