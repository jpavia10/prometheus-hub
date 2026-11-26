/* Argus Album v2: every picture the pillars use + client-side forensics, 64-bit dHash duplicate clustering,
   20-rule numismatic optical grader, obverse/reverse pairing & Hearth before/after split slider.  (ARG-GEM-03)  (ARG-GEM-05) */
(function () {
  "use strict";
  const { $, h, day, toast, tabs, field, G, download, pickFile, store } = PK;
  const S = store("argus");
  const app = $("#app");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* The corpus binder's data is Joseph's real photo program (corpus-data.js), seeded once into this
     pillar's own store; after the seed the stored copy is the record and the shipped file only
     matters for fresh devices. */
  if (!S.get("corpusSeedV1") && window.ARGUS_CORPUS) { S.set("corpus", window.ARGUS_CORPUS); S.set("corpusSeedV1", 1); }
  const corpus = () => S.get("corpus", null) || window.ARGUS_CORPUS || null;
  const TITAN = new URLSearchParams(location.search).get("titan") || "https://jpavia10.github.io/titan-reliquary-preview/";

  field({ count: 900, at: [0.72, 0.34], scale: 0.3, glyph: (n) => [
    ...G.ring(Math.round(n * 0.3), 1.1, 0, 0.62, -Math.PI * 0.79, -Math.PI * 0.21), ...G.ring(Math.round(n * 0.3), 1.1, 0, -0.62, Math.PI * 0.21, Math.PI * 0.79),
    ...G.ring(Math.round(n * 0.24), 0.3), ...G.ring(Math.round(n * 0.08), 0.1)] });

  const PILLARS = ["Titan", "Hearth", "Apollo", "Midas", "Hermes", "Kairos", "Icarus", "Mythos", "Other"];
  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-all" aria-controls="p-all">Album & Clusters</button>
      <button class="tab" role="tab" id="t-corpus" aria-controls="p-corpus">Corpus Binder</button>
      <button class="tab" role="tab" id="t-add" aria-controls="p-add">Ingest & Scrub</button>
      <button class="tab" role="tab" id="t-exif" aria-controls="p-exif">EXIF Forensics</button>
      <button class="tab" role="tab" id="t-coin" aria-controls="p-coin">Coin 20-Rule QC</button>
      <button class="tab" role="tab" id="t-cmp" aria-controls="p-cmp">Hearth Compare</button>
    </div>
    <section id="p-all" role="tabpanel">
      <div class="grid" style="margin-bottom:14px">
        <div class="glass lit span-4"><div class="stat-k">Photos</div><div class="stat-v big" id="g-n">—</div><div class="stat-s" id="g-n-s"></div></div>
        <div class="glass span-8"><h2>Look through · Pair · Dedup</h2><div class="tabs" id="g-pill"></div>
          <input id="g-q" type="search" placeholder="Search: country, year, C number, pair ID, word" aria-label="Search the album"><div class="tabs" id="g-sub" style="margin-top:10px"></div>
          <div class="row-actions" style="margin-top:8px"><button class="btn quiet small" id="g-dup-toggle" type="button">Filter duplicates only (0)</button></div>
        </div>
      </div>
      <div id="g-grid" class="album"></div><p class="note" id="g-src"></p>
    </section>
    <section id="p-corpus" role="tabpanel">
      <div class="grid">
        <div class="glass lit span-5"><h2>Duplicate review — the queue</h2><div id="c-dup"></div></div>
        <div class="glass span-7"><h2>Batch protocol (strict, set 2026-09-25)</h2><div id="c-protocol"></div></div>
        <div class="glass span-6"><h2>The Vault — where keepers land</h2><div id="c-vault"></div></div>
        <div class="glass span-6"><h2>Cleanup boundaries</h2><div id="c-bounds"></div></div>
        <div class="glass span-12"><h2>Titan coin-photo pipeline — the second corpus</h2><div id="c-titan"></div></div>
        <div class="glass span-12"><h2>Review batches logged on this device</h2>
          <form class="form" id="c-batch-form">
            <label class="f">Date<input name="date" type="date" required></label>
            <label class="f">Pairs reviewed<input name="pairs" type="number" min="1" max="10" required></label>
            <label class="f wide">Note<input name="note" maxlength="120" placeholder="Decision code verified · staging folder trashed · keeps relocated"></label>
            <button class="btn" type="submit">Log batch</button>
          </form>
          <div id="c-batches" style="margin-top:10px"></div>
          <p class="note">This log lives on this device and doesn't change the Drive queue — Sebastian executes the grouped trash from the decision code in chat, per the protocol above.</p>
        </div>
      </div>
    </section>
    <section id="p-add" role="tabpanel" class="grid"><div class="glass span-12"><h2>Add & strip metadata locally</h2>
      <form class="form" id="g-form">
        <label class="f">Pillar<select name="pillar">${PILLARS.filter((p) => p !== "Titan").map((p) => `<option>${p}</option>`).join("")}</select></label>
        <label class="f">Pair Role<select name="role"><option value="single">Single photo</option><option value="obverse">Coin Obverse</option><option value="reverse">Coin Reverse</option><option value="before">Hearth Before</option><option value="after">Hearth After</option></select></label>
        <label class="f">Pair / Group ID<input name="pairId" maxlength="40" placeholder="deck-east, morgan-1889"></label>
        <label class="f wide">Caption<input name="caption" maxlength="140" placeholder="Bathroom before demo, 1889 Morgan obverse"></label>
        <label class="f wide">Photos<input name="files" type="file" accept="image/*" multiple required></label>
        <button class="btn" type="submit">Clean EXIF & Add to Album</button>
      </form>
      <p class="note">Every upload is decoded and redrawn onto an offscreen canvas (stripping GPS, camera serials, thumbnails & IPTC), fingerprinted with a 64-bit dHash, scored against 20 optical checks, and stored strictly on this device.</p></div></section>
    <section id="p-exif" role="tabpanel" class="grid"><div id="argus-exif" class="span-12"></div></section>
    <section id="p-coin" role="tabpanel" class="grid"><div class="glass span-12"><h2>20-Rule Numismatic Photo Quality Grader</h2>
      <p class="note">Drop or pick any coin photo (or score local uploads automatically). Inspects resolution, framing center, glare/highlight clipping, shadow crush, tonal contrast, edge acutance & color neutrality in the browser.</p>
      <form class="form"><label class="f wide">Test image<input id="qc-file" type="file" accept="image/*"></label></form>
      <div id="qc-summary" style="margin-top:10px"></div>
      <div id="qc-rules" class="qc-grid"></div>
    </div></section>
    <section id="p-cmp" role="tabpanel" class="grid"><div class="glass span-12"><h2>Hearth Before / After Split Compare</h2>
      <p class="note">Compares photos you added on this device (Ingest &amp; Scrub, pair roles Before / After). There are no demo images — an empty album shows an empty compare.</p>
      <form class="form"><label class="f">Left (Before)<select id="cmp-a"></select></label><label class="f">Right (After)<select id="cmp-b"></select></label></form>
      <div class="cmp-wrap" id="cmp-box"><canvas id="cmp-ca"></canvas><canvas id="cmp-cb" class="cmp-after"></canvas><div class="cmp-line"></div><span class="cmp-label left">BEFORE</span><span class="cmp-label right">AFTER</span></div>
      <input id="cmp-range" type="range" min="0" max="100" value="50" style="width:100%" aria-label="Before and after split position">
    </div></section>
    <dialog id="g-view" class="viewer"><form method="dialog"><button class="btn quiet small" aria-label="Close">Close</button></form><img alt=""><p class="cap"></p><div class="row-actions" id="g-view-acts"></div></dialog>`;

  const idb = new Promise((res, rej) => {
    const r = indexedDB.open("prometheus-argus", 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("photos")) r.result.createObjectStore("photos", { keyPath: "id" }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => { const db = await idb; return new Promise((res, rej) => { const t = db.transaction("photos", mode), s = t.objectStore("photos"); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }); };
  const allLocal = () => tx("readonly", (s) => s.getAll());

  function syncIdbMirror(rows) {
    const list = rows || [];
    try {
      const meta = list.map(({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height }) => ({ id, pillar, caption, at, dhash, grade, pairId, pairRole, width, height }));
      localStorage.setItem("prometheus.argus.idbMeta", JSON.stringify(meta));
    } catch {}
    Promise.all(list.map((r) => new Promise((res) => {
      const base = { id: r.id, pillar: r.pillar, caption: r.caption, at: r.at, dhash: r.dhash, grade: r.grade, pairId: r.pairId, pairRole: r.pairRole, width: r.width, height: r.height };
      if (r.blobDataUrl) return res({ ...base, blobDataUrl: r.blobDataUrl });
      if (!r.blob) return res({ ...base, blobDataUrl: null });
      const fr = new FileReader();
      fr.onload = () => res({ ...base, blobDataUrl: typeof fr.result === "string" ? fr.result : null });
      fr.onerror = () => res({ ...base, blobDataUrl: null });
      fr.readAsDataURL(r.blob);
    }))).then((full) => {
      try { localStorage.setItem("prometheus.argus.idbSnapshot", JSON.stringify(full)); } catch {}
    }).catch(() => {});
  }

  function dHashFromCanvas(srcCv) {
    const c = document.createElement("canvas"); c.width = 9; c.height = 8;
    const g = c.getContext("2d"); g.drawImage(srcCv, 0, 0, 9, 8);
    const d = g.getImageData(0, 0, 9, 8).data;
    const lum = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let hi = 0, lo = 0, bit = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const l = lum((y * 9 + x) * 4), r = lum((y * 9 + x + 1) * 4);
      if (l > r) { if (bit < 32) hi |= (1 << bit); else lo |= (1 << (bit - 32)); }
      bit++;
    }
    return ((hi >>> 0).toString(16).padStart(8, "0")) + ((lo >>> 0).toString(16).padStart(8, "0"));
  }
  const hamming = (h1, h2) => {
    if (!h1 || !h2 || h1.length !== 16 || h2.length !== 16) return 64;
    let dist = 0;
    for (let k = 0; k < 2; k++) {
      let x = (parseInt(h1.slice(k * 8, k * 8 + 8), 16) ^ parseInt(h2.slice(k * 8, k * 8 + 8), 16)) >>> 0;
      while (x) { x &= x - 1; dist++; }
    }
    return dist;
  };

  function evaluateCoinQC(cv) {
    const w = cv.width, h0 = cv.height, ar = Math.max(w, h0) / Math.max(1, Math.min(w, h0));
    const sw = 128, sh = 128, tc = document.createElement("canvas"); tc.width = sw; tc.height = sh;
    const g = tc.getContext("2d"); g.drawImage(cv, 0, 0, sw, sh);
    const d = g.getImageData(0, 0, sw, sh).data;
    let sumL = 0, sumSq = 0, clipHi = 0, crushLo = 0, edgeSum = 0, edgeCnt = 0, satSum = 0;
    const quad = [0, 0, 0, 0], qn = [0, 0, 0, 0];
    const centerBox = { lum: 0, n: 0 }, borderBox = { lum: 0, n: 0 };
    const L = new Float32Array(sw * sh);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4, r = d[i], g0 = d[i + 1], b = d[i + 2];
      const yv = 0.299 * r + 0.587 * g0 + 0.114 * b;
      L[y * sw + x] = yv; sumL += yv; sumSq += yv * yv;
      if (yv >= 248) clipHi++; if (yv <= 10) crushLo++;
      const mx = Math.max(r, g0, b), mn = Math.min(r, g0, b);
      satSum += mx ? (mx - mn) / mx : 0;
      const qi = (y >= sh / 2 ? 2 : 0) + (x >= sw / 2 ? 1 : 0);
      quad[qi] += yv; qn[qi]++;
      if (x > 24 && x < 104 && y > 24 && y < 104) { centerBox.lum += yv; centerBox.n++; } else { borderBox.lum += yv; borderBox.n++; }
    }
    for (let y = 1; y < sh - 1; y++) for (let x = 1; x < sw - 1; x++) {
      const p = y * sw + x;
      const gx = Math.abs(L[p + 1] - L[p - 1]), gy = Math.abs(L[p + sw] - L[p - sw]);
      edgeSum += gx + gy; edgeCnt++;
    }
    const N = sw * sh, mean = sumL / N, std = Math.sqrt(Math.max(0, sumSq / N - mean * mean));
    const qMeans = quad.map((s, i) => s / Math.max(1, qn[i])), lightSpread = Math.max(...qMeans) - Math.min(...qMeans);
    const clipPct = clipHi / N * 100, crushPct = crushLo / N * 100, acutance = edgeSum / Math.max(1, edgeCnt), avgSat = satSum / N;
    const centerDiff = Math.abs(centerBox.lum / Math.max(1, centerBox.n) - borderBox.lum / Math.max(1, borderBox.n));
    const rules = [
      ["1. Long edge >= 800 px", Math.max(w, h0) >= 800, `${Math.max(w, h0)} px`],
      ["2. Short edge >= 600 px", Math.min(w, h0) >= 600, `${Math.min(w, h0)} px`],
      ["3. Square/balanced framing (<= 1.65x)", ar <= 1.65, `${ar.toFixed(2)}:1`],
      ["4. Minimum contrast spread (std >= 26)", std >= 26, `std ${std.toFixed(1)}`],
      ["5. Not washed out (std <= 88)", std <= 88, `std ${std.toFixed(1)}`],
      ["6. Exposure floor (mean >= 48)", mean >= 48, `${mean.toFixed(0)}/255`],
      ["7. Exposure ceiling (mean <= 215)", mean <= 215, `${mean.toFixed(0)}/255`],
      ["8. Highlight glare < 4.5%", clipPct < 4.5, `${clipPct.toFixed(1)}%`],
      ["9. Extreme blowout < 1.5% above 250", clipPct < 1.5, `${clipPct.toFixed(1)}%`],
      ["10. Shadow crush < 12%", crushPct < 12, `${crushPct.toFixed(1)}%`],
      ["11. Even left-right lighting (< 38 delta)", Math.abs((qMeans[0] + qMeans[2]) / 2 - (qMeans[1] + qMeans[3]) / 2) < 38, `Δ${Math.abs((qMeans[0] + qMeans[2]) / 2 - (qMeans[1] + qMeans[3]) / 2).toFixed(0)}`],
      ["12. Even top-bottom lighting (< 42 delta)", Math.abs((qMeans[0] + qMeans[1]) / 2 - (qMeans[2] + qMeans[3]) / 2) < 42, `Δ${Math.abs((qMeans[0] + qMeans[1]) / 2 - (qMeans[2] + qMeans[3]) / 2).toFixed(0)}`],
      ["13. Max quadrant skew <= 55", lightSpread <= 55, `${lightSpread.toFixed(0)}`],
      ["14. Edge sharpness / acutance >= 14", acutance >= 14, `${acutance.toFixed(1)}`],
      ["15. Crisp relief detail (>= 20)", acutance >= 20, `${acutance.toFixed(1)}`],
      ["16. Center-to-rim subject separation >= 6", centerDiff >= 6, `Δ${centerDiff.toFixed(1)}`],
      ["17. Controlled color cast (sat <= 0.42)", avgSat <= 0.42, `${(avgSat * 100).toFixed(0)}%`],
      ["18. Non-flat surface entropy", acutance * std > 420, `${Math.round(acutance * std)}`],
      ["19. No clipped specular ringout", clipPct + crushPct < 14, `${(clipPct + crushPct).toFixed(1)}%`],
      ["20. Archive print-ready pixels >= 0.48 MP", w * h0 >= 480000, `${(w * h0 / 1e6).toFixed(2)} MP`],
    ];
    const score = Math.round(rules.filter((r) => r[1]).length / rules.length * 100);
    return { score, rules };
  }

  async function clean(file) {
    /* ARG-GEM-11 (2026-11-22): a HEIC/HEIF photo this browser cannot decode is refused with the way out, never half cleaned. */
    const heif = /image\/hei[cf]/i.test(file.type || "") || /\.(heic|heif)$/i.test(file.name || "");
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }
    catch (e) { throw new Error(heif ? `${file.name}: this browser cannot read HEIC photos, so Argus cannot clean it. Send it as JPEG, or turn off "High efficiency pictures" in the camera settings.` : `${file.name}: this image could not be read (${e.message}).`); }
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
    const dhash = dHashFromCanvas(cv), qc = evaluateCoinQC(cv);
    const blob = await new Promise((res) => cv.toBlob(res, "image/webp", 0.86));
    return { blob, dhash, grade: qc.score, width: cv.width, height: cv.height };
  }

  let titan = [], local = [], urls = [], pill = "", sub = "", dupOnly = false;

  function findDupSet() {
    const dups = new Set();
    for (let i = 0; i < local.length; i++) for (let j = i + 1; j < local.length; j++) {
      if (hamming(local[i].dhash, local[j].dhash) <= 6) { dups.add(local[i].id); dups.add(local[j].id); }
    }
    return dups;
  }

  function render() {
    urls.forEach(URL.revokeObjectURL); urls = [];
    const dups = findDupSet();
    $("#g-dup-toggle").textContent = `${dupOnly ? "Show all" : "Filter duplicates only"} (${dups.size})`;
    const items = [...titan, ...local.map((p) => {
      const u = URL.createObjectURL(p.blob); urls.push(u);
      return { src: u, pillar: p.pillar, title: p.caption || p.pillar, sub: p.at.slice(0, 10), group: p.pairId || p.pillar, id: p.id, local: true, dup: dups.has(p.id), grade: p.grade, role: p.pairRole, pairId: p.pairId };
    })];
    $("#g-n").textContent = items.length;
    $("#g-n-s").textContent = (PILLARS.map((p) => [p, items.filter((i) => i.pillar === p).length]).filter((x) => x[1]).map((x) => `${x[0]} ${x[1]}`).join(" · ") || "No photos yet.") + (dups.size ? ` · ${dups.size} near-dups` : "");
    const gp = $("#g-pill"); gp.innerHTML = "";
    ["", ...PILLARS.filter((p) => items.some((i) => i.pillar === p))].forEach((p) => gp.append(h("button.chip" + (p === pill ? ".on" : ""), { type: "button", onclick: () => { pill = p; sub = ""; render(); } }, p || "Every pillar")));
    const inP = items.filter((i) => (!pill || i.pillar === pill) && (!dupOnly || i.dup)), groups = [...new Set(inP.map((i) => i.group))].sort();
    const gs = $("#g-sub"); gs.innerHTML = "";
    if (pill && groups.length > 1) ["", ...groups].forEach((g) => gs.append(h("button.chip" + (g === sub ? ".on" : ""), { type: "button", onclick: () => { sub = g; render(); } }, g || "All")));
    const q = $("#g-q").value.trim().toLowerCase();
    const shown = inP.filter((i) => (!sub || i.group === sub) && (!q || `${i.title} ${i.sub} ${i.id} ${i.group} ${i.pairId || ""} ${i.role || ""}`.toLowerCase().includes(q)));
    const grid = $("#g-grid"); grid.innerHTML = "";
    if (!shown.length) grid.append(h("p.empty", null, dupOnly ? "No duplicate photos detected." : "No photos match."));
    shown.slice(0, 400).forEach((i) => grid.append(h("button.ph", { type: "button", title: i.title, onclick: () => open(i) },
      h("img", { src: i.src, alt: i.title, loading: "lazy", decoding: "async" }),
      i.dup ? h("b.ph-dup", null, "DUP") : null,
      i.grade != null ? h("b.ph-badge", null, `${i.role && i.role !== "single" ? i.role[0].toUpperCase() + " · " : ""}${i.grade}%`) : null,
      h("span", null, i.title, h("small", null, `${i.pillar}${i.pairId ? " · " + i.pairId : ""} · ${i.sub}`)))));
    if (shown.length > 400) grid.append(h("p.note", null, `Showing 400 of ${shown.length}. Search to narrow it.`));
    syncCompareOptions();
  }

  function open(i) {
    const d = $("#g-view"); d.querySelector("img").src = i.src; d.querySelector("img").alt = i.title;
    d.querySelector(".cap").textContent = `${i.title} · ${i.sub} · ${i.pillar}${i.pairId ? ` · pair ${i.pairId}` : ""}${i.grade != null ? ` · QC ${i.grade}%` : ""}`;
    const a = $("#g-view-acts"); a.innerHTML = "";
    if (i.local) a.append(h("button.btn.quiet.small", { type: "button", onclick: async () => { if (!confirm("Remove this photo from the album?")) return; await tx("readwrite", (s) => s.delete(i.id)); d.close(); local = await allLocal(); syncIdbMirror(local); render(); toast("Removed"); } }, "Delete"));
    if (i.link) a.append(h("a.btn.quiet.small", { href: i.link, target: "_blank", rel: "noopener noreferrer" }, "Open in Titan"));
    d.showModal();
  }

  /* No demo images: with no photos of the user's own on this device, the compare shows an honest
     empty state instead of a painted stand-in. */
  function paintEmptyCompare(cv) {
    cv.width = 640; cv.height = 400; const g = cv.getContext("2d");
    g.fillStyle = "#10151d"; g.fillRect(0, 0, 640, 400);
    g.strokeStyle = "rgba(159,212,230,.35)"; g.lineWidth = 2; g.strokeRect(14, 14, 612, 372);
    g.textAlign = "center";
    g.fillStyle = "#dfe6f5"; g.font = "600 19px Outfit, sans-serif";
    g.fillText("No photos on this device yet", 320, 182);
    g.font = "400 14px Outfit, sans-serif"; g.fillStyle = "rgba(223,230,245,.72)";
    g.fillText("Add a real before / after pair in Ingest & Scrub,", 320, 212);
    g.fillText("then pick the pair here to compare it.", 320, 234);
    g.textAlign = "left";
  }

  function syncCompareOptions() {
    const sa = $("#cmp-a"), sb = $("#cmp-b"); if (!sa || !sb) return;
    const opts = local.map((p, idx) => `<option value="${idx}">${(p.caption || p.pillar)} (${p.pairRole || "photo"})</option>`).join("");
    sa.innerHTML = opts || `<option value="">No photos on this device yet</option>`;
    sb.innerHTML = opts || `<option value="">No photos on this device yet</option>`;
    if (local.length > 1) sb.selectedIndex = Math.min(1, local.length - 1);
    drawCompare();
  }

  async function drawCompare() {
    const ca = $("#cmp-ca"), cb = $("#cmp-cb"); if (!ca || !cb) return;
    const va = $("#cmp-a").value, vb = $("#cmp-b").value;
    if (!local.length) { paintEmptyCompare(ca); paintEmptyCompare(cb); return; }
    for (const [el, val] of [[ca, va], [cb, vb]]) {
      const item = local[Number(val)] || local[0]; if (!item) continue;
      const bmp = await createImageBitmap(item.blob); el.width = 640; el.height = 400; el.getContext("2d").drawImage(bmp, 0, 0, 640, 400);
    }
  }

  $("#cmp-range").addEventListener("input", (e) => $("#cmp-box").style.setProperty("--pos", e.target.value + "%"));
  $("#cmp-a").addEventListener("change", drawCompare); $("#cmp-b").addEventListener("change", drawCompare);
  $("#g-dup-toggle").addEventListener("click", () => { dupOnly = !dupOnly; render(); });

  $("#qc-file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const bmp = await createImageBitmap(f, { imageOrientation: "from-image" });
    const cv = document.createElement("canvas"); cv.width = bmp.width; cv.height = bmp.height; cv.getContext("2d").drawImage(bmp, 0, 0);
    const res = evaluateCoinQC(cv);
    $("#qc-summary").innerHTML = `<div class="kv"><span>Optical Grade (${f.name} · ${cv.width}×${cv.height})</span><b>${res.score}% (${res.rules.filter((r) => r[1]).length}/20 passed)</b></div>`;
    $("#qc-rules").innerHTML = res.rules.map(([label, ok, val]) => `<div class="qc-item ${ok ? "pass" : "fail"}"><b>${ok ? "PASS" : "WARN"}</b> · ${label}<div class="stat-s">${val}</div></div>`).join("");
  });

  $("#g-q").addEventListener("input", render);
  $("#g-form").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.target, files = [...f.files.files]; let n = 0;
    for (const file of files) {
      try {
        const res = await clean(file);
        await tx("readwrite", (s) => s.put({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), pillar: f.pillar.value, pairRole: f.role.value, pairId: f.pairId.value.trim(), caption: f.caption.value.trim() || file.name, at: new Date().toISOString(), blob: res.blob, dhash: res.dhash, grade: res.grade, width: res.width, height: res.height }));
        n++;
      } catch (err) { toast(err.message); }
    }
    f.files.value = ""; toast(`Added ${n} photo${n === 1 ? "" : "s"} (EXIF stripped)`);
    local = await allLocal(); syncIdbMirror(local); render();
  });

  /* Auditor's-console renderers for the Corpus Binder: numbered rails, a directory tree,
     audit lists and step flows. Presentation only — every string comes from corpus-data.js. */
  const railRows = (arr) => `<ol class="rail">${arr.map((x, i) => `<li><span class="rail-n">${String(i + 1).padStart(2, "0")}</span><span class="rail-t">${esc(x)}</span></li>`).join("")}</ol>`;
  const flowSteps = (arr) => `<ol class="flow">${arr.map((x, i) => `<li><span class="flow-n">Step ${i + 1}</span><span class="flow-t">${esc(x)}</span></li>`).join("")}</ol>`;
  const auditList = (arr, cls) => `<ul class="audit ${cls}">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

  function paintCorpus() {
    const C = corpus(); if (!C) return;
    const D = C.dupReview;
    const figParts = String(D.remainingLabel).split(" ");
    const figNum = figParts.shift() || D.remainingLabel, figUnit = figParts.join(" ");
    $("#c-dup").innerHTML = `
      <div class="snap">
        <div class="snap-fig">
          <div class="stat-k">Pairs remaining</div>
          <div class="snap-num">${esc(figNum)}${figUnit ? ` <small>${esc(figUnit)}</small>` : ""}</div>
        </div>
        <div class="stamp" role="img" aria-label="Snapshot as of ${esc(D.remainingAsOf)} — not a live count">
          <span class="stamp-k">Snapshot</span><span class="stamp-d">${esc(D.remainingAsOf)}</span><span class="stamp-s">Not a live count</span>
        </div>
      </div>
      <p class="note snap-note">${esc(D.countNote)}</p>
      <div class="kv"><span>Queue file · one file, link-shared</span><b class="mono">${esc(D.queuePath)}</b></div>
      <div class="kv"><span>Drive file ID</span><b class="mono">${esc(D.queueFileId)}</b></div>
      <h3 class="sub-h">How a review runs</h3>${railRows(D.flow)}
      <div class="row-actions" style="margin-top:12px"><a class="btn small" href="${esc(D.appUrl)}" target="_blank" rel="noopener noreferrer">Open the review app</a></div>`;
    $("#c-protocol").innerHTML = railRows(D.protocol);
    $("#c-vault").innerHTML = `
      <div class="tree">
        <div class="tree-root mono">Sebastian/</div>
        <div class="tree-node mono">Vault/</div>
        <div class="tree-kids">${C.vault.targets.map((t) => `<div class="tree-row"><span class="tree-kind">${esc(t.kind)}</span><span class="tree-path mono">${esc(t.path)}</span></div>`).join("")}</div>
      </div>
      <p class="note">${esc(C.vault.yearRule)}</p><p class="note">${esc(C.vault.rootNote)}</p>`;
    $("#c-bounds").innerHTML = `<h3 class="sub-h bad-h">Never target</h3>${auditList(C.boundaries.never, "never")}`
      + `<h3 class="sub-h good-h">Hunt first</h3>${auditList(C.boundaries.hunt, "hunt")}`
      + `<h3 class="sub-h">Standing rules</h3>${auditList(C.boundaries.rules, "rules")}`;
    const T = C.titan;
    $("#c-titan").innerHTML = `
      <div class="specimen">
        <div class="stat-k">Photo naming — the NOID pattern</div>
        <div class="specimen-pattern mono">${esc(T.naming)}</div>
        <div class="specimen-ex">${T.examples.map((e) => `<span class="mono-chip">${esc(e)}</span>`).join("")}</div>
      </div>
      <div class="folders">
        <div class="folder"><div class="stat-k">Drive folder</div><div class="folder-label">${esc(T.staging.label)}</div><div class="mono folder-id">${esc(T.staging.id)}</div></div>
        <div class="folder"><div class="stat-k">Drive folder</div><div class="folder-label">${esc(T.drop.label)}</div><div class="mono folder-id">${esc(T.drop.id)}</div></div>
      </div>
      <h3 class="sub-h">How a coin photo travels</h3>${flowSteps(T.flow)}
      <h3 class="sub-h">Pipeline rules</h3>${auditList(T.rules, "check")}`;
    paintBatches();
  }

  function paintBatches() {
    const box = $("#c-batches"); if (!box) return;
    const rows = S.list("batches").slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const total = rows.reduce((s, r) => s + (+r.pairs || 0), 0);
    box.innerHTML = (rows.length ? `<div class="kv"><span>Logged here: ${rows.length} batch${rows.length === 1 ? "" : "es"} · ${total} pairs</span></div>` : "")
      + (rows.map((r) => `<div class="kv"><span>${esc(r.date)} · ${esc(r.pairs)} pairs${r.note ? ` · ${esc(r.note)}` : ""}</span><span class="row-actions"><button class="btn quiet small" type="button" data-batch-del="${esc(r.id)}">Remove</button></span></div>`).join("")
      || `<p class="empty">No batches logged yet. The pre-app batches (1–7) were executed from chat decision codes; log new ones here as they run.</p>`);
    box.querySelectorAll("[data-batch-del]").forEach((b) => (b.onclick = () => { S.remove("batches", b.dataset.batchDel); paintBatches(); }));
  }

  $("#c-batch-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("batches", { date: f.date.value, pairs: +f.pairs.value || 0, note: f.note.value.trim() });
    f.reset(); toast("Batch logged"); paintBatches();
  });

  $("#export").onclick = () => download(`argus_${day()}.json`, { v: 2, pillar: "argus", exported: new Date().toISOString(), meta: local.map(({ id, pillar, caption, at, dhash, grade, pairId, pairRole }) => ({ id, pillar, caption, at, dhash, grade, pairId, pairRole })), corpus: S.get("corpus", null), batches: S.list("batches") });
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { const obj = JSON.parse(await f.text()); toast(`Read ${obj.meta ? obj.meta.length : 0} photo metadata records (binary blobs stay local)`); } catch (e) { toast(e.message); } };

  $("#c-batch-form").date.value = day();
  paintCorpus();
  tabs(app, () => requestAnimationFrame(render));
  allLocal().then((r) => { local = r; syncIdbMirror(local); render(); });
  fetch(TITAN + "data/index.json").then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((d) => {
    titan = (d.flips || []).filter((c) => c.thumb).map((c) => ({
      src: TITAN + c.thumb.replace("photos/p1/", "photos/cut/"), pillar: "Titan",
      title: c.label || `${c.country} ${c.year}`, sub: c.id || "", group: c.country || "Coin", id: c.id || "",
      link: `${TITAN}#flips`, grade: null,
    }));
    $("#g-src").textContent = `${titan.length} Titan coin photos loaded live from the Titan Reliquary — borrowed for viewing as published; Argus does not grade another pillar's photos.`;
    render();
  }).catch(() => { $("#g-src").textContent = "Could not load Titan coin archive (offline or local test mode). Local vault ready."; render(); });
})();
