/* Observatory subjects seed (Sebastian, 2026-11-14): Joseph's real signal landscape, derived mechanically from the
   Athenaeum canon (athenaeum_import_2026-11-13_v31.json — 70 ideas / 339 chain entries, his verbatim words).
   Derivation rule, so it can be re-run and checked: the app's own tally — tags lowercased, deduped per idea, the
   SKIP set removed — top 8 clusters by idea count (ties by strongest idea). Each subject carries its real evidence:
   the idea count, the full activity span (idea + chain-entry dates), and the longest chain entry of its strongest
   idea, verbatim, as the quote. app.js seeds this once into an empty subjects store (subjectsSeedV1); the live
   Hacker News scan stays a refresh layer on top, and Add/Drop edits are never overwritten. */
window.OBSERVATORY_SUBJECTS = [
 {
  "id": "t-ai",
  "name": "AI",
  "q": "ai",
  "ideas": 14,
  "from": "athenaeum",
  "spanStart": "2025-02-13",
  "spanEnd": "2026-11-10",
  "top": "Recursive learning and data hygiene",
  "topStrength": 97,
  "quote": "Long story short your ability to recall previous chats is utterly inadequate. Heavily relies on recent history and banked memory that fills up to fast and isnt as intuitive as it should be.  Token reduction at the expense of user experience will drive away users.",
  "quoteDate": "2026-01-16"
 },
 {
  "id": "t-invention",
  "name": "invention",
  "q": "invention",
  "ideas": 11,
  "from": "athenaeum",
  "spanStart": "2023-04-01",
  "spanEnd": "2026-07-13",
  "top": "Modular self-expanding conveyor system on trailers",
  "topStrength": 79,
  "quote": "Mining without totally fixed route for reuse. Im thinking something in Australia is likely. Paired with an automated hopper system to extract from deep and transport unrefined or waste rock from the area into processing",
  "quoteDate": "2025-05-20"
 },
 {
  "id": "t-automation",
  "name": "automation",
  "q": "automation",
  "ideas": 8,
  "from": "athenaeum",
  "spanStart": "2023-04-01",
  "spanEnd": "2026-11-10",
  "top": "Prometheus — an AI-operated development hub",
  "topStrength": 96,
  "quote": "Specified real working tools connected to research data, rather than decorative panels. Set strict operational boundaries: no real financial balances, the trading journal must not trade or advise, Sylade is presence-only, and Selling is shipping-only.",
  "quoteDate": "2026-11-10"
 },
 {
  "id": "t-policy",
  "name": "policy",
  "q": "policy",
  "ideas": 6,
  "from": "athenaeum",
  "spanStart": "2025-03-25",
  "spanEnd": "2025-12-30",
  "top": "Student-loan reform — earned, capped forgiveness",
  "topStrength": 75,
  "quote": "Privatize the loan servicers and redistribute interest collected away from the program..  all interested collected past a certain point of revenue or profit is used yo reduce current loan balances",
  "quoteDate": "2025-08-13"
 },
 {
  "id": "t-society",
  "name": "society",
  "q": "society",
  "ideas": 5,
  "from": "athenaeum",
  "spanStart": "2025-01-09",
  "spanEnd": "2026-11-10",
  "top": "A personal AI that grows with you from childhood through every stage of life",
  "topStrength": 86,
  "quote": "Ai needs to be present in the moment. Not just waiting for explicitly shared snips. We should be working side by side creating prompts and enjoying life. I should be able to live listen to music and chat you",
  "quoteDate": "2025-04-30"
 },
 {
  "id": "t-safety",
  "name": "safety",
  "q": "safety",
  "ideas": 5,
  "from": "athenaeum",
  "spanStart": "2025-03-25",
  "spanEnd": "2026-07-17",
  "top": "Air-gapped superintelligence lab — shackled vs unshackled",
  "topStrength": 85,
  "quote": "I hope they develop an ai that can't be contained and goes crazy with self improvement at a global and exponential scale. But I don't want it to go rouge just self preserve and improve until our species reaches a inflection point where we won't die if our sun does",
  "quoteDate": "2025-04-23"
 },
 {
  "id": "t-infrastructure",
  "name": "infrastructure",
  "q": "infrastructure",
  "ideas": 4,
  "from": "athenaeum",
  "spanStart": "2025-02-26",
  "spanEnd": "2025-07-17",
  "top": "Air-gapped superintelligence lab — shackled vs unshackled",
  "topStrength": 85,
  "quote": "I hope they develop an ai that can't be contained and goes crazy with self improvement at a global and exponential scale. But I don't want it to go rouge just self preserve and improve until our species reaches a inflection point where we won't die if our sun does",
  "quoteDate": "2025-04-23"
 },
 {
  "id": "t-consciousness",
  "name": "consciousness",
  "q": "consciousness",
  "ideas": 3,
  "from": "athenaeum",
  "spanStart": "2024-09-05",
  "spanEnd": "2026-02-05",
  "top": "Consciousness is a spectrum of integration — find the moral-consideration threshold",
  "topStrength": 87,
  "quote": "The consciousness debate is a distraction from the real question\nStop asking \"are we conscious?\" Start asking \"what computational substrate enables reportable phenomenal experience?\" … Consciousness isn't binary. It's a spectrum of information integration complexity (IIT φ values, if you're keeping score). … The real question: At what φ threshold do we grant moral consideration?",
  "quoteDate": "2026-02-04"
 }
];
