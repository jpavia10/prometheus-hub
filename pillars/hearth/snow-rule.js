/* Hearth: which snow load governs the deck (Claude, 2026-11-21), from Gemini's hearth_gemini_snow-load-rule_20261120-2025.json
   (HEA-GEM-23): Kern County adopted the 2025 California codes by Ordinance G-9359 (Board of Supervisors, Nov 4, 2025; effective Jan 1, 2026),
   but the ordinance's snow-load text is not online (CBSC sends it by email; Municode and the county site block automated reading). The 30 psf
   table is the prior cycle's. Still open: ask Kern Building Inspection which value governs before sizing joists. */
(function () {
  const PK = window.PK; if (!PK) return;
  const R = window.HEARTH_SNOW_RULE = [
 {
  "n": 1,
  "document": "California Building Standards Commission (CBSC) 2025 Ordinances Filing List (Kern County Ordinance No. G-9359, filed as G-9359-Partial)",
  "section": "Amending the 2025 edition of Title 24 — Local Ordinances Filed (K–L)",
  "says": "Confirms Kern County filed Ordinance No. G-9359 (listed as G-9359-Partial) with CBSC amending the 2025 edition of Title 24. CBSC does not publish the full ordinance text online and instructs requesting a copy by email.",
  "value_psf": "not stated",
  "url": "https://www.dgs.ca.gov/BSC/Codes/2025-Ordinances",
  "quote": "KERN COUNTY | G-9359-Partial — For a copy of a filed ordinance email CBSC. Include the name of the of the city and/or county and the ordinance number in your request."
 },
 {
  "n": 2,
  "document": "Kern County Board of Supervisors Meeting Recap for November 4, 2025 (posted November 5, 2025)",
  "section": "Item No. 6 PM session — Title 17 Code of Building Regulations",
  "says": "Confirms the Kern County Board of Supervisors held a public hearing on November 4, 2025 and approved enacting the ordinance repealing and adding chapters to Title 17 to adopt the 2025 California Building Standards Code with local modifications. Does not state the snow-load table or ASCE 7-22 text.",
  "value_psf": "not stated",
  "url": "https://www.kerncounty.com/Home/Components/News/News/4223/34810",
  "quote": "A public hearing was held to consider an ordinance repealing and adding new chapters to Title 17 of the Kern County Ordinance Code, adopting the updated California Building Standards Code with local modifications to establish a new Code of Building Regulations."
 },
 {
  "n": 3,
  "document": "Kern County Code of Ordinances — Municode (Title 17, Chapters 17.06 & 17.08; searched 2026-11-20)",
  "section": "Title 17 / Chapter 17.06 / Section 17.06.140 (Snow loads)",
  "says": "not found — Full codified text of 2025 Ordinance G-9359 on Municode could not be retrieved today because library.municode.com remained blocked by Cloudflare security verification; could not verify verbatim whether G-9359 retained the elevation table or deferred to ASCE 7-22.",
  "value_psf": "not stated",
  "url": "https://library.municode.com/ca/kern_county/codes/code_of_ordinances",
  "quote": "not found — blocked by Cloudflare security verification (Performing security verification / Verifying...) on library.municode.com/ca/kern_county/codes/code_of_ordinances"
 },
 {
  "n": 4,
  "document": "Kern County Board of Supervisors Agenda Packet & Archived Meetings (searched 2026-11-20)",
  "section": "November 4, 2025 PM Session Item No. 6 (Ordinance G-9359 packet)",
  "says": "not found — The live agenda viewer (itsapps.kerncounty.com/clerk/minutes/bosagenda/Meetings.htm) only lists 11/17/2026 AM/PM meetings, and the archived meetings page on kerncounty.com returned Access Denied (errors.edgesuite.net), so the G-9359 ordinance PDF could not be opened.",
  "value_psf": "not stated",
  "url": "https://itsapps.kerncounty.com/clerk/minutes/bosagenda/DefAgenda.htm",
  "quote": "not found — Meetings.htm only lists 11/17/2026 AM and 11/17/2026 PM; archived meetings page at kerncounty.com returned Access Denied (errors.edgesuite.net)"
 },
 {
  "n": 5,
  "document": "Kern County Public Works Building Inspection — Bulletins/Documents/Forms (checked 2026-11-20)",
  "section": "Bulletins, Policies & Guidelines / Typical Details / Plan Checklists / Forms",
  "says": "Confirms 2025 Building Code Forms are required for permit applications submitted on or after January 1, 2026. No standalone snow-load bulletin or design-criteria sheet was found or accessible (interactive accordion tabs blocked by Akamai Access Denied in live browser; no snow-load bulletin PDF indexed).",
  "value_psf": "not stated",
  "url": "https://www.kernpublicworks.com/services/development/building-inspection/bulletins-documents-forms",
  "quote": "The 2025 Building Code Forms are required for building permit applications submitted on or after January 1, 2026."
 },
 {
  "n": 6,
  "document": "Kern County Code of Building Regulations — Granicus Archive PDF2410578 (pre-2025 / unverified code cycle baseline)",
  "section": "Section 17.06.140 — Section R301.2.3 amended – Snow loads",
  "says": "Historical/prior-cycle Kern County Code of Building Regulations PDF (not verified to be 2025 Ordinance G-9359) amends CRC Section R301.2.3 with a site-elevation ground snow load table showing 30 psf at 4,000–5,000 ft (40 psf at 5,000–6,000 ft, 60 psf at 6,000–7,000 ft, 80 psf at 7,000–8,000 ft) when no statistical analysis is available.",
  "value_psf": "30",
  "url": "https://itsapps.kerncounty.com/clerk/minutes/granicus/2410311/2410332/2410334/2410389/2410578/Code%20of%20Building%20Regs-Complete%20PDF2410578.pdf",
  "quote": "17.06.140 Section R301.2.3 amended – Snow loads. Section R301.2.3 is amended by adding the following: If no statistical analysis of data is available ... 4000 - 5000. 30. 5000 - 6000. 40. 6000 - 7000. 60. 7000 - 8000. 80."
 }
];

  function start() {
    const checks = document.getElementById("p-checks"); if (!checks || !PK.ref) return;
    PK.ref(PK.refPanel(checks, { title: "Which snow load governs", sub: "Kern adopted the 2025 codes by Ordinance G-9359, effective Jan 1, 2026. Its snow-load table is not published online yet, so the number is still open: ask Kern Building Inspection." }), {
      rows: R, title: (r) => r.document, value: (r) => (r.value_psf && r.value_psf !== "not stated" ? `${r.value_psf} psf` : "No snow load stated"), detail: (r) => r.says,
      meta: (r) => [r.section, "not second-read"], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini HEA-GEM-23 (2026-11-20): an honest partial; the ordinance text has to be asked for by email (CBSC) or read at the county.",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
