/* Icarus market calendar: NYSE holidays + early closes 2026-2028 (deduplicated & filterable). */
(function () {
  "use strict";
  const { day } = PK;
  const root = document.getElementById("icarus-market");
  if (!root || !window.ICARUS_MARKET_DAYS) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const events = window.ICARUS_MARKET_DAYS;
  const today = day();
  const byDate = {};
  for (const e of events) byDate[e.date] = e;
  const t = byDate[today];
  const status = t
    ? (t.kind === "full closure" ? `Closed today — ${t.name}.` : `Early close today — ${t.name} (13:00 ET).`)
    : "Regular session today (no holiday or early close on the NYSE calendar).";

  let mode = "upcoming";
  function render() {
    const filtered = events.filter((e) => {
      if (mode === "upcoming") return e.date >= today;
      if (mode === "early") return e.kind !== "full closure";
      if (mode === "full") return e.kind === "full closure";
      return true;
    }).slice(0, mode === "upcoming" ? 8 : 40);

    root.innerHTML = `<div class="glass">
      <div class="row-actions" style="justify-content:space-between">
        <h2>NYSE Market Calendar (${events.length} events · 2026–2028)</h2>
        <div class="row-actions">
          <button class="btn quiet small" data-mk="upcoming" type="button">Upcoming</button>
          <button class="btn quiet small" data-mk="full" type="button">Full closures</button>
          <button class="btn quiet small" data-mk="early" type="button">Early closes</button>
          <button class="btn quiet small" data-mk="all" type="button">All</button>
        </div>
      </div>
      <p style="margin:6px 0"><b>${esc(status)}</b></p>
      ${filtered.map((e) => `<div class="kv"><span>${esc(e.date)}</span><b>${esc(e.name)} · ${esc(e.kind)}${e.close ? " " + esc(e.close) : ""}</b></div>`).join("") || '<p class="empty">No matching calendar events.</p>'}
    </div>`;
    root.querySelectorAll("[data-mk]").forEach((b) => {
      if (b.dataset.mk === mode) b.classList.remove("quiet");
      b.onclick = () => { mode = b.dataset.mk; render(); };
    });
  }
  render();
})();
