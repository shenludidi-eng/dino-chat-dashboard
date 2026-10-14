#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
source_dir="$repo_root/dino-chat-dashboard"
target_dir="$repo_root/dino-chat-dashboard-vercel/public"

mkdir -p "$target_dir"
rsync -a --delete \
  --exclude '.gitignore' \
  --exclude 'README.md' \
  --exclude 'outputs/' \
  --exclude 'prompt-snapshots/' \
  --exclude 'scripts/' \
  --exclude '打开Dino Chat看板.command' \
  --exclude 'analysis/intent-context-review.json' \
  --exclude 'analysis/intent-context-review.tsv' \
  "$source_dir/" "$target_dir/"

echo "Synced dashboard source to $target_dir"
