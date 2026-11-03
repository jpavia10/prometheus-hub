/* Bridge mark and a desk readout. Not a boot sequence. */
(function () {
  "use strict";
  var FX = window.PROMETHEUS_FX;
  if (!FX) return;
  var coin = document.querySelector(".brand .coin");
  if (coin && !coin.querySelector("svg")) {
    coin.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#3ee6ff" stroke-width="1.5">' +
      '<circle cx="24" cy="24" r="20" opacity=".35"/><circle cx="24" cy="24" r="13"/>' +
      '<g class="br-spin"><path d="M24 2v7M24 39v7M2 24h7M39 24h7" stroke-width="2"/>' +
      '<path d="M10 10l4 4M38 38l-4-4" opacity=".6"/></g>' +
      '<circle cx="24" cy="24" r="3.2" fill="#a6f5ff" stroke="none"/></g></svg>';
    if (!FX.RM) {
      var g = coin.querySelector(".br-spin");
      var angle = 0;
      FX.loop(coin, function () {
        angle = (angle + 0.6) % 360;
        g.setAttribute("transform", "rotate(" + angle + " 24 24)");
      }, 30);
    }
  }

  function pad(n) { return String(n).padStart(2, "0"); }
  function stardate(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    var day = Math.floor((d - start) / 86400000);
    return d.getFullYear() + "." + String(day).padStart(3, "0");
  }
  function tick() {
    var clock = document.getElementById("br-clock");
    if (!clock) return;
    var d = new Date();
    clock.textContent = stardate(d) + " · " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  function build() {
    if (document.querySelector(".bridge-tele")) return;
    var anchor = document.querySelector(".sticky") || document.querySelector(".top");
    if (!anchor) return;
    var el = document.createElement("div");
    el.className = "bridge-tele";
    el.setAttribute("aria-hidden", "true");
    var linked = document.body.dataset.linked || "0";
    var waiting = document.body.dataset.waiting || "0";
    el.innerHTML =
      '<div><b>STARDATE</b><span id="br-clock">—</span></div>' +
      '<div><b>DESK</b><span class="ok"><span class="blink">●</span> LINK ONLY</span></div>' +
      '<div><b>OPEN</b><span>' + linked + ' specialists</span></div>' +
      '<div><b>WAITING</b><span>' + waiting + ' slots</span></div>';
    anchor.after(el);
    tick();
  }
  setInterval(function () { if (!document.hidden) tick(); }, 1000);
  FX.onRender(build);
  build();
})();
