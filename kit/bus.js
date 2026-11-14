/* Prometheus bus (Sebastian, 2026-11-09): the shared data layer every capability on this origin
   reads and writes, built on the kit's storage conventions (keys prometheus.<area>.<name>).
   Two buses plus a full-deck backup:
   - Deadlines: any capability publishes dated obligations; Time and the desk read them all.
     Record: {id, title, date "YYYY-MM-DD", time?, source (capability id), kind, ref?, done}
   - Money events: sales, fuel, payments, windfalls; the payoff picture sums them.
     Record: {id, kind, amount (number, + money in toward payoff / - out), date, source, label}
   - Meta: small shared state (e.g. Odyssey away mode) any page may read.
   Same-origin only by design: the desk and every seat page under /prometheus-hub/ share this
   localStorage. Midas's encrypted book lives on its own origin and is never touched from here.
   Nothing here talks to a server. window.PB = { deadlines:{...}, money:{...}, meta:{...}, events:{...}, dumpAll, loadAll } */
(function () {
  "use strict";
  const LS = typeof localStorage !== "undefined" ? localStorage : null;
  const mem = new Map();
  const get = (k) => { try { return LS ? LS.getItem(k) : (mem.has(k) ? mem.get(k) : null); } catch (_) { return mem.has(k) ? mem.get(k) : null; } };
  const set = (k, v) => { try { if (LS) LS.setItem(k, v); else mem.set(k, v); } catch (_) { mem.set(k, v); } };
  const read = (k, dflt) => { const v = get(k); if (v == null) return dflt; try { return JSON.parse(v); } catch (_) { return dflt; } };
  const write = (k, v) => set(k, JSON.stringify(v));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const pad = (n) => String(n).padStart(2, "0");
  const dayOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dayOf(new Date());
  const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return dayOf(d); };

  const DKEY = "prometheus.bus.deadlines", MKEY = "prometheus.bus.money", METAKEY = "prometheus.bus.meta";

  const deadlines = {
    list() { return read(DKEY, []); },
    /** Publish (or replace, when source+ref match) a deadline. Returns the record. */
    publish(rec) {
      if (!rec || !rec.title || !/^\d{4}-\d{2}-\d{2}$/.test(rec.date || "")) throw new Error("deadline needs title + date YYYY-MM-DD");
      const l = read(DKEY, []);
      if (rec.source && rec.ref) {
        const i = l.findIndex((r) => r.source === rec.source && r.ref === rec.ref);
        if (i >= 0) { l[i] = { ...l[i], ...rec, id: l[i].id }; write(DKEY, l); return l[i]; }
      }
      const r = { id: uid(), done: false, ...rec };
      l.push(r); write(DKEY, l); return r;
    },
    unpublish(source, ref) { write(DKEY, read(DKEY, []).filter((r) => !(r.source === source && r.ref === ref))); },
    setDone(id, done = true) { write(DKEY, read(DKEY, []).map((r) => (r.id === id ? { ...r, done } : r))); },
    /** Open deadlines with date <= today+days (default 7), soonest first. */
    upcoming(days = 7, from = today()) {
      const until = addDays(from, days);
      return read(DKEY, []).filter((r) => !r.done && r.date >= from && r.date <= until)
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    },
    /** Open obligations dated before today. Reference dates (holidays, clock changes, tax calendar from
        Kairos's fixed list, source "kairos-fixed") pass on their own and are never "overdue". */
    overdue(from = today()) { return read(DKEY, []).filter((r) => !r.done && r.date < from && r.source !== "kairos-fixed").sort((a, b) => (a.date < b.date ? -1 : 1)); },
  };

  const money = {
    list() { return read(MKEY, []); },
    add(rec) {
      if (!rec || typeof rec.amount !== "number" || isNaN(rec.amount)) throw new Error("money event needs a numeric amount");
      const r = { id: uid(), date: today(), ...rec };
      const l = read(MKEY, []); l.push(r); write(MKEY, l); return r;
    },
    remove(id) { write(MKEY, read(MKEY, []).filter((r) => r.id !== id)); },
    /** Sum of amounts, optionally filtered by kind and/or since a YYYY-MM-DD date. */
    total(kind, since) { return read(MKEY, []).filter((r) => (!kind || r.kind === kind) && (!since || r.date >= since)).reduce((s, r) => s + r.amount, 0); },
  };

  const meta = {
    get(k, dflt) { const m = read(METAKEY, {}); return k in m ? m[k] : dflt; },
    set(k, v) { const m = read(METAKEY, {}); m[k] = v; write(METAKEY, m); },
  };

  /** Full-deck backup: every prometheus.* key (and the desk's own prometheus-hub.* lines) in one versioned JSON object. */
  /* Events: what happened, across pillars. Any pillar publishes; the hub reads. A log, not a store: the pillar's own
     record stays the authority, an event only points at it. Envelope: {type, pillar, at, v} plus id, ref, title.
     Newest last, capped. Older rows missing any envelope field are migrated in place. dumpAll/loadAll copy the stored
     string unchanged, so a backup still round-trips byte for byte. */
  const EKEY = "prometheus.bus.events", ECAP = 400;
  const eventComplete = (e) => !!(e && typeof e === "object" && typeof e.type === "string" && e.type && typeof e.pillar === "string" && e.pillar && typeof e.at === "string" && e.at && e.v === 1);
  function envelopeOf(rec) {
    const src = rec && typeof rec === "object" ? rec : {};
    const type = String(src.type || src.kind || "event");
    const pillar = String(src.pillar || src.source || "hub");
    let at = typeof src.at === "string" && src.at ? src.at : "";
    if (!at && typeof src.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(src.date)) at = src.date.length > 10 ? src.date : src.date + "T12:00:00.000Z";
    if (!at) at = "1970-01-01T00:00:00.000Z";
    return { type, pillar, at, v: 1, id: src.id ? String(src.id) : uid(), ref: src.ref != null ? String(src.ref) : "", title: String(src.title || src.label || "").slice(0, 160) };
  }
  /** Rewrite stored events that lack the envelope. Rows that already have {type, pillar, at, v:1} are left as stored. */
  function migrateEvents() {
    const raw = get(EKEY);
    if (raw == null) return [];
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { return []; }
    if (!Array.isArray(parsed)) return [];
    let changed = false;
    const next = parsed.map((e) => { if (eventComplete(e)) return e; changed = true; return envelopeOf(e); });
    if (changed) write(EKEY, next);
    return next;
  }
  const events = {
    list(opts) { const l = migrateEvents(); const since = opts && opts.since; return since ? l.filter((e) => e.at > since) : l; },
    publish(rec) {
      if (!rec || !rec.type || !rec.pillar) throw new Error("event needs type + pillar");
      const l = migrateEvents();
      const r = envelopeOf({ type: rec.type, pillar: rec.pillar, ref: rec.ref, title: rec.title, at: new Date().toISOString() });
      l.push(r); write(EKEY, l.slice(-ECAP)); return r;
    },
    migrate: migrateEvents,
    clear() { write(EKEY, []); },
  };
  migrateEvents();

  function dumpAll() {
    const keys = {};
    const mine = (k) => Boolean(k && /^(prometheus\.|prometheus-hub\.|prom\.deck\.|hearth\.)/.test(k));
    const collect = (k) => { if (mine(k)) { const v = get(k); if (v != null) keys[k] = v; } };
    if (LS) { for (let i = 0; i < LS.length; i++) collect(LS.key(i)); } else for (const k of mem.keys()) collect(k);
    let idb = {};
    try {
      const snap = keys["prometheus.argus.idbSnapshot"] || keys["prometheus.argus.idbMeta"];
      if (snap) idb["prometheus-argus/photos"] = JSON.parse(snap);
    } catch (_) {}
    return { format: "prometheus-device", schema: "prometheus-backup", v: 2, version: 2, exported: new Date().toISOString(), count: Object.keys(keys).length, excludedExternal: ["titan", "midas"], keys, idb };
  }
  function loadAll(obj) {
    if (!obj || (obj.schema !== "prometheus-backup" && obj.format !== "prometheus-device") || !obj.keys) throw new Error("not a prometheus-backup file");
    const mine = (k) => Boolean(k && /^(prometheus\.|prometheus-hub\.|prom\.deck\.|hearth\.)/.test(k));
    for (const [k, v] of Object.entries(obj.keys)) if (mine(k)) set(k, v);
    return Object.keys(obj.keys).filter(mine).length;
  }

  const PB = { deadlines, money, meta, events, dumpAll, loadAll, today, addDays, _keys: { DKEY, MKEY, METAKEY, EKEY } };
  if (typeof window !== "undefined") window.PB = PB;
  if (typeof globalThis !== "undefined") globalThis.PB = PB;
})();
