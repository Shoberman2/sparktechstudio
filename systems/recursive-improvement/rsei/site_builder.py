"""Bounded, offline landing-page builder with durable runs and explicit checks.

This is deterministic template rendering, not AI generation. It has no network,
shell, model, deploy, billing, email-send, or authentication capability.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
import time
import uuid
from urllib.parse import urlsplit

SYSTEM = Path(__file__).resolve().parents[1]
DEFAULT_RUN_ROOT = SYSTEM / "pilot" / "leed-landing" / "runs"
MAX_STAGE_ATTEMPTS = 2
MAX_IMAGE_BYTES = 2_000_000
MAX_HTML_BYTES = 500_000
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,62}$")
HEX_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
REQUIRED = {"schema_version", "company_id", "site", "hero", "workflow", "features", "screenshot", "policy"}


class BuildError(RuntimeError):
    pass


class InjectedFailure(BuildError):
    pass


def _utc():
    return datetime.now(timezone.utc).isoformat()


def _hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _canonical(data) -> bytes:
    return (json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def _atomic_bytes(path: Path, data: bytes, mode=0o600):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    tmp = path.with_name(path.name + ".tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, mode)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp, path)
        path.chmod(mode)
    except Exception:
        try: tmp.unlink()
        except OSError: pass
        raise


def _atomic_json(path: Path, data):
    _atomic_bytes(path, _canonical(data))


def _contrast(a: str, b: str) -> float:
    def luminance(color):
        channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        channels = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in channels]
        return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]
    x, y = sorted((luminance(a), luminance(b)), reverse=True)
    return (x + .05) / (y + .05)


def _string(value, label, limit=500):
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise BuildError(f"{label} must be a non-empty string of at most {limit} characters")
    return value.strip()


def _validate_config(config: dict, config_path: Path):
    if not isinstance(config, dict) or set(config) != REQUIRED:
        raise BuildError("Config keys do not match the supported site schema")
    if config["schema_version"] != 1 or not isinstance(config["company_id"], str) or not SLUG_RE.fullmatch(config["company_id"]):
        raise BuildError("Invalid config schema or company ID")
    site = config["site"]
    hero = config["hero"]
    policy = config["policy"]
    if not all(isinstance(v, dict) for v in (site, hero, policy)):
        raise BuildError("site, hero, and policy must be objects")
    for key in ("name", "descriptor", "title", "description", "footer"):
        _string(site.get(key), f"site.{key}")
    for key in ("eyebrow", "headline", "body", "primary_label", "secondary_label", "secondary_href"):
        _string(hero.get(key), f"hero.{key}")
    for key in ("paper", "ink", "muted", "accent", "line"):
        if not isinstance(site.get("palette", {}).get(key), str) or not HEX_RE.fullmatch(site["palette"][key]):
            raise BuildError(f"site.palette.{key} must be a six-digit hex color")
    if _contrast(site["palette"]["ink"], site["palette"]["paper"]) < 7:
        raise BuildError("The configured text/background contrast must be at least 7:1")
    if _contrast(site["palette"]["accent"], site["palette"]["paper"]) < 4.5:
        raise BuildError("The configured accent/background contrast must be at least 4.5:1")
    inquiry = hero.get("inquiry")
    if not isinstance(inquiry, dict):
        raise BuildError("hero.inquiry must provide an external inquiry link")
    _string(inquiry.get("label"), "hero.inquiry.label", 80)
    href = _string(inquiry.get("href"), "hero.inquiry.href", 300)
    parsed = urlsplit(href)
    if parsed.scheme != "mailto" or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", parsed.path):
        raise BuildError("Inquiry link must be a mailto address; form transports are not configured")
    if not isinstance(config["workflow"], list) or len(config["workflow"]) != 3:
        raise BuildError("workflow must contain exactly three concise steps")
    for index, step in enumerate(config["workflow"]):
        if not isinstance(step, dict): raise BuildError(f"workflow[{index}] must be an object")
        for key in ("title", "body"): _string(step.get(key), f"workflow[{index}].{key}")
    if not isinstance(config["features"], list) or len(config["features"]) != 3:
        raise BuildError("features must contain exactly three concise items")
    for index, feature in enumerate(config["features"]):
        if not isinstance(feature, dict): raise BuildError(f"features[{index}] must be an object")
        for key in ("title", "body"): _string(feature.get(key), f"features[{index}].{key}")
    if policy != {"network": False, "model": False, "publish": False, "send": False, "billing": False, "max_stage_attempts": MAX_STAGE_ATTEMPTS}:
        raise BuildError("This prototype only supports offline generation, no external actions, and two attempts per stage")
    screenshot = config["screenshot"]
    if not isinstance(screenshot, dict): raise BuildError("screenshot must be an object")
    for key in ("path", "alt", "caption"): _string(screenshot.get(key), f"screenshot.{key}")
    relative = Path(screenshot["path"])
    if relative.is_absolute() or ".." in relative.parts:
        raise BuildError("Screenshot must be a local asset beneath the config directory")
    unresolved_source = config_path.parent / relative
    if unresolved_source.is_symlink():
        raise BuildError("Screenshot assets may not be symlinks")
    source = unresolved_source.resolve()
    if config_path.parent.resolve() not in source.parents or not source.is_file():
        raise BuildError("Screenshot asset is missing, symlinked, or outside the pilot config directory")
    if source.stat().st_size > MAX_IMAGE_BYTES or source.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        raise BuildError("Only local PNG or JPEG screenshots up to 2 MB are supported")
    raw = source.read_bytes()
    valid_png = raw.startswith(b"\x89PNG\r\n\x1a\n")
    valid_jpeg = raw.startswith(b"\xff\xd8\xff")
    if not (valid_png if source.suffix.lower() == ".png" else valid_jpeg):
        raise BuildError("Screenshot extension and file signature do not match")
    return source, raw


def _mark(name):
    return ("<svg class=\"mark\" viewBox=\"0 0 100 100\" fill=\"none\" role=\"img\" aria-label=\"" + escape(name, quote=True) +
            "\"><rect x=\"22\" y=\"56\" width=\"56\" height=\"28\" rx=\"7\" stroke=\"currentColor\" stroke-width=\"3.4\"/><line x1=\"42\" y1=\"70\" x2=\"58\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><rect x=\"22\" y=\"20\" width=\"56\" height=\"64\" rx=\"7\" stroke=\"currentColor\" stroke-width=\"3.4\"/><path d=\"M30 34v-9a3 3 0 0 1 3-3h12l4 5h6a3 3 0 0 1 3 3v4z\" fill=\"var(--accent)\"/><rect x=\"16\" y=\"34\" width=\"58\" height=\"22\" rx=\"6\" fill=\"var(--paper)\" stroke=\"currentColor\" stroke-width=\"3.4\"/><line x1=\"36\" y1=\"45\" x2=\"54\" y2=\"45\" stroke=\"currentColor\" stroke-width=\"3.4\" stroke-linecap=\"round\"/></svg>")


def _render(config):
    site, hero, pal = config["site"], config["hero"], config["site"]["palette"]
    workflow = "".join(f'<li><span class="step-no">0{i + 1}</span><div><h3>{escape(s["title"])}</h3><p>{escape(s["body"])}</p></div></li>' for i, s in enumerate(config["workflow"]))
    features = "".join(f'<article><span class="feature-rule" aria-hidden="true"></span><h3>{escape(f["title"])}</h3><p>{escape(f["body"])}</p></article>' for f in config["features"])
    name = escape(site["name"])
    title = escape(site["title"])
    description = escape(site["description"], quote=True)
    href = escape(hero["inquiry"]["href"], quote=True)
    secondary = escape(hero["secondary_href"], quote=True)
    if not secondary.startswith("#"):
        raise BuildError("Secondary navigation must stay within the static preview")
    colors = "".join(f"--{k}:{v};" for k, v in pal.items())
    image_name = escape(Path(config["screenshot"]["path"]).name, quote=True)
    return f'''<!doctype html>
<html lang="en" data-renderer="sparktech-site-builder-v1" data-generation="deterministic-template">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{description}"><title>{title}</title>
<style>
:root{{{colors}--surface:#fffdfa;--serif:Georgia,'Times New Roman',serif;--sans:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,monospace}}
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 var(--sans)}}a{{color:inherit}}.wrap{{width:min(1120px,calc(100% - 48px));margin:auto}}.top{{height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}}.brand{{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font:italic 600 25px/1 var(--serif)}}.mark{{width:30px;height:30px;flex:none}}.dot{{color:var(--accent)}}.nav{{display:flex;align-items:center;gap:26px}}.nav a{{font-size:14px;text-decoration:none;color:var(--muted)}}.nav a:hover{{color:var(--ink)}}.button{{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 18px;border:1px solid var(--ink);border-radius:3px;background:var(--ink);color:var(--paper);text-decoration:none;font-weight:650}}.button:hover{{background:var(--accent);border-color:var(--accent)}}.button.secondary{{background:transparent;color:var(--ink);border-color:var(--line)}}.hero{{padding:76px 0 84px;background:linear-gradient(125deg,var(--paper),var(--surface))}}.hero-grid{{display:grid;grid-template-columns:1fr 1.08fr;gap:58px;align-items:center}}.eyebrow,.kicker{{font:600 11px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}}h1,h2,h3,p{{margin-top:0}}h1{{font:400 clamp(42px,5vw,64px)/1.04 var(--serif);letter-spacing:-.035em;margin:18px 0 22px;max-width:12ch}}.lead{{font-size:18px;color:var(--muted);max-width:35em;margin-bottom:26px}}.actions{{display:flex;gap:10px;flex-wrap:wrap}}.note{{font-size:12px;color:var(--muted);margin:16px 0 0}}.visual{{padding:12px;background:var(--surface);border:1px solid var(--line);box-shadow:0 14px 38px #241b1412}}.visual img{{width:100%;height:auto;display:block}}figcaption{{font:11px/1.4 var(--mono);color:var(--muted);padding:10px 4px 2px}}.section{{padding:70px 0;border-top:1px solid var(--line)}}.section-head{{max-width:650px;margin-bottom:30px}}h2{{font:400 clamp(32px,4vw,46px)/1.12 var(--serif);letter-spacing:-.025em;margin:10px 0 12px}}.section-lead{{color:var(--muted)}}.steps{{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line)}}.steps li{{display:grid;grid-template-columns:38px 1fr;gap:10px;padding:22px 20px 12px 0;border-right:1px solid var(--line)}}.steps li+li{{padding-left:20px}}.step-no{{font:12px var(--mono);color:var(--accent)}}.steps h3,.features h3{{font:600 17px/1.3 var(--sans);margin:0 0 9px}}.steps p,.features p{{font-size:14px;color:var(--muted);margin:0}}.feature-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}}.feature-rule{{display:block;width:34px;height:2px;background:var(--accent);margin:0 0 17px}}.feature-grid article{{padding:20px 0;border-top:1px solid var(--line)}}.pilot{{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:30px;background:var(--ink);color:var(--paper)}}.pilot h2{{font-size:33px;margin:0 0 5px}}.pilot p{{color:#dfdbd4;margin:0}}.pilot .button{{background:var(--paper);border-color:var(--paper);color:var(--ink);white-space:nowrap}}.notice{{padding:16px 18px;border-left:3px solid var(--accent);background:#f3eee6;color:var(--ink);font-size:13px;margin:22px 0 0}}footer{{padding:26px 0 36px;display:flex;justify-content:space-between;gap:20px;color:var(--muted);font:12px var(--mono)}}
@media(max-width:800px){{.hero-grid{{grid-template-columns:1fr;gap:34px}}.hero{{padding:52px 0}}.nav{{display:none}}.steps,.feature-grid{{grid-template-columns:1fr}}.steps li,.steps li+li{{padding:18px 0;border-right:0;border-bottom:1px solid var(--line)}}.pilot{{align-items:flex-start;flex-direction:column}}}}
@media(prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}*{{animation-duration:.01ms!important;transition-duration:.01ms!important}}}}
</style></head>
<body><header class="wrap top"><a class="brand" href="#top">{_mark(name)}<span>{name}<span class="dot">.</span></span></a><nav class="nav" aria-label="Main navigation"><a href="#workflow">How it works</a><a href="#features">The desk</a><a href="#pilot">Pilot</a></nav><a class="button" href="{href}">{escape(hero["inquiry"]["label"])}</a></header>
<main id="top"><section class="hero"><div class="wrap hero-grid"><div><div class="eyebrow">{escape(hero["eyebrow"])}</div><h1>{escape(hero["headline"])}</h1><p class="lead">{escape(hero["body"])}</p><div class="actions"><a class="button" href="{href}">{escape(hero["primary_label"])}</a><a class="button secondary" href="{secondary}">{escape(hero["secondary_label"])}</a></div><p class="note">{escape(hero["note"])}</p></div><figure class="visual"><img src="assets/{image_name}" alt="{escape(config["screenshot"]["alt"], quote=True)}"><figcaption>{escape(config["screenshot"]["caption"])}</figcaption></figure></div></section>
<section id="workflow" class="section"><div class="wrap"><div class="section-head"><div class="kicker">A clearer path through the inbox</div><h2>From reader tip to an editor's next step.</h2><p class="section-lead">A concept for bringing source context, editorial judgement, and newsroom routing into one place.</p></div><ol class="steps">{workflow}</ol></div></section>
<section id="features" class="section"><div class="wrap"><div class="section-head"><div class="kicker">Designed for newsroom work</div><h2>Keep the source context attached.</h2><p class="section-lead">The LEED design handoff describes the following product direction. No production connection is active in this preview.</p></div><div class="feature-grid">{features}</div><p class="notice"><strong>Local concept preview.</strong> The pictured newsroom records are synthetic examples from a design mock. This page does not connect tip intake, newsroom accounts, reporter directories, AI triage, or source contact requests.</p></div></section>
<section id="pilot" class="section"><div class="wrap pilot"><div><h2>Explore a LEED pilot.</h2><p>Opens the existing email inquiry link in your mail app. This preview does not send a message.</p></div><a class="button" href="{href}">{escape(hero["inquiry"]["label"])}</a></div></section></main>
<footer class="wrap"><span>{name} · {escape(site["descriptor"])}</span><span>{escape(site["footer"])}</span></footer></body></html>'''


class _Doc(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.tags = []; self.links = []; self.images = []; self.ids = set(); self.h1 = 0; self.text = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs); self.tags.append(tag)
        if tag == "a": self.links.append(a.get("href", ""))
        if tag == "img": self.images.append(a)
        if a.get("id"): self.ids.add(a["id"])
        if tag == "h1": self.h1 += 1
    def handle_data(self, value): self.text.append(value)


def _verify_html(raw: bytes, config):
    if len(raw) > MAX_HTML_BYTES: raise BuildError("Rendered page exceeds the 500 KB budget")
    try: source = raw.decode("utf-8")
    except UnicodeError as exc: raise BuildError("Rendered page is not valid UTF-8") from exc
    doc = _Doc(); doc.feed(source); doc.close()
    errors = []
    if doc.h1 != 1: errors.append("expected exactly one H1")
    if "main" not in doc.tags or "nav" not in doc.tags: errors.append("main content or navigation is missing")
    if "script" in doc.tags: errors.append("scripts are not allowed in this offline preview")
    if len(doc.images) != 1 or not doc.images[0].get("alt"): errors.append("screenshot requires descriptive alt text")
    expected_image = "assets/" + Path(config["screenshot"]["path"]).name
    if expected_image not in [i.get("src") for i in doc.images]: errors.append("concept screenshot is not referenced locally")
    if config["hero"]["inquiry"]["href"] not in doc.links: errors.append("inquiry link is missing")
    for link in doc.links:
        if link.startswith("#") and link[1:] not in doc.ids: errors.append(f"broken local section link: {link}")
        elif not link.startswith(("#", "mailto:")): errors.append(f"external navigation is not allowed: {link}")
    visible = " ".join(doc.text)
    if config["site"]["name"] not in visible: errors.append("brand name is missing")
    if "Local concept preview" not in visible: errors.append("prototype disclosure is missing")
    if "does not send a message" not in visible: errors.append("inquiry non-send notice is missing")
    if errors: raise BuildError("; ".join(errors))
    return {"html_bytes": len(raw), "sha256": _hash(raw), "h1_count": doc.h1,
            "local_anchor_count": sum(link.startswith("#") for link in doc.links),
            "mailto_link_count": sum(link.startswith("mailto:") for link in doc.links),
            "image_alt_present": True, "scripts": 0, "external_network_resources": 0,
            "prototype_disclosure": True, "inquiry_transport": "mailto-only; no send performed"}


class BuildRun:
    def __init__(self, run_dir: Path, config: dict, screenshot: bytes, config_digest: str, injected=None):
        self.path = run_dir
        self.config = config
        self.screenshot = screenshot
        self.injected = injected
        self.state = {"schema_version": 1, "company_id": config["company_id"], "status": "created",
                      "run_id": run_dir.name, "created_at": _utc(), "updated_at": _utc(),
                      "generation_mode": "deterministic_template", "model_generation": "not_configured_not_invoked",
                      "policy": config["policy"], "input_sha256": config_digest,
                      "attempts": {}, "completed_steps": [], "current_step": None,
                      "failure": None, "injected_failure_consumed": False, "release": "disabled"}
        _atomic_json(self.path / "status.json", self.state)
        _atomic_json(self.path / "config.json", config)
        _atomic_bytes(self.path / "assets" / Path(config["screenshot"]["path"]).name, screenshot)
        self._event("created")

    @classmethod
    def resume(cls, path: Path):
        state = json.loads((path / "status.json").read_text())
        if state.get("status") != "failed" or not state.get("current_step"):
            raise BuildError("Only a durable failed run can be recovered")
        if state.get("attempts", {}).get(state["current_step"], 0) >= MAX_STAGE_ATTEMPTS:
            raise BuildError("Stage retry limit reached; human review is required")
        config = json.loads((path / "config.json").read_text())
        screenshot_path = path / "assets" / Path(config["screenshot"]["path"]).name
        if not screenshot_path.is_file() or screenshot_path.is_symlink(): raise BuildError("Frozen run asset is missing or unsafe")
        screenshot = screenshot_path.read_bytes()
        calculated = _hash(_canonical(config) + screenshot)
        if calculated != state.get("input_sha256"): raise BuildError("Frozen run inputs changed; recovery is blocked")
        obj = cls.__new__(cls); obj.path=path; obj.config=config; obj.screenshot=screenshot; obj.injected=None; obj.state=state
        return obj

    def _persist(self):
        self.state["updated_at"] = _utc(); _atomic_json(self.path / "status.json", self.state)

    def _event(self, name, **fields):
        item = {"at": _utc(), "event": name, **fields}
        with (self.path / "events.jsonl").open("ab") as stream:
            stream.write(_canonical(item)); stream.flush(); os.fsync(stream.fileno())

    def _stage(self, name, operation):
        attempts = self.state["attempts"].get(name, 0)
        if attempts >= MAX_STAGE_ATTEMPTS: raise BuildError(f"Retry limit reached for {name}; human review is required")
        attempts += 1; self.state["attempts"][name] = attempts; self.state["current_step"] = name
        self.state["status"] = "running"; self.state["failure"] = None; self._persist(); self._event("step_started", step=name, attempt=attempts)
        try:
            if self.injected == name and not self.state["injected_failure_consumed"]:
                self.state["injected_failure_consumed"] = True; self._persist()
                raise InjectedFailure("intentional test fault after step entry; no external action ran")
            result = operation()
            self.state["completed_steps"].append(name); self.state["failure"] = None
            self._event("step_completed", step=name, attempt=attempts, result=result)
            return result
        except Exception as exc:
            self.state["status"] = "failed"; self.state["failure"] = {"step": name, "type": type(exc).__name__, "message": str(exc), "attempt": attempts}
            self._persist(); self._event("step_failed", **self.state["failure"])
            self._write_report("failed")
            return None

    def _validate(self):
        suffix = Path(self.config["screenshot"]["path"]).suffix.lower()
        valid = self.screenshot.startswith(b"\x89PNG\r\n\x1a\n") if suffix == ".png" else self.screenshot.startswith(b"\xff\xd8\xff")
        if len(self.screenshot) > MAX_IMAGE_BYTES or not valid:
            raise BuildError("Frozen screenshot is invalid or exceeds the input budget")
        return {"config_schema": 1, "input_sha256": self.state["input_sha256"], "image_bytes": len(self.screenshot), "network_used": False}

    def _render(self):
        html = _render(self.config).encode("utf-8")
        _atomic_bytes(self.path / "site" / "index.html", html, 0o644)
        _atomic_bytes(self.path / "site" / "assets" / Path(self.config["screenshot"]["path"]).name, self.screenshot, 0o644)
        return {"html_sha256": _hash(html), "asset_sha256": _hash(self.screenshot), "html_bytes": len(html)}

    def _verify(self):
        html_path = self.path / "site" / "index.html"
        asset_path = self.path / "site" / "assets" / Path(self.config["screenshot"]["path"]).name
        if not html_path.is_file() or not asset_path.is_file(): raise BuildError("Rendered output is incomplete")
        if _hash(asset_path.read_bytes()) != _hash(self.screenshot): raise BuildError("Copied image does not match the frozen input")
        return _verify_html(html_path.read_bytes(), self.config)

    def _write_report(self, status, verification=None):
        report = {"company_id": self.config["company_id"], "run_id": self.path.name, "status": status,
                  "generation_mode": "deterministic_template", "model_generation": "not_configured_not_invoked",
                  "attempts": self.state["attempts"], "completed_steps": self.state["completed_steps"],
                  "failure": self.state["failure"], "verification": verification,
                  "artifacts": {"html": "site/index.html", "screenshot": "site/assets/" + Path(self.config["screenshot"]["path"]).name, "state": "status.json", "events": "events.jsonl"},
                  "integrations": {"tip_intake": "unavailable_not_connected", "AI_triage": "unavailable_no_model_configured", "reporter_directory": "unavailable_not_connected", "source_contact_requests": "unavailable_not_connected", "inquiry": "mailto_link_only_no_message_sent", "sign_in": "unavailable_no_app_checkout"},
                  "concept_evidence": {"related_tip_clustering": "not evidenced in available LEED design handoff; excluded from copy", "beat_and_geography_routing": "described in local LEED design handoff; not tested against an application", "source_contact_preferences": "described in local LEED design handoff; no workflow connected"},
                  "limits": ["Local design prototype only; no LEED production data, service, account, or newsroom system was accessed.", "No external network, model, billing, mail send, signup, publish, or deploy was used.", "The inquiry CTA is the handoff's mailto link; this run only verifies the link and does not open a mail client or send a request."],
                  "release": "disabled"}
        _atomic_json(self.path / "report.json", report)
        md = [f"# LEED local landing build: {status}", "", f"- Run: `{self.path.name}`", "- Generator: deterministic SparkTech template v1, no model call", f"- Completed: {', '.join(self.state['completed_steps']) or 'none'}", f"- Attempts: `{json.dumps(self.state['attempts'], sort_keys=True)}`", f"- Preview: `site/index.html`", "- External actions: none", "- Product integrations: unavailable or not connected (see report.json)"]
        if self.state["failure"]: md.extend(["", f"- Failure: **{self.state['failure']['type']}** during `{self.state['failure']['step']}`: {self.state['failure']['message']}"])
        if verification: md.extend(["", f"- HTML SHA-256: `{verification['sha256']}`", f"- HTML size: {verification['html_bytes']} bytes", f"- Mail inquiry links checked: {verification['mailto_link_count']}"])
        _atomic_bytes(self.path / "RESULT.md", ("\n".join(md) + "\n").encode())

    def execute(self, start_at=None):
        stages = [("validate", self._validate), ("render", self._render), ("verify", self._verify)]
        if start_at:
            stages = stages[next((i for i, item in enumerate(stages) if item[0] == start_at), len(stages)):]
        verification = None
        for name, operation in stages:
            result = self._stage(name, operation)
            if result is None and self.state["status"] == "failed": return self.state
            if name == "verify": verification = result
        self.state["status"] = "complete"; self.state["current_step"] = None; self._persist(); self._event("run_completed")
        self._write_report("complete", verification)
        return self.state


def run(config_path: Path, run_root: Path, run_id: str, inject_failure_once=None):
    if not SLUG_RE.fullmatch(run_id): raise BuildError("run-id must be a simple lowercase slug")
    config_path = config_path.resolve(); config = json.loads(config_path.read_text(encoding="utf-8"))
    screenshot_path, screenshot = _validate_config(config, config_path)
    digest = _hash(_canonical(config) + screenshot)
    run_dir = run_root.resolve() / run_id
    run_dir.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if run_dir.exists(): raise BuildError("run directory already exists; choose a new run-id or recover the recorded failed run")
    run_dir.mkdir(mode=0o700)
    builder = BuildRun(run_dir, config, screenshot, digest, inject_failure_once)
    builder.execute()
    return run_dir


def recover(run_dir: Path):
    builder = BuildRun.resume(run_dir.resolve())
    state = builder.execute(builder.state["current_step"])
    return builder.path


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    rp = sub.add_parser("run"); rp.add_argument("--config", required=True); rp.add_argument("--run-id", required=True); rp.add_argument("--run-root", default=str(DEFAULT_RUN_ROOT)); rp.add_argument("--inject-failure-once", choices=("validate", "render", "verify"), help=argparse.SUPPRESS)
    cp = sub.add_parser("recover"); cp.add_argument("--run-dir", required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "run": result = run(Path(args.config), Path(args.run_root), args.run_id, args.inject_failure_once)
        else: result = recover(Path(args.run_dir))
        report_path = Path(result) / "report.json"
        print(report_path.read_text(encoding="utf-8"))
        return 0 if json.loads(report_path.read_text()).get("status") == "complete" else 1
    except (BuildError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "blocked", "error": type(exc).__name__, "message": str(exc)}, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
