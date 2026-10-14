#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
dashboard="$repo_root/dino-chat-dashboard"

cd "$repo_root"
git diff --check

while IFS= read -r -d '' file; do
  node --check "$file" >/dev/null
done < <(find "$dashboard" -maxdepth 1 -type f -name '*.js' -print0)

for test_file in "$dashboard"/scripts/test_*.cjs; do
  node "$test_file"
done

(
  cd "$dashboard/scripts"
  python3 -m unittest discover -p 'test_*.py'
)

python3 scripts/verify-dashboard-manifest.py

secret_pattern='sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'
if rg -n --hidden -g '!public/**' -g '!node_modules/**' -g '!.vercel/**' \
  -g '!scripts/validate-dashboard.sh' -g '!scripts/upload-github.sh' \
  "$secret_pattern" \
  README.md AGENTS.md GITHUB_UPLOAD_MANIFEST.md docs data scripts \
  dino-chat-dashboard dino-chat-dashboard-vercel; then
  echo "Potential secret found in project files."
  exit 1
fi

echo "Dashboard validation passed."
