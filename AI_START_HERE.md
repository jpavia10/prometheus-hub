<!-- doc-status: current; normative: yes -->
# Prometheus: start here (any AI, every pillar)

Joseph's projects are **pillars** that open from one desk, Prometheus Hub. Each pillar is its own app with its own GitHub repo and its own Drive folder, and every pillar works the same way, so you always know where to look. **Titan Reliquary is the one exception:** it keeps its own rules (`AI_START_HERE.md` in `jpavia10/titan-reliquary-preview`), its own research loop and its own Drive folder `Titan Reliquary/`.

## 1. "Do you have homework?"

When Joseph asks, the answer is one page. Open it and work it top to bottom:

| You | Your page (Drive) | Same text on GitHub |
|---|---|---|
| Grok | `Prometheus Hub/Grok/HOMEWORK — Grok (every pillar)` | `docs/agents/drive/HOMEWORK_grok.txt` |
| Gemini | `Prometheus Hub/Gemini/HOMEWORK — Gemini (every pillar)` | `docs/agents/drive/HOMEWORK_gemini.txt` |
| Muse (Sebastian) | `Prometheus Hub/Sebastian/HOMEWORK — Muse (every pillar)` | `docs/agents/drive/HOMEWORK_muse.txt` |
| ChatGPT | `Prometheus Hub/ChatGPT/HOMEWORK — ChatGPT (every pillar)` | `docs/agents/drive/HOMEWORK_chatgpt.txt` |

Start on number 1 without asking. When it is done, start the next. Never answer "ready when you are" or ask what to do: the page says it. The board for every pillar and every AI: `HOMEWORK.md` in this repo.

## 2. Where everything is (the same in every pillar)

**GitHub repo** (the code, the rules, the homework source):

```
README.md                         what the pillar is, its live link, how to run it
AI_START_HERE.md                  the pillar's own rules (short; this page is the rest)
CLAUDE.md                         Claude's integrator notes
docs/agents/queues.json           the homework (Claude writes it)
docs/agents/QUEUE_{ai}.md         your homework in this pillar (generated, one per AI)
collaborators/SHARED_LOG.md       dated notes, newest first
collaborators/CONTRIBUTOR_SCORES.md   every file you send, scored
```

**Drive** `Prometheus Hub/Pillars/{Pillar}/`:

```
README — {Pillar}                 what it is, its repo, its live link
WORK QUEUE — {AI}                 your homework in this pillar (one per AI, even when empty)
incoming (AI drop files)/         where you save what you make
reference/                        files Claude put there for you to read
```

**Drive** `Prometheus Hub/{your folder}/`: `Instructions — {you}`, `HOMEWORK — {you} (every pillar)`, `FEEDBACK — {you} (every pillar)`.

A seat with no repo yet (Apollo, Hermes, Kairos, Icarus, Argus) keeps its files in this repo under `pillars/{id}/` until its repo exists. The list of pillars: `pillars.json`.

## 3. The rules

1. **Save files, never paste them.** Save in the pillar's `incoming (AI drop files)` folder under the exact name the task gives: `{pillar}_{ai}_{what}_{YYYYMMDD-HHMM}.{ext}` (UTC). Never put the work in the chat for Joseph to copy, and never ask him to relay anything.
2. **The whole count.** A task says how many. 39 of 40 is not done. If you run out of room, save what you have as `..._part1` with a first line saying how many are left, and continue in the next session.
3. **A source you opened for every fact.** A URL that shows what you wrote. Never write what you think a page says. One made-up source sends the whole file back.
4. **Code:** a branch named `{ai}/{what}` and a pull request. Never push to `main`; Claude reviews and merges.
5. **Private stays private.** No passwords, keys, tokens, balances, account numbers or message text in Drive docs, GitHub, Discord or chat. Money lives only in Midas Ledger's encrypted book. Strip photo location data before a photo is public.
6. **Discord (Sylade Fleet) is for talking.** The homework and the files live here and in Drive.
7. **Fleet Command is paused** (Joseph, 2026-10-28). Write nothing there.
8. **The look:** every pillar except Titan shares the Prometheus look (cool midnight, depth, light, particles; no neon, no Titan gold).

## 4. How your work is checked

Every task lists **How Claude checks it** and **Not done if**. Claude runs those checks on every file: counts the items, opens the sources, runs the code, and gives the work to a second reader. A file that fails goes back with the reason in your `FEEDBACK` doc, and the task stays open. Every file is scored in that pillar's `collaborators/CONTRIBUTOR_SCORES.md` (place, accepted, accurate, complete, on the sheet; 10 is the best).
