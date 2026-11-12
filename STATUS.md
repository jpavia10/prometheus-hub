<!-- doc-status: current; normative: no -->
# Prometheus: status

What is on the live deck and what is not. A capability is on the deck only when its proof passes in a real browser
(`python3 proofs/run.py <url>`; unit proofs `node --test proofs/unit/*.test.mjs`). Results of the last run: `proofs/results.json`.

Build **d1** · 2026-11-12 · live at https://jpavia10.github.io/prometheus-hub/

## On the deck

| Capability | Verdict | Proof |
|---|---|---|
| The picture (arrival view) | DONE | DECK-1: day ring, next 24 hours, 7-day runway, countdowns, payoff, storm watch and focus, all computed from the one store. Live sky follows the time of day and the weather. |
| Time | DONE | TIME-1: the 40-event research calendar imports, exports and re-imports identical (40 of 40). TIME-2: a federal holiday, a bill and a school deadline on one day show as a collision in the day view. TIME-3: quick add in plain words. Also: 58 fixed dates, repeats with exceptions, week / month / agenda / risk views, focus clock with the 20 researched methods. |
| Money | DONE, one part waiting | MONEY-1: the simulator matches all 12 worked payoff cases to the cent (4,134 figures; the brief asked for 2). MONEY-2: bills and the loan payment are dated rows in the same feed as events. Also: what-if (extra, windfall), three strategies side by side, minimum-payment trap for 25 issuers, deferred interest vs true 0 %, 22 promo offers, 23 hardship programs (2 lenders had none to cite). Waiting: selling totals flow in when Selling is built. |
| System | DONE | DATA-1: versioned deck file out and back in restores Time and Money exactly; one file per capability; undo for the last load; erase. |

## Not on the deck yet (not shown; the old pages still answer at their old addresses until each is rebuilt)

In build order: Garage, House, Selling, Records, Body, Journal, Mail, Piano, Bastion, Athenaeum, Odyssey (with the away mode), Privacy, Photos, Presence (Sylade).

## Known gaps in what is live

- Tested in a desktop browser at phone size only. Not yet tried on the owner's phone.
- No sound yet (it will sit behind one switch, never autoplay).
- The owner's own presets load from a private deck file he keeps in his Drive; the public site ships invented demo data only.
- `Gemini STATUS_CLEAN_SLATE_v2` marked everything DONE. That file is wrong and its package is not deployed.
