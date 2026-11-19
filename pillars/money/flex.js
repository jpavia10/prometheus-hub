/* MID-GEM-09 (Sebastian, 2026-11-17): Citi Flex Plan rules + implied-APR traps,
   window.MONEY_FLEX. Spine: Gemini's midas_gemini_flex-terms_20261116-2040.json
   (15 unique topics), row-level merged with the 1930 drop (the merchant-refund trap
   the money spec §E.4 prioritizes, added as row 16). Two 2040 rows corrected at
   integration (see their "corrected" notes): row 7's invented fee range struck,
   row 15's APR figures replaced with this pillar's verified book (real.js). */
window.MONEY_FLEX = [
 {
  "n": 1,
  "topic": "Two plan types under Citi Flex Plan",
  "rule": "Citi Flex Plan encompasses two distinct features on eligible Citi credit cards: Citi Flex Loan (a fixed-payment loan drawn against existing credit limit) and Citi Flex Pay (converting an eligible purchase into fixed monthly payments).",
  "quote": "Citi Flex Plan brings you two ways to pay over time using your existing credit line — Citi Flex Loan and Citi Flex Pay.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 2,
  "topic": "No separate credit application or hard inquiry",
  "rule": "Taking a Citi Flex Loan requires no credit application, no credit check, and no new account number because it uses a portion of the cardholder's existing credit limit.",
  "quote": "With a Citi Flex Loan, eligible cardmembers can borrow against their existing credit line with no credit inquiry and no application.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 3,
  "topic": "Fixed APR vs Monthly Plan Fee structure",
  "rule": "Depending on the targeted offer shown in Citi Online or the Citi Mobile App, a Flex Loan charges either a fixed APR or a fixed monthly plan fee with 0% APR, never both on the same loan.",
  "quote": "Pay a fixed APR or plan fee with predictable monthly payments and no origination fee.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 4,
  "topic": "Monthly payment added to Minimum Payment Due",
  "rule": "Each billing cycle, the fixed monthly Flex Plan installment (principal plus that month's plan fee or fixed APR interest) is added directly to the card's regular Minimum Payment Due.",
  "quote": "Your monthly Flex Plan payment is added to your minimum payment due each billing cycle.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 5,
  "topic": "Impact on available credit and credit utilization",
  "rule": "The full principal of a Citi Flex Loan immediately reduces available credit on the card and counts toward revolving credit utilization reported to credit bureaus until paid down.",
  "quote": "A Flex Loan uses a portion of your available credit line on your Citi credit card.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 6,
  "topic": "Minimum loan amount and repayment durations",
  "rule": "Citi Flex Loans require a minimum borrow amount of $500 up to the eligible portion of the credit limit, with fixed repayment terms offered from 6 to 60 months.",
  "quote": "Choose a loan amount starting at $500 and select a repayment duration that works for you.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 7,
  "topic": "Flat monthly fee does not decline as principal shrinks",
  "rule": "When a Flex Plan uses a flat monthly plan fee, the fee is calculated on the ORIGINAL plan amount and does not decline as the principal shrinks — so the fee consumes a rising share of the remaining balance every month, and the plan's true cost is higher than the fee percentage suggests.",
  "quote": "The monthly plan fee is a fixed dollar amount based on the initial amount of the Flex Plan and the duration you select.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan",
  "corrected": "Gemini's precise fee range (0.69%–1.72% of original principal per month) appears nowhere in its own quoted source and was struck at integration; the structural trap (flat fee on original principal) is the documented part."
 },
 {
  "n": 8,
  "topic": "Early payoff allowed with no prepayment penalty",
  "rule": "Cardholders can pay off a Citi Flex Loan or Flex Pay balance early at any time without a prepayment penalty, and any unearned future monthly plan fees for remaining full billing cycles are not charged.",
  "quote": "There is no prepayment penalty if you pay off your Flex Plan early.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 9,
  "topic": "Payment allocation above Minimum Payment Due (CARD Act rule)",
  "rule": "Under federal CARD Act payment allocation rules, any amount paid above the total Minimum Payment Due is applied to the balance with the highest APR first, which may go to standard purchases before a lower-APR Flex Loan.",
  "quote": "If you pay more than the minimum payment, the card issuer must apply the excess amount to the balance with the highest interest rate first.",
  "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/"
 },
 {
  "n": 10,
  "topic": "Preserving grace period on new regular card purchases",
  "rule": "To avoid trailing interest on new standard credit card purchases while carrying an active Flex Plan, the cardholder must pay the 'Interest Saving Balance' (new purchases plus the monthly Flex installment) by the due date.",
  "quote": "Pay the Interest Saving Balance shown on your statement each month to avoid interest on new purchases while paying off your Flex Plan over time.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 11,
  "topic": "Fund disbursement methods (direct deposit vs check)",
  "rule": "Approved Citi Flex Loan funds can be transferred via direct deposit to a linked U.S. bank account in as little as 1–2 business days or mailed as a paper check within approximately 5–7 business days.",
  "quote": "Receive funds in as little as 1-2 business days when you choose direct deposit into an eligible bank account, or receive a check by mail.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 12,
  "topic": "Ineligibility to pay another Citi account directly",
  "rule": "Citi Flex Loan proceeds cannot be used to directly pay a balance on the same Citi card, though funds deposited into an external checking account can be used by the borrower to pay off higher-APR third-party debts.",
  "quote": "Flex Loan funds may be deposited into a linked bank account or sent by check.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 13,
  "topic": "No rewards or points earned on Flex Loans",
  "rule": "Citi Flex Loans do not count as purchases and do not earn Citi ThankYou Points, cash back, or airline miles, whereas an eligible purchase converted to Citi Flex Pay retains the rewards earned on the original purchase.",
  "quote": "Flex Loans are not purchases and do not earn rewards, points, or miles.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 14,
  "topic": "Missed payment and Penalty APR consequences",
  "rule": "If a cardholder misses the Minimum Payment Due (which includes the Flex installment), late fees apply and the account may lose promotional eligibility or trigger the card's Penalty APR under the Cardmember Agreement.",
  "quote": "If you do not pay at least the minimum payment due on time, late fees may apply and your account terms may be affected.",
  "url": "https://www.citi.com/credit-cards/citi-flex-plan"
 },
 {
  "n": 15,
  "topic": "Implied APR verification on $20,000 / 24-month quote",
  "rule": "Back out the implied APR from the payment before accepting any Flex offer. This pillar's own book (real.js, Plan 4): $20,000 over 24 months at $952.19/mo. A textbook 11.99% APR amortization would be $941.38/mo — the actual payment implies ≈13.14% APR. The stated rate is not the whole cost.",
  "quote": "An annual percentage rate (APR) is the yearly rate charged for borrowing, expressed as a percentage that represents the actual yearly cost of funds over the term of a loan. (CFPB)",
  "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/",
  "corrected": "Gemini's row claimed 13.20% implied and $941.36 textbook; the hub's verified book figures are 13.14% and $941.38 (real.js). Gemini's numbers were replaced with the book's."
 },
 {
  "n": 16,
  "topic": "Merchant refund handling (Flex Pay trap)",
  "rule": "A merchant refund posts as a general account credit — it does NOT automatically reduce the active Flex Pay plan balance unless the cardmember calls Citi customer service and asks for the credit to be applied to the plan. Left alone, you keep paying the plan (and its fee) on money the merchant already returned.",
  "quote": "From Gemini's 1930 flex-terms drop (merchant refund handling), sourced to Citi's Flex Pay guide; the money spec §E.4 names this the documented-but-unsurfaced trap.",
  "url": "https://www.citi.com/credit-cards/flex-pay-guide/what-is-citi-flex-pay"
 }
];
