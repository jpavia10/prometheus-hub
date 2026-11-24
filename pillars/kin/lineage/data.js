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
    { id: "PL-cambridge", name: "Cambridge, Massachusetts", hist: "180 Howard Street, Cambridge, Middlesex County, Massachusetts", now: "Cambridge, MA", lat: 42.3626, lon: -71.1023, approx: "street location not plotted; the city's Cambridgeport area" },
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
      read: "Name Joseph Termenas, age 24; home 761(?) Cardoni, Detroit; born May 16, 1893; Declarant; born Lithuania, Russia; occupation motion picture operator; employer: unemployed; no dependents; single; white; no prior service; no exemption claimed. Registrar: medium height, medium build, eyes grey, hair brown, not bald." },
    { id: "S-enlist", short: "Enlistment record, 1919", kind: "original", year: 1919, img: ["enlistment-1919"], family: true,
      cite: "U.S. Army, \"Enlistment Record\" (reverse of Honorable Discharge), Joseph M. Termenas, Private 1st Class, Company A, 29th Engineers, discharged Camp Devens, Massachusetts, 15 July 1919; family-held original, scanned copy in his great-uncle's research file (2026).",
      read: "Enlisted 20 Sep 1917 at Columbus Barracks, Ohio; first enlistment; no prior service; not mounted; in France 10/11/17 (?) to 7/3/19 as read; knowledge of vocation: electrician; wounds: none; physical condition: good; typhoid and paratyphoid prophylaxis completed 10/11/17; single; character excellent. Stamps: discharged Jul 15 1919; approved for Victory Medal with France clasp, forwarded 26 May 1921 by the recruiting officer, Boston. Annotated \"Bonus certified for Michigan State\" with a notary's signature. Signed Joseph M. Termenas." },
    { id: "S-discharge", short: "Honorable discharge, 1919", kind: "original", year: 1919, img: ["discharge-1919"], family: true,
      cite: "U.S. Army, Form No. 525, A.G.O., \"Honorable Discharge from the United States Army,\" Joseph M. Termenas, Private 1st Class, Company A, 29th Engineers, Camp Devens, Massachusetts, 15 July 1919; family-held original, scanned copy (scan upside down).",
      read: "Service number read as 1803038(?); discharged by reason of demobilization (circular 75?); born in Lithuania, in the State of Russia; when enlisted 24 4/12 years of age, by occupation an electrician; brown eyes, brown hair, ruddy complexion, 5 feet 7 inches. Given at Camp Devens, Mass., 15 July 1919; signed by a Major of Engineers (name not read)." },
    { id: "S-nat-cert", short: "Certificate of naturalization, 1919", kind: "original", year: 1919, img: ["naturalization-cert-1919"], family: true,
      cite: "U.S. Department of Labor, Naturalization Service, Certificate of Naturalization no. 1229058, Joseph Mike Termenas, U.S. District Court, Boston, Massachusetts, 14 July 1919 (petition vol. 4312M, no. 13, as read); family-held original, scanned copy (scan upside down).",
      read: "Age 26; height 5 ft 8 in; white; complexion fair; eyes brown; hair brown; no visible marks; single; no minor children. Residing at Camp Devens, Ayer, Massachusetts; formerly a subject of \"the present Government of Russia\"; admitted under the Act of May 9, 1918 while serving in the military forces of the United States. Clerk's signature: James S. Allen(?)." },
    { id: "S-pet", short: "Petition for naturalization, Boston, 1919", kind: "original", year: 1919, img: ["naturalization-petition-1919", "naturalization-oath-1919"],
      cite: "Petition for Naturalization no. 4312M(?), Joseph Mike Termenas, U.S. District Court, Boston, Massachusetts, filed 14 July 1919; \"Petitions and Records of Naturalizations of the U.S. District and Circuit Courts of the District of Massachusetts, 1906–1929,\" NARA microfilm M1368, roll 315, images 0913–0914; National Archives Catalog NAID 59700981 and 59700983.",
      url: "https://catalog.archives.gov/id/59700981",
      read: "Residence Camp Devens, Mass. / 180 Howard St., Cambridge, Mass.; occupation soldier / operator; born 16 May 1893 in Lithuania, Russia; emigrated from Hamburg on or about 13 Aug 1912 and arrived at New York on 23 Aug 1912 on the vessel \"Columbia\" (reading uncertain); declared intention on 21 Oct 1916 at Detroit, Mich., in the Circuit Court (\"of United States\" as read); not married; no children; Act of May 9, 1918; renounces \"the Present Gov't of Russia\"; resided in the U.S. continuously since 23 Aug 1912. Witnesses: Lesley(?) B. Allen, Captain, and Frank R. Olson(?), 1st Lieutenant, both of Camp Devens, who had known him since July 1917(?). Filed and sworn 14 Jul 1919 before Arthur Grandison(?), deputy clerk. Signed Joseph Mike Termenas." },
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
      conclusion: "Gave 180 Howard Street, Cambridge, Massachusetts, as his home in July 1919.", confidence: "probable", conflict: "C8",
      assert: [{ src: "S-pet", value: "Camp Devens, Mass. / 180 Howard St., Cambridge", info: "primary", ev: "direct" }, { src: "S-nat-index", value: "180 Howard St., Cambridge", info: "primary", ev: "direct" }, { src: "S-nat-cert", value: "residing at Camp Devens, Ayer", info: "primary", ev: "direct" }] },
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
    { id: "C5", person: "P-joseph", q: "How tall was he?", status: "resolved", conclusion: "about 5 ft 7–8 in",
      argument: "Discharge: 5 ft 7 in. Naturalization certificate: 5 ft 8 in. Draft card: medium. Consistent within the usual variation." },
    { id: "C6", person: "P-joseph", q: "What was his Army service number?", status: "open", conclusion: "unresolved (1,803,038 most likely)",
      argument: "The discharge, as read from the scan, shows 1803038; the Veterans Bureau card is typed \"1 803 38\", with a digit apparently missing; the later roster was transcribed as 180238. Army serial numbers for men enlisting in 1917 in this range ran to seven digits, which favours 1,803,038. A clear reading of the roster image or his service record (NPRC; most enlisted WWI records burned in 1973, so the final-pay and morning-report substitutes may be all there is) will settle it (Q18)." },
    { id: "C7", person: "P-joseph", q: "The death certificate's own age does not match its birth date.", status: "explained", conclusion: "recording error in 1935",
      argument: "Born 16 May 1895 and died 11 June 1935 would make him 40 years 0 months 26 days, not 40 years 1 month 23 days (which points to 19 April 1895). Either the age or the date was worked out wrongly by the informant or the clerk; either way the 1935 birth data is the weakest in the file (see C1)." },
    { id: "C8", person: "P-joseph", q: "Where did he live in 1919: Camp Devens or Cambridge?", status: "explained", conclusion: "both",
      argument: "A soldier awaiting discharge lived at Camp Devens; the petition gives both Camp Devens and 180 Howard Street, Cambridge, which reads as his civilian address. Who lived at 180 Howard Street in 1919-1920 (city directory, 1920 census) may show a relative or the household he lived with before he went to Detroit (Q4, Q15)." },
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
    { id: "Q15", p: 3, person: "P-joseph", q: "City directories: Detroit 1916–1935 (Cardoni, Sobieski, Rockdale; occupation by year) and Cambridge 1918–1920 (who lived at 180 Howard Street).", sources: "Detroit and Cambridge city directories (Ancestry U.S. City Directories; Internet Archive; Detroit Public Library Burton Collection)", task: "KIN-GEM-13" },
    { id: "Q18", p: 3, person: "P-joseph", q: "Read the Co. A rosters and his service record substitutes for the service number, the dates in France and his duty at Chaumont.", sources: "NARA RG 64 rosters; RG 120 (AEF) records of the 29th Engineers; NPRC", task: "KIN-GEM-11" },
  ],

  /* the world around the family: well-established history that explains a record (shown in "The family through time", never as a
     fact about a person) */
  context: [
    { date: "1904-05-07", text: "The Russian Empire lifts its ban on printing Lithuanian in the Latin alphabet, in force since 1864: Joseph was born under it, and parish registers of his time are kept in Russian." },
    { date: "1914-07-28", text: "The First World War begins. Germany occupies Lithuania from 1915 to 1918." },
    { date: "1917-04-06", text: "The United States declares war on Germany." },
    { date: "1917-06-05", text: "The first national draft registration day: every man in the United States aged 21 to 30, citizen or not, had to register. Joseph's draft card is from this day." },
    { date: "1918-02-16", text: "Lithuania declares its independence." },
    { date: "1918-11-11", text: "The Armistice ends the fighting in France, where Joseph's regiment printed the Army's maps." },
    { date: "1918-10-01", text: "The influenza pandemic peaks in the autumn of 1918." },
    { date: "1924-05-26", text: "The Immigration Act of 1924 sets quotas that all but close the door to new arrivals from Lithuania." },
    { date: "1929-10-29", text: "The stock market crashes and the Great Depression follows: American car production falls by about three quarters between 1929 and 1932." },
    { date: "1940-06-15", text: "The Soviet Union occupies Lithuania." },
    { date: "1941-12-08", text: "The United States enters the Second World War." },
  ],

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
    "P-joseph": { search: "partial: no census, arrival manifest, declaration, newspaper or church record yet", cite: "done for every assertion", analysis: "done", conflicts: "C1, C2, C4, C5, C7, C8 resolved or explained; C3, C6, C9 open", written: "the summary and the proof arguments above" },
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
