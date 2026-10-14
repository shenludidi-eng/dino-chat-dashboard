# Repository operating rules

This repository is the durable record for the Dino Chat internal analytics dashboard.

## Before changing the dashboard

1. Read `README.md`, `docs/dashboard/README.md`, `docs/dashboard/data-catalog.md`, and `dino-chat-dashboard/README.md`.
2. Treat `dino-chat-dashboard/` as the source of truth. `dino-chat-dashboard-vercel/public/` is generated and must not be committed.
3. Preserve metric definitions. If a definition changes, update the methodology, data manifest, and relevant tests in the same commit.

## Data and secrets

- Never commit raw exports, direct identifiers, credentials, `.env` files, API keys, cookies, or deployment tokens.
- Direct identifiers include phone, email, nickname, avatar URL, exact birthday, original `user_id`, and original `session_id`.
- Commit only the approved de-identified/derived assets documented in `data/README.md`.
- Keep original non-English evidence and place the English translation below it; never replace the source text.

## Verification

Run `bash scripts/validate-dashboard.sh` before committing dashboard changes. Update `data/manifests/` after every data refresh. Use `scripts/stage-github-upload.sh`; do not use broad `git add .` staging for this repository.
