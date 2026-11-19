/* Games: Grand Theft Auto VI on the record (Claude, 2026-11-19), from window.GAMES_GTA6 (gta6-facts.js; Gemini GAM-GEM-04). */
(function () {
  const F = window.GAMES_GTA6, PK = window.PK; if (!F || !PK || !PK.ref) return;
  function start() {
    const app = document.getElementById("app"); if (!app) return;
    const grid = PK.h("section.grid.g-facts"); app.append(grid);
    PK.ref(PK.refPanel(grid, { title: "Grand Theft Auto VI, from Rockstar", sub: "Out today. Twenty facts from Rockstar's own pages and the US PlayStation and Xbox stores: what each says, word for word." }), {
      rows: F, title: (r) => r.topic, value: (r) => r.fact, meta: (r) => [r.posted ? "posted " + r.posted : null], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini GAM-GEM-04, pages opened 2026-11-19. Where Rockstar does not say (GTA Online date, photo mode, cross-progression), the row says so.",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
