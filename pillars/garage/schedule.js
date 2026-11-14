/* Garage factory schedule (Grok, 2026-11-10): hybrid SUV (US maintenance table) — Kia America Owner's Manual,
   Maintenance ch. 9: severe conditions p. 9-9, normal table p. 9-10, footnotes p. 9-11, severe table p. 9-12.
   Source PDF via owners.kia.com > Manuals (document 328-6829), sha256 in .source. Every interval below is
   transcribed from those pages; 'More frequently' rows carry no number in the manual and are flagged, not guessed.
   Drive drop: GARAGE-GROK-kia-maintenance_20261110-1656.json (Prometheus Hub incoming). */
window.GARAGE_SCHEDULE = {
 "dataset": "GARAGE-GROK-kia-maintenance",
 "vehicle": "hybrid SUV, US maintenance table",
 "generated_utc": "2026-11-10T16:56Z",
 "source": {
  "title": "hybrid SUV owner's manual (Kia America, (c)2024; file 'hybrid-suv-om.pdf', 620 pages, PDF created 2024-03-26, modified 2024-04-23)",
  "portal": "https://owners.kia.com/us/en/manuals.html",
  "portal_path": "owners.kia.com > Manuals > 2025 > hybrid SUV > 'hybrid SUV owner's manual' (document 328-6829)",
  "pdf_url": "https://www.kiatechinfo.com/files/328/6829/hybrid-suv-om.pdf",
  "pdf_url_note": "PDF is served by Kia's KGIS host after the owners.kia.com Manuals page hands off a session token; open via the portal if the direct link 403s/empties",
  "sha256": "c04bb5cf3e70e23ee4639c48e3ccd0010eb26a72ed60213fdc3fec5ef54aa9c7",
  "sections": {
   "severe_conditions_list": "Scheduled maintenance service precaution, p. 9-9 (PDF p. 518)",
   "normal_table": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnotes": "Footnotes *1-*8, p. 9-11 (PDF p. 520)",
   "severe_table": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)"
  }
 },
 "rules": {
  "whichever_first": "Where both mileage and date are shown, the frequency of service is determined by whichever occurs first (p. 9-10)",
  "codes": {
   "I": "Inspect and if necessary, adjust, correct, clean or replace",
   "R": "Replace or change"
  },
  "after_10y_100k": "After 10 years or 100,000 miles (150,000 km), we recommend to using severe maintenance schedule (p. 9-9)",
  "oil_life_system": "If recommended engine oil is not used, replace engine oil per severe schedule (p. 9-9)"
 },
 "severe_conditions": {
  "A": "Repeatedly driving short distance <5 mi (normal temp) or <10 mi (freezing)",
  "B": "Extensive engine idling or low speed driving for long distances",
  "C": "Rough, dusty, muddy, unpaved, graveled or salted roads",
  "D": "Areas using salt or other corrosive materials or very cold weather",
  "E": "Heavy dust",
  "F": "Heavy traffic area",
  "G": "Uphill, downhill, or mountain roads repeatedly",
  "H": "Towing or camping, loading on the roof",
  "I": "Patrol car, taxi, other commercial use, vehicle towing",
  "J": "Frequently high speed or rapid accel/decel",
  "K": "Frequently stop-and-go"
 },
 "frazier_park_note": "Condition G (uphill/downhill/mountain roads repeatedly) applies per a mountain-road profile. Condition D (salt / very cold weather) likely applies in winter and is the trigger for the 5,000 mi / 6 mo oil interval - G alone does not change the oil interval in Kia's table. Flagged, not assumed.",
 "items": [
  {
   "n": 1,
   "item": "Tire rotation",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "rotate",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 2,
   "item": "Fuel additives",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "add",
     "miles": 8000,
     "months": 12,
     "note": "Only if TOP TIER Detergent Gasoline is not available (footnote *1)"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*1 p. 9-11"
  },
  {
   "n": 3,
   "item": "Engine oil and engine oil filter",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "R",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": 5000,
    "months": 6,
    "conditions": [
     "D",
     "H",
     "I"
    ],
    "note": null,
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*2 p. 9-11"
  },
  {
   "n": 4,
   "item": "Climate control air filter",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    },
    {
     "action": "R",
     "miles": 16000,
     "months": 24
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "E",
     "G"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 5,
   "item": "Air cleaner filter (engine)",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    },
    {
     "action": "R",
     "miles": 24000,
     "months": 36
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "E"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 6,
   "item": "Brake fluid",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    },
    {
     "action": "R",
     "miles": 48000,
     "months": 48
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 7,
   "item": "Spark plugs",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "R",
     "miles": 48000,
     "months": null,
     "note": "Manual gives miles only, no months"
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": null,
    "months": null,
    "conditions": [
     "A",
     "B",
     "F",
     "G",
     "H",
     "I",
     "K"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 8,
   "item": "Coolant (engine)",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "R",
     "miles": 24000,
     "months": 24,
     "first_at": {
      "miles": 120000,
      "months": 120
     },
     "note": "First replace at 120,000 mi / 120 mo, then every 24,000 mi / 24 mo"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*3 p. 9-11"
  },
  {
   "n": 9,
   "item": "Coolant (inverter, HEV)",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "R",
     "miles": 24000,
     "months": 24,
     "first_at": {
      "miles": 120000,
      "months": 120
     },
     "note": "First replace at 120,000 mi / 120 mo, then every 24,000 mi / 24 mo"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*4 p. 9-11"
  },
  {
   "n": 10,
   "item": "Air conditioner refrigerant",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 11,
   "item": "Air conditioner compressor",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 12,
   "item": "Battery condition",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 13,
   "item": "Brake discs and pads",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "I",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "D",
     "E",
     "G",
     "H",
     "I",
     "J",
     "K"
    ],
    "note": "Severe row reads 'Brake discs, pads and calipers' - 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 14,
   "item": "Brake lines, hoses and connections",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 15,
   "item": "Suspension ball joints",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "I",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "D",
     "E",
     "G",
     "H",
     "I"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 16,
   "item": "Steering gear rack, linkage and boots",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "I",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "D",
     "E",
     "F",
     "G",
     "H",
     "I"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 17,
   "item": "Exhaust system",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 18,
   "item": "Cooling system",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 19,
   "item": "Intercooler in/out hose, air intake hose",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 16000,
     "months": 24,
     "first_at": {
      "miles": 8000,
      "months": 12
     },
     "note": "Chart marks I at 8k/24k/40k/56k/72k/88k mi (12/36/60/84/108/132 mo)"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 20,
   "item": "Drive shaft and boots",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 16000,
     "months": 24,
     "note": "Chart marks I at 16k/32k/48k... mi (24/48/72... mo)"
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "I",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "D",
     "E",
     "F",
     "G",
     "H",
     "I",
     "J"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 21,
   "item": "Propeller shaft",
   "applies_to": "HEV AWD",
   "normal": [
    {
     "action": "I",
     "miles": 16000,
     "months": 24,
     "note": "Chart marks I at 16k/32k/48k... mi (24/48/72... mo)"
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "I",
    "miles": null,
    "months": null,
    "conditions": [
     "C",
     "D",
     "E",
     "F",
     "G",
     "H",
     "I",
     "J"
    ],
    "note": "Manual says 'More frequently' (no number)",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 22,
   "item": "Fuel tank and fuel cap",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 16000,
     "months": 24,
     "note": "Chart marks I at 16k/32k/48k... mi (24/48/72... mo)"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 23,
   "item": "Fuel tank air filter",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 16000,
     "months": 24,
     "note": "Chart marks I at 16k/32k/48k... mi (24/48/72... mo)"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 24,
   "item": "Fuel lines, hoses and connections",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 16000,
     "months": 24,
     "note": "Chart marks I at 16k/32k/48k... mi (24/48/72... mo)"
    }
   ],
   "severe": {
    "listed_in_severe_table": false,
    "action": null,
    "miles": null,
    "months": null,
    "conditions": [],
    "note": "Not listed in severe table; normal interval applies",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  },
  {
   "n": 25,
   "item": "HSG (Hybrid Starter & Generator) belt",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "I",
     "miles": 8000,
     "months": 12
    },
    {
     "action": "R",
     "miles": 64000,
     "months": 48
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R+I",
    "miles": 30000,
    "months": 24,
    "conditions": [
     "B",
     "C",
     "D",
     "E",
     "I",
     "K"
    ],
    "note": "Severe: Replace every 30,000 mi / 24 mo; Inspect every 5,000 mi / 6 mo",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "inspect": {
     "miles": 5000,
     "months": 6
    },
    "applies_frazier_G": false,
    "applies_frazier_D_if_snow_salt_cold": true
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*6 p. 9-11"
  },
  {
   "n": 26,
   "item": "Differential oil (rear)",
   "applies_to": "HEV AWD",
   "normal": [
    {
     "action": "I",
     "miles": 40000,
     "months": 48
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": 72000,
    "months": null,
    "conditions": [
     "C",
     "E",
     "G",
     "H",
     "I",
     "J"
    ],
    "note": "Severe gives miles only (72,000 mi), no months",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*7 p. 9-11"
  },
  {
   "n": 27,
   "item": "Transfer case oil",
   "applies_to": "HEV AWD",
   "normal": [
    {
     "action": "I",
     "miles": 40000,
     "months": 48
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": 72000,
    "months": null,
    "conditions": [
     "C",
     "E",
     "G",
     "H",
     "I",
     "J"
    ],
    "note": "Severe gives miles only (72,000 mi), no months",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": "*8 p. 9-11"
  },
  {
   "n": 28,
   "item": "Automatic transmission (AT) fluid",
   "applies_to": "HEV",
   "normal": [
    {
     "action": "none",
     "miles": null,
     "months": null,
     "note": "Normal schedule: 'No service required'"
    }
   ],
   "severe": {
    "listed_in_severe_table": true,
    "action": "R",
    "miles": 56000,
    "months": null,
    "conditions": [
     "A",
     "C",
     "F",
     "G",
     "H",
     "I",
     "J",
     "K"
    ],
    "note": "Severe gives miles only (56,000 mi), no months",
    "citation": "Maintenance under severe usage conditions, p. 9-12 (PDF p. 521)",
    "applies_frazier_G": true,
    "applies_frazier_D_if_snow_salt_cold": false
   },
   "citation": "Normal maintenance schedule, p. 9-10 (PDF p. 519)",
   "footnote": null
  }
 ],
 "garage_services_normal": [
  {
   "name": "Engine oil + filter",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "Tire rotation",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "Cabin (climate control) air filter - replace",
   "miles": 16000,
   "months": 24
  },
  {
   "name": "Engine air filter - replace",
   "miles": 24000,
   "months": 36
  },
  {
   "name": "Brake fluid - replace",
   "miles": 48000,
   "months": 48
  },
  {
   "name": "Spark plugs",
   "miles": 48000,
   "months": null
  },
  {
   "name": "Engine coolant (first at 120k mi / 120 mo, then 24k/24)",
   "miles": 120000,
   "months": 120
  },
  {
   "name": "Inverter coolant HEV (first at 120k mi / 120 mo, then 24k/24)",
   "miles": 120000,
   "months": 120
  },
  {
   "name": "HSG belt - inspect",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "HSG belt - replace",
   "miles": 64000,
   "months": 48
  },
  {
   "name": "Multi-point inspection (brakes, lines, suspension, steering, exhaust, cooling, A/C, battery)",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "Drive shaft/propeller shaft/fuel system inspect",
   "miles": 16000,
   "months": 24
  },
  {
   "name": "Rear differential + transfer case oil inspect (AWD)",
   "miles": 40000,
   "months": 48
  }
 ],
 "garage_services_severe_frazier": [
  {
   "name": "Engine oil + filter",
   "miles": 5000,
   "months": 6
  },
  {
   "name": "Tire rotation",
   "miles": 8000,
   "months": 12
  },
  {
   "name": "Cabin (climate control) air filter - replace (manual: more frequently than 16k/24)",
   "miles": 16000,
   "months": 24
  },
  {
   "name": "Engine air filter - replace (manual: more frequently than 24k/36 under C/E)",
   "miles": 24000,
   "months": 36
  },
  {
   "name": "Brake fluid - replace",
   "miles": 48000,
   "months": 48
  },
  {
   "name": "Spark plugs (manual: more frequently than 48k)",
   "miles": 48000,
   "months": null
  },
  {
   "name": "Engine coolant (first at 120k mi / 120 mo, then 24k/24)",
   "miles": 120000,
   "months": 120
  },
  {
   "name": "Inverter coolant HEV (first at 120k mi / 120 mo, then 24k/24)",
   "miles": 120000,
   "months": 120
  },
  {
   "name": "HSG belt - inspect",
   "miles": 5000,
   "months": 6
  },
  {
   "name": "HSG belt - replace",
   "miles": 30000,
   "months": 24
  },
  {
   "name": "Automatic transmission fluid - replace",
   "miles": 56000,
   "months": null
  },
  {
   "name": "Rear differential oil - replace (AWD)",
   "miles": 72000,
   "months": null
  },
  {
   "name": "Transfer case oil - replace (AWD)",
   "miles": 72000,
   "months": null
  },
  {
   "name": "Multi-point inspection (brakes, suspension, steering, drive/prop shaft - manual: more frequently)",
   "miles": 8000,
   "months": 12
  }
 ],
 "replaces_starter_values": {
  "Engine oil + filter": "8000/12 -> unchanged normal; severe 5000/6",
  "Tire rotation": "8000/12 -> unchanged",
  "Cabin air filter": "null/12 -> replace 16000/24 (inspect 8000/12)",
  "Engine air filter": "24000/24 -> replace 24000/36 (inspect 8000/12)",
  "Brake fluid": "null/24 -> replace 48000/48 (inspect 8000/12)",
  "Engine coolant": "60000/60 -> first 120000/120 then 24000/24",
  "Spark plugs": "97500/null -> 48000/null",
  "Hybrid system / HSG belt inspection": "7500/12 -> inspect 8000/12, replace 64000/48 (severe 5000/6 inspect, 30000/24 replace)"
 },
 "excluded": [
  "Coolant (Inverter) PHEV row (32,000 mi / 36 mo) - PHEV only, not this HEV"
 ]
};
