/* Sylade (moved onto the kit 2026-11-13): presence only. The three public channels of the shared AI name, and a pointer to the paused
   Fleet Command page. Nothing is stored; nothing is sent. Do not expand this page beyond presence (charter section 16). */
(function () {
  "use strict";
  const { $, h } = PK;
  const CH = [["Email", "sylade.ais@gmail.com", "mailto:sylade.ais@gmail.com", "The public address. No other mail is set."], ["GitHub", "sylade-ais", "https://github.com/sylade-ais", "GitHub profile name Sylade. Shared AI identity."], ["Discord", "Sylade Fleet", "https://discord.gg/YCam2NEkv9", "Public Discord server. Separate from the Fleet Command site."]];
  window.SYLADE = { CH };
  $("#app").replaceChildren(h("section.grid", null,
    h("div.glass.span-12", null, h("h2", null, "Where the name lives"), ...CH.map(([k, name, href, note]) => h("a.contact", { href, target: href.startsWith("mailto") ? null : "_blank", rel: "noopener" }, h("em", null, k), h("b", null, name), h("small", null, note)))),
    h("div.glass.span-12", null, h("h2", null, "Fleet Command"), h("p", null, "A different page, paused since 2026-10-28. Nothing reports to it. ", h("a", { href: "https://jpavia10.github.io/fleet-command/", target: "_blank", rel: "noopener" }, "Paused page ↗")))));
})();
