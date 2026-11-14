/* Kin seed (Sebastian, 2026-11-14): the real household and family, from Joseph's own records
   (~/memory/people/{violet,dad,ms-cortes,uncle}.md; Anno 117 from the Games pillar dataset,
   Joseph's own words). Facts only — nothing inferred. Violet's relationship to Joseph is not
   stated in his records, so she is carried exactly as they carry her: household member.
   Ms. Cortes's first name is not stated in his records either, so she stays "Ms. Cortes".
   No birthdays are recorded for anyone, so none are seeded. Seeded once (peopleSeedV1) and
   only into an empty people list; after that the records are the user's to edit or remove. */
window.KIN_PEOPLE = [
  { name: "Violet", role: "household member", born: "", note: "TK student at Highlands Elementary (Saugus Union School District), in Ms. Cortes's TK class · her own bedroom and bathroom on the upper level at home" },
  { name: "Dad", role: "family", born: "", note: "Joseph's dad · co-uses the Titan Reliquary coin app with Joseph — kept in large type and high contrast for him · plays Anno 117 cross-play with Joseph (Joseph on PC, Dad on PS5)" },
  { name: "Uncle", role: "family", born: "", note: "Joseph's uncle · runs his own Muse instance · Joseph drafted him a handoff brief for an email spam/unsubscribe agent" },
  { name: "Ms. Cortes", role: "school contact", born: "", note: "Violet's TK teacher at Highlands Elementary · Joseph's school contact for Violet, in touch by email and ParentSquare" },
];
window.KIN_ITEMS = [
  { title: "Parent-teacher conference with Ms. Cortes (virtual)", kind: "school", who: "Violet", date: "2026-11-16", time: "" },
];
