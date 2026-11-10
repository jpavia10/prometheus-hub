/* Issuer reference (Sebastian, 2026-11-09): baked from research deliverables MID-GEM minimums + interest
   (25 issuers each: minimum-payment formulas and interest methods/grace periods, with source quotes in the
   deliverables). Reference only — formulas are the issuers' published rules as researched 2026-11. */
window.MONEY_ISSUERS = [
 {
  "issuer": "American Express",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Optima Card",
    "formula": "B < 40 ? B : min(B, max(40, 0.02*(B - F), 0.01*(B - I - F) + I) + F)",
    "floor_usd": 40,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "BMO",
  "interest": {
   "method": "average daily balance",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "BMO Consumer Credit Card (Platinum / Cash Back / Premium Rewards / Escape)",
    "formula": "B < 25 ? B : max(25, 0.02*B, 0.01*(B - I - F) + I + F)",
    "floor_usd": 25,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Bank of America",
  "interest": {
   "method": "average daily balance (including new Purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Royal Caribbean Visa Signature Credit Card",
    "formula": "B < 35 ? B : max(35, 0.01*(B - I - F) + I + F)",
    "floor_usd": 35,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Barclays",
  "interest": {
   "method": "daily balance",
   "daily": true,
   "grace_days": null
  },
  "minimums": [
   {
    "product": "Gap Inc. Cobrand / Standard Credit Card",
    "formula": "B < 30 ? B : max(30, 0.01*(B - I - F) + I + F)",
    "floor_usd": 30,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Capital One",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Capital One Pay Over Time / Venture X",
    "formula": "B < 25 ? B : max(25, 0.01*(B - I - F)) + I + F",
    "floor_usd": 25,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Chase",
  "interest": {
   "method": "daily balance (including new transactions)",
   "daily": true,
   "grace_days": 21
  },
  "minimums": [
   {
    "product": "United Club Visa Signature Card (COL00080)",
    "formula": "B < 40 ? B : max(40, 0.01*B + I + F)",
    "floor_usd": 40,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Citi",
  "interest": {
   "method": "daily balance (including current transactions)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Citi Pay Credit Card",
    "formula": "B < 30 ? B : max(30, 0.01*B + I + F)",
    "floor_usd": 30,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Citizens",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Citizens Bank Premier Cash Back Plus",
    "formula": "B <= 30 ? B : max(30, 0.01*B + I + F)",
    "floor_usd": 30,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Comenity/Bread",
  "interest": {
   "method": "daily balance",
   "daily": true,
   "grace_days": 23
  },
  "minimums": [
   {
    "product": "Comenity Bank World Mastercard",
    "formula": "B < 30 ? B : max(30, max(5, 0.01*(B - I)) + I)",
    "floor_usd": 30,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Credit One",
  "interest": {
   "method": "daily balance",
   "daily": true,
   "grace_days": 24
  },
  "minimums": [
   {
    "product": "Credit One Bank Wander American Express / Platinum Visa",
    "formula": "B < 30 ? B : min(B, max(30, 0.05*B) + F)",
    "floor_usd": 30,
    "pct_of_balance": 5
   }
  ]
 },
 {
  "issuer": "Discover",
  "interest": {
   "method": "daily balance (including current transactions)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Discover it Card",
    "formula": "B < 20 ? B : min(B, max(20, 0.03*(B - I - F), min(0.04*B, 15 + I + F)))",
    "floor_usd": 20,
    "pct_of_balance": 3
   }
  ]
 },
 {
  "issuer": "Fifth Third",
  "interest": {
   "method": "average daily balance (including new transactions)",
   "daily": true,
   "grace_days": 23
  },
  "minimums": [
   {
    "product": "Fifth Third Cash/Back, TRIO, and Truly Simple Credit Cards",
    "formula": "B < 35 ? B : max(35, 0.01*B + I + F)",
    "floor_usd": 35,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "First National",
  "interest": {
   "method": "Average Daily Balance (including new purchases)",
   "daily": true,
   "grace_days": 21
  },
  "minimums": [
   {
    "product": "First National Bank of Omaha (FNBO) Greenlight Family Cash Mastercard",
    "formula": "B < 40 ? B : max(40, 0.03*B)",
    "floor_usd": 40,
    "pct_of_balance": 3
   }
  ]
 },
 {
  "issuer": "Goldman Sachs/Apple Card",
  "interest": {
   "method": "daily balance (including new Transactions)",
   "daily": true,
   "grace_days": 28
  },
  "minimums": [
   {
    "product": "Apple Card",
    "formula": "B < 25 ? B : min(B, max(25, 0.01*B + I))",
    "floor_usd": 25,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Huntington",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 21
  },
  "minimums": [
   {
    "product": "Huntington Voice Credit Card",
    "formula": "B < 10 ? B : max(10, 0.02*B)",
    "floor_usd": 10,
    "pct_of_balance": 2
   }
  ]
 },
 {
  "issuer": "KeyBank",
  "interest": {
   "method": "average daily balance method (including new purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "KeyBank Laurel Road Student Loan Cashback Credit Card",
    "formula": "B < 30 ? B : max(30, 0.01*(B - I - F) + I + F)",
    "floor_usd": 30,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Navy Federal",
  "interest": {
   "method": "daily balance (including new transactions)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Navy Federal Platinum / cashRewards / More Rewards / Flagship",
    "formula": "B < 20 ? B : max(20, 0.01*(B - I - F) + I + F)",
    "floor_usd": 20,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "PNC",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 21
  },
  "minimums": [
   {
    "product": "PNC Spend Wise Consumer Credit Card",
    "formula": "B < 27 ? B : max(27, 0.01*B + I + F)",
    "floor_usd": 27,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Regions",
  "interest": {
   "method": "average daily balance (including new transactions)",
   "daily": true,
   "grace_days": 21
  },
  "minimums": [
   {
    "product": "Regions Visa Credit Card (Life, Prestige, Premium Signature, Explore)",
    "formula": "B < 15 ? B : max(15, 0.01*(B - I - F) + I + F)",
    "floor_usd": 15,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Synchrony",
  "interest": {
   "method": "daily balance",
   "daily": true,
   "grace_days": 23
  },
  "minimums": [
   {
    "product": "PayPal Cashback Mastercard",
    "formula": "B < 29 ? B : max(29, 0.01*B + I + F)",
    "floor_usd": 29,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "TD Bank",
  "interest": {
   "method": "Average Daily Balance (including Current Transactions)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "TD Double Up Credit Card",
    "formula": "B < 35 ? B : max(35, 0.01*B + I + F)",
    "floor_usd": 35,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Truist",
  "interest": {
   "method": "average daily balance (including new transactions)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Truist Enjoy Cash Credit Card",
    "formula": "B < 27 ? B : max(27, 0.01*B + I + F)",
    "floor_usd": 27,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "U.S. Bank",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": false,
   "grace_days": 24
  },
  "minimums": [
   {
    "product": "U.S. Bank Visa and Mastercard Classic, Gold and Platinum",
    "formula": "B < 40 ? B : max(40, 0.01*(B - I - F)) + I + F",
    "floor_usd": 40,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "USAA",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "USAA Credit Card",
    "formula": "B < 15 ? B : max(15, 0.01*B + I + F)",
    "floor_usd": 15,
    "pct_of_balance": 1
   }
  ]
 },
 {
  "issuer": "Wells Fargo",
  "interest": {
   "method": "average daily balance (including new purchases)",
   "daily": true,
   "grace_days": 25
  },
  "minimums": [
   {
    "product": "Wells Fargo Active Cash Visa Card",
    "formula": "B < 25 ? B : max(25, 0.01*B + I + F)",
    "floor_usd": 25,
    "pct_of_balance": 1
   }
  ]
 }
];
