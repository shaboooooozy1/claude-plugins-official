#!/usr/bin/env bash
set -euo pipefail

# The repo's tooling (CI validation scripts, runnable MCP-server plugins) runs
# on Bun, not Node/npm. Install Bun only if it is missing so this stays cheap
# and idempotent on cached environments.
if ! command -v bun >/dev/null 2>&1 && [ ! -x "$HOME/.bun/bin/bun" ]; then
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="$HOME/.bun/bin:$PATH"

# The frontmatter validator imports the `yaml` package, which is intentionally
# not committed. Install it into .github/scripts, mirroring CI which runs
# `bun install yaml` there on the fly. The resulting package.json/bun.lock/
# node_modules are transient and gitignored.
(cd .github/scripts && bun install yaml)
