/* Ludus Arcade. The shipped library is a neutral example. Notes you add stay in this browser
   (prometheus.games.backlog). The example release date publishes to the deadlines bus. */
(function () {
  "use strict";
  const { $, h, toast, store, download, pickFile, field, G } = PK;
  const S = store("games");
  const app = $("#app");
  const D = window.GAMES_DATA || { games: [], takes: [], now: {} };
  field({ count: 500, at: [0.8, 0.3], scale: 0.2, glyph: (n) => [...G.ring(Math.round(n * 0.5), 1), ...G.line(Math.round(n * 0.5), -0.7, 0.7, 0.7, -0.7)] });
  const ST = { playing: "Playing", preloaded: "Preloaded", finished: "Finished", dropped: "Dropped", wishlist: "Wishlist", unknown: "In the mix" };
  const hueOf = (t) => { let x = 0; for (const c of String(t)) x = (x * 31 + c.charCodeAt(0)) % 997; return (x * 47) % 360; };
  const mono = (t) => String(t).replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "•";

  /* ---- countdown hero ---- */
  const cd = D.now.countdown || { title: "Example release", date: "2026-11-18", detail: "A placeholder date you can replace" };
  try { if (window.PB && cd.date) PB.deadlines.publish({ source: "games", ref: "next-release", title: cd.title, date: cd.date }); } catch (e) { /* bus is optional */ }
  const target = new Date(cd.date + "T00:00:00");
  const clockEl = h("div.cd-clock", null, "…");
  const tickClock = () => {
    const ms = target - new Date();
    if (ms <= 0) { clockEl.textContent = "Playable now"; return; }
    const d = Math.floor(ms / 864e5), hh = Math.floor(ms / 36e5) % 24, mm = Math.floor(ms / 6e4) % 60, ss = Math.floor(ms / 1e3) % 60;
    clockEl.textContent = `${d}d ${String(hh).padStart(2, "0")}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
  };
  tickClock(); setInterval(tickClock, 1000);
  const nowGames = (D.games || []).filter((g) => g.status === "playing" || g.status === "preloaded");
  app.append(
    h("section.g-count", null,
      h("div.cd-title", null, `${cd.title} — the countdown`),
      clockEl,
      h("div.cd-detail", null, `${cd.detail} · unlocks ${cd.date}`)),
    h("h2", null, "Now playing"),
    h("div.g-now", null, ...nowGames.map((g) => h("div.g-nowcard", null, h("b", null, g.title), h("span", null, `${ST[g.status]}${g.coopDad ? " · co-op" : ""}${(g.platforms || []).length ? " · " + g.platforms.join(", ") : ""}`))))
  );

  /* ---- library ---- */
  app.append(h("h2", null, `The library — ${D.games.length} games`));
  const statuses = ["all", ...Object.keys(ST).filter((s) => D.games.some((g) => g.status === s))];
  const platforms = ["all", ...new Set(D.games.flatMap((g) => g.platforms || []))];
  let fStatus = "all", fPlatform = "all", fQ = "";
  const grid = h("div.g-grid", null);
  const countEl = h("p.g-meta", null, "");
  const chipRow = h("div.g-filters", null,
    ...statuses.map((s) => h("button.btn.quiet.small" + (s === "all" ? ".on" : ""), { type: "button", "data-st": s, onclick: (e) => { fStatus = s; chipRow.querySelectorAll("[data-st]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-st") === s)); paint(); } }, s === "all" ? "All" : ST[s])),
    h("select", { onchange: (e) => { fPlatform = e.target.value; paint(); }, "aria-label": "Platform" },
      ...platforms.map((p) => h("option", { value: p }, p === "all" ? "Any platform" : p))),
    h("input", { type: "search", placeholder: "Search title, take, note…", oninput: (e) => { fQ = e.target.value.toLowerCase(); paint(); }, "aria-label": "Search the library" }));
  app.append(chipRow, countEl, grid);
  function paint() {
    const list = D.games.filter((g) =>
      (fStatus === "all" || g.status === fStatus) &&
      (fPlatform === "all" || (g.platforms || []).includes(fPlatform)) &&
      (!fQ || (g.title + " " + (g.hisTake || "") + " " + (g.note || "")).toLowerCase().includes(fQ)));
    countEl.textContent = `${list.length} of ${D.games.length} shown`;
    grid.replaceChildren(...list.map((g) =>
      h("article.g-tile", null,
        h("div.g-art", { style: `background: linear-gradient(130deg, hsl(${hueOf(g.title)} 65% 34%), hsl(${(hueOf(g.title) + 50) % 360} 70% 18%))` }, mono(g.title)),
        h("div.g-body", null,
          h("h3", null, g.title),
          h("div.g-meta", null, `${g.firstMention || ""}${g.lastMention && g.lastMention !== g.firstMention ? " → " + g.lastMention : ""} · ${g.mentions || 0} messages`),
          g.hisTake ? h("p.g-take", null, `“${g.hisTake}”`) : null,
          g.note ? h("p.g-note", null, g.note) : null,
          h("div.g-tags", null,
            h("span.chip.st-" + g.status, null, ST[g.status] || g.status),
            ...(g.platforms || []).map((p) => h("span.chip", null, p)),
            g.coopDad ? h("span.chip.dad", null, "co-op") : null,
            g.genre ? h("span.chip", null, g.genre) : null)))));
    if (!list.length) grid.append(h("p.empty", null, "Nothing matches — loosen the filters."));
  }
  paint();

  /* ---- co-op with Dad ---- */
  const coop = D.games.filter((g) => g.coopDad);
  if (coop.length) app.append(h("h2", null, "Co-op"), h("div.g-now", null, ...coop.map((g) => h("div.g-nowcard", null, h("b", null, g.title), h("span", null, g.note || "")))));

  /* ---- his takes ---- */
  const takes = [...(D.takes || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (takes.length) app.append(h("h2", null, "Notes"), h("div.g-takes", null, ...takes.map((t) => h("div.g-take-row", null, h("time", null, t.date || ""), h("p", null, `“${t.quote}”`, t.game ? h("span.g-meta", null, ` — ${t.game}`) : null)))));

  /* ---- next up + personal backlog ---- */
  app.append(h("h2", null, "Next up"));
  const nextList = h("ul.g-backlog", null);
  const paintNext = () => {
    const mine = S.get("backlog") || [];
    nextList.replaceChildren(
      ...(D.now.nextUp || []).map((n) => h("li", null, h("b", null, n.title), n.note ? ` — ${n.note}` : "")),
      ...mine.map((n) => h("li", null, h("b", null, n.title), n.note ? ` — ${n.note}` : " ", h("button.btn.quiet.small", { type: "button", onclick: () => { S.set("backlog", (S.get("backlog") || []).filter((x) => x.id !== n.id)); paintNext(); } }, "Done"))));
  };
  paintNext();
  app.append(nextList);
  const tIn = h("input", { type: "text", placeholder: "Add a game to your queue…", maxlength: "120" });
  const nIn = h("input", { type: "text", placeholder: "Note (optional)", maxlength: "200" });
  app.append(h("form.g-add", { onsubmit: (e) => { e.preventDefault(); const t = tIn.value.trim(); if (!t) return; const l = S.get("backlog") || []; l.push({ id: Date.now().toString(36), title: t, note: nIn.value.trim() }); S.set("backlog", l); tIn.value = ""; nIn.value = ""; paintNext(); toast("Added to your queue."); } }, tIn, nIn, h("button.btn.small", { type: "submit" }, "Add")));

  /* ---- provenance ---- */
  if (D.meta) app.append(h("p.g-meta", null, `Dataset built ${D.meta.built} — ${D.meta.source}`));

  $("#export").onclick = () => download("ludus-backlog.json", { backlog: S.get("backlog") || [] });
  $("#import").onclick = async () => {
    try { const f = await pickFile(); if (!f) return; const obj = JSON.parse(await f.text()); if (Array.isArray(obj.backlog)) { S.set("backlog", obj.backlog); paintNext(); toast("Backlog imported."); } }
    catch (e) { toast("That file didn't parse."); }
  };
})();
