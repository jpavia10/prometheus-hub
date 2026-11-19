/* Records: the forms that arrive for tax year 2026 (Claude, 2026-11-19), from window.RECORDS_TAX_FORMS (tax-forms-2026.js; Gemini REC-GEM-06). */
(function () {
  const T = window.RECORDS_TAX_FORMS, PK = window.PK; if (!T || !PK || !PK.ref) return;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const when = (d) => (d && /^\d{4}-\d\d-\d\d$/.test(d) ? `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8)}, ${d.slice(0, 4)}` : d || "?");
  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid) return;
    const rows = T.slice().sort((a, b) => String(a.furnish_by).localeCompare(String(b.furnish_by)));
    PK.ref(PK.refPanel(grid, { title: "Tax forms on their way (2026 tax year)", sub: "Who sends each form, the day it is due to you, and the line it feeds on Form 1040 and California Form 540." }), {
      rows, group: (r) => (r.furnish_by ? "Due " + MON[+String(r.furnish_by).slice(5, 7) - 1] : "Other"),
      title: (r) => `${r.form} · due ${when(r.furnish_by)}`, value: (r) => r.sender, detail: (r) => `Form 1040: ${r.feeds_1040}\nCA Form 540: ${r.feeds_540}`,
      meta: (r) => [`instructions ${r.instructions_year}`], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini REC-GEM-06 (2026-11-19). Weekend and holiday rolls re-checked by Claude: Jan 31 2027 is a Sunday (Feb 1), Feb 15 is Presidents' Day (Feb 16), May 31 is Memorial Day (Jun 1).",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
