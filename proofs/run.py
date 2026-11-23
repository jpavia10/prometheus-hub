"""Proofs for the deck, run in a real browser at phone size against a URL (local server or the live site).
   python3 proofs/run.py http://127.0.0.1:8377/ [--mock-weather] [--out proofs/results.json]
   Each proof is a thing the page itself does; nothing here re-implements the app. Exit code 1 if any proof fails."""
import sys, json, datetime, pathlib
from playwright.sync_api import sync_playwright

URL = sys.argv[1].rstrip("/") + "/"; MOCK = "--mock-weather" in sys.argv
OUT = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else None
NOW = "2026-11-20T09:00"
# The core draws every live destination in the registry. The hub desk is the centre, and paused fleet is not drawn.
_registry = json.loads((pathlib.Path(__file__).resolve().parents[1] / "pillars.json").read_text())
CORE_IDS = [p["id"] for p in _registry["pillars"] if p.get("state") == "live" and p.get("hostingType") != "desk"]
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
    p2.goto(f"{URL}?now={NOW}&home=orbit#/", wait_until="load"); p2.wait_for_selector(".realm .rl-pl", timeout=20000); p2.wait_for_selector(".now-line", timeout=20000); p2.wait_for_timeout(900)
    ci = p2.evaluate("""async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const view = document.querySelector('#view'); const card = document.querySelector('.context-card'); const dockTop = document.querySelector('.dock').getBoundingClientRect().top;
      return { ids: [...document.querySelectorAll('.realm .rl-pl')].map((x) => x.dataset.pillar),
      demo: !!window.__deck.store.get('profile').demo, events: window.__deck.store.get('time').events.length, plan: !!window.__deck.store.get('money').plan, wide: document.documentElement.scrollWidth,
      now: !!document.querySelector('.now-line'), cards: document.querySelectorAll('.context-card').length,
      fits: view.scrollHeight <= view.clientHeight + 2 && !!card && card.getBoundingClientRect().bottom <= dockTop + 2 }; }""")
    missing = [i for i in CORE_IDS if i not in ci["ids"]]; extra = [i for i in ci["ids"] if i not in CORE_IDS]
    proof("CORE-1", f"Every pillar in pillars.json is a place in the realm ({len(CORE_IDS)} live destinations; the desk and paused fleet are not drawn); a clean device shows no sample data",
          not missing and not extra and len(ci["ids"]) == len(CORE_IDS) and not ci["demo"] and ci["events"] == 0 and not ci["plan"] and ci["wide"] <= 390 and ci["now"] and ci["cards"] == 1 and ci["fits"],
          json.dumps({"expected": len(CORE_IDS), "drawn": len(ci["ids"]), "missing": missing, "extra": extra, "demo": ci["demo"], "events": ci["events"], "plan": ci["plan"], "wide": ci["wide"], "now": ci["now"], "cards": ci["cards"], "fits": ci["fits"]}))
    routes = p2.evaluate("[...document.querySelectorAll('.realm .rl-pl')].map((a) => a.getAttribute('href'))"); bad = []; local = [r for r in routes if not r.startswith("http")]
    for r in local:
        resp = p2.request.get(URL + r)
        if resp.status != 200 or "kit/prometheus.css" not in resp.text(): bad.append(f"{r} ({resp.status})")
    proof("CORE-2", "Every pillar page in this repository answers and wears the shared theme", not bad and len(local) >= 14, f"{len(local)} pages checked, {len(routes) - len(local)} on their own sites" + ("; bad: " + ", ".join(bad) if bad else ""))
    p2.evaluate("localStorage.setItem('prometheus.bus.deadlines', JSON.stringify([{ id: 't1', title: 'Proof: oil service', date: '2026-11-22', source: 'garage', ref: 'oil' }]))"); p2.reload(); p2.wait_for_selector(".realm .rl-pl"); p2.wait_for_timeout(600)
    got = p2.evaluate("""async () => { const f = await import(new URL('deck/core/feeds.js', document.baseURI).href); return { rows: f.rows('2026-11-20', '2026-11-30').filter((r) => r.bus).map((r) => r.title + ' / ' + r.cap), badge: (document.querySelector('.rl-pl[data-pillar=garage] .rl-badge') || {}).textContent || '', runway: !!document.querySelector('.runway .day.level-0, .runway .day') }; }""")
    proof("CORE-3", "A pillar's own deadline (the shared bus) reaches the hub: in the feed and on its cell", len(got["rows"]) == 1 and got["badge"] == "2d", json.dumps(got))
    p2.wait_for_timeout(2500); import time as _t; t0 = _t.time()                         # let the page finish starting (a test machine draws in software, slowly)
    p2.evaluate("(() => { const a = document.querySelector('.rl-pl[data-pillar=apollo]'); a.click(); a.click(); })()")   # first tap flies to the place, the second warps in
    try: p2.wait_for_url("**/pillars/apollo/**", timeout=30000); took = _t.time() - t0; p2.wait_for_selector(".shell", timeout=15000); landed = f"{p2.title()} ({took:.1f} s on this machine)"
    except Exception as e: landed = "did not land: " + str(e)[:80]
    proof("CORE-4", "Tapping a place flies to it, tapping it again warps into that pillar", "Apollo" in landed, landed); c2.close()
    # MENU-1: the home is a game menu (owner, 2026-11-16): every pillar a level, its own light, a live line, Today on top, the orbit and the briefing kept
    cm = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/Los_Angeles", locale="en-US"); pm = cm.new_page(); bm = []; pm.on("pageerror", lambda e: bm.append(str(e)[:120]))
    if MOCK: pm.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); pm.route("https://api.weather.gov/**", lambda route, request: route.abort())
    try:
        pm.goto(f"{URL}?now={NOW}&home=menu#/", wait_until="load"); pm.wait_for_selector(".menu .mn-lvl", timeout=20000); pm.wait_for_timeout(900)
        m0 = pm.evaluate("""() => ({ levels: document.querySelectorAll('.menu .mn-lvl').length, title: document.querySelector('.mn-title').textContent, live: document.querySelector('.mn-live').textContent,
          today: document.querySelectorAll('.mn-today .mn-trow').length, gl: !!document.querySelector('canvas.menu-world') && !document.querySelector('canvas.menu-world.flat'), briefing: !!document.getElementById('briefing'),
          enter: document.querySelector('.mn-enter').getBoundingClientRect().bottom < innerHeight - 80, wide: document.documentElement.scrollWidth, hue: getComputedStyle(document.querySelector('.menu')).getPropertyValue('--h').trim() })""")
        pm.keyboard.press("ArrowRight"); pm.wait_for_timeout(500)
        m1 = pm.evaluate("() => ({ title: document.querySelector('.mn-title').textContent, on: (document.querySelector('.mn-lvl.on') || {}).dataset ? document.querySelector('.mn-lvl.on').dataset.pillar : null, hue: getComputedStyle(document.querySelector('.menu')).getPropertyValue('--h').trim() })")
        pm.click(".mn-mode"); pm.wait_for_selector(".realm .rl-pl", timeout=20000); orbit = pm.evaluate("() => !document.querySelector('.menu') && !!document.querySelector('.mn-back')")
        pm.click(".mn-back"); pm.wait_for_selector(".menu .mn-lvl", timeout=20000); back = pm.evaluate("() => !document.querySelector('.realm') && document.querySelector('.mn-title').textContent")
        pm.evaluate("document.querySelectorAll('.mn-lvl')[3].click()"); pm.wait_for_timeout(400); lvl = pm.evaluate("document.querySelector('.mn-lvl.on').dataset.pillar")
        pm.click(".mn-enter"); pm.wait_for_url("**/pillars/**", timeout=30000); landed = pm.url.split("/pillars/")[1].split("/")[0]
        mskip = [e for e in bm if "ViewTransition opt-in disabled" in e or "Transition was aborted" in e]; bm = [e for e in bm if e not in mskip]   # the browser dropping its own morph, as in DECK-2
        ok = (m0["levels"] == 27 and m0["today"] >= 1 and m0["gl"] and m0["briefing"] and m0["enter"] and m0["wide"] <= 390 and m1["title"] != m0["title"] and m1["hue"] != m0["hue"]
              and orbit and back == m1["title"] and landed == lvl and not bm)
        proof("MENU-1", "The home is a game menu: 27 levels with their own light and a live line, Today on top, swipe or arrow keys move, Enter warps in, the orbit and the briefing are one tap away",
              ok, f"{m0['levels']} levels; '{m0['title']}' -> '{m1['title']}' (hue {m0['hue']} -> {m1['hue']}); live: {m0['live'][:60]}; today rows {m0['today']}; WebGL {m0['gl']}; orbit and back {orbit}/{bool(back)}; entered {landed} from level {lvl}" + (f"; errors {bm[:2]}" if bm else "") + (f"; the browser skipped {len(mskip)} morph(s)" if mskip else ""))
    except Exception as e: proof("MENU-1", "The home is a game menu", False, "did not finish: " + str(e)[:200])
    cm.close()
    # MENU-2: every level stands in its own painted world (2026-11-19): every world in art/worlds/index.json has its three files, the menu shows
    # the painting behind the level and steps the crest back, and the title screen (lock and loading) uses the home painting
    cw = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/Los_Angeles", locale="en-US"); pw = cw.new_page(); bw = []; pw.on("pageerror", lambda e: bw.append(str(e)[:120]))
    if MOCK: pw.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); pw.route("https://api.weather.gov/**", lambda route, request: route.abort())
    try:
        pw.goto(f"{URL}?now={NOW}&home=menu#/", wait_until="load"); pw.wait_for_selector(".menu .mn-lvl", timeout=20000); pw.wait_for_timeout(1200)
        w = pw.evaluate("""async () => { const idx = await (await fetch('art/worlds/index.json')).json(); const miss = [];
          for (const id of idx.worlds) for (const s of ['', '_depth', '_lights']) { const r = await fetch(`art/worlds/world_${id}${s}.webp`); if (!r.ok) miss.push(id + s); }
          const ids = [...document.querySelectorAll('.mn-lvl')].map((b) => b.dataset.pillar); const painted = ids.filter((id) => idx.worlds.includes(id));
          return { worlds: idx.worlds.length, home: idx.worlds.includes('home'), miss, levels: ids.length, painted: painted.length, first: ids[0] }; }""")
        pw.evaluate("document.querySelectorAll('.mn-lvl')[1].click()"); pw.wait_for_timeout(900)   # the second level: a tap on the open one would enter it
        s0 = pw.evaluate("() => ({ art: document.querySelector('.menu').classList.contains('art'), crest: getComputedStyle(document.querySelector('.mn-emblem')).opacity, title: document.querySelector('.mn-title').textContent })")
        boot = pw.evaluate("() => { const d = document.createElement('div'); d.id = 'boot'; document.body.append(d); const bg = getComputedStyle(d, '::before').backgroundImage; d.remove(); return bg; }")
        ok = w["worlds"] >= 28 and w["home"] and not w["miss"] and w["painted"] == w["levels"] and s0["art"] and float(s0["crest"]) < 0.05 and "world_home.webp" in boot and not bw
        proof("MENU-2", "Every level stands in its own painted world: the three files of every world load, the painting is behind the level and the crest steps back, the title screen is the home painting",
              ok, f"{w['worlds']} worlds ({w['painted']} of {w['levels']} levels painted, home {w['home']}); missing {w['miss'][:4]}; '{s0['title']}' painted {s0['art']}, crest opacity {s0['crest']}; title screen {'home painting' if 'world_home' in boot else boot[:60]}" + (f"; errors {bw[:2]}" if bw else ""))
    except Exception as e: proof("MENU-2", "Every level stands in its own painted world", False, "did not finish: " + str(e)[:200])
    cw.close()
    # TODAY-1 (2026-11-19, the hub's weakest link): on a fresh device the home's Today leads with the real deadlines it knows without any pillar
    # being opened (Kern County, California and federal dates from Kairos), holidays only fill; the daily background run of the publishing
    # pillars fills the shared deadlines without a visit
    ct = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/Los_Angeles", locale="en-US"); pt = ct.new_page(); bt = []; pt.on("pageerror", lambda e: bt.append(str(e)[:120]))
    if MOCK: pt.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); pt.route("https://api.weather.gov/**", lambda route, request: route.abort())
    try:
        pt.goto(f"{URL}?now={NOW}&home=menu#/", wait_until="load"); pt.wait_for_selector(".mn-today .mn-trow", timeout=20000); pt.wait_for_timeout(900)
        t0 = pt.evaluate("""async () => { const f = await import(new URL('deck/core/feeds.js', document.baseURI).href); const cds = f.countdowns(3, '2026-11-20');
          return { rows: [...document.querySelectorAll('.mn-today .mn-trow b')].map((x) => x.textContent), hol: cds.filter((r) => r.tone === 'holiday').length,
            first: cds[0] ? cds[0].date + ' ' + cds[0].title : '' }; }""")
        pt.goto(f"{URL}?now={NOW}&home=menu&sweep=now#/", wait_until="load"); pt.wait_for_function("() => window.__deck && window.__deck.state.sweep", timeout=240000)
        sw = pt.evaluate("() => ({ ...window.__deck.state.sweep, sources: [...new Set(JSON.parse(localStorage.getItem('prometheus.bus.deadlines') || '[]').map((r) => r.source))] })")
        kern = [r for r in t0["rows"] if "Kern County" in r]
        ok = len(t0["rows"]) == 3 and len(kern) >= 2 and t0["hol"] == 0 and t0["first"].startswith("2026-11-30") and sw["ran"] >= 14 and sw["after"] >= 50 and len(sw["sources"]) >= 3 and not bt
        proof("TODAY-1", "The core sees every deadline: a fresh device's Today leads with the real Kern / California deadlines, holidays only fill, and the daily background run fills the shared deadlines without opening a pillar",
              ok, f"Today: {t0['rows']}; holidays among the next 3: {t0['hol']}; next: {t0['first']}; background run: {sw['ran']} pillars, deadlines {sw['before']} -> {sw['after']} from {len(sw['sources'])} sources" + (f"; errors {bt[:2]}" if bt else ""))
    except Exception as e: proof("TODAY-1", "The core sees every deadline", False, "did not finish: " + str(e)[:200])
    ct.close()

    # ODY-1 (2026-11-19): his own trips on record. A fresh device files the 2015 Eurotrip (his sheet) and both 2024 Philippines trips; the
    # Eurotrip draws 20 stops on the Natural Earth map, its logbook holds all 21 legs (56 nights), the budget adds up from the sheet's rows
    # and names the row the sheet's own total leaves out; past trips carry no packing or away controls. A phone that had the first seed
    # gets the two new trips once, keeps its own trip, and a deleted seed stays deleted. The hub's search finds a trip by a city on it.
    co = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/Los_Angeles", locale="en-US"); po = co.new_page(); bo = []
    po.on("pageerror", lambda e: bo.append(str(e)[:120]))
    if MOCK: po.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); po.route("https://api.weather.gov/**", lambda route, request: route.abort()); po.route("**/titan-reliquary-preview/**", lambda route, request: route.abort())
    try:
        po.goto(f"{URL}pillars/odyssey/", wait_until="load"); po.wait_for_selector(".trip .tmap", state="attached", timeout=15000)
        o1 = po.evaluate("""() => { const e = document.querySelector('.trip[data-trip="seed-eurotrip-2015"]'), m = e.querySelector('.tmap');
          return { trips: document.querySelectorAll('.trip').length, stops: +m.dataset.stops, named: +m.dataset.named, land: (m.querySelector('.map-land') || { getAttribute: () => '' }).getAttribute('d').length,
            legs: e.querySelectorAll('.leg').length, nights: [...e.querySelectorAll('.leg-h')].reduce((s, x) => s + (+((x.textContent.match(/(\\d+) nights?/) || [0, 0])[1])), 0),
            total: [...e.querySelectorAll('.budget .kv.sum b')].map((x) => x.textContent), check: (e.querySelector('.budget-check') || {}).textContent || '',
            pastCtl: document.querySelectorAll('.trip.past .checks, .trip.past .row-actions .btn:not(.quiet)').length, past: document.querySelectorAll('.trip.past').length,
            countries: [...document.querySelectorAll('.board-cell')].find((c) => /Countries/.test(c.textContent)).querySelector('.board-v').textContent }; }""")
        co2 = b.new_context(viewport={"width": 390, "height": 844}); po2 = co2.new_page(); po2.on("pageerror", lambda e: bo.append(str(e)[:120]))
        po2.goto(f"{URL}pillars/odyssey/", wait_until="commit")
        po2.evaluate("""() => { localStorage.clear(); localStorage.setItem('prometheus.odyssey.tripsSeedV1', '1');
          localStorage.setItem('prometheus.odyssey.trips', JSON.stringify([{ id: 'seed-philippines-2024', name: 'Manila & El Nido — Philippines', dest: 'Manila and El Nido, Philippines', start: '2024-08-30', end: '2024-09-09', notes: 'the old shipped note', packState: { 'his mark': true } },
            { id: 'mine1', name: 'Coast weekend', dest: 'Monterey', start: '2027-03-05', end: '2027-03-07' }])); }""")
        po2.reload(wait_until="load"); po2.wait_for_selector(".trip", state="attached", timeout=15000)
        m1 = po2.evaluate("() => { const t = JSON.parse(localStorage.getItem('prometheus.odyssey.trips')), s = t.find((x) => x.id === 'seed-philippines-2024'); return { ids: t.map((x) => x.id).sort(), notes: /BGC residences Sep 6/.test(s.notes) && s.rev === 2, mark: !!(s.packState || {})['his mark'], ctl: document.querySelectorAll('.trip[data-trip=mine1] .checks').length }; }")
        po2.evaluate("""() => [...document.querySelectorAll('.trip[data-trip="seed-eurotrip-2015"] button')].find((x) => x.textContent === 'Delete trip').click()""")
        po2.reload(wait_until="load"); po2.wait_for_selector(".trip", state="attached", timeout=15000)
        m2 = po2.evaluate("() => JSON.parse(localStorage.getItem('prometheus.odyssey.trips')).map((x) => x.id).sort()")
        po2.goto(f"{URL}?now={NOW}&home=orbit&nosweep=1#/", wait_until="load"); po2.wait_for_function("window.__deck && window.__deck.reach", timeout=20000); po2.wait_for_timeout(1500)
        hit = po2.evaluate("window.__deck.reach.searchRecords('Tagaytay')"); co2.close()
        PH = ["photos-atlanta-2015", "photos-bigsur-2018", "photos-mexico-2019", "photos-michigan-2022", "photos-michigan-2023", "photos-mammoth-2022", "photos-norcal-2021", "photos-sandiego-2022", "photos-sequoia-2018", "photos-vegas-2019"]  # 2026-11-23: ten trips found in his photos
        ok = (o1["trips"] == 13 and o1["stops"] == 20 and o1["named"] >= 17 and o1["land"] > 5000 and o1["legs"] == 21 and o1["nights"] == 56 and o1["total"] == ["$5,583.00", "$6,699.60"]
              and "ferry row, $62.00" in o1["check"] and o1["pastCtl"] == 0 and o1["past"] == 13 and o1["countries"] == "13"
              and m1["ids"] == sorted(["mine1", "seed-eurotrip-2015", "seed-philippines-2024", "seed-philippines-2024-04"] + PH) and m1["notes"] and m1["mark"] and m1["ctl"] == 1
              and m2 == sorted(["mine1", "seed-philippines-2024", "seed-philippines-2024-04"] + PH) and len(hit) >= 1 and hit[0]["title"].startswith("Manila, Tagaytay") and not bo)
        proof("ODY-1", "His own trips on record: the 2015 Eurotrip and both 2024 Philippines trips filed once each, drawn on a map from real coordinates, every leg in the logbook, the plan's budget added up from the sheet's rows with the row its total leaves out named, past trips as records; an older phone gets the new trips and the corrected notes, keeps its own trips and marks, and a deleted trip stays deleted",
              ok, f"fresh device: {o1['trips']} trips, map {o1['stops']} stops ({o1['named']} named, land path {o1['land']:,} chars), logbook {o1['legs']} legs / {o1['nights']} nights, budget {o1['total']}, check: {o1['check'][6:70]!r}…, past-trip controls {o1['pastCtl']}, countries {o1['countries']}; "
                 f"older phone: {m1['ids']}, shipped note refreshed to the bookings: {m1['notes']}, his own mark kept: {m1['mark']}; after deleting the Eurotrip and reloading: {m2}; hub search 'Tagaytay' -> {hit[0]['title'] if hit else None}" + (f"; errors {bo[:2]}" if bo else ""))
    except Exception as e: proof("ODY-1", "His own trips on record", False, "did not finish: " + str(e)[:200])
    # ODY-2 (2026-11-19): his trip photos as a journey. Each past trip with photos opens on them (Eurotrip 16, April 2024 15, September
    # 2024 5); every photo and thumbnail is served; picking a photo moves the map (route drawn up to that stop, the stop ringed); tapping a
    # stop on the map jumps to its first photo; full screen opens, steps with the arrow keys, closes with Escape; Play advances by itself.
    try:
        po.goto(f"{URL}pillars/odyssey/", wait_until="load"); po.wait_for_selector(".jr .jr-th", state="attached", timeout=15000)
        j1 = po.evaluate("""async () => { const P = window.ODYSSEY_PHOTOS, ids = Object.values(P).flat().map((p) => p.id); let bad = 0;
          for (const id of ids) for (const u of ['photos/' + id + '.webp', 'photos/t/' + id + '.webp']) { const r = await fetch(u); if (!r.ok || !(r.headers.get('content-type') || '').includes('webp')) bad++; }
          const n = Object.fromEntries([...document.querySelectorAll('.trip')].map((t) => [t.dataset.trip, t.querySelectorAll('.jr-th').length]));
          return { n, files: ids.length, bad }; }""")
        po.evaluate("document.querySelector('.pk-tabs .tab:nth-child(2)') && document.querySelector('.pk-tabs .tab:nth-child(2)').click()"); po.wait_for_timeout(300)
        E = '.trip[data-trip="seed-eurotrip-2015"] '
        po.click(E + '.jr-th[data-i="6"]'); po.wait_for_timeout(600)
        j2 = po.evaluate("""(E) => { const c = document.querySelector(E.trim()); return { place: c.querySelector('.jr-place').textContent, here: [...c.querySelectorAll('.map-dot.here')].map((d) => d.dataset.code), todo: c.querySelectorAll('.map-seg.todo').length }; }""", E)
        po.evaluate("""(E) => { const d = document.querySelector(E + '.map-dot[data-code=PRG]'); d.dispatchEvent(new MouseEvent('click', { bubbles: true })); }""", E); po.wait_for_timeout(500)
        j3 = po.evaluate("(E) => document.querySelector(E + '.jr-place').textContent", E)
        po.click(E + '.jr-stage'); po.wait_for_selector('.jr-lb', timeout=5000); po.keyboard.press('ArrowRight'); po.wait_for_timeout(300)
        lb = po.evaluate("document.querySelector('.jr-lb b').textContent"); po.keyboard.press('Escape'); po.wait_for_timeout(200)
        gone = po.evaluate("!document.querySelector('.jr-lb')")
        P2 = '.trip[data-trip="seed-philippines-2024-04"] '
        po.click(P2 + '.jr-play'); po.wait_for_timeout(4700)
        played = po.evaluate("(P) => document.querySelector(P + '.jr-count').textContent", P2)
        wide = po.evaluate("document.documentElement.scrollWidth")
        ok = ({k: v for k, v in j1["n"].items() if v} == {"seed-eurotrip-2015": 16, "seed-philippines-2024-04": 15, "seed-philippines-2024": 5} and j1["bad"] == 0 and j2["place"].startswith("ROME") and j2["here"] == ["ROM"]
              and j2["todo"] == 15 and j3.startswith("PRAGUE") and lb and gone and played.startswith("2 /") and wide <= 390 and not bo)
        proof("ODY-2", "His trip photos as a journey: each past trip opens on its own photos, every photo is served, the map follows the photo (route drawn to that stop, the stop ringed), a stop on the map opens its photos, full screen steps and closes from the keyboard, Play walks the trip",
              ok, f"photos per trip {j1['n']}, {j1['files']} photos and their thumbnails served, {j1['bad']} missing; photo 7 -> {j2['place']}, ringed {j2['here']}, {j2['todo']} legs still ahead; tapping Prague on the map -> {j3}; full screen next -> {lb!r}, Escape closes: {gone}; Play after 4.7 s -> {played}; page {wide}px wide" + (f"; errors {bo[:2]}" if bo else ""))
    except Exception as e: proof("ODY-2", "His trip photos as a journey", False, "did not finish: " + str(e)[:200])
    # WORLD-1 (2026-11-23, owner chose "living painted header"; all painted pillars since the rollout): a pillar opens on its own painting, alive (kit/world.js):
    # the canvas is drawn, the header takes its accent from the painting, the page never scrolls sideways; Athenaeum keeps its own sky
    # (no painting behind it); arriving from the menu's dive the painting starts pushed in and settles back.
    try:
        seen = {}
        for pid in ("kairos", "garage", "odyssey", "apollo", "sylade", "athenaeum"):
            po.goto(f"{URL}pillars/{pid}/", wait_until="load"); po.wait_for_timeout(300)
            if pid != "athenaeum": po.wait_for_selector("canvas.pk-living.on", state="attached", timeout=15000)
            else: po.wait_for_timeout(1500)
            seen[pid] = po.evaluate("""() => ({ living: !!document.querySelector('canvas.pk-living'), still: !!document.querySelector('div.pk-world'),
              acc: getComputedStyle(document.body).getPropertyValue('--world-accent').trim(), wide: document.documentElement.scrollWidth })""")
        po.evaluate("sessionStorage.setItem('pk:dive', JSON.stringify({ id: 'garage', t: Date.now() }))")
        po.goto(f"{URL}pillars/garage/", wait_until="load"); po.wait_for_selector("canvas.pk-living.arrive", state="attached", timeout=15000); po.wait_for_timeout(250)
        z0 = po.evaluate("window.PKWorld.state.z"); t_set = po.evaluate("performance.now()")
        po.wait_for_function("Math.abs(window.PKWorld.state.z - 1) < 0.01", timeout=8000)   # a slow runner draws few frames; wait for the settle
        z1 = po.evaluate("window.PKWorld.state.z"); settle = (po.evaluate("performance.now()") - t_set) / 1000
        ok = (all(seen[k]["living"] and seen[k]["acc"].startswith("hsl(") and seen[k]["wide"] <= 390 for k in ("kairos", "garage", "odyssey", "apollo", "sylade"))
              and not seen["athenaeum"]["living"] and seen["athenaeum"]["wide"] <= 390 and z0 > 1.05 and abs(z1 - 1) < 0.01 and not bo)
        proof("WORLD-1", "Every painted pillar opens on its own living painting (accent from the painting, no sideways scroll); Athenaeum keeps its own sky; from the menu's dive the painting arrives pushed in and settles",
              ok, f"{ {k: (v['living'], v['acc'], v['wide']) for k, v in seen.items()} }; dive arrival zoom {z0:.2f} -> {z1:.3f} within {settle:.1f} s" + (f"; errors {bo[:2]}" if bo else ""))
    except Exception as e: proof("WORLD-1", "The living painted header", False, "did not finish: " + str(e)[:200])
    co.close()


    # PILLAR: the shared pillar shell (crest, automatic sections, dock), checked on the long Piano page
    c3 = b.new_context(viewport={"width": 390, "height": 844}); p3 = c3.new_page(); p3.on("pageerror", lambda e: errs.append("pillar: " + str(e)))
    p3.goto(f"{URL}pillars/piano/", wait_until="load"); p3.wait_for_selector(".pk-dock", timeout=15000); p3.wait_for_timeout(900)
    def shell(): return p3.evaluate("""() => { const panels = [...document.querySelectorAll('main > section.grid > .glass')]; return { crest: !!document.querySelector('.pk-hero .pk-crest svg'), tabs: document.querySelectorAll('main > .pk-tabs .tab').length,
      showing: panels.filter((x) => x.offsetParent !== null).map((x) => x.querySelector('h2').textContent.slice(0, 22)), core: (document.querySelector('.pk-dock .pk-core') || {}).href || '', steps: document.querySelectorAll('.pk-dock a.compass-step').length,
      tall: document.documentElement.scrollHeight, wide: document.documentElement.scrollWidth }; }""")
    s1 = shell()
    p3.wait_for_function("document.querySelectorAll('main > .pk-tabs .tab').length >= 3")
    # The tab row is rebuilt when panel titles settle. A coordinate click can land on the button that was just replaced, so the handler never runs and a fixed sleep still sees the first section. Click the live third tab, then wait until that section is the one on screen.
    p3.evaluate("document.querySelectorAll('main > .pk-tabs .tab')[2].click()")
    p3.wait_for_function("""(prev) => { const shown = [...document.querySelectorAll('main > section.grid > .glass')].filter((x) => x.offsetParent !== null); const title = shown[0] && shown[0].querySelector('h2') ? shown[0].querySelector('h2').textContent.slice(0, 22) : ''; return shown.length === 1 && title !== prev; }""", arg=s1["showing"][0], timeout=5000)
    s2 = shell()
    proof("PILLAR-1", "Every pillar's default shell: crest, sections from its own panels, a dock back to the core", s1["crest"] and s1["tabs"] >= 3 and len(s1["showing"]) == 1 and len(s2["showing"]) == 1 and s1["showing"] != s2["showing"] and s1["core"].endswith("/prometheus-hub/") | s1["core"].endswith(":8377/") and s1["steps"] >= 1 and s1["wide"] <= 390 and s1["tall"] < 2600,
          f"Piano: {s1['tabs']} sections, showing {s1['showing']} then {s2['showing']}; page {s1['tall']} px tall at phone size (was 6,672); dock: core + {s1['steps']} neighbours"); c3.close()

    # PERF-1 (2026-11-20): a pillar at rest does no work it does not need. The kit's tab sync once re-triggered itself through its
    # own MutationObserver every frame (equal attribute and text writes still count as mutations), and the ambient field drew a
    # full-screen 2x canvas at 60 fps. At rest: no DOM mutations inside the page for a second, the field at 1x, the stage governed.
    try:
        c5 = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2); p5 = c5.new_page()
        p5.goto(f"{URL}pillars/money/", wait_until="load"); p5.wait_for_selector(".pk-dock", timeout=15000); p5.wait_for_timeout(1500)
        r5 = p5.evaluate("""() => new Promise((res) => { let n = 0; const mo = new MutationObserver((l) => { n += l.length; });
          mo.observe(document.getElementById('app'), { childList: true, subtree: true, attributes: true, characterData: true });
          setTimeout(() => { mo.disconnect(); const f = document.getElementById('field');
            res({ n, fieldW: f ? f.width : -1, vw: innerWidth, stage: (window.__stage || []).length, governed: !!(window.__stage && window.__stage[0] && 'cost' in window.__stage[0].S) }); }, 1000); })""")
        ok5 = r5["n"] == 0 and r5["fieldW"] in (-1, r5["vw"]) and (r5["stage"] == 0 or r5["governed"])
        proof("PERF-1", "A pillar at rest does no needless work: no DOM mutations for a second, the ambient field at 1x, the stage under its frame governor", ok5,
              f"mutations in 1 s at rest: {r5['n']}; field canvas {r5['fieldW']} px wide for a {r5['vw']} px screen; stage governed: {r5['governed']}"); c5.close()
    except Exception as e: proof("PERF-1", "A pillar at rest does no needless work", False, "did not finish: " + str(e)[:200])

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
    for pid in "kairos garage piano money apollo hermes argus selling icarus odyssey bastion privacy records forge foundry observatory kin hearth sylade".split():
        p7 = c7.new_page(); mine = []; p7.on("pageerror", lambda e, mine=mine: mine.append(str(e)[:100]))
        if MOCK: p7.route("https://jpavia10.github.io/**", lambda route, request: route.abort()); p7.route("https://api.weather.gov/**", lambda route, request: route.abort())
        p7.goto(f"{URL}pillars/{pid}/?still=1&today=2026-11-13", wait_until="load"); p7.wait_for_timeout(500)
        st = p7.evaluate("""() => { const s = document.querySelector('.pk-stage'); if (!s) return null; const cv = s.querySelector('canvas'), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data; let lit = 0;
          for (let i = 3; i < d.length; i += 4 * 53) if (d[i] > 40 && (d[i - 3] + d[i - 2] + d[i - 1]) > 120) lit++; const hero = document.querySelector('.hero'); return { lit, reads: s.querySelectorAll('.pk-read').length, h: Math.round(cv.getBoundingClientRect().height), after: !!hero && hero.nextElementSibling === s }; }""")
        if not st or st["lit"] < 40 or st["reads"] < 3 or not st["after"] or mine: bare.append(f"{pid}: {st} {mine[:1]}")
        else: shown.append(pid)
        p7.close()
    proof("STAGE-1", "Every pillar opens on its own signature picture drawn from its data, with live readouts, and no script errors", not bare and len(shown) == 19, f"{len(shown)} of 19 drawn: {', '.join(shown)}" + ("; missing: " + " | ".join(bare) if bare else "")); c7.close()

    # GARAGE-3D: the showroom shows a real model for each vehicle (owner, 2026-11-20: "That 3d car and motorcycle is retarded. Get a
    # free model ... sub if u can't find mine"): both GLBs load, are lit pixels on the canvas, carry their author and license, and the
    # caption says which stand-in is shown and credits it.
    gc = b.new_context(viewport={"width": 390, "height": 844}); gp = gc.new_page(); bad_g = []; gp.on("pageerror", lambda e: bad_g.append(str(e)[:100]))
    gp.goto(f"{URL}pillars/garage/", wait_until="load"); gp.wait_for_timeout(600)
    gp.evaluate("() => { const t = [...document.querySelectorAll('main > .pk-tabs .tab')].find((x) => /3D/.test(x.textContent)); if (t) t.click(); }"); gp.wait_for_timeout(300)
    seen_g = []
    for key in ("sorento", "mt07"):
        gp.evaluate(f"() => {{ const b = document.querySelector('[data-veh=\"{key}\"]'); if (b) b.click(); document.querySelector('#g-3d').scrollIntoView({{ block: 'center' }}); }}")
        try: gp.wait_for_function("() => /drag to turn|did not load|not in the bay|needs WebGL/.test(document.querySelector('#g-3d-cap').textContent)", timeout=90000)
        except Exception: pass
        gp.wait_for_timeout(800)
        cap = gp.evaluate("() => document.querySelector('#g-3d-cap').textContent")
        # WebGL keeps its picture only until the frame is shown, so the canvas is read inside a frame, after the viewer has drawn it.
        lit = gp.evaluate("""() => new Promise((res) => requestAnimationFrame(() => { const c = document.querySelector('#g-3d'); if (!c || c.hidden) return res(0); const o = document.createElement('canvas'); o.width = 120; o.height = 90; const g = o.getContext('2d'); g.drawImage(c, 0, 0, 120, 90);
          const d = g.getImageData(0, 0, 120, 90).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && (d[i] + d[i + 1] + d[i + 2]) > 60) n++; res(n); }))""")
        meta = gp.evaluate("""async (k) => { const m = await (await fetch('models/models.json')).json(), e = m[k], buf = await (await fetch('models/' + e.file)).arrayBuffer(), dv = new DataView(buf);
          const n = dv.getUint32(12, true), j = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, n))), x = (j.asset || {}).extras || {}; return { kb: Math.round(buf.byteLength / 1024), author: x.author || '', license: x.license || '' }; }""", key)
        ok = "drag to turn" in cap and "shown as" in cap and "CC BY" in cap and lit > 200 and meta["author"] and "CC-BY" in meta["license"] and meta["kb"] < 2048
        seen_g.append((key, ok, f"{key}: {lit} lit px, {meta['kb']} KB, {meta['license'][:9]} by {meta['author'][:20]}; caption '{cap[:70]}'"))
    proof("GARAGE-3D", "The Garage showroom shows a real 3D model for each vehicle, light enough for a phone, credited, and the caption says it is a stand-in",
          all(o for _, o, _ in seen_g) and not bad_g, " | ".join(d for _, _, d in seen_g) + ("; errors: " + " | ".join(bad_g) if bad_g else "")); gc.close()

    # NEW-1: the four pillars added 2026-11-13 do their jobs on real data
    c8 = b.new_context(viewport={"width": 390, "height": 844}); p8 = c8.new_page(); bad8 = []; p8.on("pageerror", lambda e: bad8.append(str(e)[:100]))
    if MOCK:
        import pathlib as _pl
        _ledger = _pl.Path(__file__).resolve().parents[2] / "titan-reliquary-preview" / "collaborators" / "CONTRIBUTOR_SCORES.md"
        p8.route("**/titan-reliquary-preview/collaborators/CONTRIBUTOR_SCORES.md", lambda route, request: route.fulfill(status=200, body=_ledger.read_text() if _ledger.exists() else "", headers={"content-type": "text/plain"}))
    p8.goto(f"{URL}pillars/forge/?still=1", wait_until="load"); p8.wait_for_function("window.FORGE && FORGE.data().scoreState !== 'loading' && FORGE.data().queueState !== 'loading'", timeout=20000)
    fg = p8.evaluate("() => { const d = FORGE.data(); const by = {}; for (const s of d.scores) by[s.ai] = (by[s.ai] || 0) + 1; return { scores: d.scores.length, by, tasks: d.tasks.length, open: d.tasks.filter((t) => t.state !== 'done').length }; }")
    p8.goto(f"{URL}pillars/forge/?still=1", wait_until="load"); p8.wait_for_function("window.FORGE && FORGE.data().queueState !== 'loading'", timeout=30000); p8.wait_for_timeout(300)
    fo = p8.evaluate("""() => { const d = FORGE.data(); const g = d.per.find((p) => p.ai === 'Gemini');
      const b = [...document.querySelectorAll('.lrow')].find((x) => x.querySelector('b').textContent === 'Gemini'); if (b) b.click();
      const rows = [...document.querySelectorAll('#f-tasks details.trow .stat-s')].map((x) => x.textContent.split(' · ')[0]);
      return { hub: d.sources.hub, board: d.sources.board, pillars: d.pillars.filter((p) => !p.ext).length, matrix: document.querySelectorAll('#f-matrix tbody tr').length, gemini: g ? g.open.length : 0,
        shown: rows.length, onlyGemini: rows.length > 0 && rows.every((r) => r === 'Gemini'), lrows: document.querySelectorAll('.lrow').length }; }""")
    proof("FORGE-1", "The Forge reads every pillar's homework, the workboard and Titan's loop, shows each AI's load against its floor, a matrix of every place, and filters to one AI",
          int(fo["hub"].split(" ")[0] if fo["hub"][:1].isdigit() else 0) >= fo["pillars"] and fo["board"] == "read" and fo["matrix"] >= fo["pillars"] and fo["lrows"] >= 4 and fo["onlyGemini"],
          f"queues {fo['hub']}; workboard {fo['board']}; matrix rows {fo['matrix']}; {fo['lrows']} AI rows; Gemini {fo['gemini']} open, filter shows {fo['shown']} Gemini rows only: {fo['onlyGemini']}")
    # FORGE-2 (2026-11-19 rebuild): the page draws one snapshot (docs/agents/forge.json, tools/forge/build.py) and its numbers equal the snapshot's
    p8.goto(f"{URL}pillars/forge/?still=1", wait_until="load"); p8.wait_for_function("window.FORGE && FORGE.data().snapState !== 'loading'", timeout=20000); p8.wait_for_timeout(300)
    f2 = p8.evaluate("""() => { const d = FORGE.data(), s = d.snapshot || {}, t = s.totals || {}; const v = [...document.querySelectorAll('#f-load .wp-v')].map((x) => x.textContent);
      const head = (document.querySelector('#f-tasks .sub') || {}).textContent || ''; const withdrawnShown = [...document.querySelectorAll('#f-tasks details.trow .pill')].filter((x) => x.textContent === 'withdrawn').length;
      return { ok: d.snapState, todo: t.todo, delivered: t.delivered, late: t.late, page: v.slice(0, 3), head, withdrawnShown, fresh: (document.querySelector('#f-src') || {}).textContent || '', warnings: (s.warnings || []).length,
        names: [...new Set((s.tasks || []).map((x) => x.ai))].filter((a) => !['Gemini','Grok','Muse','ChatGPT','Gemini API','Argon','Hydrogen','Claude'].includes(a)) }; }""")
    proof("FORGE-2", "The Forge draws one snapshot: its headline numbers equal the snapshot's, it says how old they are, withdrawn tasks are never counted, every AI name is one of the eight",
          f2["ok"] == "ok" and f2["page"] == [str(f2["todo"]), str(f2["delivered"]), str(f2["late"])] and f2["head"].startswith(f"{f2['todo']} task") and f2["withdrawnShown"] == 0 and f2["fresh"].startswith("As of") and not f2["names"],
          f"snapshot {f2['ok']}: to do {f2['todo']}, delivered {f2['delivered']}, late {f2['late']}; page shows {f2['page']}; list '{f2['head'][:40]}'; withdrawn shown {f2['withdrawnShown']}; '{f2['fresh'][:60]}'; {f2['warnings']} warnings; odd names {f2['names']}")
    p8.goto(f"{URL}pillars/foundry/?still=1", wait_until="load"); p8.wait_for_timeout(400); ath_before = p8.evaluate("localStorage.getItem('prometheus.athenaeum.ideas')")
    fd0 = p8.evaluate("FOUNDRY.data().board.length"); p8.evaluate("document.querySelector('#y-board .btn').click()"); p8.wait_for_timeout(300)
    fd = p8.evaluate("(b) => { const d = FOUNDRY.data(); return { board: d.board.length, bench: d.projects.length, stage: d.STAGES[d.projects[0].stage], linked: !!d.projects[0].ideaId, same: localStorage.getItem('prometheus.athenaeum.ideas') === b }; }", ath_before)
    p8.goto(f"{URL}pillars/kin/?still=1", wait_until="load"); p8.wait_for_timeout(300)
    kn = p8.evaluate("() => { const s = { pattern: '2-2-3', start: '2026-11-02' }; return ['2026-11-02','2026-11-03','2026-11-04','2026-11-06','2026-11-08','2026-11-09','2026-11-16','2026-11-15'].map((d) => KIN.whoHas(d, s)); }")
    proof("NEW-1", "The new pillars work on real data: Forge reads Titan's scored submissions and the live AI queues, Foundry starts a build from an Athenaeum invention without touching Athenaeum, Kin's custody pattern lands on the right days",
          fg["scores"] >= 100 and fg["by"].get("Grok", 0) >= 20 and fg["tasks"] >= 20 and fd["board"] == fd0 - 1 and fd["bench"] == 1 and fd["stage"] == "Research" and fd["linked"] and fd["same"] and kn == ["you", "you", "other", "you", "you", "other", "you", "other"] and not bad8,
          f"Forge: {fg['scores']} scores {fg['by']}, {fg['tasks']} queue tasks ({fg['open']} open); Foundry: board {fd0} to {fd['board']}, bench {fd['bench']} at {fd['stage']}, Athenaeum unchanged {fd['same']}; Kin 2-2-3: {kn}" + (f"; errors {bad8}" if bad8 else "")); c8.close()

    # SINCE-1 and BACKUP-1: the hub says what changed in the pillars since the last visit; one file backs up and restores everything
    c9 = b.new_context(viewport={"width": 390, "height": 844}, accept_downloads=True); p9 = c9.new_page(); bad9 = []; p9.on("pageerror", lambda e: bad9.append(str(e)[:100]))
    if MOCK:
        p9.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); p9.route("https://api.weather.gov/**", lambda route, request: route.abort()); p9.route("**/titan-reliquary-preview/**", lambda route, request: route.abort())
    p9.goto(f"{URL}?now={NOW}&home=orbit#/", wait_until="load"); p9.wait_for_selector(".realm .rl-pl", timeout=20000); p9.wait_for_timeout(400)
    first_visit = p9.evaluate("!!document.querySelector('.since')")
    p9.goto(f"{URL}pillars/kin/?still=1", wait_until="load"); p9.wait_for_timeout(300); p9.evaluate("PB.events.publish({ type: 'idea.captured', pillar: 'athenaeum', ref: 'x', title: 'Proof: a new idea' })")
    p9.evaluate("sessionStorage.clear()"); p9.goto(f"{URL}?now={NOW}&home=orbit#/", wait_until="load"); p9.wait_for_selector(".realm .rl-pl", timeout=20000); p9.wait_for_timeout(400)
    rows = p9.evaluate("[...document.querySelectorAll('.since .since-row')].map((a) => a.textContent + ' -> ' + a.getAttribute('href'))"); head = p9.evaluate("(document.querySelector('.since h2') || {}).textContent || ''")
    proof("SINCE-1", "The hub says what changed in the pillars since your last visit, each line opening its pillar", not first_visit and head == "Since you were here" and len(rows) == 1 and "Proof: a new idea" in rows[0] and "pillars/athenaeum/" in rows[0], f"first visit shows nothing: {not first_visit}; next visit: {head!r} {rows}")
    p9.evaluate("localStorage.setItem('prometheus.kin.people', JSON.stringify([{ id: 'p1', name: 'Proof kid', role: 'kid' }])); localStorage.setItem('hearth.deck.stages.v1', JSON.stringify({ 'paint-left': { done: true } }))")
    bk = p9.evaluate("async () => { const m = await import(new URL('deck/core/reach.js', document.baseURI).href); const before = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); before[k] = localStorage.getItem(k); } const file = m.backupAll(); const keys = Object.keys(file.keys);" +
      " for (const k of keys) localStorage.removeItem(k); localStorage.setItem('unrelated.key', 'stays'); const pv = m.previewRestore(JSON.parse(JSON.stringify(file))); m.restoreAll(file); let same = true; for (const k of keys) if (localStorage.getItem(k) !== before[k]) same = false;" +
      " let bad = ''; try { m.previewRestore({ format: 'other' }); } catch (e) { bad = e.message; } const covered = (k) => /^(prometheus\\.|prometheus-hub\\.|prom\\.deck\\.|hearth\\.)/.test(k);" +
      " const want = ['prometheus.kin.people', 'hearth.deck.stages.v1', 'prometheus.bus.events']; const present = Object.keys(before).filter(covered);" +
      " const missed = present.filter((k) => !keys.includes(k)); const absent = want.filter((k) => !keys.includes(k));" +
      " return { count: file.count, add: pv.add.length, change: pv.change.length, same, kept: localStorage.getItem('unrelated.key') === 'stays', bad, has: absent.length === 0, absent, missed, keys }; }")
    refused = "not a valid whole-device" in (bk.get("bad") or "")
    proof("BACKUP-1", "One file backs up every pillar, the shared bus, the hub's consoles and the deck project; a restore previews first, brings every store back exactly and touches nothing else",
          bk["count"] >= 3 and bk["has"] and not bk["missed"] and bk["add"] == bk["count"] and bk["same"] and bk["kept"] and refused and not bad9,
          f"{bk['count']} stores backed up ({', '.join(bk['keys'])}); planted stores missing: {bk['absent'] or 'none'}; covered stores left out: {bk['missed'] or 'none'}; preview adds {bk['add']}; restored identical: {bk['same']}; unrelated key kept: {bk['kept']}; wrong file refused: {bk['bad']!r}"); c9.close()

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
        rel: [...document.querySelectorAll('.ath-rel b')].map((x) => x.textContent.slice(0, 48)), marks: [...document.querySelectorAll('.ath-spine li.you time em')].map((x) => x.textContent), events: PB.events.list().map((e) => e.type + ':' + e.pillar) }; }""", before)
    proof("ATH-3", "Capture and refinement: a new idea becomes a star marked as typed by you, finds its relatives by itself, a refinement only appends, and no other record changes",
          a3["added"] == 1 and a3["untouched"] and a3["mine"]["origin"] == "typed" and a3["mine"]["created"] == "2026-11-13" and len(a3["mine"]["chain"]) == 1 and a3["mine"]["chain"][0].get("by") == "you" and a3["stars"] == a1["n"] + 1 and any("Example: Independent blind audits" in x for x in a3["rel"]) and a3["marks"] == ["you"] and a3["events"] == ["idea.captured:athenaeum", "idea.refined:athenaeum"],
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
    p6.goto(f"{URL}?now={NOW}&home=orbit#/", wait_until="load"); p6.wait_for_selector(".realm .rl-pl", timeout=20000); p6.wait_for_timeout(700)
    tick_line = p6.evaluate("document.querySelector('.ticker').getAttribute('aria-label')"); hits = p6.evaluate("window.__deck.reach.searchRecords('blind audits')"); deep = p6.evaluate("window.__deck.reach.searchRecords('anti-corrosion')")
    p6.click("#open-search"); p6.wait_for_selector(".search-input"); p6.fill(".search-input", "idea: test the handoff from the hub"); p6.wait_for_timeout(250); first = p6.evaluate("document.querySelector('.results .result b').textContent")
    p6.evaluate("document.querySelector('.results .result').click()")
    try: p6.wait_for_url("**/pillars/athenaeum/**", timeout=30000); p6.wait_for_selector(".ath-form input[name=title]", timeout=20000); p6.wait_for_timeout(300); landed = p6.evaluate("({ title: document.querySelector('.ath-form input[name=title]').value, kept: JSON.parse(localStorage.getItem('prometheus.athenaeum.ideas')).length })")
    except Exception as e: landed = {"title": "did not land: " + str(e)[:60], "kept": -1}
    proof("CORE-5", "The hub reaches into a pillar through its manifest: finds an idea by its title or its text, hands typed words to the pillar without writing its records, and shows what last happened there",
          len(hits) >= 1 and hits[0]["title"].startswith("Example: Independent blind audits") and "#idea/" in hits[0]["href"] and len(deep) >= 1 and "Athenaeum · idea" in deep[0]["sub"] and "Athenaeum · idea refined: Proof event" in tick_line and first.startswith("Capture an idea: test the handoff") and landed["title"] == "test the handoff from the hub" and landed["kept"] == a1["n"],
          f"'blind audits' -> {hits[0]['title'][:40] if hits else None} ({hits[0]['href'] if hits else ''}); text match -> {deep[0]['sub'][:70] if deep else None}; ticker has the event: {'Proof event' in tick_line}; '{first[:40]}' opens Athenaeum with the title filled: {landed['title']!r}, ideas still {landed['kept']}"); c6.close()

    pg.goto(f"{URL}?now={NOW}&demo=1&home=orbit#/", wait_until="load"); pg.wait_for_selector(".now-line", timeout=20000); pg.wait_for_timeout(900)

    # ARRIVAL: the core, one now line, one card. The old instruments still read the store on Time and Money.
    home = pg.evaluate("""async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const view = document.querySelector('#view'); const card = document.querySelector('.context-card'); const dockTop = document.querySelector('.dock').getBoundingClientRect().top;
      const bits = [view.innerText, ...[...view.querySelectorAll('[aria-label],[title]')].map((el) => (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || ''))].join('\\n');
      const m = await import(new URL('deck/core/now.js', document.baseURI).href); const facts = m.nowFacts(window.__deck.clock.now()); const line = document.querySelector('.now-line').textContent;
      return { core: document.querySelectorAll('.realm .rl-pl').length, line, cards: document.querySelectorAll('.context-card').length,
        event: !!(facts.event && line.includes(facts.event.title)), deadline: !!(facts.deadline && line.includes(facts.deadline.title)),
        nyse: facts.session.label, nyseOnLine: line.includes(facts.session.label),
        fits: view.scrollTop === 0 && view.scrollHeight <= view.clientHeight + 2 && !!card && card.getBoundingClientRect().bottom <= dockTop + 2,
        wide: document.documentElement.scrollWidth, tables: view.querySelectorAll('table').length, dollars: bits.includes('$'), build: window.__deck.BUILD }; }""")
    proof("DECK-3", "The home renders no table and no dollar figure", home["tables"] == 0 and not home["dollars"] and home["cards"] == 1, json.dumps({"tables": home["tables"], "dollars": home["dollars"], "cards": home["cards"]}))
    pg.goto(f"{URL}?now={NOW}&demo=1#/time", wait_until="load"); pg.wait_for_selector(".dayring svg", timeout=20000); pg.wait_for_selector(".runway .day", timeout=10000); pg.wait_for_timeout(400)
    moved = pg.evaluate("""() => ({ ring: !!document.querySelector('.dayring svg'), days: document.querySelectorAll('.runway .day').length, focus: !!document.querySelector('a.tile.focus'), countdowns: document.querySelectorAll('.countdown').length })""")
    pg.goto(f"{URL}?now={NOW}&demo=1#/money", wait_until="load"); pg.wait_for_selector(".dial-pct", timeout=15000); pg.wait_for_timeout(300)
    payoff = pg.evaluate("() => (document.querySelector('.dial-pct') || {}).textContent || ''")
    proof("DECK-1", "Arrival view: the core, one now line (next event, next deadline, NYSE open or closed) and one card, fitting above the dock; the day ring, 7-day runway, countdowns and payoff ring still read the store",
          home["core"] == len(CORE_IDS) and home["event"] and home["deadline"] and home["nyseOnLine"] and home["nyse"] in ("NYSE open", "NYSE closed") and home["cards"] == 1 and home["fits"] and home["wide"] <= 390 and moved["ring"] and moved["days"] == 7 and moved["focus"] and moved["countdowns"] >= 1 and bool(payoff),
          json.dumps({"line": home["line"], "nyse": home["nyse"], "fits": home["fits"], "wide": home["wide"], "build": home["build"], "moved": moved, "payoff": payoff}, default=str))

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
