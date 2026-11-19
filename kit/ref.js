/* PK.ref (Claude, 2026-11-19): one way to show checked reference data in any pillar.
   A searchable list with filter chips; every row carries its value, its source link and the source's own words
   (tap "quote" to read them). Used for the AI homework datasets after they pass Claude's checks.

   PK.refPanel(grid, { title, sub, span, id })  -> the mount element of a new .glass panel appended to `grid`
                                                    (the kit turns every panel with an h2 into a tab).
   PK.ref(mount, {
     rows,                     array of objects
     title(r), value(r),       the row's name and its main value (strings)
     meta(r)  -> [strings]     small chips under the value
     group(r) -> string        filter chips (one per distinct group); omit for none
     detail(r)                 longer text shown with the quote when the row is opened ("more")
     url(r), quote(r)          source link and the source's own words
     note                      one line under the list (where the data came from, what was checked)
     search(r) -> string       text the search box matches (defaults to every string field)
     empty                     text when nothing matches
   }) */
(function () {
  var PK = window.PK || (window.PK = {});
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  PK.refPanel = function (grid, o) {
    if (typeof grid === "string") grid = document.querySelector(grid);
    var p = el("div", "glass pk-refp span-" + ((o && o.span) || 12)); if (o && o.id) p.id = o.id;
    p.appendChild(el("h2", null, o.title));
    if (o.sub) p.appendChild(el("p", "sub", o.sub));
    var m = el("div", "pk-ref"); p.appendChild(m); grid.appendChild(p);
    return m;
  };

  PK.ref = function (mount, o) {
    if (typeof mount === "string") mount = document.querySelector(mount);
    if (!mount) return null;
    var rows = o.rows || [], q = "", g = null;
    var text = o.search || function (r) { return Object.keys(r).map(function (k) { return typeof r[k] === "string" ? r[k] : ""; }).join(" "); };
    var bar = el("div", "pk-ref-bar"), input = el("input", "pk-ref-q"); input.type = "search"; input.placeholder = o.placeholder || "Search " + rows.length + " rows"; input.setAttribute("aria-label", input.placeholder);
    bar.appendChild(input);
    var groups = o.group ? Array.from(new Set(rows.map(o.group).filter(Boolean))) : [];
    var chips = el("div", "pk-ref-chips");
    if (groups.length > 1) {
      ["All"].concat(groups).forEach(function (name, i) {
        var c = el("button", "chip" + (i === 0 ? " on" : ""), name); c.type = "button"; c.setAttribute("aria-pressed", String(i === 0));
        c.addEventListener("click", function () { g = i === 0 ? null : name; Array.prototype.forEach.call(chips.children, function (x) { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", String(x === c)); }); paint(); });
        chips.appendChild(c);
      });
      bar.appendChild(chips);
    }
    var count = el("p", "stat-s pk-ref-count"), list = el("div", "pk-ref-list"); list.setAttribute("role", "list");
    mount.replaceChildren(bar, count, list);
    if (o.note) mount.appendChild(el("p", "stat-s pk-ref-note", o.note));
    input.addEventListener("input", function () { q = input.value.trim().toLowerCase(); paint(); });

    function row(r, i) {
      var it = el("div", "pk-ref-row"); it.setAttribute("role", "listitem"); if (!still) it.style.setProperty("--i", String(Math.min(i, 14)));
      var head = el("div", "pk-ref-head");
      head.appendChild(el("b", null, o.title(r)));
      var src = o.url && o.url(r);
      var acts = el("span", "pk-ref-acts");
      var qt = o.quote && o.quote(r), dt = o.detail && o.detail(r), box = null;
      if (qt || dt) {
        var b = el("button", "pk-ref-btn", dt ? "more" : "quote"); b.type = "button"; b.setAttribute("aria-expanded", "false");
        b.addEventListener("click", function () {
          if (!box) { box = el("div", "pk-ref-open"); if (dt) box.appendChild(el("div", "pk-ref-detail", dt)); if (qt) box.appendChild(el("blockquote", "pk-ref-quote", "“" + qt + "”")); it.appendChild(box); }
          var open = b.getAttribute("aria-expanded") !== "true"; b.setAttribute("aria-expanded", String(open)); box.hidden = !open; it.classList.toggle("open", open);
        });
        acts.appendChild(b);
      }
      if (src) { var a = el("a", "pk-ref-btn", "source ↗"); a.href = src; a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); }
      head.appendChild(acts); it.appendChild(head);
      var v = o.value && o.value(r); if (v) it.appendChild(el("div", "pk-ref-val", v));
      var meta = (o.meta && o.meta(r)) || []; meta = meta.filter(Boolean);
      if (meta.length) { var m = el("div", "pk-ref-meta"); meta.forEach(function (t) { m.appendChild(el("span", "pk-ref-tag", t)); }); it.appendChild(m); }
      return it;
    }
    function paint() {
      var shown = rows.filter(function (r) { return (!g || o.group(r) === g) && (!q || text(r).toLowerCase().indexOf(q) >= 0); });
      count.textContent = shown.length === rows.length ? rows.length + " rows" : shown.length + " of " + rows.length + " rows";
      if (!shown.length) { list.replaceChildren(el("p", "empty", o.empty || "Nothing matches.")); return; }
      list.replaceChildren.apply(list, shown.map(row));
    }
    paint();
    return { paint: paint, set: function (next) { rows = next; paint(); } };
  };
})();
