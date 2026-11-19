/* Records: the 21 tax forms for tax year 2026 that arrive in 2027, who sends each, the day it is due to you (weekend and holiday
   rolls applied: Jan 31 2027 is a Sunday, Feb 15 is Presidents' Day, May 31 is Memorial Day) and where it lands on Form 1040 and CA Form 540
   (Gemini 4 Neon, records_gemini_tax-forms_20261119-0922.json, REC-GEM-06; date rolls re-checked by Claude). */
window.RECORDS_TAX_FORMS = [
 {
  "n": 1,
  "form": "W-2",
  "sender": "Employer",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 1040, line 1a (wages, Box 1); line 25a (federal tax withheld, Box 2)",
  "feeds_540": "Form 540, line 12 (state wages, Box 16); line 71 (CA tax withheld, Box 17); Schedule CA (540), Part I, Section A, line 1a / 1h",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/pub/irs-pdf/iw2w3.pdf",
  "quote": "Caution: Even if you request and are granted an extension of time to file Forms W-2, you must still furnish Forms W-2 to your employees by February 1, 2027."
 },
 {
  "n": 2,
  "form": "W-2G",
  "sender": "Payer of gambling winnings (casino, lottery, racetrack, or gaming establishment)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule 1 (Form 1040), Part I, line 8b (gambling income) -> Form 1040, line 8; Form 1040, line 25c (federal tax withheld)",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 15); Schedule CA (540), Part I, Section B, line 8b (CA lottery winnings subtracted in col. B)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "W-2G ... To recipient (unless indicated otherwise): January 31. If any filing or furnishing due date specified in these instructions falls on a Saturday, Sunday, or a legal holiday in the District of Columbia or where the return is to be filed, the filing or furnishing will be considered timely if it is completed on the next day that is not a Saturday, Sunday, or a legal holiday."
 },
 {
  "n": 3,
  "form": "1099-INT",
  "sender": "Bank, credit union, brokerage, or other payer of interest income",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 1040, line 2a (tax-exempt interest) and line 2b (taxable interest); Schedule B (Form 1040), Part I (if over $1,500); Form 1040, line 25b (withholding)",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 17); Schedule CA (540), Part I, Section A, line 2 (U.S. Treasury interest subtracted in col. B; non-CA muni interest added in col. C)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-INT ... To recipient (unless indicated otherwise): January 31** (** The due date is March 15 for reporting by trustees and middlemen of WHFITs.)"
 },
 {
  "n": 4,
  "form": "1099-DIV",
  "sender": "Brokerage, mutual fund, or corporation paying dividends and distributions",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 1040, line 3a (qualified dividends) and line 3b (ordinary dividends); Schedule B (Form 1040), Part II (if over $1,500); Schedule D (Form 1040), line 13 (capital gain distributions)",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 16); Schedule CA (540), Part I, Section A, line 3 (adjustments if applicable)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-DIV ... To recipient (unless indicated otherwise): January 31** (** The due date is March 15 for reporting by trustees and middlemen of WHFITs.)"
 },
 {
  "n": 5,
  "form": "1099-B",
  "sender": "Broker or barter exchange",
  "furnish_by": "2027-02-16",
  "feeds_1040": "Form 8949 -> Schedule D (Form 1040) -> Form 1040, line 7a (capital gain or loss)",
  "feeds_540": "Form 540, line 13 (via federal AGI); Schedule D (540) -> Schedule CA (540), Part I, Section A, line 7a (if California basis or carryover differs)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "The specific due date for furnishing statements to recipients for Forms 1099-B, 1099-DA, 1099-S, and 1099-MISC (if amounts are reported in boxes 8 or 10) is February 15 of the year following the calendar year for which you are furnishing the form."
 },
 {
  "n": 6,
  "form": "1099-NEC",
  "sender": "Client or business payer of nonemployee compensation",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule C (Form 1040), line 1 -> Schedule 1 (Form 1040), Part I, line 3 -> Form 1040, line 8 (and Schedule SE)",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 5); Schedule CA (540), Part I, Section B, line 3 (if CA business income/depreciation or worker classification differs)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-NEC ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 7,
  "form": "1099-MISC",
  "sender": "Business or payer of miscellaneous income (rents, royalties, prizes/awards, other income)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule E (Form 1040) (rents/royalties), Schedule C (business), or Schedule 1 (Form 1040), Part I, line 8z (prizes/other income) -> Form 1040, line 8",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 16); Schedule CA (540), Part I, Section B, line 5 or line 8z (if CA adjustments apply)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-MISC ... To recipient (unless indicated otherwise): January 31** (February 15** for Substitute dividends and tax-exempt interest payments reportable by brokers and Gross proceeds paid to attorneys)"
 },
 {
  "n": 8,
  "form": "1099-K",
  "sender": "Payment settlement entity (PSE) or third-party settlement organization (TPSO)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule 1 (Form 1040), top entry line (if reported in error or personal items sold at a loss); otherwise Schedule C, Schedule D / Form 8949, or Schedule E depending on transaction",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 8); Schedule CA (540), Part I, Section B, line 3 or line 8z (if CA adjustments apply)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-K ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 9,
  "form": "1099-R",
  "sender": "Retirement plan administrator, IRA custodian/trustee, pension payer, or insurer",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 1040, lines 4a and 4b (IRA distributions) or lines 5a and 5b (pensions and annuities); Form 1040, line 25b (federal tax withheld)",
  "feeds_540": "Form 540, line 13 (via federal AGI); line 71 (CA tax withheld, Box 14); Schedule CA (540), Part I, Section A, lines 4a/4b or 5a/5b (if CA basis or military retirement exclusion applies); Form 540, line 63 via FTB 3805P (early distribution tax)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-R ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 10,
  "form": "1099-G (state refund and unemployment)",
  "sender": "State or local government agency (e.g., California FTB for state tax refunds; California EDD for unemployment and Paid Family Leave)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule 1 (Form 1040), Part I, line 1 (taxable state/local income tax refunds, Box 2) and line 7 (unemployment compensation, Box 1) -> Form 1040, line 8",
  "feeds_540": "Schedule CA (540), Part I, Section B, line 1, column B (state tax refund subtraction) and line 7, column B (unemployment and PFL subtraction) -> Form 540, line 14",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-G ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 11,
  "form": "1099-SA",
  "sender": "HSA, Archer MSA, or Medicare Advantage MSA trustee or custodian",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 8889, Part II -> Schedule 1 (Form 1040), Part I, line 8f (taxable HSA distributions) -> Form 1040, line 8; Schedule 2, line 17c (20% additional tax if nonqualified)",
  "feeds_540": "Schedule CA (540), Part I, Section B, line 8f, column B (subtract federally taxable nonqualified HSA distribution since CA does not recognize HSAs); Part II, line 4, column C (qualified medical expenses over 7.5% AGI if itemizing)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1099-SA ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 12,
  "form": "1098 (mortgage interest)",
  "sender": "Mortgage lender or servicer",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule A (Form 1040), line 8a (home mortgage interest and points reported on Form 1098) -> Form 1040, line 12e (itemized deductions)",
  "feeds_540": "Schedule CA (540), Part II, line 8 (CA allows $1,000,000 acquisition debt limit vs. $750,000 federal limit; adjustment in col. C) -> Form 540, line 18",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1098 ... To recipient (unless indicated otherwise): (To Payer/Borrower) January 31"
 },
 {
  "n": 13,
  "form": "1098-E",
  "sender": "Student loan lender or servicer",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Schedule 1 (Form 1040), Part II, line 21 (student loan interest deduction) -> Form 1040, line 10",
  "feeds_540": "Form 540, line 13 (via federal AGI); Schedule CA (540), Part I, Section C, line 21 (only if California adjustment applies, e.g., RDP or military spouse)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1098-E ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 14,
  "form": "1098-T",
  "sender": "Eligible educational institution (college or university)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 8863 (Education Credits) -> Schedule 3 (Form 1040), line 3 (nonrefundable) and Form 1040, line 29 (refundable American Opportunity Credit)",
  "feeds_540": "none",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "1098-T ... To recipient (unless indicated otherwise): January 31"
 },
 {
  "n": 15,
  "form": "1095-A",
  "sender": "Health Insurance Marketplace (e.g., Covered California or HealthCare.gov)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 8962 (Premium Tax Credit) -> Schedule 3 (Form 1040), line 9 (net PTC) or Schedule 2 (Form 1040), line 2 (excess advance PTC repayment)",
  "feeds_540": "Form 540, line 92 (full-year health coverage checkbox / FTB 3853 ISR penalty; Covered California separately issues FTB 3895 for CA Premium Assistance Subsidy on FTB 3849)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/instructions/i1095a",
  "quote": "File the annual report with the IRS and furnish the statements to individuals on or before January 31, 2027, for coverage in calendar year 2026. ... If the regular due date falls on a Saturday, Sunday, or legal holiday, furnish the statement by the next business day."
 },
 {
  "n": 16,
  "form": "1095-B",
  "sender": "Health insurance issuer, carrier, small self-insured employer, or government health program sponsor",
  "furnish_by": "2027-03-02",
  "feeds_1040": "none (informational proof of minimum essential coverage; kept with tax records)",
  "feeds_540": "Form 540, line 92 (verifies full-year minimum essential coverage to check box and avoid FTB 3853 ISR penalty)",
  "instructions_year": "2025",
  "url": "https://www.irs.gov/instructions/i109495b",
  "quote": "The due date for furnishing Form 1095-B is automatically extended from February 2, 2026, to March 2, 2026."
 },
 {
  "n": 17,
  "form": "1095-C",
  "sender": "Applicable Large Employer (ALE Member, generally 50+ full-time/FTE employees)",
  "furnish_by": "2027-03-02",
  "feeds_1040": "none (informational; verifies employer offer of coverage for Form 8962 Premium Tax Credit eligibility)",
  "feeds_540": "Form 540, line 92 (verifies full-year minimum essential coverage for Part III self-insured plans to avoid FTB 3853 ISR penalty)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/pub/irs-dft/i109495c--dft.pdf",
  "quote": "The due date for furnishing Form 1095-C is automatically extended from January 31, 2027, to March 2, 2027."
 },
 {
  "n": 18,
  "form": "5498",
  "sender": "IRA trustee or issuer",
  "furnish_by": "2027-06-01",
  "feeds_1040": "Schedule 1 (Form 1040), Part II, line 20 (deductible traditional IRA contributions) -> Form 1040, line 10; or Form 8606 (nondeductible IRA contributions)",
  "feeds_540": "Form 540, line 13 (via federal AGI); Schedule CA (540), Part I, Section C, line 20 (if California IRA deduction differs)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "5498 ... To recipient (unless indicated otherwise): (To Participant) For FMV/RMD/SIMPLE IRA contributions, January 31; For all other contributions, May 31"
 },
 {
  "n": 19,
  "form": "5498-SA",
  "sender": "HSA, Archer MSA, or Medicare Advantage MSA trustee or custodian",
  "furnish_by": "2027-06-01",
  "feeds_1040": "Form 8889, Part I -> Schedule 1 (Form 1040), Part II, line 13 (HSA deduction) -> Form 1040, line 10",
  "feeds_540": "Schedule CA (540), Part I, Section C, line 13, column B (disallows federal HSA deduction because CA does not conform); Section A, line 1h, column C (adds back W-2 Box 12 code W employer HSA contributions); Section A, line 2, column C (HSA earnings)",
  "instructions_year": "2026",
  "url": "https://www.irs.gov/publications/p1099",
  "quote": "5498-SA ... To recipient (unless indicated otherwise): (To Participant) May 31"
 },
 {
  "n": 20,
  "form": "SSA-1099",
  "sender": "Social Security Administration (SSA)",
  "furnish_by": "2027-02-01",
  "feeds_1040": "Form 1040, line 6a (total Social Security benefits) and line 6b (taxable amount); line 25c (federal tax withheld, Box 6)",
  "feeds_540": "Schedule CA (540), Part I, Section A, line 6, column B (full subtraction of taxable Social Security benefits; CA excludes Social Security from tax) -> Form 540, line 14",
  "instructions_year": "2025",
  "url": "https://secure.ssa.gov/poms.nsf/lnx/0205002005",
  "quote": "We issue all Social Security Benefit Statements by January 31 of each year. ... We mail Social Security Benefit Statements first class between January 3 and 24 each year, for delivery no later than January 31."
 },
 {
  "n": 21,
  "form": "Kern County property tax bill (secured)",
  "sender": "Kern County Treasurer-Tax Collector",
  "furnish_by": "2027-11-01",
  "feeds_1040": "Schedule A (Form 1040), line 5b (state and local real estate taxes, subject to federal SALT cap on line 5e) -> Form 1040, line 12e",
  "feeds_540": "Schedule CA (540), Part II, line 5b and line 5e, column C (CA does not conform to federal SALT cap; full real estate tax deductible if itemizing) -> Form 540, line 18",
  "instructions_year": "2025",
  "url": "https://www.kcttc.co.kern.ca.us/index.cfm?fuseaction=kcttcinternet.showImportantDates",
  "quote": "October | Treasurer-Tax Collector mails out original secured property tax bills | November 1 | First installment is due"
 }
];
