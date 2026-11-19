/* The owner's REAL book (Joseph's direction, 2026-11-14: the hub privacy constraint is lifted —
   "I dont care about privacy i can always add a passcode"). Only figures Joseph has verified in
   chat live here; nothing is estimated, and no balance is invented.
   - Citi Flex Loan: requested 2026-11-04 on the Citi Double Cash ending 7601, activated
     2026-11-06 ("Your Citi Flex Plan is now active", Plan Number 4). Citi's activation email
     did NOT state when the funds land — this file never claims the deposit arrived.
   - The simulator carries BOTH models, labeled (standing rule): textbook amortization at
     11.99% APR vs the Flex Plan's actual payment, which is higher by the plan's structure.
   - The November payments below are history: Joseph confirmed "All paid" on 2026-11-12. */
window.MONEY_REAL = {
  loan: {
    name: "Citi Flex Loan",
    plan: "Plan Number 4",
    account: "Citi Double Cash ending 7601",
    purpose: "Debt consolidation",
    principal: 20000,
    apr: 11.99,
    term: 24,
    actualPayment: 952.19,
    totalPaid: 22852.56,
    textbookPayment: 941.38,
    activated: "2026-11-06",
    fundsNote: "Activated 2026-11-06. Citi's activation email did not state when the funds land, so no deposit date is shown.",
  },
  goal: {
    target: 20000,
    label: "$20,000 payoff goal",
    note: "Marketplace selling was the original payoff engine; the loan consolidated the balances, so the Flex Loan is now the payoff vehicle and this goal tracks it to zero.",
  },
  paid: [
    { label: "Bank of America — minimum payment", detail: "Due Nov 11 · statement balance was $13,571.59", amount: 782.00, status: "Paid" },
    { label: "Kia Finance", detail: "Due Nov 13", amount: 1133.31, status: "Paid" },
    { label: "Home Depot — payment posted", detail: "Posted Nov 10", amount: 300.00, status: "Paid" },
  ],
  paidNote: "Confirmed paid by Joseph on 2026-11-12. History, not upcoming.",
  autopays: [
    { label: "Capital One Savor ending 7317 — AutoPay minimum", detail: "Sat Nov 14", amount: null, amountNote: "amount not stated" },
    { label: "Chase Freedom Unlimited ending 4349 — AutoPay", detail: "Tue Nov 17", amount: 85.00, amountNote: "" },
  ],
  bills: [
    { name: "Starlink internet (100 Mbps)", amount: 55, cadence: "monthly", due: "", cuttable: false,
      note: "Downgraded 2026-11-10 from the ~$85/mo 200 Mbps tier — saves $30/mo. First $55 charge ran 2026-11-11, covering Nov 11 – Dec 10." },
  ],
};
