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
        pg.route("https://api.open-meteo.com/**", lambda route, request: route.abort()); pg.route("https://api.weather.gov/**", lambda route, request: route.abort())
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

    proof("DECK-2", "No script errors during the run", not errs, "; ".join(errs[:4]) or "none")
    b.close()

if OUT: json.dump({"url": URL, "ran": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "clock": NOW, "results": results}, open(OUT, "w"), indent=1)
sys.exit(0 if all(r["pass"] for r in results) else 1)
