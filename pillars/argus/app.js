/* Argus Album v1 (Claude, 2026-11-05): every picture the pillars use. Titan's coin photos come live from the published Titan site
   (its data/index.json); photos Joseph adds are re-drawn through a canvas (that drops EXIF, GPS included), shrunk to 1600 px and kept
   in this browser (IndexedDB), tagged by pillar. Nothing is uploaded. */
(function () {
  "use strict";
  const { $, h, day, toast, tabs, field, G, download } = PK;
  const app = $("#app");
  const TITAN = new URLSearchParams(location.search).get("titan") || "https://jpavia10.github.io/titan-reliquary-preview/";

  // an eye: two arcs and an iris
  field({ count: 900, at: [0.72, 0.34], scale: 0.3, glyph: (n) => [
    ...G.ring(Math.round(n * 0.3), 1.1, 0, 0.62, -Math.PI * 0.79, -Math.PI * 0.21), ...G.ring(Math.round(n * 0.3), 1.1, 0, -0.62, Math.PI * 0.21, Math.PI * 0.79),
    ...G.ring(Math.round(n * 0.24), 0.3), ...G.ring(Math.round(n * 0.08), 0.1)] });

  const PILLARS = ["Titan", "Hearth", "Apollo", "Midas", "Hermes", "Kairos", "Icarus", "Other"];
  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-all" aria-controls="p-all">Album</button>
      <button class="tab" role="tab" id="t-add" aria-controls="p-add">Add photos</button>
    </div>
    <section id="p-all" role="tabpanel">
      <div class="grid" style="margin-bottom:14px">
        <div class="glass lit span-4"><div class="stat-k">Photos</div><div class="stat-v big" id="g-n">—</div><div class="stat-s" id="g-n-s"></div></div>
        <div class="glass span-8"><h2>Look through</h2><div class="tabs" id="g-pill"></div>
          <input id="g-q" type="search" placeholder="Search: country, year, C number, a word" aria-label="Search the album"><div class="tabs" id="g-sub" style="margin-top:10px"></div></div>
      </div>
      <div id="g-grid" class="album"></div><p class="note" id="g-src"></p>
    </section>
    <section id="p-add" role="tabpanel" class="grid"><div class="glass span-12"><h2>Add from this phone</h2>
      <form class="form" id="g-form"><label class="f">Pillar<select name="pillar">${PILLARS.filter((p) => p !== "Titan").map((p) => `<option>${p}</option>`).join("")}</select></label>
        <label class="f wide">Caption<input name="caption" maxlength="140" placeholder="Bathroom before demo, week 3 progress"></label>
        <label class="f wide">Photos<input name="files" type="file" accept="image/*" multiple required></label><button class="btn" type="submit">Add to the album</button></form>
      <p class="note">Each photo is redrawn before it is kept, which removes its location and camera data, and it stays on this device. Titan coin photos are not added here: they come from the Titan app.</p></div></section>
    <dialog id="g-view" class="viewer"><form method="dialog"><button class="btn quiet small" aria-label="Close">Close</button></form><img alt=""><p class="cap"></p><div class="row-actions" id="g-view-acts"></div></dialog>`;

  // IndexedDB: one store "photos" {id, pillar, caption, at, blob}
  const idb = new Promise((res, rej) => { const r = indexedDB.open("prometheus-argus", 1); r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id" }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const tx = async (mode, fn) => { const db = await idb; return new Promise((res, rej) => { const t = db.transaction("photos", mode), s = t.objectStore("photos"); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }); };
  const allLocal = () => tx("readonly", (s) => s.getAll());

  async function clean(file) {   // decode, scale to 1600 px, re-encode: EXIF (GPS) does not survive a canvas
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k); cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
    return new Promise((res) => cv.toBlob(res, "image/webp", 0.86));
  }

  let titan = [], local = [], urls = [], pill = "", sub = "";
  function render() {
    urls.forEach(URL.revokeObjectURL); urls = [];
    const items = [...titan, ...local.map((p) => { const u = URL.createObjectURL(p.blob); urls.push(u); return { src: u, pillar: p.pillar, title: p.caption || p.pillar, sub: p.at.slice(0, 10), group: p.pillar, id: p.id, local: true }; })];
    $("#g-n").textContent = items.length; $("#g-n-s").textContent = PILLARS.map((p) => [p, items.filter((i) => i.pillar === p).length]).filter((x) => x[1]).map((x) => `${x[0]} ${x[1]}`).join(" · ") || "No photos yet.";
    const gp = $("#g-pill"); gp.innerHTML = "";
    ["", ...PILLARS.filter((p) => items.some((i) => i.pillar === p))].forEach((p) => gp.append(h("button.chip" + (p === pill ? ".on" : ""), { type: "button", onclick: () => { pill = p; sub = ""; render(); } }, p || "Every pillar")));
    const inP = items.filter((i) => !pill || i.pillar === pill), groups = [...new Set(inP.map((i) => i.group))].sort();
    const gs = $("#g-sub"); gs.innerHTML = "";
    if (pill && groups.length > 1) ["", ...groups].forEach((g) => gs.append(h("button.chip" + (g === sub ? ".on" : ""), { type: "button", onclick: () => { sub = g; render(); } }, g || "All")));
    const q = $("#g-q").value.trim().toLowerCase();
    const shown = inP.filter((i) => (!sub || i.group === sub) && (!q || `${i.title} ${i.sub} ${i.id} ${i.group}`.toLowerCase().includes(q)));
    const grid = $("#g-grid"); grid.innerHTML = "";
    if (!shown.length) grid.append(h("p.empty", null, "No photos match."));
    shown.slice(0, 400).forEach((i) => grid.append(h("button.ph", { type: "button", title: i.title, onclick: () => open(i) }, h("img", { src: i.src, alt: i.title, loading: "lazy", decoding: "async" }), h("span", null, i.title, h("small", null, i.sub)))));
    if (shown.length > 400) grid.append(h("p.note", null, `Showing 400 of ${shown.length}. Search to narrow it.`));
  }
  function open(i) {
    const d = $("#g-view"); d.querySelector("img").src = i.src; d.querySelector("img").alt = i.title; d.querySelector(".cap").textContent = `${i.title} · ${i.sub} · ${i.pillar}`;
    const a = $("#g-view-acts"); a.innerHTML = "";
    if (i.local) a.append(h("button.btn.quiet.small", { type: "button", onclick: async () => { if (!confirm("Remove this photo from the album?")) return; await tx("readwrite", (s) => s.delete(i.id)); d.close(); local = await allLocal(); render(); } }, "Remove"));
    if (i.link) a.append(h("a.btn.quiet.small", { href: i.link, target: "_blank", rel: "noopener noreferrer" }, "Open in Titan"));
    d.showModal();
  }
  $("#g-q").addEventListener("input", render);
  $("#g-form").addEventListener("submit", async (e) => { e.preventDefault(); const f = e.target, files = [...f.files.files]; let n = 0;
    for (const file of files) { try { const blob = await clean(file); await tx("readwrite", (s) => s.put({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), pillar: f.pillar.value, caption: f.caption.value.trim(), at: new Date().toISOString(), blob })); n++; } catch (_) {} }
    f.files.value = ""; local = await allLocal(); toast(`${n} photo${n === 1 ? "" : "s"} added, location data removed`); render(); });
  $("#export").onclick = async () => { const l = await allLocal(); download(`argus_${day()}_index.json`, { pillar: "argus", exported: new Date().toISOString(), note: "List only; the photos themselves stay on the device.", data: { photos: l.map(({ blob, ...r }) => ({ ...r, bytes: blob.size })) } }); };
  $("#import").onclick = () => toast("Photos come in through Add photos.");

  tabs(app);
  allLocal().then((l) => { local = l; render(); }).catch(() => { $("#g-src").textContent = "This browser would not open its photo store."; render(); });
  fetch(TITAN + "data/index.json", { cache: "no-cache" }).then((r) => r.json()).then((ix) => {
    titan = (ix.flips || []).filter((f) => f.thumb && f.status !== "Removed").map((f) => ({ src: TITAN + f.thumb, pillar: "Titan", group: f.country || "Unknown",
      title: `${f.country || ""} ${f.year || ""} ${f.denom || ""}`.trim(), sub: f.scan, id: f.scan, link: TITAN + "#coin=" + f.scan }));
    $("#g-src").textContent = `Titan: ${titan.length} coin photos from the published Titan app, live.`; render();
  }).catch(() => { $("#g-src").textContent = "Could not reach the Titan app for its coin photos (offline?)."; render(); });
})();
