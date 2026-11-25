#!/usr/bin/env python3
"""The Orbit's realm (docs/art/requests/artreq_20261122-realm.json): one panoramic painting where every pillar is a place.

  python3 tools/art/realm.py make [--out DIR]                    paint realm.png (21:9, 4K) with Nano Banana Pro
  python3 tools/art/realm.py edit SRC "instruction" [--out FILE]  change a painting (add or fix a landmark) with the same model
  python3 tools/art/realm.py prep SRC                              write art/realm/realm_6k.webp, realm_4k.webp, realm_depth.webp, realm_lights.webp
  python3 tools/art/realm.py season SRC autumn|winter             (2026-11-25) a season painting of the same town, aligned to realm_6k and
                                                                   written as art/realm/realm_<season>.webp (4096 wide)

Same rules as tools/art/worlds.py: the paid key only for the best model, every picture looked at before use, depth and light estimated
from the painting itself (lower frame nearer, sharp detail nearer, sky far; light = the brightest few per cent, softened). Keys never printed.
"""
import base64, json, os, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REQ = os.path.join(ROOT, "docs/art/requests/artreq_20261122-realm.json")
OUT = os.path.join(ROOT, "art/realm")
API = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent"
MODEL = "gemini-3-pro-image"
KEYS = ["~/.gemini_key_old", "~/.gemini_key_3", "~/.gemini_key"]


def keys():
    out = []
    for k in KEYS:
        p = os.path.expanduser(k)
        if os.path.exists(p) and open(p).read().strip():
            out.append(open(p).read().strip())
    return out


def call(parts, aspect, size):
    last = ""
    for k in keys():
        body = {"contents": [{"role": "user", "parts": parts}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": size}}}
        req = urllib.request.Request(API % MODEL, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": k})
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                j = json.load(r)
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read()[:200]!r}"; continue
        for c in j.get("candidates", []):
            for p in c.get("content", {}).get("parts", []):
                d = p.get("inlineData") or p.get("inline_data")
                if d and d.get("data"):
                    return base64.b64decode(d["data"])
        last = "no image in the answer: " + json.dumps(j)[:300]
    sys.exit("could not paint: " + last)


def make(out):
    r = json.load(open(REQ, encoding="utf-8"))
    text = f"{r['prompt']}\n\nStyle: {r['style']}\n\nAvoid: {r['negative']}.\n\nOne single ultra-wide image, {r['aspect']}, no borders."
    os.makedirs(out, exist_ok=True); dst = os.path.join(out, "realm.png")
    open(dst, "wb").write(call([{"text": text}], r["aspect"], r["size"])); print("wrote", dst)


def edit(src, instruction, out):
    r = json.load(open(REQ, encoding="utf-8"))
    img = base64.b64encode(open(src, "rb").read()).decode()
    mime = "image/png" if src.endswith(".png") else "image/webp" if src.endswith(".webp") else "image/jpeg"
    text = f"Edit this painting. {instruction} Keep everything else exactly as it is: the same composition, light, palette and style. Avoid: {r['negative']}."
    open(out, "wb").write(call([{"inlineData": {"mimeType": mime, "data": img}}, {"text": text}], r["aspect"], r["size"])); print("wrote", out)


def prep(src):
    import numpy as np
    from PIL import Image, ImageFilter
    os.makedirs(OUT, exist_ok=True)
    im = Image.open(src).convert("RGB"); w, h = im.size
    for tag, W in (("6k", 6144), ("4k", 4096)):
        im.resize((W, round(h * W / w)), Image.LANCZOS).save(os.path.join(OUT, f"realm_{tag}.webp"), "WEBP", quality=84, method=6)
    W2 = 2048; small = im.resize((W2, round(h * W2 / w)), Image.LANCZOS); a = np.asarray(small).astype(np.float32) / 255.0
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32); H2 = lum.shape[0]
    def blur(x, r): return np.asarray(Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255.0
    yy = np.linspace(0, 1, H2, dtype=np.float32)[:, None] * np.ones((1, W2), np.float32)
    detail = blur(np.abs(lum - blur(lum, 3)) * 6, 10)
    sky = np.clip((0.42 - yy) / 0.42, 0, 1) * np.clip(1 - detail * 3, 0, 1)
    dep = np.clip(0.15 + 0.65 * yy ** 1.3 + 0.35 * detail - 0.45 * sky, 0, 1); dep = blur(dep, 6)
    Image.fromarray((dep * 255).astype(np.uint8)).save(os.path.join(OUT, "realm_depth.webp"), "WEBP", quality=80)
    thr = np.quantile(lum, 0.965); li = np.clip((lum - thr) / max(1e-3, 1 - thr), 0, 1); li = blur(li, 3) * 0.7 + blur(li, 12) * 0.6
    # 2026-11-25: G = each lit shape's own number (12-255; 0 = no light), so late at night the town turns windows off a shape at a time
    # (realm.js LATE); lossless, or the numbers would bleed across shapes
    import cv2
    r8 = (np.clip(li, 0, 1) * 255).astype(np.uint8); n, lab = cv2.connectedComponents((r8 > 20).astype(np.uint8), connectivity=8)
    ids = np.zeros(n, np.uint8); ids[1:] = np.random.default_rng(20261125).integers(12, 256, n - 1)
    Image.fromarray(np.dstack([r8, ids[lab], np.zeros_like(r8)])).save(os.path.join(OUT, "realm_lights.webp"), "WEBP", lossless=True, quality=100, method=6)
    for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")


def season(src, name):
    """Align a season repaint (an `edit` of realm_6k.webp) to the town: an affine fit on edge maps (OpenCV ECC), then 4096 wide."""
    import cv2, numpy as np
    from PIL import Image
    base = cv2.imread(os.path.join(OUT, "realm_6k.webp")); H, W = base.shape[:2]; W2 = 2048; H2 = round(H * W2 / W)
    def gm(x):
        x = cv2.cvtColor(x, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255; gx = cv2.Sobel(x, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(x, cv2.CV_32F, 0, 1, ksize=3)
        return cv2.GaussianBlur(np.sqrt(gx * gx + gy * gy), (0, 0), 1.2)
    e = cv2.resize(cv2.imread(src), (W, H), interpolation=cv2.INTER_AREA)
    M = np.eye(2, 3, dtype=np.float32)
    cc, M = cv2.findTransformECC(gm(cv2.resize(base, (W2, H2), interpolation=cv2.INTER_AREA)), gm(cv2.resize(e, (W2, H2), interpolation=cv2.INTER_AREA)), M, cv2.MOTION_AFFINE,
                                 (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    M[:, 2] *= W / W2; al = cv2.warpAffine(e, M, (W, H), flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    im = Image.fromarray(cv2.cvtColor(al, cv2.COLOR_BGR2RGB)); im = im.resize((4096, round(im.height * 4096 / im.width)), Image.LANCZOS)
    dst = os.path.join(OUT, f"realm_{name}.webp"); im.save(dst, "WEBP", quality=82, method=6); print("ecc", round(cc, 3), "wrote", dst, os.path.getsize(dst) // 1024, "KB")


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    if a[0] == "make": make(a[a.index("--out") + 1] if "--out" in a else "/tmp/realm")
    elif a[0] == "edit": edit(a[1], a[2], a[a.index("--out") + 1] if "--out" in a else a[1].replace(".png", "_edit.png"))
    elif a[0] == "prep": prep(a[1])
    elif a[0] == "season": season(a[1], a[2])
    else: sys.exit(__doc__)
