"""Write the browser proof run into STATUS.md.

The block between the proofs-live markers quotes every line of the run, failures included.
A later run rewrites that block only when the pass/fail set changes. Timings in a passing
line move every run; committing them would redeploy the site and start proofs-live again.
"""
import json, os, pathlib, re, sys

BEGIN = "<!-- proofs-live:begin -->"
END = "<!-- proofs-live:end -->"
LINE = re.compile(r"^(PASS|FAIL) (\S+)  ")


def outcome(results):
    return [(("PASS" if r.get("pass") else "FAIL"), r.get("id")) for r in results]


def block_outcome(text):
    start, end = text.find(BEGIN), text.find(END)
    if start < 0 or end < start:
        return None
    found = []
    for line in text[start:end].splitlines():
        m = LINE.match(line)
        if m:
            found.append((m.group(1), m.group(2)))
    return found


def render(report):
    results = report.get("results") or []
    failed = [r for r in results if not r.get("pass")]
    passed = len(results) - len(failed)
    url = str(report.get("url") or "").rstrip("/")
    lines = [BEGIN, ""]
    if failed:
        lines.append(f"**{passed} passed, {len(failed)} failed** against {url}. A FAIL line is a failure. This file does not call a failed run clean.")
    else:
        lines.append(f"**{passed} passed, 0 failed** against {url}. Every proof in this run passed.")
    note = (report.get("note") or os.environ.get("PROOFS_LIVE_NOTE") or "").strip()
    if note:
        lines += ["", note]
    lines.append("")
    for r in results:
        mark = "PASS" if r.get("pass") else "FAIL"
        name = " ".join(str(r.get("name") or "").split())
        detail = " ".join(str(r.get("detail") or "").split())
        lines.append(f"{mark} {r.get('id')}  {name}  ::  {detail}")
    lines += ["", END]
    return "\n".join(lines) + "\n"


def splice(text, block):
    start, end = text.find(BEGIN), text.find(END)
    if start < 0 or end < start:
        raise SystemExit("STATUS.md is missing the proofs-live markers")
    end += len(END)
    pre, rest = text[:start], text[end:]
    if not pre.endswith("\n"):
        pre += "\n"
    if rest.startswith("\n"):
        rest = rest[1:]
    return pre + block + rest


def main(argv):
    if len(argv) < 3:
        raise SystemExit("usage: proofs/write_status.py <proofs.json> <STATUS.md> [--force]")
    report = json.loads(pathlib.Path(argv[1]).read_text())
    results = report.get("results") or []
    if not results:
        raise SystemExit("proof report has no results")
    path = pathlib.Path(argv[2])
    text = path.read_text()
    force = "--force" in argv
    previous = block_outcome(text)
    if not force and previous == outcome(results):
        print("outcome unchanged; STATUS.md left as quoted")
        return 0
    path.write_text(splice(text, render(report)))
    failed = sum(1 for r in results if not r.get("pass"))
    print(f"wrote {path} ({len(results) - failed} passed, {failed} failed)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
