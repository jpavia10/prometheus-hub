/* Home desk. Real tables on first load: Kairos dates, NYSE sessions, Kia severe
   schedule, Apollo food/exercise rows, public card terms. No personal balances. */
(function () {
  "use strict";
  const MODULES = [
    { id: "kairos", name: "Kairos", group: "Time", href: "pillars/kairos/", what: "Calendar and focus clock" },
    { id: "apollo", name: "Apollo", group: "Body", href: "pillars/apollo/", what: "Day log, foods, exercises" },
    { id: "piano", name: "Piano", group: "Body", href: "pillars/piano/", what: "Bossa practice" },
    { id: "hermes", name: "Hermes", group: "Mail", href: "pillars/hermes/", what: "Triage board" },
    { id: "argus", name: "Argus", group: "Photos", href: "pillars/argus/", what: "Album" },
    { id: "money", name: "Money", group: "Money", href: "pillars/money/", what: "Sample payoff simulator" },
    { id: "selling", name: "Selling", group: "Money", href: "pillars/selling/", what: "Shipping pipeline" },
    { id: "icarus", name: "Icarus", group: "Money", href: "pillars/icarus/", what: "Trade journal. Never trades." },
    { id: "garage", name: "Garage", group: "Car", href: "pillars/garage/", what: "Sorento Hybrid service and fuel" },
    { id: "odyssey", name: "Odyssey", group: "Travel", href: "pillars/odyssey/", what: "Trips and packing" },
    { id: "bastion", name: "Bastion", group: "Travel", href: "pillars/bastion/", what: "Prep inventory" },
    { id: "records", name: "Records", group: "Files", href: "pillars/records/", what: "Document registry" },
    { id: "athenaeum", name: "Athenaeum", group: "Files", href: "pillars/athenaeum/", what: "Idea vault" },
    { id: "privacy", name: "Privacy", group: "Files", href: "pillars/privacy/", what: "DROP tracker" }
  ];
  const EXTERNAL = [
    { id: "titan", name: "Titan Reliquary", href: "https://jpavia10.github.io/titan-reliquary-preview/" },
    { id: "midas", name: "Midas Ledger", href: "https://jpavia10.github.io/midas-ledger/" },
    { id: "hearth", name: "Hephaestus Hearth", href: "https://jpavia10.github.io/hephaestus-hearth/" }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const TODAY = iso(new Date());
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dates = () => (window.KAIROS_FIXED || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const market = () => (window.ICARUS_MARKET_DAYS || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const services = () => (window.GARAGE_SCHEDULE && GARAGE_SCHEDULE.garage_services_severe_frazier) || [];
  const foods = () => window.APOLLO_FOODS || [];
  const exercises = () => window.APOLLO_EXERCISES || [];
  const offers = () => (window.MONEY_OFFERS && MONEY_OFFERS.balance_transfer) || [];
  const hardship = () => (window.MONEY_OFFERS && MONEY_OFFERS.hardship) || [];

  let extraFoods = [];
  let extraExercises = [];
  let calKind = "all";
  let offerKind = "bt";
  let hits = [];
  let sel = 0;

  function rel(date) {
    const n = Math.round((new Date(date + "T12:00:00") - new Date(TODAY + "T12:00:00")) / 864e5);
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n > 1) return `in ${n}d`;
    return `${-n}d ago`;
  }

  function session(day) {
    const hit = market().find((d) => d.date === day);
    const dow = new Date(day + "T12:00:00").getDay();
    if (dow === 0 || dow === 6) return { state: "Closed", why: "Weekend" };
    if (hit && /full/i.test(hit.kind)) return { state: "Closed", why: hit.name };
    if (hit && /early/i.test(hit.kind)) return { state: "Early close", why: `${hit.name} · 13:00 ET` };
    return { state: "Open", why: "Regular session" };
  }

  const pref = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const pins = () => pref("prometheus.desk.pins", []);
  const hidden = () => pref("prometheus.desk.hidden", []);
  let groupFilter = "All";
  function reviewFor(id) {
    if (!window.PB) return 0;
    return PB.deadlines.overdue().filter((d) => d.source === id).length;
  }
  function paintSwitcher() {
    const nav = $("#switcher");
    const groups = ["All", ...new Set(MODULES.map((m) => m.group))];
    const hide = new Set(hidden());
    const pin = new Set(pins());
    const list = MODULES.filter((m) => (groupFilter === "All" || m.group === groupFilter) && !hide.has(m.id))
      .slice().sort((a, b) => (pin.has(b.id) - pin.has(a.id)) || a.name.localeCompare(b.name));
    nav.innerHTML = `<div class="chips" id="group-chips">${groups.map((g) => `<button type="button" data-group="${esc(g)}" aria-pressed="${groupFilter === g}">${esc(g)}</button>`).join("")}</div>`
      + `<p class="sw-k">Modules <span id="review-count"></span></p>` + list.map((m, i) => {
        const n = reviewFor(m.id);
        return `<button type="button" data-mod="${m.id}"><span>${i < 9 ? (i + 1) + " " : ""}${esc(m.name)}${n ? `<i class="dot">${n}</i>` : ""}${pin.has(m.id) ? " · pin" : ""}</span><small>${esc(m.what)}</small></button>`;
      }).join("")
      + `<p class="sw-k">Show or hide</p>` + MODULES.map((m) => `<button type="button" data-pin="${m.id}">${pin.has(m.id) ? "Unpin" : "Pin"} ${esc(m.name)}</button><button type="button" data-hide="${m.id}">${hide.has(m.id) ? "Show" : "Hide"} ${esc(m.name)}</button>`).join("")
      + `<p class="sw-k">Other sites</p>` + EXTERNAL.map((m) =>
      `<a class="sw-ext" href="${m.href}" target="_blank" rel="noopener noreferrer">${esc(m.name)}</a>`).join("")
      + `<p class="sw-paused">Fleet Command paused (2026-10-28)</p>`;
    const total = MODULES.reduce((n, m) => n + reviewFor(m.id), 0);
    const rc = $("#review-count");
    if (rc) rc.textContent = total ? `· ${total} to review` : "";
    nav.querySelectorAll("[data-group]").forEach((b) => b.addEventListener("click", () => { groupFilter = b.dataset.group; paintSwitcher(); }));
    nav.querySelectorAll("[data-mod]").forEach((b) => b.addEventListener("click", () => showModule(b.dataset.mod)));
    nav.querySelectorAll("[data-pin]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.pin; const cur = pins(); put("prometheus.desk.pins", cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id)); paintSwitcher();
    }));
    nav.querySelectorAll("[data-hide]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.hide; const cur = hidden(); put("prometheus.desk.hidden", cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id)); paintSwitcher();
    }));
  }

  function paintTiles() {
    const ses = session(TODAY);
    $("#session-state").textContent = ses.state;
    $("#session-why").textContent = ses.why;
    const next = dates().find((d) => d.date >= TODAY);
    $("#next-date").textContent = next ? next.date.slice(5) : "—";
    $("#next-name").textContent = next ? `${next.name} · ${rel(next.date)}` : "No later dates in the table";
    const foodN = foods().length + extraFoods.length;
    const exN = exercises().length + extraExercises.length;
    $("#apollo-count").textContent = foodN && exN ? `${foodN} / ${exN}` : "—";
    $("#apollo-split").textContent = `${foods().length} foods bundled${extraFoods.length ? ` + ${extraFoods.length} more` : ""} · ${exercises().length} exercises${extraExercises.length ? ` + ${extraExercises.length}` : ""}`;
    $("#offer-count").textContent = String(offers().length + hardship().length);
    const y2027 = dates().filter((d) => d.date.startsWith("2027")).length;
    const nyse2027 = market().filter((d) => d.date.startsWith("2027")).length;
    $("#board-lede").textContent = `${dates().length} calendar rows through 2028 (${y2027} in 2027). ${market().length} NYSE sessions on file (${nyse2027} in 2027, December 31 2027 is a normal session). ${services().length} severe-service rows for the Sorento Hybrid.`;
  }

  function paintCal() {
    const box = $("#cal-chips");
    const kinds = [["all", "All"], ["federal holiday", "Holidays"], ["tax deadline", "Tax"], ["clock change", "DST"]];
    box.innerHTML = kinds.map(([id, label]) => `<button type="button" data-kind="${id}" aria-pressed="${calKind === id}">${label}</button>`).join("");
    box.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { calKind = b.dataset.kind; paintCal(); }));
    const rows = dates().filter((d) => d.date >= TODAY && (calKind === "all" || d.kind === calKind)).slice(0, 14);
    $("#cal-list").innerHTML = rows.map((d) => `<li><span class="when">${esc(d.date.slice(5))} · ${rel(d.date)}</span><span class="what">${esc(d.name)}</span><span class="src">${esc(d.kind)}</span></li>`).join("")
      || `<li><span class="what">Nothing later in this filter.</span></li>`;
  }

  function paintMarket() {
    const rows = market().filter((d) => d.date >= TODAY).slice(0, 8);
    $("#market-note").textContent = `Today is ${session(TODAY).state.toLowerCase()}.`;
    $("#market-list").innerHTML = rows.map((d) => `<li><span class="when">${esc(d.date)} · ${rel(d.date)}</span><span class="what">${esc(d.name)}</span><span class="src">${esc(d.kind)}${d.close ? " · " + esc(d.close) : ""}</span></li>`).join("")
      || `<li><span class="what">No later sessions in the file.</span></li>`;
  }

  function paintGarage() {
    const body = $("#garage-table tbody");
    body.innerHTML = services().map((s) => `<tr><td>${esc(s.name)}</td><td class="n">${s.miles ? Number(s.miles).toLocaleString("en-US") : "—"}</td><td class="n">${s.months || "—"}</td></tr>`).join("");
  }

  function paintFoods() {
    const q = ($("#food-q").value || "").trim().toLowerCase();
    const foodRows = foods().map((f) => ({ kind: "Food", name: f.n, detail: `${f.kcal} kcal · P ${f.p} · C ${f.c} · F ${f.f} / 100 g` }));
    extraFoods.forEach((f) => foodRows.push({ kind: "Food", name: f.description, detail: `${f.kcal} kcal · P ${f.protein_g} / 100 g · part 2` }));
    const exRows = exercises().map((e) => ({ kind: "Exercise", name: e.n, detail: `MET ${e.met}` }));
    extraExercises.forEach((e) => exRows.push({ kind: "Exercise", name: e.n || e.description || e.name, detail: e.met ? `MET ${e.met} · part 2` : "part 2" }));
    const all = q ? [...foodRows, ...exRows].filter((r) => String(r.name).toLowerCase().includes(q)).slice(0, 12) : foodRows.slice(0, 6);
    $("#food-list").innerHTML = all.map((r) => `<li><span class="src">${esc(r.kind)}</span><span class="what">${esc(r.name)}</span><span class="when">${esc(r.detail)}</span></li>`).join("")
      || `<li><span class="what">No row matches.</span></li>`;
  }

  function paintOffers() {
    const chips = $("#offer-chips");
    chips.innerHTML = [["bt", "Balance transfer"], ["hardship", "Hardship"]].map(([id, label]) =>
      `<button type="button" data-okind="${id}" aria-pressed="${offerKind === id}">${label}</button>`).join("");
    chips.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { offerKind = b.dataset.okind; paintOffers(); }));
    const q = ($("#offer-q").value || "").trim().toLowerCase();
    let rows;
    if (offerKind === "bt") {
      rows = offers().filter((o) => !q || `${o.issuer} ${o.product} ${o.fee}`.toLowerCase().includes(q)).slice(0, 10)
        .map((o) => `<li><a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer"><span class="what">${esc(o.issuer)} · ${esc(o.product)}</span><span class="when">${o.months} mo · ${esc(o.fee)} · APR ${esc(o.go_to_apr_range)}</span></a></li>`);
    } else {
      rows = hardship().filter((o) => !q || `${o.lender} ${o.program}`.toLowerCase().includes(q)).slice(0, 8)
        .map((o) => `<li><a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer"><span class="what">${esc(o.lender)}</span><span class="when">${esc(o.program)}</span></a></li>`);
    }
    $("#offer-list").innerHTML = rows.join("") || `<li><span class="what">No public term matches.</span></li>`;
  }

  function readList(key) { try { const v = JSON.parse(localStorage.getItem(key) || "null"); return Array.isArray(v) ? v : []; } catch (_) { return []; } }
  function buildHits(q) {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const out = [];
    MODULES.forEach((m) => { if (`${m.name} ${m.what} ${m.group}`.toLowerCase().includes(s)) out.push({ kind: "module", id: m.id, label: m.name, hint: m.what }); });
    EXTERNAL.forEach((m) => { if (m.name.toLowerCase().includes(s)) out.push({ kind: "external", href: m.href, label: m.name, hint: "Opens its own site" }); });
    dates().forEach((d) => { if (`${d.name} ${d.kind} ${d.date}`.toLowerCase().includes(s)) out.push({ kind: "cal", panel: "pane-cal", label: d.name, hint: `${d.date} · ${d.kind}` }); });
    market().forEach((d) => { if (`${d.name} ${d.date} nyse`.includes(s)) out.push({ kind: "market", panel: "pane-market", label: d.name, hint: `NYSE · ${d.date}` }); });
    services().forEach((svc) => { if (svc.name.toLowerCase().includes(s)) out.push({ kind: "service", panel: "pane-garage", label: svc.name, hint: "Sorento severe schedule" }); });
    foods().forEach((f) => { if (f.n.toLowerCase().includes(s)) out.push({ kind: "food", panel: "pane-food", q: f.n, label: f.n, hint: `${f.kcal} kcal / 100 g` }); });
    extraFoods.forEach((f) => { if (String(f.description || "").toLowerCase().includes(s)) out.push({ kind: "food", panel: "pane-food", q: f.description, label: f.description, hint: `${f.kcal} kcal / 100 g · part 2` }); });
    exercises().forEach((e) => { if (e.n.toLowerCase().includes(s)) out.push({ kind: "exercise", panel: "pane-food", q: e.n, label: e.n, hint: `MET ${e.met}` }); });
    offers().forEach((o) => { if (`${o.issuer} ${o.product}`.toLowerCase().includes(s)) out.push({ kind: "offer", href: o.url, label: `${o.issuer} · ${o.product}`, hint: `${o.months} mo intro · public term` }); });
    if (window.PB) {
      PB.deadlines.list().filter((d) => !d.done && d.source !== "kairos-fixed" && `${d.title} ${d.date}`.toLowerCase().includes(s))
        .forEach((d) => out.push({ kind: "cal", panel: "pane-cal", label: d.title, hint: `${d.date} · ${d.source}` }));
    }
    readList("prometheus.records.docs").forEach((d) => { if (d && d.title && String(d.title).toLowerCase().includes(s)) out.push({ kind: "module", id: "records", label: d.title, hint: "Record on this device" }); });
    readList("prometheus.kairos.events").forEach((d) => { if (d && d.title && String(d.title).toLowerCase().includes(s)) out.push({ kind: "module", id: "kairos", label: d.title, hint: d.date || "Kairos" }); });
    readList("prometheus.selling.items").forEach((d) => { if (d && d.title && String(d.title).toLowerCase().includes(s)) out.push({ kind: "module", id: "selling", label: d.title, hint: "Selling" }); });
    readList("prometheus.bastion.items").forEach((d) => { if (d && d.name && String(d.name).toLowerCase().includes(s)) out.push({ kind: "module", id: "bastion", label: d.name, hint: "Bastion" }); });
    readList("prometheus.hermes.mail").forEach((d) => { if (d && !d.done && `${d.from} ${d.about}`.toLowerCase().includes(s)) out.push({ kind: "module", id: "hermes", label: `${d.from || ""} · ${d.about || ""}`, hint: "Hermes" }); });
    const actions = [
      ["backup", "Download backup", "backup"],
      ["restore", "Restore a backup", "restore"],
      ["note", "Today's note", "note"],
      ["remind", "Add a reminder", "remind"],
      ["contrast", "High contrast", "contrast"],
      ["help", "Shortcut sheet", "help"]
    ];
    actions.forEach(([word, label, id]) => { if (word.includes(s) || label.toLowerCase().includes(s)) out.push({ kind: "action", id, label, hint: "Action" }); });
    if (s.startsWith("note ")) out.unshift({ kind: "action", id: "note-save", text: q.trim().slice(5), label: "Save today's note", hint: q.trim().slice(5) });
    if (s.startsWith("remind ")) out.unshift({ kind: "action", id: "remind-save", text: q.trim().slice(7), label: "Save reminder", hint: q.trim().slice(7) });
    return out.slice(0, 24);
  }

  function paintHits() {
    const box = $("#cmd-hits");
    const input = $("#cmd");
    if (!hits.length) {
      if (input.value.trim()) {
        box.hidden = false;
        input.setAttribute("aria-expanded", "true");
        box.innerHTML = `<p class="cmd-empty">Nothing matches.</p>`;
        return;
      }
      box.hidden = true;
      input.setAttribute("aria-expanded", "false");
      return;
    }
    box.hidden = false;
    input.setAttribute("aria-expanded", "true");
    box.innerHTML = hits.map((h, i) => `<button type="button" role="option" id="hit-${i}" class="${i === sel ? "on" : ""}" aria-selected="${i === sel}"><strong>${esc(h.label)}</strong><small>${esc(h.hint)}</small></button>`).join("");
    box.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => activate(hits[i])));
  }

  function closeHits() {
    hits = [];
    sel = 0;
    paintHits();
  }

  function activate(hit) {
    if (!hit) return;
    if (hit.kind === "action") { runAction(hit); $("#cmd").value = ""; closeHits(); return; }
    if (hit.kind === "module") showModule(hit.id);
    else if (hit.kind === "external" || hit.kind === "offer") window.open(hit.href, "_blank", "noopener");
    else {
      showBoard();
      if (hit.kind === "food" || hit.kind === "exercise") {
        $("#food-q").value = hit.q || hit.label;
        paintFoods();
      }
      const panel = document.getElementById(hit.panel);
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $("#cmd").value = "";
    closeHits();
  }

  function showBoard() {
    $("#board").hidden = false;
    $("#module-stage").hidden = true;
    const frame = $("#module-frame");
    if (frame.getAttribute("src")) frame.src = "about:blank";
    if (location.hash && location.hash !== "#board") location.hash = "board";
    document.querySelectorAll("[data-mod]").forEach((b) => b.removeAttribute("aria-current"));
  }

  function showModule(id) {
    const mod = MODULES.find((m) => m.id === id);
    if (!mod) return;
    $("#board").hidden = true;
    const stage = $("#module-stage");
    stage.hidden = false;
    $("#module-title").textContent = mod.name;
    $("#module-open").href = mod.href;
    const frame = $("#module-frame");
    const next = mod.href + "?embed=1";
    if (frame.getAttribute("src") !== next) frame.src = next;
    if (location.hash !== "#" + id) location.hash = id;
    document.querySelectorAll("[data-mod]").forEach((b) => {
      if (b.dataset.mod === id) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  function fromHash() {
    const id = (location.hash || "").replace("#", "");
    if (MODULES.some((m) => m.id === id)) showModule(id);
    else showBoard();
  }

  const BUILD = "v9";
  function deskToast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.append(t);
    setTimeout(() => t.remove(), 6000);
  }
  function saveNote(text) {
    const key = "prometheus-hub.focus.v1";
    const cur = readList(key);
    const line = TODAY + " · " + text;
    cur.push(line);
    try { localStorage.setItem(key, JSON.stringify(cur.slice(-4))); } catch (_) {}
    const list = $("#focus-list");
    if (list) {
      const li = document.createElement("li");
      li.textContent = line;
      list.append(li);
      const empty = $("#focus-empty");
      if (empty) empty.hidden = true;
    }
    deskToast("Note kept for " + TODAY);
  }
  function reminders() { return readList("prometheus.desk.reminders"); }
  function saveReminders(list) { put("prometheus.desk.reminders", list); }
  function paintReminders() {
    const host = $("#remind-list");
    if (!host) return;
    const list = reminders();
    host.innerHTML = list.map((r) => {
      const ask = r.until && r.until < TODAY && !r.kept;
      return `<li><span class="what">${esc(r.text)}</span><span class="when">${r.until ? esc(r.until) : "no expiry"}${ask ? " · still relevant?" : ""}</span><button type="button" data-keep="${esc(r.id)}">Keep</button><button type="button" data-drop="${esc(r.id)}">Drop</button></li>`;
    }).join("") || `<li><span class="what">No reminders.</span></li>`;
    host.querySelectorAll("[data-keep]").forEach((b) => b.addEventListener("click", () => {
      const next = reminders().map((r) => r.id === b.dataset.keep ? { ...r, kept: true, until: "" } : r);
      saveReminders(next); paintReminders();
    }));
    host.querySelectorAll("[data-drop]").forEach((b) => b.addEventListener("click", () => {
      saveReminders(reminders().filter((r) => r.id !== b.dataset.drop)); paintReminders();
    }));
  }
  function addReminder(text) {
    const m = text.match(/^(.*?)(?:\s+until\s+(\d{4}-\d{2}-\d{2}))?$/i);
    const item = { id: Date.now().toString(36), text: (m && m[1] || text).trim(), until: m && m[2] || "", kept: false };
    if (!item.text) return;
    saveReminders(reminders().concat(item));
    paintReminders();
    deskToast("Reminder saved");
  }
  function runAction(hit) {
    if (hit.id === "backup") downloadBackup();
    else if (hit.id === "restore") { const f = $("#restore-file"); if (f) f.click(); }
    else if (hit.id === "note") { showBoard(); const el = $("#focus-input"); if (el) el.focus(); }
    else if (hit.id === "note-save") saveNote(hit.text || "");
    else if (hit.id === "remind") addReminder("Check this");
    else if (hit.id === "remind-save") addReminder(hit.text || "");
    else if (hit.id === "contrast") toggleContrast();
    else if (hit.id === "help") { const d = $("#help-sheet"); if (d && d.showModal) d.showModal(); }
  }
  function toggleContrast() {
    const on = document.documentElement.classList.toggle("hc");
    try { localStorage.setItem("prometheus.desk.hc", on ? "1" : "0"); } catch (_) {}
  }
  function downloadBackup() {
    if (!window.PB) return;
    const blob = new Blob([JSON.stringify(PB.dumpAll(), null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prometheus-backup-" + TODAY + ".json";
    document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    try { localStorage.setItem("prometheus.desk.lastBackup", new Date().toISOString()); } catch (_) {}
    paintKeep();
  }
  function paintKeep() {
    const stamp = $("#build-stamp");
    if (stamp) stamp.textContent = "Build " + BUILD + ".";
    const where = $("#data-where");
    if (where) where.textContent = "Logs and notes stay in this browser under keys that start with prometheus. Nothing here is uploaded. Midas Ledger is a separate site and is not read.";
    const nudge = $("#backup-nudge");
    if (nudge) {
      const last = localStorage.getItem("prometheus.desk.lastBackup");
      if (!last) nudge.textContent = "No backup downloaded from this desk yet.";
      else {
        const days = Math.max(0, Math.round((Date.now() - new Date(last).getTime()) / 864e5));
        nudge.textContent = days > 7 ? `Last backup ${days} days ago. Download a new one.` : `Last backup ${days === 0 ? "today" : days + " day(s) ago"}.`;
      }
    }
    const away = window.PB && PB.meta.get("away", null);
    const card = $("#away-card");
    const prev = localStorage.getItem("prometheus.desk.lastSeen");
    localStorage.setItem("prometheus.desk.lastSeen", new Date().toISOString());
    if (card) {
      if (prev) {
        const since = prev.slice(0, 10);
        const hours = (Date.now() - new Date(prev).getTime()) / 36e5;
        const landed = window.PB ? PB.deadlines.list().filter((d) => !d.done && d.source !== "kairos-fixed" && d.date >= since && d.date <= TODAY) : [];
        card.textContent = hours >= 12
          ? (landed.length ? `Since you were away (${since}): ${landed.slice(0, 5).map((d) => d.date + " " + d.title).join("; ")}` : `Since you were away (${since}): no new obligations on this device.`)
          : "";
      } else card.textContent = "";
    }
    const clocks = $("#away-clocks");
    if (clocks) {
      if (away && away.until && away.until >= TODAY) {
        clocks.hidden = false;
        const homeTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const tz = localStorage.getItem("prometheus.desk.awayTz") || "America/New_York";
        const fmt = (zone) => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: zone });
        clocks.innerHTML = `<span>Home ${fmt(homeTz)}</span><span>Away ${fmt(tz)}</span><span>until ${esc(away.until)}</span>`;
      } else clocks.hidden = true;
    }
    const strip = $("#date-strip");
    if (strip && window.PB) {
      const rows = PB.deadlines.upcoming(90).filter((d) => ["garage", "hearth", "odyssey", "bastion", "records"].includes(d.source));
      strip.innerHTML = rows.length
        ? rows.slice(0, 8).map((d) => `<li><span class="when">${esc(d.date)}</span><span class="what">${esc(d.title)}</span></li>`).join("")
        : `<li><span class="what">No car or house dates on this device yet.</span></li>`;
    }
    paintReminders();
  }
  function wireKeep() {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    if (localStorage.getItem("prometheus.desk.hc") === "1") document.documentElement.classList.add("hc");
    const b = $("#backup-now"); if (b) b.addEventListener("click", downloadBackup);
    const r = $("#restore-now"); const file = $("#restore-file");
    if (r && file) r.addEventListener("click", () => file.click());
    if (file) file.addEventListener("change", async () => {
      const f = file.files && file.files[0]; if (!f || !window.PB) return;
      try {
        const obj = JSON.parse(await f.text());
        localStorage.setItem("prometheus.desk.restoreUndo", JSON.stringify(PB.dumpAll()));
        PB.loadAll(obj);
        deskToast("Restored. Reload to undo from the saved snapshot.");
        const undo = document.createElement("button");
        undo.type = "button"; undo.className = "op-btn"; undo.textContent = "Undo restore";
        undo.onclick = () => { PB.loadAll(JSON.parse(localStorage.getItem("prometheus.desk.restoreUndo"))); location.reload(); };
        $("#pane-keep").append(undo);
      } catch (_) { deskToast("That file is not a Prometheus backup."); }
    });
    const chip = $("#reload-chip");
    fetch("data/board.json", { cache: "no-cache" }).then((res) => res.json()).then((board) => {
      const el = $("#build-stamp");
      if (el) el.textContent = `Build ${BUILD}. Homework board as of ${board.updated || "unknown"}.`;
    }).catch(() => {});
    fetch("sw.js", { cache: "no-cache" }).then((res) => res.text()).then((t) => {
      const m = t.match(/prometheus-hub-desk-v\d+/);
      if (m && m[0] !== "prometheus-hub-desk-" + BUILD && chip) { chip.hidden = false; chip.onclick = () => location.reload(); }
    }).catch(() => {});
    paintKeep();
    const asof = "As of 2026-11-10 files";
    const note = $("#market-note");
    if (note) note.textContent = `${note.textContent} ${asof}.`;
  }
  function boot() {
    paintSwitcher();
    paintTiles();
    paintCal();
    paintMarket();
    paintGarage();
    paintFoods();
    paintOffers();
    $("#food-q").addEventListener("input", paintFoods);
    $("#food-form").addEventListener("submit", (e) => e.preventDefault());
    $("#offer-q").addEventListener("input", paintOffers);
    $("#offer-form").addEventListener("submit", (e) => e.preventDefault());
    $("#module-back").addEventListener("click", showBoard);
    wireKeep();
    const openSearch = $("#cmd-open");
    if (openSearch) openSearch.addEventListener("click", () => { input.focus(); input.select(); });
    const params = new URLSearchParams(location.search);
    if (params.get("q")) { input.value = params.get("q"); hits = buildHits(input.value); sel = 0; paintHits(); }
    const input = $("#cmd");
    const form = $("#cmd-form");
    input.addEventListener("input", () => { hits = buildHits(input.value); sel = 0; paintHits(); });
    form.addEventListener("submit", (e) => { e.preventDefault(); if (hits[sel]) activate(hits[sel]); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(hits.length - 1, sel + 1); paintHits(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); paintHits(); }
      else if (e.key === "Escape") closeHits();
    });
    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        showBoard();
        input.focus();
        input.select();
      } else if (!typing && e.key === "?") {
        e.preventDefault();
        const d = $("#help-sheet"); if (d && d.showModal) d.showModal();
      } else if (!typing && /^[1-9]$/.test(e.key)) {
        const mod = MODULES.filter((m) => !hidden().includes(m.id))[+e.key - 1];
        if (mod) { e.preventDefault(); showModule(mod.id); }
      }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".cmd")) closeHits(); });
    window.addEventListener("hashchange", fromHash);
    fromHash();
    fetch("pillars/apollo/data/APOLLO-GROK-foods-part2_20261110-1659.json").then((r) => r.json()).then((rows) => {
      extraFoods = Array.isArray(rows) ? rows : [];
      paintTiles();
    }).catch(() => {});
    fetch("pillars/apollo/data/APOLLO-GROK-exercises-part2_20261110-1700.json").then((r) => r.json()).then((rows) => {
      extraExercises = Array.isArray(rows) ? rows : [];
      paintTiles();
    }).catch(() => {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
