"""Authored knowledge fixture → separate approval → real Chromium QA → ledger outcome."""
import argparse
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import uuid

from ledger import Ledger
from qa_bridge import SYSTEM, QA_METRIC, QA_SUCCESS, approve, execute, load_config


def prepare(ledger):
    config = load_config(SYSTEM / 'companies/fixture.json')
    text = 'Fixture author: reproduce a counter defect twice, repair an isolated copy, and verify one click adds one.'
    source = ledger.ingest('fixture:counter-qa-method', '2026-09-10', text,
                           'Authored controlled text; no real podcast accessed')
    claim = ledger.claim(source['id'], 0, len(text), 'Fixture proposes reproducible isolated counter QA',
                         'Verify observed behavior before accepting a repair', 'fixture analyst', '2099-01-01')
    proposal = ledger.propose(claim['id'], config['goal'], 'Applies only to the authored counter fixture',
        'Use the canonical counter QA mapping; this text is never executed',
        QA_METRIC, QA_SUCCESS,
        'Keep original source intact and do not release', 'Discard the retained candidate', 1, 0)
    review = ledger.review(proposal['id'], 'fixture knowledge reviewer', 'approved',
                           'Knowledge proposal accepted; execution still requires a separate approval')
    return source, claim, proposal, review


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default=str(Path(__file__).parent / '.integrated-runs'))
    args = parser.parse_args()
    directory = Path(args.output).resolve() / ('integrated-' + uuid.uuid4().hex[:10])
    directory.mkdir(parents=True)
    ledger = Ledger(directory / 'knowledge.db', 'sparktech-fixture')
    config = SYSTEM / 'companies/fixture.json'
    try:
        source, claim, proposal, review = prepare(ledger)
        handoff = ledger.handoff(proposal['id'])
        assert handoff['execution_authorized'] is False
        try:
            execute(ledger, proposal['id'], config, directory / 'runs')
        except ValueError as exc:
            rejected = str(exc)
        else:
            raise AssertionError('Execution without approval must be rejected')
        assert not (directory / 'runs').exists()
        approval = approve(ledger, proposal['id'], config, 'fixture execution operator',
            'Explicitly approve one zero-provider-cost counter repair candidate; no release',
            (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat(), approve_execution=True)
        result = execute(ledger, proposal['id'], config, directory / 'runs', approval['id'])
        assert result['runner']['status'] == 'awaiting_release', result
        assert result['outcome']['result'] == 'supported'
        root = Path(result['runner']['run_path'])
        observed = {stage: json.loads((root / 'evidence' / stage / 'result.json').read_text())['actual']
                    for stage in ['discover', 'reproduce', 'verify']}
        assert observed == dict(discover='2', reproduce='2', verify='1')
        assert not (root.parent / 'current.json').exists()
        records = ledger.list()
        summary = dict(demonstration='authored knowledge + deterministic repair + real browser QA',
            database=str(directory / 'knowledge.db'), source_id=source['id'], claim_id=claim['id'],
            proposal_id=proposal['id'], knowledge_review_id=review['id'],
            rejected_without_execution_approval=rejected, observed=observed, **result)
        (directory / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
        (directory / 'ledger-records.json').write_text(json.dumps(records, indent=2) + '\n')
        print(json.dumps(summary, indent=2))
    finally:
        ledger.close()


if __name__ == '__main__':
    main()
