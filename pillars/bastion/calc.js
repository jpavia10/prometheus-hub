/* Bastion math (Sebastian, 2026-11-09): pure weight / import / readiness calculations. No DOM.
   window.BASTION = { totalWeight, fmtWeight, parseImport, readiness } */
(function () {
  "use strict";
  function totalWeight(items) {
    const byLoc = {}; let total = 0;
    for (const it of items) { const oz = (it.weightOz || 0) * (it.qty || 1); total += oz; byLoc[it.location || "bag"] = (byLoc[it.location || "bag"] || 0) + oz; }
    return { totalOz: total, byLoc };
  }
  const fmtWeight = (oz) => oz >= 16 ? `${Math.floor(oz / 16)} lb ${(oz % 16).toFixed(1).replace(/\.0$/, "")} oz` : `${oz.toFixed(1).replace(/\.0$/, "")} oz`;
  /** Paste-import: one item per line. Understands "2x Name", "Name x2", "Name — 3", or a bare name. */
  function parseImport(text) {
    const out = [];
    for (const line of String(text || "").split(/\r?\n/)) {
      const raw = line.trim(); if (!raw) continue;
      let m = raw.match(/^(\d+)\s*[x×]\s*(.+)$/i);
      if (m) { out.push({ name: m[2].trim(), qty: +m[1] || 1 }); continue; }
      const s = raw.replace(/^[-*•\d.)\s]+/, "").trim(); if (!s) continue;
      m = s.match(/^(.+?)\s*[x×]\s*(\d+)$/i);
      if (m) { out.push({ name: m[1].trim(), qty: +m[2] || 1 }); continue; }
      m = s.match(/^(.+?)\s*[—–-]\s*(\d+)$/); if (m) { out.push({ name: m[1].trim(), qty: +m[2] || 1 }); continue; }
      out.push({ name: s, qty: 1 });
    }
    return out;
  }
  const readiness = (checks) => { const all = Object.values(checks || {}); return all.length ? Math.round(all.filter(Boolean).length / all.length * 100) : 0; };
  const B = { totalWeight, fmtWeight, parseImport, readiness };
  if (typeof window !== "undefined") window.BASTION = B;
  if (typeof globalThis !== "undefined") globalThis.BASTION = B;
})();
