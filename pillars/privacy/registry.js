/* Privacy: which of the 72 brokers are on California's Data Broker Registry (Claude, 2026-11-21), from Gemini's
   privacy_gemini_registry_20261120-1125.json (PRI-GEM-07): the CPPA's registry.csv of 2026-10-30 (625 brokers) and 2025's. A broker on the
   registry is covered by DELETE Act requests through DROP; one that is not needs its own opt-out. Not second-read yet. */
(function () {
  const PK = window.PK; if (!PK) return;
  const R = window.PRIVACY_REGISTRY = [
 {
  "n": 1,
  "broker": "Spokeo",
  "registered": "yes",
  "registrant": "Spokeo, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "CPPA 2026 registry uses an in-page modal with no per-broker URL; verified in 2026 registry.csv (DBA: Spokeo.com; Freepeopledirectory.com; Thatsthem.com; Peoplewin.com; Anywho.com; Family.me) and registry2025.csv."
 },
 {
  "n": 2,
  "broker": "AnyWho",
  "registered": "yes",
  "registrant": "Spokeo, Inc.",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Spokeo, Inc. (explicitly listed as DBA Anywho.com and website anywho.com in 2026 registry.csv; Spokeo, Inc. was also registered in 2025 without anywho.com listed)."
 },
 {
  "n": 3,
  "broker": "Whitepages",
  "registered": "yes",
  "registrant": "Whitepages, Inc",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: whitepages.com) and registry2025.csv."
 },
 {
  "n": 4,
  "broker": "TruthFinder",
  "registered": "yes",
  "registrant": "TruthFinder, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "PeopleConnect subsidiary registered directly as TruthFinder, LLC (DBA: TruthFinder; website: truthfinder.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 5,
  "broker": "Instant Checkmate",
  "registered": "yes",
  "registrant": "Instant Checkmate LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "PeopleConnect subsidiary registered directly as Instant Checkmate LLC (DBA: Instant Checkmate; website: instantcheckmate.com) in 2026 registry.csv and as Instant Checkmate, LLC in registry2025.csv."
 },
 {
  "n": 6,
  "broker": "Intelius",
  "registered": "yes",
  "registrant": "Intelius, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "PeopleConnect subsidiary registered directly as Intelius, LLC (DBA: Intelius, US Search, US Search Pro; website: intelius.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 7,
  "broker": "US Search",
  "registered": "yes",
  "registrant": "Intelius, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent/affiliate Intelius, LLC (DBA includes US Search, US Search Pro; websites include ussearch.com, pro.ussearch.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 8,
  "broker": "PeopleFinders",
  "registered": "yes",
  "registrant": "Peoplefinders, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: peoplefinders.com; DBA: FindANeighborhood; StudorDud.com). Affiliate PeoplefindersDaaS is also separately registered in 2026."
 },
 {
  "n": 9,
  "broker": "MyLife",
  "registered": "yes",
  "registrant": "Insightbridge LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Insightbridge LLC (website: mylife.com in 2026 registry.csv; DBA: MyLife in registry2025.csv)."
 },
 {
  "n": 10,
  "broker": "FastPeopleSearch",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include FastPeopleSearch.com in 2026 registry.csv)."
 },
 {
  "n": 11,
  "broker": "SearchPeopleFree",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include SearchPeopleFree.com in 2026 registry.csv)."
 },
 {
  "n": 12,
  "broker": "SmartBackgroundChecks",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include SmartBackgroundChecks.com in 2026 registry.csv)."
 },
 {
  "n": 13,
  "broker": "USA People Search",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include USA-People-Search.com in 2026 registry.csv)."
 },
 {
  "n": 14,
  "broker": "FastBackgroundCheck",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include FastBackgroundCheck.com in 2026 registry.csv)."
 },
 {
  "n": 15,
  "broker": "CyberBackgroundChecks",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include CyberBackgroundChecks.com in 2026 registry.csv)."
 },
 {
  "n": 16,
  "broker": "PeopleSearchNow",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include PeopleSearchNow.com in 2026 registry.csv)."
 },
 {
  "n": 17,
  "broker": "USPhoneBook",
  "registered": "yes",
  "registrant": "Mississippi Tornado Alley, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Mississippi Tornado Alley, LLC (DBA/websites include USPhoneBook.com in 2026 registry.csv)."
 },
 {
  "n": 18,
  "broker": "Veripages",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'Veripages', 'Intelage'."
 },
 {
  "n": 19,
  "broker": "CheckPeople",
  "registered": "yes",
  "registrant": "CHECKPEOPLE, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: checkpeople.com) and as CheckPeople, LLC in registry2025.csv."
 },
 {
  "n": 20,
  "broker": "InfoTracer",
  "registered": "yes",
  "registrant": "InfoPay, Inc",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent InfoPay, Inc (DBA includes InfoTracer; website includes infotracer.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 21,
  "broker": "Social Catfish",
  "registered": "yes",
  "registrant": "Social Catfish, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (DBA: Social Catfish, LLC; website: socialcatfish.com)."
 },
 {
  "n": 22,
  "broker": "SearchQuarry",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'SearchQuarry', 'Search Quarry'."
 },
 {
  "n": 23,
  "broker": "Archives.com",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'Archives', 'Ancestry'."
 },
 {
  "n": 24,
  "broker": "PropertyRecs",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'PropertyRecs', 'SL Data'."
 },
 {
  "n": 25,
  "broker": "LocateFamily",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'LocateFamily'."
 },
 {
  "n": 26,
  "broker": "Sync.me",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'Sync.me'."
 },
 {
  "n": 27,
  "broker": "PeopleWhiz",
  "registered": "yes",
  "registrant": "Peoplewhiz, Inc",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: peoplewhiz.com)."
 },
 {
  "n": 28,
  "broker": "FreePeopleDirectory",
  "registered": "yes",
  "registrant": "Spokeo, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Spokeo, Inc. (DBA includes Freepeopledirectory.com; website: freepeopledirectory.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 29,
  "broker": "Pipl",
  "registered": "yes",
  "registrant": "Pipl, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: pipl.com) and registry2025.csv."
 },
 {
  "n": 30,
  "broker": "PimEyes",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'PimEyes', 'Carribex'."
 },
 {
  "n": 31,
  "broker": "FaceCheck.ID",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'FaceCheck.ID'."
 },
 {
  "n": 32,
  "broker": "Acxiom",
  "registered": "yes",
  "registrant": "Acxiom LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: acxiom.com) and registry2025.csv."
 },
 {
  "n": 33,
  "broker": "LexisNexis Risk Solutions",
  "registered": "yes",
  "registrant": "LexisNexis Risk Solutions FL Inc.",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: risk.lexisnexis.com). Parent RELX Inc. (DBA LexisNexis) is also registered separately."
 },
 {
  "n": 34,
  "broker": "Epsilon",
  "registered": "yes",
  "registrant": "Epsilon Data Management, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: epsilon.com) and registry2025.csv."
 },
 {
  "n": 35,
  "broker": "Experian",
  "registered": "yes",
  "registrant": "Experian Information Solutions, Inc",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: experian.com). Experian Marketing Solutions, LLC and Tapad are also registered in 2026."
 },
 {
  "n": 36,
  "broker": "TransUnion",
  "registered": "yes",
  "registrant": "Trans Union LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (DBA: TransUnion; website: transunion.com) and registry2025.csv; multiple TransUnion subsidiaries (Neustar, iovation, etc.) also registered."
 },
 {
  "n": 37,
  "broker": "OptOutPrescreen (credit-bureau prescreen opt-out)",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'OptOutPrescreen', 'Prescreen'. Joint FCRA credit-bureau prescreen opt-out portal (not a standalone broker; Equifax, Experian, and TransUnion are individually registered)."
 },
 {
  "n": 38,
  "broker": "ZoomInfo",
  "registered": "yes",
  "registrant": "ZoomInfo Technologies, LLC",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (DBA: ZoomInfo; website: zoominfo.com)."
 },
 {
  "n": 39,
  "broker": "RocketReach",
  "registered": "yes",
  "registrant": "RocketReach LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: rocketreach.co) and registry2025.csv."
 },
 {
  "n": 40,
  "broker": "Apollo.io",
  "registered": "yes",
  "registrant": "Zenleads, Inc.",
  "years": "2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Zenleads, Inc. (DBA: Apollo.io; website: apollo.io) in 2026 registry.csv."
 },
 {
  "n": 41,
  "broker": "Clearview AI",
  "registered": "yes",
  "registrant": "Clearview AI, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: clearview.ai) and registry2025.csv."
 },
 {
  "n": 42,
  "broker": "NAI opt-out",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'Network Advertising Initiative', 'NAI'. Industry self-regulatory trade association opt-out portal, not a data broker."
 },
 {
  "n": 43,
  "broker": "Nuwber",
  "registered": "yes",
  "registrant": "Nuwber Inc",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: nuwber.com) and registry2025.csv."
 },
 {
  "n": 44,
  "broker": "Cocofinder",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'Cocofinder'."
 },
 {
  "n": 45,
  "broker": "Neighbor.report",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'Neighbor.report', 'Neighbor' (only unrelated neighborwho.com under BeenVerified, LLC and FindANeighborhood under Peoplefinders, LLC appeared)."
 },
 {
  "n": 46,
  "broker": "People Data Labs",
  "registered": "yes",
  "registrant": "People Data Labs",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: peopledatalabs.com) and as People Data Labs, Inc. in registry2025.csv."
 },
 {
  "n": 47,
  "broker": "LiveRamp",
  "registered": "yes",
  "registrant": "LiveRamp Holdings, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: liveramp.com) and as LiveRamp, Inc. in registry2025.csv."
 },
 {
  "n": 48,
  "broker": "The Work Number (Equifax)",
  "registered": "yes",
  "registrant": "Equifax Workforce Solutions LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under Equifax Workforce Solutions LLC (website: theworknumber.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 49,
  "broker": "Fideo",
  "registered": "yes",
  "registrant": "Fideo Intelligence, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: fideo.ai) and registry2025.csv (formerly FullContact, Inc.; J2 Martech Corp also separately registered for Full Contact)."
 },
 {
  "n": 50,
  "broker": "LexisNexis (Professional & Marketing Data)",
  "registered": "yes",
  "registrant": "RELX Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent RELX Inc. (DBA: LexisNexis; website: lexisnexis.com) in 2026 registry.csv and as LexisNexis in registry2025.csv."
 },
 {
  "n": 51,
  "broker": "Data Axle",
  "registered": "yes",
  "registrant": "Data Axle Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (DBA: Data Axle; website: data-axle.com) and registry2025.csv."
 },
 {
  "n": 52,
  "broker": "PropertyRadar",
  "registered": "yes",
  "registrant": "PropertyRadar, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: propertyradar.com) and registry2025.csv."
 },
 {
  "n": 53,
  "broker": "Thomson Reuters CLEAR",
  "registered": "yes",
  "registrant": "West Publishing Corp",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under Thomson Reuters subsidiary West Publishing Corp (website: thomsonreuters.com) in 2026 registry.csv and West Publishing Corporation (DBA Thomson Reuters; CLEAR and Westlaw PeopleMap) in registry2025.csv."
 },
 {
  "n": 54,
  "broker": "Checksecrets",
  "registered": "yes",
  "registrant": "Truth Now LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Truth Now LLC (websites include checksecrets.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 55,
  "broker": "USPeopleSearch",
  "registered": "yes",
  "registrant": "USPeopleSearch.com, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: uspeoplesearch.com) and as USPEOPLESEARCH.COM, LLC in registry2025.csv."
 },
 {
  "n": 56,
  "broker": "Public Data Check",
  "registered": "yes",
  "registrant": "National Data Analytics, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent National Data Analytics, LLC (DBA: publicdatacheck.com; website: publicdatacheck.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 57,
  "broker": "Spyfly",
  "registered": "yes",
  "registrant": "Digital Safety Products, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Digital Safety Products, LLC (DBA: spyfly.com, publicrecordreports.com; website: spyfly.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 58,
  "broker": "Search Public Records",
  "registered": "yes",
  "registrant": "Civil Data Research, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Civil Data Research, LLC (DBA: searchpublicrecords.com; website: searchpublicrecords.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 59,
  "broker": "Public Information Services",
  "registered": "yes",
  "registrant": "Information Data Resources, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Information Data Resources, LLC (DBA: publicinfoservices.com; website: publicinfoservices.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 60,
  "broker": "Private Reports",
  "registered": "yes",
  "registrant": "Infomatics LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Infomatics LLC (websites include privatereports.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 61,
  "broker": "PrivateRecords.net",
  "registered": "yes",
  "registrant": "Private Records LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: privaterecords.net) and registry2025.csv."
 },
 {
  "n": 62,
  "broker": "We Inform (TruthRecord)",
  "registered": "yes",
  "registrant": "We Inform LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (websites: weinform.org, truthrecord.org) and registry2025.csv (DBA: TruthRecord)."
 },
 {
  "n": 63,
  "broker": "Information.com",
  "registered": "yes",
  "registrant": "INFORMATION.COM, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: information.com) and as Information.com, LLC in registry2025.csv."
 },
 {
  "n": 64,
  "broker": "FreePeopleSearch",
  "registered": "yes",
  "registrant": "FREEPEOPLESEARCH.COM, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: freepeoplesearch.com) and as FreePeopleSearch.com, LLC in registry2025.csv."
 },
 {
  "n": 65,
  "broker": "TrestleIQ",
  "registered": "yes",
  "registrant": "Trestle Solutions, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under Trestle Solutions, Inc. (website: trestleiq.com) in 2026 registry.csv and registry2025.csv."
 },
 {
  "n": 66,
  "broker": "IDI (idiCORE)",
  "registered": "yes",
  "registrant": "Interactive Data, LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under Interactive Data, LLC (website: ididata.com) in 2026 registry.csv and registry2025.csv (DBA: IDI)."
 },
 {
  "n": 67,
  "broker": "FOREWARN",
  "registered": "no",
  "registrant": "",
  "years": "",
  "url": "https://cppa.ca.gov/data_broker_registry/",
  "note": "Not found on live 2026 CPPA registry. Searched: 'FOREWARN'. Note: FOREWARN, LLC was registered in 2025 (registry2025.csv, claiming 100% GLBA coverage) and affiliate Interactive Data, LLC (ididata.com) is registered in 2026, but FOREWARN, LLC is not on the active 2026 registry/DROP list."
 },
 {
  "n": 68,
  "broker": "Seamless.AI",
  "registered": "yes",
  "registrant": "Seamless Contacts, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Registered under parent Seamless Contacts, Inc. (DBA: Seamless; website: seamless.ai) in 2026 registry.csv and registry2025.csv (DBA: Seamless.AI)."
 },
 {
  "n": 69,
  "broker": "Lusha",
  "registered": "yes",
  "registrant": "Lusha Systems, Inc",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (DBA: Lusha; website: lusha.com) and as Lusha Systems, Inc. in registry2025.csv."
 },
 {
  "n": 70,
  "broker": "LeadIQ",
  "registered": "yes",
  "registrant": "LeadIQ, Inc",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: leadiq.com) and registry2025.csv."
 },
 {
  "n": 71,
  "broker": "UpLead",
  "registered": "yes",
  "registrant": "Uplead LLC",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (website: uplead.com) and registry2025.csv."
 },
 {
  "n": 72,
  "broker": "Crunchbase",
  "registered": "yes",
  "registrant": "Crunchbase, Inc.",
  "years": "2025, 2026",
  "url": "https://cppa.ca.gov/data_broker_registry/registry.csv",
  "note": "Verified in 2026 registry.csv (DBA: Crunchbase; website: crunchbase.com) and registry2025.csv."
 }
];

  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid || !PK.ref) return;
    const on = R.filter((r) => r.registered === "yes").length;
    PK.ref(PK.refPanel(grid, { title: "California's broker registry", sub: `${on} of the ${R.length} brokers on your list are registered with the CPPA, so one DROP request reaches them; the other ${R.length - on} need their own opt-out.` }), {
      rows: R, group: (r) => (r.registered === "yes" ? "On the registry (DROP reaches it)" : "Not on it (opt out directly)"),
      title: (r) => r.broker, value: (r) => (r.registered === "yes" ? `Registered as ${r.registrant}` : "Not registered"), detail: (r) => r.note,
      meta: (r) => [r.years ? `years: ${r.years}` : "", "not second-read"].filter(Boolean), url: (r) => r.url,
      note: "Gemini PRI-GEM-07 (2026-11-20), from the CPPA's own registry files. Not second-read yet.",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
