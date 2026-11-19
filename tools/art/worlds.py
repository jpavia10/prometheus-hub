#!/usr/bin/env python3
"""The menu's painted worlds (docs/art/requests/artreq_20261116-0300_prometheus-worlds.json): make each one with the best image model,
then prepare the three files the menu reads (deck/views/menu.js): art/worlds/world_{id}.webp, _depth.webp and _lights.webp.

  python3 tools/art/worlds.py make ID [ID ...] [--out DIR]     paint world_{id}.png into DIR (default: a scratch folder) with Nano Banana Pro
  python3 tools/art/worlds.py prep ID [ID ...] [--src DIR]      write the three webp files from DIR/world_{id}.png and list the id in index.json

The request went to Gemini, Grok and Muse on 2026-11-16 and nobody had started it by 2026-11-19, so Claude paints it through the Gemini
API (owner's rule 13 in jpavia10/titan-reliquary-preview CLAUDE.md: the paid key is for the best models only, Nano Banana Pro among them;
the free keys go first and have no image quota). Every picture is looked at before it is used; one with letters, a person or a cheap
render look is made again.

Depth and light are not painted a second time (that would double the cost and the pictures rarely line up): they are estimated from the
picture itself, the same way Titan's interim room plates are (tools/rooms/prep_hero_plates.py there). Depth: the lower frame is nearer
(a floor), sharp detail is nearer than haze, the sky is far. Light: the brightest few per cent of the picture, softened, so the menu's
shader makes the painted lamps and fires breathe. Nothing is drawn by code; both maps only describe the painting.
Keys: ~/.gemini_key_old and ~/.gemini_key_3 (free) first, then ~/.gemini_key (paid). Never printed.
"""
import base64, json, os, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REQ = os.path.join(ROOT, "docs/art/requests/artreq_20261116-0300_prometheus-worlds.json")
OUT = os.path.join(ROOT, "art/worlds")
API = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent"
MODEL = "gemini-3-pro-image"          # Nano Banana Pro
KEYS = ["~/.gemini_key_old", "~/.gemini_key_3", "~/.gemini_key"]


def request():
    return json.load(open(REQ, encoding="utf-8"))


def prompt_for(wid):
    r = request()
    w = next((x for x in r["worlds"] if x["id"] == wid), None)
    if not w:
        sys.exit(f"no world {wid!r} in the request")
    return (f"{w['prompt']}\n\nThis world's accent colour: {w['accent']}.\n\nComposition: {r['scene_rule']}\n\nStyle: {r['global_style']}\n\n"
            f"Avoid: {r['negative']}.\n\nOne single image, portrait 9:16, no borders.")


def keys():
    out = []
    for k in KEYS:
        p = os.path.expanduser(k)
        if os.path.exists(p):
            v = open(p).read().strip()
            if v:
                out.append(v)
    return out


def paint(text, size="2K"):
    last = ""
    for i, k in enumerate(keys(), 1):
        body = {"contents": [{"role": "user", "parts": [{"text": text}]}],
                "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": "9:16", "imageSize": size}}}
        req = urllib.request.Request(API % MODEL, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": k})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.load(r)
        except urllib.error.HTTPError as e:
            last = f"key{i}: HTTP {e.code} {e.read()[:160]!r}"
            continue
        for c in d.get("candidates", []):
            for p in (c.get("content") or {}).get("parts", []):
                blob = p.get("inline_data") or p.get("inlineData")
                if blob and blob.get("data"):
                    return base64.b64decode(blob["data"]), i
        last = f"key{i}: no image ({json.dumps(d)[:200]})"
    raise RuntimeError(last)


def make(ids, out):
    os.makedirs(out, exist_ok=True)
    for wid in ids:
        dst = os.path.join(out, f"world_{wid}.png")
        try:
            data, k = paint(prompt_for(wid))
        except Exception as e:  # noqa: BLE001
            print(f"{wid}: FAILED {e}")
            return 1
        open(dst, "wb").write(data)
        print(f"{wid}: {len(data)//1024} KB, key{k} -> {dst}")
    return 0


def prep(ids, src):
    import numpy as np
    from PIL import Image, ImageFilter

    def blur(a, r):
        return np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255

    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(OUT, "index.json")
    idx = json.load(open(idx_path, encoding="utf-8"))
    for wid in ids:
        im = Image.open(os.path.join(src, f"world_{wid}.png")).convert("RGB")
        W, H = im.size
        tw = 1080 if W >= 1080 else W                               # phones: 1080 wide is sharp and small enough
        th = round(H * tw / W)
        big = im.resize((tw, th), Image.LANCZOS)
        big.save(os.path.join(OUT, f"world_{wid}.webp"), "WEBP", quality=84, method=6)
        hw, hh = tw // 2, th // 2
        a = np.asarray(big.resize((hw, hh), Image.LANCZOS)).astype(np.float32) / 255
        lum = a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114
        # depth: floor gradient (bottom near) + in-focus detail (near) - open bright sky at the top (far)
        lap = np.abs(4 * lum - np.roll(lum, 1, 0) - np.roll(lum, -1, 0) - np.roll(lum, 1, 1) - np.roll(lum, -1, 1))
        lap = blur(lap / max(np.percentile(lap, 97), 1e-4), 12)
        lap = lap / max(lap.max(), 1e-4)
        y = np.linspace(0, 1, hh)[:, None] * np.ones((1, hw))
        floor = np.clip((y - 0.35) / 0.65, 0, 1) ** 1.2
        sky = np.clip((0.22 - y) / 0.22, 0, 1)
        dep = blur(0.18 + 0.5 * floor + 0.38 * lap - 0.15 * sky, 18)
        dep = (dep - dep.min()) / max(dep.max() - dep.min(), 1e-4)
        Image.fromarray((dep * 255).astype(np.uint8)).save(os.path.join(OUT, f"world_{wid}_depth.webp"), "WEBP", quality=80)
        # light: the brightest few per cent, softened, with a tight core
        hi = np.percentile(lum, 96.5)
        li = np.clip((lum - hi) / max(1 - hi, 1e-3), 0, 1)
        li = np.clip(blur(li, 3) * 0.7 + blur(li, 14) * 0.6, 0, 1)
        Image.fromarray((li * 255).astype(np.uint8)).save(os.path.join(OUT, f"world_{wid}_lights.webp"), "WEBP", quality=80)
        if wid not in idx["worlds"]:
            idx["worlds"].append(wid)
        sz = sum(os.path.getsize(os.path.join(OUT, f"world_{wid}{s}.webp")) for s in ("", "_depth", "_lights")) // 1024
        print(f"{wid}: {tw}x{th}, three files {sz} KB")
    order = [w["id"] for w in request()["worlds"]]
    idx["worlds"] = sorted(set(idx["worlds"]), key=lambda x: order.index(x) if x in order else 99)
    json.dump(idx, open(idx_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    open(idx_path, "a").write("\n")
    return 0


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 2 or a[0] not in ("make", "prep"):
        print(__doc__)
        sys.exit(0)
    opt = lambda f, d: a[a.index(f) + 1] if f in a else d  # noqa: E731
    ids = [x for i, x in enumerate(a[1:], 1) if not x.startswith("--") and a[i - 1] not in ("--out", "--src")]
    if ids == ["all"]:
        ids = [w["id"] for w in request()["worlds"]]
    scratch = os.environ.get("WORLDS_SCRATCH", "/tmp/worlds")
    sys.exit(make(ids, opt("--out", scratch)) if a[0] == "make" else prep(ids, opt("--src", scratch)))
