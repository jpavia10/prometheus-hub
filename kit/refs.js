/* Sourced reference panels (Claude, 2026-11-24, owner: "Put Gemini's checked run-7 data into the pillars"): what an AI contributor
   found for a pillar, each row with the page it came from and that page's own words, so any line can be checked in one tap.
   PK_REFS({ title, intro, rows, head, sub, fields }) adds a .glass panel. On a pillar whose sections the kit turns into tabs it joins
   the grid as one more tab; on a pillar with its own tabs it sits under them, so their tabs keep working. Every value is set as text,
   never as markup, and a link is drawn only for an https address. */
(function () {
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function str(v) { return v == null ? "" : String(v); }
  function place(p) {
    var main = document.querySelector("main"); if (!main) return;
    var grid = main.querySelector(":scope > section.grid"), own = main.querySelector(":scope > .tabs:not(.pk-tabs)");
    if (grid && !own) grid.appendChild(p); else { var w = main.querySelector(":scope > .pk-refs-after"); if (!w) { w = el("div", "pk-refs-after"); main.appendChild(w); } w.appendChild(p); }
  }
  window.PK_REFS = function (o) {
    if (!o || !o.rows || !o.rows.length) return null;
    var p = el("section", "glass pk-refs"); if (o.id) p.id = o.id;
    p.appendChild(el("h2", null, o.title));
    if (o.intro) p.appendChild(el("p", "sub", o.intro));
    var list = el("div", "pk-refs-list");
    o.rows.forEach(function (r) {
      var d = el("details", "pk-ref"), s = el("summary"), sub = str(o.sub ? o.sub(r) : "");
      s.appendChild(el("b", null, str(o.head(r)))); if (sub && sub !== "null" && sub !== "undefined") s.appendChild(el("span", null, sub));
      d.appendChild(s);
      var body = el("div", "pk-ref-body");
      (o.fields || []).forEach(function (f) { var v = r[f[0]]; if (v == null || v === "") return; var row = el("p"); row.appendChild(el("i", null, f[1] + ": ")); row.appendChild(document.createTextNode(Array.isArray(v) ? v.join(", ") : str(v))); body.appendChild(row); });
      if (r.quote) body.appendChild(el("blockquote", null, str(r.quote)));
      if (/^https:\/\//.test(str(r.url))) { var a = el("a", "pk-ref-src", "Open the source ↗"); a.href = r.url; a.target = "_blank"; a.rel = "noopener"; body.appendChild(a); }
      d.appendChild(body); list.appendChild(d);
    });
    p.appendChild(list);
    p.appendChild(el("p", "pk-refs-foot", o.foot || "Found by Gemini and checked by Claude for its source and its count. Open the source before you rely on a number."));
    place(p); return p;
  };
})();
