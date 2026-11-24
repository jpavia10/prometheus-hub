#!/usr/bin/env python3
"""Odyssey trip photos (2026-11-19): his own photos from Drive, reviewed one by one, published as scenery only.

Rules: the best frames of each trip, people and all (owner, 2026-11-23: "Privacy on oddessy isnt important. Its limiting scope and
reducing experience for me"); crop only for the picture's sake; nothing with a password, card or booking code on it. The image is
re-encoded from pixels only, so EXIF is not carried. Each photo is written twice:
  pillars/odyssey/photos/<id>.webp     1280 px on the long side, quality 72
  pillars/odyssey/photos/t/<id>.webp   360 px on the long side, quality 68 (the filmstrip)
Also writes pillars/odyssey/photos.js (window.ODYSSEY_PHOTOS: trip id -> photos in time order, local date and time).
Input: a review file (JSON) {drive file name: {src, keep, crop:[x0,y0,x1,y1] in the oriented image, cap}} and the trip/date table below.

  python3 tools/odyssey/photos.py review.json [--merge]     --merge keeps the photos already published and adds these
"""
import json, os, re, sys
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "pillars", "odyssey", "photos")

# Each trip's first and last day (YYYYMMDD) -> the photo id prefix and the trip id in odyssey-data.js (2026-11-23: the ten trips
# found in his photos joined the three planned ones).
SPANS = [("20150804", "20150930", "eu15", "seed-eurotrip-2015"), ("20151023", "20151025", "atl15", "photos-atlanta-2015"),
         ("20180620", "20180621", "bsr18", "photos-bigsur-2018"), ("20180814", "20180816", "seq18", "photos-sequoia-2018"),
         ("20190608", "20190610", "gcn19", "photos-vegas-2019"), ("20190824", "20190830", "mex19", "photos-mexico-2019"),
         ("20210306", "20210307", "ncal21", "photos-norcal-2021"), ("20220409", "20220411", "san22", "photos-sandiego-2022"),
         ("20220601", "20220605", "mi22", "photos-michigan-2022"), ("20220916", "20220918", "mmh22", "photos-mammoth-2022"),
         ("20230511", "20230515", "mi23", "photos-michigan-2023"), ("20240406", "20240421", "ph24a", "seed-philippines-2024-04"),
         ("20240830", "20240909", "ph24b", "seed-philippines-2024"),
         # 2026-11-23 (run 6): six more trips found in his photos, ready for their photo picks (ODY-GEM-21)
         ("20150302", "20150307", "la15", "photos-la-2015"), ("20180324", "20180328", "mon18", "photos-monroe-2018"),
         ("20200130", "20200203", "det20", "photos-detroit-2020"), ("20200710", "20200713", "zio20", "photos-zion-2020"),
         ("20220912", "20220915", "mi22b", "photos-michigan-2022-09"), ("20230902", "20230904", "mia23", "photos-miami-2023")]
TRIPS = {k: t for _, _, k, t in SPANS}

def trip_of(name):
    d = re.match(r"(20\d{6})", name).group(1)
    for a, b, k, _ in SPANS:
        if a <= d <= b: return k
    raise SystemExit(f"{name}: no trip covers {d}")

def local_time(name):
    """On the Eurotrip the 2015 phone named files in Michigan time (EDT, UTC-4): +6 h in mainland Europe and Malta, +5 h in the UK
    (from Sep 25). Every other trip's files carry the local time (Atlanta was on Michigan's clock anyway; the later phones set their own
    zone). Returns (YYYY-MM-DD, HH:MM)."""
    import datetime as dt
    m = re.search(r"(20\d{6})_(\d{6})", name); t = dt.datetime.strptime(m.group(1) + m.group(2), "%Y%m%d%H%M%S")
    if "20150804" <= m.group(1) <= "20150930": t += dt.timedelta(hours=5 if m.group(1) >= "20150925" else 6)
    return t.strftime("%Y-%m-%d"), t.strftime("%H:%M")

def main(review, merge=False):
    """merge=True (2026-11-23): keep every photo already in the manifest and add or replace only the ones in this review file."""
    r = json.load(open(review)); os.makedirs(os.path.join(OUT, "t"), exist_ok=True); rows = []
    if merge:
        rows = [x for x in json.load(open(os.path.join(HERE, "photos.manifest.json"))) if x["src"] not in r]
    for name, v in sorted(r.items()):
        if not v.get("keep"): continue
        im = ImageOps.exif_transpose(Image.open(v["src"])).convert("RGB")
        if v.get("crop"): im = im.crop(tuple(v["crop"]))
        pid = trip_of(name) + "-" + re.sub(r"[^0-9_]", "", name.split(".")[0].split("~")[0])[:15].replace("_", "")
        for sub, edge, q in (("", 1280, 72), ("t", 360, 68)):
            x = im.copy(); x.thumbnail((edge, edge), Image.LANCZOS)
            x.save(os.path.join(OUT, sub, pid + ".webp"), "WEBP", quality=q, method=6)
        at, hm = local_time(name)
        rows.append({"id": pid, "trip": TRIPS[pid.split("-")[0]], "at": at, "t": hm, "w": im.width, "h": im.height, "cap": v["cap"], "src": name,
                     **({"leg": v["leg"]} if v.get("leg") else {})})   # leg: the stop code it belongs to, when two stops share a day
        print(pid, im.size, os.path.getsize(os.path.join(OUT, pid + ".webp")) // 1024, "KB")
    json.dump(rows, open(os.path.join(HERE, "photos.manifest.json"), "w"), indent=1)
    by = {}
    for x in sorted(rows, key=lambda x: (x["at"], x["t"])):
        by.setdefault(x["trip"], []).append({k: x[k] for k in ("id", "at", "t", "w", "h", "cap", "leg") if k in x})
    with open(os.path.join(OUT, "..", "photos.js"), "w") as f:
        f.write("/* Odyssey trip photos, generated by tools/odyssey/photos.py from his own photos in Drive (reviewed one by one: the best\n"
                "   frames of each trip, people and all). at/t = local date and time. Do not edit by hand. */\n")
        f.write("window.ODYSSEY_PHOTOS = " + json.dumps(by, ensure_ascii=False, separators=(",", ":")).replace('],"', '],\n"') + ";\n")
    print(len(rows), "photos")

if __name__ == "__main__":
    main(sys.argv[1], "--merge" in sys.argv)
