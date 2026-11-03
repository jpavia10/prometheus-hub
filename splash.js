/* Prometheus Hub main cold-open.
   Same production idea as Titan's vault-door film: a timed camera, impacts,
   debris, a light blast, synthesized hits, then a handoff into the desk.
   The subject is stolen fire, not a coin and not a vault door. */
(function () {
  "use strict";

  var rootEl = document.documentElement;
  if (!rootEl.classList.contains("ph-on")) return;

  var DURATION = 15;
  var splash = document.getElementById("ph-splash");
  var fit = document.getElementById("ph-fit");
  var canvas = document.getElementById("ph-fire");
  var bar = document.getElementById("ph-meter-bar");
  var skipBtn = document.getElementById("ph-skip");
  var soundBtn = document.getElementById("ph-sound");
  var staticHold = rootEl.classList.contains("ph-static");
  var done = false;
  var raf = 0;
  var gl = null;

  function fitStage() {
    if (!fit) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    fit.style.setProperty("--ph-s", String(s));
  }
  fitStage();
  window.addEventListener("resize", fitStage);

  function finish(quick) {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    try { sessionStorage.setItem("ph_splash_v1", "1"); } catch (err) {}
    if (sfx) sfx.stop(0.35);
    rootEl.classList.add("ph-reveal");
    if (splash) {
      splash.classList.add("ph-out");
      splash.style.setProperty("--ph-out", quick ? "0.42s" : "0.7s");
    }
    setTimeout(function () {
      rootEl.classList.remove("ph-on");
      rootEl.classList.add("ph-skip");
      if (gl) { try { gl.getExtension("WEBGL_lose_context").loseContext(); } catch (e) {} }
    }, quick ? 480 : 760);
  }

  if (skipBtn) {
    skipBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    skipBtn.addEventListener("click", function (e) { e.stopPropagation(); finish(true); });
  }
  window.addEventListener("keydown", function (e) {
    if (done || !rootEl.classList.contains("ph-on")) return;
    if (e.key === "Tab") return;
    if ((e.key === "Enter" || e.key === " ") && document.activeElement === soundBtn) return;
    e.preventDefault();
    finish(true);
  }, true);

  /* ---------- synthesized impacts (same idea as the vault-door bed: noise bursts + tones) ---------- */
  var sfx = (function () {
    var ctx = null, out = null, on = true, hum = null;
    try { on = localStorage.getItem("ph_mute_v1") !== "1"; } catch (e) {}
    function ensure() {
      if (!on) return null;
      if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = 0.9;
      out.connect(ctx.destination);
      return ctx;
    }
    function noiseBuf() {
      var n = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = n.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return n;
    }
    var noise = null;
    function burst(t, peak, dec, type, freq, q, f2) {
      if (!ctx) return;
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      if (!noise) noise = noiseBuf();
      s.buffer = noise;
      f.type = type;
      f.frequency.setValueAtTime(freq, t);
      f.Q.value = q || 1;
      if (f2) f.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dec);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t, Math.random() * 0.3);
      s.stop(t + dec + 0.05);
    }
    function tone(kind, freq, t, peak, dec, f2) {
      if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = kind;
      o.frequency.setValueAtTime(freq, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dec);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + dec + 0.02);
    }
    return {
      on: function () { return on; },
      blocked: function () { return on && (!ctx || ctx.state !== "running"); },
      gesture: function () { if (on) ensure(); },
      set: function (v) {
        on = !!v;
        try { localStorage.setItem("ph_mute_v1", on ? "0" : "1"); } catch (e) {}
        if (on) ensure();
        else this.stop(0.15);
      },
      strike: function () {
        if (!ensure()) return;
        var t = ctx.currentTime + 0.02;
        burst(t, 0.35, 0.08, "bandpass", 2800, 4);
        tone("sine", 70, t, 0.25, 0.6, 40);
      },
      crack: function (i) {
        if (!ctx) return;
        var t = ctx.currentTime + 0.01;
        burst(t, 0.55, 0.12, "bandpass", 1600 - (i % 5) * 120, 2.4, 400);
        tone("sine", 90 - i * 4, t, 0.4, 0.28, 36);
        burst(t + 0.02, 0.3, 0.35, "lowpass", 500, 0.7, 80);
      },
      blast: function () {
        if (!ctx) return;
        var t = ctx.currentTime + 0.01;
        tone("sine", 48, t, 0.9, 1.4, 22);
        burst(t, 0.85, 0.9, "lowpass", 240, 0.6, 60);
        burst(t, 0.45, 0.08, "highpass", 4000, 0.7);
        burst(t + 0.08, 0.5, 0.5, "bandpass", 900, 1.2, 200);
      },
      roar: function () {
        if (!ctx) return;
        var t = ctx.currentTime + 0.02;
        var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = "sawtooth"; o2.type = "square";
        o.frequency.setValueAtTime(42, t); o.frequency.linearRampToValueAtTime(78, t + 2.4);
        o2.frequency.setValueAtTime(42.7, t); o2.frequency.linearRampToValueAtTime(79, t + 2.4);
        f.type = "bandpass"; f.frequency.setValueAtTime(140, t); f.frequency.linearRampToValueAtTime(420, t + 2.2); f.Q.value = 2.4;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.5); g.gain.linearRampToValueAtTime(0.0001, t + 2.6);
        o.connect(f); o2.connect(f); f.connect(g); g.connect(out);
        o.start(t); o2.start(t); o.stop(t + 2.7); o2.stop(t + 2.7);
        burst(t, 0.2, 2.2, "bandpass", 600, 4, 1800);
      },
      whoosh: function () {
        if (!ctx) return;
        var t = ctx.currentTime + 0.02;
        burst(t, 0.45, 1.6, "bandpass", 220, 0.8, 2800);
        tone("sine", 55, t + 0.3, 0.3, 1.6, 34);
      },
      chime: function () {
        if (!ctx) return;
        var t = ctx.currentTime + 0.02;
        [523, 659, 784, 1046].forEach(function (f, i) { tone("sine", f, t + i * 0.04, 0.06, 2.2); });
        burst(t, 0.08, 0.05, "highpass", 5000, 0.6);
      },
      stop: function (fade) {
        if (!ctx) return;
        var c = ctx, o = out;
        ctx = null; hum = null;
        try { o.gain.setTargetAtTime(0.0001, c.currentTime, Math.max(fade, 0.05)); } catch (e) {}
        setTimeout(function () { try { c.close(); } catch (e2) {} }, 500);
      }
    };
  })();

  function paintSound() {
    if (!soundBtn) return;
    var live = sfx.on() && !sfx.blocked();
    soundBtn.setAttribute("aria-pressed", sfx.on() ? "true" : "false");
    soundBtn.textContent = sfx.on() ? (sfx.blocked() ? "Tap for sound" : "Sound on") : "Sound off";
    soundBtn.setAttribute("aria-label", soundBtn.textContent);
  }
  if (soundBtn) {
    soundBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    soundBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (sfx.on() && !sfx.blocked()) sfx.set(false);
      else { sfx.set(true); sfx.gesture(); }
      paintSound();
    });
  }

  if (splash) {
    splash.addEventListener("pointerdown", function (e) {
      if (done) return;
      if (e.target.closest && (e.target.closest("#ph-sound") || e.target.closest("#ph-skip"))) return;
      sfx.gesture();
      finish(true);
    });
  }

  if (staticHold) {
    if (skipBtn) skipBtn.textContent = "Enter";
    paintSound();
    return;
  }

  sfx.gesture();
  paintSound();
  setTimeout(paintSound, 400);

  var vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
  var fs = [
    "precision highp float;",
    "uniform vec2 R; uniform float T;",
    "float h(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
    "float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float a=0.0,w=0.5;for(int i=0;i<5;i++){a+=n2(p)*w;p*=2.05;w*=0.5;}return a;}",
    "float ring(vec2 uv, vec2 c, float age, float speed){",
    "  float d=length(uv-c); float r=age*speed; float w=0.012+age*0.02;",
    "  return exp(-age*1.4)*smoothstep(w,0.0,abs(d-r));",
    "}",
    "void main(){",
    "  vec2 uv=(gl_FragCoord.xy/R)*2.0-1.0; uv.x*=R.x/max(R.y,1.0);",
    "  float shake=0.0;",
    "  shake+=smoothstep(0.05,0.0,abs(T-1.15))*0.02;",
    "  shake+=smoothstep(0.08,0.0,abs(T-2.05))*0.028;",
    "  shake+=smoothstep(0.08,0.0,abs(T-2.85))*0.034;",
    "  shake+=smoothstep(0.12,0.0,abs(T-3.7))*0.05;",
    "  shake+=smoothstep(0.22,0.0,abs(T-4.55))*0.09;",
    "  uv+=vec2(sin(T*73.0),cos(T*61.0))*shake;",
    "  float zoom=mix(1.18,0.62,smoothstep(4.2,9.0,T));",
    "  uv*=zoom;",
    "  vec3 col=vec3(0.012,0.008,0.006);",
    "  float slit=smoothstep(0.15,1.1,T)*exp(-abs(uv.y)*mix(80.0,6.0,smoothstep(0.4,3.6,T)));",
    "  col+=vec3(1.0,0.45,0.08)*slit*1.4;",
    "  col+=vec3(1.0,0.9,0.6)*smoothstep(0.02,0.0,abs(uv.y))*smoothstep(0.2,0.8,T)*0.8;",
    "  vec2 p=uv-vec2(0.0,-0.05);",
    "  float rise=smoothstep(0.3,2.2,T);",
    "  float flame=fbm(vec2(p.x*2.2,p.y*1.4-T*0.55));",
    "  float body=smoothstep(0.55,0.05,length(p*vec2(1.15,0.85))-0.08*rise-flame*0.35*rise);",
    "  col+=vec3(1.0,0.35,0.05)*body*rise;",
    "  col+=vec3(1.0,0.85,0.55)*smoothstep(0.18,0.0,length(p))*rise;",
    "  float ages[5]; vec2 cs[5]; float sp[5];",
    "  ages[0]=T-1.15; cs[0]=vec2(-0.35,0.05); sp[0]=0.9;",
    "  ages[1]=T-2.05; cs[1]=vec2(0.42,-0.08); sp[1]=1.05;",
    "  ages[2]=T-2.85; cs[2]=vec2(-0.05,0.22); sp[2]=1.15;",
    "  ages[3]=T-3.7; cs[3]=vec2(0.15,-0.2); sp[3]=1.25;",
    "  ages[4]=T-4.55; cs[4]=vec2(0.0,-0.02); sp[4]=1.7;",
    "  for(int i=0;i<5;i++){",
    "    if(ages[i]>0.0){",
    "      float flash=exp(-ages[i]*1.15);",
    "      float boom=exp(-length(uv-cs[i])*mix(2.2,9.0,clamp(ages[i],0.0,1.0)))*flash;",
    "      col+=vec3(1.0,0.42,0.08)*flash*(i==4?2.4:1.1);",
    "      col+=vec3(1.0,0.86,0.45)*boom*(i==4?3.0:1.4);",
    "      col+=vec3(1.0,0.62,0.18)*ring(uv,cs[i],ages[i],sp[i])*(i==4?3.2:1.8);",
    "      col+=vec3(1.0,0.5,0.12)*ring(uv,cs[i],max(0.0,ages[i]-0.12),sp[i]*0.72)*(i==4?2.0:0.8);",
    "    }",
    "  }",
    "  float debris=smoothstep(4.15,4.45,T);",
    "  for(int i=0;i<64;i++){",
    "    float fi=float(i);",
    "    float ang=fi*2.399;",
    "    vec2 dir=vec2(cos(ang),sin(ang));",
    "    float spd=0.25+fract(sin(fi*12.9)*43758.5)*0.9;",
    "    float age=max(0.0,T-4.35);",
    "    vec2 pos=dir*age*spd*1.15+vec2(0.0,-age*age*0.12);",
    "    float rad=0.012+fract(fi*0.41)*0.045;",
    "    float chunk=smoothstep(rad,0.0,length(uv-pos))*exp(-age*0.22)*debris;",
    "    vec2 trail=uv-pos+dir*0.06;",
    "    float streak=exp(-pow(abs(dot(trail,vec2(-dir.y,dir.x)))*40.0,2.0))*exp(-length(trail)*6.0)*debris*exp(-age*0.3);",
    "    vec3 ember=mix(vec3(1.0,0.28,0.02),vec3(1.0,0.92,0.5),fract(fi*0.17));",
    "    col+=ember*(chunk*6.0+streak*2.5);",
    "  }",
    "  float rays=pow(max(0.0,1.0-abs(uv.x)*1.4),8.0)*smoothstep(4.4,6.5,T)*exp(-abs(uv.y)*1.2)*0.35;",
    "  col+=vec3(1.0,0.75,0.4)*rays;",
    "  float vig=smoothstep(1.35,0.35,length(uv));",
    "  col*=vig;",
    "  col+=vec3(n2(gl_FragCoord.xy*0.8+T))*0.035;",
    "  float ex=1.0;",
    "  ex+=smoothstep(0.08,0.0,abs(T-4.55))*2.4;",
    "  ex+=smoothstep(0.2,0.0,abs(T-13.9))*1.2;",
    "  vec3 hot=max(col-1.2,0.0);",
    "  col=col/(1.0+col);",
    "  col+=hot*0.35;",
    "  col*=ex;",
    "  float iris=smoothstep(13.6,15.0,T);",
    "  float hole=smoothstep(0.15,0.85,length(uv)*(1.0-iris*0.92)+iris);",
    "  float alpha=1.0-iris*smoothstep(0.2,0.95,length(uv)*0.55+iris);",
    "  gl_FragColor=vec4(col,clamp(alpha,0.0,1.0));",
    "}"
  ].join("\n");

  function bootGL() {
    var opt = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance" };
    gl = canvas.getContext("webgl", opt) || canvas.getContext("experimental-webgl", opt);
    if (!gl) return false;
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return false;
    var prog = gl.createProgram();
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, "R");
    var uT = gl.getUniformLocation(prog, "T");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var t0 = 0, last = -1, cues = {};
    function cue(name, t, at, fn) { if (t >= at && !cues[name]) { cues[name] = 1; fn(); } }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(2, Math.floor(canvas.clientWidth * dpr));
      var h = Math.max(2, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
    }
    function frame(now) {
      if (done) return;
      raf = requestAnimationFrame(frame);
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (t >= DURATION) { finish(false); return; }
      resize();
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (bar) bar.style.width = Math.min(100, (t / DURATION) * 100).toFixed(2) + "%";
      cue("strike", t, 0.34, function () { sfx.strike(); });
      cue("c1", t, 1.15, function () { sfx.crack(0); });
      cue("c2", t, 2.05, function () { sfx.crack(1); });
      cue("c3", t, 2.85, function () { sfx.crack(2); });
      cue("c4", t, 3.7, function () { sfx.crack(3); });
      cue("blast", t, 4.5, function () { sfx.blast(); sfx.roar(); });
      cue("whoosh", t, 6.4, function () { sfx.whoosh(); });
      cue("kicker", t, 8.4, function () { rootEl.classList.add("show-kicker"); });
      cue("name", t, 9.15, function () { rootEl.classList.add("show-name"); sfx.chime(); });
      cue("hub", t, 10.7, function () { rootEl.classList.add("show-hub"); });
      cue("line", t, 12.2, function () { rootEl.classList.add("show-line"); });
      if (t >= 13.7 && last < 13.7) rootEl.classList.add("ph-reveal");
      last = t;
    }
    raf = requestAnimationFrame(frame);
    return true;
  }

  if (!bootGL()) {
    rootEl.classList.add("ph-static");
    if (skipBtn) skipBtn.textContent = "Enter";
  }
})();
