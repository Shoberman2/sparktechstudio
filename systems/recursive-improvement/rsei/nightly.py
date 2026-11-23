"""Nightly run: every enabled live company, a few cycles each, one morning report.

For each config in companies/live/*.json (enabled only) the loop runs up to --max-cycles
cycles, stopping early when the company is healthy or a cycle fails. The report is written
to reports/<date>.md and .json, the site status file is refreshed when a company config
names one, and the report is emailed when RESEND_API_KEY and a recipient are configured
in ~/.config/sparktech/rsei.env (mode 600). Nothing here sends to anyone but the owner.
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from .loop import load_company, run_cycle, read_lessons
from .runner import SYSTEM, atomic_json, BoundaryError

ENV_FILE = Path.home() / ".config/sparktech/rsei.env"


def load_env_file():
    if not ENV_FILE.exists():
        return {}
    out = {}
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def send_email(env, subject, text):
    key = env.get("RESEND_API_KEY") or os.environ.get("RESEND_API_KEY")
    to = env.get("RSEI_REPORT_TO") or os.environ.get("RSEI_REPORT_TO")
    sender = env.get("RSEI_REPORT_FROM") or os.environ.get("RSEI_REPORT_FROM") or "SparkTech loop <onboarding@resend.dev>"
    if not key or not to:
        return {"sent": False, "reason": "RESEND_API_KEY or RSEI_REPORT_TO not configured"}
    body = json.dumps({"from": sender, "to": [to], "subject": subject, "text": text}).encode()
    req = urllib.request.Request("https://api.resend.com/emails", data=body, method="POST",
                                 headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return {"sent": True, "response": json.loads(r.read().decode() or "{}")}
    except Exception as exc:
        detail = getattr(exc, "read", lambda: b"")()
        return {"sent": False, "reason": f"{exc} {detail[:300].decode(errors='replace') if detail else ''}"}


def run_company(config_path, state_root, max_cycles, release):
    company = load_company(config_path)
    cycles = []
    for _ in range(max_cycles):
        result = run_cycle(company, state_root, release)
        cycles.append({k: result.get(k) for k in ("run_id", "status", "findings_observed", "changed_files", "cost_usd",
                                                   "commit_sha", "pr_url", "error", "elapsed_seconds", "release", "production_finding_resolved")})
        if result["status"] in ("healthy", "failed", "interrupted", "awaiting_approval", "awaiting_release"):
            break
    return company, cycles


def render(date, companies):
    lines = [f"# SparkTech loop, night of {date}", ""]
    total_cost = 0.0
    for entry in companies:
        c = entry["company"]
        lines.append(f"## {c['display_name']} ({c['company_id']})")
        if entry.get("error"):
            lines.append(f"- Could not run: {entry['error']}")
            lines.append("")
            continue
        for cyc in entry["cycles"]:
            total_cost += cyc.get("cost_usd") or 0
            bits = [f"run {cyc['run_id']}", cyc["status"]]
            if cyc.get("findings_observed") is not None:
                bits.append(f"{cyc['findings_observed']} findings observed")
            if cyc.get("changed_files"):
                bits.append("changed " + ", ".join(cyc["changed_files"]))
            if cyc.get("commit_sha"):
                bits.append("commit " + cyc["commit_sha"][:10])
            if cyc.get("pr_url"):
                bits.append(cyc["pr_url"])
            if cyc.get("release"):
                bits.append("release " + str(cyc["release"]))
            if cyc.get("production_finding_resolved") is not None:
                bits.append("resolved in production" if cyc["production_finding_resolved"] else "still present in production")
            if cyc.get("cost_usd"):
                bits.append(f"${cyc['cost_usd']:.2f}")
            if cyc.get("error"):
                bits.append("error: " + str(cyc["error"])[:300])
            lines.append("- " + "; ".join(bits))
        if entry.get("status_publish"):
            lines.append(f"- Site status file: {entry['status_publish']}")
        lines.append("")
    lines.append(f"Model spend this night: ${total_cost:.2f}. Evidence for every run is under the state root on this machine.")
    return "\n".join(lines), total_cost


def site_status(entry, lessons):
    cycles = entry["cycles"]
    shipped = [l for l in lessons if l.get("outcome") == "completed" and l.get("commit_sha")]
    return {
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "last_run": {k: cycles[-1].get(k) for k in ("run_id", "status", "findings_observed", "changed_files", "commit_sha", "release")} if cycles else None,
        "runs_total": len(lessons),
        "fixes_shipped": len(shipped),
        "last_fix": {k: shipped[-1].get(k) for k in ("time", "kind", "route", "detail", "commit_sha")} if shipped else None,
        "note": "Written by the nightly loop. A run is one observe, select, approve, implement, verify, release, learn cycle with evidence kept locally.",
    }


def publish_status(company, status):
    """Commit the status file into the company's repo and push, when configured."""
    target = company.get("status_file")
    if not target:
        return None
    repo = Path(company["repo"])
    path = repo / target
    clean = subprocess.run(["git", "status", "--porcelain", "--", target], cwd=repo, capture_output=True, text=True).stdout.strip() == ""
    branch = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo, capture_output=True, text=True).stdout.strip()
    if not clean or branch != company["base_branch"]:
        return {"published": False, "reason": "repo checkout not clean on base branch"}
    subprocess.run(["git", "pull", "-q", "--ff-only"], cwd=repo, capture_output=True, timeout=120)
    atomic_json(path, status)
    subprocess.run(["git", "add", target], cwd=repo, capture_output=True)
    p = subprocess.run(["git", "-c", "user.name=SparkTech loop", "-c", "user.email=loop@sparktechstudio.com", "commit", "-q", "-m",
                        "Nightly loop status", "-m", "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"], cwd=repo, capture_output=True, text=True)
    if p.returncode != 0:
        return {"published": False, "reason": "nothing to commit"}
    p = subprocess.run(["git", "push", "-q", "origin", company["base_branch"]], cwd=repo, capture_output=True, text=True, timeout=120)
    return {"published": p.returncode == 0, "reason": p.stderr.strip()[-200:]}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--companies", default=str(SYSTEM / "companies/live"))
    parser.add_argument("--state-root", default=str(SYSTEM / ".runs"))
    parser.add_argument("--reports", default=str(SYSTEM / "reports"))
    parser.add_argument("--max-cycles", type=int, default=3)
    parser.add_argument("--no-release", action="store_true")
    parser.add_argument("--only", help="company id to run alone")
    args = parser.parse_args(argv)
    os.umask(0o077)
    env = load_env_file()
    for key in ("RSEI_PLAYWRIGHT_MODULE", "PLAYWRIGHT_BROWSERS_PATH"):
        if key in env and key not in os.environ:
            os.environ[key] = env[key]
    date = datetime.now().strftime("%Y-%m-%d")
    reports = Path(args.reports)
    reports.mkdir(parents=True, exist_ok=True)
    entries = []
    for config in sorted(Path(args.companies).glob("*.json")):
        try:
            raw = json.loads(config.read_text())
        except ValueError:
            continue
        if raw.get("enabled") is not True or (args.only and raw.get("company_id") != args.only):
            continue
        try:
            company, cycles = run_company(config, args.state_root, args.max_cycles, not args.no_release)
            entry = {"company": company, "cycles": cycles}
            lessons = read_lessons(Path(args.state_root) / company["company_id"])
            if company.get("status_file"):
                entry["status_publish"] = publish_status(company, site_status(entry, lessons))
        except (BoundaryError, OSError, ValueError, KeyError) as exc:
            entry = {"company": {"display_name": raw.get("display_name", config.name), "company_id": raw.get("company_id", config.stem)}, "cycles": [], "error": str(exc)}
        entries.append(entry)
    text, total = render(date, entries)
    (reports / f"{date}.md").write_text(text)
    atomic_json(reports / f"{date}.json", {"date": date, "total_cost_usd": round(total, 4),
                                            "companies": [{"company_id": e["company"]["company_id"], "cycles": e["cycles"], "error": e.get("error"),
                                                           "status_publish": e.get("status_publish")} for e in entries]})
    mail = send_email(env, f"SparkTech loop: {date}", text)
    print(text)
    print(json.dumps({"email": mail}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
