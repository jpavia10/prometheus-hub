<!-- doc-status: current; normative: no -->
# Prometheus: transformation assessment (2026-11-13)

The first deliverable of `docs/CHARTER.md` (section 18): what exists, what is weak, what is missing, and the order to fix it.
Written by Claude from the repository at build d5 and from pages rendered that day. Every claim carries a mark:

- **[V]** verified: read in the source, or rendered and looked at, during this assessment
- **[I]** inferred from what was verified
- **[P]** proposed
- **[L]** a longer-term possibility

**Not inspected for this document:** the Midas Ledger and Hephaestus Hearth repositories (last read in early November), Titan
(locked and paused by the owner), any pillar with real data in it, a screen reader, and a real phone. Every screen was rendered in
desktop Chromium at 390x844 with software graphics. The scores in section 4 are my own and are not a review: the charter's
independent review (its section 11, phase 6) has not happened yet.

## 1. Current-state audit

**The hub (build d5).** [V] One page (`index.html`, native modules, no build step). The core is a live 3D orrery of 18 pillars
around a shader-drawn fire: drag to spin, tap to swing a pillar forward and warp in, a switch to a hex grid, a boot once a session.
Under it: a 24-hour day ring, the next 24 hours, a seven-day runway, countdowns, weather, a Titan tile. A command key searches
pillar names and the two consoles and adds events in plain words. 13 automated proofs passed against the live site at d5
(14 from d6, see below).

**The pillars.** [V] 14 pages in this repository share one kit (`kit/kit.js`, `kit/bus.js`, `kit/prometheus.css`). Since d5 they share
one shell: a crest, sections built from each page's own panels, a tab rail, a dock. Titan, Midas and Hearth are separate sites.
Sylade is one page on the old desk's styles.

| Pillar | Code | Data shipped with it | Opens on a clean device as | Publishes to the shared bus |
|---|---|---|---|---|
| Kairos | 11 KB | 58 fixed dates | a clock, fixed dates, an empty calendar | deadlines |
| Apollo | 7 KB | 584 KB food and exercise lookups | zeros and a log form | nothing |
| Piano | 10 KB | 133 KB: 40 standards, chord library | a playable pattern player and library | nothing |
| Hermes | 7 KB | 51 KB reference lists | three zeros, then 13,000 px of reference below the tabs | deadlines |
| Argus | 8 KB | 43 KB | "No photos yet" | nothing |
| Money (cell "Payoff") | 9 KB | 62 KB: issuers, offers, worked cases | a sample loan | money events |
| Selling | 6 KB | 11 KB | zeros | deadlines, money events |
| Icarus | 11 KB | 39 KB market calendar | empty journal | nothing |
| Garage | 12 KB | 28 KB factory schedule | an odometer form, the schedule with every item "unknown" | deadlines |
| Odyssey | 5 KB | 1 KB | a trip form | deadlines |
| Bastion | 9 KB | 24 KB | empty inventory, a weather-alert panel | deadlines |
| Athenaeum | 9 KB | 63 KB: 11 of the owner's ideas with refinements, a history seed | real content | nothing |
| Privacy | 6 KB | 32 KB broker list | a status form | deadlines |
| Records | 4 KB | none | a form | deadlines |

[V] Three pillars open on something real (Athenaeum, Piano, Money's sample). The rest open on forms and zeros. [I] The owner's
"its junk" about Piano was about look; for most pillars the deeper problem is that there is nothing in them yet and nothing that
makes filling them worth it.

**Found during this audit and fixed in d6.** [V] My d2 theme changed each pillar's accent colour to a format the kit's chart
helper could not use, so the Money page threw a script error and drew no chart on the live site for about a day. No proof covered
it. The fix ships as d6 with a new proof, PILLAR-2: it opens all 15 pillar pages in a real browser, taps every section (47) and
fails on any script error. Run against the unfixed code it fails on Money; with the fix it passes.

**Unverified claims still standing.** Smooth motion on the owner's phone. Anything about screen readers. That a pillar behaves
with months of data in it. That the offline shell covers every pillar page.

**Open item found while testing d6.** [V] In the test browser the animated change from the hub to a pillar page is dropped by the
browser some of the time (in 4 of 7 timed runs); the page still opens, without the morph. I did not find the cause, and I do not
know whether it happens on a phone. The proofs now count and report it instead of hiding it.

## 2. Ecosystem map

| Pillar | Mission (as the repository states it) | State | Owns (on the device) | Related to |
|---|---|---|---|---|
| Hub | The shell: every pillar opens from here | live | consoles' store (`prom.deck.*`) | reads everything, owns nothing of a pillar's |
| Kairos | Time: calendar, deadlines, the day | live, and duplicated (see 5) | events, focus | every pillar that has a date |
| Midas | Money: cash, debt, the way out | live, own site, protected | its own encrypted book | Money, Selling |
| Titan | Coin and metals collection | live, own site, locked | its own published ledger | Argus (its photos) |
| Hearth | The house: projects, inventory | "bones", own site | not inspected | Records, Bastion, Garage |
| Garage | The car: service, fuel, paperwork | live | odometer, services, fuel | Kairos, Money, Records |
| Apollo | Health, fitness, nutrition | live | days, goals | Kairos |
| Money | Payoff simulator, issuer library | live, and duplicated (see 5) | one config | Midas, Selling |
| Selling | Items from listing to shipped | live | items | Money, Kairos |
| Records | Documents and their renewal dates | live, thinnest pillar | docs | every pillar with paperwork |
| Icarus | Trading journal. Never trades, never advises | live | trades, rules, bankroll | none by design |
| Hermes | Mail and messages that need an answer | live | mail | Kairos, Sylade |
| Piano | Practice and the bossa nova path | live | sessions, ladder, ear | Kairos (a practice streak) |
| Bastion | Supplies and readiness | live | items, checks | Hearth, Odyssey |
| Athenaeum | Ideas and history, kept and connected | live | ideas, shelf | every pillar an idea is about |
| Odyssey | Trips, and the house while away | live | trips, away | Kairos, Bastion, Hearth |
| Privacy | Shrinking the public footprint | live | brokers, accounts, status | Records |
| Argus | Every picture the pillars use, one album | partial | images (IndexedDB) | Titan, Hearth |
| Sylade | The public presence page | live, presence only | nothing | Hermes |
| Fleet | AI fleet dashboard | paused by the owner | n/a | see section 6 |

**Where the charter and the repository disagree.** [V]
- The charter calls Argus "monitoring, observation and awareness". The repository's Argus is a photo album. I kept the repository's meaning.
- "Payoff" is the hub's label for the pillar whose id and page are `money`. One name should win.
- The trading journal the charter protects is Icarus.

## 3. Gap analysis

1. **No shared memory of what happened.** [V] The bus carries deadlines and money events only. There is no activity record, so the hub cannot show "since you were last here" or a timeline.
2. **Search stops at the door.** [V] The command key finds pillar names and the two consoles. It cannot find an idea in Athenaeum, a document in Records or a service in Garage.
3. **Capture goes to one place.** [V] Plain-words capture makes Kairos console events only. Nothing routes "idea: ..." to Athenaeum or "oil change 42,100 mi" to Garage.
4. **Three hand-kept lists of pillars.** [V] `pillars.json`, `deck/pillars.js` and a list inside `kit/kit.js`. They already differ in names and order.
5. **Two stores, two backup formats.** [V] Pillars write `prometheus.<pillar>.*`; the hub's consoles write `prom.deck.*`. Each has its own export. One backup of everything does not exist.
6. **No growth plan for storage.** [V] Everything except Argus is in localStorage (about 5 MB for the whole origin, shared with Titan, Midas and Hearth). No pillar has a migration step.
7. **No pillar has a signature.** [V] After d5 all 14 are the same composition in 14 colours: the homogenization the charter warns against (its section 8).
8. **The spin has no keyboard equivalent.** [V] Pillars are reachable by Tab and by the grid switch, but the orbit itself cannot be turned from a keyboard.
9. **No test on the real device, no measured budget.** [V]
10. **Personal details in a public repository.** [V] A town, a vehicle model and a family first name appear in pillar text and form options. Removing them from history needs the owner's decision.
11. **Sylade sits outside the system.** [V] Old styles, a 488 KB script kept alive only for it, and a title overlapped by a glyph at phone width.
12. **AI work has no home.** [V] Queues, homework and reviews for the contributing AIs live in scattered documents. See section 6.

## 4. Design assessment

Scored with the charter's own table (its section 12). Self-assessed, to be replaced by an independent review.

| Dimension (weight) | Hub core, d5 | Default pillar, d5 (Piano as the example) |
|---|---:|---:|
| Visual distinction and craftsmanship (20) | 15 | 11 |
| Functional completeness and usefulness (20) | 10 | 12 |
| Interaction and workflow quality (15) | 11 | 8 |
| Originality and product imagination (15) | 11 | 5 |
| Architecture and maintainability (10) | 6 | 6 |
| Reliability and data integrity (10) | 7 | 6 |
| Performance, mobile, accessibility (10) | 5 | 6 |
| **Total** | **65** | **54** |

Both are under the charter's 70 line. In plain terms:

- **The hub looks like a command environment and works like a launcher.** [V] The orrery is distinctive. It tells you almost nothing: a cell shows a count or a days-to-next number, and only for pillars that have data.
- **The pillar shell fixed the endless scroll and nothing else.** [V] Every pillar is still labelled fields, counters and lists. A music studio with no keyboard on screen. A vehicle page with no vehicle. An idea vault that is a list.
- **Generic or underdeveloped, worst first:** Records, Odyssey, Selling, Hermes, Argus, Privacy, Apollo, Icarus, Bastion, Garage, Kairos (page), Money (page), Piano, Athenaeum. [V] from the rendered pages; the order is my judgment.
- **What is worth keeping:** [V] the orrery and warp, the day ring, the kit's small size (a pillar is 4 to 12 KB of its own code), the bus idea, the proofs habit, the tone of the pillar copy.

## 5. Architecture assessment

**What enables the ecosystem today.** [V]
- Static hosting, no account, no server. All of the owner's sites share one browser origin, so one page can read another's storage.
- A small kit: storage per pillar, a deadline bus, tabs, charts, export and import. A new pillar is cheap.
- A proofs runner that drives a real browser against the live site after every deployment.

**What restricts it.** [V]
- The seams listed in section 3 (items 1 to 6).
- **Two answers each for time and for payoff.** d1 built new consoles (`#/time`, `#/money`) with stronger engines than the pillar pages (recurrence with exceptions, calendar files, whole-cent payoff maths proven against 12 worked cases). d2 restored the pillar pages. Both exist. This is the largest loose end in the code.
- No pillar declares what it owns, publishes or can do, so the hub guesses from storage keys.
- A static site cannot run in the background, send a notification while closed, or sync devices by itself. [V] Those need a service; the design should leave a place for one without depending on it.

**Proposed, in the order that unlocks the most.** [P]
1. **One manifest per pillar** (`pillars/<id>/pillar.json`): identity, colour, icon, route, state, storage keys it owns, events it publishes, commands it offers, fields worth searching. One generated registry replaces the three lists.
2. **An event log on the bus**: `{ type, pillar, ref, title, at, data }`, versioned, capped in size. Deadlines and money become two event types among several. The hub's timeline and "since last visit" read it.
3. **Search from manifests**: the hub indexes the fields each manifest names, straight from storage, without loading pillar code. Results name their pillar and open the record.
4. **Commands from manifests**: "idea: ...", "fuel 11.2 gal ..." route to the owning pillar, which keeps its own rules.
5. **One backup**: a single file with every pillar's data and the consoles', a preview before import, a check after export, and a visible "last backed up" on the hub.
6. **One store**: fold the consoles into the pillars (the Kairos console becomes Kairos; the payoff console becomes Money) on the kit store, with a migration. Needs the owner's yes because it replaces two pillar pages he asked me to restore.
7. **Storage by size**: show bytes per pillar; move a pillar's collections to IndexedDB behind the same kit call when it passes a set size. [L] Optional device sync through the owner's Drive file, never required.
8. **Gates**: a proof per pillar (it loads, no script error, its signature renders), a rendered sheet at phone and desktop size, the charter's score from a second agent, and a short real-phone checklist only the owner can run.

## 6. New pillar proposals

Checked against what exists. **I recommend adding none now.**

| Candidate | Verdict | Why |
|---|---|---|
| Forge (AI and agent work) | **Hold for the owner's decision** | The need is real [V]: four AIs, queues, homework and reviews spread across repositories and Drive. But it is what Fleet Command was, and the owner paused Fleet. Building Forge without his word would restart Fleet under another name. |
| Continuity (life archive) | Not a pillar | The shared event log plus Athenaeum's history covers it. Revisit once the timeline exists. [P] |
| Vitality | Not a pillar | Apollo's scope already holds it; Apollo is nearly empty. [V] |
| Foundry | Not now | Ideas live in Athenaeum; prototypes live in repositories. No unowned workflow found. [I] |
| Observatory | Not now | A watch list could start as a section of Athenaeum. [L] |

## 7. Future experience concept

**The hub answers three questions before you touch it:** what changed, what is next, where was I. [P]
- The orrery stays as the identity and starts to carry information: a ring around each cell for open items, a pulse on a pillar that changed since the last visit, the next deadline's pillar drifting to the front by itself.
- One strip under it: "since you were here", built from the event log.
- The command key becomes the fastest way to anything: every record in every pillar, every pillar's commands, capture that lands in the right place.
- One timeline across the pillars, reachable from the hub and from any record.

**Each pillar is a place with one thing only it has.** [P] Examples, to be designed properly per pillar and not built from this list:
Athenaeum, a constellation of ideas you can fly through; Piano, a lit keyboard that shows every voicing as it plays; Garage, the
car's life as a mileage line with what is coming; Kairos, the day ring; Money, the descent of the debt; Bastion, a readiness
dial per scenario; Records, a horizon of what expires when; Apollo, a year of days.

**The shared shell stays thin.** [P] Navigation, the dock, the command key, motion rules and type are common. Composition, the signature and the atmosphere belong to the pillar.

## 8. Transformation roadmap

| Stage | What | Depends on | Risk | Effect | Size |
|---|---|---|---|---|---|
| 1 | Truth: this document | | | | done |
| 2 | Manifests and one registry; the event log; one backup; a proof per pillar | 1 | low: additive | every later stage gets cheaper; one honest backup | small |
| 3 | **First demonstration: Athenaeum** as a finished place (section 9) | 2 | medium: new interaction | sets the standard and yields reusable parts | medium |
| 4 | Hub as command environment: since-last-visit, timeline, search and capture across pillars | 2, 3 | medium | the hub becomes useful daily, not only impressive | medium |
| 5 | Pillars one at a time, by value and weakness: Kairos (fold the console in), Garage, Money (fold the console in), Piano, Apollo, Bastion, Records, Hermes, Selling, Odyssey, Privacy, Icarus, Argus; Sylade onto the shell, presence only | 3 | per pillar | each becomes a place | large, spread out |
| 6 | Relationships across pillars (a record's documents, a car's costs, a trip's dates) | 4, 5 | medium | the "whole greater than the parts" | medium |
| 7 | New pillars, if the gap analysis still says so | 6 | | | |
| 8 | The standing loop: discover, design, build, independent review, evidence | all | | | |

Titan, Midas internals, Fleet and Sylade's scope stay as the charter protects them.

## 9. First demonstration and the recommended next move

**Athenaeum.** The charter suggested it; the evidence agrees. [V]
- It is the only pillar that already holds the owner's own material: 11 ideas, their refinements and a history seed. A redesign shows real content on day one instead of a better-looking empty form.
- Its content is a graph by nature: ideas refer to each other and to pillars (several are about Titan and about Prometheus itself). That makes it the natural first user of manifests, the event log and cross-pillar search.
- Its signature can be unlike anything else in the system, and what it needs (a spatial canvas, a record view, capture, provenance marks) is reusable.
- It is 9 KB of code today, so little is lost and nothing protected is touched.

Piano is the alternative if the owner would rather the first proof be the most playful one. I do not recommend starting with Kairos: its engine is done, but the open question there is a decision, not a design.

**What I will do next unless told otherwise.** [P]
1. Stage 2's small foundations (manifests and registry, event log, one backup, a proof per pillar).
2. For Athenaeum, three genuinely different concepts as rendered screens, compared on the charter's criteria, with my pick.
3. Build the pick, then hand it to a second agent for a blind score before calling it done.

**Decisions only the owner can make.**
1. Athenaeum first, or Piano?
2. May the two consoles become the Kairos and Money pillars (replacing those two pages)?
3. Forge: build it, or does the Fleet pause cover it?
4. Remove the personal details from the public repository, including its history?
