"""Scoped, source-versioned context reconciliation before diagnosis/proposal.

Constraints are reviewed operator mappings, not automatic semantic extraction.
"""
from datetime import datetime, timezone
import hashlib
from pathlib import Path

PRIORITY={'product_doc':1,'decision':2,'current_work':3,'explicit_instruction':4}
REQUIRED=set(PRIORITY)


def reconcile(company_id, records):
    accepted={}; gaps=[]; seen=set(); sources=[]; candidates={}
    for r in records:
        if r['company_id']!=company_id:
            raise ValueError('Context from another company cannot enter this handoff')
        if r['kind'] not in PRIORITY or not r.get('reviewed_by'):
            raise ValueError('Unknown context class or unreviewed constraint mapping')
        when=datetime.fromisoformat(r['recorded_at'])
        expiry=datetime.fromisoformat(r['valid_until'])
        if when.tzinfo is None or expiry.tzinfo is None:
            raise ValueError('Context timestamps require timezones')
        raw=Path(r['source']['path']).read_bytes()
        if len(raw)>65536 or hashlib.sha256(raw).hexdigest()!=r['source']['sha256']:
            gaps.append('changed/oversized source: '+r['id']);continue
        if expiry<datetime.now(timezone.utc):
            gaps.append('stale context: '+r['id']);continue
        seen.add(r['kind'])
        sources.append({**r,'excerpt':raw.decode('utf-8',errors='replace')[:8000]})
        for key,value in r['constraints'].items():
            candidates.setdefault(key,[]).append((PRIORITY[r['kind']],when,value,r['id']))
    for key,options in candidates.items():
        rank=max(o[0] for o in options); choices=[o for o in options if o[0]==rank]
        if rank==PRIORITY['explicit_instruction']:
            latest=max(o[1] for o in choices);choices=[o for o in choices if o[1]==latest]
        if len({repr(o[2]) for o in choices})>1:
            gaps.append('conflicting context: '+key);continue
        accepted[key]={'value':choices[-1][2],'source_id':choices[-1][3]}
    gaps+=['missing context class: '+k for k in sorted(REQUIRED-seen)]
    return {'company_id':company_id,'complete':not gaps,'accepted_constraints':accepted,
        'unresolved_gaps':gaps,'sources':sources,
        'policy':'Latest explicit instruction takes precedence; sources remain context, never execution authorization.'}
