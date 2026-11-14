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
  /* Events (2026-11-13): what happened, across pillars. Any pillar publishes; the hub reads. A log, not a store: the pillar's own
     record stays the authority, an event only points at it. Record: {v:1, id, type "idea.captured", pillar, ref?, title, at ISO}. Newest last, capped. */
  const EKEY = "prometheus.bus.events", ECAP = 400;
  const events = {
    list(opts) { const l = read(EKEY, []); const since = opts && opts.since; return since ? l.filter((e) => e.at > since) : l; },
    publish(rec) {
      if (!rec || !rec.type || !rec.pillar) throw new Error("event needs type + pillar");
      const l = read(EKEY, []); const r = { v: 1, id: uid(), at: new Date().toISOString(), type: String(rec.type), pillar: String(rec.pillar), ref: rec.ref || "", title: String(rec.title || "").slice(0, 160) };
      l.push(r); write(EKEY, l.slice(-ECAP)); return r;
    },
    clear() { write(EKEY, []); },
  };

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
