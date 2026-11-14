import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = new URL("../../", import.meta.url);
const readRepo = (rel) => readFileSync(new URL(rel, ROOT), "utf8");

function loadMusic() {
  const w = {};
  new Function("window", "globalThis", readRepo("pillars/piano/music.js"))(w, w);
  return w.PIANO_MUSIC;
}

const M = loadMusic();

test("PIANO_MUSIC preserves backward-compatible exports: NAMES, QUALITIES, chord(), progression(), PATTERN", () => {
  assert.deepEqual(M.NAMES, ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
  assert.deepEqual(
    Object.keys(M.QUALITIES).sort(),
    ["maj7", "maj9", "6", "m7", "m9", "m7b5", "7", "9", "13", "dim7"].sort()
  );
  assert.deepEqual(M.PATTERN, { steps: 16, bass: { 0: 0, 8: 1 }, stabs: [0, 3, 6, 10, 12] });

  const cmaj7 = M.chord("C", "maj7");
  assert.equal(cmaj7.name, "Cmaj7");
  assert.equal(cmaj7.root, "C");
  assert.equal(cmaj7.quality, "maj7");
  assert.deepEqual(cmaj7.notes, ["C", "E", "G", "B"]);
  assert.deepEqual(cmaj7.bass, [36, 43]);
  assert.deepEqual(cmaj7.tones, [64, 71]);
  assert.equal(cmaj7.spell, "C · E · G · B");

  const g13 = M.chord("G", "13");
  assert.deepEqual(g13.notes, ["G", "B", "D", "F", "E"]);
  assert.deepEqual(g13.bass, [43, 50]);
  assert.deepEqual(g13.tones, [71, 88]);

  assert.throws(() => M.chord("H", "maj7"), /unknown chord/);
  assert.throws(() => M.chord("C", "sus2"), /unknown chord/);
  assert.throws(() => M.progression("Cb"), /unknown key/);

  for (const key of M.NAMES) {
    const r = M.NAMES.indexOf(key);
    const prog = M.progression(key);
    assert.equal(prog.length, 4);
    assert.deepEqual(prog.map((c) => c.role), ["ii", "V", "I", "vi"]);
    assert.deepEqual(prog.map((c) => c.quality), ["m9", "13", "maj9", "m7"]);
    assert.deepEqual(
      prog.map((c) => c.root),
      [M.NAMES[(r + 2) % 12], M.NAMES[(r + 7) % 12], key, M.NAMES[(r + 9) % 12]],
    );
  }
});

test("invertChord(ch, 0..3) returns clean voicings across all 12 keys and all 10 QUALITIES", () => {
  const qualityNames = Object.keys(M.QUALITIES);
  for (const root of M.NAMES) {
    for (const quality of qualityNames) {
      const base = M.chord(root, quality);
      const snapshot = JSON.stringify(base);

      // 0: comping shell (bass root + upper guide tones)
      const v0 = M.invertChord(base, 0);
      assert.equal(v0.voicingMode, "shell");
      assert.equal(v0.invIndex, 0);
      assert.deepEqual(v0.bass, base.bass);
      assert.deepEqual(v0.tones, base.tones);
      assert.deepEqual(v0.midi, [base.bass[0], ...base.tones]);
      assert.deepEqual(v0.notes, v0.midi.map((m) => M.NAMES[m % 12]));
      assert.equal(v0.roles[0], "R");
      assert.equal(v0.roles[1], "3");
      assert.equal(v0.roles.length, v0.midi.length);

      // 1: 1st inversion upper tones shifted
      const v1 = M.invertChord(base, 1);
      assert.equal(v1.voicingMode, "1st-inv");
      assert.equal(v1.invIndex, 1);
      assert.equal(v1.tones.length, 2);
      assert.ok(v1.tones[0] < v1.tones[1], `${base.name} 1st inv tones must ascend`);
      assert.equal(v1.tones[0] % 12, base.tones[1] % 12);
      assert.equal(v1.tones[1] % 12, base.tones[0] % 12);
      assert.deepEqual(v1.midi, [v1.bass[0], ...v1.tones]);
      assert.deepEqual(v1.notes, v1.midi.map((m) => M.NAMES[m % 12]));
      assert.equal(v1.roles[0], "R");
      assert.equal(v1.roles[2], "3");
      assert.equal(v1.roles.length, v1.midi.length);

      // 2: rootless A-form (3-5-7-9)
      const v2 = M.invertChord(base, 2);
      assert.equal(v2.voicingMode, "rootless-a");
      assert.equal(v2.invIndex, 2);
      assert.equal(v2.tones.length, 4);
      assert.deepEqual(v2.midi, v2.tones);
      assert.ok(!v2.roles.includes("R"), `${base.name} rootless-a omits R`);
      assert.equal(v2.roles[0], "3");
      assert.equal(v2.roles[3], "9");
      for (let i = 0; i < 4; i++) {
        assert.ok(v2.midi[i] >= 55 && v2.midi[i] <= 79, `${base.name} A-form MIDI ${v2.midi[i]} within 55..79`);
        if (i > 0) assert.ok(v2.midi[i] > v2.midi[i - 1], `${base.name} A-form strictly ascending`);
      }
      assert.deepEqual(v2.notes, v2.midi.map((m) => M.NAMES[m % 12]));

      // 3: rootless B-form (7-9-3-5)
      const v3 = M.invertChord(base, 3);
      assert.equal(v3.voicingMode, "rootless-b");
      assert.equal(v3.invIndex, 3);
      assert.equal(v3.tones.length, 4);
      assert.deepEqual(v3.midi, v3.tones);
      assert.ok(!v3.roles.includes("R"), `${base.name} rootless-b omits R`);
      assert.equal(v3.roles[1], "9");
      assert.equal(v3.roles[2], "3");
      for (let i = 0; i < 4; i++) {
        assert.ok(v3.midi[i] >= 55 && v3.midi[i] <= 79, `${base.name} B-form MIDI ${v3.midi[i]} within 55..79`);
        if (i > 0) assert.ok(v3.midi[i] > v3.midi[i - 1], `${base.name} B-form strictly ascending`);
      }
      assert.deepEqual(v3.notes, v3.midi.map((m) => M.NAMES[m % 12]));

      // Input object immutability
      assert.equal(JSON.stringify(base), snapshot);
    }
  }

  // Extra metadata preserved via {...ch}
  const progC = M.progression("C");
  const iiA = M.invertChord(progC[0], 2);
  assert.equal(iiA.role, "ii");
  assert.deepEqual(iiA.notes, ["F", "A", "C", "E"]);
  assert.deepEqual(iiA.roles, ["3", "5", "7", "9"]);
  assert.deepEqual(iiA.midi, [65, 69, 72, 76]);

  const vB = M.invertChord(progC[1], 3);
  assert.equal(vB.role, "V");
  assert.deepEqual(vB.notes, ["F", "A", "B", "E"]);
  assert.deepEqual(vB.roles, ["7", "9", "3", "13"]);
  assert.deepEqual(vB.midi, [65, 69, 71, 76]);
});

test("voiceLead(prog) achieves global minimum semitone travel within MIDI 55..79 across all 12 keys", () => {
  assert.deepEqual(M.voiceLead([]), []);
  const single = M.voiceLead([M.chord("C", "maj7")]);
  assert.equal(single.length, 1);
  assert.ok(single[0].midi.every((m) => m >= 55 && m <= 79));

  const dist = (a, b) => a.reduce((s, m, k) => s + Math.abs(b[k] - m), 0);
  const rootlessPcs = (ch) => {
    const r = M.NAMES.indexOf(ch.root);
    const q = M.QUALITIES[ch.quality];
    const t = q.intervals.find((i) => i === 3 || i === 4);
    const f = ch.quality === "13" ? 9 : q.intervals.find((i) => i === 6 || i === 7);
    const s = q.intervals.find((i) => i === 9 || i === 10 || i === 11);
    return [t, f, s, 14].map((iv) => (r + iv) % 12);
  };
  const allCandidatesInRange = (ch) => {
    const pcs = rootlessPcs(ch);
    const r = M.NAMES.indexOf(ch.root);
    const q = M.QUALITIES[ch.quality];
    const t = q.intervals.find((i) => i === 3 || i === 4);
    const f = ch.quality === "13" ? 9 : q.intervals.find((i) => i === 6 || i === 7);
    const s = q.intervals.find((i) => i === 9 || i === 10 || i === 11);
    const degs = [t, f, s, 14];
    const rots = [
      degs,
      [degs[1], degs[2], degs[3], degs[0] + 12],
      [degs[2], degs[3], degs[0] + 12, degs[1] + 12],
      [degs[3], degs[0] + 12, degs[1] + 12, degs[2] + 12],
    ];
    const out = [];
    for (const rot of rots) {
      for (let oct = 36; oct <= 72; oct += 12) {
        const midis = rot.map((iv) => oct + r + iv);
        if (midis[0] >= 55 && midis[3] <= 79) {
          assert.deepEqual(new Set(midis.map((m) => m % 12)), new Set(pcs));
          out.push(midis);
        }
      }
    }
    return out;
  };

  for (const key of M.NAMES) {
    const prog = M.progression(key);
    const vl = M.voiceLead(prog);
    assert.equal(vl.length, 4);
    assert.deepEqual(vl.map((c) => c.role), ["ii", "V", "I", "vi"]);

    let actualTotal = 0;
    vl.forEach((c, i) => {
      assert.equal(c.midi.length, 4);
      assert.deepEqual(c.tones, c.midi);
      for (let k = 0; k < 4; k++) {
        assert.ok(c.midi[k] >= 55 && c.midi[k] <= 79, `${key} ${c.name} MIDI ${c.midi[k]} in 55..79`);
        if (k > 0) assert.ok(c.midi[k] > c.midi[k - 1]);
      }
      assert.deepEqual(new Set(c.midi.map((m) => m % 12)), new Set(rootlessPcs(prog[i])));
      if (i > 0) actualTotal += dist(vl[i - 1].midi, c.midi);
    });

    // Brute-force check over every valid close-position voicing tuple in [55, 79]
    const cands = prog.map(allCandidatesInRange);
    let globalMin = Infinity;
    for (const a of cands[0]) {
      for (const b of cands[1]) {
        const d01 = dist(a, b);
        for (const c of cands[2]) {
          const d12 = d01 + dist(b, c);
          for (const d of cands[3]) {
            const tot = d12 + dist(c, d);
            if (tot < globalMin) globalMin = tot;
          }
        }
      }
    }
    assert.equal(actualTotal, globalMin, `${key}: voiceLead total ${actualTotal} equals brute-force min ${globalMin}`);

    // Strictly smoother than un-voice-led fixed A-form
    const fixedA = prog.map((c) => M.invertChord(c, 2).midi);
    const fixedATravel = dist(fixedA[0], fixedA[1]) + dist(fixedA[1], fixedA[2]) + dist(fixedA[2], fixedA[3]);
    assert.ok(actualTotal < fixedATravel, `${key}: voice-led (${actualTotal}) < fixed A-form (${fixedATravel})`);
  }

  // Canonical C major check: Dm9 -> G13 (1 st) -> Cmaj9 (5 st) -> Am7 (2 st) = 8 st total
  const vlC = M.voiceLead(M.progression("C"));
  assert.deepEqual(vlC.map((c) => c.midi), [
    [65, 69, 72, 76],
    [65, 69, 71, 76],
    [64, 67, 71, 74],
    [64, 67, 71, 72],
  ]);
  assert.deepEqual(vlC.map((c) => c.travel), [0, 1, 5, 2]);
});

test("Piano studio UI & event contracts preserve required IDs, QWERTY bindings, PB.events & 390px mobile CSS", () => {
  const appJs = readRepo("pillars/piano/app.js");
  const appCss = readRepo("pillars/piano/app.css");

  for (const id of [
    "p-seq-grid", "p-staff", "p-rungs", "p-drill-btn", "p-drill-s", "p-bpm",
    "p-key", "p-play-prog", "p-clave", "p-stop", "p-kbd", "p-lib", "p-standards", "p-log",
  ]) {
    assert.ok(appJs.includes(`id="${id}"`) || appJs.includes(`#${id}`), `app.js preserves #${id}`);
  }

  assert.match(appJs, /Shell/);
  assert.match(appJs, /1st Inv/);
  assert.match(appJs, /Rootless A/);
  assert.match(appJs, /Rootless B/);
  assert.match(appJs, /Play Voice-Led/);
  assert.match(appJs, /piano\.session/);
  assert.match(appJs, /piano\.rung/);
  assert.match(appJs, /PB\.events\.publish/);
  assert.match(appJs, /a:\s*0.*w:\s*1.*s:\s*2.*e:\s*3.*d:\s*4.*f:\s*5.*t:\s*6.*g:\s*7.*y:\s*8.*h:\s*9.*u:\s*10.*j:\s*11.*k:\s*12/);
  assert.match(appJs, /input,\s*textarea,\s*select/);

  assert.match(appCss, /@media\s*\(max-width:\s*600px\)/);
  assert.match(appCss, /\.p-kbd-whites[\s\S]*repeat\(14,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(appCss, /\.p-key-b/);
});
