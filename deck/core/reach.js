/* Reach: how the hub looks inside a pillar without owning anything of it. Each pillar that takes part ships a manifest
   (pillars/<id>/pillar.json, format in docs/architecture/MANIFEST.md): which stored lists hold records worth finding, which fields to
   read, the address that opens one record, the commands it offers and the events it publishes. The hub reads storage directly and
   never loads a pillar's code; the pillar's record stays the authority and every result opens it there. */
export const MANIFESTS = ["pillars/athenaeum/pillar.json", "pillars/forge/pillar.json", "pillars/foundry/pillar.json", "pillars/observatory/pillar.json", "pillars/kin/pillar.json", "pillars/games/pillar.json", "pillars/hearth/pillar.json"];
let loaded = [];
export function loadManifests() {
  return Promise.all(MANIFESTS.map((u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null))).then((l) => { loaded = l.filter((m) => m && m.manifest === 1 && m.id && m.route); return loaded; });
}
export const manifests = () => loaded;
const read = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const field = (rec, path) => { const [a, b] = String(path).split("."), v = rec == null ? null : rec[a]; if (b) return Array.isArray(v) ? v.map((x) => (x && x[b]) || "").join(" · ") : ""; return Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v); };

/** Records in any pillar that match, title matches first. Each result names its pillar and carries the address of the record itself. */
export function searchRecords(q, limit = 8) {
  q = String(q || "").trim().toLowerCase(); if (q.length < 2) return []; const out = [];
  for (const m of loaded) for (const s of m.search || []) for (const rec of read(s.key)) {
    if (!rec || (s.skip && rec[s.skip])) continue; const title = field(rec, s.title); let rank = title.toLowerCase().includes(q) ? 0 : -1, found = "";
    if (rank < 0) for (const f of s.text || []) { const v = field(rec, f), at = v.toLowerCase().indexOf(q); if (at >= 0) { rank = 1; found = (at > 28 ? "…" : "") + v.slice(Math.max(0, at - 28), at + 56).trim() + (at + 56 < v.length ? "…" : ""); break; } }
    if (rank >= 0) out.push({ pillar: m.id, title, sub: `${m.name} · ${s.kind || "record"}${found ? " · " + found : ""}`, href: m.route + String(s.open || "").replace("{id}", encodeURIComponent(rec.id || "")), rank });
  }
  return out.sort((a, b) => a.rank - b.rank).slice(0, limit);
}
/** What pillars offer to do. With words after a command's keyword ("idea: ..."), the words are handed to the pillar, which keeps its own rules. */
export function commands(q) {
  const raw = String(q || "").trim(), low = raw.toLowerCase(), out = [];
  for (const m of loaded) for (const c of m.commands || []) {
    const word = (c.words || []).find((w) => new RegExp("^" + w + "\\b\\s*[:,-]?\\s+\\S", "i").test(raw));
    if (word && c.takesText) { const text = raw.replace(new RegExp("^" + word + "\\b\\s*[:,-]?\\s+", "i"), ""); out.push({ pillar: m.id, title: `${c.label}: ${text}`, sub: `${m.name} · opens ready to keep`, href: m.route + (c.open || ""), hand: { pillar: m.id, command: c.id, text }, rank: 0 }); }
    else if (low.length >= 2 && (c.label + " " + (c.words || []).join(" ") + " " + m.name).toLowerCase().includes(low)) out.push({ pillar: m.id, title: c.label, sub: m.name, href: m.route + (c.open || ""), rank: 1 });
  }
  return out.sort((a, b) => a.rank - b.rank);
}
/** Hand words to a pillar: left in this tab's session for the pillar to pick up once. Nothing is written into the pillar's records from here. */
export function handOff(hand) { try { sessionStorage.setItem("prometheus.handoff", JSON.stringify(hand)); } catch (e) { /* the pillar opens empty */ } }

const SAY = { "idea.captured": "new idea", "idea.refined": "idea refined", "idea.archived": "idea archived", "shelf.added": "shelved", "import.merged": "backup merged" };
/** The newest things that happened in any pillar (the shared event log, kit/bus.js). */
export function recentEvents(n = 3) {
  let l = []; try { l = JSON.parse(localStorage.getItem("prometheus.bus.events") || "[]"); } catch (e) { l = []; }
  return (Array.isArray(l) ? l : []).slice(-n).reverse().map((e) => ({ ...e, say: `${(loaded.find((m) => m.id === e.pillar) || {}).name || e.pillar} · ${SAY[e.type] || e.type}${e.title ? ": " + e.title : ""}` }));
}
