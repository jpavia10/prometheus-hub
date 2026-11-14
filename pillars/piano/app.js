/* Bossa Piano Studio v4 (Tactile Harmonic Instrument):
   16-step comping sequencer & 2/4 clave, Voicing & Inversion Studio (Shell, 1st Inv, Rootless A/B,
   DP Voice-Led ii-V-I-vi), role-coded Grand Staff sight-reader, staggered 2-octave piano keyboard
   with active role pills & QWERTY bindings, BPM rung ladder, ear trainer, 40 bossa standards & practice log. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("piano");
  const app = $("#app");
  field({ count: 900, at: [0.76, 0.32], scale: 0.24, glyph: (n) => [...G.line(Math.round(n * 0.6), -0.9, 0, 0.9, 0), ...G.ring(Math.round(n * 0.4), 0.3)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const M = PIANO_MUSIC;

  let AC = null;
  const ac = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!AC) AC = new AudioCtx();
    if (AC.state === "suspended") AC.resume().catch(() => {});
    return AC;
  };
  const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  function tone(midi, t, dur, vol) {
    try {
      const ctx = ac(); if (!ctx) return;
      const now = t ?? ctx.currentTime + 0.02;
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o1.type = "triangle"; o2.type = "sine"; o1.frequency.value = freq(midi); o2.frequency.value = freq(midi) * 2.001;
      f.type = "lowpass"; f.frequency.value = 2400;
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(ctx.destination);
      o1.start(now); o2.start(now); o1.stop(now + dur + 0.05); o2.stop(now + dur + 0.05);
    } catch (_) {}
  }
  function claveHit(t, accent) {
    try {
      const ctx = ac(); if (!ctx) return;
      const now = t ?? ctx.currentTime + 0.02;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = accent ? 2450 : 1950;
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(accent ? 0.14 : 0.09, now + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      o.connect(g).connect(ctx.destination); o.start(now); o.stop(now + 0.05);
    } catch (_) {}
  }
  const playVoicing = (ch, t, stepDur) => {
    const ctx = ac();
    const start = t ?? (ctx ? ctx.currentTime + 0.02 : 0);
    const dur = Math.max(0.45, (stepDur || 0.25) * 6);
    const notes = ch.midi || [...(ch.bass ? ch.bass.slice(0, 1) : []), ...(ch.tones || [])];
    notes.forEach((m, i) => tone(m, start, i === 0 && ch.roles && ch.roles[0] === "R" ? dur * 1.25 : dur, i === 0 && ch.roles && ch.roles[0] === "R" ? 0.19 : 0.11));
  };
  const playChord = (ch, t, stepDur) => {
    if (ch.midi) return playVoicing(ch, t, stepDur);
    tone(ch.bass[0], t, stepDur * 8, 0.2);
    ch.tones.forEach((m) => tone(m, t, stepDur * 6, 0.11));
  };

  function publishEvent(type, title, ref) {
    try {
      if (typeof PB !== "undefined" && PB.events && typeof PB.events.publish === "function") {
        PB.events.publish({ type, pillar: "piano", ref: ref || "", title });
      }
    } catch (_) {}
  }

  const RUNGS = [50, 56, 60, 68, 76, 84, 96, 108, 120];
  const VOICING_LABELS = {
    0: { short: "Shell", label: "Comping Shell (R + 3 + 7)" },
    1: { short: "1st Inv", label: "1st Inversion (R + 7 + 3)" },
    2: { short: "Rootless A", label: "Rootless A-form (3-5-7-9)" },
    3: { short: "Rootless B", label: "Rootless B-form (7-9-3-5)" },
  };
  const ROLE_COLORS = {
    R: "#ff70d4",
    "3": "#4de8ff",
    "5": "#b9a2ff",
    b5: "#b9a2ff",
    "6": "#ffd27a",
    "7": "#ffd27a",
    "9": "#57efc0",
    "13": "#ff9d5c",
  };

  let customStabs = new Set(M.PATTERN.stabs);
  let customBass = new Map(Object.entries(M.PATTERN.bass).map(([k, v]) => [+k, v]));
  let playing = null, claveOn = false, drillTarget = null;
  let activeInv = 0;
  let voiceLedActive = false;
  let currentChord = M.chord("C", "maj7");
  let activeProgBar = -1;
  let kbdBase = 60; // C4..B5 default (puts 55..79 voice-led octave-4 voicings & A..K concert pitch in view)

  const LIBRARY = [
    ["C", "maj7"], ["C", "maj9"], ["D", "m9"], ["E", "m7"], ["F", "maj7"], ["G", "13"], ["G", "9"], ["A", "m7"],
    ["B", "m7b5"], ["E", "7"], ["A", "7"], ["D", "7"], ["F#", "m7b5"], ["B", "7"], ["G", "maj7"], ["E", "m9"]
  ].map(([r, q]) => M.chord(r, q));

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12">
        <h2>Harmonic Studio &mdash; Sequencer, Voicings, Staff &amp; Keyboard</h2>
        <div class="p-studio-top">
          <div class="p-studio-comp">
            <div class="p-status-row">
              <span class="p-beats"><span class="beat"></span><span class="beat"></span><span class="beat"></span><span class="beat"></span></span>
              <span id="now-playing" class="stat-s">Tap any sequencer cell, choose a voicing, or play keys (A–K / W–U).</span>
            </div>
            <div id="p-seq-grid" class="p-seq-grid"></div>
            <form class="form" style="margin-top:8px">
              <label class="f">Tempo (BPM)<input id="p-bpm" type="number" value="60" min="40" max="180"></label>
              <label class="f">ii&middot;V&middot;I&middot;vi Key<select id="p-key">${M.NAMES.map((n) => `<option ${n === "C" ? "selected" : ""}>${n}</option>`).join("")}</select></label>
            </form>
            <div class="row-actions" style="flex-wrap:wrap;gap:6px;margin-top:8px">
              <button class="btn small" id="p-play-prog" type="button">Play progression</button>
              <button class="btn quiet small" id="p-clave" type="button" aria-pressed="false">2 &amp; 4 Clave: OFF</button>
              <button class="btn quiet small" id="p-stop" type="button">Stop</button>
              <button class="btn quiet small" id="p-pat-std" type="button">Standard (1 + a)</button>
              <button class="btn quiet small" id="p-pat-sparse" type="button">Sparse ("1 + 2")</button>
            </div>

            <div class="p-voicing-studio" id="p-voicing-studio">
              <div class="p-voicing-head">
                <span class="p-voicing-title">Voicing &amp; Inversion Studio</span>
                <button class="btn small" id="p-play-vl" type="button">Play Voice-Led ii&ndash;V&ndash;I&ndash;vi</button>
              </div>
              <div class="p-voicing-controls">
                <div class="p-seg" id="p-voicing-modes" role="group" aria-label="Voicing mode">
                  <button class="p-seg-btn" id="p-v-0" data-inv="0" type="button" aria-pressed="true">Shell</button>
                  <button class="p-seg-btn" id="p-v-1" data-inv="1" type="button" aria-pressed="false">1st Inv</button>
                  <button class="p-seg-btn" id="p-v-2" data-inv="2" type="button" aria-pressed="false">Rootless A</button>
                  <button class="p-seg-btn" id="p-v-3" data-inv="3" type="button" aria-pressed="false">Rootless B</button>
                </div>
              </div>
              <div class="p-prog-ribbon" id="p-prog-ribbon"></div>
            </div>
          </div>

          <div class="p-staff-card">
            <div class="p-staff-head">
              <span class="p-voicing-title">Grand Staff Sight-Reader</span>
              <span class="stat-s" id="p-midi-span">MIDI 36–71</span>
            </div>
            <div class="p-voicing-readout" id="p-voicing-readout"></div>
            <canvas id="p-staff"></canvas>
            <div class="row-actions" style="flex-wrap:wrap;gap:6px;margin-top:8px">
              <button class="btn small" id="p-drill-btn" type="button">Drill Random Note</button>
              <span class="stat-s" id="p-drill-s">Live feedback from keys &amp; chords.</span>
            </div>
          </div>
        </div>

        <div class="p-kbd-section">
          <div class="p-kbd-bar">
            <div class="p-role-legend" aria-label="Chord tone roles">
              <span class="p-role-chip" data-role="R">R <span>Root</span></span>
              <span class="p-role-chip" data-role="3">3 <span>Guide</span></span>
              <span class="p-role-chip" data-role="5">5 <span>Fifth</span></span>
              <span class="p-role-chip" data-role="7">7 <span>Guide</span></span>
              <span class="p-role-chip" data-role="9">9 <span>Color</span></span>
              <span class="p-role-chip" data-role="13">13 <span>Color</span></span>
            </div>
            <div class="row-actions" style="margin:0;gap:6px;align-items:center">
              <span class="stat-s" id="p-kbd-range">C4–B5 · QWERTY A–K / W–U</span>
              <button class="btn quiet small" id="p-oct-shift" type="button">Octave: C4–B5</button>
            </div>
          </div>
          <div class="p-kbd-shell">
            <div id="p-kbd" class="p-kbd-bed" role="group" aria-label="2-octave piano keyboard"></div>
          </div>
          <div class="row-actions" style="margin-top:10px;align-items:center">
            <button class="btn quiet small" id="p-rec-btn" type="button">Record local audio take</button>
            <span id="p-rec-status" class="stat-s">100% browser RAM audio capture.</span>
          </div>
          <div id="p-rec-play" style="margin-top:6px"></div>
        </div>
      </div>

      <div class="glass span-6">
        <h2>BPM Rung Ladder &mdash; 50 to 120 BPM</h2>
        <div id="p-rungs" class="row-actions" style="flex-wrap:wrap;gap:5px;margin:6px 0 10px"></div>
        <div class="rep" id="p-reps">0 / 8</div>
        <div class="stat-s" id="p-ladder-note">Eight clean reps earns next BPM rung.</div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn small" id="p-rep" type="button">Clean rep</button>
          <button class="btn quiet small" id="p-miss" type="button">Missed one</button>
          <button class="btn quiet small" id="p-ladder-reset" type="button">Reset</button>
        </div>
      </div>

      <div class="glass span-6">
        <h2>Ear &amp; Interval Trainer</h2>
        <div class="stat-s" id="p-ear-note">Hear a chord quality or 2-note interval.</div>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn small" id="p-ear-play" type="button">Play chord</button>
          <button class="btn quiet small" id="p-iv-play" type="button">Play interval</button>
        </div>
        <div class="row-actions" id="p-ear-choices" style="flex-wrap:wrap;gap:6px;margin-top:8px"></div>
        <div class="stat-s" id="p-ear-score" style="margin-top:6px"></div>
      </div>

      <div class="glass span-12">
        <h2>Chord Library &mdash; Tap to Sound &amp; Notate</h2>
        <div class="stat-s" id="p-lib-now" style="margin-bottom:10px">Active voicing mode applies to every library chord tap.</div>
        <div class="chords" id="p-lib"></div>
      </div>

      <div class="glass span-12">
        <h2>40 Bossa Standards</h2>
        <div class="form" style="margin-bottom:10px">
          <label class="f wide">Filter 40 standards<input id="p-std-filter" type="search" placeholder="Search title, composer, or key (e.g. Jobim, Dm, Wave)…"></label>
        </div>
        <div id="p-standards"></div>
      </div>

      <div class="glass span-12">
        <h2>Practice Log</h2>
        <form class="form" id="p-log">
          <label class="f">Minutes<input name="minutes" type="number" min="1" required></label>
          <label class="f wide">Focus<input name="focus" maxlength="100" placeholder="G13 rootless voicings, Girl from Ipanema changes…"></label>
          <button class="btn" type="submit">Log session</button>
        </form>
        <div id="p-sessions" style="margin-top:10px"></div>
      </div>
    </section>`;

  // 16-Step Sequencer Grid Builder
  const STEP_LABELS = ["1", "e", "+", "a", "2", "e", "+", "a", "3", "e", "+", "a", "4", "e", "+", "a"];
  function renderGrid(activeStep = -1) {
    const gEl = $("#p-seq-grid"); if (!gEl) return;
    let html = `<span class="p-seq-lbl">Beat</span>` + STEP_LABELS.map((l, i) => `<b class="p-seq-step${i % 4 === 0 ? " downbeat" : ""}${i === activeStep ? " active" : ""}">${l}</b>`).join("");
    html += `<span class="p-seq-lbl">Chord</span>`;
    for (let i = 0; i < 16; i++) {
      const on = customStabs.has(i), hi = i === activeStep, bs = i > 0 && i % 4 === 0;
      html += `<button type="button" class="p-seq-cell stab${on ? " on" : ""}${hi ? " hi" : ""}${bs ? " beat-start" : ""}" data-stab="${i}" aria-label="Chord stab step ${i + 1}" aria-pressed="${on}"></button>`;
    }
    html += `<span class="p-seq-lbl">Bass</span>`;
    for (let i = 0; i < 16; i++) {
      const on = customBass.has(i), hi = i === activeStep, bs = i > 0 && i % 4 === 0;
      html += `<button type="button" class="p-seq-cell bass${on ? " on" : ""}${hi ? " hi" : ""}${bs ? " beat-start" : ""}" data-bass="${i}" aria-label="Bass step ${i + 1}" aria-pressed="${on}"></button>`;
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
    const nm = M.NAMES[((midi % 12) + 12) % 12], oct = Math.floor(midi / 12) - 1;
    return { dia: oct * 7 + NAT_STEPS[nm], sharp: nm.includes("#"), label: nm + oct, midi };
  }
  function drawStaff(midis, caption = "", roles = []) {
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
    // Grand staff brace bar
    g.beginPath(); g.moveTo(left, trebleBot - 4 * gap); g.lineTo(left, bassTop + 4 * gap); g.stroke();
    g.font = "18px serif"; g.fillStyle = "rgba(255,190,230,0.85)";
    g.fillText("𝄞", 12, trebleBot - 4); g.fillText("𝄢", 12, bassTop + 26);

    const raw = (midis || []).map((m, idx) => ({ m, role: roles[idx] || "" })).slice(0, 8);
    const cs = getComputedStyle(document.body), ac = cs.getPropertyValue("--accent").trim() || "#ff70d4";
    const isChordStack = raw.length > 1;
    const bassX = left + Math.max(58, (right - left) * 0.28);
    const trebleX = left + Math.max(88, (right - left) * 0.54);
    let prevTrebleDia = null, prevTrebleShifted = false;

    raw.forEach((item, i) => {
      const m = item.m;
      const info = midiStep(m);
      const isTreble = m >= 55; // keep octave-4 voice-leading >= G3 cleanly on treble/ledger lines
      let nx = isChordStack ? (isTreble ? trebleX : bassX) : (left + (right - left) * 0.44);
      let ny;

      if (isTreble) {
        ny = trebleBot - (info.dia - 30) * (gap / 2);
        if (isChordStack && prevTrebleDia != null && Math.abs(info.dia - prevTrebleDia) <= 1 && !prevTrebleShifted) {
          nx += 12;
          prevTrebleShifted = true;
        } else {
          prevTrebleShifted = false;
        }
        prevTrebleDia = info.dia;
        // Ledger lines for C4 (28) and below, or A5 (40) and above
        g.strokeStyle = "rgba(235,244,255,0.65)";
        for (let ld = 28; ld >= info.dia; ld -= 2) {
          const ly = trebleBot - (ld - 30) * (gap / 2);
          g.beginPath(); g.moveTo(nx - 9, ly); g.lineTo(nx + 9, ly); g.stroke();
        }
        for (let ld = 40; ld <= info.dia; ld += 2) {
          const ly = trebleBot - (ld - 30) * (gap / 2);
          g.beginPath(); g.moveTo(nx - 9, ly); g.lineTo(nx + 9, ly); g.stroke();
        }
      } else {
        ny = bassTop - (info.dia - 26) * (gap / 2);
        g.strokeStyle = "rgba(235,244,255,0.65)";
        for (let ld = 16; ld >= info.dia; ld -= 2) {
          const ly = bassTop - (ld - 26) * (gap / 2);
          g.beginPath(); g.moveTo(nx - 9, ly); g.lineTo(nx + 9, ly); g.stroke();
        }
      }

      const noteCol = (item.role && ROLE_COLORS[item.role]) || ac;
      g.fillStyle = noteCol;
      g.beginPath(); g.ellipse(nx, ny, 5.5, 4, -0.25, 0, Math.PI * 2); g.fill();
      if (info.sharp) { g.font = "11px sans-serif"; g.fillStyle = "#fff"; g.fillText("#", nx - 14, ny + 4); }
      if (item.role && isChordStack) {
        g.font = "600 9.5px Outfit, system-ui, sans-serif";
        g.fillStyle = noteCol;
        g.fillText(item.role, nx + 9, ny + 3.5);
      } else if (!isChordStack) {
        g.font = "500 10px Outfit, system-ui, sans-serif";
        g.fillStyle = "#dce6f7";
        g.fillText(info.label, nx + 10, ny + 3.5);
      }
    });
    if (caption) { g.font = "11px Outfit, system-ui, sans-serif"; g.fillStyle = "#d9e4f5"; g.fillText(caption, left, H - 8); }
  }

  // Realistic Staggered 2-Octave Keyboard Builder & Role Pill Highlighter
  const QWERTY_BY_SEMI = { 0: "A", 1: "W", 2: "S", 3: "E", 4: "D", 5: "F", 6: "T", 7: "G", 8: "Y", 9: "H", 10: "U", 11: "J", 12: "K" };
  const QWERTY_KEYMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };
  let keyBtns = [];

  function triggerPianoKey(m) {
    const nm = M.NAMES[m % 12], oct = Math.floor(m / 12) - 1;
    tone(m, null, 1.2, 0.2);
    $("#now-playing").textContent = `Key: ${nm}${oct}`;
    drawStaff([m], `Played: ${nm}${oct}`);
    if (drillTarget != null) {
      if (m % 12 === drillTarget % 12) { $("#p-drill-s").textContent = `Correct! ${nm}${oct} matched.`; drillTarget = null; }
      else { $("#p-drill-s").textContent = `Was ${nm}${oct} — keep hunting target.`; }
    }
  }

  function buildKeyboard() {
    const kbd = $("#p-kbd"); if (!kbd) return;
    kbd.innerHTML = "";
    keyBtns = [];
    const whitesWrap = h("div.p-kbd-whites");
    let whiteIdx = -1;
    for (let offset = 0; offset < 24; offset++) {
      const m = kbdBase + offset;
      const nm = M.NAMES[m % 12], oct = Math.floor(m / 12) - 1, sharp = nm.includes("#");
      const qw = QWERTY_BY_SEMI[offset] || "";
      const pill = h("span.p-role-pill", { hidden: true });
      const btn = h("button", {
        type: "button",
        class: sharp ? "p-key p-key-b" : "p-key p-key-w",
        "data-midi": String(m),
        "aria-label": `${nm}${oct}${qw ? " · Key " + qw : ""}`,
        style: sharp ? `--b-left:${(((whiteIdx + 1) / 14) * 100).toFixed(4)}%` : "",
        onclick: () => triggerPianoKey(m),
      }, pill, qw ? h("kbd.p-key-qwerty", null, qw) : null, h("span.p-key-note", null, nm + oct));
      if (!sharp) {
        whiteIdx++;
        whitesWrap.append(btn);
      } else {
        kbd.append(btn);
      }
      keyBtns.push({ btn, pill, midi: m, nm });
    }
    kbd.prepend(whitesWrap);
    const rangeLabel = kbdBase === 48 ? "C3–B4" : "C4–B5";
    $("#p-kbd-range").textContent = `${rangeLabel} · QWERTY A–K / W–U`;
    $("#p-oct-shift").textContent = `Octave: ${rangeLabel}`;
  }

  function highlightVoicing(chOrNotes) {
    for (const k of keyBtns) {
      k.btn.classList.remove("is-lit");
      k.btn.removeAttribute("data-role");
      k.pill.textContent = "";
      k.pill.hidden = true;
    }
    if (!chOrNotes) return;
    if (Array.isArray(chOrNotes)) {
      const set = new Set(chOrNotes);
      for (const k of keyBtns) {
        if (set.has(k.nm)) k.btn.classList.add("is-lit");
      }
      return;
    }
    const ch = chOrNotes;
    const maxM = kbdBase + 23;
    const toneMidis = [...(ch.tones || [])];
    const hasRoot = ch.roles && ch.roles[0] === "R";
    const toneRoles = hasRoot ? ch.roles.slice(1) : [...(ch.roles || [])];

    let shift = 0;
    if (toneMidis.length) {
      const minT = Math.min(...toneMidis), maxT = Math.max(...toneMidis);
      if (minT < kbdBase && maxT + 12 <= maxM) shift = 12;
      else if (maxT > maxM && minT - 12 >= kbdBase) shift = -12;
    }
    const fold = (m) => {
      let x = m + shift;
      while (x < kbdBase) x += 12;
      while (x > maxM) x -= 12;
      return x;
    };

    const assigned = new Map();
    toneMidis.forEach((m, i) => {
      const target = fold(m);
      assigned.set(target, toneRoles[i] || "•");
    });
    if (hasRoot && ch.bass && ch.bass.length) {
      const rootPc = ((ch.bass[0] % 12) + 12) % 12;
      const rootKey = keyBtns.find((k) => k.midi % 12 === rootPc && !assigned.has(k.midi));
      if (rootKey) assigned.set(rootKey.midi, "R");
    }

    for (const k of keyBtns) {
      if (assigned.has(k.midi)) {
        const role = assigned.get(k.midi);
        k.btn.classList.add("is-lit");
        k.btn.setAttribute("data-role", role);
        k.pill.textContent = role;
        k.pill.hidden = false;
      }
    }
  }
  const highlightNotes = (notes) => highlightVoicing(notes);

  buildKeyboard();

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector(".pk-palette-back:not([hidden]), dialog[open]")) return;
    const typing = e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable='true']");
    if (typing) return;
    const semi = QWERTY_KEYMAP[String(e.key || "").toLowerCase()];
    if (semi == null) return;
    const midi = kbdBase + semi;
    const keyObj = keyBtns.find((x) => x.midi === midi);
    if (!keyObj) return;
    e.preventDefault();
    keyObj.btn.classList.add("is-down");
    triggerPianoKey(midi);
  });
  document.addEventListener("keyup", (e) => {
    const semi = QWERTY_KEYMAP[String(e.key || "").toLowerCase()];
    if (semi == null) return;
    const midi = kbdBase + semi;
    const keyObj = keyBtns.find((x) => x.midi === midi);
    if (keyObj) keyObj.btn.classList.remove("is-down");
  });

  // Voicing & Inversion Studio state + presentation
  let lastPreviewed = null;
  function presentVoicing(voiced, playAudio = true) {
    lastPreviewed = voiced;
    const modeLabel = voiced.voicingMode === "voice-led"
      ? "Voice-Led Smooth"
      : (VOICING_LABELS[voiced.invIndex] ? VOICING_LABELS[voiced.invIndex].short : voiced.voicingMode);
    const minM = Math.min(...voiced.midi), maxM = Math.max(...voiced.midi);
    $("#p-midi-span").textContent = `MIDI ${minM}–${maxM}`;
    $("#p-voicing-readout").innerHTML = `<b>${esc(voiced.name)}</b> · ${esc(modeLabel)} · ${voiced.notes.map((n, i) => `${esc(n)}(${esc(voiced.roles[i])})`).join(" · ")}`;
    $("#p-lib-now").textContent = `Active: ${VOICING_LABELS[activeInv].label} — last previewed: ${voiced.name} (${voiced.notes.join(" · ")})`;
    $("#now-playing").textContent = `${voiced.name} (${modeLabel}) — ${voiced.notes.join(" · ")}`;
    highlightVoicing(voiced);
    drawStaff(voiced.midi, `${voiced.name} · ${modeLabel}`, voiced.roles);
    if (playAudio) playVoicing(voiced, null, 60 / (+$("#p-bpm").value || 60) / 4);
  }

  function currentProgressionVoiced() {
    const raw = M.progression($("#p-key").value);
    return voiceLedActive ? M.voiceLead(raw) : raw.map((c) => M.invertChord(c, activeInv));
  }

  function renderProgRibbon() {
    const box = $("#p-prog-ribbon"); if (!box) return;
    const prog = currentProgressionVoiced();
    box.innerHTML = "";
    prog.forEach((vc, idxBar) => {
      const formTag = vc.roles.join("-");
      const travelBadge = voiceLedActive ? (idxBar === 0 ? "anchor" : `Δ${vc.travel}st`) : (VOICING_LABELS[activeInv].short);
      const pad = h("button.p-prog-pad" + (idxBar === activeProgBar ? ".active" : ""), {
        type: "button",
        onclick: () => {
          stopPlayer();
          activeProgBar = idxBar;
          currentChord = vc;
          presentVoicing(vc, true);
          renderProgRibbon();
        }
      },
        h("div.p-prog-deg", null, h("span", null, vc.role || `Bar ${idxBar + 1}`), h("span.p-prog-travel", null, travelBadge)),
        h("div.p-prog-name", null, vc.name),
        h("div.p-prog-form", null, `${formTag} · ${vc.notes.join(" ")}`)
      );
      box.append(pad);
    });
  }

  function syncVoicingButtons() {
    document.querySelectorAll("#p-voicing-modes [data-inv]").forEach((btn) => {
      const on = !voiceLedActive && +btn.dataset.inv === activeInv;
      btn.setAttribute("aria-pressed", String(on));
    });
    const vlBtn = $("#p-play-vl");
    if (vlBtn) vlBtn.setAttribute("aria-pressed", String(voiceLedActive));
  }

  document.querySelectorAll("#p-voicing-modes [data-inv]").forEach((btn) => {
    btn.onclick = () => {
      stopPlayer();
      activeInv = +btn.dataset.inv;
      voiceLedActive = false;
      syncVoicingButtons();
      renderProgRibbon();
      const target = currentChord || M.chord($("#p-key").value, "maj7");
      presentVoicing(M.invertChord(target, activeInv), true);
    };
  });

  $("#p-oct-shift").onclick = () => {
    kbdBase = kbdBase === 60 ? 48 : 60;
    buildKeyboard();
    if (lastPreviewed) highlightVoicing(lastPreviewed);
  };

  $("#p-key").onchange = () => {
    activeProgBar = -1;
    const prog = currentProgressionVoiced();
    currentChord = prog[0];
    renderProgRibbon();
    presentVoicing(prog[0], false);
  };

  function startPlayer(chords, bpm, opts = {}) {
    stopPlayer(); ac();
    const stepDur = 60 / bpm / 4; let step = 0, bar = 0;
    const tick = () => {
      const ch = chords[bar % chords.length];
      const ctx = ac(), t = ctx ? ctx.currentTime + 0.03 : 0;
      if (customBass.has(step) && ch.bass && ch.bass.length) tone(ch.bass[customBass.get(step) % ch.bass.length], t, stepDur * 8, 0.22);
      if (customStabs.has(step) && ch.tones) ch.tones.forEach((m) => tone(m, t, stepDur * 5, 0.11));
      if (claveOn && (step === 4 || step === 12)) claveHit(t, step === 12);
      document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === Math.floor(step / 4)));
      renderGrid(step);
      if (step === 0) {
        if (opts.ribbon) { activeProgBar = bar % chords.length; renderProgRibbon(); }
        if (ch.midi && ch.roles) {
          lastPreviewed = ch;
          const minM = Math.min(...ch.midi), maxM = Math.max(...ch.midi);
          $("#p-midi-span").textContent = `MIDI ${minM}–${maxM}`;
          highlightVoicing(ch);
          drawStaff(ch.midi, `${ch.name} (${ch.voicingMode || ""})`, ch.roles);
          $("#p-voicing-readout").innerHTML = `<b>${esc(ch.name)}</b> · ${esc(ch.voicingMode || "comping")} · ${ch.notes.map((n, i) => `${esc(n)}(${esc(ch.roles[i])})`).join(" · ")}`;
        } else {
          highlightNotes(ch.notes);
          drawStaff([...ch.bass.slice(0, 1), ...ch.tones], `${ch.name} (${ch.spell})`);
        }
      }
      $("#now-playing").textContent = `Bar ${bar + 1} · ${ch.name}${ch.role ? " (" + ch.role + ")" : ""}${ch.travel != null && bar % chords.length > 0 ? " · Δ" + ch.travel + "st" : ""}`;
      step++; if (step >= 16) { step = 0; bar++; }
    };
    tick(); playing = { timer: setInterval(tick, stepDur * 1000) };
  }
  function stopPlayer() {
    if (playing) {
      clearInterval(playing.timer); playing = null;
      const np = $("#now-playing"); if (np) np.textContent = "Stopped.";
      document.querySelectorAll(".beat").forEach((b) => b.classList.remove("on"));
      renderGrid(-1);
      activeProgBar = -1;
      renderProgRibbon();
      highlightVoicing(null);
    }
  }

  let metroTimer = null, metroBeat = 0;
  function toggleClave() {
    claveOn = !claveOn;
    $("#p-clave").textContent = claveOn ? "2 & 4 Clave: ON" : "2 & 4 Clave: OFF";
    $("#p-clave").setAttribute("aria-pressed", String(claveOn));
    if (!playing && claveOn) {
      ac(); const bpm = +$("#p-bpm").value || 60;
      const tick = () => {
        const ctx = ac();
        if (!playing && claveOn && ctx && (metroBeat % 4 === 1 || metroBeat % 4 === 3)) claveHit(ctx.currentTime + 0.02, metroBeat % 4 === 3);
        document.querySelectorAll(".beat").forEach((b, i) => b.classList.toggle("on", i === (metroBeat % 4)));
        metroBeat = (metroBeat + 1) % 4;
      };
      tick(); metroTimer = setInterval(tick, (60 / bpm) * 1000);
    } else if (!claveOn && metroTimer) { clearInterval(metroTimer); metroTimer = null; }
  }

  $("#p-drill-btn").onclick = () => {
    drillTarget = 52 + Math.floor(Math.random() * 20);
    tone(drillTarget, null, 0.8, 0.16);
    drawStaff([drillTarget], "Identify & tap this note on keyboard");
    $("#p-drill-s").textContent = "Note shown on staff — tap matching key below!";
  };

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
      onclick: () => {
        stopPlayer();
        voiceLedActive = false;
        syncVoicingButtons();
        currentChord = ch;
        presentVoicing(M.invertChord(ch, activeInv), true);
      }
    }, h("b", null, ch.name), h("span", null, ch.spell)));
  }

  $("#p-play-prog").onclick = () => {
    voiceLedActive = false;
    syncVoicingButtons();
    const prog = M.progression($("#p-key").value).map((c) => M.invertChord(c, activeInv));
    startPlayer(prog, +$("#p-bpm").value || 60, { ribbon: true });
  };
  $("#p-play-vl").onclick = () => {
    voiceLedActive = true;
    syncVoicingButtons();
    const vl = M.voiceLead(M.progression($("#p-key").value));
    renderProgRibbon();
    startPlayer(vl, +$("#p-bpm").value || 60, { ribbon: true });
  };
  $("#p-stop").onclick = stopPlayer;

  const QMAP = { "": "maj7", "maj7": "maj7", "maj9": "maj9", "6": "6", "69": "maj9", "m": "m7", "m6": "m7", "m69": "m7", "m7": "m7", "m9": "m9", "7": "7", "9": "9", "13": "13", "7b13": "13", "7#11": "13", "7sus4": "7", "sus4": "7", "m7b5": "m7b5", "dim7": "dim7", "dim": "dim7" };
  const FLAT = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B", Fb: "E", "E#": "F", "B#": "C" };
  const chartChord = (tok) => {
    const m = String(tok).split("/")[0].match(/^([A-G])(#|b)?(.*)$/);
    if (!m) return null;
    const r = FLAT[m[1] + (m[2] || "")] || (m[1] + (m[2] || ""));
    const q = QMAP[(m[3] || "").trim()];
    try { return q ? M.chord(r, q) : null; } catch (_) { return null; }
  };

  function renderStandards(query = "") {
    const box = $("#p-standards"); if (!box || !window.BOSSA_STANDARDS) return;
    const q = String(query || "").trim().toLowerCase();
    box.innerHTML = "";
    const list = window.BOSSA_STANDARDS.filter((t) => !q || `${t.t} ${t.c || ""} ${t.key || ""}`.toLowerCase().includes(q));
    if (!list.length) {
      box.innerHTML = `<p class="empty">No standards match "${esc(query)}".</p>`;
      return;
    }
    for (const t of list) {
      const parsed = t.bars.map((bar) => chartChord(String(bar).split(" ")[0]));
      const strip = h("div.mono", { hidden: "" }, t.bars.join("  |  "));
      box.append(h("div.kv", null,
        h("span", null, h("b", null, t.t), h("span.stat-s", null, ` · ${t.c || ""} · ${t.key} · ${t.bars.length} bars`)),
        h("span.row-actions", null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { strip.hidden = !strip.hidden; } }, "Changes"),
          parsed.filter(Boolean).length >= Math.ceil(t.bars.length * 0.7)
            ? h("button.btn.small", {
              type: "button",
              onclick: () => {
                const rawProg = parsed.map((c, i) => c || parsed.slice(0, i).reverse().find(Boolean) || LIBRARY[0]);
                const voicedProg = voiceLedActive ? M.voiceLead(rawProg) : rawProg.map((c) => M.invertChord(c, activeInv));
                startPlayer(voicedProg, +$("#p-bpm").value || 60);
              }
            }, "Play")
            : null
        )
      ), strip);
    }
  }
  renderStandards();
  $("#p-std-filter").addEventListener("input", (e) => renderStandards(e.target.value));

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
      const prevBpm = bpm;
      const nextRung = RUNGS.find((x) => x > bpm) || (bpm + 6);
      bpm = nextRung; reps = 0; S.set("ladder_bpm", bpm); toast("Promoted to " + bpm + " BPM!");
      publishEvent("piano.rung", `Promoted rung ${prevBpm} → ${bpm} BPM`, String(bpm));
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
    stopPlayer(); const ec = M.invertChord(M.chord(M.NAMES[Math.floor(Math.random() * 12)], EAR_Q[Math.floor(Math.random() * EAR_Q.length)]), activeInv);
    playChord(ec, null, 0.22); $("#p-ear-note").textContent = "Playing chord…";
    const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const c of EAR_Q) box.append(h("button.btn.quiet.small", { type: "button", onclick: () => { earScore.total++; if (c === ec.quality) earScore.right++; S.set("ear", earScore); $("#p-ear-note").textContent = c === ec.quality ? `Right — ${ec.name}.` : `Was ${ec.name}.`; paintEar(); } }, M.QUALITIES[c].label));
  };
  $("#p-iv-play").onclick = () => {
    stopPlayer(); const base = 60 + Math.floor(Math.random() * 7), iv = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    const ctx = ac(), t = ctx ? ctx.currentTime + 0.03 : 0; tone(base, t, 0.65, 0.18); tone(base + iv.st, t + 0.35, 0.75, 0.18);
    $("#p-ear-note").textContent = "Playing interval…"; const box = $("#p-ear-choices"); box.innerHTML = "";
    for (const c of INTERVALS) box.append(h("button.btn.quiet.small", { type: "button", onclick: () => { earScore.total++; if (c.st === iv.st) earScore.right++; S.set("ear", earScore); $("#p-ear-note").textContent = c.st === iv.st ? `Right — ${iv.name}.` : `Was ${iv.name}.`; paintEar(); } }, c.name));
  };
  paintEar();

  const paintLog = () => {
    const ss = S.list("sessions").sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
    $("#p-sessions").innerHTML = ss.map((s) => `<div class="kv"><span>${s.date} · ${esc(s.focus || "Practice")}</span><b>${s.minutes} min</b></div>`).join("") || `<p class="empty">No sessions logged yet.</p>`;
  };
  $("#p-log").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const rec = S.add("sessions", { date: day(), minutes: +f.minutes.value || 0, focus: f.focus.value.trim() });
    publishEvent("piano.session", `${rec.minutes} min · ${rec.focus || "Bossa practice"}`, rec.id);
    f.reset(); toast("Logged"); paintLog();
  });
  paintLog();

  $("#export").onclick = () => download(`piano_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paintLog(); paintLadder(); } catch (e) { toast(e.message); } };

  // Initial Studio render: Cmaj7 Shell on Grand Staff, Keyboard & ii-V-I-vi Ribbon
  window.addEventListener("resize", () => {
    if (lastPreviewed) drawStaff(lastPreviewed.midi, lastPreviewed.name, lastPreviewed.roles);
  }, { passive: true });
  syncVoicingButtons();
  renderProgRibbon();
  presentVoicing(M.invertChord(currentChord, activeInv), false);
})();
