/* Garage: what California charges each year for the Sorento Hybrid and the MT-07 (Claude, 2026-11-21), from Gemini's
   garage_gemini_ca-fees_20261120-2026.json (GAR-GEM-12): DMV, BAR and CARB pages, 15 rows. Not second-read yet (the DMV site is not
   reachable from Claude's sandbox); DMV adjusts some fees each January. */
(function () {
  const PK = window.PK; if (!PK) return;
  const R = window.GARAGE_FEES = [
 {
  "n": 1,
  "vehicle": "2025 Kia Sorento Hybrid",
  "item": "Biennial Smog Check (8-model-year exemption)",
  "amount": "exempt until 2033",
  "rule": "Gasoline, hybrid, and alternative-fuel vehicles eight model years and newer are exempt from biennial Smog Check on registration renewal. Add 8 to the model year (2025 + 8 = 2033) for first required Smog Check. No Smog Check due in 2027 (2 model-years old); pay annual smog abatement fees instead.",
  "url": "https://www.bar.ca.gov/smog-check",
  "quote": "Eight model years and newer - do not need a Smog Check for vehicle registration renewal. Instead, California law requires a smog abatement fee. This fee is due with your DMV vehicle registration renewal fees. To determine when a vehicle will need its first Smog Check, add eight to the model year."
 },
 {
  "n": 2,
  "vehicle": "2025 Kia Sorento Hybrid",
  "item": "Smog Abatement Fee (HSC §44060(d)(1))",
  "amount": "$20",
  "rule": "Annual smog abatement fee paid with DMV registration renewal in lieu of a biennial Smog Check during the 8-model-year exemption window (2025–2032). Combined with the $8 Alternative Fuel/Technology Smog Fee, total annual smog abatement charge is $28.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "Smog abatement (HSC §44060(d)(1)) $20"
 },
 {
  "n": 3,
  "vehicle": "2025 Kia Sorento Hybrid",
  "item": "Alternative Fuel/Technology Smog Fee",
  "amount": "$8",
  "rule": "Annual $8 fee collected alongside the $20 smog abatement fee ($28 total) on exempt newer gasoline and hybrid vehicles during their 8-model-year Smog Check exemption period.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "Alternative Fuel/Technology Smog Fee Amount$8"
 },
 {
  "n": 4,
  "vehicle": "2025 Kia Sorento Hybrid",
  "item": "Kern County Biennial Smog Check County Requirement",
  "amount": "exempt until 2033 (biennial thereafter)",
  "rule": "Kern County is a California biennial Smog Check county. Once the 2025 Kia Sorento Hybrid exits its 8-model-year exemption in 2033, it will require a Smog Check every other year on registration renewal.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/smog-inspections/",
  "quote": "If you live in one of these counties, you need a smog inspection when you renew your vehicle registration. Alameda Butte Colusa Contra Costa Fresno Glenn Kern Kings"
 },
 {
  "n": 5,
  "vehicle": "2021 Yamaha MT-07",
  "item": "Smog Check (Motorcycle Exemption)",
  "amount": "exempt permanently (all motorcycles exempt)",
  "rule": "Motorcycles are permanently exempt from California Smog Check inspections for both registration renewal and change of ownership regardless of model year, and do not pay smog abatement fees.",
  "url": "https://www.bar.ca.gov/smog-check",
  "quote": "Diesel vehicles - with a gross vehicle weight rating of more than 14,000 pounds Electric vehicles Motorcycles"
 },
 {
  "n": 6,
  "vehicle": "both",
  "item": "Base Registration Fee (VC §9250.1)",
  "amount": "$76 (2026 published rate; CPI-adjusted Jan 1, 2027)",
  "rule": "Annual base registration renewal fee for on-highway autos and motorcycles; includes the $3 Alternative Fuel/Technology Registration Fee. DMV adjusts this fee annually on January 1 by the California CPI (confirm exact 2027 billing notice in Jan 2027).",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "Registration Fees (VC §9250.1) Original registration/renewal $76* * Includes the Alternative Fuel/Technology Fee ($3)"
 },
 {
  "n": 7,
  "vehicle": "both",
  "item": "California Highway Patrol (CHP) Fee (VC §§9250.8, 9250.13)",
  "amount": "$34 (2026 published rate; CPI-adjusted Jan 1, 2027)",
  "rule": "Annual CHP law enforcement fee assessed on all non-commercial on-highway vehicles, including both the 2025 Kia Sorento Hybrid and 2021 Yamaha MT-07. Subject to annual California CPI adjustment each January 1.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "California Highway Patrol (CHP) Fees (VC §§9250.8, 9250.13, 9552–9554) CHP $34"
 },
 {
  "n": 8,
  "vehicle": "both",
  "item": "Vehicle License Fee (VLF) (RTC §10752)",
  "amount": "0.65% of depreciated vehicle value",
  "rule": "Annual in-lieu property tax equal to 0.65% of purchase price/value, decreasing over the vehicle's first 11 renewal years (or until transferred). Tax-deductible on Schedule A. Applies to both the 2025 Kia Sorento Hybrid and 2021 Yamaha MT-07.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "Vehicle License Fee (VLF) – 0.65% of purchase price/value of vehicle. Vehicle license fees decrease for your vehicle's first 11 renewal years, or until the vehicle is transferred (whichever happens first)."
 },
 {
  "n": 9,
  "vehicle": "both",
  "item": "Transportation Improvement Fee (TIF) — Value Bands",
  "amount": "$33 ($0–$4,999); $66 ($5,000–$24,999); $132 ($25,000–$34,999); $198 ($35,000–$59,999); $231 ($60,000+)",
  "rule": "Annual SB 1 road-maintenance fee tiered by depreciated vehicle value (2026 published bands; CPI-adjusted Jan 1, 2027). The 2025 Kia Sorento Hybrid typically falls in the $25,000–$34,999 ($132) or $35,000–$59,999 ($198) band; the 2021 Yamaha MT-07 typically falls in the $5,000–$24,999 ($66) or $0–$4,999 ($33) band.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "TIF fees are used to repair roads, bridges, etc. and provide road maintenance. TIF fees affect original vehicle registration (VR), transfers, and renewals."
 },
 {
  "n": 10,
  "vehicle": "both",
  "item": "Kern County Local Fees — Countywide (Auto Theft/DUI, SAFE, Fingerprint ID)",
  "amount": "$4 ($1 Auto Theft/DUI + $1 SAFE + $2 Fingerprint ID)",
  "rule": "Countywide Kern County (County Code 15) DMV-collected registration fees for non-CVRA autos and motorcycles: Auto Theft/DUI $1 (VC §9250.14), Service Authority Freeway Emergency (SAFE) $1 (VC §9250.10), and Fingerprint ID (FID) $2 (VC §9250.19).",
  "url": "https://www.dmv.ca.gov/portal/handbook/vehicle-industry-registration-procedures-manual-2/appendix-1a-county-and-city-fees/",
  "quote": "Auto Theft/DUI $1/$2 Autos, $3/$4/$6, Commercial Vehicle Registration Act (CVRA) NO SUNSET VC 9250.14 – $1/$3 as of 08/01/1993 Service Authority Freeway Emergency (SAFE) NO SUNSET VC 9250.10 $1/Non-CVRA, $3 CVRA – Effective 10/31/1988"
 },
 {
  "n": 11,
  "vehicle": "both",
  "item": "Kern County Air Quality District Fee — Frazier Park ZIP 93225 (San Joaquin Valley APCD)",
  "amount": "$19 (Frazier Park 93225; $6 in Eastern Kern APCD)",
  "rule": "Kern County is a partial air quality county under DMV Appendix 1B. Frazier Park (ZIP 93225, within 93224–93226) is in the San Joaquin Valley APCD ($19/vehicle), making total Kern County local fees $23/vehicle ($4 countywide + $19 APCD). Eastern Kern APCD ZIPs pay $6.",
  "url": "https://www.dmv.ca.gov/portal/handbook/vehicle-industry-registration-procedures-manual-2/appendix-1b-air-quality-partial-counties/",
  "quote": "San Joaquin Vly — APCD — 09/10/11 — $19 93203 93206 93215-16 93220 93222 93224-26 93241 93243 93249-52 93263 93268 93276 93280 93287"
 },
 {
  "n": 12,
  "vehicle": "2025 Kia Sorento Hybrid",
  "item": "Road Improvement Fee (RIF) (VC §9250.6) — Hybrid Exemption",
  "amount": "$0 (exempt — hybrid is NOT a ZEV; $121 applies only to MY 2020+ ZEVs)",
  "rule": "VC §9250.6 imposes the $121 annual Road Improvement Fee (2026 published rate; CPI-adjusted annually) solely on model year 2020 and later Zero-Emission Vehicles (ZEVs). A hybrid has a gasoline engine, produces tailpipe emissions, and pays gasoline fuel taxes, so it is NOT a ZEV and is exempt from the RIF.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "The RIF is assessed on all model year 2020 and later zero emission vehicles (ZEV). RIF fees affect vehicle registration renewals unless exempted."
 },
 {
  "n": 13,
  "vehicle": "2025 Kia Sorento Hybrid",
  "item": "CARB Zero-Emission Vehicle (ZEV) Definition Verification",
  "amount": "exempt (hybrid does not meet ZEV definition)",
  "rule": "Under CARB's official ZEV definition, a ZEV must produce zero tailpipe exhaust emissions under all operational modes and conditions (battery electric and hydrogen fuel cell vehicles only). Conventional and plug-in hybrids do not qualify as ZEVs and are therefore exempt from the VC §9250.6 RIF.",
  "url": "https://ww2.arb.ca.gov/our-work/programs/truckstop-resources/zev-truckstop/zev-101/zero-emission-terms-know-zev-truckstop",
  "quote": "Zero-Emission Vehicles (ZEV): Vehicles that produce zero tailpipe exhaust emissions of any criteria pollutant or greenhouse gas under all possible operational modes or conditions."
 },
 {
  "n": 14,
  "vehicle": "2021 Yamaha MT-07",
  "item": "Road Improvement Fee (RIF) (VC §9250.6) — Gasoline Motorcycle Exemption",
  "amount": "$0 (exempt — gasoline motorcycle is not a ZEV)",
  "rule": "The 2021 Yamaha MT-07 is a gasoline-powered motorcycle and not a Zero-Emission Vehicle (ZEV), so the $121 Road Improvement Fee does not apply.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "The RIF is assessed on all model year 2020 and later zero emission vehicles (ZEV). RIF fees affect vehicle registration renewals unless exempted."
 },
 {
  "n": 15,
  "vehicle": "2021 Yamaha MT-07",
  "item": "Motorcycle Safety Fee (VC §2935)",
  "amount": "$2",
  "rule": "Annual $2 fee assessed on original registration and renewal of motorcycles under Vehicle Code §2935 to fund the California Motorcyclist Safety Program. Applies to the 2021 Yamaha MT-07 only; does not apply to the 2025 Kia Sorento Hybrid.",
  "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/",
  "quote": "Motorcycle safety (original/renewal) (VC §2935) $2"
 }
];

  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid || !PK.ref) return;
    PK.ref(PK.refPanel(grid, { title: "What California charges each year", sub: "Registration, smog, the vehicle license fee and the Kern add-ons for both vehicles, each from the agency's own page." }), {
      rows: R, group: (r) => (/Kia/.test(r.vehicle) ? "Sorento Hybrid" : "MT-07"),
      title: (r) => r.item, value: (r) => r.amount, detail: (r) => r.rule,
      meta: (r) => [/Kia/.test(r.vehicle) ? "2025 Sorento Hybrid" : "2021 MT-07", "not second-read"], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini GAR-GEM-12 (2026-11-20). Not second-read yet; DMV changes some amounts each January.",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
