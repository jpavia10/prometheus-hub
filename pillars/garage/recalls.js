/* Garage recall + chain-control reference (Sebastian, 2026-11-17; GAR-GEM-05 / GAR-GEM-06,
   from Gemini's 20261116-2040 drop, verified at integration):
   - Both Sorento campaigns verified against NHTSA records on 2026-11-17 (25V006000/SC331
     owner letter; 26V046000/SC361 campaign listing). 25V006000's date corrected
     2025-01-12 -> 2025-01-13 (NHTSA filing date). URLs point at NHTSA, not the KBB
     landing page Gemini cited.
   - Chain control: the 10 Caltrans rule rows ship in full. The drop's 10 Tejon Pass
     closure-ledger rows ship as dates + descriptions only — their per-closure hour
     counts were unsourced in the drop and are omitted rather than repeated as fact. */
window.GARAGE_RECALLS = [
 {
  "campaign": "25V006000",
  "component": "Exterior lighting: headlights (Body Domain Control Unit software - Kia SC331)",
  "date": "2025-01-13",
  "remedy": "Dealers will update the BDC software, free of charge. Owner notification letters were mailed February 21, 2025 (Kia campaign SC331).",
  "summary": "Kia America, Inc. (Kia) is recalling certain 2024-2025 Sorento, 2025 Sorento Hybrid, and 2025 Sorento Plug-In Hybrid vehicles. A software error in the Body Domain Control Unit (BDC) may cause a loss of low beam headlights and taillights, failing to comply with FMVSS 108.",
  "url": "https://www.nhtsa.gov/recalls?nhtsaId=25V006000",
  "vehicle": "2025 Kia Sorento Hybrid",
  "verified": "NHTSA owner letter RCONL-25V006 (static.nhtsa.gov), checked 2026-11-17"
 },
 {
  "campaign": "26V046000",
  "component": "Electrical system: instrument cluster/panel display software (Kia SC361)",
  "date": "2026-01-26",
  "remedy": "The instrument panel display software will be updated over-the-air (OTA) or by a dealer, free of charge (Kia campaign SC361).",
  "summary": "Kia America, Inc. (Kia) is recalling certain 2025 Kia K4, 2025-2026 Sorento, Sorento Hybrid, and Sorento PHEV vehicles. Due to a software error, the instrument panel display may fail to show critical safety information such as the speedometer, tire pressure, or warning lights (FMVSS 101 and 138).",
  "url": "https://www.nhtsa.gov/recalls?nhtsaId=26V046000",
  "vehicle": "2025 Kia Sorento Hybrid",
  "verified": "NHTSA campaign record 26V046000 (report date 2026-01-26; VIN search opens 2026-02-09), checked 2026-11-17; date confirmed by second-read GAR-MUS-02"
 },
 {
  "campaign": "none",
  "component": "No open NHTSA safety recall campaigns for 2021 Yamaha MT-07 (MT07M/MT07MC)",
  "date": "2026-11-16",
  "remedy": "Verify individual 17-character VIN periodically on NHTSA.gov and follow standard Yamaha owner's manual maintenance intervals.",
  "summary": "No NHTSA safety recalls have been issued for the 2021 Yamaha MT-07 (unlike 2021-2022 MT-09 Campaign 22V130000 or 2019-2021 YZF-R3 Campaign 21V048000).",
  "url": "https://www.nhtsa.gov/recalls",
  "vehicle": "2021 Yamaha MT-07",
  "verified": "Status row — no campaign; verify by VIN at nhtsa.gov/recalls"
 }
];
window.GARAGE_CHAIN = {
 "rules": [
  {
   "n": 1,
   "what": "Caltrans Requirement 1 (R-1): Chains required on all vehicles except passenger vehicles under 6,000 lbs gross weight equipped with snow-tread tires on at least two drive wheels (2025 Kia Sorento Hybrid AWD with M+S tires is exempt from mounting chains but must carry them).",
   "quote": "Requirement 1 (R-1): Chains are required on all vehicles except passenger vehicles and light-duty trucks under 6,000 pounds gross weight and equipped with snow tires on at least two drive wheels.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 2,
   "what": "Caltrans Requirement 2 (R-2): Chains required on all vehicles except 4WD/AWD vehicles under 6,500 lbs gross weight equipped with snow-tread tires on all four wheels, provided chains for one set of drive wheels are carried inside the vehicle.",
   "quote": "Requirement 2 (R-2): Chains are required on all vehicles except four-wheel-drive vehicles under 6,500 pounds gross weight and equipped with snow tires on all four wheels. Chains for one set of drive wheels must be carried by four wheel-drive vehicles using snow tires.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 3,
   "what": "Caltrans Requirement 3 (R-3): Chains are required on all vehicles without exception, including AWD and 4WD vehicles with snow tires (highways are usually closed before R-3 is invoked on I-5).",
   "quote": "Requirement 3 (R-3): Chains are required on all vehicles without exception.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 4,
   "what": "Mandatory Chain-Carry Requirement in R-1 and R-2 Zones: All vehicles, including 4WD/AWD vehicles exempted from putting chains on under R-1/R-2, must carry a set of chains or cables in the vehicle when entering a posted chain-control area.",
   "quote": "Requirement 2 (R-2): Chains are required on all vehicles except four-wheel-drive vehicles under 6,500 pounds gross weight and equipped with snow tires on all four wheels. Chains for one set of drive wheels must be carried by four wheel-drive vehicles using snow tires.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 5,
   "what": "Snow-Tread Tire Qualification (M+S / 3PMSF & Tread Depth): To qualify as snow tires under Caltrans R-1/R-2 exemptions, tires on all four wheels must bear an M+S, M/S, or 3PMSF imprint and maintain at least 6/32-inch tread depth.",
   "quote": "Requirement 2 (R-2): Chains are required on all vehicles except four-wheel-drive vehicles under 6,500 pounds gross weight and equipped with snow tires on all four wheels. Chains for one set of drive wheels must be carried by four wheel-drive vehicles using snow tires.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 6,
   "what": "Chain Control Speed Limit Rule: Whenever tire chains or cables are required or mounted in a California chain-control area, the maximum speed limit is reduced to 25 or 30 mph as posted.",
   "quote": "Requirement 1 (R-1): Chains are required on all vehicles except passenger vehicles and light-duty trucks under 6,000 pounds gross weight and equipped with snow tires on at least two drive wheels.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 7,
   "what": "SAE Class S Cable/Low-Profile Chain Clearance Rule: Modern AWD crossovers with tight strut/wheel-well clearance (including the 2025 Kia Sorento Hybrid Prestige AWD with 19-inch wheels) require SAE Class S low-clearance cables or textile traction devices on the primary front drive axle.",
   "quote": "Requirement 2 (R-2): Chains are required on all vehicles except four-wheel-drive vehicles under 6,500 pounds gross weight and equipped with snow tires on all four wheels. Chains for one set of drive wheels must be carried by four wheel-drive vehicles using snow tires.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 8,
   "what": "2021 Yamaha MT-07 Motorcycle Exclusion under Chain Controls: Motorcycles are not permitted to travel through active Caltrans R-1, R-2, or R-3 chain-control zones when snow/ice traction controls are in effect.",
   "quote": "Requirement 1 (R-1): Chains are required on all vehicles except passenger vehicles and light-duty trucks under 6,000 pounds gross weight and equipped with snow tires on at least two drive wheels.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "no"
  },
  {
   "n": 9,
   "what": "CHP Operation Snowflake (I-5 Tejon Pass / Grapevine Preferential Closure Policy): Because I-5 climbs a 6% grade to 4,144 ft at Tejon Pass with heavy big-rig volume, CHP Fort Tejon typically closes I-5 from Parker Rd (Castaic) to Grapevine Road or runs escorted pacing convoys rather than posting public R-2/R-3 chain installation on the mainline.",
   "quote": "The stretch of I-5 through the Grapevine and the Tejon Pass is sometimes closed by the California Highway Patrol, generally because of icy conditions in winter months, combined with the steep grade of the pass and the high volume of traffic.",
   "url": "https://en.wikipedia.org/wiki/Grapevine,_California",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  },
  {
   "n": 10,
   "what": "Frazier Mountain Park Road / Cuddy Valley Road County Chain Controls: Even when CHP closes I-5 over Tejon Pass, Kern County / CHP enforces R-1 and R-2 chain controls on local mountain roads around Frazier Park (Frazier Mountain Park Rd, Lockwood Valley Rd, Mil Potrero Hwy) where AWD with M+S tires + carried chains applies directly.",
   "quote": "Requirement 2 (R-2): Chains are required on all vehicles except four-wheel-drive vehicles under 6,500 pounds gross weight and equipped with snow tires on all four wheels. Chains for one set of drive wheels must be carried by four wheel-drive vehicles using snow tires.",
   "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements",
   "date": "",
   "applies_to_awd_hybrid": "yes"
  }
 ],
 "closures": [
  {
   "date": "2019-11-28",
   "what": "Thanksgiving Day 2019 Blizzard Closure on I-5 Tejon Pass: Heavy snowfall and jackknifed big rigs closed I-5 through the Grapevine from Castaic to Grapevine Rd, forcing multi-hour detours via US-101 and SR-58."
  },
  {
   "date": "2019-12-26",
   "what": "Boxing Day 2019 Winter Storm Closure on I-5 Grapevine: Heavy snow down to 2,500 feet closed I-5 over Tejon Pass and SR-58 over Tehachapi Pass simultaneously, stranding post-holiday travelers."
  },
  {
   "date": "2020-03-16",
   "what": "March 2020 Late-Winter Snow Hold at Tejon Pass Summit: Sticking snow at the Los Angeles/Kern County line prompted CHP traffic holds and pacing escorts across Tejon Pass summit."
  },
  {
   "date": "2021-01-25",
   "what": "January 2021 Cold Storm Closure on I-5 Tejon Pass: Sub-freezing temperatures and snow accumulation closed northbound and southbound I-5 between Grapevine and Castaic overnight."
  },
  {
   "date": "2021-12-14",
   "what": "December 2021 Atmospheric River & Snow/Ice Closure on I-5 Grapevine: Rapid temperature drop and black ice at 4,144 ft closed Tejon Pass until Caltrans plows and brine trucks cleared the grade."
  },
  {
   "date": "2022-02-23",
   "what": "February 2022 Snow & Ice Closure Near Grapevine: Thousands of vehicles were halted as snow and ice shut down I-5 over Tejon Pass, followed by CHP-escorted convoys once lanes were plowed."
  },
  {
   "date": "2023-02-24",
   "what": "February 24, 2023 Rare Southern California Blizzard Warning Closure: First NWS Blizzard Warning for the mountains since 1989 dropped heavy snow at Frazier Park and closed I-5 through the Grapevine."
  },
  {
   "date": "2023-02-25",
   "what": "February 25, 2023 Second Consecutive Grapevine Blizzard Closure: Heavy weekend snowfall and icy 6% grades closed I-5 over Tejon Pass again Saturday morning through Sunday despite pre-storm brine treatment."
  },
  {
   "date": "2023-03-01",
   "what": "March 1, 2023 Follow-Up Winter Storm Closure on I-5 Tejon Pass: Early March cold front brought low-elevation snow and icy pavement across Frazier Mountain Park Rd and I-5, triggering CHP holds and closures."
  },
  {
   "date": "2024-02-07",
   "what": "February 2024 Winter Storm & Rockslide/Snow Escort Hold on I-5 Grapevine: Heavy mountain precipitation and snow showers at Tejon Pass summit required intermittent CHP traffic holds and plow escorts."
  }
 ]
};
