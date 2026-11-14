/* Prometheus Cross-Pillar Typed Entity Links (kit/links.js):
   Zero-dependency shared link registry stored in localStorage["prometheus.bus.links"].
   Stores only typed relationship metadata ({ id, fromPillar, fromId, toPillar, toId, kind, label, at });
   live record fields (title, status) are always resolved on demand from each pillar's authoritative
   localStorage store without duplicating record data into the link bus.
   Exposes window.PLinks and globalThis.PLinks. */
(function () {
  "use strict";

  const LKEY = "prometheus.bus.links";
  const FOUNDRY_STAGES = ["Drawing board", "Research", "Design", "Prototype", "Test", "Built"];
  const mem = new Map();

  function getStorage() {
    try {
      if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (_) { /* storage blocked */ }
    return null;
  }

  function rawGet(k) {
    const ls = getStorage();
    try {
      return ls ? ls.getItem(k) : (mem.has(k) ? mem.get(k) : null);
    } catch (_) {
      return mem.has(k) ? mem.get(k) : null;
    }
  }

  function rawSet(k, v) {
    const ls = getStorage();
    try {
      if (ls) ls.setItem(k, v);
      else mem.set(k, v);
    } catch (_) {
      mem.set(k, v);
    }
  }

  function readLinks() {
    const raw = rawGet(LKEY);
    if (raw == null) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeLinks(items) {
    rawSet(LKEY, JSON.stringify(items));
  }

  function readArray(key) {
    const raw = rawGet(key);
    if (raw == null) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function stableId(fromPillar, fromId, toPillar, toId, kind) {
    const input = [fromPillar, fromId, toPillar, toId, kind].join("\x1f");
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ (c + (i & 255)), 0x85ebca6b) >>> 0;
    }
    return "lnk_" + h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  }

  function localDay() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function classifyDocStatus(doc) {
    if (doc.status) return String(doc.status);
    if (!doc.due) return "filed";
    const today = localDay();
    const days = Math.round((new Date(doc.due + "T12:00:00") - new Date(today + "T12:00:00")) / 864e5);
    if (Number.isNaN(days)) return "filed";
    if (days < 0) return "overdue";
    if (doc.category === "school" && days <= 7) return "urgent";
    if (days <= 30) return "soon";
    return "active";
  }

  function resolveEndpoint(pillar, id) {
    const p = String(pillar || "").trim().toLowerCase();
    const rid = String(id ?? "").trim();
    const missing = (sourceKey) => ({ pillar: p, id: rid, title: null, status: "missing", found: false, sourceKey });

    if (p === "athenaeum") {
      const key = "prometheus.athenaeum.ideas";
      let list = readArray(key);
      if (list == null && typeof window !== "undefined" && Array.isArray(window.ATHENAEUM_IDEAS)) {
        list = window.ATHENAEUM_IDEAS;
      }
      const rec = (list || []).find((r) => r && String(r.id) === rid);
      if (!rec) return missing(key);
      return { pillar: p, id: rid, title: String(rec.title || ""), status: rec.archived ? "archived" : "active", found: true, sourceKey: key };
    }

    if (p === "foundry") {
      const key = "prometheus.foundry.projects";
      const rec = (readArray(key) || []).find((r) => r && String(r.id) === rid);
      if (!rec) return missing(key);
      const st = (typeof rec.stage === "number" && FOUNDRY_STAGES[rec.stage]) ? FOUNDRY_STAGES[rec.stage] : String(rec.status || "active");
      return { pillar: p, id: rid, title: String(rec.title || ""), status: st, found: true, sourceKey: key };
    }

    if (p === "forge") {
      const key = "prometheus.forge.assignments";
      const rec = (readArray(key) || []).find((r) => r && String(r.id) === rid);
      if (!rec) return missing(key);
      return { pillar: p, id: rid, title: String(rec.title || ""), status: String(rec.state || rec.status || "out"), found: true, sourceKey: key };
    }

    if (p === "records") {
      const key = "prometheus.records.docs";
      const rec = (readArray(key) || []).find((r) => r && String(r.id) === rid);
      if (!rec) return missing(key);
      return { pillar: p, id: rid, title: String(rec.title || ""), status: classifyDocStatus(rec), found: true, sourceKey: key };
    }

    if (p === "hearth") {
      const matsKey = "prometheus.hearth.materials";
      const mat = (readArray(matsKey) || []).find((r) => r && String(r.id) === rid);
      if (mat) {
        return { pillar: p, id: rid, title: String(mat.title || mat.name || ""), status: String(mat.status || "planned"), found: true, sourceKey: matsKey };
      }
      const phasesKey = "prometheus.hearth.phases";
      const phase = (readArray(phasesKey) || []).find((r) => r && (String(r.id) === rid || "phase-" + String(r.id) === rid));
      if (phase) {
        return { pillar: p, id: rid, title: String(phase.title || ""), status: String(phase.status || "not-started"), found: true, sourceKey: phasesKey };
      }
      for (const extraKey of ["prometheus.hearth.assets", "prometheus.hearth.projects", "prometheus.hearth.rooms"]) {
        const rec = (readArray(extraKey) || []).find((r) => r && String(r.id) === rid);
        if (rec) {
          return { pillar: p, id: rid, title: String(rec.title || rec.name || ""), status: String(rec.status || (rec.done ? "done" : "active")), found: true, sourceKey: extraKey };
        }
      }
      return missing(matsKey);
    }

    if (p === "garage") {
      const key = "prometheus.garage.services";
      const rec = (readArray(key) || []).find((r) => r && String(r.id) === rid);
      if (!rec) return missing(key);
      const fallbackStatus = (rec.miles || rec.months)
        ? [rec.miles ? `${rec.miles} mi` : "", rec.months ? `${rec.months} mo` : ""].filter(Boolean).join(" / ")
        : "scheduled";
      return { pillar: p, id: rid, title: String(rec.title || rec.name || rec.item || ""), status: String(rec.status || fallbackStatus), found: true, sourceKey: key };
    }

    return missing("");
  }

  function getBus() {
    if (typeof globalThis !== "undefined" && globalThis.PB) return globalThis.PB;
    if (typeof window !== "undefined" && window.PB) return window.PB;
    return null;
  }

  function list() {
    return readLinks().map((r) => ({ ...r }));
  }

  function link(rec) {
    if (!rec || typeof rec !== "object") throw new Error("link requires an object");
    const fromPillar = String(rec.fromPillar || "").trim();
    const fromId = String(rec.fromId ?? "").trim();
    const toPillar = String(rec.toPillar || "").trim();
    const toId = String(rec.toId ?? "").trim();
    const kind = String(rec.kind || "related").trim();
    const label = rec.label != null ? String(rec.label).trim() : "";

    if (!fromPillar || !fromId || !toPillar || !toId || !kind) {
      throw new Error("link requires fromPillar, fromId, toPillar, toId, and kind");
    }

    const items = readLinks();
    const idx = items.findIndex((r) =>
      r &&
      r.fromPillar === fromPillar &&
      String(r.fromId) === fromId &&
      r.toPillar === toPillar &&
      String(r.toId) === toId &&
      r.kind === kind
    );

    if (idx >= 0) {
      const existing = items[idx];
      if (label && label !== existing.label) {
        items[idx] = { ...existing, label };
        writeLinks(items);
        return { ...items[idx] };
      }
      return { ...existing };
    }

    const id = stableId(fromPillar, fromId, toPillar, toId, kind);
    const entry = {
      id,
      fromPillar,
      fromId,
      toPillar,
      toId,
      kind,
      label,
      at: new Date().toISOString(),
    };
    items.push(entry);
    writeLinks(items);

    const bus = getBus();
    if (bus && bus.events && typeof bus.events.publish === "function") {
      const res = resolve(entry);
      const title = label || res.to.title || res.from.title || `${fromPillar}:${fromId} -> ${toPillar}:${toId} (${kind})`;
      bus.events.publish({ type: "link.created", pillar: fromPillar, ref: id, title });
    }

    return { ...entry };
  }

  function unlink(id) {
    const sid = String(id ?? "").trim();
    if (!sid) return false;
    const items = readLinks();
    const next = items.filter((r) => r && String(r.id) !== sid);
    if (next.length === items.length) return false;
    writeLinks(next);
    return true;
  }

  function forRecord(pillar, id) {
    const p = String(pillar || "").trim();
    const rid = String(id ?? "").trim();
    return readLinks()
      .filter((r) => r && ((r.fromPillar === p && String(r.fromId) === rid) || (r.toPillar === p && String(r.toId) === rid)))
      .map((r) => ({ ...r }));
  }

  function forPillar(pillar) {
    const p = String(pillar || "").trim();
    return readLinks()
      .filter((r) => r && (r.fromPillar === p || r.toPillar === p))
      .map((r) => ({ ...r }));
  }

  function resolve(linkOrId) {
    const linkObj = typeof linkOrId === "string"
      ? readLinks().find((r) => r && r.id === linkOrId) || null
      : linkOrId;
    if (!linkObj || typeof linkObj !== "object") return null;

    const from = resolveEndpoint(linkObj.fromPillar, linkObj.fromId);
    const to = resolveEndpoint(linkObj.toPillar, linkObj.toId);
    return {
      ...linkObj,
      link: { ...linkObj },
      from,
      to,
      title: to.title || from.title || linkObj.label || "",
      status: to.found ? to.status : "missing",
      resolved: Boolean(from.found || to.found),
    };
  }

  const PLinks = { link, unlink, list, forRecord, forPillar, resolve, _key: LKEY };
  if (typeof window !== "undefined") window.PLinks = PLinks;
  if (typeof globalThis !== "undefined") globalThis.PLinks = PLinks;
})();
