/* Prometheus Hub opening. Fifteen seconds of fire, then the desk.
   Not Titan's vault door. Skip, Esc, or a click ends it at once. */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("ph-on")) return;

  var DURATION = 15000;
  var splash = document.getElementById("ph-splash");
  var fit = document.getElementById("ph-fit");
  var canvas = document.getElementById("ph-fire");
  var bar = document.getElementById("ph-meter-bar");
  var skip = document.getElementById("ph-skip");
  var staticHold = root.classList.contains("ph-static");
  var started = performance.now();
  var raf = 0;
  var done = false;

  function fitStage() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    if (fit) fit.style.setProperty("--ph-s", String(s));
  }
  fitStage();
  window.addEventListener("resize", fitStage);

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    try { sessionStorage.setItem("ph_splash_v1", "1"); } catch (err) {}
    root.classList.remove("ph-on");
    root.classList.add("ph-skip");
    if (splash) splash.setAttribute("hidden", "");
  }

  if (skip) skip.addEventListener("click", function (event) {
    event.stopPropagation();
    finish();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") finish();
  });
  if (splash) splash.addEventListener("pointerdown", function (event) {
    if (event.target === skip) return;
    finish();
  });

  if (staticHold) {
    if (skip) skip.textContent = "Enter";
    return;
  }

  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(1920 * dpr);
  canvas.height = Math.round(1080 * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  var embers = [];
  var i;
  for (i = 0; i < 160; i++) embers.push(ember(true));

  function ember(anywhere) {
    return {
      x: 860 + Math.random() * 200,
      y: anywhere ? 420 + Math.random() * 620 : 860 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -0.4 - Math.random() * 1.6,
      r: 1 + Math.random() * 2.4,
      life: Math.random(),
      hue: Math.random() < 0.7 ? "255,186,80" : "255,90,30"
    };
  }

  function frame(now) {
    if (done) return;
    var elapsed = now - started;
    var t = Math.min(1, elapsed / DURATION);
    if (bar) bar.style.width = (t * 100).toFixed(2) + "%";
    if (elapsed > 3800) root.classList.add("show-kicker");
    if (elapsed > 5200) root.classList.add("show-name");
    if (elapsed > 8600) root.classList.add("show-hub");
    if (elapsed > 11200) root.classList.add("show-line");
    if (elapsed >= DURATION) {
      finish();
      return;
    }

    ctx.clearRect(0, 0, 1920, 1080);
    var rise = Math.min(1, elapsed / 2800);
    var glow = ctx.createRadialGradient(960, 820, 20, 960, 780, 520 + rise * 180);
    glow.addColorStop(0, "rgba(255, 220, 150, " + (0.55 * rise) + ")");
    glow.addColorStop(0.35, "rgba(255, 120, 30, " + (0.28 * rise) + ")");
    glow.addColorStop(1, "rgba(80, 10, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1920, 1080);

    ctx.globalCompositeOperation = "lighter";
    var tongues = 5;
    var n;
    for (n = 0; n < tongues; n++) {
      var wobble = Math.sin(now / 280 + n) * 26;
      var h = (180 + n * 48) * rise;
      var w = 70 + n * 18;
      var x = 960 + (n - 2) * 28 + wobble * 0.3;
      var y = 900;
      ctx.beginPath();
      ctx.moveTo(x - w, y);
      ctx.quadraticCurveTo(x - w * 0.15, y - h * 0.55, x + wobble, y - h);
      ctx.quadraticCurveTo(x + w * 0.35, y - h * 0.45, x + w, y);
      ctx.closePath();
      var g = ctx.createLinearGradient(x, y, x, y - h);
      g.addColorStop(0, "rgba(120, 20, 0, 0)");
      g.addColorStop(0.35, "rgba(220, 70, 16, " + (0.35 + 0.2 * rise) + ")");
      g.addColorStop(0.75, "rgba(255, 170, 60, 0.75)");
      g.addColorStop(1, "rgba(255, 244, 214, 0.95)");
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    embers.forEach(function (p) {
      p.x += p.vx + Math.sin(now / 400 + p.y) * 0.15;
      p.y += p.vy;
      p.life -= 0.004;
      if (p.life <= 0 || p.y < 180) {
        var fresh = ember(false);
        p.x = fresh.x; p.y = fresh.y; p.vx = fresh.vx; p.vy = fresh.vy; p.r = fresh.r; p.life = 1; p.hue = fresh.hue;
      }
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + p.hue + "," + (0.15 + p.life * 0.75) + ")";
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    });

    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
})();
