import json
from pathlib import Path
import tempfile
import unittest

from rsei import site_builder


PILOT = Path(__file__).resolve().parents[1] / "pilot" / "leed-landing"


class SiteBuilderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.config_path = self.root / "site.json"
        self.asset = self.root / "assets" / "sample.png"
        self.asset.parent.mkdir()
        self.asset.write_bytes(b"\x89PNG\r\n\x1a\nsynthetic")
        self.config = json.loads((PILOT / "site.json").read_text())
        self.config["screenshot"]["path"] = "assets/sample.png"
        self.config_path.write_text(json.dumps(self.config))

    def tearDown(self):
        self.temp.cleanup()

    def test_complete_run_has_durable_artifacts_and_truthful_unavailable_paths(self):
        run_dir = site_builder.run(self.config_path, self.root / "runs", "leed-review")
        state = json.loads((run_dir / "status.json").read_text())
        report = json.loads((run_dir / "report.json").read_text())
        self.assertEqual(state["status"], "complete")
        self.assertEqual(state["completed_steps"], ["validate", "render", "verify"])
        self.assertTrue((run_dir / "events.jsonl").is_file())
        self.assertTrue((run_dir / "RESULT.md").is_file())
        self.assertTrue((run_dir / "site" / "index.html").is_file())
        self.assertEqual(report["generation_mode"], "deterministic_template")
        self.assertEqual(report["model_generation"], "not_configured_not_invoked")
        self.assertEqual(report["integrations"]["AI_triage"], "unavailable_no_model_configured")
        self.assertEqual(report["integrations"]["inquiry"], "mailto_link_only_no_message_sent")
        self.assertEqual(report["release"], "disabled")
        self.assertEqual(report["verification"]["scripts"], 0)
        self.assertEqual(report["verification"]["external_network_resources"], 0)
        html = (run_dir / "site" / "index.html").read_text()
        self.assertIn("mailto:hello@leed.media?subject=Leed%20pilot%20for%20our%20media%20company", html)
        self.assertIn("synthetic examples", html)

    def test_generic_config_drives_another_company_without_enabling_an_adopter(self):
        self.config["company_id"] = "another-newsroom"
        self.config["site"]["name"] = "Deskline"
        self.config["site"]["title"] = "Deskline editorial intake"
        self.config["hero"]["headline"] = "A calmer editorial inbox."
        self.config_path.write_text(json.dumps(self.config))
        run_dir = site_builder.run(self.config_path, self.root / "runs", "generic-smoke")
        report = json.loads((run_dir / "report.json").read_text())
        html = (run_dir / "site" / "index.html").read_text()
        self.assertEqual(report["company_id"], "another-newsroom")
        self.assertIn("Deskline", html)
        self.assertIn("A calmer editorial inbox.", html)

    def test_intentional_failure_is_saved_and_recoverable_with_identical_output(self):
        failed = site_builder.run(self.config_path, self.root / "runs", "leed-recovery",
                                  inject_failure_once="verify")
        state = json.loads((failed / "status.json").read_text())
        self.assertEqual(state["status"], "failed")
        self.assertEqual(state["attempts"], {"validate": 1, "render": 1, "verify": 1})
        self.assertEqual(state["failure"]["type"], "InjectedFailure")
        self.assertTrue((failed / "report.json").is_file())
        recovered = site_builder.recover(failed)
        recovered_state = json.loads((recovered / "status.json").read_text())
        report = json.loads((recovered / "report.json").read_text())
        self.assertEqual(recovered_state["status"], "complete")
        self.assertEqual(recovered_state["attempts"]["verify"], 2)
        self.assertEqual(report["status"], "complete")

        good = site_builder.run(self.config_path, self.root / "runs", "leed-reproducible")
        one = (failed / "site" / "index.html").read_bytes()
        two = (good / "site" / "index.html").read_bytes()
        self.assertEqual(one, two)
        self.assertEqual(site_builder._hash(one), report["verification"]["sha256"])

    def test_recovery_rejects_changed_frozen_input_and_run_id_overwrite(self):
        failed = site_builder.run(self.config_path, self.root / "runs", "leed-frozen",
                                  inject_failure_once="verify")
        asset_copy = failed / "assets" / Path(self.config["screenshot"]["path"]).name
        asset_copy.write_bytes(b"changed")
        with self.assertRaises(site_builder.BuildError):
            site_builder.recover(failed)
        self.assertEqual(json.loads((failed / "status.json").read_text())["status"], "failed")
        with self.assertRaises(site_builder.BuildError):
            site_builder.run(self.config_path, self.root / "runs", "leed-frozen")

    def test_config_rejects_remote_screenshot_and_low_contrast(self):
        self.config["screenshot"]["path"] = "https://example.com/image.png"
        self.config_path.write_text(json.dumps(self.config))
        with self.assertRaises(site_builder.BuildError):
            site_builder._validate_config(self.config, self.config_path)
        self.config["screenshot"]["path"] = "assets/sample.png"
        self.config["site"]["palette"]["ink"] = "#aaaaaa"
        with self.assertRaises(site_builder.BuildError):
            site_builder._validate_config(self.config, self.config_path)


if __name__ == "__main__":
    unittest.main()
