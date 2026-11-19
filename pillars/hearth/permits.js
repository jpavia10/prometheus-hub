/* HEA-GEM-17 (Claude, 2026-11-19): when Kern County needs a permit for a deck, from Gemini's
   hearth_gemini_kern-permits_20261117-1735.md, accepted by Muse's recheck 9/10 (hearth_muse_kern-permits-recheck_20261118-1615.md:
   the four-condition CRC R105.2 item 10 test is right, every number verified against its source). Muse's four small notes are added
   below as notes, not changes to the rule. The guide covers building a deck; whether re-decking an existing frame is an ordinary
   repair (no permit) is NOT in it, so the check below says so instead of guessing. window.HEARTH_PERMITS. */
window.HEARTH_PERMITS = {
  exemption: {
    rule: "A deck is exempt from a building permit only when all four hold: it is not over 200 sq ft, not more than 30 inches above grade at any point, not attached to a dwelling, and does not serve the required exit door (CRC R311.4).",
    cite: "CRC R105.2 item 10",
    url: "https://codes.iccsafe.org/s/CRC2019P3/chapter-1-scope-and-application/CRC2019P3-Pt01-Ch01-SubCh02-SecR105.2",
  },
  also_exempt: [
    { what: "Fences not over 7 ft high", cite: "CRC R105.2 item 2" },
    { what: "Retaining walls not over 4 ft from bottom of footing to top of wall, unless supporting a surcharge", cite: "CRC R105.2 item 3" },
  ],
  numbers: [
    { k: "Guard height", v: "42 in minimum", cite: "CRC R312.1.2 (California)", note: "Needed where a walking surface is more than 30 in above grade within 36 in horizontally of its edge (R312.1.1)." },
    { k: "Guard openings", v: "must not pass a 4-in sphere", cite: "CRC R312.1.3" },
    { k: "Guard top rail load", v: "200 lb", cite: "deck submittal handout §8D", note: "From the handout; the guide's final-inspection list leaves it out." },
    { k: "Stair width", v: "36 in minimum clear", cite: "CRC R311.7.1" },
    { k: "Stair riser", v: "7¾ in maximum", cite: "CRC R311.7.5.1" },
    { k: "Stair tread", v: "10 in minimum", cite: "CRC R311.7.5.2" },
    { k: "Handrail", v: "34–38 in high, on flights of 4 or more risers", cite: "CRC R311.7.8" },
    { k: "Footings", v: "12 in minimum below grade", cite: "CRC R403.1.4" },
    { k: "Ledger", v: "2×8 pressure-treated minimum, ½-in staggered hot-dip galvanized or stainless lags/bolts, flashed", cite: "CRC R507.2, Table R507.2" },
    { k: "Lateral hold-downs", v: "2 per deck, 1,500 lb each", cite: "CRC R507.2.4" },
  ],
  apply: [
    "Kern County Public Works, Building Inspection Division takes residential deck permits for unincorporated Kern County (Frazier Park included).",
    "Submittal: site plan with property lines and setbacks, footing details, framing sizes and spans, ledger attachment, guard and stair details, owner-builder or contractor declaration.",
    "Fees come from project valuation and size under the county fee schedule: minimum intake and plan-check fees at submittal, the rest after plan approval before the permit is released.",
    "A residential permit also triggers a check of working smoke alarms (CRC R314) and carbon monoxide alarms (CRC R315) in the house. Note: R315 ties the CO requirement to work over $1,000 on an existing dwelling; the guide drops that condition.",
  ],
  inspections: [
    "Footing excavation, before concrete is poured.",
    "Framing, ledger and hold-downs, before decking hides the connections.",
    "Final: 42-in guards, 4-in sphere spacing, stairs, handrails, smoke/CO alarms.",
    "Work stays exposed until each stage is approved (CRC R109.1; the guide's link for this points to the Kern FAQ, not the code).",
  ],
  fire: {
    rule: "In State Responsibility Area mountain communities (Frazier Park included): 30 ft of clearance and 100 ft of fuel reduction (or to the property line if closer) around structures, done by June 1 each year.",
    cite: "Kern County Ordinance Code 8.46",
    url: "https://kerncountyfire.org/fire-prevention/hazard-reduction/",
  },
  sources: [
    ["CRC R105.2 (work exempt from permit)", "https://codes.iccsafe.org/s/CRC2019P3/chapter-1-scope-and-application/CRC2019P3-Pt01-Ch01-SubCh02-SecR105.2"],
    ["Kern County Public Works FAQ", "https://www.kernpublicworks.com/about-us/frequently-asked-questions"],
    ["Kern County permit and fee overview", "https://www.permitflow.com/blog/kern-county-building-permit"],
    ["California residential deck submittal handout", "https://www.ci.san-ramon.ca.us/UserFiles/Servers/Server_10826046/File/Our%20City/Departments/Community%20Development/Building%20and%20Safety%20Services/Forms%20and%20Handouts/Plan%20Submittals/Residential/Deck%20Handout.pdf"],
    ["Kern County Fire hazard reduction", "https://kerncountyfire.org/fire-prevention/hazard-reduction/"],
  ],
};
