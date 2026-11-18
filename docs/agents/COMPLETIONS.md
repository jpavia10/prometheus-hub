# The completions ledger — how Forge knows work is done

Forge (pillars/forge) reads every queue live: the hub and pillar `docs/agents/queues.json` files, Midas's queues, Titan's homework files and project queues, and the WORKBOARD. A queue only changes when the integrator for that repo flips it — which left finished work showing as open for days (Gemini's delivered datasets, Muse's Titan filings).

The ledger fixes that. It is one file on Google Drive:

- **File:** `forge-completions.json`, in the **Sebastian** folder (Drive id `1QEaQylVPtfbAczGDBkt4GAwIVGyY372W`, link-shared read-only).
- **Forge reads it on every page load** and shows any listed task as **delivered**, on top of whatever its queue says. If the file cannot be fetched, Forge falls back to the queues alone — nothing breaks.

**Automatic since 2026-11-18 (owner: "whenever an assignment is completed it automatically shows updated status on the forge"):** browsers cannot read Drive files cross-origin, so Forge reads the in-repo mirror `docs/agents/completions.json`, and `.github/workflows/ledger.yml` copies the Drive file into that mirror **every 10 minutes** (`tools/forge/sync_ledger.py`). Your entry shows on Forge as delivered within about 10-20 minutes of saving the Drive file, with nobody folding it in. The mirror only grows (a Drive save that drops older lines loses nothing), malformed lines are skipped, and dollar amounts in `what` are masked because the site is public. Forge's source line shows when the mirror last synced.

**Copies and markers fold in by themselves too.** Some workers cannot replace a Drive file, so they upload a new `forge-completions.json` beside the original (Gemini does) or a `DONE_<key>.json` marker. Those files are private, so the 10-minute job cannot see them; a scheduled Claude run twice a day (11:44 and 22:44 Pacific, no auditor; owner 2026-11-18: "tell Gemini to edit the ledger, fold twice a day") searches Drive for every `forge-completions*.json` copy and `DONE_*.json` marker from the last two days, downloads them into one folder and runs `tools/forge/sync_ledger.py docs/agents/completions.json --source-dir <folder>`, then pushes when the mirror changed. So a copy or a marker shows on Forge by the next fold (up to about 12 hours); an edit to the original file within about 10-20 minutes. Every AI's homework page now opens with that rule: edit the original, never upload a copy.

**Titan projects** count under either name: the Forge id `T-<ai>-<n>` or the project's own `run_id` (for example `GT-LEDGER-p2`, the name its instructions tell you to put in the file).

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

If you cannot edit the file, save `DONE_<task id>.json` with the same four fields into the same Drive folder as your deliverable and say so in your report. Those markers are **not** automatic: they wait until an integrator (Claude or Sebastian) folds them into the ledger, so use the ledger whenever you can.

## What an entry means

**Delivered, not accepted.** The entry says the deliverable exists in the named folder. The integrator's check still decides acceptance, and flipping the queue in its repo remains the permanent record — an entry for an already-flipped task is a harmless duplicate (Forge checks the queue first). Never add an entry for work you have not actually saved to Drive.

Set up 2026-11-17 by Sebastian at Joseph's direction ("Forge shows up as updated at the end of everybody's work, regardless of who's doing it"). Backfilled with the verified completions of 2026-11-16/17: Muse's 5 Titan homework files, the blind ledger reads, era re-citations, the sound hunt, MID-MUS-03, MID-GEM-09, and Gemini's 25 delivered function specs.
