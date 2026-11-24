#!/usr/bin/env python3
"""Odyssey's base map (2026-11-19): country outlines for the regions where filed trips have mapped legs.

Source: Natural Earth 1:50m admin-0 countries (public domain), as packaged in the npm package world-atlas@2.0.2
(countries-50m.json, TopoJSON). Get it with `npm pack world-atlas@2.0.2` and pass the unpacked countries-50m.json.

Output: pillars/odyssey/basemap.js, window.ODYSSEY_BASEMAP = [{id, bbox:[w,s,e,n], d}], where d is one SVG path for all countries
in the region in units of 1/100 degree with y = -latitude (x = lon*100, y = -lat*100). The page draws it under a scale(cos(lat0), 1)
transform, which is the equirectangular projection it uses for the trip's own stops, so no point is projected in the browser.
Each ring is clipped to the region (Sutherland-Hodgman), simplified (Douglas-Peucker) and written with relative moves.

  python3 tools/odyssey/basemap.py path/to/countries-50m.json [path/to/states-10m.json]   (us-atlas@3.0.1: US state lines, b)
"""
import json, math, sys, os

REGIONS = [  # [west, south, east, north] in degrees, with room around the trips' stops; tol = simplification in degrees
    {"id": "europe", "bbox": [-16, 29, 36, 62], "tol": 0.035, "min_area": 0.004},
    {"id": "philippines", "bbox": [113, 3, 131, 22], "tol": 0.015, "min_area": 0.002},
    {"id": "west", "bbox": [-128, 17, -103, 44], "tol": 0.03, "min_area": 0.004, "states": True},  # 2026-11-23: California, Nevada and the Mexican Riviera trips from his photos
    {"id": "east", "bbox": [-92, 24, -74, 47], "tol": 0.03, "min_area": 0.004, "states": True},   # 2026-11-23: Georgia and Michigan; 2026-11-24: down to 24 N for Miami Beach (it fell off the map)
]

def decode(topo):
    sx, sy = topo["transform"]["scale"]; tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0; pts = []
        for dx, dy in arc:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs

def ring(arcs, idx):
    out = []
    for i in idx:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(pts if not out else pts[1:])
    return out

def polygons(topo, arcs):
    for g in topo["objects"]["countries"]["geometries"]:
        if g["type"] == "Polygon": polys = [g["arcs"]]
        elif g["type"] == "MultiPolygon": polys = g["arcs"]
        else: continue
        for poly in polys:
            for r in poly: yield ring(arcs, r)

def clip(pts, w, s, e, n):
    def edge(pts, inside, cross):
        out = []
        for i, cur in enumerate(pts):
            prev = pts[i - 1]
            if inside(cur):
                if not inside(prev): out.append(cross(prev, cur))
                out.append(cur)
            elif inside(prev): out.append(cross(prev, cur))
        return out
    def at_x(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))
    def at_y(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    for inside, cross in ((lambda p: p[0] >= w, at_x(w)), (lambda p: p[0] <= e, at_x(e)), (lambda p: p[1] >= s, at_y(s)), (lambda p: p[1] <= n, at_y(n))):
        if not pts: break
        pts = edge(pts, inside, cross)
    return pts

def dp(pts, tol):
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop(); ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-12
        far, fi = 0, -1
        for i in range(a + 1, b):
            d = abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L
            if d > far: far, fi = d, i
        if far > tol: keep[fi] = True; stack += [(a, fi), (fi, b)]
    return [p for p, k in zip(pts, keep) if k]

def dp_ring(pts, tol):
    """A closed ring: split at the point farthest from the first, simplify each half (a chord from a point to itself has no length)."""
    m = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
    return dp(pts[:m + 1], tol)[:-1] + dp(pts[m:] + [pts[0]], tol)[:-1]

def area(pts):
    return abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2

def path(rings):
    out = []
    for r in rings:
        q = []
        for lon, lat in r:
            p = (round(lon * 100), round(-lat * 100))
            if not q or q[-1] != p: q.append(p)
        if len(q) < 4: continue
        s = f"M{q[0][0]} {q[0][1]}l" + " ".join(f"{b[0] - a[0]} {b[1] - a[1]}" for a, b in zip(q, q[1:])) + "z"
        out.append(s.replace(" -", "-"))
    return "".join(out)

def borders(states, w, s, e, n, tol):
    """US state lines (2026-11-23): the arcs two states share (the coast is already the land's edge), cut to the region and
    simplified; one path of polylines in the same units as d."""
    topo = json.load(open(states)); arcs = decode(topo); use = {}
    for g in topo["objects"]["states"]["geometries"]:
        polys = [g["arcs"]] if g["type"] == "Polygon" else g["arcs"] if g["type"] == "MultiPolygon" else []
        for poly in polys:
            for r in poly:
                for i in r: use[i if i >= 0 else ~i] = use.get(i if i >= 0 else ~i, 0) + 1
    out = []
    for i, k in use.items():
        if k < 2: continue
        run = []
        for lon, lat in arcs[i] + [(9e9, 9e9)]:
            if w <= lon <= e and s <= lat <= n: run.append((lon, lat)); continue
            if len(run) >= 2:
                q = [(round(x * 100), round(-y * 100)) for x, y in dp(run, tol)]
                out.append(f"M{q[0][0]} {q[0][1]}l" + " ".join(f"{b[0] - a[0]} {b[1] - a[1]}" for a, b in zip(q, q[1:])).replace(" -", "-"))
            run = []
    return "".join(out)


def main(src, dst, states=None):
    topo = json.load(open(src)); arcs = decode(topo); rings = list(polygons(topo, arcs)); regions = []
    for R in REGIONS:
        w, s, e, n = R["bbox"]; kept = []
        for r in rings:
            xs = [p[0] for p in r]; ys = [p[1] for p in r]
            if max(xs) < w or min(xs) > e or max(ys) < s or min(ys) > n: continue
            c = clip(r, w, s, e, n)
            if len(c) < 3 or area(c) < R["min_area"]: continue
            c = dp_ring(c, R["tol"])
            if len(c) >= 3: kept.append(c)
        d = path(kept); reg = {"id": R["id"], "bbox": R["bbox"], "d": d}
        if states and R.get("states"): reg["b"] = borders(states, w, s, e, n, R["tol"])
        regions.append(reg)
        print(f"{R['id']}: {len(kept)} rings, {len(d):,} bytes" + (f", state lines {len(reg['b']):,} bytes" if "b" in reg else ""))
    with open(dst, "w") as f:
        f.write("/* Odyssey base map, generated by tools/odyssey/basemap.py from Natural Earth 1:50m countries (public domain, world-atlas@2.0.2).\n"
                "   d: one SVG path per region, x = lon*100, y = -lat*100; drawn under scale(cos(lat0),1). b: US state lines (us-atlas@3.0.1, public domain).\n"
                "   Do not edit by hand. */\n")
        f.write("window.ODYSSEY_BASEMAP = " + json.dumps(regions, separators=(",", ":")) + ";\n")
    print(f"wrote {dst}: {os.path.getsize(dst):,} bytes")

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    main(sys.argv[1], os.path.join(here, "..", "..", "pillars", "odyssey", "basemap.js"), sys.argv[2] if len(sys.argv) > 2 else None)
