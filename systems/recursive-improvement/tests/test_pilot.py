import copy
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest
from rsei.pilot import Pilot, SYSTEM, evidence, now
from rsei.identities import registry


class PilotTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.root=Path(self.tmp.name).resolve()
        self.policy=json.loads((SYSTEM/'pilot/utern.json').read_text())
        self.policy['mode']='fixture'
        self.p=Pilot(self.root/'run',self.policy)
        self.base={'deployment_id':'fixture-base','commit':'base-sha'}
        self.candidate={'deployment_id':'fixture-candidate','commit':'candidate-sha'}
        self.source=self.root/'proof.json';self.source.write_text('{}')
        self.p.propose(self.base,self.candidate)

    def tearDown(self): self.tmp.cleanup()

    def metric(self,name,status='passed',target=None,scope='preview',timestamp=None):
        self.p.observe(name,status,status=='passed',scope,'fixture',timestamp or now(),evidence(self.source),target or self.candidate)

    def ready(self):
        for m in self.policy['predeploy_metrics']: self.metric(m)

    def deployed(self):
        self.ready()
        a=self.p.authorize('deploy',self.policy['release_owner'],self.base)
        self.p.fixture_dispatch(a)
        return a

    def test_real_fixture_subprocess_deploy_measure_retain(self):
        self.deployed()
        for m in self.policy['retain_metrics']: self.metric(m,scope='production')
        self.assertEqual(self.p.evaluate(),'retain')
        self.p.report()
        self.assertEqual(json.loads((self.p.path/'fixture-current.json').read_text()),self.candidate)
        self.assertFalse(json.loads((self.p.path/'lesson.json').read_text())['disclosure_approved'])

    def test_real_fixture_subprocess_rollback_requires_reverification(self):
        for m in self.policy['retain_metrics']: self.metric(m,target=self.base,scope='production')
        self.deployed();self.metric('sign_in','failed',scope='production')
        self.assertEqual(self.p.evaluate(),'rollback_required')
        a=self.p.authorize('rollback',self.policy['release_owner'],self.candidate)
        self.p.fixture_dispatch(a)
        self.assertEqual(self.p.evaluate(),'rollback_check_required')
        for m in self.policy['retain_metrics']: self.metric(m,target=self.base,scope='production')
        self.assertEqual(self.p.evaluate(),'restored_verified')
        self.assertEqual(json.loads((self.p.path/'fixture-current.json').read_text()),self.base)

    def test_missing_apply_cannot_be_replaced_by_signin(self):
        self.deployed();self.metric('sign_in',scope='production')
        self.assertEqual(self.p.evaluate(),'measurement_blocked')
        self.assertIn('sandbox_apply_receipt',self.p.state['blockers'])

    def test_wrong_release_stale_or_conflicting_evidence_blocks(self):
        self.ready()
        self.metric('regression_suite','failed',target=self.base)
        self.assertEqual(self.p.evaluate(),'ready_for_owner_deploy')
        self.source.write_text('changed')
        self.assertEqual(self.p.evaluate(),'blocked_before_deploy')
        old=(datetime.now(timezone.utc)-timedelta(days=1)).isoformat()
        self.p.state['metrics']=[]
        for m in self.policy['predeploy_metrics']:self.metric(m,timestamp=old)
        self.assertEqual(self.p.evaluate(),'blocked_before_deploy')
        stamp=now();self.metric('regression_suite',timestamp=stamp);self.metric('regression_suite','failed',timestamp=stamp)
        self.assertEqual(self.p.gate('regression_suite',self.candidate,'preview'),'conflicting observations')

    def test_live_policy_rejects_fixture_and_dispatch(self):
        p=copy.deepcopy(self.policy);p['mode']='external-owner'
        real=Pilot(self.root/'real',p)
        with self.assertRaises(ValueError): real.observe('auth_service','passed',True,'production','fixture',now(),evidence(self.source),self.candidate)
        with self.assertRaises(ValueError): real.fixture_dispatch({})

    def test_owner_identity_replay_and_current_release_gates(self):
        self.ready()
        for owner,current in [('wrong',self.base),(self.policy['release_owner'],self.candidate)]:
            with self.assertRaises(ValueError): self.p.authorize('deploy',owner,current)
        a=self.p.authorize('deploy',self.policy['release_owner'],self.base)
        self.p.fixture_dispatch(a)
        with self.assertRaises(ValueError): self.p.fixture_dispatch(a)

    def test_cross_company_bundle_and_private_values_rejected(self):
        p=self.root/'bundle.json';p.write_text(json.dumps({'company_id':'other','owner':self.policy['release_owner'],'observations':[]}))
        with self.assertRaises(ValueError): self.p.import_bundle(p)
        with self.assertRaises(ValueError): self.p.observe('x','passed','customer@email.test','production','fixture',now(),evidence(self.source))

    def test_identity_snapshot_and_no_permission_fields(self):
        original=(self.p.path/'agents.json').read_text()
        self.p.event('observe')
        item=json.loads((self.p.path/'events.jsonl').read_text().splitlines()[-1])
        self.assertEqual(item['actor']['name'],'Pip')
        changed=registry();changed['agents'][0]['permissions']=['deploy']
        path=self.root/'bad-agents.json';path.write_text(json.dumps(changed))
        with self.assertRaises(ValueError):registry(path)
        self.assertEqual((self.p.path/'agents.json').read_text(),original)


if __name__=='__main__':unittest.main()
