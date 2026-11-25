/* The core sees every deadline (2026-11-19). Before this the home's Today and countdowns showed only federal holidays: the core's own
   list had holidays, federal tax dates and clock changes; it ignored Kairos's 88 California and Kern County dates (property tax, assessment
   appeals, FTB, DMV, Covered California) and every deadline a pillar publishes, and those reached the shared bus only after the owner had
   opened that pillar on that device. Three fixes live here:
   1. referenceDeadlines(): the core's dates merged with Kairos's (pillars/kairos/fixed-dates.js) at boot, one row per date + name.
   2. sweepPillars(): once a day (not on data saver or 2G), when the phone is idle, each pillar that publishes deadlines runs once in a hidden frame (?embed=1: no
      interface, no backdrop) so its deadlines reach the bus without a visit. One frame at a time, pages come from the offline cache.
   3. keepData(): asks the browser to keep this site's storage (navigator.storage.persist) so it is not cleared under storage pressure. */

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const KINDS = new Set(["federal holiday", "tax deadline", "clock change"]);

/** Kairos's reference dates: the same plain script Kairos loads (it builds window.KAIROS_FIXED in two blocks, the federal 58 and the
    30 California / Kern rows pushed after), loaded once as a script from this site (the offline cache serves it too). */
function kairosFixed() {
  if (Array.isArray(window.KAIROS_FIXED)) return Promise.resolve(window.KAIROS_FIXED);
  return new Promise((ok) => {
    const s = document.createElement("script"); s.src = "./pillars/kairos/fixed-dates.js"; s.async = true;
    s.onload = () => ok(Array.isArray(window.KAIROS_FIXED) ? window.KAIROS_FIXED : []); s.onerror = () => ok([]);
    document.head.appendChild(s);
  });
}

/** The core's fixed dates plus Kairos's, deduplicated. Rows whose kind is an agency name become kind "deadline" with that agency kept. */
export async function referenceDeadlines() {
  const core = await fetch("./deck/data/fixed-dates.json").then((r) => (r.ok ? r.json() : [])).catch(() => []);
  const kai = await kairosFixed().catch(() => []);
  const seen = new Set(); const out = [];
  for (const r of [...core, ...kai]) {
    if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.date || "") || !r.name) continue;
    const k = r.date + "|" + norm(r.name); if (seen.has(k)) continue; seen.add(k);
    out.push(KINDS.has(r.kind) ? { ...r } : { ...r, kind: "deadline", agency: r.kind || "" });
  }
  return out.sort((x, y) => x.date.localeCompare(y.date));
}

/* the pillars whose app publishes to the deadlines bus (kit/bus.js PB.deadlines.publish) */
export const PUBLISHERS = ["kairos", "hearth", "garage", "money", "records", "selling", "hermes", "bastion", "aether", "privacy", "polis",
  "continuity", "kin", "odyssey", "games", "atlas", "aegis"];                        // forge left out: it reads every queue (about 1 MB) and publishes only the owner's register
const SWEEP_AT = "prom.deck.sweep.at";
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* private mode */ } return null; };
const busCount = () => { try { return (JSON.parse(localStorage.getItem("prometheus.bus.deadlines") || "[]") || []).length; } catch (e) { return 0; } };

/** Run each publishing pillar once in a hidden frame. `force` skips the once-a-day rule. Resolves to { ran, before, after }. */
export async function sweepPillars(routes, { force = false, perPage = 9000 } = {}) {
  const last = Number(ls(SWEEP_AT) || 0);
  const c = navigator.connection || {}, slow = c.saveData || /(^|-)2g$/.test(c.effectiveType || "");      // data saver or a 2G link: never
  if (!force && (slow || Date.now() - last < 24 * 3600 * 1000)) return { ran: 0, before: busCount(), after: busCount(), skipped: true };
  const before = busCount(); let ran = 0;
  for (const id of PUBLISHERS) {
    const route = routes[id]; if (!route) continue;
    await new Promise((done) => {
      const f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true"); f.tabIndex = -1; f.title = "";
      f.style.cssText = "position:fixed;left:-20px;top:-20px;width:1px;height:1px;opacity:0;pointer-events:none;border:0";
      let t = 0; const end = () => { clearTimeout(t); setTimeout(() => { f.remove(); done(); }, 1200); };
      f.onload = end; t = setTimeout(end, perPage);
      f.src = route + (route.includes("?") ? "&" : "?") + "embed=1&sweep=1";
      document.body.appendChild(f);
    });
    ran++;
  }
  ls(SWEEP_AT, String(Date.now()));
  return { ran, before, after: busCount() };
}

/** Ask the browser to keep this site's data. Resolves to true (kept), false (may be cleared) or null (the browser cannot say). */
export async function keepData() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (e) { return null; }
}
