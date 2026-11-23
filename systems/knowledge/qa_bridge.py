"""Trusted local fixture bridge. Knowledge review and execution approval are distinct."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sys

from ledger import Ledger, required

RUNNER_ROOT = Path(__file__).resolve().parents[1] / 'recursive-improvement'
sys.path.insert(0, str(RUNNER_ROOT))
from rsei.runner import SYSTEM, digest, load_config, run_cycle  # noqa: E402

QA_METRIC = 'Counter after one browser click'
QA_SUCCESS = 'Reproduced 2 before repair; verified 1 after repair'


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def binding(ledger, proposal_id, config_path):
    request = ledger.handoff(proposal_id)  # Re-read current review, stale sources and conflicts.
    config = load_config(config_path)
    canonical = load_config(SYSTEM / 'companies/fixture.json')
    if ledger.tenant != config['company_id'] or request['company_id'] != config['company_id']:
        raise ValueError('company mismatch')
    # Deliberately one reviewed mapping. Transcript/action strings never become commands.
    if config != canonical:
        raise ValueError('bridge supports only the reviewed canonical counter fixture configuration')
    if request['proposal']['goal'] != config['goal'] or request['proposal']['budget_usd'] != 0:
        raise ValueError('proposal must match fixture goal and zero provider-spend scope')
    if request['proposal']['metric'] != QA_METRIC or request['proposal']['success_rule'] != QA_SUCCESS:
        raise ValueError('proposal measurement must match the bounded counter QA experiment')
    source = Path(config['source'])
    files = {name: digest(source / name) for name in config['source_files']}
    adapters = {name: digest(SYSTEM / 'adapters' / name) for name in
                ['browser.cjs', 'fixture_worker.py', 'fixture_test.py']}
    return config, request, dict(company_id=ledger.tenant, proposal_id=proposal_id,
        review_id=request['review']['id'], handoff_digest=fingerprint(request),
        config_digest=fingerprint(config), source_digest=fingerprint(files),
        source_manifest=files, adapters_digest=fingerprint(adapters),
        runner_digest=digest(SYSTEM / 'rsei/runner.py'), release_local=False)


def approve(ledger, proposal_id, config_path, approved_by, rationale, expires_at, approve_execution=False):
    if approve_execution is not True:
        raise ValueError('distinct explicit execution approval required')
    required(approved_by); required(rationale)
    expiry = datetime.fromisoformat(expires_at)
    if expiry.tzinfo is None or expiry <= datetime.now(timezone.utc):
        raise ValueError('execution approval needs a future timezone-aware expiry')
    with ledger.db:
        ledger.db.execute('BEGIN IMMEDIATE')
        _, _, bound = binding(ledger, proposal_id, config_path)
        return ledger._add('execution_approval', **bound, approved_by=approved_by,
            rationale=rationale, expires_at=expiry.isoformat(), execution_authorized=True,
            scope='controlled fixture candidate only; no release or model calls')


def execute(ledger, proposal_id, config_path, state_root, approval_id=None):
    if not approval_id:
        raise ValueError('distinct explicit execution approval required')
    # Claim once in a short SQLite write transaction; do not hold it across the browser run.
    with ledger.db:
        ledger.db.execute('BEGIN IMMEDIATE')
        approval = ledger.get(approval_id, 'execution_approval')
        if approval.get('execution_authorized') is not True:
            raise ValueError('execution not authorized')
        if datetime.fromisoformat(approval['expires_at']) <= datetime.now(timezone.utc):
            raise ValueError('execution approval expired')
        config, request, bound = binding(ledger, proposal_id, config_path)
        if any(approval.get(k) != v for k, v in bound.items()):
            raise ValueError('execution approval no longer matches current reviewed inputs')
        attempts = [a for a in ledger.list('execution_attempt') if a['approval_id'] == approval_id]
        if attempts:
            raise ValueError('execution approval already used; inspect recorded attempt, never replay')
        attempt = ledger._add('execution_attempt', approval_id=approval_id, proposal_id=proposal_id,
                              binding=bound, state_root=str(Path(state_root).resolve()))
    try:
        # The existing runner owns all stages, budgets, locks and verification.
        result = run_cycle({**config, 'approved_source_manifest': bound['source_manifest']}, state_root, release=False)
    except Exception as exc:
        ledger._add('execution_error', attempt_id=attempt['id'], error=str(exc))
        raise
    current = True
    try:
        current = fingerprint(ledger.handoff(proposal_id)) == bound['handoff_digest']
    except ValueError:
        current = False
    observed = {}
    if result['status'] == 'awaiting_release':
        try:
            root = Path(result['run_path'])
            manifest = json.loads((root / 'evidence-manifest.json').read_text())
            for stage in ['discover', 'reproduce', 'verify']:
                report = root / 'evidence' / stage / 'result.json'
                if digest(report) != manifest[f'{stage}/result.json']:
                    raise ValueError('evidence integrity mismatch')
                observed[stage] = json.loads(report.read_text())['actual']
        except (OSError, ValueError, KeyError):
            observed = {'error': 'verified measurements unavailable'}
    supported = result['status'] == 'awaiting_release' and current and observed == dict(discover='2', reproduce='2', verify='1')
    # This mapping reports observed fixture correctness, never business lift or universal advice.
    outcome = ledger.outcome(proposal_id, 'supported' if supported else 'inconclusive',
        str(Path(result['run_path']) / 'evidence-manifest.json'),
        f"Controlled counter QA runner returned {result['status']}; observations={json.dumps(observed, sort_keys=True)}; current review unchanged={current}.",
        'Authored source and deterministic repair. Real browser verification of this fixture only; '
        'no AI extraction, AI repair, podcast retrieval, business effect, or production release.',
        run_id=result['run_id'], candidate_digest=result.get('candidate_digest'),
        execution_approval_id=approval_id)
    ledger._add('execution_result', attempt_id=attempt['id'], approval_id=approval_id,
                outcome_id=outcome['id'], run_id=result['run_id'], status=result['status'])
    return dict(approval_id=approval_id, attempt_id=attempt['id'], runner=result, outcome=outcome)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['approve', 'execute'])
    parser.add_argument('--db', required=True)
    parser.add_argument('--company', required=True)
    parser.add_argument('--proposal', required=True)
    parser.add_argument('--config', default=str(SYSTEM / 'companies/fixture.json'))
    parser.add_argument('--state-root', default=str(SYSTEM / '.runs'))
    parser.add_argument('--approval-id')
    parser.add_argument('--approve-execution', action='store_true')
    parser.add_argument('--approved-by')
    parser.add_argument('--rationale')
    parser.add_argument('--expires-at')
    args = parser.parse_args()
    os.umask(0o077)
    ledger = Ledger(args.db, args.company)
    try:
        if args.action == 'approve':
            result = approve(ledger, args.proposal, args.config, args.approved_by,
                             args.rationale, args.expires_at, args.approve_execution)
        else:
            result = execute(ledger, args.proposal, args.config, args.state_root, args.approval_id)
        print(json.dumps(result, indent=2))
    finally:
        ledger.close()


if __name__ == '__main__':
    main()
