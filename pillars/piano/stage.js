/* Piano signature: the keys. Two octaves that light up with the chords of one of the 40 bossa standards as it plays through, the bass
   in one colour and the upper voicing in another, on a slow bossa pulse. Tap a key and it sounds; tap the title to change song. */
(function () {
  const S = PK.store("piano"), I = PK.ink, SONGS = window.BOSSA_STANDARDS || [], PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function spell(sym) {                                                                     // "Gb7#11" -> root 6, tones [6,10,1,4,0]
    const m = String(sym).match(/^([A-G])([#b]?)([^/]*)(?:\/([A-G][#b]?))?/); if (!m) return null;
    const root = (PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? 11 : 0)) % 12, q = m[3], iv = new Set([0]);
    const minor = /^(m(?!aj)|min|-)/.test(q), dim = /dim|°/.test(q), half = /m7b5|ø/.test(q);
    iv.add(dim || half || minor ? 3 : 4); iv.add(dim || half || /b5/.test(q) ? 6 : /#5|\+|aug/.test(q) ? 8 : 7);
    if (/maj7|maj9|Δ/.test(q)) iv.add(11); else if (/dim7/.test(q)) iv.add(9); else if (/7|9|11|13/.test(q)) iv.add(10); else if (/6/.test(q)) iv.add(9);
    if (/b9/.test(q)) iv.add(13); else if (/#9/.test(q)) iv.add(15); else if (/9|13/.test(q) && !/b13/.test(q)) iv.add(14);
    if (/#11/.test(q)) iv.add(18); if (/b13/.test(q)) iv.add(20); else if (/13/.test(q)) iv.add(21);
    const bass = m[4] ? (PC[m[4][0]] + (m[4][1] === "#" ? 1 : m[4][1] === "b" ? 11 : 0)) % 12 : root;
    return { sym, root, bass, pcs: [...iv].map((x) => (root + x) % 12) };
  }
  let ac = null; const play = (midi) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime, f = 440 * Math.pow(2, (midi - 69) / 12);
    for (const [mul, vol] of [[1, 0.16], [2, 0.05], [3, 0.02]]) { const o = ac.createOscillator(), gn = ac.createGain(); o.type = "sine"; o.frequency.value = f * mul; gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.6); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + 1.7); } } catch (e) { /* no audio */ } };
  let song = Math.floor((Date.now() / 864e5) % Math.max(1, SONGS.length)), keys = [], lit = new Map(), titleBox = null;
  PK.stage({
    label: "Two octaves playing a bossa standard; tap a key to hear it",
    data() { const ses = S.list("sessions"), wk = I.today(); const week = ses.filter((x) => I.days(x.date, wk) <= 6).reduce((s, x) => s + (+x.minutes || 0), 0);
      return { song: SONGS[song], bars: (SONGS[song] ? SONGS[song].bars : []).map(spell).filter(Boolean), week, bpm: S.get("ladder_bpm", null), sessions: ses.length }; },
    readouts(D) { return [{ v: SONGS.length, k: "Standards with their changes" }, { v: D.week + " min", k: "Practised this week" }, { v: D.bpm ? D.bpm + " bpm" : "—", k: "Ladder tempo" }]; },
    draw(g, S, I) {
      const D = S.data, w = S.w, h = S.h, A = S.accent, B = S.accent2, top = h * 0.44, kh = h * 0.5, n = 15, kw = Math.min(46, (w - 24) / n), x0 = (w - kw * n) / 2;
      const beat = 60 / 132, barLen = beat * 2, bi = D.bars.length ? Math.floor((S.still ? 2.2 : S.t) / barLen) % D.bars.length : -1, ch = D.bars[bi], phase = S.still ? 0.3 : ((S.t / barLen) % 1);
      I.halo(g, w / 2, top, w * 0.6, A, 0.18);
      if (D.song) { I.text(g, "NOW PLAYING", w / 2, 22, { size: 9, weight: 700, align: "center", color: A, spacing: 3 }); I.text(g, I.fit(g, D.song.t, w - 40, 17, 400), w / 2, 42, { size: 17, weight: 400, align: "center" });
        I.text(g, `${D.song.c || ""} · key of ${D.song.key || "?"}`, w / 2, 60, { size: 10.5, align: "center", color: "#cfd8ea", alpha: 0.75 }); titleBox = [w / 2 - 140, 10, 280, 60]; }
      if (ch) { I.glow(g, B, 20); I.text(g, ch.sym, w / 2, top - 38, { size: 30, weight: 300, align: "center", alpha: 0.6 + 0.4 * (1 - phase) }); I.noGlow(g);
        for (let k = 0; k < Math.min(16, D.bars.length); k++) { const x = w / 2 + (k - 7.5) * 12; I.dot(g, x, top - 12, k === bi % 16 ? 3 : 1.6, k === bi % 16 ? A : "#ffffff", k === bi % 16 ? 1 : 0.3); } }
      keys = []; const whites = [0, 2, 4, 5, 7, 9, 11];
      for (let i = 0; i < n; i++) { const oct = Math.floor(i / 7), pc = whites[i % 7], midi = 48 + oct * 12 + pc, x = x0 + i * kw; keys.push({ x, y: top, w: kw - 2, h: kh, midi, black: false });
        const isBass = ch && pc === ch.bass && oct === 0, on = ch && (oct === 0 ? isBass : ch.pcs.includes(pc) && pc !== ch.bass), hot = lit.get(midi), col = isBass ? A : B;
        const gr = g.createLinearGradient(0, top, 0, top + kh); gr.addColorStop(0, on || hot ? I.rgba(I.mix(col, "#ffffff", 0.35), 1) : "#f6f8fc"); gr.addColorStop(0.7, on || hot ? I.rgba(col, 1) : "#e3e8f1"); gr.addColorStop(1, on || hot ? I.rgba(I.mix(col, "#000000", 0.2), 1) : "#c4ccdb");
        if (on || hot) I.glow(g, col, 18); g.fillStyle = gr; g.beginPath(); g.roundRect(x + 1, top, kw - 2, kh, [0, 0, 6, 6]); g.fill(); I.noGlow(g); if (on || hot) I.halo(g, x + kw / 2, top + kh - 14, 14, "#ffffff", 0.6); }
      for (let i = 0; i < n - 1; i++) { const pcw = whites[i % 7]; if (pcw === 4 || pcw === 11) continue; const oct = Math.floor(i / 7), pc = pcw + 1, midi = 48 + oct * 12 + pc, x = x0 + (i + 1) * kw - kw * 0.3, bw = kw * 0.6;
        keys.unshift({ x, y: top, w: bw, h: kh * 0.62, midi, black: true }); const isBass = ch && pc === ch.bass && oct === 0, on = ch && (oct === 0 ? isBass : ch.pcs.includes(pc) && pc !== ch.bass), hot = lit.get(midi), col = isBass ? A : B;
        if (on || hot) I.glow(g, col, 16); g.fillStyle = on || hot ? I.rgba(col, 0.95) : "#0b0e18"; g.beginPath(); g.roundRect(x, top, bw, kh * 0.62, [0, 0, 4, 4]); g.fill(); I.noGlow(g); }
      for (const [m, at] of lit) if (S.t - at > 0.5) lit.delete(m);
      I.text(g, ch ? ch.pcs.length + " tones · bass " + ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"][ch.bass] : "", w / 2, h - 8, { size: 9.5, align: "center", color: "#cfd8ea", alpha: 0.6 });
    },
    tap(x, y, S) { if (titleBox && x > titleBox[0] && x < titleBox[0] + titleBox[2] && y < titleBox[1] + titleBox[3]) { song = (song + 1) % Math.max(1, SONGS.length); S.t = 0; return; }
      const k = keys.find((k) => x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h); if (k) { play(k.midi); lit.set(k.midi, S.t); } },
  });
})();
