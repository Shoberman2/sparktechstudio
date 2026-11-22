"""Synthetic-only BallotWatch source-checking pilot with an approval-gated repair loop."""
import argparse
import json
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .runner import atomic_json, digest

COMPANY = "ballotwatch"
HERE = Path(__file__).resolve().parents[1] / "pilot" / "ballotwatch"


def now():
    return datetime.now(timezone.utc).isoformat()


def check(path):
    """Check claims only against the bundled synthetic authority records."""
    data = json.loads(Path(path).read_text())
    facts = json.loads((HERE / "sources.json").read_text())
    defects = []
    for claim in data.get("claims", []):
        source = facts.get(claim.get("source_id"))
        if source is None:
            defects.append({"claim_id": claim.get("id"), "kind": "unknown_source", "actual": claim.get("source_id")})
        elif claim.get("field") not in source:
            defects.append({"claim_id": claim.get("id"), "kind": "unsupported_field", "actual": claim.get("field")})
        elif claim.get("value") != source[claim["field"]]:
            defects.append({"claim_id": claim.get("id"), "kind": "value_mismatch", "expected": source[claim["field"]], "actual": claim.get("value")})
    return {"checked": len(data.get("claims", [])), "defects": defects}


class BallotWatchPilot:
    def __init__(self, run):
        self.run = Path(run).resolve()
        self.state_path = self.run / "state.json"

    @classmethod
    def init(cls, run, fixture="defective.json"):
        run = Path(run).resolve()
        if run.exists():
            raise ValueError("Run directory already exists")
        run.mkdir(parents=True, mode=0o700)
        atomic_json(run / "policy.json", {"company_id": COMPANY, "mode": "synthetic", "fixture": fixture,
            "source_boundary": str(HERE.resolve()), "external_network": False, "human_approval_required": True})
        shutil.copyfile(HERE / fixture, run / "original.json")
        shutil.copyfile(HERE / fixture, run / "working.json")
        instance = cls(run)
        instance._event("initialized", fixture_sha256=digest(run / "original.json"))
        return instance

    def _state(self):
        return json.loads(self.state_path.read_text()) if self.state_path.exists() else {"company_id": COMPANY, "events": []}

    def _event(self, kind, **attrs):
        state = self._state()
        row = {"at": now(), "company_id": COMPANY, "run_id": self.run.name, "event": kind, **attrs}
        state["events"].append(row)
        atomic_json(self.state_path, state)
        with (self.run / "evidence.jsonl").open("a") as log:
            log.write(json.dumps(row, sort_keys=True) + "\n")

    def baseline(self):
        result = check(self.run / "original.json")
        report = {"company_id": COMPANY, "mode": "synthetic", "claims_checked": result["checked"],
                  "defects_found": len(result["defects"]), "defects_per_claim": len(result["defects"]) / result["checked"] if result["checked"] else 0,
                  "observed_at": now(), "fixture_sha256": digest(self.run / "original.json"), "scope": "bundled synthetic fixtures only"}
        atomic_json(self.run / "baseline.json", report)
        self._event("baseline", result=report)
        return report

    def propose(self):
        result = check(self.run / "working.json")
        doc = json.loads((self.run / "working.json").read_text())
        by_id = {x["id"]: x for x in doc["claims"]}
        fixes = [{"claim_id": d["claim_id"], "field": "value", "from": by_id[d["claim_id"]].get("value"), "to": d["expected"]}
                 for d in result["defects"] if d["kind"] == "value_mismatch"]
        proposal = {"proposal_id": uuid.uuid4().hex, "company_id": COMPANY, "source_sha256": digest(self.run / "working.json"),
                    "defects": result["defects"], "fixes": fixes, "status": "awaiting_human_approval", "created_at": now()}
        atomic_json(self.run / "proposal.json", proposal)
        self._event("proposal", proposal_id=proposal["proposal_id"], defects=len(result["defects"]))
        return proposal

    def approve(self, decision, reviewer="local-human"):
        proposal = json.loads((self.run / "proposal.json").read_text())
        state = self._state()
        if proposal["status"] != "awaiting_human_approval":
            if proposal["status"] == "denied" and decision == "deny": return proposal
            raise ValueError("Proposal is no longer awaiting a decision")
        if decision not in ("approve", "deny"): raise ValueError("Decision must be approve or deny")
        proposal.update(status="approved" if decision == "approve" else "denied", reviewer=reviewer, decided_at=now())
        atomic_json(self.run / "proposal.json", proposal)
        self._event("approval" if decision == "approve" else "approval_denied", proposal_id=proposal["proposal_id"], reviewer=reviewer)
        return proposal

    def apply(self, fail_after=None):
        proposal = json.loads((self.run / "proposal.json").read_text())
        if proposal["status"] != "approved":
            self._event("apply_blocked", reason="human approval missing or denied")
            raise PermissionError("Human approval is required before applying the isolated fix")
        if self._state().get("applied_proposal") == proposal["proposal_id"]:
            self._event("apply_idempotent", proposal_id=proposal["proposal_id"])
            return "already_applied"
        if proposal["source_sha256"] != digest(self.run / "working.json"):
            raise ValueError("Source changed after proposal; re-check before applying")
        backup = self.run / "rollback.json"
        shutil.copyfile(self.run / "working.json", backup)
        doc = json.loads((self.run / "working.json").read_text())
        indexed = {x["id"]: x for x in doc["claims"]}
        for i, fix in enumerate(proposal["fixes"]):
            indexed[fix["claim_id"]][fix["field"]] = fix["to"]
            if fail_after == i + 1:
                atomic_json(self.run / "working.json", doc)
                self._event("apply_partial", changed=i + 1)
                self.rollback("partial_apply")
                return "rolled_back_partial"
        atomic_json(self.run / "working.json", doc)
        # Independent check uses source records afresh and verifies source/candidate integrity.
        result = check(self.run / "working.json")
        independent = {"checker": "fresh deterministic source comparison", "result": result,
                       "candidate_sha256": digest(self.run / "working.json"), "passed": not result["defects"]}
        atomic_json(self.run / "independent-check.json", independent)
        if not independent["passed"]:
            self.rollback("independent_check_failed")
            return "rolled_back_failed_check"
        state = self._state(); state["applied_proposal"] = proposal["proposal_id"]; atomic_json(self.state_path, state)
        self._event("verified", check_sha256=digest(self.run / "independent-check.json"), candidate_sha256=independent["candidate_sha256"])
        return "verified"

    def rollback(self, reason="manual"):
        backup = self.run / "rollback.json"
        if not backup.is_file(): raise ValueError("No isolated pre-change snapshot to restore")
        shutil.copyfile(backup, self.run / "working.json")
        self._event("rollback", reason=reason, restored_sha256=digest(self.run / "working.json"))
        return "restored"

    def report(self):
        report = {"company_id": COMPANY, "scope": "synthetic/local only", "baseline": json.loads((self.run / "baseline.json").read_text()) if (self.run / "baseline.json").exists() else None,
                  "proposal": json.loads((self.run / "proposal.json").read_text()) if (self.run / "proposal.json").exists() else None,
                  "working_check": check(self.run / "working.json"), "working_sha256": digest(self.run / "working.json"),
                  "event_count": len(self._state()["events"]), "external_actions": 0}
        atomic_json(self.run / "report.json", report)
        return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("init"); p.add_argument("--run", required=True); p.add_argument("--fixture", choices=("defective.json", "clean.json"), default="defective.json")
    for name in ("baseline", "propose", "apply", "report"):
        p = sub.add_parser(name); p.add_argument("--run", required=True)
        if name == "apply": p.add_argument("--fail-after", type=int)
    p = sub.add_parser("approve"); p.add_argument("--run", required=True); p.add_argument("--decision", choices=("approve", "deny"), required=True); p.add_argument("--reviewer", default="local-human")
    p = sub.add_parser("rollback"); p.add_argument("--run", required=True)
    args = parser.parse_args()
    instance = BallotWatchPilot.init(args.run, args.fixture) if args.command == "init" else BallotWatchPilot(args.run)
    result = instance.baseline() if args.command == "baseline" else instance.propose() if args.command == "propose" else instance.approve(args.decision, args.reviewer) if args.command == "approve" else instance.apply(getattr(args, "fail_after", None)) if args.command == "apply" else instance.rollback() if args.command == "rollback" else instance.report()
    print(json.dumps(result, indent=2))


if __name__ == "__main__": main()
