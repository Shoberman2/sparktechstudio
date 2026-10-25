import json,os,tempfile,unittest,hashlib
from datetime import datetime,timedelta,timezone
from pathlib import Path
from unittest.mock import patch
from rsei.relationships import UTernRelationships

class Response:
    status=200
    def __init__(self,body):self.body=json.dumps(body).encode()
    def __enter__(self):return self
    def __exit__(self,*args):pass
    def read(self,*args):return self.body

class RelationshipTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.actor='11111111-1111-1111-1111-111111111111'
        self.policy={'company_id':'utern','base_url':'https://utern.ai','actors':{self.actor:{'bearer_env':'TEST_BEARER','resource_ids':[]}},
            'enabled_operations':['workspace','membership_update'],'max_actions':3,'request_timeout_seconds':2}
        source=self.root/'context.md';source.write_text('Reviewed synthetic fixture context')
        self.policy['context_records']=[{'id':kind,'company_id':'utern','kind':kind,'reviewed_by':'test',
            'recorded_at':datetime.now(timezone.utc).isoformat(),
            'valid_until':(datetime.now(timezone.utc)+timedelta(hours=1)).isoformat(),
            'source':{'path':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},'constraints':{}}
            for kind in ('product_doc','decision','current_work','explicit_instruction')]
        self.api=UTernRelationships(self.policy,self.root)
        self.req={'operation':'workspace','actor_id':self.actor}
    def tearDown(self):self.tmp.cleanup()
    def test_no_unlisted_actor_operation_or_human_consent_inference(self):
        for req in [{**self.req,'actor_id':'other'},{**self.req,'operation':'send_campaign'},
                    {**self.req,'operation':'membership_update','decision_authority':'agent'}]:
            with self.assertRaises(ValueError):self.api.validate(req)
    def test_changed_request_requires_new_exact_approval(self):
        a=self.api.approve(self.req,'reviewer',True)
        with self.assertRaises(ValueError):self.api.execute({**self.req,'extra':'changed'},a['id'])
    def test_credentials_missing_never_calls_network(self):
        a=self.api.approve(self.req,'reviewer',True)
        with patch.dict(os.environ,{},clear=True),patch('urllib.request.build_opener') as network:
            with self.assertRaises(ValueError):self.api.execute(self.req,a['id'])
            network.assert_not_called()
    def test_real_transport_contract_redacts_private_data_and_does_not_claim_journey(self):
        a=self.api.approve(self.req,'reviewer',True)
        with patch.dict(os.environ,{'TEST_BEARER':'secret'}),patch('urllib.request.build_opener') as factory:
            factory.return_value.open.side_effect=[Response({'profile':{'user_id':self.actor}}),Response({'private_email':'private@example.test'})]
            summary,body=self.api.execute(self.req,a['id'])
            self.assertTrue(summary['transport_success']);self.assertFalse(summary['journey_verified'])
            self.assertNotIn('private@example.test',(self.root/f'{a["id"]}.receipt.json').read_text())
            self.assertIn(b'private@example.test',body)
            with self.assertRaises(FileExistsError):self.api.execute(self.req,a['id'])
    def test_wrong_authenticated_actor_stops_before_mutation(self):
        req={**self.req,'operation':'membership_update','decision_authority':'human','body':{'consent':True}}
        a=self.api.approve(req,'reviewer',True)
        with patch.dict(os.environ,{'TEST_BEARER':'secret'}),patch('urllib.request.build_opener') as factory:
            factory.return_value.open.return_value=Response({'profile':{'user_id':'other'}})
            summary,_=self.api.execute(req,a['id'])
            self.assertEqual(factory.return_value.open.call_count,1)
            self.assertFalse(summary['transport_success'])
    def test_changed_context_stops_approved_execution_before_network(self):
        a=self.api.approve(self.req,'reviewer',True)
        (self.root/'context.md').write_text('Changed after approval')
        with patch('urllib.request.build_opener') as network:
            with self.assertRaises(ValueError):self.api.execute(self.req,a['id'])
            network.assert_not_called()
    def test_company_and_origin_cannot_be_changed(self):
        with self.assertRaises(ValueError):UTernRelationships({**self.policy,'base_url':'https://example.test'},self.root)

if __name__=='__main__':unittest.main()
