/* The core: every pillar as a cell of one reactor, around the fire. Tap a cell and the deck warps into that pillar; hold it for its
   brief. The middle cell is the command key. Badges and the ticker are real: the pillars' own storage on this device, the shared
   deadline bus, the fixed dates and Titan's published ledger. Nothing here is invented. */
import { h, s, icon, sheet, money, plural } from "../core/ui.js";
import { clock, today, diffDays, fmtDay, fmtTime, addDays } from "../core/dates.js";
import { PILLARS } from "../pillars.js";
import { pillarStats, titan } from "../core/legacy.js";
import { rows as feedRows } from "../core/feeds.js";
import { warp, tick, blip, bootSound, buzz } from "../core/fx.js";

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const CELLS = (() => { const out = []; for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) { const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)); if (d <= 2) out.push({ q, r, d, x: Math.sqrt(3) * (q + r / 2), y: 1.5 * r }); }
  const ang = (c) => (Math.atan2(c.y, c.x) + Math.PI * 2.5) % (Math.PI * 2);                                  // clockwise from the top
  return { core: out.find((c) => c.d === 0), r1: out.filter((c) => c.d === 1).sort((a, b) => ang(a) - ang(b)), r2: out.filter((c) => c.d === 2).sort((a, b) => ang(a) - ang(b)) }; })();

function badgeFor(p, stats, t, tn) {
  if (p.id === "titan" && tn && tn.total) return "$" + (tn.total >= 1000 ? (tn.total / 1000).toFixed(1) + "k" : Math.round(tn.total));
  const st = stats[p.id]; if (!st) return null;
  if (st.next) { const n = diffDays(t, st.next.date); return n === 0 ? "today" : n + "d"; }
  return st.records ? String(st.records) : null;
}
function brief(p, stats, t, tn, enter) {
  const st = stats[p.id] || {}; const lines = [];
  if (p.id === "titan" && tn) lines.push(`${money(tn.total)} · ${tn.flips} specimens · ${tn.countries} countries`);
  if (st.next) lines.push(`Next: ${st.next.title}, ${fmtDay(st.next.date)}`);
  if (st.records) lines.push(`${plural(st.records, "entry", "entries")} on this device`);
  if (!lines.length) lines.push(p.ext ? "Lives on its own site; its data stays there." : "Nothing entered on this device yet.");
  sheet({ title: p.name, body: (close) => h("div.stack.brief", { style: `--c:hsl(${p.hue} 100% 68%)` }, h("p.lead", p.what), h("div.items", lines.map((l) => h("div.item", h("span.pip"), h("span.item-main", h("b", l))))),
    h("div.row.end", h("button.btn.ghost", { type: "button", onclick: close }, "Stay"), h("button.btn.enter", { type: "button", autofocus: true, onclick: (e) => { close(); setTimeout(() => enter(e.currentTarget), 180); } }, icon("right", 18), "Enter"))) });
}

export function reactor(ctx) {
  const t = today(); const stats = pillarStats(t); let tn = null; const W = Math.min(innerWidth - 12, 430); const size = W / (5 * Math.sqrt(3)); const cx = W / 2, cy = 4 * size; const hw = Math.sqrt(3) * size, hh = 2 * size;
  const pos = (c) => ({ left: (cx + c.x * size - hw / 2).toFixed(1) + "px", top: (cy + c.y * size - hh / 2).toFixed(1) + "px", width: hw.toFixed(1) + "px", height: hh.toFixed(1) + "px" });
  const stage = h("div.rx-stage", { style: { width: W + "px", height: (8 * size).toFixed(1) + "px" } });
  const lines = s("svg", { class: "rx-lines", viewBox: `0 0 ${W} ${8 * size}`, "aria-hidden": "true" }, ...CELLS.r1.map((c, i) => s("line", { x1: cx, y1: cy, x2: cx + c.x * size, y2: cy + c.y * size, style: `--i:${i}` })),
    ...CELLS.r2.map((c, i) => { const n = CELLS.r1.slice().sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0]; return s("line", { class: "outer", x1: cx + n.x * size, y1: cy + n.y * size, x2: cx + c.x * size, y2: cy + c.y * size, style: `--i:${i}` }); }));
  stage.append(lines);
  const enter = (p, el) => { const b = el.getBoundingClientRect(); const go = () => { location.href = p.route; }; warp(b.left + b.width / 2, b.top + b.height / 2, `hsl(${p.hue} 100% 70%)`, go); };
  const cells = [...CELLS.r1, ...CELLS.r2]; const badges = new Map();
  PILLARS.forEach((p, i) => { const c = cells[i]; if (!c) return; const b = h("i.hex-badge", { hidden: true }); badges.set(p.id, b); let held = false, timer = null;
    const a = h("a.hex-in", { href: p.route, "aria-label": `${p.name}: ${p.what}`, draggable: "false",
      onpointerdown: () => { held = false; tick(); timer = setTimeout(() => { held = true; buzz(18); brief(p, stats, t, tn, () => enter(p, a)); }, 460); }, onpointerup: () => clearTimeout(timer), onpointerleave: () => clearTimeout(timer), onpointercancel: () => clearTimeout(timer), oncontextmenu: (e) => e.preventDefault(),
      onclick: (e) => { e.preventDefault(); clearTimeout(timer); if (held) return; enter(p, a); } }, icon(p.icon, Math.round(size * 0.52)), h("span.hex-name", p.short), b);
    stage.append(h("div.hex.ring" + c.d, { style: { ...pos(c), "--c": `hsl(${p.hue} 100% 68%)`, "--i": i }, dataset: { pillar: p.id } }, a)); });
  const now = clock.now(); const timeEl = h("b.num", fmtTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`).replace(/ ?[AP]M/i, ""));
  stage.append(h("div.hex.core", { style: pos(CELLS.core) }, h("button.hex-in", { type: "button", "aria-label": "Command: search or add", onclick: () => { blip(); ctx.openSearch(); } }, h("span.plasma", { "aria-hidden": "true" }), timeEl, h("span.hex-name", "Command"))));
  const paint = () => { for (const p of PILLARS) { const b = badges.get(p.id), v = badgeFor(p, stats, t, tn); if (b && v) { b.textContent = v; b.hidden = false; } } };
  paint(); titan().then((d) => { tn = d; if (d) { paint(); const el = document.getElementById("titan-live"); if (el) el.replaceWith(titanTile(d)); } });

  /* the lattice leans toward the finger, or with the phone */
  const lean = (x, y) => { stage.style.setProperty("--tx", (Math.max(-1, Math.min(1, x)) * 9).toFixed(2) + "deg"); stage.style.setProperty("--ty", (Math.max(-1, Math.min(1, y)) * -9).toFixed(2) + "deg"); };
  const onMove = (e) => { if (e.pointerType === "mouse") lean((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2); };
  const onTilt = (e) => { if (e.gamma == null) return; lean(e.gamma / 28, (e.beta - 42) / 34); };
  if (!still()) { addEventListener("pointermove", onMove, { passive: true }); addEventListener("deviceorientation", onTilt, { passive: true }); }

  /* the ticker: one line of what is true right now */
  const facts = []; const soon = feedRows(t, addDays(t, 30)).filter((r) => !r.done); const fixedNext = soon.find((r) => r.fixed), mine = soon.filter((r) => !r.fixed);
  facts.push(`${PILLARS.length} pillars online`);
  if (mine[0]) facts.push(`next: ${mine[0].title} · ${diffDays(t, mine[0].date) === 0 ? "today" : "in " + plural(diffDays(t, mine[0].date), "day")}`);
  if (fixedNext) facts.push(`${fixedNext.title} in ${plural(diffDays(t, fixedNext.date), "day")}`);
  const held = Object.values(stats).reduce((n, x) => n + x.records, 0); if (held) facts.push(`${plural(held, "entry", "entries")} across the pillars on this device`);
  const w = ctx.weather(); if (w && w.now) facts.push(`${Math.round(w.now.temp)}° outside${(w.alerts || []).length ? " · " + w.alerts[0].event : ""}`);
  const line = () => facts.map((f) => h("span", f)); const tickerEl = h("div.ticker", { "aria-label": facts.join(". ") }, h("div.ticker-run", { "aria-hidden": "true" }, line(), line()));
  titan().then((d) => { if (d && d.total && tickerEl.isConnected) { facts.push(`Titan ${money(d.total)} · ${d.flips} specimens`); tickerEl.firstChild.replaceChildren(...line(), ...line()); } });

  const el = h("section.reactor", { "aria-label": "The pillars" }, h("div.rx-wrap", stage), tickerEl);
  el.cleanup = () => { removeEventListener("pointermove", onMove); removeEventListener("deviceorientation", onTilt); };
  return el;
}

/** Titan on the hub: its real total and its newest coins, straight from its published ledger. */
export function titanTile(d) {
  if (!d) return h("span", { id: "titan-live", hidden: true });
  return h("a.tile.titan", { id: "titan-live", href: d.url, "aria-label": "Titan Reliquary" }, h("span.tile-head", h("span", "Titan Reliquary"), h("small", `${d.flips} specimens`)),
    h("span.tile-main", h("span", h("b.num.big", money(d.total, 0)), h("small", `${Number(d.ag).toFixed(2)} oz silver · ${Number(d.au).toFixed(4)} oz gold`))),
    h("span.coins", d.newest.map((c) => h("img", { src: c.img, alt: "", loading: "lazy", decoding: "async", width: 96, height: 96 }))), h("small.quiet", "newest arrivals"));
}

/** The boot: once a session. A line ignites, the systems count in, the core lights. Tap to skip. */
export function boot(force) {
  let seen = false; try { seen = !!sessionStorage.getItem("prom.deck.boot"); sessionStorage.setItem("prom.deck.boot", "1"); } catch (e) { /* play it */ }
  if ((seen && !force) || still() || (clock.pinned && clock.pinned() && !force)) return;
  const rows = [["CORE", "IGNITION"], ["PILLARS", PILLARS.length + " / " + PILLARS.length], ["SKY", "LIVE"], ["DATA", "ON DEVICE"]];
  const el = h("div.boot", { onclick: () => end() }, h("div.boot-line"), h("div.boot-box", h("b", "PROMETHEUS"), ...rows.map(([k, v], i) => h("p", { style: `--i:${i}` }, h("span", k), h("i"), h("em", v)))));
  document.body.append(el); document.body.classList.add("booting"); bootSound(); let over = false;
  function end() { if (over) return; over = true; el.classList.add("out"); document.body.classList.remove("booting"); document.body.classList.add("ignite"); setTimeout(() => el.remove(), 520); setTimeout(() => document.body.classList.remove("ignite"), 2200); }
  setTimeout(end, 2100);
}
