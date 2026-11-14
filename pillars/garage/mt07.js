/* MT-07 factory dataset (Sebastian, 2026-11-14): 2021 Yamaha MT-07 periodic maintenance,
   read line-by-line from the US owner's manual BAT-28199-10 (LIT-11626-34-63) periodic charts
   pp. 7-3–7-8, specs from the 2021–2022 service manual BAT-28197-10. US chart preferred where
   EU manuals disagree (valve interval, coolant). Battery carries no factory interval — it is
   condition-based in Yamaha's charts and ships with no triggers. */
window.MT07_SCHEDULE = {
 "services": [
  {
   "name": "Break-in (initial) service",
   "miles": 600,
   "months": 1
  },
  {
   "name": "Engine oil - change",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Engine oil filter cartridge - replace",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "Spark plugs - check condition, adjust gap and clean",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Spark plugs - replace",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "Valve clearance - check and adjust (engine cold)",
   "miles": 26600,
   "months": null
  },
  {
   "name": "Fuel injection (throttle body) synchronization - adjust",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Air filter element - replace",
   "miles": 24000,
   "months": null
  },
  {
   "name": "Air filter check hose - clean",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Coolant - change",
   "miles": 16000,
   "months": 24
  },
  {
   "name": "Cooling system - check coolant level, leakage and hoses",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Brake fluid - change",
   "miles": null,
   "months": 24
  },
  {
   "name": "Brake master cylinder and caliper internal components - replace",
   "miles": null,
   "months": 24
  },
  {
   "name": "Brake hoses - replace",
   "miles": null,
   "months": 48
  },
  {
   "name": "Front and rear brakes / brake pads - check operation, fluid level, leakage; replace pads if necessary",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Drive chain - check slack, alignment and condition; adjust and lubricate",
   "miles": 600,
   "months": null
  },
  {
   "name": "Throttle grip - check free play and adjust; lubricate cable and grip housing",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Clutch - check operation; adjust or replace cable (clutch lever free play)",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Steering bearings - repack with lithium-soap-based grease",
   "miles": 12000,
   "months": null
  },
  {
   "name": "Swingarm pivot bearings - repack with lithium-soap-based grease",
   "miles": 32000,
   "months": null
  },
  {
   "name": "Rear suspension link pivots - check operation",
   "miles": 8000,
   "months": null
  },
  {
   "name": "Front fork - check operation and for oil leakage",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Shock absorber assembly - check operation and for oil leakage",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Tires - check tread depth and damage; check and correct air pressure",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Wheels and wheel bearings - check runout, damage and bearing smoothness",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Chassis fasteners - check and correct",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Control cables - lubricate",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Lever, pedal and sidestand pivots - lubricate",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Fuel line - check hoses for cracks or damage",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Crankcase breather system - check breather hose",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Exhaust system - check for leakage, tighten, replace gaskets if necessary",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Diagnostic system - dynamic inspection with Yamaha diagnostic tool, check error codes",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Evaporative emission control system - check (California models only)",
   "miles": 12000,
   "months": null
  },
  {
   "name": "Lights, signals and switches - check operation; adjust headlight beam",
   "miles": 4000,
   "months": 6
  },
  {
   "name": "Battery - check condition and charge (no factory interval)",
   "miles": null,
   "months": null
  }
 ],
 "specs": [
  "Engine oil: Yamalube SAE 10W-40 (API SG or higher, JASO MA) — 2.30 L oil-only, 2.60 L with filter",
  "Drive chain: 525 sealed O-ring, 108 links — slack 51.0–56.0 mm measured guard-to-chain (limit 58 mm), lube every 600 mi",
  "Tires: 120/70 ZR17 front, 180/55 ZR17 rear — 33 psi front / 36 psi rear, cold",
  "Valve clearance (cold): intake 0.11–0.20 mm, exhaust 0.24–0.30 mm — check every 26,600 mi",
  "Coolant: replace every 16,000 mi / 24 months (US owner's manual chart)"
 ]
};
