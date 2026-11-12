/* The deck's one store. Every capability keeps one slice of state here; slices live in this browser's localStorage under
   prom.deck.<slice> and nowhere else. Nothing is ever sent to a server.
   Every slice exports and imports as a real, versioned JSON file (one capability, or the whole deck), and a seed file
   (the owner's private presets, kept in his Drive) loads through the same door.

   store.define(slice, { schema, init(), migrate?(data, from) })   register a slice
   store.get(slice)            the live object (read it; change it only inside update)
   store.update(slice, fn)     mutate, save, notify
   store.on(fn)                fn(slice) after every change (this tab or another)
   store.exportSlice / exportDeck / importFile / undoImport / wipe */

const NS = "prom.deck.";
const APP = "prometheus-deck";
const FORMAT = 1;
const defs = new Map(), cache = new Map(), subs = new Set(), mem = new Map();
let undo = null;

const ls = (() => { try { const k = NS + "__t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
const rawGet = (k) => (ls ? ls.getItem(k) : mem.has(k) ? mem.get(k) : null);
const rawSet = (k, v) => { if (ls) { try { ls.setItem(k, v); return true; } catch (e) { return false; } } mem.set(k, v); return true; };
const rawDel = (k) => { if (ls) ls.removeItem(k); else mem.delete(k); };
const emit = (slice) => { for (const f of subs) { try { f(slice); } catch (e) { console.error(e); } } };

function load(slice) {
  const def = defs.get(slice); if (!def) throw new Error("unknown slice " + slice);
  let data = null;
  try { const raw = rawGet(NS + slice); if (raw) { const o = JSON.parse(raw); data = o.schema === def.schema ? o.data : def.migrate ? def.migrate(o.data, o.schema) : null; } } catch (e) { data = null; }
  if (data == null) data = def.init();
  cache.set(slice, data); return data;
}
function save(slice) {
  const def = defs.get(slice);
  const ok = rawSet(NS + slice, JSON.stringify({ schema: def.schema, saved: new Date().toISOString(), data: cache.get(slice) }));
  if (!ok) store.lastError = "This browser would not save (storage full or blocked). Export a backup now.";
  return ok;
}

export const store = {
  lastError: null,
  define(slice, def) { defs.set(slice, { schema: 1, ...def }); cache.delete(slice); },
  slices: () => [...defs.keys()],
  get(slice) { return cache.has(slice) ? cache.get(slice) : load(slice); },
  update(slice, fn) { const d = store.get(slice); fn(d); save(slice); emit(slice); return d; },
  replace(slice, data) { cache.set(slice, data); save(slice); emit(slice); },
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  uid: (p = "") => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  /** True when no slice has ever been saved on this device (first run). */
  pristine() { return !defs.size || [...defs.keys()].every((s) => rawGet(NS + s) == null); },

  exportSlice(slice) { const def = defs.get(slice); return { app: APP, format: FORMAT, kind: "capability", capability: slice, schema: def.schema, exported: new Date().toISOString(), data: store.get(slice) }; },
  exportDeck() {
    const slices = {}; for (const [s, def] of defs) slices[s] = { schema: def.schema, data: store.get(s) };
    return { app: APP, format: FORMAT, kind: "deck", exported: new Date().toISOString(), slices };
  },
  /** What a file would do, without doing it: { ok, kind, label, slices: [{slice, known}], error } */
  inspect(obj) {
    if (!obj || obj.app !== APP) return { ok: false, error: "This is not a Prometheus deck file." };
    if (obj.format > FORMAT) return { ok: false, error: "This file comes from a newer deck. Update the deck first." };
    if (obj.kind === "capability") return defs.has(obj.capability) ? { ok: true, kind: obj.kind, label: obj.capability, slices: [{ slice: obj.capability, known: true }] } : { ok: false, error: `This deck has no "${obj.capability}" capability yet.` };
    if ((obj.kind === "deck" || obj.kind === "seed") && obj.slices) return { ok: true, kind: obj.kind, label: obj.label || "", slices: Object.keys(obj.slices).map((s) => ({ slice: s, known: defs.has(s) })) };
    return { ok: false, error: "This file has no deck data in it." };
  },
  /** Load a capability, deck or seed file. Slices in the file replace the same slices here; the previous state is kept for one undo. */
  importFile(obj) {
    const info = store.inspect(obj); if (!info.ok) throw new Error(info.error);
    const incoming = obj.kind === "capability" ? { [obj.capability]: { schema: obj.schema, data: obj.data } } : obj.slices;
    const before = {}; const done = [];
    for (const [slice, part] of Object.entries(incoming)) {
      const def = defs.get(slice); if (!def || !part || part.data == null) continue;
      before[slice] = rawGet(NS + slice);
      const data = part.schema === def.schema ? part.data : def.migrate ? def.migrate(part.data, part.schema) : null;
      if (data == null) continue;
      cache.set(slice, JSON.parse(JSON.stringify(data))); save(slice); done.push(slice);
    }
    undo = { before, at: Date.now() };
    for (const s of done) emit(s);
    return done;
  },
  canUndo: () => !!undo,
  undoImport() {
    if (!undo) return false;
    for (const [slice, raw] of Object.entries(undo.before)) { if (raw == null) rawDel(NS + slice); else rawSet(NS + slice, raw); cache.delete(slice); }
    const s = Object.keys(undo.before); undo = null; for (const x of s) emit(x); return true;
  },
  /** Forget everything on this device (after the caller has confirmed). */
  wipe() { for (const s of defs.keys()) { rawDel(NS + s); cache.delete(s); } undo = null; for (const s of defs.keys()) emit(s); },
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key && e.key.startsWith(NS)) { const s = e.key.slice(NS.length); if (defs.has(s)) { cache.delete(s); emit(s); } } });
}
