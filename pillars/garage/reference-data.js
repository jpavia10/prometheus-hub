/* Garage reference data (Claude, 2026-11-19), from Gemini 4 Neon's run of 2026-11-19:
   GAR-GEM-08 garage_gemini_specs_20261119-0950.json (30 owner's-manual rows, page + word-for-word line each),
   GAR-GEM-09 garage_gemini_tsbs_20261119-0950.json (NHTSA: 28 manufacturer communications for the 2025 Sorento Hybrid, 0 for the 2021 MT-07; no recalls repeated),
   GAR-GEM-10 garage_gemini_tires_20261119-0921.json (OE sizes, Caltrans R1-R3, three all-weather tires),
   GAR-GEM-11 garage_gemini_mpg-gas-apis_20261119-0921.json (EPA ids 47729 FWD / 47736 AWD; EIA weekly CA and US regular to 2026-11-16).
   Claude's checks: shape (tools/kit/check_delivery.mjs), duplicates, units, internal consistency; fueleconomy.gov ids 47729 and 47736
   re-fetched (36/36/36, 34/34/34, annual fuel cost 1,650 and 1,750: exact). GAR-GEM-11's CORS question: fueleconomy.gov sends
   Access-Control-Allow-Origin: * (checked 2026-11-19), so "Check live" works from the phone. EIA needs a key and is not called. */
window.GARAGE_REF = {
 "specs": [
  {
   "n": 1,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "engine oil spec and viscosity",
   "value": "Full synthetic SAE 0W-20, API SN PLUS/ SP or ILSAC GF-6",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Engine oil (drain and refill) Recommends*1 | Smart stream G1.6 T-GDi HEV/PHEV | Classification: Full synthetic SAE 0W-20, API SN PLUS/ SP or ILSAC GF-6"
  },
  {
   "n": 2,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "oil capacity with filter",
   "value": "5.07 US qt.(4.8 L)",
   "unit": "qt",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Engine oil (drain and refill) Recommends*1 | Smart stream G1.6 T-GDi HEV/PHEV | Volume: 5.07 US qt.(4.8 L)"
  },
  {
   "n": 3,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "coolant type",
   "value": "An Phosphate based ethylene glycol based coolant",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Coolant (Engine)*3 | Classification: An Phosphate based ethylene glycol based coolant"
  },
  {
   "n": 4,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "engine coolant capacity",
   "value": "8.35 US qt.(7.9 L)",
   "unit": "qt",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Coolant (Engine)*3 | Volume: 8.35 US qt.(7.9 L)"
  },
  {
   "n": 5,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "inverter/HEV coolant if listed",
   "value": "2.01 US qt.(1.9 L); An Phosphate based ethylene glycol based coolant",
   "unit": "qt",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Coolant (Inverter)*3 | HEV | Volume: 2.01 US qt.(1.9 L) | Classification: An Phosphate based ethylene glycol based coolant"
  },
  {
   "n": 6,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "brake fluid spec",
   "value": "DOT 4",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Brake fluid | Volume: As required (Reservoir tank volume: 0.48 ± 0.02 US qt. (452.8 ± 20.0 cc)) | Classification: DOT 4"
  },
  {
   "n": 7,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "automatic transmission fluid spec",
   "value": "SK ATF SP4M-1, MICHANG ATF SP4M-1, S-OIL ATF SP4M-1, Kia Genuine ATF SP4M-1 (Volume: 6.34 US qt.(6 L))",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Automatic transmission (AT) fluid*2 | Volume: 6.34 US qt.(6 L) | Classification: SK ATF SP4M-1, MICHANG ATF SP4M-1, S-OIL ATF SP4M-1, Kia Genuine ATF SP4M-1"
  },
  {
   "n": 8,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "fuel tank capacity",
   "value": "17.7 US gal (67 L)",
   "unit": "gal",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-9 (PDF 594)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Fuel | HEV | Volume: 17.7 US gal (67 L) | Classification: Gasoline"
  },
  {
   "n": 9,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "minimum octane",
   "value": "87 ((R+M)/2) (Research Octane Number 91) or higher",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "2-2 (PDF 49)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Your new vehicle is designed to use only unleaded fuel having an octane number ((R+M)/2) of 87 (Research Octane Number 91) or higher. (Do not use methanol blended fuels.)"
  },
  {
   "n": 10,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "tire size",
   "value": "Full size: 235/65R17 or 235/55R19; Compact spare (steel wheel)*3: T135/90D17",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-8 (PDF 593)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "For hybrid vehicle | Full size tire | 235/65R17 | 235/55R19; Compact spare tire (steel wheel)*3 | T135/90D17"
  },
  {
   "n": 11,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "cold tire pressure front",
   "value": "35 psi (2.4 bar, 240 kPa)",
   "unit": "psi",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-8 (PDF 593)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "For hybrid vehicle | Inflation pressure [bar (psi, kPa)] | Normal load Front: 2.4 (35, 240) | Maximum load Front: 2.4 (35, 240)"
  },
  {
   "n": 12,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "cold tire pressure rear",
   "value": "35 psi (2.4 bar, 240 kPa)",
   "unit": "psi",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-8 (PDF 593)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "For hybrid vehicle | Inflation pressure [bar (psi, kPa)] | Normal load Rear: 2.4 (35, 240) | Maximum load Rear: 2.4 (35, 240)"
  },
  {
   "n": 13,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "compact spare pressure",
   "value": "60 psi (4.2 bar, 420 kPa)",
   "unit": "psi",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-8 (PDF 593)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Compact spare tire (steel wheel)*3 | Inflation pressure [bar (psi, kPa)] | Normal load Front: 4.2 (60, 420), Rear: 4.2 (60, 420) | Maximum load Front: 4.2 (60, 420), Rear: 4.2 (60, 420)"
  },
  {
   "n": 14,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "wheel lug nut torque",
   "value": "79~94 lbf·ft (11~13 kgf·m, 107~127 N·m)",
   "unit": "lb-ft",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "10-8 (PDF 593)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Wheel lug nut torque lbf·ft (kgf·m, N·m): 79~94 (11~13, 107~127)"
  },
  {
   "n": 15,
   "vehicle": "2025 Kia Sorento Hybrid",
   "item": "12V battery type",
   "value": "Maintenance-free, calcium-based / Absorbent Glass Mat (AGM) battery; plus 12V Parking lithium battery (group size, CCA, and Ah rating not stated; checked pp. 9-27, 9-29, 9-30 / PDF pp. 536, 538, 539)",
   "unit": "none",
   "manual": "2025 Sorento HEV/PHEV Owner's Manual (Kia America, Inc., © 2024; owners.kia.com doc 328-6829 / hybrid-suv-om.pdf; edition/publication code not stated on cover, Foreword, or back cover)",
   "page": "9-27, 9-29, 9-30 (PDF 536, 538, 539)",
   "url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
   "quote": "Your vehicle has a maintenance-free, calcium-based battery. Absorbent Glass Mat (AGM) batteries are maintenance free and have the AGM battery serviced by an authorized Kia dealer. 12V Parking lithium battery is added to secure stable operation power supply when functions such as OTA update, after-blow, and CCS are operated while parking."
  },
  {
   "n": 16,
   "vehicle": "2021 Yamaha MT-07",
   "item": "engine oil spec and viscosity",
   "value": "YAMALUBE; SAE 10W-40, 10W-50, 15W-40, 20W-40 or 20W-50; API service SG type or higher, JASO standard MA",
   "unit": "none",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-1 (PDF 91)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Engine oil: Recommended brand: YAMALUBE; SAE viscosity grades: 10W-40, 10W-50, 15W-40, 20W-40 or 20W-50; Recommended engine oil grade: API service SG type or higher, JASO standard MA"
  },
  {
   "n": 17,
   "vehicle": "2021 Yamaha MT-07",
   "item": "oil capacity with filter change",
   "value": "2.60 L (2.75 US qt, 2.29 Imp.qt)",
   "unit": "L",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-1 (PDF 91)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "With oil filter removal: 2.60 L (2.75 US qt, 2.29 Imp.qt)"
  },
  {
   "n": 18,
   "vehicle": "2021 Yamaha MT-07",
   "item": "oil capacity without",
   "value": "2.30 L (2.43 US qt, 2.02 Imp.qt)",
   "unit": "L",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-1 (PDF 91)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Oil change: 2.30 L (2.43 US qt, 2.02 Imp.qt)"
  },
  {
   "n": 19,
   "vehicle": "2021 Yamaha MT-07",
   "item": "coolant capacity",
   "value": "Radiator (including all routes): 1.60 L (1.69 US qt, 1.41 Imp.qt); Coolant reservoir (up to the maximum level mark): 0.25 L (0.26 US qt, 0.22 Imp.qt)",
   "unit": "L",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-1 (PDF 91)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Coolant quantity: Coolant reservoir (up to the maximum level mark): 0.25 L (0.26 US qt, 0.22 Imp.qt); Radiator (including all routes): 1.60 L (1.69 US qt, 1.41 Imp.qt)"
  },
  {
   "n": 20,
   "vehicle": "2021 Yamaha MT-07",
   "item": "brake fluid spec",
   "value": "DOT 4",
   "unit": "none",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-23 (PDF 72)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Specified brake fluid: DOT 4"
  },
  {
   "n": 21,
   "vehicle": "2021 Yamaha MT-07",
   "item": "fuel tank capacity",
   "value": "14 L (3.7 US gal, 3.1 Imp.gal)",
   "unit": "L",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-1 (PDF 91)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Fuel tank capacity: 14 L (3.7 US gal, 3.1 Imp.gal)"
  },
  {
   "n": 22,
   "vehicle": "2021 Yamaha MT-07",
   "item": "minimum octane",
   "value": "86 or higher [(R+M)/2 method], or 91 or higher (RON) (p. 4-15); Octane number (RON): 90 (p. 9-1)",
   "unit": "none",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "4-15 (PDF 33)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Your Yamaha engine was designed to use regular unleaded gasoline. Confirm the pump octane number [(R+M)/2 method] is 86 or higher, or the research octane number (RON) is 91 or higher."
  },
  {
   "n": 23,
   "vehicle": "2021 Yamaha MT-07",
   "item": "front tire size",
   "value": "120/70 ZR 17M/C(58W)",
   "unit": "none",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-2 (PDF 92)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Front tire: Type: Tubeless; Size: 120/70 ZR 17M/C(58W); Manufacturer/model: MICHELIN/ROAD 5"
  },
  {
   "n": 24,
   "vehicle": "2021 Yamaha MT-07",
   "item": "rear tire size",
   "value": "180/55 ZR 17M/C(73W)",
   "unit": "none",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "9-2 (PDF 92)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Rear tire: Type: Tubeless; Size: 180/55 ZR 17M/C(73W); Manufacturer/model: MICHELIN/ROAD 5"
  },
  {
   "n": 25,
   "vehicle": "2021 Yamaha MT-07",
   "item": "front cold pressure",
   "value": "225 kPa (2.25 kgf/cm², 33 psi)",
   "unit": "kPa",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-18 (PDF 67)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Cold tire air pressure: Front: 225 kPa (2.25 kgf/cm², 33 psi)"
  },
  {
   "n": 26,
   "vehicle": "2021 Yamaha MT-07",
   "item": "rear cold pressure",
   "value": "250 kPa (2.50 kgf/cm², 36 psi)",
   "unit": "kPa",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-18 (PDF 67)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Cold tire air pressure: Rear: 250 kPa (2.50 kgf/cm², 36 psi)"
  },
  {
   "n": 27,
   "vehicle": "2021 Yamaha MT-07",
   "item": "drive chain slack range",
   "value": "51.0–56.0 mm (2.01–2.20 in)",
   "unit": "mm",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-24 (PDF 73)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Distance A: 51.0–56.0 mm (2.01–2.20 in)"
  },
  {
   "n": 28,
   "vehicle": "2021 Yamaha MT-07",
   "item": "recommended chain lubricant",
   "value": "special O-ring chain lubricant (specific brand/part number not stated)",
   "unit": "none",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-26 (PDF 75)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Thoroughly lubricate the drive chain with a special O-ring chain lubricant. NOTICE: Do not use engine oil or any other lubricants for the drive chain, as they may contain substances that could damage the O-rings."
  },
  {
   "n": 29,
   "vehicle": "2021 Yamaha MT-07",
   "item": "spark plug model and gap",
   "value": "NGK/LMAR8A-9; gap 0.8–0.9 mm (0.031–0.035 in)",
   "unit": "mm",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-10 (PDF 59)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Specified spark plug: NGK/LMAR8A-9; Spark plug gap: 0.8–0.9 mm (0.031–0.035 in)"
  },
  {
   "n": 30,
   "vehicle": "2021 Yamaha MT-07",
   "item": "rear axle nut torque",
   "value": "105 N·m (10.5 kgf·m, 77 lb·ft)",
   "unit": "N-m",
   "manual": "MT07M / MT07MC (MT-07) Owner's Manual, 1st edition, October 2020, ©2021 by Yamaha Motor Corporation, U.S.A. (BAT-28199-10 / P/N LIT-11626-34-63)",
   "page": "7-25 (PDF 74)",
   "url": "https://library.ymcapps.net/library/om/contents/pdf/10/BAT-28199-10_02.pdf",
   "quote": "Tightening torques: Axle nut: 105 N·m (10.5 kgf·m, 77 lb·ft)"
  }
 ],
 "tsbs": [
  {
   "n": 1,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11036628",
   "bulletin_no": "TSB_CLI049_R2",
   "date": "2026-08-28",
   "component": "ELECTRICAL SYSTEM, VISIBILITY/WIPER",
   "hybrid": "yes",
   "symptom": "Air conditioning may blow warm air or stop cooling due to an electrical A/C compressor fault that can be partially repaired.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: PARTIAL REPAIR – ELECTRICAL A/C COMPRESSOR - This bulletin has been revised to include additional information. New/revised sections of this bulletin are indicated by a black bar in the margin area."
  },
  {
   "n": 2,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11034002",
   "bulletin_no": "WTY043_TSB",
   "date": "2026-06-03",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "The rear right-hand door sunshade curtain may fail to retract fully back into the door panel.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: WARRANTY EXTENSION CAMPAIGN: REAR RH DOOR CURTAIN INSPECTION / REPLACEMENT (WTY043) - This bulletin provides information associated with the ‘Warranty Extension Program’ (WTY043) inspect and, if necessary replace the rear RH door curtain"
  },
  {
   "n": 3,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11033217",
   "bulletin_no": "TSB_ELE422",
   "date": "2026-05-28",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The infotainment screen may run outdated software or experience minor performance quirks resolved by a Kia Navigation Updater update.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: INFOTAINMENT SYSTEM SOFTWARE UPDATE USING UPDATE.KIA.COM - This bulletin provides information and service procedures for updating the infotainment systems on applicable Kia vehicles using the Kia Navigation Updater available at update.kia.com."
  },
  {
   "n": 4,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11032905",
   "bulletin_no": "WTY043_REIMB",
   "date": "2026-05-23",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "Owners who previously paid out of pocket to repair a rear right-hand door curtain that would not retract can claim reimbursement.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: REIMBURSEMENT FORM (WTY043) - This document is a Reimbursement Request form that was mailed with the customer letter advising them to submit the form if they had paid for repairs for this same matter prior to the warranty extension campaign program launch."
  },
  {
   "n": 5,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11032904",
   "bulletin_no": "WTY043_OWNR",
   "date": "2026-05-23",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "The rear right-hand door curtain on SX-Prestige models may stick or fail to retract, now covered under an extended 10-year/120,000-mile warranty.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: OWNER NOTIFICATION (WTY043) - This document is the owner notification advising that Kia is extending the New Vehicle Limited Warranty coverage, to all owners, for certain repairs related to the rear right-hand (RH) door curtain"
  },
  {
   "n": 6,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11032903",
   "bulletin_no": "WTY043_QA",
   "date": "2026-05-20",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "Owners with a sticking rear right-hand door curtain can reference this Q&A guide for warranty extension coverage details.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: QUESTION AND ANSWER (WTY043) - This document is the Question and Answer Guide containing the most frequently asked questions regarding the Warranty Extension Campaign WTY043."
  },
  {
   "n": 7,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11032902",
   "bulletin_no": "WTY043_DPSM",
   "date": "2026-05-20",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "The rear right-hand door curtain on SX-Prestige trims may not retract properly and is eligible for extended warranty repair at dealers.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: DEALER PARTS AND SERVICE MANAGER MEMO (WTY043) - This document is the announcement to the dealer Parts and Service managers advising that Kia is extending the New Vehicle Limited Warranty coverage, to all owners"
  },
  {
   "n": 8,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11032901",
   "bulletin_no": "WTY043_DP",
   "date": "2026-05-20",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "The rear right-hand door curtain on SX-Prestige trims may not retract properly and is covered under dealer warranty extension WTY043.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: DEALER PRINCIPAL MEMO (WTY043) - This document is the announcement to the dealer principals advising that Kia is extending the New Vehicle Limited Warranty coverage, to all owners, for certain repairs related to the rear right-hand (RH) door curtain"
  },
  {
   "n": 9,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11031940",
   "bulletin_no": "OTA_ELE413_NOTES_R1",
   "date": "2026-04-24",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The vehicle may experience sluggish or dropped cellular network communication that is addressed by an over-the-air DCU software update.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "RELEASE NOTES: OVER-THE-AIR: SOFTWARE UPDATE FOR DATA CONNECTIVITY (ELE413 Revision 1) - This Over-the-Air (OTA) software update is designed to update the Data Connectivity Unit (DCU) logic of certain 2025 - 2026MY Carnival, 2025 - 2026MY K5 and 2025 - 2026MY Sorento vehicles."
  },
  {
   "n": 10,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11031906",
   "bulletin_no": "TSB_ELE417",
   "date": "2026-04-14",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "An owner or dealer updating the head unit via USB may need head-unit-specific installation steps to complete the infotainment software update.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: INFOTAINMENT SOFTWARE UPDATE PROCEDURE - This bulletin provides information on the process for downloading infotainment software updates and preparing USB for installation on applicable Kia vehicles."
  },
  {
   "n": 11,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030386",
   "bulletin_no": "WTY042_OWNR",
   "date": "2026-03-26",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The horn may sound abnormal or stop working altogether, covered free of charge under an extended 10-year/120,000-mile warranty.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: OWNER NOTIFICATION (WTY042) - This document is the owner notification advising that Kia is extending the New Vehicle Limited Warranty coverage, to all owners, for repairs related to the horn assembly in certain 2021-2025 MY Sorento"
  },
  {
   "n": 12,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030389",
   "bulletin_no": "WTY042_TSB",
   "date": "2026-03-24",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The horn may produce an unusual tone or fail completely due to internal corrosion or contact point carbonization.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: TECHNICAL SERVICE BULLETIN: HORN ASSEMBLY INSPECTION AND REPLACEMENT (WTY042) - This bulletin provides information associated with the ‘Warranty Extension Program’ (WTY042) to inspect and, if necessary, replace the horn assembly"
  },
  {
   "n": 13,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030388",
   "bulletin_no": "WTY042_REIMB",
   "date": "2026-03-24",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "Owners who previously paid for a horn assembly replacement due to horn sound failure can request reimbursement.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: REIMBURSEMENT FORM (WTY042) - This document is a Reimbursement Request form that was mailed with the customer letter advising them to submit the form if they had paid for repairs for this same matter prior to the warranty extension campaign program launch."
  },
  {
   "n": 14,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030387",
   "bulletin_no": "WTY042_QA",
   "date": "2026-03-24",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "Owners experiencing a weak, strange-sounding, or dead horn can consult this Q&A guide for warranty extension WTY042 details.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: QUESTION AND ANSWER (WTY042) - This document is the Question and Answer Guide containing the most frequently asked questions regarding the Warranty Extension Campaign WTY042."
  },
  {
   "n": 15,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030385",
   "bulletin_no": "WTY042_DPSM",
   "date": "2026-03-24",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The horn may malfunction or sound abnormal on affected Sorento Hybrid builds and is covered under extended warranty WTY042.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: DEALER PARTS & SERVICE MANAGER MEMO (WTY042) - This document is the announcement to the dealer Parts and Service managers advising that Kia is is extending the New Vehicle Limited Warranty coverage, to all owners, for repairs related to the horn assembly"
  },
  {
   "n": 16,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030383",
   "bulletin_no": "WTY042_DP",
   "date": "2026-03-24",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The horn may malfunction or fail to sound normally on eligible vehicles, covered under dealer warranty extension WTY042.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "WARRANTY EXTENSION CAMPAIGN: DEALER PRINCIPAL MEMO (WTY042) - This document is the announcement to the dealer principals advising that Kia is is extending the New Vehicle Limited Warranty coverage, to all owners, for repairs related to the horn assembly"
  },
  {
   "n": 17,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11030344",
   "bulletin_no": "TSB_ELE413",
   "date": "2026-03-20",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "Remote Start, Remote Climate, Kia Access app vehicle status updates, and connected navigation routing may intermittently stop working.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: DCU COMMUNICATION LOGIC IMPROVEMENT - This bulletin provides the procedure to upgrade the Data Connectivity Unit (DCU) system software on some 2025–2026MY vehicles listed in the table below."
  },
  {
   "n": 18,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11026698",
   "bulletin_no": "PS797",
   "date": "2025-12-09",
   "component": "BACK OVER PREVENTION",
   "hybrid": "no",
   "symptom": "Parking Distance Warning sensors may give false alarms, phantom warnings, or no alert if the sensor membrane is damaged by stone chips or debris.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "PITSTOP: TECHNICAL OPERATIONS: EXTERNAL DAMAGE TO ULTRASONIC SENSOR: This Pitstop provides information related to Parking Distance Warning (PDW) alerts and repairs involving ultrasonic sensors."
  },
  {
   "n": 19,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11017172",
   "bulletin_no": "TSB_TRA046_R5",
   "date": "2025-04-17",
   "component": "POWER TRAIN",
   "hybrid": "not stated",
   "symptom": "No direct driver symptom; this service reference ensures technicians use the correct transmission fluid type and fill quantity during transmission service.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: TRANSMISSION FLUID APPLICATION GUIDE - This bulletin has been revised to include additional information. New/revised sections of this bulletin are indicated by a black bar in the margin area."
  },
  {
   "n": 20,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11015426",
   "bulletin_no": "TSB_ELE341_R4",
   "date": "2025-03-06",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The ccNC infotainment or connected network services may require a dealer-mode factory or network reset to restore connectivity.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: COMBINATION TSB/SERVICE ACTION: CCNC – DEALER MODE, FACTORY & NETWORK RESET (SA613) - This bulletin has been revised as a Combination TSB/SA and includes additional information."
  },
  {
   "n": 21,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11013249",
   "bulletin_no": "TSB_ELE368_R1",
   "date": "2025-01-29",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "Kia Connect enrollment or activation may fail until the dealer performs a network reset in Dealer Mode.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: SERVICE ACTION: KIA CONNECT ACTIVATION FAILURE (SA600) - This bulletin has been revised to include additional information. New/revised sections of this bulletin are indicated by a black bar in the margin area."
  },
  {
   "n": 22,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11013032",
   "bulletin_no": "TSB_ELE368",
   "date": "2025-01-23",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "Kia Connect may fail to activate on the ccNC system until a Dealer Mode network reset is performed.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: SERVICE ACTION: KIA CONNECT ACTIVATION FAILURE (SA600) - This bulletin provides information to access the ‘Dealer Mode’ function and perform a ‘Reset Network’ on certain 2025MY Multiple Model vehicles listed on page 7"
  },
  {
   "n": 23,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11012057",
   "bulletin_no": "TSB_ELE364",
   "date": "2024-12-23",
   "component": "ELECTRICAL SYSTEM, FUEL/PROPULSION SYSTEM",
   "hybrid": "yes",
   "symptom": "The hybrid electric drive motor control logic on 19-inch-wheel Sorento HEV models may need a Motor Control Unit (MCU) software update.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: SERVICE ACTION: MOTOR CONTROL UNIT (MCU) LOGIC IMPROVEMENT (SA596) - This bulletin provides the procedure to update the Motor Control Unit (MCU) software on certain 2025MY Sorento HEV (MQ4 HEV) vehicles equipped with 19” wheels"
  },
  {
   "n": 24,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11010525",
   "bulletin_no": "TSB_BOD331",
   "date": "2024-11-13",
   "component": "STRUCTURE",
   "hybrid": "no",
   "symptom": "The front outer door handle touch unlock sensor may malfunction in wet conditions if moisture enters the handle seal.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: SERVICE ACTION: FRONT OUTER DOOR HANDLEUNLOCK SENSOR (SA587) - This bulletin provides the procedure to improve the moisture seal both (LH and RH side) outer front door handles on certain 2025MY Sorento PHEV and HEV (MQ4 P/HEV) vehicles"
  },
  {
   "n": 25,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11009074",
   "bulletin_no": "TSB_ELE341_R3",
   "date": "2024-10-18",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The ccNC infotainment or connected services may hang or lose network connectivity, requiring a Dealer Mode factory or network reset.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: CCNC – DEALER MODE, FACTORY AND NETWORK RESET - This bulletin has been revised to include additional information. New/revised sections of this bulletin are indicated by a black bar in the margin area."
  },
  {
   "n": 26,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11008037",
   "bulletin_no": "TSB_ELE341_R2",
   "date": "2024-09-18",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The ccNC infotainment or connected services may hang or lose network connectivity, requiring a Dealer Mode factory or network reset.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: CCNC - DEALER MODE, FACTORY AND NETWORK RESET - This bulletin has been revised to include additional information. New/revised sections of this bulletin are indicated by a black bar in the margin area."
  },
  {
   "n": 27,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11005366",
   "bulletin_no": "TSB_ELE341_R1",
   "date": "2024-07-29",
   "component": "ELECTRICAL SYSTEM",
   "hybrid": "no",
   "symptom": "The ccNC infotainment or connected services may hang or lose network connectivity, requiring a Dealer Mode factory or network reset.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "TECHNICAL SERVICE BULLETIN: CCNC - DEALER MODE, FACTORY AND NETWORK RESET - This bulletin has been revised to include additional information. New/revised sections of this bulletin are indicated by a black bar in the margin area."
  },
  {
   "n": 28,
   "vehicle": "2025 Kia Sorento Hybrid",
   "nhtsa_id": "11000787",
   "bulletin_no": "TSB_TRA046_R4",
   "date": "2024-05-16",
   "component": "POWER TRAIN",
   "hybrid": "not stated",
   "symptom": "No direct driver symptom; this guide specifies the correct transmission fluid type and fill quantity for service and notes a flush is only required when replacing a transmission.",
   "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
   "quote": "This bulletin provides information relating to the correct transmission fluid type and fill quantity requirement for each Kia model. A flush is required ONLY when a transmission is replaced."
  }
 ],
 "tsb_total": {
  "n": 0,
  "vehicle": "2025 Kia Sorento Hybrid & 2021 Yamaha MT-07",
  "nhtsa_id": "TOTAL",
  "bulletin_no": "TOTAL",
  "date": "2026-11-19",
  "component": "ALL",
  "hybrid": "not stated",
  "symptom": "NHTSA lists 28 Manufacturer Communications for the 2025 Kia Sorento Hybrid (both FWD and AWD) and 0 Manufacturer Communications for the 2021 Yamaha MT-07.",
  "url": "https://www.nhtsa.gov/vehicle/2025/KIA/SORENTO%252520HYBRID/SUV/FWD",
  "quote": "28 Manufacturer Communications listed for 2025 KIA SORENTO HYBRID (FWD/AWD); 0 Manufacturer Communications listed for 2021 YAMAHA MT-07 (checked 2026-11-19 on nhtsa.gov)."
 },
 "tires": [
  {
   "n": 1,
   "kind": "oe",
   "subject": "2025 Kia Sorento Hybrid HEV EX",
   "size": "235/55R19",
   "details": "Drive: 2WD / 4WD (OPT); Wheel size: 7.5Jx19 alloy; Spare tire: Temporary; Load index and speed rating: not stated on Kia Media 2025 Sorento HEV Specifications; OE tire model: not stated on Kia Media 2025 Sorento HEV Specifications.",
   "url": "https://www.kiamedia.com/us/en/models/sorento-hev/2025/specifications",
   "quote": "Tires & Wheels Wheel Size (in.) 7.5Jx19 alloy 7.5Jx19 alloy Tire size 235/55R19 235/55R19 Spare Tire Temporary Temporary"
  },
  {
   "n": 2,
   "kind": "oe",
   "subject": "2025 Kia Sorento Hybrid HEV SX-P",
   "size": "235/55R19",
   "details": "Drive: 4WD (Active On-Demand 4WD); Wheel size: 7.5Jx19 alloy; Spare tire: Temporary; Load index and speed rating: not stated on Kia Media 2025 Sorento HEV Specifications; OE tire model: not stated on Kia Media 2025 Sorento HEV Specifications.",
   "url": "https://www.kiamedia.com/us/en/models/sorento-hev/2025/specifications",
   "quote": "Drive Type 2WD / 4WD (OPT) 4WD 4WD System - Active On-Demand 4WD"
  },
  {
   "n": 3,
   "kind": "oe",
   "subject": "2021 Yamaha MT-07",
   "size": "Front: 120/70 ZR 17M/C(58W) (Tubeless); Rear: 180/55 ZR 17M/C(73W) (Tubeless)",
   "details": "Front load/speed rating: 58W; Rear load/speed rating: 73W; Construction: Tubeless; OE tire model: not stated on Yamaha Motor Europe 2021 MT-07 Factsheet PDF.",
   "url": "https://cdn2.yamaha-motor.eu/prod/product-assets/2021/MT07/Factsheets/2021-MT07_en.pdf",
   "quote": "Front tyre 120/70 ZR 17M/C(58W) (Tubeless) Rear tyre 180/55 ZR 17M/C(73W) (Tubeless)"
  },
  {
   "n": 4,
   "kind": "caltrans",
   "subject": "Caltrans Chain Control Requirement 1 (R-1)",
   "size": "",
   "details": "Chains required on all vehicles except passenger vehicles and light-duty trucks under 6,000 lb gross weight equipped with snow tires on at least two drive wheels; chains must still be carried. Caltrans defines snow-tread tires per CVC Section 558 by sidewall markings MS, M/S, M+S, or MUD AND SNOW (3PMSF is not stated on this Caltrans page).",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-controls",
   "quote": "Requirement 1 (R-1): Chains are required on all vehicles except passenger vehicles and light-duty trucks under 6,000 pounds gross weight and equipped with snow tires on at least two drive wheels. Chains must be carried by vehicles using snow tires. All vehicles towing trailers must have chains on one drive axle. Trailers with brakes must have chains on at least one axle."
  },
  {
   "n": 5,
   "kind": "caltrans",
   "subject": "Caltrans Chain Control Requirement 2 (R2)",
   "size": "",
   "details": "Chains or traction devices required on all vehicles except 4WD/AWD vehicles with snow-tread tires on all four wheels; 4WD/AWD vehicles must still carry traction devices in chain control areas. Snow-tread tires are identified by MS, M/S, M+S, or MUD AND SNOW stamped into the sidewall (3PMSF is not stated on this Caltrans page).",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-controls",
   "quote": "Requirement 2 (R2): Chains or traction devices are required on all vehicles except four-wheel/all-wheel drive vehicles with snow-tread tires on all four wheels."
  },
  {
   "n": 6,
   "kind": "caltrans",
   "subject": "Caltrans Chain Control Requirement 3 (R3) and Snow-Tread Tire Sidewall Rule",
   "size": "",
   "details": "Requirement 3 (R3): Chains or traction devices are required on all vehicles, no exceptions (Caltrans notes a highway will often be closed before an R-3 condition is imposed). Snow-tread tire definition on same page: sidewall stamped MS, M/S, M+S, or MUD AND SNOW (3PMSF is not stated on this Caltrans page).",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-controls",
   "quote": "Snow-tread tires can be identified by examining the sidewall of the tire where the letters MS, M/S, M+S or the words MUD AND SNOW have been stamped into the sidewall."
  },
  {
   "n": 7,
   "kind": "replacement",
   "subject": "Michelin CrossClimate2",
   "size": "235/55R19/XL 105V",
   "details": "Category: All-Season (3PMSF winter certified); Load index: 105 (XL); Speed rating: V; 3PMSF: Yes; UTQG: not stated on michelinman.com/auto/tires/michelin-crossclimate-2; Treadwear warranty: 60,000 miles; MSPN: 08499.",
   "url": "https://www.michelinman.com/auto/tires/michelin-crossclimate-2",
   "quote": "Supported by the Michelin Promise Plan of a 60-day satisfaction guarantee, roadside assistance, and a 60,000-mileage warranty"
  },
  {
   "n": 8,
   "kind": "replacement",
   "subject": "Pirelli SCORPION WEATHERACTIVE",
   "size": "235/55R19 105V XL",
   "details": "Category: All-weather (SUV Touring); Load index: 105 (XL); Speed rating: V (240 km/h); 3PMSF: Yes (Severe ice and snow: YES); UTQG: 700/A/A; Treadwear warranty: 60,000 miles.",
   "url": "https://www.pirelli.com/tires/en-us/car/catalog/product/scorpion-weatheractive/235_55-r19",
   "quote": "These tires are engineered to outperform all-season tires in snowy conditions, as proven by their Three Peak Mountain Snowflake rating (3PMSF)."
  },
  {
   "n": 9,
   "kind": "replacement",
   "subject": "Falken AKLIMATE",
   "size": "235/55R19 XL 105V",
   "details": "Category: All-weather touring; Load index: 105 (XL, max load 2,039 lbs); Speed rating: V; 3PMSF: Yes (USTMA Three Peak Mountain Snowflake); UTQG: 640-A-A; Treadwear warranty: 65,000 miles; Item number: 28392235; Approved rim width: 6.5 - 8.5 in (measuring rim: 7.5 in).",
   "url": "https://www.falkentire.com/aklimate",
   "quote": "Plus, the AKLIMATE earned USTMA's Three Peak Mountain Snowflake symbol after meeting the industry's snow traction performance requirements."
  }
 ],
 "epa": {
  "requests": [
   {
    "purpose": "List 2025 Kia models",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=2025&make=Kia"
   },
   {
    "purpose": "List 2025 Kia Sorento Hybrid FWD vehicle IDs",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2025&make=Kia&model=Sorento%20Hybrid%20FWD"
   },
   {
    "purpose": "List 2025 Kia Sorento Hybrid AWD vehicle IDs",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2025&make=Kia&model=Sorento%20Hybrid%20AWD"
   },
   {
    "purpose": "Fetch EPA data for 2025 Kia Sorento Hybrid FWD (id 47729)",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/47729"
   },
   {
    "purpose": "Fetch EPA data for 2025 Kia Sorento Hybrid AWD (id 47736)",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/47736"
   }
  ],
  "vehicles": [
   {
    "id": 47729,
    "year": 2025,
    "make": "Kia",
    "model": "Sorento Hybrid FWD",
    "drive": "Front-Wheel Drive",
    "trany": "Automatic (AM-S6)",
    "city08": 36,
    "highway08": 36,
    "comb08": 36,
    "mpg_unit": "MPG",
    "fuelType": "Regular",
    "fuelType1": "Regular Gasoline",
    "fuelCost08": 1650,
    "fuelCost08_unit": "USD/year",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/47729"
   },
   {
    "id": 47736,
    "year": 2025,
    "make": "Kia",
    "model": "Sorento Hybrid AWD",
    "drive": "All-Wheel Drive",
    "trany": "Automatic (AM-S6)",
    "city08": 34,
    "highway08": 34,
    "comb08": 34,
    "mpg_unit": "MPG",
    "fuelType": "Regular",
    "fuelType1": "Regular Gasoline",
    "fuelCost08": 1750,
    "fuelCost08_unit": "USD/year",
    "url": "https://www.fueleconomy.gov/ws/rest/vehicle/47736"
   }
  ]
 },
 "eia": {
  "series": [
   {
    "name": "California Regular All Formulations Retail Gasoline Prices (Weekly)",
    "series_id": "EMM_EPMR_PTE_SCA_DPG",
    "route": "/v2/petroleum/pri/gnd/data/",
    "frequency": "weekly",
    "facets": {
     "duoarea": [
      "SCA"
     ],
     "product": [
      "EPMR"
     ]
    },
    "process": "PTE",
    "units": "$/GAL",
    "note": "EIA does not publish Conventional Regular Gasoline (product=EPMRU) for California (duoarea=SCA) because California requires reformulated gasoline statewide; SCA only exposes EPMR (All Formulations) and EPMRR (Reformulated), which carry identical weekly values."
   },
   {
    "name": "U.S. Regular All Formulations Retail Gasoline Prices (Weekly)",
    "series_id": "EMM_EPMR_PTE_NUS_DPG",
    "route": "/v2/petroleum/pri/gnd/data/",
    "frequency": "weekly",
    "facets": {
     "duoarea": [
      "NUS"
     ],
     "product": [
      "EPMR"
     ]
    },
    "process": "PTE",
    "units": "$/GAL"
   }
  ],
  "last4": [
   {
    "series_id": "EMM_EPMR_PTE_SCA_DPG",
    "area": "CALIFORNIA",
    "product": "Regular Gasoline",
    "units": "$/GAL",
    "retrieved_date": "2026-11-19",
    "release_date": "2026-11-17",
    "values": [
     {
      "period": "2026-11-16",
      "value": 5.387
     },
     {
      "period": "2026-11-09",
      "value": 5.562
     },
     {
      "period": "2026-11-02",
      "value": 5.748
     },
     {
      "period": "2026-10-26",
      "value": 5.888
     }
    ]
   },
   {
    "series_id": "EMM_EPMR_PTE_NUS_DPG",
    "area": "U.S.",
    "product": "Regular Gasoline",
    "units": "$/GAL",
    "retrieved_date": "2026-11-19",
    "release_date": "2026-11-17",
    "values": [
     {
      "period": "2026-11-16",
      "value": 3.805
     },
     {
      "period": "2026-11-09",
      "value": 3.995
     },
     {
      "period": "2026-11-02",
      "value": 4.153
     },
     {
      "period": "2026-10-26",
      "value": 4.269
     }
    ]
   }
  ]
 }
};
