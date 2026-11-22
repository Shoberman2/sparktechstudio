import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from rsei.operations import (Operations, customer_success_flags, group_feedback, handoff_packet,
    onboarding_plan, qa_journey, reconcile_facts, reliability_triage, support_answer,
    validate_experiment)
from rsei.runner import BoundaryError


class OperationsGovernanceTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.ops=Operations(self.temp.name,'demo-co',max_input_bytes=20000)
        self.input={'company_id':'demo-co','source_ids':['synthetic-1']}
        self.candidate={'finding':'expected button unavailable'}
        self.proposal=self.ops.propose('qa',self.input,self.candidate,evidence_ids=['synthetic-1'])
    def tearDown(self): self.temp.cleanup()
    def approved(self):
        return self.ops.decide(self.proposal['id'],reviewer='owner@example.invalid',approve=True,proposal_hash=self.proposal['proposal_hash'])
    def test_exact_hash_human_gate_denial_and_replay(self):
        with self.assertRaises(BoundaryError): self.ops.apply(self.proposal['id'],proposal_hash=self.proposal['proposal_hash'],candidate=self.candidate,independent_check=lambda p: True)
        self.ops.decide(self.proposal['id'],reviewer='owner',approve=False,proposal_hash=self.proposal['proposal_hash'])
        with self.assertRaises(BoundaryError): self.ops.apply(self.proposal['id'],proposal_hash=self.proposal['proposal_hash'],candidate=self.candidate,independent_check=lambda p: True)
        self.assertEqual(self.ops.state['proposals'][self.proposal['id']]['status'],'denied')
    def test_approval_mutation_and_company_boundary_rejected(self):
        with self.assertRaises(BoundaryError): self.ops.propose('qa',{'company_id':'other-co'},self.candidate)
        with self.assertRaises(BoundaryError): self.ops.decide(self.proposal['id'],reviewer='owner',approve=True,proposal_hash='0'*64)
        with self.assertRaises(BoundaryError): self.ops.propose('qa',self.input,{'email':'a@example.com'})
    def test_independent_failure_rolls_back_then_success_is_idempotent(self):
        self.approved()
        target=self.ops.root/'artifacts'/f"{self.proposal['id']}.json"
        with self.assertRaises(BoundaryError): self.ops.apply(self.proposal['id'],proposal_hash=self.proposal['proposal_hash'],candidate=self.candidate,independent_check=lambda p: False)
        self.assertFalse(target.exists())
        # Failed verification is fail-closed; a new proposal and approval are required.
        p=self.ops.propose('qa',self.input,self.candidate)
        self.ops.decide(p['id'],reviewer='owner',approve=True,proposal_hash=p['proposal_hash'])
        ok=self.ops.apply(p['id'],proposal_hash=p['proposal_hash'],candidate=self.candidate,independent_check=lambda p: json.loads(p.read_text())==self.candidate)
        self.assertEqual(ok['status'],'applied')
        again=self.ops.apply(p['id'],proposal_hash=p['proposal_hash'],candidate=self.candidate,independent_check=lambda p: False)
        self.assertEqual(again['status'],'already_applied')
    def test_budget_or_capability_change_requires_explicit_migration(self):
        with self.assertRaises(BoundaryError): Operations(self.temp.name,'demo-co',max_input_bytes=30000)
    def test_human_stop_blocks_new_proposals_and_apply(self):
        self.approved()
        self.ops.stop(reviewer='SparkTech owner',reason='Fixture approval boundary review')
        with self.assertRaises(BoundaryError): self.ops.propose('qa',self.input,self.candidate)
        with self.assertRaises(BoundaryError): self.ops.apply(self.proposal['id'],proposal_hash=self.proposal['proposal_hash'],candidate=self.candidate,independent_check=lambda p: True)
        self.assertTrue(self.ops.state['stopped'])
        self.ops.clear_stop(reviewer='SparkTech owner')
        self.assertFalse(self.ops.state['stopped'])
    def test_ledger_hash_chain(self):
        self.approved()
        rows=[json.loads(x) for x in self.ops.ledger_path.read_text().splitlines()]
        self.assertEqual(rows[0]['previous_hash'],'0'*64)
        self.assertEqual(rows[-1]['previous_hash'],rows[-2]['event_hash'])
        rows[-1]['kind']='tampered'
        self.ops.ledger_path.write_text('\n'.join(json.dumps(x) for x in rows)+'\n')
        with self.assertRaises(BoundaryError): self.ops.event('check')


class WorkflowTests(unittest.TestCase):
    def setUp(self): self.co='demo-co'
    def test_qa_sequence_detects_missing_and_out_of_order(self):
        out=qa_journey(self.co,[{'step':'login','status':'passed'},{'step':'save','status':'passed'}],['login','edit','save'])
        self.assertEqual(out['status'],'finding'); self.assertEqual(out['missing_or_out_of_order'],['edit'])
        with self.assertRaises(BoundaryError): qa_journey(self.co,[{'step':'support','email':'person@example.com'}],['support'])
    def test_reliability_stops_without_automatic_restart(self):
        now=datetime.now(timezone.utc).isoformat()
        out=reliability_triage(self.co,[{'company_id':self.co,'at':now,'status':'timeout'},{'company_id':self.co,'at':now,'status':'failure'}])
        self.assertEqual(out['state'],'stop_and_review'); self.assertFalse(out['automatic_restart'])
        with self.assertRaises(BoundaryError): reliability_triage(self.co,[{'company_id':'other','at':now,'status':'success'}])
    def test_onboarding_and_support_grounding(self):
        self.assertEqual(onboarding_plan(self.co,['terms','setup'],['terms'])['remaining'],['setup'])
        docs=[{'company_id':self.co,'approved':True,'source_id':'handbook-v2#refund','text':'Refund requests are reviewed by the support team within five business days.'}]
        matched=support_answer(self.co,'How long for refund requests?',docs)
        self.assertEqual(matched['status'],'draft_for_human_review'); self.assertEqual(matched['citations'],['handbook-v2#refund']); self.assertFalse(matched['send_enabled'])
        self.assertEqual(support_answer(self.co,'Can you diagnose this?',docs)['status'],'escalate')
    def test_feedback_grouping_is_transparent_and_company_scoped(self):
        rows=[{'company_id':self.co,'tags':['login','Login'],'severity':'high','evidence_id':'e1'}, {'company_id':self.co,'tags':['login'],'severity':'low','evidence_id':'e2'}]
        result=group_feedback(self.co,rows)
        self.assertEqual(result['groups'][0]['count'],2); self.assertEqual(result['groups'][0]['topic'],'login')
        with self.assertRaises(BoundaryError): group_feedback(self.co,[{'company_id':'other','tags':['x']}])
    def test_success_flags_only_review_and_no_message(self):
        out=customer_success_flags(self.co,[{'company_id':self.co,'account_id':'synthetic-account','last_meaningful_activity':(datetime.now(timezone.utc)-timedelta(days=20)).isoformat()}])
        self.assertEqual(out['flags'][0]['flag'],'review_possible_disengagement'); self.assertFalse(out['outbound_enabled'])
    def test_facts_expose_conflict_and_experiment_blocks_missing_design(self):
        facts=[{'company_id':self.co,'key':'owner','value':'A','source_id':'doc1','reviewed':True},{'company_id':self.co,'key':'owner','value':'B','source_id':'doc2','reviewed':True}]
        self.assertEqual(len(reconcile_facts(self.co,facts)['conflicts']),1)
        self.assertFalse(reconcile_facts(self.co,facts)['conflicts_auto_resolved'])
        self.assertEqual(validate_experiment(self.co,{'company_id':self.co})['status'],'blocked_missing_design')
        good={'company_id':self.co,'hypothesis':'Change may increase task completion','primary_metric':'completed_tasks','guardrails':['error_rate'],'minimum_sample':20,'stop_conditions':['error_rate > 2%']}
        self.assertEqual(validate_experiment(self.co,good)['status'],'ready_for_human_review')
        self.assertFalse(validate_experiment(self.co,good)['experiment_execution_enabled'])
    def test_handoff_requires_evidence_named_owner_and_decision(self):
        p=handoff_packet(self.co,issue='Repeated test failure',evidence=['run-1/test.json'],decision_needed='Approve fixture scope or stop',owner='QA lead')
        self.assertEqual(p['status'],'awaiting_human'); self.assertEqual(p['actions_taken'],[])
        with self.assertRaises(ValueError): handoff_packet(self.co,issue='x',evidence=[],decision_needed='y',owner='z')


if __name__=='__main__': unittest.main()
