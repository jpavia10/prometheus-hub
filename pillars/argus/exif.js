/* Argus EXIF inspector (Sebastian, 2026-11-10): a minimal, honest JPEG EXIF reader.
   Parses APP1/Exif (TIFF header, IFD0, Exif and GPS sub-IFDs) in the browser; the photo never
   leaves the device and the original is never modified. Tag names come from the researched
   40-tag table (tags.js), each shown with what it leaks. window.EXIF = { parse }. */
(function () {
  "use strict";
  const TSIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  function parse(buf) {
    const dv = new DataView(buf);
    if (dv.byteLength < 4 || dv.getUint16(0) !== 0xFFD8) throw new Error("Not a JPEG file.");
    let off = 2, tiff = -1;
    while (off + 4 <= dv.byteLength) {
      const marker = dv.getUint16(off);
      if (marker === 0xFFDA) break;
      const len = dv.getUint16(off + 2);
      if (marker === 0xFFE1 && dv.getUint32(off + 4) === 0x45786966 && dv.getUint16(off + 8) === 0) { tiff = off + 10; break; }
      off += 2 + len;
    }
    if (tiff < 0) return { found: false, tags: [] };
    const le = dv.getUint16(tiff) === 0x4949;
    const u16 = (o) => dv.getUint16(o, le), u32 = (o) => dv.getUint32(o, le);
    const types = (o, type, count) => {
      const size = (TSIZE[type] || 1) * count;
      const at = size <= 4 ? o : tiff + u32(o);
      const vals = [];
      for (let i = 0; i < count; i++) {
        if (type === 2) vals.push(String.fromCharCode(dv.getUint8(at + i)));
        else if (type === 3) vals.push(u16(at + i * 2));
        else if (type === 4 || type === 9) vals.push(type === 9 ? dv.getInt32(at + i * 4, le) : u32(at + i * 4));
        else if (type === 5 || type === 10) { const n = type === 5 ? u32(at + i * 8) : dv.getInt32(at + i * 8, le); const d = type === 5 ? u32(at + i * 8 + 4) : dv.getInt32(at + i * 8 + 4, le); vals.push(d ? n / d : 0); }
        else if (type === 1 || type === 7) vals.push(dv.getUint8(at + i));
      }
      return type === 2 ? vals.join("").replace(/\0+$/, "") : vals;
    };
    const tags = [];
    const readIFD = (rel, group) => {
      const base = tiff + rel; if (base + 2 > dv.byteLength) return {};
      const n = u16(base); const ptrs = {};
      for (let i = 0; i < n; i++) {
        const e = base + 2 + i * 12; if (e + 12 > dv.byteLength) break;
        const id = u16(e), type = u16(e + 2), count = u32(e + 4);
        tags.push({ group, id, value: types(e + 8, type, count) });
        if (id === 0x8769) ptrs.exif = u32(e + 8);
        if (id === 0x8825) ptrs.gps = u32(e + 8);
      }
      return ptrs;
    };
    const p0 = readIFD(u32(tiff + 4), "IFD0");
    if (p0.exif) readIFD(p0.exif, "Exif");
    if (p0.gps) readIFD(p0.gps, "GPS");
    const get = (group, id) => (tags.find((t) => t.group === group && t.id === id) || {}).value;
    const r3 = (v) => (Array.isArray(v) && v.length === 3 ? v[0] + v[1] / 60 + v[2] / 3600 : null);
    const lat = r3(get("GPS", 0x0002)), lon = r3(get("GPS", 0x0004));
    const gps = lat != null && lon != null ? { lat: (get("GPS", 0x0001) === "S" ? -lat : lat), lon: (get("GPS", 0x0003) === "W" ? -lon : lon) } : null;
    return { found: true, tags, gps };
  }
  const E = { parse };
  if (typeof window !== "undefined") window.EXIF = E;
  if (typeof globalThis !== "undefined") globalThis.EXIF = E;
  if (typeof document === "undefined") return;
  const sec = document.getElementById("argus-exif"); if (!sec) return;
  const NAMES = {}; for (const t of window.EXIF_TAGS || []) NAMES[t.group + ":" + parseInt(t.id, 16)] = t;
  const fmt = (v) => Array.isArray(v) ? (v.length > 4 ? v.slice(0, 4).join(", ") + "…" : v.join(", ")) : String(v);
  sec.innerHTML = `<div class="glass" style="margin-top:14px"><h2>EXIF inspector — what a photo gives away</h2>
    <p class="note">Pick a JPEG from this device. It is read here, in the browser — never uploaded, never modified. Before you post a photo anywhere (a Marketplace listing, say), this is what travels with it.</p>
    <input type="file" id="ax-file" accept="image/jpeg,.jpg,.jpeg">
    <div id="ax-out" style="margin-top:10px"></div></div>`;
  document.getElementById("ax-file").addEventListener("change", async (ev) => {
    const f = ev.target.files[0]; const out = document.getElementById("ax-out"); if (!f) return;
    try {
      const r = E.parse(await f.arrayBuffer());
      if (!r.found) { out.innerHTML = `<div class="bill">No EXIF block in this file — nothing to leak.</div>`; return; }
      out.innerHTML = (r.gps ? `<div class="bill"><div class="bill-when">GPS location embedded</div><p style="margin:2px 0">${r.gps.lat.toFixed(5)}, ${r.gps.lon.toFixed(5)} — anyone who gets this file can map where it was taken.</p></div>` : "")
        + r.tags.map((t) => { const meta = NAMES[t.group + ":" + t.id];
            return `<div class="bill"><span class="bill-when">${t.group} · ${meta ? meta.name : "tag 0x" + t.id.toString(16)}</span> — ${fmt(t.value)}${meta ? `<br><span>Leaks: ${meta.leaks}</span>` : ""}</div>`; }).join("");
    } catch (err) { out.innerHTML = `<div class="bill">${err.message}</div>`; }
  });
})();
