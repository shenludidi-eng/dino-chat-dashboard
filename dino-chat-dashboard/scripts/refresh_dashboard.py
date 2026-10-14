#!/usr/bin/env python3
"""Stage a reconciled full rebuild. Originals stay untouched; never publish raw IDs.

The optional profile supplement must describe exactly the incoming messages.
Existing recorded profile values are preserved; only gaps are filled.
"""
import argparse
import collections
import contextlib
import csv
import hashlib
import json
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path

from build_data import BUSINESS_TIMEZONE, BUSINESS_TZ, build, read_profiles, read_countries
from build_entry_analysis import build as build_analysis

FIELDS = ("message_id", "user_id", "session_id", "entry_type", "sequence_no", "role", "content", "created_at")


def csv_rows(path):
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def normalize(row):
    result = {k: str(row.get(k) if row.get(k) is not None else "") for k in FIELDS}
    result["created_at"] = str(row.get("message_created_at_utc") or row.get("created_at") or "")
    datetime.fromisoformat(result["created_at"])
    result["sequence_no"] = str(int(result["sequence_no"]))
    if not all(result[k] for k in ("message_id", "user_id", "session_id")):
        raise ValueError("Missing message/user/session ID")
    if result["role"] not in ("user", "assistant") or result["entry_type"] not in ("HOME", "EXPLORE", "POST_CLASS"):
        raise ValueError("Unexpected role or entry; refusing a silent fallback")
    return result


def merge_sources(sources):
    merged, stats = {}, {}
    for path, rows in sources:
        count = added = duplicate = 0
        for row in rows:
            count += 1
            m = normalize(row)
            key = m["message_id"]
            if key in merged:
                if merged[key] != m:
                    raise ValueError(f"Conflicting duplicate in {path.name}; reconcile before publishing")
                duplicate += 1
            else:
                merged[key] = m
                added += 1
        stats[path.name] = {"read": count, "unique": added, "duplicates": duplicate,
                            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
    return list(merged.values()), stats


def write_csv(path, fields, rows):
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--base-json", type=Path, required=True)
    p.add_argument("--incoming", type=Path, required=True)
    p.add_argument("--profiles", type=Path, required=True)
    p.add_argument("--countries", type=Path, required=True)
    p.add_argument("--profile-supplement", type=Path)
    p.add_argument("--coverage-end-exclusive-utc", required=True)
    p.add_argument("--stage", type=Path, required=True, help="Private directory outside the served dashboard")
    args = p.parse_args()
    dashboard = Path(__file__).resolve().parents[1]
    if args.stage.resolve().is_relative_to(dashboard):
        p.error("Stage must be outside the public dashboard")
    if args.stage.exists() and any(args.stage.iterdir()):
        p.error("Use an empty staging directory")
    args.stage.mkdir(parents=True, exist_ok=True)
    base = json.loads(args.base_json.read_text())
    incoming = csv_rows(args.incoming)
    raw, stats = merge_sources([(args.base_json, base), (args.incoming, incoming)])
    coverage_end = datetime.fromisoformat(args.coverage_end_exclusive_utc)
    assert all(datetime.fromisoformat(m["created_at"]) < coverage_end for m in raw)
    profiles, _ = read_profiles(args.profiles)
    countries, _ = read_countries(args.countries)
    filled = collections.Counter()
    if args.profile_supplement:
        supplement = csv_rows(args.profile_supplement)
        assert {m["message_id"]: m for m in map(normalize, supplement)} == {m["message_id"]: m for m in map(normalize, incoming)}, "Profile supplement is not the same export"
        profile_rows = {}
        for row in supplement:
            uid = str(row["user_id"])
            values = (row.get("age_range_raw") or row.get("age_range") or "", row.get("current_level_no") or "", row.get("current_country") or "")
            if uid in profile_rows:
                assert profile_rows[uid] == values, "Conflicting profile snapshot"
            profile_rows[uid] = values
        for uid, (age, level, country) in profile_rows.items():
            current = profiles.setdefault(uid, {"age": "未记录", "level": "未记录"})
            for key, value in (("age", age.replace("–", "-")), ("level", level)):
                if current[key] == "未记录" and value:
                    current[key] = value
                    filled[key] += 1
            if countries.get(uid, "未记录") == "未记录" and country:
                countries[uid] = country.upper()
                filled["country"] += 1
    raw_path = args.stage / "merged-messages.json"
    raw_path.write_text(json.dumps(raw, ensure_ascii=False))
    profile_path, country_path = args.stage / "profiles.csv", args.stage / "countries.csv"
    write_csv(profile_path, ["user_id", "age_range", "current_level_no"], ({"user_id":u,"age_range":v["age"],"current_level_no":v["level"]} for u,v in profiles.items()))
    write_csv(country_path, ["user_id", "current_country"], ({"user_id":u,"current_country":v} for u,v in countries.items()))
    public = args.stage / "dashboard"
    public.mkdir()
    shutil.copytree(dashboard / "scripts", public / "scripts", ignore=shutil.ignore_patterns("__pycache__"))
    for name in ("round-distribution.js", "weekly-traffic.js", "profile-composition.js"):
        shutil.copy2(dashboard / name, public / name)
    data = build(None, raw_path, profile_path, country_path)
    coverage_end_local = coverage_end.replace(tzinfo=timezone.utc).astimezone(BUSINESS_TZ)
    complete_through = (coverage_end_local.date()-timedelta(days=1)).isoformat()
    data["meta"].update({"sourceStats": stats, "timeBasis": "北京时间", "timezone": BUSINESS_TIMEZONE,
                         "coverageEndExclusiveUtc": coverage_end.isoformat(),
                         "coverageEndExclusiveLocal": coverage_end_local.isoformat(),
                         "coverageCompleteThroughLocalDate": complete_through,
                         "coverageNote": f"数据按北京时间归日与归周；当前导出完整覆盖至 {complete_through} 23:59:59。"})
    data["meta"]["profileStats"].update({"gapFillCounts": dict(filled), "snapshotPolicy": "保留已有画像；同批消息的画像导出仅填补缺失值。"})
    users = sorted({m["user_id"] for m in raw})
    data["meta"]["profileStats"]["missingByField"] = {key: sum((profiles.get(u) or {}).get(key,"未记录")=="未记录" for u in users) for key in ("age", "level")}
    data["meta"]["profileStats"]["missingByField"]["country"] = sum(countries.get(u,"未记录")=="未记录" for u in users)
    (public / "data.js").write_text("window.DINO_DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    with (args.stage / "analysis-build.log").open("w") as log, contextlib.redirect_stdout(log):
        build_analysis(raw_path, public, public / "analysis")
    report = {"meta": data["meta"], "perEntry": [{"entry": e, "messages": sum(m["entry_type"]==e for m in raw),
              "users": len({m["user_id"] for m in raw if m["entry_type"]==e}),
              "sessions": len({(m["user_id"],m["session_id"]) for m in raw if m["entry_type"]==e})} for e in ("HOME","EXPLORE","POST_CLASS")]}
    (public / "analysis/refresh-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
