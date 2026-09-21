#!/usr/bin/env bash
set -euo pipefail

# The repo's tooling (CI validation scripts, runnable MCP-server plugins) runs
# on Bun, not Node/npm. Install Bun only if it is missing so this stays cheap
# and idempotent on cached environments.
if ! command -v bun >/dev/null 2>&1 && [ ! -x "$HOME/.bun/bin/bun" ]; then
  # Pin the Bun release so the bootstrap does not silently float to a new
  # version; bump deliberately alongside the CI setup-bun action.
  curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.11"
fi
export PATH="$HOME/.bun/bin:$PATH"

# The frontmatter validator imports the `yaml` package, which is intentionally
# not committed. Install it into .github/scripts, mirroring CI which runs
# `bun install yaml@2.9.1` there on the fly. The resulting package.json/bun.lock/
# node_modules are transient and gitignored.
(cd .github/scripts && bun install yaml@2.9.1)
