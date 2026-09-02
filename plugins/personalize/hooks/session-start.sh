#!/usr/bin/env bash

set -euo pipefail

PROFILE_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/personalize.local.md"

if [[ ! -f "$PROFILE_FILE" ]]; then
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "personalize: python3 is required to load $PROFILE_FILE" >&2
  exit 0
fi

python3 - "$PROFILE_FILE" <<'PY'
import json
import re
import sys
from pathlib import Path

profile_path = Path(sys.argv[1])
try:
    profile = profile_path.read_text(encoding="utf-8-sig")
except (OSError, UnicodeDecodeError):
    print(f"personalize: could not read {profile_path}", file=sys.stderr)
    sys.exit(0)

frontmatter_match = re.match(r"\A---\s*\n(.*?)\n---(?:\s*\n|\Z)", profile, re.DOTALL)
if not frontmatter_match:
    sys.exit(0)

frontmatter = frontmatter_match.group(1).replace("\r\n", "\n").replace("\r", "\n")

enabled_match = re.search(
    r"(?mi)^enabled[ \t]*:[ \t]*(true|false)[ \t]*(?:#.*)?$",
    frontmatter,
)
if not enabled_match or enabled_match.group(1).lower() != "true":
    sys.exit(0)

context = (
    "User personalization profile for this project follows. Apply these "
    "durable working preferences unless they conflict with higher-priority "
    "instructions or the user's current request.\n\n"
    f"{profile.strip()}"
)

print(
    json.dumps(
        {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": context,
            }
        }
    )
)
PY
