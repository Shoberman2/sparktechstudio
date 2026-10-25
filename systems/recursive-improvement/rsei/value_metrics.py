"""Validate company-local aggregate evidence; never infer retention from logins."""
from datetime import datetime, timedelta
from .pilot import age, verify_ref

METRICS = {'verified_value_14d', 'meaningful_return_7d', 'verified_interview_30d'}
FIELDS = {'company_id', 'metric', 'definition_version', 'scope', 'window_start', 'window_end',
          'as_of', 'numerator', 'denominator', 'tests_excluded', 'deduplicated',
          'coverage_complete', 'source', 'query_source', 'release', 'evidence_basis'}
BASIS = {'verified_value_14d': 'mutual_consent_and_delivery_or_booking_receipts',
         'meaningful_return_7d': 'server_meaningful_actions_on_distinct_days',
         'verified_interview_30d': 'explicit_verified_interview_occurrence'}


def validate(row):
    if set(row) != FIELDS or row['company_id'] != 'utern' or row['metric'] not in METRICS:
        raise ValueError('Only defined UTern aggregate fields are accepted')
    if row['definition_version'] != 1 or row['scope'] != 'production':
        raise ValueError('Require current production metric definition')
    if row['evidence_basis'] != BASIS[row['metric']]:
        raise ValueError('Login counts, agent text and status-only proxies cannot establish customer value')
    dates = [datetime.fromisoformat(row[k]) for k in ('window_start','window_end','as_of')]
    if any(t.tzinfo is None for t in dates) or not dates[0] < dates[1] <= dates[2] or age(row['as_of']) < -60:
        raise ValueError('Invalid cohort window or capture timestamp')
    horizon = {'verified_value_14d':14, 'meaningful_return_7d':7, 'verified_interview_30d':30}[row['metric']]
    if dates[1] + timedelta(days=horizon) > dates[2]:
        raise ValueError('Cohort is not mature for the outcome horizon')
    n, d = row['numerator'], row['denominator']
    if type(n) is not int or type(d) is not int or not 0 <= n <= d:
        raise ValueError('Require nonnegative distinct cohort counts with numerator <= denominator')
    if any(row[k] is not True for k in ('tests_excluded','deduplicated','coverage_complete')):
        raise ValueError('Unverified exclusions, uniqueness or collection coverage block measurement')
    if not all(verify_ref(row[k]) for k in ('source','query_source')):
        raise ValueError('Evidence or query changed')
    release = row['release']
    if set(release) != {'deployment_id','commit'} or not all(release.values()):
        raise ValueError('Exact serving release identity required')
    return {'metric':row['metric'], 'numerator':n, 'denominator':d,
            'rate':n/d if d else None, 'status':'measured' if d else 'empty_cohort',
            'target_met':None, 'causal_improvement_verified':False,
            'limitations':'Local owner attestation and aggregate validation do not independently audit source rows or prove causality.'}
