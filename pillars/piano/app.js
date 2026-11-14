/* Bossa Piano Studio v3: 16-step animated comping sequencer, interactive Grand Staff sight-reader, BPM rung ladder (50->120), 2-octave playable keyboard, 40 standards & ear trainer. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("piano");
  const app = $("#app");
  field({ count: 900, at: [0.76, 0.32], scale: 0.24, glyph: (n) => [...G.line(Math.round(n * 0.6), -0.9, 0, 0.9, 0), ...G.ring(Math.round(n * 0.4), 0.3)] });
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

  const RUNGS = [50, 56, 60, 68, 76, 84, 96, 108, 120];
  let customStabs = new Set(M.PATTERN.stabs);
  let customBass = new Map(Object.entries(M.PATTERN.bass).map(([k, v]) => [+k, v]));
  let playing = null, claveOn = false, drillTarget = null;
  const LIBRARY = [["C", "maj7"], ["C", "maj9"], ["D", "m9"], ["E", "m7"], ["F", "maj7"], ["G", "13"], ["G", "9"], ["A", "m7"], ["B", "m7b5"], ["E", "7"], ["A", "7"], ["D", "7"], ["F#", "m7b5"], ["B", "7"], ["G", "maj7"], ["E", "m9"]].map(([r, q]) => M.chord(r, q));

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-8">
        <h2>16-Step "1 + 2" Bossa Comping Sequencer &amp; Clave</h2>
        <div><span class="beat"></span><span class="beat"></span><span class="beat"></span><span class="beat"></span> <span id="now-playing" class="stat-s">Tap any grid cell to customize Bass/Stabs, set BPM, press Play.</span></div>
        <div id="p-seq-grid" style="display:grid;grid-template-columns:56px repeat(16,minmax(0,1fr));gap:3px;margin:10px 0;font-size:10px;align-items:center"></div>
        <form class="form" style="margin-top:8px">
          <label class="f">Tempo (BPM)<input id="p-bpm" type="number" value="60" min="40" max="180"></label>
          <label class="f wide">ii·V·I·vi Key<select id="p-key">${M.NAMES.map((n) => `<option ${n === "C" ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        </form>
        <div class="row-actions" style="flex-wrap:wrap;gap:6px;margin-top:8px">
          <button class="btn small" id="p-play-prog" type="button">Play progression</button>
          <button class="btn quiet small" id="p-clave" type="button">2 &amp; 4 Clave: OFF</button>
          <button class="btn quiet small" id="p-stop" type="button">Stop</button>
          <button class="btn quiet small" id="p-pat-std" type="button">Standard (1 + a)</button>
          <button class="btn quiet small" id="p-pat-sparse" type="button">Sparse ("1 + 2")</button>
        </div>
      </div>

      <div class="glass lit span-4">
        <h2>Grand Staff Sight-Reader</h2>
        <canvas id="p-staff" style="width:100%;height:175px;display:block"></canvas>
        <div class="row-actions" style="flex-wrap:wrap;gap:6px;margin-top:8px">
          <button class="btn small" id="p-drill-btn" type="button">Drill Random Note</button>
          <span class="stat-s" id="p-drill-s">Live feedback from keys &amp; chords.</span>
        </div>
      </div>

      <div class="glass span-6"><h2>Slow-Practice Rung Ladder (50 &rarr; 120 BPM)</h2>
        <div id="p-rungs" class="row-actions" style="flex-wrap:wrap;gap:5px;margin:6px 0 10px"></div>
        <div class="rep" id="p-reps">0 / 8</div><div class="stat-s" id="p-ladder-note">Eight clean reps earns next BPM rung.</div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn small" id="p-rep" type="button">Clean rep</button>
          <button class="btn quiet small" id="p-miss" type="button">Missed one</button>
          <button class="btn quiet small" id="p-ladder-reset" type="button">Reset</button>
        </div>
      </div>

      <div class="glass span-6"><h2>Ear &amp; Interval Trainer</h2>
        <div class="stat-s" id="p-ear-note">Hear a chord quality or 2-note interval.</div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn small" id="p-ear-play" type="button">Play chord</button>
          <button class="btn quiet small" id="p-iv-play" type="button">Play interval</button>
        </div>
        <div class="row-actions" id="p-ear-choices" style="flex-wrap:wrap;gap:6px;margin-top:8px"></div>
        <div class="stat-s" id="p-ear-score" style="margin-top:6px"></div>
      </div>

      <div class="glass span-12">
        <h2>Interactive 2-Octave Keyboard &amp; Local Practice Audio Take</h2>
        <div id="p-kbd" style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0"></div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn quiet small" id="p-rec-btn" type="button">Record local audio take</button>
          <span id="p-rec-status" class="stat-s">100% browser RAM audio capture.</span>
        </div>
        <div id="p-rec-play" style="margin-top:6px"></div>
      </div>

      <div class="glass span-12"><h2>Chord Library &mdash; Tap to Sound &amp; Notate</h2><div class="chords" id="p-lib"></div></div>
      <div class="glass span-12"><h2>40 Bossa Standards</h2><div id="p-standards"></div></div>

      <div class="glass span-12"><h2>Practice Log</h2>
        <form class="form" id="p-log">
          <label class="f">Minutes<input name="minutes" type="number" min="1" required></label>
          <label class="f wide">Focus<input name="focus" maxlength="100" placeholder="G13 voicings, Girl from Ipanema changes…"></label>
          <button class="btn" type="submit">Log session</button>
        </form>
        <div id="p-sessions" style="margin-top:10px"></div>
      </div>
    </section>`;

  // 16-Step Sequencer Grid Builder
  const STEP_LABELS = ["1", "e", "+", "a", "2", "e", "+", "a", "3", "e", "+", "a", "4", "e", "+", "a"];
  function renderGrid(activeStep = -1) {
    const gEl = $("#p-seq-grid"); if (!gEl) return;
    let html = `<span class="stat-s">Beat</span>` + STEP_LABELS.map((l, i) => `<b style="text-align:center;color:${i === activeStep ? "var(--accent)" : (i % 4 === 0 ? "#fff" : "var(--muted)")}">${l}</b>`).join("");
    html += `<span class="stat-s">Chord</span>`;
    for (let i = 0; i < 16; i++) {
      const on = customStabs.has(i), hi = i === activeStep;
      html += `<button type="button" data-stab="${i}" style="height:24px;min-width:0;padding:0;border-radius:6px;border:1px solid ${hi ? "#fff" : "rgba(255,255,255,0.16)"};background:${on ? "var(--accent)" : "rgba(255,255,255,0.04)"};cursor:pointer"></button>`;
    }
    html += `<span class="stat-s">Bass</span>`;
    for (let i = 0; i < 16; i++) {
      const on = customBass.has(i), hi = i === activeStep;
      html += `<button type="button" data-bass="${i}" style="height:20px;min-width:0;padding:0;border-radius:6px;border:1px solid ${hi ? "#fff" : "rgba(255,255,255,0.14)"};background:${on ? "var(--accent-2)" : "rgba(255,255,255,0.04)"};cursor:pointer"></button>`;
    }
    gEl.innerHTML = html;
    gEl.querySelectorAll("[data-stab]").forEach((b) => (b.onclick = () => {
      const i = +b.dataset.stab; if (customStabs.has(i)) customStabs.delete(i); else customStabs.add(i); renderGrid(activeStep);
    }));
    gEl.querySelectorAll("[data-bass]").forEach((b) => (b.onclick = () => {
      const i = +b.dataset.bass; if (customBass.has(i)) customBass.delete(i); else customBass.set(i, i < 8 ? 0 : 1); renderGrid(activeStep);
    }));
  }
  renderGrid();
  $("#p-pat-std").onclick = () => { customStabs = new Set([0, 3, 6, 10, 12]); customBass = new Map([[0, 0], [8, 1]]); renderGrid(); };
  $("#p-pat-sparse").onclick = () => { customStabs = new Set([0, 6, 8]); customBass = new Map([[0, 0], [8, 1]]); renderGrid(); };

  // Grand Staff Canvas Notator (Treble C4..B5 & Bass F2..C4)
  const NAT_STEPS = { C: 0, "C#": 0, D: 1, "D#": 1, E: 2, F: 3, "F#": 3, G: 4, "G#": 4, A: 5, "A#": 5, B: 6 };
  function midiStep(midi) {
    const nm = M.NAMES[midi % 12], oct = Math.floor(midi / 12) - 1;
    return { dia: oct * 7 + NAT_STEPS[nm], sharp: nm.includes("#"), label: nm + oct, midi };
  }
  function drawStaff(midis, caption = "") {
    const cv = document.getElementById("p-staff"); if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(220, cv.clientWidth || 300), H = cv.clientHeight || 175;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const gap = 8.5, trebleBot = 68, bassTop = 104, left = 36, right = W - 16;
    g.strokeStyle = "rgba(220,235,255,0.28)"; g.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const yT = trebleBot - i * gap, yB = bassTop + i * gap;
      g.beginPath(); g.moveTo(left, yT); g.lineTo(right, yT); g.stroke();
      g.beginPath(); g.moveTo(left, yB); g.lineTo(right, yB); g.stroke();
    }
    g.font = "18px serif"; g.fillStyle = "rgba(255,190,230,0.85)";
    g.fillText("𝄞", 12, trebleBot - 4); g.fillText("𝄢", 12, bassTop + 26);
    const list = (midis || []).slice(0, 8);
    const cs = getComputedStyle(document.body), ac = cs.getPropertyValue("--accent").trim() || "#ff70d4";
    list.forEach((m, i) => {
      const info = midiStep(m);
      const nx = left + 46 + i * ((right - left - 68) / Math.max(1, list.length));
      // E4=30 on treble bottom line; C4=28 ledger; A3=26 bass top line
      let ny;
      if (m >= 60) {
        ny = trebleBot - (info.dia - 30) * (gap / 2);
        if (m === 60 || m === 61) { g.beginPath(); g.moveTo(nx - 9, ny); g.lineTo(nx + 9, ny); g.strokeStyle = "#fff"; g.stroke(); }
      } else {
        ny = bassTop - (info.dia - 26) * (gap / 2);
      }
      g.fillStyle = ac; g.beginPath(); g.ellipse(nx, ny, 5.5, 4, -0.25, 0, Math.PI * 2); g.fill();
      if (info.sharp) { g.font = "11px sans-serif"; g.fillStyle = "#fff"; g.fillText("#", nx - 13, ny + 4); }
    });
    if (caption) { g.font = "11px system-ui, sans-serif"; g.fillStyle = "#d9e4f5"; g.fillText(caption, left, H - 8); }
  }
  drawStaff([60, 64, 67, 71], "Cmaj7 guide tone");

  function startPlayer(chords, bpm) {
    stopPlayer(); ac();
    const stepDur = 60 / bpm / 4; let step = 0, bar = 0;
    const tick = () => {
      const ch = chords[bar % chords.length], t = ac().currentTime + 0.03;
      if (customBass.has(step)) tone(ch.bass[customBass.get(step) % ch.bass.length], t, stepDur * 8, 0.22);
      if (customStabs.has(step)) ch.tones.forEach((m) => tone(m, t, stepDur * 5, 0.11));
      if (claveOn && (step === 4 || step === 12)) claveHit(t, step === 12);
      document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === Math.floor(step / 4)));
      renderGrid(step);
      if (step === 0) { highlightNotes(ch.notes); drawStaff([...ch.bass.slice(0, 1), ...ch.tones], `${ch.name} (${ch.spell})`); }
      $("#now-playing").textContent = `Bar ${bar + 1} · ${ch.name}${ch.role ? " (" + ch.role + ")" : ""}`;
      step++; if (step >= 16) { step = 0; bar++; }
    };
    tick(); playing = { timer: setInterval(tick, stepDur * 1000) };
  }
  function stopPlayer() {
    if (playing) { clearInterval(playing.timer); playing = null; const np = $("#now-playing"); if (np) np.textContent = "Stopped."; document.querySelectorAll(".beat").forEach((b) => b.classList.remove("on")); renderGrid(-1); highlightNotes([]); }
  }

  let metroTimer = null, metroBeat = 0;
  function toggleClave() {
    claveOn = !claveOn; $("#p-clave").textContent = claveOn ? "2 & 4 Clave: ON" : "2 & 4 Clave: OFF";
    if (!playing && claveOn) {
      ac(); const bpm = +$("#p-bpm").value || 60;
      const tick = () => {
        if (!playing && claveOn && (metroBeat % 4 === 1 || metroBeat % 4 === 3)) claveHit(ac().currentTime + 0.02, metroBeat % 4 === 3);
        document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === (metroBeat % 4)));
        metroBeat = (metroBeat + 1) % 4;
      };
      tick(); metroTimer = setInterval(tick, (60 / bpm) * 1000);
    } else if (!claveOn && metroTimer) { clearInterval(metroTimer); metroTimer = null; }
  }

  const kbd = $("#p-kbd"), keyBtns = [];
  for (let m = 48; m <= 71; m++) {
    const nm = M.NAMES[m % 12], oct = Math.floor(m / 12) - 1, sharp = nm.includes("#");
    const btn = h("button.btn.quiet.small", {
      type: "button",
      style: sharp ? "background:rgba(15,20,38,0.92);border-color:rgba(255,255,255,0.18)" : "",
      onclick: () => {
        tone(m, ac().currentTime + 0.02, 1.2, 0.2);
        $("#now-playing").textContent = `Key: ${nm}${oct}`;
        drawStaff([m], `Played: ${nm}${oct}`);
        if (drillTarget != null) {
          if (m % 12 === drillTarget % 12) { $("#p-drill-s").textContent = `Correct! ${nm}${oct} matched.`; drillTarget = null; }
          else { $("#p-drill-s").textContent = `Was ${nm}${oct} — keep hunting target.`; }
        }
      }
    }, `${nm}${oct}`);
    keyBtns.push({ btn, nm }); kbd.append(btn);
  }
  function highlightNotes(notes) { const set = new Set(notes || []); for (const k of keyBtns) k.btn.style.outline = set.has(k.nm) ? "2px solid var(--accent)" : ""; }
  $("#p-drill-btn").onclick = () => { drillTarget = 52 + Math.floor(Math.random() * 20); tone(drillTarget, ac().currentTime + 0.03, 0.8, 0.16); drawStaff([drillTarget], "Identify & tap this note on keyboard"); $("#p-drill-s").textContent = "Note shown on staff — tap matching key below!"; };

  let recorder = null, chunks = [], recUrl = null;
  $("#p-rec-btn").onclick = async () => {
    if (recorder && recorder.state === "recording") { recorder.stop(); $("#p-rec-btn").textContent = "Record local audio take"; return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast("Audio recorder unavailable"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); chunks = []; recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop()); if (recUrl) URL.revokeObjectURL(recUrl);
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" }); recUrl = URL.createObjectURL(blob);
        $("#p-rec-status").textContent = `Captured (${Math.round(blob.size / 1024)} KB)`;
        $("#p-rec-play").innerHTML = `<audio controls src="${recUrl}" style="max-width:100%"></audio>`;
      };
      recorder.start(); $("#p-rec-btn").textContent = "Stop recording"; $("#p-rec-status").textContent = "Recording mic…";
    } catch (_) { toast("Mic unavailable"); }
  };

  $("#p-clave").onclick = toggleClave;
  for (const ch of LIBRARY) {
    $("#p-lib").append(h("button.chord", {
      type: "button",
      onclick: () => { stopPlayer(); playChord(ch, ac().currentTime + 0.03, 60 / (+$("#p-bpm").value || 60) / 4); highlightNotes(ch.notes); drawStaff([...ch.bass.slice(0, 1), ...ch.tones], ch.name); $("#now-playing").textContent = ch.name + " — " + ch.spell; }
    }, h("b", null, ch.name), h("span", null, ch.spell)));
  }
  $("#p-play-prog").onclick = () => startPlayer(M.progression($("#p-key").value), +$("#p-bpm").value || 60);
  $("#p-stop").onclick = stopPlayer;

  const QMAP = { "": "maj7", "maj7": "maj7", "maj9": "maj9", "6": "maj7", "69": "maj9", "m": "m7", "m6": "m7", "m69": "m7", "m7": "m7", "m9": "m9", "7": "7", "9": "9", "13": "13", "7b13": "13", "7#11": "13", "7sus4": "7", "sus4": "7", "m7b5": "m7b5", "dim7": "m7b5", "dim": "m7b5" };
  const FLAT = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B", Fb: "E", "E#": "F", "B#": "C" };
  const chartChord = (tok) => { const m = String(tok).split("/")[0].match(/^([A-G])(#|b)?(.*)$/); if (!m) return null; const r = FLAT[m[1] + (m[2] || "")] || (m[1] + (m[2] || "")); const q = QMAP[(m[3] || "").trim()]; try { return q ? M.chord(r, q) : null; } catch (_) { return null; } };
  if (window.BOSSA_STANDARDS) {
    for (const t of window.BOSSA_STANDARDS) {
      const parsed = t.bars.map((bar) => chartChord(String(bar).split(" ")[0]));
      const strip = h("div.mono", { hidden: "" }, t.bars.join("  |  "));
      $("#p-standards").append(h("div.kv", null,
        h("span", null, h("b", null, t.t), h("span.stat-s", null, ` · ${t.c || ""} · ${t.key} · ${t.bars.length} bars`)),
        h("span.row-actions", null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { strip.hidden = !strip.hidden; } }, "Changes"),
          parsed.filter(Boolean).length >= Math.ceil(t.bars.length * 0.7) ? h("button.btn.small", { type: "button", onclick: () => startPlayer(parsed.map((c, i) => c || parsed.slice(0, i).reverse().find(Boolean) || LIBRARY[0]), +$("#p-bpm").value || 60) }, "Play") : null
        )
      ), strip);
    }
  }

  let reps = S.get("ladder_reps", 0), bpm = S.get("ladder_bpm", 60);
  const paintLadder = () => {
    const rBox = $("#p-rungs"); rBox.innerHTML = "";
    RUNGS.forEach((r) => {
      const btn = h("button.btn." + (bpm === r ? "small" : "quiet.small"), {
        type: "button", onclick: () => { bpm = r; reps = 0; S.set("ladder_bpm", bpm); S.set("ladder_reps", 0); paintLadder(); }
      }, r + " BPM");
      rBox.append(btn);
    });
    $("#p-reps").textContent = `${reps} / 8 at ${bpm} BPM`;
    $("#p-ladder-note").textContent = reps >= 8 ? "Rung ready — tap Clean rep once more to advance!" : "Eight clean reps promotes you to the next BPM rung.";
    if (document.activeElement !== $("#p-bpm")) $("#p-bpm").value = bpm;
  };
  $("#p-rep").onclick = () => {
    reps++;
    if (reps > 8) {
      const nextRung = RUNGS.find((x) => x > bpm) || (bpm + 6);
      bpm = nextRung; reps = 0; S.set("ladder_bpm", bpm); toast("Promoted to " + bpm + " BPM!");
    }
    S.set("ladder_reps", reps); paintLadder();
  };
  $("#p-miss").onclick = () => { reps = 0; S.set("ladder_reps", 0); paintLadder(); };
  $("#p-ladder-reset").onclick = () => { reps = 0; bpm = 50; S.set("ladder_reps", 0); S.set("ladder_bpm", 50); paintLadder(); };
  paintLadder();

  const EAR_Q = ["maj7", "m7", "7", "m7b5", "13", "m9"];
  const INTERVALS = [{ st: 3, name: "Minor 3rd" }, { st: 4, name: "Major 3rd" }, { st: 7, name: "Perfect 5th" }, { st: 10, name: "Minor 7th" }, { st: 11, name: "Major 7th" }, { st: 14, name: "Major 9th" }];
  let earScore = S.get("ear", { right: 0, total: 0 });
  const paintEar = () => { $("#p-ear-score").textContent = earScore.total ? `Score: ${earScore.right} / ${earScore.total}` : ""; };
  $("#p-ear-play").onclick = () => {
    stopPlayer(); const ec = M.chord(M.NAMES[Math.floor(Math.random() * 12)], EAR_Q[Math.floor(Math.random() * EAR_Q.length)]);
    playChord(ec, ac().currentTime + 0.03, 0.22); $("#p-ear-note").textContent = "Playing chord…";
    const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const c of EAR_Q) box.append(h("button.btn.quiet.small", { type: "button", onclick: () => { earScore.total++; if (c === ec.quality) earScore.right++; S.set("ear", earScore); $("#p-ear-note").textContent = c === ec.quality ? `Right — ${ec.name}.` : `Was ${ec.name}.`; paintEar(); } }, M.QUALITIES[c].label));
  };
  $("#p-iv-play").onclick = () => {
    stopPlayer(); const base = 60 + Math.floor(Math.random() * 7), iv = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    const t = ac().currentTime + 0.03; tone(base, t, 0.65, 0.18); tone(base + iv.st, t + 0.35, 0.75, 0.18);
    $("#p-ear-note").textContent = "Playing interval…"; const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const c of INTERVALS) box.append(h("button.btn.quiet.small", { type: "button", onclick: () => { earScore.total++; if (c.st === iv.st) earScore.right++; S.set("ear", earScore); $("#p-ear-note").textContent = c.st === iv.st ? `Right — ${iv.name}.` : `Was ${iv.name}.`; paintEar(); } }, c.name));
  };
  paintEar();

  const paintLog = () => {
    const ss = S.list("sessions").sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
    $("#p-sessions").innerHTML = ss.map((s) => `<div class="kv"><span>${s.date} · ${esc(s.focus || "Practice")}</span><b>${s.minutes} min</b></div>`).join("") || `<p class="empty">No sessions logged yet.</p>`;
  };
  $("#p-log").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("sessions", { date: day(), minutes: +f.minutes.value || 0, focus: f.focus.value.trim() }); f.reset(); toast("Logged"); paintLog(); });
  paintLog();

  $("#export").onclick = () => download(`piano_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintLog(); paintLadder(); } catch (e) { toast(e.message); } };
})();
