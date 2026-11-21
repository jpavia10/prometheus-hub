/* Continuity: California's small-estate and transfer-on-death rules (Claude, 2026-11-21), from Gemini's
   continuity_gemini_ca-small-estate_20261120-2027.json (CON-GEM-06): Judicial Council forms DE-300/305/310, the courts' self-help pages
   and the Probate Code's statutory TOD deed form. Not second-read yet (the courts' site is not reachable from Claude's sandbox). */
(function () {
  const PK = window.PK; if (!PK) return;
  const R = window.CONTINUITY_SMALL_ESTATE = [
 {
  "n": 1,
  "rule": "Small-estate personal property affidavit limit in force for deaths on or after April 1, 2025 (adjusted every 3 years under Prob. Code § 890; next adjustment April 1, 2028).",
  "value": "$208,850 (effective April 1, 2025; prior Apr 1, 2022–Mar 31, 2025 limit was $184,500)",
  "code_section": "Prob. Code §§ 890, 13100, 13101",
  "url": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/de300.pdf",
  "quote": "The gross value of the decedent's real and personal property in California— excluding any property described in Probate Code section 13050 and any property included in a petition filed under Probate Code section 13151—must not exceed: $ 184,500 $ 208,850"
 },
 {
  "n": 2,
  "rule": "Gross value of CA real/personal property and benefits paid to the estate count (debts/mortgages are not subtracted); excludes joint tenancy, living trusts, vehicles/boats/mobile homes, out-of-state realty, beneficiary-designated assets, spousal property, multiple-party bank accounts, and unpaid salary up to $20,875.",
  "value": "Gross value; excludes unpaid salary/compensation up to $20,875 (eff. April 1, 2025) plus non-probate assets",
  "code_section": "Prob. Code § 13050 (incl. § 13050(c))",
  "url": "https://selfhelp.courts.ca.gov/probate/simple-transfer",
  "quote": "Do not include: Cars, boats, or mobile homes Real property outside of California Property held in trust, including a living trust Real or personal property that the person who died owned with someone else (joint tenancy)"
 },
 {
  "n": 3,
  "rule": "At least 40 days must elapse after the decedent's death before using a small-estate affidavit for personal property (§ 13100) or filing a Petition to Determine Succession to Primary Residence (§ 13151 / DE-310).",
  "value": "40 days",
  "code_section": "Prob. Code §§ 13100, 13101, 13151",
  "url": "https://selfhelp.courts.ca.gov/probate/small-estate",
  "quote": "At least 40 days have passed since the person died You cannot start this process unless at least 40 days have passed since the person passed away."
 },
 {
  "n": 4,
  "rule": "Applies to personal property only when no formal probate is open (or personal representative consents in writing); attach certified death certificate, mandatory Form DE-300 (for deaths on/after April 1, 2022), proof of ownership, ID, and DE-160 appraisal if CA real property exists; signed by all entitled successors.",
  "value": "Affidavit + death certificate + Form DE-300 + proof of ownership & ID",
  "code_section": "Prob. Code §§ 13100–13106",
  "url": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/de300.pdf",
  "quote": "If the decedent died on or after April 1, 2022, this form must be attached to an affidavit or declaration furnished under Probate Code section 13101"
 },
 {
  "n": 5,
  "rule": "Under AB 2016 (effective April 1, 2025), a court petition to determine succession to real property (§ 13151, Form DE-310) applies only to the decedent's primary residence in California with gross value up to $750,000 (non-primary real property uses § 13200 / DE-305 up to $69,625 after 6 months).",
  "value": "$750,000 (primary residence in CA, eff. April 1, 2025 – March 31, 2028)",
  "code_section": "Prob. Code §§ 13151, 13152, 13154 (AB 2016)",
  "url": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/de310.pdf",
  "quote": "$750,000 (decedent died on or after April 1, 2025, and before April 1, 2028. Form DE-300 is attached as required by law)."
 },
 {
  "n": 6,
  "rule": "Statutory form transfers the grantor's ownership share of eligible California residential real property directly to named beneficiary(ies) upon death outside probate; requires legal description, full beneficiary name(s), grantor signature, notarization, two witnesses, and timely county recording.",
  "value": "Statutory TOD deed form (Prob. Code § 5642); residential property only",
  "code_section": "Prob. Code §§ 5600–5698, 5642",
  "url": "https://www.slocounty.ca.gov/getmedia/4942fac5-4f68-46fa-8db5-1c704c75b51e/commonly-recorded-revocable-transfer-on-death-deed-form-with-faq",
  "quote": "Use this deed to transfer the residential property described below directly to your named beneficiaries when you die. YOU SHOULD CAREFULLY READ ALL OF THE INFORMATION ON THE OTHER PAGES OF THIS FORM."
 },
 {
  "n": 7,
  "rule": "A revocable TOD deed must be recorded with the county recorder on or before 60 days after the date it is notarized (and before the transferor's death) or it is not effective.",
  "value": "60 days after notarization",
  "code_section": "Prob. Code §§ 5626, 5642",
  "url": "https://www.slocounty.ca.gov/getmedia/4942fac5-4f68-46fa-8db5-1c704c75b51e/commonly-recorded-revocable-transfer-on-death-deed-form-with-faq",
  "quote": "This form MUST be RECORDED on or before 60 days after the date it is notarized or it will not be effective."
 },
 {
  "n": 8,
  "rule": "The transferor's signature must be acknowledged before a notary public and signed by two witnesses who are both present at the same time and witness the signing or acknowledgment (witness signatures do not need to be notarized).",
  "value": "2 witnesses present at the same time + notary acknowledgment of grantor",
  "code_section": "Prob. Code §§ 5624, 5642",
  "url": "https://www.slocounty.ca.gov/getmedia/4942fac5-4f68-46fa-8db5-1c704c75b51e/commonly-recorded-revocable-transfer-on-death-deed-form-with-faq",
  "quote": "To be valid, this deed must be signed by two persons, both present at the same time, who witness your signing of the deed or your acknowledgment that is your deed. The signatures of the witnesses do not need to be acknowledged by a notary public."
 },
 {
  "n": 9,
  "rule": "The transferor (with capacity to contract) may revoke a TOD deed at any time before death without beneficiary consent by recording a statutory revocation form (§ 5644), recording a subsequent TOD deed (§ 5628), or recording a deed transferring the property during life; cannot be revoked by will.",
  "value": "Transferor only; record revocation, new TOD deed, or lifetime transfer deed",
  "code_section": "Prob. Code §§ 5628, 5630, 5632, 5644",
  "url": "https://www.slocounty.ca.gov/getmedia/4942fac5-4f68-46fa-8db5-1c704c75b51e/commonly-recorded-revocable-transfer-on-death-deed-form-with-faq",
  "quote": "I transfer all of my interest in the described property to the named beneficiary(ies) on my death. I may revoke this deed. When recorded, this deed revokes any TOD deed that I made before signing this deed."
 },
 {
  "n": 10,
  "rule": "Mandatory Judicial Council forms: DE-300 (Maximum Values, Rev. April 28, 2025; must be attached for deaths on/after April 1, 2022), DE-305 (Affidavit re Real Property of Small Value <= $69,625 after 6 months, Rev. Jan 1, 2026), and DE-310 (Petition to Determine Succession to Primary Residence <= $750,000 after 40 days, Rev. April 28, 2025).",
  "value": "DE-300, DE-305, DE-310",
  "code_section": "Prob. Code §§ 890, 13100–13101, 13151–13154, 13200",
  "url": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/de300.pdf",
  "quote": "a Petition to Determine Succession to Primary Residence (form DE-310) filed under Probate Code section 13151; an Affidavit re: Real Property of Small Value (form DE-305) filed under Probate Code section 13200"
 }
];

  function start() {
    const grid = document.getElementById("co-pane-accounts"); if (!grid || !PK.ref) return;
    PK.ref(PK.refPanel(grid, { title: "Passing things on without probate (California)", sub: "The dollar limits and steps for the small-estate affidavit, the primary-residence petition and the transfer-on-death deed, with the code section for each." }), {
      rows: R, title: (r) => r.rule, value: (r) => r.value, meta: (r) => [r.code_section, "not second-read"], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini CON-GEM-06 (2026-11-20). Not legal advice; not second-read yet. The limits change every three years (next: April 1, 2028).",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
