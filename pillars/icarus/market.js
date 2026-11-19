/* Icarus market calendar: NYSE holidays + early closes 2026-2028 (deduplicated & filterable).
   Design (Sebastian, 2026-11-14): the exchange board — a ruled plate of the board's counts, the
   whole calendar as a tape of session ticks (early closes at their true session proportion),
   the filtered list as a session ledger, and each year ruled as its own ledger line. Every
   figure is computed from ICARUS_MARKET_DAYS at render; no day is added, dropped or reclassified. */
(function () {
  "use strict";
  const { day } = PK;
  const root = document.getElementById("icarus-market");
  if (!root || !window.ICARUS_MARKET_DAYS) return;
  const esc = (s) => String(s ?? "").replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const events = window.ICARUS_MARKET_DAYS;
  const today = day();
  const byDate = {};
  for (const e of events) byDate[e.date] = e;
  const t = byDate[today];
  const status = t
    ? (t.kind === "full closure" ? `Closed today — ${t.name}.` : `Early close today — ${t.name} (13:00 ET).`)
    : "Regular session today (no holiday or early close on the NYSE calendar).";
  const statusKind = t ? (t.kind === "full closure" ? "closed" : "early") : "open";

  /* Board arithmetic — all derived from the data itself. An early close's session runs
     9:30 to its listed close (13:00 ET) against the full 9:30-16:00 session: 3.5 of 6.5 hours. */
  const fulls = events.filter((e) => e.kind === "full closure");
  const earlies = events.filter((e) => e.kind !== "full closure");
  const earlyPct = (e) => {
    const hr = parseInt(String(e.close || "13:00").slice(0, 2), 10);
    return Math.round(((hr - 9.5) / 6.5) * 100);
  };
  const years = [...new Set(events.map((e) => e.date.slice(0, 4)))].sort();
  const nextDate = (events.find((e) => e.date >= today) || {}).date || null;
  const wday = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

  const plate = `<div class="mk-plate">
      <div class="mk-cell"><span class="mk-v">${events.length}</span><span class="mk-k">Days on the board</span></div>
      <div class="mk-cell"><span class="mk-v">${fulls.length}</span><span class="mk-k">Full closures</span></div>
      <div class="mk-cell"><span class="mk-v">${earlies.length}</span><span class="mk-k">Early closes · 13:00 ET</span></div>
      <div class="mk-cell"><span class="mk-v">${years[0]}–${years[years.length - 1]}</span><span class="mk-k">NYSE calendar</span></div>
    </div>`;

  const tape = `<div class="mk-tape" aria-hidden="true">${years.map((y) => {
    const evs = events.filter((e) => e.date.slice(0, 4) === y);
    return `<div class="mk-tape-row"><span class="mk-tape-y">${y}</span><div class="mk-ticks">${evs.map((e) => {
      const cls = ["mk-tick", e.kind === "full closure" ? "full" : "early", e.date < today ? "past" : "", e.date === nextDate ? "next" : "", e.date === today ? "today" : ""].join(" ");
      const hgt = e.kind === "full closure" ? 100 : earlyPct(e);
      return `<span class="${cls}" style="--h:${hgt}%" title="${esc(e.date)} · ${esc(e.name)} · ${esc(e.kind)}${e.close ? " " + esc(e.close) : ""}"></span>`;
    }).join("")}</div><span class="mk-tape-n">${evs.length}</span></div>`;
  }).join("")}</div>`;

  const yearLedger = `<div class="mk-years">${years.map((y) => {
    const evs = events.filter((e) => e.date.slice(0, 4) === y);
    const f = evs.filter((e) => e.kind === "full closure").length, er = evs.length - f;
    return `<div class="mk-year"><span class="mk-year-y">${y}</span>
      <span class="mk-year-bar"><span class="mk-year-full" style="width:${Math.round((f / evs.length) * 100)}%"></span><span class="mk-year-early" style="width:${Math.round((er / evs.length) * 100)}%"></span></span>
      <span class="mk-year-n"><b>${evs.length}</b> days · ${f} full · ${er} early</span></div>`;
  }).join("")}</div>`;

  let mode = "upcoming";
  function render() {
    const filtered = events.filter((e) => {
      if (mode === "upcoming") return e.date >= today;
      if (mode === "early") return e.kind !== "full closure";
      if (mode === "full") return e.kind === "full closure";
      return true;
    }).slice(0, mode === "upcoming" ? 8 : 40);

    const rows = filtered.map((e) => {
      const early = e.kind !== "full closure";
      const tags = [
        early ? `<span class="mk-tag early">Early close · ${esc(e.close || "13:00 ET")}</span>` : `<span class="mk-tag">Full closure</span>`,
        e.date === today ? `<span class="mk-tag today">Today</span>` : "",
        e.date === nextDate && e.date !== today ? `<span class="mk-tag next">Next</span>` : "",
      ].join("");
      const bar = early
        ? `<span class="mk-sess"><span class="mk-sess-track"><span class="mk-sess-fill" style="width:${earlyPct(e)}%"></span></span><span class="mk-sess-lab">Session to ${esc(e.close || "13:00 ET")}</span></span>`
        : `<span class="mk-sess"><span class="mk-sess-track"></span><span class="mk-sess-lab">No session</span></span>`;
      return `<div class="mk-row${early ? " is-early" : ""}${e.date < today ? " is-past" : ""}${e.date === nextDate ? " is-next" : ""}">
        <span class="mk-date">${esc(e.date)}</span><span class="mk-wd">${wday(e.date)}</span>
        <span class="mk-name"><b>${esc(e.name)}</b>${tags}</span>${bar}</div>`;
    }).join("");

    root.innerHTML = `<div class="glass mk-board">
      <div class="row-actions" style="justify-content:space-between">
        <h2>NYSE Market Calendar (${events.length} events · 2026–2028)</h2>
        <div class="row-actions">
          <button class="btn quiet small" data-mk="upcoming" type="button">Upcoming</button>
          <button class="btn quiet small" data-mk="full" type="button">Full closures</button>
          <button class="btn quiet small" data-mk="early" type="button">Early closes</button>
          <button class="btn quiet small" data-mk="all" type="button">All</button>
        </div>
      </div>
      <p class="mk-status" style="margin:6px 0"><span class="mk-dot ${statusKind}"></span><b>${esc(status)}</b></p>
      ${plate}
      ${tape}
      <div class="mk-ledger">${rows || '<p class="empty">No matching calendar events.</p>'}</div>
      ${yearLedger}
    </div>`;
    root.querySelectorAll("[data-mk]").forEach((b) => {
      if (b.dataset.mk === mode) b.classList.remove("quiet");
      b.onclick = () => { mode = b.dataset.mk; render(); };
    });
  }
  render();
})();
