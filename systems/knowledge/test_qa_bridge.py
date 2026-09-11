from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from ledger import Ledger
from integrated_demo import prepare
from qa_bridge import SYSTEM, approve, execute, digest


class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.k = Ledger(self.root / 'ledger.db', 'sparktech-fixture')
        self.source, self.claim, self.proposal, self.review = prepare(self.k)
        self.config = SYSTEM / 'companies/fixture.json'

    def tearDown(self):
        self.k.close()
        self.temp.cleanup()

    def approve(self, explicit=True):
        return approve(self.k, self.proposal['id'], self.config, 'execution reviewer', 'fixture only',
                       (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(), explicit)

    def execute(self, approval_id=None):
        return execute(self.k, self.proposal['id'], self.config, self.root / 'runs', approval_id)

    def assert_rejected(self, operation):
        with patch('qa_bridge.run_cycle') as runner:
            with self.assertRaises(ValueError):
                operation()
            runner.assert_not_called()

    def test_knowledge_review_is_not_execution_approval(self):
        self.assertFalse(self.k.handoff(self.proposal['id'])['execution_authorized'])
        self.assert_rejected(lambda: self.execute())
        self.assert_rejected(lambda: self.approve(False))

    def test_handoff_record_cannot_be_used_as_execution_approval(self):
        self.assert_rejected(lambda: self.execute(self.review['id']))

    def test_source_correction_invalidates_existing_execution_approval(self):
        approval = self.approve()
        self.k.ingest(self.source['identity'], '2026-09-11', 'Correction: reassess method',
                      'fixture', self.source['id'])
        self.assert_rejected(lambda: self.execute(approval['id']))

    def test_conflicting_knowledge_invalidates_execution_approval(self):
        approval = self.approve()
        self.k.flag(self.claim['id'], 'Conflicting evidence requires reassessment')
        self.assert_rejected(lambda: self.execute(approval['id']))

    def test_stale_knowledge_invalidates_execution_approval(self):
        approval = self.approve()
        original = self.k.health
        with patch.object(self.k, 'health', side_effect=lambda claim: original(claim, '2100-01-01')):
            self.assert_rejected(lambda: self.execute(approval['id']))

    def test_changed_review_needs_new_execution_approval(self):
        approval = self.approve()
        self.k.review(self.proposal['id'], 'owner', 'approved', 'New review still needs execution binding')
        self.assert_rejected(lambda: self.execute(approval['id']))

    def test_revoked_review_blocks_execution(self):
        approval = self.approve()
        self.k.review(self.proposal['id'], 'owner', 'rejected', 'Stop')
        self.assert_rejected(lambda: self.execute(approval['id']))

    def test_expired_execution_approval_rejected(self):
        approval = self.approve()
        with patch('qa_bridge.datetime') as clock:
            clock.fromisoformat.side_effect = datetime.fromisoformat
            clock.now.return_value = datetime.now(timezone.utc) + timedelta(days=1)
            self.assert_rejected(lambda: self.execute(approval['id']))

    def test_company_config_mismatch_rejected(self):
        wrong = json.loads(self.config.read_text())
        wrong['company_id'] = 'other-company'
        file = self.root / 'wrong.json'
        file.write_text(json.dumps(wrong))
        self.config = file
        self.assert_rejected(lambda: self.approve())

    def test_cross_tenant_approval_cannot_be_read(self):
        approval = self.approve()
        other = Ledger(self.root / 'ledger.db', 'other-company')
        try:
            self.assert_rejected(lambda: execute(other, self.proposal['id'], self.config,
                                                self.root / 'runs', approval['id']))
        finally:
            other.close()

    def test_changed_source_or_adapter_invalidates_approval(self):
        approval = self.approve()
        with patch('qa_bridge.digest', side_effect=lambda path: 'changed-' + digest(path)):
            self.assert_rejected(lambda: self.execute(approval['id']))

    def test_claimed_attempt_cannot_replay_after_interruption(self):
        approval = self.approve()
        self.k._add('execution_attempt', approval_id=approval['id'], proposal_id=self.proposal['id'])
        self.assert_rejected(lambda: self.execute(approval['id']))

    def test_failed_runner_records_inconclusive_linked_outcome(self):
        approval = self.approve()
        with patch('qa_bridge.run_cycle', return_value=dict(status='failed', run_id='test-double-run', run_path=str(self.root / 'test-evidence'))) as runner:
            result = self.execute(approval['id'])
            self.assertEqual(result['outcome']['result'], 'inconclusive')
            self.assertEqual(result['outcome']['execution_approval_id'], approval['id'])
            self.assertEqual(result['outcome']['run_id'], 'test-double-run')
            self.assertFalse(runner.call_args.kwargs['release'])
        self.assert_rejected(lambda: self.execute(approval['id']))

    def test_review_change_during_runner_cannot_be_reported_as_supported(self):
        approval = self.approve()
        def runner(*args, **kwargs):
            self.k.review(self.proposal['id'], 'owner', 'rejected', 'Revoked during execution')
            return dict(status='awaiting_release', run_id='test-double-run', run_path=str(self.root / 'test-evidence'))
        with patch('qa_bridge.run_cycle', side_effect=runner):
            self.assertEqual(self.execute(approval['id'])['outcome']['result'], 'inconclusive')

    def test_non_fixture_success_measure_cannot_be_automatically_supported(self):
        fields = {key: value for key, value in self.proposal.items()
                  if key not in ('id', 'kind', 'tenant', 'recorded_at')}
        fields['success_rule'] = 'Prove business revenue lift'
        self.proposal = self.k.propose(**fields)
        self.k.review(self.proposal['id'], 'owner', 'approved', 'Needs its own measurement mapping')
        self.assert_rejected(lambda: self.approve())


if __name__ == '__main__':
    unittest.main()
