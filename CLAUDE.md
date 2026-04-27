# Claude Plugins Official

A curated directory of high-quality plugins for Claude Code, maintained by Anthropic.

## Quick Start

```bash
# Install a plugin via Claude Code
/plugin install {plugin-name}@claude-plugins-official

# Or browse the marketplace
/plugin > Discover
```

## Key Rules

1. **External contributions:** This repo only accepts PRs from Anthropic team members. External plugin submissions go through the [plugin directory submission form](https://clau.de/plugin-directory-submission).

2. **marketplace.json must stay sorted:** Plugin entries in `.claude-plugin/marketplace.json` are kept in alphabetical order by `name`. The CI enforces this. To auto-fix: `bun .github/scripts/check-marketplace-sorted.ts --fix`.

3. **Required plugin fields:** Every entry in `marketplace.json` needs `name`, `description`, and `source`. Duplicate names are rejected by CI.

4. **Frontmatter required:** All `agents/*.md`, `skills/*/SKILL.md`, and `commands/*.md` files must have valid YAML frontmatter. Agents need `name` + `description`; commands need `description`; skills need `description` or `when_to_use`.

## CI Overview

PRs trigger:

- `validate-marketplace.yml` — validates `.claude-plugin/marketplace.json` (well-formed JSON, required fields, no duplicates, alphabetical sort)
- `validate-frontmatter.yml` — validates YAML frontmatter in changed agent/skill/command `.md` files
- `close-external-prs.yml` — automatically closes PRs from contributors without write access

## CI Scripts (TypeScript, run with Bun)

```
.github/scripts/validate-marketplace.ts    # Validates marketplace.json structure and fields
.github/scripts/check-marketplace-sorted.ts # Checks/fixes alphabetical sort order (--fix flag)
.github/scripts/validate-frontmatter.ts    # Validates YAML frontmatter in agent/skill/command files
```

## Plugin Structure

Each plugin lives under `plugins/<name>/` (internal) or `external_plugins/<name>/` (third-party) and follows this layout:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # Plugin metadata: name, description, author (required)
├── .mcp.json            # MCP server configuration (optional)
├── commands/            # Slash commands — legacy *.md format (optional)
├── agents/              # Agent definitions — *.md with YAML frontmatter (optional)
├── skills/              # Skill definitions — <name>/SKILL.md layout (optional)
└── README.md            # Documentation
```

## Project Structure

```
plugins/                  # Internal plugins developed and maintained by Anthropic
  example-plugin/         # Reference implementation — commands, agents, skills, MCP
  claude-md-management/   # Tools for managing CLAUDE.md files
  code-review/            # Code review commands and agents
  feature-dev/            # Feature development workflow
  pr-review-toolkit/      # PR review commands and agents
  ...                     # (many more — see plugins/)
external_plugins/         # Third-party plugins from partners and the community
  github/                 # GitHub integration
  linear/                 # Linear project management
  supabase/               # Supabase integration
  ...                     # (many more — see external_plugins/)
.claude-plugin/
  marketplace.json        # Catalog of all plugins (sorted by name; enforced by CI)
.github/
  workflows/              # CI: validate-marketplace, validate-frontmatter,
                          #   close-external-prs
  scripts/                # Bun/TypeScript validation scripts (validate-marketplace.ts,
                          #   check-marketplace-sorted.ts, validate-frontmatter.ts)
README.md                 # Repo overview and contributing guide
```

## Adding an Internal Plugin

1. Create `plugins/<plugin-name>/` with at minimum `.claude-plugin/plugin.json` and `README.md`.
2. Add an entry to `.claude-plugin/marketplace.json` in the correct alphabetical position (or run `bun .github/scripts/check-marketplace-sorted.ts --fix` after appending).
3. Add commands, agents, and/or skills with valid YAML frontmatter.
4. Open a PR — CI will validate the marketplace entry and any frontmatter files.

## Adding an External Plugin

External plugins are not submitted via PRs. Direct contributors to the [plugin directory submission form](https://clau.de/plugin-directory-submission).

## plugin.json Schema

```json
{
  "name": "plugin-name",
  "description": "Short description of the plugin",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  }
}
```

## marketplace.json Entry Schema

```json
{
  "name": "plugin-name",
  "description": "Short description shown in the marketplace",
  "category": "development",
  "source": {
    "source": "url",          // source type: "url", "git-subdir", or a local path string
    "url": "https://github.com/org/repo.git",
    "sha": "<optional-pinned-commit-sha>"
  },
  "homepage": "https://example.com"
}
```

Required fields: `name`, `description`, `source`. Optional: `category`, `homepage`, `sha` pin inside `source`.

The `source` field accepts either an object (with a nested `source` field indicating the type: `"url"` or `"git-subdir"`) or a local path string (e.g. `"./plugins/my-plugin"` for internal plugins).
