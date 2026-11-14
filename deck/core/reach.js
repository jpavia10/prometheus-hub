/* Reach: how the hub looks inside a pillar without owning anything of it. Each pillar that takes part ships a manifest
   (pillars/<id>/pillar.json, format in docs/architecture/MANIFEST.md): which stored lists hold records worth finding, which fields to
   read, the address that opens one record, the commands it offers and the events it publishes. The hub reads storage directly and
   never loads a pillar's code; the pillar's record stays the authority and every result opens it there. */
export const MANIFESTS = [
  "pillars/kairos/pillar.json", "pillars/hearth/pillar.json", "pillars/garage/pillar.json",
  "pillars/apollo/pillar.json", "pillars/money/pillar.json", "pillars/selling/pillar.json",
  "pillars/records/pillar.json", "pillars/icarus/pillar.json", "pillars/hermes/pillar.json",
  "pillars/piano/pillar.json", "pillars/bastion/pillar.json", "pillars/athenaeum/pillar.json",
  "pillars/odyssey/pillar.json", "pillars/privacy/pillar.json", "pillars/argus/pillar.json",
  "pillars/games/pillar.json", "pillars/forge/pillar.json", "pillars/foundry/pillar.json",
  "pillars/observatory/pillar.json", "pillars/kin/pillar.json", "pillars/sylade/pillar.json",
  "pillars/aether/pillar.json", "pillars/polis/pillar.json", "pillars/mythos/pillar.json",
  "pillars/continuity/pillar.json",
];
let loaded = [];
export function loadManifests() {
  return Promise.all(MANIFESTS.map((u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null)))
    .then((l) => { loaded = l.filter((m) => m && m.manifest === 1 && m.id && m.route); return loaded; });
}
export const manifests = () => loaded;
const ls = () => (typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage : null);
const ss = () => (typeof globalThis.sessionStorage !== "undefined" ? globalThis.sessionStorage : null);
const read = (k) => { try { const s = ls(); const v = JSON.parse((s && s.getItem(k)) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const field = (rec, path) => {
  const [a, b] = String(path).split("."), v = rec == null ? null : rec[a];
  if (b) return Array.isArray(v) ? v.map((x) => (x && x[b]) || "").join(" · ") : "";
  return Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v);
};

/** Records in any pillar that match, title matches first. Each result names its pillar and carries the address of the record itself. */
export function searchRecords(q, limit = 8) {
  q = String(q || "").trim().toLowerCase();
  if (q.length < 2) return [];
  const out = [];
  for (const m of loaded) for (const s of m.search || []) for (const rec of read(s.key)) {
    if (!rec || (s.skip && rec[s.skip])) continue;
    const title = field(rec, s.title);
    let rank = title.toLowerCase().includes(q) ? 0 : -1, found = "";
    if (rank < 0) for (const f of s.text || []) {
      const v = field(rec, f), at = v.toLowerCase().indexOf(q);
      if (at >= 0) {
        rank = 1;
        found = (at > 28 ? "…" : "") + v.slice(Math.max(0, at - 28), at + 56).trim() + (at + 56 < v.length ? "…" : "");
        break;
      }
    }
    if (rank >= 0) out.push({ pillar: m.id, title, sub: `${m.name} · ${s.kind || "record"}${found ? " · " + found : ""}`, href: m.route + String(s.open || "").replace("{id}", encodeURIComponent(rec.id || "")), rank });
  }
  return out.sort((a, b) => a.rank - b.rank).slice(0, limit);
}

/** What pillars offer to do. With words after a command's keyword ("idea: ..."), the words are handed to the pillar, which keeps its own rules. */
export function commands(q) {
  const raw = String(q || "").trim(), low = raw.toLowerCase(), out = [];
  for (const m of loaded) for (const c of m.commands || []) {
    const word = (c.words || []).find((w) => new RegExp("^" + w + "\\b\\s*[:,-]?\\s+\\S", "i").test(raw));
    if (word && c.takesText) {
      const text = raw.replace(new RegExp("^" + word + "\\b\\s*[:,-]?\\s+", "i"), "");
      out.push({ pillar: m.id, title: `${c.label}: ${text}`, sub: `${m.name} · opens ready to keep`, href: m.route + (c.open || ""), hand: { pillar: m.id, command: c.id, text }, rank: 0 });
    } else if (low.length >= 2 && (c.label + " " + (c.words || []).join(" ") + " " + m.name).toLowerCase().includes(low)) {
      out.push({ pillar: m.id, title: c.label, sub: m.name, href: m.route + (c.open || ""), rank: 1 });
    }
  }
  return out.sort((a, b) => a.rank - b.rank);
}

/** Hand words to a pillar: left in this tab's session for the pillar to pick up once. Nothing is written into the pillar's records from here. */
export function handOff(hand) { try { ss()?.setItem("prometheus.handoff", JSON.stringify(hand)); } catch (e) { /* the pillar opens empty */ } }

export const SAY = {
  "idea.captured": "new idea",
  "idea.refined": "idea refined",
  "idea.archived": "idea archived",
  "shelf.added": "shelved",
  "import.merged": "backup merged",
  "forge.out": "handed out",
  "forge.back": "came back",
  "forge.reviewed": "scored",
  "deck.stage": "deck stage done",
  "build.started": "build started",
  "build.stage": "build moved on",
  "scan.done": "scanned",
  "apollo.day.logged": "training / nutrition logged",
  "argus.photo.cleaned": "photo EXIF scrubbed",
  "bastion.readiness": "readiness check updated",
  "icarus.rule.cost": "journal rule logged",
  "money.plan.updated": "payoff scenario saved",
  "mythos.updated": "lore draft updated",
  "odyssey.away": "away mode updated",
  "piano.session": "practice session logged",
  "privacy.unsubscribe": "opt-out queued",
  "time.event": "calendar updated",
  "deadlines": "deadline updated",
  "aether.alerts": "weather alert noted",
  "money:car": "auto expense logged",
  "money:sale": "sale proceeds logged",
  "deadline:kairos": "kairos deadline saved",
  "deadline:garage": "service due saved",
  "deadline:hearth-deck": "deck milestone saved",
  "deadline:hearth": "home milestone saved",
  "deadline:hermes": "reply deadline set",
  "deadline:kin": "family event saved",
  "deadline:odyssey": "trip date saved",
  "deadline:privacy": "opt-out date set",
  "deadline:records": "renewal date set",
  "deadline:selling": "listing milestone saved",
  "deadline:games/gta-vi": "release countdown set",
};

/** The newest things that happened in any pillar (the shared event log, kit/bus.js). */
export function recentEvents(n = 3) {
  let l = []; try { l = JSON.parse(ls()?.getItem("prometheus.bus.events") || "[]"); } catch (e) { l = []; }
  return (Array.isArray(l) ? l : []).slice(-n).reverse().map((e) => ({
    ...e,
    say: `${(loaded.find((m) => m.id === e.pillar) || {}).name || e.pillar} · ${SAY[e.type] || e.type}${e.title ? ": " + e.title : ""}`,
  }));
}

/** Everything that happened in any pillar after a moment, newest first, with where to open it. */
export function eventsSince(iso, n = 8) {
  let l = []; try { l = JSON.parse(ls()?.getItem("prometheus.bus.events") || "[]"); } catch (e) { l = []; }
  const route = (id) => { const m = loaded.find((x) => x.id === id); return m ? m.route : `pillars/${id}/`; };
  return (Array.isArray(l) ? l : []).filter((e) => !iso || e.at > iso).slice(-n).reverse().map((e) => ({
    ...e,
    href: route(e.pillar),
    name: (loaded.find((m) => m.id === e.pillar) || {}).name || e.pillar,
    say: SAY[e.type] || String(e.type || "").replace(/[.:]/g, " "),
  }));
}

/* Unified whole-device backup across localStorage AND Argus IndexedDB photo blobs.
   External origins (Titan Reliquary, Midas Ledger) maintain separate backups and are explicitly excluded. */
const OURS = (k) => /^(prometheus\.|prometheus-hub\.|prom\.deck\.|hearth\.)/.test(k);
export const EXCLUDED_EXTERNAL = ["titan", "midas"];
let idbCache = null;

function stableChecksum(keys, idb) {
  const canonical = JSON.stringify({
    keys: Object.keys(keys || {}).sort().map((k) => [k, keys[k]]),
    idb: Object.keys(idb || {}).sort().map((k) => [k, idb[k]]),
  });
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < canonical.length; i++) {
    const ch = canonical.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (ch + (i & 255)), 0x85ebca6b) >>> 0;
  }
  return `fnv2:${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}

async function blobToDataUrl(blob) {
  if (!blob) return null;
  if (typeof blob === "string" && blob.startsWith("data:")) return blob;
  if (typeof FileReader !== "undefined" && (typeof Blob === "undefined" || blob instanceof Blob)) {
    return await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(typeof fr.result === "string" ? fr.result : null);
      fr.onerror = () => res(null);
      fr.readAsDataURL(blob);
    });
  }
  if (blob instanceof ArrayBuffer || ArrayBuffer.isView(blob)) {
    const bytes = blob instanceof ArrayBuffer ? new Uint8Array(blob) : new Uint8Array(blob.buffer, blob.byteOffset, blob.byteLength);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = typeof btoa === "function" ? btoa(bin) : Buffer.from(bytes).toString("base64");
    return `data:application/octet-stream;base64,${b64}`;
  }
  return null;
}

function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:") || typeof Blob === "undefined") return null;
  const idx = dataUrl.indexOf(",");
  if (idx < 0) return null;
  const meta = dataUrl.slice(5, idx);
  const mime = meta.split(";")[0] || "application/octet-stream";
  const b64 = dataUrl.slice(idx + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function snapshotIndexedDB() {
  if (typeof globalThis.indexedDB === "undefined") return idbCache || {};
  const out = {};
  try {
    const db = await new Promise((res, rej) => {
      const r = globalThis.indexedDB.open("prometheus-argus", 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("photos")) r.result.createObjectStore("photos", { keyPath: "id" }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const rows = await new Promise((res, rej) => {
      const t = db.transaction("photos", "readonly");
      const rq = t.objectStore("photos").getAll();
      rq.onsuccess = () => res(rq.result || []);
      rq.onerror = () => rej(rq.error);
    });
    db.close();
    const fullRows = [];
    for (const row of rows) {
      const dataUrl = row.blobDataUrl || await blobToDataUrl(row.blob);
      const { id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height } = row;
      fullRows.push({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height, blobDataUrl: dataUrl });
    }
    out["prometheus-argus/photos"] = fullRows;
    idbCache = out;
    const s = ls();
    if (s) {
      const meta = fullRows.map(({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height }) => ({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height }));
      try { s.setItem("prometheus.argus.idbMeta", JSON.stringify(meta)); } catch {}
      try { s.setItem("prometheus.argus.idbSnapshot", JSON.stringify(fullRows)); } catch {}
    }
  } catch {}
  return out;
}

if (typeof window !== "undefined" && typeof globalThis.indexedDB !== "undefined") {
  setTimeout(() => { snapshotIndexedDB().catch(() => {}); }, 300);
}

function readIdbSnapshotSync(keysMap) {
  if (idbCache && Array.isArray(idbCache["prometheus-argus/photos"])) return idbCache;
  const out = {};
  try {
    const rawFull = keysMap["prometheus.argus.idbSnapshot"] || ls()?.getItem("prometheus.argus.idbSnapshot");
    if (rawFull) {
      const parsed = JSON.parse(rawFull);
      if (Array.isArray(parsed)) { out["prometheus-argus/photos"] = parsed; return out; }
    }
  } catch {}
  try {
    const rawMeta = keysMap["prometheus.argus.idbMeta"] || ls()?.getItem("prometheus.argus.idbMeta");
    if (rawMeta) {
      const parsed = JSON.parse(rawMeta);
      if (Array.isArray(parsed)) out["prometheus-argus/photos"] = parsed;
    }
  } catch {}
  return out;
}

export function backupAll() {
  const s = ls();
  const keys = {};
  if (s) {
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && OURS(k)) keys[k] = s.getItem(k);
    }
  }
  const idb = readIdbSnapshotSync(keys);
  const inventory = {};
  for (const k of Object.keys(keys)) {
    const owner = k.startsWith("prom.deck.") ? "hub-deck" : k.startsWith("hearth.") ? "hearth" : (k.split(".")[1] || "other");
    inventory[owner] = (inventory[owner] || 0) + 1;
  }
  const photoCount = Array.isArray(idb["prometheus-argus/photos"]) ? idb["prometheus-argus/photos"].length : 0;
  return {
    format: "prometheus-device",
    schema: "prometheus-backup",
    v: 2,
    version: 2,
    exported: new Date().toISOString(),
    count: Object.keys(keys).length,
    idbCount: photoCount,
    excludedExternal: [...EXCLUDED_EXTERNAL],
    inventory,
    keys,
    idb,
    integrity: stableChecksum(keys, idb),
  };
}

export function previewRestore(file) {
  const isDeviceFmt = file && (file.format === "prometheus-device" || file.schema === "prometheus-backup");
  if (!isDeviceFmt || !file.keys || typeof file.keys !== "object" || Array.isArray(file.keys)) {
    throw new Error("This is not a valid whole-device Prometheus backup.");
  }
  if (file.integrity && typeof file.integrity === "string" && file.integrity.startsWith("fnv2:")) {
    const expected = stableChecksum(file.keys, file.idb || {});
    if (file.integrity !== expected) {
      throw new Error("Backup integrity check failed: contents do not match checksum.");
    }
  }
  const s = ls();
  const add = [], change = [], same = [];
  for (const [k, v] of Object.entries(file.keys)) {
    if (!OURS(k)) continue;
    const cur = s ? s.getItem(k) : null;
    (cur == null ? add : cur === v ? same : change).push(k);
  }
  const idbRows = (file.idb && Array.isArray(file.idb["prometheus-argus/photos"])) ? file.idb["prometheus-argus/photos"] : [];
  return {
    add,
    change,
    same,
    idbCount: idbRows.length,
    excludedExternal: Array.isArray(file.excludedExternal) ? file.excludedExternal : [...EXCLUDED_EXTERNAL],
    pillars: [...new Set([...add, ...change].map((k) => k.startsWith("prom.deck.") ? "hub" : k.startsWith("hearth.") ? "hearth" : (k.split(".")[1] || "hub")))],
  };
}

export async function restoreIndexedDB(file) {
  const rows = (file && file.idb && Array.isArray(file.idb["prometheus-argus/photos"])) ? file.idb["prometheus-argus/photos"] : [];
  idbCache = rows.length ? { "prometheus-argus/photos": rows } : {};
  const s = ls();
  if (s && rows.length) {
    try { s.setItem("prometheus.argus.idbSnapshot", JSON.stringify(rows)); } catch {}
    try {
      const meta = rows.map(({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height }) => ({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height }));
      s.setItem("prometheus.argus.idbMeta", JSON.stringify(meta));
    } catch {}
  }
  if (!rows.length || typeof globalThis.indexedDB === "undefined") return rows.length;
  try {
    const db = await new Promise((res, rej) => {
      const r = globalThis.indexedDB.open("prometheus-argus", 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("photos")) r.result.createObjectStore("photos", { keyPath: "id" }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    await new Promise((res, rej) => {
      const t = db.transaction("photos", "readwrite");
      const store = t.objectStore("photos");
      for (const r of rows) {
        const record = { ...r };
        if (!record.blob && record.blobDataUrl) record.blob = dataUrlToBlob(record.blobDataUrl);
        if (record.blob) store.put(record);
      }
      t.oncomplete = () => res();
      t.onerror = () => rej(t.error);
    });
    db.close();
  } catch {}
  return rows.length;
}

export function restoreAll(file) {
  const p = previewRestore(file);
  const s = ls();
  const ses = ss();
  if (s && ses) {
    const rollbackKeys = {};
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && OURS(k)) rollbackKeys[k] = s.getItem(k);
    }
    try { ses.setItem("prometheus.backup.rollback", JSON.stringify({ savedAt: new Date().toISOString(), keys: rollbackKeys })); } catch {}
  }
  if (s) {
    for (const k of [...p.add, ...p.change]) s.setItem(k, file.keys[k]);
  }
  if (file.idb && Array.isArray(file.idb["prometheus-argus/photos"])) {
    idbCache = { "prometheus-argus/photos": file.idb["prometheus-argus/photos"] };
    void restoreIndexedDB(file);
  }
  return { ...p, rollbackSaved: !!ses };
}

export function rollbackRestore() {
  const ses = ss();
  const s = ls();
  if (!ses || !s) return 0;
  const raw = ses.getItem("prometheus.backup.rollback");
  if (!raw) return 0;
  const snap = JSON.parse(raw);
  if (!snap || !snap.keys) return 0;
  for (const [k, v] of Object.entries(snap.keys)) {
    if (OURS(k)) s.setItem(k, v);
  }
  return Object.keys(snap.keys).length;
}
