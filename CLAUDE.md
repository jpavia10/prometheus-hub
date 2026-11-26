<!-- doc-status: current; normative: yes -->
# Prometheus Hub: integrator & orchestration notes (`AGENTS.md` + `CLAUDE.md`)

> **Antigravity Operating Sync (2026-11-13, Build d16):** Current operating rules are in `AGENTS.md`, `.agents/workflows/prometheus-delivery.md`, and `docs/antigravity/WORKBOARD.md` (Orchestrator **Argon** + Executor **Hydrogen**). Current ecosystem: **`27` active Hub destinations** (`25` local pillars under `pillars/<id>/`, each with its own `pillar.json` manifest and signature stage/sky, plus protected external `titan` and `midas`), with `fleet` paused. Registry & manifest parity is enforced by `node tools/registry/validate.mjs`; unified backup covers `localStorage` + Argus IndexedDB photo blobs. Historical `d7`–`d12` notes below are preserved for provenance.

**New here? Read `AGENTS.md` and `docs/HANDOVER.md` first:** state, the owner's direction in his words, and what to do next.

The desk: every pillar opens from here. Part of Prometheus (`jpavia10/prometheus-hub`, `pillars.json`). Live: https://jpavia10.github.io/prometheus-hub/.

- **Ownership:** Claude integrates (reviews and merges every pull request and every Drive drop file). Grok, Gemini, Muse and ChatGPT contribute through homework (`docs/agents/queues.json`), Drive `Prometheus Hub/Pillars/Prometheus Hub/incoming (AI drop files)/` and pull requests on `{ai}/...` branches.
- **Homework:** edit `docs/agents/queues.json` here, then in the hub run `python3 tools/kit/render.py --root /home/user` (every repo cloned side by side) and copy the changed `docs/agents/drive/*.txt` into their Drive docs. Every task names its count, its file, its checks and what makes it not done (owner, 2026-11-05: "Clear measurable objectives not just big idea with poor Implementation").
- **Refill every time (owner, 2026-11-16: "After processing or catching up always add new homework for all but very heavy on gemini. I want to see clearly on the forge"):** every intake, catch-up or processing round ends with new homework for every active AI in the hub, every pillar and Titan, Gemini loaded heaviest. Floors the Forge shows in red: Gemini 50 open (owner, 2026-11-21: "Increase scope and complexity of tasks. Load the slave up"), Muse 3, Gemini API 1, each coding agent 1; Grok 0 and ChatGPT 0 (owner, 2026-11-23: "Rely on gemini mostly im lazy to use others now. Muse can do a modest amount if you want. Im planning to cancel grok in 1 month its gonna phase out": Gemini is the main worker; Muse only second-reads, in one consolidated task at a time; Grok gets no new work and keeps only the Midas book until Joseph names its new owner; ChatGPT is parked). At every catch-up also search Drive for `DONE_*.json` newer than the last intake: the Forge cannot see Drive, and nine Gemini files waited two days unseen (found 2026-11-23). Titan: `python3 tools/agents/homework.py` (loop) plus hand-written projects in Titan's `docs/agents/queues.json` with item lists in `docs/agents/projects/` (owner allowed Titan homework on Titan's main, 2026-11-16; the app stays paused). Then render, copy the Drive pages (WORK QUEUE docs for Titan, HOMEWORK docs for the hub), and open the Forge (`pillars/forge/`) to check every AI is above its floor and no pillar row is empty. Sylade stays presence-only: no homework.
- **Homework quality (owner, 2026-11-16: "hyperdetailed so it can be used as an implementation plan and then they wont complete it incorrectly or incompletely"; "legit not busywork. Some of the shit u had it do for nutrition and excersise was dumb"):** every task says what it unlocks in the app, defines every field (type, unit, rule), shows one finished example row and a self-check list (`unlocks`, `fields`, `example`, `self_check` in queues.json; render.py prints them). No padding, no tables code can compute, nothing stale. Every pillar carries a Gemini function spec (sections A-H) that is the build plan, checked by Grok against the code.
- **Midas (owner, 2026-11-16: "You said midas isnt yours to touch but you are top ai and can do whatever so that's wrong"):** Claude works on Midas like any pillar, homework and code included. Keep the encrypted book safe: never weaken the vault or put real figures in the repo.
- **The Forge is the one board** for all of it: it reads every pillar queue, Titan's research loop and projects, the coding agents' workboard and every score sheet.
- **Scoring:** every outside file gets a row in `collaborators/CONTRIBUTOR_SCORES.md` and a note in Drive `Prometheus Hub/{AI folder}/FEEDBACK — {name} (every pillar)`.
- **Log:** a 2-3 line entry in `collaborators/SHARED_LOG.md` after every change.
- **The State Board is how Joseph guides the work (owner, 2026-11-26: "Make the state board interactive so I can guide you without
  friction"):** claude.ai/artifact/5fSPzLKzP1jd3A7HUPRmpy. At the start of every session, before anything else, read its database with
  ArtifactData: `answers` (his choice and note per decision id; `pillar-<id>` is focus / keep / freeze for that pillar) and `inbox` (his
  messages). Act on them, then write back: `decisions/<id>.status` ("done") and `.reply` (one line on what you did), `inbox/<id>.status`
  ("seen" or "done") and `.reply`, and `meta/claude.lastRead` (UTC ISO time). New questions for him go in as new `decisions` docs (group
  "now" or "reshape", order, title, why, options [{k,label}], rec), never as chat-only asks. A comment he sends from the board wakes the
  session that owns it.
- **Drive trash after every intake (owner, 2026-11-26: "you haven't asked me to trash files in a while ... I want to be totally caught up and organized"):**
  Drive only lets Claude trash files the connector created, but every inbox folder is the connector's, and trashing a folder trashes all of
  its files (d92). At the end of every intake, once every file in an inbox is merged and scored: copy anything still needed into its `_kept`,
  move `_kept` out, trash the inbox, recreate it empty with the same name, move `_kept` back in, and update every link to the old folder ID
  (pillars.json, the prompts, the queues; grep all repos). Ask Joseph before trashing (he answered "You know better than I do" on 26 Nov).
  Single locked files in folders Claude did not create go on the Drive Clean-Up artifact (claude.ai/artifact/K39FgVsaG3qG22ExN8oamB) as
  search-based batches. Never trash a file that is not merged, scored and copied into the repo or `_kept`.
- **The owner's briefing (owner, 2026-11-24: "bring back the summaries. I want to click a summary in this chat that updates me and also has a task list that I can check and tell you what to do next"):** https://claude.ai/artifact/3BzojbvDq618t12qo9j7e5 ("Prometheus Briefing"). At the start of a session, read its database (`ArtifactData`: collections `tasks` and `notes`): his ticks (`done` on his tasks, `ok` = yes-do-this and `next` = first on Claude's), and his notes (mark each `read: true` once acted on). At the end of every round, republish the page with what changed (same file: copy from the artifact if the scratchpad is gone) and update the tasks (`finished: true` + `result` on Claude's that are done; new ones as needed, each with `area` (Prometheus, Kin, Titan, Midas, AI team, Life, Setup), `size` (Quick, Round, Project) and optional `pillar`). Owner, same day: it covers every project plus everything else Claude can do for him and how to spend tokens and steer ("Basically how to spend my tokens and guide you while updating me"), so keep the project cards, the pillar grid and the "Beyond the projects" section current too. Give him the link in the reply.
- **Deploying:** GitHub Pages may not rebuild for pushes made by the Claude GitHub app (it did not on Titan); after pushing `main`, check the Pages run and, if none started, update a file through the GitHub connector.
- **Look:** the Prometheus look shared by every pillar except Titan.

## The charter governs (owner, 2026-11-12)

`docs/CHARTER.md` is the owner's Master Evolution Charter, kept word for word, and it is normative: read it before any design or
build work. In short: Prometheus is a personal digital ecosystem, not a dashboard; assess before building; prove the new standard
in **one** pillar before touching the rest ("Don't let Fable interpret this as permission to start rebuilding 18 pillars at once");
every pillar becomes a distinct place with a signature interaction; score work with its section 12 table and have a second agent
review it. Its section 16 protections are absolute: Titan is not modified, Midas internals are not modified, Fleet stays paused,
Sylade stays presence-only, Icarus never trades or advises, nothing is fabricated, authoritative records are never silently changed,
no mandatory backend or account. When an improvement conflicts with a protection: stop and explain.
- **First deliverable, done:** `docs/assessment/2026-11-13-transformation-assessment.md` (audit, map, gaps, design and architecture
  assessment, pillar proposals, concept, roadmap, first demonstration). Recommended next move there: small foundations (a manifest
  per pillar and one registry, an event log, one backup, a proof per pillar), then Athenaeum as the first finished place, starting
  from three rendered concepts.
- **Waiting on the owner:** Athenaeum or Piano first; whether the two hub consoles become the Kairos and Money pillars; Forge
  (it is what Fleet was, and Fleet is paused); removing personal details from this public repository and its history.

## The hub's own job: the kit

- `pillars.json` is the list of every pillar. A new pillar: add it there, run `python3 tools/kit/scaffold.py --root /home/user {id}` (creates the standard files, never overwrites), give it tasks in its `docs/agents/queues.json`, run `python3 tools/kit/render.py --root /home/user`, then make its Drive folder (`Prometheus Hub/Pillars/{Pillar}/` with the doc `README — {Pillar}` from `docs/agents/drive/{id}/README.txt` and the folder `incoming (AI drop files)/`).
- `python3 tools/kit/render.py --check` fails when a rendered page is out of date.
- The layout and Claude's routine: `docs/PROMETHEUS_LAYOUT.md`. The rules every AI follows: `AI_START_HERE.md`.
- The desk reads `data/board.json` (rendered) for each door's state and open homework.

## Where things stand (2026-11-13, build d7): the hub holds every pillar

Read this first. Owner, 2026-11-12, after d1 hid 14 pillars behind a two-capability app with demo data: "you strip away my pillars so
its irrelevant ... The over the top futuristic dopamine loaded theme and transitions are what im seeking ... bring the project
together and we can develop them one by one later." **Standing direction: never hide or drop a pillar; the hub is the shell, loud and
futuristic; real data only; individual pillars are developed later, one at a time, when he says.**
- **The hub** (`index.html` boots `deck/app.js`, native ES modules, no build): the core is `deck/views/orrery.js` (d3: a live 3D
  orrery of all 18 pillars from `deck/pillars.js` around a shader fire; drag to spin, tap to swing-and-warp, orbit/grid morph, boot,
  ticker, briefs; every position is computed per frame in script, light is drawn on a canvas) on top of `deck/views/picture.js`
  (day ring, runway, countdowns, tiles). Owner, 2026-11-12: "I want advanced motion and gui not a 1990s basic shit": design the hub
  around motion first; never ship a static grid of boxes as the main screen.
  Effects: `deck/core/fx.js` (warp, the sound switch, haptics); the interface sounds themselves are designed in `deck/core/voice.js` (d81,
  owner: the old beeps were "terrible": glass taps, a bell phrase, a whoosh, in a recorded hall `audio/ir/`, proof SOUND-1). Look: `deck/deck.css` (tokens at the top, "d2: the core" at the end).
  The home is the town (`deck/views/realm.js`, one painting, live hour and weather). Its sound (d79, rebuilt d81, `deck/views/townsound.js`):
  real recordings in `audio/town/` (CC0 or Pixabay licence, `audio/town/CREDITS.md`, second set by `tools/audio/town.py`) that follow its
  sky, the hour and the season; the water, falls, dock, frogs and chimes are placed in the painting and follow the camera (`PLACES`,
  `placeFor`), the clock tower strikes 8 to 21 (synthesized bell), fireworks on July 4th and New Year's Eve; off until he taps the speaker.
  The dock's fourth place is Midas (owner, 2026-11-25: "Replace money at the bottom with midas"); the Payoff Console's rooms live in Midas
  (`jpavia10/midas-ledger`: What if, recurring charges, the library), its bills still in this device's `prom.deck.money` for Time. Its seasons (`deck/core/season.js`): `art/realm/realm_autumn.webp` and `realm_winter.webp` are the same painting
  repainted and aligned (`tools/art/realm.py edit`, then `season`), chosen by the calendar and the real snow depth; `?season=` pins one.
- **Real data in:** `deck/core/legacy.js` reads the pillars' own storage (`prometheus.<pillar>.*`), the shared deadline bus
  (`prometheus.bus.deadlines`, `kit/bus.js`) and Titan's published ledger; `deck/core/feeds.js` merges them with the fixed dates.
- **The default pillar shell (d5):** the block "pillar shell v2" at the end of `kit/kit.js` (crest, automatic sections for pages that are one
  stack of panels, the sliding tab light, the dock, the ripple) and of `kit/prometheus.css` (written against `body.pk-v2`). Owner on
  the Piano page: "its junk": raise the default here, in the kit, so all 14 pillars rise together; a pillar's own `app.css` stays tiny.
- **One theme for all pillar pages:** the block "deck theme" at the end of `kit/prometheus.css` (colours per pillar, glass, warp page
  changes). Change the look there, not page by page. Titan, Midas and Hearth are separate repositories and were not touched.
- **d12 (2026-11-14):** the core shows "Since you were here" from `PB.events` (publish an event from any pillar action worth seeing;
  add its words to `SAY` in `deck/core/reach.js`); System has "Back up everything" (`backupAll` / `previewRestore` / `restoreAll`).
  Sylade is `pillars/sylade/`; the old desk files are gone.
- **d93 (2026-11-26): the desk and seven pillar folders rebuilt.** Joseph: "Im not going to do it. Just figure out a way or leave it for
  muse or gemini". The desk and the Apollo, Argus, Hearth, Hermes, Icarus, Kairos and Midas folders held only their README, the new inbox
  (both Claude's) and 28 locked Nov 9-10 leftovers; each was recreated with the same name, README and inbox moved in, old folder trashed.
  New IDs in pillars.json. The last 22 locked files (Sebastian, Shared, build zips, four Titan notes, two My Drive leftovers) are
  HUB-GEM-27 and HUB-MUS-07 (trash exactly the listed IDs, report what Drive refuses). STAGING keeps its 14 October coin photos.
- **d92 (2026-11-26): Drive cleaned by Claude itself.** Joseph: "id rather you just ask me for permissions". Drive will not let the connector
  trash the AIs' uploads, but it does let Claude trash folders it created, and trashing a folder trashes everything in it. With Joseph's go
  ("You know better than I do"), 15 folders went to trash (about 1,500 files, all merged and scored): the 8 Prometheus inboxes and Titan's
  collection-incoming, art-requests, sound-incoming and reviews-incoming were recreated empty with the same names (`_kept` moved back into
  each); design-incoming, `_raw_capture/_DUPLICATES`, music-requests and motion-lab-incoming were not. New folder IDs are in pillars.json,
  both prompts, Midas's queue and the Argus corpus; the 5 Grok files the app cites were copied into `_kept` first. Joseph keeps only the
  single files Drive locks inside folders Claude did not create (about 45, listed in the Drive Clean-Up artifact). Recoverable for 30 days.
- **d90-d91 (2026-11-26): the clean-up round.** Owner: "Do a clean up round ... I want to be totally caught up and organized". Drive: every
  hub and Titan drop folder classified (all merged or kept; the files still needed were copied into a `_kept` folder per pillar, the
  Midas encrypted book and the broker-names input included); the files only Joseph can trash are listed step by step in the Drive
  Clean-Up artifact (claude.ai/artifact/K39FgVsaG3qG22ExN8oamB). Kin: the petition is vol. 4372, no. 18 (re-read at full size; agrees
  with Muse's blind read KIN-MUS-02). Run 7's last six files checked (`tools/kit/check_delivery.mjs` all PASS) and closed; KAI-GEM-17
  rechecks Kern's 2027 holidays once posted. 13 new Gemini tasks (refill 9); the Gemini prompt carries Muse's two rules (Ctrl+F quotes,
  subject must match). Ledger: 196 used, 4 left (town plates, ODY-GEM-06, 11, 12); 39 delivered files wait for a second read.
- **d89 (2026-11-26): the backlog wired.** The ledger (`tools/forge/usage.py`) said 94 delivered tasks were shown nowhere. Now 4 are:
  29 scored datasets from runs 4 and 6 are sourced reference panels in 18 pillars (`pillars/*/research-r6.js`, `kit/refs.js`; generator in
  the scratchpad, `backlog/wire.py`); Kin shows Gemini's 80 decided Ancestry hints and 119 scored parent links (`pillars/kin/research-r8.js`,
  the Barbara Rimsha/TERMENS error corrected); the world history took ATH-GEM-05's third sources (14 entries) and ATH-GEM-07's 20
  family-era chains (14 attached, 6 new entries: 321 entries, Athenaeum's chronicle 59, so ATH-5 and the unit test now follow the file's
  size); seat-era files that were built in name their task (ARG-GEM-02 tags.js, ICA-GEM-05 rules.js, HER-GEM-02 billers.js, Apollo,
  Icarus and Argus headers). 15 desk-era tasks have no file anywhere (searched Drive): reviewed as design input, not data. The ledger
  now counts proofs and tests as use, "Superseded" and "Not wired:" reviews as dropped, "design input" as design. Left: HUB-GEM-22
  (the 12 town hour plates in Drive), ODY-GEM-06, 11, 12. KIN-GEM-31 to 40 wait for Muse's blind read before the tree changes.
- **d88 (2026-11-25): the family album, Agora, and the work ledger.** Owner: "go to the kin and level that up significantly.
  Comprehensively catalog and integrate all media so its ready to show off for Thanksgiving tomorrow". `pillars/kin/album/` (index,
  `album.css`, `app.js`): 145 pictures from the Kin media folder in 10 chapters, a viewer whose people link to `../tree/#P-id`, the
  show (`#show`: full screen, chapter cards, slow pans, 8 s a picture, for the TV), "Who is this?" (14 unnamed), and every one of the
  918 Drive files listed with a Drive link (`album/catalog.js`, state album / in-kin / dropped / unplaced). Data: `lineage/album.js`
  (loads after data.js on the Kin page, the tree and the album) adds the photo sources, Ada's sister Callie (1904-1999) and brother
  Charlie (1912-2001) from their stones, one media record per picture (`people` list, `year`, `when`) and faces for Bill, Mary, Ada,
  Callie, Charlie and Peter Culberson (`docs/face-*.webp`). Tree: `T.media()` matches `m.people`; Records use `m.year`. Kin page:
  an album door and "Pictures" in each person's dossier. Every picture was opened and checked by eye; 11 set aside with the reason
  (logos and a flower filed as people, duplicates); captions are the family's own file names or what is printed on the print. The
  blog (blogspot) is refused by this container, so its captions were not read: a Gemini task asks for them. Generator and manifest:
  scratchpad only (`kinmedia/build/`); a rerun needs the Drive images, so edit `album.js` by hand for small fixes. Also: Selling is
  now **Agora** (name only; id `selling` unchanged), and `tools/forge/usage.py` writes `docs/agents/usage.json` (every task: used,
  waiting for a second read, accepted but unused, design input, check, open, dropped).
- **d87 (2026-11-25): run 8 scored and filed.** 61 Gemini tasks closed with a review each (rows 202-207, 210), Muse's
  HUB-MUS-05 and KIN-MUS-02/03 scored 10 (rows 208-209). World history: 265 of Gemini's entries merged (315 now, `tools/history/build.py`;
  marked "sourced by Gemini, second read pending (ATH-MUS-02)"), and the 10 Kin seed entries got their sources (ATH-GEM-08). One title
  corrected (13 Jan 1991), two dates noted. Not wired yet: the 23 run-8 pillar files (their sources are refused by this container;
  Muse's HUB-MUS-06 reads 2 rows each first), the Kin albums (mostly Wikimedia filler; KIN-GEM-41 asks again), the hints and pedigrees
  (join the tree with the lineage work). Refill: 20 new tasks (Gemini 30 open, Muse 7). Titan: the run-8 sheets merged (4ba37021).
  Kin, from Muse's blind 1917-19 read (KIN-MUS-02), re-read by Claude on the scans: C6 resolved, service number 180338 (the discharge
  and the VA card agree; 1803038 was a misreading); C5 re-argued, the draft card says 5-10 in figures, not "medium". Still to check
  from that read, done the same day: the petition says 140 Howard St (an open-topped 4; the typed index card says 180, and Gemini
  found no 180 in the directories), so C8's address is 140; the declaration day is 21 or 22 Oct 1916 (unclear; Muse reads 22).
  Odyssey ODY-GEM-29 (25 more picks), 13 seen by eye so far: keep 1 (heron), 2 (kayakers), 4 and 5 (Glenda Pavia's and Buster and
  Joy Kirkland's plaques, Flat Rock), 6 (cinder cone from the air), 11-13 (Mammoth with the baby and the dogs); drop 3 (a stranger's
  house), 7, 9 (notebook page), 10 (hand sanitizer); 8 is a handwritten Kirkland family tree (to Kin's album, not Odyssey). 14-25 not
  seen yet; 24 (a girls' basketball team, minors who are strangers) and 25 (a dashboard) drop by caption. Wire with the city cards.
- **d86 (2026-11-25): run 8, first part.** Gemini's d79 fix patch (HUB-GEM-24 audit): town labels pinned inside the screen with
  the dot shifted by `--dx`, readable label pills, 44 px targets on the chips and edge buttons, and the weather chip's hourly icons
  use each hour's own `is_day` (night icons after dark). Continuity: Muse's HUB-MUS-05 second read applied (TikTok agrees; Vanguard
  and Robinhood rows rewritten to what their pages say, with a `corrected` line). Kin: C10 proven from the 1950 census sheet itself
  (ED 85-1439, sheet 75, lines 9-10: Barbara J. Termens, 17, daughter in Della E. Rimsha's household), the sheet image in
  `pillars/kin/lineage/docs/`. The 7 files Muse accepted (PSPS circuits, kit for four, TOD recording, Texas to California,
  nutrient targets, Kern design criteria, broker opt-outs) are sourced panels in each pillar's `research-r7.js`. Kit: a reference
  panel never widens the page (Hearth was 414 px at 384). FORGE-3 waits for the score trends to draw (it read them at 0.5 s; the
  live runner needed longer).
- **d85 (2026-11-25): Gemini's intro splash opens the hub** (owner: "Gemini made a new intro splash i dont see that yet"). `deck/splash.js`
  is Gemini's supplemental module (WebGL2 shader with a 2D fallback: a spark over the ridges, rings and pillar nodes, PROMETHEUS; tap, Escape,
  Space or Enter skips; disposes everything after). `boot()` in `deck/views/orrery.js` mounts it once a session in place of the old text
  card; the town's opening (realm.js) waits for the `prom:booted` event. Its subtitle line printed Frazier Park's coordinates labelled
  "Mt. Pinos"; it is an option now ("29 pillars · one fire"). System has "Play the intro" (sessionStorage `prom.deck.replay`). Proof INTRO-1.
- **d84 (2026-11-25): two new pillars, Atlas and Aegis** (owner: "Are there any additional pillars you recommend to add? If yes just do it").
  Nothing knew when the pay lands or what protects the house. **Atlas · Work & Pay** (`pillars/atlas/`, place: the mill hall by Titan):
  pay schedule with paydays moved off weekends and Federal Reserve holidays (`pay.js`, `window.ATLAS_PAY`), stubs with withholding and a
  check against the usual take-home, time off projected per payday, work dates on the calendar; publishes `prometheus.atlas.summary`
  (`nextPay {date, net}`, which Midas's safe-to-spend uses as its window). **Aegis · Insurance & Cover** (`pillars/aegis/`, place: the stone
  bridge): policies (premium, billing, deductible, limits, renewal, term), claims, warranties read from Hearth and Records; checks Hearth's
  contents against the personal-property limit and the largest deductible against Midas's floor; publishes `prometheus.aegis.summary`
  (`contentsCoverage`, `renewal`, which Midas's Worth tab shows). Both private_local, no seed data. Proofs ATLAS-1 and AEGIS-1, unit
  `proofs/unit/atlas-aegis.test.mjs`; MENU-1 counts 29 levels, STAGE-1 21 pictures; the town's `MAXP` is 40. Homework ATL-GEM-01..03,
  AEG-GEM-01..03 (with Muse second reads).
- **d83 (2026-11-25): Hearth is home management, room by room** (owner: "start from scratch and redesign it so its a home management with
  renovation details like the deck to supplement"). His house: Top (unfinished attic); second floor (large deck, living room, kitchen, Violet's
  room, master bedroom, Violet's bathroom, master bathroom, master bedroom deck); first floor (large deck, foyer and hallway, laundry, office,
  studio, guest bedroom, guest bathroom); ground level (garage, crawlspace, mudroom). `FLOORS` and `HOUSE` in `pillars/hearth/app.js`;
  `seeded.v3` migrates old rooms and keeps sizes, notes and rooms he added. Tabs: House (the section drawing `stage.js`, floors of room cards,
  a room view with its projects, steps and items), Renovations (projects by room with steps; the deck refurbish counts its 8 stages; the
  deck job book is one disclosure `#h-jobbook`), Inventory (appliances and furniture with paid, worth now, warranty), Upkeep. Hearth
  publishes `prometheus.hearth.summary` (totals only: renovation %, contents worth, items, open steps, per floor) for other pillars.
  The painting is the whole house now (`art/worlds/world_hearth.webp`, Nano Banana Pro, prompt in the worlds request).
- **d11 (2026-11-13): Hearth lives here now** (`pillars/hearth/`; owner: "Hearth doesnt need an independent repo"). Scope stays the owner's three
  things: renovation projects, assets per room, a plan that gets accurate as it is measured; no price research, code lookups or upkeep
  calendars unless he asks. The deck's stage store keeps its old key `hearth.deck.stages.v1`. The old repo `jpavia10/hephaestus-hearth`
  carries a moved notice; do not work there.
- **d10 (2026-11-13): new pillars Forge, Foundry, Observatory, Kin** (owner chose all four; for Forge he lifted the Fleet pause: "Work on
  all of them"). Forge only reads the AI queues and Titan's score sheet and never contacts an AI. Observatory sends subject words to
  hn.algolia.com only when Scan is pressed (declared in its manifest). Kin keeps names on the device only.
- **d9 (2026-11-13): each kit pillar has a signature picture at the top** (owner: "Run through each pillar and revamp"): the engine is
  `kit/stage.js` (canvas, loop, pause off screen, reduced motion, redraw on save via the `pk:store` event from the kit store); each pillar's
  picture is its own `pillars/<id>/stage.js`, reading only its own records and shipped data. Change a pillar's picture there; never move
  pillar logic into the stage. Bastion exposes `window.BASTION_SCENARIOS` for it.
- **d7 (2026-11-13): Athenaeum is the first pillar rebuilt under the charter** (owner: "Continue with whatever but 70 is low i want over 100
  beyond limits"). `pillars/athenaeum/`: ideas as stars in a raw-WebGL 3D sky (`js/sky.js`), relations and layout worked out on the device
  (`js/model.js`, pure, unit-tested), the app (`js/app.js`); same stored records, every old feature kept. Read `docs/pillars/athenaeum/BRIEF.md`
  before touching it. Shared foundations it uses: the event log `PB.events` in `kit/bus.js`, its manifest `pillars/athenaeum/pillar.json`, the
  hub's reach through manifests `deck/core/reach.js` (`docs/architecture/MANIFEST.md`). **Not done: the independent review (the second agent
  hit a usage limit), any real-phone test, the generated registry, one backup.** Next pillar only after the owner has seen this one.
- **d6 (2026-11-13):** no new features. Pillar accent colours in the "deck theme" block must stay hex (`kit/kit.js` appends an alpha
  pair to `--accent` for charts; the d2 `hsl()` values broke the Money chart on the live site for a day). Proof PILLAR-2 opens every
  pillar page, taps every section and fails on any script error; keep it passing. Open: the browser sometimes drops the animated
  page change from the hub to a pillar in the test browser (cause not found; the proofs report it).
- **Consoles from d1** (`#/time` Kairos console, `#/money` Payoff console; engines in `deck/core/` and `deck/models/`) stay as hub
  consoles. The Kairos and Money pillar pages are back at their addresses. Which one each pillar becomes is the owner's decision.
- **Proofs:** `python3 proofs/run.py <url> [--mock-weather]` (CORE-1..4 plus the d1 proofs), `node --test proofs/unit/*.test.mjs`,
  and `.github/workflows/proofs.yml` runs them against the live site after each deployment. `STATUS.md` is the honest list.
- **Privacy while building (owner, 2026-11-23: "Privacy on oddessy isnt important. Its limiting scope and reducing experience for me. Remember even if its public ill eventually add privacy layers. As of now during developing the apps I dont care"):** do not cut content for privacy in Odyssey or while developing the apps: his photos with people in them, family places, real home towns and trip details all ship; he adds privacy layers later. Still never: API keys, passwords, tokens, account numbers or booking/confirmation codes (those are security, not privacy). The owner's presets still load from his private Drive file.
- **Devices (owner, 2026-11-23: "S24 ultra is smallest phone. Dont worry too much for old devices as this is private project"):** design and test for the Galaxy S24 Ultra (384 x 832 CSS px) and up; no work for smaller or older phones, older browsers or old saved data beyond not breaking.
- **Deploy:** push `main`, then update `DEPLOY_STAMP.txt` through the GitHub connector and confirm the Pages build and the proofs-live run.
- **Titan is paused by the owner** (same day: "leave it for now"). Do not continue Titan's new front until he says.
