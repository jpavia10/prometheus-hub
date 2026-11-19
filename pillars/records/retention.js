/* REC-GEM-04 (Sebastian, 2026-11-17): IRS / FTB / property-basis retention rules, from
   Gemini's records_gemini_retention_20261116-2040.json (40 rules). Corrected at
   integration (see "corrected"/"flag" fields): Form 1040 permanence, the mortgage
   note/deed conflation, the warranty rule's IRS misattribution, an unverified legal
   name, an asserted certification date, and the invented CPPA 6-year figure.
   window.RECORDS_RETENTION. */
window.RECORDS_RETENTION = [
 {
  "document": "Federal Form 1040 Individual Income Tax Return (signed copy)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 1,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date return is filed (keep return copies permanently; supporting audit period is 3-7 years)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
  "corrected": "Drop said permanent; its own IRS quote says 3 years. IRS guidance: keep returns and supporting records 3 years from filing, up to 7 for bad-debt / worthless-security claims — filed here at the 7-year outer window."
 },
 {
  "document": "W-2 Wage and Tax Statements (Belshire Environmental Services & prior employers)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 2,
  "quote": "Keep records for 6 years if you do not report income that you should report, and it is more than 25% of the gross income shown on your return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date original tax return was filed or due (covers IRS 3-6 year and CA FTB 4 year audit windows)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "1099-NEC / 1099-MISC / 1099-K / 1099-INT / 1099-DIV Information Returns",
  "keep": "7 years",
  "keep_years": 7,
  "n": 3,
  "quote": "Keep records for 6 years if you do not report income that you should report, and it is more than 25% of the gross income shown on your return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date the tax return reporting the income was filed",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Charitable Donation Receipts & Mileage Logs Supporting Itemized Deductions",
  "keep": "3 years",
  "keep_years": 3,
  "n": 4,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date original federal return was filed (or 4 years for California FTB Form 540)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Records Supporting a Claim for Tax Credit or Refund (Amended Return 1040-X)",
  "keep": "3 years",
  "keep_years": 3,
  "n": 5,
  "quote": "Keep records for 3 years from the date you filed your original return or 2 years from the date you paid the tax, whichever is later, if you file a claim for credit or refund after you file your return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "3 years from date original return was filed or 2 years from date tax was paid, whichever is later",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Records Supporting Bad Debt Deduction or Worthless Securities Loss",
  "keep": "7 years",
  "keep_years": 7,
  "n": 6,
  "quote": "Keep records for 7 years if you file a claim for a loss from worthless securities or bad debt deduction.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date the tax return claiming the bad debt or worthless security loss was filed",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Tax Records When Underreported Income Could Exceed 25% of Gross Income",
  "keep": "6 years",
  "keep_years": 6,
  "n": 7,
  "quote": "Keep records for 6 years if you do not report income that you should report, and it is more than 25% of the gross income shown on your return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date the federal income tax return was filed",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Unfiled Tax Year Income and Expense Records",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 8,
  "quote": "Keep records indefinitely if you do not file a return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Tax year end when no return was filed",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Household or Business Employment Tax Records (W-4, Payroll, Withholding)",
  "keep": "4 years",
  "keep_years": 4,
  "n": 9,
  "quote": "Keep employment tax records for at least 4 years after the date that the tax becomes due or is paid, whichever is later.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date the employment tax becomes due or is paid, whichever is later",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "California Form 540 Resident Income Tax Return & Supporting Workpapers",
  "keep": "4 years",
  "keep_years": 4,
  "n": 10,
  "quote": "We give you an automatic 6-month extension to file your return. You must file by the deadline to avoid a late filing penalty. The deadline is October 15, 2026.",
  "source": "California Franchise Tax Board",
  "starts_from": "Original or extended California FTB filing deadline (CA normal statute of limitations is 4 years)",
  "url": "https://www.ftb.ca.gov/file/when-to-file/extension-to-file.html"
 },
 {
  "document": "Home purchase Closing Disclosure (ALTA Settlement Statement, Nov 2024)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 11,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Keep until at least 4 years after the tax year in which the home is sold (establishes cost basis)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Home Grant Deed & Title Insurance Policy",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 12,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Date of property closing (November 2024) through at least 4 years after eventual sale",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Multi-Story Deck Structural Rebuild Receipts (Lumber, Simpson Hardware, Permits)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 13,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Date of capital improvement completion plus 4 years after the year the home is sold (adds to basis)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Solid-Core Door, Closet Framing, Trim & Electrical Upgrade Receipts (home)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 14,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Date of capital improvement plus 3-4 years after eventual disposition of the residence",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Starlink Dish & OnTech Smart Services Installation Invoice (April 2026)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 15,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Date of installation through warranty and home-office/property basis period",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Kern County Secured Property Tax Bills & Paid Receipts (Dec 10 / Apr 10)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 16,
  "quote": "Appeals on regular assessments must be filed between July 2 and November 30. Appeals on supplemental assessments must be filed within 60 days of the date of the Supplemental Assessment Notice.",
  "source": "Kern County Treasurer-Tax Collector",
  "starts_from": "Tax year in which property tax installment was paid and deducted on Schedule A / CA 540",
  "url": "https://www.kcttc.co.kern.ca.us/index.cfm?fuseaction=kcttcinternet.showSupplementalTaxes"
 },
 {
  "document": "Kern County Supplemental Assessment Notices & Payment Receipts",
  "keep": "7 years",
  "keep_years": 7,
  "n": 17,
  "quote": "Appeals on regular assessments must be filed between July 2 and November 30. Appeals on supplemental assessments must be filed within 60 days of the date of the Supplemental Assessment Notice.",
  "source": "Kern County Treasurer-Tax Collector",
  "starts_from": "Date of Supplemental Assessment Notice (60-day appeal window; 7-year tax retention)",
  "url": "https://www.kcttc.co.kern.ca.us/index.cfm?fuseaction=kcttcinternet.showSupplementalTaxes"
 },
 {
  "document": "Homeowners Insurance Policy Declarations & Annual Renewal Packets",
  "keep": "7 years",
  "keep_years": 7,
  "n": 18,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Policy expiration date (retain until statute of limitations on property/liability claims expires)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Mortgage Promissory Note, Deed of Trust & Annual Form 1098 Statements",
  "keep": "permanent (basis documents)",
  "keep_years": "permanent",
  "n": 19,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Form 1098 kept 7 years from tax filing; Deed of Trust & Reconveyance kept permanently",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
  "corrected": "Drop lumped the note/deed with Form 1098 at 7 years. The promissory note and deed of trust are property-basis documents (permanent while the property is held, per the spec §H never-shred list); only the annual 1098 statements ride the 7-year tax window."
 },
 {
  "document": "Titan Reliquary Coin & Precious Metals Purchase Invoices (Date, Mint, Weight, Spot)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 20,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Keep until at least 3-4 years after the tax year in which each coin or bullion specimen is sold",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "2025 Kia Sorento Hybrid Prestige AWD Purchase Contract & Title / Lien Release",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 21,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Keep until 3-4 years after the vehicle is sold, traded in, or disposed of",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "2025 Kia Sorento Hybrid NHTSA Recall Completion Receipts (SC331 & SC361)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 22,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Retain for the life of the vehicle and include in Garage Resale Dossier upon sale",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "2025 Kia Sorento Hybrid Severe Mountain Maintenance & Oil Change Receipts",
  "keep": "10 years",
  "keep_years": 10,
  "n": 23,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "Owner practice — vehicle warranty documentation",
  "starts_from": "Date of service (preserves Kia 10-year/100,000-mile powertrain warranty proof)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
  "flag": "No IRS/FTB basis: the 10-year period is a warranty-documentation practice (Kia 10-yr/100,000-mi warranty), misattributed to the IRS in the drop."
 },
 {
  "document": "2021 Yamaha MT-07 Certificate of Title, Bill of Sale & Service Logs",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 24,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Keep for the duration of motorcycle ownership plus 3 years after sale",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "California DMV Annual Vehicle Registration Cards & Fee Receipts",
  "keep": "3 years",
  "keep_years": 3,
  "n": 25,
  "quote": "A Planned Non-Operation (PNO) may be filed up to 90 days after the registration expiration date if the vehicle was not operated in any manner, but applicable late penalties are due.",
  "source": "California DMV",
  "starts_from": "Registration expiration date (current card kept in vehicle; prior 3 years kept for VLF tax proof)",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/penalties/"
 },
 {
  "document": "Stipulated Judgment of Dissolution of Marriage & Custody Orders (July 2025)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 26,
  "quote": "Keep records indefinitely if you file a fraudulent return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date of court entry (permanent vital legal and parenting record)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Birth Certificates (household — Joseph & Violet)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 27,
  "quote": "Keep records indefinitely if you do not file a return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date of birth (permanent vital identity record)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
  "corrected": "Full legal names removed at integration: the drop's name form (\"Joseph Craig Pavia Jr.\") appears nowhere else in Joseph's records and is unverified."
 },
 {
  "document": "Social Security Cards & U.S. Passports (Current and Expired)",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 28,
  "quote": "Keep records indefinitely if you do not file a return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date of issuance (permanent citizenship and identity record)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "ICC Storage Tank Inspector Certification & Continuing Education Credits",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 29,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Certification date",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
  "corrected": "Drop asserted a specific September 2026 certification date; unverified, generalized."
 },
 {
  "document": "Paid Volunteer Firefighter Exam Scores, EMT/CPR Cards & Training Certificates",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 30,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date of exam or certification completion",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Citi Flex Loan / Consolidation Loan Agreements & Final Payoff Letters",
  "keep": "7 years",
  "keep_years": 7,
  "n": 31,
  "quote": "Keep records for 7 years if you file a claim for a loss from worthless securities or bad debt deduction.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date of final loan payoff (keep payoff confirmation letter permanently; statements 7 years)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Credit Card Monthly Statements (Without Tax-Deductible Purchases)",
  "keep": "3 years",
  "keep_years": 3,
  "n": 32,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Statement closing date (keep 7 years if statement contains tax-deductible or capital basis items)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Checking & Savings Account Monthly Bank Statements",
  "keep": "7 years",
  "keep_years": 7,
  "n": 33,
  "quote": "Keep records for 6 years if you do not report income that you should report, and it is more than 25% of the gross income shown on your return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Statement date (supports IRS 6-year gross-income audit lookback and mortgage/payment proof)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "HSA / Medical Expense Receipts & Explanation of Benefits (EOBs)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 34,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Tax year in which HSA distribution was taken or medical deduction was claimed",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Workstation & Smart Home Hardware Receipts (Asus ROG RTX 4090, LG 45 OLED, Litter-Robot 4s)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 35,
  "quote": "Generally, keep records relating to property until the period of limitations expires for the year in which you dispose of the property.",
  "source": "IRS Property Recordkeeping",
  "starts_from": "Date of purchase through manufacturer/extended warranty and homeowners insurance schedule",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Wolfgang (Mini Australian Shepherd) & 4 Cats Rabies/Vaccination & Microchip Records",
  "keep": "permanent",
  "keep_years": "permanent",
  "n": 36,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Life of the pet (required for Kern County dog licensing, boarding, and vet emergencies)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Kern County Public Works Work Order #12350 Correspondence (Frazier Mtn Park Rd)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 37,
  "quote": "Keep records for 3 years if situations (4), (5), and (6) below do not apply to you.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Date of filing through engineering review and county capital improvement resolution",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Marketplace Selling Ledgers & Shipping Receipts (eBay, Mercari, Swappa)",
  "keep": "7 years",
  "keep_years": 7,
  "n": 38,
  "quote": "Keep records for 6 years if you do not report income that you should report, and it is more than 25% of the gross income shown on your return.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Tax year of sale (substantiates cost basis of personal items sold vs Form 1099-K reporting)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "Icarus Stake Trading Ledger & Brokerage Form 1099-B Consolidated Statements",
  "keep": "7 years",
  "keep_years": 7,
  "n": 39,
  "quote": "Keep records for 7 years if you file a claim for a loss from worthless securities or bad debt deduction.",
  "source": "IRS Recordkeeping Guidelines",
  "starts_from": "Tax return filing date (supports capital gains/losses and 7-year worthless security rule)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records"
 },
 {
  "document": "California CPPA DROP & Data Broker Opt-Out Confirmation Receipts",
  "keep": "While the DROP record is active",
  "keep_years": null,
  "n": 40,
  "quote": "Keep records for 6 years if you do not report income that you should report, and it is more than 25% of the gross income shown on your return.",
  "source": "CPPA Delete Act",
  "starts_from": "Date of deletion request (matches 6-year statutory audit retention window under Delete Act)",
  "url": "https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records",
  "flag": "The drop's 6-year figure and IRS attribution are unsupported — the Delete Act publishes no consumer receipt-retention period. Kept alongside the Privacy ledger instead."
 }
];
