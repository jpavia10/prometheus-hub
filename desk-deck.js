/* Desk deck (Grok, 2026-11-10): the interactive layer of the desk.
   - Command palette: "/" or Ctrl/Cmd+K. Searches every door (houses, wings, Sylade, Drive, the paused
     Fleet), the records this device keeps (via DESK_LIVE.buildIndex), and upcoming Kairos fixed dates.
     Arrow keys move, Enter opens, Esc closes.
   - Wing board: group chips + a filter box over the wing rows, with an honest empty state.
     The chosen chip is remembered (prometheus-hub.deck.v1).
   - Sheets become a drill-down: Prev/Next through every door (also the arrow keys), what this
     device keeps for that wing, and a copyable deep link (#money, #records, ...).
   - Desk rounds: a short daily checklist Joseph writes himself; it resets each day and keeps a streak.
   - Resume: the last door opened comes back as a chip on the desk.
   Doors are read from the page itself (rows + dialogs), so this file cannot drift from the HTML.
   Everything stays in this browser. Nothing here talks to a server. Midas figures never render here. */
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  const KEY = "prometheus-hub.deck.v1", RKEY = "prometheus-hub.rounds.v1";
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const dayOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = dayOf(new Date());
  const state = Object.assign({ group: "all", last: "" }, read(KEY, {}));
  const save = () => write(KEY, state);

  // ---------- the doors, read from the page ----------
  const GROUPS = [
    ["all", "All"],
    ["daily", "Daily"],
    ["money", "Money & selling"],
    ["home", "Home & road"],
    ["shield", "Shield & paper"],
  ];
  const META = {
    apollo: ["daily", "body health weight sleep steps food protein training"],
    hermes: ["daily", "mail email inbox bills billers gmail phishing"],
    kairos: ["daily", "time calendar deadlines focus clock holidays ics"],
    piano: ["daily", "bossa nova yamaha chords practice bpm music"],
    athenaeum: ["daily", "ideas vault history books reading spark"],
    icarus: ["money", "trading journal rules trades risk market"],
    money: ["money", "debt payoff flex avalanche snowball simulator"],
    selling: ["money", "marketplace sell listings shipping payout"],
    garage: ["home", "car sorento kia maintenance fuel mpg oil"],
    bastion: ["home", "prep bugout go bag storm weather wildfire"],
    odyssey: ["home", "trips travel away packing"],
    argus: ["shield", "photos album exif gps"],
    privacy: ["shield", "drop data brokers deletion accounts 2fa"],
    records: ["shield", "documents warranty renewals school tk paper"],
    titan: ["house", "coins collection reliquary bullion"],
    midas: ["house", "money ledger book encrypted"],
    hearth: ["house", "house deck rebuild rooms"],
    drive: ["file", "google drive folders files"],
    fleet: ["paused", "fleet command paused"],
    desk: ["file", "about help keys"],
  };
  const doors = [];
  for (const d of document.querySelectorAll("dialog.sheet[id^='sheet-']")) {
    const id = d.id.slice(6);
    const row = document.querySelector(`.row[data-open="${id}"]`);
    const h3 = d.querySelector("h3");
    const name = (row && row.querySelector(".row-name") ? row.querySelector(".row-name").textContent : h3 ? h3.textContent : id).trim();
    const role = row && row.querySelector(".row-role") ? row.querySelector(".row-role").textContent.trim() : (d.querySelector(".kicker") || {}).textContent || "";
    const m = META[id] || ["file", ""];
    doors.push({ id, name, role, group: m[0], words: (name + " " + role + " " + m[1] + " " + id).toLowerCase(), paused: m[0] === "paused" });
  }
  // Prev/Next order follows the page: the houses, the wings in row order, then Drive and the paused Fleet.
  // The About sheet sits outside the cycle.
  const order = [...new Set([...document.querySelectorAll(".row[data-open]")].map((r) => r.dataset.open).concat(["drive", "fleet"]))]
    .filter((id) => doors.some((d) => d.id === id));
  const doorById = (id) => doors.find((d) => d.id === id);

  function openDoor(id) {
    const t = document.querySelector(`.row[data-open="${id}"]`) || document.querySelector(`[data-open="${id}"]`);
    if (t) t.click();
  }
  // remember the last door opened
  for (const d of document.querySelectorAll("dialog.sheet")) {
    new MutationObserver(() => { if (d.open && d.id !== "sheet-desk") { state.last = d.id.slice(6); save(); paintResume(); } })
      .observe(d, { attributes: true, attributeFilter: ["open"] });
  }

  // ---------- door counts, from the rows themselves ----------
  {
    const wings = document.querySelectorAll("#seats .row").length, houses = document.querySelectorAll("#houses .row").length;
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
    for (const n of document.querySelectorAll("[data-count]")) {
      const k = n.dataset.count;
      n.textContent = k === "wings" ? wings : k === "open" ? wings + houses : k === "wings-word" ? (words[wings] || wings) : n.textContent;
    }
  }

  // ---------- what this device keeps, per wing ----------
  function keptFor(id) {
    let records = 0, keys = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(`prometheus.${id}.`)) continue;
        keys++;
        try { const v = JSON.parse(localStorage.getItem(k)); if (Array.isArray(v)) records += v.length; } catch (_) {}
      }
    } catch (_) {}
    let due = 0;
    if (window.PB) due = PB.deadlines.list().filter((r) => !r.done && r.source === id && r.date >= today).length;
    return { records, keys, due };
  }

  // ---------- sheets as a drill-down ----------
  for (const d of document.querySelectorAll("dialog.sheet[id^='sheet-']")) {
    const id = d.id.slice(6);
    const door = doorById(id);
    const bar = document.createElement("div");
    bar.className = "sheet-nav";
    const i = order.indexOf(id);
    if (i === -1) continue;
    const prev = order[(i - 1 + order.length) % order.length], next = order[(i + 1) % order.length];
    bar.innerHTML = `<button type="button" class="sheet-step" data-step="${prev}" aria-label="Previous: ${esc(doorById(prev).name)}">← ${esc(short(doorById(prev).name))}</button>
      <span class="sheet-pos">${i + 1} / ${order.length}</span>
      <button type="button" class="sheet-step" data-step="${next}" aria-label="Next: ${esc(doorById(next).name)}">${esc(short(doorById(next).name))} →</button>`;
    d.append(bar);
    if (door && !["titan", "midas", "hearth", "drive", "fleet", "desk"].includes(id)) {
      const kept = document.createElement("p");
      kept.className = "sheet-kept";
      kept.dataset.keptFor = id;
      d.querySelector(".actions") ? d.querySelector(".actions").before(kept) : d.append(kept);
    }
    const acts = d.querySelector(".actions");
    if (acts && id !== "desk") {
      const b = document.createElement("button");
      b.type = "button"; b.className = "quiet copy-link"; b.textContent = "Copy link";
      b.addEventListener("click", async () => {
        const url = location.origin + location.pathname + "#" + id;
        try { await navigator.clipboard.writeText(url); b.textContent = "Link copied"; } catch (_) { b.textContent = url; }
        setTimeout(() => { b.textContent = "Copy link"; }, 1800);
      });
      acts.append(b);
    }
    d.addEventListener("click", (e) => {
      const s = e.target.closest("[data-step]"); if (!s) return;
      e.preventDefault(); e.stopPropagation(); step(d, s.dataset.step);
    });
    new MutationObserver(() => { if (d.open) paintKept(d); }).observe(d, { attributes: true, attributeFilter: ["open"] });
  }
  function short(n) { return n.split(" · ")[0].replace(/^(Hephaestus|Titan|Midas|Prometheus Hub) /, (m) => m).trim(); }
  function step(from, toId) { if (from.open) from.close(); openDoor(toId); }
  function paintKept(d) {
    const p = d.querySelector("[data-kept-for]"); if (!p) return;
    const k = keptFor(p.dataset.keptFor);
    p.textContent = k.records || k.due
      ? `On this device: ${k.records} record${k.records === 1 ? "" : "s"}${k.due ? ` · ${k.due} upcoming deadline${k.due === 1 ? "" : "s"} on the bus` : ""}.`
      : "On this device: nothing kept yet. Open the wing to start.";
  }
  document.addEventListener("keydown", (e) => {
    const open = document.querySelector("dialog.sheet[open]");
    if (!open || palette.open) return;
    if (e.target.closest && e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const id = open.id.slice(6), i = order.indexOf(id);
      if (i === -1) return;
      e.preventDefault();
      step(open, order[(i + (e.key === "ArrowRight" ? 1 : -1) + order.length) % order.length]);
    }
  });

  // ---------- wing board: chips + filter ----------
  const seats = document.querySelector("#seats .list");
  let empty = null;
  if (seats) {
    const bar = document.createElement("div");
    bar.className = "wing-board reveal";
    bar.innerHTML = `<div class="chips" role="group" aria-label="Show wings">${GROUPS.map(([g, label]) =>
      `<button type="button" class="chip" data-group="${g}" aria-pressed="false">${esc(label)} <span class="chip-n"></span></button>`).join("")}</div>
      <input type="search" class="wing-filter" placeholder="Filter the wings…" aria-label="Filter the wings" autocomplete="off">`;
    seats.before(bar);
    empty = document.createElement("p");
    empty.className = "wing-empty"; empty.hidden = true;
    seats.append(empty);
    const rows = [...seats.querySelectorAll(".row")];
    for (const [g] of GROUPS) bar.querySelector(`[data-group="${g}"] .chip-n`).textContent =
      rows.filter((r) => g === "all" || (doorById(r.dataset.open) || {}).group === g).length;
    const filter = bar.querySelector(".wing-filter");
    const paint = () => {
      const q = filter.value.trim().toLowerCase();
      let shown = 0;
      for (const r of rows) {
        const d = doorById(r.dataset.open) || { group: "", words: "" };
        const ok = (state.group === "all" || d.group === state.group) && (!q || d.words.includes(q) || r.textContent.toLowerCase().includes(q));
        r.hidden = !ok; if (ok) shown++;
      }
      for (const c of bar.querySelectorAll(".chip")) c.setAttribute("aria-pressed", String(c.dataset.group === state.group));
      empty.hidden = shown > 0;
      empty.innerHTML = shown ? "" : `No wing matches${q ? ` “${esc(q)}”` : ""} in ${esc(GROUPS.find((x) => x[0] === state.group)[1])}. <button type="button" class="quiet" data-reset>Show all</button>`;
    };
    bar.addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (!c) return; state.group = c.dataset.group; save(); paint(); });
    empty.addEventListener("click", (e) => { if (e.target.closest("[data-reset]")) { state.group = "all"; filter.value = ""; save(); paint(); } });
    filter.addEventListener("input", paint);
    if (!GROUPS.some((g) => g[0] === state.group)) state.group = "all";
    paint();
  }

  // ---------- resume chip ----------
  const status = document.querySelector(".deskglass .status");
  let resume = null;
  if (status) {
    resume = document.createElement("button");
    resume.type = "button"; resume.className = "resume"; resume.hidden = true;
    resume.addEventListener("click", () => { if (state.last) openDoor(state.last); });
    status.prepend(resume);
  }
  function paintResume() {
    if (!resume) return;
    const d = doorById(state.last);
    resume.hidden = !d || d.paused;
    if (d) resume.textContent = "Resume · " + short(d.name);
  }
  paintResume();

  // ---------- desk rounds ----------
  const focus = document.getElementById("focus-form");
  if (focus) {
    const box = document.createElement("section");
    box.className = "rounds"; box.setAttribute("aria-labelledby", "rounds-k");
    focus.after(box);
    const R = Object.assign({ items: [], day: today, done: [], streak: 0, lastFull: "" }, read(RKEY, {}));
    if (R.day !== today) {
      // a new day: yesterday's full round extends the streak, a missed day resets it
      const y = new Date(); y.setDate(y.getDate() - 1);
      if (R.lastFull !== dayOf(y) && R.lastFull !== today) R.streak = 0;
      R.day = today; R.done = [];
      write(RKEY, R);
    }
    const paint = () => {
      const n = R.items.length, done = R.items.filter((x) => R.done.includes(x)).length;
      box.innerHTML = `<div class="rounds-head"><span class="bus-k" id="rounds-k">Desk rounds · today</span>
        <span class="bus-src">${n ? `${done}/${n} done${R.streak ? ` · ${R.streak}-day streak` : ""}` : "Your own daily checks"}</span></div>
        ${n ? `<ul class="rounds-list">${R.items.map((x, i) => `<li><label><input type="checkbox" data-i="${i}" ${R.done.includes(x) ? "checked" : ""}> <span>${esc(x)}</span></label><button type="button" class="focus-done" data-del="${i}" aria-label="Remove ${esc(x)}">Remove</button></li>`).join("")}</ul>`
          : `<p class="focus-empty">No rounds yet. Add the few things you check every day, like “Next 7 days in Time” or “Apollo line”. They reset each morning.</p>`}
        <form class="rounds-add"><input name="r" maxlength="60" placeholder="Add a daily round" aria-label="Add a daily round" autocomplete="off"><button type="submit" class="op-btn">Add</button></form>`;
    };
    const commit = () => {
      const all = R.items.length && R.items.every((x) => R.done.includes(x));
      if (all && R.lastFull !== today) { R.streak = (R.streak || 0) + 1; R.lastFull = today; }
      else if (!all && R.lastFull === today) { R.streak = Math.max(0, (R.streak || 1) - 1); R.lastFull = ""; }
      write(RKEY, R); paint();
    };
    box.addEventListener("change", (e) => {
      const c = e.target.closest("input[type=checkbox]"); if (!c) return;
      const x = R.items[+c.dataset.i];
      R.done = c.checked ? [...new Set([...R.done, x])] : R.done.filter((y) => y !== x);
      commit();
    });
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-del]"); if (!b) return;
      const x = R.items[+b.dataset.del]; R.items.splice(+b.dataset.del, 1); R.done = R.done.filter((y) => y !== x); commit();
    });
    box.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (e.target.r.value || "").trim().slice(0, 60);
      if (!v || R.items.includes(v) || R.items.length >= 8) return;
      R.items.push(v); commit();
      box.querySelector(".rounds-add input").focus();
    });
    paint();
  }

  // ---------- command palette ----------
  const palette = document.createElement("dialog");
  palette.className = "sheet palette"; palette.setAttribute("aria-label", "Search the deck");
  palette.innerHTML = `<form method="dialog" class="pal-form" role="search">
      <input id="pal-q" type="text" enterkeyhint="go" placeholder="Go to a wing, a record, a date…" aria-label="Search the deck" autocomplete="off" aria-controls="pal-list">
    </form>
    <ul id="pal-list" class="pal-list" role="listbox" aria-label="Results"></ul>
    <p class="pal-foot"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</p>`;
  document.body.append(palette);
  const pq = palette.querySelector("#pal-q"), pl = palette.querySelector("#pal-list");
  let hits = [], sel = 0;

  function recordIndex() {
    const out = [];
    if (window.DESK_LIVE) {
      const r = (k) => read(k, []);
      const data = { selling: r("prometheus.selling.items"), records: r("prometheus.records.docs"), ideas: r("prometheus.athenaeum.ideas"),
        bastion: r("prometheus.bastion.items"), trips: r("prometheus.odyssey.trips"), brokers: r("prometheus.privacy.brokers"), events: r("prometheus.kairos.events") };
      for (const x of DESK_LIVE.buildIndex(data)) out.push({ kind: "record", label: x.label, sub: x.cap, href: x.href });
    }
    if (window.KAIROS_FIXED) for (const f of KAIROS_FIXED) if (f.date >= today) out.push({ kind: "date", label: f.name, sub: `${f.date} · ${f.kind}`, href: "pillars/kairos/" });
    return out;
  }
  function search(q) {
    q = q.trim().toLowerCase();
    const ds = doors.filter((d) => !q || d.words.includes(q)).map((d) => ({ kind: "door", id: d.id, label: d.name, sub: d.paused ? "Paused · 2026-10-28" : d.role, paused: d.paused }));
    if (!q) return ds.filter((d) => d.id !== "desk");
    const rs = recordIndex().filter((x) => (x.label + " " + x.sub).toLowerCase().includes(q)).slice(0, 8);
    return [...ds, ...rs].slice(0, 14);
  }
  function paintPal() {
    hits = search(pq.value);
    sel = Math.min(sel, Math.max(0, hits.length - 1));
    pl.innerHTML = hits.length ? hits.map((h, i) => `<li role="option" id="pal-${i}" aria-selected="${i === sel}" data-i="${i}" class="${h.paused ? "is-paused" : ""}">
        <span class="pal-kind">${h.kind === "door" ? "Door" : h.kind === "date" ? "Date" : "Record"}</span>
        <span class="pal-label">${esc(h.label)}</span><span class="pal-sub">${esc(h.sub)}</span></li>`).join("")
      : `<li class="pal-none">Nothing matches “${esc(pq.value)}”. Records only count what this device keeps.</li>`;
    pq.setAttribute("aria-activedescendant", hits.length ? "pal-" + sel : "");
    const cur = pl.querySelector(`[data-i="${sel}"]`); if (cur) cur.scrollIntoView({ block: "nearest" });
  }
  function go(h) {
    if (!h) return;
    palette.close();
    if (h.kind === "door") openDoor(h.id); else location.href = h.href;
  }
  function openPalette() {
    const s = document.querySelector("dialog.sheet[open]:not(.palette)"); if (s) s.close();
    pq.value = ""; sel = 0; paintPal();
    if (!palette.open) palette.showModal();
    pq.focus();
  }
  pq.addEventListener("input", () => { sel = 0; paintPal(); });
  pq.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(hits.length - 1, sel + 1); paintPal(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); paintPal(); }
    else if (e.key === "Enter") { e.preventDefault(); go(hits[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); palette.close(); } /* one press, even with text typed */
  });
  pl.addEventListener("click", (e) => { const li = e.target.closest("[data-i]"); if (li) go(hits[+li.dataset.i]); });
  palette.addEventListener("click", (e) => { if (e.target === palette) palette.close(); });
  document.addEventListener("keydown", (e) => {
    const typing = e.target.closest && e.target.closest("input, textarea, select, [contenteditable]");
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openPalette(); }
    else if (e.key === "/" && !typing && !palette.open) { e.preventDefault(); openPalette(); }
  });
  // a visible way in, for thumbs
  const nav = document.querySelector(".topnav");
  if (nav) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "pal-open"; b.innerHTML = `Search <kbd aria-hidden="true">/</kbd>`;
    b.setAttribute("aria-label", "Search the deck (slash or Ctrl+K)");
    b.addEventListener("click", openPalette);
    nav.append(b);
  }
  window.DESK_DECK = { openPalette, search, doors, keptFor };
})();
