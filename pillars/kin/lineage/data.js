/* Kin · Lineage: the family's researched history (Claude, 2026-11-24; owner: "Kin should also function as a dynamic interactive family
   tree ... How am I to pass knowledge down if I don't collect and curate it. I want it PhD level").
   Method: pillars/kin/docs/LINEAGE_METHOD.md (the Genealogical Proof Standard, Evidence Explained citations). Every fact is an assertion
   from one source, classified three ways (the source: original / derivative / authored; the information: primary / secondary /
   undetermined; the evidence: direct / indirect / negative); a conclusion is written only after the assertions are correlated, and
   every conflict keeps its proof argument. Nothing here is invented: where a record is unread, the field says so.
   Seed (2026-11-24): the research his great-uncle compiled on Joseph Michael Termenas (1893-1935), with every document image in it,
   read again here line by line; plus the naturalization petition, which the great-uncle linked but had not transcribed: it gives the
   arrival (Hamburg, 13 Aug 1912; New York, 23 Aug 1912) and the declaration of intention (Detroit, 21 Oct 1916). The research is the
   great-uncle's, not Joseph's (owner, 2026-11-24). Joseph's maternal line as he gave it the same day: his mother Toni Hinkle (born
   Sanders), her mother Laurie Jordan, her mother Barbara Feole. Whether Joseph Termenas is Barbara's father or her grandfather is
   not known (conflict C10): that link is drawn as unproven until a record settles it. */
window.KIN_LINEAGE = {
  schema: "kin-lineage/1",
  updated: "2026-11-24",
  root: "P-self",
  standard: {
    name: "Genealogical Proof Standard",
    by: "Board for Certification of Genealogists, Genealogy Standards, 2nd ed. revised (2021)",
    elements: [
      ["Reasonably exhaustive research", "Every source a competent researcher would examine for the question, not only the convenient ones."],
      ["Complete and accurate citation", "Each assertion cites where it was found, in a form another researcher can follow to the same page and line."],
      ["Analysis and correlation", "Each source, its information and the evidence it gives are weighed and compared with the others."],
      ["Resolution of conflicting evidence", "Every conflict that bears on the question is explained, not ignored."],
      ["A soundly reasoned, written conclusion", "A proof statement, summary or argument a reader can check."]],
    classes: {
      source: { original: "the record as first made (or an image of it)", derivative: "a transcription, abstract, index or database made from another record", authored: "a narrative written from many records (a family history, a unit history)" },
      info: { primary: "from someone with first-hand knowledge of the event", secondary: "from someone who was told or inferred it", undetermined: "the informant is unknown" },
      evidence: { direct: "answers the question by itself", indirect: "answers it only when combined with other evidence", negative: "an absence where a record should exist" } },
  },

  /* ------------------------------------------------------------------ people */
  people: [
    {"id": "P-father", "sex": "M", "status": "probable", "names": [{"given": "Joseph Craig", "surname": "Pavia", "type": "birth", "src": ["S-anc-pri"]}], "summary": "Your father, Joseph Craig Pavia, born May 1973 (the age you gave, 53, fits). Glenda Kirkland Pavia's son; married to Rachel by 2022.", "living": true},
    {"id": "P-francis", "sex": "M", "status": "possible", "names": [{"given": "Francis Joseph", "surname": "Pavia", "type": "birth", "src": ["S-anc-tree"], "note": "also Frank Pavia in public records"}], "summary": "Your paternal grandfather, born about 1938 or 1939. Married Glenda Mardelle Kirkland; later married Linda S. Pavia (died 2020). His parents are the next question (Q23).", "living": true},
    {"id": "P-glenda", "sex": "F", "status": "probable", "names": [{"given": "Glenda Mardelle", "surname": "Kirkland", "type": "birth", "src": ["S-anc-cfh", "S-glenda-obit"]}, {"given": "Glenda Mardelle", "surname": "Pavia", "type": "married", "src": ["S-glenda-obit"]}], "summary": "Your father's mother. Born in Delano, Tennessee in 1946, grew up in Michigan (Finney High School, Wayne County Community College), and died in Monroe in 2022."},
    {"id": "P-jennifer", "sex": "F", "status": "probable", "names": [{"given": "Jennifer", "surname": "Burd", "type": "married", "src": ["S-glenda-obit"]}], "summary": "Your aunt: Glenda's daughter, of Pawhuska, Oklahoma (married to Tim Burd).", "living": true},
    {"id": "P-buster", "sex": "M", "status": "probable", "names": [{"given": "Buster Madison", "surname": "Kirkland", "type": "birth", "src": ["S-anc-ssaci", "S-anc-ww2"]}], "summary": "Your great-grandfather on your father's side. Born in McMinn County, Tennessee in 1913, worked at the Athens Stove Works in 1940, and moved the family north to Michigan; died in Riverview in 1992."},
    {"id": "P-joy", "sex": "F", "status": "probable", "names": [{"given": "Joy Chloey", "surname": "Moss", "type": "birth", "src": ["S-anc-ssaci"]}, {"given": "Joy Chloey", "surname": "Kirkland", "type": "married", "src": ["S-anc-midi"]}], "summary": "Buster's wife: born in Delano, Polk County, Tennessee in 1913; died in Ann Arbor in 1990."},
    {"id": "P-jamesk", "sex": "M", "status": "probable", "names": [{"given": "James", "surname": "Kirkland", "type": "birth", "src": ["S-glenda-obit"], "note": "Jimmie in the 1940 census"}], "summary": "Glenda's brother; died before 2022."},
    {"id": "P-stevenk", "sex": "M", "status": "probable", "names": [{"given": "Steven", "surname": "Kirkland", "type": "birth", "src": ["S-glenda-obit"]}], "summary": "Glenda's brother, of Southgate, Michigan.", "living": true},
    {"id": "P-jessec", "sex": "M", "status": "probable", "names": [{"given": "Jesse Columbus", "surname": "Kirkland", "type": "birth", "src": ["S-anc-ssaci", "S-scrapbook"]}], "summary": "Buster's father (named by Buster on his Social Security application). Born about 1880 in Monroe County, Tennessee; died 1965 (compiled trees)."},
    {"id": "P-juliaw", "sex": "F", "status": "probable", "names": [{"given": "Julia Ann", "surname": "Williams", "type": "birth", "src": ["S-anc-ssaci", "S-scrapbook"]}], "summary": "Buster's mother; about 1882 to 1967 (compiled trees). Her parents are not yet known."},
    {"id": "P-chester", "sex": "M", "status": "probable", "names": [{"given": "Chester Ray", "surname": "Moss", "type": "birth", "src": ["S-anc-ssaci", "S-anc-marr35"]}], "summary": "Joy's father: born 3 Jul 1890 in Delano, Polk County, Tennessee; died October 1980 (compiled trees)."},
    {"id": "P-ada", "sex": "F", "status": "probable", "names": [{"given": "Ada Nellie", "surname": "Culberson", "type": "birth", "src": ["S-anc-ssaci"]}], "summary": "Joy's mother, born about 1893 in Tennessee."},
    {"id": "P-anderson", "sex": "M", "status": "possible", "names": [{"given": "Anderson Carson", "surname": "Kirkland", "type": "birth", "src": ["S-fs-tree", "S-scrapbook"]}], "summary": "Jesse Columbus's father (compiled trees). Born 1855 or 1858 in Monroe County, Tennessee; died 1936; buried at Citico Baptist Church, Vonore. The scrapbook and FamilySearch disagree on his dates (C11)."},
    {"id": "P-emaline", "sex": "F", "status": "possible", "names": [{"given": "Emaline", "surname": "Giles", "type": "birth", "src": ["S-fs-tree"]}], "summary": "Anderson's wife: 1856 (Loudon, TN) to 1884; married 20 Aug 1876."},
    {"id": "P-jessea", "sex": "M", "status": "possible", "names": [{"given": "Jesse Alden", "surname": "Kirkland", "type": "birth", "src": ["S-fs-tree", "S-scrapbook"]}], "summary": "1823 to 1895, Monroe County, Tennessee; buried Ballplay Ebenezer Cemetery. Married Mary Elizabeth \"Polly\" Bivins on 30 Jan 1850."},
    {"id": "P-polly", "sex": "F", "status": "possible", "names": [{"given": "Mary Elizabeth", "surname": "Bivins", "type": "birth", "src": ["S-fs-tree", "S-scrapbook"], "note": "Polly"}], "summary": "1829 to 1920, Monroe County, Tennessee."},
    {"id": "P-jmgiles", "sex": "M", "status": "possible", "names": [{"given": "James Madison", "surname": "Giles", "type": "birth", "src": ["S-fs-tree", "S-fag"]}], "summary": "1827 (South Carolina) to 1903 (Monroe County, TN), buried Ball Play Cemetery; a lieutenant in the Civil War (3rd Tennessee Infantry, CSA, later 3rd Tennessee Mounted Infantry, USA). Married Henrietta Ann Davis on 9 Feb 1847. His parents are disputed on WikiTree and are left open."},
    {"id": "P-hettie", "sex": "F", "status": "possible", "names": [{"given": "Henrietta Ann", "surname": "Davis", "type": "birth", "src": ["S-fs-tree"], "note": "Hettie"}], "summary": "Born about 1829."},
    {"id": "P-jamesak", "sex": "M", "status": "possible", "names": [{"given": "James Altonia", "surname": "Kirkland", "type": "birth", "src": ["S-fs-tree"], "note": "Sr."}], "summary": "1781 (North Carolina) to 1869 (Polk County, TN); buried Butler Cemetery. Moved from Macon County, NC to Monroe County, TN about 1830."},
    {"id": "P-susanna", "sex": "F", "status": "possible", "names": [{"given": "Susanna", "surname": "Boston", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1786 to 1881. Her maiden name is supported by Eastern Cherokee Applications 586 and 8597 and William H. Linn's 1908 testimony (DixieGens proof, 2026)."},
    {"id": "P-jamesb", "sex": "M", "status": "possible", "names": [{"given": "James", "surname": "Bivens", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1800 (North Carolina) to 1873 (Monroe County, TN); married Parthenia Turner 17 Mar 1825, Haywood County, NC; both buried at Antioch Baptist Church."},
    {"id": "P-parthenia", "sex": "F", "status": "possible", "names": [{"given": "Parthenia", "surname": "Turner", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1807 (Person County, NC) to 1877 (Monroe County, TN)."},
    {"id": "P-nathan", "sex": "M", "status": "possible", "names": [{"given": "Nathan", "surname": "Kirkland", "type": "birth", "src": ["S-fs-tree"]}], "summary": "Born about 1751-1765 in North Carolina; in Rutherford County, NC in 1810 and Monroe County, TN by 1824. Often confused online with \"Cheesesquire\" Kirkland of Graham, NC; his parents are unproven."},
    {"id": "P-lilly", "sex": "F", "status": "possible", "names": [{"given": "Lilly Berry", "surname": "Pfau", "type": "birth", "src": ["S-fs-tree"], "note": "Faw"}], "summary": "About 1758 to 1851."},
    {"id": "P-benjamin", "sex": "M", "status": "possible", "names": [{"given": "Benjamin", "surname": "Bivens", "type": "birth", "src": ["S-fs-tree"]}], "summary": "About 1777 (NC) to about 1860 (Monroe County, TN); War of 1812, North Carolina militia."},
    {"id": "P-marypj", "sex": "F", "status": "possible", "names": [{"given": "Mary", "surname": "Johnson", "type": "birth", "src": ["S-fs-tree"], "note": "Polly"}], "summary": "Born 1779 in North Carolina; daughter of Joseph Johnson."},
    {"id": "P-josiah", "sex": "M", "status": "possible", "names": [{"given": "Josiah", "surname": "Turner", "type": "birth", "src": ["S-fs-tree"]}], "summary": "Born about 1770; son of Joseph Turner and Mary Rogers."},
    {"id": "P-susannap", "sex": "F", "status": "possible", "names": [{"given": "Susannah", "surname": "Pulliam", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1772 to 1819."},
    {"id": "P-nathaniel", "sex": "M", "status": "possible", "names": [{"given": "Nathaniel Robert", "surname": "Bivens", "type": "birth", "src": ["S-fs-tree", "S-fag", "S-dar"], "note": "Sr."}], "summary": "1726 to before April 1818, Anson County, North Carolina; will signed 9 May 1816. A DAR Revolutionary War Patriot (A213360)."},
    {"id": "P-peggy", "sex": "F", "status": "possible", "names": [{"given": "Margaret", "surname": "Tyler", "type": "birth", "src": ["S-fs-tree"], "note": "Peggy"}]},
    {"id": "P-jpulliam", "sex": "M", "status": "possible", "names": [{"given": "James", "surname": "Pulliam", "type": "birth", "src": ["S-fs-tree", "S-dar"], "note": "Lt."}], "summary": "1726 to 1799; Lunenburg County, Virginia militia, later Person County, NC. A DAR Revolutionary War Patriot (A092129)."},
    {"id": "P-eastone", "sex": "F", "status": "possible", "names": [{"given": "Elizabeth Allen", "surname": "Stone", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1740 to 1818."},
    {"id": "P-rstone", "sex": "M", "status": "possible", "names": [{"given": "Richard", "surname": "Stone", "type": "birth", "src": ["S-fs-tree", "S-dar"], "note": "Sr."}], "summary": "About 1722 to 1797, Lunenburg County, Virginia. His will, made 7 September 1795, survives in an abstract that names his wife Mary and his daughter Elizabeth, James Pulliam's wife. A DAR Revolutionary War Patriot (A110255)."},
    {"id": "P-yancy", "sex": "F", "status": "possible", "names": [{"given": "Mary", "surname": "Yancy", "type": "birth", "src": ["S-fs-tree"]}]},
    {"id": "P-wesley", "sex": "M", "status": "possible", "names": [{"given": "Wesley", "surname": "Davis", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1803 (NC) to 1855 (Monroe County, TN); Hettie's father in the compiled trees."},
    {"id": "P-tdavisjr", "sex": "M", "status": "possible", "names": [{"given": "Thomas", "surname": "Davis", "type": "birth", "src": ["S-fs-tree"], "note": "Jr."}], "summary": "1760 to 1826, of the Cane Creek Quaker meeting, North Carolina."},
    {"id": "P-rbryant", "sex": "F", "status": "possible", "names": [{"given": "Rebecca", "surname": "Bryant", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1764 to 1831."},
    {"id": "P-tdavis", "sex": "M", "status": "possible", "names": [{"given": "Thomas", "surname": "Davis", "type": "birth", "src": ["S-fs-tree", "S-fag", "S-dar"], "note": "Pvt."}], "summary": "1734 (Chester County, PA) to 1789; a Regulator in Guilford County, NC, then the Montgomery County, VA militia. A DAR Revolutionary War Patriot (A030698)."},
    {"id": "P-eknox", "sex": "F", "status": "possible", "names": [{"given": "Elizabeth", "surname": "Knox", "type": "birth", "src": ["S-fs-tree"]}], "summary": "1738 to 1782."},
    {"id": "P-charles", "sex": "M", "status": "family", "names": [{"given": "Charles A.", "surname": "Sanders", "type": "birth", "src": ["S-babybook", "S-anc-tree"]}], "summary": "Your mother's father.", "living": true},
    {"id": "P-charles-sr", "sex": "M", "status": "family", "names": [{"given": "Charles", "surname": "Sanders", "type": "birth", "src": ["S-babybook"]}], "summary": "Charles A. Sanders's father, from your baby book's family tree."},
    {"id": "P-bettyf", "sex": "F", "status": "family", "names": [{"given": "Betty", "surname": "Flemming", "type": "birth", "src": ["S-babybook"]}], "summary": "Charles A. Sanders's mother, from your baby book's family tree."},
    {"id": "P-bob", "sex": "M", "status": "family", "names": [{"given": "Bob", "surname": "Seconder", "type": "birth", "src": ["S-babybook"]}], "summary": "Laurie's father: Barbara's first husband. Joe Seconder, the great-uncle whose research seeded this tree, is a Seconder too."},
    {"id": "P-mel", "sex": "M", "status": "probable", "names": [{"given": "Mel", "surname": "Feole", "type": "birth", "src": ["S-springer-obit"]}], "summary": "Barbara's later husband (Barbara (Mel) Feole of Holly, 1997)."},
    {"id": "P-betty", "sex": "F", "status": "probable", "names": [{"given": "Betty", "surname": "Holgate", "type": "married", "src": ["S-springer-obit"]}], "summary": "Barbara's sister (married Thomas Holgate, of Novi in 1997): both were Katherine M. Springer's nieces."},
    { id: "P-self", sex: "M", names: [{ given: "Joseph", surname: "Pavia", type: "birth" }], living: true, status: "self",
      note: "You. The line runs from you through your mother to Joseph Termenas." },
    { id: "P-mother", sex: "F", living: true, status: "family",
      names: [{ given: "Toni", surname: "Sanders", type: "birth", src: ["S-owner"] }, { given: "Toni A.", surname: "Sanders", type: "record", src: ["S-babybook"] }, { given: "Toni", surname: "Hinkle", type: "married", src: ["S-owner"] }],
      summary: "Your mother, Toni Hinkle, born Toni A. Sanders about 1975 (your Ancestry tree). Her father is Charles A. Sanders; the line to the Termenas family runs through her mother, Laurie." },
    { id: "P-gp", sex: "F", status: "family",
      names: [{ given: "Laurie G.", surname: "Seconder", type: "birth", src: ["S-babybook"] }, { given: "Laurie", surname: "Jordan", type: "married", note: "the surname you gave; a later married name", src: ["S-owner"] }],
      summary: "Your mother's mother: born Laurie G. Seconder, the daughter of Bob Seconder and Barbara; later Laurie Jordan. Her brother Joe Seconder compiled the Termens research that seeded this tree.", note: "Her birth record and her marriage to Charles A. Sanders are the records to gather for her." },
    { id: "P-ggm", sex: "F", status: "family",
      names: [{ given: "Barbara J.", surname: "Feole", type: "married", src: ["S-springer-obit"], note: "her name in 1997 (Barbara (Mel) Feole of Holly)" }, { given: "Barbara", surname: "Seconder", type: "married", src: ["S-babybook"], note: "married to Bob Seconder, Laurie's father" }, { given: "Barbara", surname: "Feole", type: "as-given", note: "the surname you gave; probably a married name (Feole is an Italian surname). Her surname at birth is the key: Termens or Termenas if Joseph Termenas is her father, or her own father's surname if he is her grandfather", src: ["S-owner"] }],
      summary: "Laurie's mother, Barbara Feole: your great-grandmother. The family says she descends from Joseph Termenas, but not whether as his daughter or his granddaughter (C10).",
      note: "The dates will tell: any child of Joseph and Della was born between their marriage (25 Apr 1922) and his death (11 Jun 1935). Born in those years and in their household in 1930 or 1940, Barbara is his daughter; born after about 1937, she is a granddaughter (Q19, Q4)." },
    { id: "P-joseph", sex: "M", status: "proven",
      names: [
        { given: "Joseph Michael", surname: "Termenas", type: "preferred", note: "the spelling he signed in 1917 and 1919 (enlistment record, naturalization petition)" },
        { given: "Joseph Mike", surname: "Termenas", type: "variant", src: ["S-pet", "S-nat-cert", "S-nat-index"] },
        { given: "Joseph M.", surname: "Termenas", type: "variant", src: ["S-enlist", "S-discharge"] },
        { given: "Josef", surname: "Terminas", type: "variant", note: "on a 1912 manifest whose identity with him is not proven (see Q1)", src: ["S-manifest-pl"] },
        { given: "Joseph M", surname: "Termens", type: "anglicized", src: ["S-marr-index"] },
        { given: "Joseph", surname: "Termmens", type: "variant", note: "death certificate, also known as Termenas and Termens", src: ["S-death"] },
        { given: "Joseph", surname: "Termens", type: "anglicized", src: ["S-headstone"] },
        { given: "Juozapas", surname: "Termenas", type: "lithuanian", note: "the Lithuanian form of Joseph; not yet seen in a record (hypothesis H1)" }],
      summary: "Born in Lithuania, then part of the Russian Empire, most likely in or near Telšiai in Samogitia, on 16 May 1893. Left Hamburg in August 1912 and landed at New York on 23 August 1912. In Detroit by 1916, where he declared his intention to become a citizen and, in June 1917, registered for the draft as a motion-picture operator. Enlisted at Columbus Barracks, Ohio, on 20 September 1917 and served in France with Company A, 29th Engineers, the regiment that built and ran the American Expeditionary Forces' base map-printing plant at Langres; an electrician by trade, he was on detached service at General Headquarters, Chaumont, from 27 April 1919. Naturalized at Boston on 14 July 1919 and discharged at Camp Devens the next day. Married Della Malkitus (or Delia Matukaitis) in Brooklyn on 25 April 1922. Worked as a furnace attendant for the Ford Motor Company and died at Henry Ford Hospital, Detroit, on 11 June 1935 of burns from a furnace accident at work. Buried at Mt. Olivet Cemetery, Detroit, 14 June 1935." },
    { id: "P-della", sex: "F", status: "probable",
      names: [
        { given: "Della", surname: "Malkitus", type: "birth", note: "as indexed from the 1922 marriage certificate", src: ["S-marr-index"] },
        { given: "Delia", surname: "Matukaitis", type: "variant", note: "her maiden name as given on her husband's death certificate, 1935, where she was the informant", src: ["S-death"] },
        { given: "", surname: "Termens", type: "married", note: "Mrs. Termmens, informant 1935", src: ["S-death"] }],
      born_est: { text: "about 1901", basis: "age 21 at her marriage on 25 Apr 1922 (marriage index; indirect)" },
      summary: "Married Joseph Termens in Kings County (Brooklyn), New York, on 25 April 1922, aged 21. Widowed in Detroit in June 1935, living at 15001 Rockdale. Her maiden name is spelled two ways (conflict C3)." },
    { id: "P-rozys", sex: "M", status: "possible",
      names: [{ given: "Rozys", surname: "Termens", type: "as-indexed", note: "father of the groom, as indexed from the 1922 marriage certificate; the Lithuanian original of the given name is unread (hypothesis H2)", src: ["S-marr-index"] }],
      summary: "Named only in the index to his son's 1922 marriage. The 1935 death certificate gives the father as \"Unknown Termmens\", born in Lithuania." },
    { id: "P-kostantina", sex: "F", status: "possible",
      names: [{ given: "Kostantina", surname: "Giadraet", type: "as-indexed", note: "mother of the groom, as indexed in 1922. Lithuanian Konstancija Giedraitė would fit: -aitė is the maiden ending of the Giedraitis family (hypothesis H3)", src: ["S-marr-index"] }],
      summary: "Named only in the index to her son's 1922 marriage. The 1935 death certificate gives her maiden name as \"Unknown\", born in Lithuania." },
    { id: "P-michael-m", sex: "M", status: "possible", names: [{ given: "Michael", surname: "Malkitus", type: "as-indexed", src: ["S-marr-index"] }], summary: "Father of the bride, as indexed in 1922." },
    { id: "P-eva-v", sex: "F", status: "possible", names: [{ given: "Eva", surname: "Vaschaushos", type: "as-indexed", note: "an indexer's reading; the Lithuanian original is unread", src: ["S-marr-index"] }], summary: "Mother of the bride, as indexed in 1922." },
  ],

  /* parents -> children, with the couple's own events */
  families: [
    {"id": "F-pavia", "partners": ["P-francis", "P-glenda"], "children": ["P-father", "P-jennifer"]},
    {"id": "F-kirkland", "partners": ["P-buster", "P-joy"], "children": ["P-glenda", "P-jamesk", "P-stevenk"], "events": ["E-marr-bk"]},
    {"id": "F-jessec", "partners": ["P-jessec", "P-juliaw"], "children": ["P-buster"]},
    {"id": "F-moss", "partners": ["P-chester", "P-ada"], "children": ["P-joy"]},
    {"id": "F-anderson", "partners": ["P-anderson", "P-emaline"], "children": ["P-jessec"]},
    {"id": "F-jessea", "partners": ["P-jessea", "P-polly"], "children": ["P-anderson"]},
    {"id": "F-giles", "partners": ["P-jmgiles", "P-hettie"], "children": ["P-emaline"]},
    {"id": "F-jamesak", "partners": ["P-jamesak", "P-susanna"], "children": ["P-jessea"]},
    {"id": "F-bivens", "partners": ["P-jamesb", "P-parthenia"], "children": ["P-polly"]},
    {"id": "F-nathan", "partners": ["P-nathan", "P-lilly"], "children": ["P-jamesak"]},
    {"id": "F-benjamin", "partners": ["P-benjamin", "P-marypj"], "children": ["P-jamesb"]},
    {"id": "F-turner", "partners": ["P-josiah", "P-susannap"], "children": ["P-parthenia"]},
    {"id": "F-nathaniel", "partners": ["P-nathaniel", "P-peggy"], "children": ["P-benjamin"]},
    {"id": "F-pulliam", "partners": ["P-jpulliam", "P-eastone"], "children": ["P-susannap"]},
    {"id": "F-stone", "partners": ["P-rstone", "P-yancy"], "children": ["P-eastone"]},
    {"id": "F-wesley", "partners": ["P-wesley"], "children": ["P-hettie"]},
    {"id": "F-davisjr", "partners": ["P-tdavisjr", "P-rbryant"], "children": ["P-wesley"]},
    {"id": "F-davis", "partners": ["P-tdavis", "P-eknox"], "children": ["P-tdavisjr"]},
    {"id": "F-sanders", "partners": ["P-charles-sr", "P-bettyf"], "children": ["P-charles"]},
    {"id": "F-feole", "partners": ["P-ggm", "P-mel"], "children": []},
    { id: "F-termenas", partners: ["P-joseph", "P-della"], children: ["P-ggm", "P-betty"], events: ["E-marr"],
      uncertain: { "P-ggm": "daughter or granddaughter? (C10)", "P-betty": "daughter or granddaughter? (C10)" } },
    { id: "F-ggm", partners: ["P-bob", "P-ggm"], children: ["P-gp"] },
    { id: "F-gp", partners: ["P-charles", "P-gp"], children: ["P-mother"] },
    { id: "F-mother", partners: ["P-father", "P-mother"], children: ["P-self"] },
    { id: "F-rozys", partners: ["P-rozys", "P-kostantina"], children: ["P-joseph"] },
    { id: "F-malkitus", partners: ["P-michael-m", "P-eva-v"], children: ["P-della"] },
  ],

  /* ------------------------------------------------------------------ places (historical jurisdiction first, today's in `now`) */
  places: [
    {"id": "PL-delano", "name": "Delano, Tennessee", "hist": "Delano, Polk County, Tennessee", "now": "Delano, Polk County, Tennessee", "lat": 35.2626, "lon": -84.5513},
    {"id": "PL-mcminn", "name": "McMinn County, Tennessee", "hist": "McMinn County, Tennessee", "now": "McMinn County, Tennessee", "lat": 35.4429, "lon": -84.593},
    {"id": "PL-athens", "name": "Athens, Tennessee", "hist": "Athens, McMinn County, Tennessee", "now": "Athens, McMinn County, Tennessee", "lat": 35.4429, "lon": -84.593},
    {"id": "PL-polk", "name": "Polk County, Tennessee", "hist": "Polk County, Tennessee", "now": "Polk County, Tennessee", "lat": 35.174, "lon": -84.653},
    {"id": "PL-riverview", "name": "Riverview, Michigan", "hist": "Riverview, Wayne County, Michigan", "now": "Riverview, Wayne County, Michigan", "lat": 42.1742, "lon": -83.1793},
    {"id": "PL-annarbor", "name": "Ann Arbor, Michigan", "hist": "Ann Arbor, Washtenaw County, Michigan", "now": "Ann Arbor, Washtenaw County, Michigan", "lat": 42.2808, "lon": -83.743},
    {"id": "PL-monroe", "name": "Monroe, Michigan", "hist": "Monroe, Monroe County, Michigan", "now": "Monroe, Monroe County, Michigan", "lat": 41.9164, "lon": -83.3977},
    {"id": "PL-mmp", "name": "Michigan Memorial Park, Flat Rock", "hist": "Michigan Memorial Park Cemetery, Huron Township (Flat Rock), Wayne County, Michigan", "now": "Michigan Memorial Park Cemetery, Huron Township (Flat Rock), Wayne County, Michigan", "lat": 42.0973, "lon": -83.251},
    {"id": "PL-monroetn", "name": "Monroe County, Tennessee", "hist": "Monroe County, Tennessee (Vonore, Ball Play, Citico)", "now": "Monroe County, Tennessee (Vonore, Ball Play, Citico)", "lat": 35.5901, "lon": -84.2416},
    {"id": "PL-loudon", "name": "Loudon, Tennessee", "hist": "Loudon, Tennessee", "now": "Loudon, Tennessee", "lat": 35.7329, "lon": -84.3338},
    { id: "PL-telsiai", name: "Telšiai", hist: "Telšiai, Telšiai uyezd, Kovno Governorate, Russian Empire", now: "Telšiai, Lithuania", lat: 55.9814, lon: 22.2472, note: "\"Telsiu\" on the death certificate is the Lithuanian genitive Telšių (of Telšiai)." },
    { id: "PL-hamburg", name: "Hamburg", hist: "Hamburg, German Empire", now: "Hamburg, Germany", lat: 53.5461, lon: 9.9661 },
    { id: "PL-nyc", name: "New York (Ellis Island)", hist: "Port of New York", now: "New York, USA", lat: 40.6995, lon: -74.0396 },
    { id: "PL-cambridge", name: "Cambridge, Massachusetts", hist: "140 Howard Street, Cambridge, Middlesex County, Massachusetts (the index card types 180)", now: "Cambridge, MA", lat: 42.3626, lon: -71.1023, approx: "street location not plotted; the city's Cambridgeport area" },
    { id: "PL-detroit", name: "Detroit, Michigan", hist: "Detroit, Wayne County, Michigan", now: "Detroit, MI", lat: 42.3314, lon: -83.0458 },
    { id: "PL-columbus", name: "Columbus Barracks, Ohio", hist: "Columbus Barracks (later Fort Hayes), Columbus, Ohio", now: "Columbus, OH", lat: 39.9787, lon: -82.9886 },
    { id: "PL-devens", name: "Camp Devens, Massachusetts", hist: "Camp Devens, Ayer, Middlesex County, Massachusetts", now: "Devens, MA", lat: 42.5440, lon: -71.6129 },
    { id: "PL-hoboken", name: "Hoboken, New Jersey", hist: "Port of Embarkation, Hoboken, New Jersey", now: "Hoboken, NJ", lat: 40.7440, lon: -74.0324 },
    { id: "PL-brest", name: "Brest, France", hist: "Brest, Finistère, France", now: "Brest, France", lat: 48.3830, lon: -4.4950 },
    { id: "PL-langres", name: "Langres, France", hist: "Turenne Barracks, Langres, Haute-Marne, France", now: "Langres, France", lat: 47.8626, lon: 5.3333 },
    { id: "PL-chaumont", name: "Chaumont, France", hist: "General Headquarters, American Expeditionary Forces, Chaumont, Haute-Marne, France", now: "Chaumont, France", lat: 48.1113, lon: 5.1392 },
    { id: "PL-boston", name: "Boston, Massachusetts", hist: "U.S. District Court for the District of Massachusetts, Boston", now: "Boston, MA", lat: 42.3601, lon: -71.0589 },
    { id: "PL-brooklyn", name: "Brooklyn (Kings County), New York", hist: "Borough of Brooklyn, Kings County, New York City", now: "Brooklyn, NY", lat: 40.6782, lon: -73.9442 },
    { id: "PL-hfh", name: "Henry Ford Hospital, Detroit", hist: "Henry Ford Hospital, West Grand Boulevard, Detroit", now: "Detroit, MI", lat: 42.3666, lon: -83.0846 },
    { id: "PL-mtolivet", name: "Mt. Olivet Cemetery, Detroit", hist: "Mt. Olivet Cemetery, 17100 Van Dyke, Detroit (Mt. Elliott Cemetery Association)", now: "Detroit, MI", lat: 42.4262, lon: -83.0291 },
  ],

  /* ------------------------------------------------------------------ sources (Evidence Explained style; `cite` is the first full reference note) */
  sources: [
    {"id": "S-anc-tree", "short": "Your Ancestry tree, \"Pavia Family Tree\" (2026)", "kind": "authored", "year": 2026, "url": "https://www.ancestry.com/family-tree/tree/192482486/family", "cite": "\"Pavia Family Tree\" (tree 192482486), Ancestry.com, kept by Joseph Pavia; its people, attached records and hints read by Gemini on 23 November 2026 (\"Pavia Family Tree — Ancestry.com Master Dossier\", Drive).", "read": "10 people: you, your parents, grandparents, Barbara, Buster Kirkland and Joy Moss. The records attached to it are cited separately below."},
    {"id": "S-glenda-obit", "short": "Glenda Pavia's obituary (2022)", "kind": "original", "year": 2022, "url": "https://www.merklefh.com/obituaries/Glenda-Mardelle-Pavia?obId=25788784", "cite": "\"Glenda Mardelle Pavia,\" obituary, Merkle Funeral Service, Monroe, Michigan, published 1 September 2022; also The Blade (Toledo) via Legacy.com.", "read": "Died 1 Sep 2022 at Medilodge of Monroe, age 76; burial Michigan Memorial Park, Huron Township. Predeceased by her parents Buster Madison Kirkland and Joy Chloey Moss and her brother James Kirkland. Survived by her children Jennifer (Tim) Burd of Pawhuska, OK and Joseph (Rachel) Pavia of Monroe, MI; her brother Steven (Anne) Kirkland of Southgate; grandchildren Joseph (Irene) Pavia Jr., Tyler Burd, Madeline Burd and Violet Joy Pavia."},
    {"id": "S-anc-cfh", "short": "U.S. Cemetery and Funeral Home Collection (index)", "kind": "derivative", "year": 2022, "cite": "\"U.S., Cemetery and Funeral Home Collection, 1847-Current,\" database, Ancestry.com: entries for Glenda Mardelle Pavia (record 317372224), Buster Madison Kirkland and Joy Chloey Kirkland, attached to the Pavia Family Tree.", "read": "Glenda Mardelle Pavia [Kirkland], born 9 Jun 1946 Delano, Tennessee; died 2022 aged 76; burial Huron Township; parents Buster Madison Kirkland and Joy Chloey Kirkland; children Jennifer Burd, Joseph Pavia; siblings Steven and James Kirkland."},
    {"id": "S-anc-pri", "short": "U.S. Index to Public Records (index)", "kind": "derivative", "year": 2020, "cite": "\"U.S., Index to Public Records, 1994-2019\" and \"U.S., Public Records Index, 1950-1993,\" databases, Ancestry.com: Joseph Craig Pavia (born May 1973) and Glenda Mardelle Pavia (born June 1946), attached to the Pavia Family Tree.", "read": "Names and birth months only are used here; the addresses in these indexes are left out on purpose."},
    {"id": "S-anc-marr35", "short": "Tennessee marriage record, Polk County, 1935 (index)", "kind": "derivative", "year": 1935, "cite": "\"Tennessee, U.S., Marriage Records, 1780-2002,\" database, Ancestry.com, record 2932706: Buster Kirkland (age 22) and Joy Moss, 4 August 1935, Polk County, Tennessee; father of the bride Chester Moss.", "read": "The image of the county register has not been read yet."},
    {"id": "S-anc-ssaci", "short": "Social Security applications index (index)", "kind": "derivative", "cite": "\"U.S., Social Security Applications and Claims Index, 1936-2007,\" database, Ancestry.com: Buster Madison Kirkland (born 9 May 1913 McMinn County, TN; parents Jessie C Kirkland and Julia Williams) and Joy Moss Kirkland (born 9 Feb 1913 Delano, Polk, TN; parents Chester R Moss and Ada N Culberson).", "read": "An index of each person's own application: they named their parents themselves."},
    {"id": "S-anc-midi", "short": "Michigan death index 1971-1996 (index)", "kind": "derivative", "cite": "\"Michigan, U.S., Death Index, 1971-1996,\" database, Ancestry.com: Buster Kirkland, died 9 Mar 1992 Riverview, Wayne County; Joy C Kirkland, died 26 Mar 1990 Ann Arbor, Washtenaw County."},
    {"id": "S-anc-census", "short": "U.S. censuses 1920-1950, Tennessee (index)", "kind": "derivative", "cite": "1920, 1930, 1940 and 1950 U.S. censuses, McMinn and Polk counties, Tennessee, as indexed on Ancestry.com (hints on the Pavia Family Tree): Buster Kirkland with parents Columbus (Jesse C) and Julie (1920, 1930); with wife Joy and son Jimmie, Athens (1940); with wife Joy and daughter Glenda, McMinn County (1950).", "read": "Index entries only; the page images have not been read (the 1940 index has Joy as \"Jay\" and the 1920 Polk County index has Moss as \"Mass\")."},
    {"id": "S-anc-ww2", "short": "World War II draft card, 1940 (index)", "kind": "derivative", "year": 1940, "cite": "\"U.S., World War II Draft Cards Young Men, 1940-1947,\" database, Ancestry.com: Buster Madison Kirkland, registered 16 October 1940, Athens, McMinn County, Tennessee.", "read": "Born 9 May 1913 McMinn, Tenn; age 27; employer Athens Stove Works; 5 ft 10 in, 142 lb, light complexion, brown hair, blue eyes; contact Mrs. Joy Chlore Kirkland."},
    {"id": "S-scrapbook", "short": "Kirkland family scrapbook page (photograph)", "kind": "original", "url": "https://www.ancestry.com/family-tree/person/tree/192482486/person/302807736467/gallery", "cite": "Kirkland family scrapbook page with three photographs and handwritten captions, uploaded to Ancestry by Troy Kirkland, 27 May 2017 (image5 in Buster Madison Kirkland's gallery).", "read": "\"Anderson Carson Kirkland 3/23/1858 - 9/7/1936 · Son of Jesse & Mary E. Kirkland (Polly)\"; \"Jesse Columbus Kirkland & Julia Ann (Williams) Kirkland, baby Luther Alden Kirkland, Taken around 1902\"; \"Sons of Jesse Columbus Kirkland Made in 1950: Robert Adgar, Buster Madison, Jesse Reed, Luther Alden Kirkland\"."},
    {"id": "S-fs-tree", "short": "FamilySearch Family Tree and WikiTree (compiled trees)", "kind": "authored", "cite": "FamilySearch Family Tree (ancestors.familysearch.org) and WikiTree (wikitree.com) profiles for the Kirkland, Bivins, Giles, Davis, Turner, Pulliam, Stone and Llewellyn lines, read by Gemini on 23 November 2026 (\"Kin — Kirkland, Bivins, Giles & Moss 10-Generation Lineage Dossier\" and \"4-Grandparent Master Lineage\", Drive).", "read": "Collaborative trees: other researchers' conclusions, each to be checked against the records they cite. WikiTree itself flags two links as unproven (Nathan Kirkland's parents; James Madison Giles's parents), and they are left out here."},
    {"id": "S-fag", "short": "Find a Grave memorials", "kind": "authored", "cite": "Find a Grave memorials 10865998 (James Madison Giles, Ball Play Cemetery), 143838250 (Nathaniel Bivens), 184235440 (Thomas Davis), 18998409 (Charles Davies), 207045067 (Robert S. Allen Sr.), 40451252 (Butler-Kirkland Cemetery), 34053700 (Citico Baptist Cemetery).", "read": "Volunteer-made pages; a gravestone photograph on one is an original record of what the stone says."},
    {"id": "S-dar", "short": "DAR Patriot records", "kind": "authored", "url": "https://services.dar.org/Public/DAR_Research/search_adb/?action=full&p_id=A092129", "cite": "Daughters of the American Revolution, Ancestor Database: Patriots A213360 (Nathaniel Robert Bivens), A030698 (Thomas Davis), A092129 (James Pulliam), A110255 (Richard Stone).", "read": "Each patriot's service is documented by the DAR; the descent from him to this family is not yet proven by a DAR application."},
    {"id": "S-springer-obit", "short": "Katherine M. Springer's obituary (1997)", "kind": "original", "year": 1997, "url": "http://news-archive.plymouthlibrary.org/Media/Crier/Page/1997/1997-01-08_021-CC.pdf", "cite": "\"Katherine M. Springer,\" obituary, The Community Crier (Plymouth, Michigan), 8 January 1997, p. 21; Plymouth District Library news archive.", "read": "Born 3 Nov 1907, died 4 Jan 1997, age 89; a Chrysler seamstress for 42 years and a UAW organizer; survived by her nieces Barbara (Mel) Feole of Holly and Betty (Thomas) Holgate of Novi."},
    {"id": "S-babybook", "short": "Baby book family-tree page (photograph, your Drive)", "kind": "original", "cite": "\"Baby's Family Tree\" page, photographed and kept in Joseph Pavia's Google Drive; found by Gemini on 23 November 2026.", "read": "Names Toni's father Charles A. Sanders and his parents Charles Sanders and Betty Flemming, and Toni's mother Laurie G. (Seconder) Jordan."},
    {"id": "S-joeseconder", "short": "Joe Seconder's Termens research folder", "kind": "authored", "cite": "Joe Seconder (your great-uncle), \"Joseph Termena - Termens\" Drive folder and \"Joseph Termens\" research document, shared with Joseph Pavia; identified by Gemini on 23 November 2026 as the origin of the great-uncle's file.", "read": "The compiler of the Termens records is Joe Seconder, Laurie's brother: Joseph Termenas is his family line."},
    { id: "S-draft", short: "WWI draft card, Detroit, 1917", kind: "original", year: 1917, img: ["draft-1917"],
      cite: "\"United States, World War I Selective Service System Draft Registration Cards, 1917–1918,\" Michigan, Detroit City, registration card no. 369 (serial 9919?), Joseph Termenas, 5 June 1917; NARA microfilm publication M1509; image, FamilySearch. Registrar's report signed J. G. Glenn(?); ward 5, precinct 12 as read.",
      repo: "National Archives at Atlanta (originals); images on FamilySearch and Ancestry",
      read: "Name Joseph Termenas, age 24; home 761 Cardoni, Detroit (the first figure is unclear: Claude reads 7, Muse reads 2; KIN-MUS-02); born May 16, 1893; Declarant; born Lithuania, Russia; occupation motion picture operator; employer: unemployed; no dependents; single; white; no prior service; no exemption claimed. Registrar: height 5-10 (written in figures), build medium, eyes grey, hair brown, not bald (re-read 25 Nov 2026 after Muse's blind read; the earlier reading had \"medium height\")." },
    { id: "S-enlist", short: "Enlistment record, 1919", kind: "original", year: 1919, img: ["enlistment-1919"], family: true,
      cite: "U.S. Army, \"Enlistment Record\" (reverse of Honorable Discharge), Joseph M. Termenas, Private 1st Class, Company A, 29th Engineers, discharged Camp Devens, Massachusetts, 15 July 1919; family-held original, scanned copy in his great-uncle's research file (2026).",
      read: "Enlisted 20 Sep 1917 at Columbus Barracks, Ohio; first enlistment; no prior service; not mounted; in France 10/11/17 (?) to 7/3/19 as read; knowledge of vocation: electrician; wounds: none; physical condition: good; typhoid and paratyphoid prophylaxis completed 10/11/17; single; character excellent. Stamps: discharged Jul 15 1919; approved for Victory Medal with France clasp, forwarded 26 May 1921 by the recruiting officer, Boston. Annotated \"Bonus certified for Michigan State\" with a notary's signature. Signed Joseph M. Termenas." },
    { id: "S-discharge", short: "Honorable discharge, 1919", kind: "original", year: 1919, img: ["discharge-1919"], family: true,
      cite: "U.S. Army, Form No. 525, A.G.O., \"Honorable Discharge from the United States Army,\" Joseph M. Termenas, Private 1st Class, Company A, 29th Engineers, Camp Devens, Massachusetts, 15 July 1919; family-held original, scanned copy (scan upside down).",
      read: "Service number 180338 (re-read 25 Nov 2026; first read as 1803038); discharged by reason of demobilization (circular 75?); born in Lithuania, in the State of Russia; when enlisted 24 4/12 years of age, by occupation an electrician; brown eyes, brown hair, ruddy complexion, 5 feet 7 inches. Given at Camp Devens, Mass., 15 July 1919; signed by a Major of Engineers (name not read)." },
    { id: "S-nat-cert", short: "Certificate of naturalization, 1919", kind: "original", year: 1919, img: ["naturalization-cert-1919"], family: true,
      cite: "U.S. Department of Labor, Naturalization Service, Certificate of Naturalization no. 1229058, Joseph Mike Termenas, U.S. District Court, Boston, Massachusetts, 14 July 1919 (petition vol. 4372, no. 18; re-read 26 Nov 2026 at full size, matching Muse's blind read KIN-MUS-02; first read as 4312M/13); family-held original, scanned copy (scan upside down).",
      read: "Age 26; height 5 ft 8 in; white; complexion fair; eyes brown; hair brown; no visible marks; single; no minor children. Residing at Camp Devens, Ayer, Massachusetts; formerly a subject of \"the present Government of Russia\"; admitted under the Act of May 9, 1918 while serving in the military forces of the United States. Clerk's signature: James S. Allen(?)." },
    { id: "S-pet", short: "Petition for naturalization, Boston, 1919", kind: "original", year: 1919, img: ["naturalization-petition-1919", "naturalization-oath-1919"],
      cite: "Petition for Naturalization, vol. 4372, no. 18 (as printed on the certificate), Joseph Mike Termenas, U.S. District Court, Boston, Massachusetts, filed 14 July 1919; \"Petitions and Records of Naturalizations of the U.S. District and Circuit Courts of the District of Massachusetts, 1906–1929,\" NARA microfilm M1368, roll 315, images 0913–0914; National Archives Catalog NAID 59700981 and 59700983.",
      url: "https://catalog.archives.gov/id/59700981",
      read: "Residence Camp Devens, Mass. / 140 Howard St., Cambridge, Mass. (the figure between 1 and 0 is an open-topped 4, read by Claude and by Muse blind; the index card typed 180); occupation soldier / operator; born 16 May 1893 in Lithuania, Russia; emigrated from Hamburg on or about 13 Aug 1912 and arrived at New York on 23 Aug 1912 on the vessel \"Columbia\" (reading uncertain); declared intention on 21 or 22 Oct 1916 at Detroit (the second figure is a stroke with a foot: Claude cannot tell 1 from 2, Muse reads 22), Mich., in the Circuit Court (\"of United States\" as read); not married; no children; Act of May 9, 1918; renounces \"the Present Gov't of Russia\"; resided in the U.S. continuously since 23 Aug 1912. Witnesses: Lesley(?) B. Allen, Captain, and Frank R. Olson(?), 1st Lieutenant, both of Camp Devens, who had known him since July 1917(?). Filed and sworn 14 Jul 1919 before Arthur Grandison(?), deputy clerk. Signed Joseph Mike Termenas." },
    { id: "S-nat-index", short: "Naturalization index card", kind: "derivative", year: 1919, img: ["naturalization-index"],
      cite: "\"Index to Naturalization Petitions … District of Massachusetts,\" card for TERMENAS, Joseph Mike, admitted 14 July 1919, certificate no. 1229905(?)6 as printed, petition no. 4?? M; card printed by the WPA/FPI (form note \"FPI Inc—LK—2-19-40\"); National Archives Catalog NAID 65367996.",
      url: "https://catalog.archives.gov/id/65367996",
      read: "Residence 180 Howard St., Cambridge, Mass.; born May 16th, 1893, Lithuania, Russia; occupation operator; wife: unmarried; admitted July 14th, 1919." },
    { id: "S-muster", short: "Co. A, 29th Engineers rosters, 1917–1919", kind: "original", year: 1917, img: ["muster-1917-a", "muster-1917-b", "muster-1917-c", "roster-1917-private", "roster-1917-private-b", "roster-1919-chaumont"],
      cite: "\"World War I Rosters of Enlisted Men,\" Record Group 64 (NARA St. Louis), item 85713803: Company A, 29th Engineers, initial muster roll, 13 Sep–31 Oct 1917, and later roster; images on FamilySearch.",
      url: "https://www.familysearch.org/ark:/61903/3:1:3QHV-N3ZG-79DL-1",
      read: "Initial roll: listed as Private, assigned to the 25th Engineers 22 Sep 1917, joined 24 Sep, assigned to Co. D, 25th Engineers at Camp Devens 17 Oct; Co. D became Co. A, 29th Engineers on 20 Oct 1917; on board USS Agamemnon at the muster of 31 Oct 1917. Later roster, line 54: \"Termenas 180238, Joseph M. DS Chaumont 4/27/19\" (DS = detached service), as transcribed by the great-uncle." },
    { id: "S-va", short: "Veterans Bureau master index card", kind: "derivative", year: 1935, img: ["va-index"],
      cite: "U.S. Veterans Bureau, Master Index, Form 7202 (rev. Sept. 1926), card for TERMENAS JOSEPH MICHAEL; \"United States, Veterans Administration Master Index, 1917–1940\"; image via FamilySearch.",
      read: "Pvt 1c Co A 29 Engrs; 12134 Sobieski Ave, Detroit, Mich.; Sn 1 803 38(?); born 5-16-93; enlisted 9-20-17; discharged 7-15-19; died 6-11-35 (handwritten). Claim numbers: C 756 521 (marked X: XC, deceased-veteran claim folder), A 2 145 463 (adjusted compensation, the World War bonus), T 218 571 (war risk term insurance), Ct. 490 671 (service certificate)." },
    { id: "S-marr-index", short: "NYC marriage index, Brooklyn, 1922", kind: "derivative", year: 1922, img: ["marriage-index-1922", "marriage-index-1922-b"],
      cite: "\"New York, New York City Marriage Records, 1829–1938,\" database, FamilySearch, entry for Joseph M Termens and Della Malkitus, 25 April 1922, Kings, New York; citing certificate no. 4615.",
      url: "https://www.familysearch.org/ark:/61903/1:1:Q2C2-FQ1P",
      read: "Groom Joseph M Termens, 28 (estimated birth 1894); bride Della Malkitus, 21 (estimated birth 1901). Groom's parents Rozys [Termens] and Kostantina Giadraet; bride's parents Michael [Malkitus] and Eva Vaschaushos." },
    { id: "S-death", short: "Michigan death certificate, 1935", kind: "original", year: 1935, img: ["death-1935"],
      cite: "Michigan Department of Health, Division of Vital Statistics, Certificate of Death, State Office no. 197810, register no. 7051, Joseph Termmens (also known as Termenas, Termens), Detroit, Wayne County, 11 June 1935; image via FamilySearch, \"Michigan Death Certificates, 1921–1952.\"",
      read: "Died at Henry Ford Hospital, Detroit; residence 15001 Rockdale St., 12 months in the city, 23 years in the U.S.; male, white, married, husband of Delia Matukaitis; born May 16, 1895; age 40 years 1 month 23 days; attendant at furnace, Ford Motor Co., last worked 6-9-35; born Telsiu, Lithuania; father Unknown Termmens, born Lithuania; mother's maiden name Unknown, born Lithuania; informant Mrs. Termmens, 15001 Rockdale Ave.; burial Mt. Olivet Cemetery 6-14-35; undertaker Chas. Stepanauckas, Detroit. Cause: second and third degree burns of the entire body; industrial accident, burned at Ford Motor by flames from a furnace; autopsy yes; signed A. A. Hughes, M.D., coroner. Annotated at the top \"aff. att. 2-14-45\" (affidavit attached 14 Feb 1945)." },
    { id: "S-burial", short: "Mt. Olivet burial locator", kind: "derivative", year: 1935, img: ["mt-elliott-locator"],
      cite: "Mt. Elliott Cemetery Association, \"Locate a Loved One,\" online database, entry for Joseph Termens, Mt. Olivet Cemetery, died 11 June 1935, Section 51, Lot 41, Grave 957.",
      url: "https://www.mtelliott.com/locate-a-loved-one/",
      read: "Joseph Termens, Mount Elliott Group, Mt. Olivet Cemetery; Section 51, Lot 41, Grave 957." },
    { id: "S-headstone", short: "Headstone, Mt. Olivet", kind: "original", year: 1935, img: ["headstone", "grave-mt-olivet"],
      cite: "Joseph Termens headstone, Mt. Olivet Cemetery, Detroit, Michigan, Section 51, Lot 41, Grave 957; photographs in his great-uncle's research file (2026).",
      read: "\"DEAR HUSBAND / JOSEPH TERMENS / 1895 [cross] 1935\"." },
    { id: "S-manifest-pl", short: "SS President Lincoln manifest, 1912 (candidate)", kind: "original", year: 1912, img: ["manifest-1912-a", "manifest-1912-b"],
      cite: "\"List or Manifest of Alien Passengers for the United States,\" S.S. President Lincoln, sailing from Hamburg 18 September 1912, arriving New York 30 September 1912, list 6, line 4, Josef Terminas; Statue of Liberty–Ellis Island Foundation passenger database (id JJRH-VNB).",
      url: "https://www.statueofliberty.org/arrival-details/?id=JJRH-VNB",
      read: "Terminas, Josef, 19, male, single; Lithuanian, Russia; other columns not yet read at full resolution." },
    { id: "S-unit", short: "29th Engineers unit histories", kind: "authored",
      cite: "U.S. Army Center of Military History, lineage and honors, 29th Engineer Company; GlobalSecurity.org, \"29th Engineer Battalion (Topographic)\"; Missouri Over There, George J. Maguolo papers (letters of a corporal of Co. A, 29th Engineers, 1917–1919).",
      url: "https://history.army.mil/",
      read: "Co. A organized at Camp Devens 13 Sep 1917 as Co. D, 25th Engineers; redesignated Co. A, 29th Engineers, 20 Oct 1917; sailed on USS Agamemnon 31 Oct 1917, arrived Brest 12 Nov 1917; reached Langres 3 Dec 1917 and built the AEF base printing plant in the Turenne Barracks (machinery, a power plant with eight 25-kilowatt gasoline generating sets, the wiring for light and power, water and sewer); the regiment surveyed and printed maps for St. Mihiel and the Meuse-Argonne." },
    { id: "S-aerial", short: "Aerial photographs of Mt. Olivet, 1949 and 1967", kind: "original", img: ["aerial-mt-olivet-1949", "aerial-mt-olivet-1967"],
      cite: "Detroit Edison (DTE) aerial survey photographs, frames dated 28 April 1949 and 16 May 1967, showing Mt. Olivet Cemetery and Detroit City Airport, Detroit, Michigan; supplied by the family.",
      read: "The cemetery's triangle between the railway and Van Dyke, with Detroit City Airport to the south-east." },
    { id: "S-owner", short: "Your account of your mother's line (2026)", kind: "original", year: 2026,
      cite: "Joseph Pavia, statement of his maternal line to Claude, 24 November 2026: mother Toni Hinkle (born Sanders); her mother Laurie Jordan; her mother Barbara Feole; and the family's understanding that Joseph Termenas is Barbara's father or her grandfather.",
      read: "Primary for his mother and grandmother (people he knows); family tradition for the link to Joseph Termenas, which he says he has not researched himself and is not sure of." },
    { id: "S-greatuncle", short: "Great-uncle's research file (2026)", kind: "authored", year: 2026,
      cite: "Joe Seconder (Joseph's great-uncle, Laurie's brother), \"Joseph Termens,\" research notes with document images, 26 pp. (PDF, 2026), shared with Joseph 24 November 2026.",
      read: "Compiles the draft card, enlistment record and discharge, the Veterans Bureau card with its claim numbers explained, the unit history of Co. A, 29th Engineers, the muster rolls and the Chaumont detached-service entry, the naturalization index, petition and certificate, the 1922 marriage index with both sets of parents, the death certificate, the Mt. Olivet burial and headstone, two candidate ships for 1912, and the VA medallion for an unmarked or older veteran's grave." },
  ],

  /* ------------------------------------------------------------------ events: each with its assertions (one per source) and a conclusion */
  events: [
    {"id": "E-birth-father", "type": "birth", "who": ["P-father"], "date": {"text": "May 1973", "sort": "1973-05-01"}, "conclusion": "Born in May 1973.", "confidence": "probable", "assert": [{"src": "S-anc-pri", "value": "Joseph Craig Pavia, born May 1973", "info": "undetermined", "ev": "direct"}, {"src": "S-anc-tree", "value": "Joseph Pavia Sr., your father", "info": "primary", "ev": "indirect", "note": "your own tree"}]},
    {"id": "E-birth-glenda", "type": "birth", "who": ["P-glenda"], "date": {"text": "9 Jun 1946", "sort": "1946-06-09"}, "place": "PL-delano", "conclusion": "Born in Delano, Tennessee, on 9 June 1946.", "confidence": "probable", "assert": [{"src": "S-anc-cfh", "value": "born 9 Jun 1946, Delano, Tennessee", "info": "secondary", "ev": "direct"}, {"src": "S-anc-pri", "value": "born June 1946", "info": "undetermined", "ev": "direct"}]},
    {"id": "E-death-glenda", "type": "death", "who": ["P-glenda"], "date": {"text": "1 Sep 2022", "sort": "2022-09-01"}, "place": "PL-monroe", "conclusion": "Died at Medilodge of Monroe, Michigan, on 1 September 2022, aged 76.", "confidence": "probable", "assert": [{"src": "S-glenda-obit", "value": "died Thursday, September 1, 2022, at Medilodge of Monroe, age 76", "info": "secondary", "ev": "direct"}]},
    {"id": "E-burial-glenda", "type": "burial", "who": ["P-glenda"], "date": {"text": "3 Sep 2022", "sort": "2022-09-03"}, "place": "PL-mmp", "conclusion": "Buried at Michigan Memorial Park, Huron Township.", "confidence": "probable", "assert": [{"src": "S-glenda-obit", "value": "private graveside service Saturday, September 3, 2022; Michigan Memorial Park Cemetery", "info": "secondary", "ev": "direct"}, {"src": "S-anc-cfh", "value": "burial 2022, Huron Township", "info": "secondary", "ev": "direct"}]},
    {"id": "E-birth-buster", "type": "birth", "who": ["P-buster"], "date": {"text": "9 May 1913", "sort": "1913-05-09"}, "place": "PL-mcminn", "conclusion": "Born in McMinn County, Tennessee, on 9 May 1913.", "confidence": "probable", "assert": [{"src": "S-anc-ssaci", "value": "born 9 May 1913, McMinn County, TN", "info": "primary", "ev": "direct", "note": "his own application"}, {"src": "S-anc-ww2", "value": "born 9 May 1913, McMinn, Tenn", "info": "primary", "ev": "direct"}]},
    {"id": "E-res-buster40", "type": "residence", "who": ["P-buster", "P-joy"], "date": {"text": "16 Oct 1940", "sort": "1940-10-16"}, "place": "PL-athens", "conclusion": "Living in Athens, Tennessee, working at the Athens Stove Works.", "confidence": "probable", "assert": [{"src": "S-anc-ww2", "value": "residence Athens, McMinn County; employer Athens Stove Works", "info": "primary", "ev": "direct"}, {"src": "S-anc-census", "value": "1940: Athens, McMinn, with wife Joy and son Jimmie", "info": "undetermined", "ev": "direct"}]},
    {"id": "E-death-buster", "type": "death", "who": ["P-buster"], "date": {"text": "9 Mar 1992", "sort": "1992-03-09"}, "place": "PL-riverview", "conclusion": "Died in Riverview, Michigan, on 9 March 1992.", "confidence": "probable", "assert": [{"src": "S-anc-midi", "value": "died 9 Mar 1992, Riverview, Wayne County", "info": "secondary", "ev": "direct"}]},
    {"id": "E-burial-buster", "type": "burial", "who": ["P-buster"], "date": {"text": "1992", "sort": "1992-03-12"}, "place": "PL-mmp", "conclusion": "Buried at Michigan Memorial Park, Flat Rock.", "confidence": "possible", "assert": [{"src": "S-fs-tree", "value": "buried Michigan Memorial Park, Flat Rock", "info": "undetermined", "ev": "direct"}]},
    {"id": "E-birth-joy", "type": "birth", "who": ["P-joy"], "date": {"text": "9 Feb 1913", "sort": "1913-02-09"}, "place": "PL-delano", "conclusion": "Born in Delano, Polk County, Tennessee, on 9 February 1913.", "confidence": "probable", "assert": [{"src": "S-anc-ssaci", "value": "born 9 Feb 1913, Delano, Polk, TN", "info": "primary", "ev": "direct", "note": "her own application"}]},
    {"id": "E-death-joy", "type": "death", "who": ["P-joy"], "date": {"text": "26 Mar 1990", "sort": "1990-03-26"}, "place": "PL-annarbor", "conclusion": "Died in Ann Arbor, Michigan, on 26 March 1990.", "confidence": "probable", "assert": [{"src": "S-anc-midi", "value": "died 26 Mar 1990, Ann Arbor, Washtenaw County", "info": "secondary", "ev": "direct"}]},
    {"id": "E-marr-bk", "type": "marriage", "who": ["P-buster", "P-joy"], "date": {"text": "4 Aug 1935", "sort": "1935-08-04"}, "place": "PL-polk", "conclusion": "Married in Polk County, Tennessee, on 4 August 1935.", "confidence": "probable", "assert": [{"src": "S-anc-marr35", "value": "Buster Kirkland, 22, and Joy Moss; 4 Aug 1935, Polk County; bride's father Chester Moss", "info": "primary", "ev": "direct", "note": "index; the register image is unread"}]},
    {"id": "E-birth-chester", "type": "birth", "who": ["P-chester"], "date": {"text": "3 Jul 1890", "sort": "1890-07-03"}, "place": "PL-delano", "conclusion": "Born in Delano, Polk County, Tennessee, on 3 July 1890.", "confidence": "possible", "assert": [{"src": "S-fs-tree", "value": "born 3 Jul 1890, Delano, Polk, TN; died Oct 1980", "info": "undetermined", "ev": "direct"}]},
    {"id": "E-birth-anderson", "type": "birth", "who": ["P-anderson"], "date": {"text": "23 Sep 1855 (or 23 Mar 1858)", "sort": "1855-09-23"}, "place": "PL-monroetn", "conclusion": "Born in Monroe County, Tennessee, in 1855 or 1858.", "confidence": "possible", "assert": [{"src": "S-fs-tree", "value": "born 23 Sep 1855, Monroe, TN", "info": "undetermined", "ev": "direct"}, {"src": "S-scrapbook", "value": "3/23/1858", "info": "secondary", "ev": "direct"}], "conflict": "C11"},
    {"id": "E-death-anderson", "type": "death", "who": ["P-anderson"], "date": {"text": "1936", "sort": "1936-07-07"}, "place": "PL-monroetn", "conclusion": "Died in Monroe County, Tennessee, in 1936; buried at Citico Baptist Church, Vonore.", "confidence": "possible", "assert": [{"src": "S-fs-tree", "value": "died 7 Jul 1936, Monroe, TN", "info": "undetermined", "ev": "direct"}, {"src": "S-scrapbook", "value": "9/7/1936", "info": "secondary", "ev": "direct"}], "conflict": "C11"},
    { id: "E-birth", type: "birth", who: ["P-joseph"], date: { text: "16 May 1893", sort: "1893-05-16" }, place: "PL-telsiai", placeNote: "Telšiai on the death certificate only; \"Lithuania, Russia\" everywhere else",
      conclusion: "Born 16 May 1893 in Lithuania (then the Russian Empire), probably at or near Telšiai.", confidence: "probable", conflict: "C1",
      assert: [
        { src: "S-draft", value: "May 16, 1893; Lithuania, Russia", info: "secondary", ev: "direct", note: "his own statement at 24; a person's own birth date is secondary information (he could not witness it), but a self-report at registration is strong" },
        { src: "S-pet", value: "16 May 1893; Lithuania, Russia", info: "secondary", ev: "direct", note: "sworn by him" },
        { src: "S-nat-index", value: "May 16th, 1893; Lithuania, Russia", info: "secondary", ev: "direct", note: "abstracted from the petition, so not independent of it" },
        { src: "S-va", value: "5-16-93", info: "undetermined", ev: "direct", note: "from his service papers" },
        { src: "S-discharge", value: "24 4/12 years old at enlistment, 20 Sep 1917 → born about May 1893", info: "secondary", ev: "indirect" },
        { src: "S-nat-cert", value: "age 26 on 14 Jul 1919 → born Jul 1892–Jul 1893", info: "secondary", ev: "indirect" },
        { src: "S-marr-index", value: "age 28 on 25 Apr 1922 → born Apr 1893–Apr 1894 (the index estimates 1894)", info: "undetermined", ev: "indirect" },
        { src: "S-manifest-pl", value: "age 19 in Sep 1912 → born 1892–1893 (if this manifest is his)", info: "undetermined", ev: "indirect" },
        { src: "S-death", value: "May 16, 1895; Telsiu, Lithuania", info: "secondary", ev: "direct", note: "informant: his widow, after 13 years of marriage" },
        { src: "S-headstone", value: "1895", info: "secondary", ev: "direct", note: "likely ordered from the death record" }] },
    { id: "E-emig", type: "emigration", who: ["P-joseph"], date: { text: "on or about 13 Aug 1912", sort: "1912-08-13" }, place: "PL-hamburg",
      conclusion: "Left from Hamburg about 13 August 1912.", confidence: "probable", conflict: "C9",
      assert: [{ src: "S-pet", value: "emigrated from Hamburg on or about 13 Aug 1912", info: "primary", ev: "direct" }] },
    { id: "E-arr", type: "immigration", who: ["P-joseph"], date: { text: "23 Aug 1912", sort: "1912-08-23" }, place: "PL-nyc",
      conclusion: "Arrived at New York on 23 August 1912, on a ship whose name on the petition reads \"Columbia\" (unconfirmed; the manifest is not yet found).", confidence: "probable", conflict: "C9",
      assert: [
        { src: "S-pet", value: "arrived New York 23 Aug 1912 on the vessel \"Columbia\" (?)", info: "primary", ev: "direct" },
        { src: "S-death", value: "23 years in the U.S. in June 1935 → arrived about 1912", info: "secondary", ev: "indirect" },
        { src: "S-manifest-pl", value: "a Josef Terminas, 19, arrived New York 30 Sep 1912 from Hamburg", info: "undetermined", ev: "indirect", note: "five weeks after the date he swore to; probably another man" },
        { src: "S-greatuncle", value: "suggests Kaiserin Auguste Victoria, Hamburg 14 Aug → New York 24 Aug 1912", info: "secondary", ev: "indirect" }] },
    { id: "E-decl", type: "declaration", who: ["P-joseph"], date: { text: "21 Oct 1916", sort: "1916-10-21" }, place: "PL-detroit",
      conclusion: "Declared his intention to become a citizen at Detroit on 21 October 1916.", confidence: "probable",
      assert: [
        { src: "S-pet", value: "declared intention 21 Oct 1916 at Detroit, Mich., in the Circuit Court", info: "primary", ev: "direct" },
        { src: "S-draft", value: "\"Declarant\" in June 1917", info: "primary", ev: "indirect" }] },
    { id: "E-draft", type: "draft", who: ["P-joseph"], date: { text: "5 Jun 1917", sort: "1917-06-05" }, place: "PL-detroit",
      conclusion: "Registered for the draft in Detroit on 5 June 1917, living on Cardoni Avenue, a motion-picture operator out of work.", confidence: "proven",
      assert: [{ src: "S-draft", value: "registered 5 Jun 1917; home 761(?) Cardoni; motion picture operator; unemployed; single", info: "primary", ev: "direct" }] },
    { id: "E-enlist", type: "enlistment", who: ["P-joseph"], date: { text: "20 Sep 1917", sort: "1917-09-20" }, place: "PL-columbus",
      conclusion: "Enlisted at Columbus Barracks, Ohio, on 20 September 1917.", confidence: "proven",
      assert: [
        { src: "S-enlist", value: "enlisted 20 Sep 1917 at Columbus Barracks, Ohio", info: "primary", ev: "direct" },
        { src: "S-va", value: "Enl 9-20-17", info: "undetermined", ev: "direct" }] },
    { id: "E-devens", type: "service", who: ["P-joseph"], date: { text: "17–20 Oct 1917", sort: "1917-10-17" }, place: "PL-devens",
      conclusion: "At Camp Devens with Co. D, 25th Engineers, which became Co. A, 29th Engineers, on 20 October 1917.", confidence: "proven",
      assert: [{ src: "S-muster", value: "assigned 25th Engineers 22 Sep, joined 24 Sep; Co. D, 25th Eng. 17 Oct; Co. A, 29th Eng. 20 Oct 1917", info: "primary", ev: "direct" }, { src: "S-unit", value: "Co. D, 25th Engineers redesignated Co. A, 29th Engineers, 20 Oct 1917", info: "secondary", ev: "indirect" }] },
    { id: "E-sail", type: "service", who: ["P-joseph"], date: { text: "31 Oct 1917", sort: "1917-10-31" }, place: "PL-hoboken",
      conclusion: "Sailed for France on USS Agamemnon with his company, 31 October 1917.", confidence: "probable",
      assert: [{ src: "S-muster", value: "on the company's initial muster roll aboard USS Agamemnon, 31 Oct 1917", info: "primary", ev: "direct" }, { src: "S-unit", value: "Agamemnon sailed 31 Oct 1917", info: "secondary", ev: "indirect" }] },
    { id: "E-brest", type: "service", who: ["P-joseph"], date: { text: "12 Nov 1917", sort: "1917-11-12" }, place: "PL-brest",
      conclusion: "Landed at Brest, France, 12 November 1917.", confidence: "probable",
      assert: [{ src: "S-unit", value: "Agamemnon arrived at Brest 12 Nov 1917", info: "secondary", ev: "indirect" }] },
    { id: "E-langres", type: "service", who: ["P-joseph"], date: { text: "from 3 Dec 1917", sort: "1917-12-03" }, place: "PL-langres",
      conclusion: "Served at Langres with the company that built and ran the AEF base map-printing plant, from 3 December 1917; an electrician in a company whose first job was the plant's power and wiring.", confidence: "probable",
      assert: [{ src: "S-unit", value: "Co. A reached Langres 3 Dec 1917; built the printing plant's power plant and wiring", info: "secondary", ev: "indirect" }, { src: "S-enlist", value: "knowledge of vocation: electrician", info: "primary", ev: "indirect" }] },
    { id: "E-chaumont", type: "service", who: ["P-joseph"], date: { text: "from 27 Apr 1919", sort: "1919-04-27" }, place: "PL-chaumont",
      conclusion: "On detached service at General Headquarters, AEF, Chaumont, from 27 April 1919.", confidence: "probable",
      assert: [{ src: "S-muster", value: "\"DS Chaumont 4/27/19\"", info: "primary", ev: "direct", note: "transcribed by the great-uncle; the image is in the file" }] },
    { id: "E-nat", type: "naturalization", who: ["P-joseph"], date: { text: "14 Jul 1919", sort: "1919-07-14" }, place: "PL-boston",
      conclusion: "Naturalized at the U.S. District Court in Boston on 14 July 1919, as a soldier under the Act of May 9, 1918; certificate no. 1229058.", confidence: "proven",
      assert: [
        { src: "S-nat-cert", value: "admitted 14 Jul 1919, Boston; certificate 1229058", info: "primary", ev: "direct" },
        { src: "S-pet", value: "petition filed and sworn 14 Jul 1919", info: "primary", ev: "direct" },
        { src: "S-nat-index", value: "admitted July 14th, 1919", info: "primary", ev: "direct" }] },
    { id: "E-discharge", type: "discharge", who: ["P-joseph"], date: { text: "15 Jul 1919", sort: "1919-07-15" }, place: "PL-devens",
      conclusion: "Honorably discharged at Camp Devens on 15 July 1919, a private first class; later awarded the Victory Medal with the France clasp.", confidence: "proven",
      assert: [{ src: "S-discharge", value: "discharged 15 Jul 1919, Camp Devens; Pvt 1cl, Co. A, 29th Engineers", info: "primary", ev: "direct" }, { src: "S-enlist", value: "discharge stamp Jul 15 1919; Victory Medal with France clasp approved", info: "primary", ev: "direct" }, { src: "S-va", value: "Dis 7-15-19", info: "undetermined", ev: "direct" }] },
    { id: "E-res1919", type: "residence", who: ["P-joseph"], date: { text: "1919", sort: "1919-07-14" }, place: "PL-cambridge",
      conclusion: "Gave 140 Howard Street, Cambridge, Massachusetts, as his home in July 1919 (the typed index card says 180).", confidence: "probable", conflict: "C8",
      assert: [{ src: "S-pet", value: "Camp Devens, Mass. / 140 Howard St., Cambridge", info: "primary", ev: "direct" }, { src: "S-nat-index", value: "180 Howard St., Cambridge", info: "primary", ev: "direct" }, { src: "S-nat-cert", value: "residing at Camp Devens, Ayer", info: "primary", ev: "direct" }] },
    { id: "E-marr", type: "marriage", who: ["P-joseph", "P-della"], date: { text: "25 Apr 1922", sort: "1922-04-25" }, place: "PL-brooklyn",
      conclusion: "Married Della Malkitus in Kings County (Brooklyn), New York, on 25 April 1922 (certificate no. 4615).", confidence: "probable", conflict: "C3",
      assert: [{ src: "S-marr-index", value: "Joseph M Termens, 28, and Della Malkitus, 21; 25 Apr 1922, Kings; cert. 4615", info: "undetermined", ev: "direct", note: "an index: the certificate image is the next source to see (Q5)" }, { src: "S-death", value: "husband of Delia Matukaitis (1935)", info: "primary", ev: "indirect" }] },
    { id: "E-res1930", type: "residence", who: ["P-joseph"], date: { text: "between 1926 and 1935", sort: "1930-01-01" }, place: "PL-detroit",
      conclusion: "Lived at 12134 Sobieski Avenue, Detroit, at some time between 1926 and 1935 (the address on his Veterans Bureau card).", confidence: "possible",
      assert: [{ src: "S-va", value: "12134 Sobieski Ave, Detroit", info: "undetermined", ev: "direct", note: "the card form is the Sept 1926 revision, so the address is 1926 or later" }] },
    { id: "E-occ", type: "occupation", who: ["P-joseph"], date: { text: "to 9 Jun 1935", sort: "1935-06-09" }, place: "PL-detroit",
      conclusion: "Worked as a furnace attendant for the Ford Motor Company until 9 June 1935.", confidence: "probable",
      assert: [{ src: "S-death", value: "attendant at furnace, Ford Motor Co.; last worked 6-9-35", info: "secondary", ev: "direct" }] },
    { id: "E-death", type: "death", who: ["P-joseph"], date: { text: "11 Jun 1935", sort: "1935-06-11" }, place: "PL-hfh",
      conclusion: "Died at Henry Ford Hospital, Detroit, on 11 June 1935, of second- and third-degree burns over his whole body from a furnace accident at work for the Ford Motor Company. Living at 15001 Rockdale; married.", confidence: "proven",
      assert: [
        { src: "S-death", value: "died 11 Jun 1935, Henry Ford Hospital; burns, industrial accident, flames from a furnace at Ford Motor", info: "primary", ev: "direct", note: "the coroner's findings, with an autopsy" },
        { src: "S-va", value: "Died 6-11-35", info: "undetermined", ev: "direct" },
        { src: "S-burial", value: "died 11 Jun 1935", info: "undetermined", ev: "direct" }] },
    { id: "E-burial", type: "burial", who: ["P-joseph"], date: { text: "14 Jun 1935", sort: "1935-06-14" }, place: "PL-mtolivet",
      conclusion: "Buried at Mt. Olivet Cemetery, Detroit, on 14 June 1935: Section 51, Lot 41, Grave 957, under a stone reading \"Dear Husband\".", confidence: "proven",
      assert: [
        { src: "S-death", value: "Mt. Olivet Cem. 6-14-35; undertaker Chas. Stepanauckas", info: "primary", ev: "direct" },
        { src: "S-burial", value: "Section 51, Lot 41, Grave 957", info: "undetermined", ev: "direct" },
        { src: "S-headstone", value: "DEAR HUSBAND JOSEPH TERMENS 1895 1935", info: "secondary", ev: "direct" }] },
  ],

  /* ------------------------------------------------------------------ conflicts, each with its proof argument */
  conflicts: [
    {"id": "C11", "person": "P-anderson", "q": "When was Anderson Carson Kirkland born and when did he die?", "status": "open", "conclusion": "unresolved", "argument": "FamilySearch's compiled profile gives 23 Sep 1855 to 7 Jul 1936; the family scrapbook's handwritten caption reads 3/23/1858 to 9/7/1936. The death dates agree once the scrapbook's 9/7 is read day-first (7 September) or the tree's month is wrong; the births differ by month and year. Neither is a record: his death certificate (Tennessee, 1936) and the 1860 and 1870 censuses of Monroe County will decide it."},
    { id: "C1", person: "P-joseph", q: "When was Joseph born: 1893, 1894 or 1895?", status: "resolved", conclusion: "16 May 1893",
      argument: "Every record made while Joseph himself was the informant gives 16 May 1893: his draft card (1917), his naturalization petition (1919, sworn) and the index made from it, and the Veterans Bureau card drawn from his service papers. The ages recorded in 1917 (24 4/12) and 1919 (26) agree with a birth in May 1893. The 1922 marriage age (28) fits a birth between April 1893 and April 1894 and so does not contradict 1893; the index's \"1894\" is the indexer's estimate, not a statement. Only two items give 1895: the 1935 death certificate, where the informant was his widow, and the headstone, which was almost certainly cut from the same information. The death certificate is also inconsistent with itself: an age of 40 years 1 month 23 days at 11 June 1935 points to 19 April 1895, not 16 May 1895. The 1945 affidavit attached to it may be a correction (Q17). Conclusion: 1893, from several records made with his own knowledge, over one secondary account made after his death. Open point: dates in the Russian Empire were kept in the Julian calendar, 12 days behind; 16 May may be his Julian date (Gregorian 28 May) or already converted, which only the Lithuanian baptismal record can settle (Q11)." },
    { id: "C2", person: "P-joseph", q: "Which surname spelling is his own?", status: "resolved", conclusion: "Termenas (Lithuanian), later Termens",
      argument: "He signed \"Termenas\" himself on his enlistment record and twice on his naturalization petition (1919), and the Army, the court and the Veterans Bureau all use it. -as is the Lithuanian masculine ending; Termenas is the form in his own hand. \"Terminas\" appears only on a manifest not yet proved to be his. From 1922 the family used the shortened American form Termens (marriage index, headstone); \"Termmens\" on the death certificate is a clerk's doubling. In Lithuanian usage his wife would be Termenienė and an unmarried daughter Termenaitė, which matters when searching Lithuanian-language church and newspaper records." },
    { id: "C3", person: "P-della", q: "Was his wife's maiden name Malkitus or Matukaitis?", status: "open", conclusion: "unresolved",
      argument: "The 1922 marriage index reads Della Malkitus, daughter of Michael Malkitus and Eva Vaschaushos. The 1935 death certificate, where she herself was the informant, calls her Delia Matukaitis. An informant's own maiden name is primary information, while an index is derivative and a common place for misreadings; but she may also have given a different spelling in 1935. Matukaitis is a common Lithuanian surname; Malkitus is not. The marriage certificate image (Brooklyn 1922, no. 4615) and her parents' census and immigration records should decide it (Q5, Q14)." },
    { id: "C4", person: "P-joseph", q: "Grey or brown eyes?", status: "resolved", conclusion: "brown (possibly grey-brown)",
      argument: "The 1917 registrar wrote grey; the 1919 discharge and naturalization certificate, made by two different offices within a day of each other, both say brown. Physical descriptions are a clerk's judgment; this is not evidence against identity." },
    { id: "C5", person: "P-joseph", q: "How tall was he?", status: "resolved", conclusion: "about 5 ft 8 in (5 ft 7 to 5 ft 10 across three records)",
      argument: "Draft card, 1917: the registrar wrote 5-10 in figures (not \"medium\", as first read; Muse's blind read KIN-MUS-02 caught it and Claude re-read the card). Discharge, 1919: 5 ft 7 in. Naturalization certificate, 1919: 5 ft 8 in. The two 1919 figures were taken two days apart at Camp Devens and Boston and agree within an inch; the 1917 registrar's 5-10 is the outlier, likely an estimate at the desk." },
    { id: "C6", person: "P-joseph", q: "What was his Army service number?", status: "resolved", conclusion: "180338",
      argument: "The discharge, read again at full size on 25 Nov 2026, shows six figures, 1-8-0-3-3-8, after a small cross; Muse read the same six blind (KIN-MUS-02). The Veterans Bureau index card is typed \"1 803 38\": the same six figures in the same order, grouped oddly by the typist. The first reading, 1803038, added a 0 that is not on the page, and the argument for seven digits rested on it. The later roster's 180238 differs in one figure and is a transcription. Two documents and two independent readers agree: 180338. His service record (NPRC) would confirm it but is not needed to settle it." },
    { id: "C7", person: "P-joseph", q: "The death certificate's own age does not match its birth date.", status: "explained", conclusion: "recording error in 1935",
      argument: "Born 16 May 1895 and died 11 June 1935 would make him 40 years 0 months 26 days, not 40 years 1 month 23 days (which points to 19 April 1895). Either the age or the date was worked out wrongly by the informant or the clerk; either way the 1935 birth data is the weakest in the file (see C1)." },
    { id: "C8", person: "P-joseph", q: "Where did he live in 1919: Camp Devens or Cambridge?", status: "explained", conclusion: "both",
      argument: "A soldier awaiting discharge lived at Camp Devens; the petition gives both Camp Devens and 140 Howard Street, Cambridge (his own petition; the index card typed from it says 180, and Gemini found no 180 Howard Street in the 1918-1920 directories), which reads as his civilian address. Who lived at 140 Howard Street in 1919-1920 (city directory, 1920 census) may show a relative or the household he lived with before he went to Detroit (Q4, Q15)." },
    { id: "C9", person: "P-joseph", q: "Which ship brought him in 1912?", status: "open", conclusion: "Hamburg ~13 Aug → New York 23 Aug 1912 (his sworn account); vessel unconfirmed",
      argument: "His sworn petition gives Hamburg on or about 13 August and New York on 23 August 1912; the vessel's name reads \"Columbia\". The great-uncle's candidate, SS President Lincoln (New York 30 Sep 1912, Josef Terminas, 19), is five weeks later and probably another man of a similar name; his second candidate, Kaiserin Auguste Victoria (Hamburg 14 Aug, New York 24 Aug 1912), is a day from the sworn date. Next: search the New York arrival lists for 23 and 24 August 1912 for Termenas and its variants, and the Hamburg emigration lists (Staatsarchiv Hamburg) for mid-August 1912, which give the home town (Q1)." },
    { id: "C10", person: "P-ggm", q: "Is Joseph Termenas Barbara's father or her grandfather?", status: "open", conclusion: "unresolved",
      argument: "The family links Barbara Feole to Joseph Termenas but not by how many generations, and the great-uncle's file is about Joseph alone: it names no child of his. The dates are the test. Joseph and Della married on 25 April 1922 and he died on 11 June 1935, so their children were born between 1922 and 1935, and a grandchild could hardly be born before about 1937. If Barbara was born in 1922-1935 and is in their household in 1930 or with Della in 1940, she is his daughter and was born a Termens; if she was born later, the 1940 and 1950 censuses will show which of their children is her parent. Her own birth or marriage record, or one question to Laurie, settles it (Q19, Q20, Q4). New indirect evidence (24 Nov 2026, Gemini): (1) the Termens research was compiled by Joe Seconder, Barbara's son, who calls Joseph his grandfather's generation only if Barbara is his daughter; (2) Katherine M. Springer's 1997 obituary names Barbara (Mel) Feole and Betty (Thomas) Holgate as her nieces, so Barbara had a sister Betty and an aunt born in 1907, exactly the generation of Joseph (born 1893) and Della (about 1901). Both point to daughter; neither is a record of her birth. Leaning: daughter (H6)." },
  ],

  /* hypotheses to test, never shown as facts */
  hypotheses: [
    {"id": "H8", "text": "Katherine M. Springer (1907-1997), aunt of Barbara Feole and Betty Holgate, was Della's sister: born a Matukaitis (her middle initial M.).", "test": "Q24"},
    { id: "H1", text: "His baptismal name was Juozapas (Joseph) Termenas, baptised in Telšiai Roman Catholic parish in May 1893.", test: "Q11" },
    { id: "H2", text: "\"Rozys\" is an indexer's reading of the father's Lithuanian given name (for example Juozas or Rapolas).", test: "Q5, Q11" },
    { id: "H3", text: "His mother was Konstancija Giedraitė (\"Kostantina Giadraet\" in the index).", test: "Q5, Q11" },
    { id: "H4", text: "Della Malkitus and Delia Matukaitis are one woman and Matukaitis is the true spelling.", test: "Q5, Q14" },
    { id: "H6", text: "Barbara Feole is Joseph and Della's daughter, born a Termens between 1922 and 1935.", test: "Q19, Q4" },
    { id: "H7", text: "Barbara Feole is Joseph and Della's granddaughter, the child of one of their children, born after about 1937.", test: "Q19, Q4, Q20" },
    { id: "H5", text: "The 1945 affidavit corrected the death certificate for a widow's or child's claim (Social Security or the VA XC claim).", test: "Q10, Q17" },
  ],

  /* ------------------------------------------------------------------ the research plan: each question is a Gemini or owner task */
  questions: [
    {"id": "Q22", "p": 2, "person": "P-father", "q": "Glenda's 2022 obituary lists her grandchildren Joseph (Irene) Pavia Jr., Tyler Burd, Madeline Burd and Violet Joy Pavia. Are you Joseph Jr., and is Violet your sister? Add them on your father's card (you, Irene, Violet).", "sources": "you", "task": "owner"},
    {"id": "Q23", "p": 2, "person": "P-francis", "q": "Francis Joseph Pavia's parents: his birth (about 1938-39) and his marriage to Glenda Kirkland (Michigan, about 1965-1973) name them. Kept apart from two other Pavia families (Beloit; the Maltese Pavias of Canton and Plymouth).", "sources": "Michigan marriage records; 1940 and 1950 censuses of Wayne County", "task": "KIN-GEM-15"},
    {"id": "Q24", "p": 1, "person": "P-ggm", "q": "Who was Katherine M. Springer (1907-1997), aunt of Barbara and Betty: Joseph's sister, or Della's (a Matukaitis)? Her own obituary, marriage and Social Security record give her maiden name.", "sources": "S-springer-obit; Michigan marriage records; SSACI", "task": "KIN-GEM-15"},
    {"id": "Q25", "p": 1, "person": "P-ggm", "q": "Ask Joe Seconder, the great-uncle: is his mother Barbara the daughter of Joseph and Della Termenas, when and where was she born, and was Betty her sister? He compiled the file.", "sources": "your great-uncle", "task": "owner"},
    { id: "Q19", p: 1, person: "P-ggm", q: "Ask Laurie (or Barbara, if you can): Barbara's birth date and place, her surname at birth, her parents' names, and whom she married. One answer from the family settles C10 faster than any archive; then the records confirm it.", sources: "the family; then Barbara's birth and marriage records", task: "owner" },
    { id: "Q20", p: 1, person: "P-ggm", q: "Find Barbara Feole's own records: her birth (surname at birth, parents), her marriage to a Feole, Laurie's birth record naming her as mother, and, if she has died, her death record or obituary.", sources: "1950 census name search (NARA); Michigan and New York birth, marriage and death indexes; obituaries; SSDI", task: "KIN-GEM-14" },
    { id: "Q1", p: 1, person: "P-joseph", q: "Find his 1912 arrival: New York arrivals 22–25 Aug 1912 from Hamburg (Termenas, Terminas, Termen-, Juozapas/Josef), and the Hamburg emigration list for mid-August 1912; read the whole manifest line (last residence, nearest relative at home, who he was joining and where, height, birthplace).", sources: "Statue of Liberty–Ellis Island Foundation; FamilySearch \"New York Passenger Arrival Lists (Ellis Island)\"; Staatsarchiv Hamburg Hamburger Passagierlisten (via Ancestry)", task: "KIN-GEM-07" },
    { id: "Q2", p: 1, person: "P-joseph", q: "Transcribe the whole petition and its back page (oath, order of the court) word for word, and the certificate of arrival if one is filed with it.", sources: "NARA M1368 roll 315, images 0913–0914 (NAID 59700981, 59700983)", task: "KIN-GEM-08" },
    { id: "Q3", p: 2, person: "P-joseph", q: "Find his declaration of intention, Detroit, 21 Oct 1916 (Wayne County Circuit Court or the U.S. court at Detroit): it often gives the town of birth, the ship and his physical description in his own words.", sources: "Wayne County Clerk naturalization records; Archives of Michigan; FamilySearch \"Michigan, Naturalization Records\"", task: "KIN-GEM-08" },
    { id: "Q4", p: 1, person: "P-joseph", q: "Find the family in the 1930 U.S. census (Detroit; Sobieski Avenue area) and Della with the children in 1940; also Joseph in 1920 (Detroit, Cambridge or Brooklyn). This shows whether Barbara (later Feole) is their daughter, or which of their children is her parent (C10).", sources: "1920, 1930, 1940 U.S. censuses (NARA; FamilySearch, Ancestry); 1940 enumeration district maps", task: "KIN-GEM-09" },
    { id: "Q5", p: 1, person: "P-della", q: "See the Brooklyn marriage certificate no. 4615 of 1922: both parties' birthplaces, residences, parents (as written), the officiant and witnesses.", sources: "NYC Municipal Archives (Kings County marriage certificates 1922); FamilySearch image if filmed", task: "KIN-GEM-10" },
    { id: "Q10", p: 2, person: "P-joseph", q: "Request the VA claim file XC 756 521: a widow's or children's claim lists the marriage and every child with birth dates.", sources: "VA Records Management Center / NARA (find which holds XC files for a 1935 death)", task: "KIN-GEM-11" },
    { id: "Q11", p: 2, person: "P-joseph", q: "Search the Telšiai parish birth (baptism) registers for May 1893 (Julian calendar) for a Termenas child; record the parents' names, the village and the godparents.", sources: "Lithuanian State Historical Archives (LVIA), Telšiai parish metrical books; epaveldas.lt digitized registers; Lithuanian surname dictionary", task: "KIN-GEM-12" },
    { id: "Q7", p: 2, person: "P-joseph", q: "Find newspaper reports of the furnace accident at Ford, June 1935, and any obituary or Lithuanian-community notice.", sources: "Detroit Free Press, Detroit News (June 1935); Lithuanian-American papers (Draugas, Dirva, Tėvynė) via epaveldas.lt and Chronicling America", task: "KIN-GEM-13" },
    { id: "Q9", p: 3, person: "P-joseph", q: "Ask the Mt. Elliott Cemetery Association for the Section 51, Lot 41 record: lot owner, every burial in the lot (Della? a child?), and the 1935 interment card.", sources: "Mt. Elliott Cemetery Association, (313) 365-5650", task: "owner" },
    { id: "Q17", p: 3, person: "P-joseph", q: "Order the 1935 death record with the 14 Feb 1945 affidavit attached: what was corrected and by whom.", sources: "Michigan Vital Records (MDHHS); Wayne County Clerk", task: "owner" },
    { id: "Q14", p: 3, person: "P-della", q: "Della/Delia's own story: her birth (about 1901), her parents Michael and Eva, where she was in 1910 and 1920, her death and burial.", sources: "U.S. censuses 1910–1950; SSDI; Michigan death index; Mt. Olivet lot record", task: "KIN-GEM-10" },
    { id: "Q15", p: 3, person: "P-joseph", q: "City directories: Detroit 1916–1935 (Cardoni, Sobieski, Rockdale; occupation by year) and Cambridge 1918–1920 (who lived at 140 Howard Street; the index card says 180).", sources: "Detroit and Cambridge city directories (Ancestry U.S. City Directories; Internet Archive; Detroit Public Library Burton Collection)", task: "KIN-GEM-13" },
    { id: "Q18", p: 3, person: "P-joseph", q: "Read the Co. A rosters and his service record substitutes for the service number, the dates in France and his duty at Chaumont.", sources: "NARA RG 64 rosters; RG 120 (AEF) records of the 29th Engineers; NPRC", task: "KIN-GEM-11" },
  ],

  /* the world around the family: since 2026-11-24 it is not kept here; Kin reads the one world-history dataset (Athenaeum's,
     pillars/athenaeum/data/world-history.json via kit/history.js), the entries that touch the family's places (lineage.js) */

  /* what is known about people the tree does not have a card for yet: the tree draws everyone's unknown mother and father
     (pillars/kin/lineage/lineage.js, addGhosts) and shows these facts on them; each line is from a source, never a guess */
  known: {
  },

  /* the research log: every search run, found or not (a search that finds nothing is negative evidence, and it stops the next
     person repeating it). Outside AIs' search rows arrive through tools/kin/lineage_intake.py. */
  log: [
    { id: "L1", date: "2026-11-24", by: "Claude", q: "Q20", where: "the open web (obituary sites, Legacy.com, funeral homes, newspapers)", terms: "\"Barbara Feole\" obituary", result: "not found", note: "No notice for a Barbara Feole. The nearest was an unrelated Feole family notice (Pauline Breault Feole, 2018). Not searched: obituaries behind a paywall, or under her birth surname." },
    { id: "L2", date: "2026-11-24", by: "Claude", q: "Q7", where: "the open web (Legacy.com, Detroit funeral homes, newspaper page indexes)", terms: "\"Termens\" Detroit obituary, with Della, Joseph or Barbara", result: "not found", note: "Nothing under Termens. Detroit Free Press pages on newspapers.com are behind a paywall and were not read; spellings Termen, Termins, Termenas not yet tried (KIN-GEM-13)." },
    { id: "L3", date: "2026-11-24", by: "Claude", q: "Q20", where: "the open web (Legacy.com, Michigan funeral homes, GenLookups Michigan obituary archive)", terms: "Feole obituaries in Michigan naming a Barbara or a Laurie", result: "not found", note: "No notice names Barbara or Laurie. One Michigan Feole was found: Muriel W. Feole, 92, of Gaylord, died 22 Sep 2025; her survivors were not visible, so nothing links her to Barbara (a lead only, see L7)." },
    { id: "L4", date: "2026-11-24", by: "Claude", q: "Q4", where: "the open web (genealogy guides, Bentley Library, FamilySearch Wayne County wiki)", terms: "Termens or Termenas, Detroit, with Della or Joseph, 1935", result: "not found", note: "Nothing on the family. The routes it names: Detroit's own death index (1920 on, microfiche; deaths in the city are not in the Wayne County index) and the 1935 Detroit city directory (KIN-GEM-13)." },
    { id: "L5", date: "2026-11-24", by: "Claude", q: "Q19", where: "the open web (Legacy.com, Dignity Memorial, funeral homes)", terms: "an obituary naming Toni Hinkle or Toni Sanders as a daughter, in Michigan", result: "not found", note: "No parent's notice names her. Living people's records are best asked of the family (Q19)." },
    { id: "L6", date: "2026-11-24", by: "Claude", q: "Q9", where: "Find a Grave (via web search)", terms: "Termens memorials in Michigan", result: "not found", note: "No memorial under Termens; Joseph's grave at Mt. Olivet is known only from the family's photographs (S-headstone). A memorial for him would help the next researcher." },
    { id: "L7", date: "2026-11-24", by: "Claude", q: "Q20", where: "the open web", terms: "the full obituary of Muriel W. Feole, Gaylord, 2025, and its survivors", result: "not found", note: "Only the death notice line was found. Whether she is related to Barbara's husband is unknown." },
  ],

  /* the five GPS elements, per person: what is done, what is not */
  gps: {
    "P-joseph": { search: "partial: no census, arrival manifest, declaration, newspaper or church record yet", cite: "done for every assertion", analysis: "done", conflicts: "C1, C2, C4, C5, C6, C7, C8 resolved or explained; C3, C9 open", written: "the summary and the proof arguments above" },
    "P-ggm": { search: "begun: your account, your baby book, your Ancestry tree, Katherine Springer's 1997 obituary; her own birth and marriage records not yet found", cite: "done for each name", analysis: "begun", conflicts: "C10 open, leaning daughter", written: "the C10 argument" },
    "P-della": { search: "barely begun: one index entry and one mention", cite: "done", analysis: "begun", conflicts: "C3 open", written: "not yet" },
  },
};

/* Photographs and scans from Gemini's Ancestry run (Drive: Kin/lineage records/Ancestry.com, Pavia Family Tree/Photos & Scans,
   24 Nov 2026), each read by Claude against what it claims to be. Two of the three "portraits" were not (C12); none of them is
   used as anyone's likeness. media: the pictures the 3D tree shows on a person (a face for the medallion, the full image). */
(function (L) {
  L.sources.push(
    { id: "S-glenda-photo", short: "Glenda's obituary photograph (2022)", kind: "original", year: 2022, img: ["glenda-2022"],
      cite: "Photograph of Glenda Mardelle Pavia published with her obituary, Merkle Funeral Service, Monroe, Michigan, September 2022; copy in Drive (Photos & Scans), saved by Gemini on 24 November 2026.",
      read: "Glenda seated outdoors at a café table in sunglasses and a red patterned dress, in summer, shortly before 2022: the photograph her family chose for the obituary." },
    { id: "S-stone-jamesak", short: "James Kirkland's grave marker, Butler Cemetery", kind: "original", year: 1869, img: ["stone-james-kirkland-1869"],
      cite: "Photograph of the grave marker of James Kirkland, Butler Cemetery, Polk County, Tennessee, by B&E Roberts (watermark); copy in Drive (Photos & Scans, IMG_7202), saved by Gemini on 24 November 2026.",
      read: "JAMES / KIRKLAND / 1781 1869, cut in a polished granite tablet. The marker is modern (machine-cut letters in polished granite, not a nineteenth-century stone): descendants set it long after 1869, so its dates are what they believed, secondary information, not a record made at the time." },
    { id: "S-butler-stones", short: "Two more Kirkland markers at Butler Cemetery", kind: "original", img: ["stone-butler-wb-hazel", "stone-butler-rk"],
      cite: "Photographs of two Kirkland grave markers, Butler Cemetery, Polk County, Tennessee, by B&E Roberts (watermark); copies in Drive (Photos & Scans, IMG_7200 and IMG_7201), saved by Gemini on 24 November 2026.",
      read: "(1) KIRKLAND / HAZEL 1905–1907 | W. B. 1884–1919. (2) R. K. KIRKLAND / WAS BORN NOV / 3. 185[4?] / DIED SEP 1 1899 (the last digit of the birth year is worn). Neither is in the tree yet: kin buried near James, a lead to his other descendants, not evidence for this line." },
    { id: "S-stone-will", short: "Richard and Mary Stone's wills (abstracts)", kind: "derivative", year: 1795, img: ["will-richard-stone-1795"],
      cite: "\"Will of Richard Stone, 7 September 1795 (Abstract)\" and \"Will of Mary Stone, 29 December 1805 (Abstract)\", typed abstracts (the Drive note reads \"Monks bk pg 28\"), Lunenburg County, Virginia; image linked from WikiTree profile Stone-673, saved by Gemini on 24 November 2026. The original Lunenburg County will books are not yet seen.",
      read: "Richard's will (abstract): to his son Richard; to his \"well beloved wife\" Mary Stone; \"To his son-in-law James Pulliam and wife, Elizabeth, I loan three Negroes for their use during their natural lives\"; to the sons-in-law John Lester (wife Susannah), Peter and Letty Winn, Phillip Snead (wife Ann), Minor Wilkes and William Cockerham; to his granddaughter Ann Stone Townsend, the children of his daughter Mary Estes and the Townsend grandchildren. Witnesses Littleberry Winn, James McLaughlin, Sara Winn. Mary's will (abstract): the children of her daughter Phoebe Wilkes, deceased; the rest divided between her son Richard Stone, Elizabeth Pulliam, Susanna Lester, Letty Winn and Ann Snead. The wills name people the Stones enslaved: Jubiter, Patty, Jack, James Sr. and James Jr., Pat and Jenny, and twenty-three more (five men, four women, nine boys and five girls) the abstract does not name. Their names are kept here as the record gives them, so that their own descendants can find them." },
    { id: "S-fs-portraits", short: "Portraits attached on FamilySearch (not used)", kind: "authored", img: ["portrait-fs-l7p9-f2v"],
      cite: "Images attached to FamilySearch Family Tree profiles L7P9-F2V (James Altonia Kirkland), L8PV-BS5 (Nathaniel Robert Bivens) and LZ18-FC1 (Christopher Columbus Kirkland), saved to Drive by Gemini on 24 November 2026.",
      read: "L7P9-F2V: a colourised head-and-shoulders portrait of a man of about 45 to 55 with a heavy moustache. L8PV-BS5: the DAR logo, not a portrait. LZ18-FC1: an elderly woman, filed under a man's name. None is used as anyone's likeness (C12)." }
  );
  L.places.push(
    { id: "PL-lunenburg", name: "Lunenburg County, Virginia", hist: "Lunenburg County, Virginia", now: "Lunenburg County, Virginia", lat: 36.946, lon: -78.241 },
    { id: "PL-butler", name: "Butler Cemetery, Polk County", hist: "Butler Cemetery, Polk County, Tennessee", now: "Polk County, Tennessee", lat: 35.12, lon: -84.52, approx: "the county" }
  );
  L.events.push(
    { id: "E-will-rstone", type: "will", who: ["P-rstone", "P-yancy", "P-eastone", "P-jpulliam"], date: { text: "7 Sep 1795", sort: "1795-09-07" }, place: "PL-lunenburg",
      conclusion: "Richard Stone made his will on 7 September 1795 in Lunenburg County, Virginia, naming his wife Mary and \"his son-in-law James Pulliam and wife, Elizabeth\"; Mary's will (1805) names Elizabeth Pulliam among her children. If the abstract is faithful, Elizabeth Pulliam was the Stones' daughter.",
      confidence: "probable", assert: [{ src: "S-stone-will", value: "To his son-in-law James Pulliam and wife, Elizabeth; ... son Richard Stone, Elizabeth Pulliam, Susanna Lester, Letty Winn and Ann Snead", info: "primary", ev: "direct", note: "an abstract: the will book is the original to see" }] },
    { id: "E-burial-jamesak", type: "burial", who: ["P-jamesak"], date: { text: "1869", sort: "1869-01-01" }, place: "PL-butler",
      conclusion: "Buried at Butler Cemetery, Polk County, Tennessee, under a modern marker that reads 1781–1869.", confidence: "possible",
      assert: [{ src: "S-stone-jamesak", value: "JAMES KIRKLAND 1781 1869", info: "secondary", ev: "direct", note: "a modern replacement stone" }, { src: "S-fs-tree", value: "1781 (North Carolina) to 1869 (Polk County, TN); buried Butler Cemetery", info: "undetermined", ev: "direct" }] }
  );
  L.conflicts.push({ id: "C12", person: "P-jamesak", q: "Is the portrait attached to James Altonia Kirkland on FamilySearch (L7P9-F2V) a picture of him?", status: "resolved", conclusion: "No: it is not used as his likeness.",
    argument: "The sitter is a man of about 45 to 55, in the head-and-shoulders style of a cabinet card (1870s to 1900s), colourised later. James was born in 1781: the first photographs made in America date from 1839, when he was 58, and he died in 1869 at 88. A photograph of him would show an old man. The portrait is more likely one of his sons or grandsons and was attached to the wrong profile, a common error in collaborative trees; it stays in the records as what it is (S-fs-portraits)." });
  L.media = [
    { id: "M-glenda", person: "P-glenda", face: "face-glenda", img: "glenda-2022", src: "S-glenda-photo", caption: "Glenda, about 2022: the photograph chosen for her obituary." }
  ];
})(window.KIN_LINEAGE);

/* Gemini's Ancestry run, waves 2 to 4 (24 Nov 2026): the hint sweep on your Ancestry tree, the certainty-scored pedigree, the
   Culberson / Tippens / Bryant / Martin lines and the Pavia family of 1940. Read by Claude from Gemini's documents (Drive:
   Kin/lineage records/Ancestry.com, Pavia Family Tree). Indexed records (census, SSDI, VA gravesites) are derivative: probable
   until their images are read. Certainty: L.certainty gives, for each person, how sure the link to their parents is (0-100);
   "gemini" is the figure Gemini gave where Claude set a lower one, with the reason. Addresses and people-search sites that
   Gemini cited are not copied here. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), F = (id) => L.families.find((f) => f.id === id), C = (id) => L.conflicts.find((c) => c.id === id);
  L.sources.push(
    { id: "S-anc-hints", short: "Ancestry hints on your tree (24 Nov 2026)", kind: "derivative", year: 2026,
      cite: "Ancestry.com, hints on the \"Pavia Family Tree\" (tree 192482486): 1950 U.S. Federal Census index, U.S. Social Security Death Index 1935-2014, U.S. Veterans' Gravesites ca. 1775-2019, U.S. Find a Grave Index, Michigan Death Index 1971-1996, U.S. Social Security Applications and Claims Index, U.S. City Directories, and member photos; read by Gemini on 24 November 2026 (\"Pavia Family Tree: Profile Updates & Hint Sweep\", Drive).",
      read: "Barbara J. Rimsha, born about 1933, Michigan, in Detroit in 1950 with her mother Della E. Rimsha; Barbara J. Feole, born 24 Mar 1933, died 22 Jan 2009 (SSDI). Francis Joseph Pavia, born 7 Feb 1939, died 30 Mar 2018, buried Great Lakes National Cemetery, Holly, Michigan (veterans' gravesites; Find a Grave). Joy Chloey Kirkland's obituary clipping (shared by a member). A 1950 photograph captioned \"Sons of Jesse Columbus Kirkland\": Robert Adgar, Buster Madison, Jesse Reed and Luther Alden Kirkland." },
    { id: "S-joy-obit", short: "Joy Kirkland's obituary (1990)", kind: "derivative", year: 1990,
      cite: "Death notice, \"KIRKLAND, JOY CHLOEY\", Detroit newspaper, March 1990, from a Newspapers.com clipping shared on Ancestry by a member (7 Sep 2020); transcribed by Gemini on 24 November 2026. The clipping image is not yet read by Claude.",
      read: "\"KIRKLAND JOY CHLOEY March 26, 1990. Beloved wife of Buster, dearest mother of James, Glenda Pavia, and Stephen. Dear grandmother of eight grandchildren and one great grandchild. Loving daughter of Ada Moss. Dear sister of Frittie Kirkland, and Haroldene Wiggins. Funeral from the Girrbach-Krasun Funeral Home (Southgate Chapel) ... Interment Michigan Memorial Park Cemetery.\"" },
    { id: "S-pavia-obits", short: "Charles P. Pavia (2009) and Caroline Dembeck (2014) obituaries", kind: "original", year: 2009,
      cite: "Obituaries of Charles P. Pavia (died 16 Apr 2009, Allen Park; The Detroit News via Legacy.com) and Caroline Rita Dembeck (born 27 Jun 1927, died 31 Dec 2014; Wujek-Calcaterra & Sons; The Macomb Daily), with the 1940 U.S. census screenshot saved in your Drive in 2023; read by Gemini on 24 November 2026 (Wave-3 dossier). Not yet read by Claude.",
      read: "Charles is survived by his sister Caroline (Donald) Dembeck and his brother Frank (Linda) Pavia; Caroline by Frank (Linda) Pavia and the late Charles (Christine). With the 1940 census (Joseph Pavia about 41 and Grace about 29 with their children), Francis Joseph \"Frank\" Pavia is their son." },
    { id: "S-culberson", short: "Culberson, Tippens and Bryant lines (compiled)", kind: "authored",
      cite: "Interwoven Family blog (William L. Culberson; Mary Tennessee, William Henry and Eliza Tippens), WikiTree Culberson-413, Bryant-5485, Bryant-6193, Martin-28926, Turner-2959, Davies-2384, the Tennessee State Library's TeVA HAMI059 (Peter Culberson), read by Gemini on 24 November 2026 (Wave-3 dossier and certainty-scored pedigree).",
      read: "Compiled lines, each to be checked against the records they cite: the 1870 and 1880 McMinn County censuses, the Cochran Cemetery stones, John Bryant's 1800 Grayson County will, Nicholas Bryant's 1766 Carteret County will naming his grandchild Rebecca." },
    { id: "S-certainty", short: "Gemini's certainty-scored pedigree", kind: "authored", year: 2026,
      cite: "\"Kin: Certainty-Scored Pedigree & Wave-2 Breakthroughs\" (23-24 Nov 2026) and \"Kin: Wave-3 Aggressive Lineage & 397-File Media Harvest\" (24 Nov 2026), Gemini, Drive.",
      read: "A percentage for every parent-to-child link: 90-100 verified primary proof, 70-89 strong consensus, 40-69 working hypothesis, under 40 disputed or disproved. It names the links that are false online: the \"Sir John Llewellyn\" Welsh line (under 10%), Rev. William Pullein of Ripley (under 35%), Randall Holt Jr. to Elizabeth Allin (under 35%), John Matson of New Sweden (under 20%), Thomas Tabb Giles as James Madison Giles's father (disproved) and \"Cheesesquire\" Kirkland as Nathan's father (under 35%). None of those is in this tree." }
  );
  L.places.push(
    { id: "PL-holly", name: "Holly, Michigan", hist: "Holly, Oakland County, Michigan", now: "Holly, Michigan", lat: 42.7914, lon: -83.6277 },
    { id: "PL-glnc", name: "Great Lakes National Cemetery, Holly", hist: "Great Lakes National Cemetery, Holly, Oakland County, Michigan", now: "Holly, Michigan", lat: 42.818, lon: -83.598 },
    { id: "PL-hartshorne", name: "Hartshorne, Oklahoma", hist: "Hartshorne, Pittsburg County, Oklahoma", now: "Hartshorne, Oklahoma", lat: 34.8448, lon: -95.5583 }
  );

  /* Barbara: the 1950 census and the SSDI settle C10 as far as the indexes go */
  const ggm = P("P-ggm");
  ggm.status = "probable";
  ggm.names.push({ given: "Barbara J.", surname: "Rimsha", type: "record", src: ["S-anc-hints"], note: "1950 census, with her mother Della E. Rimsha" },
                 { given: "Barbara Josephine", surname: "Termens", type: "birth", src: ["S-anc-hints"], note: "an Ancestry member's tree; her birth surname if she was Joseph's daughter" });
  ggm.summary = "Your mother's mother's mother. Born 24 March 1933 in Michigan; in 1950 she was Barbara J. Rimsha, living in Detroit with her mother Della E. Rimsha (Della remarried after Joseph died in 1935). Married Bob Seconder (Laurie's father), later Mel Feole; died 22 January 2009 in Holly, Michigan.";
  const ft = F("F-termenas"); if (ft && ft.uncertain) delete ft.uncertain["P-ggm"];
  const c10 = C("C10");
  c10.status = "resolved"; c10.conclusion = "daughter (probable)";
  c10.argument += " Settled as far as the indexes go (24 Nov 2026): Barbara was born on 24 March 1933 (SSDI), inside Joseph and Della's marriage (1922-1935), and in 1950 she lived in Detroit with her mother Della E. Rimsha (1950 census index); an Ancestry member's tree names her Barbara Josephine Termens, daughter of Joseph Termens and Adelle E. Matukaitis. A granddaughter could not have been born in 1933. The census image and her birth record will make it proven.";
  const della = P("P-della");
  della.names.push({ given: "Della E.", surname: "Rimsha", type: "married", src: ["S-anc-hints"], note: "1950 census: remarried after 1935" });
  L.events.push(
    { id: "E-birth-ggm", type: "birth", who: ["P-ggm"], date: { text: "24 Mar 1933", sort: "1933-03-24" }, place: "PL-detroit", conclusion: "Born 24 March 1933 in Michigan (Detroit by the 1950 census).", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "Barbara J. Feole, born 24 Mar 1933 (SSDI); Barbara J Rimsha, born abt 1933 Michigan (1950 census)", info: "secondary", ev: "direct" }] },
    { id: "E-res-ggm50", type: "residence", who: ["P-ggm", "P-della"], date: { text: "1950", sort: "1950-04-01" }, place: "PL-detroit", conclusion: "Barbara (16) and her mother Della, now Rimsha, in Detroit.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "Barbara J Rimsha, b. abt 1933 MI, Detroit; Mother: Della E Rimsha", info: "undetermined", ev: "direct", note: "the index; the image is still to be read" }] },
    { id: "E-death-ggm", type: "death", who: ["P-ggm"], date: { text: "22 Jan 2009", sort: "2009-01-22" }, place: "PL-holly", conclusion: "Died 22 January 2009, Holly, Michigan.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "Barbara J. Feole, d. 22 Jan 2009 (SSDI); Holly, Oakland, MI (member tree)", info: "secondary", ev: "direct" }] }
  );

  /* 25 Nov 2026: the 1950 census sheet itself, read at full size (Gemini found it, KIN-GEM-28; Claude read the image). The index had
     her as "Barbara J Rimsha"; the sheet names her TERMENS, so her birth surname is on an original record and C10 rests on it. */
  L.sources.push(
    { id: "S-census-1950-termens", short: "1950 census, Detroit: Della Rimsha and Barbara Termens", kind: "original", year: 1950, img: ["census-1950-termens-detail", "census-1950-termens"], url: "https://1950census.archives.gov/",
      cite: "1950 U.S. Census of Population and Housing, Detroit, Wayne County, Michigan, enumeration district 85-1439, sheet 75, lines 9-10, enumerated 10 April 1950; NARA image 43290879-Michigan-123566-0029.",
      read: "Line 9: Rimsha, Della E., head, white, female, 45, married, born Oklahoma. Line 10: Termens, Barbara J., daughter, white, female, 17, never married, born Michigan. Read from the image at full size on 25 Nov 2026." }
  );
  {
    const g = P("P-ggm"), n = g.names.find((x) => x.surname === "Rimsha");
    if (n) { n.surname = "Termens"; n.type = "record"; n.src = ["S-census-1950-termens"]; n.note = "1950 census sheet: Termens, daughter of Della E. Rimsha (the index read Rimsha)"; }
    g.status = "proven";
    g.summary = g.summary.replace("in 1950 she was Barbara J. Rimsha, living in Detroit with her mother Della E. Rimsha", "in 1950 she was Barbara J. Termens, 17, living in Detroit with her mother Della E. Rimsha");
    const r50 = L.events.find((e) => e.id === "E-res-ggm50");
    if (r50) { r50.conclusion = "Barbara (17) and her mother Della, now Rimsha, in Detroit; Barbara still a Termens."; r50.confidence = "proven";
      r50.assert.unshift({ src: "S-census-1950-termens", value: "Termens, Barbara J., daughter, 17, born Michigan; Rimsha, Della E., head, 45, married, born Oklahoma", info: "primary", ev: "direct" }); }
    const c = C("C10");
    c.conclusion = "daughter";
    c.argument += " Proven from the original (25 Nov 2026): the 1950 sheet itself (ED 85-1439, sheet 75, lines 9-10) names her Termens, Barbara J., daughter of the head, Della E. Rimsha, age 17. A granddaughter of Joseph would not carry his surname as Della's daughter at 17 in 1950, and her 1933 birth falls inside Joseph and Della's marriage.";
  }

  /* your father's father, and his family in 1940 */
  const fr = P("P-francis");
  fr.status = "probable"; delete fr.living;
  fr.summary = "Your father's father, Francis Joseph \"Frank\" Pavia: born 7 February 1939 in Detroit to Joseph and Grace Pavia, a veteran, of Harsens Island and Algonac; married Glenda Mardelle Kirkland, later Linda S. Pavia; died 30 March 2018 and buried at Great Lakes National Cemetery, Holly.";
  L.events.push(
    { id: "E-birth-francis", type: "birth", who: ["P-francis"], date: { text: "7 Feb 1939", sort: "1939-02-07" }, place: "PL-detroit", conclusion: "Born 7 February 1939 in Detroit.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "b. 07 Feb 1939 Detroit, Wayne, MI (member tree); b. 2/7/1939 (veterans' gravesites)", info: "secondary", ev: "direct" }] },
    { id: "E-death-francis", type: "death", who: ["P-francis"], date: { text: "30 Mar 2018", sort: "2018-03-30" }, conclusion: "Died 30 March 2018.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "d. 30 Mar 2018 (Find a Grave index; veterans' gravesites)", info: "secondary", ev: "direct" }] },
    { id: "E-burial-francis", type: "burial", who: ["P-francis"], date: { text: "2018", sort: "2018-04-01" }, place: "PL-glnc", conclusion: "Buried at Great Lakes National Cemetery, Holly, as a veteran.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "Francis Joseph Joseph Pavia ... Burial Great Lakes National Cemetery, Holly, MI", info: "primary", ev: "direct", note: "the VA's own index of its cemeteries" }] }
  );
  L.people.push(
    { id: "P-josephp", sex: "M", status: "probable", names: [{ given: "Joseph", surname: "Pavia", type: "birth", src: ["S-pavia-obits"] }], summary: "Your father's father's father: born about 1899; in Detroit in 1940 with Grace and their children Caroline, Charles and Francis. His birthplace and parents are the next question (a Maltese Pavia family lived in Detroit too; Erminia Diedo Pavia's household is a different one)." },
    { id: "P-grace", sex: "F", status: "probable", names: [{ given: "Grace", surname: "", type: "as-given", src: ["S-pavia-obits"], note: "her maiden name is not known; one Ancestry tree gives Lucrezia Calleja (C13)" }], summary: "Joseph's wife, born about 1911; mother of Caroline, Charles and Francis." },
    { id: "P-caroline", sex: "F", status: "probable", names: [{ given: "Caroline Rita", surname: "Pavia", type: "birth", src: ["S-pavia-obits"] }, { given: "Caroline Rita", surname: "Dembeck", type: "married", src: ["S-pavia-obits"] }], summary: "Francis's sister: born 27 June 1927, married Donald T. Dembeck (1928-2018), died 31 December 2014; buried Resurrection Cemetery, Clinton Township." },
    { id: "P-charlesp", sex: "M", status: "probable", names: [{ given: "Charles P.", surname: "Pavia", type: "birth", src: ["S-pavia-obits"] }], summary: "Francis's brother: born about 1929, married Christine Pianowski, died 16 April 2009 in Allen Park; buried Our Lady of Hope Cemetery, Brownstown Township." }
  );
  L.families.push({ id: "F-pavia-sr", partners: ["P-josephp", "P-grace"], children: ["P-caroline", "P-charlesp", "P-francis"] });
  L.conflicts.push({ id: "C13", person: "P-grace", q: "Who was Grace Pavia, Francis's mother?", status: "open", conclusion: "unresolved",
    argument: "The 1940 census and her children's obituaries give Grace (born about 1911). One Ancestry tree (\"Burd Family Tree\") gives Francis's parents as Joseph Paul Pavia and Lucrezia Calleja, and Ancestry's suggestion of Giuseppe Antonio Pavia and Erminia Margaret Diedo belongs to another Detroit Pavia family (Erminia, of Malta, 1918-2018, was the mother of a different Frank). Grace may be an English form of a Maltese or Italian name; Caroline's or Charles's Social Security application (NUMIDENT) names their mother in full and settles it." });

  /* Jesse Columbus's other sons (a 1950 photograph) and Joy's sisters (her obituary) */
  L.people.push(
    { id: "P-robertk", sex: "M", status: "possible", names: [{ given: "Robert Adgar", surname: "Kirkland", type: "birth", src: ["S-anc-hints"], note: "Bob" }], summary: "Buster's brother, in the 1950 photograph of Jesse Columbus Kirkland's sons." },
    { id: "P-reedk", sex: "M", status: "possible", names: [{ given: "Jesse Reed", surname: "Kirkland", type: "birth", src: ["S-anc-hints"] }], summary: "Buster's brother, in the 1950 photograph of Jesse Columbus Kirkland's sons." },
    { id: "P-lutherk", sex: "M", status: "possible", names: [{ given: "Luther Alden", surname: "Kirkland", type: "birth", src: ["S-anc-hints"] }], summary: "Buster's brother, in the 1950 photograph of Jesse Columbus Kirkland's sons." },
    { id: "P-frittie", sex: "F", status: "probable", names: [{ given: "Frittie", surname: "Kirkland", type: "married", src: ["S-joy-obit"] }], summary: "Joy's sister (her obituary, 1990)." },
    { id: "P-haroldene", sex: "F", status: "probable", names: [{ given: "Haroldene", surname: "Wiggins", type: "married", src: ["S-joy-obit"] }], summary: "Joy's sister (her obituary, 1990)." }
  );
  F("F-jessec").children.push("P-robertk", "P-reedk", "P-lutherk");
  F("F-moss").children.push("P-frittie", "P-haroldene");
  P("P-joy").names.forEach((n) => { if (n.type === "birth") n.src = (n.src || []).concat("S-joy-obit"); });

  /* Ada Nellie Culberson's parents and grandparents; Rebecca Bryant's line to 1638; Josiah Turner's and Thomas Davis's parents */
  const add = (id, sex, given, surname, summary, status = "possible") => L.people.push({ id, sex, status, names: [{ given, surname, type: "birth", src: ["S-culberson"] }], summary });
  add("P-billc", "M", "William L.", "Culberson", "\"Bill\", 1867 to 1965; Ada's father. Buried Cochran Cemetery.");
  add("P-marytt", "F", "Mary Tennessee", "Tippens", "1873 to 1955; Ada's mother. Buried Cochran Cemetery.");
  add("P-peterc", "M", "Peter", "Culberson", "1833 to 1914. A Union private in Company F, 3rd Tennessee Cavalry, prisoner at Cahaba; McMinn County, Tennessee in 1870 and 1880.");
  add("P-selena", "F", "Selena Elizabeth", "Lowe", "1833 to 1886.");
  add("P-whtippens", "M", "William Henry", "Tippens", "1830 to 1910; married Eliza Owens 19 Sep 1867, McMinn County, Tennessee.");
  add("P-eliza", "F", "Eliza", "Owens", "1834 to 1915.");
  add("P-johnb", "M", "John", "Bryant", "1742 to 1800; his 1800 Grayson County, Virginia will names Rebecca.");
  add("P-lydia", "F", "Lydia", "Allen", "Born 1740.");
  add("P-nbryant", "M", "Nicholas Francis", "Bryant", "1718 to 1766; his 1766 Carteret County, North Carolina will names his grandchild Rebecca Bryant.");
  add("P-eleanor", "F", "Eleanor", "Martin", "1721 to 1768.");
  add("P-johnm", "M", "John", "Martin", "About 1680 to 1741.");
  add("P-maryborn", "F", "Mary", "Born", "1678 to 1741.");
  add("P-joelm", "M", "Joel", "Martin", "About 1638 to 1716, Lower Norfolk County, Virginia: the oldest person in the tree.");
  add("P-eward", "F", "Elizabeth", "Ward", "Joel Martin's wife.");
  add("P-josepht", "M", "Joseph", "Turner", "Died 1820.");
  add("P-maryrogers", "F", "Mary", "Rogers", "Joseph Turner's wife.");
  add("P-charlesdav", "M", "Charles", "Davies", "About 1706 to 1801, Chester County, Pennsylvania; Pvt. Thomas Davis's father.");
  L.families.push(
    { id: "F-culberson", partners: ["P-billc", "P-marytt"], children: ["P-ada"] },
    { id: "F-pculberson", partners: ["P-peterc", "P-selena"], children: ["P-billc"] },
    { id: "F-tippens", partners: ["P-whtippens", "P-eliza"], children: ["P-marytt"] },
    { id: "F-jbryant", partners: ["P-johnb", "P-lydia"], children: ["P-rbryant"] },
    { id: "F-nbryant", partners: ["P-nbryant", "P-eleanor"], children: ["P-johnb"] },
    { id: "F-martin", partners: ["P-johnm", "P-maryborn"], children: ["P-eleanor"] },
    { id: "F-joel", partners: ["P-joelm", "P-eward"], children: ["P-johnm"] },
    { id: "F-jturner", partners: ["P-josepht", "P-maryrogers"], children: ["P-josiah"] },
    { id: "F-davies", partners: ["P-charlesdav"], children: ["P-tdavis"] }
  );

  /* how sure each link to the parents is (0-100) */
  L.certainty = [
    ["P-self", 100, "you"], ["P-father", 97, "Glenda's obituary names her son Joseph"], ["P-mother", 98, "your own knowledge"],
    ["P-glenda", 98, "Joy's obituary names Glenda Pavia; Glenda's names her parents"], ["P-jennifer", 97, "Glenda's obituary"],
    ["P-francis", 90, "1940 census and his siblings' obituaries"], ["P-caroline", 90, "obituaries"], ["P-charlesp", 90, "obituaries"],
    ["P-buster", 95, "his Social Security application names his father"], ["P-jamesk", 95, "Glenda's and Joy's obituaries"], ["P-stevenk", 95, "obituaries"],
    ["P-joy", 98, "her Social Security application and her obituary"], ["P-frittie", 85, "Joy's obituary"], ["P-haroldene", 85, "Joy's obituary"],
    ["P-robertk", 75, "a captioned 1950 family photograph"], ["P-reedk", 75, "the same photograph"], ["P-lutherk", 75, "the same photograph"],
    ["P-jessec", 88, "compiled trees and the scrapbook", 95], ["P-anderson", 85, "compiled trees; his dates disagree (C11)", 92], ["P-jessea", 85, "compiled trees", 92],
    ["P-jamesak", 75, "compiled trees; the Cherokee applications prove Susanna's surname, not this link", 90], ["P-nathan", 55, "WikiTree warns his parents are unproven; his own link to James Altonia is compiled", 80],
    ["P-polly", 85, "compiled trees and the 1850 marriage", 95], ["P-jamesb", 80, "compiled trees", 90], ["P-benjamin", 78, "compiled trees and Nathaniel's will", 87],
    ["P-parthenia", 70, "geography and naming patterns", 78], ["P-josiah", 60, "naming patterns", 70], ["P-susannap", 80, "compiled trees and the DAR record", 90],
    ["P-eastone", 88, "her father's will (abstract) names her and her husband", 92], ["P-emaline", 80, "compiled trees", 90], ["P-hettie", 75, "compiled trees", 85],
    ["P-wesley", 75, "compiled trees", 85], ["P-tdavisjr", 80, "Quaker minutes and the DAR record", 92], ["P-tdavis", 72, "a compiled Chester County line", 90],
    ["P-ada", 85, "a family blog and the Cochran Cemetery stones", 95], ["P-billc", 85, "the 1870 and 1880 censuses", 95], ["P-marytt", 82, "their 1867 marriage and the stones", 92],
    ["P-rbryant", 82, "John Bryant's 1800 will", 95], ["P-johnb", 82, "his father's 1766 will names his child Rebecca", 95], ["P-eleanor", 65, "a compiled colonial pedigree", 80],
    ["P-johnm", 55, "a compiled colonial pedigree", 80], ["P-ggm", 90, "born 1933 and with her mother Della in 1950 (indexes)"], ["P-betty", 60, "Katherine Springer's obituary calls her Barbara's sister"],
    ["P-gp", 92, "the family and your baby book"], ["P-charles", 60, "a family tree photograph only"], ["P-della", 70, "the 1922 marriage index names her parents"],
    ["P-joseph", 50, "the great-uncle's file; the 1912 manifest candidate gives the father as Kazmierz (C9)"]
  ].map(([child, pct, basis, gemini]) => Object.assign({ child, pct, basis }, gemini ? { gemini } : {}));

  L.hypotheses.push(
    { id: "H9", text: "Bob Seconder, Laurie's father, is Robert H. Seconder (1931-2003, buried Crescent Hills Cemetery, Waterford), son of Wilbur Guy Seconder (1906-1988), grandson of Arthur George Seconder (born about 1884, England; a Dr. Barnardo's Home Child to Canada) and Bertha Loleta Lawson (1889-1985), whose line runs to Richard Mullinex and Lydia Ann Nelson of Esquesing Township, Halton County, Ontario. Gemini rates it 97%; Claude about 60%: the surname is rare (14 in the SSDI) and the places fit, but no record yet ties this Robert to Laurie.", test: "Q19, Q25; Laurie's birth record names her father" },
    { id: "H10", text: "Katherine M. Springer (1907-1997, born in Hartshorne, Oklahoma, a Lithuanian mining town) was born a Matukaitis, Della's sister: Hartshorne's Holy Rosary cemetery has Matewas Matukastes (1867-1907), Joe Matukas (1881-1918) and others. Gemini 60%.", test: "Katherine's marriage record; the 1910 census of Hartshorne" }
  );
  L.log.push(
    { id: "L8", date: "2026-11-24", by: "Gemini", q: "Q19", where: "Ancestry.com hints on your tree", terms: "hints for Barbara, Francis, Joy, Chester and Ada (39 hints read)", result: "found", note: "Barbara in the 1950 census with her mother Della E. Rimsha; her SSDI dates; Francis's VA burial; Joy's obituary. Applied above; images still to be read." },
    { id: "L9", date: "2026-11-24", by: "Gemini", q: "Q12", where: "LVIA fond 1480, inventory 1, file 56 (Telšiai Roman Catholic births, 1893), images 00022-00041", terms: "Termenas / Терменас, entries 40-117, March-July 1893", result: "not found", note: "Negative evidence for the 16 May 1893 birth in Telšiai parish itself; the parish of birth may be another (Kuršėnai has Termenas in the 1920s)." },
    { id: "L10", date: "2026-11-24", by: "Gemini", q: "Q15", where: "Cambridge city directories 1918-1920", terms: "Howard Street, Termenas", result: "not found", note: "Gemini reports that 180 Howard Street did not exist in those years (C8); to be checked against the directory pages." },
    { id: "L11", date: "2026-11-24", by: "Gemini", q: "Q1", where: "FamilySearch (record JJRH-VNB), SS President Lincoln, arriving 30 Sep 1912", terms: "Josef Terminas", result: "candidate", note: "Bound for Cambridge to his brother Jsidor; father Kazmierz Terminas in Kowno. Cambridge fits Joseph's later address, so C9 is reopened for a full identity argument; the arrival date he swore to (23 Aug) is five weeks earlier." }
  );
})(window.KIN_LINEAGE);

/* the questions the 24 Nov homework works on (KIN-GEM-15 to 34) */
window.KIN_LINEAGE.questions.push(
  { id: "Q26", p: 2, person: "P-grace", q: "Who was Grace Pavia (born about 1911), Francis's mother, and where did Joseph Pavia (born about 1899) come from? Their children's Social Security applications name her in full.", sources: "SSACI and NUMIDENT for Caroline (b. 1927) and Charles (d. 2009); 1930 and 1940 censuses; Wayne County marriages 1925-1927", task: "KIN-GEM-29" },
  { id: "Q27", p: 2, person: "P-della", q: "Della after 1935: whom she married (a Rimsha), when she died, and where she is buried.", sources: "Wayne County marriages 1935-1950; Michigan death index; SSDI", task: "KIN-GEM-30" },
  { id: "Q28", p: 2, person: "P-gp", q: "Laurie's birth record and who it names as her father (tests H9).", sources: "Michigan birth index about 1950-1958; Wayne and Oakland marriages 1950-1960", task: "KIN-GEM-32" },
  { id: "Q30", p: 3, person: "P-charles-sr", q: "Charles Sanders and Betty Flemming: their marriage, their 1950 household and their parents.", sources: "Michigan marriages 1945-1955; 1950 census", task: "KIN-GEM-33" },
  { id: "Q31", p: 3, person: "P-jessec", q: "The Kirkland line's own records: the 1880 and 1900 censuses, the 1850 marriage, and the Eastern Cherokee applications that name Susanna Boston.", sources: "U.S. censuses; Tennessee marriages; Eastern Cherokee Applications (NARA M1104)", task: "KIN-GEM-34" },
  { id: "Q32", p: 3, person: "P-ada", q: "The Culberson, Tippens and Bryant lines' own records: the 1870 and 1880 McMinn censuses, the 1867 marriage, the 1800 and 1766 wills.", sources: "U.S. censuses; Tennessee marriages; Grayson County, Virginia and Carteret County, North Carolina will books", task: "KIN-GEM-34" }
);

/* 2026-11-24, later: Gemini's "Deep Expansion" and "Wave-4 Deep Lineage" reports. The Pavias came from Malta: the 1950 census page
   (read by Claude from the National Archives image Gemini saved) has Joseph and Grace both born in Malta, with Caroline, Charles and
   Francis; the 1926 marriage record and the 1942 draft card (read by Gemini) name her Lucretia Calleja and "Lagrigia". C13 settled as
   probable. Wave 4's colonial parents go in as possible with Claude's lower figures beside Gemini's; the Seconder findings stay in H9
   (Bob's own link is untested). Left out on purpose: a living relative's present address, the people-search pages and the account email. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), C = (id) => L.conflicts.find((c) => c.id === id), H = (id) => L.hypotheses.find((h) => h.id === id);
  L.sources.push(
    { id: "S-census-1950-pavia", short: "1950 census, Detroit: Joseph and Grace Pavia", kind: "original", year: 1950, img: ["census-1950-pavia-detail", "census-1950-pavia"], url: "https://1950census.archives.gov/",
      cite: "1950 U.S. Census of Population and Housing, Detroit, Wayne County, Michigan, enumeration district 85-1999, sheet 8, lines 15-19, enumerated 6 April 1950 (enumerator Mildred Matel); National Archives. Image saved to Drive by Gemini on 24 November 2026; read by Claude the same day.",
      read: "2353 Inglis: Joseph Pavia, head, 52, married, born Malta, naturalized, grinder on cylinder blocks in an auto factory; Grace M., wife, 40, married, born Malta, naturalized, keeping house; Caroline R., daughter, 22, born Michigan, general office clerk; Charles P., son, 20, born Michigan, assembling auto heaters at a car factory; Francis J., son, 11, born Michigan. Joseph is on a sample line: his father and his mother were both born in Malta." },
    { id: "S-mi-marr-1926", short: "Marriage of Joseph Pavia and Lucretia Calleja, Detroit, 1926", kind: "original", year: 1926, url: "https://www.ancestry.com/imageviewer/collections/9093/images/41326_341668-01540?pId=1216301",
      cite: "Michigan, Marriage Records, 1867-1952 (Ancestry collection 9093), Wayne County file 317538, state file 82 12266. Read from the image by Gemini on 24 November 2026 (\"Pavia Family Tree: Deep Expansion\", Drive); the image is not yet read by Claude.",
      read: "Licence 25 August 1926; married 4 September 1926 in Detroit by Rev. Michael L. Borg, pastor; witnesses John Agius and Joseph D'Agostino. Groom Joseph Pavia, 29, auto worker, born in Malta, son of Paul Pavia and Caroline; bride Lucretia Calleja, 18, born in Malta, daughter of Costantino Calleja and Carmela Cassar." },
    { id: "S-draft-1942-jp", short: "Joseph Pavia's WWII draft card (1942)", kind: "original", year: 1942, url: "https://www.ancestry.com/imageviewer/collections/1002/images/004673194_02421?pId=11594207",
      cite: "U.S., World War II Draft Registration Cards, 1942 (Ancestry collection 1002): Joseph Pavia, serial U 4993, Local Board 44, Detroit, registered 27 April 1942. Read by Gemini on 24 November 2026.",
      read: "2353 Inglis, Detroit; employer Ford Motor Co., Rouge plant, Dearborn; 5 ft 2 in, 130 lb, brown eyes, black hair; the person who will always know his address: his wife, Lagrigia Pavia." },
    { id: "S-nat-idx-grace", short: "Grace Pavia's naturalization index card (1943)", kind: "derivative", year: 1943,
      cite: "U.S., Naturalization Records Indexes (Ancestry collection 1192): petition 188070, U.S. District Court, Detroit, 16 March 1943. Read by Gemini on 24 November 2026.",
      read: "Petition 188070, 16 March 1943, Detroit; born 8 March 1910." },
    { id: "S-colonial-w4", short: "Colonial Virginia and North Carolina lines (compiled, wave 4)", kind: "authored", year: 2026,
      cite: "WikiTree Martin-5258, Martin-13057, Keeling-63, Thorowgood-23, Rogers-38228, Rogers-639, Estes-46, Allen-60264, Bryant-6193, Stone-673; the Jamestowne Society (no. A9555); OurFamTree; Cavaliers and Pioneers and the Colonial Records of North Carolina (pages saved to Drive); read by Gemini on 24 November 2026 (\"Kin: Wave-4 Deep Lineage & 898-File Cumulative Archive Report\").",
      read: "Compiled lines: each link is to be checked against the will, deed or court entry it cites. Gemini's percentages are kept beside Claude's." },
    { id: "S-barnardo-1892", short: "Arthur Seconder's 1892 crossing (Library and Archives Canada)", kind: "derivative", year: 1892, url: "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Record?app=homchirec&IdNumber=1191949",
      cite: "Library and Archives Canada, Home Children 1869-1932 database, no. 1191949 (RG76-C-1-b, reel C-4515). Read by Gemini on 24 November 2026.",
      read: "Arthur Seconder, 12, in Dr. Barnardo's party (H92BA, 303 children under Mr. Owen) on the S.S. Carthaginian, Liverpool 17 March 1892 to Halifax 27 March 1892; the index notes the surname was hard to read." }
  );
  L.places.push({ id: "PL-malta", name: "Malta", hist: "Malta (a British colony until 1964)", now: "Malta", lat: 35.9375, lon: 14.3754 });

  /* Joseph and Grace */
  const jp = P("P-josephp");
  jp.names = [{ given: "Joseph Paul", surname: "Pavia", type: "birth", src: ["S-census-1950-pavia", "S-mi-marr-1926"] }];
  jp.summary = "Your father's father's father: born in Malta in 1897; in Detroit by 1926, when he married Lucretia (Grace) Calleja, also of Malta; a Ford Rouge worker in 1942 and a grinder on cylinder blocks in 1950, naturalized; died 28 June 1975 in Detroit.";
  const gr = P("P-grace");
  gr.names = [{ given: "Lucretia", surname: "Calleja", type: "birth", src: ["S-mi-marr-1926"], note: "Lucrezia in Maltese and Italian; \"Lagrigia\" on her husband's 1942 draft card" },
              { given: "Grace M.", surname: "Pavia", type: "married", src: ["S-census-1950-pavia", "S-pavia-obits"] }];
  gr.summary = "Your father's father's mother: born in Malta about 1908-1910 (her naturalization card says 8 March 1910); married Joseph Pavia in Detroit on 4 September 1926 as Lucretia Calleja, aged 18; known as Grace; naturalized in 1943; died 21 April 1982 in Detroit.";
  L.people.push(
    { id: "P-paulp", sex: "M", status: "possible", names: [{ given: "Paul", surname: "Pavia", type: "birth", src: ["S-mi-marr-1926"] }], summary: "Joseph's father, of Malta, named on his son's 1926 marriage record; born about 1870 (an estimate: his son was born in 1897)." },
    { id: "P-carolinep", sex: "F", status: "possible", names: [{ given: "Caroline", surname: "", type: "as-given", src: ["S-mi-marr-1926"], note: "her own surname is not given" }], summary: "Joseph's mother, of Malta, named on his 1926 marriage record; born about 1872 (an estimate)." },
    { id: "P-costantino", sex: "M", status: "possible", names: [{ given: "Costantino", surname: "Calleja", type: "birth", src: ["S-mi-marr-1926"] }], summary: "1871 to 1952, Malta: Lucretia's father, named on her 1926 marriage record (his dates from other members' trees)." },
    { id: "P-carmela", sex: "F", status: "possible", names: [{ given: "Carmela", surname: "Cassar", type: "birth", src: ["S-mi-marr-1926"] }], summary: "1872 to 1933, Malta: Lucretia's mother, named on her 1926 marriage record (her dates from other members' trees)." },
    /* colonial Virginia: the parents wave 4 found above Joel Martin and Mary Rogers */
    { id: "P-johnm-sr", sex: "M", status: "possible", names: [{ given: "John", surname: "Martin", type: "birth", src: ["S-colonial-w4"] }], summary: "About 1615 to 1666, Lower Norfolk County, Virginia: a burgess in 1651-52, arrived on the Margaret in 1633-34 (compiled; the Jamestowne Society's lineage)." },
    { id: "P-akeeling", sex: "F", status: "possible", names: [{ given: "Anne", surname: "Keeling", type: "birth", src: ["S-colonial-w4"] }], summary: "John Martin's wife, born about 1640 (an estimate), daughter of Thomas Keeling and Anne Thorowgood (compiled)." },
    { id: "P-tkeeling", sex: "M", status: "possible", names: [{ given: "Thomas", surname: "Keeling", type: "birth", src: ["S-colonial-w4"] }], summary: "About 1613 to 1664: came on the Hopewell in 1628; burgess for Elizabeth City in 1632-33 (compiled). The noble English line some trees give him is not supported (Gemini 30%)." },
    { id: "P-athorowgood", sex: "F", status: "possible", names: [{ given: "Anne", surname: "Thorowgood", type: "birth", src: ["S-colonial-w4"] }], summary: "About 1620 to about 1689: came on the John and Dorothy in 1634; living in 1688 (compiled)." },
    { id: "P-abrogers", sex: "M", status: "possible", names: [{ given: "Abraham", surname: "Rogers", type: "birth", src: ["S-colonial-w4"] }], summary: "1714 to 1762, Spotsylvania County, Virginia: Mary Rogers's father in one compiled tree (Gemini 65%)." },
    { id: "P-bestes", sex: "F", status: "possible", names: [{ given: "Barbara", surname: "Estes", type: "birth", src: ["S-colonial-w4"] }], summary: "About 1720 to 1773: Abraham Rogers's wife (compiled)." },
    { id: "P-progers", sex: "M", status: "possible", names: [{ given: "Peter", surname: "Rogers", type: "birth", src: ["S-colonial-w4"] }], summary: "About 1677 to about 1733 (dead by 1734), Virginia: Abraham Rogers's father (compiled)." },
    { id: "P-testes", sex: "M", status: "possible", names: [{ given: "Thomas", surname: "Estes", type: "birth", src: ["S-colonial-w4"] }], summary: "1688 to 1745, Virginia: Barbara Estes's father (compiled)." },
    { id: "P-annrogers", sex: "F", status: "possible", names: [{ given: "Ann", surname: "Rogers", type: "birth", src: ["S-colonial-w4"] }], summary: "Thomas Estes's wife, born about 1690 (an estimate)." },
    { id: "P-aestes", sex: "M", status: "possible", names: [{ given: "Abraham", surname: "Estes", type: "birth", src: ["S-colonial-w4"] }], summary: "1647 to 1720: from Kent, England, to Virginia about 1674 (compiled): the immigrant of the Estes line." }
  );
  const jm = P("P-joelm");
  jm.summary = "About 1662 (a 1672 orphans' court entry; older trees say 1638) to 1716, Bath, North Carolina; son of John Martin and Anne Keeling of Lower Norfolk County, Virginia (compiled).";
  const ew = P("P-eward");
  ew.names.push({ given: "Elizabeth", surname: "Alderson", type: "alternate", src: ["S-colonial-w4"], note: "Gemini, wave 4: daughter of Simon Alderson; Ward is the older trees' name (C14)" });
  L.families.push(
    { id: "F-pavia-malta", partners: ["P-paulp", "P-carolinep"], children: ["P-josephp"] },
    { id: "F-calleja", partners: ["P-costantino", "P-carmela"], children: ["P-grace"] },
    { id: "F-martin-va", partners: ["P-johnm-sr", "P-akeeling"], children: ["P-joelm"] },
    { id: "F-keeling", partners: ["P-tkeeling", "P-athorowgood"], children: ["P-akeeling"] },
    { id: "F-rogers", partners: ["P-abrogers", "P-bestes"], children: ["P-maryrogers"] },
    { id: "F-rogers-sr", partners: ["P-progers"], children: ["P-abrogers"] },
    { id: "F-estes", partners: ["P-testes", "P-annrogers"], children: ["P-bestes"] },
    { id: "F-estes-sr", partners: ["P-aestes"], children: ["P-testes"] }
  );
  L.events.push(
    { id: "E-marr-pavia-1926", type: "marriage", who: ["P-josephp", "P-grace"], date: { text: "4 Sep 1926", sort: "1926-09-04" }, place: "PL-detroit", conclusion: "Joseph Pavia, 29, and Lucretia Calleja, 18, both of Malta, married in Detroit on 4 September 1926.", confidence: "probable",
      assert: [{ src: "S-mi-marr-1926", value: "4 Sep 1926, Detroit; Joseph Pavia 29 and Lucretia Calleja 18, both born in Malta", info: "primary", ev: "direct", note: "read by Gemini; the image is not yet read by Claude" }] },
    { id: "E-birth-josephp", type: "birth", who: ["P-josephp"], date: { text: "1897", sort: "1897-01-01" }, place: "PL-malta", conclusion: "Born in Malta in 1897 (12 February or 2 December in the records Gemini read).", confidence: "probable",
      assert: [{ src: "S-census-1950-pavia", value: "52 in April 1950, born Malta", info: "undetermined", ev: "indirect" }, { src: "S-mi-marr-1926", value: "29 in August 1926, born Malta", info: "primary", ev: "indirect" }] },
    { id: "E-birth-grace", type: "birth", who: ["P-grace"], date: { text: "about 1909", sort: "1909-01-01" }, place: "PL-malta", conclusion: "Born in Malta about 1908-1910: 18 at her 1926 marriage, 40 in April 1950, and 8 March 1910 on her naturalization card.", confidence: "probable",
      assert: [{ src: "S-census-1950-pavia", value: "40, born Malta", info: "undetermined", ev: "indirect" }, { src: "S-nat-idx-grace", value: "born 8 Mar 1910", info: "secondary", ev: "direct" }, { src: "S-mi-marr-1926", value: "18 in 1926", info: "primary", ev: "indirect" }] },
    { id: "E-nat-grace", type: "naturalization", who: ["P-grace"], date: { text: "16 Mar 1943", sort: "1943-03-16" }, place: "PL-detroit", conclusion: "Petitioned for naturalization in Detroit on 16 March 1943 (petition 188070).", confidence: "probable",
      assert: [{ src: "S-nat-idx-grace", value: "petition 188070, 16 Mar 1943", info: "secondary", ev: "direct" }] },
    { id: "E-census-1950-pavia", type: "residence", who: ["P-josephp", "P-grace", "P-caroline", "P-charlesp", "P-francis"], date: { text: "6 Apr 1950", sort: "1950-04-06" }, place: "PL-detroit", conclusion: "One household on Inglis Street, Detroit: Joseph and Grace, both born in Malta and naturalized, with Caroline, Charles and Francis.", confidence: "proven",
      assert: [{ src: "S-census-1950-pavia", value: "the household, read from the image", info: "undetermined", ev: "direct" }] },
    { id: "E-death-josephp", type: "death", who: ["P-josephp"], date: { text: "28 Jun 1975", sort: "1975-06-28" }, place: "PL-detroit", conclusion: "Died in Detroit on 28 June 1975.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "28 Jun 1975, Detroit (SSDI and the Michigan death index, as read by Gemini)", info: "secondary", ev: "direct" }] },
    { id: "E-death-grace", type: "death", who: ["P-grace"], date: { text: "21 Apr 1982", sort: "1982-04-21" }, place: "PL-detroit", conclusion: "Died in Detroit on 21 April 1982.", confidence: "probable",
      assert: [{ src: "S-anc-hints", value: "21 Apr 1982, Detroit (SSDI, as read by Gemini)", info: "secondary", ev: "direct" }] }
  );
  const set = (child, pct, basis, gemini) => { const c = L.certainty.find((x) => x.child === child); const v = Object.assign({ child, pct, basis }, gemini ? { gemini } : {}); if (c) Object.assign(c, v); else L.certainty.push(v); };
  set("P-francis", 93, "the 1940 and 1950 censuses list him as Joseph and Grace's son (the 1950 page read by Claude); his siblings' obituaries");
  set("P-josephp", 75, "his 1926 marriage record names his parents (read by Gemini); the 1950 census gives both as born in Malta");
  set("P-grace", 70, "her 1926 marriage record names her parents (read by Gemini); their dates come from other members' trees");
  set("P-joelm", 55, "a 1672 orphans' court entry and compiled trees (WikiTree, the Jamestowne Society)", 88);
  set("P-akeeling", 55, "compiled trees and the Jamestowne Society's lineage", 88);
  set("P-maryrogers", 40, "one compiled tree", 65);
  set("P-abrogers", 50, "compiled trees", 85);
  set("P-bestes", 50, "compiled trees", 85);
  set("P-testes", 55, "compiled trees", 85);

  const c13 = C("C13");
  c13.status = "resolved"; c13.conclusion = "Lucretia (Lucrezia) Calleja of Malta (probable)";
  c13.argument += " Settled on 24 November 2026 as far as these records go. The 1950 census page (read by Claude) has Joseph Pavia, 52, and his wife Grace M., 40, both born in Malta and naturalized, with Caroline, Charles and Francis at one address. A Joseph Pavia, 29, born in Malta, married Lucretia Calleja, 18, born in Malta, in Detroit on 4 September 1926; his 1942 draft card at the same address names his wife \"Lagrigia\", a spelling of Lucrezia; and Caroline was born ten months after that wedding. The ages agree within the usual two years. The other Maltese couple in Detroit, Joseph A. and Erminia Pavia, is a different household in the same census (Gemini's side-by-side image). Still to read: the marriage image itself, and Grace's 1943 petition, which should give both names.";
  L.conflicts.push({ id: "C14", person: "P-eward", q: "Was Joel Martin's wife Elizabeth Ward or Elizabeth Alderson?", status: "open", conclusion: "unresolved",
    argument: "The older compiled trees give Elizabeth Ward. Gemini's wave 4 gives Elizabeth Alderson, daughter of Simon Alderson, from a compiled site (OurFamTree), and rates Ward at 15%. Neither side has shown the record: a Lower Norfolk or Bath County deed, will or court entry that names her with Joel would settle it." });
  const h9 = H("H9");
  h9.text += " Wave 4 (24 Nov): Arthur's own crossing is now a record: Library and Archives Canada's Home Children index has Arthur Seconder, 12, in Dr. Barnardo's party on the S.S. Carthaginian from Liverpool on 17 March 1892 to Halifax on 27 March (so born about 1880, not 1884); he married Bertha Loleta Lawson on 7 June 1905 in Hilton Township, Algoma. Bertha's father John \"Jack\" Nicholas Lawson (1865-1928) was the son of John William Lawson and Elizabeth Nicholson (married 1846, Kilbirnie, Ayrshire), and Lydia Ann Nelson's parents were Joseph William Nelson and Lydia Ensley (compiled). None of this touches the open link, Bob to Robert H.: still about 60%.";
  L.questions.push(
    { id: "Q33", p: 2, person: "P-josephp", q: "Where in Malta did Joseph Pavia and Lucretia Calleja come from, and when did they arrive? Their naturalization petitions (Grace's is no. 188070, Detroit, 1943) give the village, the ship and the date.", sources: "U.S. District Court, Eastern District of Michigan, naturalization petitions (NARA Chicago); passenger lists about 1915-1926", task: "KIN-GEM-29" },
    { id: "Q34", p: 3, person: "P-bob", q: "Arthur Seconder's Barnardo's case file: his English birth surname and his parents.", sources: "Barnardo's \"Making Connections\" (UK), citing the S.S. Carthaginian, March 1892, party H92BA", task: "KIN-GEM-32" }
  );
  L.log.push(
    { id: "L12", date: "2026-11-24", by: "Gemini", q: "Q26", where: "1950 U.S. census, Michigan (National Archives), every Pavia schedule (244)", terms: "Pavia", result: "found", note: "Joseph and Grace Pavia, both born in Malta, with their three children (read by Claude from the image). The other Maltese household, Joseph A. and Erminia Pavia, ruled out side by side." },
    { id: "L13", date: "2026-11-24", by: "Gemini", q: "Q32", where: "a 1783 will (WikiTree Allen-60264)", terms: "Lydia Allen's parents", result: "disproved", note: "The claim that Lydia Allen was the daughter of Isaac Allen and Margaret Whiteside: the will names a \"Lydia Hollingsworth\". Gemini 5%." },
    { id: "L14", date: "2026-11-24", by: "Gemini", q: "Q32", where: "WikiTree Bryant-6193", terms: "Nicholas Bryant's mother", result: "disproved", note: "Martha Hatchett Strode as his mother is not supported. Gemini 10%." },
    { id: "L15", date: "2026-11-24", by: "Gemini", q: "Q32", where: "WikiTree Stone-673", terms: "Richard Stone Sr.'s parents", result: "disproved", note: "William Stone III and Elizabeth Dennett as his parents are not supported. Gemini 10%." },
    { id: "L16", date: "2026-11-24", by: "Gemini", q: "Q32", where: "compiled Keeling and Thorowgood pedigrees", terms: "Thomas Keeling's English ancestry; Rev. William Thorowgood", result: "disproved", note: "The 1400s noble line given for Thomas Keeling (30%) and Rev. William Thorowgood as Anne's father (35%) are not supported by records." }
  );
})(window.KIN_LINEAGE);

/* 2026-11-24: line 5a of the 1935 death certificate re-read by Claude at full size (Gemini, KIN-GEM-10, read it the same way):
   "Della Matukaitis", not Delia; the third letter is struck over by the printed "divorced", the fourth is a tall l. */
(function (L) {
  const d = L.people.find((p) => p.id === "P-della"), n = d && d.names.find((x) => x.surname === "Matukaitis");
  if (n) { n.given = "Della"; n.note = "her maiden name as given on her husband's death certificate, 1935, where she was the informant (line 5a reads \"Della Matukaitis\"; read again at full size on 24 Nov 2026)"; }
  const c3 = L.conflicts.find((c) => c.id === "C3");
  if (c3) c3.argument = c3.argument.replace("calls her Delia Matukaitis", "calls her Della Matukaitis (line 5a, re-read at full size on 24 November 2026; first transcribed here as Delia)");
})(window.KIN_LINEAGE);

/* 2026-11-24, evening: Muse's Kin audit and second reads (Drive, "Kin — Sebastian ..." files) and Gemini's wave-4 breakthroughs file.
   Claude is the third reader. Muse checked Gemini's Drive harvest against the record images and the live DAR database; it did not
   read this tree, so two of its Termena findings miss what is already here: the 1922 marriage is in the New York City index (Brooklyn,
   certificate 4615), not Wayne County, and Gemini's FamilySearch pointer 1:1:Q2C2-FQ1P is a historical-record ark, not a tree person.
   WikiTree and the DAR database cannot be reached from Claude's session, so its southern-line findings are recorded as open conflicts,
   with the links lowered while they stand; Muse's own figure is shown beside each. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), C = (id) => L.certainty.find((c) => c.child === id);
  const set = (id, pct, basis, muse) => { let c = C(id); if (!c) { c = { child: id }; L.certainty.push(c); } c.pct = pct; c.basis = basis; if (muse) c.muse = muse; };
  L.sources.push(
    { id: "S-muse-audit", short: "Muse's Kin audit and second reads, 24 Nov 2026", kind: "derivative", year: 2026, img: [],
      cite: "Muse (Sebastian), \"Kin — Sebastian Audit & Extension Report\", \"Second-Read, Pavia & Termena\", \"Second-Read, Southern Lines & DAR\", \"Extension Research\" and three record-pull files, Prometheus Hub Kin folder, Google Drive, 24 November 2026.",
      read: "Read by Claude. Its DAR readings (A030698, A092129, A110255, A213360) and its reading of Nathaniel Bivens's 1816 will on WikiTree Bivens-138 could not be checked from Claude's session (both sites unreachable)." }
  );
  /* Termena: the parents' names come from one index entry nobody here has seen; the death certificate's "Unknown" came from his widow */
  set("P-joseph", 40, "the 1922 Brooklyn marriage index (FamilySearch record 1:1:Q2C2-FQ1P, read by Gemini; not yet seen by Claude) names Rozys Termens and Kostantina Giadraet; the 1935 death certificate gives both as Unknown (informant: his widow); the 1912 manifest candidate gives a father Kazmierz (C9)", 0);
  set("P-della", 55, "the same 1922 index, read by Gemini, names Michael Malkitus and Eva Vaschaushos; her own 1935 statement gives her maiden name as Matukaitis (C3)");
  set("P-ggm", 85, "her obituary names her parents Joseph and Della Termans; in 1950 she lives with her mother Della Rimsha (census index); her 1933 birth record is not yet seen", 80);
  for (const id of ["P-rozys", "P-kostantina"]) { const p = P(id); if (p) p.summary += " Muse's second read (24 Nov 2026) holds these names as leads only until the index entry itself is read (C15)."; }
  L.conflicts.push({ id: "C15", person: "P-joseph", q: "Who were Joseph Termena's parents?", status: "open", conclusion: "unresolved: the names Rozys Termens and Kostantina Giadraet are kept as possible, not proven",
    argument: "Three readings disagree. The 1922 New York City marriage index entry (FamilySearch record 1:1:Q2C2-FQ1P, as read by Gemini) names Rozys Termens and Kostantina Giadraet. The 1935 death certificate gives both parents as Unknown, but its informant was his widow, who may never have known her in-laws' names, so it does not contradict the index. The 1912 manifest candidate (C9) gives a father Kazmierz, but that candidate is probably another man. Muse (24 Nov) found neither name anywhere on the indexed web and would hold them as leads; Claude keeps them as possible, at 40%, until someone reads the index entry itself (a free FamilySearch account is enough: Q35) or the Brooklyn certificate no. 4615, which names both parents." });
  /* southern lines: Muse's findings, held open */
  set("P-benjamin", 45, "compiled trees; Muse reports that Nathaniel's 1816 will, as transcribed on WikiTree, names ten children and no Benjamin, and Benjamin was born when Nathaniel was about 51 (C16)", 30);
  L.conflicts.push({ id: "C16", person: "P-benjamin", q: "Was Benjamin Bivens (about 1777) a son of Nathaniel Bivens?", status: "open", conclusion: "unresolved",
    argument: "The compiled trees make him Nathaniel's son, and this tree cited Nathaniel's will for the link. Muse's second read (24 Nov) reports that the will, signed 9 May 1816 and transcribed on WikiTree Bivens-138, names ten children and no Benjamin, that Gemini's own FamilySearch source is titled for a Nathaniel born 1745, and that a father born 1726 would have been about 51. Claude could not open WikiTree to check the will. Until the will is read here, the link stands at 45%. Benjamin's real father may be found in Anson and Union County deeds and estate papers." });
  set("P-susannap", 60, "compiled trees; Muse reports she is not among the children DAR has verified for James Pulliam (A092129), which lists only children used in applications", 50);
  set("P-eastone", 65, "her father's will (abstract, 1795) names her as James Pulliam's wife; DAR names James's wife Elizabeth Allen and lists no daughter Elizabeth for Richard Stone, whose record DAR flags (C17)", 40);
  L.conflicts.push({ id: "C17", person: "P-eastone", q: "Was James Pulliam's wife Elizabeth Allen Stone, daughter of Richard Stone?", status: "open", conclusion: "unresolved: probably yes on the will abstract, with the DAR records against the surname",
    argument: "For: the abstract of Richard Stone's will, made 7 September 1795, names his wife Mary and his daughter Elizabeth, James Pulliam's wife. Against, from Muse's reading of the DAR database (24 Nov): DAR's record for James Pulliam (A092129) gives his birth as about 1736, not 1726, and his wife as Elizabeth Allen, with no Stone; DAR's record for Richard Stone (A110255) carries DAR's own warning that problems were found with a previously verified paper, names his wife Mary Smith, and lists no daughter Elizabeth. DAR lists only the children its members descend through, so a missing daughter is weak evidence; the will abstract is the stronger source if it is real. Next: the Lunenburg County will book entry itself, and James Pulliam's own will or estate papers in Person County, NC. Claude could not open the DAR pages to check Muse's reading." });
  const jp = P("P-jpulliam"); if (jp) jp.summary += " DAR gives his birth as about 1736 (Muse's reading, C17).";
  set("P-hettie", 60, "compiled trees only; Muse finds no record of the link from Wesley Davis to Henrietta", 50);
  set("P-tdavisjr", 85, "Quaker minutes, and a DAR application (no. 301134) that descends from Thomas Davis through Thomas Jr. and Rebecca Bryant (Muse's live reading, 24 Nov); DAR has a correction-file notice on the record");
  set("P-jessea", 70, "compiled trees; Muse finds James Altonia Kirkland Sr. as his father only on profiles, with no record cited", 60);
  /* Pavia: the two birth dates Gemini gave, ranked */
  const jpv = P("P-josephp"); if (jpv) jpv.summary = jpv.summary.replace("born in Malta in 1897;", "born in Malta on 12 February 1897 by his own 1942 draft card (the Michigan death index, a later and secondary source, says 2 December 1897);");
  L.questions.push(
    { id: "Q35", p: 1, person: "P-joseph", q: "Could you look up one record on FamilySearch (a free account)? Search for record 1:1:Q2C2-FQ1P, Joseph M Termens and Della Malkitus, Brooklyn, 25 April 1922. A photo of the screen settles the names of both his parents and hers (C15).", sources: "New York, New York City Marriage Records, 1829-1938 (FamilySearch)", task: "" },
    { id: "Q36", p: 3, person: "P-francis", q: "Francis and Glenda's marriage record (about 1965-1973, Michigan) is not online anywhere. The Wayne County Clerk will search for a small fee, charged whether or not it is found, and a certified copy costs a little more. Worth it?", sources: "Wayne County Clerk, Detroit; or MDHHS Vital Records, Lansing (form DCH-0569-MX)", task: "" }
  );
  L.log.push(
    { id: "L17", date: "2026-11-24", by: "Muse", q: "Q5", where: "Michigan marriage indexes and FamilySearch Wayne County holdings (1922); Ellis Island and other web-visible indexes (1912)", terms: "Termena, Termenas, Termens, Termins; Joseph, Juozas, Józef", result: "not found", note: "Searched Michigan, but the marriage was in Brooklyn (the NYC index, Kings County, certificate 4615). The 1912 search did not reach the Ellis Island database itself (form-driven). A collateral find: Leon Anton Termenas, born 25 June 1888 at Tryškiai, Telšiai district, son of Peter Termenas and Gendruta Monsus, immigrated 1906 (Massachusetts naturalization, 1926): a probable cousin, no weight for Joseph's parents." },
    { id: "L18", date: "2026-11-24", by: "Muse", q: "", where: "the DAR ancestor database (A030698, A092129, A110255, A213360), WikiTree, and all 950 files of Gemini's Kin harvest on Drive", terms: "the four DAR patriots; Gemini's Waves 1-4", result: "found", note: "All four DAR numbers are real and attach to the named men; the descents below Bivens, Pulliam and Stone are weaker than the compiled trees say (C16, C17). The harvest holds 923 photos and scans (about 895 unique; 28 duplicate copies); several files named as primary records are index pages of books." }
  );
})(window.KIN_LINEAGE);

/* 26 Nov 2026 (Claude, with the record sites Joseph opened for this session): reads made here, not reported by another AI */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const C = (id) => L.certainty.find((c) => c.child === id);
  const set = (id, pct, basis) => { let c = C(id); if (!c) { c = { child: id }; L.certainty.push(c); } c.pct = pct; c.basis = basis; };
  L.sources.push(
    { id: "S-will-nbivens", short: "Will of Nathaniel Bivens Sr., Anson County, NC, 1816 (transcription)", kind: "derivative", year: 1816,
      url: "https://www.wikitree.com/wiki/Bivens-138",
      cite: "Anson County, North Carolina, Will Book 2, pp. 8-9, will of Nathaniel Bivens Senr., signed 9 May 1816, proven April Court 1818; transcription by Barbara Roesch on WikiTree profile Bivens-138 (image on Ancestry, subscription; not seen here).",
      read: "Read by Claude on 26 Nov 2026 through WikiTree's API. It gives a negro woman, Nance, to his son Abel, and divides six enslaved people (Cloe, Vilate, Zack, Hannah, Simon, George) and the rest of the estate among nine more children: William, Sarah, John, Unity, Moses, Elijah, Lyda, Stephen and Nathaniel. Executors: his sons John and Nathaniel. Witnesses: John Bennett Sr., John Bennet Jr., Wm. Bennet. It does not name Benjamin." },
    { id: "S-census-1790-nc", short: "Heads of Families at the First Census, 1790: North Carolina (1908)", kind: "derivative", year: 1790,
      cite: "U.S. Bureau of the Census, Heads of Families at the First Census of the United States Taken in the Year 1790: North Carolina (Washington, 1908), pp. 35-37 (Anson County, Fayette District), p. 176 (Rowan County, Salisbury District) and index p. 205; page images staged by Gemini in the Kin Drive folder.",
      read: "Read by Claude on 26 Nov 2026 from the staged pages. The volume's own index lists Biven, John, p. 36 (Anson County) and Biven, Corbin, Leonard and Randal, p. 176 (Rowan County). No Nathaniel Biven or Bivens is indexed on the Anson pages; a garbled index line may hold a Bevin, Nathaniel elsewhere. The page OCR is too poor to read household counts." }
  );
  set("P-benjamin", 15, "Nathaniel's will (Anson Will Book 2, pp. 8-9, transcription read by Claude on 26 Nov) names ten children and no Benjamin, though Benjamin was then alive; only the compiled trees make him Nathaniel's son (C16)");
  const c16 = L.conflicts.find((c) => c.id === "C16");
  if (c16) {
    c16.status = "resolved";
    c16.conclusion = "Probably not: Nathaniel's 1816 will names ten children and no Benjamin";
    c16.argument += " Claude read the will itself on 26 Nov 2026 (WikiTree's transcription, through its API): it names Abel, William, Sarah, John, Unity, Moses, Elijah, Lyda, Stephen and Nathaniel, and no Benjamin. A son alive in 1816 is rarely left out of a will that names all the others, so the compiled link is not supported. The 1790 census for Anson County indexes a John Biven, not Nathaniel. Benjamin's real father should be looked for among the other Bivens households of Anson and Rowan (Corbin, Leonard, Randal and John Biven in 1790) and in Anson and Union County deeds.";
  }
  const ben = P("P-benjamin"); if (ben) ben.summary += " Not named in Nathaniel Bivens's 1816 will, so his parents are not known (C16).";
  L.sources.push(
    { id: "S-spots-1764", short: "Spotsylvania County administration bond, 7 May 1764 (Crozier's abstract)", kind: "derivative", year: 1764,
      cite: "William Armstrong Crozier, ed., Virginia County Records, vol. 1: Spotsylvania County, 1721-1800 (New York, 1905), p. 61, Will Book D administration bonds; page staged by Gemini in the Kin Drive folder.",
      read: "Read by Claude on 26 Nov 2026: \"£1000 Elizabeth Pulliam, admx. of James Pulliam, decd., with James Rawlings and John Holloday, sec. May 7, 1764.\" A namesake: this James Pulliam was dead by 1764, while Richard Stone's son-in-law James Pulliam and his wife Elizabeth were both alive in 1795 (C17). The same volume (p. 368) has his heir: \"Rawlins Pulliam (heir at law of James Pulliam, decd.)\" sells 200 acres in 1782, and pp. 73, 200-237 show this James as a Spotsylvania guardian and witness, 1755-1764." },
    { id: "S-hanover-1734", short: "Will of John Pulliam, Hanover County, Virginia, 1734/5 (Crozier's abstract)", kind: "derivative", year: 1734,
      cite: "William Armstrong Crozier, ed., Virginia County Records, vol. 6 (1909), p. 20, Hanover County wills; page staged by Gemini in the Kin Drive folder.",
      read: "Read by Claude on 26 Nov 2026: John Pulliam, will 4 Dec 1734, proved 6 Feb 1734[/5], names four sons William, John, James and Drewry, three daughters Agnes, Elizabeth and Sarah, and his wife Agnes, executrix. A lead only: compiled trees make this tree's James Pulliam (born 1726) a son of this John, and the age fits, but no record here links them." }
  );
  L.sources.push(
    { id: "S-vmhb-stone", short: "\"Stone families of Virginia\", Virginia Magazine of History and Biography, vol. 28 (1920)", kind: "derivative", year: 1920,
      cite: "Virginia Magazine of History and Biography, vol. 28 (1920), p. 66 (a compiled note on the Stone families of Virginia; page staged by Gemini in the Kin Drive folder).",
      read: "Read by Claude on 26 Nov 2026: \"Thomas Stone, of Brunswick Co., 'imported himself in the year 1740' ... His will is dated April 16, 1795 ... His son Richard Stone received in 1746 a grant of 400 acres from William Gooch.\" Lunenburg was formed from Brunswick in 1746, so this Richard may be this tree's Richard Stone (about 1722-1797), whose own will names a son Thomas. A compiled lead, not proof." }
  );
  { const rs = P("P-rstone"); if (rs) rs.summary += " A compiled note (VMHB vol. 28, p. 66) has a Richard Stone, son of Thomas Stone of Brunswick County (came 1740), granted 400 acres in 1746: a lead for his parents."; }
  const c17 = L.conflicts.find((c) => c.id === "C17");
  if (c17) c17.argument += " Claude, 26 Nov 2026: Spotsylvania County had another James Pulliam with a wife Elizabeth; he was dead by May 1764, when she gave bond as his administratrix (Crozier, vol. 1, p. 61). Richard Stone's 1795 will loans slaves to his son-in-law James Pulliam and his wife Elizabeth for their natural lives, so both were alive in 1795: that rules the Spotsylvania man out and fits this tree's James (died 1799). Compiled trees that mix the two Jameses could explain DAR's different birth year and wife's surname; DAR's file itself still needs a look by someone who can open its site.";
  L.log.push(
    { id: "L19", date: "2026-11-26", by: "Claude", q: "", where: "WikiTree (API, profile Bivens-138); the 1790 census pages staged in the Kin Drive folder", terms: "Nathaniel Bivens will 1816; Biven/Bivens/Bevin in the 1790 NC index", result: "The will names ten children and no Benjamin (C16 resolved: probably not his son). 1790: John Biven in Anson, Corbin, Leonard and Randal Biven in Rowan. Spotsylvania had a namesake James Pulliam, dead by 1764 with a widow Elizabeth; Richard Stone's son-in-law was alive in 1795 (C17)." }
  );
})(window.KIN_LINEAGE);

/* 26 Nov 2026, second batch (Claude): Joel Martin's own will, the Bath County Martins and Aldersons, and the Lower Norfolk John Martin.
   Books read whole from the Internet Archive's full text where Gemini staged only a page. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const C = (id) => L.certainty.find((c) => c.child === id);
  const set = (id, pct, basis) => { let c = C(id); if (!c) { c = { child: id }; L.certainty.push(c); } c.pct = pct; c.basis = basis; };
  const GR = "J. Bryan Grimes, Abstract of North Carolina Wills, Compiled from Original and Recorded Wills in the Office of the Secretary of State (Raleigh, 1910)";
  L.sources.push(
    { id: "S-grimes-joel-1715", short: "Will of Joel Martin, Bath County, NC, 1715/16 (Grimes's abstract)", kind: "derivative", year: 1715,
      url: "https://archive.org/details/abstractofnorthc00nort",
      cite: GR + ", p. 239; read from the Internet Archive's full text. Gemini staged only the appendix page that lists it (p. 648).",
      read: "Read by Claude on 26 Nov 2026: \"Martin, Joel. Bath County. October 24, 1715. July 3, 1716. Sons: John (land on Matchapungo Creek), William (land in Newport Sound). Daughters: Ann Martin (320 acres of land), Elizabeth Penny, Mary Woodard, Frances Jarvis. Son-in-law: John Penny. Executors: Elizabeth Penny, John Porter. Witnesses: John Deon, Henry Smith, Jno. Drinkwater.\" He names no wife: she had most likely died before October 1715." },
    { id: "S-grimes-jmartin-1741", short: "Will of John Martin, Pasquotank County, NC, 1741 (Grimes's abstract)", kind: "derivative", year: 1741,
      url: "https://archive.org/details/abstractofnorthc00nort",
      cite: GR + ", p. 239; read from the Internet Archive's full text.",
      read: "Read by Claude on 26 Nov 2026: \"Martin, John. Pasquotank County. December 25, 1741. January Court, 1741-1742. Sons: Nathaniel, Joseph, John, Joshua. Daughters: Elener Bryant, Maryann Jessop, Ann Martin, Elizabeth Martin, Jane Morgin. Executors: John Morgin (son-in-law), Thomas Jessop. Witnesses: William Davis, Joseph Pritchard, Benja. Pritchard.\" Elener Bryant is almost certainly this tree's Eleanor Martin, who married Nicholas Bryant at a Quaker meeting on 6 October 1741 (WikiTree Bryant-6193, citing Hinshaw's Encyclopedia of American Quaker Genealogy, vol. 1, p. 273, not seen here). No wife is named, so \"Mary Born\" rests on compiled trees alone. WikiTree's own profile for this John (Martin-28927) is unsourced and marked \"Uncertain Family\"." },
    { id: "S-bath-martins", short: "Wills of the Bath (Beaufort) County Martins and Aldersons, 1722-1761 (Grimes and Hathaway)", kind: "derivative", year: 1740,
      url: "https://archive.org/details/abstractofnorthc00nort",
      cite: GR + ", p. 3 (Simon Alderson, Beaufort, proved December Court 1740), p. 196 (Sarah Jones, Bath, 1722), p. 225 (Mary Lucas, Beaufort, 1761), p. 240 (William Martin, Beaufort, 1745), p. 304 (David Purkens, Bath, 1733), p. 350 (John Snoad 1743, William Snoad 1746/7); J. R. B. Hathaway, North Carolina Historical and Genealogical Register, vol. 1, pp. 338 and 364 (the Lucas and Purkins wills). Pages staged by Gemini; Simon Alderson's will read from the Internet Archive's full text.",
      read: "Read by Claude on 26 Nov 2026. Simon Alderson's will, witnessed by William Martin and proved in December 1740, names sons Levin and John and daughters \"Elizabeth and Sarah Alderson\": in 1740 his daughter Elizabeth still bore her own surname. William Martin of Beaufort (St. Thomas Parish, 23 August 1745) names sons John, Joel, William and Joseph, daughters Ann and Elizabeth and a cousin John Martin; his sons John, Joel and William are among his executors, and John and Mary Alderson witnessed. A Joel Martin witnessed David Purkens's will with Simon Alderson in 1733 and William Snoad's with Ann and Sarah Martin in 1746/7; Mary Lucas (1761) names her daughter Ann Alderson and grandsons James Alderson, Joel Martin and Charles Odeon (Grimes reads Ardison) Martin. A John Martin witnessed Sarah Jones's Bath County will in May 1722. So a younger Joel Martin, named after the old man and tied to the Aldersons, lived in Beaufort County from about 1733; William Martin (died 1745) may be Joel's son William, but no record here says so." },
    { id: "S-lnva-jmartin", short: "John Martin in the Lower Norfolk County records, 1645-1662", kind: "derivative", year: 1645,
      cite: "\"The Church in Lower Norfolk County\", Lower Norfolk County Virginia Antiquary, vol. 2, pp. 12-13 and 128, and vol. 3, pp. 103, 105 and 140-141; McIntosh, Abstract of Norfolk County Wills, pp. 18 and 20. Pages staged by Gemini in the Kin Drive folder.",
      read: "Read by Claude on 26 Nov 2026. John Martin and Edward Hall, churchwardens of Lynnhaven parish, sign a presentment on 16 February 1645[/6]; \"Leift Keelinge\", Owen Hayes and John Martin appraise an estate in January 1652[/3]; John Martin proves two wills on 8 December 1655; \"Mr John Martin\" sits with the county's justices on 16 April 1660, 15 August 1661, 16 June 1662 and 29 December 1662. This is the man the compiled trees make Joel's father. The records put him in Lynnhaven parish beside a Lieutenant Keeling, which fits the Keeling marriage, but none names a wife or a son Joel." },
    { id: "S-mcintosh-eward-1668", short: "Will of Edward Ward, Lower Norfolk County, 1668/9 (McIntosh's abstract)", kind: "derivative", year: 1668,
      cite: "McIntosh, Abstract of Norfolk County Wills, p. 29 (Book E, f. 48); page staged by Gemini in the Kin Drive folder.",
      read: "Read by Claude on 26 Nov 2026: Edward Ward, dated 3 January 1668, proved 1 April 1669, names his wife Elizabeth, his eldest daughter Frances Ward, his youngest daughter Elizabeth Ward and his son Edward, under age. A youngest daughter Elizabeth born in the 1660s in Lower Norfolk is the right age for Joel Martin (born about 1662): a candidate family for the older trees' \"Elizabeth Ward\", not proof. No record yet names Joel's wife." }
  );
  const jm = P("P-joelm");
  if (jm) jm.summary = "About 1662 (a 1672 orphans' court entry; older trees say 1638) to 1716, Bath County, North Carolina. His will (24 October 1715, proved 3 July 1716) names sons John (land on Matchapungo Creek) and William (land in Newport Sound) and daughters Ann Martin, Elizabeth Penny, Mary Woodard and Frances Jarvis, and no wife. Son of John Martin and Anne Keeling of Lower Norfolk County, Virginia (compiled).";
  const ew = P("P-eward");
  if (ew) {
    ew.summary = "Joel Martin's wife in the older trees. Not named in his 1715 will, so probably dead by then. Her surname is unproven (C14).";
    const alt = ew.names.find((n) => n.surname === "Alderson");
    if (alt) alt.note = "Gemini, wave 4: daughter of Simon Alderson. Ruled out on 26 Nov 2026: Simon's daughter Elizabeth was still Elizabeth Alderson in his will of 1740, a generation after Joel died (C14)";
  }
  const jo = P("P-johnm");
  if (jo) jo.summary = "About 1680 to 1741 or 1742, Pasquotank County, North Carolina, among Quakers. His will (25 December 1741, proved January 1741/2) names sons Nathaniel, Joseph, John and Joshua and daughters Elener Bryant, Maryann Jessop, Ann Martin, Elizabeth Martin and Jane Morgin. Whether he was Joel Martin's son is doubtful (C18).";
  set("P-eleanor", 80, "her father John Martin's 1741 Pasquotank will names his daughter Elener Bryant, two months after her Quaker marriage to Nicholas Bryant (Grimes, p. 239); her mother's name, Mary Born, comes only from compiled trees");
  set("P-johnm", 20, "only compiled trees make this Pasquotank Quaker the son of Joel Martin of Bath. Joel's will gives his son John land on Matchapungo Creek in Bath County, a John Martin was still witnessing there in 1722, and this John named no son Joel or William (C18)");
  set("P-joelm", 55, "compiled trees and the Jamestowne Society's lineage; a John Martin was a Lynnhaven churchwarden and county justice in Lower Norfolk from 1645 to 1662, appraising beside a Lieutenant Keeling, but no record names a son Joel");

  const c14 = L.conflicts.find((c) => c.id === "C14");
  if (c14) {
    c14.conclusion = "Not Alderson; Ward unproven";
    c14.argument += " Claude, 26 Nov 2026: Joel Martin's own will (Bath County, 24 October 1715, proved 3 July 1716; Grimes, p. 239) names his children and no wife, so she had probably died. Simon Alderson's will, proved in December 1740, names \"daughters Elizabeth and Sarah Alderson\": his Elizabeth still bore her own surname a generation after Joel's death, so she cannot be the mother of Joel's grown children. The Alderson story belongs to the next generations in Beaufort County: a younger Joel Martin witnessed beside Simon Alderson in 1733, John and Mary Alderson witnessed William Martin's will in 1745 (his son Joel was an executor), and Mary Lucas's 1761 will has Alderson and Martin grandchildren side by side. Ward is still only the older trees' word; the one lead is Edward Ward of Lower Norfolk, whose will (1668/9) names a youngest daughter Elizabeth of the right age. Whether any of this is this tree's line depends on C18.";
  }
  L.conflicts.push({ id: "C18", person: "P-johnm", q: "Was John Martin of Pasquotank (will 1741), Eleanor Bryant's father, the son of Joel Martin of Bath (will 1715)?", status: "open", conclusion: "doubtful",
    argument: "The compiled trees join them, and everything above John (Joel, Elizabeth Ward, John Martin and Anne Keeling of Lower Norfolk, the Thorowgoods) hangs on that link. Against it: Joel's will (1715) gives his son John land on Matchapungo Creek in Bath County, and a John Martin was still witnessing wills in Bath County in 1722; the Bath family went on naming sons Joel and William, while the Pasquotank John's sons were Nathaniel, Joseph, John and Joshua, and his in-laws and witnesses (Jessop, Morgan, Pritchard, Davis) were Quakers of the Albemarle, far to the north. WikiTree's profile for him is unsourced and marked \"Uncertain Family\". For it: only the shared name John and a birth year that would fit. A Pasquotank deed or a Quaker certificate of removal saying where he came from would settle it (Q37)." });
  L.questions.push(
    { id: "Q37", p: 2, person: "P-johnm", q: "Where did John Martin of Pasquotank (died about January 1742) come from? Did he ever hold or sell land on Matchapungo Creek in Bath County, the land Joel Martin left his son John in 1715?", sources: "Pasquotank County deeds; Bath and Beaufort County deeds for Matchapungo Creek; Pasquotank and Core Sound Monthly Meeting minutes (Hinshaw, vol. 1); colonial land patents (North Carolina State Archives)" }
  );
  L.log.push(
    { id: "L20", date: "2026-11-26", by: "Claude", q: "", where: "Grimes, Abstract of North Carolina Wills (1910), whole book (Internet Archive full text); Hathaway's Register vols. 1-2, the Lower Norfolk Antiquary vols. 2-3 and McIntosh's Norfolk wills (pages staged by Gemini); WikiTree API", terms: "Joel Martin; John Martin; Alderson; Elizabeth Ward; Bryant", result: "Joel Martin's will (1715/16) names no wife. Simon Alderson's daughter Elizabeth was unmarried in 1740, so Alderson is ruled out (C14). John Martin of Pasquotank's 1741 will names his daughter Elener Bryant, but his link to Joel is doubtful (new C18). Lower Norfolk: a John Martin was churchwarden and justice, 1645-1662; Edward Ward's 1668 will has a daughter Elizabeth (a lead)." }
  );
})(window.KIN_LINEAGE);

/* 26 Nov 2026, third batch (Claude): the Pasquotank Quaker Martins (C18) and Peter Culberson's regiment. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const C = (id) => L.certainty.find((c) => c.child === id);
  const set = (id, pct, basis) => { let c = C(id); if (!c) { c = { child: id }; L.certainty.push(c); } c.pct = pct; c.basis = basis; };
  const addSrc = (id, s) => { const p = P(id); if (p && p.names[0] && !p.names[0].src.includes(s)) p.names[0].src.push(s); };
  L.sources.push(
    { id: "S-albemarle-martins", short: "The Martins among the Albemarle (Pasquotank) Quakers, 1706-1746 (Grimes's abstracts)", kind: "derivative", year: 1706,
      url: "https://archive.org/details/abstractofnorthc00nort",
      cite: "J. Bryan Grimes, Abstract of North Carolina Wills (Raleigh, 1910): p. 401 (Henry White, Albemarle County, 19 Sept 1706), p. 135 (Joseph Glaster, Pasquotank, 1718/19), p. 275 (Joseph Overman, Pasquotank, 1739), p. 239 (Nathaniel Martin, Pasquotank, 1743), p. 15 (David Bailey, Pasquotank, 1745/6), p. 67 (Robert Cartwright, Pasquotank, 1746) and pp. 421-422 (Augustine Wright, Pasquotank, 1741/2); read from the Internet Archive's full text, p. 275 also from the page Gemini staged.",
      read: "Read by Claude on 26 Nov 2026. A John Martin witnesses Henry White's will in 1706 beside the Quakers Zachariah Nixon, John and Jeremiah Symons and John Raper. A Nathaniel Martin is a grown \"friend\" in Joseph Glaster's Pasquotank will of January 1718/19 and \"Friend and Executor\" of Joseph Overman's in 1739, which a John Martin witnessed; John Martin witnesses again in Pasquotank in 1741/2; Nathaniel Martin's own will (1743) names his wife Sarah, son Joshua and daughters Sarah and Miriam. David Bailey of Pasquotank (1745/6) leaves his son Simon a plantation at Core Sound and names a daughter Elizabeth Bryant: the Pasquotank Quakers and the Core Sound Bryants married into each other." },
    { id: "S-tnag-1866", short: "Report of the Adjutant General of the State of Tennessee (1866): 3rd Tennessee Cavalry (Union)", kind: "derivative", year: 1866,
      url: "https://archive.org/details/06380153.3344.emory.edu",
      cite: "Report of the Adjutant General of the State of Tennessee, of the Military Forces of the State, from 1861 to 1866 (Nashville, 1866), pp. 355-371 (Third Regiment Cavalry); pages staged by Gemini, the whole report read from the Internet Archive's full text.",
      read: "Read by Claude on 26 Nov 2026: \"Culberson, Peter\" is listed among the privates of Company F (the scan reads P), p. 371. The page's columns are scrambled in the scan's text, so his own enlistment date and remark cannot be read from it; the company's remarks are mostly \"Pris of war since Sept 24 64\" (the fall of Sulphur Branch Trestle, Alabama), deaths at Cahaba, and men lost on the Sultana on 27 April 1865. Company C has an Andrew and an \"Ehslia\" Culberson. The report has no James M. Giles and no Tippens. The page image would give Peter's line." }
  );
  addSrc("P-peterc", "S-tnag-1866");
  addSrc("P-joelm", "S-grimes-joel-1715");
  addSrc("P-johnm", "S-grimes-jmartin-1741");
  addSrc("P-eleanor", "S-grimes-jmartin-1741");
  set("P-johnm", 15, "a Martin family was already settled among the Pasquotank Quakers by 1706 (a John Martin witness in 1706, a grown Nathaniel Martin by 1719), years before Joel Martin's 1715 will gave his son John land in Bath County; only compiled trees join this John to Joel (C18)");
  const c18 = L.conflicts.find((c) => c.id === "C18");
  if (c18) {
    c18.conclusion = "probably not";
    c18.argument += " Claude, later on 26 Nov 2026: a John Martin witnessed Henry White's will among the Albemarle Quakers (Nixon, Symons, Raper) on 19 September 1706, and a Nathaniel Martin was a grown man named as a friend in a Pasquotank will of January 1718/19 and as an executor in 1739, when a John Martin witnessed. Both are years before Joel Martin's will of October 1715 left his son John land on Matchapungo Creek in Bath County. A Martin family was settled among the Pasquotank Quakers by 1706, and the John who died there in 1741/2 fits that family much better than Joel's. David Bailey's Pasquotank will (1745/6), which leaves Core Sound land and names a daughter Elizabeth Bryant, shows the Pasquotank Quakers marrying into the Core Sound Bryants, the way Eleanor married Nicholas.";
  }
  L.log.push(
    { id: "L21", date: "2026-11-26", by: "Claude", q: "", where: "Grimes 1910 (whole book); Hathaway's Register vols. 1-2 and Grimes's Wills and Inventories (1912), whole books; the Tennessee Adjutant General's report (1866), Berry's Sultana (1892), Hawes's Cahaba (1888), Humes (1888), Temple (1899) and McAllister's Virginia Militia (1913), all on the Internet Archive; 66 staged pages", terms: "Martin (Pasquotank); Culberson; Giles; Tippens; Thomas Davis; Bivens", result: "Martins among the Pasquotank Quakers from 1706 (C18 now \"probably not\"). Peter Culberson is a private in Company F, 3rd Tennessee Cavalry (Union) in the 1866 report; no James M. Giles or Tippens there. No Thomas Davis in Montgomery County, Virginia, in McAllister (his militia service rests on DAR). The Anson and Davis pages Gemini staged are background or namesakes." }
  );
})(window.KIN_LINEAGE);

/* 26 Nov 2026, the whole family (owner, 2026-11-26: "it seems heavily biased to Joseph termens. Isn't the map supposed to feature
   other people? Also there are relationships not shown"): the people he named, Barbara's other children from her obituary, the
   cousins Glenda's and James Kirkland's obituaries name, and the places the tree already knew for everyone else, as dated events so
   they reach the map. Living people get names and how they are related only: no dates, no towns, no map points. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const fam = (id) => L.families.find((f) => f.id === id);
  L.sources.push(
    { id: "S-owner-1126", short: "Your account of your own family (26 Nov 2026)", kind: "authored", year: 2026,
      cite: "Joseph Pavia, message to Claude, 26 November 2026.",
      read: "Your mother's ex-husband is Jeffrey Hinkle, the father of your two sisters Jessica Elizabeth and Samantha Grace. Your daughter is Violet Joy; your ex-wife is Irene Alyssa Marie. Your mother has a cousin named Tania, whose mother was not in the tree; you asked whether David Holgate was. You think all your grandparents had brothers and sisters." },
    { id: "S-feole-obit", short: "Barbara J. Feole's and Melvin Feole's obituaries (2009)", kind: "derivative", year: 2009,
      url: "https://www.genealogybuff.com/mi/oakland/webbbs_config.pl/noframes/read/32",
      cite: "Dryer Funeral Home, Holly, Michigan, obituaries of Barbara J. Feole (died 22 January 2009) and Melvin Feole (died 28 April 2009), transcribed on GenealogyBuff, Oakland County, Michigan, nos. 32 and 8 (posted 7 May 2010).",
      read: "Quoted by Gemini (forensic audit for Claude, 24 Nov 2026); Claude has not re-read the pages (the site is outside this session's network). Barbara: \"Barbara J. Feole, age 75 of Holly died Thurs. Jan. 22, 2009 ... Mrs. Feole was born in Detroit on March 24, 1933 the daughter of Joseph and Della Termans. Surviving are 3 children Laurie Jordan of Holly, Ilene Kennedy of Port Hope and Joseph Seconder of GA; 8 grand children and several great-grand children.\" Melvin: \"Melvin Feole, age 69 of Holly died Tues. April 28, 2009 ... Burial will be in Lakeside Cemetery, Holly ... born on Jan. 31, 1940 ... preceded in death by his wife Barbara Feole on Jan. 22, 2009. Surviving are his son Melvin Feole Jr.; 3 step-children, Laurie Jordan of Holly, Ilene Kennedy of Port Hope, and Joseph Seconder of GA.\"" },
    { id: "S-jkirkland-obit", short: "James Madison Kirkland's obituary (2021)", kind: "original", year: 2021,
      url: "https://bellevilleareaindependent.com/wp-content/uploads/10-14-21.pdf",
      cite: "\"James Madison Kirkland,\" obituary, Belleville Area Independent (Belleville, Michigan), 14 October 2021, p. 8.",
      read: "Quoted by Gemini (forensic audit, 24 Nov 2026); not yet re-read by Claude: \"JAMES MADISON KIRKLAND (August 2, 1936 - August 1, 2020) ... James was born on August 1, 1936 in Tennessee, the eldest son of Buster and Joy (Moss) Kirkland ... He is survived by his 4 children Laurel Kirkland, Clinton (Paula) Kirkland, Alan (Chola) Kirkland and Leslie (Daniel) Hoffman; grandson James (Megan) Kirkland; his brother Stephen (Ann) Kirkland and sister Glenda (Frank) Pavia.\" The header and the text disagree on his birth day." }
  );
  const add = (id, sex, given, surname, summary, src, x) => L.people.push(Object.assign({ id, sex, status: "family", living: true, names: [{ given, surname, type: "birth", src }], summary }, x || {}));
  const OW = ["S-owner-1126"], GO = ["S-glenda-obit"], FO = ["S-feole-obit"], JK = ["S-jkirkland-obit"];
  add("P-jhinkle", "M", "Jeffrey", "Hinkle", "Your mother's ex-husband; the father of your sisters Jessica and Samantha.", OW);
  add("P-jessica", "F", "Jessica Elizabeth", "Hinkle", "Your sister: the daughter of your mother and Jeffrey Hinkle.", OW, { note: "Her surname is taken from her father's; tell Kin if it is different." });
  add("P-samantha", "F", "Samantha Grace", "Hinkle", "Your sister: the daughter of your mother and Jeffrey Hinkle.", OW, { note: "Her surname is taken from her father's; tell Kin if it is different." });
  add("P-irene", "F", "Irene Alyssa Marie", "", "Your ex-wife; Violet's mother. Glenda's 2022 obituary lists you as \"Joseph (Irene) Pavia Jr.\"", OW, { names: [{ given: "Irene Alyssa Marie", surname: "", type: "birth", src: OW }, { given: "Irene", surname: "Pavia", type: "married", src: GO }] });
  add("P-violet", "F", "Violet Joy", "Pavia", "Your daughter. Glenda's 2022 obituary names her among the family as Violet Joy Pavia.", OW.concat(GO));
  add("P-rachel", "F", "Rachel", "Pavia", "Your father's wife (Glenda's 2022 obituary: \"Joseph (Rachel) Pavia of Monroe\").", GO, { status: "probable", names: [{ given: "Rachel", surname: "Pavia", type: "married", src: GO }] });
  add("P-timburd", "M", "Tim", "Burd", "Your aunt Jennifer's husband (Glenda's 2022 obituary).", GO, { status: "probable" });
  add("P-tyler", "U", "Tyler", "Burd", "Your first cousin: Glenda's grandchild, Jennifer and Tim Burd's child (her 2022 obituary).", GO, { status: "probable" });
  add("P-madeline", "U", "Madeline", "Burd", "Your first cousin: Glenda's grandchild, Jennifer and Tim Burd's child (her 2022 obituary).", GO, { status: "probable" });
  add("P-ilene", "F", "Ilene", "Kennedy", "Barbara's child, your grandmother Laurie's sister: one of the three children Barbara's 2009 obituary names. Kennedy is her married name.", FO, { status: "probable", names: [{ given: "Ilene", surname: "Kennedy", type: "married", src: FO }] });
  add("P-joes", "M", "Joseph", "Seconder", "Joe Seconder, your grandmother Laurie's brother: named in Barbara's 2009 obituary, and the great-uncle whose research on Joseph Termenas seeded this tree.", FO.concat(["S-joeseconder"]), { status: "probable" });
  add("P-tania", "F", "Tania", "", "Your mother's cousin (your account). Which of Barbara's children is her parent is not yet known: she is placed with Ilene until you say (Q38).", OW, { status: "family" });
  for (const [id, given, sur, spouse] of [["P-laurelk", "Laurel", "Kirkland", ""], ["P-clintonk", "Clinton", "Kirkland", "Paula"], ["P-alank", "Alan", "Kirkland", "Chola"], ["P-leslieh", "Leslie", "Hoffman", "Daniel"]])
    add(id, "U", given, sur, `James Kirkland's child, your father's first cousin${spouse ? ` (married to ${spouse})` : ""}: named in James's 2021 obituary.`, JK, { status: "probable" });
  const jk = P("P-jamesk"); if (jk) { jk.summary = "Glenda's brother, the eldest son of Buster and Joy: born 1 August 1936 in Tennessee (the obituary's header says 2 August), died 1 August 2020. His obituary names four children (Laurel, Clinton, Alan and Leslie) and a grandson James."; jk.names[0].src.push("S-jkirkland-obit"); }
  const ggm = P("P-ggm"); if (ggm) ggm.summary += " Her 2009 obituary names three children, Laurie Jordan, Ilene Kennedy and Joseph Seconder, and counts 8 grandchildren and several great-grandchildren.";
  const me = P("P-self"); if (me) { me.names.push({ given: "Joseph", surname: "Pavia Jr.", type: "record", src: GO, note: "Glenda's 2022 obituary: \"Joseph (Irene) Pavia Jr.\"" }); me.summary = "You. Your daughter is Violet Joy; your sisters Jessica and Samantha are your mother's daughters with Jeffrey Hinkle."; }
  /* the spouses the records already named */
  L.people.push(
    { id: "P-donald", sex: "M", status: "probable", names: [{ given: "Donald T.", surname: "Dembeck", type: "birth", src: ["S-pavia-obits"] }], summary: "Caroline Pavia's husband, 1928 to 2018." },
    { id: "P-christine", sex: "F", status: "probable", names: [{ given: "Christine", surname: "Pianowski", type: "birth", src: ["S-pavia-obits"] }], summary: "Charles P. Pavia's wife." }
  );
  L.families.push(
    { id: "F-hinkle", partners: ["P-mother", "P-jhinkle"], children: ["P-jessica", "P-samantha"], ended: true },
    { id: "F-self", partners: ["P-self", "P-irene"], children: ["P-violet"], ended: true },
    { id: "F-father2", partners: ["P-father", "P-rachel"], children: [] },
    { id: "F-burd", partners: ["P-jennifer", "P-timburd"], children: ["P-tyler", "P-madeline"] },
    { id: "F-ilene", partners: ["P-ilene"], children: ["P-tania"], uncertain: { "P-tania": "Ilene's daughter? (Q38)" } },
    { id: "F-jamesk", partners: ["P-jamesk"], children: ["P-laurelk", "P-clintonk", "P-alank", "P-leslieh"] },
    { id: "F-dembeck", partners: ["P-caroline", "P-donald"], children: [] },
    { id: "F-charlesp", partners: ["P-charlesp", "P-christine"], children: [] }
  );
  const fg = fam("F-ggm"); if (fg) { fg.children.push("P-ilene", "P-joes"); fg.uncertain = Object.assign(fg.uncertain || {}, { "P-ilene": "Bob Seconder's daughter too? Barbara's obituary names only her" }); }

  /* the places the tree already knew, as events, so that everyone reaches the map (each event cites the person's own source) */
  L.places.push(
    { id: "PL-sc", name: "South Carolina", hist: "South Carolina", now: "South Carolina", lat: 34.0, lon: -81.0, approx: "the state" },
    { id: "PL-macon-nc", name: "Macon County, North Carolina", hist: "Macon County, North Carolina", now: "Macon County, North Carolina", lat: 35.15, lon: -83.42 },
    { id: "PL-rutherford-nc", name: "Rutherford County, North Carolina", hist: "Rutherford County, North Carolina", now: "Rutherford County, North Carolina", lat: 35.4, lon: -81.92 },
    { id: "PL-haywood-nc", name: "Haywood County, North Carolina", hist: "Haywood County, North Carolina", now: "Haywood County, North Carolina", lat: 35.56, lon: -82.98 },
    { id: "PL-person-nc", name: "Person County, North Carolina", hist: "Person County, North Carolina", now: "Person County, North Carolina", lat: 36.39, lon: -78.97 },
    { id: "PL-anson-nc", name: "Anson County, North Carolina", hist: "Anson County, North Carolina", now: "Anson County, North Carolina", lat: 34.97, lon: -80.1 },
    { id: "PL-grayson-va", name: "Grayson County, Virginia", hist: "Grayson County, Virginia", now: "Grayson County, Virginia", lat: 36.66, lon: -81.22 },
    { id: "PL-carteret-nc", name: "Carteret County, North Carolina", hist: "Carteret County (Core Sound), North Carolina", now: "Carteret County, North Carolina", lat: 34.86, lon: -76.53 },
    { id: "PL-pasquotank-nc", name: "Pasquotank County, North Carolina", hist: "Pasquotank Precinct, Albemarle County, North Carolina", now: "Pasquotank County, North Carolina", lat: 36.3, lon: -76.25 },
    { id: "PL-bath-nc", name: "Bath, North Carolina", hist: "Bath County, North Carolina", now: "Beaufort County, North Carolina", lat: 35.48, lon: -76.81 },
    { id: "PL-lowernorfolk", name: "Lower Norfolk County, Virginia", hist: "Lynnhaven parish, Lower Norfolk County, Virginia", now: "Virginia Beach, Virginia", lat: 36.88, lon: -76.07 },
    { id: "PL-elizcity-va", name: "Elizabeth City, Virginia", hist: "Elizabeth City, Virginia Colony", now: "Hampton, Virginia", lat: 37.03, lon: -76.35 },
    { id: "PL-chester-pa", name: "Chester County, Pennsylvania", hist: "Chester County, Pennsylvania", now: "Chester County, Pennsylvania", lat: 39.97, lon: -75.75 },
    { id: "PL-guilford-nc", name: "Guilford County, North Carolina", hist: "Guilford County (Regulator country), North Carolina", now: "Guilford County, North Carolina", lat: 36.08, lon: -79.79 },
    { id: "PL-canecreek", name: "Cane Creek, North Carolina", hist: "Cane Creek Monthly Meeting (Quaker), Orange County, North Carolina", now: "Snow Camp, Alamance County, North Carolina", lat: 35.9, lon: -79.43 },
    { id: "PL-montgomery-va", name: "Montgomery County, Virginia", hist: "Montgomery County, Virginia", now: "Montgomery County, Virginia", lat: 37.17, lon: -80.39 },
    { id: "PL-spotsylvania", name: "Spotsylvania County, Virginia", hist: "Spotsylvania County, Virginia", now: "Spotsylvania County, Virginia", lat: 38.2, lon: -77.66 },
    { id: "PL-kent", name: "Kent, England", hist: "Kent, England", now: "Kent, England", lat: 51.25, lon: 0.75, approx: "the county" },
    { id: "PL-cahaba", name: "Cahaba, Alabama", hist: "Cahaba Federal Prison (Castle Morgan), Cahaba, Alabama", now: "Old Cahawba, Alabama", lat: 32.32, lon: -87.1 },
    { id: "PL-clinton-twp", name: "Clinton Township, Michigan", hist: "Resurrection Cemetery, Clinton Township, Macomb County, Michigan", now: "Clinton Township, Michigan", lat: 42.59, lon: -82.92 },
    { id: "PL-allenpark", name: "Allen Park, Michigan", hist: "Allen Park, Wayne County, Michigan", now: "Allen Park, Michigan", lat: 42.26, lon: -83.21 }
  );
  const CONF = { proven: "proven", probable: "probable", possible: "possible", family: "probable" };
  const ev = (who, type, text, sort, place, conclusion, value) => {
    const p = P(who); if (!p) return; const src = (p.names[0].src || [])[0]; if (!src) return;
    L.events.push({ id: `E-k-${who.slice(2)}-${type}-${sort.slice(0, 4)}`, type, who: [who], date: { text, sort }, place, conclusion, confidence: CONF[p.status] || "possible",
      assert: [{ src, value: value || conclusion, info: "secondary", ev: "direct", note: "from the person's own summary in this tree, placed on 26 Nov 2026" }] });
  };
  ev("P-jessec", "birth", "about 1880", "1880-01-01", "PL-monroetn", "Born about 1880 in Monroe County, Tennessee (compiled trees).");
  ev("P-emaline", "birth", "1856", "1856-01-01", "PL-loudon", "Born in 1856 in Loudon, Tennessee (compiled trees).");
  ev("P-jessea", "death", "1895", "1895-01-01", "PL-monroetn", "Died in 1895 in Monroe County, Tennessee; buried at Ballplay Ebenezer Cemetery (compiled trees).");
  ev("P-polly", "death", "1920", "1920-01-01", "PL-monroetn", "Died in 1920 in Monroe County, Tennessee (compiled trees).");
  ev("P-jmgiles", "birth", "1827", "1827-01-01", "PL-sc", "Born in 1827 in South Carolina (compiled trees).");
  ev("P-jmgiles", "death", "1903", "1903-01-01", "PL-monroetn", "Died in 1903 in Monroe County, Tennessee; buried at Ball Play Cemetery.");
  ev("P-jamesak", "residence", "until about 1830", "1825-01-01", "PL-macon-nc", "Lived in Macon County, North Carolina before moving to Monroe County, Tennessee about 1830 (compiled trees).");
  ev("P-jamesak", "death", "1869", "1869-01-01", "PL-polk", "Died in 1869 in Polk County, Tennessee (compiled trees).");
  ev("P-jamesb", "marriage", "17 Mar 1825", "1825-03-17", "PL-haywood-nc", "Married Parthenia Turner on 17 March 1825 in Haywood County, North Carolina (compiled trees).");
  ev("P-jamesb", "death", "1873", "1873-01-01", "PL-monroetn", "Died in 1873 in Monroe County, Tennessee; buried at Antioch Baptist Church (compiled trees).");
  ev("P-parthenia", "birth", "1807", "1807-01-01", "PL-person-nc", "Born in 1807 in Person County, North Carolina (compiled trees).");
  ev("P-parthenia", "death", "1877", "1877-01-01", "PL-monroetn", "Died in 1877 in Monroe County, Tennessee (compiled trees).");
  ev("P-nathan", "residence", "1810", "1810-01-01", "PL-rutherford-nc", "In Rutherford County, North Carolina in 1810 (compiled trees).");
  ev("P-nathan", "residence", "by 1824", "1824-01-01", "PL-monroetn", "In Monroe County, Tennessee by 1824 (compiled trees).");
  ev("P-benjamin", "death", "about 1860", "1860-01-01", "PL-monroetn", "Died about 1860 in Monroe County, Tennessee (compiled trees).");
  ev("P-nathaniel", "will", "9 May 1816", "1816-05-09", "PL-anson-nc", "Signed his will on 9 May 1816 in Anson County, North Carolina; it was proved by April 1818.");
  ev("P-wesley", "death", "1855", "1855-01-01", "PL-monroetn", "Died in 1855 in Monroe County, Tennessee (compiled trees).");
  ev("P-tdavis", "birth", "1734", "1734-01-01", "PL-chester-pa", "Born in 1734 in Chester County, Pennsylvania (compiled trees).");
  ev("P-tdavis", "residence", "about 1768-1771", "1770-01-01", "PL-guilford-nc", "A Regulator in Guilford County, North Carolina (compiled trees and DAR).");
  ev("P-tdavis", "service", "the Revolution", "1780-01-01", "PL-montgomery-va", "Served in the Montgomery County, Virginia militia (DAR A030698; not found in McAllister's 1913 lists).");
  ev("P-tdavisjr", "residence", "in his lifetime (1760-1826)", "1790-01-01", "PL-canecreek", "Of the Cane Creek Quaker meeting, North Carolina (compiled trees and Quaker minutes).");
  ev("P-charlesdav", "death", "1801", "1801-01-01", "PL-chester-pa", "Died in 1801 in Chester County, Pennsylvania (compiled).");
  ev("P-johnb", "will", "1800", "1800-01-01", "PL-grayson-va", "His 1800 will, in Grayson County, Virginia, names his granddaughter Rebecca (compiled).");
  ev("P-nbryant", "will", "1766", "1766-01-01", "PL-carteret-nc", "His will was probated in Carteret County, North Carolina in 1766 (compiled; WikiTree cites 18 April 1766).");
  ev("P-johnm", "will", "25 Dec 1741", "1741-12-25", "PL-pasquotank-nc", "His will, dated 25 December 1741 in Pasquotank County, names his daughter Elener Bryant.", "Grimes 1910, p. 239");
  ev("P-joelm", "will", "24 Oct 1715", "1715-10-24", "PL-bath-nc", "His will, dated 24 October 1715 in Bath County, proved 3 July 1716.", "Grimes 1910, p. 239");
  ev("P-johnm-sr", "residence", "1645-1662", "1655-01-01", "PL-lowernorfolk", "A churchwarden of Lynnhaven parish (1645) and a justice of Lower Norfolk County (1660-1662) (records; the link to this tree is compiled).");
  ev("P-tkeeling", "residence", "1632-1633", "1632-01-01", "PL-elizcity-va", "Burgess for Elizabeth City, Virginia in 1632-33 (compiled).");
  ev("P-abrogers", "residence", "1714-1762", "1740-01-01", "PL-spotsylvania", "Of Spotsylvania County, Virginia (one compiled tree).");
  ev("P-aestes", "birth", "1647", "1647-01-01", "PL-kent", "Born in 1647 in Kent, England; came to Virginia about 1674 (compiled).");
  ev("P-peterc", "service", "24 Sep 1864 to 1865", "1864-09-24", "PL-cahaba", "Company F, 3rd Tennessee Cavalry (Union); captured with his company in September 1864 and held at Cahaba, Alabama.", "the 1866 Tennessee Adjutant General's report lists him in Company F");
  ev("P-peterc", "residence", "1870 and 1880", "1870-06-01", "PL-mcminn", "In McMinn County, Tennessee in 1870 and 1880 (compiled censuses).");
  ev("P-whtippens", "marriage", "19 Sep 1867", "1867-09-19", "PL-mcminn", "Married Eliza Owens on 19 September 1867 in McMinn County, Tennessee (compiled).");
  ev("P-caroline", "burial", "after 31 Dec 2014", "2015-01-01", "PL-clinton-twp", "Died on 31 December 2014; buried at Resurrection Cemetery, Clinton Township.");
  ev("P-charlesp", "death", "16 Apr 2009", "2009-04-16", "PL-allenpark", "Died on 16 April 2009 in Allen Park, Michigan.");
  ev("P-costantino", "birth", "1871", "1871-01-01", "PL-malta", "Born in 1871 in Malta (his dates from other members' trees).");
  ev("P-carmela", "birth", "1872", "1872-01-01", "PL-malta", "Born in 1872 in Malta (her dates from other members' trees).");
  ev("P-paulp", "residence", "1926", "1926-09-04", "PL-malta", "Of Malta, as named on his son's 1926 marriage record.");
  ev("P-carolinep", "residence", "1926", "1926-09-04", "PL-malta", "Of Malta, as named on her son's 1926 marriage record.");
  { const m = P("P-mel"); if (m) { m.names[0].src.push("S-feole-obit"); m.summary += " Born 31 January 1940, died 28 April 2009 in Holly; buried at Lakeside Cemetery, Holly (his obituary)."; } }
  L.events.push({ id: "E-k-mel-death-2009", type: "death", who: ["P-mel"], date: { text: "28 Apr 2009", sort: "2009-04-28" }, place: "PL-holly", conclusion: "Died in Holly, Michigan on 28 April 2009, three months after Barbara; buried at Lakeside Cemetery, Holly.", confidence: "probable",
    assert: [{ src: "S-feole-obit", value: "Melvin Feole, age 69 of Holly died Tues. April 28, 2009 ... preceded in death by his wife Barbara Feole on Jan. 22, 2009", info: "primary", ev: "direct", note: "quoted by Gemini" }] });

  /* questions: Q22 is answered; what is still to ask */
  const q22 = L.questions.findIndex((q) => q.id === "Q22"); if (q22 >= 0) L.questions.splice(q22, 1);
  L.questions.push(
    { id: "Q38", p: 1, person: "P-tania", q: "Tania, your mother's cousin: who are her parents? Barbara's three children were Laurie (your grandmother), Ilene Kennedy and Joe Seconder, so Tania is most likely Ilene's or Joe's daughter. And David Holgate: is he Tania's father, or Betty Holgate's son (Barbara's sister's side)?", sources: "you, your mother or Joe Seconder", task: "owner" },
    { id: "Q39", p: 2, person: "P-charles", q: "Your grandfather Charles A. Sanders's brothers and sisters, and your mother's own cousins on both sides: Barbara's obituary counts 8 grandchildren, and the tree knows two (your mother, and Tania if she is one).", sources: "you and your mother", task: "owner" }
  );
  L.log.push({ id: "L22", date: "2026-11-26", by: "Claude", q: "Q22", where: "your message; Gemini's forensic audit (Barbara Feole's, Melvin Feole's and James Kirkland's obituaries, as quoted); Glenda's obituary", terms: "the whole family", result: "found", note: "Q22 answered: you are Joseph (Irene) Pavia Jr. and Violet is your daughter. Added Jeffrey Hinkle and your sisters Jessica and Samantha; Irene and Violet; Barbara's other children Ilene Kennedy and Joe Seconder; Tania (parent to confirm, Q38); your aunt Jennifer's husband Tim and children Tyler and Madeline Burd; James Kirkland's four children; Rachel, Donald Dembeck and Christine Pianowski. Placed events for 38 more people so they reach the map." });
})(window.KIN_LINEAGE);
/* your own card: the four lines, not one (owner, 2026-11-26) */
(function (L) { const me = L.people.find((p) => p.id === "P-self"); if (me) me.note = "Your four grandparents' lines: Pavia (Malta, then Detroit), Kirkland (Tennessee back to colonial North Carolina and Virginia), Sanders (Michigan), and Seconder and Termenas (England, Ontario and Lithuania)."; })(window.KIN_LINEAGE);

/* 26 Nov 2026, later (owner): "My mom has 2 brothers and a sister. Jennifer is Charles daughter also but Tim and Michael have 2 other
   dad's. My sisters are hinkle." Laurie's children: Toni and Jennifer by Charles A. Sanders; Tim and Michael each by another father
   (not named yet). Not to be confused with Jennifer Burd (your father's sister) or Tim Burd (her husband). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  L.sources.push({ id: "S-owner-1126b", short: "Your account of your mother's brothers and sister (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.",
    read: "Your mother has two brothers and a sister. Jennifer is also Charles A. Sanders's daughter; Tim and Michael have two other fathers. Your sisters' surname is Hinkle." });
  const OW = ["S-owner-1126b"];
  L.people.push(
    { id: "P-jennifers", sex: "F", status: "family", living: true, names: [{ given: "Jennifer", surname: "Sanders", type: "birth", src: OW, note: "her birth surname taken from her father's" }], summary: "Your mother's sister: Charles A. Sanders and Laurie's daughter (your account). Not Jennifer Burd, your father's sister." },
    { id: "P-timm", sex: "M", status: "family", living: true, names: [{ given: "Tim", surname: "", type: "birth", src: OW }], summary: "Your mother's brother: Laurie's son by a father other than Charles A. Sanders, not yet named (your account). Not Tim Burd." },
    { id: "P-michael", sex: "M", status: "family", living: true, names: [{ given: "Michael", surname: "", type: "birth", src: OW }], summary: "Your mother's brother: Laurie's son by another father again, not yet named (your account)." }
  );
  const fg = L.families.find((f) => f.id === "F-gp"); if (fg && !fg.children.includes("P-jennifers")) fg.children.push("P-jennifers");
  L.families.push(
    { id: "F-gp-tim", partners: ["P-gp"], children: ["P-timm"] },
    { id: "F-gp-michael", partners: ["P-gp"], children: ["P-michael"] }
  );
  for (const id of ["P-jessica", "P-samantha"]) { const p = P(id); if (p) { delete p.note; p.names[0].src = p.names[0].src.concat(OW); } }
  const gp = P("P-gp"); if (gp) gp.summary += " Her children: your mother Toni and Jennifer (with Charles A. Sanders), and Tim and Michael (each with another father).";
  const q39 = L.questions.find((q) => q.id === "Q39");
  if (q39) q39.q = "Your grandfather Charles A. Sanders's brothers and sisters; and the fathers of your uncles Tim and Michael, with their surnames. Your mother's brothers and sister are in the tree now (Jennifer, Tim, Michael).";
  const q38 = L.questions.find((q) => q.id === "Q38");
  if (q38) q38.q = "Tania, your mother's cousin: is she Ilene Kennedy's daughter or Joe Seconder's? (Barbara's 8 grandchildren: Laurie's four, your mother, Jennifer, Tim and Michael, and four more among Ilene's and Joe's children.) And David Holgate: is he Tania's father, or Betty Holgate's son on Barbara's sister's side?";
  L.log.push({ id: "L23", date: "2026-11-26", by: "Claude", q: "Q39", where: "your message", terms: "your mother's brothers and sister", result: "found", note: "Added Jennifer (Charles A. Sanders and Laurie's daughter), Tim and Michael (Laurie's sons by two other fathers, not yet named). Your sisters' surname confirmed as Hinkle." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, later again (owner): "My dad's sister is Jennifer also. Married to Tim. Kids Madeline and Tyler. My moms sister
   Jennifer has a kid named Nicholas patrick." The Burd family (from Glenda's 2022 obituary) is now confirmed by you; your mother's
   sister Jennifer's child Nicholas Patrick is new (whether Patrick is a middle name or a surname is not said). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const C = (id) => L.certainty.find((c) => c.child === id);
  const set = (id, pct, basis) => { let c = C(id); if (!c) { c = { child: id }; L.certainty.push(c); } c.pct = pct; c.basis = basis; };
  const addSrc = (id, s) => { const p = P(id); if (p && p.names[0] && !p.names[0].src.includes(s)) p.names[0].src.push(s); };
  L.sources.push({ id: "S-owner-1126c", short: "Your account of your two aunts named Jennifer and their children (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.",
    read: "Your father's sister is also named Jennifer; she is married to Tim, and their children are Madeline and Tyler. Your mother's sister Jennifer has a child named Nicholas Patrick." });
  const OW = "S-owner-1126c";
  for (const id of ["P-jennifer", "P-timburd", "P-tyler", "P-madeline"]) addSrc(id, OW);
  const jb = P("P-jennifer"); if (jb) jb.summary = "Your aunt: your father's sister, Glenda's daughter, of Pawhuska, Oklahoma; married to Tim Burd; their children are Tyler and Madeline (Glenda's 2022 obituary and your account). Not Jennifer Sanders, your mother's sister.";
  set("P-jennifer", 99, "Glenda's obituary and your account");
  set("P-tyler", 99, "Glenda's obituary and your account");
  set("P-madeline", 99, "Glenda's obituary and your account");
  L.people.push({ id: "P-nicholas", sex: "U", status: "family", living: true,
    names: [{ given: "Nicholas Patrick", surname: "", type: "birth", src: [OW], note: "Patrick may be a middle name or a surname: not said" }],
    summary: "Your first cousin: your mother's sister Jennifer's child (your account). Nicholas's father is not in the tree yet." });
  L.families.push({ id: "F-jennifers", partners: ["P-jennifers"], children: ["P-nicholas"] });
  set("P-nicholas", 95, "your account");
  set("P-jennifers", 95, "your account");
  const q39 = L.questions.find((q) => q.id === "Q39");
  if (q39) q39.q += " Also: Nicholas Patrick's father, and whether Patrick is a middle name or a surname.";
  L.log.push({ id: "L24", date: "2026-11-26", by: "Claude", q: "Q39", where: "your message", terms: "your aunts Jennifer", result: "found", note: "Confirmed your father's sister Jennifer Burd, her husband Tim and their children Tyler and Madeline (already in from Glenda's obituary). Added Nicholas Patrick, your mother's sister Jennifer's child." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, evening (owner): "Patrick is middle and we dont know who his father is. Joe has no kids and Tania isnt Ilene's kid
   either. My grandpa has siblings i think but he doesnt share so thats gonna be the hard link to crack." Tania leaves Ilene's family.
   Barbara's side is now closed to her (Ilene's and Joe's children are not hers to be), so the likeliest place is your grandfather's
   side, which the tree does not have yet: a cousin of your mother whose mother is not in the tree fits a daughter of one of Charles
   A. Sanders's sisters. She hangs from a placeholder mother, drawn dashed as a question, until you or the records say (Q38;
   Gemini KIN-GEM-51 and KIN-GEM-52). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const F = (id) => L.families.find((f) => f.id === id);
  L.sources.push({ id: "S-owner-1126d", short: "Your account: Nicholas's middle name, Joe Seconder, Tania, your grandfather's family (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.",
    read: "Patrick is Nicholas's middle name; his father is not known. Joe Seconder has no children. Tania is not Ilene's child. Your grandfather Charles A. Sanders has brothers and sisters, you think, but he does not talk about them." });
  const OW = ["S-owner-1126d"];
  const nk = P("P-nicholas");
  if (nk) { nk.sex = "M"; nk.names = [{ given: "Nicholas Patrick", surname: "", type: "birth", src: ["S-owner-1126c"].concat(OW), note: "Patrick is his middle name; his surname is not given" }];
    nk.summary = "Your first cousin: your mother's sister Jennifer's son (your account). His father is not known."; }
  const jo = P("P-joes"); if (jo) { jo.summary += " He has no children (your account)."; if (jo.names[0] && !jo.names[0].src.includes(OW[0])) jo.names[0].src.push(OW[0]); }
  const il = P("P-ilene"); if (il) il.summary += " Tania is not her daughter (your account); her own children, Barbara's other grandchildren, are not named yet.";
  /* Tania out of Ilene's family */
  const fi = L.families.findIndex((f) => f.id === "F-ilene"); if (fi >= 0) L.families.splice(fi, 1);
  L.people.push({ id: "P-tania-mom", sex: "F", status: "placeholder", placeholder: "Tania's mother", hint: "Grandpa Charles's sister?", living: true, names: [],
    summary: "Tania's mother, not in the tree yet (your account). Not Ilene, not Joe's (he has no children). If Tania is your mother's first cousin on her father's side, her mother is one of your grandfather Charles A. Sanders's sisters, whom he does not talk about (Q38)." });
  const fs = F("F-sanders");
  if (fs) { fs.children.push("P-tania-mom"); fs.uncertain = Object.assign(fs.uncertain || {}, { "P-tania-mom": "Charles's sister? (Q38)" }); }
  L.families.push({ id: "F-tania", partners: ["P-tania-mom"], children: ["P-tania"] });
  const ta = P("P-tania");
  if (ta) { ta.summary = "Your mother's cousin (your account). Not Ilene's daughter and not Joe's; her mother is not in the tree. Drawn under a placeholder mother on your grandfather Charles A. Sanders's side, as a question, until you or the records say (Q38)."; if (ta.names[0] && !ta.names[0].src.includes(OW[0])) ta.names[0].src.push(OW[0]); }
  const q38 = L.questions.find((q) => q.id === "Q38");
  if (q38) { q38.q = "Tania, your mother's cousin: is her mother one of your grandfather Charles A. Sanders's sisters? (She is not Ilene's daughter and Joe has no children.) And who is David Holgate: Betty Holgate's son (your great-grandmother Barbara's sister's side), Tania's father, or someone else?"; q38.sources = "you or your mother; then obituaries (Gemini KIN-GEM-51, KIN-GEM-52)"; }
  const q39 = L.questions.find((q) => q.id === "Q39");
  if (q39) { q39.q = "Your grandfather Charles A. Sanders's brothers and sisters: he has some, you think, but he does not talk about them. The way in is his parents' records (Charles Sanders and Betty Flemming): their obituaries name their children. Also the fathers of your uncles Tim and Michael, with their surnames."; q39.sources = "obituaries, death and birth indexes, the 1950 census (Gemini KIN-GEM-51); your mother"; q39.task = "KIN-GEM-51"; }
  L.log.push({ id: "L25", date: "2026-11-26", by: "Claude", q: "Q38", where: "your message; the open web (obituary searches for Thomas and Betty Holgate, David Holgate, Betty (Flemming) Sanders, and Sanders obituaries naming Toni Hinkle)", terms: "Holgate, Novi; Sanders and Flemming/Fleming, Michigan; Toni Hinkle", result: "not found", note: "No obituary on the open web names Betty or Thomas Holgate's children, or Charles Sanders and Betty Flemming's. Tania moved out of Ilene's family to a placeholder mother on the Sanders side (a question, drawn dashed). Gemini has the record search: KIN-GEM-51 (Sanders brothers and sisters) and KIN-GEM-52 (the Holgate line and Tania)." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, night (owner): "Jennifer married jim walls then divorced then now is with Mark Johnson this is my moms sister.
   Nicholas is Sanders btw. Joe married Kathleen." Jennifer Sanders: married Jim Walls (ended), now with Mark Johnson ("is with":
   recorded as partners, not as married). Nicholas's surname is Sanders; his father is still not known. Joe Seconder's wife Kathleen. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  L.sources.push({ id: "S-owner-1126e", short: "Your account: your aunt Jennifer's marriages, Nicholas's surname, Joe Seconder's wife (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.",
    read: "Your mother's sister Jennifer married Jim Walls, then divorced; she is now with Mark Johnson. Nicholas's surname is Sanders. Joe Seconder married Kathleen." });
  const OW = ["S-owner-1126e"];
  const add = (p) => L.people.push(Object.assign({ status: "family", living: true }, p));
  add({ id: "P-jimwalls", sex: "M", names: [{ given: "Jim", surname: "Walls", type: "birth", src: OW }], summary: "Your aunt Jennifer's ex-husband: your mother's sister married him and they divorced (your account)." });
  add({ id: "P-markj", sex: "M", names: [{ given: "Mark", surname: "Johnson", type: "birth", src: OW }], summary: "Your aunt Jennifer's partner now (your account: \"now is with Mark Johnson\")." });
  add({ id: "P-kathleen", sex: "F", names: [{ given: "Kathleen", surname: "", type: "as-given", src: OW, note: "her surname is not given" }], summary: "Joe Seconder's wife (your account). They have no children." });
  L.families.push(
    { id: "F-walls", partners: ["P-jennifers", "P-jimwalls"], children: [], ended: true },
    { id: "F-mjohnson", partners: ["P-jennifers", "P-markj"], children: [], unmarried: true },
    { id: "F-joes", partners: ["P-joes", "P-kathleen"], children: [] }
  );
  const nk = P("P-nicholas");
  if (nk) { nk.names = [{ given: "Nicholas Patrick", surname: "Sanders", type: "birth", src: ["S-owner-1126c", "S-owner-1126d"].concat(OW), note: "Patrick is his middle name" }];
    nk.summary = "Your first cousin: your mother's sister Jennifer's son, Nicholas Patrick Sanders (your account). His father is not known."; }
  const js = P("P-jennifers");
  if (js) { js.summary = "Your mother's sister: Charles A. Sanders and Laurie's daughter. Married Jim Walls and divorced; now with Mark Johnson. Her son is Nicholas Patrick Sanders (your account). Not Jennifer Burd, your father's sister."; js.names[0].src = js.names[0].src.concat(OW); }
  const jo = P("P-joes"); if (jo) jo.summary = jo.summary.replace(" He has no children (your account).", " Married to Kathleen; they have no children (your account).");
  const q39 = L.questions.find((q) => q.id === "Q39");
  if (q39) q39.q = q39.q.replace(" Also: Nicholas Patrick's father, and whether Patrick is a middle name or a surname.", "");
  L.log.push({ id: "L26", date: "2026-11-26", by: "Claude", q: "Q39", where: "your message", terms: "your aunt Jennifer, Nicholas, Joe Seconder", result: "found", note: "Added Jim Walls (Jennifer's ex-husband), Mark Johnson (her partner now) and Kathleen (Joe Seconder's wife). Nicholas's surname is Sanders." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, night (owner): "Tania is my moms cousin im just blanking on her moms name" ... her mother is on "Lauries" side.
   So Tania's mother is your grandmother Laurie's sister or half-sister: not Ilene (you said so), and not named among Barbara's three
   surviving children in 2009, so either a daughter of Barbara's who died before 2009, or Bob Seconder's daughter by another marriage.
   The placeholder moves from the Sanders side to Bob and Barbara's family, drawn dashed, until the name comes back. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const F = (id) => L.families.find((f) => f.id === id);
  L.sources.push({ id: "S-owner-1126f", short: "Your account: Tania's mother is on your grandmother Laurie's side (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.",
    read: "Tania is your mother's cousin; you cannot recall her mother's name; her mother is on your grandmother Laurie's side." });
  const fs = F("F-sanders");
  if (fs) { fs.children = fs.children.filter((c) => c !== "P-tania-mom"); if (fs.uncertain) delete fs.uncertain["P-tania-mom"]; }
  const fg = F("F-ggm");
  if (fg) { if (!fg.children.includes("P-tania-mom")) fg.children.push("P-tania-mom"); fg.uncertain = Object.assign(fg.uncertain || {}, { "P-tania-mom": "Laurie's sister or half-sister? (Q38)" }); }
  const tm = P("P-tania-mom");
  if (tm) { tm.hint = "Grandma Laurie's sister?"; tm.summary = "Tania's mother: your grandmother Laurie's sister or half-sister, whose name you cannot recall yet (your account). Not Ilene. Barbara's 2009 obituary names three surviving children (Laurie, Ilene, Joe), so she is either Barbara's daughter who died before 2009, or Bob Seconder's daughter by another marriage (Q38)."; }
  const ta = P("P-tania");
  if (ta) { ta.summary = "Your mother's cousin (your account): her mother is your grandmother Laurie's sister or half-sister, not Ilene, whose name has not come back to you yet (Q38)."; if (ta.names[0] && !ta.names[0].src.includes("S-owner-1126f")) ta.names[0].src.push("S-owner-1126f"); }
  const q38 = L.questions.find((q) => q.id === "Q38");
  if (q38) { q38.q = "Tania's mother: your grandmother Laurie's sister or half-sister (not Ilene). Her first name, and whether she is Barbara's daughter (then she died before 2009, as Barbara's obituary names only Laurie, Ilene and Joe) or Bob Seconder's by another marriage. And who is David Holgate?"; q38.sources = "you, your mother or grandmother Laurie; then Bob Seconder's 2003 obituary and the Waterford Seconder obituaries (Gemini KIN-GEM-52)"; q38.task = "KIN-GEM-52"; }
  L.log.push({ id: "L27", date: "2026-11-26", by: "Claude", q: "Q38", where: "the open web (obituary search: Seconder, Waterford and Pontiac, Michigan)", terms: "Seconder obituary; Robert Seconder 2003; Wilbur Seconder 2012; Tania Seconder", result: "candidate", note: "No obituary found for Robert (Bob) Seconder (2003) or Wilbur Seconder (2012). Leads not yet read (the pages are outside this session's network): Tamora \"Tammy\" J. Seconder of Waterford (8 Sep 1957 to 2 Apr 2012; The Oakland Press via Legacy.com, and Modetz Funeral Homes) and Jack L. Seconder Sr. of Waterford (28 Mar 1933 to 15 Aug 2024; Simpson-Modetz). Whether either is in Laurie's family is not known: given to Gemini (KIN-GEM-52)." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, night (owner): "Michelle is Tanias sister." Michelle joins Tania under their mother, your grandmother Laurie's sister
   or half-sister (name still to come). */
(function (L) {
  const F = (id) => L.families.find((f) => f.id === id);
  L.sources.push({ id: "S-owner-1126g", short: "Your account: Michelle is Tania's sister (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.", read: "Michelle is Tania's sister." });
  L.people.push({ id: "P-michelle", sex: "F", status: "family", living: true, names: [{ given: "Michelle", surname: "", type: "as-given", src: ["S-owner-1126g"], note: "her surname is not given" }],
    summary: "Tania's sister, so your mother's cousin too (your account). Their mother is your grandmother Laurie's sister or half-sister, whose name has not come back yet (Q38)." });
  const ft = F("F-tania"); if (ft && !ft.children.includes("P-michelle")) ft.children.push("P-michelle");
  const q38 = L.questions.find((q) => q.id === "Q38");
  if (q38) q38.q = q38.q.replace("Tania's mother:", "Tania and Michelle's mother:");
  L.log.push({ id: "L28", date: "2026-11-26", by: "Claude", q: "Q38", where: "your message", terms: "Tania's sister", result: "found", note: "Added Michelle, Tania's sister." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, night: Joe Seconder's Facebook photo of the 2006 family Christmas (screenshots from the owner). The caption and the tag
   list are read as a source; nobody in the picture is named from their face. Kathleen's married surname is Seconder (her tag); a Dave
   Holgate and a Rachel Denys Holgate were with the family that Christmas, so the Holgates (Betty (Termens) Holgate's line, Barbara's
   sister's) are close family; Rachel is the relative who shares Joseph Termenas's photographs on Ancestry. The photo is kept in the
   owner's Drive (Kin media folder), not in this public repository. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  L.sources.push({ id: "S-fb-xmas2006", short: "2006 family Christmas photograph (posted by Joe Seconder, 2012)", kind: "original", year: 2012,
    cite: "\"2006 Family Christmas - at Jeffrey Hinkle & Toni Sanders-Hinkle house\", photograph posted to Facebook by Joe Seconder, 20 May 2012, with 9 people tagged; screenshots sent by Joseph Pavia, 26 November 2026; a copy is in his Google Drive (Kin media folder).",
    read: "Taken at Christmas 2006 at Jeffrey Hinkle and Toni Sanders-Hinkle's house; about 24 people. Tagged: Joseph Pavia, Jeffrey Hinkle, Toni Sanders-Hinkle, Joe Seconder, Kathleen Seconder, Jen Jen, Dave Holgate, Stacy Kay and Rachel Denys Holgate. Which face is whose is not marked." });
  const FB = "S-fb-xmas2006";
  const kt = P("P-kathleen");
  if (kt) { kt.names = [{ given: "Kathleen", surname: "Seconder", type: "married", src: ["S-owner-1126e", FB], note: "her married surname, from the 2006 Christmas photograph's tags" }]; kt.summary = "Joe Seconder's wife, Kathleen Seconder (your account; her name as tagged in Joe's 2006 Christmas photograph). They have no children."; }
  const mo = P("P-mother");
  if (mo && !mo.names.some((n) => n.surname === "Sanders-Hinkle")) mo.names.push({ given: "Toni", surname: "Sanders-Hinkle", type: "as-used", src: [FB], note: "her name as tagged in 2006 Christmas photograph (posted 2012)" });
  for (const id of ["P-joes", "P-jhinkle", "P-self"]) { const p = P(id); if (p && p.names[0]) { const s = p.names[0].src || (p.names[0].src = []); if (!s.includes(FB)) s.push(FB); } }
  const bt = P("P-betty");
  if (bt) bt.summary += " A Dave Holgate and a Rachel Denys Holgate were at the family's 2006 Christmas (Joe Seconder's photograph), and Rachel shares Joseph Termenas's photographs on Ancestry: very likely Betty's family. How they descend from her is not known yet (Q38).";
  const q38 = L.questions.find((q) => q.id === "Q38");
  if (q38) q38.q = "Tania and Michelle's mother: her first name, and how she belongs to your grandmother Laurie's side: Laurie's sister or half-sister, or a Holgate (Laurie's cousin, a daughter of Betty (Termens) Holgate, Barbara's sister)? Dave Holgate and Rachel Denys Holgate were at the 2006 family Christmas: who are they to you?";
  L.log.push({ id: "L29", date: "2026-11-26", by: "Claude", q: "Q38", where: "Joe Seconder's 2006 Christmas photograph on Facebook (your screenshots)", terms: "caption and tags", result: "found", note: "Kathleen's surname is Seconder. Your mother's name as used then: Toni Sanders-Hinkle. Dave Holgate and Rachel Denys Holgate were at the family Christmas in 2006: the Holgate side is close family. The photo is in your Drive, not the public repository." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, night (owner): "Stacy is Ilene's daughter and Jen is mom's sis." Stacy Kay (her name as tagged in Joe's 2006 Christmas
   photograph) is Ilene Kennedy's daughter, your mother's cousin; "Jen Jen" in the same tags is your mother's sister Jennifer. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  L.sources.push({ id: "S-owner-1126h", short: "Your account: Stacy is Ilene's daughter; \"Jen Jen\" is your mother's sister (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.", read: "Stacy (tagged \"Stacy Kay\" in the 2006 Christmas photograph) is Ilene's daughter; \"Jen Jen\" is your mother's sister Jennifer." });
  const OW = "S-owner-1126h", FB = "S-fb-xmas2006";
  L.people.push({ id: "P-stacy", sex: "F", status: "family", living: true,
    names: [{ given: "Stacy", surname: "", type: "as-given", src: [OW] }, { given: "Stacy", surname: "Kay", type: "as-used", src: [FB], note: "her name as tagged in the 2006 Christmas photograph; Kay may be a middle name or a married surname" }],
    summary: "Ilene Kennedy's daughter, your mother's cousin (your account). Tagged \"Stacy Kay\" in Joe Seconder's photograph of the 2006 family Christmas." });
  L.families.push({ id: "F-ilene", partners: ["P-ilene"], children: ["P-stacy"] });
  const js = P("P-jennifers"); if (js && !js.names.some((n) => n.given === "Jen Jen")) js.names.push({ given: "Jen Jen", surname: "", type: "as-used", src: [OW, FB], note: "her name on Facebook, tagged in the 2006 Christmas photograph" });
  const il = P("P-ilene"); if (il) il.summary = il.summary.replace(" her own children, Barbara's other grandchildren, are not named yet.", " her daughter is Stacy (your account); any other children are not named yet.");
  L.log.push({ id: "L30", date: "2026-11-26", by: "Claude", q: "Q38", where: "your message; the 2006 Christmas photograph's tags", terms: "Stacy Kay, Jen Jen", result: "found", note: "Stacy is Ilene's daughter; \"Jen Jen\" is your mother's sister Jennifer. Both were tagged at the 2006 family Christmas." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, night (owner): "Its joann I just remembered and I dont think Joanne is Nana Feoles kid." Tania and Michelle's mother
   is Joann (also written Joanne), on your grandmother Laurie's side but, you think, not Barbara's daughter (Barbara's 2009 obituary
   names only Laurie, Ilene and Joe, which agrees). She is drawn, as a question, under Laurie's father Bob Seconder (a half-sister of
   Laurie from another marriage would still be "Laurie's side"); the other possibility is a Holgate, Barbara's niece (Q38). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  const F = (id) => L.families.find((f) => f.id === id);
  L.sources.push({ id: "S-owner-1126i", short: "Your account: Tania and Michelle's mother is Joann (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.", read: "Tania and Michelle's mother is Joann (Joanne); you do not think she is Nana Feole's (Barbara's) child." });
  const OW = ["S-owner-1126i"];
  const jo = P("P-tania-mom");
  if (jo) {
    jo.status = "family"; delete jo.placeholder; delete jo.hint;
    jo.names = [{ given: "Joann", surname: "", type: "as-given", src: OW, note: "also written Joanne; her surname is not known" }];
    jo.summary = "Joann (Joanne), Tania and Michelle's mother (your account). On your grandmother Laurie's side, but you do not think she is Nana Feole's (Barbara's) daughter, and Barbara's 2009 obituary names only Laurie, Ilene and Joe. Drawn under Laurie's father Bob Seconder as a question: Bob's daughter from another marriage (Laurie's half-sister), or a Holgate, Barbara's niece (Q38).";
  }
  const fg = F("F-ggm");
  if (fg) { fg.children = fg.children.filter((c) => c !== "P-tania-mom"); if (fg.uncertain) delete fg.uncertain["P-tania-mom"]; }
  L.families.push({ id: "F-bob-joann", partners: ["P-bob"], children: ["P-tania-mom"], uncertain: { "P-tania-mom": "Bob Seconder's daughter, or a Holgate? (Q38)" } });
  const ta = P("P-tania"); if (ta) ta.summary = "Your mother's cousin (your account): her mother is Joann (Joanne), on your grandmother Laurie's side (Q38). Michelle is her sister.";
  const mi = P("P-michelle"); if (mi) mi.summary = "Tania's sister, so your mother's cousin too (your account). Their mother is Joann (Joanne), on your grandmother Laurie's side (Q38).";
  const q38 = L.questions.find((q) => q.id === "Q38");
  if (q38) q38.q = "Joann (Joanne), Tania and Michelle's mother: how is she on your grandmother Laurie's side? Bob Seconder's daughter from another marriage (Laurie's half-sister), or a Holgate (a daughter of Betty (Termens) Holgate, Barbara's sister, so Dave Holgate's sister)? Her surname would settle it. And who are Dave Holgate and Rachel Denys Holgate to you?";
  L.log.push({ id: "L31", date: "2026-11-26", by: "Claude", q: "Q38", where: "your message; the open web", terms: "Joann/Joanne Holgate, Joann/Joanne Seconder, Michigan", result: "found", note: "Tania and Michelle's mother is Joann (Joanne); you do not think she is Barbara's daughter. Moved from Bob and Barbara's family to Bob Seconder alone, as a question (his daughter, or a Holgate). No Michigan Joann Holgate or Joann Seconder found on the open web." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026, Thanksgiving (owner, driving to the family): "She's still alive ... Is aunt Betty on here ... impress me and them."
   Joann is living. Aunt Betty is Betty (Termens) Holgate, Nana Feole's older sister: already in the tree under Joseph and Della; her
   husband Thomas Holgate (named in Katherine Springer's 1997 obituary) is added beside her. L.askTable: the open questions only the
   family can answer, grouped by whom to ask, for the table today (shown in Kin as "Ask at the table"). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  L.sources.push({ id: "S-owner-1126j", short: "Your account: Joann is living (26 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 26 November 2026.", read: "Joann, Tania and Michelle's mother, is living." });
  const jo = P("P-tania-mom"); if (jo) { jo.living = true; if (!jo.names[0].src.includes("S-owner-1126j")) jo.names[0].src.push("S-owner-1126j"); jo.summary = jo.summary.replace("Joann (Joanne), Tania and Michelle's mother (your account).", "Joann (Joanne), Tania and Michelle's mother, living (your account)."); }
  L.people.push({ id: "P-thomash", sex: "M", status: "probable", living: true,
    names: [{ given: "Thomas", surname: "Holgate", type: "birth", src: ["S-springer-obit"] }],
    summary: "Aunt Betty's husband: \"Betty (Thomas) Holgate of Novi\" in Katherine M. Springer's 1997 obituary. Their children are not yet in the tree; Dave Holgate, at the 2006 family Christmas, may be one (Q38)." });
  L.families.push({ id: "F-holgate", partners: ["P-betty", "P-thomash"], children: [] });
  const bt = P("P-betty");
  if (bt) bt.summary = "Aunt Betty: Betty (Termens) Holgate, Nana Feole's (Barbara's) older sister, a daughter of Joseph and Della Termens, so your great-grandmother's sister. Married Thomas Holgate; of Novi in 1997 (Katherine M. Springer's obituary names both sisters as her nieces). A Dave Holgate and a Rachel Denys Holgate were at the family's 2006 Christmas, and Rachel shares Joseph Termenas's photographs on Ancestry: very likely Betty's family (Q38).";
  L.askTable = [
    { who: "Grandma Laurie", why: "She knows the Seconder side first-hand.", ask: [
      { q: "Joann (Tania and Michelle's mom): how is she related to you? Your half-sister through your dad Bob Seconder, or your cousin (Aunt Betty Holgate's daughter)? What was her last name growing up?", ref: "Q38" },
      { q: "Your dad Bob Seconder: his full name (Robert H.?), and did he have other children?", ref: "H9" },
      { q: "Tim's and Michael's dads: their names, and the last names Tim and Michael use.", ref: "Q39" },
      { q: "Your mom, Nana Feole: born Barbara Termens in Detroit on 24 March 1933? Any photos of her with Joseph and Della?", ref: "Q19" } ] },
    { who: "Joe Seconder", why: "He put together the Termenas file that started this tree.", ask: [
      { q: "Aunt Betty Holgate's children: is Dave Holgate her son? Is Joann her daughter? Who is Rachel Denys Holgate?", ref: "Q38" },
      { q: "Your dad Bob: was he Robert H. Seconder (1931 to 2003), son of Wilbur Seconder?", ref: "H9" },
      { q: "Anything of Joseph and Della's beyond the file: photos, letters, where Della is buried.", ref: "Q9" },
      { q: "Who is who in your 2006 Christmas photo, left to right?", ref: "S-fb-xmas2006" } ] },
    { who: "Mom", why: "Both of her parents' families.", ask: [
      { q: "Grandpa Charles's brothers and sisters: their names, and where they live or lived.", ref: "Q39" },
      { q: "Grandpa's parents, Charles Sanders and Betty Flemming: when and where they died (their obituaries will list the whole family).", ref: "Q30" },
      { q: "Joann's last name, and how she is related to Grandma Laurie.", ref: "Q38" } ] },
    { who: "Tania", why: "Her own mother's side.", ask: [
      { q: "Your mom Joann's maiden name, and who her parents were.", ref: "Q38" } ] },
    { who: "Dad", why: "The Pavia and Kirkland side.", ask: [
      { q: "Where in Malta did great-grandpa Joseph Pavia and Grace (Lucretia Calleja) come from, and do you have any of their papers or photos?", ref: "Q33" },
      { q: "When and where did Grandpa Frank and Grandma Glenda marry? Their marriage record is the one Pavia record not online.", ref: "Q36" } ] }
  ];
  L.log.push({ id: "L32", date: "2026-11-26", by: "Claude", q: "Q38", where: "your message", terms: "Joann; Aunt Betty", result: "found", note: "Joann is living. Aunt Betty is Betty (Termens) Holgate, already in the tree; her husband Thomas Holgate added from Katherine Springer's 1997 obituary. The questions for the family are gathered in Kin under \"Ask at the table\"." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026: Joseph Termenas's Michigan World War I card (Archives of Michigan, the state's bonus cards), staged by Gemini,
   read by Claude at full size, both sides. A third document for his service number (C6), the dates he left and came back
   (which also correct the first reading of the taped-over line on his 1919 enlistment record), his first company, his
   promotion date, a Detroit address of about 1920-21, and his Michigan bonus claim, approved 18 Nov 1921. */
(function (L) {
  const E = (id) => L.events.find((e) => e.id === id), C = (id) => L.conflicts.find((c) => c.id === id), S = (id) => L.sources.find((s) => s.id === id);
  L.sources.push({ id: "S-mi-ww1", short: "Michigan WWI service card, 1920–21", kind: "derivative", year: 1921, img: ["mi-ww1-card"],
    cite: "War Department, Adjutant General's Office, statement of service card, Form No. 724-1½, A.G.O. (March 12, 1920), Termenas, Joseph M., furnished to the State of Michigan for its World War I bonus; Michigan claim no. 135359, approved 18 November 1921; \"World War I Veterans Personnel Cards\" (Michigan bonus cards, 1921–1932), Archives of Michigan (Michiganology); copy in the Kin Drive folder.",
    read: "Front: Termenas Joseph M; Army serial number typed \"180m338\"; White; residence 825 Vinewood Ave, Detroit, Michigan. Enlisted N.A., Columbus Bks, Ohio, Sept 20/17; born Russia, 24 4/12 yrs; organizations: Co E 25 Engrs to Oct 17/17, Co A 29 Engrs to disch; grades: Pvt 1/c Mch 1/19; engagements: none entered; wounds: none; served overseas Oct 31/17 to July 5/19 (the form asks for the dates of departure from and arrival in the United States); hon. disch. July 15/19 on demobilization; 0 per cent disabled. Reverse: printed conditions of use, War Department stamp, P. C. Harris, The Adjutant General; Michigan's stamp \"Claim No. 135 35 9 / Approved / Nov 18 1921\" (\"Disapproved\" struck through), initialled." });
  const en = S("S-enlist");
  if (en) en.read = en.read.replace("in France 10/11/17 (?) to 7/3/19 as read", "under battles: \"A.E.F. 10/31/17 – 7/5/19\" (partly under tape; first read as 10/11/17 to 7/3/19, corrected on 26 Nov 2026 against the Michigan card, which gives Oct 31/17 to July 5/19)");
  const MI = (value, note) => ({ src: "S-mi-ww1", value, info: "secondary", ev: "direct", ...(note ? { note } : {}) });
  const dv = E("E-devens");
  if (dv) {
    dv.date = { text: "24 Sep–31 Oct 1917", sort: "1917-09-24" };
    dv.conclusion = "At Camp Devens with the 25th Engineers from 24 September 1917: in Company E until 17 October, then in Company D, which became Company A, 29th Engineers, on 20 October 1917.";
    dv.assert.push(MI("Co E 25 Engrs to Oct 17/17; Co A 29 Engrs to disch"));
  }
  const sl = E("E-sail");
  if (sl) { sl.confidence = "proven"; sl.assert.push(MI("served overseas from Oct 31/17 (departure from the United States)")); }
  const ch = E("E-chaumont");
  L.events.push(
    { id: "E-pfc", type: "service", who: ["P-joseph"], date: { text: "1 Mar 1919", sort: "1919-03-01" }, place: "PL-langres",
      conclusion: "Made private first class on 1 March 1919, in France with Company A, 29th Engineers.", confidence: "probable",
      assert: [MI("Pvt 1/c Mch 1/19"), { src: "S-discharge", value: "Private 1st Class at discharge", info: "primary", ev: "indirect" }] },
    { id: "E-home1919", type: "service", who: ["P-joseph"], date: { text: "5 Jul 1919", sort: "1919-07-05" },
      conclusion: "Back in the United States on 5 July 1919, after 20 months overseas; the port is not on either record (a discharge at Camp Devens ten days later fits Boston).", confidence: "probable",
      assert: [MI("served overseas Oct 31/17 to July 5/19"), { src: "S-enlist", value: "A.E.F. 10/31/17 – 7/5/19", info: "primary", ev: "direct", note: "partly under tape" }] },
    { id: "E-res1921", type: "residence", who: ["P-joseph"], date: { text: "about 1920–21", sort: "1921-01-01" }, place: "PL-detroit",
      conclusion: "Lived at 825 Vinewood Avenue, Detroit, when Michigan's bonus office made out his card (about 1920–21): back in Detroit within two years of his discharge.", confidence: "probable",
      assert: [MI("residence 825 Vinewood Ave, Detroit, Michigan", "the address the bonus application gave")] },
    { id: "E-bonus", type: "bonus", who: ["P-joseph"], date: { text: "18 Nov 1921", sort: "1921-11-18" }, place: "PL-detroit",
      conclusion: "His Michigan World War bonus claim (no. 135359) was approved on 18 November 1921; the state paid $15 for each month of service, and he had served almost 22.", confidence: "proven",
      assert: [MI("Claim No. 135 35 9, Approved Nov 18 1921"), { src: "S-enlist", value: "\"Bonus certified for Michigan State\", notarized", info: "primary", ev: "direct" }] }
  );
  const c6 = C("C6");
  if (c6) c6.argument += " A third document agrees: his Michigan bonus card (1920–21) types the number as \"180m338\", the same six figures with a stray letter where a comma would fall.";
  if (ch) ch.assert.push(MI("Co A 29 Engrs to disch", "his company to the end; the card does not mention the detached service"));
  const jp = L.people.find((p) => p.id === "P-joseph");
  if (jp) jp.summary = jp.summary.replace("Naturalized at Boston on 14 July 1919 and discharged at Camp Devens the next day.", "Made private first class on 1 March 1919 and back in the United States on 5 July. Naturalized at Boston on 14 July 1919 and discharged at Camp Devens the next day. Back in Detroit by 1921 (825 Vinewood Avenue), where Michigan approved his veteran's bonus on 18 November 1921.");
  L.log.push({ id: "L33", date: "2026-11-26", by: "Claude", q: "Q18", where: "Archives of Michigan WWI bonus card (staged by Gemini in the Kin Drive folder; read at full size, both sides)", terms: "Termenas, Joseph M.", result: "found",
    note: "Service number 180338 confirmed by a third document (C6). Overseas 31 Oct 1917 to 5 Jul 1919, which also corrected the first reading of his enlistment record's taped line (10/31/17 – 7/5/19). First company: Co. E, 25th Engineers, to 17 Oct 1917. Private first class from 1 Mar 1919. 825 Vinewood Avenue, Detroit, about 1920–21. Michigan bonus claim 135359 approved 18 Nov 1921." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026 (Claude): the last 96 record pages Gemini staged are read (all 289 now have a verdict in
   pillars/kin/docs/staged-records.json). Six add to the tree: second readings of John Martin's 1741 will and William Martin's
   1745 will (Hathaway), a Pasquotank witness John Martin in January 1741/2, John Martin's house on Bennett's Creek in a
   1646 Lower Norfolk patent, and a William Pullam who patented 1,000 acres in New Kent County in 1657 (a lead for James
   Pulliam's family). The Holt, Llewellyn and Stith pages are set aside: those lines are not in this tree. Two 1950 census
   households for Charles and Elizabeth Sanders are kept as candidates for Q30, not attached. */
(function (L) {
  const S = (id) => L.sources.find((s) => s.id === id), Q = (id) => L.questions.find((q) => q.id === id);
  const add = (id, cite, read) => { const s = S(id); if (s) { s.cite += cite; s.read += read; } };
  add("S-grimes-jmartin-1741", " Also J. R. B. Hathaway, North Carolina Historical and Genealogical Register, vol. 1, p. 62 (page staged by Gemini).",
    " Hathaway's own abstract (no dates printed) gives the same children, \"Elliner Bryant\" among them, and calls John Morgan and Thomas Jessop his sons-in-law.");
  add("S-bath-martins", " Hathaway, vol. 1, p. 348 (William Martin, continued).",
    " Hathaway's reading of William Martin's 1745 will adds his wife Mary, Ann and Joseph Jones, a cousin Henry Snead, and a third witness, Henry Woodard.");
  add("S-albemarle-martins", " Hathaway, vol. 1, p. 508 (Augustine Wright).",
    " Hathaway dates Augustine Wright's will 27 January 1741/2 (proved April Court 1742), witnessed by John Martin and John Browne: the month John Martin's own will was proved, so this witness is most likely his son John.");
  add("S-lnva-jmartin", " Nell Marion Nugent, Cavaliers and Pioneers, vol. 1 (1934), p. 162 (Lancaster Lovett's patent; page staged by Gemini).",
    " Lancaster Lovett's 300 acres in Lower Norfolk County, patented 1 October 1646, begin \"at an island to the Westward of John Martin's house where Bennets Cr. divides itself into 3 branches\": John Martin had a house in the county by 1646, the year he signed as a Lynnhaven churchwarden, and Lovett's will of 1673 still bounds land \"next Martin\" (McIntosh, p. 45).");
  L.sources.push({ id: "S-newkent-pullam-1657", short: "William Pullam's New Kent County patent, 1657 (Nugent's abstracts)", kind: "derivative", year: 1657,
    cite: "Nell Marion Nugent, Cavaliers and Pioneers: Abstracts of Virginia Land Patents and Grants, vol. 1 (Richmond, 1934), p. 359 (Patent Book 4, p. 147: William Pullam) and p. 476 (Patent Book 5, p. 307: Peter Adams); pages staged by Gemini in the Kin Drive folder.",
    read: "Read by Claude on 26 Nov 2026: \"WILLIAM PULLAM, 1000 acs. New Kent Co., 20 Jan. 1657 ... On S. side of York Riv. & N. W. side of Black Cr., beg. at Southermost cor. of land surveyed for Mr. Joseph Croshawe. Trans. of 20 pers\", among them \"Elliz. Pullum\". Peter Adams's 594 acres in New Kent (18 March 1662) include land \"Purchased of Wm. Pullam out of a grand pattern of 1000 acs. granted 20 Jan. 1657.\" Hanover County, where John Pulliam made his will in 1734/5 naming a son James (S-hanover-1734), was formed from New Kent in 1720. A lead for the family of this tree's James Pulliam (born 1726), not a link." });
  if (!Q("Q41")) L.questions.push({ id: "Q41", p: 3, person: "P-jpulliam", q: "James Pulliam (1726 to 1799): who were his parents? John Pulliam's Hanover will (1734/5) names a son James, and a William Pullam patented 1,000 acres on Black Creek in New Kent County (later Hanover) in 1657. Hanover's own records were largely lost in 1865, so the trail runs through St. Paul's Parish, the Virginia land office and his own later records in Lunenburg (deeds or a militia list naming where he came from).", sources: "Virginia land patents and grants (Library of Virginia); St. Paul's Parish vestry book (Hanover); Lunenburg County deeds and order books, 1746-1770", task: "KIN-GEM-54" });
  const q30 = Q("Q30");
  if (q30) q30.q += " Two 1950 census households in Wayne County fit the names, neither proven: Charles L. Sanders (33, born Tennessee) and Elizabeth M. (31) in Dearborn, and Charles D. Sanders (23, born Indiana) and Elizabeth M. (21) in the city of Wayne. Your grandfather's birth year and place, or the Sanders–Flemming marriage record, would tell which, if either.";
  const mom = (L.askTable || []).find((g) => g.who === "Mom");
  if (mom && !mom.ask.some((a) => a.ref === "Q30")) mom.ask.splice(1, 0, { q: "Grandpa's dad: was he from Tennessee or Indiana? And Grandpa's mom, Betty Flemming: was her name Elizabeth? (Two 1950 Charles and Elizabeth Sanders couples lived in Dearborn and Wayne.)", ref: "Q30" });
  L.log.push(
    { id: "L34", date: "2026-11-26", by: "Claude", q: "", where: "the last 96 record pages Gemini staged in the Kin Drive folder (Hathaway's Register, Nugent's Cavaliers and Pioneers, Hening, the Journals of the House of Burgesses, Hotten, the St. Peter's Parish register, Crozier, McIntosh, the William and Mary Quarterly)", terms: "Martin, Bryant, Turner, Davis, Patterson, Holt, Llewellyn, Stith, Pulliam", result: "found",
      note: "All 289 staged record pages now have a verdict (40 sources, 249 set aside). New in this batch: Hathaway's readings of John Martin's 1741 and William Martin's 1745 wills, a John Martin witness in Pasquotank in January 1741/2 (most likely his son), John Martin's house on Bennett's Creek in 1646, and William Pullam's 1657 New Kent patent (Q41). The Holt, Llewellyn and Stith pages belong to lines this tree does not hold. Two index pages point to Keelings in the William and Mary Quarterly (vol. 21, pp. 52, 152, 251; vol. 22, p. 122); read in the Internet Archive's text, they are later Keelings of New Kent and Hanover (George Keeling, a New Kent justice, in 1715; John Keeling of Granville County, N.C., in a 1786 deed), not Thomas Keeling's Lower Norfolk family." },
    { id: "L35", date: "2026-11-26", by: "Claude", q: "Q30", where: "1950 census pages Gemini staged (Dearborn ED 84-92, sheet 13; city of Wayne ED 82-264, sheet 8)", terms: "Charles and Elizabeth Sanders, Wayne County", result: "candidate",
      note: "Two couples named Charles and Elizabeth M. Sanders in Wayne County in April 1950 (Gemini's certainty 20-25%). Neither page names a Flemming; kept as candidates until your grandfather's birth year and place can test them." });
})(window.KIN_LINEAGE);

/* 26 Nov 2026 (Claude): Q40. Chester Berry's Loss of the Sultana (1892), read in full in the Internet Archive's text: Peter
   Culberson is in none of its three lists. Most likely he was not aboard; his compiled service record is still the proof. */
(function (L) {
  L.sources.push({ id: "S-berry-1892", short: "Chester D. Berry, Loss of the Sultana and Reminiscences of Survivors (1892)", kind: "derivative", year: 1892,
    url: "https://archive.org/details/lossofsultanarem00berr",
    cite: "Chester D. Berry, Loss of the Sultana and Reminiscences of Survivors (Lansing, Mich., 1892), pp. 383-418 (\"Official List of Exchanged Prisoners on the Boat\"), 418-419 (\"Persons Known to have been on Board but Not Reported in the Official List\") and 420 ff. (\"Name, Company, Regiment, and Present Postoffice ... of those Living\"); read from the Internet Archive's full text.",
    read: "Read by Claude on 26 Nov 2026: no Culberson (or Culbertson, Colberson or any near spelling) in any of the three lists. The official list names about 300 men of the 3rd Tennessee Cavalry, some 30 of them in Company F (Peter's company), from Sgt. F. J. Allen to N. G. Williams; the not-reported list adds four more of Company F (John and R. N. Hamilton, Wiley J. Hodges, Cpl. H. C. Jones); the 1892 list of the living has 51 men of the regiment. Negative evidence from an incomplete official list, but it points to Peter not being aboard." });
  const q = L.questions.find((x) => x.id === "Q40");
  if (q) q.q = "Peter Culberson's capture and parole: his compiled service record and pension file give the date and place he was taken (Athens or the Sulphur Branch trestle, September 1864), how long he was at Cahaba, and when and how he went north. He is not in any of the Sultana lists in Berry's 1892 book (L36), so he was most likely not aboard; the service record would settle it.";
  const pc = L.people.find((p) => p.id === "P-peterc");
  if (pc && !pc.summary.includes("Sultana")) pc.summary = pc.summary.replace("prisoner at Cahaba;", "prisoner at Cahaba (not on any of the Sultana lists in Berry's 1892 book, so most likely not aboard);");
  L.log.push({ id: "L36", date: "2026-11-26", by: "Claude", q: "Q40", where: "Chester D. Berry, Loss of the Sultana (1892), Internet Archive full text", terms: "Culberson and variants; company F, 3d Tennessee cavalry", result: "not found",
    note: "Peter is not on the official list of exchanged prisoners aboard (about 300 of the 3rd Tennessee Cavalry, some 30 of Company F), not among those known aboard but left off it, and not among the survivors living in 1892. Most likely he was not on the Sultana." });
})(window.KIN_LINEAGE);

/* 27 Nov 2026, Thanksgiving night (owner, eleven messages): Grandpa Charles's own family. His older brother Rick, younger
   brother Juny and one sister, Sharon (her daughter is Angie); Rick, Charles and Juny each had a different father, and Juny
   and Sharon may share one. Grandpa was raised in Buford, Georgia, and for the most part in Detroit, on West Grand Boulevard by
   Henry Ford Hospital. His mother Betty was a Flemming by marriage and, the owner thinks, a Coggins by birth; her mother's second
   husband was Clyde, and a Randy Coggins may have been her brother. All of it is the family's word: no dates or towns are given
   for the living, and every link that is a guess is drawn as one (the family's "uncertain" notes). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), Q = (id) => L.questions.find((q) => q.id === id), Fm = (id) => L.families.find((f) => f.id === id);
  L.sources.push({ id: "S-owner-1127", short: "Your account of Grandpa Charles's family (27 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, eleven messages to Claude, 27 November 2026 (Thanksgiving night, with the family).",
    read: "Charles, your grandfather, has an older brother Rick and a younger brother Juny, and one sister, Sharon, whose daughter is Angie. Rick, Charles and Juny had different fathers; Juny and Sharon may have had the same one. He was raised in Buford, Georgia, and for the most part on West Grand Boulevard in Detroit, by Henry Ford Hospital. Betty's mother's second husband was named Clyde. Flemming is Betty's married name; Coggins was her maiden name, you think. Possibly a Randy Coggins, who might have been Betty's brother. Cumming, Georgia had no Black residents when he was there." });
  const S1 = ["S-owner-1127"];
  L.people.push(
    { id: "P-rick", sex: "M", status: "family", names: [{ given: "Rick", surname: "", type: "as-given", src: S1, note: "his surname is not known yet" }],
      summary: "Grandpa Charles's older brother (your account). His father was not Charles's: Betty's children had different fathers. His full name and surname are still to be asked (Q39)." },
    { id: "P-juny", sex: "M", status: "family", names: [{ given: "Juny", surname: "", type: "as-given", src: S1, note: "a family name for him (Junior?); his given name and surname are not known yet" }],
      summary: "Grandpa Charles's younger brother (your account). A different father from Charles's and Rick's; he and Sharon may have had the same one." },
    { id: "P-sharon", sex: "F", status: "family", names: [{ given: "Sharon", surname: "", type: "as-given", src: S1, note: "her surname is not known yet" }],
      summary: "Grandpa Charles's only sister (your account); her daughter is Angie. She may have had the same father as Juny. Because Grandpa had one sister, Joann (Tania's mother) is not his sister: Tania belongs on Grandma Laurie's side, as Q38 already has it." },
    { id: "P-angie", sex: "F", status: "family", names: [{ given: "Angie", surname: "", type: "as-given", src: S1, note: "her surname is not known yet" }],
      summary: "Sharon's daughter (your account), so your mother's first cousin on Grandpa Charles's side." },
    { id: "P-bettymom", sex: "F", status: "placeholder", placeholder: "Betty's mother", hint: "married second a man named Clyde", names: [],
      summary: "Grandpa Charles's grandmother on his mother's side. Her name is not known yet; the family remembers that her second husband was named Clyde (your account), so Coggins was most likely her first husband's surname, Betty's father's." },
    { id: "P-clyde", sex: "M", status: "family", names: [{ given: "Clyde", surname: "", type: "as-given", src: S1, note: "his surname is not known yet" }],
      summary: "Betty's mother's second husband (your account): Grandpa Charles's step-grandfather." },
    { id: "P-randy", sex: "M", status: "family", names: [{ given: "Randy", surname: "Coggins", type: "as-given", src: S1, note: "remembered with a \"possibly\"" }],
      summary: "Possibly Betty's brother (your account: \"Randy might have been Betty's brother\"), which would make him Grandpa Charles's uncle. Kept as a guess until a record or a relative confirms him." });
  L.families.push(
    { id: "F-betty-rick", partners: ["P-bettyf"], children: ["P-rick"] },
    { id: "F-betty-juny", partners: ["P-bettyf"], children: ["P-juny", "P-sharon"], uncertain: { "P-sharon": "Sharon may have had the same father as Juny, or her own (your account)" } },
    { id: "F-sharon", partners: ["P-sharon"], children: ["P-angie"] },
    { id: "F-coggins", partners: ["P-bettymom"], children: ["P-bettyf", "P-randy"], uncertain: { "P-randy": "Randy Coggins might have been Betty's brother (your account)" } },
    { id: "F-bettymom-clyde", partners: ["P-bettymom", "P-clyde"], children: [] });
  const bf = P("P-bettyf");
  if (bf) {
    bf.names = [{ given: "Betty", surname: "Coggins", type: "birth", src: S1, note: "her maiden name, as you remember it (\"I think\")" },
      { given: "Betty", surname: "Flemming", type: "married", src: ["S-babybook", "S-owner-1127"], note: "the name in your baby book: a married name (your account)" }];
    bf.summary = "Grandpa Charles's mother: Betty Flemming in your baby book, a married name; born a Coggins, you think. Her children Rick, Charles (by Charles Sanders), Juny and Sharon had different fathers, though Juny and Sharon may share one. Her mother married a second time, to a man named Clyde, and a Randy Coggins may have been her brother. Grandpa grew up first in Buford, Georgia, so her own family is most likely from north Georgia; her marriages and her parents are Q30 and Q42.";
  }
  const ch = P("P-charles");
  if (ch) ch.summary = "Your mother's father. Raised in Buford, Georgia, and for the most part in Detroit, on West Grand Boulevard by Henry Ford Hospital (your account, 27 Nov 2026). He has an older brother, Rick, a younger brother, Juny, and one sister, Sharon (her daughter is Angie); the three brothers had different fathers. He remembers Cumming, Georgia, the next county seat over, having no Black residents at all when he was there: the family story \"Grandpa Charles: Buford to West Grand Boulevard\" tells why.";
  const cs = P("P-charles-sr");
  if (cs) cs.summary = "Charles A. Sanders's father, from your baby book's family tree: Betty's husband and the father of Charles alone among her children (your account, 27 Nov 2026). Whether he was from Tennessee or Indiana, and where he and Betty married (Georgia or Michigan), is Q30.";
  L.hypotheses.push({ id: "H11", text: "Flemming, Betty's name in your baby book, was the surname of her last husband, most likely Juny's father (and Sharon's, if they share one): Juny, the youngest boy, would then have been born a Flemming.", test: "Q42" });
  const q39 = Q("Q39");
  if (q39) q39.q = "Grandpa Charles's brothers Rick and Juny and his sister Sharon (Angie's mother) are now in the tree from your account (27 Nov 2026). Still open: their full names and surnames (each had a different father), whether Juny is short for Junior, and the fathers of your uncles Tim and Michael, with their surnames.";
  const q30 = Q("Q30");
  if (q30) q30.q += " New (27 Nov 2026): Grandpa was raised in Buford, Georgia, before Detroit, and Betty was born a Coggins, you think, so the Sanders–Coggins marriage and Grandpa's birth may be in Georgia (Gwinnett, Hall or Forsyth County) rather than Michigan.";
  if (!Q("Q42")) L.questions.push({ id: "Q42", p: 2, person: "P-bettyf", q: "Betty (Coggins) Flemming: her birth and parents (her mother's second husband was named Clyde), her marriages (to Rick's father, to Charles Sanders, and to a Mr. Flemming?), whether Randy Coggins was her brother, and when she moved from Buford, Georgia, to Detroit. Her obituary or death record would name all four children.", sources: "Georgia marriage records (Gwinnett, Hall and Forsyth counties); 1950 census, Gwinnett County, Georgia; Michigan marriages and deaths; obituaries (Betty Flemming or Fleming); you and your mother", task: "KIN-GEM-55" });
  const mom = (L.askTable || []).find((g) => g.who === "Mom");
  if (mom) {
    const i = mom.ask.findIndex((a) => a.ref === "Q39");
    const nq = { q: "Grandpa's brothers Rick and Juny and his sister Sharon: their last names, and is Juny short for Junior? Angie's last name?", ref: "Q39" };
    if (i >= 0) mom.ask[i] = nq; else mom.ask.unshift(nq);
    mom.ask.push({ q: "Grandma Betty: was she born a Coggins? Her mother's name, Clyde's last name, and was Randy Coggins her brother?", ref: "Q42" },
      { q: "When did Grandpa's family leave Buford, Georgia, for Detroit, and why (work at Ford or the hospital)? Who did they know there?", ref: "Q42" });
  }
  L.log.push({ id: "L37", date: "2026-11-27", by: "Claude", q: "Q39", where: "your messages (Thanksgiving night)", terms: "Grandpa Charles's brothers and sister; Betty's family", result: "found",
    note: "Added Rick, Juny, Sharon and Angie, Betty's mother (to name) and her second husband Clyde, and Randy Coggins as a possible brother of Betty; Betty's names are now Coggins (birth, you think) and Flemming (married). Q42 and Gemini's task KIN-GEM-55 look for her records in Georgia and Michigan. Grandpa having one sister settles that Joann is not his sister." });
})(window.KIN_LINEAGE);

/* 27 Nov 2026 (owner): Jeffrey Hinkle's own family. His parents are Stanley Joseph Hinkle and Jeanette Elizabeth Hinkle, and
   they had five children: Patrick ("Patty"), Jennifer, Cynthia ("Cindy"), Jeffrey Anthony and his twin brother Joseph Stanley.
   They are your sisters Jessica's and Samantha's grandparents, aunts and uncles; not your blood relatives. The family's word
   only: an obituary search for both parents (27 Nov) found nothing, and no dates or towns are given. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id);
  L.sources.push({ id: "S-owner-1127b", short: "Your account of Jeffrey Hinkle's family (27 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 27 November 2026.",
    read: "Jeffrey Anthony Hinkle's dad is Stanley Joseph Hinkle and his mom is Jeanette Elizabeth Hinkle. They have 5 kids: Patrick aka Patty, Jennifer, Cynthia aka Cindy, and Jeff's twin brother Joseph Stanley." });
  const S1 = ["S-owner-1127b"];
  const nm = (given, surname, type, note) => Object.assign({ given, surname, type, src: S1 }, note ? { note } : {});
  L.people.push(
    { id: "P-stanleyh", sex: "M", status: "family", names: [nm("Stanley Joseph", "Hinkle", "birth")],
      summary: "Jeffrey Hinkle's father, so your sisters Jessica's and Samantha's grandfather (your account). Five children: Patrick, Jennifer, Cynthia, and the twins Jeffrey and Joseph Stanley, who carries his names the other way round." },
    { id: "P-jeanetteh", sex: "F", status: "family", names: [nm("Jeanette Elizabeth", "Hinkle", "married", "her name by marriage; her maiden name is not known yet")],
      summary: "Jeffrey Hinkle's mother, so Jessica's and Samantha's grandmother (your account). Your sister Jessica Elizabeth shares her middle name." },
    { id: "P-pattyh", sex: "M", status: "family", names: [nm("Patrick", "Hinkle", "birth"), nm("Patty", "Hinkle", "as-used", "what the family calls him")],
      summary: "Jeffrey Hinkle's brother (your account): Jessica's and Samantha's uncle." },
    { id: "P-jenniferh", sex: "F", status: "family", names: [nm("Jennifer", "Hinkle", "birth", "her surname by birth; a married name is not known")],
      summary: "Jeffrey Hinkle's sister (your account): Jessica's and Samantha's aunt. (Not your aunt Jennifer Sanders, nor your father's sister Jennifer Burd.)" },
    { id: "P-cindyh", sex: "F", status: "family", names: [nm("Cynthia", "Hinkle", "birth", "her surname by birth; a married name is not known"), nm("Cindy", "Hinkle", "as-used", "what the family calls her")],
      summary: "Jeffrey Hinkle's sister (your account): Jessica's and Samantha's aunt." },
    { id: "P-josephsh", sex: "M", status: "family", names: [nm("Joseph Stanley", "Hinkle", "birth")],
      summary: "Jeffrey Hinkle's twin brother (your account), named for their father Stanley Joseph the other way round: Jessica's and Samantha's uncle." });
  L.families.push({ id: "F-hinkle-sr", partners: ["P-stanleyh", "P-jeanetteh"], children: ["P-pattyh", "P-jenniferh", "P-cindyh", "P-jhinkle", "P-josephsh"] });
  const jh = P("P-jhinkle");
  if (jh) {
    jh.names = [nm("Jeffrey Anthony", "Hinkle", "birth")].concat(jh.names.map((n) => Object.assign({}, n, { type: n.type === "birth" ? "as-used" : n.type })));
    jh.summary = "Your mother's ex-husband; the father of your sisters Jessica and Samantha. The son of Stanley Joseph and Jeanette Elizabeth Hinkle, one of five children, with a twin brother, Joseph Stanley (your account, 27 Nov 2026).";
  }
  L.log.push({ id: "L38", date: "2026-11-27", by: "Claude", q: "", where: "your message; the open web (obituary search)", terms: "Stanley Joseph Hinkle; Jeanette Elizabeth Hinkle", result: "added from your account",
    note: "Jeffrey Hinkle's parents and his four brothers and sisters added, twins noted. No obituary for either parent was found on 27 Nov 2026, so there are no dates; they are Jessica's and Samantha's family, not your blood relatives." });
})(window.KIN_LINEAGE);

/* 27 Nov 2026, Grandma Laurie's answers (relayed by the owner). Betty and Barbara are sisters. Joanne (with an e) is Betty
   Holgate's daughter, so Q38 is settled: Tania and Michelle descend from Aunt Betty, not from Bob Seconder. Betty's other child,
   Kathy, died recently. David Holgate's wife is Rachel; their children are Ryan and Sara. Laurie's father was Robert ("the H
   unknown"). Barbara was Barbara Josephine Termens, born 24 March 1933 as the records say; Della was born in 1905 or 1906.
   Laurie met Grandpa Charles's mother Betty's parents in Georgia (names not remembered). Tim's father is David Wayne Atkins (Tim
   John Atkins; married Brittany); Michael James Jordan's father is Gerald "Jerry" Lynn Jordan, who later married Patricia
   ("Patty"). Laurie married Charles in Oakland County in 1973; the family lived in Mississippi for about a year, where Tim was
   born. The living's exact birth dates are kept in a private note in the owner's Drive (Kin folder), not here. */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), Q = (id) => L.questions.find((q) => q.id === id), Fm = (id) => L.families.find((f) => f.id === id);
  L.sources.push({ id: "S-laurie-1127", short: "Grandma Laurie's answers (Thanksgiving 2026, through you)", kind: "authored", year: 2026,
    cite: "Laurie (Seconder) Jordan, answers at Thanksgiving, relayed by Joseph Pavia in a message to Claude, 27 November 2026.",
    read: "Betty and Barbara are sisters. Joanne (with an e) is Betty's daughter; Betty's other child is Kathy, who recently passed away. Bob was Robert (the H not known). Barbara Josephine Termens, birth date correct (24 March 1933). Della was born 1905 or 1906. Rachel Holgate is David's wife; their children are Ryan and Sara. Betty's parents (Grandpa Charles's mother) unknown, but Laurie met them in Georgia. Tim's father is David Wayne Atkins; Tim's surname is Atkins, his middle name John; he married Brittany (spelling not sure). Michael James Jordan's father is Gerald \"Jerry\" Lynn Jordan, who remarried Patricia (\"Patty\"). Laurie married Charles in Oakland County in 1973. When Toni was about five they lived in Mississippi for about a year; Tim was born there." });
  const S1 = ["S-laurie-1127"];
  const nm = (given, surname, type, note) => Object.assign({ given, surname, type, src: S1 }, note ? { note } : {});
  const add = (arr, x) => { if (!arr.includes(x)) arr.push(x); };

  /* Aunt Betty's family: Joanne moves from Bob Seconder to Betty and Thomas Holgate; Kathy; David's family */
  const fb = Fm("F-bob-joann"); if (fb) fb.children = fb.children.filter((c) => c !== "P-tania-mom");
  L.families.splice(L.families.findIndex((f) => f.id === "F-bob-joann"), fb && !fb.children.length ? 1 : 0);
  const fh = Fm("F-holgate");
  const jo = P("P-tania-mom");
  if (jo) {
    jo.names = [nm("Joanne", "Holgate", "birth", "spelled with an e (Laurie); her surname at birth as Betty and Thomas Holgate's daughter; her married surname is not known yet")]
      .concat(jo.names.map((n) => Object.assign({}, n, { type: "as-given", note: "how you first wrote it" })));
    jo.summary = "Joanne, Aunt Betty Holgate's daughter (Grandma Laurie, 27 Nov 2026), so your grandmother Laurie's first cousin. Her daughters are Tania and Michelle. Her sister was Kathy, who died recently. Her married surname is still to be asked.";
  }
  L.people.push(
    { id: "P-kathyh", sex: "F", status: "family", names: [nm("Kathy", "Holgate", "birth", "her surname at birth; a married name is not known")],
      summary: "Aunt Betty Holgate's other daughter, Joanne's sister; she died recently (Grandma Laurie, 27 Nov 2026). Her obituary, when found, should name Betty, Thomas, Joanne and her own family (Q43)." },
    { id: "P-davidh", sex: "M", status: "family", names: [nm("David", "Holgate", "birth"), Object.assign(nm("Dave", "Holgate", "as-used"), { src: ["S-fb-xmas2006"] })],
      summary: "Dave Holgate, at the 2006 family Christmas. His wife is Rachel; their children are Ryan and Sara (Grandma Laurie). How he descends from Aunt Betty is not settled: Laurie named Joanne and Kathy as Betty's children, so he may be a grandson, or Thomas Holgate's son (Q43). Drawn under Betty and Thomas as a question." },
    { id: "P-rachelh", sex: "F", status: "family", names: [Object.assign(nm("Rachel Denys", "Holgate", "married", "her married name; at the 2006 family Christmas and sharing Joseph Termenas's photographs on Ancestry"), { src: ["S-laurie-1127", "S-fb-xmas2006"] })],
      summary: "David Holgate's wife (Grandma Laurie), the mother of Ryan and Sara. She shares Joseph Termenas's photographs on Ancestry." },
    { id: "P-ryanh", sex: "M", status: "family", names: [nm("Ryan", "Holgate", "birth")], summary: "David and Rachel Holgate's son (Grandma Laurie)." },
    { id: "P-sarah", sex: "F", status: "family", names: [nm("Sara", "Holgate", "birth")], summary: "David and Rachel Holgate's daughter (Grandma Laurie)." });
  if (fh) { add(fh.children, "P-tania-mom"); add(fh.children, "P-kathyh"); add(fh.children, "P-davidh");
    fh.uncertain = Object.assign(fh.uncertain || {}, { "P-davidh": "Betty's son, grandson, or Thomas's son? Laurie named only Joanne and Kathy as Betty's children (Q43)" }); }
  L.families.push({ id: "F-davidh", partners: ["P-davidh", "P-rachelh"], children: ["P-ryanh", "P-sarah"] });
  const ft = Fm("F-termenas"); if (ft && ft.uncertain) delete ft.uncertain["P-betty"];
  const bt = P("P-betty");
  if (bt) { bt.names.unshift(nm("Betty", "Termens", "birth", "Barbara's sister, so born a Termens (Grandma Laurie)"));
    bt.summary = "Aunt Betty: Betty (Termens) Holgate, Nana Feole's (Barbara's) sister (Grandma Laurie confirms it), a daughter of Joseph and Della Termens, so your great-grandmother's sister. Married Thomas Holgate; of Novi in 1997 (Katherine M. Springer's obituary names both sisters as her nieces). Her daughters are Joanne (Tania and Michelle's mother) and Kathy, who died recently; David Holgate, whose wife is Rachel, is family too, his link still to be asked."; }
  const th = P("P-thomash"); if (th) { delete th.living; th.summary = "Aunt Betty's husband: \"Betty (Thomas) Holgate of Novi\" in Katherine M. Springer's 1997 obituary. Their daughters are Joanne and Kathy (Grandma Laurie)."; }

  /* Laurie's parents and grandparents */
  const bob = P("P-bob");
  if (bob) { bob.names.unshift(nm("Robert", "Seconder", "birth", "Laurie: Robert, yes; the middle initial H (in the hypothesis H9) she does not know"));
    bob.summary = "Laurie's father, Robert (Bob) Seconder (Grandma Laurie): Barbara's first husband. Whether he is the Robert H. Seconder of 1931 to 2003 in hypothesis H9 is still open; Laurie confirms the Robert but not the H."; }
  const gm = P("P-ggm");
  if (gm) { const b = gm.names.find((n) => n.given === "Barbara Josephine" && n.surname === "Termens"); if (b) { b.src = b.src.concat(S1); b.note = "her name at birth: Grandma Laurie confirms it (27 Nov 2026), as does an Ancestry member's tree"; } }
  const eb = L.events.find((e) => e.id === "E-birth-ggm");
  if (eb) { eb.assert.push({ src: "S-laurie-1127", value: "Barbara Josephine Termens; the birth date 24 March 1933 is correct (her daughter Laurie)", info: "secondary", ev: "direct" }); eb.confidence = "proven"; }
  const de = P("P-della");
  if (de) de.summary += " Grandma Laurie remembers her born in 1905 or 1906, which agrees with her age in the 1950 census (45, born in Oklahoma); the 1922 marriage index gives her age as 21, which would put her birth about 1901: she may have given an older age to marry (Q44).";

  /* Laurie's sons' fathers; Laurie and Charles */
  const tm = P("P-timm");
  if (tm) { tm.names = [nm("Tim John", "Atkins", "birth", "Tim, middle name John (Laurie); Tim may be short for Timothy")];
    tm.summary = "Your mother's brother: Tim Atkins, Laurie's son with David Wayne Atkins, born in Mississippi while the family lived there for about a year (Grandma Laurie). Married Brittany. Not Tim Burd."; }
  const mi = P("P-michael");
  if (mi) { mi.names = [nm("Michael James", "Jordan", "birth")];
    mi.summary = "Your mother's brother: Michael James Jordan, Laurie's son with Gerald \"Jerry\" Lynn Jordan (Grandma Laurie)."; }
  L.people.push(
    { id: "P-datkins", sex: "M", status: "family", names: [nm("David Wayne", "Atkins", "birth")], summary: "Tim's father (Grandma Laurie): Laurie's partner after Charles A. Sanders. Whether they married is still to be asked." },
    { id: "P-jerryj", sex: "M", status: "family", names: [nm("Gerald Lynn", "Jordan", "birth"), nm("Jerry", "Jordan", "as-used")], summary: "Michael's father, Gerald \"Jerry\" Lynn Jordan (Grandma Laurie): Laurie's husband, whose surname she took, and later husband of Patricia (\"Patty\")." },
    { id: "P-pattyj", sex: "F", status: "family", names: [nm("Patricia", "Jordan", "married", "her married name; her own surname is not known"), nm("Patty", "Jordan", "as-used")], summary: "Jerry Jordan's later wife (Grandma Laurie)." },
    { id: "P-brittany", sex: "F", status: "family", names: [nm("Brittany", "Atkins", "married", "the spelling of Brittany is not sure (Laurie)")], summary: "Tim Atkins's wife (Grandma Laurie)." });
  const fT = Fm("F-gp-tim"); if (fT) { add(fT.partners, "P-datkins"); fT.ended = true; }
  const fM = Fm("F-gp-michael"); if (fM) { add(fM.partners, "P-jerryj"); fM.ended = true; }
  L.families.push({ id: "F-jerry-patty", partners: ["P-jerryj", "P-pattyj"], children: [] }, { id: "F-tim", partners: ["P-timm", "P-brittany"], children: [] });
  L.events.push({ id: "E-marr-gp", type: "marriage", who: ["P-charles", "P-gp"], date: { text: "1973", sort: "1973" },
    conclusion: "Laurie Seconder married Charles A. Sanders in Oakland County, Michigan, in 1973 (Grandma Laurie). The marriage record is the way into Charles's parents (Q30, Q42).", confidence: "family",
    assert: [{ src: "S-laurie-1127", value: "married Charles in Oakland County in 1973", info: "primary", ev: "direct" }] });
  const fg = Fm("F-gp"); if (fg) { fg.events = (fg.events || []).concat("E-marr-gp"); fg.ended = true; }
  const gp = P("P-gp");
  if (gp) gp.summary = "Your mother's mother: born Laurie G. Seconder, the daughter of Robert (Bob) Seconder and Barbara Termens; later Laurie Jordan. Married Charles A. Sanders in Oakland County in 1973: your mother Toni and Jennifer. Then Tim Atkins (with David Wayne Atkins), born while the family lived in Mississippi for about a year, and Michael Jordan (with Gerald \"Jerry\" Lynn Jordan). Her brother Joe Seconder compiled the Termens research that seeded this tree.";

  /* Grandpa Charles's mother's parents: Laurie met them in Georgia */
  const bm = P("P-bettymom"); if (bm) bm.summary += " Grandma Laurie met Betty's parents in Georgia, though she does not remember their names (27 Nov 2026): Betty's mother was still there in Laurie's time.";
  const q42 = Q("Q42"); if (q42) q42.q += " Laurie met Betty's parents in Georgia, so they lived there in the 1970s; the 1973 Oakland County marriage of Charles and Laurie should give Charles's birthplace and perhaps his parents.";

  /* questions: Q38 settled; what is left */
  const q38 = Q("Q38");
  if (q38) q38.q = "Settled by Grandma Laurie (27 Nov 2026): Joanne is Aunt Betty Holgate's daughter, so Tania and Michelle are Betty's granddaughters. Still open: Joanne's married surname and Tania and Michelle's father.";
  const q19 = Q("Q19"); if (q19) q19.q = "Barbara Josephine Termens, born 24 March 1933: confirmed by Laurie. Still to ask: where exactly she was born, and the years of her marriages to Bob Seconder and Mel Feole.";
  L.questions.push(
    { id: "Q43", p: 2, person: "P-kathyh", q: "Kathy Holgate, Aunt Betty's daughter, died recently: her married name and her obituary (it will name Betty and Thomas, Joanne, and her own children), and how David Holgate (Rachel's husband, father of Ryan and Sara) descends from Betty: son, grandson, or Thomas's son?", sources: "recent Michigan obituaries (funeral homes, Legacy); Grandma Laurie; Joe Seconder" },
    { id: "Q44", p: 3, person: "P-della", q: "Della's real birth year: Laurie says 1905 or 1906 and the 1950 census says 45 (born Oklahoma), but the 1922 marriage index makes her 21. Her death record, Social Security record or the 1930 and 1940 censuses decide it; if she was 16 or 17 in 1922, the Brooklyn certificate may show a parent's consent.", sources: "1930 and 1940 censuses (Detroit); her death record and grave; the 1922 Brooklyn certificate (Q5)" });
  /* the table: Laurie's own list, renewed */
  const lt = (L.askTable || []).find((g) => g.who === "Grandma Laurie");
  if (lt) lt.ask = [
    { q: "Joanne's married name, and Tania and Michelle's dad?", ref: "Q38" },
    { q: "Kathy: her married name, when and where she died, and her children?", ref: "Q43" },
    { q: "David Holgate: is he Aunt Betty's son, Kathy's or Joanne's son, or Thomas Holgate's son from before?", ref: "Q43" },
    { q: "Your dad Robert: where was he born, who were his parents, and did he have brothers and sisters? Were Tammy and Jack Seconder his children with a later wife?", ref: "H9" },
    { q: "Della: where was she from (Oklahoma?), when did she die and where is she buried? Was Katherine Springer her sister?", ref: "Q44" },
    { q: "Betty Coggins's parents in Georgia: which town, and do you remember anything about them (a farm, a church, Clyde)?", ref: "Q42" },
    { q: "You and David Atkins: were you married? Where in Mississippi did you live, and where is David from?", ref: "Q39" }];
  L.log.push({ id: "L39", date: "2026-11-27", by: "Claude", q: "Q38", where: "Grandma Laurie's answers, through you", terms: "Holgates, Seconder, Termens, Atkins, Jordan", result: "found",
    note: "Joanne is Aunt Betty Holgate's daughter (Q38 settled); Kathy, David, Rachel, Ryan and Sara Holgate added; Robert Seconder; Barbara Josephine Termens's birth confirmed; Della born 1905-06 by Laurie (Q44 on her 1922 age); Tim John Atkins and his father David Wayne Atkins, Michael James Jordan and his father Gerald Lynn Jordan, Patty and Brittany; Laurie and Charles married in Oakland County in 1973. Exact birth dates of the living are kept in your private Kin note in Drive, not on the site." });
})(window.KIN_LINEAGE);

/* 27 Nov 2026 (owner): "Joanne married Christopher Werwega." Her married surname; whether he is Tania and Michelle's father is
   not said, so he is drawn as her husband only and the question stays open (Q38). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), Q = (id) => L.questions.find((q) => q.id === id);
  L.sources.push({ id: "S-owner-1127c", short: "Your message: Joanne's husband (27 Nov 2026)", kind: "authored", year: 2026,
    cite: "Joseph Pavia, message to Claude, 27 November 2026.", read: "Joanne married Christopher Werwega." });
  const jo = P("P-tania-mom");
  if (jo) {
    jo.names.splice(1, 0, { given: "Joanne", surname: "Werwega", type: "married", src: ["S-owner-1127c"] });
    jo.summary = jo.summary.replace(" Her married surname is still to be asked.", " She married Christopher Werwega (your account); whether he is Tania and Michelle's father is still to be asked.");
  }
  L.people.push({ id: "P-cwerwega", sex: "M", status: "family", names: [{ given: "Christopher", surname: "Werwega", type: "birth", src: ["S-owner-1127c"] }],
    summary: "Joanne (Holgate) Werwega's husband (your account). Whether he is Tania and Michelle's father is not known yet (Q38)." });
  L.families.push({ id: "F-joanne-chris", partners: ["P-tania-mom", "P-cwerwega"], children: [] });
  const q38 = Q("Q38"); if (q38) q38.q = q38.q.replace("Still open: Joanne's married surname and Tania and Michelle's father.", "Joanne married Christopher Werwega (your account). Still open: is he Tania and Michelle's father, and what surnames do Tania and Michelle use?");
  const lt = (L.askTable || []).find((g) => g.who === "Grandma Laurie");
  if (lt) { const a = lt.ask.find((x) => x.ref === "Q38"); if (a) a.q = "Joanne married Christopher Werwega: is he Tania and Michelle's dad, and what last names do the girls use?"; }
  const ta = (L.askTable || []).find((g) => g.who === "Tania");
  if (ta) ta.ask = [{ q: "Your dad: is he Christopher Werwega? And your and Michelle's last names.", ref: "Q38" }, { q: "Your Aunt Kathy: her married name, when she passed, and her children.", ref: "Q43" }, { q: "David Holgate: how is he related to your grandma Betty?", ref: "Q43" }];
  L.log.push({ id: "L40", date: "2026-11-27", by: "Claude", q: "Q38", where: "your message; the open web", terms: "Werwega (Joanne, Chris, Christopher); Werwega with Holgate", result: "added from your account",
    note: "Joanne's husband Christopher Werwega added; no obituary or public record naming a Werwega with the Holgates was found. Whether he is Tania and Michelle's father is asked at the table." });
})(window.KIN_LINEAGE);

/* 27 Nov 2026, Grandma Laurie's second round (through the owner), and one find. The Holgates: David is Joanne's brother (so
   Betty and Thomas's son); Ryan and Sara's mother was Darlene, who died of cancer, and Rachel is their stepmother; Kathy died
   about 23 September 2026; Aunt Betty in December 2008; Betty and Thomas are probably buried in a Detroit suburb, perhaps in
   the same cemetery as Della, on Ford Road in Dearborn. Katherine ("Katie") Springer, Della's sister, is buried in Plymouth;
   the girls grew up in Oklahoma and played with Native American children. Della had three husbands: Anthony Rimsha, who worked
   for Ford in Canada, was the third; she divorced one, who was abusive. The Seconders: Robert was born in Pontiac in 1930 to
   Wilbur and Dorothy; Dorothy died of cancer and Wilbur married Gladys; Robert's brothers were Bruce and Wilbur ("Junior"), who
   married Trudy (she died of a heart attack): their sons Michael, Gary and Donald; Tammy and Jack were a brother's children.
   Robert and Barbara parted while the children were young; Barbara married Mel about 1979. Laurie was married to David Atkins,
   lived in Pascagoula, Mississippi, and married Jerry Jordan in Oakland County in 1979. The find: a memorial for Gladys M.
   Seconder (1921 to 2007) at Crescent Hills Cemetery, Waterford, names her husband Wilbur Seconder Sr. and his children Wilbur
   Jr., Donald and Sandy Weaver, which supports H9 (Robert H. Seconder is buried in the same cemetery). */
(function (L) {
  const P = (id) => L.people.find((p) => p.id === id), Q = (id) => L.questions.find((q) => q.id === id), Fm = (id) => L.families.find((f) => f.id === id), H = (id) => L.hypotheses.find((h) => h.id === id);
  const add = (arr, x) => { if (!arr.includes(x)) arr.push(x); };
  L.sources.push(
    { id: "S-laurie-1127b", short: "Grandma Laurie's answers, second round (Thanksgiving 2026, through you)", kind: "authored", year: 2026,
      cite: "Laurie (Seconder) Jordan, answers at Thanksgiving, relayed by Joseph Pavia in a message to Claude, 27 November 2026.",
      read: "David H. is Joanne's sibling. Rachel is Sara and Ryan's stepmother; their mother Darlene died of cancer. Kathy died this year, maybe 23 September 2026. Aunt Betty died December 2008, some months before Barbara. Thomas and Betty are probably buried in a Detroit suburb, possibly the same cemetery as Della, on Ford Road in Dearborn. Aunt Katherine Springer (Katie) is buried in Plymouth cemetery. Robert was born in 1930 in Pontiac; his parents were Dorothy and Wilbur Seconder; Dorothy died of cancer and he remarried, to Gladys. Tammy and Jack were Robert's brother's children. Robert's brothers were Bruce and Wilbur (Junior); Junior married Aunt Trudy, who died of a heart attack; they had three children, Michael, Gary and Donald. Robert and Barbara split during the children's childhood; Barbara married Mel about 1979. Della was from Oklahoma; she and her sister Katherine Springer used to play with Native American children. Anthony Rimsha was Della's third husband; she divorced the first, who was abusive. Grandpa Rimsha worked at Ford in Canada. Laurie was married to David Atkins and lived in Pascagoula, Mississippi. She married Jerry Jordan in 1979 in Oakland County." },
    { id: "S-fag-gladys", short: "Gladys M. Seconder's memorial, Crescent Hills Cemetery, Waterford (Find a Grave 17542437)", kind: "derivative", year: 2007,
      url: "https://www.findagrave.com/memorial/17542437",
      cite: "Find a Grave memorial 17542437, Gladys M. Crotser Suzor Seconder (19 Oct 1921 to 14 Jan 2007), Crescent Hills Cemetery, Waterford, Oakland County, Michigan.",
      read: "From a web search's summary of the memorial on 27 Nov 2026 (Find a Grave refuses automated reading, so the page itself is not yet read): married to Wilbur Seconder, Sr.; three stepchildren, Wilbur Seconder, Jr., Donald Seconder and Sandy Weaver; she taught sewing and quilting at the Singer store in Pontiac." });
  const S2 = ["S-laurie-1127b"];
  const nm = (given, surname, type, note, src) => Object.assign({ given, surname, type, src: src || S2 }, note ? { note } : {});

  /* the Holgates */
  const fh = Fm("F-holgate"); if (fh && fh.uncertain) delete fh.uncertain["P-davidh"];
  const dv = P("P-davidh"); if (dv) dv.summary = "Dave Holgate, Aunt Betty and Thomas Holgate's son, Joanne's and Kathy's brother (Grandma Laurie). His first wife Darlene, the mother of Ryan and Sara, died of cancer; his wife Rachel is their stepmother. He was at the family's 2006 Christmas.";
  L.people.push({ id: "P-darlene", sex: "F", status: "family", names: [nm("Darlene", "Holgate", "married", "her married name; her own surname is not known yet")],
    summary: "David Holgate's first wife, the mother of Ryan and Sara; she died of cancer (Grandma Laurie)." });
  const fd = Fm("F-davidh"); if (fd) fd.children = [];
  L.families.push({ id: "F-david-darlene", partners: ["P-davidh", "P-darlene"], children: ["P-ryanh", "P-sarah"] });
  const rh = P("P-rachelh"); if (rh) rh.summary = "David Holgate's wife (Grandma Laurie): Ryan and Sara's stepmother, after their mother Darlene died. She shares Joseph Termenas's photographs on Ancestry.";
  for (const [id, t] of [["P-ryanh", "son"], ["P-sarah", "daughter"]]) { const x = P(id); if (x) x.summary = `David Holgate and Darlene's ${t}; Darlene died of cancer and Rachel is their stepmother (Grandma Laurie).`; }
  const kh = P("P-kathyh"); if (kh) kh.summary = "Aunt Betty and Thomas Holgate's daughter, Joanne's and David's sister; she died this year, about 23 September 2026 (Grandma Laurie). Her married name is the way to her obituary, which should name her parents, her brother and sister and her own family (Q43).";
  L.events.push(
    { id: "E-death-kathyh", type: "death", who: ["P-kathyh"], date: { text: "about 23 Sep 2026", sort: "2026-09-23" }, conclusion: "Died this year, about 23 September 2026 (Grandma Laurie, \"maybe\").", confidence: "family",
      assert: [{ src: "S-laurie-1127b", value: "passed away this year, maybe 23 September 2026", info: "secondary", ev: "direct" }] },
    { id: "E-death-betty", type: "death", who: ["P-betty"], date: { text: "Dec 2008", sort: "2008-12" }, conclusion: "Died in December 2008, a little before her sister Barbara (Grandma Laurie). Barbara died on 22 January 2009 by her obituary, about a month later; the family remembers a gap of about four months and Barbara's death in March, which may be Mel's (28 April 2009).", confidence: "family",
      assert: [{ src: "S-laurie-1127b", value: "died December 2008, about four months before Barbara", info: "secondary", ev: "direct" }] });
  const bt = P("P-betty"); if (bt) bt.summary = "Aunt Betty: Betty (Termens) Holgate, Nana Feole's (Barbara's) sister, a daughter of Joseph and Della Termens, so your great-grandmother's sister. Married Thomas Holgate; of Novi in 1997. Their children: Joanne (Tania and Michelle's mother), Kathy (died 2026) and David. She died in December 2008; she and Thomas are probably buried in a Detroit suburb, perhaps with Della on Ford Road in Dearborn (Grandma Laurie).";

  /* Della, Katie and Anthony Rimsha */
  const fm = Fm("F-malkitus");
  L.people.push(
    { id: "P-katies", sex: "F", status: "probable", names: [nm("Katherine M.", "Springer", "married", "her name in her 1997 obituary", ["S-springer-obit"]), nm("Katie", "Springer", "as-used", "what the family called her")],
      summary: "Aunt Katie: Katherine M. Springer (1907 to 1997), Della's sister (Grandma Laurie; this settles H8 and H10's question of whose sister she was). Born in Hartshorne, Oklahoma, by Gemini's reading (H10); as girls in Oklahoma she and Della played with Native American children. She is buried in Plymouth, Michigan (Grandma Laurie). Her 1997 obituary names Barbara and Betty as her nieces." },
    { id: "P-arimsha", sex: "M", status: "family", names: [nm("Anthony", "Rimsha", "birth")],
      summary: "Della's third husband (Grandma Laurie), \"Grandpa Rimsha\" to Laurie: he worked for Ford in Canada. In 1950 Della was Della E. Rimsha, in Detroit with Barbara." });
  if (fm) add(fm.children, "P-katies");
  L.families.push({ id: "F-della-rimsha", partners: ["P-della", "P-arimsha"], children: [] });
  const de = P("P-della");
  if (de) de.summary += " She came from Oklahoma, where she and her sister Katie (Katherine Springer) played with Native American children. She married three times: Joseph Termens; Anthony Rimsha, her third husband, who worked for Ford in Canada; and a husband she divorced, who was abusive (which marriage that was is still to be asked, Q46). The family thinks she is buried in a cemetery on Ford Road in Dearborn (Grandma Laurie).";
  for (const id of ["H8", "H10"]) { const h = H(id); if (h) h.text += " Grandma Laurie (27 Nov 2026): Katherine (Katie) Springer was Della's sister; they grew up in Oklahoma."; }
  const q44 = Q("Q44"); if (q44) q44.q += " Della had three husbands (Laurie): if Joseph was not her first, a marriage before April 1922 would fit the older age in the index better; the Brooklyn certificate says how many times the bride had married before.";

  /* the Seconders */
  L.people.push(
    { id: "P-wilbursr", sex: "M", status: "family", names: [nm("Wilbur", "Seconder", "birth", "Wilbur Seconder Sr. in his second wife Gladys's memorial; Wilbur Guy Seconder (1906 to 1988) in Gemini's reading (H9)")],
      summary: "Robert (Bob) Seconder's father (Grandma Laurie), so Laurie's grandfather. After his wife Dorothy died of cancer he married Gladys (Gladys M. Seconder, buried at Crescent Hills Cemetery in Waterford, whose memorial names him Wilbur Seconder Sr.). His children: Robert, Bruce and Wilbur Jr. (\"Junior\"), and by Gladys's memorial also Donald and Sandy Weaver (Q45). Gemini traces him to Arthur George Seconder, a Dr. Barnardo's boy sent to Canada (H9)." },
    { id: "P-dorothys", sex: "F", status: "family", names: [nm("Dorothy", "Seconder", "married", "her married name; her maiden name is not known yet")],
      summary: "Robert (Bob) Seconder's mother, Laurie's grandmother; she died of cancer, and Wilbur remarried (Grandma Laurie)." },
    { id: "P-gladyss", sex: "F", status: "probable", names: [nm("Gladys M.", "Crotser", "birth", "", ["S-fag-gladys"]), nm("Gladys M.", "Suzor", "married", "an earlier married name", ["S-fag-gladys"]), Object.assign(nm("Gladys M.", "Seconder", "married"), { src: ["S-fag-gladys", "S-laurie-1127b"] })],
      summary: "Wilbur Seconder Sr.'s second wife, after Dorothy (Grandma Laurie): Gladys M. (Crotser, Suzor) Seconder, 19 October 1921 to 14 January 2007, buried at Crescent Hills Cemetery, Waterford; she taught sewing and quilting at the Singer store in Pontiac (her memorial)." },
    { id: "P-bruces", sex: "M", status: "family", names: [nm("Bruce", "Seconder", "birth")], summary: "Robert's brother (Grandma Laurie): your grandmother Laurie's uncle. Tammy and Jack were the children of one of Robert's brothers, most likely Bruce's (Q45)." },
    { id: "P-juniors", sex: "M", status: "family", names: [nm("Wilbur", "Seconder", "birth", "Wilbur Jr., called Junior"), nm("Junior", "Seconder", "as-used")], summary: "Uncle Junior, Robert's brother (Grandma Laurie), named Wilbur Seconder Jr. in his stepmother Gladys's memorial. He married Aunt Trudy; their sons were Michael, Gary and Donald." },
    { id: "P-trudys", sex: "F", status: "family", names: [nm("Trudy", "Seconder", "married", "her married name; her own surname is not known yet")], summary: "Aunt Trudy, Uncle Junior's wife (Grandma Laurie); she died of a heart attack. Their sons: Michael, Gary and Donald." },
    { id: "P-mseconder", sex: "M", status: "family", names: [nm("Michael", "Seconder", "birth")], summary: "Uncle Junior and Aunt Trudy's son (Grandma Laurie): Laurie's first cousin." },
    { id: "P-gseconder", sex: "M", status: "family", names: [nm("Gary", "Seconder", "birth")], summary: "Uncle Junior and Aunt Trudy's son (Grandma Laurie): Laurie's first cousin." },
    { id: "P-dseconder", sex: "M", status: "family", names: [nm("Donald", "Seconder", "birth")], summary: "Uncle Junior and Aunt Trudy's son (Grandma Laurie). Gladys Seconder's 2007 memorial lists a Donald Seconder among Wilbur Sr.'s own children: whether that is this Donald or another (a brother of Robert's) is Q45." },
    { id: "P-sandyw", sex: "F", status: "possible", names: [nm("Sandy", "Weaver", "married", "her married name, from Gladys Seconder's memorial", ["S-fag-gladys"])], summary: "Named as a stepchild in Gladys Seconder's 2007 memorial, so a child of Wilbur Seconder Sr.: Robert's sister, if the memorial is right. Laurie did not mention her (Q45)." },
    { id: "P-tammys", sex: "F", status: "family", names: [nm("Tammy", "Seconder", "birth", "perhaps the Tamora J. \"Tammy\" Seconder of Waterford, 1957 to 2012, whose obituary was found but not yet read (L27)")], summary: "A daughter of one of Robert's brothers (Grandma Laurie), most likely Bruce's (Q45)." },
    { id: "P-jacks", sex: "M", status: "family", names: [nm("Jack", "Seconder", "birth", "not the Jack L. Seconder Sr. of Waterford (1933 to 2024), who is too old to be Robert's nephew; perhaps his son, or another Jack")], summary: "A son of one of Robert's brothers (Grandma Laurie), most likely Bruce's (Q45)." });
  L.families.push(
    { id: "F-seconder-wd", partners: ["P-wilbursr", "P-dorothys"], children: ["P-bob", "P-bruces", "P-juniors", "P-sandyw"], uncertain: { "P-sandyw": "a stepchild of Gladys in her memorial, so Wilbur Sr.'s child, but Laurie did not name her (Q45)" } },
    { id: "F-seconder-wg", partners: ["P-wilbursr", "P-gladyss"], children: [] },
    { id: "F-seconder-jt", partners: ["P-juniors", "P-trudys"], children: ["P-mseconder", "P-gseconder", "P-dseconder"], uncertain: { "P-dseconder": "or is Donald Robert's brother, as Gladys's memorial has it? (Q45)" } },
    { id: "F-seconder-b", partners: ["P-bruces"], children: ["P-tammys", "P-jacks"], uncertain: { "P-tammys": "Robert's brother's child (Laurie): Bruce's, most likely", "P-jacks": "Robert's brother's child (Laurie): Bruce's, most likely" } });
  L.events.push(
    { id: "E-birth-gladys", type: "birth", who: ["P-gladyss"], date: { text: "19 Oct 1921", sort: "1921-10-19" }, conclusion: "Born 19 October 1921 (her memorial).", confidence: "probable", assert: [{ src: "S-fag-gladys", value: "19 Oct 1921", info: "secondary", ev: "direct" }] },
    { id: "E-death-gladys", type: "death", who: ["P-gladyss"], date: { text: "14 Jan 2007", sort: "2007-01-14" }, conclusion: "Died 14 January 2007; buried at Crescent Hills Cemetery, Waterford, Michigan (her memorial).", confidence: "probable", assert: [{ src: "S-fag-gladys", value: "14 Jan 2007, Crescent Hills Cemetery", info: "secondary", ev: "direct" }] });
  const bob = P("P-bob");
  if (bob) bob.summary = "Laurie's father, Robert (Bob) Seconder (Grandma Laurie): born in Pontiac in 1930 to Wilbur and Dorothy Seconder; brothers Bruce and Wilbur (\"Junior\"). Barbara's first husband; they parted while their children were young. Most likely the Robert H. Seconder (1931 to 2003) buried at Crescent Hills Cemetery in Waterford (H9), the same cemetery as his stepmother Gladys; Laurie remembers 1930.";
  L.events.push({ id: "E-birth-bob", type: "birth", who: ["P-bob"], date: { text: "1930", sort: "1930" }, conclusion: "Born in 1930 in Pontiac, Michigan, to Wilbur and Dorothy Seconder (Grandma Laurie). H9's Robert H. Seconder was born in 1931.", confidence: "family",
    assert: [{ src: "S-laurie-1127b", value: "born 1930, Pontiac", info: "secondary", ev: "direct" }] });
  const h9 = H("H9"); if (h9) h9.text += " Grandma Laurie (27 Nov 2026) fits it: Robert was born in Pontiac in 1930 to Wilbur and Dorothy; Wilbur remarried Gladys, and Gladys M. Seconder's memorial (Crescent Hills Cemetery, Waterford, where Robert H. lies) names her husband Wilbur Seconder Sr. Claude now about 85%.";
  const fg = Fm("F-ggm"); if (fg) { fg.ended = true; if (fg.uncertain) delete fg.uncertain["P-ilene"]; }
  L.events.push({ id: "E-marr-feole", type: "marriage", who: ["P-ggm", "P-mel"], date: { text: "about 1979", sort: "1979" }, conclusion: "Barbara married Mel Feole about 1979 (Grandma Laurie).", confidence: "family", assert: [{ src: "S-laurie-1127b", value: "Mel married about 1979", info: "secondary", ev: "direct" }] });
  const ff = Fm("F-feole"); if (ff) ff.events = (ff.events || []).concat("E-marr-feole");

  /* Laurie */
  L.events.push({ id: "E-marr-gp-jj", type: "marriage", who: ["P-gp", "P-jerryj"], date: { text: "1979", sort: "1979" }, conclusion: "Laurie married Gerald \"Jerry\" Jordan in Oakland County, Michigan, in 1979 (Grandma Laurie).", confidence: "family", assert: [{ src: "S-laurie-1127b", value: "married Jerry Jordan in 1979, Oakland County", info: "primary", ev: "direct" }] });
  const fM = Fm("F-gp-michael"); if (fM) fM.events = (fM.events || []).concat("E-marr-gp-jj");
  const gp = P("P-gp"); if (gp) gp.summary = gp.summary.replace("Then Tim Atkins (with David Wayne Atkins), born while the family lived in Mississippi for about a year,", "Then she married David Wayne Atkins and lived in Pascagoula, Mississippi, where Tim Atkins was born; and in 1979, in Oakland County, she married Gerald \"Jerry\" Lynn Jordan, father of Michael").replace(" and Michael Jordan (with Gerald \"Jerry\" Lynn Jordan).", ".");
  const da = P("P-datkins"); if (da) da.summary = "Tim's father, David Wayne Atkins: Laurie's husband after Charles A. Sanders; they lived in Pascagoula, Mississippi, where Tim was born (Grandma Laurie).";
  const tm = P("P-timm"); if (tm) tm.summary = tm.summary.replace("born in Mississippi while the family lived there for about a year", "born in Pascagoula, Mississippi, while the family lived there for about a year");

  /* questions */
  const q43 = Q("Q43"); if (q43) q43.q = "Kathy Holgate, Aunt Betty's daughter, died about 23 September 2026: her married name and her obituary, which will name Betty and Thomas, Joanne and David, and her own family. (David is settled: Betty and Thomas's son.)";
  L.questions.push(
    { id: "Q45", p: 2, person: "P-wilbursr", q: "Wilbur Seconder Sr.'s children: Laurie names Robert, Bruce and Junior (Wilbur Jr.); Gladys Seconder's 2007 memorial names Wilbur Jr., Donald and Sandy Weaver. Is Donald Robert's brother or Junior's son (Laurie: Junior's sons were Michael, Gary and Donald)? Who is Sandy Weaver? Were Tammy and Jack Bruce's children (Tamora J. Seconder, 1957 to 2012, is a lead; Jack L. Seconder Sr., 1933 to 2024, is too old to be a nephew)?", sources: "Gladys M. Seconder's memorial; Wilbur Seconder's obituary (1988?); Tammy's 2012 obituary; Grandma Laurie" },
    { id: "Q46", p: 2, person: "P-della", q: "Della's three marriages: who was the husband she divorced (Laurie: he was abusive), and did that marriage come before Joseph (1922) or between Joseph's death (1935) and Anthony Rimsha? When did she marry Anthony Rimsha, and when and where did they die? The family thinks she is buried on Ford Road in Dearborn: which cemetery?", sources: "1930 and 1940 censuses; Wayne County marriage and divorce records; her death record; cemetery records on Ford Road, Dearborn; Grandma Laurie" });
  const lt = (L.askTable || []).find((g) => g.who === "Grandma Laurie");
  if (lt) lt.ask = [
    { q: "Della's husband she divorced: his name, and was he before Grandpa Joseph or after? When did she marry Anthony Rimsha?", ref: "Q46" },
    { q: "Which cemetery on Ford Road is Della in? Is Grandpa Joseph Termenas there too?", ref: "Q46" },
    { q: "Donald Seconder: is he Uncle Junior's son, or another brother of your dad's? And who is Sandy Weaver?", ref: "Q45" },
    { q: "Tammy and Jack: were they Uncle Bruce's kids?", ref: "Q45" },
    { q: "Kathy's married name (so we can find her obituary)?", ref: "Q43" },
    { q: "Joanne married Christopher Werwega: is he Tania and Michelle's dad?", ref: "Q38" },
    { q: "Grandma Dorothy and Aunt Trudy: their maiden names?", ref: "Q45" },
    { q: "Betty Coggins's parents in Georgia: which town, and anything you remember about them?", ref: "Q42" }];
  L.log.push({ id: "L41", date: "2026-11-27", by: "Claude", q: "Q45", where: "Grandma Laurie's second round, through you; the open web (searches for Wilbur, Betty Holgate and Kathy Holgate)", terms: "Seconder (Wilbur, Dorothy, Gladys, Bruce, Junior); Holgate obituaries 2008 and 2026", result: "found",
    note: "Laurie's answers entered (Holgates, Della's marriages and burial, Katie Springer, the Seconders, Laurie's marriages). Found: Gladys M. Seconder's memorial (Find a Grave 17542437; from the search summary only, the page refuses automated reading) naming her husband Wilbur Seconder Sr. and his children Wilbur Jr., Donald and Sandy Weaver, buried at Crescent Hills, Waterford, like H9's Robert H. Not found: obituaries for Betty Holgate (December 2008) and Kathy (September 2026); Kathy's married name is needed." });
})(window.KIN_LINEAGE);
