/* Selling draft pipeline (Sebastian, 2026-11-14): Joseph's real Marketplace draft batch of
   2026-10-14 (MLT-001..004), carried into the pillar as data. Every figure is a DRAFT ask band
   from those drafts — nothing here is listed or published, and no condition, brand or model is
   asserted: the drafts themselves say condition is unknown until photos and facts arrive.
   Channel rule from the drafts: Facebook Marketplace, SHIPPING ONLY, no local pickup
   (Frazier Park, CA 93225). Goal context: the $20,000 payoff target; the Citi Flex payment of
   $952.19/mo is shown for pace only. */
window.SELLING_PIPELINE = {
  goal: {
    target: 20000,
    draftLow: 200,
    draftHigh: 430,
    monthlyPayment: 952.19,
    paymentLabel: "Citi Flex payment",
    source: "Draft estimates from listing batch 2026-10-14 — ask bands, not listings. Laptop unit count is unknown and is the biggest variable.",
    channel: "Facebook Marketplace · shipping only, no local pickup · Frazier Park, CA 93225",
  },
  skus: [
    {
      sku: "MLT-001",
      seedTitle: "17.3\" laptops — BLOCKED: wipe drives first; count & models TBD",
      title: "17.3\" laptops — count & models TBD",
      band: "$110–$220 per unit",
      low: 110,
      state: "blocked",
      blocker: "Drives must be wiped before any listing. Unit count, brands/models and boot test still unknown.",
    },
    {
      sku: "MLT-002",
      seedTitle: "Motorcycle gear — BLOCKED: pieces unidentified; crashed helmets never listed",
      title: "Motorcycle gear — pieces TBD, split per piece once identified",
      band: "$15–$180 per piece",
      low: 15,
      state: "blocked",
      blocker: "Pieces, brands and sizes unidentified. A helmet with any crash history is never listed — safety, not just policy.",
    },
    {
      sku: "MLT-003",
      seedTitle: "Quick-access vault — BLOCKED: brand, lock & keys unverified",
      title: "Quick-access vault / pistol safe",
      band: "$60–$85",
      low: 60,
      state: "blocked",
      blocker: "Brand, lock type and keys unverified; confirm it opens reliably and ships (under ~70 lbs).",
    },
    {
      sku: "MLT-004",
      seedTitle: "Full-size safe — PARKED: ships only if under ~70 lbs",
      title: "Full-size safe",
      band: "no draft price",
      low: 0,
      state: "parked",
      blocker: "PARKED — a full-size safe is not shippable under the shipping-only rule. Weigh it: it can ship only if under ~70 lbs, otherwise it stays out of this lane.",
    },
  ],
};
