"""Orchestration fault tests use explicit test doubles; demo uses real Chromium."""
import json
import io
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from contextlib import redirect_stdout

from rsei.runner import BoundaryError, Cycle, atomic_json, company_lock, load_config, recover, main
from adapters.codex_worker import main as codex_main


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
        atomic_json(task, {'worker_kind': 'codex-exec', 'editable_files': ['app.txt']})
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
