"""Optional Microsoft Entra OIDC reviewer adapter.

MSAL authenticates a reviewer only. The local review UI binds that authenticated
principal's explicit approve/deny click to the currently displayed challenge.
No token cache is persisted and no Graph permission is requested here.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
from typing import Callable

from .email_pilot import CanaryBlocked, VerifiedHumanDecision


class EntraConfigurationRequired(CanaryBlocked):
    pass


class MSALEntraReviewer:
    def __init__(self, tenant_id: str | None, client_id: str | None,
                 allowed_subjects: frozenset[str] = frozenset(), *,
                 app_factory: Callable | None = None):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.allowed_subjects = frozenset(allowed_subjects)
        self.app_factory = app_factory

    def authenticate_decision(self, challenge, approved: bool, *, now=None) -> VerifiedHumanDecision:
        if not self.tenant_id or not self.client_id or not self.allowed_subjects:
            raise EntraConfigurationRequired("single-tenant Entra client, tenant, and reviewer subject allowlist are required")
        if challenge is None or not isinstance(approved, bool):
            raise CanaryBlocked("open challenge and explicit approve/deny decision required")
        if self.app_factory:
            app = self.app_factory(self.client_id, self.tenant_id)
        else:
            try:
                import msal
            except ImportError as exc:
                raise EntraConfigurationRequired("install the optional MSAL dependency before Entra sign-in") from exc
            app = msal.PublicClientApplication(
                self.client_id,
                authority=f"https://login.microsoftonline.com/{self.tenant_id}",
            )
        # openid only: no Graph permissions and no refresh-token persistence.
        result = app.acquire_token_interactive(scopes=["openid"])
        if not isinstance(result, dict) or result.get("error"):
            raise CanaryBlocked("Entra sign-in did not complete")
        claims = result.get("id_token_claims")
        id_token = result.get("id_token")
        if not isinstance(claims, dict) or not isinstance(id_token, str) or not id_token:
            raise CanaryBlocked("MSAL did not return verified OIDC identity claims")
        try:
            aud = claims["aud"]
            issuer = claims["iss"]
            tenant = claims["tid"]
            subject = claims["sub"]
            issued = datetime.fromtimestamp(int(claims["iat"]), timezone.utc)
            expires = datetime.fromtimestamp(int(claims["exp"]), timezone.utc)
        except (KeyError, TypeError, ValueError, OverflowError) as exc:
            raise CanaryBlocked("Entra identity claims are incomplete") from exc
        expected_issuer = f"https://login.microsoftonline.com/{self.tenant_id}/v2.0"
        now = now or datetime.now(timezone.utc)
        if aud != self.client_id or tenant != self.tenant_id or issuer.rstrip("/") != expected_issuer:
            raise CanaryBlocked("Entra issuer, audience, or tenant mismatch")
        if not isinstance(subject, str) or subject not in self.allowed_subjects:
            raise CanaryBlocked("Entra reviewer subject is not authorized")
        if expires <= now or issued > now + timedelta(seconds=30):
            raise CanaryBlocked("Entra identity token is expired or not yet valid")
        # Digest only; never retain or log the raw ID/access token.
        token_digest = hashlib.sha256(id_token.encode("utf-8")).hexdigest()
        # Bind the local decision receipt to this challenge and choice. A stable
        # OIDC ID token may authenticate more than one distinct review; retries
        # of this same decision remain replay-protected by the stable receipt ID.
        assertion_id = hashlib.sha256(
            f"{token_digest}:{challenge.challenge_hash}:{int(approved)}".encode("utf-8")
        ).hexdigest()
        return VerifiedHumanDecision(issuer, self.client_id, subject, approved,
            challenge.challenge_hash, issued, min(expires, challenge.expires_at), assertion_id)
