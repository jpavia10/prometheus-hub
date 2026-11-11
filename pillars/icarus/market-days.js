/* Icarus market days (Sebastian, 2026-11-09): NYSE holidays + early closes 2026-2028, CORRECTED.
   The research deliverable (ICA-GEM-03) listed 68 rows, but every event was duplicated (the NYSE page's
   multi-column table scraped twice over): 34 unique events, all with correct dates. This file carries the
   34 deduplicated events plus 2027-12-31 (New Year 2028 observance) which the deliverable missed: 35 total
   (30 full closures incl. the observance, 5 early closes at 13:00 ET). Source: nyse.com hours calendar. */
window.ICARUS_MARKET_DAYS = [
 {
  "date": "2026-01-01",
  "kind": "full closure",
  "name": "New Year's Day",
  "close": null
 },
 {
  "date": "2026-01-19",
  "kind": "full closure",
  "name": "MLK, Jr. Day",
  "close": null
 },
 {
  "date": "2026-02-16",
  "kind": "full closure",
  "name": "Presidents Day",
  "close": null
 },
 {
  "date": "2026-04-03",
  "kind": "full closure",
  "name": "Good Friday",
  "close": null
 },
 {
  "date": "2026-05-25",
  "kind": "full closure",
  "name": "Memorial Day",
  "close": null
 },
 {
  "date": "2026-06-19",
  "kind": "full closure",
  "name": "Juneteenth",
  "close": null
 },
 {
  "date": "2026-07-03",
  "kind": "full closure",
  "name": "Independence Day (Observed)",
  "close": null
 },
 {
  "date": "2026-09-07",
  "kind": "full closure",
  "name": "Labor Day",
  "close": null
 },
 {
  "date": "2026-11-26",
  "kind": "full closure",
  "name": "Thanksgiving Day",
  "close": null
 },
 {
  "date": "2026-11-27",
  "kind": "early close",
  "name": "Day after Thanksgiving",
  "close": "13:00 ET"
 },
 {
  "date": "2026-12-24",
  "kind": "early close",
  "name": "Christmas Eve",
  "close": "13:00 ET"
 },
 {
  "date": "2026-12-25",
  "kind": "full closure",
  "name": "Christmas Day",
  "close": null
 },
 {
  "date": "2027-01-01",
  "kind": "full closure",
  "name": "New Year's Day",
  "close": null
 },
 {
  "date": "2027-01-18",
  "kind": "full closure",
  "name": "Martin Luther King, Jr. Day",
  "close": null
 },
 {
  "date": "2027-02-15",
  "kind": "full closure",
  "name": "Washington's Birthday",
  "close": null
 },
 {
  "date": "2027-03-26",
  "kind": "full closure",
  "name": "Good Friday",
  "close": null
 },
 {
  "date": "2027-05-31",
  "kind": "full closure",
  "name": "Memorial Day",
  "close": null
 },
 {
  "date": "2027-06-18",
  "kind": "full closure",
  "name": "Juneteenth National Independence Day (observed)",
  "close": null
 },
 {
  "date": "2027-07-05",
  "kind": "full closure",
  "name": "Independence Day (observed)",
  "close": null
 },
 {
  "date": "2027-09-06",
  "kind": "full closure",
  "name": "Labor Day",
  "close": null
 },
 {
  "date": "2027-11-25",
  "kind": "full closure",
  "name": "Thanksgiving Day",
  "close": null
 },
 {
  "date": "2027-11-26",
  "kind": "early close",
  "name": "Day after Thanksgiving",
  "close": "13:00 ET"
 },
 {
  "date": "2027-12-24",
  "kind": "full closure",
  "name": "Christmas Day (observed)",
  "close": null
 },
 {
  "date": "2027-12-31",
  "kind": "full closure",
  "name": "New Year's Day (observed, for Jan 1 2028)",
  "close": null
 },
 {
  "date": "2028-01-17",
  "kind": "full closure",
  "name": "Martin Luther King, Jr. Day",
  "close": null
 },
 {
  "date": "2028-02-21",
  "kind": "full closure",
  "name": "Presidents' Day",
  "close": null
 },
 {
  "date": "2028-04-14",
  "kind": "full closure",
  "name": "Good Friday",
  "close": null
 },
 {
  "date": "2028-05-29",
  "kind": "full closure",
  "name": "Memorial Day",
  "close": null
 },
 {
  "date": "2028-06-19",
  "kind": "full closure",
  "name": "Juneteenth National Independence Day",
  "close": null
 },
 {
  "date": "2028-07-03",
  "kind": "early close",
  "name": "Day before Independence Day",
  "close": "13:00 ET"
 },
 {
  "date": "2028-07-04",
  "kind": "full closure",
  "name": "Independence Day",
  "close": null
 },
 {
  "date": "2028-09-04",
  "kind": "full closure",
  "name": "Labor Day",
  "close": null
 },
 {
  "date": "2028-11-23",
  "kind": "full closure",
  "name": "Thanksgiving Day",
  "close": null
 },
 {
  "date": "2028-11-24",
  "kind": "early close",
  "name": "Day after Thanksgiving",
  "close": "13:00 ET"
 },
 {
  "date": "2028-12-25",
  "kind": "full closure",
  "name": "Christmas Day",
  "close": null
 }
];
