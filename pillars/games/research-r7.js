/* Games: Gemini's run-7 research (23-24 Nov 2026), scored by Claude (CONTRIBUTOR_SCORES rows 194-197) and shown as sourced
   reference panels (kit/refs.js): every row keeps the page it came from and that page's own words. Files: games_gemini_gta6-updates_20261124-0019.json. */
(function () {
  if (!window.PK_REFS) return;
  PK_REFS({ id: "r7-gta6", title: "GTA VI updates since launch", intro: "Each patch and update, from Rockstar's own notes.",
    head: r => (r.date || '') + ' · ' + (r.version || r.kind || ''), sub: r => r.platform, fields: [["what", "What changed"], ["kind", "Kind"]],
    rows: [{"n": 1, "date": "2026-11-23", "kind": "title update", "version": "not stated", "platform": "PS5 / XBOX Series X|S", "what": "Grand Theft Auto VI Launch Updates ([November 23, 2026] - General / Miscellaneous): Fixed several issues that caused the game to crash; Fixed an issue that resulted in the weather not changing for extended periods; Fixed an issue that resulted in the game not autosaving correctly; Fixed several issues that resulted in phone calls not triggering correctly including those that progressed the story or unlocked mission content; Fixed an issue that resulted in the player being unable to lose their Wanted Level; Fixed an issue that resulted in the player being unable to use the deadlift bar in the Gym; Fixed an issue that resulted in partners not handing over bags so that players could sell them to fences.", "url": "https://support.rockstargames.com/articles/sN5pEdFYZdlvijKXd6xpJ/grand-theft-auto-vi-launch-updates-ps5-xbox-series-x-or-s"}] });
})();
