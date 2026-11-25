#!/usr/bin/env python3
"""The town's recordings, second set (2026-11-25, owner: "The sound design is terrible also. It should be 1000 percent better").

  python3 tools/audio/town.py --raw DIR [--only id,id]

DIR is a checkout of Moodist's public/sounds/ (https://github.com/remvze/moodist; the sounds are CC0 or the Pixabay Content License,
see audio/town/CREDITS.md). Writes audio/town/<id>.webm (Opus) and .m4a (AAC, Safari) and audio/town/takes.json.

Loops: the steadiest stretch of the recording, its tail crossfaded into its head (equal power) so it repeats without a seam, about
-21 dBFS RMS (a look-ahead limiter keeps the peaks under -1 dBFS). Sounds placed in the painting (a river, a waterfall, the dock) are mono: the page pans them by where
they are on screen. One-shots: every event louder than its surroundings is found, the cleanest takes kept, each faded in and out,
joined with half a second of silence; takes.json lists [start, length] for each. The dock's creak is Titan's (its sailboat cut).
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np

FF = "ffmpeg"
SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "audio", "town")

# id: (source, seconds, crossfade, mono)
LOOPS = {
    "river":     ("nature/river.mp3",          26, 3.0, True),    # the river and the lake through the middle of the town
    "waterfall": ("nature/waterfall.mp3",      18, 2.5, True),    # the two falls (beside Titan's hall, below Money)
    "lapping":   ("nature/waves.mp3",          26, 3.0, True),    # water at the dock, filtered soft on the page
    "fountain":  ("nature/droplets.mp3",       20, 2.5, True),    # the fountain under the core's spire
    "frogs":     ("animals/frog.mp3",          26, 3.0, True),    # by the lake, warm nights
    "chimes":    ("things/wind-chimes.mp3",    30, 3.0, True),    # the porch of Hearth's house, in a breeze
    "leaves":    ("rain/rain-on-leaves.mp3",   30, 3.0, False),   # rain in the trees
    "windTrees": ("nature/wind-in-trees.mp3",  30, 3.0, False),   # wind through the forests on the slopes
}
# id: (source, takes to keep, min, max seconds)
SHOTS = {
    "crows":      ("animals/crows.mp3",       5, 0.8, 6.0),
    "woodpecker": ("animals/woodpecker.mp3",  3, 0.6, 4.0),
    "dog":        ("animals/dog-barking.mp3", 4, 0.4, 3.5),
    "fireworks":  ("urban/fireworks.mp3",     5, 1.2, 7.0),
}


def read(path, mono):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    return a.reshape(-1, 1) if mono else a.reshape(-1, 2)


def write(a, name, mono):
    with tempfile.NamedTemporaryFile(suffix=".f32") as t:
        t.write(np.ascontiguousarray(a, dtype=np.float32).tobytes()); t.flush()
        common = [FF, "-v", "error", "-y", "-f", "f32le", "-ac", str(a.shape[1]), "-ar", str(SR), "-i", t.name]
        subprocess.run(common + ["-c:a", "libopus", "-b:a", "48k" if mono else "80k", "-vbr", "on", os.path.join(OUT, name + ".webm")], check=True)
        subprocess.run(common + ["-c:a", "aac", "-b:a", "48k" if mono else "64k", "-movflags", "+faststart", os.path.join(OUT, name + ".m4a")], check=True)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-12)


def limit(a, ceiling=-1.0, look=0.005, release=0.12):
    """A look-ahead peak limiter: the gain comes down before a peak (5 ms) and recovers slowly, so drops and chime strikes keep their
    shape while the bed between them is brought up to a usable level."""
    c = 10 ** (ceiling / 20); n = int(look * SR); peak = np.max(np.abs(a), axis=1)
    from numpy.lib.stride_tricks import sliding_window_view
    pad = np.concatenate([peak, np.zeros(n)]); ahead = sliding_window_view(pad, n + 1).max(axis=1)[:len(peak)]
    want = np.minimum(1.0, c / np.maximum(ahead, 1e-9)); g = np.empty_like(want); r = np.exp(-1 / (release * SR)); cur = 1.0
    for i in range(len(want)):
        cur = want[i] if want[i] < cur else want[i] + (cur - want[i]) * r
        g[i] = cur
    return a * g.reshape(-1, 1)


def level(a, target=-21.0, ceiling=-1.0):
    g = min(10 ** ((target - rms_db(a)) / 20), 10 ** (24 / 20))
    return limit(a * g, ceiling)


def steadiest(a, seconds):
    n = int(seconds * SR)
    if len(a) <= n: return a
    win = SR // 2
    e = np.array([rms_db(a[i:i + win]) for i in range(0, len(a) - win, win)])
    k = n // win; best, bi = 1e9, 0
    for i in range(0, len(e) - k):
        s = np.std(e[i:i + k])
        if s < best: best, bi = s, i
    return a[bi * win: bi * win + n]


def loop(a, xf):
    x = int(xf * SR); body, tail = a[:-x], a[-x:]
    t = np.linspace(0, np.pi / 2, x).reshape(-1, 1)
    head = body[:x] * np.sin(t) + tail * np.cos(t)                   # the tail fades out under the head fading in: equal power
    return np.concatenate([head, body[x:]])


def takes(a, keep, lo, hi):
    hop = int(0.02 * SR); env = np.array([np.sqrt(np.mean(np.square(a[i:i + hop]))) for i in range(0, len(a) - hop, hop)])
    db = 20 * np.log10(env + 1e-9); floor = np.percentile(db, 20); thr = floor + 0.55 * (np.max(db) - floor)
    on = db > thr; segs = []; i = 0
    while i < len(on):
        if not on[i]: i += 1; continue
        j = i
        while j < len(on) and (on[j] or (j + 15 < len(on) and on[j:j + 15].any())): j += 1   # bridge gaps under 0.3 s
        s, e = max(0, i - 3) * hop, min(len(a), (j + 12) * hop)                              # 60 ms before, 240 ms of tail
        d = (e - s) / SR
        if lo <= d <= hi:
            seg = a[s:e]; score = np.max(db[i:j]) - floor
            segs.append((score, s, e))
        i = j + 1
    segs.sort(reverse=True); segs = sorted(segs[:keep], key=lambda x: x[1])
    out, table, pos, gap = [], [], 0, np.zeros((SR // 2, a.shape[1]), dtype=np.float32)
    for _, s, e in segs:
        seg = a[s:e].copy(); f = min(len(seg) // 4, int(0.25 * SR)); fi = min(len(seg) // 8, int(0.012 * SR))
        seg[:fi] *= np.linspace(0, 1, fi).reshape(-1, 1); seg[-f:] *= np.linspace(1, 0, f).reshape(-1, 1) ** 2
        out += [seg, gap]; table.append([round(pos / SR, 3), round(len(seg) / SR, 3)]); pos += len(seg) + len(gap)
    return (np.concatenate(out) if out else np.zeros((SR, a.shape[1]), dtype=np.float32)), table


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--raw", required=True); ap.add_argument("--only", default="")
    args = ap.parse_args(); only = set(filter(None, args.only.split(",")))
    os.makedirs(OUT, exist_ok=True)
    tpath = os.path.join(OUT, "takes.json"); table = json.load(open(tpath)) if os.path.exists(tpath) else {}
    table.setdefault("thunder", [[0, 15], [15.5, 15], [31, 15]]); table.setdefault("owl", [[0, 3.4], [3.9, 3.2]])   # the first set (Titan's cuts)
    for k, (src, secs, xf, mono) in LOOPS.items():
        if only and k not in only: continue
        a = read(os.path.join(args.raw, src), mono); a = level(loop(steadiest(a, secs + xf), xf)); write(a, k, mono)
        print(f"loop {k:10s} {len(a) / SR:5.1f} s  rms {rms_db(a):6.1f} dB  peak {20 * np.log10(np.max(np.abs(a))):5.1f} dB")
    for k, (src, keep, lo, hi) in SHOTS.items():
        if only and k not in only: continue
        a = read(os.path.join(args.raw, src), True); a, t = takes(a, keep, lo, hi); a = a * (10 ** (-3 / 20) / (np.max(np.abs(a)) + 1e-9)); write(a, k, True); table[k] = t   # one-shots: peaks at -3 dBFS
        print(f"shot {k:10s} {len(t)} takes {t}")
    json.dump(table, open(tpath, "w"), indent=1)


if __name__ == "__main__":
    sys.exit(main())
