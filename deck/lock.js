/* Prometheus passcode gate (Sebastian, 2026-11-14, at Joseph's direction).
   A casual-eyes lock for the deck's front door — NOT encryption: the hub's files and
   on-device data remain readable to anyone who goes looking, exactly as the owner
   accepted. Only a SHA-256 hash of the passcode is stored (localStorage
   prometheus.lock.hash); the passcode itself never is. Unlock lasts for the browser
   session. No passcode set = gate completely off. Forgotten passcode: clearing the
   browser's site data resets the lock (and the hub's on-device data — keep a backup). */
(function () {
  "use strict";
  var HKEY = "prometheus.lock.hash", SKEY = "prometheus.lock.open";
  function hash(txt) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode("prometheus:" + txt))
        .then(function (buf) { return Array.from(new Uint8Array(buf)).map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); })
        .catch(function () { return Promise.resolve(fnv(txt)); });
    }
    return Promise.resolve(fnv(txt));
  }
  function fnv(txt) { var h = 0x811c9dc5; for (var i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return "fnv" + h.toString(16); }

  var style = document.createElement("style");
  style.textContent = [
    "#pk-lock{position:fixed;inset:0;z-index:9999;background:#05070e;display:grid;place-items:center;font-family:system-ui,sans-serif;color:#f4f7fb}",
    "#pk-lock .card{text-align:center;max-width:320px;padding:24px}",
    "#pk-lock .ring{width:54px;height:54px;margin:0 auto 14px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.75),0 0 32px rgba(159,212,230,.55);background:radial-gradient(circle,#f4f7fb 0 18%,#9fd4e6 22%,transparent 28%)}",
    "#pk-lock h1{font-size:19px;margin:0 0 6px;font-weight:600}",
    "#pk-lock p{font-size:13px;opacity:.75;margin:0 0 16px;line-height:1.45}",
    "#pk-lock input{width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#f4f7fb;font-size:16px;text-align:center}",
    "#pk-lock button{margin-top:10px;width:100%;padding:11px;border-radius:10px;border:0;background:#9fd4e6;color:#05070e;font-size:15px;font-weight:600;cursor:pointer}",
    "#pk-lock .err{color:#ff8f9d;font-size:13px;min-height:18px;margin-top:8px}",
    "#pk-lock .fine{font-size:11px;opacity:.5;margin-top:14px}",
    "#pk-lock-btn{position:fixed;right:10px;bottom:10px;z-index:9998;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(5,7,14,.72);color:#f4f7fb;font:12px system-ui;cursor:pointer;opacity:.75}"
  ].join("");
  document.head.appendChild(style);

  function showLock(setup) {
    var old = document.getElementById("pk-lock"); if (old) old.remove();
    var el = document.createElement("div"); el.id = "pk-lock";
    el.innerHTML = '<div class="card"><div class="ring"></div><h1>' + (setup ? "Set a passcode" : "Prometheus is locked") + '</h1>' +
      "<p>" + (setup ? "Choose a passcode for this device. It keeps casual eyes out — it is not encryption." : "Enter your passcode to open the deck.") + "</p>" +
      '<input id="pk-lock-in" type="password" autocomplete="off" placeholder="Passcode">' +
      (setup ? '<input id="pk-lock-in2" type="password" autocomplete="off" placeholder="Again" style="margin-top:8px">' : "") +
      '<button id="pk-lock-go" type="button">' + (setup ? "Set passcode & lock" : "Unlock") + "</button>" +
      '<div class="err" id="pk-lock-err"></div>' +
      '<div class="fine">Forgotten it? Clearing this browser\'s site data resets the lock — and the hub\'s on-device data. Keep a deck backup.</div></div>';
    document.body.appendChild(el);
    var input = document.getElementById("pk-lock-in"); input.focus();
    document.getElementById("pk-lock-go").onclick = function () {
      var v = input.value, err = document.getElementById("pk-lock-err");
      if (setup) {
        var v2 = document.getElementById("pk-lock-in2").value;
        if (v.length < 4) { err.textContent = "At least 4 characters."; return; }
        if (v !== v2) { err.textContent = "Passcodes do not match."; return; }
        hash(v).then(function (hv) { localStorage.setItem(HKEY, hv); sessionStorage.removeItem(SKEY); showLock(false); });
      } else {
        hash(v).then(function (hv) {
          if (hv === localStorage.getItem(HKEY)) { sessionStorage.setItem(SKEY, "1"); el.remove(); mountButton(); }
          else { err.textContent = "Wrong passcode."; input.value = ""; input.focus(); }
        });
      }
    };
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") document.getElementById("pk-lock-go").click(); });
  }

  function mountButton() {
    if (document.getElementById("pk-lock-btn")) return;
    var b = document.createElement("button"); b.id = "pk-lock-btn"; b.type = "button";
    var has = !!localStorage.getItem(HKEY);
    b.textContent = has ? "🔒 Lock" : "🔒 Set passcode";
    b.title = has ? "Lock the deck now" : "Set a passcode for this device";
    b.onclick = function () { if (localStorage.getItem(HKEY)) { sessionStorage.removeItem(SKEY); showLock(false); } else showLock(true); };
    document.body.appendChild(b);
  }

  function boot() {
    if (localStorage.getItem(HKEY) && sessionStorage.getItem(SKEY) !== "1") showLock(false);
    else mountButton();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
