/* Piano music math (Sebastian, 2026-11-09): pure chord/progression/pattern data. No DOM, no audio.
   Voicing follows Joseph's comping practice: bass root (or fifth) down low, two chord tones up top.
   window.PIANO_MUSIC = { NAMES, QUALITIES, chord, progression, PATTERN } */
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
    return [ { role: "ii", ...at(2, "m9") }, { role: "V", ...at(7, "13") }, { role: "I", ...at(0, "maj9") }, { role: "vi", ...at(9, "m7") } ];
  }
  /* One bar of 4/4 on a 16-step grid. Bass on 1 and 3 (root, then fifth).
     Chord stabs: 1, the "a" of 1, the "&" of 2, the "&" of 3, 4 — the classic bossa comping figure. */
  const PATTERN = { steps: 16, bass: { 0: 0, 8: 1 }, stabs: [0, 3, 6, 10, 12] };
  const M = { NAMES, QUALITIES, chord, progression, PATTERN };
  if (typeof window !== "undefined") window.PIANO_MUSIC = M;
  if (typeof globalThis !== "undefined") globalThis.PIANO_MUSIC = M;
})();
