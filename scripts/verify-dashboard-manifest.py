#!/usr/bin/env python3
"""Verify the committed dashboard snapshot manifest against local assets."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/manifests/dashboard-snapshot-2026-10-11.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    failures: list[str] = []
    for asset in manifest["assets"]:
        path = ROOT / asset["path"]
        if not path.is_file():
            failures.append(f"missing: {asset['path']}")
            continue
        actual = sha256(path)
        if actual != asset["sha256"]:
            failures.append(
                f"hash mismatch: {asset['path']} expected {asset['sha256']} got {actual}"
            )

    transcript_dir = ROOT / "dino-chat-dashboard/analysis/transcripts"
    transcript_count = len(list(transcript_dir.glob("*.json")))
    expected_count = manifest["counts"]["transcriptShards"]
    if transcript_count != expected_count:
        failures.append(
            f"transcript shard count mismatch: expected {expected_count} got {transcript_count}"
        )

    if manifest["privacy"]["directIdentifiersCommitted"]:
        failures.append("manifest must not permit direct identifiers")
    if manifest["privacy"]["rawExportsCommitted"]:
        failures.append("manifest must not permit raw exports")

    if failures:
        raise SystemExit("\n".join(failures))
    print(f"Manifest verified: {len(manifest['assets'])} assets, {transcript_count} shards")


if __name__ == "__main__":
    main()
