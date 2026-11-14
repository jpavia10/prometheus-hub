/* Odyssey real dataset (Sebastian, 2026-11-14): Joseph's own trips, routes and places,
   mined from his ChatGPT export (user_text.json, messages 2023-01..2026-11) plus the
   Garage pillar's route presets. Shipped data is read-only truth, Games-style; the one
   dated trip is seeded once into prometheus.odyssey.trips (see app.js, flag tripsSeedV1).
   Evidence discipline: only what his own words support. Pairings between a Garage preset
   distance and a destination are marked inferred:true — the distance is his preset, the
   destination is his stated regular run, and the fit is the inference. */
window.ODYSSEY_DATA = {
  home: {
    name: "Frazier Park, CA 93225",
    lat: 34.82057,
    lon: -118.94543,
    notes: [
      "Home base in the mountains. He got here by way of Michigan → North Hollywood → Tujunga → Fillmore (his words, Feb 2026).",
      "Away pattern: when he is not home he is usually 45+ minutes from the mountains, so the house has to be right before he leaves.",
      "Driving load: about 40,000 miles a year (Aug 2025). On school-run days the school run plus commute stacked to 4–5.5 hours of driving (May 2026).",
      "When family comes from out of town, the trails near home are the hike (Dec 2024).",
    ],
  },
  routes: [
    { miles: 84, label: "Round trip · 84 mi", dest: "Bakersfield", inferred: true,
      note: "Garage preset. Bakersfield is his expensed errand and inspection run down the Grapevine (covering inspections there Jun 2025; an expensed-miles Saturday run Nov 2025) — the round trip that fits." },
    { miles: 116, label: "Round trip · 116 mi", dest: "Rosamond via SR-14", inferred: true,
      note: "Garage preset. His commute range in his words (Aug 2025): 'SR-14 to Rosamond, but sometimes take 138' — the 116 round trip fits that run." },
    { miles: 28, label: "Round trip · 28 mi", dest: "Pine Mountain Club", inferred: true,
      note: "Garage preset. Pine Mountain Club, up Cuddy Valley, is his local turn-around (ride loop, May 2025) — the 28 round trip fits." },
    { miles: 100, label: "The home loop · ~100 mi", dest: "Frazier Park → Maricopa → Frazier Park", inferred: false,
      note: "His own step-by-step motorcycle loop (May 2025, '100 miles about 3 hours'): Frazier Mountain Park Rd → Cuddy Valley → Pine Mountain Club → Hudson Ranch Rd → Klipstein Canyon → SR-166 to Maricopa → SR-33 → Lockwood Valley Rd → home." },
  ],
  places: [
    { name: "Manila, Philippines", kind: "trip",
      note: "Two trips in his messages: a first visit (date not stated) and Aug 30 – Sep 9, 2024. Hotel Okura on arrival, the BGC residences after El Nido, Intramuros, Makati / Greenbelt, Mall of Asia. His partner is based in Iloilo; in Feb 2026 he said he needs to visit again this year — no dates set." },
    { name: "El Nido, Palawan", kind: "trip",
      note: "Sep 2–6, 2024, inside the Manila trip: Tour A (Big Lagoon, Small Lagoon, Secret Lagoon, Shimizu Island, 7 Commando Beach), the canopy walk, the zipline, Nagkalit-kalit Falls, and a rented motorbike. Siargao and Boracay were the alternatives he weighed in Jul 2024." },
    { name: "Bakersfield, CA", kind: "regular run",
      note: "Recurring work and errand run: covering a coworker's inspections there (Jun 2025), and a Saturday run he expensed the miles on to finish the mudroom flooring (Nov 2025)." },
    { name: "I-5 · Castaic – Santa Clarita", kind: "regular run",
      note: "His daily commute and inspection corridor (Aug 2025): 'I-5 I take it everyday… I don't go more south than the 5/14 interchange.' Monthly inspections take him all over it, Pyramid Lake included." },
    { name: "Rosamond via SR-14", kind: "regular run",
      note: "The northern end of his commute range, SR-14 north past Lancaster (Aug 2025), SR-138 as the alternate." },
    { name: "Pine Mountain Club, CA", kind: "local",
      note: "The mountain community up Cuddy Valley — waypoint on the home loop and the near end of his 28-mile round trip." },
    { name: "Maricopa via SR-166", kind: "local",
      note: "Western turn-around of the motorcycle loop, out Hudson Ranch Rd to the 166 (May 2025)." },
    { name: "Los Angeles, CA", kind: "family visits",
      note: "Planning his uncle's LA visit (Nov 2024): downtown museums and a hole-in-the-wall seafood shack on PCH." },
    { name: "Michigan", kind: "past home",
      note: "Home until about 2016 — then North Hollywood, Tujunga, Fillmore, and Frazier Park (his words, Feb 2026). His 248 mobile number is a Michigan number." },
  ],
  seedTrips: [
    { id: "seed-philippines-2024",
      name: "Manila & El Nido — Philippines",
      dest: "Manila and El Nido, Philippines",
      start: "2024-08-30", end: "2024-09-09",
      cold: false, rain: false, beach: true, work: false, car: false, kids: false,
      notes: "His second trip to Manila, to visit his partner. Out of LAX late Aug 30, landed Manila Sep 1; Hotel Okura first, El Nido Sep 2–6 (Tour A, canopy walk, zipline, Nagkalit-kalit Falls), back to the BGC residences Sep 7, out of NAIA on the Sep 9 flight. Rebuilt from his own planning and in-trip messages, Jul–Sep 2024; he confirmed it after: 'I already went to see her in Philippines this sept.'" },
  ],
};
