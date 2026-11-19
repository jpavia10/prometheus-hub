/* Piano: the bossa nova ladder (Claude, 2026-11-19), from window.PIANO_BOSSA (bossa-ladder.js; Gemini PIA-GEM-04). */
(function () {
  const B = window.PIANO_BOSSA, PK = window.PK; if (!B || !PK || !PK.ref) return;
  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid) return;
    PK.ref(PK.refPanel(grid, { title: "Bossa nova ladder", sub: "24 tunes, easiest first (15 by Jobim): the key, the form, the tempo, the bar that will catch you and what each one adds." }), {
      rows: B.slice().sort((a, b) => a.n - b.n), placeholder: "Search 24 tunes",
      title: (r) => `${r.n}. ${r.title}`, value: (r) => `${r.key} · ${r.tempo_bpm}`, detail: (r) => `Form: ${r.form}\nHard spot: ${r.hard_spot}\nAdds: ${r.adds}\nListen: ${r.recordings}`,
      meta: (r) => [r.composers, r.year ? String(r.year) : null], url: (r) => r.source_url,
      note: "Gemini PIA-GEM-04 (2026-11-19), from jazzstandards.com, jobim.org, viniciusdemoraes.com.br and musicnotes.com. Keys and forms a source does not print say 'not stated'.",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
