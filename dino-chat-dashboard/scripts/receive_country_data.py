#!/usr/bin/env python3
"""Receive a locally pasted country extract and save it as a build input."""
from __future__ import annotations

import argparse
import csv
import html
import io
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs


FORM = """<!doctype html><meta charset="utf-8"><title>Country import</title>
<form method="post"><label>Country CSV<textarea name="payload" autofocus></textarea></label>
<button type="submit">保存国家数据</button></form>"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802
            body = FORM.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_POST(self) -> None:  # noqa: N802
            length = int(self.headers.get("Content-Length", "0"))
            form = parse_qs(self.rfile.read(length).decode("utf-8"))
            payload = form.get("payload", [""])[0]
            rows = list(csv.DictReader(io.StringIO(payload)))
            required = {"user_id", "current_country"}
            missing = required.difference(rows[0] if rows else {})
            if missing or len(rows) < 3000:
                message = f"校验失败：rows={len(rows)}, missing={sorted(missing)}"
                status = 400
            else:
                args.output.parent.mkdir(parents=True, exist_ok=True)
                with args.output.open("w", encoding="utf-8-sig", newline="") as handle:
                    writer = csv.DictWriter(
                        handle, fieldnames=["user_id", "current_country"]
                    )
                    writer.writeheader()
                    writer.writerows(
                        {
                            "user_id": row["user_id"].strip(),
                            "current_country": ""
                            if row["current_country"].strip() == "(null)"
                            else row["current_country"].strip().upper(),
                        }
                        for row in rows
                    )
                countries = sum(
                    bool(row["current_country"].strip())
                    and row["current_country"].strip() != "(null)"
                    for row in rows
                )
                message = f"保存完成：{len(rows)} 位用户，{countries} 位有国家数据。"
                status = 200
            body = (
                "<!doctype html><meta charset='utf-8'><h1>"
                + html.escape(message)
                + "</h1>"
            ).encode()
            self.send_response(status)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, _format: str, *_args: object) -> None:
            return

    HTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
