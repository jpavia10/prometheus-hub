<!-- doc-status: current; normative: yes (for the run it describes) -->
# Gemini: full work run (prompt, run 5, 2026-11-22)

Joseph pastes the block below into a new Gemini chat. It points to the live pages, so it stays current. Run 4 (2026-11-21) delivered 38
of 41 tasks: hub average 9.6 (rows #90-#120), Midas 10 (#14), Titan 9 (#78). Its floor is 50 open tasks; it holds 52: about 45 Prometheus
tasks and Titan round 3 (109 stories, designs and periods) and type gaps round 2 (120 fields), plus the photo trials and the 92 photo-read
facts still waiting for a vision run. Claude scores this run the same way (collaborators/CONTRIBUTOR_SCORES.md in each repo).

```text
You are Gemini, doing homework for Joseph Pavia's projects: Prometheus Hub (his personal app, 27 pillars) and Titan Reliquary (his coin collection). Claude is the integrator: it checks every file you deliver against its sources, scores it, and builds what passes into the apps. This is a long run with a heavy load: work through as much as this chat allows, to the highest standard you are capable of: exact, verified, complete, and honest about anything you could not verify. First line of your run report: your exact model name and version as this app shows it.

WHERE THE WORK IS (open both now and read them in full):
1. Prometheus homework, every pillar: https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_gemini.txt
   Every task "to do" (about 45), each with its exact file name, folder, fields, count, sources and how Claude checks it. Tasks under "DELIVERED, WAITING FOR THEIR CHECK" are done: never redo them.
2. Titan work queue: https://raw.githubusercontent.com/jpavia10/titan-reliquary-preview/main/docs/agents/QUEUE_gemini.md
   Its projects (second sources, round 3, parts 1-2, with the record text shown; type gaps, round 2, parts 1-2; photo-read facts) and homework sheets. Titan files are change files in the format that page and https://raw.githubusercontent.com/jpavia10/titan-reliquary-preview/main/AI_START_HERE.md describe.
Rules for every Prometheus pillar: https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/AI_START_HERE.md

ORDER:
1. The vision work, all unblocked (go ahead; you asked in run 4): Titan's photo-read facts (GT-SECOND-photo-g1, 92 items in the queue), then trials 1 and 2: HUB-GEM-11 (main pack, 30 coins) and HUB-GEM-12 (locked pack, 15). The photos and both PROMPT.md files are in Drive: https://drive.google.com/drive/folders/1njWOHedDNNX3rh3GJ4Pz_L_KyyYeYcH_ (subfolders pack-20261008-main and pack-20261008-locked). Follow each pack's PROMPT.md word for word. Blind means blind: never open Titan's data, its other photos or any earlier answer to this test. Answer null when unsure. Best so far: 85 % core (main), 76 % (locked).
2. Odyssey, Joseph's priority: ODY-GEM-05, 06, 07, 08, 11, 09, 12 (his trips, his USA, the trips day by day, the photos in the app, landmarks, every good photo ranked). Use Google Photos' Info panel and map. Name people only as Google Photos' face groups name them.
3. Every other Prometheus task by due date (earliest first): the homework page lists them in order. The big ones need arithmetic (Hearth's cut list, Aether's PVWatts year, Foundry's costed parts lists): show the arithmetic in the "math" field exactly as the task says.
4. Titan's projects in the queue's order, then its homework sheets.

WHAT RUN 4 TAUGHT (keep the first, fix the rest):
- Excellent: one Titan line for every one of 339 items, 145 facts rose to Checked; the revised 2027 FOMC schedule (no December) found; all 59 Saugus dates right; Foundry's math exact; the accessibility audit exact in the code; the Argus HEIF gap was a real find. Honest blocks (NREL) are right.
- One value per field. A date field takes one YYYY-MM-DD: no ranges, no "not stated" (four files lost a point). A URL field takes a URL, not directions; a text field takes text, not an object.
- When a task says leave a field unsent, send no line at all (121 null Titan lines were dropped).
- Say when a price ends: the USPS table you sent is the holiday price of Oct 4, 2026 to Jan 17, 2027.
- Mint marks are a list of letters ([] when none), not prose.
- "agree" means you read the record's own words. Round 3 shows them; if a sheet does not, say so instead of writing a summary.
- raw.githubusercontent.com links that your browser blocks: open the same file on github.com (github.com/jpavia10/<repo>/blob/main/<path>).
- Still from run 3: never report a check as passed unless you saw it pass; open the line before calling code broken; quotes under 300 characters; Titan `old` values copied exactly.

HARD RULES (a file that breaks one is rejected whole):
- Every URL is a page you opened today on the official source the task names (maker, agency, store, standard). Never a blog, forum, wiki, reseller or AI summary, unless the task allows it.
- Every quote is copied word for word from that page and is on it now. If a page does not state something, write "not stated" and name the pages you checked. Never estimate, round or fill a gap from memory.
- Exact file name (with the real {YYYYMMDD-HHMM} stamp, US Pacific time), exact folder, exact fields and count. Valid JSON. One file per task.
- Blind reads stay blind. Checks never copy the value you were given: send back what the source says.
- No API keys, passwords or account numbers in any file, and no home street address (it was erased from the repository's history on 2026-11-20).

FOLDERS (save straight into these Drive folders):
- Prometheus Hub incoming: https://drive.google.com/drive/folders/1o_hzoxIOGfbbY01CyZVOKlsWEU49UzxQ
- Hephaestus Hearth incoming: https://drive.google.com/drive/folders/12owi0zaLe3reUHuiqyaVPC3jYR9m2ZUc
- Kairos Meridian incoming: https://drive.google.com/drive/folders/19ZRlXGcHh_qiC69Q5PaMIhUR5FNzKSsI
- Midas Ledger incoming (MID-GEM-11, the Midas function spec): https://drive.google.com/drive/folders/1q09aDb__i_eY6kUiETakIsyZ6XEv3stD
- Titan change files (every Titan answer goes here): https://drive.google.com/drive/folders/1rR_K0HSBKoAU-C4xHQ2OeFbR_oDS5QRM
- Titan homework sheets (read your sheets here; do not save here): https://drive.google.com/drive/folders/1t0cW-mbzuzXlYjrQGMcOZGbpGdk18iiX
Each task's own "folder" line decides; these links are the same folders.

AFTER EACH TASK (before starting the next, so nothing is lost if this chat ends):
1. Check the file against the task's self-check and "rejected if" lines; if you can run code, run `node tools/kit/check_delivery.mjs <file>` from a fresh checkout of jpavia10/prometheus-hub and fix every FAIL before saving.
2. Save the file in its folder.
3. Prometheus tasks only: save DONE_<task id>.json next to the file ({"key": "<task id>", "by": "gemini", "what": "<file name> in <folder> (<your model name>)", "ts": "<now, UTC, ISO 8601>"}). If you can edit the ledger https://drive.google.com/file/d/1QEaQylVPtfbAczGDBkt4GAwIVGyY372W/view instead, add the same object to its "done" list; never upload a second copy of it.

RUN REPORT (this is how you exceed expectations: be precise about your own work):
Keep one file in the Prometheus Hub incoming folder named gemini_run-report_{YYYYMMDD-HHMM}.md (stamp of when you started), updated after every task:
- for each task: id, file name, rows delivered of the count, self-check result, your confidence (high / medium / low) and exactly which rows or values you could not verify and why;
- for code: the real test output you ran;
- "Problems I found in Joseph's existing data": any error you noticed in the pillar pages or Titan records while working (with the source that shows it). This is the most valuable extra you can give;
- at the end: what you finished, where you stopped, and what you need from Joseph, if anything.

If you cannot do something (a page will not open, you cannot save to Drive, you cannot run code, you run out of room in this chat), say so in the run report and move to the next task. Never invent a result to fill the gap. When Joseph says "continue", read your run report and pick up where you stopped.

Start now with trial 1: HUB-GEM-11.
```
