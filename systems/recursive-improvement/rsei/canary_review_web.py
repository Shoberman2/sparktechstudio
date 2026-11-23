"""Loopback-only browser review for a single expiring email canary challenge.

This standard-library server has no send endpoint, public bind option, external
assets, or credential storage. Approve/deny still authenticate via the injected
MSAL reviewer adapter before the controller records a decision.
"""
from __future__ import annotations

from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import hmac
import ipaddress
import json
import secrets
import threading
import time
import argparse
import webbrowser
from urllib.parse import urlsplit

from .canary_review import ReviewCard
from .email_pilot import CanaryBlocked


_PAGE = r'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Message review</title>
<style nonce="__NONCE__">
:root{color-scheme:light;font:16px/1.5 system-ui,-apple-system,sans-serif;color:#18181b;background:#f4f4f5}
body{max-width:760px;margin:32px auto;padding:0 18px}main{background:white;border:1px solid #d4d4d8;border-radius:10px;padding:24px}
h1{font-size:1.5rem;margin:0 0 8px}p{color:#52525b}.fields{display:grid;grid-template-columns:140px 1fr;gap:8px 14px;margin:20px 0}.label{color:#71717a}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#fafafa;border:1px solid #e4e4e7;padding:14px;border-radius:6px;font:inherit;min-height:90px}
.hash{font:12px ui-monospace,monospace;overflow-wrap:anywhere}.actions{display:flex;gap:10px;margin-top:18px}button{font:inherit;padding:9px 14px;border:1px solid #a1a1aa;border-radius:6px;background:white;cursor:pointer}button.primary{background:#18181b;color:white}button:disabled{opacity:.45;cursor:not-allowed}#status{min-height:1.5em}label{display:block;margin-top:12px}
</style></head><body><main><h1>Review exact message</h1>
<p>Approving records a one-message decision only. This page cannot send email.</p>
<div class="fields"><span class="label">Company</span><span id="company"></span><span class="label">Sender</span><span id="sender"></span><span class="label">Recipient</span><span id="recipient"></span><span class="label">Category</span><span id="category"></span><span class="label">Subject</span><span id="subject"></span><span class="label">Expires</span><span id="expires"></span><span class="label">Messages allowed</span><span id="limit"></span></div>
<strong>Exact plain-text body</strong><pre id="body"></pre><div>Content SHA-256: <span class="hash" id="hash"></span></div>
<label><input id="ack" type="checkbox"> I reviewed this exact message and recipient.</label>
<div class="actions"><button id="approve" class="primary" disabled>Approve exact message</button><button id="deny" disabled>Deny</button><button id="cancel">Cancel review</button></div>
<p id="status" role="status" aria-live="polite">Loading review…</p></main>
<script nonce="__NONCE__">
(async()=>{
 const byId=id=>document.getElementById(id), fields=["company","sender","recipient","category","subject","expires","limit","body","hash"];
 const put=(id,value)=>{byId(id).textContent=String(value??"")}; let csrf="", data=null;
 async function load(){const res=await fetch('/api/review',{cache:'no-store',credentials:'same-origin'});if(!res.ok)throw Error('Review session unavailable');data=await res.json();csrf=data.csrf;const r=data.review;
  for(const [id,key] of [["company","company_id"],["sender","sender"],["recipient","recipient"],["category","category"],["subject","subject"],["expires","approval_expires_at"],["limit","max_messages"],["body","text_body"],["hash","message_hash"]])put(id,r[key]);
  const active=data.state==='awaiting_human_approval';byId('ack').checked=Boolean(data.acknowledged);byId('ack').disabled=!active;byId('approve').disabled=!(active&&data.acknowledged);byId('deny').disabled=!(active&&data.acknowledged);byId('cancel').disabled=!active;
  put('status',active?(data.acknowledged?'Acknowledged. Choose approve or deny; no email will be sent.':'Review the exact message and acknowledge it to enable a decision.'):`Review is ${data.state}. No further action is available.`);
 }
 byId('ack').addEventListener('change',async()=>{const ok=Boolean(data&&data.state==='awaiting_human_approval'&&byId('ack').checked);byId('approve').disabled=true;byId('deny').disabled=true;if(!ok)return;put('status','Recording acknowledgement…');try{const res=await fetch('/api/decision',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({decision:'acknowledge',challenge_hash:data.review.challenge_hash,message_hash:data.review.message_hash})});const result=await res.json();if(!res.ok)throw Error(result.error||'Acknowledgement failed');data.acknowledged=true;byId('approve').disabled=false;byId('deny').disabled=false;put('status','Acknowledged. Choose approve or deny; no email will be sent.')}catch(e){byId('ack').checked=false;put('status',String(e.message||e));await load()}});
 async function act(decision){if(!data||(decision!=='cancel'&&!byId('ack').checked)||data.state!=='awaiting_human_approval')return;
  byId('approve').disabled=true;byId('deny').disabled=true;byId('cancel').disabled=true;put('status',decision==='cancel'?'Cancelling review…':'Authenticating reviewer…');
  try{const res=await fetch('/api/decision',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({decision,challenge_hash:data.review.challenge_hash,message_hash:data.review.message_hash})});const result=await res.json();if(!res.ok)throw Error(result.error||'Decision failed');put('status',result.status==='approved_not_sent'?'Approved. No email was sent.':result.status==='denied'?'Denied. No email was sent.':'Review cancelled. No email was sent.');data.state=result.status;byId('ack').disabled=true;
  }catch(e){put('status',String(e.message||e));byId('cancel').disabled=false;await load()}}
 byId('approve').addEventListener('click',()=>act('approve'));byId('deny').addEventListener('click',()=>act('deny'));byId('cancel').addEventListener('click',()=>act('cancel'));
 try{await load()}catch(e){put('status',String(e.message||e));for(const id of fields)put(id,'');}
})();
</script></body></html>'''


class LoopbackReviewServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False

    def __init__(self, request, reviewer, controller):
        if not isinstance(request, dict):
            raise ValueError("one approval request payload is required")
        self.card = ReviewCard.from_request(request)
        challenge = getattr(controller, "_challenge", None)
        message = getattr(controller, "message", None)
        if not challenge or not message:
            raise ValueError("controller must have an open or terminal review challenge")
        exact = {
            "company_id": message.company_id,
            "sender": message.sender.strip().casefold(),
            "recipient": message.recipient.strip().casefold(),
            "category": message.category,
            "subject": message.subject,
            "text_body": message.text_body,
            "message_hash": message.content_hash,
            "challenge_hash": challenge.challenge_hash,
            "scope_hash": challenge.scope_hash,
            "approval_expires_at": challenge.expires_at.isoformat(),
        }
        if any(request.get(key) != value for key, value in exact.items()):
            raise ValueError("review snapshot does not match the controller's exact challenge")
        self.review = dict(request)
        self.reviewer = reviewer
        self.controller = controller
        self.launch_token = secrets.token_urlsafe(32)
        self.cookie_token = secrets.token_urlsafe(32)
        self.csrf_token = secrets.token_urlsafe(32)
        self.acknowledged = False
        self.session_expires = time.monotonic() + 900
        self.lock = threading.RLock()
        super().__init__(("127.0.0.1", 0), _ReviewHandler)
        if self.server_address[0] != "127.0.0.1":
            self.server_close()
            raise RuntimeError("review server did not bind to loopback")

    @property
    def url(self):
        return f"http://127.0.0.1:{self.server_address[1]}/open/{self.launch_token}"

    def start(self):
        self.thread = threading.Thread(target=self.serve_forever, name="sparktech-canary-review", daemon=True)
        self.thread.start()
        return self

    def close(self):
        self.shutdown()
        self.server_close()
        if hasattr(self, "thread"):
            self.thread.join(timeout=2)


class _ReviewHandler(BaseHTTPRequestHandler):
    server: LoopbackReviewServer

    def log_message(self, *_args):
        # The capability URL and review traffic must not be written to logs.
        return

    def _loopback_host(self):
        try:
            remote = ipaddress.ip_address(self.client_address[0]).is_loopback
        except ValueError:
            remote = False
        expected = f"127.0.0.1:{self.server.server_address[1]}"
        return remote and self.headers.get("Host", "").casefold() == expected.casefold()

    def _cookie_ok(self):
        if time.monotonic() >= self.server.session_expires:
            return False
        jar = SimpleCookie()
        try:
            jar.load(self.headers.get("Cookie", ""))
            morsel = jar.get("st_review_session")
            return bool(morsel and hmac.compare_digest(morsel.value, self.server.cookie_token))
        except Exception:
            return False

    def _send(self, status, body=b"", content_type="text/plain; charset=utf-8", extra=()):
        if not hasattr(self, "nonce"):
            self.nonce = secrets.token_urlsafe(18)
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Content-Security-Policy", "default-src 'none'; connect-src 'self'; style-src 'nonce-" + self.nonce + "'; script-src 'nonce-" + self.nonce + "'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'")
        for key, value in extra:
            self.send_header(key, value)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def _json(self, status, value):
        self._send(status, json.dumps(value, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self):
        if not self._loopback_host():
            return self._send(HTTPStatus.FORBIDDEN)
        path = urlsplit(self.path).path
        open_path = "/open/" + self.server.launch_token
        if path == open_path:
            if time.monotonic() >= self.server.session_expires:
                return self._send(HTTPStatus.GONE)
            return self._send(HTTPStatus.SEE_OTHER, extra=(("Location", "/"),
                ("Set-Cookie", f"st_review_session={self.server.cookie_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900")))
        if not self._cookie_ok():
            return self._send(HTTPStatus.NOT_FOUND)
        if path == "/":
            self.nonce = secrets.token_urlsafe(18)
            page = _PAGE.replace("__NONCE__", self.nonce).encode("utf-8")
            return self._send(HTTPStatus.OK, page, "text/html; charset=utf-8")
        if path == "/api/review":
            if self.server.controller.message.content_hash != self.server.card.content_hash:
                return self._json(HTTPStatus.CONFLICT, {"error": "approved message content changed"})
            self.server.controller.expire_review_if_needed()
            return self._json(HTTPStatus.OK, {"csrf": self.server.csrf_token,
                "state": self.server.controller.state, "acknowledged": self.server.acknowledged,
                "review": self.server.review})
        return self._send(HTTPStatus.NOT_FOUND)

    def do_POST(self):
        if not self._loopback_host() or not self._cookie_ok():
            return self._json(HTTPStatus.FORBIDDEN, {"error": "review session unavailable"})
        if urlsplit(self.path).path != "/api/decision":
            return self._json(HTTPStatus.NOT_FOUND, {"error": "route not found"})
        expected_origin = f"http://127.0.0.1:{self.server.server_address[1]}"
        if self.headers.get("Origin") != expected_origin:
            return self._json(HTTPStatus.FORBIDDEN, {"error": "same-origin request required"})
        if self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower() != "application/json":
            return self._json(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, {"error": "JSON request required"})
        if not hmac.compare_digest(self.headers.get("X-CSRF-Token", ""), self.server.csrf_token):
            return self._json(HTTPStatus.FORBIDDEN, {"error": "CSRF check failed"})
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 2048:
                raise ValueError("invalid request size")
            payload = json.loads(self.rfile.read(size))
        except Exception:
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "invalid request"})
        if not isinstance(payload, dict) or set(payload) != {"decision", "challenge_hash", "message_hash"}:
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "invalid decision envelope"})
        decision = payload["decision"]
        if not isinstance(decision, str) or decision not in {"approve", "deny", "cancel", "acknowledge"}:
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "unsupported review decision"})
        if not isinstance(payload["challenge_hash"], str) or not isinstance(payload["message_hash"], str):
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "invalid challenge or message hash"})
        with self.server.lock:
            self.server.controller.expire_review_if_needed()
            if not hmac.compare_digest(str(payload["challenge_hash"]), str(self.server.review.get("challenge_hash", ""))) or \
               not hmac.compare_digest(str(payload["message_hash"]), str(self.server.card.content_hash)):
                return self._json(HTTPStatus.CONFLICT, {"error": "challenge or exact message does not match review"})
            if self.server.controller.message.content_hash != self.server.card.content_hash:
                return self._json(HTTPStatus.CONFLICT, {"error": "message changed after review"})
            if self.server.controller.state != "awaiting_human_approval":
                return self._json(HTTPStatus.CONFLICT, {"error": "review is already terminal"})
            if decision == "acknowledge":
                self.server.acknowledged = True
                return self._json(HTTPStatus.OK, {"status": "acknowledged", "acknowledged": True})
            if decision == "cancel":
                result = self.server.controller.cancel_review()
                return self._json(HTTPStatus.OK, result)
            if not self.server.acknowledged:
                return self._json(HTTPStatus.PRECONDITION_REQUIRED, {"error": "acknowledge the exact message before deciding"})
            try:
                proof = self.server.reviewer.authenticate_decision(
                    self.server.controller._challenge, decision == "approve")
                result = self.server.controller.accept_authenticated_decision(proof)
                return self._json(HTTPStatus.OK, result)
            except CanaryBlocked as exc:
                return self._json(HTTPStatus.FORBIDDEN, {"error": str(exc)})
            except Exception:
                return self._json(HTTPStatus.FORBIDDEN, {"error": "reviewer authentication or decision failed"})


def main(argv=None):
    parser = argparse.ArgumentParser(description="Open a local, approve/deny-only email review. This command cannot send mail.")
    parser.add_argument("--company-id", required=True)
    parser.add_argument("--sender", required=True)
    parser.add_argument("--recipient", required=True)
    parser.add_argument("--category", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--body-file", required=True, help="UTF-8 plain-text draft body")
    parser.add_argument("--tenant-id", required=True)
    parser.add_argument("--client-id", required=True, help="approved single-tenant native Entra app id")
    parser.add_argument("--reviewer-subject", action="append", required=True,
                        help="allowlisted Entra OIDC sub; may be repeated")
    parser.add_argument("--attempt-db", required=True, help="explicit local SQLite path")
    parser.add_argument("--open-browser", action="store_true")
    args = parser.parse_args(argv)
    from .email_pilot import ExactMessage, OneMessageCanary
    from .entra_review import MSALEntraReviewer
    from .sqlite_canary_store import SQLiteCanaryStore
    from pathlib import Path
    tenant = args.tenant_id.strip()
    audience = args.client_id.strip()
    issuer = f"https://login.microsoftonline.com/{tenant}/v2.0"
    body = Path(args.body_file).expanduser().read_text(encoding="utf-8")
    message = ExactMessage(args.company_id, args.sender, args.recipient, args.category,
                           args.subject, body)
    store = SQLiteCanaryStore(args.attempt_db)
    controller = OneMessageCanary(message, tenant_id=tenant, expected_issuer=issuer,
        expected_audience=audience, allowed_reviewer_subjects=frozenset(args.reviewer_subject),
        attempt_store=store, live_enabled=False)
    request = controller.approval_request()
    server = LoopbackReviewServer(request, MSALEntraReviewer(tenant, audience,
        frozenset(args.reviewer_subject)), controller)
    print("Review URL (loopback only; keep it private):", server.url, flush=True)
    print("Approve/deny will authenticate through Entra. This command has no send path.", flush=True)
    if args.open_browser:
        webbrowser.open(server.url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
