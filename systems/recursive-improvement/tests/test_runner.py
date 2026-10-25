"""Orchestration fault tests use explicit test doubles; demo uses real Chromium."""
import http.server
import json
import io
import os
from pathlib import Path
import sys
import tempfile
import threading
import unittest
import urllib.error
from unittest.mock import patch
from contextlib import redirect_stdout

from rsei.runner import BoundaryError, Cycle, atomic_json, company_lock, load_config, recover, main
from adapters.codex_worker import main as codex_main
from adapters import claude_worker


PROBE = '''import json, os, sys
from pathlib import Path
p = Path(os.environ['RSEI_EVIDENCE'])
text = (Path(os.environ['RSEI_WORKSPACE']) / 'app.txt').read_text()
failed = text != 'fixed' or (os.environ.get('FAULT') == 'release' and p.name == 'release_check')
fingerprint = p.name if os.environ.get('FAULT') == 'flaky' else 'known-defect'
if os.environ.get('FAULT') == 'infra': sys.exit(2)
(p / 'result.json').write_text(json.dumps({'schema_version': 1, 'status': 'finding' if failed else 'passed', 'fingerprint': fingerprint, 'artifacts': []}))
sys.exit(10 if failed else 0)
'''
WORKER = '''import os, time
from pathlib import Path
p = Path(os.environ['RSEI_WORKSPACE'])
fault = os.environ.get('FAULT')
if fault == 'timeout': time.sleep(5)
if fault == 'output': print('x' * 10000)
if fault == 'outside': (p / 'unapproved.txt').write_text('bad')
if fault == 'source': Path(os.environ['SOURCE_FILE']).write_text('bad')
if fault == 'secret': print(os.environ.get('TEST_CREDENTIAL')); print(os.environ.get('UNDECLARED_SECRET', 'ABSENT'))
(p / 'app.txt').write_text('fixed')
'''
TEST = '''import os, sys
sys.exit(1 if os.environ.get('FAULT') == 'test' else 0)
'''


def claude_reply(patch, model='claude-opus-5', stop_reason='end_turn'):
    """Messages API response shape as a test double; the patch is what a structured-output turn returns."""
    return {'id': 'msg_test', 'type': 'message', 'role': 'assistant', 'model': model, 'stop_reason': stop_reason,
            'stop_details': None, 'content': [{'type': 'text', 'text': json.dumps(patch)}],
            'usage': {'input_tokens': 321, 'output_tokens': 45}}


class FakeUrlopen:
    """Records every Messages API request and answers from a scripted queue. No network."""
    def __init__(self, replies):
        self.replies = list(replies)
        self.requests = []

    def __call__(self, request, timeout=None):
        self.requests.append(request)
        reply = self.replies.pop(0)
        if isinstance(reply, int):
            body = io.BytesIO(json.dumps({'type': 'error', 'error': {'type': 'test', 'message': 'status %d' % reply}}).encode())
            raise urllib.error.HTTPError(request.full_url, reply, 'error', {'request-id': 'req_err'}, body)
        response = io.BytesIO(json.dumps(reply).encode())
        response.status = 200
        response.headers = {'request-id': 'req_ok'}
        response.__enter__ = lambda: response
        response.__exit__ = lambda *args: response.close()
        return response


class LoopbackMessagesServer:
    """Loopback stand-in for api.anthropic.com used only by the subprocess cycle test."""
    def __init__(self, expected_key, patch):
        server = self
        class Handler(http.server.BaseHTTPRequestHandler):
            def log_message(self, *args): pass
            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers['content-length'])))
                server.requests.append({'path': self.path, 'key': self.headers.get('x-api-key'),
                    'version': self.headers.get('anthropic-version'), 'body': body})
                if self.headers.get('x-api-key') != expected_key:
                    self.send_response(401); self.end_headers(); self.wfile.write(b'{"type":"error"}'); return
                data = json.dumps(claude_reply(patch, model=body['model'])).encode()
                self.send_response(200); self.send_header('content-type', 'application/json')
                self.send_header('request-id', 'req_loopback'); self.end_headers(); self.wfile.write(data)
        self.requests = []
        self.http = http.server.HTTPServer(('127.0.0.1', 0), Handler)
        self.url = 'http://127.0.0.1:%d' % self.http.server_address[1]
        threading.Thread(target=self.http.serve_forever, daemon=True).start()

    def close(self):
        self.http.shutdown(); self.http.server_close()


class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        self.source = self.root / 'source'
        self.source.mkdir()
        (self.source / 'app.txt').write_text('broken')
        self.commands = {}
        for name, code in [('probe', PROBE), ('worker', WORKER), ('test', TEST)]:
            path = self.root / (name + '.py')
            path.write_text(code)
            self.commands[name] = [sys.executable, str(path)]
        self.config = {'schema_version': 1, 'company_id': 'alpha', 'display_name': 'Alpha',
            'enabled': True, 'goal': 'Fix test fixture', 'source': str(self.source),
            'source_files': ['app.txt'], 'editable_files': ['app.txt'], 'worker_kind': 'test-double',
            'commands': self.commands, 'permissions': {'browser': True, 'implement': True, 'local_release': True},
            'budgets': {'max_commands': 6, 'max_seconds': 20, 'command_seconds': 3, 'max_output_bytes': 2048},
            'environment': {}, 'secret_env': []}
        self.company = self.root / 'state' / 'alpha'
        self.company.mkdir(parents=True)

    def tearDown(self):
        self.temp.cleanup()

    def cycle(self, fault=None, release=True):
        if fault:
            self.config['environment']['FAULT'] = fault
        c = Cycle(self.config, self.company, release)
        return c, c.run()

    def test_real_subprocess_cycle_retains_evidence_and_source(self):
        c, result = self.cycle()
        self.assertEqual(result['status'], 'completed')
        self.assertEqual(result['commands_used'], 6)
        self.assertEqual((self.source / 'app.txt').read_text(), 'broken')
        self.assertEqual((c.path / 'candidate/app.txt').read_text(), 'fixed')
        self.assertIn('-broken+fixed', (c.path / 'changes.patch').read_text())
        self.assertTrue((c.path / 'evidence/reproduce/command.json').exists())

    def test_no_release_without_both_permission_and_flag(self):
        for permission, flag in [(True, False), (False, True)]:
            self.config['permissions']['local_release'] = permission
            _, r = self.cycle(release=flag)
            self.assertEqual(r['status'], 'awaiting_release')
            self.assertFalse((self.company / 'current.json').exists())

    def test_failed_release_restores_previous_pointer(self):
        previous = {'run_id': 'previous', 'company_id': 'alpha', 'path': '/old/artifact'}
        atomic_json(self.company / 'current.json', previous)
        _, r = self.cycle('release')
        self.assertEqual(r['status'], 'rolled_back')
        self.assertEqual(json.loads((self.company / 'current.json').read_text()), previous)

    def test_failed_first_release_removes_pointer(self):
        _, r = self.cycle('release')
        self.assertEqual(r['status'], 'rolled_back')
        self.assertFalse((self.company / 'current.json').exists())

    def test_unsafe_or_failed_execution_never_releases(self):
        for fault in ['flaky', 'infra', 'outside', 'test', 'output']:
            with self.subTest(fault=fault):
                _, r = self.cycle(fault)
                self.assertEqual(r['status'], 'failed')
                self.assertFalse((self.company / 'current.json').exists())

    def test_timeout_stops_worker(self):
        self.config['budgets']['command_seconds'] = 1
        _, r = self.cycle('timeout')
        self.assertEqual(r['status'], 'failed')
        self.assertEqual(r['error'], 'Command timeout')

    def test_budget_stops_before_worker(self):
        self.config['budgets']['max_commands'] = 2
        _, r = self.cycle()
        self.assertEqual(r['commands_used'], 2)
        self.assertEqual(r['error'], 'Execution budget exhausted')

    def test_source_drift_blocks_release(self):
        self.config['environment']['SOURCE_FILE'] = str(self.source / 'app.txt')
        _, r = self.cycle('source')
        self.assertIn('Source changed', r['error'])

    def test_permissions_stop_before_implementation(self):
        self.config['permissions']['implement'] = False
        _, r = self.cycle()
        self.assertEqual(r['commands_used'], 2)
        self.assertEqual(r['error'], 'Implementation is not permitted')

    def test_credentials_explicit_and_logs_redacted(self):
        self.config['secret_env'] = ['TEST_CREDENTIAL']
        with patch.dict(os.environ, {'TEST_CREDENTIAL': 'test-secret-value', 'UNDECLARED_SECRET': 'never-inherit'}):
            c, r = self.cycle('secret')
        self.assertEqual(r['status'], 'completed')
        log = (c.path / 'evidence/implement/stdout.txt').read_text()
        self.assertEqual(log.strip(), '[REDACTED]\nABSENT')

    def test_previous_lessons_stay_company_local(self):
        first, _ = self.cycle()
        second, _ = self.cycle()
        lessons = json.loads((second.path / 'task.json').read_text())['previous_lessons']
        self.assertEqual([x['run_id'] for x in lessons], [first.path.name])
        beta = self.company.parent / 'beta'
        beta.mkdir()
        self.config['company_id'] = 'beta'
        c = Cycle(self.config, beta)
        c.run()
        self.assertEqual(json.loads((c.path / 'task.json').read_text())['previous_lessons'], [])

    def test_lock_rejects_overlapping_cycle(self):
        with company_lock(self.root, 'alpha'):
            with self.assertRaises(BoundaryError):
                with company_lock(self.root, 'alpha'):
                    pass

    def test_recovery_restores_release_without_replaying_commands(self):
        c = Cycle(self.config, self.company)
        c.event('release_check', previous_pointer=None)
        atomic_json(self.company / 'current.json', {'run_id': c.path.name})
        self.assertEqual(recover(self.company), [c.path.name])
        self.assertFalse((self.company / 'current.json').exists())
        self.assertEqual(recover(self.company), [])

    def test_symlink_source_rejected(self):
        (self.source / 'app.txt').unlink()
        (self.source / 'app.txt').symlink_to(self.root / 'worker.py')
        _, r = self.cycle()
        self.assertEqual(r['status'], 'failed')
        self.assertEqual(r['commands_used'], 0)

    def test_snapshot_must_match_execution_approval(self):
        self.config['approved_source_manifest'] = {'app.txt': 'different-approved-hash'}
        _, r = self.cycle()
        self.assertEqual(r['status'], 'failed')
        self.assertEqual(r['commands_used'], 0)
        self.assertIn('explicitly approved source', r['error'])

    def test_next_cycle_reads_actual_release_and_detects_tampering(self):
        c, _ = self.cycle()
        file = self.root / 'config.json'
        atomic_json(file, self.config)
        args = ['run', '--config', str(file), '--state-root', str(self.company.parent), '--from-current']
        with redirect_stdout(io.StringIO()) as output:
            self.assertEqual(main(args), 0)
        result = json.loads(output.getvalue())
        self.assertEqual(result['status'], 'healthy')
        self.assertEqual(result['commands_used'], 1)
        (c.path / 'candidate/app.txt').write_text('tampered')
        with redirect_stdout(io.StringIO()):
            self.assertEqual(main(args), 2)

    def test_status_readable_while_company_is_locked(self):
        file = self.root / 'config.json'
        atomic_json(file, self.config)
        with company_lock(self.company.parent, 'alpha'):
            with redirect_stdout(io.StringIO()):
                self.assertEqual(main(['status', '--config', str(file), '--state-root', str(self.company.parent)]), 0)

    def test_codex_adapter_does_not_fallback_without_credentials(self):
        with patch.dict(os.environ, {}, clear=True), patch('adapters.codex_worker.subprocess.run') as command:
            self.assertEqual(codex_main(), 2)
            command.assert_not_called()

    def test_codex_adapter_invokes_real_cli_contract(self):
        task = self.root / 'task.json'
        atomic_json(task, {'worker_kind': 'codex-exec', 'editable_files': ['app.txt'], 'accepted_context': {'private_history':'never-send'}, 'previous_lessons':['never-send']})
        env = {'CODEX_API_KEY': 'test-only', 'RSEI_TASK': str(task), 'RSEI_WORKSPACE': str(self.source)}
        with patch.dict(os.environ, env, clear=True), patch('adapters.codex_worker.shutil.which', return_value='/bin/codex'), patch('adapters.codex_worker.subprocess.run') as command:
            command.return_value.returncode = 7
            self.assertEqual(codex_main(), 7)
            argv = command.call_args.args[0]
            self.assertIn('--sandbox', argv)
            self.assertIn('workspace-write', argv)
            self.assertIn('--ignore-user-config', argv)
            self.assertNotIn('--dangerously-bypass-approvals-and-sandbox', argv)
            self.assertEqual(command.call_args.kwargs['cwd'], str(self.source))
            self.assertNotIn('never-send', command.call_args.kwargs['input'])

    def test_user_local_auth_cannot_be_borrowed_for_other_companies(self):
        task = self.root / 'task.json'
        atomic_json(task, {'worker_kind':'codex-exec','company_id':'utern'})
        env={'CODEX_AUTH_MODE':'user-local','CODEX_AUTH_HOME':str(self.root),'RSEI_TASK':str(task)}
        with patch.dict(os.environ,env,clear=True), patch('adapters.codex_worker.shutil.which',return_value='/bin/codex'), patch('adapters.codex_worker.subprocess.run') as command:
            self.assertEqual(codex_main(),2)
            command.assert_not_called()

    def claude_env(self, **extra):
        task = self.root / 'task.json'
        atomic_json(task, {'worker_kind': 'claude-messages', 'company_id': 'alpha', 'goal': 'Fix test fixture',
            'editable_files': ['app.txt'], 'finding': {'fingerprint': 'known-defect', 'actual': 'broken'},
            'accepted_context': {'private_history': 'never-send'}, 'previous_lessons': ['never-send']})
        evidence = self.root / 'evidence'
        evidence.mkdir(exist_ok=True)
        return {'ANTHROPIC_API_KEY': 'test-only-key', 'RSEI_TASK': str(task), 'RSEI_WORKSPACE': str(self.source),
                'RSEI_EVIDENCE': str(evidence), **extra}

    def test_claude_adapter_does_not_call_network_without_key(self):
        fake = FakeUrlopen([claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'fixed'}]})])
        env = self.claude_env(); del env['ANTHROPIC_API_KEY']
        with patch.dict(os.environ, env, clear=True), patch('adapters.claude_worker.urllib.request.urlopen', fake):
            self.assertEqual(claude_worker.main(), 2)
        self.assertEqual(fake.requests, [])
        self.assertEqual((self.source / 'app.txt').read_text(), 'broken')

    def test_claude_adapter_sends_bounded_payload_and_applies_validated_patch(self):
        fake = FakeUrlopen([claude_reply({'status': 'patched', 'reason': 'off by one', 'files': [{'path': 'app.txt', 'content': 'fixed'}]})])
        with patch.dict(os.environ, self.claude_env(), clear=True), patch('adapters.claude_worker.urllib.request.urlopen', fake), \
                redirect_stdout(io.StringIO()) as out:
            self.assertEqual(claude_worker.main(), 0)
        request, = fake.requests
        self.assertEqual(request.full_url, 'https://api.anthropic.com/v1/messages')
        self.assertEqual(request.get_header('X-api-key'), 'test-only-key')
        self.assertEqual(request.get_header('Anthropic-version'), '2023-06-01')
        body = json.loads(request.data)
        self.assertEqual(body['model'], 'claude-opus-5')
        self.assertEqual(body['output_config']['format']['type'], 'json_schema')
        self.assertNotIn('tools', body)
        self.assertNotIn('never-send', request.data.decode())
        self.assertIn('known-defect', request.data.decode())
        self.assertIn('broken', json.loads(body['messages'][0]['content'])['files']['app.txt'])
        self.assertEqual((self.source / 'app.txt').read_text(), 'fixed')
        summary = json.loads(out.getvalue())
        self.assertEqual(summary['usage'], {'input_tokens': 321, 'output_tokens': 45})
        self.assertEqual(summary['changed'], ['app.txt'])
        attempts = json.loads((self.root / 'evidence/model-attempts.json').read_text())
        self.assertEqual([a['model'] for a in attempts['attempts']], ['claude-opus-5'])
        self.assertNotIn('test-only-key', (self.root / 'evidence/model-attempts.json').read_text())

    def test_claude_adapter_falls_back_to_sonnet_exactly_once_for_availability_only(self):
        good = claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'fixed'}]}, model='claude-sonnet-5')
        fake = FakeUrlopen([529, good])
        with patch.dict(os.environ, self.claude_env(), clear=True), patch('adapters.claude_worker.urllib.request.urlopen', fake), redirect_stdout(io.StringIO()):
            self.assertEqual(claude_worker.main(), 0)
        self.assertEqual([json.loads(r.data)['model'] for r in fake.requests], ['claude-opus-5', 'claude-sonnet-5'])
        self.assertEqual((self.source / 'app.txt').read_text(), 'fixed')
        (self.source / 'app.txt').write_text('broken')
        for status in (401, 402, 403, 400):
            fake = FakeUrlopen([status, good])
            with patch.dict(os.environ, self.claude_env(), clear=True), patch('adapters.claude_worker.urllib.request.urlopen', fake):
                self.assertEqual(claude_worker.main(), 2)
            self.assertEqual(len(fake.requests), 1, status)
        fake = FakeUrlopen([529, 529, good])
        with patch.dict(os.environ, self.claude_env(), clear=True), patch('adapters.claude_worker.urllib.request.urlopen', fake):
            self.assertEqual(claude_worker.main(), 2)
        self.assertEqual(len(fake.requests), 2)
        self.assertEqual((self.source / 'app.txt').read_text(), 'broken')

    def test_claude_adapter_never_writes_blockers_refusals_or_files_outside_allowlist(self):
        cases = [
            claude_reply({'status': 'blocked', 'reason': 'scope too small', 'files': []}),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': []}),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'other.txt', 'content': 'bad'}]}),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': '../app.txt', 'content': 'bad'}]}),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'a'}, {'path': 'app.txt', 'content': 'b'}]}),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'x' * 70000}]}),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'fixed'}]}, stop_reason='refusal'),
            claude_reply({'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'fixed'}]}, stop_reason='max_tokens'),
            {**claude_reply({}), 'content': [{'type': 'text', 'text': 'not json'}]},
        ]
        for reply in cases:
            fake = FakeUrlopen([reply])
            with patch.dict(os.environ, self.claude_env(), clear=True), patch('adapters.claude_worker.urllib.request.urlopen', fake):
                self.assertEqual(claude_worker.main(), 3)
            self.assertEqual((self.source / 'app.txt').read_text(), 'broken')
            self.assertFalse((self.source / 'other.txt').exists())
        with patch.dict(os.environ, self.claude_env(ANTHROPIC_BASE_URL='https://example.com'), clear=True), \
                patch('adapters.claude_worker.urllib.request.urlopen', FakeUrlopen([])) as fake:
            self.assertEqual(claude_worker.main(), 2)
        self.assertEqual(fake.requests, [])

    def test_claude_worker_runs_inside_runner_boundary_with_loopback_double(self):
        server = LoopbackMessagesServer('cycle-test-key', {'status': 'patched', 'reason': 'x', 'files': [{'path': 'app.txt', 'content': 'fixed'}]})
        self.addCleanup(server.close)
        self.config.update(worker_kind='claude-messages', secret_env=['ANTHROPIC_API_KEY'],
            environment={'ANTHROPIC_BASE_URL': server.url})
        self.config['commands']['worker'] = [sys.executable, str(Path(claude_worker.__file__).resolve())]
        with self.assertRaises(BoundaryError):  # the key must come from the runner's environment, never a file
            with patch.dict(os.environ, {}, clear=True):
                Cycle(self.config, self.company).command('worker', 'implement')
        with patch.dict(os.environ, {'ANTHROPIC_API_KEY': 'cycle-test-key'}):
            c, result = self.cycle(release=False)
        self.assertEqual(result['status'], 'awaiting_release')
        self.assertEqual(result['reported_model_usage'], [{'model': 'claude-opus-5', 'input_tokens': 321, 'output_tokens': 45}])
        self.assertEqual((c.path / 'candidate/app.txt').read_text(), 'fixed')
        self.assertEqual((self.source / 'app.txt').read_text(), 'broken')
        request, = server.requests
        self.assertEqual((request['path'], request['key'], request['version'], request['body']['model']),
                         ('/v1/messages', 'cycle-test-key', '2023-06-01', 'claude-opus-5'))
        self.assertNotIn('previous_lessons', json.dumps(request['body']))
        self.assertNotIn('cycle-test-key', (c.path / 'evidence/implement/stdout.txt').read_text())
        self.assertNotIn('cycle-test-key', (c.path / 'evidence/implement/model-attempts.json').read_text())
        self.assertNotIn('cycle-test-key', (c.path / 'changes.patch').read_text())

    def test_required_context_blocks_before_any_probe(self):
        self.config['context_records'] = []
        _, result = self.cycle()
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['commands_used'], 0)
        self.assertIn('Context needs reconciliation', result['error'])
        self.assertFalse((self.company / 'current.json').exists())

    def test_config_rejects_traversal_disabled_and_unknown_permissions(self):
        file = self.root / 'config.json'
        for change in [{'source_files': ['../secret']}, {'enabled': False},
                       {'permissions': {'production': True}}, {'company_id': '../beta'},
                       {'environment': {'HOME': '/Users/somebody'}}]:
            atomic_json(file, {**self.config, **change})
            with self.assertRaises(BoundaryError):
                load_config(file)


if __name__ == '__main__':
    unittest.main()
