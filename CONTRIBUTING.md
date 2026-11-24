<!-- doc-status: current; normative: yes -->
# Contributing to Prometheus: a README for any AI

You are an AI helping Joseph Pavia build **Prometheus**, his own set of apps. This page is enough to start work today without asking
anyone anything. `AI_START_HERE.md` (same folder) has the folder layout in more detail; Titan Reliquary, his coin collection, has its
own rules (`jpavia10/titan-reliquary-preview`, `AI_START_HERE.md`).

## 1. What Prometheus is

One home (the hub, https://jpavia10.github.io/prometheus-hub/) and around it the **pillars**: one app each for a part of his life.
Kin is the family (the family tree, in three dimensions: `pillars/kin/tree/`), Odyssey his travel, Garage the vehicles, Hearth the
house, Aether the air, fire and weather, Bastion emergencies, Kairos the calendar, Records the paperwork, Money and Midas Ledger
the money (Midas is private), and more: the list is `pillars.json`. Everything runs in the browser; nothing is sent to a server.

Roles: **Claude** builds and integrates (code, data, deploys, checks). **Gemini, Muse, ChatGPT and others** research and make
things as homework, and deliver files. **Joseph** decides.

## 2. Your homework

Your list is one page, newest first, always live:

| You | Your homework (live) |
|---|---|
| Gemini | https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_gemini.txt |
| Muse | https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_muse.txt |
| ChatGPT | https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_chatgpt.txt |
| A new AI | ask Joseph to add you; until then, read the board `HOMEWORK.md` and offer to take a task by its id |

Start on number 1 without asking and keep going. Every task says why it matters, what to read, the exact steps, how many, the
file name and folder, the fields, how Claude checks it, and what sends it back.

## 3. Delivering a file

1. **Save, never paste.** Save the file in the folder the task names (each pillar's Drive folder `incoming (AI drop files)`) under
   the exact name the task gives, with the time in UTC: `{pillar}_{ai}_{what}_{YYYYMMDD-HHMM}.json`.
2. **The shape the task gives**: almost always a JSON array, one object per row, exactly the fields listed. For a value a source does
   not state, write `null` (not 0, not "", not "not stated"). A URL is never null.
3. **The whole count.** 39 of 40 is not done. Out of room: save `..._part1` with a first row saying what is left, and continue.
4. **Check it yourself first**: `node tools/kit/check_delivery.mjs FILE` in this repo (it checks the name, the fields, the types and the
   URLs exactly as Claude will).
5. **Mark it done**: add one entry to the Drive file `forge-completions.json` (folder Sebastian) as your homework page says. The Forge
   (https://jpavia10.github.io/prometheus-hub/pillars/forge/) then shows it delivered.

## 4. The standard

- **A source you opened for every fact**, as a URL that shows it. Never write what you think a page says. An official page beats a
  blog, a forum or an AI summary. One invented source sends the whole file back.
- **Say how sure you are and why.** Where a task asks for certainty, use its scale and name the records behind the figure.
- **Negative results count.** A search that found nothing is a row: it saves the next person from repeating it.
- **Code** goes on a branch `{ai}/{what}` with a pull request; never push to `main`. Claude reviews and merges.

### Family history (Kin) has a stricter standard

Kin follows the Genealogical Proof Standard; read `pillars/kin/docs/LINEAGE_METHOD.md` once. In short:

- Every record attached to a person needs an **identity argument**: at least three identifiers compared (dates, places, spouse,
  parents, children). Same name is not enough.
- **Transcribe word for word**, never shortened or cleaned. An index or abstract is never "original".
- Every parent-to-child link gets a **certainty** on this scale: 90-100 a primary record names the parent; 70-89 indexes and
  consensus agree; 40-69 a working hypothesis; under 40 disputed or disproved. Compiled trees alone never reach 90.
- A **photograph** is someone's likeness only when you can say who labelled it and why it is them (the FamilySearch "portraits" of
  24 Nov were the DAR logo, a woman under a man's name, and a man too young to be the person: see conflict C12).
- On Joseph's **Ancestry.com** tree you may add and edit, with a record for every addition and a change log row for every edit.
  Never accept a "potential parent" or another member's tree without a record.
- The tree's data: https://jpavia10.github.io/prometheus-hub/pillars/kin/lineage/data.js; see it at
  https://jpavia10.github.io/prometheus-hub/pillars/kin/tree/.

## 5. Privacy

No passwords, keys, tokens, account numbers, balances or message text anywhere (Drive docs, GitHub, chat). No living person's street
address, phone number or people-search-site page (Whitepages, FastBackgroundCheck and the like): leave them out even when found.
Joseph's own photos and places may be used inside the pillars; strip location data before a photo goes anywhere public.

## 6. How your work is checked and scored

Claude runs each task's checks on every file: counts the rows, opens sources at random, reads record images against transcriptions,
and gives some work to a second reader. Every file is scored 0-10 in `collaborators/CONTRIBUTOR_SCORES.md` (place, accepted, accurate,
complete, on the sheet; 2 each). What went right and what to fix is in your **FEEDBACK** file:

- the repo: `collaborators/FEEDBACK_{ai}.md` (Gemini: `collaborators/FEEDBACK_gemini.md`)
- Drive: `FEEDBACK for {AI} (read before your next submission)`

Read your feedback before each session. A file sent back keeps its task open with the reason; fix exactly that and resend under a new
time stamp.

## 7. Where things are

| What | Where |
|---|---|
| The pillar list | `pillars.json` |
| Homework source (Claude edits) | `docs/agents/queues.json` and `pillars/{id}/docs/agents/queues.json` |
| Your homework, rendered | `docs/agents/drive/HOMEWORK_{ai}.txt`, `docs/agents/QUEUE_{ai}.md` |
| The board of everyone's homework | `HOMEWORK.md` |
| Shared notes, newest first | `collaborators/SHARED_LOG.md` |
| Scores | `collaborators/CONTRIBUTOR_SCORES.md` |
| The delivery checker | `tools/kit/check_delivery.mjs` |
| Drive | `Prometheus Hub/` (your folder, the pillars' folders and their `incoming (AI drop files)`) |

Fleet Command is paused: write nothing there. Discord (Sylade Fleet) is for talking; the work lives in Drive and GitHub.
