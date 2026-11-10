import { startField } from "./particles.js";

const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesk = (document.body.dataset.page || "desk") !== "presence";
document.documentElement.classList.add("js");

const canvas = document.getElementById("field");
let field = null;
if (canvas) {
  try {
    field = startField(canvas);
    document.documentElement.classList.add("has-gl");
  } catch (error) {
    document.documentElement.classList.add("no-gl");
    console.warn("Particle field unavailable", error);
  }
}

const FOCUS_KEY = "prometheus-hub.focus.v1";
const CHAPTERS = ["desk", "sylade", "houses", "seats"];
/* Every sheet on the desk is deep-linkable (#money, #records, ...). Derived from the dialogs themselves
   so a new door can never be added without its hash working. */
const WING_HASHES = new Set(Array.from(document.querySelectorAll("dialog.sheet[id^='sheet-']"), function (d) {
  return d.id.replace(/^sheet-/, "");
}).filter(function (id) { return CHAPTERS.indexOf(id) === -1; })); /* #desk is the Today chapter, not the About sheet */

let openName = null;
let pointedWing = "";

function atmosphere(date) {
  const hour = date.getHours();
  if (hour < 5) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night";
}

function paintClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const stamp = hh + ":" + mm;
  document.querySelectorAll("[data-clock]").forEach(function (node) {
    node.textContent = stamp;
    node.setAttribute("datetime", now.toISOString());
  });
  const day = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  document.querySelectorAll("[data-day]").forEach(function (node) { node.textContent = day; });
  const name = atmosphere(now);
  document.querySelectorAll("[data-atmo]").forEach(function (node) { node.textContent = name; });

  const progress = (now.getHours() + now.getMinutes() / 60) / 24;
  const angle = Math.PI * (1 - progress);
  const cx = 100 + Math.cos(angle) * 86;
  const cy = 72 - Math.sin(angle) * 56;
  document.querySelectorAll(".arc-now").forEach(function (node) {
    node.setAttribute("cx", cx.toFixed(2));
    node.setAttribute("cy", cy.toFixed(2));
  });
}

paintClock();
window.setInterval(paintClock, 15000);

function readNotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FOCUS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(function (item) { return typeof item === "string" && item.trim(); }).slice(0, 4);
  } catch (error) {
    return [];
  }
}

function writeNotes(items) {
  try {
    localStorage.setItem(FOCUS_KEY, JSON.stringify(items.slice(0, 4)));
  } catch (error) {
    /* Private mode can refuse storage. The desk still works. */
  }
}

function renderNotes() {
  const list = document.getElementById("focus-list");
  const empty = document.getElementById("focus-empty");
  const input = document.getElementById("focus-input");
  const count = document.querySelector("[data-notes]");
  if (!list) return;
  const items = readNotes();
  list.replaceChildren();
  items.forEach(function (item, index) {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = item;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-done";
    button.textContent = "Done";
    button.addEventListener("click", function () {
      const next = readNotes();
      next.splice(index, 1);
      writeNotes(next);
      renderNotes();
    });
    li.append(text, button);
    list.append(li);
  });
  if (empty) empty.hidden = items.length > 0;
  if (count) count.textContent = items.length ? String(items.length) + " on this device" : "None yet";
  if (input) input.disabled = items.length >= 4;
}

const focusForm = document.getElementById("focus-form");
if (focusForm) {
  renderNotes();
  focusForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.getElementById("focus-input");
    if (!input) return;
    const value = input.value.trim().slice(0, 80);
    if (!value) return;
    const next = readNotes();
    if (next.length >= 4) return;
    next.push(value);
    writeNotes(next);
    input.value = "";
    renderNotes();
  });
}

function chapter() {
  return document.body.dataset.chapter || "desk";
}

function toast(message) {
  const node = document.querySelector(".toast");
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(function () { node.hidden = true; }, 2200);
}

function handoff(href, label) {
  const veil = document.querySelector(".handoff");
  const name = veil && veil.querySelector(".handoff-name");
  if (!veil || reduce) {
    location.href = href;
    return;
  }
  if (name) name.textContent = label;
  veil.hidden = false;
  document.body.classList.add("is-leaving");
  window.setTimeout(function () { location.href = href; }, 560);
}

function updateCta() {
  if (!isDesk) return;
  const cta = document.getElementById("dock-cta");
  const hit = document.getElementById("field-hit");
  if (!cta) return;
  const live = {
    titan: ["Open Titan", "Opening Titan Reliquary"],
    midas: ["Open Midas", "Opening Midas Ledger"],
    hearth: ["Open Hearth", "Opening Hephaestus Hearth"],
    drive: ["Open Drive", "Opening the Drive"]
  };
  if (openName && live[openName]) {
    cta.textContent = live[openName][0] + " →";
    cta.dataset.mode = "out";
    cta.dataset.wing = openName;
    return;
  }
  const current = chapter();
  if (current === "sylade") {
    cta.textContent = "Enter Sylade →";
    cta.dataset.mode = "handoff";
    delete cta.dataset.wing;
  } else if (current === "houses") {
    cta.textContent = "Read a house";
    cta.dataset.mode = "houses";
    delete cta.dataset.wing;
  } else if (current === "seats") {
    cta.textContent = "Read the day";
    cta.dataset.mode = "kairos";
    delete cta.dataset.wing;
  } else {
    cta.textContent = "Add a note";
    cta.dataset.mode = "note";
    delete cta.dataset.wing;
  }
  if (!hit) return;
  if (current === "sylade") hit.textContent = "Enter from the field";
  else if (current === "houses") hit.textContent = "Open the pointed house";
  else if (current === "seats") hit.textContent = "Open the module";
  else hit.textContent = "About this desk";
}

function setRowCurrent(name) {
  document.querySelectorAll(".row").forEach(function (row) {
    if (name && row.dataset.open === name) row.setAttribute("aria-current", "true");
    else row.removeAttribute("aria-current");
  });
}

function openSheet(name) {
  const dialog = document.getElementById("sheet-" + name);
  if (!dialog || typeof dialog.showModal !== "function") {
    const row = document.getElementById(name);
    if (row) row.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    return;
  }
  if (openName && openName !== name) {
    const previous = document.getElementById("sheet-" + openName);
    if (previous && previous.open) previous.close();
  }
  openName = name;
  setRowCurrent(name);
  if (field) field.setFocus(name);
  if (!dialog.open) dialog.showModal();
  updateCta();
}

document.querySelectorAll("dialog.sheet").forEach(function (dialog) {
  dialog.addEventListener("close", function () {
    const id = dialog.id.replace(/^sheet-/, "");
    if (openName === id) {
      openName = null;
      setRowCurrent("");
      if (field) field.setFocus(null);
      updateCta();
    }
  });
});

function openOutbound(anchor) {
  const url = anchor.href;
  const label = anchor.dataset.out || "Opening";
  window.open(url, "_blank", "noopener");
  toast(label);
}

document.addEventListener("click", function (event) {
  const anchor = event.target.closest("a, button");
  if (!anchor) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

  if (anchor.dataset.handoff) {
    event.preventDefault();
    handoff(anchor.getAttribute("href"), anchor.dataset.handoff);
    return;
  }
  if (anchor.dataset.open) {
    event.preventDefault();
    openSheet(anchor.dataset.open);
    return;
  }
  if (anchor.dataset.out) {
    event.preventDefault();
    openOutbound(anchor);
  }
});

const cta = document.getElementById("dock-cta");
if (cta && isDesk) {
  cta.addEventListener("click", function (event) {
    event.preventDefault();
    const mode = cta.dataset.mode;
    if (mode === "note") {
      const input = document.getElementById("focus-input");
      const desk = document.getElementById("desk");
      if (desk) desk.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      if (input) input.focus();
      return;
    }
    if (mode === "handoff") {
      handoff("sylade.html", "Sylade");
      return;
    }
    if (mode === "houses") {
      const target = pointedWing || "titan";
      openSheet(target);
      return;
    }
    if (mode === "kairos") {
      openSheet("kairos");
      return;
    }
    if (mode === "out" && cta.dataset.wing) {
      const link = document.querySelector('#sheet-' + cta.dataset.wing + " [data-out]");
      if (link) openOutbound(link);
    }
  });
}

const fieldHit = document.getElementById("field-hit");
function fieldAction() {
  if (!isDesk) return;
  const current = chapter();
  if (current === "sylade") {
    handoff("sylade.html", "Sylade");
    return;
  }
  if (current === "houses" || current === "seats") {
    if (pointedWing) openSheet(pointedWing);
    else if (current === "seats") openSheet("kairos");
    return;
  }
  openSheet("desk");
}
if (fieldHit) fieldHit.addEventListener("click", fieldAction);
if (canvas) {
  canvas.addEventListener("click", function () {
    if (!document.documentElement.classList.contains("has-gl")) return;
    fieldAction();
  });
}

document.querySelectorAll(".list .row").forEach(function (row) {
  row.addEventListener("pointerenter", function () {
    pointedWing = row.dataset.open || "";
    if (openName || !field) return;
    field.setFocus(pointedWing);
  });
  row.addEventListener("pointerleave", function () {
    if (openName || !field) return;
    field.setFocus(null);
  });
});

const panels = document.querySelectorAll(".panel");
const navLinks = document.querySelectorAll(".topnav a");
if ("IntersectionObserver" in window && panels.length) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (CHAPTERS.indexOf(id) !== -1) document.body.dataset.chapter = id;
      entry.target.classList.add("in");
      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      if (!openName) updateCta();
    });
  }, { threshold: 0.18 });
  panels.forEach(function (panel) { observer.observe(panel); });
}

function openHash() {
  const id = (location.hash || "").replace("#", "");
  if (WING_HASHES.has(id)) { openSheet(id); return; }
  if (openName) { const open = document.getElementById("sheet-" + openName); if (open && open.open) open.close(); }
}
window.addEventListener("hashchange", openHash);
openHash();
updateCta();

window.addEventListener("pageshow", function () {
  const veil = document.querySelector(".handoff");
  if (veil) veil.hidden = true;
  document.body.classList.remove("is-leaving");
});

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  });
}
