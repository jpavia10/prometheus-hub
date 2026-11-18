# The completions ledger — how Forge knows work is done

Forge (pillars/forge) reads every queue live: the hub and pillar `docs/agents/queues.json` files, Midas's queues, Titan's homework files and project queues, and the WORKBOARD. A queue only changes when the integrator for that repo flips it — which left finished work showing as open for days (Gemini's delivered datasets, Muse's Titan filings).

The ledger fixes that. It is one file on Google Drive:

- **File:** `forge-completions.json`, in the **Sebastian** folder (Drive id `1QEaQylVPtfbAczGDBkt4GAwIVGyY372W`, link-shared read-only).
- **Forge reads it on every page load** and shows any listed task as **delivered**, on top of whatever its queue says. If the file cannot be fetched, Forge falls back to the queues alone — nothing breaks.

**Read-path update (2026-11-18):** Drive download URLs send no CORS headers, so a browser blocks Forge's cross-origin fetch of the Drive file (this also failed the repo's PILLAR-2 proof in CI — the blocked fetch logs as a console error). Forge now reads an in-repo mirror, `docs/agents/completions.json`, on every page load. **Nothing changes for workers:** keep appending to the Drive file (or dropping `DONE_` markers) exactly as below. Sebastian refreshes the mirror from the Drive file whenever he folds entries, and the mirror ships with the next hub push.

## The end-of-work rule (every AI, every repo)

When you finish a task, before you report it:

1. Download `forge-completions.json`.
2. Append one entry to its `done` list and set `updated` to now (UTC):
   `{"key": "<task id>", "by": "<your name>", "what": "<deliverable file name> in <folder>", "ts": "<ISO 8601 UTC>"}`
3. Save the file back, replacing it.

The `key` is the task id exactly as Forge shows it:

- Hub and Midas tasks: the queue id (`KAI-GEM-10`, `MID-MUS-03`).
- Titan homework: the assignment id (`HW-muse-verify-20261113-1`).
- Titan projects: `T-<ai>-<n>` from Titan's `docs/agents/queues.json` (`T-muse-12`).

If you cannot edit the file, save `DONE_<task id>.json` with the same four fields into the same Drive folder as your deliverable and say so in your report; Sebastian folds those into the ledger.

## What an entry means

**Delivered, not accepted.** The entry says the deliverable exists in the named folder. The integrator's check still decides acceptance, and flipping the queue in its repo remains the permanent record — an entry for an already-flipped task is a harmless duplicate (Forge checks the queue first). Never add an entry for work you have not actually saved to Drive.

Set up 2026-11-17 by Sebastian at Joseph's direction ("Forge shows up as updated at the end of everybody's work, regardless of who's doing it"). Backfilled with the verified completions of 2026-11-16/17: Muse's 5 Titan homework files, the blind ledger reads, era re-citations, the sound hunt, MID-MUS-03, MID-GEM-09, and Gemini's 25 delivered function specs.
