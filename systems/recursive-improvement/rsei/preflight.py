"""Read-only local configuration preflight; never starts configured commands."""
import argparse
import json
import os
from pathlib import Path

from .runner import BoundaryError, load_config


def inspect_config(config_path):
    try:
        path = Path(config_path).expanduser().resolve()
        config = load_config(path, allow_disabled=True)
    except (BoundaryError, OSError, ValueError, TypeError, KeyError, AttributeError, RuntimeError) as exc:
        return {
            "ready_to_attempt_local_cycle": False,
            "status": "blocked",
            "company_id": None,
            "worker_kind": None,
            "blockers": ["configuration could not be read or is invalid"],
            "error_type": type(exc).__name__,
            "required_env_names": [],
            "missing_env_names": [],
            "source_files": [],
            "permissions": {},
            "limitations": _limitations(),
        }

    required_env_names = sorted(config["secret_env"])
    missing_env_names = [name for name in required_env_names if not os.environ.get(name)]
    inline_secret_names = sorted(
        name for name, value in config["environment"].items()
        if value and _looks_sensitive_env_name(name)
    )
    blockers = []
    if config["enabled"] is not True:
        blockers.append("company execution is disabled")
    if missing_env_names:
        blockers.append("required credential environment variables are unavailable")
    if inline_secret_names:
        blockers.append("move sensitive values from config.environment into secret_env")

    source_files = []
    source_root = Path(config["source"])
    for name in config["source_files"]:
        candidate = source_root / name
        unsafe = candidate.is_symlink()
        for ancestor in candidate.parents:
            if ancestor == source_root:
                break
            if ancestor.is_symlink():
                unsafe = True
                break
        if unsafe:
            source_files.append({"path": name, "status": "unsafe_symlink"})
            blockers.append(f"source file is behind a symlink: {name}")
        elif not candidate.is_file() or not os.access(candidate, os.R_OK):
            source_files.append({"path": name, "status": "missing_or_unreadable"})
            blockers.append(f"source file is missing or unreadable: {name}")
        else:
            source_files.append({"path": name, "status": "available"})

    permissions = {
        name: config.get("permissions", {}).get(name, False)
        for name in ("browser", "implement", "local_release")
    }
    if not permissions["browser"]:
        blockers.append("browser execution is not permitted")

    blockers = list(dict.fromkeys(blockers))
    ready = not blockers
    return {
        "ready_to_attempt_local_cycle": ready,
        "status": "ready_to_attempt_local_cycle" if ready else "blocked",
        "company_id": config["company_id"],
        "worker_kind": config["worker_kind"],
        "execution_enabled": config["enabled"],
        "required_env_names": required_env_names,
        "missing_env_names": missing_env_names,
        "inline_sensitive_env_names": inline_secret_names,
        "source_files": source_files,
        "permissions": permissions,
        "context_configured": config.get("context_records") is not None,
        "blockers": blockers,
        "limitations": _limitations(),
    }


def _looks_sensitive_env_name(name):
    parts = set(name.upper().split("_"))
    if parts.intersection({"TOKEN", "SECRET", "PASSWORD", "PASSCODE", "CREDENTIAL", "AUTHORIZATION"}):
        return True
    if "PRIVATE" in parts and "KEY" in parts:
        return True
    if "ACCESS" in parts and "KEY" in parts:
        return True
    return "API" in parts and "KEY" in parts and not parts.intersection({"PUBLIC", "ANON"})


def _limitations():
    return [
        "Credential values are never displayed; environment presence does not verify validity or provider access.",
        "Sensitive-name detection is heuristic; it can miss secrets under generic variable names.",
        "Configured browser, worker, and test commands are not executed.",
        "This check does not establish production access, a schedule, a live repair, or business improvement.",
    ]


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, help="Company execution config to inspect")
    args = parser.parse_args(argv)
    result = inspect_config(args.config)
    print(json.dumps(result, indent=2))
    return 0 if result["ready_to_attempt_local_cycle"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
