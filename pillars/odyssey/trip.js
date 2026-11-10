/* Odyssey trip logic (Sebastian, 2026-11-10): pure packing-list generation. No DOM.
   Rules keyed to trip context: nights, weather flags, and trip kind. No generic filler —
   every line traces to a rule. window.TRIP = { packingList, HOME_CHECKS } */
(function () {
  "use strict";
  const HOME_CHECKS = ["Water heater / pipes set for absence", "Doors + windows locked, deck secured", "Trash out, fridge perishables cleared", "Mail held or collected", "Car parked + fueled", "Lights / timers set", "Plants + any animals covered", "Thermostat set"];
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
