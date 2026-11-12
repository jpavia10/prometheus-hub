<!-- doc-status: current; normative: no -->
# Prometheus: status

What is on the live deck and what is not. A capability is on the deck only when its proof passes in a real browser
(`python3 proofs/run.py <url>`; unit proofs `node --test proofs/unit/*.test.mjs`). Results of the last run: `proofs/results.json`.

Build **d3** · 2026-11-12 · live at https://jpavia10.github.io/prometheus-hub/

Owner, 2026-11-12: "Instead of making a demo you should have transformed what I have with the available data. Again you strip away my
pillars ... The over the top futuristic dopamine loaded theme and transitions are what im seeking ... bring the project together and
we can develop them one by one later." Build d2 is that correction: the hub is the shell that holds every pillar; the pillars keep
their pages and get developed one at a time.

## The hub

| Part | Verdict | Proof |
|---|---|---|
| The core | DONE | Since d3 a live orrery (owner: "advanced motion and gui not a 1990s basic shit"): the 18 pillars orbit a shader-drawn fire in 3D; a sideways drag spins the system with inertia and it settles on the nearest pillar; tapping a pillar swings it to the front and warps in; one switch morphs orbit to hex grid; panels below tilt into place with the scroll. CORE-1: all 18 present, no sample data on a clean device. CORE-4: a tap lands in the pillar. Hold a pillar for its brief. Boot once a session; sound behind one switch. |
| One theme everywhere | DONE | CORE-2: all 15 pillar pages in this repository answer and take the shared theme from `kit/prometheus.css` (each in its own colour), with an animated page change where the browser supports it. Titan, Midas and Hearth are on their own sites and keep their own look. |
| Real data on the hub | DONE | CORE-3: a deadline any pillar publishes to the shared bus shows in the hub's feed and as a badge on that pillar's cell. Cells also show how much each pillar holds on this device; Titan's cell and tile read its published ledger. Fixed dates: the 58 researched ones. |
| Day ring, runway, countdowns, storm watch | DONE | DECK-1. They read the one feed (the bus, the fixed dates, the consoles below). |
| Kairos console, Payoff console | DONE | TIME-1..3, MONEY-1..2. New consoles built in d1; reachable from the hub's instruments and search. They do not replace the Kairos and Money pillar pages, which are back at their addresses. |
| System | DONE | DATA-1. |

## The pillars (each keeps its own page; none was rebuilt in d2)

Kairos Meridian, Midas Ledger, Titan Reliquary, Hephaestus Hearth, Garage, Apollo Temple, Money · payoff simulator, Selling Pipeline,
Records, Icarus Stake, Hermes Post, Bossa Piano Studio, Bastion, Athenaeum, Odyssey, Privacy, Argus Album, Sylade.
They are still mostly forms waiting for data; that is the next phase, one pillar at a time, in the owner's order.

## Known gaps in what is live

- Tested in a desktop browser at phone size only. Not yet tried on the owner's phone.
- Sound is synthesized interface sound only (ticks, the boot, the warp); no music or recordings.
- Two things answer to "time" and to "payoff" right now (the pillar page and the new console). Which one each pillar becomes is the owner's call when that pillar is developed.
- The hub shows what is on the device and what the pillars publish; it ships no sample data on the first screen (a sample deck exists only for the proofs and under System).
- `Gemini STATUS_CLEAN_SLATE_v2` marked everything DONE. That file is wrong and its package is not deployed.
