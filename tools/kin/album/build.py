import json, os, sys, re
from PIL import Image, ImageOps, ImageFilter, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from manifest import A, CH, DROPPED, ALREADY, FACES
KM = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HUB = "/home/user/prometheus-hub/pillars/kin"
DOCS = HUB + "/lineage/docs"
u = json.load(open(KM + "/uniq.json"))
have = {int(k): v for k, v in json.load(open(KM + "/have.json")).items()}
idx = [a["i"] for a in A]
dup = {i for i in idx if idx.count(i) > 1}
assert not dup, dup
cover = set(idx) | set(DROPPED) | set(ALREADY)
print("entries", len(A), "dropped", len(DROPPED), "already", len(ALREADY), "uncovered", sorted(set(range(166)) - cover))
slugs = [a["slug"] for a in A]; assert len(set(slugs)) == len(slugs)
os.makedirs(DOCS + "/t", exist_ok=True)
tot = 0
for a in A:
    src = have[a["i"]]
    im = Image.open(src); im = ImageOps.exif_transpose(im).convert("RGB")
    a["w0"], a["h0"] = im.size
    name = "fam-" + a["slug"]
    big = im.copy(); big.thumbnail((1600, 1600), Image.LANCZOS)
    big.save(f"{DOCS}/{name}.webp", "WEBP", quality=80, method=6)
    th = im.copy(); th.thumbnail((480, 480), Image.LANCZOS)
    th.save(f"{DOCS}/t/{name}.webp", "WEBP", quality=72, method=6)
    a["img"] = name; a["w"], a["h"] = big.size
    tot += os.path.getsize(f"{DOCS}/{name}.webp") + os.path.getsize(f"{DOCS}/t/{name}.webp")
print("written MB", round(tot / 1e6, 1))
faces = {}
sheet = Image.new("RGB", (256 * len(FACES), 280), (10, 10, 10)); d = ImageDraw.Draw(sheet)
for n, (pid, (i, cx, cy, s)) in enumerate(FACES.items()):
    im = ImageOps.exif_transpose(Image.open(have[i])).convert("RGB"); W, H = im.size
    half = s * W / 2; x, y = cx * W, cy * H
    box = (int(max(0, x - half)), int(max(0, y - half)), int(min(W, x + half)), int(min(H, y + half)))
    f = im.crop(box).resize((256, 256), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    name = "face-" + pid[2:]
    f.save(f"{DOCS}/{name}.webp", "WEBP", quality=84, method=6)
    faces[pid] = name
    sheet.paste(f, (256 * n, 0)); d.text((256 * n + 6, 262), pid, fill=(255, 255, 0))
sheet.save(KM + "/work/faces_check.png")
json.dump(dict(A=A, faces=faces), open(KM + "/build/out.json", "w"), indent=1)

# ---------- album.js ----------
SRCID = {78: "S-teva-hami059", 1: "S-pension-peterc", 90: "S-patty-school", 165: "S-dailypress-1969", 60: "S-martin-marriage", 67: "S-breazier-will", 14: "S-convoy-1917", 76: "S-pavia-obits"}
for a in A:
    a["src"] = SRCID.get(a["i"]) or ("S-fam-stones" if a.get("kind") == "stone" else "S-fam-photos")
    a.setdefault("kind", "photo"); a.setdefault("show", True); a.setdefault("who", False)
    a["drive"] = u[a["i"]]["id"]; a["file"] = u[a["i"]]["title"]
nphot = sum(1 for a in A if a["src"] == "S-fam-photos"); nst = sum(1 for a in A if a["src"] == "S-fam-stones")
SOURCES = [
 dict(id="S-fam-photos", short="The Culberson family's photographs (Interwoven Family blog)", kind="original", year=2019,
  cite="Photographs posted by Charlie and Elizabeth Culberson's descendants on the Interwoven Family blog (interwovenfamily.blogspot.com, 2019), saved to the Kin media folder in Google Drive by Gemini (24 November 2026). Each picture checked by eye by Claude on 25 November 2026. The blog itself could not be opened from Claude's session, so the captions come from the blog's own file names and from words printed or written on the pictures.",
  read=f"{nphot} photographs, about 1880 to 2015: Bill and Mary Culberson and their children, Ada and Chester Moss, the Tippens, and Charlie Culberson's wife Elizabeth Martin's people. Four pictures filed under the wrong names were set aside (a DAR insignia, a dove logo, a flower, an unrelated portrait)."),
 dict(id="S-fam-stones", short="Family gravestones (Cochran and Antioch cemeteries and others)", kind="original", year=2019,
  cite="Photographs of family gravestones posted on the Interwoven Family blog and gathered by Gemini into the Kin media folder in Drive (24 November 2026); inscriptions read by Claude from the pictures, 25 November 2026.",
  read=f"{nst} stones. Peter Culberson, \"Co. F 3 Tenn. Cav.\"; Bill and Mary Culberson (Mary 14 July 1873 to 21 February 1955, Bill born 2 May 1867); Callie Mae Culberson Mantooth, 3 January 1904 to 11 November 1999; Charles Culberson, 14 July 1912 to 22 February 2001, and Elizabeth M., 19 June 1914 to 30 June 1994; the Martins; Mary E. Kirkland, infant, 1871 to 1872."),
 dict(id="S-teva-hami059", short="Peter Culberson family postcard (TeVA HAMI059)", kind="original", year=1907,
  cite="Real-photo postcard of Peter Culberson and family, Tennessee State Library and Archives, Tennessee Virtual Archive (TeVA), item HAMI059, as identified by Gemini (24 November 2026); a copy is on the Interwoven Family blog. The TeVA record itself was not opened by Claude.",
  read="A bearded old man seated at right, a woman in spectacles seated at left, three young women standing (\"Mary\" written on the one at left) and a little girl."),
 dict(id="S-pension-peterc", short="Peter Culberson's pension index cards (1914)", kind="original", year=1914,
  cite="General Index to Pension Files, 1861-1934 (NARA T288), cards for Peter Culberson, Co. F, 3rd Tennessee Cavalry; image saved to the Kin media folder by Gemini (24 November 2026), read by Claude.",
  read="Mary E. Culberson, widow, files in 1914 at Englewood, Tennessee."),
 dict(id="S-patty-school", short="Patty School photograph (Polk County News)", kind="derivative",
  cite="\"Photo shows early school days at Patty School, date unknown\", a clipping reproduced from the Polk County News files, shared on the Interwoven Family blog; read by Claude from the clipping, 25 November 2026.",
  read="Names Bob, Claude, Myrtle and Callie Culberson and, in the third row, Chester Moss."),
 dict(id="S-dailypress-1969", short="\"Wynn or Winn\", Daily Press, 11 May 1969", kind="authored", year=1969,
  cite="\"Wynn or Winn\", genealogy column, The Daily Press, Newport News-Hampton, Virginia, Sunday 11 May 1969 (the page's printed footer; a label added above it reads \"May 11, 1982, page 92\"), quoting John Bennett Boddie, Historical Southern Families, vol. VI, pp. 89-90; clipping saved to Drive by Gemini, read by Claude.",
  read="\"The wife of Richard Stone, son of William and Elizabeth, was named Mary, probably Mary Yancy\"; his will dated 7 September 1795, proved 13 January 1797, Lunenburg Will Book 4, p. 161; ten children including Elizabeth, m. James Pulliam."),
 dict(id="S-martin-marriage", short="Martin-Cooke marriage certificate (1885)", kind="original", year=1885,
  cite="Marriage certificate, State of Tennessee, County of McMinn, Marriage Record Book 2, page 221, from the Interwoven Family blog; read by Claude.",
  read="J. S. Martin and Elizabeth Cooke, united by Wm. A. Daugherty, Elder, 22 February 1885."),
 dict(id="S-breazier-will", short="Thomas Breazier's will (abstract, 1770)", kind="derivative", year=1770,
  cite="Typed abstract \"A-286 Will in Archives\", from the Interwoven Family blog's Brasher pages; read by Claude.",
  read="Dated 17 May 1770, proved May 1784; wife Hannah; sons Thomas, John, Aquilla, James and Samuel; daughters Elizabeth Jones, Sarah Pyle, Hanah Teague, Mary, Cassa, Jean and Rachel."),
 dict(id="S-convoy-1917", short="\"Convoy of 11-10-17\" (photograph)", kind="original", year=1917,
  cite="A photograph inscribed \"Convoy of 11-10-17\", saved by Gemini to the Kin media folder with Joseph Termenas's papers (24 November 2026); the archive it came from is not recorded.",
  read="A troop convoy at sea on 10 November 1917, two days before the Agamemnon, with Joseph aboard, reached Brest."),
]
CHAPTERS = [dict(id=c[0], title=c[1], intro=c[2]) for c in CH]
items = [dict(id="M-" + a["slug"], img=a["img"], w=a["w"], h=a["h"], y=a["y"], when=a["when"], ch=a["ch"], cap=a["cap"], ppl=a["ppl"], src=a["src"], kind=a["kind"], show=a["show"], who=a["who"], drive=a["drive"], file=a["file"]) for a in A]
items.sort(key=lambda x: ([c[0] for c in CH].index(x["ch"]), x["y"]))
dropped = [dict(file=u[i]["title"], drive=u[i]["id"], why=w) for i, w in sorted(DROPPED.items())]
facesrc = {pid: next(a for a in A if a["i"] == FACES[pid][0]) for pid in faces}
J = lambda o: json.dumps(o, ensure_ascii=False)
out = []
out.append("/* Kin · the family album (Claude, 2026-11-25; owner: \"go to the kin and level that up significantly. Comprehensively catalog and integrate\n   all media so its ready to show off for Thanksgiving tomorrow\"). Generated from the Kin media folder in Drive: every picture opened and\n   checked by eye, captions from the family's own file names and from what is printed on the prints, never guessed. Loads after data.js:\n   adds the photograph sources, Ada's sister Callie and brother Charlie (both on their own stones), and one media record per picture. */\n")
out.append("(function (L) {\n  if (!L) return;\n  const add = (arr, list) => { for (const x of list) if (!arr.some((y) => y.id === x.id)) arr.push(x); };\n")
out.append("  add(L.sources, [\n" + ",\n".join("    " + J(s) for s in SOURCES) + "\n  ]);\n")
out.append('''  /* Ada's sister and youngest brother: their stones give the dates; the family's 1988 picture shows the three of them together */
  add(L.people, [
    { id: "P-callie", sex: "F", status: "possible", names: [{ given: "Callie Mae", surname: "Culberson", type: "birth", src: ["S-fam-stones"] }, { given: "Callie Mae", surname: "Mantooth", type: "married", src: ["S-fam-stones"] }], summary: "Ada's younger sister, 3 January 1904 to 11 November 1999 (her marker). In the family's January 1988 picture with Ada and Charlie." },
    { id: "P-charliec", sex: "M", status: "possible", names: [{ given: "Charles", surname: "Culberson", type: "birth", src: ["S-fam-stones"] }], summary: "\\"Charlie\\", Ada's youngest brother, 14 July 1912 to 22 February 2001 (his stone); married Ida Elizabeth Martin (1914 to 1994). His family kept the Culberson pictures and put them online." }
  ]);
  const fc = L.families.find((f) => f.id === "F-culberson");
  if (fc) for (const id of ["P-callie", "P-charliec"]) if (!fc.children.includes(id)) fc.children.push(id);
  add(L.events, [
    { id: "E-birth-callie", type: "birth", who: ["P-callie"], date: { text: "3 Jan 1904", sort: "1904-01-03" }, conclusion: "Born 3 January 1904, by her grave marker.", confidence: "probable", assert: [{ src: "S-fam-stones", value: "CALLIE MAE CULBERSON MANTOOTH / JAN 3 1904", info: "secondary", ev: "direct" }] },
    { id: "E-death-callie", type: "death", who: ["P-callie"], date: { text: "11 Nov 1999", sort: "1999-11-11" }, conclusion: "Died 11 November 1999, by her grave marker.", confidence: "probable", assert: [{ src: "S-fam-stones", value: "NOV 11 1999", info: "primary", ev: "direct" }] },
    { id: "E-birth-charliec", type: "birth", who: ["P-charliec"], date: { text: "14 Jul 1912", sort: "1912-07-14" }, conclusion: "Born 14 July 1912, by the stone he shares with his wife Elizabeth.", confidence: "probable", assert: [{ src: "S-fam-stones", value: "CHARLES / JULY 14, 1912", info: "secondary", ev: "direct" }] },
    { id: "E-death-charliec", type: "death", who: ["P-charliec"], date: { text: "22 Feb 2001", sort: "2001-02-22" }, conclusion: "Died 22 February 2001, by the same stone.", confidence: "probable", assert: [{ src: "S-fam-stones", value: "FEB. 22, 2001", info: "primary", ev: "direct" }] }
  ]);
  if (Array.isArray(L.certainty)) for (const id of ["P-callie", "P-charliec"]) if (!L.certainty.some((c) => c.child === id)) L.certainty.push({ child: id, pct: 70, basis: "the family's captioned pictures (\\"Ada, Charlie & Callie\\", \\"Children of Bill & Mary\\") and their stones" });
''')
out.append("  L.album = {\n    built: \"2026-11-25\",\n    chapters: " + J(CHAPTERS) + ",\n    items: [\n" + ",\n".join("      " + J(it) for it in items) + "\n    ],\n    dropped: " + J(dropped) + "\n  };\n")
out.append("  const FACES = " + J({pid: [faces[pid], "M-" + facesrc[pid]["slug"]] for pid in faces}) + ";\n")
out.append('''  L.media = L.media || [];
  for (const it of L.album.items) add(L.media, [{ id: it.id, person: it.ppl[0] || null, people: it.ppl, img: it.img, src: it.src, caption: it.cap, year: it.y, when: it.when, album: true }]);
  /* a face for the medallions: its own record, so the person who owns it is the record's person */
  for (const [pid, [face, mid]] of Object.entries(FACES)) { const m = L.media.find((x) => x.id === mid); if (m) add(L.media, [{ id: mid + "-" + pid, person: pid, people: [pid], img: m.img, src: m.src, caption: m.caption, year: m.year, when: m.when, face, album: true }]); }
})(window.KIN_LINEAGE);
''')
open(HUB + "/lineage/album.js", "w").write("".join(out))
print("album.js", os.path.getsize(HUB + "/lineage/album.js"), "items", len(items))

# ---------- catalog.js: every file in the Kin media folder ----------
allf = json.load(open(KM + "/all.json"))
inalbum = {a["drive"]: a["slug"] for a in A}
size2uniq = {int(x["fileSize"]): i for i, x in enumerate(u)}
GROUPS = [
 ("family", "Family photographs and stones", lambda t: t.startswith(("TN_Culberson", "TN_Interwoven", "IFB_")) or re.match(r"^(1[0-9]_|0[6-9]_|1[0-9]{3}|20[0-9]{2}|Portrait|Peter_|Winn_|Richard_)", t)),
 ("records", "Records and book pages", lambda t: t.lower().endswith(".pdf") or t.startswith(("NARA_", "Joseph "))),
 ("places", "Places and times (context)", lambda t: True),
]
def group(t):
    for g, _, f in GROUPS:
        if f(t): return g
rows = []
for x in allf:
    t = x["title"]; g = group(t)
    st = "album" if x["id"] in inalbum else ("dropped" if x["id"] in {d["drive"] for d in dropped} else "")
    if not st and int(x.get("fileSize", 0)) in size2uniq and g == "family":
        i = size2uniq[int(x["fileSize"])]
        st = "album" if any(a["i"] == i for a in A) else ("in-kin" if i in ALREADY else ("dropped" if i in DROPPED else ""))
    rows.append([t, x["id"], g, x["mimeType"].split("/")[-1].replace("jpeg", "jpg"), int(x.get("fileSize", 0)), st])
rows.sort(key=lambda r: ([g[0] for g in GROUPS].index(r[2]), r[0].lower()))
bad = [r[0] for r in rows if re.search(r"\b\d{2,5}\s+[A-Z][a-z]+\s+(St|Ave|Rd|Dr|Blvd|Ln|Ct)\b", r[0])]
print("address-like names:", bad[:5])
cat = "/* Kin · every file in the Kin media folder in Drive (918, listed 25 Nov 2026 by Claude): [name, Drive id, group, type, bytes, state].\n   state: album = shown in the family album; in-kin = already in Kin's records; dropped = set aside (see the album); blank = not yet placed. */\n"
cat += "window.KIN_DRIVE = { listed: \"2026-11-25\", groups: " + J([dict(id=g[0], title=g[1]) for g in GROUPS]) + ",\n  files: [\n" + ",\n".join("    " + J(r) for r in rows) + "\n  ]\n};\n"
os.makedirs(HUB + "/album", exist_ok=True)
open(HUB + "/album/catalog.js", "w").write(cat)
import collections
print("catalog", len(rows), collections.Counter(r[2] for r in rows), collections.Counter(r[5] for r in rows))
