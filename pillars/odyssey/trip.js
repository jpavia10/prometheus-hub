/* Odyssey trip logic (Sebastian, 2026-11-10): pure packing-list generation. No DOM.
   Rules keyed to trip context: nights, weather flags, and trip kind. No generic filler —
   every line traces to a rule. window.TRIP = { packingList, HOME_CHECKS }
   ODY-GEM-01 (Sebastian, 2026-11-17): HOME_CHECKS is now Gemini's 50-row Frazier Park
   winter away-mode countdown (odyssey_gemini_away-house_20261116-2040.json), structured
   as {n, task, daysBefore, why, source, url, critical?}. Tasks 40 and 49 were corrected
   at integration (see their "corrected" notes). Household specifics in the tasks are
   Gemini's compilation from Joseph's other homework drops — presented as his household
   checklist, not independently verified. Critical tasks (freeze + pet care) gate
   setAway() in app.js. §H: the furnace is never set below 55°F. */
(function () {
  "use strict";
  const HOME_CHECKS = [
  {
    "n": 1,
    "task": "Schedule USPS Hold Mail online for PO Box 380 / 733 Anacapa Trail if away 3 to 30 days",
    "daysBefore": 7,
    "why": "Prevents parcel notice slips and overflowing mail while away from Frazier Park.",
    "source": "USPS Hold Mail",
    "url": "https://www.usps.com/manage/hold-mail.htm"
  },
  {
    "n": 2,
    "task": "Verify Wolfgang's boarding or sitter handoff schedule, vet records, and emergency contact card",
    "daysBefore": 7,
    "why": "Ensures uninterrupted care and medical authorization for your Miniature Australian Shepherd.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 3,
    "task": "Confirm sitter check-in keys and backup access code for the 4 indoor cats (including Alexios)",
    "daysBefore": 7,
    "why": "Guarantees physical fallback access if automated feeders or power fail during a mountain storm.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 4,
    "task": "Inspect exterior hose bibs, disconnect all garden hoses, and drain residual water",
    "daysBefore": 5,
    "why": "Undrained hoses trap ice and burst exterior sillcocks when Frazier Park drops below freezing.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html",
    "critical": true
  },
  {
    "n": 5,
    "task": "Close interior shutoff valves supplying outdoor hose bibs and open outside spigots to drain",
    "daysBefore": 3,
    "why": "Removes standing water from exposed exterior pipe runs in sub-freezing mountain weather.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html",
    "critical": true
  },
  {
    "n": 6,
    "task": "Verify foam pipe insulation sleeves on exposed crawlspace, garage, and under-sink water supply lines",
    "daysBefore": 4,
    "why": "Prevents pipe freeze-ups during Frazier Park overnight winter lows in the teens and 20s.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html",
    "critical": true
  },
  {
    "n": 7,
    "task": "Locate and test the main residential water shutoff valve and label it clearly for the cat sitter",
    "daysBefore": 4,
    "why": "Allows immediate water shutoff if a supply line leaks or freezes while you are away.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html"
  },
  {
    "n": 8,
    "task": "Empty both Litter-Robot 4 waste drawers (Castor and Pollux) and install fresh waste liner bags",
    "daysBefore": 1,
    "why": "Gives maximum waste-drawer capacity across 4 cats before the drawer-full sensor pauses cycling.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "critical": true
  },
  {
    "n": 9,
    "task": "Top off clean clumping litter to the raised fill line inside both Litter-Robot 4 globes (Castor and Pollux)",
    "daysBefore": 1,
    "why": "Ensures proper sifting weight and prevents low-litter faults while away.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "critical": true
  },
  {
    "n": 10,
    "task": "Wipe Litter-Robot 4 curtain/DFI laser sensors with a dry cloth and run one manual test cycle on each unit",
    "daysBefore": 1,
    "why": "Clears dust buildup that causes false pinch-detect or bonnet-removed faults during multi-day trips.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 11,
    "task": "Verify both Litter-Robot 4 units (Castor and Pollux) are online in the Whisker app with push alerts enabled",
    "daysBefore": 1,
    "why": "Alerts you immediately if either globe stalls or loses power while away.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 12,
    "task": "Fill both Petlibro automated feeders (Ambrosia and Nectar) to capacity with dry kibble and seal desiccant packs",
    "daysBefore": 1,
    "why": "Prevents food bridging or empty hopper starvation across the 4 cats.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "critical": true
  },
  {
    "n": 13,
    "task": "Install fresh backup D-cell / alkaline batteries in both Petlibro feeders (Ambrosia and Nectar)",
    "daysBefore": 2,
    "why": "Keeps scheduled kibble meals dispensing on time even if a winter PSPS or snowstorm cuts wall power.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "critical": true
  },
  {
    "n": 14,
    "task": "Trigger a manual single-portion test feed on Ambrosia and Nectar and verify rotor clearance",
    "daysBefore": 1,
    "why": "Confirms the chute and impeller are unobstructed before departure.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 15,
    "task": "Scrub, replace carbon filters, and fill both Petlibro cat water fountains to the MAX line",
    "daysBefore": 1,
    "why": "Provides clean circulating water and maximizes reservoir volume before evaporation or pump cutoff.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 16,
    "task": "Set out two heavy ceramic non-tipping gravity water bowls as passive backup to the electric fountains",
    "daysBefore": 1,
    "why": "Guarantees the 4 cats have drinking water if a prolonged power outage stops fountain pumps.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "critical": true
  },
  {
    "n": 17,
    "task": "Empty dustbins, clean rollers, and clear hair from dual Roomba vacuums (Romulus and Remus)",
    "daysBefore": 1,
    "why": "Prevents brush jams or bin-full errors on scheduled runs while away.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 18,
    "task": "Pause unattended Roomba schedules on Romulus and Remus (or restrict to non-pet zones)",
    "daysBefore": 1,
    "why": "Prevents a robot vacuum from spreading a hairball/vomit accident or getting trapped on a cat toy.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 19,
    "task": "Prop open interior bathroom, laundry, and bedroom doors where cat litter or water stations sit",
    "daysBefore": 0,
    "why": "Prevents a cat from accidentally pushing a door shut and getting locked away from food, water, or litter.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 20,
    "task": "Set the home furnace thermostat to no lower than 55°F (60–62°F recommended with indoor cats)",
    "daysBefore": 0,
    "why": "Protects interior plumbing from freezing and keeps the 4 indoor cats safe during mountain cold snaps.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html",
    "critical": true
  },
  {
    "n": 21,
    "task": "Open kitchen and bathroom vanity cabinet doors beneath sinks on exterior walls",
    "daysBefore": 0,
    "why": "Allows warm indoor air to circulate around uninsulated drain and supply traps.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html"
  },
  {
    "n": 22,
    "task": "Set Govee Ceiling Light Ultra (office) and Govee Light Pro (foyer) to randomized evening away schedules",
    "daysBefore": 1,
    "why": "Simulates evening occupancy through windows while keeping overnight power draw minimal.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 23,
    "task": "Verify all exterior Ring cameras have 100% battery charge or active solar/hardwired trickle charge",
    "daysBefore": 2,
    "why": "Cold mountain temperatures reduce lithium battery voltage; full charge prevents blind spots.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 24,
    "task": "Test Ring camera Live View, motion zones, and cellular/Starlink alert push notifications on S24 Ultra",
    "daysBefore": 1,
    "why": "Confirms perimeter monitoring and driveway visibility before leaving 733 Anacapa Trail.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 25,
    "task": "Enable Starlink dish 'Automatic' snow melt / heater mode in the Starlink app",
    "daysBefore": 1,
    "why": "Prevents snow and ice accumulation on the dish from dropping home connectivity for pet feeders and cameras.",
    "source": "NWS API Documentation",
    "url": "https://www.weather.gov/documentation/services-web-API"
  },
  {
    "n": 26,
    "task": "Verify UPS battery backup health on the Starlink router and home network switch",
    "daysBefore": 2,
    "why": "Keeps Starlink and Wi-Fi telemetry online through brief winter grid flickers so alerts still transmit.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 27,
    "task": "Shut off the washing machine hot/cold supply valves or inspect braided stainless supply hoses",
    "daysBefore": 1,
    "why": "Eliminates the #1 source of catastrophic unattended interior appliance flooding.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html"
  },
  {
    "n": 28,
    "task": "Set water heater to Vacation/Low mode (if not feeding hydronic heating) and check drain pan sensor",
    "daysBefore": 0,
    "why": "Reduces standby gas/electric burn while preventing scalding leaks.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html"
  },
  {
    "n": 29,
    "task": "Clear perishable food from the refrigerator, run the garbage disposal with vinegar/water, and empty all trash cans",
    "daysBefore": 1,
    "why": "Prevents odors, fruit flies, and spoilage if a multi-day power outage occurs.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 30,
    "task": "Unplug non-essential high-draw workstation and AV electronics (85-inch Samsung TV, PS5, Edifier MR5/T5 sub, LG 45-inch OLED)",
    "daysBefore": 0,
    "why": "Eliminates phantom load and protects sensitive electronics from post-outage grid surge spikes.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 31,
    "task": "Connect the 2021 Yamaha MT-07 battery to a smart AGM battery tender and verify green maintenance LED",
    "daysBefore": 1,
    "why": "Cold garage temperatures discharge motorcycle lead-acid/AGM batteries rapidly if left uncharged.",
    "source": "Yamaha MT-07 Owner Manual",
    "url": "https://maintenanceschedule.com/wp-content/uploads/2023/01/2021-Yamaha-MT-07-manual-US-new-design.pdf"
  },
  {
    "n": 32,
    "task": "Check 2021 Yamaha MT-07 tire pressures (33 psi front / 36 psi rear), fuel stabilizer, and center/paddock stand stability",
    "daysBefore": 2,
    "why": "Prevents flat-spotting and fuel gum buildup while parked in the cold garage.",
    "source": "Yamaha MT-07 Owner Manual",
    "url": "https://maintenanceschedule.com/wp-content/uploads/2023/01/2021-Yamaha-MT-07-manual-US-new-design.pdf"
  },
  {
    "n": 33,
    "task": "Verify Prodecotech Phantom XR e-bike lithium battery is stored indoors at 40–70% state of charge and unplugged from charger",
    "daysBefore": 2,
    "why": "Prevents lithium cell degradation from sub-freezing garage temps and eliminates unattended charging risk.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 34,
    "task": "Lock the Titan Reliquary coin & precious metals collection inside the fireproof safe and verify desiccant packs",
    "daysBefore": 1,
    "why": "Secures bullion and numismatic specimens against theft and winter humidity swings.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 35,
    "task": "Seal Continuity emergency binder and verify encrypted .vault.json backup is up to date",
    "daysBefore": 2,
    "why": "Ensures critical policy numbers and emergency recovery records are accessible remotely if needed.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 36,
    "task": "Walk the multi-story deck rebuild site: secure loose lumber, tarps, Simpson Strong-Tie hardware bins, and tools",
    "daysBefore": 1,
    "why": "High winter ridge winds through Tejon Pass / Frazier Park can turn unsecured boards or tarps into projectiles.",
    "source": "NWS API Documentation",
    "url": "https://www.weather.gov/documentation/services-web-API"
  },
  {
    "n": 37,
    "task": "Unplug DEWALT battery chargers, saws, and air compressors in the workshop/deck work area",
    "daysBefore": 0,
    "why": "Eliminates workshop fire hazards and parasitic power draw while away.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 38,
    "task": "Clear pine needles, leaves, and debris from roof valleys, gutters, and deck scuppers/drains",
    "daysBefore": 2,
    "why": "Prevents ice dams and meltwater backup against the house ledger board during snowmelt.",
    "source": "American Red Cross",
    "url": "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/winter-storm/frozen-pipes.html"
  },
  {
    "n": 39,
    "task": "Place snow stakes/markers along driveway edges and park snow shovels and ice melt inside the garage door",
    "daysBefore": 1,
    "why": "Allows you or a plow operator to clear snow safely upon return without hitting landscaping or deck footings.",
    "source": "Caltrans Winter Driving",
    "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements"
  },
  {
    "n": 40,
    "task": "Verify ReadyKern alert profile includes 733 Anacapa Trail and your Kern County evacuation zone (Genasys Protect; Gemini's drop lists KCF-114 — not a real format: Kern Genasys zones use the KRN- prefix, so look the zone up, do not hunt for this code)",
    "daysBefore": 2,
    "why": "Ensures immediate SMS/voice alerts on your S24 Ultra if a winter storm or wildfire impacts Frazier Park while away.",
    "source": "Kern County Fire ReadyKern",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "corrected": "Typo fixed (\"andKern\"); the KCF-114 zone code is Gemini's invention — Kern County Genasys zones use the KRN- prefix (e.g. KRN-100, KRN-455); second-read ODY-MUS-02 confirmed. Look the real zone up in Genasys Protect."
  },
  {
    "n": 41,
    "task": "Check 2025 Kia Sorento Hybrid cold tire pressures (35 psi all four tires + spare/inflator kit) before departure",
    "daysBefore": 1,
    "why": "Mountain elevation and cold ambient temperatures drop tire pressure ~1 psi per 10°F.",
    "source": "Caltrans Winter Driving",
    "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements"
  },
  {
    "n": 42,
    "task": "Verify 2025 Kia Sorento Hybrid windshield washer reservoir is filled with -20°F de-icer fluid and wiper blades are intact",
    "daysBefore": 1,
    "why": "Standard summer bug-wash freezes solid on the windshield over Tejon Pass.",
    "source": "Caltrans Winter Driving",
    "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements"
  },
  {
    "n": 43,
    "task": "Load SAE Class S tire chains/cables sized for the 2025 Kia Sorento Hybrid into the rear cargo area",
    "daysBefore": 1,
    "why": "Caltrans R-2 chain controls require AWD vehicles on snow-tread tires to carry chains for one set of drive wheels.",
    "source": "Caltrans Chain Requirements",
    "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements"
  },
  {
    "n": 44,
    "task": "Verify NHTSA recall software updates (BDC 25V006000 / SC331 and Cluster 26V046000 / SC361) on 2025 Kia Sorento Hybrid",
    "daysBefore": 3,
    "why": "Ensures low-beam headlights, taillights, and instrument cluster displays will not blank out during night/winter driving.",
    "source": "KBB NHTSA Recall Summary",
    "url": "https://www.kbb.com/kia/sorento-hybrid/2025/recall/"
  },
  {
    "n": 45,
    "task": "Pack emergency winter kit in the Kia Sorento Hybrid (headlamp, wool blanket, water, rations, tow strap, ice scraper, gloves)",
    "daysBefore": 1,
    "why": "Protects occupants if I-5 Tejon Pass / Grapevine closes for hours due to ice or spinouts.",
    "source": "Caltrans Winter Driving",
    "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements"
  },
  {
    "n": 46,
    "task": "Check Caltrans QuickMap and NWS Hanford/LOX forecast for I-5 Tejon Pass and Frazier Mountain Park Rd",
    "daysBefore": 0,
    "why": "Verifies live chain controls, high-wind advisories, or snow closures before pulling out of the driveway.",
    "source": "Caltrans Chain Requirements",
    "url": "https://dot.ca.gov/travel/winter-driving-tips/chain-requirements"
  },
  {
    "n": 47,
    "task": "Toggle Odyssey 'Away Mode' ON in Prometheus Hub to publish return deadline and freeze-watch alerts",
    "daysBefore": 0,
    "why": "Broadcasts away state across Hub Today, Briefing, Bastion, and Kairos.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 48,
    "task": "Check all windows, sliding deck doors, and deadbolts, and confirm garage door is fully closed",
    "daysBefore": 0,
    "why": "Secures the residence against drafts, wildlife, and unauthorized entry.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  },
  {
    "n": 49,
    "task": "Take a timestamped departure photo of the stove knobs (OFF), main thermostat (60–62°F with the cats home — never below 55°F), and cat feeder hoppers",
    "daysBefore": 0,
    "why": "Gives peace-of-mind visual verification while on the road.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/",
    "corrected": "Thermostat range corrected to match task 20 and the spec §H floor (55°F minimum; 60–62°F with indoor cats). Gemini's task 49 said 58–60°F."
  },
  {
    "n": 50,
    "task": "Send departure text to trusted neighbor / cat sitter with exact return date, Kia plate, and emergency shutoff locations",
    "daysBefore": 0,
    "why": "Closes the loop with your local Frazier Park contact in case Ring or Whisker flags an issue.",
    "source": "ReadyKern Preparedness",
    "url": "https://kerncountyfire.org/education-safety/ready-kern/"
  }
];
  function packingList(trip) {
    const out = new Set(["Phone charger + battery bank", "ID + cards + cash", "Medications (trip length + 2 days)", "Toiletries kit"]);
    const n = Math.max(1, Math.round((new Date(trip.end + "T12:00:00") - new Date(trip.start + "T12:00:00")) / 864e5) + 1);
    out.add(`Clothing for ${n} day${n === 1 ? "" : "s"} + 1 spare set`);
    if (trip.cold) { out.add("Insulated layer + warm hat"); out.add("Lip balm + moisturizer (dry mountain air)"); }
    if (trip.rain) { out.add("Rain shell"); out.add("Waterproof bag for electronics"); }
    if (trip.beach) { out.add("Swim kit + sunscreen"); out.add("Sandals"); }
    if (trip.work) { out.add("Laptop + charger"); out.add("One clean presentation outfit"); }
    if (trip.car) { out.add("Car kit check (see Bastion)"); out.add("Offline maps downloaded — mountain signal dies fast"); }
    if (n >= 4) out.add("Laundry bag");
    if (trip.kids) { out.add("Violet's kit: change of clothes, snacks, comfort item, tablet + headphones"); }
    return [...out];
  }
  const T = { packingList, HOME_CHECKS };
  if (typeof window !== "undefined") window.TRIP = T;
  if (typeof globalThis !== "undefined") globalThis.TRIP = T;
})();
