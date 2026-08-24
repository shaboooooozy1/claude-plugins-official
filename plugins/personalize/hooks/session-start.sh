#!/usr/bin/env bash

set -euo pipefail

PROFILE_FILE=".claude/personalize.local.md"

if [[ ! -f "$PROFILE_FILE" ]]; then
  exit 0
fi

python3 - "$PROFILE_FILE" <<'PY'
import json
import re
import sys
from pathlib import Path

profile_path = Path(sys.argv[1])
profile = profile_path.read_text(encoding="utf-8")

frontmatter_match = re.match(r"\A---\s*\n(.*?)\n---(?:\s*\n|\Z)", profile, re.DOTALL)
if not frontmatter_match:
    sys.exit(0)

enabled_match = re.search(
    r"(?mi)^[ \t]*enabled[ \t]*:[ \t]*(true|false)[ \t]*(?:#.*)?$",
    frontmatter_match.group(1),
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
        },
        ensure_ascii=False,
    )
)
PY
