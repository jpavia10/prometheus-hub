/* Privacy: the Google settings checklist (Claude, 2026-11-19), from window.PRIVACY_GOOGLE (google-settings.js; Gemini PRI-GEM-08). */
(function () {
  const G = window.PRIVACY_GOOGLE, PK = window.PK; if (!G || !PK || !PK.ref) return;
  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid) return;
    PK.ref(PK.refPanel(grid, { title: "Google, setting by setting", sub: "25 settings: what each collects, the exact path on Android and on the web, the safest choice and what turning it off breaks." }), {
      rows: G, placeholder: "Search 25 Google settings",
      title: (r) => r.setting, value: (r) => `Safest: ${r.safest}`, detail: (r) => `Collects: ${r.collects}\nTurning it off breaks: ${r.breaks}\nAndroid: ${r.android_path}\nWeb: ${r.web_path}`,
      url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini PRI-GEM-08, every row from support.google.com (2026-11-19).",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
