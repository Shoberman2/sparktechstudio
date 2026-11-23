import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from rsei.preflight import inspect_config


class PreflightTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.source = self.root / "source"
        self.source.mkdir()
        (self.source / "index.html").write_text("fixture")
        self.config_path = self.root / "company.json"
        self.config = {
            "schema_version": 1,
            "company_id": "alpha",
            "display_name": "Alpha fixture",
            "relationship": "internal-fixture",
            "enabled": True,
            "goal": "Check the supplied fixture.",
            "source": "source",
            "source_files": ["index.html"],
            "editable_files": ["index.html"],
            "permissions": {"browser": True, "implement": True, "local_release": False},
            "budgets": {"max_commands": 6, "max_seconds": 60, "command_seconds": 10, "max_output_bytes": 1024},
            "worker_kind": "deterministic-fixture-repair",
            "commands": {stage: ["fixture", stage] for stage in ("probe", "worker", "test")},
            "environment": {},
            "secret_env": [],
        }
        self.write_config()

    def tearDown(self):
        self.tmp.cleanup()

    def write_config(self):
        self.config_path.write_text(json.dumps(self.config))

    def test_local_fixture_config_is_ready_without_running_commands(self):
        before = sorted(path.name for path in self.root.iterdir())
        with patch("rsei.runner.subprocess.run") as run_command:
            report = inspect_config(self.config_path)
            run_command.assert_not_called()
        self.assertTrue(report["ready_to_attempt_local_cycle"])
        self.assertEqual(report["source_files"], [{"path": "index.html", "status": "available"}])
        self.assertIn("Configured browser, worker, and test commands are not executed.", report["limitations"])
        self.assertEqual(sorted(path.name for path in self.root.iterdir()), before)

    def test_missing_provider_credential_blocks_and_reports_only_environment_name(self):
        self.config["worker_kind"] = "claude-messages"
        self.config["secret_env"] = ["ANTHROPIC_API_KEY"]
        self.write_config()
        with patch.dict(os.environ, {}, clear=True):
            report = inspect_config(self.config_path)
        self.assertFalse(report["ready_to_attempt_local_cycle"])
        self.assertEqual(report["missing_env_names"], ["ANTHROPIC_API_KEY"])

    def test_secret_value_is_not_disclosed_even_when_present(self):
        self.config["worker_kind"] = "claude-messages"
        self.config["secret_env"] = ["ANTHROPIC_API_KEY"]
        self.write_config()
        secret = "sentinel-secret-value"
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": secret}, clear=True):
            report = inspect_config(self.config_path)
        self.assertTrue(report["ready_to_attempt_local_cycle"])
        self.assertNotIn(secret, json.dumps(report))

    def test_inline_sensitive_config_value_blocks_without_disclosing_value(self):
        secret = "sentinel-config-secret"
        self.config["environment"] = {"SERVICE_API_KEY": secret}
        self.write_config()
        report = inspect_config(self.config_path)
        self.assertFalse(report["ready_to_attempt_local_cycle"])
        self.assertEqual(report["inline_sensitive_env_names"], ["SERVICE_API_KEY"])
        self.assertNotIn(secret, json.dumps(report))

    def test_sensitive_name_heuristic_avoids_public_and_unrelated_keys(self):
        self.config["environment"] = {
            "NEXT_PUBLIC_SUPABASE_ANON_KEY": "public-value",
            "PUBLIC_KEY": "public-key-value",
            "FEATURE_KEY": "feature-name",
            "SERVICE_API_KEY": "secret-value",
            "AUTH_TOKEN": "token-value",
        }
        self.write_config()
        report = inspect_config(self.config_path)
        self.assertEqual(report["inline_sensitive_env_names"], ["AUTH_TOKEN", "SERVICE_API_KEY"])

    def test_invalid_config_does_not_echo_paths_or_environment_values(self):
        self.config["source_files"] = ["../private-project/customer-data.json"]
        self.config["secret_env"] = ["sk_live_example_secret_value"]
        self.write_config()
        output = json.dumps(inspect_config(self.config_path))
        self.assertNotIn("private-project", output)
        self.assertNotIn("sk_live_example_secret_value", output)

    def test_missing_config_does_not_echo_supplied_path(self):
        missing_path = self.root / "private-customer-config.json"
        output = json.dumps(inspect_config(missing_path))
        self.assertNotIn(str(missing_path), output)

    def test_symlink_source_is_blocked_without_exposing_target_path_or_contents(self):
        secret_path = self.root / "private-customer-source.txt"
        secret_path.write_text("must not be read")
        (self.source / "linked.html").symlink_to(secret_path)
        self.config["source_files"] = ["linked.html"]
        self.config["editable_files"] = ["linked.html"]
        self.write_config()
        output = json.dumps(inspect_config(self.config_path))
        self.assertNotIn(str(secret_path), output)
        self.assertNotIn("must not be read", output)
        self.assertIn("unsafe_symlink", output)

    def test_disabled_example_stays_blocked_even_with_credential_present(self):
        self.config["enabled"] = False
        self.config["secret_env"] = ["ANTHROPIC_API_KEY"]
        self.write_config()
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "sentinel"}, clear=True):
            report = inspect_config(self.config_path)
        self.assertFalse(report["ready_to_attempt_local_cycle"])
        self.assertIn("company execution is disabled", report["blockers"])

    def test_missing_source_and_browser_permission_are_reported(self):
        (self.source / "index.html").unlink()
        self.config["permissions"]["browser"] = False
        self.write_config()
        report = inspect_config(self.config_path)
        self.assertEqual(report["source_files"][0]["status"], "missing_or_unreadable")
        self.assertIn("browser execution is not permitted", report["blockers"])


if __name__ == "__main__":
    unittest.main()
