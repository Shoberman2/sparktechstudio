"""Company-scoped, local-only workflows with explicit evidence and approval.

All classifiers are deterministic rules over caller-supplied allowlisted JSON. This
module does not connect to APIs, send messages, decide clinical matters, or run
experiments. Proposal application is confined to an isolated artifact directory.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import time
import uuid

from .runner import BoundaryError, atomic_json

SCHEMA_VERSION = 1
SENSITIVE_KEYS = {"email", "phone", "address", "patient", "allergy_profile", "token", "secret", "password", "authorization", "customer_id", "user_id"}


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256(value):
    raw = value if isinstance(value, bytes) else canonical(value).encode()
    return hashlib.sha256(raw).hexdigest()


def _utcnow():
    return datetime.now(timezone.utc)


def _timestamp(value):
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        raise ValueError("timestamps must include a timezone")
    return dt


def _check_company(company, expected):
    if not isinstance(company, str) or company != expected:
        raise BoundaryError("cross-company data is not accepted")


def _reject_sensitive(value, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            if str(key).lower() in SENSITIVE_KEYS or any(part in str(key).lower() for part in ("email", "phone", "token", "secret", "password")):
                raise BoundaryError(f"sensitive field is prohibited: {path}{key}")
            _reject_sensitive(child, path + str(key) + ".")
    elif isinstance(value, list):
        for item in value:
            _reject_sensitive(item, path)
    elif isinstance(value, str) and re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", value):
        raise BoundaryError("personal contact data is prohibited")


class Operations:
    """A company-local proposal, evidence and rollback store.

    Budgets count proposals, applied actions, and serialized input bytes. Outbound
    actions are not implemented, so the outbound budget is always zero.
    """
    def __init__(self, root, company_id, *, max_input_bytes=1_000_000, max_proposals=100, max_applies=20):
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", company_id):
            raise ValueError("invalid company id")
        self.root = Path(root).resolve() / company_id
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.company_id = company_id
        self.limits = {"input_bytes": max_input_bytes, "proposals": max_proposals, "applies": max_applies, "outbound": 0}
        self.state_path = self.root / "operations.json"
        self.ledger_path = self.root / "events.jsonl"
        self.capabilities = {"local_fixture_read": True, "isolated_local_artifact_write": True,
            "external_get": False, "external_send": False, "publish": False, "deploy": False,
            "payments": False, "clinical_decisions": False, "experiment_execution": False}
        if self.state_path.exists():
            self.state = json.loads(self.state_path.read_text())
            if self.state.get("company_id") != company_id or self.state.get("schema_version") != SCHEMA_VERSION:
                raise BoundaryError("operation store identity/schema mismatch")
            if self.state.get("limits") != self.limits or self.state.get("capabilities") != self.capabilities:
                raise BoundaryError("operation budget/capability policy changed; explicit migration is required")
        else:
            self.state = {"schema_version": SCHEMA_VERSION, "company_id": company_id,
                          "created_at": _utcnow().isoformat(), "stopped": False, "stop_record": None,
                          "limits": dict(self.limits), "capabilities": dict(self.capabilities),
                          "proposals": {}, "usage": {"input_bytes": 0, "proposals": 0, "applies": 0, "outbound": 0}}
            atomic_json(self.state_path, self.state)

    def event(self, kind, **details):
        prev = "0" * 64
        if self.ledger_path.exists():
            lines = self.ledger_path.read_text().splitlines()
            if lines:
                last = json.loads(lines[-1])
                if sha256({k: v for k, v in last.items() if k != "event_hash"}) != last["event_hash"]:
                    raise BoundaryError("ledger integrity check failed")
                prev = last["event_hash"]
        row = {"at": _utcnow().isoformat(), "company_id": self.company_id, "kind": kind,
               "previous_hash": prev, **details}
        row["event_hash"] = sha256(row)
        with self.ledger_path.open("a") as f:
            f.write(canonical(row) + "\n")
        return row

    def _save(self):
        atomic_json(self.state_path, self.state)

    def _budget(self, name, amount):
        used = self.state["usage"].get(name, 0)
        if used + amount > self.limits[name]:
            raise BoundaryError(f"{name} budget exhausted")
        self.state["usage"][name] = used + amount

    def stop(self, *, reviewer, reason):
        if not reviewer or reviewer == "system" or not isinstance(reason, str) or not reason.strip():
            raise BoundaryError("stop requires a named human and reason")
        self.state["stopped"] = True
        self.state["stop_record"] = {"reviewer": reviewer, "reason": reason[:500], "at": _utcnow().isoformat()}
        self._save()
        self.event("stop_activated", reviewer=reviewer, reason=reason[:500])
        self._save()
        return dict(self.state["stop_record"])

    def clear_stop(self, *, reviewer):
        if not self.state.get("stopped") or not reviewer or reviewer == "system":
            raise BoundaryError("an active stop and named human reviewer are required")
        self.event("stop_cleared", reviewer=reviewer, prior_stop_hash=sha256(self.state["stop_record"]))
        self.state["stopped"] = False
        self.state["stop_record"] = None
        self._save()

    def propose(self, workflow, input_data, candidate, *, evidence_ids=(), independent_check="required"):
        if self.state.get("stopped"):
            raise BoundaryError("company operations are stopped")
        _check_company(input_data.get("company_id"), self.company_id)
        _reject_sensitive(input_data)
        _reject_sensitive(candidate)
        data_bytes = len(canonical(input_data).encode())
        self._budget("input_bytes", data_bytes)
        self._budget("proposals", 1)
        pid = uuid.uuid4().hex
        identity = {"company_id": self.company_id, "workflow": workflow, "input_hash": sha256(input_data),
                    "candidate_hash": sha256(candidate), "evidence_ids": list(evidence_ids),
                    "independent_check": independent_check}
        row = {"id": pid, **identity, "proposal_hash": sha256(identity), "status": "pending_review",
               "created_at": _utcnow().isoformat(), "approval": None}
        self.state["proposals"][pid] = row
        self._save()
        self.event("proposal_created", proposal_id=pid, workflow=workflow, proposal_hash=row["proposal_hash"],
                   input_hash=row["input_hash"], candidate_hash=row["candidate_hash"], evidence_ids=list(evidence_ids))
        self._save()
        return dict(row)

    def decide(self, proposal_id, *, reviewer, approve, proposal_hash, ttl_seconds=1800):
        row = self.state["proposals"].get(proposal_id)
        if not row or row["status"] != "pending_review":
            raise BoundaryError("proposal is absent, expired, or already decided")
        if not reviewer or reviewer == "system":
            raise BoundaryError("a named human reviewer is required")
        if proposal_hash != row["proposal_hash"]:
            raise BoundaryError("approval must match the exact proposal hash")
        if type(ttl_seconds) is not int or not 1 <= ttl_seconds <= 3600:
            raise BoundaryError("approval expiry must be 1 to 3600 seconds")
        approval = {"reviewer": reviewer, "approved": bool(approve), "proposal_hash": proposal_hash,
                    "created_at": _utcnow().isoformat(), "expires_at": (_utcnow().timestamp() + ttl_seconds)}
        row["approval"] = approval
        row["status"] = "approved" if approve else "denied"
        self._save()
        self.event("proposal_decided", proposal_id=proposal_id, proposal_hash=proposal_hash,
                   reviewer=reviewer, decision=row["status"], expires_at=approval["expires_at"])
        self._save()
        return dict(row)

    def apply(self, proposal_id, *, proposal_hash, candidate, independent_check):
        if self.state.get("stopped"):
            raise BoundaryError("company operations are stopped")
        row = self.state["proposals"].get(proposal_id)
        if not row or row["proposal_hash"] != proposal_hash or row["candidate_hash"] != sha256(candidate):
            raise BoundaryError("proposal/candidate identity changed")
        if row["status"] == "applied":
            self.event("apply_replayed", proposal_id=proposal_id, result="idempotent_noop")
            return {"status": "already_applied", "artifact": row.get("artifact")}
        if row["status"] != "approved" or not row["approval"] or not row["approval"]["approved"]:
            raise BoundaryError("human approval required")
        approval = row["approval"]
        if _utcnow().timestamp() > approval["expires_at"]:
            row["status"] = "expired"
            self._save()
            raise BoundaryError("approval expired")
        if row["approval"]["proposal_hash"] != row["proposal_hash"]:
            raise BoundaryError("approval hash mismatch")
        if not callable(independent_check):
            raise BoundaryError("independent check callback required")
        self._budget("applies", 1)
        artifacts = self.root / "artifacts"
        artifacts.mkdir(mode=0o700, exist_ok=True)
        dest = artifacts / f"{proposal_id}.json"
        backup = artifacts / f"{proposal_id}.rollback.json"
        previous = dest.read_bytes() if dest.exists() else None
        try:
            encoded = (json.dumps(candidate, indent=2, sort_keys=True) + "\n").encode()
            temp = dest.with_suffix(".tmp")
            temp.write_bytes(encoded)
            os.replace(temp, dest)
            check = independent_check(dest)
            if check is not True:
                raise BoundaryError("independent check did not return true")
        except Exception as exc:
            if previous is None:
                dest.unlink(missing_ok=True)
            else:
                backup.write_bytes(previous)
                dest.write_bytes(previous)
            self.event("apply_rolled_back", proposal_id=proposal_id, reason=type(exc).__name__)
            self._save()
            raise
        row["status"] = "applied"
        row["artifact"] = str(dest.relative_to(self.root))
        row["applied_hash"] = sha256(encoded)
        row["applied_at"] = _utcnow().isoformat()
        self._save()
        self.event("apply_verified", proposal_id=proposal_id, artifact=row["artifact"],
                   artifact_hash=row["applied_hash"], reviewer=approval["reviewer"])
        self._save()
        return {"status": "applied", "artifact": str(dest), "sha256": row["applied_hash"], "check": "passed"}


def qa_journey(company_id, steps, required):
    """Compare observed local journey events to an explicit required sequence."""
    if not company_id or not isinstance(steps, list) or not isinstance(required, list) or not required:
        raise ValueError("company and nonempty step sequences required")
    _reject_sensitive({"steps":steps,"required":required})
    observed = [s.get("step") for s in steps if s.get("status") == "passed"]
    cursor = 0
    missing = []
    for expected in required:
        try:
            cursor = observed.index(expected, cursor) + 1
        except ValueError:
            missing.append(expected)
    return {"status": "passed" if not missing else "finding", "company_id": company_id,
            "observed_passed_steps": observed, "missing_or_out_of_order": missing,
            "evidence": [{"step": s.get("step"), "status": s.get("status"), "evidence_id": s.get("evidence_id")} for s in steps]}


def reliability_triage(company_id, incidents, *, window_minutes=60, degraded_threshold=2):
    """Classify synthetic/local job outcomes; recommend owner recovery, never restart."""
    if type(window_minutes) is not int or not 1 <= window_minutes <= 10080 or type(degraded_threshold) is not int or degraded_threshold < 1:
        raise ValueError("window must be 1..10080 minutes and threshold a positive integer")
    _reject_sensitive(incidents)
    now=_utcnow()
    rows=[]
    stale=0
    for item in incidents:
        _check_company(item.get("company_id"), company_id)
        at=_timestamp(item["at"])
        if (now-at).total_seconds() < -60:
            raise ValueError("future reliability event")
        if item.get("status") not in {"success", "failure", "timeout", "recovered"}:
            raise ValueError("unknown reliability status")
        if at >= now - timedelta(minutes=window_minutes):
            rows.append(item)
        else:
            stale += 1
    counts=Counter(x["status"] for x in rows)
    failing=counts["failure"]+counts["timeout"]
    state="healthy" if failing == 0 else "degraded" if failing < degraded_threshold else "stop_and_review"
    return {"company_id":company_id,"window_minutes":window_minutes,"observed":dict(counts),"stale_events_excluded":stale,"state":state,
            "recovery":"owner_review_required" if failing else "not_needed","automatic_restart":False,
            "limitations":"Input is caller-supplied local evidence; timestamps are not independently authenticated."}


def onboarding_plan(company_id, required, completed):
    if not company_id or not isinstance(required, list) or len(required) != len(set(required)):
        raise ValueError("unique onboarding requirements required")
    _reject_sensitive({"required":required,"completed":completed})
    done=set(completed)
    if not done <= set(required):
        raise ValueError("completion contains unknown onboarding item")
    return {"company_id":company_id,"completed":sorted(done),"remaining":[x for x in required if x not in done],
            "status":"ready_for_owner_review" if done == set(required) else "in_progress",
            "activation_authorized":False}


def support_answer(company_id, question, approved_docs, *, minimum_overlap=1):
    """Deterministic excerpt selector with citations; low evidence becomes escalation."""
    if not company_id or not isinstance(question,str) or not question.strip():
        raise ValueError("company and question required")
    _reject_sensitive({"question":question})
    words={w.lower() for w in re.findall(r"[A-Za-z0-9]{3,}",question)}
    scored=[]
    for doc in approved_docs:
        _check_company(doc.get("company_id"),company_id)
        if doc.get("approved") is not True or not doc.get("source_id") or not doc.get("text"):
            continue
        _reject_sensitive(doc)
        overlap=words & {w.lower() for w in re.findall(r"[A-Za-z0-9]{3,}",doc["text"])}
        if overlap: scored.append((len(overlap),doc))
    scored.sort(key=lambda item:(-item[0],item[1]["source_id"]))
    if not scored or scored[0][0] < minimum_overlap:
        return {"company_id":company_id,"status":"escalate","answer":None,"citations":[],"reason":"insufficient approved-document match"}
    best=scored[0][0]; selected=[d for n,d in scored if n==best]
    return {"company_id":company_id,"status":"draft_for_human_review","answer":" ".join(d["text"][:1200] for d in selected),
            "citations":[d["source_id"] for d in selected],"send_enabled":False}


def group_feedback(company_id, items):
    buckets=defaultdict(list)
    for row in items:
        _check_company(row.get("company_id"),company_id)
        _reject_sensitive(row)
        tags=row.get("tags")
        if not isinstance(tags,list) or not tags: continue
        for tag in sorted({re.sub(r"\s+"," ",str(t).strip().lower()) for t in tags if str(t).strip()}):
            buckets[tag].append(row)
    return {"company_id":company_id,"groups":[{"topic":tag,"count":len(rows),
            "severity_counts":dict(Counter(r.get("severity","unspecified") for r in rows)),
            "evidence_ids":sorted(str(r.get("evidence_id","")) for r in rows if r.get("evidence_id")),
            "priority":"owner_review"} for tag,rows in sorted(buckets.items(),key=lambda kv:(-len(kv[1]),kv[0]))],
            "priority_policy":"frequency orders review queue only; it is not an automatic roadmap decision"}


def customer_success_flags(company_id, accounts, *, quiet_days=14):
    now=_utcnow()
    _reject_sensitive(accounts)
    out=[]
    for row in accounts:
        _check_company(row.get("company_id"),company_id)
        if "account_id" not in row or "last_meaningful_activity" not in row: raise ValueError("aggregate account key and activity date required")
        age=(now-_timestamp(row["last_meaningful_activity"])).total_seconds()/86400
        out.append({"account_id":row["account_id"],"days_since_meaningful_activity":round(age,2),
                    "flag":"review_possible_disengagement" if age>=quiet_days else "no_flag",
                    "intervention":"human_decides; no message generated or sent"})
    return {"company_id":company_id,"threshold_days":quiet_days,"flags":out,"outbound_enabled":False}


def reconcile_facts(company_id, facts):
    """Keep cited facts and expose conflicting values instead of choosing silently."""
    grouped=defaultdict(list)
    for f in facts:
        _check_company(f.get("company_id"),company_id)
        _reject_sensitive(f)
        if not f.get("key") or not f.get("source_id") or f.get("reviewed") is not True:
            raise ValueError("facts must be reviewed and source-backed")
        grouped[f["key"]].append(f)
    accepted=[]; conflicts=[]
    for key, rows in sorted(grouped.items()):
        values={canonical(row.get("value")) for row in rows}
        if len(values)>1:
            conflicts.append({"key":key,"values":[r.get("value") for r in rows],"source_ids":[r["source_id"] for r in rows]})
        else:
            accepted.append({"key":key,"value":rows[0]["value"],"source_ids":sorted({r["source_id"] for r in rows})})
    return {"company_id":company_id,"facts":accepted,"conflicts":conflicts,"conflicts_auto_resolved":False}


def validate_experiment(company_id, experiment):
    _check_company(experiment.get("company_id"),company_id)
    _reject_sensitive(experiment)
    required=("hypothesis","primary_metric","guardrails","minimum_sample","stop_conditions")
    missing=[k for k in required if not experiment.get(k)]
    sample=experiment.get("minimum_sample")
    if sample is not None and (type(sample) is not int or sample<2): raise ValueError("minimum_sample must be an integer >= 2")
    return {"company_id":company_id,"status":"blocked_missing_design" if missing else "ready_for_human_review",
            "missing":missing,"experiment_execution_enabled":False,"causal_claim_allowed":False}


def handoff_packet(company_id, *, issue, evidence, decision_needed, owner):
    if not all(isinstance(x,str) and x.strip() for x in (issue,decision_needed,owner)) or not isinstance(evidence,list) or not evidence:
        raise ValueError("handoff needs issue, evidence, named owner and explicit decision")
    _reject_sensitive({"issue":issue,"evidence":evidence})
    return {"company_id":company_id,"issue":issue,"evidence":evidence,"decision_needed":decision_needed,
            "owner":owner,"status":"awaiting_human","evidence_hash":sha256(evidence),"actions_taken":[]}


def _dispatch(name, payload):
    company=payload['company_id']
    if name=='qa': return qa_journey(company,payload['steps'],payload['required_steps'])
    if name=='reliability': return reliability_triage(company,payload['incidents'],window_minutes=payload.get('window_minutes',60),degraded_threshold=payload.get('degraded_threshold',2))
    if name=='onboarding': return onboarding_plan(company,payload['required'],payload['completed'])
    if name=='support': return support_answer(company,payload['question'],payload['approved_docs'],minimum_overlap=payload.get('minimum_overlap',1))
    if name=='feedback': return group_feedback(company,payload['items'])
    if name=='customer-success': return customer_success_flags(company,payload['accounts'],quiet_days=payload.get('quiet_days',14))
    if name=='knowledge': return reconcile_facts(company,payload['facts'])
    if name=='experiment': return validate_experiment(company,payload['experiment'])
    if name=='handoff': return handoff_packet(company,issue=payload['issue'],evidence=payload['evidence'],decision_needed=payload['decision_needed'],owner=payload['owner'])
    raise ValueError('workflow must be one of: qa, reliability, onboarding, support, feedback, customer-success, knowledge, experiment, handoff')


def main(argv=None):
    import argparse
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('workflow',choices=['qa','reliability','onboarding','support','feedback','customer-success','knowledge','experiment','handoff'])
    parser.add_argument('--input',required=True,help='JSON fixture/input file; no network access is performed')
    args=parser.parse_args(argv)
    payload=json.loads(Path(args.input).read_text())
    print(json.dumps(_dispatch(args.workflow,payload),indent=2))
    return 0


if __name__=='__main__':
    raise SystemExit(main())
