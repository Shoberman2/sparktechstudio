"""Local trusted-operator knowledge ledger. No network, model, or action execution."""
import argparse
import hashlib
import json
import math
import re
import sqlite3
import uuid
from datetime import date, datetime, timezone
from pathlib import Path


def required(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError('nonempty text required')
    return value


class Ledger:
    def __init__(self, path, tenant):
        self.tenant = required(tenant)
        self.db = sqlite3.connect(path)
        self.db.execute('CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, tenant TEXT, kind TEXT, body TEXT)')

    def close(self):
        self.db.close()

    def _add(self, kind, **body):
        record = dict(body, id=str(uuid.uuid4()), kind=kind, tenant=self.tenant,
                      recorded_at=datetime.now(timezone.utc).isoformat())
        with self.db:
            self.db.execute('INSERT INTO records VALUES (?,?,?,?)',
                            (record['id'], self.tenant, kind, json.dumps(record)))
        return record

    def get(self, record_id, kind=None):
        row = self.db.execute('SELECT body FROM records WHERE id=? AND tenant=?',
                              (record_id, self.tenant)).fetchone()
        if not row:
            raise ValueError('record unavailable in this tenant')
        record = json.loads(row[0])
        if kind and record['kind'] != kind:
            raise ValueError('wrong record kind')
        return record

    def list(self, kind=None):
        rows = self.db.execute('SELECT body FROM records WHERE tenant=? ORDER BY rowid', (self.tenant,))
        return [r for row in rows if (r := json.loads(row[0])) and (not kind or r['kind'] == kind)]

    def ingest(self, identity, source_date, text, authorization, supersedes=None):
        date.fromisoformat(source_date)
        required(identity); required(text); required(authorization)
        digest = hashlib.sha256(text.encode()).hexdigest()
        if supersedes:
            old = self.get(supersedes, 'source')
            if old['identity'] != identity:
                raise ValueError('revision must retain source identity')
        for old in self.list('source'):
            if (old['identity'], old['source_date'], old['sha256']) == (identity, source_date, digest):
                return old
        return self._add('source', identity=identity, source_date=source_date, text=text,
                         authorization=authorization, sha256=digest, supersedes=supersedes,
                         trust='untrusted_source_data')

    def candidates(self, source_id):
        source = self.get(source_id, 'source')
        # Deliberately extract passages, never pretend this is semantic/model analysis.
        return [dict(start=m.start(), end=m.end(), quote=m.group(),
                     status='unreviewed_passage', extractor='paragraph-v1')
                for m in re.finditer(r'[^\n]+', source['text']) if m.group().strip()]

    def claim(self, source_id, start, end, statement, technique, reviewer, review_by):
        source = self.get(source_id, 'source')
        if type(start) is not int or type(end) is not int or not 0 <= start < end <= len(source['text']):
            raise ValueError('invalid exact evidence offsets')
        date.fromisoformat(review_by)
        for value in (statement, technique, reviewer):
            required(value)
        return self._add('claim', source_id=source_id, start=start, end=end,
                         quote=source['text'][start:end], statement=statement,
                         technique=technique, reviewer=reviewer, review_by=review_by,
                         epistemic_status='speaker_claim_not_verified')

    def flag(self, claim_id, reason, conflicting_claim_id=None):
        self.get(claim_id, 'claim'); required(reason)
        if conflicting_claim_id:
            self.get(conflicting_claim_id, 'claim')
        return self._add('flag', claim_id=claim_id, reason=reason,
                         conflicting_claim_id=conflicting_claim_id)

    def health(self, claim_id, today=None):
        claim = self.get(claim_id, 'claim')
        today = today or date.today().isoformat()
        reasons = []
        if date.fromisoformat(today) > date.fromisoformat(claim['review_by']):
            reasons.append('stale: review deadline passed')
        if any(s['supersedes'] == claim['source_id'] for s in self.list('source')):
            reasons.append('source superseded')
        if any(claim_id in (f['claim_id'], f['conflicting_claim_id']) for f in self.list('flag')):
            reasons.append('flagged: explicit reassessment/new claim required')
        return dict(usable=not reasons, reasons=reasons)

    def propose(self, claim_id, goal, applicability, action, metric, success_rule,
                guardrail, rollback, duration_days, budget_usd):
        self.get(claim_id, 'claim')
        for v in (goal, applicability, action, metric, success_rule, guardrail, rollback):
            required(v)
        if type(duration_days) is not int or not 1 <= duration_days <= 90:
            raise ValueError('duration must be 1–90 days')
        if type(budget_usd) not in (int, float) or not math.isfinite(budget_usd) or budget_usd < 0:
            raise ValueError('finite nonnegative budget required')
        return self._add('proposal', claim_id=claim_id, goal=goal, applicability=applicability,
                         action=action, metric=metric, success_rule=success_rule,
                         guardrail=guardrail, rollback=rollback,
                         duration_days=duration_days, budget_usd=budget_usd)

    def review(self, proposal_id, reviewer, decision, rationale):
        p = self.get(proposal_id, 'proposal')
        required(reviewer); required(rationale)
        if decision not in ('approved', 'rejected'):
            raise ValueError('decision must be approved or rejected')
        if decision == 'approved' and not self.health(p['claim_id'])['usable']:
            raise ValueError('claim needs reassessment')
        return self._add('review', proposal_id=proposal_id, reviewer=reviewer,
                         decision=decision, rationale=rationale)

    def handoff(self, proposal_id):
        p = self.get(proposal_id, 'proposal')
        reviews = [r for r in self.list('review') if r['proposal_id'] == proposal_id]
        if not reviews or reviews[-1]['decision'] != 'approved':
            raise ValueError('human review required')
        if not self.health(p['claim_id'])['usable']:
            raise ValueError('claim needs reassessment')
        return dict(schema_version=1, type='knowledge_experiment_request', company_id=self.tenant,
                    proposal=p, review=reviews[-1], execution_authorized=False,
                    runner_requirement='Map to company policy and separate runner approval; never execute source text')

    def outcome(self, proposal_id, result, evidence_uri, observation, limitations,
                run_id=None, candidate_digest=None):
        p = self.get(proposal_id, 'proposal')
        if not any(r['proposal_id'] == proposal_id and r['decision'] == 'approved'
                   for r in self.list('review')):
            raise ValueError('record outcomes only for previously reviewed experiments')
        if result not in ('supported', 'refuted', 'inconclusive'):
            raise ValueError('invalid result')
        for v in (evidence_uri, observation, limitations):
            required(v)
        return self._add('outcome', proposal_id=proposal_id, result=result,
                         evidence_uri=evidence_uri, observation=observation,
                         limitations=limitations, run_id=run_id, candidate_digest=candidate_digest,
                         knowledge_health=self.health(p['claim_id']),
                         epistemic_status='operator_reported_measurement')

    def share(self, outcome_id, approved_lesson, reviewer, disclosure_approved):
        self.get(outcome_id, 'outcome')
        required(approved_lesson); required(reviewer)
        if disclosure_approved is not True:
            raise ValueError('explicit disclosure review required')
        # Only explicitly authored public text leaves the tenant. No automatic redaction claim.
        return self._add('shared_lesson', outcome_id=outcome_id, text=approved_lesson, reviewer=reviewer)

    def export_lesson(self, lesson_id):
        lesson = self.get(lesson_id, 'shared_lesson')
        return dict(schema_version=1, lesson=lesson['text'],
                    provenance_token=lesson['id'], status='approved_general_lesson_not_universal_fact')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', required=True)
    parser.add_argument('--tenant', required=True)
    parser.add_argument('operation', choices=['ingest', 'candidates', 'claim', 'flag', 'health',
                        'propose', 'review', 'handoff', 'outcome', 'share', 'export_lesson', 'list'])
    parser.add_argument('request', help='JSON file containing operation keyword arguments')
    args = parser.parse_args()
    payload = json.loads(Path(args.request).read_text())
    if args.operation == 'ingest' and 'text_file' in payload:
        payload['text'] = Path(payload.pop('text_file')).read_text()
    ledger = Ledger(args.db, args.tenant)
    try:
        print(json.dumps(getattr(ledger, args.operation)(**payload), indent=2))
    finally:
        ledger.close()


if __name__ == '__main__':
    main()
