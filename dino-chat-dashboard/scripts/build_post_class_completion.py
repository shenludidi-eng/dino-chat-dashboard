#!/usr/bin/env python3
"""Build anonymized POST_CLASS completion data from an Archery read-only query.

The public output contains only the dashboard's integer user/session/date indexes.
Raw business IDs never leave the private build step.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def load_dashboard_data(path: Path) -> dict:
    text = path.read_text(encoding="utf-8").strip()
    prefix = "window.DINO_DATA="
    if not text.startswith(prefix) or not text.endswith(";"):
        raise ValueError("Unexpected data.js wrapper")
    return json.loads(text[len(prefix):-1])


def query_completed_users(helper: Path, cutoff: datetime) -> dict:
    """Return users who completed SPEAKING before the dashboard cutoff.

    class_user_lesson_task contains one row per completed user/lesson task in
    the current production schema.  A user may complete several lessons, so
    the public metric always deduplicates at user level.
    """
    sql = (
        "SELECT DISTINCT user_id "
        "FROM class_user_lesson_task "
        "WHERE task_code = 'SPEAKING' "
        "AND status = 'COMPLETED' "
        f"AND create_time < '{cutoff.strftime('%Y-%m-%d %H:%M:%S')}' "
        "ORDER BY user_id"
    )
    process = subprocess.run(
        [sys.executable, str(helper), "run", "--db", "dino_english", "--limit", "5000", "--sql", sql],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(process.stdout)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--messages", type=Path, required=True, help="Private merged-messages.json from the current dashboard refresh")
    parser.add_argument("--data", type=Path, required=True, help="Current public data.js")
    parser.add_argument("--query-helper", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    data = load_dashboard_data(args.data)
    messages = json.loads(args.messages.read_text(encoding="utf-8"))
    users = sorted({str(row["user_id"]) for row in messages})
    session_keys = sorted({
        (str(row["entry_type"]), str(row["user_id"]), str(row["session_id"]))
        for row in messages
    })
    user_index = {value: index for index, value in enumerate(users)}
    session_index = {value: index for index, value in enumerate(session_keys)}
    session_start = {row[2]: row[3] for row in data["sessionRows"]}

    cutoff_raw = data["meta"]["coverageEndExclusiveUtc"]
    cutoff_dt = datetime.fromisoformat(cutoff_raw)
    # The refresh metadata names this field UTC; older builds omitted an
    # explicit +00:00 suffix, so a naive value must not be treated as local time.
    cutoff_dt = cutoff_dt.replace(tzinfo=timezone.utc) if cutoff_dt.tzinfo is None else cutoff_dt.astimezone(timezone.utc)
    payload = query_completed_users(args.query_helper, cutoff_dt.replace(tzinfo=None))
    columns = payload.get("column_list") or []
    raw_rows = payload.get("rows") or []
    positions = {name: index for index, name in enumerate(columns)}
    if "user_id" not in positions:
        raise ValueError("Archery result is missing required completion columns")

    completed_business_users = {str(row[positions["user_id"]]) for row in raw_rows}

    public_rows = []
    post_class_session_keys = [key for key in session_keys if key[0] == "POST_CLASS"]
    for key in post_class_session_keys:
        sid = session_index[key]
        uid = user_index.get(key[1])
        if uid is None or sid not in session_start:
            raise ValueError("POST_CLASS session is missing from the current public dashboard indexes")
        completed = 1 if key[1] in completed_business_users else 0
        public_rows.append([uid, sid, session_start[sid], completed])
    public_rows.sort(key=lambda row: row[1])

    expected_sessions = sum(row[0] == 2 for row in data["sessionRows"])
    expected_users = len({row[1] for row in data["sessionRows"] if row[0] == 2})
    total_users = len({row[0] for row in public_rows})
    completed_users = len({row[0] for row in public_rows if row[3]})
    if len(public_rows) != expected_sessions or total_users != expected_users:
        raise ValueError(
            "Completion data does not reconcile with the current dashboard: "
            f"completed_business_users={len(completed_business_users)}, "
            f"matched_sessions={len(public_rows)}, expected_sessions={expected_sessions}, "
            f"matched_users={total_users}, expected_users={expected_users}"
        )

    result = {
        "meta": {
            "definition": "Distinct POST_CLASS users with at least one completed SPEAKING task / distinct POST_CLASS users",
            "completionSource": "dino_english.class_user_lesson_task",
            "completionRule": "task_code=SPEAKING AND status=COMPLETED; user-level ever completed before the dashboard cutoff",
            "timeBasis": "北京时间",
            "coverageEndExclusiveUtc": cutoff_dt.isoformat(),
            "sessions": len(public_rows),
            "users": total_users,
            "completedUsers": completed_users,
        },
        "rows": public_rows,
    }
    args.output.write_text(
        "window.DINO_POST_CLASS_COMPLETION="
        + json.dumps(result, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(json.dumps(result["meta"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
