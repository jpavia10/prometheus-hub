/* Hermes phishing-lure panel (Sebastian, 2026-11-10): renders Grok's reset-day lure reference
   (phishing-lures.js — 23 dated, sourced lures) into the page. It was dropped as data and never
   loaded; this completes the wiring. Reference only — Hermes never touches the mailbox. */
(function () {
  "use strict";
  const root = document.getElementById("hermes-lures"); if (!root || !window.PHISHING_LURES) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Current phishing lures</h2>
    <p class="note">Late-2026 lures built on real billers' names, each with the tell that gives it away and how to check by hand. Sourced per entry (WS-HERMES reset-day refresh).</p>
    ${window.PHISHING_LURES.map((l) => `<div class="bill"><div class="bill-when">${esc(l.biller)}${l.published ? " · reported " + esc(l.published) : ""}</div>
    <p style="margin:2px 0">${esc(l.pattern)}</p>
    <p class="stat-s" style="margin:2px 0">Tell: ${esc(l.tell)}</p>
    ${l.test ? `<p class="stat-s" style="margin:2px 0">Check: ${esc(l.test)}</p>` : ""}
    ${l.source ? `<p class="stat-s" style="margin:2px 0">Source: ${l.url ? `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.source)}</a>` : esc(l.source)}</p>` : ""}</div>`).join("")}</div>`;
})();
