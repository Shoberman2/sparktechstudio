"""Tenant-scoped local growth audit and approval-gated proposal workflow.

No network, outbound messaging, production publishing, or credentials are used here.
"""
import argparse
import json
import re
import shutil
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .runner import atomic_json, digest


def _now(): return datetime.now(timezone.utc)
def _iso(): return _now().isoformat()
def _read(path): return json.loads(Path(path).read_text())
def _write(path, value): atomic_json(path, value)


class GrowthCycle:
    """Inspect one company's supplied aggregates/records and stage local proposals."""
    def __init__(self, run):
        self.run = Path(run).resolve()
        self.policy = _read(self.run / "company.json")
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", self.policy.get("company_id", "")):
            raise ValueError("Company/run boundary mismatch")
        if self.policy.get("permissions", {}).get("outbound_send") or self.policy.get("permissions", {}).get("production_publish"):
            raise ValueError("This local foundation cannot enable outbound or production permissions")

    @classmethod
    def init(cls, company_config, input_dir, run):
        config = _read(company_config)
        company = config.get("company_id", "")
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", company): raise ValueError("Invalid company_id")
        run = Path(run).resolve()
        if run.exists(): raise ValueError("Run directory already exists")
        source = Path(input_dir).resolve()
        if source.is_symlink() or not source.is_dir(): raise ValueError("Input directory must be a local, non-symlink directory")
        run.mkdir(parents=True, mode=0o700)
        # Explicit paths and per-record company IDs prevent implicit cross-tenant joins.
        _write(run / "company.json", config)
        for name in ("prospects.json", "retention.json", "pages.json"):
            path = source / name
            if path.is_symlink() or not path.is_file(): raise ValueError(f"Missing local input: {name}")
            shutil.copyfile(path, run / name)
        instance = cls(run)
        instance._event("initialized", input_hashes={n: digest(run / n) for n in ("company.json", "prospects.json", "retention.json", "pages.json")})
        return instance

    def _event(self, event, **details):
        row = {"at": _iso(), "company_id": self.policy["company_id"], "run_id": self.run.name, "event": event, **details}
        with (self.run / "events.jsonl").open("a") as stream:
            stream.write(json.dumps(row, sort_keys=True) + "\n")

    def _budget(self, kind, rows):
        if not isinstance(rows, list): raise ValueError(f"{kind} records must be a JSON array")
        limits = {"prospects": 500, "cohorts": 120, "pages": 250}
        if len(rows) > limits[kind]: raise ValueError(f"{kind} input exceeds local pilot budget")

    @staticmethod
    def _unique(rows, key, kind):
        values = [row.get(key) for row in rows]
        if any(not isinstance(v, str) or not v for v in values) or len(values) != len(set(values)):
            raise ValueError(f"{kind} requires unique nonempty {key} values")

    def _check_tenant(self, rows, kind):
        for row in rows:
            if row.get("company_id") != self.policy["company_id"]:
                raise ValueError(f"{kind} contains a different company_id")

    def _fresh(self, timestamp):
        try:
            captured = datetime.fromisoformat(timestamp)
            if captured.tzinfo is None: return False
            age = (_now() - captured).total_seconds()
            limit = self.policy.get("freshness", {}).get("max_source_age_days", 30) * 86400
            return -300 <= age <= limit
        except (TypeError, ValueError): return False

    def discover_icps(self):
        data = _read(self.run / "prospects.json")
        rows = data.get("accounts", [])
        self._budget("prospects", rows)
        self._unique(rows, "account_id", "prospects")
        self._check_tenant(rows, "prospects")
        icps = self.policy.get("icps", [])
        if not icps or len({x.get("id") for x in icps}) != len(icps): raise ValueError("Company needs unique ICP definitions")
        matches = []
        for prospect in rows:
            signals = set(prospect.get("signals", []))
            fresh = self._fresh(prospect.get("captured_at"))
            matched = [icp["id"] for icp in icps if fresh and set(icp.get("required_signals", [])) <= signals]
            matches.append({"account_id": prospect["account_id"], "icp_ids": matched,
                            "source": prospect.get("source_id"), "captured_at": prospect.get("captured_at"), "fresh": fresh})
        result = {"company_id": self.policy["company_id"], "icps": icps, "accounts_seen": len(rows),
                  "matches": matches, "unmatched": sum(not x["icp_ids"] for x in matches),
                  "stale_records": sum(not x["fresh"] for x in matches),
                  "limitations": ["Rule-based match against supplied local records; no market search or identity enrichment."]}
        _write(self.run / "icp-discovery.json", result)
        return result

    def outreach_plan(self):
        discovery = _read(self.run / "icp-discovery.json")
        prospects = {x["account_id"]: x for x in _read(self.run / "prospects.json")["accounts"]}
        max_per_icp = self.policy.get("outreach", {}).get("draft_cap_per_icp", 50)
        plans, counts = [], {}
        icps = {x["id"]: x for x in self.policy["icps"]}
        for match in discovery["matches"]:
            prospect = prospects[match["account_id"]]
            for icp_id in match["icp_ids"]:
                counts[icp_id] = counts.get(icp_id, 0)
                if counts[icp_id] >= max_per_icp: continue
                counts[icp_id] += 1
                plans.append({"company_id": self.policy["company_id"], "account_id": prospect["account_id"],
                    "icp_id": icp_id, "category": icps[icp_id].get("message_category", "introductory"),
                    "draft": f"Hi {prospect.get('display_label', 'there')}, based on {', '.join(match['icp_ids'])}, would a short conversation about {icps[icp_id]['problem']} be useful?",
                    "delivery_status": "draft_only"})
        result = {"company_id": self.policy["company_id"], "drafts": plans, "count_by_icp": counts,
                  "outbound_enabled": False, "blockers": ["No outreach connector or sender authorization configured", "Audience, sender, message-category and suppression review required"]}
        _write(self.run / "outreach-plan.json", result)
        return result

    def retention_audit(self):
        data = _read(self.run / "retention.json")
        rows = data.get("cohorts", [])
        self._check_tenant(rows, "retention")
        self._budget("cohorts", rows)
        self._unique(rows, "cohort", "retention")
        metrics, blockers = [], []
        if not self._fresh(data.get("captured_at")):
            blockers.append({"reason": "retention source is stale, missing, or lacks timezone"})
            rows = []
        for row in rows:
            eligible, retained = row.get("eligible"), row.get("retained")
            if type(eligible) is not int or type(retained) is not int or eligible <= 0 or not 0 <= retained <= eligible:
                blockers.append({"cohort": row.get("cohort"), "reason": "invalid eligible/retained counts"}); continue
            rate = retained / eligible
            target = self.policy.get("retention", {}).get("target_rate")
            metrics.append({"cohort": row["cohort"], "eligible": eligible, "retained": retained, "retention_rate": rate,
                            "below_company_target": type(target) in (int, float) and rate < target})
        result = {"company_id": self.policy["company_id"], "source_id": data.get("source_id"), "metrics": metrics,
                  "invalid_cohorts": blockers, "baseline": metrics, "experiment_lift": None,
                  "experiment_proposals": [{"cohort": m["cohort"], "hypothesis": "Investigate early lifecycle friction for this cohort", "next_step": "Design a controlled, owner-approved experiment using the verified event taxonomy", "execution_status": "proposal_only"} for m in metrics if m["below_company_target"]],
                  "limitations": ["Aggregate cohort snapshot only; no causal attribution or experiment result."]}
        _write(self.run / "retention-audit.json", result)
        return result

    def search_audit(self):
        data = _read(self.run / "pages.json")
        rows = data.get("pages", [])
        self._budget("pages", rows)
        self._unique(rows, "page_id", "pages")
        self._check_tenant(rows, "pages")
        audits, edits = [], []
        for page in rows:
            issues = []
            fresh = self._fresh(page.get("captured_at"))
            title = page.get("title", ""); description = page.get("meta_description", "")
            if not fresh: issues.append("stale_or_missing_source")
            if fresh and not title.strip(): issues.append("missing_title")
            if fresh and not description.strip(): issues.append("missing_meta_description")
            if fresh and not page.get("h1", "").strip(): issues.append("missing_h1")
            if fresh and not page.get("faq", []): issues.append("no_answer_ready_faq")
            audits.append({"page_id": page["page_id"], "url": page["url"], "seo_issues": issues,
                           "aeo_issues": [x for x in issues if x == "no_answer_ready_faq"]})
            edit = {"page_id": page["page_id"], "changes": {}}
            if fresh and not title.strip() and page.get("suggested_title"): edit["changes"]["title"] = page["suggested_title"]
            if fresh and not description.strip() and page.get("suggested_meta_description"): edit["changes"]["meta_description"] = page["suggested_meta_description"]
            if fresh and not page.get("h1", "").strip() and page.get("suggested_h1"): edit["changes"]["h1"] = page["suggested_h1"]
            if fresh and not page.get("faq") and page.get("suggested_faq"): edit["changes"]["faq"] = page["suggested_faq"]
            if edit["changes"]: edits.append(edit)
        result = {"company_id": self.policy["company_id"], "pages_checked": len(rows), "audits": audits,
                  "local_page_edits_proposed": edits, "ranking_guarantee": False,
                  "limitations": ["Technical/content checklist only; no crawl, search-provider data, ranking or answer citation claims."]}
        _write(self.run / "search-audit.json", result)
        return result

    def inspect(self):
        discovery = self.discover_icps()
        outreach = self.outreach_plan()
        retention = self.retention_audit()
        search = self.search_audit()
        edits = [{"page_id": item["page_id"], **item["changes"]} for item in search["local_page_edits_proposed"]]
        proposal = {"id": uuid.uuid4().hex, "company_id": self.policy["company_id"], "status": "awaiting_approval",
            "created_at": _iso(), "input_hashes": {name: digest(self.run / name) for name in ("company.json", "prospects.json", "retention.json", "pages.json")},
            "page_edits": edits, "outbound_send": False, "production_mutation": False}
        _write(self.run / "proposal.json", proposal)
        _write(self.run / "evidence.json", {"company_id": self.policy["company_id"], "observed_at": _iso(),
            "artifacts": {p.name: digest(p) for p in self.run.glob("*.json")}, "external_calls": 0})
        self._event("inspected", proposal_id=proposal["id"])
        return {"company_id": self.policy["company_id"], "icp_matches": sum(bool(x["icp_ids"]) for x in discovery["matches"]),
                "outreach_drafts": len(outreach["drafts"]), "retention_cohorts": len(retention["metrics"]),
                "pages_checked": search["pages_checked"], "proposal": proposal}

    def approve(self, proposal_id, reviewer):
        proposal = _read(self.run / "proposal.json")
        if proposal["id"] != proposal_id or proposal["status"] != "awaiting_approval": raise ValueError("Wrong, stale, or already decided proposal")
        proposal.update(status="approved", reviewer=reviewer, approved_at=_iso(), expires_at=time.time() + self.policy.get("approval_ttl_seconds", 600))
        _write(self.run / "proposal.json", proposal)
        self._event("approved", proposal_id=proposal_id, reviewer=reviewer)
        return proposal

    def apply_local(self, proposal_id):
        proposal = _read(self.run / "proposal.json")
        if proposal["id"] != proposal_id or proposal["status"] != "approved":
            self._event("apply_blocked", proposal_id=proposal_id, reason="exact human approval required")
            raise PermissionError("Exact human approval is required")
        if proposal.get("applied"): return "already_applied"
        if time.time() > proposal.get("expires_at", 0):
            proposal["status"] = "expired"; _write(self.run / "proposal.json", proposal)
            self._event("approval_expired", proposal_id=proposal_id)
            raise PermissionError("Approval expired; inspect and approve a fresh proposal")
        for name, expected in proposal["input_hashes"].items():
            if digest(self.run / name) != expected:
                self._event("apply_blocked", reason="reviewed input changed", input=name)
                raise ValueError("Source inputs changed after review; inspect again")
        pages = _read(self.run / "pages.json")
        for edit in proposal["page_edits"]:
            page = next(p for p in pages["pages"] if p["page_id"] == edit["page_id"])
            page.update({k: v for k, v in edit.items() if k != "page_id"})
        _write(self.run / "candidate-pages.json", pages)
        # Independent static check. Keep candidate local and never publish it.
        checked = self._audit_pages(pages)
        _write(self.run / "independent-search-check.json", checked)
        if any(item["missing_title"] or item["missing_meta_description"] or item["missing_h1"] for item in checked["pages"]):
            (self.run / "candidate-pages.json").unlink(missing_ok=True)
            self._event("apply_failed", reason="independent local check failed", rollback="original inputs unchanged")
            raise RuntimeError("Independent local check failed; staged candidate discarded")
        proposal["applied"] = True; proposal["applied_at"] = _iso(); _write(self.run / "proposal.json", proposal)
        _write(self.run / "evidence.json", {"company_id": self.policy["company_id"], "observed_at": _iso(),
            "candidate_hash": digest(self.run / "candidate-pages.json"), "independent_check_hash": digest(self.run / "independent-search-check.json"),
            "external_calls": 0, "production_mutation": False})
        self._event("staged_verified", proposal_id=proposal_id, candidate_hash=digest(self.run / "candidate-pages.json"), rollback="original inputs unchanged")
        return "staged_and_checked_locally"

    @staticmethod
    def _audit_pages(data):
        return {"company_id": data.get("company_id"), "pages": [{"page_id": p["page_id"], "missing_title": not bool(p.get("title", "").strip()),
            "missing_meta_description": not bool(p.get("meta_description", "").strip()), "missing_h1": not bool(p.get("h1", "").strip()),
            "has_faq": bool(p.get("faq", []))} for p in data.get("pages", [])]}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    subs = parser.add_subparsers(dest="cmd", required=True)
    p = subs.add_parser("inspect"); p.add_argument("--company-config", required=True); p.add_argument("--input-dir", required=True); p.add_argument("--run", required=True)
    p = subs.add_parser("approve"); p.add_argument("--run", required=True); p.add_argument("--proposal-id", required=True); p.add_argument("--reviewer", required=True)
    p = subs.add_parser("apply-local"); p.add_argument("--run", required=True); p.add_argument("--proposal-id", required=True)
    args = parser.parse_args(argv)
    cycle = GrowthCycle.init(args.company_config, args.input_dir, args.run) if args.cmd == "inspect" else GrowthCycle(args.run)
    result = cycle.inspect() if args.cmd == "inspect" else cycle.approve(args.proposal_id, args.reviewer) if args.cmd == "approve" else cycle.apply_local(args.proposal_id)
    print(json.dumps(result, indent=2))


if __name__ == "__main__": main()
