#!/usr/bin/env python3
"""Serve the Dino Chat dashboard without ever exposing a directory listing."""

from __future__ import annotations

import argparse
import errno
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional
from urllib.parse import urlsplit


DASHBOARD_DIR = Path(__file__).resolve().parent.parent


def canonical_redirect(path: str, query: str = "") -> Optional[str]:
    """Return the canonical dashboard URL for known non-page entry paths."""
    normalized = path.rstrip("/")
    if normalized in ("", "/", "/dino-chat-dashboard"):
        suffix = f"?{query}" if query else ""
        return f"/index.html{suffix}"
    return None


class DashboardHandler(SimpleHTTPRequestHandler):
    """Static handler with a canonical home page and no folder browsing."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DASHBOARD_DIR), **kwargs)

    def redirect_to_home(self) -> bool:
        request = urlsplit(self.path)
        target = canonical_redirect(request.path, request.query)
        if target:
            self.send_response(302)
            self.send_header("Location", target)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return True
        return False

    def do_GET(self) -> None:  # noqa: N802 - stdlib handler API
        if self.redirect_to_home():
            return
        super().do_GET()

    def do_HEAD(self) -> None:  # noqa: N802 - stdlib handler API
        if self.redirect_to_home():
            return
        super().do_HEAD()

    def list_directory(self, path):  # noqa: ANN001 - stdlib handler API
        self.send_error(404, "Dashboard page not found")
        return None

    def end_headers(self) -> None:
        if self.path.startswith("/index.html"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the Dino Chat dashboard locally")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--open", action="store_true", help="Open the canonical home page")
    args = parser.parse_args()
    server = None
    selected_port = args.port
    for candidate in range(args.port, args.port + 10):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", candidate), DashboardHandler)
            selected_port = candidate
            break
        except OSError as error:
            if error.errno != errno.EADDRINUSE:
                raise
    if server is None:
        server = ThreadingHTTPServer(("127.0.0.1", 0), DashboardHandler)
        selected_port = server.server_address[1]
    url = f"http://127.0.0.1:{selected_port}/index.html"
    print(f"Dino Chat dashboard: {url}")
    print("Press Control-C to stop the local preview.")
    if args.open:
        threading.Timer(0.25, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
