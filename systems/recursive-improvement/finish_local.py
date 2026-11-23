"""Fresh real Chromium repair/release proof, entirely local and deterministic."""
import argparse
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import sys
import uuid

from rsei.runner import SYSTEM, atomic_json, digest, load_config, run_cycle, tree
from rsei.context import reconcile
from rsei.identities import registry, actor
sys.path.insert(0, str(SYSTEM.parent/'knowledge'))
from ledger import Ledger


def proof(output, codex_auth_home=None, claude=False):
    if codex_auth_home and claude:raise SystemExit('Choose one model worker mode')
    # The runner injects ANTHROPIC_API_KEY into the worker stage only; nothing here reads or stores it.
    if claude and not os.environ.get('ANTHROPIC_API_KEY'):raise SystemExit('ANTHROPIC_API_KEY is not set in this environment; no model was invoked')
    output=Path(output).resolve()
    output.mkdir(parents=True,exist_ok=False)
    company='sparktech-fixture'
    model_mode=bool(codex_auth_home or claude)
    worker_label='real Codex model worker' if codex_auth_home else 'real Claude model worker' if claude else 'deterministic fixture worker'
    identities=registry()
    atomic_json(output/'agents.json',identities)
    records=[]
    stamp=datetime.now(timezone.utc)
    sources={
        'product_doc':(SYSTEM/'README.md',{'workload':'existing deliberately broken one-click counter; local fixture only'}),
        'decision':(SYSTEM/'pilot/VALUE-MEASUREMENT.md',{'value':'fixture functional improvement cannot establish company value or retention'}),
        'current_work':(SYSTEM/'pilot/README.md',{'utern_owner':'UTern production is external-owner-only; no actions on UTern'}),
    }
    instructions=output/'accepted-instructions.md'
    instructions.write_text('Operator record of user authorization relayed by origin task: finish a bounded local observation, diagnosis, isolated repair, tests, local release, measurement, retain or owned rollback, and recorded lesson. Follow-up authorization permits a real configured user-local AI worker for this fixture. Reuse existing code and context. No production deployment or company-success claim. Routine user updates muted.\n')
    sources['explicit_instruction']=(instructions,{'execution_scope':'isolated fixture and headless loopback browser; worker mode declared separately; no UTern endpoints or browser sessions'})
    for kind,(path,constraints) in sources.items():
        records.append({'id':kind,'company_id':company,'kind':kind,'reviewed_by':'task operator using existing docs and relayed user authorization',
            'recorded_at':stamp.isoformat(),'valid_until':(stamp+timedelta(hours=2)).isoformat(),
            'source':{'path':str(path),'sha256':digest(path)},'constraints':constraints})
    context=reconcile(company,records)
    if not context['complete']:raise RuntimeError(context['unresolved_gaps'])
    atomic_json(output/'context.json',context)
    config=load_config(SYSTEM/'companies/fixture.json')
    config['context_records']=records
    if codex_auth_home:
        config['worker_kind']='codex-exec'
        config['commands']['worker']=[sys.executable,str(SYSTEM/'adapters/codex_worker.py')]
        config['environment']={'CODEX_AUTH_MODE':'user-local','CODEX_AUTH_HOME':str(Path(codex_auth_home).resolve()),
            'CODEX_EXECUTABLE':'/Applications/ChatGPT.app/Contents/Resources/codex'}
        config['budgets'].update(max_seconds=180,command_seconds=120)
    if claude:
        config['worker_kind']='claude-messages'
        config['commands']['worker']=[sys.executable,str(SYSTEM/'adapters/claude_worker.py')]
        config['secret_env']=['ANTHROPIC_API_KEY']
        config['budgets'].update(max_seconds=180,command_seconds=120)
    atomic_json(output/'worker-mode.json',{'worker':worker_label,
        'auth_scope':'explicit-user-local-ChatGPT' if codex_auth_home else 'ANTHROPIC_API_KEY from the invoking environment' if claude else 'none',
        'no_company_credentials_borrowed':True,
        'model_budget':'one invocation plus at most one explicit model fallback, 120-second command limit; reported usage is not a hard dollar cap' if model_mode else 'no model'})
    original=tree(config['source'])
    approval={'id':uuid.uuid4().hex,'scope':'local-artifact-only','company_id':company,
        'authorization_source':{'path':str(instructions),'sha256':digest(instructions)},
        'config_sha256':hashlib.sha256(json.dumps(config,sort_keys=True).encode()).hexdigest(),
        'source_manifest':original,'worker_kind':config['worker_kind'],'release_local':True}
    atomic_json(output/'execution-scope.json',approval)
    ledger=Ledger(output/'knowledge.sqlite',company)
    try:
        source_text='Hypothesis: the counter fixture repair changes one-click output from 2 to 1, passes independent checks, and remains correct on the next cycle from the local release.'
        source=ledger.ingest('local-counter-proof-hypothesis',stamp.date().isoformat(),source_text,'User-authorized local fixture proof')
        claim=ledger.claim(source['id'],0,len(source_text),source_text,'reproduce-isolate-verify-release-recheck','task operator',(stamp+timedelta(days=1)).date().isoformat())
        proposal=ledger.propose(claim['id'],'One click adds one','Existing controlled fixture, not live customer data',
            'Run existing bounded runner with '+worker_label+' and independent Chromium checks','counter after one click',
            'discover/reproduce=2; verify/release/follow-up=1; source unchanged','No UTern/company data or production releases; only explicitly configured worker authentication and model endpoint in AI mode',
            'Runner restores previous local pointer if release verification fails',1,1 if model_mode else 0)
        ledger.review(proposal['id'],'task operator under explicit user local execution approval','approved','Exact local scope and source reviewed; not authority for any production action')
        first=run_cycle(config,output/'cycles',release=True)
        atomic_json(output/'repair-result.json',first)
        if first['status']!='completed':raise RuntimeError(first)
        run=Path(first['run_path'])
        observations={stage:json.loads((run/'evidence'/stage/'result.json').read_text())['actual']
                      for stage in ('discover','reproduce','verify','release_check')}
        if observations!={'discover':'2','reproduce':'2','verify':'1','release_check':'1'}:raise RuntimeError(observations)
        second=run_cycle(config,output/'cycles',from_current=True)
        atomic_json(output/'follow-up-result.json',second)
        follow=json.loads((Path(second['run_path'])/'evidence/discover/result.json').read_text())
        if second['status']!='healthy' or follow['actual']!='1' or tree(config['source'])!=original:raise RuntimeError('Follow-up or source integrity failed')
        measurement={'scope':'local-fixture','before':2,'after':1,'expected':1,'absolute_error_before':1,'absolute_error_after':0,
            'follow_up':1,'source_unchanged':True,'decision':'retain','production_success':False,
            'customer_value_metrics':{'status':'unmeasured','reason':'fixture observations are ineligible for production value contract'},
            'run_id':first['run_id'] if 'run_id' in first else run.name,'candidate_digest':first['candidate_digest'],
            'actual_commands':first['commands_used']+second['commands_used'],
            'worker_kind':config['worker_kind'],'reported_model_usage':first.get('reported_model_usage',[]),
            'elapsed_seconds':round(first['elapsed_seconds']+second['elapsed_seconds'],3)}
        atomic_json(output/'measurement.json',measurement)
        outcome=ledger.outcome(proposal['id'],'supported',str(output/'measurement.json'),json.dumps(measurement),
            'One controlled counter interaction using '+worker_label+'. No live UTern/customer outcomes, retention or general autonomous intelligence demonstrated.',
            run_id=run.name,candidate_digest=first['candidate_digest'],execution_approval_id=approval['id'])
        atomic_json(output/'knowledge-records.json',ledger.list())
        atomic_json(output/'lesson.json',{'company_id':company,'outcome_id':outcome['id'],
            'lesson':'This controlled repair reduced one-click error from 1 to 0 and remained correct after local release.',
            'source':{'path':str(output/'measurement.json'),'sha256':digest(output/'measurement.json')},
            'disclosure_approved':False,'scope':'bounded fixture finding; not universal fact'})
        events=[{'stage':stage,'actor':actor(identities,stage),'evidence':ref} for stage,ref in [
            ('retrieve_context','context.json'),('observe',str(run/'evidence/discover/result.json')),
            ('diagnose',str(run/'evidence/reproduce/result.json')),('propose','knowledge-records.json'),
            ('implement',str(run/'changes.patch')),('test',str(run/'evidence/test/command.json')),
            ('deploy',str(output/'cycles'/company/'current.json')),('measure','measurement.json'),('retain','measurement.json'),('learn','lesson.json')]]
        atomic_json(output/'stage-index.json',events)
        (output/'REPORT.md').write_text(f'''# Completed local Spark loop proof

Actual Chromium observation → reproduced finding → isolated {worker_label} repair → independent test and browser verification → local artifact release → browser release check → healthy next cycle → retained candidate → source-backed ledger outcome and private lesson.

One click produced **2 before**, **1 after**, **1 from the released candidate**, and **1 in the next cycle**. Source remained unchanged. Executed {measurement['actual_commands']} subprocess commands in {measurement['elapsed_seconds']} seconds. Candidate digest: `{first['candidate_digest']}`. Decision: **retain**. No rollback was necessary in this successful execution; existing fault tests separately cover restoration and post-rollback verification.

See measurement.json, stage-index.json, changes.patch and per-command logs under cycles, Chromium page.png/trace.zip evidence, execution-scope.json, context.json, knowledge.sqlite and knowledge-records.json. Each stage carries a stable role identity; roles are metadata, not six autonomous services. Proposal review and local execution scope are recorded separately; lessons confer no permissions.

This is a real local execution against an intentionally broken fixture, with {worker_label}. It is not a live company pilot success, production release or retention measurement. The production value contract intentionally rejects fixture evidence. UTern release and live browser ownership remain external.

## Remaining live dependencies

- Company-specific reviewed adapters, isolated execution environment, credentials and budget controls before unattended model repair.
- UTern owner evidence for authenticated/core journeys and consented participant/provider receipts; no fixture substitute.
- Verified employer/student intake, skill provenance, appropriate match and mutual consent; separate external Apply receipt with human final Submit.
- Delivered introduction, reply processing, actual booking/conflict/cancellation and STOP receipts from controlled participants.
- Governed production cohort exports with query/source provenance, test exclusions, complete coverage and mature outcome windows before customer-value/return claims.
- Explicit bounded release ownership and exact production measurement receipts for each future change; this local completion grants none.
''')
        atomic_json(output/'artifact-manifest.json',tree(output))
        return {'status':'completed-local-proof','report':str(output/'REPORT.md'),**measurement}
    finally:ledger.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',required=True)
    parser.add_argument('--codex-auth-home',help='Explicit documented local Codex login directory; fixture only, no credential copying')
    parser.add_argument('--claude',action='store_true',help='Use the tool-free Claude patch worker; needs ANTHROPIC_API_KEY in the environment')
    args=parser.parse_args();print(json.dumps(proof(args.output,args.codex_auth_home,args.claude),indent=2))
