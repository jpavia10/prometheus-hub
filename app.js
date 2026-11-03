/* Particle field adapted from MisterPrada/morph-particles
   (particles.frag point-sprite falloff, orange firefly color, morph between forms).
   Shapes here are generated. The original models and tracking are not included. */
(function () {
  "use strict";

  var projects = Array.isArray(window.PROMETHEUS_PROJECTS) ? window.PROMETHEUS_PROJECTS : [];
  var pills = document.getElementById("pills");
  var waiting = document.getElementById("waiting");

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function safeUrl(href) {
    if (typeof href !== "string" || !/^https?:\/\//i.test(href.trim())) return "";
    try {
      var url = new URL(href.trim());
      return (url.protocol === "https:" || url.protocol === "http:") ? url.href : "";
    } catch (e) { return ""; }
  }
  function host(href) {
    var url = new URL(href);
    return url.hostname + url.pathname.replace(/\/$/, "");
  }

  var live = projects.filter(function (p) { return p && p.status === "live"; });
  var slots = projects.filter(function (p) { return p && p.status !== "live"; });
  if (pills) {
    pills.innerHTML = live.map(function (project) {
      return (project.links || []).map(function (link, i) {
        var href = safeUrl(link.href);
        if (!href) return "";
        return '<a class="pill' + (i ? " quiet" : "") + '" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' +
          "<strong>" + esc(link.label || project.name) + "</strong>" +
          "<span>" + esc(host(href)) + "</span></a>";
      }).join("");
    }).join("");
  }
  if (waiting) {
    waiting.textContent = slots.length
      ? "Waiting: " + slots.map(function (p) { return p.name; }).join(", ")
      : "";
  }

  var canvas = document.getElementById("field");
  var gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
  if (!gl) return;

  var mobile = Math.min(window.innerWidth, window.innerHeight) < 760;
  var N = mobile ? 7000 : 16000;
  var forms = 4;
  var data = new Float32Array(N * 3 * forms);

  function rand(i, s) {
    var x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function write(form, i, x, y, z) {
    var o = (form * N + i) * 3;
    data[o] = x; data[o + 1] = y; data[o + 2] = z;
  }
  for (var i = 0; i < N; i++) {
    var a = rand(i, 1), b = rand(i, 2), c = rand(i, 3);
    var arm = i % 2 === 0 ? 1 : -1;
    var t = (i % (N / 2)) / (N / 2);
    write(0, i, arm * (0.2 + t * 2.4) + (a - 0.5) * 0.18, Math.sin(t * 6.2 + arm) * 0.55 + (b - 0.5) * 0.22, (c - 0.5) * 0.45);
    var g = Math.sqrt(-2 * Math.log(Math.max(1e-4, a)));
    write(1, i, Math.cos(6.283 * b) * g * 0.55, Math.sin(6.283 * b) * g * 0.42, (c - 0.5) * g * 0.35);
    var ang = 6.283 * a;
    var rad = 1.15 + (b - 0.5) * 0.18;
    write(2, i, Math.cos(ang) * rad, Math.sin(ang) * rad * 0.62, (c - 0.5) * 0.35);
    var y = (a - 0.15) * 2.4;
    var w = Math.max(0.05, 0.55 * (1.15 - y / 2.6));
    write(3, i, (b - 0.5) * w, y - 0.4, (c - 0.5) * w);
  }

  var vs = [
    "attribute vec3 a0;attribute vec3 a1;attribute vec3 a2;attribute vec3 a3;attribute float aSeed;",
    "uniform float uMorph;uniform float uTime;uniform vec2 uMouse;uniform vec2 uRes;",
    "varying float vHot;",
    "vec3 pick(float m){",
    "  float i=floor(m); float f=fract(m); f=f*f*(3.0-2.0*f);",
    "  if(i<0.5) return mix(a0,a1,f);",
    "  if(i<1.5) return mix(a1,a2,f);",
    "  if(i<2.5) return mix(a2,a3,f);",
    "  return mix(a3,a0,f);",
    "}",
    "void main(){",
    "  vec3 p=pick(mod(uMorph,4.0));",
    "  p.xy+=uMouse*0.28;",
    "  p.x+=sin(uTime*0.6+aSeed*12.0)*0.03;",
    "  p.xy*=0.42;",
    "  gl_Position=vec4(p.xy,0.0,1.0);",
    "  gl_PointSize=(3.0+aSeed*5.0)*uRes.y*0.0024*(1.15-p.z*0.12);",
    "  vHot=p.y;",
    "}"
  ].join("");
  var fs = [
    "precision mediump float;",
    "varying float vHot;",
    "void main(){",
    "  float d=distance(gl_PointCoord,vec2(0.5));",
    "  float strength=0.05/d-0.1;",
    "  if(strength<=0.0) discard;",
    "  vec3 color=mix(vec3(1.0,0.28,0.02),vec3(1.0,0.72,0.2),clamp(vHot*0.4+0.45,0.0,1.0));",
    "  gl_FragColor=vec4(color, clamp(strength,0.0,1.0));",
    "}"
  ].join("");

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("link", gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  function buf(name, arr, size) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }
  buf("a0", data.subarray(0, N * 3), 3);
  buf("a1", data.subarray(N * 3, N * 6), 3);
  buf("a2", data.subarray(N * 6, N * 9), 3);
  buf("a3", data.subarray(N * 9, N * 12), 3);
  var seeds = new Float32Array(N);
  for (var s = 0; s < N; s++) seeds[s] = rand(s, 9);
  buf("aSeed", seeds, 1);

  var uMorph = gl.getUniformLocation(prog, "uMorph");
  var uTime = gl.getUniformLocation(prog, "uTime");
  var uMouse = gl.getUniformLocation(prog, "uMouse");
  var uRes = gl.getUniformLocation(prog, "uRes");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0.02, 0.024, 0.04, 1);

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (0.5 - e.clientY / window.innerHeight) * 2;
  }, { passive: true });

  var slow = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var start = performance.now();
  function frame(now) {
    var t = (now - start) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.floor(canvas.clientWidth * dpr);
    var h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uMorph, slow ? 1.2 : (t / 7) % 4);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
