/* Hermes phishing-lure panel (Sebastian, 2026-11-10): the current lures abusing real billers,
   from the reset-day refresh (window.PHISHING_LURES). Reference only — Hermes never touches mail. */
(function () {
  "use strict";
  const root = document.getElementById("hermes-lures"); if (!root || !window.PHISHING_LURES) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Current phishing lures</h2>
    <p class="note">Late-2026 lures built on real billers' names — the pattern, and the tell that gives it away. Sourced per entry in the research drop; Hermes builds no automation on these.</p>
    ${window.PHISHING_LURES.map((l) => `<div class="bill"><div class="bill-when">${esc(l.b)}${l.d ? " · " + esc(l.d) : ""}</div>
    <p style="margin:2px 0">${esc(l.p)}</p><p class="stat-s" style="margin:2px 0">Tell: ${esc(l.t)}</p></div>`).join("")}</div>`;
})();
