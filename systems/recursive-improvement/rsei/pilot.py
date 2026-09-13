"""UTern evidence-driven pilot. External owners perform live repair/deploy/rollback."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid

from .identities import registry, actor
from .context import reconcile
from .runner import SYSTEM, atomic_json, company_lock, digest


def now():
    return datetime.now(timezone.utc).isoformat()


def age(timestamp):
    stamp = datetime.fromisoformat(timestamp)
    if stamp.tzinfo is None:
        raise ValueError('Evidence timestamp must include timezone')
    return (datetime.now(timezone.utc) - stamp).total_seconds()


def release(value,allow_pending=False):
    if not isinstance(value, dict) or set(value) != {'deployment_id', 'commit'} or not value['commit'] or (not allow_pending and not value['deployment_id']):
        raise ValueError('Exact deployment ID and commit required')
    return value


def evidence(path):
    p = Path(path).resolve()
    return {'path':str(p), 'sha256':digest(p)}


def verify_ref(ref):
    return Path(ref['path']).is_file() and digest(ref['path']) == ref['sha256']


class Pilot:
    def __init__(self, directory, policy=None):
        self.path = Path(directory).resolve()
        if policy is not None:
            if self.path.exists():
                raise ValueError('Run already exists')
            if policy['company_id'] != 'utern' or policy['mode'] not in ('external-owner','fixture'):
                raise ValueError('This pilot is scoped to independent UTern only')
            self.path.mkdir(parents=True, mode=0o700)
            atomic_json(self.path/'policy.json', policy)
            atomic_json(self.path/'agents.json', registry())
            atomic_json(self.path/'state.json', {'run_id':self.path.name,'company_id':'utern','created_at':now(),
                'status':'observing','metrics':[], 'receipts':[], 'approvals':[], 'probes_used':0})
        self.policy = json.loads((self.path/'policy.json').read_text())
        self.identities = json.loads((self.path/'agents.json').read_text())
        self.state = json.loads((self.path/'state.json').read_text())

    def event(self, stage, **details):
        self.state['updated_at'] = now()
        atomic_json(self.path/'state.json', self.state)
        with (self.path/'events.jsonl').open('a') as f:
            f.write(json.dumps({'at':now(),'company_id':'utern','run_id':self.state['run_id'],
                'stage':stage,'actor':actor(self.identities,stage),**details})+'\n')

    def observe(self, metric, status, value, scope, method, captured_at, ref, release_identity=None):
        if status not in ('passed','failed','blocked','unknown') or scope not in ('production','preview','local'):
            raise ValueError('Invalid observation status or scope')
        if method not in ('read-only-get','owner-report','fixture') or (method=='fixture' and self.policy['mode']!='fixture'):
            raise ValueError('Fixture evidence cannot establish a live pilot gate')
        if value is not None and (type(value) not in (int,float,bool) or not math.isfinite(value)):
            raise ValueError('Only aggregate numeric/boolean values, never customer data')
        if age(captured_at) < -60 or not verify_ref(ref):
            raise ValueError('Future or altered evidence')
        if release_identity is not None:
            release(release_identity)
        row = dict(metric=metric,status=status,value=value,scope=scope,method=method,
            captured_at=captured_at,evidence=ref,release=release_identity)
        self.state['metrics'].append(row)
        self.event('observe', observation=row)

    def import_bundle(self, path):
        bundle = json.loads(Path(path).read_text())
        if bundle.get('company_id') != 'utern' or bundle.get('owner') not in (self.policy['release_owner'],self.policy['recovery_owner']):
            raise ValueError('Wrong company or evidence owner')
        # Source references are checked individually; an owner name is a local attestation, not authentication.
        for row in bundle['observations']:
            self.observe(**row)
        self.event('observe', imported_bundle=evidence(path), owner=bundle['owner'])

    def context(self, records):
        snapshot=reconcile('utern',records)
        atomic_json(self.path/'context.json',snapshot)
        self.state['context_complete']=snapshot['complete']
        self.event('retrieve_context',complete=snapshot['complete'],gaps=snapshot['unresolved_gaps'])
        return snapshot

    def probe(self, name):
        urls = {'catalog':'https://utern.ai/api/opportunities?filter=mentorship&limit=5&preview=1',
                'mcp':'https://utern.ai/api/mcp/health',
                'auth-reachability':'https://bqhtqrufsazxkmcfgrlt.supabase.co/auth/v1/settings'}
        if name not in urls or self.state['probes_used'] >= self.policy['max_probes']:
            raise ValueError('Probe not allowlisted or budget exhausted')
        self.state['probes_used'] += 1
        self.event('observe', probe_started=name)
        started = time.monotonic()
        code, body = None, b''
        try:
            # No cookies, credentials, redirects, private bodies or browser sessions.
            class NoRedirect(urllib.request.HTTPRedirectHandler):
                def redirect_request(self, *args): return None
            opener = urllib.request.build_opener(NoRedirect)
            with opener.open(urllib.request.Request(urls[name], headers={'User-Agent':'SparkTech-UTern-readonly-pilot/1'}), timeout=self.policy['max_probe_seconds']) as response:
                code=response.status
                body=response.read(self.policy['max_probe_bytes']+1)
        except urllib.error.HTTPError as exc:
            code=exc.code
        except (OSError, urllib.error.URLError):
            pass
        payload = {}
        if len(body) <= self.policy['max_probe_bytes']:
            try: payload=json.loads(body)
            except (ValueError,UnicodeError): pass
        if not isinstance(payload,dict): payload={}
        elapsed=round((time.monotonic()-started)*1000,2)
        # Deliberately discard response content; save only allowlisted aggregate fields.
        result={'url':urls[name], 'captured_at':now(), 'http_status':code,'latency_ms':elapsed,
                'available':payload.get('available') if type(payload.get('available')) is bool else None,
                'oversize':len(body)>self.policy['max_probe_bytes']}
        dest=self.path/f'probe-{name}-{self.state["probes_used"]}.json'
        atomic_json(dest,result)
        metric={'catalog':'catalog_available','mcp':'mcp_reachable','auth-reachability':'auth_endpoint_reachable'}[name]
        ok=(code==200 and result['available'] is True) if name=='catalog' else code is not None and code<500
        status='passed' if ok else 'failed'
        self.observe(metric,status,ok,'production','read-only-get',result['captured_at'],evidence(dest))
        if name=='catalog':
            self.observe('catalog_latency_ms','passed' if elapsed<=self.policy['catalog_latency_limit_ms'] else 'failed',elapsed,'production','read-only-get',result['captured_at'],evidence(dest))
        return result

    def gate(self, metric, target, scope, after=None):
        rows=[m for m in self.state['metrics'] if m['metric']==metric and m['release']==target and m['scope']==scope]
        if not rows: return 'missing exact-release evidence'
        newest=max(datetime.fromisoformat(m['captured_at']) for m in rows)
        latest=[m for m in rows if datetime.fromisoformat(m['captured_at'])==newest]
        if after and newest < datetime.fromisoformat(after): return 'evidence predates release action'
        if len({(m['status'],m['value']) for m in latest})>1: return 'conflicting observations'
        row=latest[-1]
        if age(row['captured_at'])>self.policy['max_evidence_age_seconds']: return 'stale evidence'
        if not verify_ref(row['evidence']): return 'evidence integrity failed'
        return None if row['status']=='passed' else row['status']

    def validate_context(self):
        if self.policy['mode']!='fixture':
            if not (self.path/'context.json').exists():
                raise ValueError('Retrieve relevant product, decisions, current work and latest instructions before proposal')
            snapshot=json.loads((self.path/'context.json').read_text())
            refreshed=reconcile('utern',snapshot['sources'])
            if not refreshed['complete']: raise ValueError('Context is stale, changed or conflicting; reconcile before proposal')
    def propose(self, base, candidate):
        self.validate_context()
        self.state.update(base=release(base),candidate=release(candidate,allow_pending=True))
        failures=[m['metric'] for m in self.state['metrics'] if m['status']=='failed']
        infra=[m for m in failures if m in ('auth_service','auth_endpoint_reachable','catalog_available','model_generation')]
        self.event('diagnose', infrastructure_signals=infra, code_evidence=[m for m in failures if m not in infra],
                   caveat='Unknown provider funding is not a code bug; availability is not user-journey proof')
        self.state['proposal']={'assigned_owner':self.policy['release_owner'],'assigned_identity':actor(self.identities,'implement'),
            'action':'Consume designated owner repair, test and release evidence; coordinate isolated repairs with that owner',
            'base':base,'candidate':candidate,'repair_permission':self.policy['repair_permission']}
        if (self.path/'context.json').exists():self.state['proposal']['context_reference']=evidence(self.path/'context.json')
        self.event('propose',proposal=self.state['proposal'])
        return self.evaluate()

    def evaluate(self):
        self.validate_context()
        candidate=self.state.get('candidate')
        if candidate is None: raise ValueError('Exact candidate identity required')
        if not candidate['deployment_id']:
            self.state.update(status='awaiting_candidate_identity',blockers={'deployment_id':'Owner has not supplied an exact candidate deployment identity'})
            self.event('test',decision=self.state['status'],blockers=self.state['blockers'])
            return self.state['status']
        deployed=any(r['action']=='deploy' and r['status']=='succeeded' for r in self.state['receipts'])
        rollbacks=[r for r in self.state['receipts'] if r['action']=='rollback']
        if rollbacks:
            target=self.state['base']
            blockers={m:reason for m in self.policy['retain_metrics'] if (reason:=self.gate(m,target,'production',after=rollbacks[-1]['captured_at']))}
            decision=('rollback_failed_owner_action_required' if rollbacks[-1]['status']=='failed' else
                      'rollback_check_required' if blockers else 'restored_verified')
            self.state.update(status=decision,blockers=blockers)
            self.event('measure',decision=decision,blockers=blockers)
            return decision
        required=self.policy['retain_metrics'] if deployed else self.policy['predeploy_metrics']
        scope='production' if deployed else 'preview'
        blockers={m:reason for m in required if (reason:=self.gate(m,candidate,scope,after=next((r['captured_at'] for r in reversed(self.state['receipts']) if r['action']=='deploy' and r['status']=='succeeded'),None)))}
        decision=('rollback_required' if deployed and any(v=='failed' for v in blockers.values()) else
                  'measurement_blocked' if deployed and blockers else 'retain' if deployed else
                  'blocked_before_deploy' if blockers else 'ready_for_owner_deploy')
        self.state.update(status=decision,blockers=blockers)
        atomic_json(self.path/'evaluation.json',{'at':now(),'decision':decision,'blockers':blockers,
            'candidate':candidate,'scope':scope,'mode':self.policy['mode']})
        self.event('measure' if deployed else 'test',decision=decision,blockers=blockers)
        return decision

    def authorize(self, action, owner, current_release):
        decision=self.evaluate()
        if owner!=self.policy['release_owner'] or current_release!=(self.state['base'] if action=='deploy' else self.state['candidate']):
            raise ValueError('Wrong owner or current deployment identity')
        if (action,decision) not in [('deploy','ready_for_owner_deploy'),('rollback','rollback_required')]:
            raise ValueError('Verification gate does not permit this action')
        if any(a['action']==action and not a['used'] for a in self.state['approvals']):
            raise ValueError('An action approval already exists; do not race the release owner')
        item={'id':uuid.uuid4().hex,'action':action,'owner':owner,'from':current_release,
              'to':self.state['candidate'] if action=='deploy' else self.state['base'], 'used':False,'created_at':now()}
        self.state['approvals'].append(item)
        self.event(action,authorization=item)
        return item

    def receipt(self, path):
        r=json.loads(Path(path).read_text())
        a=next((a for a in self.state['approvals'] if a['id']==r.get('approval_id')),None)
        if not a or a['used'] or age(a['created_at'])>600: raise ValueError('Missing, expired or used action approval')
        for k in ('action','owner','from','to'):
            if r.get(k)!=a[k]: raise ValueError('Receipt does not match authorized release')
        if r.get('company_id')!='utern' or r.get('mode')!=self.policy['mode'] or r.get('status') not in ('succeeded','failed') or not verify_ref(r['evidence']):
            raise ValueError('Invalid receipt company/mode/status/evidence')
        if not 0<=age(r['captured_at'])<600: raise ValueError('Stale receipt')
        a['used']=True
        self.state['receipts'].append(r)
        self.event(r['action'],receipt=r,source=evidence(path))
        if r['action']=='rollback':
            self.state['status']='rollback_check_required' if r['status']=='succeeded' else 'rollback_failed_owner_action_required'
            self.event('rollback',status=self.state['status'])
        return r

    def fixture_dispatch(self, approval):
        if self.policy['mode']!='fixture': raise ValueError('Live deploy/rollback belongs exclusively to external owner; import its verified receipt')
        saved=next((a for a in self.state['approvals'] if a['id']==approval.get('id')),None)
        if not saved or saved['used'] or saved.get('dispatched') or age(saved['created_at'])>600:
            raise ValueError('Fixture approval cannot be replayed')
        expected='ready_for_owner_deploy' if saved['action']=='deploy' else 'rollback_required'
        if self.evaluate()!=expected: raise ValueError('Gate changed before dispatch')
        saved['dispatched']=True
        self.event(saved['action'],dispatch_started=saved['id'])
        request=self.path/f'action-{approval["id"]}.json'
        atomic_json(request,dict(approval,company_id='utern',mode='fixture'))
        subprocess.run([sys.executable,str(SYSTEM/'pilot/fixture_release.py'),str(request)],
                       check=True,timeout=5,env={'PATH':'/usr/bin:/bin'},cwd=self.path)
        return self.receipt(request.with_suffix('.receipt.json'))

    def report(self):
        comparisons=[]
        for metric in sorted({m['metric'] for m in self.state['metrics']}):
            pairs=[]
            for target in (self.state.get('base'),self.state.get('candidate')):
                rows=[m for m in self.state['metrics'] if target and m['release']==target and m['metric']==metric and m['scope']=='production']
                pairs.append(max(rows,key=lambda m:m['captured_at']) if rows else None)
            before,after=pairs
            comparable=bool(before and after and after['captured_at']>=before['captured_at'] and
                all(m['status'] in ('passed','failed') and verify_ref(m['evidence']) for m in pairs))
            comparisons.append({'metric':metric,'baseline':before,'outcome':after,'comparable':comparable,
                'delta':after['value']-before['value'] if comparable and all(type(m['value']) in (int,float) for m in pairs) else None})
        atomic_json(self.path/'comparisons.json',comparisons)
        lines=['# UTern pilot outcome',f'Run: {self.state["run_id"]}',f'Status: {self.state["status"]}',
               f'Mode: {self.policy["mode"]}; UTern is independent of SparkTech.','',
               '| Metric | Status | Value | Scope | Evidence time |','|---|---|---|---|---|']
        for m in self.state['metrics']:
            lines.append(f'| {m["metric"]} | {m["status"]} | {m["value"]} | {m["scope"]} | {m["captured_at"]} |')
        lines+=['','## Release and decision',json.dumps({k:self.state.get(k) for k in ('base','candidate','blockers')},indent=2),
                '', 'No sign-in, model generation, application receipt or meeting success is inferred from public service availability.',
                'Live repair/deploy/rollback is owned externally. Fixture receipts are never accepted as live deployment evidence.',
                '', '## Provisional internal identities']
        lines += [f'- {a["name"]} ({a["id"]} v{a["version"]}): {a["role"]}; {a["personality"]}. Capability: {a["capability"]}.' for a in self.identities['agents']]
        (self.path/'REPORT.md').write_text('\n'.join(lines)+'\n')
        # Private references stay in this company's run. No automatic public/customer data export.
        atomic_json(self.path/'lesson.json',{'company_id':'utern','run_id':self.state['run_id'],'decision':self.state['status'],
            'source_evidence':[m['evidence'] for m in self.state['metrics']],
            'proposed_general_lesson':'Keep service reachability, authenticated journeys and release verification as separate gates.',
            'disclosure_approved':False,'epistemic_status':'bounded pilot evaluation; not universal fact'})
        self.event('learn',lesson='lesson.json',automatic_sharing=False)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('action',choices=['init','probe','context','import','propose','evaluate','authorize','receipt','report'])
    p.add_argument('--run',required=True); p.add_argument('--input'); p.add_argument('--probe')
    args=p.parse_args()
    with company_lock(Path(args.run).resolve().parent,'utern-pilot-lock'):
        policy=json.loads((SYSTEM/'pilot/utern.json').read_text()) if args.action=='init' else None
        pilot=Pilot(args.run,policy)
        if args.action=='probe': pilot.probe(args.probe)
        if args.action=='import': pilot.import_bundle(args.input)
        if args.action=='context': pilot.context(json.loads(Path(args.input).read_text()))
        if args.action=='propose': pilot.propose(**json.loads(Path(args.input).read_text()))
        if args.action=='evaluate': pilot.evaluate()
        if args.action=='authorize':
            approval=pilot.authorize(**json.loads(Path(args.input).read_text()))
            atomic_json(pilot.path/f'authorization-{approval["id"]}.json',approval)
        if args.action=='receipt': pilot.receipt(args.input)
        pilot.report()
        print(json.dumps({'run':str(pilot.path),'status':pilot.state['status']},indent=2))


if __name__=='__main__': main()
