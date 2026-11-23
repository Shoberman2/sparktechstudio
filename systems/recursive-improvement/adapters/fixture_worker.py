"""A real, deterministic fixture repair subprocess. This is NOT an AI agent."""
import json
import os
from pathlib import Path

task = json.loads(Path(os.environ["RSEI_TASK"]).read_text())
assert task["worker_kind"] == "deterministic-fixture-repair"
assert task["company_id"] == "sparktech-fixture"
path = Path(os.environ["RSEI_WORKSPACE"]) / "index.html"
text = path.read_text()
if text.count("count += 2;") != 1:
    raise RuntimeError("Fixture precondition failed; refusing an unrelated repair")
path.write_text(text.replace("count += 2;", "count += 1;"))
print(json.dumps({"worker": "deterministic-fixture-repair", "changed": ["index.html"]}))
