"""LOCAL protocol fixture, never a UTern provider deployment."""
from datetime import datetime, timezone
import hashlib,json
from pathlib import Path
import sys
r=Path(sys.argv[1]); request=json.loads(r.read_text())
assert request['mode']=='fixture'
pointer=r.parent/'fixture-current.json'
if pointer.exists():
    assert json.loads(pointer.read_text())==request['from'], 'current identity drift'
pointer.write_text(json.dumps(request['to']))
proof=r.with_suffix('.proof.json')
proof.write_text(json.dumps({'mode':'fixture','observed_pointer':request['to']}))
receipt=dict(request, approval_id=request['id'],status='succeeded',captured_at=datetime.now(timezone.utc).isoformat(),
             evidence={'path':str(proof),'sha256':hashlib.sha256(proof.read_bytes()).hexdigest()})
r.with_suffix('.receipt.json').write_text(json.dumps(receipt,indent=2))
