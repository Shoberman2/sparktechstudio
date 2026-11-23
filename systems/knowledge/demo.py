"""Controlled end-to-end demonstration; all observations are synthetic."""
import json
import tempfile
from pathlib import Path
from ledger import Ledger

with tempfile.TemporaryDirectory() as tmp:
    k = Ledger(str(Path(tmp) / 'demo.db'), 'sparktech-fixture')
    text = 'HOST: Try removing optional signup fields and measure completed signups.\nHOST: This worked for us; it might not work for you.'
    s = k.ingest('fixture:founder-learning-podcast', '2026-09-10', text, 'Authored controlled fixture, no real podcast retrieved')
    passage = k.candidates(s['id'])[0]
    c = k.claim(s['id'], passage['start'], passage['end'], 'Speaker claims shorter signup may help',
                'Test optional field removal', 'fixture analyst', '2099-01-01')
    p = k.propose(c['id'], 'Reduce signup friction', 'Eligible only if removed fields are optional',
                  'Prepare one optional-field variant', 'completed / started signups',
                  'Pre-register sample size and minimum effect before real traffic',
                  'Preserve consent and qualification requirements', 'Restore original form', 14, 0)
    k.review(p['id'], 'fixture owner', 'approved', 'Approve preparation only; no operational rollout')
    request = k.handoff(p['id'])
    o = k.outcome(p['id'], 'inconclusive', 'fixture:synthetic-counts', 'Control 10/20; variant 11/20',
                  'Synthetic tiny sample; not evidence of effectiveness')
    shared = k.share(o['id'], 'Optional-field experiments require measured outcomes and preserved consent.', 'fixture owner', True)
    k.ingest(s['identity'], '2026-09-11', 'HOST: Correction: retain required qualification fields.', 'Authored fixture', s['id'])
    print(json.dumps(dict(demonstration='CONTROLLED FIXTURE, NOT LIVE COMPANY DATA',
                          source=s, claim=c, reviewed_request=request, outcome=o,
                          shared=k.export_lesson(shared['id']), after_update=k.health(c['id'])), indent=2))
    k.close()
