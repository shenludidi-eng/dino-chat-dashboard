#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

commit_message="${1:-Archive Dino dashboard, data methodology, and architecture}"

bash scripts/validate-dashboard.sh
bash scripts/stage-github-upload.sh
git diff --cached --check

secret_pattern='sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'
if git grep --cached -nE "$secret_pattern" -- ':!scripts/upload-github.sh' > /tmp/dino_upload_secret_scan.txt 2>/dev/null; then
  echo "Potential secret found in staged files. Review /tmp/dino_upload_secret_scan.txt before uploading."
  exit 1
fi

if git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi

git commit -m "$commit_message"
git push origin main

echo "Uploaded to GitHub."
