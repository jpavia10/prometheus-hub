/* NYSE cash session, from the same public calendar as pillars/icarus/market-days.js (2026–2028).
   Regular hours 9:30–16:00 America/New_York; an early close ends at 13:00. Weekends are closed.
   The label is only open or closed. No prices. */
const FULL = new Set([
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
  "2028-01-17", "2028-02-21", "2028-04-14", "2028-05-29", "2028-06-19", "2028-07-04", "2028-09-04", "2028-11-23", "2028-12-25",
]);
const EARLY = new Set(["2026-11-27", "2026-12-24", "2027-11-26", "2028-07-03", "2028-11-24"]);

function nyParts(now) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const g = (t) => parts.find((p) => p.type === t).value;
  const hour = Number(g("hour")) % 24;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, weekday: g("weekday"), mins: hour * 60 + Number(g("minute")) };
}

/** { open, date, early, label } — label is "NYSE open" or "NYSE closed". */
export function nyseSession(now = new Date()) {
  const { date, weekday, mins } = nyParts(now);
  const early = EARLY.has(date);
  const shut = weekday === "Sat" || weekday === "Sun" || FULL.has(date);
  const open = !shut && mins >= 9 * 60 + 30 && mins < (early ? 13 * 60 : 16 * 60);
  return { open, date, early, label: open ? "NYSE open" : "NYSE closed" };
}
