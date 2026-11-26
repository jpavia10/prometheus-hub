/* Kin · the family album (Claude, 2026-11-25; owner: "Comprehensively catalog and integrate all media so its ready to show off for
   Thanksgiving tomorrow"). Reads window.KIN_LINEAGE (data.js + album.js) and window.KIN_DRIVE (catalog.js). Three views: the chapters to
   browse, a viewer for one picture with its people linked into the tree, and the show: full screen, chapter cards, slow pans, for the TV. */
(function () {
  "use strict";
  const L = window.KIN_LINEAGE, A = L && L.album, D = window.KIN_DRIVE;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DOCS = "../lineage/docs/";
  if (!A) { $("#al-main").innerHTML = '<p class="al-sec al-empty">The album did not load. Reload the page.</p>'; return; }

  const P = Object.fromEntries(L.people.map((p) => [p.id, p]));
  const SRC = Object.fromEntries(L.sources.map((s) => [s.id, s]));
  const CH = Object.fromEntries(A.chapters.map((c, i) => [c.id, Object.assign({ n: i + 1 }, c)]));
  const FACE = {}; for (const m of L.media || []) if (m.face && m.person && !FACE[m.person]) FACE[m.person] = m.face;
  const nm = (p) => { if (!p) return ""; const n = (p.names || []).find((x) => x.type === "birth") || (p.names || [])[0] || {}; return `${n.given || ""} ${n.surname || ""}`.trim(); };
  const items = A.items.slice();
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  const drive = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
  const shortCap = (s) => { const m = s.match(/^(.+?[.!?])(\s|$)/); return m && m[1].length > 40 ? m[1] : s; };

  /* ---------- hero ---------- */
  const autumn = (() => { const d = new Date(); return d.getMonth() === 10 && d.getDate() >= 20; })();
  $("#al-kick").textContent = autumn ? `Thanksgiving ${new Date().getFullYear()} · the family album` : "Kin · the family album";
  const people = [...new Set(items.flatMap((it) => it.ppl))].filter((id) => P[id]);
  const years = items.filter((it) => it.kind !== "doc").map((it) => it.y);
  $("#al-lede").textContent = `${items.length} pictures, ${Math.min(...years)} to ${Math.max(...years)}, in ${A.chapters.length} chapters. Every one opened and checked by hand; the captions are the family's own words, or what is printed on the print. ${people.length} people in the tree are in them, and every face links back to its place on the tree.`;
  const who = items.filter((it) => it.who);
  $("#al-whob").innerHTML = `Who is this? <b>${who.length}</b>`;
  const heroPick = ["M-bill-mary-portrait", "M-peter-family-postcard", "M-ada-charlie-callie-1988", "M-culberson-boys", "M-charlie-and-aunt-callie", "M-bill-culberson-family-1902", "M-etta-ruby-elizabeth"].map((id) => byId[id]).filter(Boolean);
  const hero = $(".al-heroimgs");
  heroPick.forEach((it, i) => { const im = new Image(); im.alt = ""; im.decoding = "async"; if (i) im.loading = "lazy"; im.src = DOCS + it.img + ".webp"; if (!i) im.className = "on"; hero.appendChild(im); });
  if (!RM && heroPick.length > 1) {
    let h = 0; setInterval(() => { if (document.hidden) return; const ims = hero.querySelectorAll("img"); ims[h].classList.remove("on"); h = (h + 1) % ims.length; ims[h].classList.add("on"); }, 7000);
  }

  /* ---------- filters ---------- */
  const state = { person: null, q: "" };
  const count = {}; for (const it of items) for (const id of it.ppl) count[id] = (count[id] || 0) + 1;
  const ppl = people.sort((a, b) => count[b] - count[a] || nm(P[a]).localeCompare(nm(P[b])));
  const face = (id, cls = "") => FACE[id] ? `<img class="${cls}" src="${DOCS + FACE[id]}.webp" alt="" loading="lazy">` : `<span class="al-ini ${cls}">${esc((nm(P[id]).match(/\b\w/g) || []).slice(0, 2).join(""))}</span>`;
  $("#al-people").innerHTML = `<button class="al-chip plain" type="button" data-p="" aria-pressed="true">Everyone <small>${items.length}</small></button>` +
    ppl.map((id) => `<button class="al-chip" type="button" data-p="${id}" aria-pressed="false">${face(id)}${esc(nm(P[id]))} <small>${count[id]}</small></button>`).join("");
  $("#al-people").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; setPerson(b.dataset.p || null, true); });
  function setPerson(id, push) {
    state.person = id && P[id] ? id : null;
    for (const b of document.querySelectorAll("#al-people [data-p]")) { const on = (b.dataset.p || null) === state.person; b.setAttribute("aria-pressed", String(on)); if (on && state.person) b.scrollIntoView({ inline: "center", block: "nearest" }); }
    if (push) history.replaceState(null, "", state.person ? "#" + state.person : location.pathname + location.search);
    render();
    if (state.person) $("#al-toc").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  }
  let qt; $("#al-q").addEventListener("input", (e) => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); render(); }, 120); });
  const hay = (it) => (it.cap + " " + it.when + " " + it.ppl.map((id) => nm(P[id])).join(" ") + " " + (CH[it.ch] || {}).title + " " + it.file).toLowerCase();
  const match = (it) => (!state.person || it.ppl.includes(state.person)) && (!state.q || state.q.split(/\s+/).every((w) => hay(it).includes(w)));

  /* ---------- chapters ---------- */
  const card = (it) => `<button class="al-card" type="button" data-id="${it.id}"><figure><span class="al-print"><img src="${DOCS}t/${it.img}.webp" alt="${esc(shortCap(it.cap))}" width="${it.w}" height="${it.h}" style="aspect-ratio:${it.w}/${it.h}" loading="lazy" decoding="async">${it.who ? '<span class="al-badge">Who?</span>' : it.kind === "doc" || it.kind === "clip" ? '<span class="al-badge doc">Paper</span>' : ""}</span><figcaption><span class="al-when">${esc(it.when)}</span><span class="al-cap">${esc(it.cap)}</span></figcaption></figure></button>`;
  let shown = [];
  function render() {
    const main = $("#al-main"), toc = [];
    shown = [];
    main.innerHTML = A.chapters.map((c) => {
      const list = items.filter((it) => it.ch === c.id && match(it)).sort((a, b) => a.y - b.y);
      if (!list.length) return "";
      shown.push(...list); toc.push(`<a href="#ch-${c.id}">${esc(c.title)}<span>${list.length}</span></a>`);
      return `<section class="al-sec" id="ch-${c.id}" aria-labelledby="h-${c.id}"><header class="al-chh"><p class="al-chn">Chapter ${CH[c.id].n}</p><h2 id="h-${c.id}">${esc(c.title)}</h2><p class="al-chi">${esc(c.intro)}</p></header><div class="al-grid">${list.map(card).join("")}</div></section>`;
    }).join("") || `<p class="al-sec al-empty">No picture matches. Clear the search or pick Everyone.</p>`;
    $("#al-toc").innerHTML = toc.join("");
  }
  render();
  $("#al-who").innerHTML = who.map(card).join("");
  document.addEventListener("click", (e) => { const c = e.target.closest(".al-card"); if (!c) return; const inWho = !!c.closest("#al-who"); openLb(c.dataset.id, inWho ? who : shown); });

  /* ---------- the viewer ---------- */
  const lb = $("#al-lb"); let lbList = [], lbI = 0, lbBack = null;
  function openLb(id, list) { lbList = list.length ? list : items; lbI = Math.max(0, lbList.findIndex((x) => x.id === id)); lbBack = document.activeElement; lb.hidden = false; document.body.style.overflow = "hidden"; paintLb(); lb.querySelector("[data-lb=close]").focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lbBack && lbBack.focus) lbBack.focus(); }
  function paintLb() {
    const it = lbList[lbI], s = SRC[it.src] || {};
    const img = $("#al-lbimg"); img.src = DOCS + it.img + ".webp"; img.alt = shortCap(it.cap);
    $("#al-lbwhen").textContent = it.when; $("#al-lbcap").textContent = it.cap;
    $("#al-lbppl").innerHTML = it.ppl.filter((id) => P[id]).map((id) => `<a class="al-chip" href="../tree/#${id}" title="Open ${esc(nm(P[id]))} in the family tree">${face(id)}${esc(nm(P[id]))}</a>`).join("") + (it.who ? `<span class="al-chip plain">Know who this is? Tell Joseph.</span>` : "");
    $("#al-lbsrc").innerHTML = `${esc(s.short || "")} · ${lbI + 1} of ${lbList.length} · <a href="${drive(it.drive)}" target="_blank" rel="noopener">The original in Drive</a>`;
    const nx = lbList[(lbI + 1) % lbList.length]; if (nx) { const pre = new Image(); pre.src = DOCS + nx.img + ".webp"; }
  }
  const step = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; paintLb(); };
  lb.addEventListener("click", (e) => { const b = e.target.closest("[data-lb]"); if (b) { if (b.dataset.lb === "close") closeLb(); else step(b.dataset.lb === "next" ? 1 : -1); } else if (e.target === lb || e.target.classList.contains("al-lbimg")) closeLb(); });
  let tx = null; lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- the show ---------- */
  const show = $("#al-show"), stage = $("#al-sstage"), scard = $("#al-scard");
  const reel = [];
  const yrs = items.filter((it) => it.kind !== "doc").map((it) => it.y);
  reel.push({ card: true, kick: $("#al-kick").textContent, title: "The family album", text: `${items.filter((it) => it.show).length} pictures, ${Math.min(...yrs)} to ${Math.max(...yrs)}. From Peter Culberson's cavalry company to Ada at ninety-six, and the faces around them.` });
  for (const c of A.chapters) {
    const list = items.filter((it) => it.ch === c.id && it.show).sort((a, b) => a.y - b.y);
    if (!list.length) continue;
    reel.push({ card: true, kick: `Chapter ${CH[c.id].n}`, title: c.title, text: c.intro });
    for (const it of list) reel.push(it);
  }
  if (who.length) reel.push({ card: true, kick: "Before you go", title: "Who is this?", text: `${who.length} pictures are still waiting for a name. If you know one, say so: it goes into Kin with you as the source.` });
  let si = 0, playing = true, timer = null, t0 = 0, dur = 0, raf = 0, wakeT = null;
  const PHOTO = 8000, CARD = 6500;
  function openShow(at) {
    show.hidden = false; document.body.style.overflow = "hidden"; si = at || 0; playing = true; setPause();
    const fs = show.requestFullscreen || show.webkitRequestFullscreen; if (fs) { try { const r = fs.call(show); if (r && r.catch) r.catch(() => {}); } catch (_) { /* full screen is a nicety */ } }
    wake(); paintShow();
  }
  function closeShow() {
    clearTimeout(timer); cancelAnimationFrame(raf); show.hidden = true; stage.innerHTML = ""; document.body.style.overflow = "";
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    if (location.hash === "#show") history.replaceState(null, "", location.pathname + location.search);
  }
  function paintShow() {
    clearTimeout(timer); cancelAnimationFrame(raf);
    const r = reel[si];
    $("#al-scount").textContent = `${si + 1} / ${reel.length}`;
    if (r.card) {
      scard.innerHTML = `<p>${esc(r.kick)}</p><h2>${esc(r.title)}</h2><div>${esc(r.text)}</div>`; scard.hidden = false;
      scard.style.animation = "none"; void scard.offsetWidth; scard.style.animation = "";
      $("#al-stext").style.opacity = "0"; dur = CARD;
    } else {
      scard.hidden = true; $("#al-stext").style.opacity = "1";
      const sl = document.createElement("div"); sl.className = "al-sslide";
      const kz = (1.06 + Math.random() * 0.06).toFixed(3), kx = ((Math.random() - 0.5) * 3).toFixed(2) + "%", ky = ((Math.random() - 0.5) * 3).toFixed(2) + "%";
      sl.style.cssText = `--dur:${PHOTO + 1600}ms;--kz:${kz};--kx:${kx};--ky:${ky}`;
      sl.innerHTML = `<img class="bg" src="${DOCS}t/${r.img}.webp" alt=""><img class="fg" src="${DOCS + r.img}.webp" alt="${esc(shortCap(r.cap))}">`;
      stage.appendChild(sl);
      const go = () => requestAnimationFrame(() => sl.classList.add("on"));
      const fg = sl.querySelector(".fg"); if (fg.complete) go(); else { fg.onload = go; fg.onerror = go; }
      const old = [...stage.children].slice(0, -1); setTimeout(() => old.forEach((o) => o.remove()), 1800);
      $("#al-sch").textContent = (CH[r.ch] || {}).title || "";
      $("#al-swhen").textContent = r.when;
      $("#al-scap").textContent = r.who ? r.cap + " Who is this?" : r.cap;
      dur = PHOTO;
      const nx = reel.slice(si + 1).find((x) => !x.card); if (nx) { const pre = new Image(); pre.src = DOCS + nx.img + ".webp"; }
    }
    t0 = performance.now();
    const bar = $("#al-sprog");
    const tick = () => { const f = Math.min(1, (si + Math.min(1, (performance.now() - t0) / dur)) / reel.length); bar.style.width = (f * 100).toFixed(2) + "%"; if (playing) raf = requestAnimationFrame(tick); };
    tick();
    if (playing) timer = setTimeout(() => { if (si < reel.length - 1) { si++; paintShow(); } else { playing = false; setPause(); } }, dur);
  }
  function setPause() {
    const b = $("#al-spause"); b.setAttribute("aria-label", playing ? "Pause" : "Play");
    b.innerHTML = playing ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/></svg>' : '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';
  }
  const sstep = (d) => { si = Math.max(0, Math.min(reel.length - 1, si + d)); paintShow(); wake(); };
  function toggle() { playing = !playing; setPause(); paintShow(); wake(); }
  function wake() { show.classList.add("awake"); clearTimeout(wakeT); wakeT = setTimeout(() => show.classList.remove("awake"), 2600); }
  show.addEventListener("pointermove", wake);
  show.addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]");
    if (b) { const a = b.dataset.s; if (a === "close") closeShow(); else if (a === "pause") toggle(); else sstep(a === "next" ? 1 : -1); return; }
    if (!show.classList.contains("awake")) { wake(); return; }
    sstep(e.clientX < innerWidth * 0.3 ? -1 : 1);
  });
  $("#al-play").addEventListener("click", () => openShow(0));

  document.addEventListener("keydown", (e) => {
    if (!show.hidden) {
      if (e.key === "Escape") closeShow(); else if (e.key === "ArrowRight") sstep(1); else if (e.key === "ArrowLeft") sstep(-1); else if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
      return;
    }
    if (!lb.hidden) { if (e.key === "Escape") closeLb(); else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && !show.hidden && playing) { playing = false; setPause(); clearTimeout(timer); cancelAnimationFrame(raf); } });

  /* ---------- everything in Drive ---------- */
  if (D && D.files) {
    const F = D.files, G = Object.fromEntries(D.groups.map((g) => [g.id, g.title]));
    const st = (s) => F.filter((f) => f[5] === s).length;
    const mb = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB";
    $("#al-drivei").textContent = `The Kin media folder in your Drive holds ${F.length} files (${mb(F.reduce((s, f) => s + f[4], 0))}), gathered by Gemini on 24 November and listed here on ${D.listed}. The family pictures are all placed: in this album, already in Kin's records, or set aside with the reason. The book pages and the places-and-times pictures are listed so nothing is lost; the links open in Drive for your account.`;
    $("#al-dsum").innerHTML = D.groups.map((g) => `<div><b>${F.filter((f) => f[2] === g.id).length}</b><span>${esc(g.title)}</span></div>`).join("") +
      `<div><b>${st("album")}</b><span>in this album (with copies)</span></div><div><b>${st("in-kin") + st("dropped")}</b><span>already in Kin, or set aside</span></div>`;
    let dg = "", dq = "", lim = 120;
    $("#al-dseg").innerHTML = [["", "All"]].concat(D.groups.map((g) => [g.id, g.title])).map(([id, t]) => `<button type="button" data-g="${id}" aria-pressed="${id === dg}">${esc(t)}</button>`).join("");
    const drow = (f) => `<li><span class="al-dname">${esc(f[0])}</span><span class="al-dmeta">${esc(f[3])} · ${mb(f[4])}</span>${f[5] ? `<span class="al-dstate ${f[5]}">${esc({ album: "in the album", "in-kin": "in Kin", dropped: "set aside" }[f[5]] || f[5])}</span>` : `<span class="al-dstate">${esc(G[f[2]] ? G[f[2]].split(" ")[0] : "")}</span>`}<a href="${drive(f[1])}" target="_blank" rel="noopener">Open in Drive</a></li>`;
    const paintD = () => {
      const list = F.filter((f) => (!dg || f[2] === dg) && (!dq || f[0].toLowerCase().includes(dq)));
      $("#al-dlist").innerHTML = list.slice(0, lim).map(drow).join("") || '<li class="al-empty">No file matches.</li>';
      const more = $("#al-dmore"); more.hidden = list.length <= lim; more.textContent = `Show more (${list.length - lim} left)`;
    };
    $("#al-dseg").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (!b) return; dg = b.dataset.g; lim = 120; for (const x of document.querySelectorAll("#al-dseg [data-g]")) x.setAttribute("aria-pressed", String(x.dataset.g === dg)); paintD(); });
    let dt; $("#al-dq").addEventListener("input", (e) => { clearTimeout(dt); dt = setTimeout(() => { dq = e.target.value.trim().toLowerCase(); lim = 120; paintD(); }, 150); });
    $("#al-dmore").addEventListener("click", () => { lim += 200; paintD(); });
    paintD();
  }
  $("#al-dropped").innerHTML = (A.dropped || []).map((d) => `<li><b>${esc(d.file)}</b>: ${esc(d.why)}.</li>`).join("");
  $("#al-foot").textContent = `${items.length} pictures in the album · ${(A.dropped || []).length} set aside · built ${A.built}`;

  /* deep links: #show plays, #P-id filters to one person */
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === "show") openShow(0); else if (P[h]) setPerson(h, false);
  addEventListener("hashchange", () => { const x = decodeURIComponent(location.hash.slice(1)); if (x === "show") openShow(0); else if (P[x]) setPerson(x, false); });
  window.KIN_ALBUM = { ready: true, items: () => items.length, reel: () => reel.length, open: (id) => openLb(id, shown), play: openShow, close: () => { closeShow(); closeLb(); }, state: () => ({ shown: shown.length, show: !show.hidden, si, lb: !lb.hidden, person: state.person }) };
})();
