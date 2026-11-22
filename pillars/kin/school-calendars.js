/* Public school-district calendars (Claude, 2026-11-22). Kin shows one only when you choose it in Kin (the choice stays in this browser);
   nothing here says who goes to which school. Saugus Union School District 2026-27, from Gemini's KIN-GEM-05
   (kin_gemini_saugus-calendar_20261121-1112.json), every date checked by Claude against the district's own PDF on 2026-11-22.
   closed = no school (district closed or a non-attendance day); otherwise a minimum day. Every Wednesday is also a minimum day. */
window.SCHOOL_CALENDARS = Object.assign(window.SCHOOL_CALENDARS || {}, {
 "saugus-usd-2026-27": {
  "name": "Saugus Union School District, 2026-27",
  "url": "https://wsos-cdn.s3.us-west-2.amazonaws.com/uploads/sites/109/2026-2027-District-Calendar.pdf",
  "as_of": "2026-11-22",
  "weekly_minimum": "Wednesday",
  "first": "2026-08-12",
  "last": "2027-06-11",
  "days": [
   {
    "from": "2026-07-03",
    "to": "2026-07-03",
    "name": "District Closed (Independence Day Observed)",
    "closed": true
   },
   {
    "from": "2026-08-04",
    "to": "2026-08-05",
    "name": "New Teacher Orientation",
    "closed": true
   },
   {
    "from": "2026-08-06",
    "to": "2026-08-11",
    "name": "Staff Development",
    "closed": true
   },
   {
    "from": "2026-08-12",
    "to": "2026-08-12",
    "name": "First Day of School / Weekly Wednesday Minimum Day",
    "closed": false
   },
   {
    "from": "2026-09-07",
    "to": "2026-09-07",
    "name": "Labor Day",
    "closed": true
   },
   {
    "from": "2026-10-05",
    "to": "2026-10-09",
    "name": "Fall Break",
    "closed": true
   },
   {
    "from": "2026-11-11",
    "to": "2026-11-11",
    "name": "Veteran's Day",
    "closed": true
   },
   {
    "from": "2026-11-16",
    "to": "2026-11-16",
    "name": "Parent Conferences (Minimum Days)",
    "closed": false
   },
   {
    "from": "2026-11-17",
    "to": "2026-11-17",
    "name": "Parent Conferences (Minimum Days)",
    "closed": false
   },
   {
    "from": "2026-11-18",
    "to": "2026-11-18",
    "name": "Parent Conferences",
    "closed": true
   },
   {
    "from": "2026-11-19",
    "to": "2026-11-19",
    "name": "Parent Conferences (Minimum Days)",
    "closed": false
   },
   {
    "from": "2026-11-20",
    "to": "2026-11-20",
    "name": "Parent Conferences (Minimum Days)",
    "closed": false
   },
   {
    "from": "2026-11-23",
    "to": "2026-11-27",
    "name": "Thanksgiving Break",
    "closed": true
   },
   {
    "from": "2026-12-21",
    "to": "2027-01-08",
    "name": "Winter Break",
    "closed": true
   },
   {
    "from": "2027-01-18",
    "to": "2027-01-18",
    "name": "MLK Jr. Day",
    "closed": true
   },
   {
    "from": "2027-02-12",
    "to": "2027-02-12",
    "name": "Lincoln's Birthday",
    "closed": true
   },
   {
    "from": "2027-02-15",
    "to": "2027-02-15",
    "name": "President's Day",
    "closed": true
   },
   {
    "from": "2027-03-29",
    "to": "2027-04-01",
    "name": "Parent Conferences (Minimum Days)",
    "closed": false
   },
   {
    "from": "2027-04-02",
    "to": "2027-04-02",
    "name": "Parent Conferences",
    "closed": true
   },
   {
    "from": "2027-04-05",
    "to": "2027-04-09",
    "name": "Spring Break",
    "closed": true
   },
   {
    "from": "2027-05-31",
    "to": "2027-05-31",
    "name": "Memorial Day",
    "closed": true
   },
   {
    "from": "2027-06-01",
    "to": "2027-06-01",
    "name": "Record Keeping Day (Minimum Day)",
    "closed": false
   },
   {
    "from": "2027-06-11",
    "to": "2027-06-11",
    "name": "Last Day of School (Minimum Day)",
    "closed": false
   },
   {
    "from": "2027-06-18",
    "to": "2027-06-18",
    "name": "Juneteenth",
    "closed": true
   }
  ]
 }
});
