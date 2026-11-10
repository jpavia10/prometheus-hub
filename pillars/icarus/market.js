/* Icarus market calendar (Sebastian, 2026-11-09): the corrected NYSE calendar as a working panel —
   today's session status and the road ahead. Reference only; the journal never trades. */
(function () {
  "use strict";
  const { $, day } = PK;
  const root = document.getElementById("icarus-market"); if (!root) return;
  const byDate = {}; for (const e of ICARUS_MARKET_DAYS) byDate[e.date] = e;
  const today = day();
  const t = byDate[today];
  const status = t ? (t.kind === "full closure" ? `Closed today — ${t.name}.` : `Early close today — ${t.name} (13:00 ET).`) : "Regular session today (no holiday or early close on the NYSE calendar).";
  const ahead = ICARUS_MARKET_DAYS.filter((e) => e.date >= today).slice(0, 6);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Market calendar — NYSE 2026–2028</h2>
    <p><b>${esc(status)}</b></p>
    ${ahead.map((e) => `<div class="kv"><span>${e.date}</span><b>${esc(e.name)} · ${e.kind}${e.close ? " " + e.close : ""}</b></div>`).join("")}
    <p class="note">35 events: 30 full closures, 5 early closes. Corrected from the research deliverable, which duplicated every row (68 rows, 34 unique events) and missed the Dec 31, 2027 observance. Source: NYSE hours calendar.</p></div>
  <style>.kv{display:flex;justify-content:space-between;gap:10px;padding:4px 0;font-size:14.5px;border-bottom:1px solid rgba(159,180,204,.08)}</style>`;
})();
