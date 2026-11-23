/* kit/world.js (2026-11-23, owner chose "living painted header"): the pillar opens on its own painting, alive.
   The same painting and maps the hub's menu shows (art/worlds/world_<id>.webp + _depth + _lights): depth parallax as you scroll
   (near planes slide faster than far ones), by finger or by tilting the phone, a slow dolly, lamps and windows that glow and flicker
   from the lights map, short light shafts, drifting mist on the far planes. Arriving from the menu's dive, the painting starts pushed
   in and settles back, so the dive carries straight into the page. The header's accent is taken from the painting's lit areas.
   Readability first: the painting fades into the dark below the top and darkens as you read down; it stops drawing once it is
   scrolled past, pauses when the page is hidden, holds one still frame under reduced motion and draws at most 30 frames a second.
   window.PKWorld.start({ id, url, done }) is called by kit.js; with no WebGL it reports false and kit.js keeps the still backdrop. */
(function () {
  "use strict";
  var VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FS = [
    "precision mediump float;",
    "uniform vec2 R;uniform float T;uniform vec2 P;uniform float SCR;uniform float Z;uniform float FL;uniform vec3 A;uniform vec2 IR;uniform float Q;uniform float FY;uniform float BAND;",
    "uniform sampler2D W;uniform sampler2D D;uniform sampler2D L;",
    "float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n2(p);p*=2.03;a*=.5;}return v;}",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/R;",
    /* cover-fit the painting, its subject (FY, where its lights gather) placed in the open band at the top of the screen (BAND) */
    "  float sc=max(R.x/IR.x,R.y/IR.y);vec2 sz=IR*sc;float sy=1.-gl_FragCoord.y/R.y;",
    "  vec2 tuv=vec2((gl_FragCoord.x-(R.x-sz.x)*.5)/sz.x,FY+(sy-BAND)*R.y/sz.y);",
    "  vec2 cc=vec2(.5,FY);float dep=texture2D(D,clamp(tuv,0.,1.)).r;",
    /* dolly (breathing) and the arrival push; near planes swell more */
    "  float br=.014+.012*sin(T*.08);float zz=Z*(1.+br*(.3+dep));tuv=cc+(tuv-cc)/zz;",
    /* parallax: finger/tilt by depth, and scroll by depth (the painting rises slower than the page, the near planes faster) */
    "  vec2 off=P*(dep-.35)*.03+vec2(sin(T*.11),cos(T*.09))*.003*dep+vec2(0.,SCR*(.16+dep*.14));vec2 u=tuv+off;",
    "  vec3 col=texture2D(W,u).rgb;float li=texture2D(L,u).r;",
    "  float fl=.82+.12*sin(T*2.1+u.y*9.)+.06*sin(T*5.3+u.x*13.);",
    "  vec3 warm=mix(A,vec3(1.,.93,.82),.55);col+=li*fl*warm*.34+li*li*.16;",
    "  if(Q>.5){vec2 stp=(vec2(.5,.18)-u)*.05;float ray=texture2D(L,u+stp).r*.8+texture2D(L,u+stp*2.).r*.55+texture2D(L,u+stp*3.).r*.3;",
    "    col+=mix(A,vec3(1.),.6)*ray*.07*(.75+.25*sin(T*.6+u.x*3.));}",
    /* mist on the far planes, drifting */
    "  float m=fbm(vec2(u.x*3.2+T*.025,u.y*5.-T*.012));col+=mix(A,vec3(.85,.9,1.),.6)*.10*pow(m,2.2)*(1.-dep)*smoothstep(.25,.75,u.y);",
    /* outside the painting: dark */
    "  float inside=step(0.,u.y)*step(u.y,1.)*step(0.,u.x)*step(u.x,1.);col*=inside;",
    /* reading down: darken; arrival: a soft bloom that fades */
    "  col*=1.-.55*smoothstep(0.,1.1,SCR);",
    "  vec2 p=(gl_FragCoord.xy-.5*R)/R.y;col+=mix(A,vec3(1.),.7)*FL*FL*.45*exp(-length(p-vec2(0.,.18))*2.4);",
    "  col+=(h1(gl_FragCoord.xy+fract(T)*91.)-.5)*.016;",
    "  gl_FragColor=vec4(col,1.);",
    "}"].join("\n");

  /* where each painting's subject sits (0 = top, 1 = bottom), set by eye; a painting not listed uses where its lights gather */
  var FOCUS = { kairos: 0.42, garage: 0.47, odyssey: 0.46, selling: 0.56, kin: 0.56, continuity: 0.6 };

  function img(url) {
    return new Promise(function (res) { var im = new Image(); im.decoding = "async"; im.onload = function () { (im.decode ? im.decode().catch(function () {}) : Promise.resolve()).then(function () { res(im); }); }; im.onerror = function () { res(null); }; im.src = url; });
  }

  /* the accent: the painting's dominant hue among its saturated, lit pixels, weighted toward the lights map (an average would mix
     a violet ring and an orange sunset into a pink the painting does not have), lifted to a readable lightness */
  function accentOf(paint, lights) {
    try {
      var w = 48, hh = 86, c = document.createElement("canvas"); c.width = w; c.height = hh; var g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(paint, 0, 0, w, hh); var a = g.getImageData(0, 0, w, hh).data; g.drawImage(lights, 0, 0, w, hh); var b = g.getImageData(0, 0, w, hh).data;
      var bins = []; for (var z = 0; z < 24; z++) bins.push(0);
      for (var i = 0; i < a.length; i += 4) {
        var r = a[i] / 255, gg = a[i + 1] / 255, bb = a[i + 2] / 255, mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb), d = mx - mn, s = mx ? d / mx : 0;
        if (s < 0.22 || mx < 0.2) continue;
        var hue = mx === r ? ((gg - bb) / d) % 6 : mx === gg ? (bb - r) / d + 2 : (r - gg) / d + 4; hue = ((hue * 60) + 360) % 360;
        bins[Math.floor(hue / 15) % 24] += s * mx * mx * (0.15 + (b[i] / 255) * 4);
      }
      var best = -1, at = 0;
      for (var j = 0; j < 24; j++) { var v = bins[j] + 0.5 * (bins[(j + 23) % 24] + bins[(j + 1) % 24]); if (v > best) { best = v; at = j; } }
      if (best <= 0) return null;
      var hh2 = Math.round(at * 15 + 7.5);
      /* the subject: the height where the lights gather (lights map x brightness), kept between 30 % and 62 % of the painting */
      var sy = 0, sw = 0; for (var q = 0; q < a.length; q += 4) { var wt = (b[q] / 255) * Math.max(a[q], a[q + 1], a[q + 2]) / 255; wt *= wt; sy += wt * Math.floor(q / 4 / w) / hh; sw += wt; }
      var fy = sw > 0.5 ? Math.max(0.3, Math.min(0.62, sy / sw)) : 0.46;
      return { hue: hh2, sat: 70, css: "hsl(" + hh2 + " 70% 72%)", fy: fy };
    } catch (e) { return null; }
  }

  function rgbOf(hue, s, l) {
    var k = function (n) { return (n + hue / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return [f(0), f(8), f(4)];
  }

  function start(o) {
    var cv = document.createElement("canvas"); cv.className = "pk-world pk-living"; cv.setAttribute("aria-hidden", "true");
    var gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return Promise.resolve(false);
    var sh = function (t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(x)); return null; } return x; };
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return Promise.resolve(false);
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.bindAttribLocation(pr, 0, "a"); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return Promise.resolve(false);
    gl.useProgram(pr);
    var U = {}; ["R", "T", "P", "SCR", "Z", "FL", "A", "IR", "Q", "FY", "BAND", "W", "D", "L"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.W, 0); gl.uniform1i(U.D, 1); gl.uniform1i(U.L, 2);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var base = o.url.replace(/\.webp$/, "");
    return Promise.all([img(o.url), img(base + "_depth.webp"), img(base + "_lights.webp")]).then(function (ims) {
      if (!ims[0] || !ims[1] || !ims[2]) return false;
      ims.forEach(function (im, i) {
        var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      });
      var acc = accentOf(ims[0], ims[2]);
      var A = acc ? rgbOf(acc.hue, acc.sat / 100, 0.6) : [0.6, 0.7, 1];
      if (acc) { document.body.style.setProperty("--world-accent", acc.css); document.body.classList.add("has-living"); }
      gl.uniform3fv(U.A, A); gl.uniform2f(U.IR, ims[0].naturalWidth, ims[0].naturalHeight);
      gl.uniform1f(U.FY, FOCUS[o.id] || (acc && acc.fy != null ? acc.fy : 0.46)); gl.uniform1f(U.BAND, 0.19);

      var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      var st = { px: 0, py: 0, tx: 0, ty: 0, z: o.dive ? 1.6 : 1.06, fl: o.dive ? 1 : 0, q: 1, slow: 0 }, z0 = st.z, fl0 = st.fl, tArr = 0;
      if (still) { st.z = 1; st.fl = 0; z0 = 1; fl0 = 0; }
      var scale = 0.8;
      function size() { var d = Math.min(1, devicePixelRatio || 1) * scale; cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d); gl.viewport(0, 0, cv.width, cv.height); }
      size(); addEventListener("resize", function () { size(); wake(); }, { passive: true });
      var t0 = performance.now(), last = t0, raf = 0, lastDraw = 0, vis = true;
      function scr() { return Math.max(0, (window.scrollY || 0) / Math.max(1, innerHeight)); }
      function draw(now) {
        var T = (now - t0) / 1000;
        gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, still ? 8 : T); gl.uniform2f(U.P, st.px, st.py);
        gl.uniform1f(U.SCR, scr()); gl.uniform1f(U.Z, st.z); gl.uniform1f(U.FL, st.fl); gl.uniform1f(U.Q, st.q);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      function frame(now) {
        raf = 0; if (document.hidden) return;
        var dt = Math.min(0.1, (now - last) / 1000); last = now;
        /* the arrival settles over ~1.1 s; then the painting only breathes */
        /* by the clock, not by frames: a slow phone settles in the same time. The clock starts once the first frame is on screen
           (2026-11-23): the first draw uploads three large textures and can take seconds on a slow device, which used to use up the arrival unseen */
        var age = tArr ? (now - tArr) / 1000 : 0;
        st.z = 1 + (z0 - 1) * Math.exp(-age * 2.6); if (st.z - 1 < 0.0005) st.z = 1; st.fl = Math.max(0, fl0 * (1 - age * 1.1));
        st.px += (st.tx - st.px) * Math.min(1, dt * 3); st.py += (st.ty - st.py) * Math.min(1, dt * 3);
        var settling = Math.abs(st.z - 1) > 0.002 || st.fl > 0;
        if (now - lastDraw >= (settling ? 0 : 1000 / 30 - 2)) {
          var c0 = performance.now(); draw(now); lastDraw = now; var cost = performance.now() - c0; if (!tArr) { tArr = performance.now(); st.zFirst = st.z; cost = 0; }   /* zFirst: the zoom of the first frame on screen (WORLD-1 reads it) */
          /* governor: a phone that cannot keep up drops the light shafts, then draws smaller */
          if (cost > 22 || dt > 0.06) st.slow += dt; else st.slow = Math.max(0, st.slow - dt * 0.5);
          if (st.slow > 1.5 && st.q) { st.q = 0; st.slow = 0; } else if (st.slow > 1.5 && scale > 0.55) { scale = 0.55; size(); st.slow = 0; }
        }
        if (!still && vis && scr() < 1.4) raf = requestAnimationFrame(frame);
      }
      function wake() { if (!raf) raf = requestAnimationFrame(frame); }
      document.addEventListener("visibilitychange", function () { if (!document.hidden) { last = performance.now(); wake(); } });
      addEventListener("scroll", function () { if (still) { draw(performance.now()); return; } wake(); }, { passive: true });
      addEventListener("pointermove", function (e) { st.tx = (e.clientX / innerWidth - 0.5) * 2; st.ty = (e.clientY / innerHeight - 0.5) * 2; wake(); }, { passive: true });
      addEventListener("deviceorientation", function (e) { if (e.gamma == null) return; st.tx = Math.max(-1, Math.min(1, e.gamma / 30)); st.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); }, { passive: true });
      o.done(cv);
      if (still) draw(performance.now()); else wake();
      window.PKWorld.state = st;
      return true;
    });
  }

  window.PKWorld = { start: start };
})();
