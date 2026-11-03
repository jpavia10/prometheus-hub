/* Shared motion for an active theme. Reveal only — no splash, no count-up tour. */
(function () {
  "use strict";
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var handlers = [];

  function reveal(nodes) {
    var i = 0;
    Array.prototype.forEach.call(nodes, function (el) {
      if (!el || el.dataset.fxShown) return;
      el.dataset.fxShown = "1";
      if (RM) return;
      el.style.setProperty("--fx-i", String(Math.min(i, 12)));
      el.classList.add("fx-reveal");
      i += 1;
    });
  }

  function decorate() {
    reveal(document.querySelectorAll(".card, .slot-card"));
    handlers.forEach(function (fn) {
      try { fn(); } catch (err) { console.warn("theme widget", err); }
    });
  }

  function loop(el, fn, fps) {
    var raf = 0;
    var last = 0;
    var on = true;
    var rate = fps || 30;
    function tick(now) {
      if (!el.isConnected) return;
      raf = requestAnimationFrame(tick);
      if (!on || document.hidden || now - last < 1000 / rate) return;
      last = now;
      fn(now);
    }
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      on = entries[0].isIntersecting;
    }) : null;
    if (io) io.observe(el);
    raf = requestAnimationFrame(tick);
    return function () { cancelAnimationFrame(raf); if (io) io.disconnect(); };
  }

  function canvasFit(cv, h) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth || window.innerWidth;
    var hh = h || cv.clientHeight || window.innerHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(hh * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: hh };
  }

  window.PROMETHEUS_FX = {
    RM: RM,
    reveal: reveal,
    loop: loop,
    canvasFit: canvasFit,
    onRender: function (fn) {
      handlers.push(fn);
      if (document.querySelector(".card")) {
        try { fn(); } catch (err) { console.warn(err); }
      }
    }
  };

  document.addEventListener("prometheus:render", decorate);
  if (document.querySelector(".card")) decorate();
})();
