/* Orbit mark and a quiet starfield. No globe, no launch sequence. */
(function () {
  "use strict";
  var FX = window.PROMETHEUS_FX;
  if (!FX) return;
  var RM = FX.RM;
  var phone = window.matchMedia("(max-width: 700px)").matches;

  (function stars() {
    if (document.getElementById("orb-stars")) return;
    var cv = document.createElement("canvas");
    cv.id = "orb-stars";
    cv.setAttribute("aria-hidden", "true");
    document.body.prepend(cv);
    var W = 0;
    var H = 0;
    var ctx;
    var count = phone ? 70 : 130;
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var dots = [];
    for (var i = 0; i < count; i++) {
      dots.push({
        x: rnd(),
        y: rnd(),
        z: i % 3,
        r: 0.4 + rnd() * (i % 3 === 2 ? 1.5 : 0.9),
        p: rnd() * 6.28,
        c: rnd() < 0.18 ? "255,196,130" : rnd() < 0.3 ? "196,176,255" : "235,235,255"
      });
    }
    function fit() {
      var box = FX.canvasFit(cv, window.innerHeight);
      ctx = box.ctx;
      W = box.w;
      H = box.h;
      draw(performance.now());
    }
    var px = 0;
    var py = 0;
    var tx = 0;
    var ty = 0;
    function draw(now) {
      if (!ctx) return;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      var sy = window.scrollY || 0;
      ctx.clearRect(0, 0, W, H);
      for (var n = 0; n < dots.length; n++) {
        var s = dots[n];
        var k = [0.02, 0.06, 0.14][s.z];
        var x = (s.x * W + px * k * 40) % W;
        var y = (s.y * H - sy * k + py * k * 40) % H;
        if (x < 0) x += W;
        if (y < 0) y += H;
        var a = RM ? 0.7 : 0.45 + 0.4 * Math.sin(now / 900 + s.p);
        ctx.fillStyle = "rgba(" + s.c + "," + a.toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, 6.283);
        ctx.fill();
      }
    }
    fit();
    window.addEventListener("resize", fit);
    if (RM) return;
    if (!phone) {
      window.addEventListener("pointermove", function (event) {
        tx = event.clientX / (W || 1) - 0.5;
        ty = event.clientY / (H || 1) - 0.5;
      }, { passive: true });
    }
    FX.loop(cv, draw, phone ? 20 : 30);
  })();

  var coin = document.querySelector(".brand .coin");
  if (coin && !coin.querySelector("svg")) {
    coin.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs>' +
      '<radialGradient id="orbPl" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#ffe2b8"/><stop offset=".55" stop-color="#ff9f4a"/><stop offset="1" stop-color="#7a3a1a"/></radialGradient>' +
      '<linearGradient id="orbRg" x1="0" x2="1"><stop offset="0" stop-color="#c9b6ff" stop-opacity=".2"/><stop offset=".5" stop-color="#ffd9a8"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".3"/></linearGradient></defs>' +
      '<g transform="rotate(-18 32 32)"><ellipse cx="32" cy="32" rx="29" ry="8" fill="none" stroke="url(#orbRg)" stroke-width="2.4" opacity=".55"/>' +
      '<circle cx="32" cy="32" r="14" fill="url(#orbPl)"/>' +
      '<path d="M3 32a29 8 0 0 0 58 0" fill="none" stroke="url(#orbRg)" stroke-width="2.4"/>' +
      '<circle class="orb-moon" cx="58" cy="30" r="2.2" fill="#ffcf8a"/></g></svg>';
    if (!RM) {
      var moon = coin.querySelector(".orb-moon");
      var t0 = performance.now();
      FX.loop(coin, function (now) {
        var a = ((now - t0) / 6000) * 6.283;
        moon.setAttribute("cx", (32 + 29 * Math.cos(a)).toFixed(2));
        moon.setAttribute("cy", (32 + 8 * Math.sin(a)).toFixed(2));
        moon.setAttribute("opacity", Math.sin(a) < 0 && Math.abs(Math.cos(a)) < 0.48 ? "0" : "1");
      }, 30);
    }
  }
})();
