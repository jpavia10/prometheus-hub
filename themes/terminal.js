/* Terminal mark only. The phosphor look is CSS. No radar, no boot screen. */
(function () {
  "use strict";
  var coin = document.querySelector(".brand .coin");
  if (coin && !coin.querySelector("svg")) {
    coin.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#ffb000" stroke-width="2">' +
      '<rect x="4" y="4" width="40" height="40"/><path d="M4 16h6M38 16h6M4 32h6M38 32h6" stroke-width="1.5"/>' +
      '<circle cx="24" cy="24" r="10"/><path d="M24 9v8M24 31v8M9 24h8M31 24h8"/></g>' +
      '<rect x="21.5" y="21.5" width="5" height="5" fill="#ffb000"/></svg>';
  }
})();
