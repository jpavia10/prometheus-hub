/* The deck's small UI kit: element builder, formats, sheets (with the phone's back button), toasts, instruments drawn in SVG,
   file in/out. No framework; every helper returns plain DOM. */

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
let quiet = false;
/** While quiet, instruments draw in place (a redraw of the same view should not replay its entrance). */
export const setQuiet = (v) => { quiet = !!v; };
export const reduced = () => quiet || matchMedia("(prefers-reduced-motion: reduce)").matches;
const SVGNS = "http://www.w3.org/2000/svg";

function build(el, attrs, kids) {
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style" && typeof v === "object") { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith("--")) el.style.setProperty(sk, String(sv)); else el.style[sk] = sv; } }
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== "") el.append(k.nodeType ? k : document.createTextNode(String(k)));
  return el;
}
/** h("div.card.glow", { onclick }, ...children) */
export function h(tag, attrs, ...kids) {
  if (attrs != null && (attrs.nodeType || typeof attrs !== "object" || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  const [name, ...cls] = tag.split("."); const el = document.createElement(name || "div"); if (cls.length) el.className = cls.join(" ");
  return build(el, attrs, kids);
}
/** parent.append that ignores null and false (the native one prints "null"). */
export function put(parent, ...kids) { for (const k of kids.flat(Infinity)) if (k != null && k !== false && k !== "") parent.append(k); return parent; }
export function s(tag, attrs, ...kids) { if (attrs != null && (attrs.nodeType || typeof attrs !== "object" || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; } return build(document.createElementNS(SVGNS, tag), attrs, kids); }

/* ---- formats ---- */
export const money = (n, d = 2) => (n == null || isNaN(n) ? "—" : (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
export const moneyC = (c, d = 2) => money(c / 100, d);
export const pct = (x, d = 0) => (x * 100).toFixed(d) + "%";
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
export const monthsText = (n) => (n === Infinity ? "never" : n >= 24 ? `${Math.floor(n / 12)} yr ${n % 12 ? (n % 12) + " mo" : ""}`.trim() : plural(n, "month"));

/* ---- icons (24 px grid, drawn as strokes) ---- */
const ICON = {
  picture: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 3v3M12 18v3M3 12h3M18 12h3M12 12l4-3",
  time: "M12 7v5l3 2M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
  money: "M4 17a8 8 0 0 1 16 0M12 17V9M12 9l-3 3M12 9l3 3M4 20h16",
  garage: "M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5M7.5 13.5h.01M16.5 13.5h.01",
  house: "M4 11l8-7l8 7M6 9.5V20h12V9.5M10 20v-5h4v5",
  system: "M5 12h.01M12 12h.01M19 12h.01",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M20 20l-4.5-4.5",
  plus: "M12 5v14M5 12h14", x: "M6 6l12 12M18 6L6 18", check: "M5 12.5l4.5 4.5L19 7",
  left: "M14.5 5l-7 7l7 7", right: "M9.5 5l7 7l-7 7", down: "M5 9.5l7 7l7-7", up: "M5 14.5l7-7l7 7",
  star: "M12 3.5l2.6 5.6l6 .7l-4.5 4.1l1.2 6l-5.3-3l-5.3 3l1.2-6L3.4 9.8l6-.7z",
  repeat: "M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5",
  alert: "M12 4l9 16H3zM12 10v4.5M12 17.5h.01",
  upload: "M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14", download: "M12 5v11M7.5 11.5L12 16l4.5-4.5M5 19h14",
  play: "M8 5l11 7l-11 7z", pause: "M8 5v14M16 5v14", stop: "M6.5 6.5h11v11h-11z",
  gear: "M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1", scope: "M4 16l9-9l3 3l-9 9zM13 7l2.5-2.5l3 3L16 10M6 19l-2 2.5M9 21l1-3M15 4.5a5 5 0 0 1 4.5 4.5", people: "M8.5 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6M3 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5M16.5 10a2.5 2.5 0 1 0 0-5M17 14c2.5.3 4 2.4 4 5", forge: "M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.6.8-2.4 1.6-3.2c.4 1.6 1.2 2 1.6 2c0-2.4-.8-4 .8-6.800M5 20h14M8 20l1-3h6l1 3", pad: "M6 9h12a3 3 0 0 1 3 3v2a3 3 0 0 1-5 2.2L14.5 15h-5L8 16.2A3 3 0 0 1 3 14v-2a3 3 0 0 1 3-3M8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01",
  flame: "M12 3c1 3.5 5 5 5 9.5a5 5 0 0 1-10 0c0-2 1-3 2-4c.5 2 1.5 2.5 2 2.5c0-3-1-5 1-8z",
  cloud: "M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.25 4.25 0 0 1 .5 8.5z", sun: "M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  moon: "M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z", bolt: "M13 3L5 13.5h6L10 21l8-10.5h-6z", snow: "M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9", wind: "M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 14h15a2.5 2.5 0 1 1-2.5 2.5M3 19h6",
  rain: "M7 15a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 6.5a4.25 4.25 0 0 1 .5 8.5M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5",
  calendar: "M5 6h14v14H5zM5 10h14M9 3.5v4M15 3.5v4", list: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01", grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  out: "M14 5h5v5M19 5l-8 8M11 6H6v12h12v-5", edit: "M5 19h4l10-10l-4-4L5 15zM13.5 6.5l4 4", trash: "M5 7h14M9 7V4.5h6V7M7 7l1 12.5h8L17 7", file: "M7 3.5h7l4 4V20.5H7zM14 3.5v4h4",
  hourglass: "M7 3.5h10M7 20.5h10M8 3.5c0 4 4 5.5 4 8.5s-4 4.500-4 8.500M16 3.5c0 4-4 5.5-4 8.5s4 4.500 4 8.500", scale: "M12 4v16M7 20h10M5 8h14M5 8l-2.500 6a3 3 0 0 0 5 0zM19 8l-2.500 6a3 3 0 0 0 5 0z", coin: "M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16M12 7.500a4.500 4.500 0 1 0 0 9a4.500 4.500 0 0 0 0-9",
  anvil: "M4 8h13a3 3 0 0 0 3-2H4zM7 8c0 3 1 4 3 5v3M15 8c0 3-1 4-3 5M7 19h10M8.500 16h7v3h-7z", tag: "M4 4h7l9 9-7 7-9-9zM8 8h.010", wing: "M3 17c5 0 9-2 12-6c2-2.700 4-4 6-4c-1 5-4 9-9 10.500c-3 1-6 .700-9-.500M9 14.500c2-.500 4-2 5.500-4",
  mail: "M4 6h16v12H4zM4 7l8 6l8-6", keys: "M4 5h16v14H4zM8 5v8M12 5v8M16 5v8M8 13v6M12 13v6M16 13v6", columns: "M4 20h16M5 8h14L12 4zM7 8v9M12 8v9M17 8v9M5 17h14", compass: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M15.500 8.500l-2 5l-5 2l2-5z",
  lock: "M6.500 11h11v9h-11zM8.500 11V8a3.500 3.500 0 0 1 7 0v3M12 14.500v2", eye: "M2.500 12s3.500-6.500 9.500-6.500s9.500 6.500 9.500 6.500s-3.500 6.500-9.500 6.500S2.500 12 2.500 12M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6", speaker: "M4 9.500v5h3.500l5 4v-13l-5 4zM16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11", mute: "M4 9.500v5h3.500l5 4v-13l-5 4zM16.500 9.500l4 5M20.500 9.500l-4 5",
  risk: "M4 19h16M6 19v-5M10 19V9M14 19v-8M18 19V5", shield: "M12 3l7 3v5.5c0 4.5-3 8-7 9.5c-4-1.5-7-5-7-9.5V6z", bell: "M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14zM10 20.5a2 2 0 0 0 4 0",
  aurora: "M3 16c3-6 5-10 9-6s6 0 9-6M3 20c4-4 6-6 10-3s5 1 8-3", civic: "M3 20h18M4 10h16M6 10v10M10 10v10M14 10v10M18 10v10M12 3l9 7H3z",
  feather: "M20 4a6 6 0 0 0-8.5 0L5 10.5V19h8.5L20 12.5A6 6 0 0 0 20 4M16 8L2 22M17.5 15H9", vault: "M4 5h16v14H4zM8 19v1.5M16 19v1.5M12 12a3 3 0 1 0 0 .01M12 9v1M12 14v1M9 12h1M14 12h1",
};
export function icon(name, size = 20) {
  return s("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", class: "ic" }, s("path", { d: ICON[name] || ICON.system }));
}

/* ---- toast ---- */
let toastBox;
export function toast(msg, { undo, ms = 5200, tone } = {}) {
  if (!toastBox) { toastBox = h("div.toasts", { role: "status", "aria-live": "polite" }); document.body.append(toastBox); }
  const t = h("div.toast" + (tone ? "." + tone : ""), h("span", msg));
  if (typeof undo === "function") t.append(h("button", { type: "button", onclick: () => { undo(); t.remove(); } }, "Undo"));
  toastBox.append(t); setTimeout(() => t.classList.add("out"), ms - 300); setTimeout(() => t.remove(), ms);
  return t;
}

/* ---- sheets: one at a time on top of the view; Esc, the backdrop and the phone's back button all close it ---- */
const stack = [];
window.addEventListener("popstate", () => { const top = stack[stack.length - 1]; if (top && top.pushed) { top.pushed = false; top.close(true); } });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && stack.length) { e.preventDefault(); stack[stack.length - 1].close(); } });
export const sheetOpen = () => stack.length > 0;
/** sheet({ title, body: element | (close) => element, wide }) -> { close, el } */
export function sheet({ title, body, tone, onclose }) {
  const last = document.activeElement; let closed = false;
  const api = { pushed: false, close(fromPop) {
    if (closed) return; closed = true; stack.splice(stack.indexOf(api), 1);
    if (api.pushed && !fromPop) { api.pushed = false; history.back(); }
    wrap.classList.add("out"); setTimeout(() => wrap.remove(), reduced() ? 0 : 220);
    if (onclose) onclose(); if (last && last.focus && document.contains(last)) last.focus({ preventScroll: true });
  } };
  const content = typeof body === "function" ? body(() => api.close()) : body;
  const panel = h("div.sheet" + (tone ? "." + tone : ""), { role: "dialog", "aria-modal": "true", "aria-label": title, tabindex: "-1" },
    h("header.sheet-head", h("h2", title), h("button.icon-btn", { type: "button", "aria-label": "Close", onclick: () => api.close() }, icon("x"))),
    h("div.sheet-body", content));
  const wrap = h("div.sheet-wrap", { onclick: (e) => { if (e.target === wrap) api.close(); } }, panel);
  document.body.append(wrap); stack.push(api);
  try { history.pushState({ sheet: stack.length }, ""); api.pushed = true; } catch (e) { /* no history: Esc and the backdrop still work */ }
  panel.addEventListener("keydown", (e) => {                                      // keep Tab inside the sheet
    if (e.key !== "Tab") return; const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel).filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return; const first = f[0], end = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); } else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
  });
  requestAnimationFrame(() => { wrap.classList.add("in"); const f = panel.querySelector("[autofocus]") || panel; f.focus({ preventScroll: true }); });
  api.el = panel; return api;
}
/** A yes/no question as a sheet. Resolves true or false. */
export function ask(title, text, yes = "Yes", tone) {
  return new Promise((ok) => { let ans = false;
    const sh = sheet({ title, tone, onclose: () => ok(ans), body: (close) => h("div.stack", h("p.lead", text), h("div.row.end", h("button.btn.ghost", { type: "button", onclick: close }, "Cancel"), h("button.btn" + (tone === "danger" ? ".danger" : ""), { type: "button", autofocus: true, onclick: () => { ans = true; close(); } }, yes))) });
    void sh; });
}

/* ---- form bits ---- */
export function field(label, control, hint) { return h("label.field", h("span.field-label", label), control, hint ? h("span.field-hint", hint) : null); }
/** A row of choices where exactly one is on. options: [[value, label]] */
export function seg(options, value, onchange, label) {
  const box = h("div.seg", { role: "radiogroup", "aria-label": label || "" });
  const draw = (v) => { box.replaceChildren(...options.map(([val, text]) => h("button" + (val === v ? ".on" : ""), { type: "button", role: "radio", "aria-checked": String(val === v), onclick: () => { if (val !== box.value) { box.value = val; draw(val); onchange(val); } } }, text))); };
  box.value = value; draw(value); return box;
}
export function chip(text, tone) { return h("span.chip" + (tone ? "." + tone : ""), text); }

/* ---- instruments ---- */
let gid = 0;
/** A ring gauge. value 0..1. */
export function ring({ value = 0, size = 96, stroke = 7, tone = "ice", center, label, track = true }) {
  const r = (size - stroke) / 2 - 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value)); const id = "rg" + gid++;
  const arc = s("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: `url(#${id})`, "stroke-width": stroke, "stroke-linecap": "round", "stroke-dasharray": `${c * v} ${c}`, transform: `rotate(-90 ${size / 2} ${size / 2})`, class: "ring-arc", opacity: v > 0 ? 1 : 0 });
  if (!reduced()) { arc.style.strokeDasharray = `0 ${c}`; requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.transition = "stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)"; arc.style.strokeDasharray = `${c * v} ${c}`; })); }
  const g = s("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: "ring tone-" + tone, role: "img", "aria-label": label || "" },
    s("defs", s("linearGradient", { id, x1: "0", y1: "0", x2: "1", y2: "1" }, s("stop", { offset: "0", class: "g0" }), s("stop", { offset: "1", class: "g1" }))),
    track ? s("circle", { cx: size / 2, cy: size / 2, r, fill: "none", class: "ring-track", "stroke-width": stroke }) : null, arc);
  return h("div.ring-box", { style: { width: size + "px", height: size + "px" } }, g, center ? h("div.ring-center", center) : null);
}
/** A half-dial (the payoff instrument). value 0..1 */
export function dial({ value = 0, width = 300, stroke = 10, tone = "mint", ticks = 48, label }) {
  const r = width / 2 - stroke - 4, cx = width / 2, cy = width / 2, len = Math.PI * r, v = Math.max(0, Math.min(1, value)); const id = "dl" + gid++;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const arc = s("path", { d, fill: "none", stroke: `url(#${id})`, "stroke-width": stroke, "stroke-linecap": "round", "stroke-dasharray": `${len * v} ${len}`, class: "ring-arc" });
  if (!reduced()) { arc.style.strokeDasharray = `0 ${len}`; requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.transition = "stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)"; arc.style.strokeDasharray = `${len * v} ${len}`; })); }
  const tk = []; for (let i = 0; i <= ticks; i++) { const a = Math.PI - (i / ticks) * Math.PI; const r1 = r + stroke / 2 + 5, r2 = r1 + (i % 6 === 0 ? 7 : 3.5);
    tk.push(s("line", { x1: cx + Math.cos(a) * r1, y1: cy - Math.sin(a) * r1, x2: cx + Math.cos(a) * r2, y2: cy - Math.sin(a) * r2, class: "dial-tick" + (i / ticks <= v ? " on" : "") })); }
  return s("svg", { viewBox: `0 0 ${width} ${cy + stroke}`, width, height: cy + stroke, class: "dial tone-" + tone, role: "img", "aria-label": label || "" },
    s("defs", s("linearGradient", { id, x1: "0", y1: "0", x2: "1", y2: "0" }, s("stop", { offset: "0", class: "g0" }), s("stop", { offset: "1", class: "g1" }))),
    s("path", { d, fill: "none", class: "ring-track", "stroke-width": stroke, "stroke-linecap": "round" }), ...tk, arc);
}
/** A sparkline or area from numbers. opts: { w, h, tone, fill, marks: [index], min, max } */
export function spark(values, { w = 160, h: ht = 40, tone = "ice", fill = true, marks = [], min, max, label } = {}) {
  const v = values.length ? values : [0]; const lo = min != null ? min : Math.min(...v), hi = max != null ? max : Math.max(...v); const span = hi - lo || 1; const n = Math.max(1, v.length - 1);
  const x = (i) => (i / n) * (w - 4) + 2, y = (val) => ht - 3 - ((val - lo) / span) * (ht - 6);
  const line = v.map((val, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(val).toFixed(1)}`).join(" "); const id = "sp" + gid++;
  return s("svg", { viewBox: `0 0 ${w} ${ht}`, width: w, height: ht, class: "spark tone-" + tone, preserveAspectRatio: "none", role: "img", "aria-label": label || "" },
    s("defs", s("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1" }, s("stop", { offset: "0", class: "f0" }), s("stop", { offset: "1", class: "f1" }))),
    fill ? s("path", { d: `${line} L${x(n)} ${ht} L${x(0)} ${ht} Z`, fill: `url(#${id})`, stroke: "none" }) : null,
    s("path", { d: line, fill: "none", class: "spark-line" }), ...marks.filter((i) => i >= 0 && i < v.length).map((i) => s("circle", { cx: x(i), cy: y(v[i]), r: 3, class: "spark-dot" })));
}
/** Small vertical bars (a week of minutes, a stack of loads). */
export function bars(values, { w = 140, h: ht = 36, tone = "ice", labels, max } = {}) {
  const hi = max || Math.max(1, ...values); const bw = w / values.length;
  return s("svg", { viewBox: `0 0 ${w} ${ht}`, width: w, height: ht, class: "bars tone-" + tone, role: "img", "aria-label": labels ? labels.map((l, i) => `${l} ${values[i]}`).join(", ") : "" },
    ...values.map((v, i) => { const bh = Math.max(2, (v / hi) * (ht - 2)); return s("rect", { x: i * bw + bw * 0.2, y: ht - bh, width: bw * 0.6, height: bh, rx: 2, class: v ? "bar on" : "bar" }); }));
}

/* ---- files ---- */
export function download(name, content, type = "application/json") {
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 1);
  const a = h("a", { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
/** Ask for one file; resolves { name, text } or null when the picker is dismissed. */
export function pickFile(accept = ".json,application/json") {
  return new Promise((ok) => {
    const inp = h("input", { type: "file", accept, style: { position: "fixed", left: "-9999px" } }); document.body.append(inp); let done = false;
    const finish = (v) => { if (done) return; done = true; inp.remove(); ok(v); };
    inp.addEventListener("change", () => { const f = inp.files && inp.files[0]; if (!f) return finish(null); const r = new FileReader(); r.onload = () => finish({ name: f.name, text: String(r.result) }); r.onerror = () => finish(null); r.readAsText(f); });
    inp.addEventListener("cancel", () => finish(null));
    inp.click();
  });
}
/** Count a number up into place (skipped when motion is reduced). */
export function countUp(el, to, fmt = (v) => String(Math.round(v)), ms = 700) {
  if (reduced() || !isFinite(to)) { el.textContent = fmt(to); return; }
  const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1 && el.isConnected) requestAnimationFrame(step); else el.textContent = fmt(to); };
  el.textContent = fmt(0); requestAnimationFrame(step);
}
