/* Bossa Piano Studio v2: pattern player + 2 & 4 woodblock clave metronome + interactive 2-octave playable keyboard + local MediaRecorder audio memo + interval/chord ear trainer + 40 standards + clean-rep ladder. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("piano");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.line(Math.round(n * 0.6), -0.9, 0, 0.9, 0), ...G.ring(Math.round(n * 0.4), 0.3)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const M = PIANO_MUSIC;

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
  function claveHit(t, accent) {
    const ctx = ac(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = accent ? 2450 : 1950;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(accent ? 0.14 : 0.09, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.05);
  }
  const playChord = (ch, t, stepDur) => { tone(ch.bass[0], t, stepDur * 8, 0.2); ch.tones.forEach((m) => tone(m, t, stepDur * 6, 0.11)); };

  let playing = null, claveOn = false;
  function startPlayer(chords, bpm) {
    stopPlayer(); ac();
    const stepDur = 60 / bpm / 4; let step = 0, bar = 0;
    const tick = () => {
      const ch = chords[bar % chords.length], t = ac().currentTime + 0.03;
      if (M.PATTERN.bass[step] != null) tone(ch.bass[M.PATTERN.bass[step]], t, stepDur * 8, 0.22);
      if (M.PATTERN.stabs.includes(step)) ch.tones.forEach((m) => tone(m, t, stepDur * 5, 0.11));
      if (claveOn && (step === 4 || step === 12)) claveHit(t, step === 12); // crisp 2 & 4 pocket click
      document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === Math.floor(step / 4)));
      highlightNotes(ch.notes);
      $("#now-playing").textContent = `Bar ${bar + 1} · ${ch.name}${ch.role ? " (" + ch.role + ")" : ""}`;
      step++; if (step >= M.PATTERN.steps) { step = 0; bar++; }
    };
    tick(); playing = { timer: setInterval(tick, stepDur * 1000) };
  }
  function stopPlayer() {
    if (playing) { clearInterval(playing.timer); playing = null; const np = $("#now-playing"); if (np) np.textContent = "Stopped."; document.querySelectorAll(".beat").forEach((b) => b.classList.remove("on")); highlightNotes([]); }
  }

  let metroTimer = null, metroBeat = 0;
  function toggleClave() {
    claveOn = !claveOn;
    $("#p-clave").textContent = claveOn ? "2 & 4 Clave: ON" : "2 & 4 Clave: OFF";
    if (!playing && claveOn) {
      ac();
      const bpm = +$("#p-bpm").value || 60;
      const tick = () => {
        if (!playing && claveOn && (metroBeat % 4 === 1 || metroBeat % 4 === 3)) claveHit(ac().currentTime + 0.02, metroBeat % 4 === 3);
        document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === (metroBeat % 4)));
        metroBeat = (metroBeat + 1) % 4;
      };
      tick(); metroTimer = setInterval(tick, (60 / bpm) * 1000);
    } else if (!claveOn && metroTimer) { clearInterval(metroTimer); metroTimer = null; if (!playing) document.querySelectorAll(".beat").forEach((b) => b.classList.remove("on")); }
  }

  const LIBRARY = [["C", "maj7"], ["C", "maj9"], ["D", "m9"], ["E", "m7"], ["F", "maj7"], ["G", "13"], ["G", "9"], ["A", "m7"], ["B", "m7b5"], ["E", "7"], ["A", "7"], ["D", "7"], ["F#", "m7b5"], ["B", "7"], ["G", "maj7"], ["E", "m9"]].map(([r, q]) => M.chord(r, q));

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>The pattern player &amp; 2&amp;4 clave pocket</h2>
        <div><span class="beat"></span><span class="beat"></span><span class="beat"></span><span class="beat"></span> <span id="now-playing" class="stat-s">Pick a progression or chord, set tempo, press play.</span></div>
        <form class="form" style="margin-top:10px">
          <label class="f">Tempo (BPM)<input id="p-bpm" type="number" value="60" min="40" max="180"></label>
          <label class="f wide">Progression — ii·V·I·vi in key<select id="p-key">${M.NAMES.map((n) => `<option ${n === "C" ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        </form>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn" id="p-play-prog" type="button">Play progression</button>
          <button class="btn quiet" id="p-clave" type="button">2 &amp; 4 Clave: OFF</button>
          <button class="btn quiet" id="p-stop" type="button">Stop</button>
        </div>
      </div>

      <div class="glass lit span-12">
        <h2>Interactive 2-Octave Keyboard &amp; Local Practice Take Recorder</h2>
        <p class="sub">Tap any key below to voice intervals directly (browser audio) or record a local mic take on your Yamaha P-145BT.</p>
        <div id="p-kbd" style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0"></div>
        <div class="row-actions" style="margin-top:10px">
          <button class="btn quiet small" id="p-rec-btn" type="button">Record local audio take</button>
          <span id="p-rec-status" class="stat-s">No take recorded (stays 100% local in browser RAM).</span>
        </div>
        <div id="p-rec-play" style="margin-top:8px"></div>
      </div>

      <div class="glass span-12"><h2>Chord library — tap to hear &amp; highlight keys</h2><div class="chords" id="p-lib"></div></div>
      <div class="glass span-12"><h2>Standards — the real changes (40 Bossa charts)</h2><div id="p-standards"></div></div>

      <div class="glass span-6"><h2>Clean-rep ladder</h2>
        <div class="rep" id="p-reps">0 / 8</div><div class="stat-s" id="p-ladder-note">Eight clean reps earns +4 BPM.</div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn" id="p-rep" type="button">Clean rep</button>
          <button class="btn quiet" id="p-miss" type="button">Missed one</button>
          <button class="btn quiet" id="p-ladder-reset" type="button">Reset</button>
        </div>
      </div>

      <div class="glass span-6"><h2>Ear &amp; Interval Trainer</h2>
        <div class="stat-s" id="p-ear-note">Hear a chord quality or 2-note interval.</div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn small" id="p-ear-play" type="button">Play chord</button>
          <button class="btn quiet small" id="p-iv-play" type="button">Play interval</button>
        </div>
        <div class="row-actions" id="p-ear-choices" style="margin-top:8px"></div>
        <div class="stat-s" id="p-ear-score" style="margin-top:6px"></div>
      </div>

      <div class="glass span-12"><h2>Practice log</h2>
        <form class="form" id="p-log">
          <label class="f">Minutes<input name="minutes" type="number" min="1" required></label>
          <label class="f wide">Focus<input name="focus" maxlength="100" placeholder="G13 voicings, Girl from Ipanema changes…"></label>
          <button class="btn" type="submit">Log session</button>
        </form>
        <div id="p-sessions" style="margin-top:10px"></div>
      </div>
    </section>`;

  // 2-octave playable key buttons (C3..B4)
  const kbd = $("#p-kbd");
  const keyBtns = [];
  for (let m = 48; m <= 71; m++) {
    const nm = M.NAMES[m % 12], oct = Math.floor(m / 12) - 1, sharp = nm.includes("#");
    const btn = h("button.btn.quiet.small", {
      type: "button",
      style: sharp ? "background:rgba(15,20,38,0.92);border-color:rgba(255,255,255,0.18)" : "",
      onclick: () => { tone(m, ac().currentTime + 0.02, 1.2, 0.2); $("#now-playing").textContent = `Key: ${nm}${oct}`; },
    }, `${nm}${oct}`);
    keyBtns.push({ btn, nm });
    kbd.append(btn);
  }
  function highlightNotes(notes) {
    const set = new Set(notes || []);
    for (const k of keyBtns) k.btn.style.outline = set.has(k.nm) ? "2px solid var(--accent)" : "";
  }

  // Local MediaRecorder practice capture
  let recorder = null, chunks = [], recUrl = null;
  $("#p-rec-btn").onclick = async () => {
    if (recorder && recorder.state === "recording") { recorder.stop(); $("#p-rec-btn").textContent = "Record local audio take"; return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast("Audio recorder unavailable in this browser."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        if (recUrl) URL.revokeObjectURL(recUrl);
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        recUrl = URL.createObjectURL(blob);
        $("#p-rec-status").textContent = `Captured local take (${Math.round(blob.size / 1024)} KB).`;
        $("#p-rec-play").innerHTML = `<audio controls src="${recUrl}" style="max-width:100%"></audio> <a class="btn quiet small" href="${recUrl}" download="piano-take-${day()}.webm">Save clip</a>`;
      };
      recorder.start();
      $("#p-rec-btn").textContent = "Stop recording";
      $("#p-rec-status").textContent = "Recording from local mic…";
    } catch (_) { toast("Mic permission declined or unavailable."); }
  };

  $("#p-clave").onclick = toggleClave;
  const lib = $("#p-lib");
  for (const ch of LIBRARY) {
    lib.append(h("button.chord", {
      type: "button",
      onclick: () => { stopPlayer(); playChord(ch, ac().currentTime + 0.03, 60 / (+$("#p-bpm").value || 60) / 4); highlightNotes(ch.notes); $("#now-playing").textContent = ch.name + " — " + ch.spell; },
    }, h("b", null, ch.name), h("span", null, ch.spell)));
  }
  $("#p-play-prog").onclick = () => startPlayer(M.progression($("#p-key").value), +$("#p-bpm").value || 60);
  $("#p-stop").onclick = stopPlayer;

  const QMAP = { "": "maj7", "maj7": "maj7", "maj9": "maj9", "6": "maj7", "69": "maj9", "m": "m7", "m7": "m7", "m9": "m9", "7": "7", "9": "9", "13": "13", "7b13": "13", "7#11": "13", "7sus4": "7", "sus4": "7", "m7b5": "m7b5", "dim7": "m7b5", "dim": "m7b5" };
  const FLAT = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  function chartChord(tok) {
    const m = String(tok).split("/")[0].match(/^([A-G])(#|b)?(.*)$/); if (!m) return null;
    const root = FLAT[m[1] + (m[2] || "")] || (m[1] + (m[2] || ""));
    const q = QMAP[(m[3] || "").trim()]; if (!q) return null;
    try { return M.chord(root, q); } catch (_) { return null; }
  }
  const stdBox = $("#p-standards");
  if (window.BOSSA_STANDARDS) {
    for (const t of window.BOSSA_STANDARDS) {
      const parsed = t.bars.map((bar) => chartChord(String(bar).split(" ")[0]));
      const playable = parsed.filter(Boolean).length;
      const strip = h("div.mono", { hidden: "" }, t.bars.join("  |  "));
      const row = h("div.kv", null,
        h("span", null, h("b", null, t.t), h("span.stat-s", null, ` · ${t.c || ""} · key ${t.key} · ${t.form} · ${t.bars.length} bars`)),
        h("span.row-actions", null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { strip.hidden = !strip.hidden; } }, "Changes"),
          playable >= Math.ceil(t.bars.length * 0.7) ? h("button.btn.small", { type: "button", onclick: () => startPlayer(parsed.map((c, i) => c || parsed.slice(0, i).reverse().find(Boolean) || LIBRARY[0]), +$("#p-bpm").value || 60) }, "Play") : null
        )
      );
      stdBox.append(row, strip);
    }
  }

  let reps = S.get("ladder_reps", 0), bpm = S.get("ladder_bpm", 60);
  const paintLadder = () => {
    $("#p-reps").textContent = `${reps} / 8 at ${bpm} BPM`;
    $("#p-ladder-note").textContent = reps >= 8 ? "Ladder complete — tap Clean rep once more to bank +4 BPM." : "Eight clean reps at this tempo earns +4 BPM.";
    if (document.activeElement !== $("#p-bpm")) $("#p-bpm").value = bpm;
  };
  $("#p-rep").onclick = () => { reps++; if (reps > 8) { bpm += 4; reps = 0; S.set("ladder_bpm", bpm); toast("Stepped up to " + bpm + " BPM"); } S.set("ladder_reps", reps); paintLadder(); };
  $("#p-miss").onclick = () => { reps = 0; S.set("ladder_reps", 0); paintLadder(); };
  $("#p-ladder-reset").onclick = () => { reps = 0; bpm = 60; S.set("ladder_reps", 0); S.set("ladder_bpm", 60); paintLadder(); };
  paintLadder();

  const EAR_Q = ["maj7", "m7", "7", "m7b5", "13", "m9"];
  const INTERVALS = [{ st: 3, name: "Minor 3rd" }, { st: 4, name: "Major 3rd" }, { st: 7, name: "Perfect 5th" }, { st: 10, name: "Minor 7th" }, { st: 11, name: "Major 7th" }, { st: 14, name: "Major 9th" }];
  let earScore = S.get("ear", { right: 0, total: 0 });
  const paintEar = () => { $("#p-ear-score").textContent = earScore.total ? `Score: ${earScore.right} / ${earScore.total}` : ""; };

  $("#p-ear-play").onclick = () => {
    stopPlayer();
    const root = M.NAMES[Math.floor(Math.random() * 12)], q = EAR_Q[Math.floor(Math.random() * EAR_Q.length)];
    const earChord = M.chord(root, q); playChord(earChord, ac().currentTime + 0.03, 0.22);
    $("#p-ear-note").textContent = "Playing chord… which quality?";
    const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const choice of EAR_Q) {
      box.append(h("button.btn.quiet.small", {
        type: "button",
        onclick: () => {
          earScore.total++; const right = choice === earChord.quality; if (right) earScore.right++;
          S.set("ear", earScore);
          $("#p-ear-note").textContent = right ? `Right — ${earChord.name}.` : `Was ${earChord.name} (${earChord.spell}).`;
          paintEar();
        },
      }, M.QUALITIES[choice].label));
    }
  };

  $("#p-iv-play").onclick = () => {
    stopPlayer();
    const base = 60 + Math.floor(Math.random() * 7), iv = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    const t = ac().currentTime + 0.03; tone(base, t, 0.65, 0.18); tone(base + iv.st, t + 0.35, 0.75, 0.18);
    $("#p-ear-note").textContent = "Playing 2-note interval…";
    const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const c of INTERVALS) {
      box.append(h("button.btn.quiet.small", {
        type: "button",
        onclick: () => {
          earScore.total++; const right = c.st === iv.st; if (right) earScore.right++;
          S.set("ear", earScore);
          $("#p-ear-note").textContent = right ? `Right — ${iv.name} (${iv.st} semitones).` : `Was ${iv.name}.`;
          paintEar();
        },
      }, c.name));
    }
  };
  paintEar();

  const paintLog = () => {
    const ss = S.list("sessions").sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
    $("#p-sessions").innerHTML = ss.map((s) => `<div class="kv"><span>${s.date} · ${esc(s.focus || "Practice")}</span><b>${s.minutes} min</b></div>`).join("") || `<p class="empty">No sessions logged yet.</p>`;
  };
  $("#p-log").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("sessions", { date: day(), minutes: +f.minutes.value || 0, focus: f.focus.value.trim() }); f.reset(); toast("Logged"); paintLog();
  });
  paintLog();

  $("#export").onclick = () => download(`piano_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintLog(); paintLadder(); } catch (e) { toast(e.message); } };
})();
