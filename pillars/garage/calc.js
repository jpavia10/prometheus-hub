/* Garage math (Sebastian, 2026-11-09): pure fuel + service-due calculations. No DOM, no storage.
   window.GARAGE = { fuelStats, dueStatus } */
(function () {
  "use strict";
  /** entries: [{date, odometer, gallons, cost}] any order. MPG uses the span between the first and
      last odometer readings and all gallons logged after the first entry (the first fill starts the tank). */
  function fuelStats(entries) {
    const es = [...entries].sort((a, b) => a.odometer - b.odometer);
    if (es.length < 2) return { fills: es.length, miles: 0, gallons: 0, mpg: null, costPerMile: null, totalCost: es.reduce((s, e) => s + (e.cost || 0), 0) };
    const miles = es[es.length - 1].odometer - es[0].odometer;
    const gallons = es.slice(1).reduce((s, e) => s + (e.gallons || 0), 0);
    const totalCost = es.reduce((s, e) => s + (e.cost || 0), 0);
    return { fills: es.length, miles, gallons, mpg: gallons > 0 ? miles / gallons : null, costPerMile: miles > 0 ? totalCost / miles : null, totalCost };
  }
  const addMonths = (ds, m) => { const d = new Date(ds + "T12:00:00"); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); };
  /** item: {name, miles (interval), months (interval)}; last: {date, odometer} of last service;
      now: {date, odometer}. Due when EITHER trigger passes; the sooner trigger governs. */
  function dueStatus(item, last, now) {
    if (!last) return { state: "unknown", dueDate: null, dueMiles: null };
    /* GAR-GEM-05 acceptance vocabulary (2026-11-17): Gemini's spec calls this with
       {everyMiles, everyMonths} intervals and {miles} odometer readings. Normalize
       those aliases to the shipped field names; shipped callers are unaffected. */
    if (item.everyMiles != null && item.miles == null) item = { ...item, miles: item.everyMiles };
    if (item.everyMonths != null && item.months == null) item = { ...item, months: item.everyMonths };
    if (last.odometer == null && last.miles != null) last = { ...last, odometer: last.miles };
    if (now.odometer == null && now.miles != null) now = { ...now, odometer: now.miles };
    const dueDate = item.months ? addMonths(last.date, item.months) : null;
    const dueMiles = item.miles ? last.odometer + item.miles : null;
    const milesLeft = dueMiles != null ? dueMiles - now.odometer : null;
    const daysLeft = dueDate ? Math.round((new Date(dueDate + "T12:00:00") - new Date(now.date + "T12:00:00")) / 864e5) : null;
    let state = "ok";
    if ((milesLeft != null && milesLeft <= 0) || (daysLeft != null && daysLeft <= 0)) state = "overdue";
    else if ((milesLeft != null && milesLeft <= 500) || (daysLeft != null && daysLeft <= 30)) state = "due soon";
    return { state, dueDate, dueMiles, milesLeft, daysLeft };
  }
  const GARAGE = { fuelStats, dueStatus, addMonths };
  if (typeof window !== "undefined") window.GARAGE = GARAGE;
  if (typeof globalThis !== "undefined") globalThis.GARAGE = GARAGE;
})();
