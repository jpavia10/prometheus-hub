/* Athenaeum: the place. Every idea is a star; what relates pulls together into constellations; each refinement is a moon; the slider
   replays the sky from the first spark to today; the chronicle winds in from deep time. Under the sky the records are exactly what
   they were: ideas are never edited, refinements only append, imports merge and never replace, nothing leaves this browser.
   Storage (unchanged keys): prometheus.athenaeum.ideas / shelf / ideasSeedV3 / histSeedV1. */
import { createSky } from "./sky.js";
import { relate, skeleton, clusters, layout, span, tOf, dateAt, provenance, refinementBy, mentions, arm, stats } from "./model.js";
import { PILLARS } from "../../../deck/pillars.js";
import { tick, blip, soundOn, setSound } from "../../../deck/core/fx.js";

const { $, h, day, toast, store, download, pickFile } = window.PK, VAULT = window.VAULT, MERGE = window.ATH_MERGE;
const S = store("athenaeum"), app = $("#app"), Q = new URLSearchParams(location.search);
const STILL = Q.get("still") === "1", TODAY = /^\d{4}-\d{2}-\d{2}$/.test(Q.get("today") || "") ? Q.get("today") : day();
const CALM = STILL || matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAL = [[1, .77, .32], [.73, .64, 1], [.44, .89, 1], [1, .56, .69], [.49, 1, .75], [.53, .66, 1], [1, .62, .36]];
const css = (c) => `rgb(${c.map((x) => Math.round(x * 255)).join(",")})`;
const fmt = (d) => { const x = new Date(String(d).slice(0, 10) + "T12:00:00"); return isNaN(x) ? String(d || "") : x.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
const nice = (t) => (t.length <= 3 ? t.toUpperCase() : t.replace(/-/g, " "));
const short = (t) => { const s = String(t).split(/ — | – | - |: /)[0].trim(); return s.length > 24 ? s.slice(0, 23).trim() + "…" : s; };
const mint = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const emit = (type, ref, title) => { try { if (window.PB && PB.events) PB.events.publish({ type, pillar: "athenaeum", ref, title }); } catch (e) { /* the log is optional */ } };
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const fill = (node, ...kids) => node.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
const icon = (d, w = 18) => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", w); s.setAttribute("height", w); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "1.7"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true"); const p = document.createElementNS(s.namespaceURI, "path"); p.setAttribute("d", d); s.append(p); return s; };

/* ---- the seeds, once (unchanged): the owner's canonical ideas and the history set ---- */
if (!S.get("ideasSeedV3") && window.ATHENAEUM_IDEAS) {
  const norm = (t) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim(), cur = S.list("ideas"), byTitle = new Map(cur.map((i) => [norm(i.title), i]));
  for (const inc of window.ATHENAEUM_IDEAS) {
    const hit = byTitle.get(norm(inc.title)); if (!hit) { cur.push(inc); byTitle.set(norm(inc.title), inc); continue; }
    const have = new Set((hit.chain || []).map((c) => c.date + "|" + c.text)); for (const c of inc.chain || []) if (!have.has(c.date + "|" + c.text)) (hit.chain = hit.chain || []).push(c);
    if (!hit.source && inc.source) hit.source = inc.source; if (!hit.strength && inc.strength) hit.strength = inc.strength; if (!hit.body && inc.body) hit.body = inc.body;
  }
  S.set("ideas", cur); S.set("ideasSeedV3", 1);
}
if (!S.get("histSeedV1") && window.ATHENAEUM_HISTORY) { for (const e of window.ATHENAEUM_HISTORY) S.add("shelf", { title: e.title, author: e.author, kind: "history", status: "done", chain: e.chain }); S.set("histSeedV1", 1); }
{ const l = S.list("ideas"); let fixed = false; for (const i of l) { if (!i.id) { i.id = mint(); fixed = true; } if (!Array.isArray(i.chain)) { i.chain = []; fixed = true; } } if (fixed) S.set("ideas", l); }   // a record needs a name to be linked to; nothing else is touched

/* ---- state ---- */
const st = { mode: "sky", sel: null, snap: "half", cluster: -1, q: "", sort: "new", archived: false, t: 1, playing: false, pushed: false, resAt: 0 };
let all = [], live = [], shelf = [], edges = [], drawn = [], groups = { list: [], of: [] }, nodes = [], sp = span([], TODAY), chron = [], pack = null, routed = null;

/* ---- the frame of the place ---- */
const modes = h("div.tabs.ath-modes", { role: "tablist", "aria-label": "Views" }, ...[["sky", "Sky"], ["chronicle", "Chronicle"], ["index", "Index"], ["shelf", "Shelf"]].map(([m, n]) => h("button.tab", { type: "button", role: "tab", "data-mode": m, "aria-selected": m === "sky" ? "true" : "false", onclick: () => go(m === "sky" ? "" : m, true) }, n)));
const legend = h("div.ath-legend", { role: "group", "aria-label": "Constellations" });
const resBtn = h("button.ath-res", { type: "button", hidden: true, onclick: () => { const r = VAULT.pickResurface(all, TODAY); if (!r.length) return; const pick = r[st.resAt++ % r.length]; go("idea/" + encodeURIComponent(pick.id), !!st.sel); } });
const hint = h("p.ath-hint", { "aria-hidden": "true" }, "Drag to turn · pinch to zoom · tap a star");
const hud = h("div.ath-hud", null, legend, resBtn, hint);
const range = h("input", { type: "range", min: "0", max: "1000", value: "1000", "aria-label": "Time. Drag to see the sky on an earlier day." });
const playBtn = h("button.ath-play", { type: "button", "aria-label": "Replay how the sky formed", onclick: () => (st.playing ? stop() : play()) }, icon("M8 5.5v13l11-6.500z", 16));
const ticks = h("div.ath-ticks", { "aria-hidden": "true" }), readout = h("output.ath-when");
const timebar = h("div.ath-time", null, playBtn, h("div.ath-track", null, ticks, range), readout);
const rail = h("div.ath-rail", { hidden: true, role: "list", "aria-label": "The chronicle, oldest first" });
const spark = h("button.ath-spark", { type: "button", "aria-label": "Capture a spark", onclick: () => go("new", !!st.sel) }, icon("M12 5v14M5 12h14", 22));
const pageIndex = h("section.ath-page", { id: "ath-index", hidden: true, "aria-label": "Index of ideas" }), pageShelf = h("section.ath-page", { id: "ath-shelf", hidden: true, "aria-label": "Reading and history shelf" });
const sheetBody = h("div.ath-body"), grab = h("button.ath-grab", { type: "button", "aria-label": "Make this panel taller or shorter" }, h("i"));
const sheetEl = h("div.ath-sheet", { hidden: true, role: "dialog", "aria-label": "Record" }, grab, h("button.ath-x", { type: "button", "aria-label": "Close", onclick: () => closeRecord() }, icon("M6 6l12 12M18 6L6 18", 18)), sheetBody);
const findIn = h("input", { type: "search", placeholder: "Search ideas, refinements, the chronicle…", "aria-label": "Search", autocomplete: "off" }), findOut = h("div.ath-found");
const finder = h("div.ath-find", { hidden: true, role: "dialog", "aria-label": "Search" }, h("div.ath-findbar", null, findIn, h("button.ath-ic", { type: "button", "aria-label": "Close search", onclick: () => closeFind() }, icon("M6 6l12 12M18 6L6 18", 18))), findOut);
app.append(modes, hud, timebar, rail, spark, pageIndex, pageShelf, sheetEl, finder);

const sky = createSky($("#sky"), $("#ath-layer"), { still: STILL, onPick: (kind, i) => {
  hint.classList.add("gone");
  if (kind === "idea" && live[i]) go("idea/" + encodeURIComponent(live[i].id), !!st.sel);
  else if (kind === "event" && chron[i]) go("event/" + chron[i].id, !!st.sel);
  else if (st.sel) closeRecord();
} });
document.body.classList.toggle("ath-flat", !sky.ok);

/* ---- data in, sky out ---- */
function rebuild() {
  all = S.list("ideas"); live = all.filter((i) => !i.archived); shelf = S.list("shelf");
  edges = relate(live); drawn = skeleton(live.length, edges); groups = clusters(live, edges); const pos = layout(live, drawn); sp = span(live, TODAY);
  const crowd = Math.max(1, Math.cbrt(live.length / 14));                          // a fuller sky gets smaller stars, so hundreds stay separate points of light
  nodes = live.map((i, k) => ({ id: i.id, title: i.title, label: short(i.title), pos: pos[k], color: PAL[groups.of[k] % PAL.length], size: Math.max(.72, Math.min(1.4, .78 + (((i.strength || 85) - 60) / 40) * .58)) / crowd,
    born: tOf(sp, i.created), sats: (i.chain || []).map((c) => ({ born: tOf(sp, c.date || i.created) })), dim: false }));
  sky.setIdeas(nodes); sky.setLinks(drawn.map((e) => ({ a: e.a, b: e.b, w: e.w }))); sky.setClusters(groups.list.map((g) => ({ name: g.name, color: PAL[g.index % PAL.length], members: g.members })));
  applyDim(); paintChrome();
}
function applyDim() {
  const hits = st.q ? new Set(VAULT.search(live, st.q).map((i) => i.id)) : null;
  nodes.forEach((n, k) => { n.dim = (st.cluster >= 0 && groups.of[k] !== st.cluster) || (hits ? !hits.has(n.id) : false); }); sky.refresh();
}
function paintChrome() {
  const s = stats(all, shelf, chron); $("#ath-count").textContent = `${plural(s.ideas, "idea")} · ${plural(s.refinements, "refinement")}`;
  legend.replaceChildren(...(groups.list.length > 1 ? groups.list.map((g) => h("button.ath-chip.c" + (st.cluster === g.index ? ".on" : ""), { type: "button", style: `--c:${css(PAL[g.index % PAL.length])}`, "aria-pressed": String(st.cluster === g.index), onclick: () => pickCluster(g.index) }, h("i"), g.name, h("b", null, g.members.length))) : []));
  const res = VAULT.pickResurface(all, TODAY); resBtn.hidden = !res.length; resBtn.textContent = res.length ? `${res.length} worth revisiting` : ""; resBtn.title = "Ideas you have not come back to in 30 days";
  ticks.replaceChildren(...live.flatMap((i) => [h("i.s", { style: `left:${(tOf(sp, i.created) * 100).toFixed(2)}%` }), ...(i.chain || []).map((c) => h("i", { style: `left:${(tOf(sp, c.date || i.created) * 100).toFixed(2)}%` }))]));
  if (!live.length) { hint.textContent = "Nothing kept yet. The + button keeps your first idea."; hint.classList.remove("gone"); } else if (hint.textContent.startsWith("Nothing")) hint.textContent = "Drag to turn · pinch to zoom · tap a star";
  paintWhen(); if (st.mode === "index") paintIndex(); if (st.mode === "shelf") paintShelf();
}
function pickCluster(k) {
  st.cluster = st.cluster === k ? -1 : k; applyDim(); paintChrome(); tick(); if (st.mode !== "sky" || st.sel) return;
  if (st.cluster < 0) return sky.flyHome("sky"); const m = groups.list[k].members, c = [0, 0, 0]; for (const i of m) for (let a = 0; a < 3; a++) c[a] += nodes[i].pos[a] / m.length; sky.lookAt(c);
}
function paintWhen() {
  if (st.t >= 1) { readout.textContent = "Today"; return; }
  const d = dateAt(sp, st.t), n = live.filter((i) => i.created <= d).length; readout.textContent = `${fmt(d)} · ${plural(n, "idea")}`;
}

/* ---- time ---- */
function setT(t, fromPlay) { st.t = Math.max(0, Math.min(1, t)); sky.setNow(st.t >= 1 ? 2 : st.t); if (!fromPlay || true) range.value = String(Math.round(st.t * 1000)); range.style.setProperty("--p", (st.t * 100).toFixed(1) + "%"); paintWhen(); }
function stop() { st.playing = false; playBtn.classList.remove("on"); playBtn.setAttribute("aria-label", "Replay how the sky formed"); }
function play(quick) {
  if (!nodes.length) return; if (st.sel) closeRecord(); st.playing = true; playBtn.classList.add("on"); playBtn.setAttribute("aria-label", "Stop the replay"); sky.flyHome("sky");
  const from = quick || st.t >= .999 ? 0 : st.t, dur = STILL ? 300 : quick ? 2600 : 3000 + 9000 * (1 - from), t0 = performance.now(), seen = new Set(nodes.filter((n) => n.born <= from).map((n) => n.id));
  const step = (tn) => { if (!st.playing) return; const u = Math.min(1, (tn - t0) / dur), t = from + (1 - from) * u; setT(t, true);
    nodes.forEach((n, i) => { if (!seen.has(n.id) && n.born <= t) { seen.add(n.id); sky.ignite(i); if (!quick) blip(); } }); if (u < 1) requestAnimationFrame(step); else { stop(); setT(1); } };
  requestAnimationFrame(step);
}
range.addEventListener("input", () => { stop(); hint.classList.add("gone"); setT(+range.value / 1000); });

/* ---- the sheet: one panel for a record, three heights ---- */
const heights = () => ({ peek: 168, half: Math.round(innerHeight * .58), full: innerHeight - 58 });
const wide = () => innerWidth >= 900;
function snap(to) { st.snap = to; sheetEl.dataset.snap = to; const px = heights()[to]; sheetEl.style.height = wide() ? "" : px + "px"; sky.setShift(wide() ? 0 : Math.min(.6, px / innerHeight), wide() ? -456 / innerWidth : 0); }
function openSheet(kind, content, to) { const was = !sheetEl.hidden; sheetEl.dataset.kind = kind; sheetBody.replaceChildren(content); sheetBody.scrollTop = 0; sheetEl.hidden = false; document.body.classList.add("ath-open");
  if (!was) { sheetEl.style.height = wide() ? "" : "0px"; requestAnimationFrame(() => snap(to || "half")); } else snap(to || st.snap);
  const head = sheetBody.querySelector("h2[tabindex]"); if (head && kind !== "new") head.focus({ preventScroll: true }); }
function hideSheet() { if (sheetEl.hidden) return; sheetEl.style.height = wide() ? "" : "0px"; document.body.classList.remove("ath-open"); sky.setShift(0, 0); const el = sheetEl; setTimeout(() => { if (!document.body.classList.contains("ath-open")) el.hidden = true; }, CALM ? 0 : 320); }
{ let y0 = 0, h0 = 0, moved = 0, on = false;
  grab.addEventListener("pointerdown", (e) => { if (wide()) return; on = true; y0 = e.clientY; h0 = sheetEl.getBoundingClientRect().height; moved = 0; grab.setPointerCapture(e.pointerId); sheetEl.classList.add("drag"); });
  grab.addEventListener("pointermove", (e) => { if (!on) return; moved = Math.max(moved, Math.abs(e.clientY - y0)); sheetEl.style.height = Math.max(60, Math.min(innerHeight - 40, h0 + y0 - e.clientY)) + "px"; });
  const end = (e) => { if (!on) return; on = false; sheetEl.classList.remove("drag"); const H = heights(), now = sheetEl.getBoundingClientRect().height;
    if (moved < 6) return snap(st.snap === "full" ? "half" : "full"); if (now < H.peek - 50) return closeRecord();
    snap(Object.entries(H).sort((a, b) => Math.abs(a[1] - now) - Math.abs(b[1] - now))[0][0]); };
  grab.addEventListener("pointerup", end); grab.addEventListener("pointercancel", end); }

/* ---- an idea, whole ---- */
function save(msg) { S.set("ideas", all); if (msg) toast(msg); }
function reason(e) { const p = []; if (e.linked) p.push("linked by you"); if (e.tags.length) p.push("shares " + e.tags.map(nice).join(", ")); if (e.terms.length) p.push("both speak of " + e.terms.slice(0, 3).join(", ")); return p.join(" · "); }
function codex(k) {
  const i = live[k], g = groups.list[groups.of[k]] || { name: "", index: 0 }, pv = provenance(i), res = VAULT.pickResurface(all, TODAY, 99).some((x) => x.id === i.id);
  const rel = edges.filter((e) => e.a === k || e.b === k).slice(0, 5), men = mentions(i, PILLARS), others = live.filter((o) => o.id !== i.id && !(i.links || []).includes(o.id));
  const ta = h("textarea", { rows: "2", maxlength: "2000", placeholder: "What did it become?", "aria-label": "A refinement" }), pick = h("select", { "aria-label": "Another idea" }, ...others.map((o) => h("option", { value: o.id }, short(o.title))));
  const add = () => { const t = ta.value.trim(); if (!t) return ta.focus(); i.chain.push({ date: TODAY, text: t, by: "you" }); i.lastResurfaced = TODAY; save(); emit("idea.refined", i.id, i.title); rebuild(); const k2 = live.findIndex((x) => x.id === i.id); sky.ignite(k2); blip(); showIdea(k2, true); toast("Appended. Nothing above it changed."); };
  return h("article.ath-codex", { style: `--c:${css(PAL[g.index % PAL.length])}` },
    h("p.ath-eyebrow", null, h("span.ath-chip.c", null, h("i"), g.name), h("span", null, "Sparked " + fmt(i.created))),
    h("h2", { tabindex: "-1" }, i.title),
    h("div.ath-meta", null, i.strength ? h("span.ath-meter", { title: "Scored when it was imported" }, h("i", { style: `width:${Math.max(4, Math.min(100, i.strength))}%` }), h("b", null, `Strength ${i.strength}`)) : null,
      h("span.ath-pv." + pv.kind, null, pv.kind === "typed" ? "Typed by you" : "Imported"), h("span.ath-pv", null, plural(i.chain.length, "refinement"))),
    h("p.ath-text", null, i.body),
    (i.tags || []).length ? h("div.ath-tags", null, ...i.tags.map((t) => h("button.ath-tag", { type: "button", onclick: () => { closeRecord(); openFind("\"" + t + "\""); } }, nice(t)))) : null,
    h("section", null, h("h3", null, "Lineage"),
      h("ol.ath-spine", null, h("li.spark", null, h("time", null, fmt(i.created)), h("p", null, "The spark, as it was first kept.")),
        ...i.chain.map((c) => h("li" + (refinementBy(i, c) === "you" ? ".you" : ""), null, h("time", null, fmt(c.date), h("em", null, refinementBy(i, c) === "you" ? "you" : "from the import")), h("p", null, c.text))),
        h("li.next", null, h("div.ath-add", null, ta, h("button.btn.small", { type: "button", onclick: add }, "Append")), h("small", null, "Added with today's date. Nothing above is ever rewritten.")))),
    rel.length ? h("section", null, h("h3", null, "Connected"), h("div.ath-rel", null, ...rel.map((e) => { const o = e.a === k ? e.b : e.a; return h("button", { type: "button", style: `--c:${css(nodes[o].color)};--w:${Math.round(Math.min(1, e.w * 1.8) * 100)}%`, onclick: () => go("idea/" + encodeURIComponent(live[o].id), true) }, h("i"), h("span", null, h("b", null, live[o].title), h("small", null, reason(e))), h("u")); }))) : null,
    others.length ? h("section", null, h("h3", null, "Link it yourself"), h("div.ath-add", null, pick, h("button.btn.quiet.small", { type: "button", onclick: () => { if (!pick.value) return; (i.links = i.links || []).push(pick.value); save(); rebuild(); showIdea(live.findIndex((x) => x.id === i.id), true); toast("Linked. The sky moved to match."); } }, "Link"))) : null,
    men.length ? h("section", null, h("h3", null, "Names these pillars"), h("div.ath-tags", null, ...men.map((p) => h("a.ath-tag.go", { href: p.ext ? p.route : "../../" + p.route }, p.name + " →")))) : null,
    chron.length && /\bhistor/i.test([i.title, i.body, ...(i.tags || [])].join(" ")) ? h("section", null, h("h3", null, "In the same sky"), h("button.ath-jump", { type: "button", onclick: () => go("chronicle", true) }, h("b", null, "The Chronicle"), h("span", null, `${chron.length} moments of cause and consequence, ${chron[0].short} to ${chron[chron.length - 1].short} →`))) : null,
    h("section.ath-prov", null, h("h3", null, "Where this comes from"), h("p", null, pv.label + "."), pv.kind === "imported" ? h("p", null, "The words above are a summary made from your conversations, not text you typed here. Refinements you append are marked as yours.") : null, h("p", null, "Kept in this browser only.")),
    h("div.ath-actions", null,
      res ? h("button.btn.quiet.small", { type: "button", onclick: () => { i.lastResurfaced = TODAY; save("Seen. It will come back in 30 days."); paintChrome(); showIdea(k, true); } }, "Seen · resurface later") : null,
      h("button.btn.quiet.small", { type: "button", onclick: () => { i.archived = true; save(); emit("idea.archived", i.id, i.title); closeRecord(); rebuild(); const id = i.id; toast("Archived. Still in the Index.", 7000, () => { all = S.list("ideas"); const back = all.find((x) => x.id === id); if (back) { back.archived = false; save(); rebuild(); } }); } }, "Archive")));
}
function showIdea(k, keep) {
  if (!live[k]) return; if (st.t < 1 && nodes[k].born > st.t) { stop(); setT(1); }
  st.sel = { kind: "idea", id: live[k].id }; if (st.mode === "sky") sky.focus("idea", k); openSheet("idea", codex(k), keep ? st.snap : sheetEl.hidden ? "half" : st.snap); if (!keep) tick();
}

/* ---- the chronicle ---- */
const yearShort = (y) => (y == null ? "" : y < 0 ? `${-y} BCE` : y < 1000 ? `${y} CE` : String(y));
function eventCard(k) {
  const e = chron[k], src = String(e.source || ""), cut = src.indexOf(" — http"), url = cut >= 0 ? src.slice(cut + 3) : "", flow = (label, text, main) => h("div.ath-step" + (main ? ".main" : ""), null, h("b", null, label), h("p", null, text));
  return h("article.ath-codex.ev", null,
    h("p.ath-eyebrow", null, h("span.ath-chip", null, e.civilization || "History"), h("span", null, e.date || "")),
    h("h2", { tabindex: "-1" }, e.name),
    h("div.ath-flow", null, flow("Cause", e.cause), flow("Event", e.event, true), flow("Consequence", e.consequence)),
    (e.evidence_quotes || []).length ? h("section", null, h("h3", null, "In the source's own words"), ...e.evidence_quotes.map((q) => h("blockquote", null, q))) : null,
    h("section.ath-prov", null, h("h3", null, "Where this comes from"), src ? h("p", null, cut >= 0 ? src.slice(0, cut) + " " : src, url ? h("a", { href: url, target: "_blank", rel: "noopener" }, "Open the article ↗") : null) : null,
      pack ? h("p", null, `Research pack ${pack.pack}, ${fmt(pack.asOf)}: compiled by an AI contributor, not written by you. ${(pack.notes || [])[2] || ""}`) : null),
    h("div.ath-actions", null, h("button.btn.quiet.small", { type: "button", disabled: k === 0, onclick: () => go("event/" + chron[k - 1].id, true) }, "← Earlier"), h("button.btn.quiet.small", { type: "button", disabled: k === chron.length - 1, onclick: () => go("event/" + chron[k + 1].id, true) }, "Later →")));
}
function showEvent(k, open) {
  if (!chron[k]) return; st.sel = open ? { kind: "event", id: chron[k].id } : st.sel; railAt = k; sky.focus("event", k);
  [...rail.children].forEach((c, i) => c.classList.toggle("on", i === k)); const card = rail.children[k];
  if (card && Math.abs(card.offsetLeft + card.offsetWidth / 2 - rail.scrollLeft - rail.clientWidth / 2) > 12) { railQuiet = performance.now() + 700; rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2, behavior: CALM ? "auto" : "smooth" }); }
  if (open) { openSheet("event", eventCard(k), sheetEl.hidden ? "half" : st.snap); tick(); }
}
let railQuiet = 0, railAt = -1;
function rideTo(k) { if (!chron[k]) return sky.flyHome("chronicle"); railAt = k; showEvent(k, false); }
function paintRail() {
  rail.replaceChildren(...chron.map((e, k) => h("button.ath-era", { type: "button", role: "listitem", onclick: () => go("event/" + e.id, !!st.sel) }, h("time", null, e.date || ""), h("b", null, e.name), h("small", null, e.civilization || ""))));
}
rail.addEventListener("scroll", () => { if (performance.now() < railQuiet || st.mode !== "chronicle" || st.sel) return; requestAnimationFrame(() => {
  const mid = rail.scrollLeft + rail.clientWidth / 2; let best = 0, bd = 1e9; [...rail.children].forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
  if (best !== railAt) { railAt = best; sky.focus("event", best); [...rail.children].forEach((c, i) => c.classList.toggle("on", i === best)); } }); }, { passive: true });
async function loadChronicle() {
  let entries = [];
  try { const r = await fetch("data/cause-event-consequence.json"); pack = await r.json(); entries = pack.entries || []; }
  catch (e) { pack = null; entries = (window.ATHENAEUM_HISTORY || []).map((x, i) => { const p = String(x.chain || "").split(" → "); return { id: "h" + i, name: x.title, civilization: x.author, date: "", cause: p[0] || "", event: p[1] || x.title, consequence: p[2] || "", source: "", evidence_quotes: [] }; }); }
  chron = arm(entries); chron.forEach((e) => { e.short = yearShort(e.year); }); sky.setChron(chron); paintRail(); paintChrome(); if (/^#event\//.test(location.hash)) route(true); else if (st.mode === "chronicle" && !st.sel) rideTo(0);
}

/* ---- capture ---- */
function capture() {
  const tally = new Map(); for (const i of live) for (const t of i.tags || []) tally.set(t, (tally.get(t) || 0) + 1);
  const title = h("input", { name: "title", required: true, maxlength: "120", placeholder: "Name it", "aria-label": "Title" }), body = h("textarea", { name: "body", required: true, maxlength: "2000", rows: "5", placeholder: "The idea, in your words", "aria-label": "The idea" }), tags = h("input", { name: "tags", maxlength: "120", placeholder: "tags, separated by commas", "aria-label": "Tags" });
  try { const hand = JSON.parse(sessionStorage.getItem("prometheus.handoff") || "null"); if (hand && hand.pillar === "athenaeum" && hand.text) { sessionStorage.removeItem("prometheus.handoff"); title.value = String(hand.text).slice(0, 120); body.value = String(hand.text).slice(0, 2000); } } catch (e) { /* nothing was handed over */ }   // words typed on the hub ("idea: ...") arrive here, still to be kept by hand
  const form = h("form.ath-form", { onsubmit: (e) => { e.preventDefault(); const t = title.value.trim(), b = body.value.trim(); if (!t || !b) return;
    const rec = S.add("ideas", { title: t, body: b, tags: tags.value.split(",").map((x) => x.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean), created: TODAY, chain: [], lastResurfaced: null, archived: false, origin: "typed" });
    emit("idea.captured", rec.id, rec.title); st.cluster = -1; stop(); setT(1); rebuild(); const k = live.findIndex((x) => x.id === rec.id); st.pushed = false; history.replaceState(null, "", location.pathname + location.search + "#idea/" + encodeURIComponent(rec.id)); routed = null; setMode("sky", true); showIdea(k); sky.ignite(k); blip(); toast("Kept. A new star."); } },
    h("label", null, h("span", null, "Title"), title), h("label", null, h("span", null, "The idea"), body), h("label", null, h("span", null, "Tags"), tags),
    tally.size ? h("div.ath-tags", null, ...[...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => h("button.ath-tag", { type: "button", onclick: () => { const cur = tags.value.split(",").map((x) => x.trim()).filter(Boolean); if (!cur.includes(t)) cur.push(t); tags.value = cur.join(", "); } }, "+ " + nice(t)))) : null,
    h("button.btn", { type: "submit" }, "Keep it"), h("small", null, "Kept with today's date, in this browser only. Marked as typed by you."));
  return h("article.ath-codex", null, h("p.ath-eyebrow", null, h("span", null, "A new spark")), h("h2", { tabindex: "-1" }, "Capture it before it goes."), form);
}

/* ---- index: every idea as a list (also the way in when the sky cannot start) ---- */
function paintIndex() {
  const q = h("input", { id: "a-q", type: "search", value: st.q, placeholder: "Search ideas and refinements", "aria-label": "Search ideas and refinements", oninput: (e) => { st.q = e.target.value; list.replaceChildren(...rows()); applyDim(); } });
  const sorts = [["new", "Newest"], ["strong", "Strongest"], ["deep", "Most refined"], ["az", "A to Z"]], by = { new: (a, b) => b.created.localeCompare(a.created), strong: (a, b) => (b.strength || 0) - (a.strength || 0), deep: (a, b) => b.chain.length - a.chain.length, az: (a, b) => a.title.localeCompare(b.title) };
  const rows = () => { const src = VAULT.search(st.archived ? all.filter((i) => i.archived) : live, st.q).slice().sort(by[st.sort]);
    return src.length ? src.map((i) => { const k = live.findIndex((x) => x.id === i.id), c = k >= 0 ? css(nodes[k].color) : "#8b93a7";
      return h("div.ath-row", { style: `--c:${c}` }, h("button.ath-rowmain", { type: "button", disabled: i.archived, onclick: () => go("idea/" + encodeURIComponent(i.id), !!st.sel) }, h("i"), h("span", null, h("b", null, i.title), h("small", null, i.body), h("em", null, `${fmt(i.created)} · ${plural(i.chain.length, "refinement")}${i.strength ? " · strength " + i.strength : ""}`))),
        i.archived ? h("button.btn.quiet.small", { type: "button", onclick: () => { i.archived = false; save("Restored to the sky."); rebuild(); } }, "Restore") : null); })
      : [h("p.empty", null, st.archived ? "Nothing is archived." : st.q ? "Nothing matches." : "No ideas yet. The + button keeps the first one.")]; };
  const list = h("div.ath-list", null, ...rows()), arch = all.length - live.length;
  fill(pageIndex, h("div.ath-pagehead", null, h("h2", null, st.archived ? "Archived" : "Every idea"), q,
    h("div.ath-sorts", { role: "group", "aria-label": "Order" }, ...sorts.map(([id, n]) => h("button.ath-chip" + (st.sort === id ? ".on" : ""), { type: "button", "aria-pressed": String(st.sort === id), onclick: () => { st.sort = id; paintIndex(); } }, n)),
      arch || st.archived ? h("button.ath-chip" + (st.archived ? ".on" : ""), { type: "button", "aria-pressed": String(st.archived), onclick: () => { st.archived = !st.archived; paintIndex(); } }, `Archived ${arch}`) : null)), list);
}

/* ---- shelf: reading, and history added by hand ---- */
function paintShelf() {
  const seeded = new Set(chron.map((e) => String(e.event || "").toLowerCase())), mine = shelf.filter((b) => !(b.kind === "history" && seeded.has(String(b.title).toLowerCase()))).sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  const inChron = shelf.length - mine.length, cycle = { want: "reading", reading: "done", done: "want" };
  const form = h("form.ath-form", { id: "a-shelf-form", onsubmit: (e) => { e.preventDefault(); const f = e.target; const rec = S.add("shelf", { title: f.title.value.trim(), author: f.author.value.trim(), kind: f.kind.value, status: f.status.value, chain: f.chain.value.trim() }); emit("shelf.added", rec.id, rec.title); shelf = S.list("shelf"); toast("Shelved."); paintShelf(); } },
    h("label", null, h("span", null, "Title"), h("input", { name: "title", required: true, maxlength: "140" })), h("label", null, h("span", null, "Author or source"), h("input", { name: "author", maxlength: "80" })),
    h("div.ath-two", null, h("label", null, h("span", null, "Kind"), h("select", { name: "kind" }, ...["book", "article", "history", "video", "other"].map((x) => h("option", null, x)))), h("label", null, h("span", null, "Status"), h("select", { name: "status" }, ...["want", "reading", "done"].map((x) => h("option", null, x))))),
    h("label", null, h("span", null, "Cause → event → consequence (for history)"), h("input", { name: "chain", maxlength: "240", placeholder: "Cause … → Event … → Consequence …" })), h("button.btn", { type: "submit" }, "Shelve it"));
  fill(pageShelf, h("div.ath-pagehead", null, h("h2", null, "Reading and history")),
    h("div.ath-list", null, ...(mine.length ? mine.map((b) => h("div.ath-row.shelf", null, h("span.ath-rowmain", null, h("span", null, h("b", null, b.title), b.author ? h("small", null, b.author) : null, b.chain ? h("em", null, b.chain) : null)),
      h("button.ath-chip.on", { type: "button", title: "Tap to change", "aria-label": `Status ${b.status}. Tap to change.`, onclick: () => { S.update("shelf", b.id, { status: cycle[b.status] || "want" }); shelf = S.list("shelf"); paintShelf(); } }, `${b.kind} · ${b.status}`))) : [h("p.empty", null, "Nothing shelved by hand yet.")])),
    inChron ? h("button.ath-jump", { type: "button", onclick: () => go("chronicle", true) }, h("b", null, `${inChron} history entries`), h("span", null, "live in the Chronicle, each with its cause and consequence →")) : null,
    h("h3.ath-sub", null, "Shelve something"), form);
}

/* ---- backup, sound, about ---- */
function menu() {
  const s = stats(all, shelf, chron), snd = h("button.ath-chip" + (soundOn() ? ".on" : ""), { type: "button", "aria-pressed": String(soundOn()), onclick: () => { setSound(!soundOn()); snd.classList.toggle("on", soundOn()); snd.setAttribute("aria-pressed", String(soundOn())); snd.textContent = soundOn() ? "Sound on" : "Sound off"; } }, soundOn() ? "Sound on" : "Sound off");
  return h("article.ath-codex", null, h("p.ath-eyebrow", null, h("span", null, "Athenaeum")), h("h2", { tabindex: "-1" }, "The idea, and everything it became."),
    h("p.ath-text.small", null, "Capture in seconds. Every refinement is appended with its date and never overwrites what came before. Ideas that share tags or words draw together by themselves; nothing here is sent anywhere to work that out."),
    h("section", null, h("h3", null, "Backup"), h("p", null, `${plural(s.ideas + s.archived, "idea")}, ${plural(s.refinements, "refinement")} and ${plural(s.shelf, "shelf entry").replace("entrys", "entries")} are in this browser.`),
      h("div.ath-actions", null, h("button.btn.small", { id: "export", type: "button", onclick: () => { download(`athenaeum_${TODAY}.json`, S.dump()); toast("Backup saved to your downloads."); } }, "Export a backup"), h("button.btn.quiet.small", { id: "import", type: "button", onclick: importFile }, "Import a file")),
      h("small", null, "An import only adds: new ideas, and refinements you do not have yet. It never replaces or deletes.")),
    h("section", null, h("h3", null, "Feel"), h("div.ath-actions", null, snd, h("button.ath-chip", { type: "button", onclick: () => { closeRecord(); setMode("sky", true); play(); } }, "Replay the sky"))),
    h("section.ath-prov", null, h("h3", null, "Keys"), h("p", null, "Arrows turn the sky, + and − zoom, / searches, N captures, Esc closes."), h("p", null, h("a", { href: "https://github.com/jpavia10/prometheus-hub/tree/main/pillars/athenaeum" }, "Code and homework"))));
}
async function importFile() {
  const f = await pickFile(); if (!f) return; let inc; try { inc = JSON.parse(await f.text()); } catch (e) { return toast("That file is not readable as a backup."); }
  if (inc && inc.pillar && inc.pillar !== "athenaeum") return toast(`That is a ${inc.pillar} backup, not an Athenaeum one.`);
  const data = inc && inc.data && typeof inc.data === "object" ? inc.data : inc, ideasIn = Array.isArray(data) ? data : (data && data.ideas) || [], shelfIn = Array.isArray(data) ? [] : (data && data.shelf) || [];
  const merged = MERGE.mergeIdeas(S.list("ideas"), ideasIn), cur = S.list("shelf"), seen = new Set(cur.map((b) => String(b.title).toLowerCase())), newShelf = shelfIn.filter((b) => b && b.title && !seen.has(String(b.title).toLowerCase()));
  const same = ideasIn.length - merged.added - merged.updated;
  openSheet("import", h("article.ath-codex", null, h("p.ath-eyebrow", null, h("span", null, "Before anything changes")), h("h2", { tabindex: "-1" }, f.name),
    h("ul.ath-preview", null, h("li", null, h("b", null, merged.added), " new ", merged.added === 1 ? "idea" : "ideas", " would be added"), h("li", null, h("b", null, merged.updated), " would gain refinements or details"), h("li", null, h("b", null, Math.max(0, same)), " are already here, unchanged"), h("li", null, h("b", null, newShelf.length), " new shelf ", newShelf.length === 1 ? "entry" : "entries")),
    h("p.ath-text.small", null, "Nothing is replaced and nothing is deleted."),
    h("div.ath-actions", null, h("button.btn.small", { id: "import-go", type: "button", disabled: !(merged.added || merged.updated || newShelf.length), onclick: () => { S.set("ideas", merged.all); if (newShelf.length) S.set("shelf", cur.concat(newShelf)); emit("import.merged", "", f.name); closeRecord(); rebuild(); toast(`Merged: ${merged.added} new, ${merged.updated} updated.`); } }, "Merge it in"), h("button.btn.quiet.small", { type: "button", onclick: () => closeRecord() }, "Cancel"))), "half");
}

/* ---- search across everything here ---- */
function paintFound() {
  const q = findIn.value.trim().replace(/^"|"$/g, ""); st.q = q; applyDim();
  const has = (o) => JSON.stringify(o).toLowerCase().includes(q.toLowerCase()), I = q ? VAULT.search(live, q).slice(0, 8) : [], E = q ? chron.filter(has).slice(0, 6) : [], B = q ? shelf.filter((b) => b.kind !== "history" && has(b)).slice(0, 4) : [];
  fill(findOut, ...(!q ? [h("p.empty", null, "Type a word. Matching stars stay lit.")] : !(I.length + E.length + B.length) ? [h("p.empty", null, "Nothing here matches.")] : [
    I.length ? h("h3", null, "Ideas") : null, ...I.map((i) => h("button.ath-hit", { type: "button", onclick: () => { closeFind(true); go("idea/" + encodeURIComponent(i.id), !!st.sel); } }, h("b", null, i.title), h("small", null, `${fmt(i.created)} · ${plural(i.chain.length, "refinement")}`))),
    E.length ? h("h3", null, "Chronicle") : null, ...E.map((e) => h("button.ath-hit", { type: "button", onclick: () => { closeFind(true); go("event/" + e.id, !!st.sel); } }, h("b", null, e.name), h("small", null, `${e.date} · ${e.civilization}`))),
    B.length ? h("h3", null, "Shelf") : null, ...B.map((b) => h("button.ath-hit", { type: "button", onclick: () => { closeFind(true); go("shelf", true); } }, h("b", null, b.title), h("small", null, `${b.kind} · ${b.status}`)))]));
}
function openFind(q) { finder.hidden = false; document.body.classList.add("ath-finding"); findIn.value = q || ""; paintFound(); findIn.focus(); }
function closeFind(keep) { if (finder.hidden) return; finder.hidden = true; document.body.classList.remove("ath-finding"); if (!keep) { st.q = ""; applyDim(); } else { st.q = ""; applyDim(); } }
findIn.addEventListener("input", paintFound); findIn.addEventListener("keydown", (e) => { if (e.key === "Enter") { const first = findOut.querySelector(".ath-hit"); if (first) first.click(); } });
$("#ath-find").addEventListener("click", () => openFind("")); $("#ath-more").addEventListener("click", () => go("menu", !!st.sel));

/* ---- where am I: modes and the address ---- */
function setMode(m, quiet) {
  if (!sky.ok && (m === "sky")) m = "index";
  const changed = st.mode !== m; st.mode = m; document.body.dataset.mode = m; modes.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
  pageIndex.hidden = m !== "index"; pageShelf.hidden = m !== "shelf"; rail.hidden = m !== "chronicle"; timebar.hidden = m !== "sky"; hud.hidden = m !== "sky"; spark.hidden = m === "shelf" || m === "chronicle";
  sky.pause(m === "index" || m === "shelf"); sky.setArm(m === "chronicle");
  if (changed || !quiet) { if (m === "sky") { sky.flyHome("sky"); } if (m === "chronicle") { stop(); setT(1); rideTo(Math.max(0, railAt)); } }
  if (m === "index") paintIndex(); if (m === "shelf") paintShelf();
}
function closeRecord() { if (st.pushed) { st.pushed = false; history.back(); return; } go(st.mode === "sky" ? "" : st.mode, true); }
function go(hash, replace) { const url = location.pathname + location.search + (hash ? "#" + hash : ""); if (replace) history.replaceState(history.state, "", url); else { history.pushState({ ath: 1 }, "", url); st.pushed = true; } route(); }
function route(force) {
  const raw = location.hash.replace(/^#/, ""); if (!force && raw === routed) return; routed = raw; const [a, b] = raw.split("/");
  if (a === "idea" && b) { const k = live.findIndex((i) => i.id === decodeURIComponent(b)); if (k >= 0) { if (st.mode !== "index" || !sky.ok) setMode(sky.ok ? "sky" : "index", true); return showIdea(k); } }
  if (a === "event" && b) { const k = chron.findIndex((e) => e.id === b); if (k >= 0) { setMode("chronicle", true); return showEvent(k, true); } if (!chron.length) return; }
  if (a === "new") { if (st.mode !== "index") setMode("sky", true); st.sel = { kind: "new" }; sky.focus(null); openSheet("new", capture(), "full"); setTimeout(() => { const t = sheetBody.querySelector("input"); if (t) t.focus(); }, CALM ? 0 : 350); return; }
  if (a === "menu") { st.sel = { kind: "menu" }; return openSheet("menu", menu(), "half"); }
  const had = st.sel; st.sel = null; hideSheet(); const m = ["chronicle", "index", "shelf"].includes(a) ? a : "sky";
  if (m !== st.mode) setMode(m); else if (had) { if (m === "sky") sky.flyHome("sky"); else if (m === "chronicle") rideTo(Math.max(0, railAt)); }
}
window.addEventListener("popstate", () => { st.pushed = !!(history.state && history.state.ath); route(); }); window.addEventListener("hashchange", () => route());
window.addEventListener("resize", () => { if (!sheetEl.hidden) snap(st.snap); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (!finder.hidden) return closeFind(); if (st.sel) return closeRecord(); }
  if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key; if (k === "/") { e.preventDefault(); openFind(""); } else if (k === "n" || k === "N") { e.preventDefault(); go("new", !!st.sel); }
  else if (st.mode === "sky" || st.mode === "chronicle") { if (k === "ArrowLeft") sky.nudge(-.18, 0); else if (k === "ArrowRight") sky.nudge(.18, 0); else if (k === "ArrowUp") sky.nudge(0, .12); else if (k === "ArrowDown") sky.nudge(0, -.12); else if (k === "+" || k === "=") sky.nudge(0, 0, .85); else if (k === "-" || k === "_") sky.nudge(0, 0, 1.18); else return; e.preventDefault(); hint.classList.add("gone"); }
});

/* ---- open ---- */
rebuild(); setT(1); setMode(sky.ok ? "sky" : "index", true); route(true); loadChronicle();
if (sky.ok && !CALM && !location.hash && live.length > 1) { let seen = false; try { seen = sessionStorage.getItem("prometheus.athenaeum.arrived") === "1"; sessionStorage.setItem("prometheus.athenaeum.arrived", "1"); } catch (e) { /* fine */ } if (!seen) play(true); }
setTimeout(() => { if (live.length) hint.classList.add("gone"); }, 9000);
window.__ath = { sky, st, get live() { return live; }, get chron() { return chron; }, get edges() { return edges; }, get groups() { return groups; }, go, setT, play, rebuild, ready: true };
