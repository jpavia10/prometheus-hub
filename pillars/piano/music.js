/* Piano music math (Sebastian, 2026-11-09): pure chord/progression/pattern data. No DOM, no audio.
   Voicing follows Joseph's comping practice: bass root (or fifth) down low, two chord tones up top,
   extended with rootless A/B forms and semitone-optimal voice leading for Bossa Piano Studio.
   window.PIANO_MUSIC = { NAMES, QUALITIES, chord, progression, PATTERN, invertChord, voiceLead } */
(function () {
  "use strict";
  const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const QUALITIES = {
    "maj7": { label: "major 7", intervals: [0, 4, 7, 11] },
    "maj9": { label: "major 9", intervals: [0, 4, 7, 11, 14] },
    "6": { label: "6", intervals: [0, 4, 7, 9] },
    "m7": { label: "minor 7", intervals: [0, 3, 7, 10] },
    "m9": { label: "minor 9", intervals: [0, 3, 7, 10, 14] },
    "m7b5": { label: "half-diminished", intervals: [0, 3, 6, 10] },
    "7": { label: "dominant 7", intervals: [0, 4, 7, 10] },
    "9": { label: "dominant 9", intervals: [0, 4, 7, 10, 14] },
    "13": { label: "dominant 13", intervals: [0, 4, 7, 10, 21] },
    "dim7": { label: "diminished 7", intervals: [0, 3, 6, 9] },
  };
  const idx = (name) => NAMES.indexOf(name);
  const MIDI_MIN = 55; // G3
  const MIDI_MAX = 79; // G5

  /** Full spelling + the comping voicing (bass root/fifth + guide pair) for a chord. */
  function chord(root, quality) {
    const q = QUALITIES[quality]; if (!q || idx(root) < 0) throw new Error("unknown chord " + root + quality);
    const notes = q.intervals.map((i) => NAMES[(idx(root) + i) % 12]);
    const third = q.intervals.find((i) => i === 3 || i === 4);
    const color = [...q.intervals].reverse().find((i) => i >= 9) ?? 7;
    const base = 60 + idx(root); // upper voicing around octave 4
    return {
      name: root + quality, root, quality, notes,
      bass: [36 + idx(root), 36 + idx(root) + 7],           // root, fifth (MIDI)
      tones: [base + third, base + color],                  // guide pair up top (MIDI)
      spell: notes.join(" · "),
    };
  }

  /** ii–V–I–vi in a major key, with bossa color (m9, 13, maj9). */
  function progression(key) {
    const r = idx(key); if (r < 0) throw new Error("unknown key " + key);
    const at = (deg, q) => chord(NAMES[(r + deg) % 12], q);
    return [{ role: "ii", ...at(2, "m9") }, { role: "V", ...at(7, "13") }, { role: "I", ...at(0, "maj9") }, { role: "vi", ...at(9, "m7") }];
  }

  function roleForColor(quality, iv) {
    if (iv === 21) return "13";
    if (iv === 14) return "9";
    if (iv === 9) return quality === "6" ? "6" : "7";
    if (iv === 10 || iv === 11) return "7";
    if (iv === 6) return "b5";
    return "5";
  }

  function rootlessDegrees(quality) {
    const q = QUALITIES[quality];
    const third = q.intervals.find((i) => i === 3 || i === 4);
    const fifthRaw = q.intervals.find((i) => i === 6 || i === 7);
    const fifthIv = quality === "13" ? 9 : fifthRaw;
    const fifthRole = quality === "13" ? "13" : (fifthIv === 6 ? "b5" : "5");
    const seventhIv = q.intervals.find((i) => i === 9 || i === 10 || i === 11);
    const seventhRole = quality === "6" ? "6" : "7";
    return [
      { iv: third, role: "3" },
      { iv: fifthIv, role: fifthRole },
      { iv: seventhIv, role: seventhRole },
      { iv: 14, role: "9" },
    ];
  }

  function normalizeChord(ch) {
    if (!ch || !ch.root || !ch.quality) throw new Error("invalid chord object");
    const built = chord(ch.root, ch.quality);
    return { ...built, ...ch, bass: Array.isArray(ch.bass) && ch.bass.length >= 2 ? [...ch.bass] : built.bass, tones: Array.isArray(ch.tones) && ch.tones.length >= 2 ? [...ch.tones] : built.tones };
  }

  function fitInRange(baseMidis, min = MIDI_MIN, max = MIDI_MAX) {
    const candidates = [];
    for (let shift = -24; shift <= 24; shift += 12) {
      const shifted = baseMidis.map((m) => m + shift);
      if (shifted[0] >= min && shifted[shifted.length - 1] <= max) candidates.push(shifted);
    }
    if (!candidates.length) return baseMidis;
    const mean = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length;
    candidates.sort((a, b) => Math.abs(mean(a) - 67) - Math.abs(mean(b) - 67));
    return candidates[0];
  }

  /** Voicing & inversion transform:
      0 = comping shell (bass root + upper guide tones)
      1 = 1st inversion upper tones shifted
      2 = rootless A-form (3-5-7-9)
      3 = rootless B-form (7-9-3-5) */
  function invertChord(ch, invIndex = 0) {
    const base = normalizeChord(ch);
    const r = idx(base.root);
    const q = QUALITIES[base.quality];
    const modeIdx = ((Math.trunc(Number(invIndex) || 0) % 4) + 4) % 4;
    const colorIv = [...q.intervals].reverse().find((i) => i >= 9) ?? 7;
    const colorRole = roleForColor(base.quality, colorIv);
    const bass = [...base.bass];

    if (modeIdx === 0) {
      const tones = [...base.tones];
      const midi = [bass[0], ...tones];
      return {
        ...base,
        voicingMode: "shell",
        invIndex: 0,
        bass,
        tones,
        midi,
        notes: midi.map((m) => NAMES[m % 12]),
        roles: ["R", "3", colorRole],
      };
    }

    if (modeIdx === 1) {
      let lo = base.tones[1];
      let hi = base.tones[0] + 12;
      while (lo >= hi) lo -= 12;
      while (hi > 82) { lo -= 12; hi -= 12; }
      while (lo < MIDI_MIN) { lo += 12; hi += 12; }
      const tones = [lo, hi];
      const midi = [bass[0], ...tones];
      return {
        ...base,
        voicingMode: "1st-inv",
        invIndex: 1,
        bass,
        tones,
        midi,
        notes: midi.map((m) => NAMES[m % 12]),
        roles: ["R", colorRole, "3"],
      };
    }

    const degs = rootlessDegrees(base.quality);
    const ordered = modeIdx === 2
      ? degs
      : [degs[2], degs[3], { iv: degs[0].iv + 12, role: degs[0].role }, { iv: degs[1].iv + 12, role: degs[1].role }];
    const anchor = modeIdx === 2 ? 60 : 48;
    const tones = fitInRange(ordered.map((d) => anchor + r + d.iv));
    const midi = [...tones];
    return {
      ...base,
      voicingMode: modeIdx === 2 ? "rootless-a" : "rootless-b",
      invIndex: modeIdx,
      bass,
      tones,
      midi,
      notes: midi.map((m) => NAMES[m % 12]),
      roles: ordered.map((d) => d.role),
    };
  }

  /** Dynamic-programming voice leading across a progression inside MIDI 55..79 (octave 4 center). */
  function voiceLead(prog) {
    if (!Array.isArray(prog) || !prog.length) return [];
    const mean = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length;
    const dist = (a, b) => a.reduce((s, m, k) => s + Math.abs(b[k] - m), 0);

    const layers = prog.map((raw) => {
      const base = normalizeChord(raw);
      const r = idx(base.root);
      const degs = rootlessDegrees(base.quality);
      const rotations = [
        { rot: 0, mode: "rootless-a", invIndex: 2, list: degs },
        { rot: 1, mode: "voice-led", invIndex: 2, list: [degs[1], degs[2], degs[3], { iv: degs[0].iv + 12, role: degs[0].role }] },
        { rot: 2, mode: "rootless-b", invIndex: 3, list: [degs[2], degs[3], { iv: degs[0].iv + 12, role: degs[0].role }, { iv: degs[1].iv + 12, role: degs[1].role }] },
        { rot: 3, mode: "voice-led", invIndex: 3, list: [degs[3], { iv: degs[0].iv + 12, role: degs[0].role }, { iv: degs[1].iv + 12, role: degs[1].role }, { iv: degs[2].iv + 12, role: degs[2].role }] },
      ];
      const cands = [];
      for (const spec of rotations) {
        for (let oct = 36; oct <= 72; oct += 12) {
          const tones = spec.list.map((d) => oct + r + d.iv);
          if (tones[0] >= MIDI_MIN && tones[tones.length - 1] <= MIDI_MAX) {
            cands.push({
              base,
              rot: spec.rot,
              voicingMode: spec.mode,
              invIndex: spec.invIndex,
              tones,
              roles: spec.list.map((d) => d.role),
            });
          }
        }
      }
      return cands;
    });

    const rotPenalty = (rot) => (rot === 0 ? 0 : rot === 2 ? 0.004 : 0.04);
    const table = [layers[0].map((c) => ({
      cost: rotPenalty(c.rot) + 0.001 * Math.abs(mean(c.tones) - 67),
      prev: -1,
      travel: 0,
    }))];
    for (let i = 1; i < layers.length; i++) {
      table.push(layers[i].map((c) => {
        let bestCost = Infinity;
        let bestPrev = 0;
        let bestTravel = 0;
        layers[i - 1].forEach((p, pi) => {
          const stepTravel = dist(p.tones, c.tones);
          const total = table[i - 1][pi].cost + stepTravel + rotPenalty(c.rot) + 0.001 * Math.abs(mean(c.tones) - 67);
          if (total < bestCost) {
            bestCost = total;
            bestPrev = pi;
            bestTravel = stepTravel;
          }
        });
        return { cost: bestCost, prev: bestPrev, travel: bestTravel };
      }));
    }

    const chosen = new Array(layers.length);
    let idxBest = 0;
    const lastRow = table[table.length - 1];
    for (let j = 1; j < lastRow.length; j++) {
      if (lastRow[j].cost < lastRow[idxBest].cost) idxBest = j;
    }
    for (let i = layers.length - 1; i >= 0; i--) {
      const c = layers[i][idxBest];
      const cell = table[i][idxBest];
      const midi = [...c.tones];
      chosen[i] = {
        ...c.base,
        voicingMode: c.voicingMode,
        invIndex: c.invIndex,
        bass: [...c.base.bass],
        tones: [...c.tones],
        midi,
        notes: midi.map((m) => NAMES[m % 12]),
        roles: [...c.roles],
        travel: cell.travel,
      };
      idxBest = cell.prev;
    }
    return chosen;
  }

  /* One bar of 4/4 on a 16-step grid. Bass on 1 and 3 (root, then fifth).
     Chord stabs: 1, the "a" of 1, the "&" of 2, the "&" of 3, 4 — the classic bossa comping figure. */
  const PATTERN = { steps: 16, bass: { 0: 0, 8: 1 }, stabs: [0, 3, 6, 10, 12] };
  const M = { NAMES, QUALITIES, chord, progression, PATTERN, invertChord, voiceLead };
  if (typeof window !== "undefined") window.PIANO_MUSIC = M;
  if (typeof globalThis !== "undefined") globalThis.PIANO_MUSIC = M;
})();
