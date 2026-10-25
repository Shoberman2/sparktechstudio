from datetime import datetime,timedelta,timezone
import tempfile,unittest
from pathlib import Path
from rsei.pilot import evidence
from rsei.value_metrics import validate

class ValueMetricsTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.source=Path(self.tmp.name)/'proof';self.source.write_text('synthetic aggregate/query')
        now=datetime.now(timezone.utc)
        self.row=dict(company_id='utern',metric='meaningful_return_7d',definition_version=1,scope='production',
            window_start=(now-timedelta(days=15)).isoformat(),window_end=(now-timedelta(days=8)).isoformat(),as_of=now.isoformat(),
            numerator=2,denominator=4,tests_excluded=True,deduplicated=True,coverage_complete=True,
            source=evidence(self.source),query_source=evidence(self.source),release={'deployment_id':'fixture','commit':'fixture'},
            evidence_basis='server_meaningful_actions_on_distinct_days')
    def tearDown(self):self.tmp.cleanup()
    def test_valid_rate_and_no_causal_claim(self):
        result=validate(self.row);self.assertEqual(result['rate'],.5);self.assertFalse(result['causal_improvement_verified'])
    def test_empty_is_not_zero_retention(self):
        result=validate({**self.row,'numerator':0,'denominator':0});self.assertIsNone(result['rate'])
    def test_proxy_coverage_privacy_and_immature_cohorts_rejected(self):
        for change in [{'evidence_basis':'last_sign_in_at'}, {'coverage_complete':False}, {'tests_excluded':False},
                       {'private_email':'x@example.test'}, {'numerator':5}, {'window_end':self.row['as_of']}]:
            with self.subTest(change=change),self.assertRaises(ValueError):validate({**self.row,**change})
    def test_changed_source_rejected(self):
        self.source.write_text('changed')
        with self.assertRaises(ValueError):validate(self.row)
