#!/bin/zsh
set -e

dashboard_dir="${0:A:h}"
exec python3 "$dashboard_dir/scripts/serve_dashboard.py" --open
