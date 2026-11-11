/* Bossa Piano Studio (Sebastian, 2026-11-09): the comping pattern player (Web Audio synth),
   chord library, ii-V-I builder, clean-rep ladder, session log, and a chord-quality ear trainer.
   Music math lives in music.js (unit-tested). Practice data stays in this browser. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("piano");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.line(Math.round(n * 0.6), -0.9, 0, 0.9, 0), ...G.ring(Math.round(n * 0.4), 0.3)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const M = PIANO_MUSIC;

  // --- tiny synth: two detuned triangles through a lowpass, piano-ish decay ---
  let AC = null;
  const ac = () => { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); return AC; };
  const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  function tone(midi, t, dur, vol) {
    const ctx = ac(), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o1.type = "triangle"; o2.type = "sine"; o1.frequency.value = freq(midi); o2.frequency.value = freq(midi) * 2.001;
    f.type = "lowpass"; f.frequency.value = 2400;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(ctx.destination);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  const playChord = (ch, t, stepDur) => { tone(ch.bass[0], t, stepDur * 8, 0.20); ch.tones.forEach((m) => tone(m, t, stepDur * 6, 0.11)); };

  // --- pattern player state ---
  let playing = null; // {chords, bpm, timer, step, bar}
  function startPlayer(chords, bpm) {
    stopPlayer(); ac();
    const stepDur = 60 / bpm / 4; let step = 0, bar = 0;
    const tick = () => {
      const ch = chords[bar % chords.length], t = ac().currentTime + 0.03;
      if (M.PATTERN.bass[step] != null) tone(ch.bass[M.PATTERN.bass[step]], t, stepDur * 8, 0.22);
      if (M.PATTERN.stabs.includes(step)) ch.tones.forEach((m) => tone(m, t, stepDur * 5, 0.11));
      document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === Math.floor(step / 4)));
      $("#now-playing").textContent = `Bar ${bar + 1} · ${ch.name}${ch.role ? " (" + ch.role + ")" : ""}`;
      step++; if (step >= M.PATTERN.steps) { step = 0; bar++; }
    };
    tick(); playing = { timer: setInterval(tick, stepDur * 1000) };
  }
  function stopPlayer() { if (playing) { clearInterval(playing.timer); playing = null; const np = $("#now-playing"); if (np) np.textContent = "Stopped."; document.querySelectorAll(".beat").forEach((b) => b.classList.remove("on")); } }

  const LIBRARY = [["C", "maj7"], ["C", "maj9"], ["D", "m9"], ["E", "m7"], ["F", "maj7"], ["G", "13"], ["G", "9"], ["A", "m7"], ["B", "m7b5"], ["E", "7"], ["A", "7"], ["D", "7"], ["F#", "m7b5"], ["B", "7"], ["G", "maj7"], ["E", "m9"]].map(([r, q]) => M.chord(r, q));

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>The pattern player</h2>
        <div><span class="beat"></span><span class="beat"></span><span class="beat"></span><span class="beat"></span> <span id="now-playing" class="stat-s">Pick a progression or a chord, set the tempo, press play.</span></div>
        <form class="form" style="margin-top:10px"><label class="f">Tempo (BPM)<input id="p-bpm" type="number" value="60" min="40" max="180"></label>
        <label class="f wide">Progression — ii·V·I·vi in key<select id="p-key">${M.NAMES.map((n) => `<option ${n === "C" ? "selected" : ""}>${n}</option>`).join("")}</select></label></form>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn" id="p-play-prog" type="button">Play progression</button>
          <button class="btn quiet" id="p-stop" type="button">Stop</button></div>
        <p class="note">One bar per chord. Bass: root on 1, fifth on 3. Stabs on 1, the "a" of 1, the &amp; of 2, the &amp; of 3, and 4 — the classic bossa figure.</p></div>
      <div class="glass span-12"><h2>Chord library — tap to hear the voicing</h2><div class="chords" id="p-lib"></div></div>
      <div class="glass span-12"><h2>Standards — the real changes</h2>
        <p class="note">Forty bossa standards with their bar-by-bar chord maps (iReal charts, via Grok's reset-day extraction). Play runs the changes through the same bossa pattern — voicings are the studio's, so extended chords land as their nearest playable quality.</p>
        <div id="p-standards"></div></div>
      <div class="glass span-6"><h2>Clean-rep ladder</h2>
        <div class="rep" id="p-reps">0 / 8</div><div class="stat-s" id="p-ladder-note">Eight clean reps at this tempo earns +4 BPM.</div>
        <div class="row-actions" style="margin-top:8px"><button class="btn" id="p-rep" type="button">Clean rep</button>
        <button class="btn quiet" id="p-miss" type="button">Missed one</button>
        <button class="btn quiet" id="p-ladder-reset" type="button">Reset</button></div></div>
      <div class="glass span-6"><h2>Ear trainer — which quality?</h2>
        <div class="stat-s" id="p-ear-note">Hear a chord, name its quality.</div>
        <div class="row-actions" style="margin-top:8px"><button class="btn" id="p-ear-play" type="button">Play a chord</button></div>
        <div class="row-actions" id="p-ear-choices" style="margin-top:8px"></div>
        <div class="stat-s" id="p-ear-score" style="margin-top:6px"></div></div>
      <div class="glass span-12"><h2>Practice log</h2>
        <form class="form" id="p-log"><label class="f">Minutes<input name="minutes" type="number" min="1" required></label>
        <label class="f wide">Focus<input name="focus" maxlength="100" placeholder="G13 voicings, Girl from Ipanema changes…"></label>
        <button class="btn" type="submit">Log session</button></form>
        <div id="p-sessions" style="margin-top:10px"></div></div>
    </section>`;

  const lib = $("#p-lib");
  for (const ch of LIBRARY) lib.append(h("button.chord", { type: "button", onclick: () => { stopPlayer(); playChord(ch, ac().currentTime + 0.03, 60 / (+$("#p-bpm").value || 60) / 4); $("#now-playing").textContent = ch.name + " — " + ch.spell; } },
    h("b", null, ch.name), h("span", null, ch.spell)));
  $("#p-play-prog").onclick = () => startPlayer(M.progression($("#p-key").value), +$("#p-bpm").value || 60);
  $("#p-stop").onclick = stopPlayer;

  // standards: parse chart chords into studio voicings and play the changes
  const QMAP = { "": "maj7", "maj7": "maj7", "maj9": "maj9", "6": "maj7", "69": "maj9", "m": "m7", "m7": "m7", "m9": "m9", "7": "7", "9": "9", "13": "13", "7b13": "13", "7#11": "13", "7sus4": "7", "sus4": "7", "m7b5": "m7b5", "dim7": "m7b5", "dim": "m7b5" };
  const FLAT = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  function chartChord(tok) {
    const m = String(tok).split("/")[0].match(/^([A-G])(#|b)?(.*)$/); if (!m) return null;
    const root = FLAT[m[1] + (m[2] || "")] || (m[1] + (m[2] || ""));
    const q = QMAP[(m[3] || "").trim()]; if (!q) return null;
    try { return M.chord(root, q); } catch (e) { return null; }
  }
  const stdBox = $("#p-standards");
  if (window.BOSSA_STANDARDS) for (const t of window.BOSSA_STANDARDS) {
    const parsed = t.bars.map((bar) => chartChord(String(bar).split(" ")[0]));
    const playable = parsed.filter(Boolean).length;
    const row = h("div.kv", null,
      h("span", null, h("b", null, t.t), h("span.stat-s", null, ` · ${t.c || ""} · key ${t.key} · ${t.form} · ${t.bars.length} bars`)),
      h("span.row-actions", null,
        h("button.btn.quiet.small", { type: "button", onclick: (e) => {
          const strip = e.target.closest(".kv").nextElementSibling;
          strip.hidden = !strip.hidden;
        } }, "Changes"),
        playable >= Math.ceil(t.bars.length * 0.7) ? h("button.btn.small", { type: "button", onclick: () => {
          startPlayer(parsed.map((c, i) => c || parsed.slice(0, i).reverse().find(Boolean) || LIBRARY[0]), +$("#p-bpm").value || 60);
        } }, "Play") : null));
    const strip = h("div.mono", { hidden: "" }, t.bars.join("  |  "));
    stdBox.append(row, strip);
  }
  // ladder
  let reps = S.get("ladder_reps", 0), bpm = S.get("ladder_bpm", 60);
  const paintLadder = () => { $("#p-reps").textContent = `${reps} / 8 at ${bpm} BPM`; $("#p-ladder-note").textContent = reps >= 8 ? "Ladder complete — press Clean rep once more to bank it and step up." : "Eight clean reps at this tempo earns +4 BPM."; if (document.activeElement !== $("#p-bpm")) $("#p-bpm").value = bpm; };
  $("#p-rep").onclick = () => { reps++; if (reps > 8) { bpm += 4; reps = 0; S.set("ladder_bpm", bpm); toast("Stepped up to " + bpm + " BPM"); } S.set("ladder_reps", reps); paintLadder(); };
  $("#p-miss").onclick = () => { reps = 0; S.set("ladder_reps", 0); paintLadder(); };
  $("#p-ladder-reset").onclick = () => { reps = 0; bpm = 60; S.set("ladder_reps", 0); S.set("ladder_bpm", 60); paintLadder(); };
  paintLadder();

  // ear trainer
  const EAR_Q = ["maj7", "m7", "7", "m7b5", "13", "m9"];
  let earChord = null, earScore = S.get("ear", { right: 0, total: 0 });
  const paintEar = () => { $("#p-ear-score").textContent = earScore.total ? `Score: ${earScore.right} / ${earScore.total}` : ""; };
  $("#p-ear-play").onclick = () => {
    stopPlayer(); const root = M.NAMES[Math.floor(Math.random() * 12)], q = EAR_Q[Math.floor(Math.random() * EAR_Q.length)];
    earChord = M.chord(root, q); playChord(earChord, ac().currentTime + 0.03, 0.22);
    $("#p-ear-note").textContent = "Playing… which quality is it?";
    const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const choice of EAR_Q) box.append(h("button.btn.quiet.small", { type: "button", onclick: () => {
      earScore.total++; const right = choice === earChord.quality; if (right) earScore.right++;
      S.set("ear", earScore); $("#p-ear-note").textContent = right ? `Right — it was ${earChord.name}.` : `It was ${earChord.name} (${earChord.spell}). Hear the difference: the third and the seventh.`; paintEar();
    } }, M.QUALITIES[choice].label));
  };
  paintEar();

  // log
  const paintLog = () => { const ss = S.list("sessions").sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
    $("#p-sessions").innerHTML = ss.map((s) => `<div class="kv"><span>${s.date} · ${esc(s.focus || "Practice")}</span><b>${s.minutes} min</b></div>`).join("") || `<p class="empty">No sessions logged yet.</p>`; };
  $("#p-log").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("sessions", { date: day(), minutes: +f.minutes.value || 0, focus: f.focus.value.trim() }); f.reset(); toast("Logged"); paintLog(); });
  paintLog();
  $("#export").onclick = () => download(`piano_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintLog(); paintLadder(); } catch (e) { toast(e.message); } };
})();
