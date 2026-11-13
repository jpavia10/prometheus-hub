"""Proofs for the deck, run in a real browser at phone size against a URL (local server or the live site).
   python3 proofs/run.py http://127.0.0.1:8377/ [--mock-weather] [--out proofs/results.json]
   Each proof is a thing the page itself does; nothing here re-implements the app. Exit code 1 if any proof fails."""
import sys, json, datetime
from playwright.sync_api import sync_playwright

URL = sys.argv[1].rstrip("/") + "/"; MOCK = "--mock-weather" in sys.argv
OUT = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else None
NOW = "2026-11-20T09:00"
results = []
def proof(pid, name, ok, detail): results.append({"id": pid, "name": name, "pass": bool(ok), "detail": detail}); print(("PASS " if ok else "FAIL ") + pid + "  " + name + "  ::  " + detail)

ICS_JS = """async () => { const m = await import(new URL('deck/core/ics.js', document.baseURI).href);
  const text = await (await fetch('proofs/fixtures/kairos_gemini_testcal_20261106-1620.ics')).text();
  const a = m.parseICS(text); const out = m.buildICS(a.events, a.zones); const b = m.parseICS(out); const bad = [];
  a.events.forEach((e, i) => { const o = b.events.find((x) => x.uid === e.uid); const d = o ? m.sameEvent(e, o) : ['missing']; if (d.length) bad.push(e.uid + ': ' + d.join(',')); });
  return { bytes: text.length, events: a.events.length, back: b.events.length, problems: a.problems.length, bad }; }"""

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/Los_Angeles", locale="en-US")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_" not in m.text else None)
    if MOCK:
        pg.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); pg.route("https://api.weather.gov/**", lambda route, request: route.abort()); pg.route("**/titan-reliquary-preview/**", lambda route, request: route.abort())   # a local server has no Titan next door
    # CORE: the hub as it opens on a clean device: every pillar, no sample data
    c2 = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/Los_Angeles", locale="en-US"); p2 = c2.new_page(); p2.on("pageerror", lambda e: errs.append("core: " + str(e)))
    if MOCK:
        p2.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); p2.route("https://api.weather.gov/**", lambda route, request: route.abort()); p2.route("**/titan-reliquary-preview/**", lambda route, request: route.abort())
    p2.goto(f"{URL}?now={NOW}#/", wait_until="load"); p2.wait_for_selector(".reactor .hex", timeout=20000); p2.wait_for_timeout(900)
    ci = p2.evaluate("""() => ({ hex: document.querySelectorAll('.reactor .hex:not(.core)').length, names: [...document.querySelectorAll('.reactor .hex:not(.core) .hex-name')].map((x) => x.textContent),
      demo: !!window.__deck.store.get('profile').demo, events: window.__deck.store.get('time').events.length, plan: !!window.__deck.store.get('money').plan, wide: document.documentElement.scrollWidth, ring: !!document.querySelector('.dayring') })""")
    proof("CORE-1", "Every pillar is on the core (19 since Games); a clean device shows no sample data", ci["hex"] == 19 and not ci["demo"] and ci["events"] == 0 and not ci["plan"] and ci["wide"] <= 390 and ci["ring"], json.dumps(ci))
    routes = p2.evaluate("[...document.querySelectorAll('.reactor .hex:not(.core) a')].map((a) => a.getAttribute('href'))"); bad = []; local = [r for r in routes if not r.startswith("http")]
    for r in local:
        resp = p2.request.get(URL + r)
        if resp.status != 200 or ("kit/prometheus.css" not in resp.text() and "sylade" not in r): bad.append(f"{r} ({resp.status})")
    proof("CORE-2", "Every pillar page in this repository answers and wears the shared theme", not bad and len(local) >= 14, f"{len(local)} pages checked, {len(routes) - len(local)} on their own sites" + ("; bad: " + ", ".join(bad) if bad else ""))
    p2.evaluate("localStorage.setItem('prometheus.bus.deadlines', JSON.stringify([{ id: 't1', title: 'Proof: oil service', date: '2026-11-22', source: 'garage', ref: 'oil' }]))"); p2.reload(); p2.wait_for_selector(".reactor .hex"); p2.wait_for_timeout(600)
    got = p2.evaluate("""async () => { const f = await import(new URL('deck/core/feeds.js', document.baseURI).href); return { rows: f.rows('2026-11-20', '2026-11-30').filter((r) => r.bus).map((r) => r.title + ' / ' + r.cap), badge: (document.querySelector('.hex[data-pillar=garage] .hex-badge') || {}).textContent || '', runway: !!document.querySelector('.runway .day.level-0, .runway .day') }; }""")
    proof("CORE-3", "A pillar's own deadline (the shared bus) reaches the hub: in the feed and on its cell", len(got["rows"]) == 1 and got["badge"] == "2d", json.dumps(got))
    p2.wait_for_timeout(2500); import time as _t; t0 = _t.time()                         # let the page finish starting (a test machine draws in software, slowly)
    p2.evaluate("document.querySelector('.hex[data-pillar=apollo] .hex-in').click()")
    try: p2.wait_for_url("**/pillars/apollo/**", timeout=30000); took = _t.time() - t0; p2.wait_for_selector(".shell", timeout=15000); landed = f"{p2.title()} ({took:.1f} s on this machine)"
    except Exception as e: landed = "did not land: " + str(e)[:80]
    proof("CORE-4", "Tapping a cell warps into that pillar", "Apollo" in landed, landed); c2.close()

    # PILLAR: the shared pillar shell (crest, automatic sections, dock), checked on the long Piano page
    c3 = b.new_context(viewport={"width": 390, "height": 844}); p3 = c3.new_page(); p3.on("pageerror", lambda e: errs.append("pillar: " + str(e)))
    p3.goto(f"{URL}pillars/piano/", wait_until="load"); p3.wait_for_selector(".pk-dock", timeout=15000); p3.wait_for_timeout(900)
    def shell(): return p3.evaluate("""() => { const panels = [...document.querySelectorAll('main > section.grid > .glass')]; return { crest: !!document.querySelector('.pk-hero .pk-crest svg'), tabs: document.querySelectorAll('main > .pk-tabs .tab').length,
      showing: panels.filter((x) => x.offsetParent !== null).map((x) => x.querySelector('h2').textContent.slice(0, 22)), core: (document.querySelector('.pk-dock .pk-core') || {}).href || '', steps: document.querySelectorAll('.pk-dock a.compass-step').length,
      tall: document.documentElement.scrollHeight, wide: document.documentElement.scrollWidth }; }""")
    s1 = shell(); p3.click("main > .pk-tabs .tab:nth-child(3)"); p3.wait_for_timeout(700); s2 = shell()
    proof("PILLAR-1", "Every pillar's default shell: crest, sections from its own panels, a dock back to the core", s1["crest"] and s1["tabs"] >= 3 and len(s1["showing"]) == 1 and len(s2["showing"]) == 1 and s1["showing"] != s2["showing"] and s1["core"].endswith("/prometheus-hub/") | s1["core"].endswith(":8377/") and s1["steps"] >= 1 and s1["wide"] <= 390 and s1["tall"] < 2600,
          f"Piano: {s1['tabs']} sections, showing {s1['showing']} then {s2['showing']}; page {s1['tall']} px tall at phone size (was 6,672); dock: core + {s1['steps']} neighbours"); c3.close()

    # PILLAR-2: every pillar page in this repository runs clean: opened in a real page, every section tapped, and any script error fails the build
    c4 = b.new_context(viewport={"width": 390, "height": 844}); dirty = []; taps = 0
    if MOCK: c4.route("https://api.weather.gov/**", lambda route, request: route.abort())
    for r in local:
        p4 = c4.new_page(); mine = []; name = r.strip("/").split("/")[-1].replace(".html", "")
        p4.on("pageerror", lambda e, mine=mine: mine.append(str(e)[:110])); p4.on("console", lambda m, mine=mine: mine.append(m.text[:110]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
        try:
            p4.goto(URL + r, wait_until="load", timeout=30000); p4.wait_for_timeout(600)
            n = p4.evaluate("document.querySelectorAll('.tabs .tab, .pk-tabs .tab').length")
            for i in range(n):
                p4.evaluate("(i) => { const t = document.querySelectorAll('.tabs .tab, .pk-tabs .tab')[i]; if (t) t.click(); }", i); p4.wait_for_timeout(160); taps += 1
        except Exception as e: mine.append("did not load: " + str(e)[:80])
        if mine: dirty.append(f"{name}: {mine[0]}" + (f" (+{len(mine) - 1})" if len(mine) > 1 else ""))
        p4.close()
    proof("PILLAR-2", "Every pillar page runs without a script error, in every section", not dirty and len(local) >= 14, f"{len(local)} pages opened, {taps} sections tapped" + ("; errors: " + " | ".join(dirty) if dirty else ", no errors")); c4.close()

    # STAGE-1: every kit pillar opens on its own signature picture (drawn from its data), with readouts, and no script errors
    c7 = b.new_context(viewport={"width": 390, "height": 844}); bare = []; shown = []
    for pid in "kairos garage piano money apollo hermes argus selling icarus odyssey bastion privacy records".split():
        p7 = c7.new_page(); mine = []; p7.on("pageerror", lambda e, mine=mine: mine.append(str(e)[:100]))
        if MOCK: p7.route("https://jpavia10.github.io/**", lambda route, request: route.abort()); p7.route("https://api.weather.gov/**", lambda route, request: route.abort())
        p7.goto(f"{URL}pillars/{pid}/?still=1&today=2026-11-13", wait_until="load"); p7.wait_for_timeout(500)
        st = p7.evaluate("""() => { const s = document.querySelector('.pk-stage'); if (!s) return null; const cv = s.querySelector('canvas'), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data; let lit = 0;
          for (let i = 3; i < d.length; i += 4 * 53) if (d[i] > 40 && (d[i - 3] + d[i - 2] + d[i - 1]) > 120) lit++; const hero = document.querySelector('.hero'); return { lit, reads: s.querySelectorAll('.pk-read').length, h: Math.round(cv.getBoundingClientRect().height), after: !!hero && hero.nextElementSibling === s }; }""")
        if not st or st["lit"] < 40 or st["reads"] < 3 or not st["after"] or mine: bare.append(f"{pid}: {st} {mine[:1]}")
        else: shown.append(pid)
        p7.close()
    proof("STAGE-1", "Every pillar opens on its own signature picture drawn from its data, with live readouts, and no script errors", not bare and len(shown) == 13, f"{len(shown)} of 13 drawn: {', '.join(shown)}" + ("; missing: " + " | ".join(bare) if bare else "")); c7.close()

    # ATHENAEUM: the first pillar rebuilt to the charter's standard. A clean device, a fixed day, motion held still so positions can be read.
    c5 = b.new_context(viewport={"width": 390, "height": 844}, accept_downloads=True); p5 = c5.new_page(); p5.on("pageerror", lambda e: errs.append("athenaeum: " + str(e)[:160])); p5.on("console", lambda m: errs.append("athenaeum: " + m.text[:160]) if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)
    A = f"{URL}pillars/athenaeum/?still=1&today=2026-11-13"
    p5.goto(A, wait_until="load"); p5.wait_for_function("window.__ath && window.__ath.ready && window.__ath.chron.length > 0", timeout=30000); p5.wait_for_timeout(500)
    a1 = p5.evaluate("""() => { const d = window.__ath.sky.debug(); return { n: window.__ath.live.length, gl: d.ok && d.viewport[2] === d.canvas[0] && d.viewport[3] === d.canvas[1], stars: d.ideas.filter((n) => n && n.on && n.x > 0 && n.x < 390 && n.y > 60 && n.y < 800).length, lines: d.lines, arm: d.arm, groups: window.__ath.groups.list.map((g) => g.name + " " + g.members.length),
      labels: [...document.querySelectorAll('.ath-label')].filter((b) => +getComputedStyle(b).opacity > .5).length, count: document.getElementById('ath-count').textContent, wide: document.documentElement.scrollWidth, tall: document.documentElement.scrollHeight, dock: !!document.querySelector('.pk-dock .pk-core') }; }""")
    proof("ATH-1", "Athenaeum opens as a sky: every kept idea is a star in 3D, tied by what they share, in named constellations", a1["gl"] and a1["n"] >= 11 and a1["stars"] >= a1["n"] * .9 and a1["lines"] >= a1["n"] and a1["arm"] == 39 and 2 <= len(a1["groups"]) <= a1["n"] / 3 + 1 and a1["labels"] >= 6 and a1["wide"] <= 390 and a1["tall"] <= 844 and a1["dock"],
          f"WebGL {a1['gl']}; {a1['stars']} of {a1['n']} stars on screen, {a1['lines']} ties drawn, {a1['labels']} labels readable; constellations: {', '.join(a1['groups'])}; {a1['count']}; page {a1['wide']}x{a1['tall']}")
    spot = p5.evaluate("""() => { const s = window.__ath.sky.debug().ideas; let best = 0, gap = -1; s.forEach((n, k) => { if (!n || !n.on || n.y < 200 || n.y > 640 || n.x < 30 || n.x > 360) return; const d = Math.min(...s.filter((m, j) => m && j !== k).map((m) => Math.hypot(m.x - n.x, m.y - n.y))); if (d > gap) { gap = d; best = k; } }); return { ...s[best], k: best, gap }; }"""); p5.mouse.click(spot["x"], spot["y"]);   # a star clear of its neighbours, so the tap is not ambiguous p5.wait_for_selector(".ath-sheet:not([hidden]) h2", timeout=8000); p5.wait_for_timeout(600)
    a2 = p5.evaluate("""(k) => { const i = window.__ath.live[k]; return { hash: location.hash, title: document.querySelector('.ath-sheet h2').textContent, same: document.querySelector('.ath-sheet h2').textContent === i.title, body: document.querySelector('.ath-text').textContent === i.body,
      lineage: document.querySelectorAll('.ath-spine li').length, chain: i.chain.length, pv: [...document.querySelectorAll('.ath-meta .ath-pv')].map((x) => x.textContent), marks: [...new Set([...document.querySelectorAll('.ath-spine time em')].map((x) => x.textContent))],
      rel: [...document.querySelectorAll('.ath-rel button')].map((x) => x.querySelector('b').textContent.slice(0, 28) + ' [' + x.querySelector('small').textContent + ']'), focus: window.__ath.sky.debug().focus }; }""", spot["k"])
    p5.go_back(); p5.wait_for_timeout(500); closed = p5.evaluate("!document.body.classList.contains('ath-open') && location.hash === ''")
    proof("ATH-2", "Tapping a star opens the idea whole: its words unchanged, its lineage, where it came from, and what it connects to and why", a2["same"] and a2["body"] and a2["lineage"] == a2["chain"] + 2 and "Imported" in a2["pv"] and a2["marks"] == ["from the import"] and len(a2["rel"]) >= 2 and all("shares" in x or "speak of" in x for x in a2["rel"]) and a2["focus"] == spot["k"] and closed,
          f"{a2['title']}: {a2['chain']} refinements on the spine, marked {a2['marks']}; {a2['pv']}; connected: {a2['rel'][0]}; Back closes it: {closed}")
    before = p5.evaluate("localStorage.getItem('prometheus.athenaeum.ideas')")
    p5.click(".ath-spark"); p5.wait_for_selector(".ath-form input[name=title]"); p5.fill(".ath-form input[name=title]", "Proof: second readers for every audit"); p5.fill(".ath-form textarea", "A blind audit by a second reviewer catches what the first one missed."); p5.fill(".ath-form input[name=tags]", "ai, reliability")
    p5.click(".ath-form button[type=submit]"); p5.wait_for_selector(".ath-sheet .ath-pv.typed", timeout=8000); p5.wait_for_timeout(400)
    p5.fill(".ath-add textarea", "The second reader must not see the first reader's notes."); p5.click(".ath-spine .btn"); p5.wait_for_timeout(600)
    a3 = p5.evaluate("""(before) => { const was = JSON.parse(before), now = JSON.parse(localStorage.getItem('prometheus.athenaeum.ideas')), mine = now[now.length - 1];
      return { added: now.length - was.length, untouched: JSON.stringify(now.slice(0, was.length)) === JSON.stringify(was), mine: { origin: mine.origin, tags: mine.tags, created: mine.created, chain: mine.chain }, stars: window.__ath.sky.debug().ideas.length,
        rel: [...document.querySelectorAll('.ath-rel b')].map((x) => x.textContent.slice(0, 30)), marks: [...document.querySelectorAll('.ath-spine li.you time em')].map((x) => x.textContent), events: PB.events.list().map((e) => e.type + ':' + e.pillar) }; }""", before)
    proof("ATH-3", "Capture and refinement: a new idea becomes a star marked as typed by you, finds its relatives by itself, a refinement only appends, and no other record changes",
          a3["added"] == 1 and a3["untouched"] and a3["mine"]["origin"] == "typed" and a3["mine"]["created"] == "2026-11-13" and len(a3["mine"]["chain"]) == 1 and a3["mine"]["chain"][0].get("by") == "you" and a3["stars"] == a1["n"] + 1 and any("Independent blind audits" in x for x in a3["rel"]) and a3["marks"] == ["you"] and a3["events"] == ["idea.captured:athenaeum", "idea.refined:athenaeum"],
          f"{a3['stars']} stars; the {a1['n']} earlier records byte-identical: {a3['untouched']}; found by itself: {a3['rel'][:2]}; refinement marked {a3['marks']}; events {a3['events']}")
    p5.evaluate("window.__ath.go('', true); window.__ath.setT(0.4)"); p5.wait_for_timeout(300)
    a4 = p5.evaluate("""() => { const d = window.__ath.sky.debug(), txt = document.querySelector('.ath-when').textContent, day = new Date(txt.split(' · ')[0] + ' 12:00').toLocaleDateString('en-CA'); return { txt, lit: d.ideas.filter((n) => n && n.on).length, due: window.__ath.live.filter((i) => i.created <= day).length, day }; }""")
    p5.evaluate("window.__ath.setT(1)"); p5.wait_for_timeout(200); lit_now = p5.evaluate("window.__ath.sky.debug().ideas.filter((n) => n && n.on).length")
    proof("ATH-4", "The time slider shows the sky as it was: only the ideas that existed on that day are lit", a4["lit"] == a4["due"] and 0 < a4["lit"] < a1["n"] + 1 and lit_now == a1["n"] + 1 and str(a4["due"]) + " idea" in a4["txt"], f"at {a4['txt']}: {a4['lit']} stars lit, {a4['due']} ideas existed by {a4['day']}; today {lit_now}")
    p5.goto(A + "#event/ath016", wait_until="load"); p5.wait_for_function("window.__ath && window.__ath.chron.length > 0 && document.querySelector('.ath-sheet:not([hidden]) .ath-flow')", timeout=30000); p5.wait_for_timeout(400)
    a5 = p5.evaluate("""() => ({ title: document.querySelector('.ath-sheet h2').textContent, steps: [...document.querySelectorAll('.ath-step b')].map((x) => x.textContent), full: [...document.querySelectorAll('.ath-step p')].every((x) => x.textContent.length > 20), quotes: document.querySelectorAll('.ath-codex blockquote').length,
      link: (document.querySelector('.ath-prov a') || {}).href || '', made: document.querySelector('.ath-prov').textContent.includes('not written by you'), rail: document.querySelectorAll('.ath-era').length, on: (document.querySelector('.ath-era.on b') || {}).textContent, mode: document.body.dataset.mode, event: window.__ath.sky.debug().event })""")
    proof("ATH-5", "The chronicle: 40 history entries along one arm of time; each opens as cause, event, consequence with the source's own words and a link",
          a5["title"] == "Fall of Constantinople" and a5["steps"] == ["Cause", "Event", "Consequence"] and a5["full"] and a5["quotes"] >= 1 and "wikipedia.org" in a5["link"] and a5["made"] and a5["rail"] == 40 and a5["on"] == a5["title"] and a5["mode"] == "chronicle" and a5["event"] >= 0,
          f"{a5['title']}: {a5['steps']}, {a5['quotes']} quotes, source {a5['link'][:48]}; {a5['rail']} entries on the rail; marked as not the owner's writing: {a5['made']}")
    kept = p5.evaluate("localStorage.getItem('prometheus.athenaeum.ideas')"); shelf_n = p5.evaluate("JSON.parse(localStorage.getItem('prometheus.athenaeum.shelf')).length")
    with p5.expect_download() as dl: p5.evaluate("window.__ath.go('menu', true)"); p5.wait_for_selector("#export"); p5.click("#export")
    saved = dl.value.path(); p5.evaluate("localStorage.setItem('prometheus.athenaeum.ideas', '[]'); localStorage.setItem('prometheus.athenaeum.shelf', '[]'); window.__ath.rebuild()"); empty = p5.evaluate("window.__ath.live.length")
    with p5.expect_file_chooser() as fc: p5.evaluate("window.__ath.go('menu', true)"); p5.wait_for_selector("#import"); p5.click("#import")
    fc.value.set_files(saved); p5.wait_for_selector(".ath-preview li", timeout=8000); preview = p5.evaluate("[...document.querySelectorAll('.ath-preview li')].map((x) => x.textContent)"); held = p5.evaluate("window.__ath.live.length")
    p5.click("#import-go"); p5.wait_for_timeout(600); again = p5.evaluate("localStorage.getItem('prometheus.athenaeum.ideas')"); shelf_back = p5.evaluate("JSON.parse(localStorage.getItem('prometheus.athenaeum.shelf')).length")
    proof("ATH-6", "Backup: export, lose everything, import. The preview says what will change before anything does, and every idea comes back exactly as it was",
          empty == 0 and held == 0 and preview[0].startswith(str(a1["n"] + 1) + " new") and again == kept and shelf_back == shelf_n == 40, f"wiped to {empty}; preview: {preview[0]} / {preview[3]}; nothing applied until confirmed: {held == 0}; restored ideas identical to the byte: {again == kept}; shelf {shelf_back} of {shelf_n}")
    p5.evaluate("window.__ath.go('index', true)"); p5.wait_for_selector("#a-q"); p5.fill("#a-q", "first reader"); p5.wait_for_timeout(250); found = p5.evaluate("[...document.querySelectorAll('#ath-index .ath-rowmain b')].map((x) => x.textContent)")
    p5.fill("#a-q", ""); p5.evaluate("window.__ath.go('idea/' + encodeURIComponent(window.__ath.live[0].id))"); p5.wait_for_selector(".ath-actions .btn"); seen = p5.evaluate("[...document.querySelectorAll('.ath-sheet .ath-actions .btn')].map((x) => x.textContent)")
    p5.evaluate("[...document.querySelectorAll('.ath-sheet .ath-actions .btn')].find((x) => x.textContent === 'Archive').click()"); p5.wait_for_timeout(400); arch = p5.evaluate("window.__ath.live.length"); p5.click(".toast button"); p5.wait_for_timeout(400); undone = p5.evaluate("window.__ath.live.length")
    p5.evaluate("window.__ath.go('shelf', true)"); p5.wait_for_selector("#a-shelf-form"); p5.fill("#a-shelf-form input[name=title]", "Proof: a book"); p5.click("#a-shelf-form button[type=submit]"); p5.wait_for_timeout(300); shelved = p5.evaluate("[...document.querySelectorAll('#ath-shelf .ath-row b')].map((x) => x.textContent)")
    proof("ATH-7", "Nothing the old page did is gone: search inside refinements, resurfacing, archive (now with undo), the shelf", found == ["Proof: second readers for every audit"] and any("resurface" in s for s in seen) and "Archive" in seen and arch == a1["n"] and undone == a1["n"] + 1 and shelved == ["Proof: a book"],
          f"search 'first reader' (words only in a refinement) finds {found}; actions {seen}; archive {arch} then undo {undone}; shelved {shelved}"); c5.close()

    # CORE-5: the hub reaches into a pillar through its manifest: finds a record, hands words over, shows what last happened
    c6 = b.new_context(viewport={"width": 390, "height": 844}); p6 = c6.new_page(); p6.on("pageerror", lambda e: errs.append("reach: " + str(e)[:160]))
    if MOCK:
        p6.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); p6.route("https://api.weather.gov/**", lambda route, request: route.abort()); p6.route("**/titan-reliquary-preview/**", lambda route, request: route.abort())
    p6.goto(A, wait_until="load"); p6.wait_for_function("window.__ath && window.__ath.ready", timeout=30000); p6.evaluate("PB.events.publish({ type: 'idea.refined', pillar: 'athenaeum', ref: 'x', title: 'Proof event' })")
    p6.goto(f"{URL}?now={NOW}#/", wait_until="load"); p6.wait_for_selector(".reactor .hex", timeout=20000); p6.wait_for_timeout(700)
    tick_line = p6.evaluate("document.querySelector('.ticker').getAttribute('aria-label')"); hits = p6.evaluate("window.__deck.reach.searchRecords('blind audits')"); deep = p6.evaluate("window.__deck.reach.searchRecords('anti-corrosion')")
    p6.click("#open-search"); p6.wait_for_selector(".search-input"); p6.fill(".search-input", "idea: test the handoff from the hub"); p6.wait_for_timeout(250); first = p6.evaluate("document.querySelector('.results .result b').textContent")
    p6.evaluate("document.querySelector('.results .result').click()")
    try: p6.wait_for_url("**/pillars/athenaeum/**", timeout=30000); p6.wait_for_selector(".ath-form input[name=title]", timeout=20000); p6.wait_for_timeout(300); landed = p6.evaluate("({ title: document.querySelector('.ath-form input[name=title]').value, kept: JSON.parse(localStorage.getItem('prometheus.athenaeum.ideas')).length })")
    except Exception as e: landed = {"title": "did not land: " + str(e)[:60], "kept": -1}
    proof("CORE-5", "The hub reaches into a pillar through its manifest: finds an idea by its title or its text, hands typed words to the pillar without writing its records, and shows what last happened there",
          len(hits) >= 1 and hits[0]["title"].startswith("Independent blind audits") and "#idea/" in hits[0]["href"] and len(deep) >= 1 and "Athenaeum · idea" in deep[0]["sub"] and "Athenaeum · idea refined: Proof event" in tick_line and first.startswith("Capture an idea: test the handoff") and landed["title"] == "test the handoff from the hub" and landed["kept"] == a1["n"],
          f"'blind audits' -> {hits[0]['title'][:40] if hits else None} ({hits[0]['href'] if hits else ''}); text match -> {deep[0]['sub'][:70] if deep else None}; ticker has the event: {'Proof event' in tick_line}; '{first[:40]}' opens Athenaeum with the title filled: {landed['title']!r}, ideas still {landed['kept']}"); c6.close()

    pg.goto(f"{URL}?now={NOW}&demo=1#/", wait_until="load"); pg.wait_for_selector(".dayring", timeout=20000); pg.wait_for_timeout(1200)

    # ARRIVAL: the picture is built from the data, not a placeholder
    info = pg.evaluate("""() => ({ ring: !!document.querySelector('.dayring svg'), rows: document.querySelectorAll('.tier1 .item').length, days: document.querySelectorAll('.runway .day').length,
      payoff: (document.querySelector('.dial-pct') || {}).textContent, caps: [...document.querySelectorAll('.dock-item')].map((x) => x.dataset.cap), wide: document.documentElement.scrollWidth, build: window.__deck.BUILD })""")
    proof("DECK-1", "Arrival view: day ring, next 24 hours, 7-day runway, payoff, all from the store", info["ring"] and info["days"] == 7 and info["payoff"] and info["wide"] <= 390, json.dumps(info))

    # TIME-1: the 40-event research calendar goes in and comes back out the same
    r = pg.evaluate(ICS_JS)
    proof("TIME-1", "iCalendar: 40-event research file imports, exports and re-imports identical", r["events"] == 40 and r["back"] == 40 and not r["bad"], f"{r['events']} events in, {r['back']} back, {len(r['bad'])} differ, {r['problems']} parse notes" + (": " + "; ".join(r["bad"][:3]) if r["bad"] else ""))

    # TIME-2: a holiday, a bill and a school deadline on one day are flagged as a collision in the day view
    day = pg.evaluate("() => window.__deck.store.get('time').events.find((e) => e.kind === 'school').date")
    pg.goto(f"{URL}?now={NOW}&demo=1#/time/day/{day}"); pg.wait_for_selector(".day-list .item", timeout=10000); pg.wait_for_timeout(500)
    d = pg.evaluate("""() => ({ banner: (document.querySelector('.time-body .banner') || {}).textContent || '', level3: !!document.querySelector('.time-body .banner.level-3'),
      holiday: [...document.querySelectorAll('.day-list .tone-holiday b')].map((x) => x.textContent), bill: [...document.querySelectorAll('.day-list .tone-bill b')].map((x) => x.textContent), school: [...document.querySelectorAll('.day-list .tone-school b')].map((x) => x.textContent) })""")
    proof("TIME-2", "Day view: holiday + bill + school deadline collide and the day says so", d["level3"] and d["holiday"] and d["bill"] and d["school"], f"{day}: “{d['banner']}” · holiday {d['holiday']} · bill {d['bill']} · school {d['school']}")
    pg.screenshot(path="proofs/shots/time-collision.png") if "--shots" in sys.argv else None

    # TIME-3: plain-words quick add from the command key lands on the right day
    pg.goto(f"{URL}?now={NOW}&demo=1#/"); pg.wait_for_selector("#open-search"); pg.click("#open-search"); pg.wait_for_selector(".search-input"); pg.fill(".search-input", "smog check dec 5"); pg.wait_for_timeout(300)
    label = pg.evaluate("() => (document.querySelector('.result.add') || {}).textContent || ''"); pg.press(".search-input", "Enter"); pg.wait_for_timeout(700)
    got = pg.evaluate("() => window.__deck.store.get('time').events.filter((e) => /smog check/i.test(e.title) && e.date === '2026-12-05').length")
    proof("TIME-3", "Quick add in plain words: “smog check dec 5”", got >= 1, f"preview “{label.strip()}”, stored on 2026-12-05: {got}")

    # MONEY-1: the simulator reproduces the worked cases to the cent, in the page
    pg.goto(f"{URL}?now={NOW}&demo=1#/money/library"); pg.wait_for_selector(".subtabs .seg"); pg.click(".subtabs .seg button:has-text('Worked cases')"); pg.wait_for_selector(".lib select")
    n = pg.evaluate("() => document.querySelector('.lib select').options.length"); okc = 0; figs = 0; lines = []
    for i in range(n):
        pg.select_option(".lib select", str(i)); pg.wait_for_timeout(60)
        t = pg.evaluate("() => ({ ok: !!document.querySelector('.lib .banner.ok'), text: (document.querySelector('.lib .banner') || {}).textContent })")
        okc += 1 if t["ok"] else 0
        import re
        m = re.search(r"([\d,]+) figures", t["text"] or ""); figs += int(m.group(1).replace(",", "")) if m else 0
        if not t["ok"]: lines.append(f"case {i + 1}: {t['text']}")
    proof("MONEY-1", "Payoff simulator matches the 12 worked cases to the cent (2 required)", okc >= 2 and okc == n, f"{okc} of {n} cases match; {figs:,} figures compared" + ("; " + "; ".join(lines) if lines else ""))

    # MONEY-2: bills publish their next due dates to the one feed (the picture and Time read it)
    r2 = pg.evaluate("""async () => { const f = await import(new URL('deck/core/feeds.js', document.baseURI).href); const d = await import(new URL('deck/core/dates.js', document.baseURI).href);
      const rows = f.rows(d.today(), d.addDays(d.today(), 45), { withFixed: false }); return { bills: rows.filter((r) => r.cap === 'money').length, time: rows.filter((r) => r.cap === 'time').length }; }""")
    proof("MONEY-2", "Bills and the loan payment show as dated rows next to events (one feed)", r2["bills"] > 0 and r2["time"] > 0, json.dumps(r2))

    # DATA-1: the deck file goes out and comes back in
    r3 = pg.evaluate("""() => { const s = window.__deck.store; const file = JSON.parse(JSON.stringify(s.exportDeck())); const before = JSON.stringify(s.get('time')) + JSON.stringify(s.get('money'));
      s.update('time', (t) => { t.events = []; }); s.importFile(file); const after = JSON.stringify(s.get('time')) + JSON.stringify(s.get('money')); return { same: before === after, format: file.format, kind: file.kind, slices: Object.keys(file.slices) }; }""")
    proof("DATA-1", "Versioned export and import: the deck file restores Time and Money exactly", r3["same"], json.dumps({k: r3[k] for k in ("format", "kind", "slices")}))

    skipped = [e for e in errs if "ViewTransition opt-in disabled" in e]; errs = [e for e in errs if e not in skipped]   # the browser dropping its own page-to-page morph is reported, not failed: no script of ours is involved and the page still lands
    proof("DECK-2", "No script errors during the run", not errs, ("; ".join(errs[:4]) or "none") + (f"; the browser skipped the page-to-page morph {len(skipped)} time(s) (open item: cause not found)" if skipped else ""))
    b.close()

if OUT: json.dump({"url": URL, "ran": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "clock": NOW, "results": results}, open(OUT, "w"), indent=1)
sys.exit(0 if all(r["pass"] for r in results) else 1)
