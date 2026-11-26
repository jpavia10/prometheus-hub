/* Argus corpus binder (Sebastian, 2026-11-14): Joseph's real photo corpora, from his own records —
   ~/AGENTS.md (duplicate-cleanup batch rules, set 2026-09-25) and ~/MEMORY.md (dup review tool,
   photo cleanup lessons, Titan QA/protocol), with the queue count corroborated by the daily log of
   2026-09-25 (queue 980 -> 970 when Batch 7 executed) and the Titan folder IDs verified 2026-10-16.
   Facts only, nothing inferred. The dup-review queue lives on Google Drive and Argus cannot read it
   from this browser, so its remaining count is a dated snapshot from Joseph's records — shown with
   its as-of date, never as a live number. Seeded once (corpusSeedV1) into prometheus.argus.corpus;
   after that the stored copy is the user's record. */
window.ARGUS_CORPUS = {
  dupReview: {
    queuePath: "Sebastian/Dup Review/batches/queue.json",
    queueFileId: "1M2u9hAaQrRU1tEKERUjW78k7m64oFYV0",
    appUrl: "https://jpavia10.github.io/dup-review/?drive=1M2u9hAaQrRU1tEKERUjW78k7m64oFYV0",
    remainingLabel: "~970 pairs",
    remainingAsOf: "2026-10-15",
    countNote: "Last count in Joseph's records (the queue went 980 -> 970 pairs when Batch 7 was executed). The queue lives on Drive and can't be read from here — treat this as a snapshot, not a live total.",
    flow: [
      "Joseph opens the review app and taps through the first 10 pairs in the queue.",
      "He copies the decision code the app gives him back into chat.",
      "Sebastian verifies the decision-code hash against the queue before touching anything.",
      "The batch executes as one grouped trash (protocol below) and the reviewed pairs are removed from the queue.",
      "New pairs are appended to the same queue file — never per-batch files.",
      "If a decision code doesn't match, Joseph reloads the page and copies the fresh code.",
    ],
    protocol: [
      "10 pairs per batch, numbered 1–10 fresh each batch.",
      "Every pair gets a side-by-side preview image: DELETE (red, left) / KEEP (green, right). No text-only pairs, ever.",
      "Non-image files get rendered previews: PDF = page 1, docx = converted then page 1, anything else = a file-info card (name / size / MD5 / path).",
      "Under each pair: filenames plus one-line evidence (MD5 prefix, sizes, locations).",
      "Easy true duplicates only: exact MD5 or pixel-verified. Visual near-duplicate bursts are parked for later — Joseph decides when.",
      "A summary of findings comes BEFORE any permission prompt.",
      "Grouped delete: the 10 losers move into one staging folder under Sebastian/ (e.g. “Batch 7 staging - trash me”), then that folder is trashed — one approval card per batch, never file-by-file.",
      "Before staging, verify Joseph owns each loser: parentless “Shared with me” orphans (canTrash = false) are excluded from the batch.",
      "At delete time, each KEEP file is also relocated to its correct Vault location if it isn't already there (see the Vault scheme).",
      "Trash actions may silently not execute while Joseph is away — if so, everything stays staged and he taps the trash when he's back.",
    ],
  },
  vault: {
    rootNote: "Everything Sebastian creates on Drive lives inside the Sebastian/ folder — never at Drive root.",
    targets: [
      { kind: "Photos", path: "Vault/Photos/Photos from YYYY/" },
      { kind: "Videos", path: "Vault/Videos/Videos from YYYY/" },
      { kind: "Documents", path: "Vault/Documents/… (matching subfolder)" },
    ],
    yearRule: "Year is inferred from the filename date or the file's createdTime; the target folder is found or created at delete time, as part of the batch.",
  },
  boundaries: {
    never: [
      "Pet, personal or sentimental photos.",
      "Chat, video-call or message screenshots.",
      "Financial screenshots — except as a true duplicate.",
      "Anything ambiguous: preservation over deletion when uncertain.",
    ],
    hunt: [
      "Exact duplicates (the worse copy goes).",
      "Junk screenshots and outdated app UIs.",
      "Maps navigation shots.",
      "Play Store pages and package-tracking shots.",
      "Ancient web screenshots.",
    ],
    rules: [
      "Filenames lie — inspect every candidate personally before it goes in a batch.",
      "Always trash, never permanently delete.",
      "Verified strict duplicates and high-probability junk go in small batches only.",
      "No new unsolicited cleanup batches until Joseph finishes the dup-review queue.",
    ],
  },
  titan: {
    naming: "NOID_{Country}_{year}_{Denomination}_{obv|rev}.jpeg",
    examples: ["NOID_Italy_1979_50Lire_obv.jpg", "NOID_Bahamas_1984_25Cents_obv.jpg", "NOID_Mexico_1989_500Pesos_obv.jpg"],
    staging: { label: "STAGING — drop coin photos here (Drive)", id: "1_g6H2V9GZ0TkXISVASNtxSeQ25bJbEqH" },
    drop: { label: "collection-incoming — AI change files (Drive)", id: "1NHtSQ7nNokabPa-5KrYp66Of7RcdNg8B" },
    flow: [
      "A coin arrives as a chat photo — that photo is the working original; a resend is never asked for.",
      "It is staged in the Drive STAGING folder under its NOID name (obverse and reverse).",
      "The change file is built and gated: it ships only when apply_changes.py --dry-run applies it clean.",
      "The change file uploads to collection-incoming; the upload is verified by downloading it back.",
      "Claude alone merges and assigns C numbers — Sebastian never guesses one.",
      "Argus reads Titan's published photo index live in the Album tab — borrowed for viewing, never copied into Argus storage and never graded by Argus.",
    ],
    rules: [
      "Completeness is scored /10 and requires the original photo with EXIF — a stripped or re-saved copy doesn't count.",
      "Read the coin, never the label: folder names and human descriptions are hints, not IDs.",
      "Unverifiable country or year = don't file; unverifiable denomination = best inference, flagged with honest confidence.",
      "Duplicates of common coins are cull candidates — log them and move on, don't escalate.",
    ],
  },
};
