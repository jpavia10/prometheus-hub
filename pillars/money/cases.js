/* The 12 verified payoff cases from MID-GEM research (budgets, debts, methods). The engine in engine.js
   reproduces every case's payoff months and total interest (11 to the cent, 1 within a cent over 60 months);
   these are the simulator's built-in worked examples. All figures are SAMPLE research data. */
window.MONEY_CASES = [
 {
  "case": 1,
  "method": "avalanche",
  "budget": 900.0,
  "debts": [
   {
    "apr": 24.99,
    "balance": 4210.55,
    "min": 95.0,
    "name": "Card A"
   },
   {
    "apr": 18.49,
    "balance": 2850.0,
    "min": 65.0,
    "name": "Card B"
   }
  ]
 },
 {
  "case": 2,
  "method": "avalanche",
  "budget": 520.0,
  "debts": [
   {
    "apr": 26.99,
    "balance": 6400.0,
    "min": 150.0,
    "name": "Rewards Visa"
   },
   {
    "apr": 8.49,
    "balance": 9800.0,
    "min": 210.0,
    "name": "Auto Loan"
   },
   {
    "apr": 15.99,
    "balance": 4950.0,
    "min": 110.0,
    "name": "Personal Line"
   }
  ]
 },
 {
  "case": 3,
  "method": "avalanche",
  "budget": 1000.0,
  "debts": [
   {
    "apr": 29.99,
    "balance": 1468.21,
    "min": 100.0,
    "name": "Store Card"
   },
   {
    "apr": 21.49,
    "balance": 3200.0,
    "min": 90.0,
    "name": "Travel Card"
   },
   {
    "apr": 6.0,
    "balance": 420.0,
    "min": 150.0,
    "name": "Appliance Plan"
   },
   {
    "apr": 11.25,
    "balance": 4100.0,
    "min": 120.0,
    "name": "Credit Union Loan"
   }
  ]
 },
 {
  "case": 4,
  "method": "avalanche",
  "budget": 750.0,
  "debts": [
   {
    "apr": 24.49,
    "balance": 5800.0,
    "min": 135.0,
    "name": "Platinum Card"
   },
   {
    "apr": 9.99,
    "balance": 3100.0,
    "min": 75.0,
    "name": "Medical Plan"
   },
   {
    "apr": 21.99,
    "balance": 4600.0,
    "min": 110.0,
    "name": "Cashback Card"
   },
   {
    "apr": 13.75,
    "balance": 8900.0,
    "min": 195.0,
    "name": "Consolidation Loan"
   },
   {
    "apr": 17.5,
    "balance": 2400.0,
    "min": 65.0,
    "name": "Tire Financing"
   }
  ]
 },
 {
  "case": 5,
  "method": "snowball",
  "budget": 800.0,
  "debts": [
   {
    "apr": 12.0,
    "balance": 620.0,
    "min": 50.0,
    "name": "Dental Balance"
   },
   {
    "apr": 23.99,
    "balance": 1950.0,
    "min": 65.0,
    "name": "Retail Card"
   },
   {
    "apr": 18.99,
    "balance": 4800.0,
    "min": 120.0,
    "name": "Signature Visa"
   }
  ]
 },
 {
  "case": 6,
  "method": "snowball",
  "budget": 1200.0,
  "debts": [
   {
    "apr": 19.99,
    "balance": 420.0,
    "min": 55.0,
    "name": "Gadget Card"
   },
   {
    "apr": 10.0,
    "balance": 550.0,
    "min": 45.0,
    "name": "Clinic Bill"
   },
   {
    "apr": 22.49,
    "balance": 3400.0,
    "min": 95.0,
    "name": "Airline Card"
   },
   {
    "apr": 7.99,
    "balance": 6500.0,
    "min": 160.0,
    "name": "Used Car Note"
   }
  ]
 },
 {
  "case": 7,
  "method": "snowball",
  "budget": 680.0,
  "debts": [
   {
    "apr": 6.0,
    "balance": 850.0,
    "min": 35.0,
    "name": "Utility Arrears"
   },
   {
    "apr": 25.99,
    "balance": 2100.0,
    "min": 65.0,
    "name": "Department Card"
   },
   {
    "apr": 16.49,
    "balance": 4300.0,
    "min": 100.0,
    "name": "Credit Line"
   },
   {
    "apr": 20.99,
    "balance": 6900.0,
    "min": 155.0,
    "name": "Bank Card"
   },
   {
    "apr": 11.49,
    "balance": 11200.0,
    "min": 215.0,
    "name": "Home Repair Loan"
   }
  ]
 },
 {
  "case": 8,
  "method": "snowball",
  "budget": 1100.0,
  "debts": [
   {
    "apr": 8.0,
    "balance": 510.0,
    "min": 30.0,
    "name": "Vet Bill"
   },
   {
    "apr": 24.9,
    "balance": 1350.0,
    "min": 45.0,
    "name": "Hardware Card"
   },
   {
    "apr": 21.5,
    "balance": 2450.0,
    "min": 65.0,
    "name": "Fuel Card"
   },
   {
    "apr": 14.9,
    "balance": 3900.0,
    "min": 90.0,
    "name": "Laptop Loan"
   },
   {
    "apr": 19.4,
    "balance": 5600.0,
    "min": 130.0,
    "name": "Sapphire Card"
   },
   {
    "apr": 9.25,
    "balance": 8400.0,
    "min": 190.0,
    "name": "Truck Note"
   }
  ]
 },
 {
  "case": 9,
  "method": "custom",
  "budget": 850.0,
  "debts": [
   {
    "apr": 5.0,
    "balance": 2200.0,
    "min": 100.0,
    "name": "Family Loan"
   },
   {
    "apr": 22.99,
    "balance": 3800.0,
    "min": 110.0,
    "name": "Gold Card"
   },
   {
    "apr": 13.99,
    "balance": 1450.0,
    "min": 50.0,
    "name": "Credit Union Visa"
   }
  ]
 },
 {
  "case": 10,
  "method": "custom",
  "budget": 600.0,
  "debts": [
   {
    "apr": 10.5,
    "balance": 4500.0,
    "min": 110.0,
    "name": "Co-signed Note"
   },
   {
    "apr": 23.49,
    "balance": 7200.0,
    "min": 165.0,
    "name": "Everyday Visa"
   },
   {
    "apr": 15.25,
    "balance": 2600.0,
    "min": 70.0,
    "name": "Dental Loan"
   },
   {
    "apr": 18.75,
    "balance": 8100.0,
    "min": 175.0,
    "name": "Furniture Plan"
   }
  ]
 },
 {
  "case": 11,
  "method": "custom",
  "budget": 1250.0,
  "debts": [
   {
    "apr": 8.0,
    "balance": 600.0,
    "min": 80.0,
    "name": "Tax Installment"
   },
   {
    "apr": 27.99,
    "balance": 350.0,
    "min": 40.0,
    "name": "Promo Card"
   },
   {
    "apr": 19.99,
    "balance": 3100.0,
    "min": 85.0,
    "name": "Mastercard"
   },
   {
    "apr": 12.5,
    "balance": 1800.0,
    "min": 60.0,
    "name": "Personal Note"
   },
   {
    "apr": 9.75,
    "balance": 5400.0,
    "min": 135.0,
    "name": "Solar Loan"
   }
  ]
 },
 {
  "case": 12,
  "method": "custom",
  "budget": 1050.0,
  "debts": [
   {
    "apr": 11.9,
    "balance": 3200.0,
    "min": 95.0,
    "name": "Lease Buyout"
   },
   {
    "apr": 25.49,
    "balance": 1600.0,
    "min": 55.0,
    "name": "Cash Rewards"
   },
   {
    "apr": 16.25,
    "balance": 4400.0,
    "min": 115.0,
    "name": "Moving Loan"
   },
   {
    "apr": 28.99,
    "balance": 950.0,
    "min": 40.0,
    "name": "Store Charge"
   },
   {
    "apr": 14.2,
    "balance": 2750.0,
    "min": 75.0,
    "name": "Green Line"
   },
   {
    "apr": 8.9,
    "balance": 6100.0,
    "min": 150.0,
    "name": "Roofing Note"
   }
  ]
 }
];
