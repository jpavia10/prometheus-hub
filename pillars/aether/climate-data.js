/* Aether: climate normals and the PSPS record for the mountain (Claude, 2026-11-21).
   AETHER_NORMALS from Gemini's aether_gemini_normals_20261120-1115.json (AET-GEM-08): NOAA NCEI 1991-2020 monthly normals for
   SANDBERG, CA (USW00023187, 13.6 mi, 4,510 ft), the nearest station with both temperature and precipitation normals; snowfall from
   LEBEC, CA (USC00044863, 4.6 mi). Checked by Claude 2026-11-21: all 84 monthly numbers equal NOAA's own CSV, and Lebec's snow row.
   AETHER_PSPS from aether_gemini_psps-history_20261120-2033.json (AET-GEM-10): SCE post-event reports filed with the CPUC, 2019 to Oct 2026,
   for the circuits that serve the mountain communities. Not second-read yet (the CPUC site is not reachable from Claude's sandbox). */
window.AETHER_NORMALS = {
 "station": {
  "id": "USW00023187",
  "name": "SANDBERG, CA US",
  "lat": 34.7436,
  "lon": -118.7242,
  "elev_ft": 4510,
  "dist_mi": 13.6,
  "csv_url": "https://www.ncei.noaa.gov/data/normals-monthly/1991-2020/access/USW00023187.csv",
  "source_urls": [
   "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00023187&format=pdf&dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL,MLY-TAVG-NORMAL,MLY-PRCP-NORMAL,MLY-SNOW-NORMAL",
   "https://www.ncei.noaa.gov/access/us-climate-normals/#dataset=normals-monthly&timeframe=30&station=USW00023187",
   "https://www.ncei.noaa.gov/access/homr/#ncdcstnid=20001957&tab=MSHR"
  ],
  "closer_station_check": "Verified via NCEI 1991-2020 Monthly Normals search for Frazier Park, CA (34.8228, -118.9445): no station closer than SANDBERG, CA US (USW00023187, 79 datatypes) has both temperature and precipitation normals. LEBEC, CA US (USC00044863, 46 datatypes) has precipitation and snowfall only (no temperature); FRAZIER PARK 10.7 WSW, CA US (US1CAVT0002, 4 datatypes) has precipitation only; TEJON RANCHO, CA US (USC00048839, 46 datatypes) has no temperature normals.",
  "nearest_snowfall_station": {
   "id": "USC00044863",
   "name": "LEBEC, CA US",
   "lat": 34.8333,
   "lon": -118.865,
   "elev_ft": 3575,
   "dist_mi": 4.6,
   "pdf_url": "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&startDate=0001-01-01&endDate=9996-12-31&stations=USC00044863&format=pdf",
   "note": "SANDBERG, CA US (USW00023187) does not report MLY-SNOW-NORMAL in NOAA 1991-2020 normals (snow_in is null in months[]). Nearest 1991-2020 station with MLY-SNOW-NORMAL is LEBEC, CA US (USC00044863).",
   "annual_snow_in": 3.0,
   "monthly_snow_in": [
    {
     "month": 1,
     "snow_in": 0.8
    },
    {
     "month": 2,
     "snow_in": 1.4
    },
    {
     "month": 3,
     "snow_in": 0.2
    },
    {
     "month": 4,
     "snow_in": 0.0
    },
    {
     "month": 5,
     "snow_in": 0.0
    },
    {
     "month": 6,
     "snow_in": 0.0
    },
    {
     "month": 7,
     "snow_in": 0.0
    },
    {
     "month": 8,
     "snow_in": 0.0
    },
    {
     "month": 9,
     "snow_in": 0.0
    },
    {
     "month": 10,
     "snow_in": 0.0
    },
    {
     "month": 11,
     "snow_in": 0.0
    },
    {
     "month": 12,
     "snow_in": 0.6
    }
   ]
  }
 },
 "columns": [
  "STATION",
  "NAME",
  "LATITUDE",
  "LONGITUDE",
  "ELEVATION",
  "month",
  "MLY-TMAX-NORMAL",
  "MLY-TMIN-NORMAL",
  "MLY-TAVG-NORMAL",
  "MLY-PRCP-NORMAL",
  "MLY-SNOW-NORMAL",
  "MLY-TMIN-AVGNDS-LSTH032",
  "MLY-TMAX-AVGNDS-GRTH090",
  "MLY-TMAX-AVGNDS-GRTH050"
 ],
 "months": [
  {
   "month": 1,
   "tmax_f": 52.3,
   "tmin_f": 38.6,
   "tavg_f": 45.4,
   "prcp_in": 2.5,
   "snow_in": null,
   "days_min_le_32": 6.8,
   "days_max_ge_90": 0.0,
   "paint_ok_days": 18.4
  },
  {
   "month": 2,
   "tmax_f": 53.0,
   "tmin_f": 38.3,
   "tavg_f": 45.7,
   "prcp_in": 3.72,
   "snow_in": null,
   "days_min_le_32": 7.7,
   "days_max_ge_90": 0.0,
   "paint_ok_days": 15.0
  },
  {
   "month": 3,
   "tmax_f": 57.3,
   "tmin_f": 40.6,
   "tavg_f": 48.9,
   "prcp_in": 1.96,
   "snow_in": null,
   "days_min_le_32": 5.2,
   "days_max_ge_90": 0.0,
   "paint_ok_days": 22.6
  },
  {
   "month": 4,
   "tmax_f": 62.0,
   "tmin_f": 42.7,
   "tavg_f": 52.3,
   "prcp_in": 0.76,
   "snow_in": null,
   "days_min_le_32": 3.4,
   "days_max_ge_90": 0.0,
   "paint_ok_days": 24.8
  },
  {
   "month": 5,
   "tmax_f": 70.2,
   "tmin_f": 49.2,
   "tavg_f": 59.7,
   "prcp_in": 0.41,
   "snow_in": null,
   "days_min_le_32": 0.3,
   "days_max_ge_90": 0.4,
   "paint_ok_days": 29.7
  },
  {
   "month": 6,
   "tmax_f": 79.9,
   "tmin_f": 57.5,
   "tavg_f": 68.7,
   "prcp_in": 0.08,
   "snow_in": null,
   "days_min_le_32": 0.0,
   "days_max_ge_90": 4.1,
   "paint_ok_days": 29.9
  },
  {
   "month": 7,
   "tmax_f": 87.7,
   "tmin_f": 64.8,
   "tavg_f": 76.3,
   "prcp_in": 0.09,
   "snow_in": null,
   "days_min_le_32": 0.0,
   "days_max_ge_90": 10.3,
   "paint_ok_days": 31.0
  },
  {
   "month": 8,
   "tmax_f": 88.3,
   "tmin_f": 65.3,
   "tavg_f": 76.8,
   "prcp_in": 0.06,
   "snow_in": null,
   "days_min_le_32": 0.0,
   "days_max_ge_90": 12.2,
   "paint_ok_days": 31.0
  },
  {
   "month": 9,
   "tmax_f": 82.7,
   "tmin_f": 61.2,
   "tavg_f": 72.0,
   "prcp_in": 0.13,
   "snow_in": null,
   "days_min_le_32": 0.0,
   "days_max_ge_90": 5.2,
   "paint_ok_days": 29.9
  },
  {
   "month": 10,
   "tmax_f": 71.3,
   "tmin_f": 52.5,
   "tavg_f": 61.9,
   "prcp_in": 0.6,
   "snow_in": null,
   "days_min_le_32": 0.3,
   "days_max_ge_90": 0.3,
   "paint_ok_days": 30.0
  },
  {
   "month": 11,
   "tmax_f": 59.9,
   "tmin_f": 44.0,
   "tavg_f": 51.9,
   "prcp_in": 0.78,
   "snow_in": null,
   "days_min_le_32": 2.9,
   "days_max_ge_90": 0.0,
   "paint_ok_days": 24.0
  },
  {
   "month": 12,
   "tmax_f": 51.6,
   "tmin_f": 37.6,
   "tavg_f": 44.6,
   "prcp_in": 2.05,
   "snow_in": null,
   "days_min_le_32": 8.3,
   "days_max_ge_90": 0.0,
   "paint_ok_days": 16.8
  }
 ]
};
window.AETHER_PSPS = [
 {
  "n": 1,
  "event": "Oct 2-12, 2019 (PG&E-fed Frozen Circuit)",
  "circuit": "FROZEN",
  "community": "Wheeler Ridge; Grapevine; Tejon Ranch; Lebec (Kern County)",
  "customers": 0,
  "off": "2019-10-11 10:56",
  "on": "2019-10-11 19:33",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/a-psps-post-event-reports-2019/sce-post-event-reporting-october-2-through-october-12-2019.pdf",
  "page": "PDF p. 10 (Report p. 8)",
  "quote": "The Frozen Circuit, fed by PG&E, was pro-actively de-energized at 10:56 a.m. with no customer impact, as part of PG&E's PSPS event... The Frozen Circuit was re-energized at 7:33 p.m. ... on Friday, October 11."
 },
 {
  "n": 2,
  "event": "July 31-Aug 4, 2020",
  "circuit": "TEJON",
  "community": "South of Twin Lakes (Kern County); Three Points City / Antelope Valley (Los Angeles County)",
  "customers": 17,
  "off": "2020-08-02 14:15",
  "on": "2020-08-04 10:30",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/files/uploadedfiles/cpucwebsite/content/news_room/newsupdates/2020/sce-psps-post-event-report-2020-july-31-to-august-4.pdf",
  "page": "PDF p. 3 (Report p. 2)",
  "quote": "Ultimately, SCE pro-actively de-energized seventeen customer meters on the Tejon circuit in Antelope Valley at 2:15 pm on August 2. Power was restored to 14... on Monday, August 3 at approximately 5:17 pm and the remaining 3... on Tuesday, August 4 at approximately 10:30 am."
 },
 {
  "n": 3,
  "event": "Nov 14-18, 2020",
  "circuit": "GRAPEVINE PEAK",
  "community": "Along Grapevine Creek South of Grapevine City (Kern County)",
  "customers": 4,
  "off": "2020-11-16 20:27",
  "on": "2020-11-17 16:20",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/files/uploadedfiles/cpucwebsite/content/news_room/newsupdates/2020/nov-14-18-2020-sce-psps-post-event-report.pdf",
  "page": "PDF p. 6 (Report p. 5); PDF p. 27",
  "quote": "GRAPEVINE PEAK | CB | 4 | 11/16/2020 20:27 | 11/17/2020 16:20 (TENNECO and RIDGE were monitored with CCV at Frazier Mountain Park but not de-energized)."
 },
 {
  "n": 4,
  "event": "Nov 14-18, 2020",
  "circuit": "FROZEN",
  "community": "Wheeler Ridge; Grapevine; Tejon Ranch; Lebec (Kern County)",
  "customers": 1,
  "off": "2020-11-16 21:54",
  "on": "2020-11-17 16:21",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/files/uploadedfiles/cpucwebsite/content/news_room/newsupdates/2020/nov-14-18-2020-sce-psps-post-event-report.pdf",
  "page": "PDF p. 6 (Report p. 5); PDF p. 27",
  "quote": "FROZEN | PS0269 | 1 | 11/16/2020 21:54 | 11/17/2020 16:21 (Kern County: Wheeler Ridge ; Grapevine ; Tejon Ranch ; Lebec)."
 },
 {
  "n": 5,
  "event": "Nov 29-Dec 4, 2020 (reported in Dec 4-14, 2020 LNO Audit)",
  "circuit": "GRAPEVINE PEAK",
  "community": "Along Grapevine Creek South of Grapevine City (Kern County)",
  "customers": 0,
  "off": "none found",
  "on": "2020-12-04 15:34",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2020/sce-psps-reportdec-414-12292020.pdf?sc_lang=en&hash=D4D74822836E1151B8958F1EDD9550D0",
  "page": "PDF p. 33 (LNO Audit)",
  "quote": "LNO Audit records GRAPEVINE PEAK re-energized 12/4/2020 15:34 from prior Nov 29-Dec 4, 2020 event (standalone report not indexed on CPUC; de-energization time and customer count not stated in audit). TENNECO was not de-energized in Dec 4-14 event."
 },
 {
  "n": 6,
  "event": "Nov 29-Dec 4, 2020 (reported in Dec 4-14, 2020 LNO Audit)",
  "circuit": "FROZEN (SEG 1)",
  "community": "Wheeler Ridge; Grapevine; Tejon Ranch; Lebec (Kern County)",
  "customers": 0,
  "off": "none found",
  "on": "2020-12-04 17:48",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2020/sce-psps-reportdec-414-12292020.pdf?sc_lang=en&hash=D4D74822836E1151B8958F1EDD9550D0",
  "page": "PDF p. 33 (LNO Audit)",
  "quote": "LNO Audit records FROZEN (SEG 1) re-energized 12/4/2020 17:48 from prior Nov 29-Dec 4, 2020 event (standalone report not indexed on CPUC; de-energization time and customer count not stated in audit)."
 },
 {
  "n": 7,
  "event": "2021 (none found across 8 SCE de-energization events)",
  "circuit": "none found (checked TENNECO, RIDGE, FROZEN, GRAPEVINE PEAK, TEJON)",
  "community": "Frazier Park; Lake of the Woods; Pinon Pines; Pine Mountain Club; Lebec (Kern County)",
  "customers": 0,
  "off": "none found",
  "on": "none found",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/postrs-post-season-reports-2021/sce_-amended_postsr1_3-17-2022.pdf",
  "page": "PDF pp. 25, 28, 63 (Tables II-13, II-14, Appendix B)",
  "quote": "Checked SCE Amended 2021 Post-Season Report (8 events: 01/12, 04/12, 09/30, 10/11, 10/15, 10/22, 11/21, 11/24/2021). CCV deployed at Frazier Mountain Park 10/11/2021, but Appendix B lists no Frazier Park/mountain circuit de-energized."
 },
 {
  "n": 8,
  "event": "2022 (none found)",
  "circuit": "none found (checked SCE June 15, 2022 Post-Event Report & CPUC 2017-2023 archive)",
  "community": "Frazier Park; Lake of the Woods; Pinon Pines; Pine Mountain Club; Lebec (Kern County)",
  "customers": 0,
  "off": "none found",
  "on": "none found",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2022/sce-psps-post-event-report-for-06-15-22.pdf",
  "page": "PDF pp. 7, 19-20 (Report pp. 3, 15-16)",
  "quote": "N/A. SCE did not de-energize any circuits or customers during this high threat event. (Inyo County Birchim circuit only; CPUC Archived 2017-2023 PSPS index also checked.)"
 },
 {
  "n": 9,
  "event": "2023 (none found)",
  "circuit": "none found (checked SCE July 18, 2023 Post-Event Report & CPUC 2017-2023 archive)",
  "community": "Frazier Park; Lake of the Woods; Pinon Pines; Pine Mountain Club; Lebec (Kern County)",
  "customers": 0,
  "off": "none found",
  "on": "none found",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2023/sce-psps-post-event-report-7-18-2023-event.pdf",
  "page": "PDF pp. 7, 19 (Report pp. 3, 15)",
  "quote": "Ultimately, SCE did not de-energize any customers during this event. (Los Angeles County Huckleberry circuit only; CPUC Archived 2017-2023 PSPS index also checked.)"
 },
 {
  "n": 10,
  "event": "2024 (none found)",
  "circuit": "none found (checked SCE Sept 7, 2024 Post-Event Report & Amended 2024 Post-Season Report)",
  "community": "Frazier Park; Lake of the Woods; Pinon Pines; Pine Mountain Club; Lebec (Kern County)",
  "customers": 0,
  "off": "none found",
  "on": "none found",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2024/r1812005-sce-psps-post-event-report-for-9-7-24-de-energization-event.pdf",
  "page": "PDF pp. 8-9, 23 (Table 5)",
  "quote": "Checked SCE Sept 7-12, 2024 Post-Event Report (Kern County in scope, but Table 5 confirms 0 Kern County circuits de-energized) and SCE Amended 2024 Post-Season Report."
 },
 {
  "n": 11,
  "event": "June 10, 2025 (June 8-22, 2025)",
  "circuit": "TEJON",
  "community": "South of Twin Lakes (Kern County); Three Points City (Los Angeles County)",
  "customers": 259,
  "off": "2025-06-11 11:50",
  "on": "2025-06-22 10:43",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2025/r1812005sce-psps-postevent-for-june-10-2025-deenergization.pdf",
  "page": "PDF p. 74 (Attachment B, p. B-7, Table 5)",
  "quote": "KERN, LOS ANGELES | TEJON | 6/11/2025 11:50 | All Clear 6/22/2025 6:20 | Restored 6/22/2025 10:43 | Tier 2, Non HFRA | Distribution | Res: 237, C/I: 22, MBL: 8, AFN: 78, Total: 259"
 },
 {
  "n": 12,
  "event": "July 1, 2025 (June 29-July 11, 2025)",
  "circuit": "TEJON",
  "community": "South of Twin Lakes (Kern County); Three Points City (Los Angeles County)",
  "customers": 482,
  "off": "2025-07-09 12:35",
  "on": "2025-07-11 09:25",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2025/r1812005-sce-psps-post-event-for-july-1-2025-de--energization.pdf",
  "page": "PDF p. 20 (Report p. 16, Table 5) & PDF p. 65 (A-5)",
  "quote": "KERN, LOS ANGELES | TEJON | 7/9/2025 12:35 | All Clear 7/11/2025 6:24 | Restored 7/11/2025 9:25 | Distribution | Res: 450, C/I: 32, MBL: 18, AFN: 171, Total: 482 (Aug 1 & Aug 10, 2025 reports also checked: no Frazier Park circuits)."
 },
 {
  "n": 13,
  "event": "2026 through Oct 5, 2026 (none found confirmed de-energized)",
  "circuit": "RIDGE (in scope Oct 4, 2026; de-energization not confirmed in read pages; July 22 & July 26, 2026 reports also checked)",
  "community": "Frazier Park; Lebec (Kern County); Gorman; Peace Valley (Los Angeles County)",
  "customers": 0,
  "off": "none found",
  "on": "none found",
  "url": "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2026/r1812005-sce-psps-post-event-for-sep-25-2026-de-energization.pdf",
  "page": "PDF pp. 7, 39-40 (Table 8 & Report p. 36)",
  "quote": "Frazier Mountain Park parking lot, 3801 Park Drive, Frazier Park, CA 93225 | 10/4/2026 8AM to 8:30PM | 207 visitors | Potential Circuits Supported: Ridge; demobilized Oct 4 after the POC had passed, circuits were removed from event scope and all customer load restored."
 }
];
