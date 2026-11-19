/* Continuity binder seed (Sebastian, 2026-11-14): the emergency binder rebuilt from Joseph's
   real records — ~/MEMORY.md, ~/USER.md, ~/memory/people/{violet,dad,uncle,ms-cortes}.md, and
   the hub's own pillar data. Locators and facts only. A section is "ready" only where a record
   backs the whole locator chain; anything the records don't hold is written into the section
   itself as "not recorded yet" — an honest gap list is a feature of a real binder.
   NEVER seeded here: credential values, codes, the California DROP ID, and Joseph's phone
   number (the binder notes it is held in phone contacts, by design). Seeded once
   (binderSeedV1); the old fabricated template rows are migrated out in app.js, and after
   seeding the binder is the user's to edit. */
window.CONTINUITY_BINDER = [
  { id: "cs-home", name: "Home — Frazier Park", status: "partial", locator: "Frazier Park, CA 93225, rural mountain town · second-floor deck project underway; blueprint (Rev 7) archived on Google Drive → Sebastian/ · deed & title location: not recorded yet" },
  { id: "cs-household", name: "Household — Violet", status: "ready", locator: "Violet, household member — her own bedroom & bathroom on the upper level · TK student at Highlands Elementary (see School — Highlands Elementary)" },
  { id: "cs-vehicles", name: "Vehicles — Sorento & MT-07", status: "ready", locator: "2025 Kia Sorento Hybrid + 2021 Yamaha MT-07 · Kia Finance account ending 5450 · Kia Connect Call Center 844-886-9411 · full service records in the Garage pillar" },
  { id: "cs-kin", name: "Key People & Kin Handoff", status: "partial", locator: "Dad — co-uses the Titan Reliquary collection app with Joseph · Uncle — runs his own Muse instance · their names & phone numbers: not recorded yet · Joseph's own number is held in phone contacts (not printed in the binder, by design)" },
  { id: "cs-school", name: "School — Highlands Elementary", status: "ready", locator: "Highlands Elementary, Saugus Union School District · Violet's TK teacher Ms. Cortes — reach her via ParentSquare or school email · school office (661) 294-5320 · parent-teacher conference booked Mon Nov 16, 2026 (virtual)" },
  { id: "cs-identity", name: "Identity & Vital Facts", status: "partial", locator: "Joseph Pavia · born April 16, 1992 · locations of passport, ID & birth certificate: not recorded yet" },
  { id: "cs-money", name: "Money & Loan Locators", status: "partial", locator: "Citi Flex Loan (Plan 4, debt consolidation) tracked in the Midas Ledger + Money pillar · bank statements, CPA & tax preparer: not recorded yet" },
  { id: "cs-digital", name: "Digital Estate & Fleet Locators", status: "ready", locator: "Google Drive → Sebastian/ is the system of record · fleet keys file “API KEYS….txt” in the Drive Fleet folder — locator only, values live in the Secure Vault · GitHub jpavia10: prometheus-hub, titan-reliquary-preview, midas-ledger · Sylade shared fleet account exists — credentials in the Secure Vault" },
  { id: "cs-evac", name: "Evacuation & Go-Bag", status: "partial", locator: "“Bugout gear” list in Google Tasks · readiness detail in the Bastion pillar · evacuation route & pet arrangements: not recorded yet" },
  { id: "cs-medical", name: "Medical Directives, Allergies & Rx", status: "missing", locator: "Not recorded yet — no directives, allergies or prescriptions anywhere in Joseph's records; health is self-managed" },
];
