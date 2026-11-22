"""Opt-in durable, atomic store for the one-message canary gate."""
from __future__ import annotations

import os
import sqlite3
import threading
from pathlib import Path
from contextlib import closing


class SQLiteCanaryStore:
    durable = True

    def __init__(self, path: str | os.PathLike):
        self.path = Path(path).expanduser()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._connect()
        if self.path.exists():
            os.chmod(self.path, 0o600)

    def _connect(self):
        db = sqlite3.connect(self.path, timeout=10, isolation_level=None)
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("PRAGMA synchronous=FULL")
        db.executescript("""
          CREATE TABLE IF NOT EXISTS approvals (
            assertion_id TEXT PRIMARY KEY, challenge_hash TEXT NOT NULL,
            decision TEXT NOT NULL, reviewer_subject TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS sends (
            policy_id TEXT PRIMARY KEY, content_hash TEXT NOT NULL,
            status TEXT NOT NULL, detail TEXT);
          CREATE TABLE IF NOT EXISTS outcomes (
            id INTEGER PRIMARY KEY, policy_id TEXT NOT NULL, status TEXT NOT NULL,
            detail TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        """)
        return db

    def claim_approval(self, assertion_id, challenge_hash):
        with self._lock, closing(self._connect()) as db:
            try:
                db.execute("BEGIN IMMEDIATE")
                db.execute("INSERT INTO approvals(assertion_id,challenge_hash,decision,reviewer_subject) VALUES(?,?,?,?)",
                           (assertion_id, challenge_hash, "claimed", ""))
                db.execute("COMMIT")
                return True
            except sqlite3.IntegrityError:
                db.execute("ROLLBACK")
                return False

    def claim_send(self, policy_id, content_hash):
        with self._lock, closing(self._connect()) as db:
            try:
                db.execute("BEGIN IMMEDIATE")
                db.execute("INSERT INTO sends(policy_id,content_hash,status) VALUES(?,?,?)",
                           (policy_id, content_hash, "claimed"))
                db.execute("COMMIT")
                return True
            except sqlite3.IntegrityError:
                db.execute("ROLLBACK")
                return False

    def record_result(self, policy_id, status, detail=None):
        with self._lock, closing(self._connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("UPDATE sends SET status=?,detail=? WHERE policy_id=?", (status, detail, policy_id))
            db.execute("INSERT INTO outcomes(policy_id,status,detail) VALUES(?,?,?)", (policy_id,status,detail))
            db.execute("COMMIT")

    def set_approval_decision(self, assertion_id, challenge_hash, decision, reviewer_subject):
        with self._lock, closing(self._connect()) as db:
            cur = db.execute("UPDATE approvals SET decision=?,reviewer_subject=? WHERE assertion_id=? AND challenge_hash=?",
                             (decision, reviewer_subject, assertion_id, challenge_hash))
            return cur.rowcount == 1

    def disable(self, policy_id, reason):
        self.record_result(policy_id, "disabled", reason)

    def status(self, policy_id):
        with closing(self._connect()) as db:
            row = db.execute("SELECT status,detail FROM sends WHERE policy_id=?", (policy_id,)).fetchone()
            return None if row is None else {"status": row[0], "detail": row[1]}

    def approval(self, assertion_id):
        with closing(self._connect()) as db:
            row = db.execute("SELECT challenge_hash,decision,reviewer_subject FROM approvals WHERE assertion_id=?",
                              (assertion_id,)).fetchone()
            return None if row is None else {"challenge_hash": row[0], "decision": row[1],
                                             "reviewer_subject": row[2]}

    def approval_for_challenge(self, challenge_hash):
        with closing(self._connect()) as db:
            rows = db.execute("SELECT decision,reviewer_subject FROM approvals WHERE challenge_hash=?",
                              (challenge_hash,)).fetchall()
            return [{"decision": row[0], "reviewer_subject": row[1]} for row in rows]
