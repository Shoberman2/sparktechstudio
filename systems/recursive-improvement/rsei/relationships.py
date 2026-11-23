"""Spark-owned adapter to UTern's EXISTING relationship APIs, not a second engine.

No matching algorithm, mail sender, consent database, reply classifier or calendar
engine is duplicated. Those remain UTern-hosted capabilities with server checks.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import time
import urllib.error
import urllib.request
import uuid

from .runner import atomic_json,company_lock
from .identities import registry,actor
from .context import reconcile

# Existing route contracts inspected at UTern d78986e7. Public capability tokens
# are read only from configured environment slots and are never written to evidence.
OPERATIONS={
 'workspace':('GET','/api/connections/workspace',False),
 'membership':('GET','/api/connections/membership',False),
 'profile_update':('PATCH','/api/connections/profile',False),
 'membership_update':('PUT','/api/connections/membership',True),
 'employer_intake':('POST','/api/recruiting/mandates',False),
 'discover_matches':('POST','/api/connections/discover',False),
 'introduction_draft':('POST','/api/connections/introductions',False),
 'introduction_decision':('PATCH','/api/connections/introductions/{id}',True),
 'recipient_decision':('POST','/api/connections/respond/{token}',True),
 'meeting_prepare':('POST','/api/connections/meetings',False),
 'offer_times':('POST','/api/connections/meetings/{id}/invite',True),
 'choose_time':('POST','/api/connections/schedule/{token}',True),
 'meeting_update':('PATCH','/api/connections/meetings/{id}',True),
 'stop':('POST','/api/connections/opt-out/{token}',True),
 'onboarding_status':('GET','/api/connections/email-onboarding',False),
 'onboarding_start':('POST','/api/connections/email-onboarding',True),
 'onboarding_stop':('DELETE','/api/connections/email-onboarding',True),
 'conversation_inbox':('GET','/api/recruiting/mandates/{id}/replies',False),
 'retry_failed_reply':('POST','/api/recruiting/mandates/{id}/replies',True),
}


def fingerprint(value):return hashlib.sha256(json.dumps(value,sort_keys=True).encode()).hexdigest()


class UTernRelationships:
    def __init__(self,policy,root):
        if policy.get('company_id')!='utern' or policy.get('base_url')!='https://utern.ai':
            raise ValueError('UTern adapter cannot act on another company or origin')
        self.policy=policy;self.root=Path(root).resolve();self.root.mkdir(parents=True,exist_ok=True,mode=0o700)

    def validate(self,request):
        context = reconcile('utern', self.policy.get('context_records', []))
        if not context['complete']:
            raise ValueError('Retrieve and reconcile current company context before relationship actions')
        op=request['operation']
        if op not in OPERATIONS or op not in self.policy['enabled_operations']:
            raise ValueError('Operation is not enabled for this company')
        participant=self.policy['actors'].get(request['actor_id'])
        if not participant:raise ValueError('A consenting authorized test identity is required')
        method,path,human=OPERATIONS[op]
        if human and request.get('decision_authority')!='human':
            raise ValueError('Agent conversation cannot establish human consent or selection')
        if '{id}' in path:
            resource=request.get('resource_id','')
            if resource not in participant.get('resource_ids',[]) or not re.fullmatch(r'[a-fA-F0-9-]{36}',resource):
                raise ValueError('Resource is outside this actor scope')
            path=path.replace('{id}',resource)
        if request.get('body',{}).get('contact_id') and request['body']['contact_id'] not in participant.get('contact_ids',[]):
            raise ValueError('Contact is not in the authorized participant scope')
        if '{token}' in path:
            name=request.get('capability_env')
            if name not in participant.get('capability_envs',[]):raise ValueError('Capability is outside actor scope')
        return method,path,participant

    def approve(self,request,reviewer,explicit=False):
        self.validate(request)
        if explicit is not True or not reviewer:raise ValueError('Explicit approval of this exact action required')
        approval={'id':uuid.uuid4().hex,'company_id':'utern','request_digest':fingerprint(request),
            'policy_digest':fingerprint(self.policy),'reviewer':reviewer,'expires_at':time.time()+600}
        atomic_json(self.root/f'{approval["id"]}.approval.json',approval)
        return approval

    def execute(self,request,approval_id):
        with company_lock(self.root,'utern-relationship-actions'):
            if not isinstance(approval_id,str) or not re.fullmatch(r'[a-f0-9]{32}',approval_id):
                raise ValueError('Invalid approval identity')
            method,path,participant=self.validate(request)
            a=json.loads((self.root/f'{approval_id}.approval.json').read_text())
            if a['request_digest']!=fingerprint(request) or a['policy_digest']!=fingerprint(self.policy) or a['expires_at']<time.time():
                raise ValueError('Action or policy changed, or approval expired')
            if len(list(self.root.glob('*.attempt.json')))>=self.policy['max_actions']:raise ValueError('Action budget exhausted')
            token=os.environ.get(participant['bearer_env'])
            if not token:raise ValueError('Actor session credential unavailable; no request sent')
            if '{token}' in path:
                capability=os.environ.get(request['capability_env'],'')
                if not re.fullmatch(r'[A-Za-z0-9_-]{16,256}',capability):raise ValueError('Recipient capability unavailable')
                path=path.replace('{token}',capability)
            # Claim before the network call. Unknown results cannot be automatically retried.
            with (self.root/f'{approval_id}.attempt.json').open('x') as f:
                json.dump({'operation':request['operation'],'started_at':time.time(),'request_digest':a['request_digest']},f)
            status=None;response_body=b'';failure=None
            class NoRedirect(urllib.request.HTTPRedirectHandler):
                def redirect_request(self,*args):return None
            try:
                headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'}
                opener=urllib.request.build_opener(NoRedirect)
                with opener.open(urllib.request.Request(self.policy['base_url']+'/api/connections/workspace',headers=headers),timeout=self.policy['request_timeout_seconds']) as check:
                    identity_body=check.read(1048577)
                    if len(identity_body)>1048576 or json.loads(identity_body).get('profile',{}).get('user_id')!=request['actor_id']:
                        raise ValueError('Authenticated session does not belong to approved actor')
                body=None if method in ('GET','DELETE') else json.dumps(request.get('body',{})).encode()
                with opener.open(urllib.request.Request(self.policy['base_url']+path,data=body,headers=headers,method=method),timeout=self.policy['request_timeout_seconds']) as response:
                    status=response.status;response_body=response.read(1048577)
            except urllib.error.HTTPError as exc:status=exc.code
            except OSError:failure='network-outcome-unknown; reconcile server state before any new action'
            except (ValueError,UnicodeError):failure='identity-verification-failed; no authorized action sent'
            summary={'company_id':'utern','operation':request['operation'],'approval_id':approval_id,
                'captured_at':time.time(),'http_status':status,'transport_success':bool(status and 200<=status<300),
                'response_sha256':hashlib.sha256(response_body).hexdigest(),'failure':failure,
                'journey_verified':False,'actor_identity':actor(registry(),'verify'),
                'limitations':'HTTP success is not delivery, mutual consent, verified skills, human selection or calendar receipt.'}
            atomic_json(self.root/f'{approval_id}.receipt.json',summary)
            # Caller may inspect private server data in-memory; no contact/message data enters shared artifacts.
            return summary,response_body


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('action',choices=['plan','approve','execute'])
    p.add_argument('--policy',required=True);p.add_argument('--request',required=True);p.add_argument('--state-root',required=True)
    p.add_argument('--reviewer');p.add_argument('--approve-action',action='store_true');p.add_argument('--approval-id')
    args=p.parse_args();os.umask(0o077)
    api=UTernRelationships(json.loads(Path(args.policy).read_text()),args.state_root)
    req=json.loads(Path(args.request).read_text())
    if args.action=='plan':
        method,path,_=api.validate(req);result={'method':method,'route_template':OPERATIONS[req['operation']][1],'execution_authorized':False}
    elif args.action=='approve':result=api.approve(req,args.reviewer,args.approve_action)
    else:result,_=api.execute(req,args.approval_id)
    print(json.dumps(result,indent=2))


if __name__=='__main__':main()
