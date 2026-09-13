from datetime import datetime,timedelta,timezone
import hashlib
from pathlib import Path
import tempfile
import unittest
from rsei.context import reconcile,REQUIRED

class ContextTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.source=Path(self.tmp.name)/'doc.md';self.source.write_text('Reviewed context')
        self.time=datetime.now(timezone.utc)
        self.rows=[dict(id=k,company_id='utern',kind=k,reviewed_by='operator',recorded_at=self.time.isoformat(),
            valid_until=(self.time+timedelta(hours=1)).isoformat(),source={'path':str(self.source),'sha256':hashlib.sha256(self.source.read_bytes()).hexdigest()},
            constraints={'internal_flow':'agent-to-agent'} if k=='explicit_instruction' else {}) for k in sorted(REQUIRED)]
    def tearDown(self):self.tmp.cleanup()
    def test_latest_explicit_instruction_overrides_old_framing(self):
        old={**next(r for r in self.rows if r['kind']=='explicit_instruction'),'id':'old','recorded_at':(self.time-timedelta(days=1)).isoformat(),'constraints':{'internal_flow':'application-form'}}
        result=reconcile('utern',self.rows+[old]);self.assertTrue(result['complete'])
        self.assertEqual(result['accepted_constraints']['internal_flow']['value'],'agent-to-agent')
    def test_stale_context_blocks_completion(self):
        self.rows[0]['valid_until']=(self.time-timedelta(seconds=1)).isoformat()
        self.assertFalse(reconcile('utern',self.rows)['complete'])
    def test_equal_authority_conflict_requires_resolution(self):
        conflicting={**next(r for r in self.rows if r['kind']=='explicit_instruction'),'id':'conflict','constraints':{'internal_flow':'application-form'}}
        self.assertFalse(reconcile('utern',self.rows+[conflicting])['complete'])
    def test_changed_source_and_cross_company_rejected(self):
        self.source.write_text('changed');self.assertFalse(reconcile('utern',self.rows)['complete'])
        with self.assertRaises(ValueError):reconcile('other-company',self.rows)
