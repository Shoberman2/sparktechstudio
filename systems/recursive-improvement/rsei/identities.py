"""Presentation identities are versioned evidence metadata, never authorization."""
import json
from pathlib import Path

STAGES = {'retrieve_context':'observer', 'discover':'observer', 'observe':'observer', 'reproduce':'observer',
          'diagnose':'diagnostician', 'propose':'diagnostician', 'implement':'builder',
          'test':'verifier', 'verify':'verifier', 'release_check':'verifier',
          'deploy':'release-operator', 'releasing':'release-operator', 'rollback':'release-operator',
          'measure':'outcome-analyst', 'retain':'outcome-analyst', 'learn':'outcome-analyst'}


def registry(path=None):
    data = json.loads(Path(path or Path(__file__).resolve().parents[1] / 'agents.json').read_text())
    assert data['schema_version'] == 1
    agents = data['agents']
    required = {'id','version','name','role','personality','visual','capability'}
    if any(set(a) != required or type(a['version']) is not int or a['version'] < 1 for a in agents):
        raise ValueError('Identity schema cannot contain permissions or execution commands')
    if len({a['id'] for a in agents}) != len(agents) or set(STAGES.values()) - {a['id'] for a in agents}:
        raise ValueError('Missing or duplicate stable identity')
    return data


def actor(snapshot, stage):
    identity = STAGES.get(stage, 'outcome-analyst')
    return next(a for a in snapshot['agents'] if a['id'] == identity)
