#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

# Explicit allowlist: never replace this with `git add .`.
git add -A -- \
  .gitignore \
  AGENTS.md \
  README.md \
  GITHUB_UPLOAD_MANIFEST.md \
  docs \
  scripts \
  data \
  dino-chat-dashboard \
  dino-chat-dashboard-vercel/.gitignore \
  dino-chat-dashboard-vercel/.env.example \
  dino-chat-dashboard-vercel/package.json \
  dino-chat-dashboard-vercel/package-lock.json \
  dino-chat-dashboard-vercel/proxy.js \
  dino-chat-dashboard-vercel/vercel.json

echo "Staged the explicit GitHub upload allowlist."
echo "Review with: git status --short"
