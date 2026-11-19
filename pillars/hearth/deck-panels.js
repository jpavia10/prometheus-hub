/* Hearth deck research panels (Claude, 2026-11-19), from window.HEARTH_DECK_RESEARCH (deck-research.js; Gemini HEA-GEM-19 to 22).
   Materials tab: shelf prices at the two nearest stores and the makers' application limits. Checks tab: design loads and the permit answers. */
(function () {
  const D = window.HEARTH_DECK_RESEARCH, PK = window.PK; if (!D || !PK || !PK.ref) return;
  const usd = (n) => (n == null ? "?" : "$" + Number(n).toFixed(n < 1 ? 3 : 2));
  function start() {
    const mats = document.getElementById("p-mats"), checks = document.getElementById("p-checks"); if (!mats || !checks) return;
    PK.ref(PK.refPanel(checks, { title: "Design loads at the cabin", sub: "Snow, wind, seismic, frost and the deck's own live load at 4,630 ft, with the code each comes from." }), {
      rows: D.loads, title: (r) => r.criterion.charAt(0).toUpperCase() + r.criterion.slice(1), value: (r) => `${r.value}${r.unit && r.unit !== "none" && r.value !== "not stated" ? " " + r.unit : ""}`, detail: (r) => r.applies_how,
      meta: (r) => [r.source], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini HEA-GEM-21 (2026-11-19). Open question it found: Kern's table says 30 psf ground snow at 4,000-5,000 ft, ASCE 7-22's tool gives far more here. Ask Kern Building Inspection which governs before sizing joists.",
    });
    PK.ref(PK.refPanel(checks, { title: "Re-decking and the permit", sub: "Three questions with the 2025 California Residential Code and Kern County's own chapter." }), {
      rows: D.permit, title: (r) => r.q, value: (r) => `${String(r.answer).toUpperCase()} · ${r.code_section}`, url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini HEA-GEM-19 (2026-11-19).",
    });
    PK.ref(PK.refPanel(mats, { title: "Shelf prices near the cabin", sub: "Home Depot Newhall and Lowe's South Bakersfield, the two closest by road, on 2026-11-19. A snapshot, not a quote." }), {
      rows: D.bom, group: (r) => (/Home Depot/.test(r.store) ? "Home Depot" : "Lowe's"), placeholder: "Search 30 shelf prices",
      title: (r) => r.product, value: (r) => `${usd(r.unit_price_usd)} each${r.pack ? " · " + r.pack : ""} · ${r.stock === "yes" ? "in stock" : r.stock === "limited" ? "limited stock" : "not in stock"}${r.qty_needed ? ` · need ${r.qty_needed}` : ""}`, detail: (r) => (r.qty_math ? "How many: " + r.qty_math : null),
      meta: (r) => [r.store.split(",")[0], r.item_no, `checked ${r.checked}`], url: (r) => r.url,
      note: "Gemini HEA-GEM-20. Board count checked by Claude: 21 courses x 2 boards = 42 (47 with 10% waste).",
    });
    PK.ref(PK.refPanel(mats, { title: "When each product can go on", sub: "The makers' own temperature, humidity, recoat and cure limits, so a coat is never put on a cold or damp morning." }), {
      rows: D.limits, group: (r) => r.category.charAt(0).toUpperCase() + r.category.slice(1),
      title: (r) => r.product, value: (r) => `${r.min_temp_f} to ${r.max_temp_f}`, detail: (r) => `Recoat: ${r.recoat}\nRain-free: ${r.rain_free}\nCure: ${r.cure}\nHumidity: ${r.max_rh_pct}\nDew point: ${r.dew_point_rule}`,
      meta: (r) => [`dry ${r.dry_touch}`, r.coverage, r.tds_section], url: (r) => r.tds_url, quote: (r) => r.quote,
      note: "Gemini HEA-GEM-22, from each maker's technical data sheet (2026-11-19).",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
