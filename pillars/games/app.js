/* Ludus Arcade (Sebastian, 2026-11-13): Joseph's game library from his own words.
   Shipped dataset (games-data.js) is read-only truth; his own backlog additions layer on top
   in this browser (prometheus.games.backlog). The GTA VI date publishes to the deadlines bus.
   Design pass (2026-11-14): marquee countdown, typographic cover cards, warm co-op shelf,
   quote timeline — presentation only; structure, store keys and data flow unchanged. */
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
  const artStyle = (g) => `background: linear-gradient(135deg, hsl(${hueOf(g.title)} 62% 36%), hsl(${(hueOf(g.title) + 48) % 360} 68% 15%))`;

  try { if (window.PB) PB.deadlines.publish({ source: "games", ref: "gta-vi", title: "GTA VI — playable on PS5", date: (D.now.countdown || {}).date || "2026-11-18" }); } catch (e) { /* bus is optional */ }

  /* ---- countdown marquee ---- */
  const cd = D.now.countdown || { title: "GTA VI", date: "2026-11-18", detail: "" };
  const cdGame = (D.games || []).find((g) => g.title === cd.title) || null;
  const target = new Date(cd.date + "T00:00:00");
  const cdNums = {};
  const cdUnit = (lab) => { const n = h("span.cd-num", null, "––"); cdNums[lab] = n; return h("div.cd-unit", null, n, h("span.cd-lab", null, lab)); };
  const clockEl = h("div.cd-clock", null, cdUnit("Days"), cdUnit("Hrs"), cdUnit("Min"), cdUnit("Sec"));
  const meterFill = h("i", null);
  const meterPct = h("span.cd-meter-pct", null, "");
  const tickClock = () => {
    const ms = target - new Date();
    if (ms <= 0) { clockEl.textContent = "Playable now"; meterFill.style.width = "100%"; meterPct.textContent = "Unlocked"; return; }
    const d = Math.floor(ms / 864e5), hh = Math.floor(ms / 36e5) % 24, mm = Math.floor(ms / 6e4) % 60, ss = Math.floor(ms / 1e3) % 60;
    cdNums.Days.textContent = d; cdNums.Hrs.textContent = String(hh).padStart(2, "0");
    cdNums.Min.textContent = String(mm).padStart(2, "0"); cdNums.Sec.textContent = String(ss).padStart(2, "0");
    const pct = Math.max(0, Math.min(100, (1 - (ms / 864e5) / 365) * 100));
    meterFill.style.width = pct.toFixed(1) + "%";
    meterPct.textContent = `${pct.toFixed(0)}% of the final year already gone`;
  };
  tickClock(); setInterval(tickClock, 1000);
  const ghostTxt = (cd.title.match(/[IVX]+$/) || [mono(cd.title)])[0];
  const nowGames = (D.games || []).filter((g) => g.status === "playing" || g.status === "preloaded");
  const nowCard = (g, extra) =>
    h("div.g-nowcard st-" + g.status, null,
      h("div.g-nowart art-" + g.status, { style: artStyle(g), "aria-hidden": "true" },
        h("span.g-nowmono", null, mono(g.title)),
        (g.platforms || []).length ? h("span.g-nowplat", null, (g.platforms || []).join(" · ")) : null),
      h("div.g-nowbody", null,
        h("b", null, g.title),
        h("span.g-nowmeta", null, `${ST[g.status]}${g.coopDad ? " · with Dad" : ""}${(g.platforms || []).length ? " · " + g.platforms.join(", ") : ""}`),
        extra || null));
  app.append(
    h("section.g-count", null,
      h("span.cd-ghost", { "aria-hidden": "true" }, ghostTxt),
      h("div.cd-top", null,
        h("div.cd-title", null, `${cd.title} — the countdown`),
        h("span.cd-live", null, h("i.cd-dot", null), "Live countdown")),
      h("div.cd-game", null, cd.title),
      clockEl,
      h("div.cd-meter", null, h("div.meter", null, meterFill), meterPct),
      h("div.cd-detail", null, `${cd.detail} · unlocks ${cd.date}`),
      cdGame ? h("div.cd-badges", null,
        ...(cdGame.platforms || []).map((p) => h("span.chip.cd-badge", null, p)),
        cdGame.status === "preloaded" ? h("span.chip.cd-badge.hot", null, "Preloaded on the console") : null) : null),
    h("h2", null, "Now playing"),
    h("div.g-now", null, ...nowGames.map((g) => nowCard(g)))
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
        h("div.g-art art-" + g.status, { style: artStyle(g), "data-status": ST[g.status] || g.status },
          h("span.g-art-mono", { "aria-hidden": "true" }, mono(g.title)),
          h("span.g-art-title", null, g.title)),
        h("div.g-body", null,
          h("h3", null, g.title),
          h("div.g-meta", null, `${g.firstMention || ""}${g.lastMention && g.lastMention !== g.firstMention ? " → " + g.lastMention : ""} · ${g.mentions || 0} messages`),
          g.hisTake ? h("p.g-take", null, `“${g.hisTake}”`) : null,
          g.note ? h("p.g-note", null, g.note) : null,
          h("div.g-tags", null,
            h("span.chip.st-" + g.status, null, ST[g.status] || g.status),
            ...(g.platforms || []).map((p) => h("span.chip", null, p)),
            g.coopDad ? h("span.chip.dad", null, "with Dad") : null,
            g.genre ? h("span.chip", null, g.genre) : null)))));
    if (!list.length) grid.append(h("p.empty", null, "Nothing matches — loosen the filters."));
  }
  paint();

  /* ---- co-op with Dad ---- */
  const coop = D.games.filter((g) => g.coopDad);
  if (coop.length) app.append(
    h("section.g-coop", null,
      h("h2", null, "Co-op with Dad"),
      h("p.g-coop-sub", null, "The cross-play shelf — his PC, Dad's PS5, one shared world at a time."),
      h("div.g-now g-coop-grid", null, ...coop.map((g) => nowCard(g, g.note ? h("p.g-coop-note", null, g.note) : null)))));

  /* ---- his takes ---- */
  const takes = [...(D.takes || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (takes.length) app.append(h("h2", null, "His takes"), h("div.g-takes", null, ...takes.map((t) => h("div.g-take-row", null, h("time", { style: `--th:${hueOf(t.game || t.quote || "")}` }, t.date || ""), h("p", null, `“${t.quote}”`, t.game ? h("span.g-meta", null, ` — ${t.game}`) : null)))));

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
  const tIn = h("input", { type: "text", placeholder: "Add a game to your queue…", maxlength: "120", "aria-label": "Add a game to your queue" });
  const nIn = h("input", { type: "text", placeholder: "Note (optional)", maxlength: "200", "aria-label": "Note (optional)" });
  app.append(h("form.g-add", { onsubmit: (e) => { e.preventDefault(); const t = tIn.value.trim(); if (!t) return; const l = S.get("backlog") || []; l.push({ id: Date.now().toString(36), title: t, note: nIn.value.trim() }); S.set("backlog", l); tIn.value = ""; nIn.value = ""; paintNext(); toast("Added to your queue."); } }, tIn, nIn, h("button.btn.small", { type: "submit" }, "Add")));

  /* ---- provenance ---- */
  if (D.meta) app.append(h("p.g-meta", null, `Dataset built ${D.meta.built} — ${D.meta.source}`));

  $("#export").onclick = () => download("ludus-backlog.json", { backlog: S.get("backlog") || [] });
  $("#import").onclick = async () => {
    try { const f = await pickFile(); if (!f) return; const obj = JSON.parse(await f.text()); if (Array.isArray(obj.backlog)) { S.set("backlog", obj.backlog); paintNext(); toast("Backlog imported."); } }
    catch (e) { toast("That file didn't parse."); }
  };
})();
