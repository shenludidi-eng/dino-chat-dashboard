# English dialogue overlays

`translate_dashboard.py` audits unique historical dialogue strings and translates
non-English/mixed-language text through the user-approved Azure deployment.
It audits ASCII text too, because Malay and transliterated languages cannot be
detected reliably using a non-Latin-character check.

Run from the dashboard directory:

```sh
python3 scripts/translate_dashboard.py --workers 8
```

The API key is requested through an echo-disabled terminal prompt. Never put it
in source code, command-line arguments, public files, or browser requests. The
endpoint is fixed to the approved Azure host and redirects are disabled.

Successful responses are cached in `../.translation-work/english-cache.jsonl`,
outside the served dashboard directory. A run resumes uncached strings, validates
all returned IDs, splits malformed batches, and retains successful work if a
request fails. Use `--limit 32` for a small connectivity check, or `--publish` to
rebuild the local translation overlay from the cache without contacting Azure.

Output:

- `dialogue-translations-data.js`: exact-original-text lookup plus audit metadata.
- `../.translation-work/translation-audit.json`: coverage summary. `remaining`
  must equal zero before describing the historical audit as complete. Separately
  report `serviceBlocked`: these texts have no translation because Azure filtered
  the batch. They are not counted as translated and show an explicit unavailable
  notice below the original. Do not disable or try to bypass the service filter.

`translation_overrides_en.json` contains reviewed corrections for missed romanized
expressions. They are merged into the presentation overlay during publication.

For a focused second pass on possible missed local-language expressions:

```sh
python3 scripts/translate_dashboard.py --recheck-native --batch-size 8 --workers 8
```

This excludes service-blocked records. An unchanged copy of the source is not
published as a new English translation. The recheck also distinguishes personal
names in otherwise English sentences from actual non-English expressions.

`dialogue-translations.js` enriches presentation data and returns copies of fetched
messages. It never rewrites source transcripts, their integrity hashes, the fixed
sample selection, human-reviewed labels, timestamps, or analytical denominators.
Existing translations take precedence. New manual records and newly imported
historical data require another audit; no API key or translation service is
exposed to the frontend.

Machine translation is a reading aid, not new evidence. Uncertain speech-recognition
fragments must stay uncertain; retain originals and censorship markers. A language
audit is not a semantic re-review of intent labels.

Verification:

```sh
node scripts/test_dialogue_translations.cjs
node scripts/test_sampled_conversation_analysis.cjs
python3 scripts/test_context_intent_review.py
```

Copy the two overlay assets and changed renderer/index files into the existing
site/vercel public mirrors after verification. This is a local build step, not
authorization to deploy or publish the dashboard.
