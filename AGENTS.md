# AGENTS.md

## Cursor Cloud specific instructions

This repository is the **Claude Code Plugin Marketplace** — a curated directory/registry of plugins, not a runnable web app or service. There is **no dev server, backend, or build step**. "Correctness" is enforced by CI validation scripts. See `CLAUDE.md` for the full repo layout, plugin schema, and command reference.

### Toolchain

- Everything runs on **Bun** (not Node/npm). Bun is installed at `~/.bun/bin/bun` and is on `PATH` via `~/.bashrc`, so `bun` works in fresh shells. The startup update script reinstalls Bun only if missing.
- The frontmatter validator imports the `yaml` package, which is **not committed**. The update script installs it into `.github/scripts` (matching CI, which runs `bun install yaml` there on the fly). The resulting `.github/scripts/{package.json,bun.lock,node_modules}` are transient — **do not commit them**.

### Validation = the repo's "lint/test/build"

Run these from the repo root (they mirror the CI in `.github/workflows/`):

- `bun .github/scripts/validate-marketplace.ts .claude-plugin/marketplace.json` — validates `marketplace.json` (JSON shape, required fields, no duplicate names).
- `bun .github/scripts/check-marketplace-sorted.ts` — checks `marketplace.json` is alphabetically sorted (append `--fix` to auto-sort).
- `bun .github/scripts/validate-frontmatter.ts .` — validates YAML frontmatter of all `agents/*.md`, `skills/*/SKILL.md`, `commands/*.md`. Requires the `yaml` dep above.

### Runnable plugins (optional)

Four `external_plugins/` are self-contained MCP servers with a `package.json`: `fakechat`, `discord`, `telegram`, `imessage`. They connect to an MCP stdio transport and are normally launched by Claude Code, but can be started standalone for testing with `bun server.ts` inside the plugin dir (or `bun run start`). Non-obvious: `fakechat` also serves a local web UI on `http://localhost:8787` (override with `FAKECHAT_PORT`); after `await mcp.connect(stdio)` it still starts the HTTP server, so the UI is reachable even without an attached MCP client.
