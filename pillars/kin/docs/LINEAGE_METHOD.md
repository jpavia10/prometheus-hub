<!-- doc-status: current; normative: yes -->
# Kin lineage: the research method

The family tree in Kin (`pillars/kin/lineage/`) is a research instrument, not a list of names. It holds only what the records
show, says how each fact is known, and keeps every disagreement in view until the evidence settles it. This file is the
method every contributor (Claude, Gemini, Muse, the owner's family) follows. It is normative.

The owner's intent (2026-11-24): "How am I to pass knowledge down if I don't collect and curate it. I want it PhD level."

## 1. The standard: the Genealogical Proof Standard

A conclusion (a date, a place, a parent) is written only when all five hold:

1. **A reasonably exhaustive search.** Every record that could answer the question was looked for, and the searches that
   found nothing are written down too (they are negative evidence, and they stop the next person repeating them).
2. **Complete and accurate citations** for every source used (section 4).
3. **Analysis and correlation.** Each source is classified (section 2) and compared with the others.
4. **Resolution of conflicting evidence.** Where sources disagree, a written argument says which one wins and why (section 5).
5. **A written conclusion.** The reasoning is on the page, not in someone's head: in Kin, the event's `conclusion`, the
   conflict's `argument`, and the person's `summary`.

Confidence words in the tree mean exactly this: **proven** (the five hold), **probable** (the evidence points one way and
nothing serious disagrees, but the search is not exhaustive), **possible** (some evidence, open questions), **hypothesis**
(an idea to test; never shown as a fact), **to name** (a placeholder for someone the owner knows but the tree has no record of).

## 2. Three classifications for every assertion

Each assertion (one source saying one thing) carries three labels, in `data.js` as `kind` on the source and `info` and
`ev` on the assertion:

| | Values | The question |
|---|---|---|
| Source | original, derivative, authored | Is this the first recording (a manifest, a certificate), a copy or index of one, or someone's compiled work (a family tree, a history)? |
| Information | primary, secondary, undetermined | Did the informant see or take part in the event, or hear it from others? Judged per fact: one death certificate gives the death as primary and the birth as secondary. |
| Evidence | direct, indirect, negative | Does it answer the question outright, only when combined with other facts, or by the absence of something that should be there? |

An index is never an original. A compiled family tree (online or the great-uncle's file) is authored: a lead to the records
it names, never the source of a fact by itself.

## 3. Identity before facts

A record is attached to a person only after an identity argument that compares at least three identifiers with what is
already proven (age and birth date, birthplace, arrival, address, occupation, spouse, service). A near match that fails is
recorded as "no match" with the reason (the 30 Sep 1912 *President Lincoln* Josef Terminas is the worked example: right name,
age and origin, five weeks after the date he swore to).

## 4. Citations

Evidence Explained style, first-reference form: what the record is, who created it, the repository, the exact reference
(collection, film or roll, volume, page, line, certificate or image number), the website and the date accessed. The test:
someone else can open the same image from the citation alone. Every source in `data.js` has `cite`, and where an image
exists, `img` and `read` (what has been transcribed so far, and what has not).

## 5. Conflicts

A conflict (`conflicts` in `data.js`) states the question, every competing assertion, and an `argument` that weighs them
by the classifications above, the informant's knowledge, the record's purpose and its distance from the event. Status is
**open**, **resolved** (one answer wins, with the reason) or **explained** (both are true in their own way, for example two
residences in 1919). A conflict is never closed by repeating the majority.

## 6. Transcription

Word for word, with the original spelling, abbreviations and punctuation; `[sic]` where it is wrong in the original;
`[illegible]` where it cannot be read; a translation after the transcription when the record is not in English. Never
shortened, never modernized, never filled in from what the reader expects. A second, blind transcription by another reader
is the standard check (KIN-MUS-02); differences between readers become conflicts.

## 7. Names, places and dates

- **Lithuanian surnames change form**: Termenas (a man), Termenienė (a married woman), Termenaitė (an unmarried woman). Russian
  records write them in Cyrillic; American records anglicize them (Termens, Terminas, Termen). All forms are kept in the
  person's `names`, each with its source and type (birth, anglicized, record).
- **Dates in the Russian Empire** ran on the Julian calendar, 12 days behind the Gregorian in the 1800s (13 from March 1900).
  A birth recorded in Telšiai on 4 May 1893 (Julian) is 16 May 1893 (Gregorian). Both are given when a record is Russian.
- **Places** are recorded as they were then (`hist`: Telšiai, Telšiai uyezd, Kovno Governorate, Russian Empire) and as they
  are now (`now`), with coordinates for the map.

## 8. How the work moves

- **Outside AIs** do research as homework (`pillars/kin/docs/agents/queues.json`, rendered to `QUEUE_{ai}.md`) and deliver
  JSON files to the Drive drop folder. Each row is one search, record, lead or summary with the fields the task names.
  They never edit the repository.
- **Claude** runs each delivery through `tools/kin/lineage_intake.py FILE --out DIR` (it checks the file against its task's fields
  and the method's words, rejects a record without its reference, citation, transcription or identity argument, and drafts the
  search rows as research-log entries and the record rows as candidates), reads every candidate record against its image, writes
  the assertions, conflicts and conclusions into `pillars/kin/lineage/data.js`, adds the searches to its `log`, scores the file
  (`collaborators/CONTRIBUTOR_SCORES.md`) and sets new homework.
- **The research log** (`log` in `data.js`, shown in the research plan) keeps every search, found or not, with who ran it, where,
  the exact terms and the result: the record that the search was reasonably exhaustive.
- **The owner and family** add people and names on the device (the namer and add-relative forms; stored locally, included in
  the GEDCOM export) and answer the questions only they can (the `owner` questions in the research plan). A family story is
  recorded as an authored source with its teller and date, and stays a lead until a record supports it.
- **Export**: GEDCOM 7 from the tree's footer, so the work survives any one app.

## 9. Where things are

| Thing | Where |
|---|---|
| The data (people, families, places, sources, events, conflicts, hypotheses, questions, the per-person GPS state) | `pillars/kin/lineage/data.js` (`window.KIN_LINEAGE`, schema `kin-lineage/1`) |
| The tree, dossier, journey map, document viewer, sources, research plan, GEDCOM export | `pillars/kin/lineage/lineage.js`, `lineage.css` |
| The record images (webp, rotated upright; thumbnails in `t/`) | `pillars/kin/lineage/docs/` |
| Research homework | `pillars/kin/docs/agents/queues.json` (KIN-GEM-07 to 13, KIN-MUS-02) |
| The originals the owner sent (2026-11-24) | Drive `Prometheus Hub/Pillars/Kin/lineage records/`: the enlistment, discharge and naturalization PDFs and six photos (draft card, enlistment, discharge, naturalization certificate, VA index card, death certificate). The great-uncle's 26-page PDF and the two aerial photos are over the Drive connector's size limit and are not there yet; their pages and the aerials are in `docs/` above as images. |
