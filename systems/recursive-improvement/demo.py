"""Run and assert the controlled Chromium repair cycle and its healthy follow-up."""
import json
from pathlib import Path
import subprocess
import sys

from rsei.runner import SYSTEM, digest


def run(*flags):
    completed = subprocess.run([sys.executable, "-m", "rsei.runner", "run", *flags],
                               cwd=SYSTEM, capture_output=True, text=True, timeout=150)
    if completed.returncode:
        raise RuntimeError(completed.stdout + completed.stderr)
    return json.loads(completed.stdout)


original = digest(SYSTEM / "fixtures/counter/index.html")
fixed = run("--release-local")
assert fixed["status"] == "completed", fixed
root = Path(fixed["run_path"])
observations = {}
for stage in ["discover", "reproduce", "verify", "release_check"]:
    evidence = root / "evidence" / stage
    report = json.loads((evidence / "result.json").read_text())
    observations[stage] = report["actual"]
    assert (evidence / "page.png").stat().st_size > 0
    assert (evidence / "trace.zip").stat().st_size > 0
assert observations == {"discover": "2", "reproduce": "2", "verify": "1", "release_check": "1"}, observations
healthy = run("--from-current")
assert healthy["status"] == "healthy" and healthy["commands_used"] == 1, healthy
assert digest(SYSTEM / "fixtures/counter/index.html") == original
print(json.dumps({"demonstration": "real Chromium + deterministic fixture worker",
    "repair": fixed, "next_cycle": healthy, "observations": observations,
    "original_source_unchanged": True}, indent=2))
