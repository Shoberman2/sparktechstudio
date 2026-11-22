"""Local, tenant-scoped email workflow. The only delivery adapter is a SQLite-backed mock."""
import argparse
from contextlib import contextmanager
from datetime import datetime, time as clock_time, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sqlite3
import uuid
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from .email_themes import render_email, THEMES


SCHEMA = """
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS companies(
 company_id TEXT PRIMARY KEY, name TEXT NOT NULL, timezone TEXT NOT NULL, sender TEXT NOT NULL, brand_id TEXT NOT NULL DEFAULT 'sparktech',
 max_daily_cap INTEGER NOT NULL CHECK(max_daily_cap BETWEEN 1 AND 1000), mode TEXT NOT NULL DEFAULT 'sandbox' CHECK(mode='sandbox'),
 live_enabled INTEGER NOT NULL DEFAULT 0 CHECK(live_enabled=0), created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS icps(
 company_id TEXT NOT NULL, icp_id TEXT NOT NULL, name TEXT NOT NULL, required_signals TEXT NOT NULL, problem TEXT NOT NULL,
 PRIMARY KEY(company_id,icp_id), FOREIGN KEY(company_id) REFERENCES companies(company_id));
CREATE TABLE IF NOT EXISTS sources(
 company_id TEXT NOT NULL, source_id TEXT NOT NULL, origin TEXT NOT NULL, fact TEXT NOT NULL, sha256 TEXT NOT NULL,
 reviewer TEXT NOT NULL, captured_at TEXT NOT NULL, expires_at TEXT NOT NULL,
 PRIMARY KEY(company_id,source_id), FOREIGN KEY(company_id) REFERENCES companies(company_id));
CREATE TABLE IF NOT EXISTS prospects(
 company_id TEXT NOT NULL, prospect_id TEXT NOT NULL, email TEXT NOT NULL, email_norm TEXT NOT NULL, display_name TEXT NOT NULL,
 icp_id TEXT NOT NULL, signals TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','replied','stopped')),
 created_at TEXT NOT NULL, PRIMARY KEY(company_id,prospect_id), UNIQUE(company_id,email_norm),
 FOREIGN KEY(company_id,icp_id) REFERENCES icps(company_id,icp_id));
CREATE TABLE IF NOT EXISTS campaigns(
 company_id TEXT NOT NULL, campaign_id TEXT NOT NULL, name TEXT NOT NULL, icp_id TEXT NOT NULL, source_id TEXT NOT NULL,
 category TEXT NOT NULL, daily_cap INTEGER NOT NULL CHECK(daily_cap BETWEEN 1 AND 1000), window_start TEXT NOT NULL, window_end TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(company_id,campaign_id),
 FOREIGN KEY(company_id,icp_id) REFERENCES icps(company_id,icp_id), FOREIGN KEY(company_id,source_id) REFERENCES sources(company_id,source_id));
CREATE TABLE IF NOT EXISTS sequence_steps(
 company_id TEXT NOT NULL, campaign_id TEXT NOT NULL, step_no INTEGER NOT NULL, delay_seconds INTEGER NOT NULL,
 subject_template TEXT NOT NULL, body_template TEXT NOT NULL, category TEXT NOT NULL,
 PRIMARY KEY(company_id,campaign_id,step_no), FOREIGN KEY(company_id,campaign_id) REFERENCES campaigns(company_id,campaign_id));
CREATE TABLE IF NOT EXISTS campaign_approvals(
 company_id TEXT NOT NULL, campaign_id TEXT NOT NULL, config_hash TEXT NOT NULL, reviewer TEXT NOT NULL,
 approved_at TEXT NOT NULL, expires_at TEXT NOT NULL, PRIMARY KEY(company_id,campaign_id),
 FOREIGN KEY(company_id,campaign_id) REFERENCES campaigns(company_id,campaign_id));
CREATE TABLE IF NOT EXISTS drafts(
 company_id TEXT NOT NULL, campaign_id TEXT NOT NULL, prospect_id TEXT NOT NULL, step_no INTEGER NOT NULL, revision INTEGER NOT NULL,
 subject TEXT NOT NULL, body TEXT NOT NULL, source_id TEXT NOT NULL, source_hash TEXT NOT NULL, content_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','sent','stopped')),
 PRIMARY KEY(company_id,campaign_id,prospect_id,step_no),
 FOREIGN KEY(company_id,campaign_id,step_no) REFERENCES sequence_steps(company_id,campaign_id,step_no),
 FOREIGN KEY(company_id,prospect_id) REFERENCES prospects(company_id,prospect_id));
CREATE TABLE IF NOT EXISTS draft_approvals(
 company_id TEXT NOT NULL, campaign_id TEXT NOT NULL, prospect_id TEXT NOT NULL, step_no INTEGER NOT NULL,
 revision INTEGER NOT NULL, content_hash TEXT NOT NULL, reviewer TEXT NOT NULL, approved_at TEXT NOT NULL, expires_at TEXT NOT NULL,
 PRIMARY KEY(company_id,campaign_id,prospect_id,step_no,revision),
 FOREIGN KEY(company_id,campaign_id,prospect_id,step_no) REFERENCES drafts(company_id,campaign_id,prospect_id,step_no));
CREATE TABLE IF NOT EXISTS jobs(
 job_id TEXT PRIMARY KEY, company_id TEXT NOT NULL, campaign_id TEXT NOT NULL, prospect_id TEXT NOT NULL, step_no INTEGER NOT NULL,
 idempotency_key TEXT NOT NULL, due_at TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('queued','claimed','sent','ambiguous','stopped','failed')),
 attempts INTEGER NOT NULL DEFAULT 0, lease_owner TEXT, lease_until TEXT, provider_name TEXT NOT NULL DEFAULT 'mock', created_at TEXT NOT NULL,
 UNIQUE(company_id,idempotency_key), FOREIGN KEY(company_id,campaign_id,prospect_id,step_no) REFERENCES drafts(company_id,campaign_id,prospect_id,step_no));
CREATE INDEX IF NOT EXISTS jobs_due ON jobs(company_id,status,due_at);
CREATE TABLE IF NOT EXISTS outbox(
 provider_message_id TEXT PRIMARY KEY, company_id TEXT NOT NULL, job_id TEXT NOT NULL, idempotency_key TEXT NOT NULL,
 sent_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'mock_sent' CHECK(status='mock_sent'), UNIQUE(company_id,idempotency_key),
 FOREIGN KEY(company_id) REFERENCES companies(company_id));
CREATE TABLE IF NOT EXISTS provider_deliveries(
 company_id TEXT NOT NULL, job_id TEXT NOT NULL PRIMARY KEY, idempotency_key TEXT NOT NULL,
 provider_name TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('mock_sent','accepted_unconfirmed_delivery','sent_found_in_mailbox')),
 accepted_at TEXT NOT NULL, provider_message_id TEXT,
 FOREIGN KEY(company_id) REFERENCES companies(company_id), FOREIGN KEY(job_id) REFERENCES jobs(job_id),
 UNIQUE(company_id,idempotency_key));
CREATE TABLE IF NOT EXISTS inbound_events(
 company_id TEXT NOT NULL, event_id TEXT NOT NULL, email_norm TEXT NOT NULL, event_type TEXT NOT NULL CHECK(event_type IN ('reply','bounce','unsubscribe')),
 received_at TEXT NOT NULL, PRIMARY KEY(company_id,event_id), FOREIGN KEY(company_id) REFERENCES companies(company_id));
CREATE TABLE IF NOT EXISTS suppressions(
 company_id TEXT NOT NULL, email_norm TEXT NOT NULL, reason TEXT NOT NULL, source_event_id TEXT NOT NULL, created_at TEXT NOT NULL,
 PRIMARY KEY(company_id,email_norm), FOREIGN KEY(company_id) REFERENCES companies(company_id));
CREATE TABLE IF NOT EXISTS audit(
 audit_id INTEGER PRIMARY KEY AUTOINCREMENT, company_id TEXT NOT NULL, at TEXT NOT NULL, event TEXT NOT NULL,
 object_type TEXT, object_id TEXT, detail_json TEXT NOT NULL, FOREIGN KEY(company_id) REFERENCES companies(company_id));
"""
DB_VERSION = 3


def _now(): return datetime.now(timezone.utc)
def _stamp(value):
    dt = value if isinstance(value, datetime) else datetime.fromisoformat(value)
    if dt.tzinfo is None: raise ValueError("Timestamps must include a timezone")
    return dt.astimezone(timezone.utc).isoformat()
def _iso(): return _now().isoformat()
def _hash(value): return hashlib.sha256(value.encode("utf-8")).hexdigest()
def _json(value): return json.dumps(value, sort_keys=True, separators=(",", ":"))
def _valid_id(value):
    if not isinstance(value, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", value): raise ValueError("Invalid slug ID")
    return value
def _email(value):
    value = value.strip()
    if len(value) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value): raise ValueError("Invalid email address")
    return value


class AmbiguousDelivery(Exception): pass


class MockProvider:
    """Test adapter that records into the local DB and supports idempotency lookup."""
    def __init__(self, store):
        self.store = store
        self.timeout_after_persist = False
        self.timeout_before_persist = False

    def send(self, job, draft):
        if self.timeout_before_persist:
            self.timeout_before_persist = False
            raise AmbiguousDelivery("Mock timeout before provider acceptance")
        message_id = self.store._mock_outbox(job, _stamp(draft.get("_send_at", _now())))
        if self.timeout_after_persist:
            self.timeout_after_persist = False
            raise AmbiguousDelivery("Mock timeout after provider acceptance")
        return message_id

    def lookup(self, company_id, key):
        with self.store.connect() as db:
            row = db.execute("SELECT provider_message_id FROM outbox WHERE company_id=? AND idempotency_key=?", (company_id,key)).fetchone()
            return row[0] if row else None


class OutreachStore:
    def __init__(self, db_path, provider=None):
        self.path = Path(db_path).expanduser().resolve()
        if self.path.exists() and self.path.is_symlink(): raise ValueError("Database must not be a symlink")
        self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        if not self.path.exists():
            fd = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o600); os.close(fd)
        if stat.S_IMODE(self.path.stat().st_mode) & 0o077:
            raise PermissionError("Local outreach database must be private (mode 0600)")
        with self.connect() as db:
            version=db.execute("PRAGMA user_version").fetchone()[0]
            existing=db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()
            if version==0 and existing: raise ValueError("Database is not a SparkTech outreach store; refusing to overlay existing tables")
            if version not in (0,1,2,DB_VERSION): raise ValueError(f"Unsupported outreach database version {version}")
            db.executescript(SCHEMA)
            company_columns={row[1] for row in db.execute("PRAGMA table_info(companies)")}
            if "brand_id" not in company_columns:
                db.execute("ALTER TABLE companies ADD COLUMN brand_id TEXT NOT NULL DEFAULT 'sparktech'")
            job_columns={row[1] for row in db.execute("PRAGMA table_info(jobs)")}
            if "provider_name" not in job_columns:
                db.execute("ALTER TABLE jobs ADD COLUMN provider_name TEXT NOT NULL DEFAULT 'mock'")
            db.execute("INSERT OR IGNORE INTO provider_deliveries(company_id,job_id,idempotency_key,provider_name,status,accepted_at,provider_message_id) SELECT company_id,job_id,idempotency_key,'mock','mock_sent',sent_at,provider_message_id FROM outbox")
            db.execute(f"PRAGMA user_version={DB_VERSION}")
        self.provider = provider or MockProvider(self)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        db.execute("PRAGMA busy_timeout=10000")
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally: db.close()

    def _audit(self, db, company, event, object_type=None, object_id=None, **details):
        db.execute("INSERT INTO audit(company_id,at,event,object_type,object_id,detail_json) VALUES(?,?,?,?,?,?)",
                   (company,_iso(),event,object_type,object_id,_json(details)))

    @staticmethod
    def _company(db, company):
        row = db.execute("SELECT * FROM companies WHERE company_id=?", (company,)).fetchone()
        if row is None: raise ValueError("Unknown company; tenant boundary rejected request")
        return row

    def create_company(self, company_id, name, sender, tz="UTC", daily_cap=10, brand_id="sparktech"):
        company_id = _valid_id(company_id); sender = _email(sender)
        if brand_id not in THEMES: raise ValueError("Choose a configured company email brand")
        if type(daily_cap) is not int or not 1 <= daily_cap <= 1000: raise ValueError("Company daily cap must be 1..1000")
        try: ZoneInfo(tz)
        except ZoneInfoNotFoundError as exc: raise ValueError("Unknown IANA timezone") from exc
        with self.connect() as db:
            db.execute("INSERT INTO companies(company_id,name,timezone,sender,brand_id,max_daily_cap,created_at) VALUES(?,?,?,?,?,?,?)",
                       (company_id,name,tz,sender,brand_id,daily_cap,_iso()))
            self._audit(db,company_id,"company_created", "company", company_id, mode="sandbox", live_enabled=False, brand_id=brand_id)

    def add_icp(self, company, icp_id, name, signals, problem):
        icp_id = _valid_id(icp_id)
        if not signals or len(signals)>30 or any(not re.fullmatch(r"[a-z0-9_-]{1,64}",x) for x in signals): raise ValueError("Invalid ICP signals")
        with self.connect() as db:
            self._company(db,company)
            db.execute("INSERT INTO icps VALUES(?,?,?,?,?)",(company,icp_id,name,_json(sorted(set(signals))),problem))
            self._audit(db,company,"icp_added","icp",icp_id)

    def add_source(self, company, source_id, origin, fact, reviewer, expires_days=30):
        source_id=_valid_id(source_id)
        if not origin.startswith(("https://", "file://", "local://")) or len(fact)>2000 or not fact.strip() or not reviewer.strip(): raise ValueError("Source needs an explicit HTTPS, reviewed local-file, or synthetic origin, short fact and reviewer")
        if not 1<=expires_days<=365: raise ValueError("Source expiry must be 1..365 days")
        captured=_now(); expires=captured+timedelta(days=expires_days); h=_hash(origin+"\n"+fact)
        with self.connect() as db:
            self._company(db,company)
            db.execute("INSERT INTO sources VALUES(?,?,?,?,?,?,?,?)",(company,source_id,origin,fact,h,reviewer,_stamp(captured),_stamp(expires)))
            self._audit(db,company,"source_reviewed","source",source_id,source_hash=h,expires_at=_stamp(expires),reviewer=reviewer)

    def add_prospect(self, company, prospect_id, email, display_name, icp_id, signals):
        prospect_id=_valid_id(prospect_id); email=_email(email); email_norm=email.casefold()
        with self.connect() as db:
            self._company(db,company)
            if db.execute("SELECT 1 FROM suppressions WHERE company_id=? AND email_norm=?",(company,email_norm)).fetchone(): raise ValueError("Suppressed address cannot be enrolled")
            db.execute("INSERT INTO prospects VALUES(?,?,?,?,?,?,?,'active',?)",(company,prospect_id,email,email_norm,display_name,icp_id,_json(sorted(set(signals))),_iso()))
            self._audit(db,company,"prospect_added","prospect",prospect_id,icp_id=icp_id)

    def add_campaign(self, company, campaign_id, name, icp_id, source_id, category, daily_cap,
                    window_start, window_end, steps):
        campaign_id=_valid_id(campaign_id)
        try:
            start=clock_time.fromisoformat(window_start); end=clock_time.fromisoformat(window_end)
        except ValueError as exc: raise ValueError("Windows use HH:MM local time") from exc
        if start>=end: raise ValueError("Send window must start before it ends on the same local day")
        if not isinstance(steps,list) or not 1<=len(steps)<=10: raise ValueError("Sequence must have 1..10 steps")
        if type(daily_cap) is not int or daily_cap<1: raise ValueError("Campaign daily cap must be positive")
        normalized=[]
        allowed={"first_name","source_fact","problem","company_name"}
        for i,step in enumerate(steps,1):
            subject=step.get("subject", ""); body=step.get("body", ""); delay=step.get("delay_seconds",0)
            if not isinstance(subject,str) or not isinstance(body,str) or not subject or not body or len(subject)>250 or len(body)>5000: raise ValueError("Invalid message template size")
            names=set(re.findall(r"{([a-z_]+)}",subject+body))
            if names-allowed: raise ValueError("Template has unsupported variables")
            if type(delay) is not int or delay<0 or delay>90*86400: raise ValueError("Step delay must be 0..90 days")
            normalized.append((i,delay,subject,body,step.get("category",category)))
        with self.connect() as db:
            c=self._company(db,company)
            if daily_cap>c["max_daily_cap"]: raise ValueError("Campaign cap exceeds company cap")
            db.execute("INSERT INTO campaigns VALUES(?,?,?,?,?,?,?,?,?,1)",(company,campaign_id,name,icp_id,source_id,category,daily_cap,window_start,window_end))
            db.executemany("INSERT INTO sequence_steps VALUES(?,?,?,?,?,?,?)",[(company,campaign_id,*s) for s in normalized])
            self._audit(db,company,"campaign_created","campaign",campaign_id,steps=len(normalized),daily_cap=daily_cap)

    def _campaign_hash(self, db, company, campaign):
        c=db.execute("SELECT * FROM campaigns WHERE company_id=? AND campaign_id=?",(company,campaign)).fetchone()
        if not c: raise ValueError("Unknown campaign in this company")
        company_policy=self._company(db,company)
        steps=[dict(x) for x in db.execute("SELECT step_no,delay_seconds,subject_template,body_template,category FROM sequence_steps WHERE company_id=? AND campaign_id=? ORDER BY step_no",(company,campaign))]
        policy={k:company_policy[k] for k in ("name","timezone","sender","brand_id","max_daily_cap","mode","live_enabled")}
        return _hash(_json(dict(company_policy=policy,campaign={k:c[k] for k in ("campaign_id","name","icp_id","source_id","category","daily_cap","window_start","window_end","active")},steps=steps)))

    def approve_campaign(self, company,campaign,reviewer,ttl_seconds=86400):
        if not reviewer.strip() or not 1<=ttl_seconds<=30*86400: raise ValueError("Invalid reviewer or approval lifetime")
        with self.connect() as db:
            self._company(db,company); h=self._campaign_hash(db,company,campaign); now=_now()
            db.execute("INSERT OR REPLACE INTO campaign_approvals VALUES(?,?,?,?,?,?)",(company,campaign,h,reviewer,_stamp(now),_stamp(now+timedelta(seconds=ttl_seconds))))
            self._audit(db,company,"campaign_approved","campaign",campaign,config_hash=h,reviewer=reviewer,expires_at=_stamp(now+timedelta(seconds=ttl_seconds)))
        return h

    def _source(self, db, company, source_id, now=None):
        row=db.execute("SELECT * FROM sources WHERE company_id=? AND source_id=?",(company,source_id)).fetchone()
        if not row: raise ValueError("Missing company-scoped source")
        if datetime.fromisoformat(row["expires_at"]) <= (now or _now()): raise ValueError("Source evidence expired; refresh and review it")
        if _hash(row["origin"]+"\n"+row["fact"]) != row["sha256"]: raise ValueError("Source evidence integrity failure")
        return row

    def create_drafts(self, company,campaign,prospect_id):
        with self.connect() as db:
            c=self._company(db,company)
            camp=db.execute("SELECT * FROM campaigns WHERE company_id=? AND campaign_id=?",(company,campaign)).fetchone()
            p=db.execute("SELECT * FROM prospects WHERE company_id=? AND prospect_id=?",(company,prospect_id)).fetchone()
            if not camp or not p: raise ValueError("Unknown campaign or prospect in this company")
            if p["status"]!="active" or db.execute("SELECT 1 FROM suppressions WHERE company_id=? AND email_norm=?",(company,p["email_norm"])).fetchone(): raise ValueError("Prospect is stopped or suppressed")
            if p["icp_id"]!=camp["icp_id"]: raise ValueError("Prospect does not match this campaign ICP")
            source=self._source(db,company,camp["source_id"])
            steps=db.execute("SELECT * FROM sequence_steps WHERE company_id=? AND campaign_id=? ORDER BY step_no",(company,campaign)).fetchall()
            first=p["display_name"].split()[0]
            made=[]
            for step in steps:
                subject=step["subject_template"].format(first_name=first,source_fact=source["fact"],problem=db.execute("SELECT problem FROM icps WHERE company_id=? AND icp_id=?",(company,camp["icp_id"])).fetchone()[0],company_name=c["name"])
                body=step["body_template"].format(first_name=first,source_fact=source["fact"],problem=db.execute("SELECT problem FROM icps WHERE company_id=? AND icp_id=?",(company,camp["icp_id"])).fetchone()[0],company_name=c["name"])
                h=_hash(_json({"subject":subject,"body":body,"source_id":source["source_id"],"source_hash":source["sha256"]}))
                previous=db.execute("SELECT revision FROM drafts WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step["step_no"])).fetchone()
                revision=(previous[0]+1) if previous else 1
                db.execute("INSERT INTO drafts VALUES(?,?,?,?,?,?,?,?,?,?,'pending') ON CONFLICT(company_id,campaign_id,prospect_id,step_no) DO UPDATE SET revision=excluded.revision,subject=excluded.subject,body=excluded.body,source_id=excluded.source_id,source_hash=excluded.source_hash,content_hash=excluded.content_hash,status='pending'",
                           (company,campaign,prospect_id,step["step_no"],revision,subject,body,source["source_id"],source["sha256"],h))
                db.execute("DELETE FROM draft_approvals WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step["step_no"]))
                db.execute("UPDATE jobs SET status='stopped' WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=? AND status='queued'",(company,campaign,prospect_id,step["step_no"]))
                rendered=render_email(c["brand_id"],subject,body)
                made.append({"step_no":step["step_no"],"revision":revision,"subject":subject,"body":body,"body_text":rendered["text"],"body_html":rendered["html"],"brand_id":rendered["brand_id"],"sender_name":rendered["sender_name"],"source_id":source["source_id"],"source_hash":source["sha256"],"content_hash":h})
            self._audit(db,company,"drafts_created","prospect",prospect_id,campaign_id=campaign,steps=len(made))
            return made

    def edit_draft(self,company,campaign,prospect_id,step_no,subject,body):
        if not subject or not body or len(subject)>250 or len(body)>5000: raise ValueError("Draft size is invalid")
        with self.connect() as db:
            row=db.execute("SELECT * FROM drafts WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step_no)).fetchone()
            if not row: raise ValueError("Draft not found in this company")
            rev=row["revision"]+1; h=_hash(_json({"subject":subject,"body":body,"source_id":row["source_id"],"source_hash":row["source_hash"]}))
            db.execute("UPDATE drafts SET revision=?,subject=?,body=?,content_hash=?,status='pending' WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(rev,subject,body,h,company,campaign,prospect_id,step_no))
            db.execute("DELETE FROM draft_approvals WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step_no))
            db.execute("UPDATE jobs SET status='stopped' WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=? AND status='queued'",(company,campaign,prospect_id,step_no))
            self._audit(db,company,"draft_edited","draft",f"{campaign}/{prospect_id}/{step_no}",revision=rev,content_hash=h)
            return h

    def review_queue(self,company):
        with self.connect() as db:
            self._company(db,company)
            result=[]
            for row in db.execute("SELECT d.campaign_id,d.prospect_id,p.email,p.display_name,d.step_no,d.revision,d.subject,d.body,d.source_id,d.source_hash,d.content_hash,d.status,c.brand_id,c.sender FROM drafts d JOIN prospects p USING(company_id,prospect_id) JOIN companies c USING(company_id) WHERE d.company_id=? AND d.status='pending' ORDER BY d.campaign_id,d.prospect_id,d.step_no",(company,)):
                item=dict(row); rendered=render_email(item["brand_id"],item["subject"],item["body"])
                item.update(body_text=rendered["text"],body_html=rendered["html"],sender_name=rendered["sender_name"])
                result.append(item)
            return result

    def approve_draft(self,company,campaign,prospect_id,step_no,reviewer,ttl_seconds=3600):
        if not reviewer.strip() or not 1<=ttl_seconds<=86400: raise ValueError("Invalid reviewer or approval lifetime")
        with self.connect() as db:
            self._company(db,company); now=_now()
            d=db.execute("SELECT * FROM drafts WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step_no)).fetchone()
            if not d: raise ValueError("Draft not found in this company")
            source=self._source(db,company,d["source_id"],now)
            expected=_hash(_json({"subject":d["subject"],"body":d["body"],"source_id":d["source_id"],"source_hash":d["source_hash"]}))
            if expected!=d["content_hash"] or source["sha256"]!=d["source_hash"]: raise ValueError("Draft or its evidence changed; regenerate before approval")
            db.execute("INSERT OR REPLACE INTO draft_approvals VALUES(?,?,?,?,?,?,?,?,?)",(company,campaign,prospect_id,step_no,d["revision"],d["content_hash"],reviewer,_stamp(now),_stamp(now+timedelta(seconds=ttl_seconds))))
            db.execute("UPDATE drafts SET status='approved' WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step_no))
            self._audit(db,company,"draft_approved","draft",f"{campaign}/{prospect_id}/{step_no}",revision=d["revision"],content_hash=d["content_hash"],reviewer=reviewer)
            return d["content_hash"]

    def _approved(self,db,company,campaign,prospect_id,step,now):
        d=db.execute("SELECT * FROM drafts WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect_id,step)).fetchone()
        a=db.execute("SELECT * FROM draft_approvals WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=? AND revision=?",(company,campaign,prospect_id,step,d["revision"] if d else -1)).fetchone()
        if not d or not a or d["content_hash"]!=a["content_hash"] or datetime.fromisoformat(a["expires_at"])<=now: return None
        try: source=self._source(db,company,d["source_id"],now)
        except ValueError: return None
        if source["sha256"]!=d["source_hash"]: return None
        return d

    def _valid_campaign_approval(self,db,company,campaign,now):
        approval=db.execute("SELECT * FROM campaign_approvals WHERE company_id=? AND campaign_id=?",(company,campaign)).fetchone()
        return bool(approval and approval["config_hash"]==self._campaign_hash(db,company,campaign) and datetime.fromisoformat(approval["expires_at"])>now)

    def _idem(self,company,campaign,prospect,step,revision): return _hash(f"{company}|{campaign}|{prospect}|{step}|{revision}")

    def _enqueue(self,db,company,campaign,prospect,step,due):
        d=db.execute("SELECT revision FROM drafts WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,campaign,prospect,step)).fetchone()
        if not d: return None
        key=self._idem(company,campaign,prospect,step,d[0]); jid=uuid.uuid4().hex
        db.execute("INSERT OR IGNORE INTO jobs(job_id,company_id,campaign_id,prospect_id,step_no,idempotency_key,due_at,status,created_at) VALUES(?,?,?,?,?,?,?,'queued',?)",(jid,company,campaign,prospect,step,key,_stamp(due),_iso()))
        row=db.execute("SELECT job_id FROM jobs WHERE company_id=? AND idempotency_key=?",(company,key)).fetchone()
        return row[0]

    def schedule(self,company,campaign,prospect_id,now=None):
        now=(now or _now()).astimezone(timezone.utc)
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                self._company(db,company)
                camp=db.execute("SELECT * FROM campaigns WHERE company_id=? AND campaign_id=?",(company,campaign)).fetchone()
                prospect=db.execute("SELECT * FROM prospects WHERE company_id=? AND prospect_id=?",(company,prospect_id)).fetchone()
                if not camp or not prospect: raise ValueError("Unknown campaign or prospect in this company")
                if not self._valid_campaign_approval(db,company,campaign,now): raise PermissionError("Campaign config requires current human approval")
                if prospect["status"]!="active" or db.execute("SELECT 1 FROM suppressions WHERE company_id=? AND email_norm=?",(company,prospect["email_norm"])).fetchone(): raise ValueError("Prospect is stopped or suppressed")
                if not self._approved(db,company,campaign,prospect_id,1,now): raise PermissionError("Current first-step draft approval is required")
                jid=self._enqueue(db,company,campaign,prospect_id,1,now)
                self._audit(db,company,"job_scheduled","job",jid,campaign_id=campaign,prospect_id=prospect_id)
                db.execute("COMMIT"); return jid
            except Exception:
                db.execute("ROLLBACK"); raise

    @staticmethod
    def _next_window(now,camp,tz):
        zone=ZoneInfo(tz); local=now.astimezone(zone)
        start=clock_time.fromisoformat(camp["window_start"]); end=clock_time.fromisoformat(camp["window_end"])
        if start<=local.timetz().replace(tzinfo=None)<end: return now
        day=local.date() if local.timetz().replace(tzinfo=None)<start else local.date()+timedelta(days=1)
        return datetime.combine(day,start,zone).astimezone(timezone.utc)

    def _daily_sends(self,db,company,now,tz,campaign=None):
        zone=ZoneInfo(tz); today=now.astimezone(zone).date()
        if campaign:
            rows=db.execute("SELECT d.accepted_at FROM provider_deliveries d JOIN jobs j ON j.job_id=d.job_id WHERE d.company_id=? AND j.campaign_id=?",(company,campaign)).fetchall()
        else: rows=db.execute("SELECT accepted_at FROM provider_deliveries WHERE company_id=?",(company,)).fetchall()
        return sum(datetime.fromisoformat(x[0]).astimezone(zone).date()==today for x in rows)

    @staticmethod
    def _tomorrow_start(now,camp,tz):
        zone=ZoneInfo(tz); day=now.astimezone(zone).date()+timedelta(days=1)
        return datetime.combine(day,clock_time.fromisoformat(camp["window_start"]),zone).astimezone(timezone.utc)

    def claim_job(self,company,worker_id="local-worker",now=None,lease_seconds=60):
        now=(now or _now()).astimezone(timezone.utc); stamp=_stamp(now)
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                c=self._company(db,company)
                row=db.execute("SELECT * FROM jobs WHERE company_id=? AND ((status='queued' AND due_at<=?) OR (status='claimed' AND lease_until<=?)) ORDER BY due_at,created_at LIMIT 1",(company,stamp,stamp)).fetchone()
                if not row: db.execute("COMMIT"); return None
                current_provider=getattr(self.provider,"provider_name","mock")
                if row["status"]=="claimed":
                    if row["provider_name"]!=current_provider:
                        db.execute("UPDATE jobs SET status='ambiguous',lease_owner=NULL,lease_until=NULL WHERE job_id=?",(row["job_id"],))
                        self._audit(db,company,"job_ambiguous","job",row["job_id"],reason="provider changed while a prior attempt lease expired")
                        db.execute("COMMIT"); return None
                    if getattr(self.provider,"ambiguous_delivery_must_not_retry",False):
                        db.execute("UPDATE jobs SET status='ambiguous',lease_owner=NULL,lease_until=NULL WHERE job_id=?",(row["job_id"],))
                        self._audit(db,company,"job_ambiguous","job",row["job_id"],reason="expired live-provider lease; prior request may have been accepted")
                        db.execute("COMMIT"); return None
                p=db.execute("SELECT * FROM prospects WHERE company_id=? AND prospect_id=?",(company,row["prospect_id"])).fetchone()
                camp=db.execute("SELECT * FROM campaigns WHERE company_id=? AND campaign_id=?",(company,row["campaign_id"])).fetchone()
                nowdt=now
                reason=None
                if not camp["active"] or not self._valid_campaign_approval(db,company,row["campaign_id"],nowdt): reason="campaign approval missing, expired, or changed"
                elif not p or p["status"]!="active": reason="prospect is stopped"
                elif db.execute("SELECT 1 FROM suppressions WHERE company_id=? AND email_norm=?",(company,p["email_norm"])).fetchone(): reason="address suppressed"
                elif not self._approved(db,company,row["campaign_id"],row["prospect_id"],row["step_no"],nowdt): reason="draft approval missing, expired, changed or evidence stale"
                if reason:
                    db.execute("UPDATE jobs SET status='stopped',lease_owner=NULL,lease_until=NULL WHERE job_id=?",(row["job_id"],))
                    self._audit(db,company,"job_stopped","job",row["job_id"],reason=reason)
                    db.execute("COMMIT"); return None
                # Do not lease out-of-window or over-cap work; persist the next safe due time.
                safe_time=self._next_window(now,camp,c["timezone"])
                company_sends=self._daily_sends(db,company,now,c["timezone"])
                campaign_sends=self._daily_sends(db,company,now,c["timezone"],camp["campaign_id"])
                if company_sends>=c["max_daily_cap"] or campaign_sends>=camp["daily_cap"]:
                    safe_time=self._tomorrow_start(now,camp,c["timezone"])
                    db.execute("UPDATE jobs SET status='queued',due_at=?,lease_owner=NULL,lease_until=NULL WHERE job_id=?",(_stamp(safe_time),row["job_id"]))
                    self._audit(db,company,"job_deferred_cap","job",row["job_id"],next_due_at=_stamp(safe_time),company_daily_sends=company_sends,campaign_daily_sends=campaign_sends)
                    db.execute("COMMIT"); return None
                if safe_time>now:
                    db.execute("UPDATE jobs SET status='queued',due_at=?,lease_owner=NULL,lease_until=NULL WHERE job_id=?",(_stamp(safe_time),row["job_id"]))
                    self._audit(db,company,"job_deferred_window","job",row["job_id"],next_due_at=_stamp(safe_time))
                    db.execute("COMMIT"); return None
                db.execute("UPDATE jobs SET status='claimed',attempts=attempts+1,lease_owner=?,lease_until=?,provider_name=? WHERE job_id=?",(worker_id,_stamp(now+timedelta(seconds=lease_seconds)),current_provider,row["job_id"]))
                result=dict(row); result["attempts"]=row["attempts"]+1
                db.execute("COMMIT"); return result
            except Exception:
                db.execute("ROLLBACK"); raise

    def _mock_outbox(self,job,sent_at=None):
        message_id="mock-"+job["idempotency_key"][:24]
        with self.connect() as db:
            db.execute("INSERT OR IGNORE INTO outbox VALUES(?,?,?,?,?,'mock_sent')",(message_id,job["company_id"],job["job_id"],job["idempotency_key"],sent_at or _iso()))
            row=db.execute("SELECT provider_message_id FROM outbox WHERE company_id=? AND idempotency_key=?",(job["company_id"],job["idempotency_key"])).fetchone()
            return row[0]

    def _finish_sent(self,job_id,message_id,now=None,provider_name="mock",delivery_status="mock_sent"):
        now=now or _now()
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                job=db.execute("SELECT * FROM jobs WHERE job_id=?",(job_id,)).fetchone()
                if not job: raise ValueError("Unknown job")
                db.execute("UPDATE jobs SET status='sent',lease_owner=NULL,lease_until=NULL WHERE job_id=?",(job_id,))
                db.execute("UPDATE drafts SET status='sent' WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(job["company_id"],job["campaign_id"],job["prospect_id"],job["step_no"]))
                db.execute("INSERT OR IGNORE INTO provider_deliveries(company_id,job_id,idempotency_key,provider_name,status,accepted_at,provider_message_id) VALUES(?,?,?,?,?,?,?)",
                           (job["company_id"],job_id,job["idempotency_key"],provider_name,delivery_status,_stamp(now),message_id))
                self._audit(db,job["company_id"],"provider_send_accepted","job",job_id,provider_name=provider_name,provider_status=delivery_status,provider_message_id=message_id,idempotency_key=job["idempotency_key"])
                # Follow-up timer begins after confirmed delivery; each step must already be approved.
                next_step=job["step_no"]+1
                step=db.execute("SELECT delay_seconds FROM sequence_steps WHERE company_id=? AND campaign_id=? AND step_no=?",(job["company_id"],job["campaign_id"],next_step)).fetchone()
                if step and self._valid_campaign_approval(db,job["company_id"],job["campaign_id"],now) and self._approved(db,job["company_id"],job["campaign_id"],job["prospect_id"],next_step,now):
                    self._enqueue(db,job["company_id"],job["campaign_id"],job["prospect_id"],next_step,now+timedelta(seconds=step[0]))
                    self._audit(db,job["company_id"],"followup_scheduled","job",job_id,next_step=next_step,delay_seconds=step[0])
                db.execute("COMMIT")
            except Exception:
                db.execute("ROLLBACK"); raise

    def process_one(self,company,worker_id="local-worker",now=None):
        now=(now or _now()).astimezone(timezone.utc)
        job=self.claim_job(company,worker_id,now)
        if not job: return {"status":"idle_or_deferred"}
        with self.connect() as db:
            draft=db.execute("SELECT * FROM drafts WHERE company_id=? AND campaign_id=? AND prospect_id=? AND step_no=?",(company,job["campaign_id"],job["prospect_id"],job["step_no"])).fetchone()
        if not draft:
            self._set_job(job["job_id"],"failed","approved draft disappeared")
            return {"status":"failed","job_id":job["job_id"]}
        with self.connect() as db:
            delivery_context=db.execute("SELECT p.email AS recipient,c.sender,s.category AS message_category FROM prospects p JOIN companies c USING(company_id) JOIN sequence_steps s ON s.company_id=p.company_id WHERE p.company_id=? AND p.prospect_id=? AND s.campaign_id=? AND s.step_no=?",
                                        (company,job["prospect_id"],job["campaign_id"],job["step_no"])).fetchone()
            owner=self._company(db,company)
            sent_today=self._daily_sends(db,company,now,owner["timezone"])
        provider_name=getattr(self.provider,"provider_name","mock")
        if provider_name!="mock" and not owner["live_enabled"]:
            self._set_job(job["job_id"],"stopped","company database is hard-disabled for live sending")
            return {"status":"live_disabled","job_id":job["job_id"]}
        job_payload={**dict(job),**dict(delivery_context),"company_daily_sent":sent_today}
        try:
            rendered=render_email(owner["brand_id"],draft["subject"],draft["body"])
            delivery=self.provider.send(job_payload,{**dict(draft),"body_html":rendered["html"],"body_text":rendered["text"],"_send_at":now})
        except AmbiguousDelivery as exc:
            self._set_job(job["job_id"],"ambiguous",str(exc))
            return {"status":"ambiguous","job_id":job["job_id"],"idempotency_key":job["idempotency_key"]}
        except Exception as exc:
            from .graph_mail import AmbiguousGraphDelivery
            if isinstance(exc,AmbiguousGraphDelivery):
                self._set_job(job["job_id"],"ambiguous",str(exc))
                return {"status":"ambiguous","job_id":job["job_id"],"idempotency_key":job["idempotency_key"]}
            self._set_job(job["job_id"],"failed",type(exc).__name__)
            return {"status":"failed","job_id":job["job_id"],"error_type":type(exc).__name__}
        if isinstance(delivery,dict) and delivery.get("status")=="accepted_unconfirmed_delivery":
            self._finish_sent(job["job_id"],None,now,provider_name=getattr(self.provider,"provider_name","provider"),delivery_status="accepted_unconfirmed_delivery")
            return {"status":"accepted_unconfirmed_delivery","job_id":job["job_id"],"idempotency_key":job["idempotency_key"]}
        self._finish_sent(job["job_id"],delivery,now,provider_name=getattr(self.provider,"provider_name","mock"),delivery_status="mock_sent")
        return {"status":"sent_mock","job_id":job["job_id"],"provider_message_id":delivery}

    def _set_job(self,job_id,status,reason):
        with self.connect() as db:
            row=db.execute("SELECT company_id FROM jobs WHERE job_id=?",(job_id,)).fetchone()
            if not row: return
            db.execute("UPDATE jobs SET status=?,lease_owner=NULL,lease_until=NULL WHERE job_id=?",(status,job_id))
            self._audit(db,row["company_id"],"job_"+status,"job",job_id,reason=reason)

    def reconcile(self,company,job_id):
        with self.connect() as db:
            self._company(db,company)
            job=db.execute("SELECT * FROM jobs WHERE company_id=? AND job_id=?",(company,job_id)).fetchone()
            if not job: raise ValueError("Unknown job in this company")
        if job["status"]!="ambiguous": return job["status"]
        message_id=self.provider.lookup(company,job["idempotency_key"])
        if message_id:
            provider_name=job["provider_name"]
            self._finish_sent(job_id,message_id,provider_name=provider_name,delivery_status="sent_found_in_mailbox" if provider_name=="microsoft-graph" else "mock_sent")
            return "sent_reconciled"
        if getattr(self.provider,"ambiguous_delivery_must_not_retry",False):
            with self.connect() as db:
                self._audit(db,company,"ambiguous_manual_review_required","job",job_id,idempotency_key=job["idempotency_key"])
            return "manual_review_required"
        with self.connect() as db:
            db.execute("UPDATE jobs SET status='queued',due_at=?,lease_owner=NULL,lease_until=NULL WHERE job_id=?",(_iso(),job_id))
            self._audit(db,company,"ambiguous_not_accepted_retry_queued","job",job_id,idempotency_key=job["idempotency_key"])
        return "retry_queued"

    def approve_ambiguous_retry(self,company,job_id,reviewer,evidence_ref,confirm_not_sent=False):
        """Human-attested retry after a mailbox check; never triggered by lookup timeout."""
        if not reviewer.strip() or not evidence_ref.strip() or len(evidence_ref)>500 or confirm_not_sent is not True:
            raise PermissionError("Retry requires a named human, evidence reference and explicit confirmed-not-sent assertion")
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                self._company(db,company)
                job=db.execute("SELECT * FROM jobs WHERE company_id=? AND job_id=?",(company,job_id)).fetchone()
                if not job or job["status"]!="ambiguous": raise ValueError("Only this company's ambiguous job can be retried")
                if job["provider_name"]!="microsoft-graph": raise ValueError("Human mailbox retry approval is reserved for Graph sends")
                db.execute("UPDATE jobs SET status='queued',due_at=?,lease_owner=NULL,lease_until=NULL WHERE job_id=?",(_iso(),job_id))
                self._audit(db,company,"graph_retry_human_approved","job",job_id,reviewer=reviewer,evidence_ref=evidence_ref,idempotency_key=job["idempotency_key"],confirmed_not_sent=True)
                db.execute("COMMIT")
                return {"status":"retry_queued_by_human","job_id":job_id,"idempotency_key":job["idempotency_key"]}
            except Exception:
                db.execute("ROLLBACK"); raise

    def ingest_event(self,company,event_id,email,event_type,received_at=None):
        event_id=_valid_id(event_id); email_norm=_email(email).casefold()
        if event_type not in ("reply","bounce","unsubscribe"): raise ValueError("Unsupported inbound event")
        received=_stamp(received_at or _now())
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                self._company(db,company)
                cur=db.execute("INSERT OR IGNORE INTO inbound_events VALUES(?,?,?,?,?)",(company,event_id,email_norm,event_type,received))
                if cur.rowcount==0: db.execute("COMMIT"); return "duplicate_ignored"
                prospect_rows=db.execute("SELECT prospect_id,status FROM prospects WHERE company_id=? AND email_norm=?",(company,email_norm)).fetchall()
                if event_type=="reply":
                    db.execute("UPDATE prospects SET status='replied' WHERE company_id=? AND email_norm=?",(company,email_norm))
                else:
                    db.execute("INSERT OR REPLACE INTO suppressions VALUES(?,?,?,?,?)",(company,email_norm,event_type,event_id,received))
                    db.execute("UPDATE prospects SET status='stopped' WHERE company_id=? AND email_norm=?",(company,email_norm))
                db.execute("UPDATE jobs SET status='stopped',lease_owner=NULL,lease_until=NULL WHERE company_id=? AND prospect_id IN (SELECT prospect_id FROM prospects WHERE company_id=? AND email_norm=?) AND status='queued'",(company,company,email_norm))
                self._audit(db,company,"inbound_"+event_type,"email",email_norm,event_id=event_id,matched_prospects=[x["prospect_id"] for x in prospect_rows])
                db.execute("COMMIT"); return "processed"
            except Exception:
                db.execute("ROLLBACK"); raise

    def report(self,company):
        with self.connect() as db:
            c=self._company(db,company)
            def counts(table,where="",params=()): return db.execute(f"SELECT COUNT(*) FROM {table} WHERE company_id=? {where}",(company,*params)).fetchone()[0]
            events=[dict(x) for x in db.execute("SELECT at,event,object_type,object_id,detail_json FROM audit WHERE company_id=? ORDER BY audit_id DESC LIMIT 30",(company,))]
            return {"company_id":company,"brand_id":c["brand_id"],"sender_name":THEMES[c["brand_id"]]["sender"],"sender_address":c["sender"],"mode":c["mode"],"live_enabled":bool(c["live_enabled"]),"live_send_blockers":["No delegated OAuth token provider is configured","The Graph adapter requires a separately approved expiring send policy and explicit live flag","This database is hard-disabled for live sending"],
                    "icps":counts("icps"),"prospects":counts("prospects"),"sources":counts("sources"),"campaigns":counts("campaigns"),"drafts":counts("drafts"),"queued_jobs":counts("jobs","AND status='queued'"),"sent_mock":counts("outbox"),"graph_accepted_unconfirmed":counts("provider_deliveries","AND provider_name='microsoft-graph' AND status='accepted_unconfirmed_delivery'"),"ambiguous_jobs":counts("jobs","AND status='ambiguous'"),"suppressed":counts("suppressions"),"inbound_events":counts("inbound_events"),"audit_tail":events}

    def status_live(self,company):
        with self.connect() as db:
            c=self._company(db,company)
            return {"company_id":company,"status":"disabled","send_live":False,"mode":c["mode"],"blockers":["Microsoft Graph transport exists but no delegated token provider is configured","Company database is hard-disabled for live sends","No approved audience/sender/message-category/cap policy or OAuth credential exists"]}


def bootstrap_demo(store,company="sparktech-demo",now=None):
    """Seed deliberately synthetic `.invalid` entities; never imports a real contact list."""
    if now is None: now=_now()
    store.create_company(company,"SparkTech Demo","demo-sender@example.invalid","UTC",daily_cap=5)
    store.add_icp(company,"small-publisher","Small publisher",["small_team","local_guides"],"keeping useful local information current")
    store.add_source(company,"offer-note","local://synthetic/demo-offer","We help small teams review their content operations.","demo-reviewer",expires_days=30)
    store.add_prospect(company,"fixture-prospect","alex@example.invalid","Alex Example","small-publisher",["small_team","local_guides"])
    store.add_campaign(company,"fixture-campaign","Synthetic introduction","small-publisher","offer-note","research_intro",daily_cap=3,
        window_start="00:00",window_end="23:59",steps=[
            {"delay_seconds":0,"subject":"A note about {problem}","body":"Hi {first_name}, this is a synthetic sandbox draft. Our approved note says: {source_fact} We are exploring {problem}. Would a short conversation be useful?","category":"research_intro"},
            {"delay_seconds":86400,"subject":"Following up, {first_name}","body":"Hi {first_name}, a brief follow-up to our earlier synthetic sandbox note. If this is not relevant, no reply is needed.","category":"follow_up"}])
    drafts=store.create_drafts(company,"fixture-campaign","fixture-prospect")
    return {"company_id":company,"prospect_email":"alex@example.invalid","campaign_id":"fixture-campaign","drafts":drafts,"mode":"sandbox"}


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__); sub=parser.add_subparsers(dest="cmd",required=True)
    def dbarg(p): p.add_argument("--db",required=True); p.add_argument("--company",required=True)
    p=sub.add_parser("demo-init");p.add_argument("--db",required=True);p.add_argument("--company",default="sparktech-demo")
    p=sub.add_parser("init");dbarg(p);p.add_argument("--name",required=True);p.add_argument("--sender",required=True);p.add_argument("--timezone",default="UTC");p.add_argument("--daily-cap",type=int,default=10);p.add_argument("--brand",choices=tuple(THEMES),default="sparktech")
    p=sub.add_parser("report");dbarg(p)
    p=sub.add_parser("live-status");dbarg(p)
    p=sub.add_parser("review");dbarg(p)
    p=sub.add_parser("icp-add");dbarg(p);p.add_argument("--icp-id",required=True);p.add_argument("--name",required=True);p.add_argument("--signal",action="append",required=True);p.add_argument("--problem",required=True)
    p=sub.add_parser("source-add");dbarg(p);p.add_argument("--source-id",required=True);p.add_argument("--origin",required=True);p.add_argument("--fact",required=True);p.add_argument("--reviewer",required=True);p.add_argument("--expires-days",type=int,default=30)
    p=sub.add_parser("prospect-add");dbarg(p);p.add_argument("--prospect",required=True);p.add_argument("--email",required=True);p.add_argument("--display-name",required=True);p.add_argument("--icp-id",required=True);p.add_argument("--signal",action="append",default=[])
    p=sub.add_parser("campaign-add");dbarg(p);p.add_argument("--campaign",required=True);p.add_argument("--name",required=True);p.add_argument("--icp-id",required=True);p.add_argument("--source-id",required=True);p.add_argument("--category",required=True);p.add_argument("--daily-cap",type=int,required=True);p.add_argument("--window-start",required=True);p.add_argument("--window-end",required=True);p.add_argument("--steps-file",required=True)
    p=sub.add_parser("draft");dbarg(p);p.add_argument("--campaign",required=True);p.add_argument("--prospect",required=True)
    p=sub.add_parser("approve-campaign");dbarg(p);p.add_argument("--campaign",required=True);p.add_argument("--reviewer",required=True)
    p=sub.add_parser("approve-draft");dbarg(p);p.add_argument("--campaign",required=True);p.add_argument("--prospect",required=True);p.add_argument("--step",type=int,required=True);p.add_argument("--reviewer",required=True)
    p=sub.add_parser("edit-draft");dbarg(p);p.add_argument("--campaign",required=True);p.add_argument("--prospect",required=True);p.add_argument("--step",type=int,required=True);p.add_argument("--subject",required=True);p.add_argument("--body",required=True)
    p=sub.add_parser("schedule");dbarg(p);p.add_argument("--campaign",required=True);p.add_argument("--prospect",required=True)
    p=sub.add_parser("worker");dbarg(p);p.add_argument("--limit",type=int,default=1,choices=range(1,101));p.add_argument("--worker-id",default="local-worker")
    p=sub.add_parser("reconcile");dbarg(p);p.add_argument("--job",required=True)
    p=sub.add_parser("retry-ambiguous");dbarg(p);p.add_argument("--job",required=True);p.add_argument("--reviewer",required=True);p.add_argument("--evidence-ref",required=True);p.add_argument("--confirm-not-sent",action="store_true",required=True)
    p=sub.add_parser("inbound");dbarg(p);p.add_argument("--event-id",required=True);p.add_argument("--email",required=True);p.add_argument("--kind",choices=("reply","bounce","unsubscribe"),required=True);p.add_argument("--test-only",action="store_true",required=True,help="Inbound webhook is not enabled; accept only explicit local fixture events")
    args=parser.parse_args(argv); store=OutreachStore(args.db)
    if args.cmd=="demo-init": result=bootstrap_demo(store,args.company)
    elif args.cmd=="init": store.create_company(args.company,args.name,args.sender,args.timezone,args.daily_cap,args.brand); result={"company_id":args.company,"mode":"sandbox","brand_id":args.brand,"live_enabled":False}
    elif args.cmd=="report": result=store.report(args.company)
    elif args.cmd=="live-status": result=store.status_live(args.company)
    elif args.cmd=="review": result=store.review_queue(args.company)
    elif args.cmd=="icp-add": store.add_icp(args.company,args.icp_id,args.name,args.signal,args.problem); result={"icp_id":args.icp_id}
    elif args.cmd=="source-add": store.add_source(args.company,args.source_id,args.origin,args.fact,args.reviewer,args.expires_days); result={"source_id":args.source_id,"status":"reviewed"}
    elif args.cmd=="prospect-add": store.add_prospect(args.company,args.prospect,args.email,args.display_name,args.icp_id,args.signal); result={"prospect_id":args.prospect,"status":"active"}
    elif args.cmd=="campaign-add":
        steps=json.loads(Path(args.steps_file).read_text())
        store.add_campaign(args.company,args.campaign,args.name,args.icp_id,args.source_id,args.category,args.daily_cap,args.window_start,args.window_end,steps)
        result={"campaign_id":args.campaign,"steps":len(steps),"status":"requires_approval"}
    elif args.cmd=="draft": result=store.create_drafts(args.company,args.campaign,args.prospect)
    elif args.cmd=="approve-campaign": result={"campaign_hash":store.approve_campaign(args.company,args.campaign,args.reviewer)}
    elif args.cmd=="approve-draft": result={"content_hash":store.approve_draft(args.company,args.campaign,args.prospect,args.step,args.reviewer)}
    elif args.cmd=="edit-draft": result={"content_hash":store.edit_draft(args.company,args.campaign,args.prospect,args.step,args.subject,args.body)}
    elif args.cmd=="schedule": result={"job_id":store.schedule(args.company,args.campaign,args.prospect)}
    elif args.cmd=="worker": result=[store.process_one(args.company,args.worker_id) for _ in range(args.limit)]
    elif args.cmd=="reconcile": result={"status":store.reconcile(args.company,args.job)}
    elif args.cmd=="retry-ambiguous": result=store.approve_ambiguous_retry(args.company,args.job,args.reviewer,args.evidence_ref,args.confirm_not_sent)
    else: result={"status":store.ingest_event(args.company,args.event_id,args.email,args.kind)}
    print(json.dumps(result,indent=2))


if __name__=="__main__": main()
