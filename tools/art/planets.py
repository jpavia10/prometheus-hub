#!/usr/bin/env python3
"""Planet faces for the Orbit (Claude, 2026-11-21): a square crop of each pillar's world painting (art/worlds/world_{id}.webp),
taken from the upper-middle where the paintings put their subject, at 320 px, so the 3D orbit loads 27 small textures
instead of 27 full paintings. Writes art/worlds/planet_{id}.webp for every id in art/worlds/index.json.

    python3 tools/art/planets.py
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ART = os.path.join(ROOT, "art", "worlds")

def main():
    ids = json.load(open(os.path.join(ART, "index.json")))["worlds"]
    for wid in ids:
        im = Image.open(os.path.join(ART, f"world_{wid}.webp")).convert("RGB")
        w, h = im.size; s = min(w, h); top = max(0, min(h - s, int(h * 0.30 - s / 2)))
        face = im.crop((0, top, s, top + s)).resize((320, 320), Image.LANCZOS)
        face.save(os.path.join(ART, f"planet_{wid}.webp"), "WEBP", quality=82, method=6)
    print(f"{len(ids)} planet faces written")

if __name__ == "__main__":
    main()
