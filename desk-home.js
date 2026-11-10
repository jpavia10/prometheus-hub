/* Home command deck. Search first. Next dates, the NYSE session, car and home
   dates, since-you-were-away, and module status. No balances. Food and exercise
   stay in Apollo. Public card terms are search results, not a home table. */
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
  const LIFE = ["garage", "hearth", "odyssey", "bastion", "records"];
  const LIFE_NAME = { garage: "Garage", hearth: "Hearth", odyssey: "Odyssey", bastion: "Bastion", records: "Records" };
  const SHAPES = new Set(["titan", "midas", "hearth", "apollo", "hermes", "kairos", "icarus", "argus"]);

  const $ = (s, r = document) => r.querySelector(s);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const TODAY = iso(new Date());
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dates = () => (window.KAIROS_FIXED || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const market = () => (window.ICARUS_MARKET_DAYS || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const services = () => (window.GARAGE_SCHEDULE && GARAGE_SCHEDULE.garage_services_severe_frazier) || [];
  const offers = () => (window.MONEY_OFFERS && MONEY_OFFERS.balance_transfer) || [];
  const hardship = () => (window.MONEY_OFFERS && MONEY_OFFERS.hardship) || [];

  let hits = [];
  let sel = 0;
  let groupFilter = "All";

  function rel(date) {
    const n = Math.round((new Date(date + "T12:00:00") - new Date(TODAY + "T12:00:00")) / 864e5);
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n > 1) return `in ${n} days`;
    return `${-n} days ago`;
  }

  function pretty(date) {
    const d = new Date(date + "T12:00:00");
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleDateString(undefined, sameYear
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" });
  }

  function session(day) {
    const hit = market().find((d) => d.date === day);
    const dow = new Date(day + "T12:00:00").getDay();
    if (dow === 0 || dow === 6) return { state: "Closed", why: "Weekend" };
    if (hit && /full/i.test(hit.kind)) return { state: "Closed", why: hit.name };
    if (hit && /early/i.test(hit.kind)) return { state: "Early close", why: `${hit.name} · 13:00 ET` };
    return { state: "Open", why: "Regular session" };
  }

  function clean(s) {
    return String(s ?? "")
      .replace(/\$\s?\d[\d,]*(?:\.\d+)?/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  const pref = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const pins = () => pref("prometheus.desk.pins", []);
  const hidden = () => pref("prometheus.desk.hidden", []);
  const readJson = (key, dflt) => { try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? dflt : v; } catch (_) { return dflt; } };
  function readList(key) { const v = readJson(key, []); return Array.isArray(v) ? v : []; }

  function visibleModules() {
    const hide = new Set(hidden());
    const pin = new Set(pins());
    return MODULES.filter((m) => (groupFilter === "All" || m.group === groupFilter) && !hide.has(m.id))
      .slice()
      .sort((a, b) => (pin.has(b.id) - pin.has(a.id)) || MODULES.indexOf(a) - MODULES.indexOf(b));
  }

  function currentId() {
    const id = (location.hash || "").replace("#", "");
    return MODULES.some((m) => m.id === id) ? id : "";
  }

  function reviewFor(id) {
    if (!window.PB) return 0;
    return PB.deadlines.overdue().filter((d) => d.source === id).length;
  }

  function focusField(name) {
    const field = window.PROMETHEUS_FIELD;
    if (!field) return;
    if (name && SHAPES.has(name)) field.setFocus(name);
    else field.setFocus(null);
  }

  function placeCurrent() {
    const track = $("#mod-track");
    if (!track) return;
    const cur = track.querySelector('[aria-current="true"]');
    if (!cur) return;
    const left = cur.offsetLeft - (track.clientWidth - cur.offsetWidth) / 2;
    track.scrollLeft = Math.max(0, left);
  }

  function paintSwitcher() {
    const nav = $("#switcher");
    if (!nav) return;
    const groups = ["All", ...new Set(MODULES.map((m) => m.group))];
    const hide = new Set(hidden());
    const pin = new Set(pins());
    const list = visibleModules();
    const open = currentId();
    const idx = list.findIndex((m) => m.id === open);
    const prev = idx > 0 ? list[idx - 1] : (idx === 0 ? null : null);
    const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : (idx < 0 && list[0] ? list[0] : null);
    const prevName = idx <= 0 ? "Desk" : (prev ? prev.name : "Desk");
    const nextName = next ? next.name : "";
    const step = (dir, name, enabled) => {
      const keys = dir < 0 ? "[" : "]";
      const which = dir < 0 ? "Previous module" : "Next module";
      return `<button type="button" class="mod-step" data-step="${dir}" ${enabled ? "" : "disabled"} aria-keyshortcuts="${keys}" aria-label="${which}${name ? ", " + esc(name) : ""}" title="${which}${name ? ", " + esc(name) : ""} (${keys})"><span aria-hidden="true">${dir < 0 ? "‹" : "›"}</span><span class="mod-step-name">${esc(name || "")}</span></button>`;
    };
    nav.innerHTML = `<div class="chips" id="group-chips">${groups.map((g) => `<button type="button" data-group="${esc(g)}" aria-pressed="${groupFilter === g}">${esc(g)}</button>`).join("")}</div>`
      + `<div class="mod-bar">${step(-1, prevName, idx > 0 || !!open)}`
      + `<div class="mod-track" id="mod-track">${list.map((m, i) => {
        const n = reviewFor(m.id);
        const on = open === m.id;
        return `<button type="button" data-mod="${m.id}" ${on ? 'aria-current="true"' : ""}><span>${i < 9 ? (i + 1) + " " : ""}${esc(m.name)}${n ? `<i class="dot">${n}</i>` : ""}${pin.has(m.id) ? " · pin" : ""}</span></button>`;
      }).join("")}</div>`
      + `${step(1, nextName, !!next)}</div>`
      + `<details class="mod-arrange"><summary>Arrange modules</summary><div class="sw-arrange">`
      + MODULES.map((m) => `<button type="button" data-pin="${m.id}">${pin.has(m.id) ? "Unpin" : "Pin"} ${esc(m.name)}</button><button type="button" data-hide="${m.id}">${hide.has(m.id) ? "Show" : "Hide"} ${esc(m.name)}</button>`).join("")
      + `</div></details>`
      + `<p class="mod-else">${EXTERNAL.map((m) => `<a href="${m.href}" target="_blank" rel="noopener noreferrer">${esc(m.name)}</a>`).join('<span aria-hidden="true"> · </span>')}</p>`
      + `<p class="sw-paused">Fleet Command is paused (2026-10-28)</p>`;
    placeCurrent();
  }

  function paintDates() {
    const upcoming = dates().filter((d) => d.date >= TODAY);
    const next = upcoming[0];
    const big = $("#next-date");
    const name = $("#next-name");
    const list = $("#next-list");
    if (big) big.textContent = next ? pretty(next.date) : "—";
    if (name) name.textContent = next ? `${next.name} · ${rel(next.date)}` : "No later dates in the calendar";
    if (list) {
      list.innerHTML = upcoming.slice(1, 5).map((d) => `<li><span class="when">${esc(pretty(d.date))}</span><span class="what">${esc(d.name)}</span><span class="src">${esc(rel(d.date))}</span></li>`).join("");
    }
  }

  function paintSession() {
    const ses = session(TODAY);
    const state = $("#session-state");
    if (state) {
      state.textContent = ses.state;
      state.dataset.state = ses.state.toLowerCase();
    }
    const why = $("#session-why");
    if (why) why.textContent = ses.why;
    const nxt = market().find((d) => d.date >= TODAY);
    const line = $("#session-next");
    if (line) line.textContent = nxt ? `Next mark ${pretty(nxt.date)} · ${nxt.name}` : "No later session marks in the file";
  }

  function moduleStatuses() {
    const lines = [];
    const seen = new Set();
    const push = (id, text) => {
      const line = clean(text);
      if (!line || /\$/.test(line) || seen.has(id)) return;
      seen.add(id);
      lines.push({ id, line });
    };
    const D = window.PB ? PB.deadlines.list() : [];
    const nextOf = (src) => D.filter((d) => d.source === src && !d.done).sort((a, b) => a.date.localeCompare(b.date))[0];
    const items = readList("prometheus.selling.items");
    if (items.length) {
      push("selling", `${items.length} item${items.length === 1 ? "" : "s"} · ${items.filter((x) => x.stage === "listed").length} listed · ${items.filter((x) => x.stage === "staged").length} staged`);
    }
    const garage = nextOf("garage");
    if (garage) push("garage", `${String(garage.title || "").replace(/^Sorento:\s*/, "")} · ${garage.date}`);
    const docs = readList("prometheus.records.docs");
    if (docs.length) {
      const due = nextOf("records");
      push("records", `${docs.length} document${docs.length === 1 ? "" : "s"}${due ? " · next " + due.date : ""}`);
    }
    const ideas = readList("prometheus.athenaeum.ideas");
    if (ideas.length) push("athenaeum", `${ideas.length} idea${ideas.length === 1 ? "" : "s"} kept`);
    const gear = readList("prometheus.bastion.items");
    if (gear.length) {
      const oz = gear.reduce((s, x) => s + (Number(x.weightOz) || 0) * (Number(x.qty) || 1), 0);
      push("bastion", `${gear.length} item${gear.length === 1 ? "" : "s"} · ${(oz / 16).toFixed(1)} lb packed`);
    }
    const bpm = readJson("prometheus.piano.ladder_bpm", 0);
    if (bpm) push("piano", `Ladder at ${bpm} BPM`);
    const events = readList("prometheus.kairos.events").filter((e) => e && e.title && e.date >= TODAY).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    if (events[0]) push("kairos", `${events[0].title} · ${events[0].date}`);
    const trips = readList("prometheus.odyssey.trips").filter((t) => t && t.end >= TODAY).sort((a, b) => String(a.start).localeCompare(String(b.start)));
    if (trips[0]) push("odyssey", `${trips[0].name} · ${trips[0].start}`);
    const brokers = readList("prometheus.privacy.brokers");
    if (brokers.length) {
      const done = brokers.filter((x) => x.state === "confirmed removed").length;
      push("privacy", `${done} of ${brokers.length} brokers confirmed removed`);
    }
    MODULES.forEach((m) => {
      const n = reviewFor(m.id);
      if (n) push(m.id, `${n} to review`);
    });
    return lines;
  }

  function paintModules() {
    const host = $("#mod-status");
    const rc = $("#review-count");
    const lines = moduleStatuses();
    const total = MODULES.reduce((n, m) => n + reviewFor(m.id), 0);
    if (rc) rc.textContent = total ? `${total} to review` : "";
    if (!host) return;
    if (!lines.length) {
      host.innerHTML = `<li><span class="what">Quiet on this device. The row above opens each module.</span></li>`;
      return;
    }
    host.innerHTML = lines.map((l) => {
      const m = MODULES.find((x) => x.id === l.id);
      return `<li><button type="button" data-mod="${esc(l.id)}"><span class="src">${esc(m ? m.name : l.id)}</span><span class="what">${esc(l.line)}</span></button></li>`;
    }).join("");
  }

  function paintLife() {
    const strip = $("#date-strip");
    if (!strip) return;
    if (!window.PB) {
      strip.innerHTML = `<li><span class="what">Dates load with this browser's saved desk.</span></li>`;
      return;
    }
    const rows = PB.deadlines.upcoming(90)
      .filter((d) => LIFE.includes(d.source))
      .map((d) => ({ date: d.date, title: clean(d.title), source: d.source }))
      .filter((d) => d.title && !/\$/.test(d.title));
    strip.innerHTML = rows.length
      ? rows.slice(0, 6).map((d) => `<li><span class="when">${esc(d.date)}</span><span class="what">${esc(d.title)}</span><span class="src">${esc(LIFE_NAME[d.source] || d.source)}</span></li>`).join("")
      : `<li><span class="what">No car or home dates on this device yet.</span></li>`;
  }

  function buildHits(q) {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const out = [];
    const room = () => out.length < 24;
    MODULES.forEach((m) => {
      if (room() && `${m.name} ${m.what} ${m.group}`.toLowerCase().includes(s)) out.push({ kind: "module", id: m.id, label: m.name, hint: m.what });
    });
    EXTERNAL.forEach((m) => {
      if (room() && m.name.toLowerCase().includes(s)) out.push({ kind: "external", href: m.href, label: m.name, hint: "Opens its own site" });
    });
    let n = 0;
    dates().forEach((d) => {
      if (room() && n < 6 && `${d.name} ${d.kind} ${d.date}`.toLowerCase().includes(s)) {
        n += 1;
        out.push({ kind: "module", id: "kairos", label: d.name, hint: `${d.date} · ${d.kind}` });
      }
    });
    n = 0;
    market().forEach((d) => {
      if (room() && n < 4 && `${d.name} ${d.date} nyse`.includes(s)) {
        n += 1;
        out.push({ kind: "module", id: "icarus", label: d.name, hint: `NYSE · ${d.date}` });
      }
    });
    n = 0;
    services().forEach((svc) => {
      if (room() && n < 4 && String(svc.name || "").toLowerCase().includes(s)) {
        n += 1;
        out.push({ kind: "module", id: "garage", label: svc.name, hint: "Opens Garage" });
      }
    });
    n = 0;
    offers().forEach((o) => {
      if (room() && n < 4 && `${o.issuer} ${o.product}`.toLowerCase().includes(s)) {
        n += 1;
        out.push({ kind: "offer", href: o.url, label: `${o.issuer} · ${o.product}`, hint: `${o.months} months · public term` });
      }
    });
    hardship().forEach((o) => {
      if (room() && n < 6 && `${o.lender} ${o.program}`.toLowerCase().includes(s)) {
        n += 1;
        out.push({ kind: "offer", href: o.url, label: o.lender, hint: `${o.program} · public term` });
      }
    });
    if (window.PB) {
      PB.deadlines.list().filter((d) => !d.done && d.source !== "kairos-fixed" && `${d.title} ${d.date}`.toLowerCase().includes(s) && !/\$/.test(String(d.title || "")))
        .slice(0, 4)
        .forEach((d) => { if (room()) out.push({ kind: "module", id: MODULES.some((m) => m.id === d.source) ? d.source : "kairos", label: clean(d.title), hint: `${d.date} · ${d.source}` }); });
    }
    readList("prometheus.records.docs").forEach((d) => { if (room() && d && d.title && String(d.title).toLowerCase().includes(s)) out.push({ kind: "module", id: "records", label: d.title, hint: "Record on this device" }); });
    readList("prometheus.kairos.events").forEach((d) => { if (room() && d && d.title && String(d.title).toLowerCase().includes(s)) out.push({ kind: "module", id: "kairos", label: d.title, hint: d.date || "Kairos" }); });
    readList("prometheus.selling.items").forEach((d) => { if (room() && d && d.title && String(d.title).toLowerCase().includes(s) && !/\$/.test(String(d.title))) out.push({ kind: "module", id: "selling", label: d.title, hint: "Selling" }); });
    readList("prometheus.bastion.items").forEach((d) => { if (room() && d && d.name && String(d.name).toLowerCase().includes(s)) out.push({ kind: "module", id: "bastion", label: d.name, hint: "Bastion" }); });
    readList("prometheus.hermes.mail").forEach((d) => { if (room() && d && !d.done && `${d.from} ${d.about}`.toLowerCase().includes(s)) out.push({ kind: "module", id: "hermes", label: `${d.from || ""} · ${d.about || ""}`, hint: "Hermes" }); });
    const actions = [
      ["backup", "Download backup", "backup"],
      ["restore", "Restore a backup", "restore"],
      ["note", "Today's note", "note"],
      ["remind", "Add a reminder", "remind"],
      ["contrast", "High contrast", "contrast"],
      ["help", "Shortcut sheet", "help"]
    ];
    actions.forEach(([word, label, id]) => { if (room() && (word.includes(s) || label.toLowerCase().includes(s))) out.push({ kind: "action", id, label, hint: "Action" }); });
    if (s.startsWith("note ")) out.unshift({ kind: "action", id: "note-save", text: q.trim().slice(5), label: "Save today's note", hint: q.trim().slice(5) });
    if (s.startsWith("remind ")) out.unshift({ kind: "action", id: "remind-save", text: q.trim().slice(7), label: "Save reminder", hint: q.trim().slice(7) });
    return out.slice(0, 24);
  }

  function paintHits() {
    const box = $("#cmd-hits");
    const input = $("#cmd");
    if (!box || !input) return;
    if (!hits.length) {
      if (input.value.trim()) {
        box.hidden = false;
        input.setAttribute("aria-expanded", "true");
        box.innerHTML = `<p class="cmd-empty">Nothing matches.</p>`;
        return;
      }
      box.hidden = true;
      input.setAttribute("aria-expanded", "false");
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    input.setAttribute("aria-expanded", "true");
    box.innerHTML = hits.map((h, i) => `<button type="button" role="option" id="hit-${i}" class="${i === sel ? "on" : ""}" aria-selected="${i === sel}"><strong>${esc(clean(h.label))}</strong><small>${esc(clean(h.hint))}</small></button>`).join("");
    box.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => activate(hits[i])));
    const on = box.querySelector(".on");
    if (on) on.scrollIntoView({ block: "nearest" });
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
    $("#cmd").value = "";
    closeHits();
  }

  function showBoard() {
    const board = $("#board");
    const stage = $("#module-stage");
    if (board) board.hidden = false;
    if (stage) stage.hidden = true;
    const frame = $("#module-frame");
    if (frame && frame.getAttribute("src")) frame.src = "about:blank";
    if (location.hash && location.hash !== "#board") location.hash = "board";
    focusField(null);
    paintSwitcher();
  }

  function showModule(id) {
    const mod = MODULES.find((m) => m.id === id);
    if (!mod) return;
    const board = $("#board");
    const stage = $("#module-stage");
    if (board) board.hidden = true;
    if (stage) stage.hidden = false;
    const title = $("#module-title");
    if (title) title.textContent = mod.name;
    const open = $("#module-open");
    if (open) open.href = mod.href;
    const frame = $("#module-frame");
    const next = mod.href + "?embed=1";
    if (frame && frame.getAttribute("src") !== next) frame.src = next;
    if (location.hash !== "#" + id) location.hash = id;
    focusField(id);
    paintSwitcher();
  }

  function moveModule(dir) {
    const list = visibleModules();
    const open = currentId();
    const idx = list.findIndex((m) => m.id === open);
    if (dir < 0) {
      if (idx <= 0) showBoard();
      else showModule(list[idx - 1].id);
      return;
    }
    if (idx < 0) { if (list[0]) showModule(list[0].id); return; }
    if (idx < list.length - 1) showModule(list[idx + 1].id);
  }

  function fromHash() {
    const id = (location.hash || "").replace("#", "");
    if (MODULES.some((m) => m.id === id)) showModule(id);
    else showBoard();
  }

  const BUILD = "v12";
  function deskToast(msg, undo) {
    document.querySelectorAll(".toast").forEach((n) => n.remove());
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.append(document.createTextNode(msg));
    if (typeof undo === "function") {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "Undo";
      b.addEventListener("click", () => { undo(); t.remove(); });
      t.append(b);
    }
    document.body.append(t);
    setTimeout(() => { if (t.isConnected) t.remove(); }, 6000);
  }
  function saveNote(text) {
    const key = "prometheus-hub.focus.v1";
    const cur = readList(key).filter((item) => typeof item === "string" && item.trim());
    cur.push(TODAY + " · " + text);
    try { localStorage.setItem(key, JSON.stringify(cur.slice(-4))); } catch (_) {}
    document.dispatchEvent(new Event("desk-notes"));
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
      return `<li><span class="what">${esc(clean(r.text))}</span><span class="when">${r.until ? esc(r.until) : "no expiry"}${ask ? " · still relevant?" : ""}</span><span class="src"><button type="button" data-keep="${esc(r.id)}">Keep</button><button type="button" data-drop="${esc(r.id)}">Drop</button></span></li>`;
    }).join("") || `<li><span class="what">No reminders.</span></li>`;
    host.querySelectorAll("[data-keep]").forEach((b) => b.addEventListener("click", () => {
      const next = reminders().map((r) => r.id === b.dataset.keep ? { ...r, kept: true, until: "" } : r);
      saveReminders(next); paintReminders();
    }));
    host.querySelectorAll("[data-drop]").forEach((b) => b.addEventListener("click", () => {
      const all = reminders();
      const at = all.findIndex((r) => r.id === b.dataset.drop);
      if (at < 0) return;
      const removed = all[at];
      saveReminders(all.filter((r) => r.id !== removed.id));
      paintReminders();
      deskToast("Reminder removed", () => {
        const back = reminders();
        back.splice(Math.min(at, back.length), 0, removed);
        saveReminders(back);
        paintReminders();
      });
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
      let text = "";
      if (prev) {
        const since = prev.slice(0, 10);
        const hours = (Date.now() - new Date(prev).getTime()) / 36e5;
        const landed = window.PB ? PB.deadlines.list().filter((d) => !d.done && d.source !== "kairos-fixed" && d.date >= since && d.date <= TODAY && !/\$/.test(String(d.title || ""))) : [];
        if (hours >= 12) {
          text = landed.length
            ? `Since you were away (${since}): ${landed.slice(0, 5).map((d) => clean(d.date + " " + d.title)).filter(Boolean).join("; ")}`
            : `Since you were away (${since}): no new obligations on this device.`;
        }
      }
      card.textContent = text;
      card.hidden = !text;
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
    paintLife();
    paintReminders();
    paintModules();
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
        deskToast("Restored. Undo puts the previous desk back.", () => {
          PB.loadAll(JSON.parse(localStorage.getItem("prometheus.desk.restoreUndo")));
          location.reload();
        });
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
  }

  function boot() {
    const nav = $("#switcher");
    if (nav) {
      nav.addEventListener("click", (e) => {
        const step = e.target.closest("[data-step]");
        if (step && !step.disabled) { moveModule(Number(step.dataset.step)); return; }
        const group = e.target.closest("[data-group]");
        if (group) { groupFilter = group.dataset.group; paintSwitcher(); return; }
        const mod = e.target.closest("[data-mod]");
        if (mod) { showModule(mod.dataset.mod); return; }
        const pin = e.target.closest("[data-pin]");
        if (pin) {
          const id = pin.dataset.pin;
          const cur = pins();
          put("prometheus.desk.pins", cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id));
          paintSwitcher();
          return;
        }
        const hide = e.target.closest("[data-hide]");
        if (hide) {
          const id = hide.dataset.hide;
          const cur = hidden();
          put("prometheus.desk.hidden", cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id));
          paintSwitcher();
        }
      });
      nav.addEventListener("pointerover", (e) => {
        const mod = e.target.closest("[data-mod]");
        if (mod && SHAPES.has(mod.dataset.mod)) focusField(mod.dataset.mod);
      });
      nav.addEventListener("pointerleave", () => focusField(currentId()));
    }
    const board = $("#board");
    if (board) board.addEventListener("click", (e) => {
      const mod = e.target.closest("[data-mod]");
      if (mod) showModule(mod.dataset.mod);
    });
    paintDates();
    paintSession();
    const back = $("#module-back");
    if (back) back.addEventListener("click", showBoard);
    wireKeep();
    const input = $("#cmd");
    const form = $("#cmd-form");
    const openSearch = $("#cmd-open");
    if (openSearch && input) openSearch.addEventListener("click", () => { input.focus(); input.select(); });
    const params = new URLSearchParams(location.search);
    if (input && params.get("q")) { input.value = params.get("q"); hits = buildHits(input.value); sel = 0; paintHits(); }
    if (input) input.addEventListener("input", () => { hits = buildHits(input.value); sel = 0; paintHits(); });
    if (form) form.addEventListener("submit", (e) => { e.preventDefault(); if (hits[sel]) activate(hits[sel]); });
    if (input) input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && hits.length) { e.preventDefault(); sel = Math.min(hits.length - 1, sel + 1); paintHits(); }
      else if (e.key === "ArrowUp" && hits.length) { e.preventDefault(); sel = Math.max(0, sel - 1); paintHits(); }
      else if (e.key === "Escape") { input.value = ""; closeHits(); input.blur(); }
    });
    document.addEventListener("keydown", (e) => {
      if (e.defaultPrevented || document.querySelector("dialog[open]")) return;
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement && document.activeElement.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        if (input) { input.focus(); input.select(); }
      } else if (!typing && e.key === "?") {
        e.preventDefault();
        const d = $("#help-sheet"); if (d && d.showModal) d.showModal();
      } else if (!typing && /^[1-9]$/.test(e.key)) {
        const mod = visibleModules()[+e.key - 1];
        if (mod) { e.preventDefault(); showModule(mod.id); }
      } else if (!typing) {
        const chord = e.metaKey || e.ctrlKey || e.shiftKey;
        const prevKey = e.key === "[" || (e.altKey && !chord && e.key === "ArrowLeft");
        const nextKey = e.key === "]" || (e.altKey && !chord && e.key === "ArrowRight");
        if ((e.key === "[" || e.key === "]") && (e.altKey || chord)) return;
        if (!prevKey && !nextKey) return;
        e.preventDefault();
        moveModule(prevKey ? -1 : 1);
      }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".command") && !e.target.closest(".cmd-hits")) closeHits(); });
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
