# CLAUDE.md

This is the official Claude Code Plugin Marketplace repository — a curated directory of high-quality plugins for Claude Code. It contains internal plugins maintained by Anthropic (`/plugins`) and third-party plugins from partners and the community (`/external_plugins`).

## Repository Structure

```
claude-plugins-official/
├── plugins/                    # Internal plugins (Anthropic-maintained)
├── external_plugins/           # Third-party plugins
├── .claude-plugin/
│   └── marketplace.json        # Central plugin directory (source of truth)
├── .github/
│   ├── workflows/              # CI validation (frontmatter, marketplace)
│   └── scripts/                # Bun/TypeScript validation scripts
├── README.md
└── CLAUDE.md
```

### Internal Plugins (`/plugins`)

32 plugins organized into categories:

- **Development tools**: `agent-sdk-dev`, `claude-code-setup`, `claude-md-management`, `code-review`, `code-simplifier`, `commit-commands`, `feature-dev`, `frontend-design`, `hookify`, `mcp-server-dev`, `playground`, `plugin-dev`, `pr-review-toolkit`, `security-guidance`, `skill-creator`
- **LSP plugins** (12): `clangd-lsp`, `csharp-lsp`, `gopls-lsp`, `jdtls-lsp`, `kotlin-lsp`, `lua-lsp`, `php-lsp`, `pyright-lsp`, `ruby-lsp`, `rust-analyzer-lsp`, `swift-lsp`, `typescript-lsp`
- **Output styles**: `explanatory-output-style`, `learning-output-style`
- **Specialized**: `example-plugin`, `math-olympiad`, `ralph-loop`

### External Plugins (`/external_plugins`)

17 third-party plugins: `asana`, `context7`, `discord`, `fakechat`, `firebase`, `github`, `gitlab`, `greptile`, `imessage`, `laravel-boost`, `linear`, `playwright`, `serena`, `slack`, `supabase`, `telegram`, `terraform`

### Reference Plugins

- **`plugins/example-plugin`** — Minimal reference implementation demonstrating all plugin features
- **`plugins/plugin-dev`** — Comprehensive plugin development toolkit with 7 skills covering every plugin component:
  - `agent-development` — authoring autonomous agents
  - `command-development` — authoring slash commands
  - `hook-development` — writing lifecycle hooks
  - `mcp-integration` — configuring MCP servers
  - `plugin-settings` — plugin.json and configuration
  - `plugin-structure` — directory layout and conventions
  - `skill-development` — authoring skills with progressive disclosure

## Plugin Structure

Every plugin follows this standard layout:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json           # Required — plugin metadata
├── .mcp.json                 # Optional — MCP server configuration
├── skills/                   # Preferred format for both model-invoked and user-invoked
│   └── skill-name/
│       ├── SKILL.md          # Required — YAML frontmatter + markdown instructions
│       ├── references/       # Optional — detailed documentation
│       ├── examples/         # Optional — example files
│       └── scripts/          # Optional — helper scripts
├── commands/                 # Legacy slash command format (use skills/ instead)
│   └── command-name.md
├── agents/                   # Autonomous agent definitions
│   └── agent-name.md
├── hooks/
│   ├── hooks.json            # Hook event configuration
│   └── *.sh / *.py           # Hook implementation scripts
├── README.md
└── LICENSE                   # Apache 2.0 for internal plugins
```

### plugin.json (Required)

```json
{
  "name": "plugin-name",
  "description": "Clear description of plugin purpose",
  "author": {
    "name": "Anthropic",
    "email": "support@anthropic.com"
  },
  "version": "1.0.0"
}
```

- `name` is required (kebab-case, unique, no spaces/special chars)
- `version`, `description`, `author`, `homepage`, `license`, `keywords` are recommended

### YAML Frontmatter Formats

**Model-invoked skills** (`skills/skill-name/SKILL.md`):
```yaml
---
name: skill-name
description: "This skill should be used when the user asks to... or mentions..."
version: 1.0.0
---
```

**User-invoked skills/commands** (`skills/command-name/SKILL.md` or `commands/command-name.md`):
```yaml
---
name: command-name
description: Short description shown in /help
argument-hint: "<required-arg> [optional-arg]"
allowed-tools: [Read, Glob, Grep, Bash]
model: sonnet
---
```

**Agents** (`agents/agent-name.md`):
```yaml
---
name: agent-name
description: |
  When to use this agent, with <example> blocks showing trigger contexts
model: sonnet
color: magenta
tools: ["Write", "Read"]
---
```

The `tools` field accepts either a YAML array (`["Read", "Write"]`) or a comma-separated string (`Read, Write, Grep`). Both forms appear in existing agents — see `plugins/plugin-dev/agents/agent-creator.md` (array form) and `plugins/feature-dev/agents/code-reviewer.md` (string form).

### .mcp.json Format

Three transport types are used in this repo:

**HTTP** (most common for hosted services — e.g., `external_plugins/github`, `external_plugins/slack`):
```json
{
  "server-name": {
    "type": "http",
    "url": "https://api.example.com/mcp/",
    "headers": {
      "Authorization": "Bearer ${TOKEN_ENV_VAR}"
    }
  }
}
```

**SSE** (server-sent events — e.g., `external_plugins/asana`):
```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

**Command** (local stdio process — e.g., `external_plugins/playwright`, `external_plugins/serena`, `external_plugins/context7`):
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

OAuth can be configured on HTTP servers with an `oauth` object containing `clientId` and `callbackPort`. Use `${ENV_VAR}` interpolation for secrets — never hardcode tokens.

### hooks.json Format

Basic structure with a command hook:
```json
{
  "description": "Hook description",
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/script.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Tool matchers** — limit a hook to specific tools (see `plugins/security-guidance/hooks/hooks.json`):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{ "type": "command", "command": "...", "timeout": 10 }]
      }
    ]
  }
}
```

**Hook script conventions** (see `plugins/hookify/hooks/pretooluse.py` for a full example):
- Read event JSON from stdin, write result JSON to stdout
- Exit 0 for non-blocking behavior; non-zero blocks the tool call
- Use `${CLAUDE_PLUGIN_ROOT}` in `command` so paths remain portable

Valid hook events: `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PreCompact`, `Notification`.

### Plugins with Agents

7 plugins define autonomous agents in `agents/` directories: `agent-sdk-dev`, `code-simplifier`, `feature-dev`, `hookify`, `plugin-dev`, `pr-review-toolkit`, `skill-creator`.

### Plugins with Hooks

5 plugins use the hook system: `explanatory-output-style`, `hookify`, `learning-output-style`, `ralph-loop`, `security-guidance`.

## Marketplace Configuration

`.claude-plugin/marketplace.json` is the single source of truth for the plugin directory. It contains **123 registered plugins** — the 49 local plugins plus 74 externally-hosted plugins referenced by URL or git subdirectory. Entries must be:

- **Alphabetically sorted** by `name` (case-insensitive)
- Each entry requires: `name`, `description`, `source`
- Optional fields: `category`, `author`, `homepage`

Source types:
```jsonc
// Local plugin
"source": "./plugins/plugin-name"

// External git repo
"source": { "source": "url", "url": "https://github.com/org/repo.git", "sha": "..." }

// Git subdirectory
"source": { "source": "git-subdir", "url": "org/repo", "path": "plugins/name", "ref": "main", "sha": "..." }
```

### Marketplace Categories

Current entries use 13 canonical category values — reuse these rather than inventing new ones:

`automation`, `database`, `deployment`, `design`, `development`, `learning`, `location`, `math`, `migration`, `monitoring`, `productivity`, `security`, `testing`

## CI/CD & Validation

All CI runs on **Bun** runtime. Three GitHub Actions workflows enforce quality:

### 1. Frontmatter Validation (`validate-frontmatter.yml`)

Triggered on changes to `**/agents/*.md`, `**/skills/*/SKILL.md`, `**/commands/*.md`.

File type is detected by path:
- Path contains `/agents/` and is not nested inside a skill → **agent**
- Path ends with `/skills/<name>/SKILL.md` (basename must be exactly `SKILL.md`) → **skill**
- Path contains `/commands/` and is not nested inside a skill → **command**

Validation rules (from `.github/scripts/validate-frontmatter.ts`):
- **Agents**: ERROR if missing `name` (string) or `description` (string)
- **Skills**: ERROR if missing both `description` AND `when_to_use` (at least one required)
- **Commands**: ERROR if missing `description` (string)

The script auto-quotes YAML flow indicators, anchors, comments, tags, and block scalar indicators (`{} [] * & # ! | > % @ \``) before parsing, but unquoted values containing these characters will still fail if they break YAML parsing in other ways — quote them explicitly.

Run locally:
```bash
bun .github/scripts/validate-frontmatter.ts <file1> [file2...]
# or scan a directory
bun .github/scripts/validate-frontmatter.ts plugins/my-plugin
```

### 2. Marketplace Validation (`validate-marketplace.yml`)

Triggered on changes to `.claude-plugin/marketplace.json`.

Checks:
- Valid JSON with `plugins` array
- Required fields: `name`, `description`, `source`
- No duplicate plugin names
- Alphabetical sort order

Run locally:
```bash
bun .github/scripts/validate-marketplace.ts .claude-plugin/marketplace.json
bun .github/scripts/check-marketplace-sorted.ts          # check only
bun .github/scripts/check-marketplace-sorted.ts --fix     # auto-fix sort
```

### 3. External PR Policy (`close-external-prs.yml`)

Automatically closes PRs from non-team members. Only contributors with write/admin access can submit PRs. External plugins should be submitted via the [plugin directory submission form](https://clau.de/plugin-directory-submission).

## Development Conventions

### Naming
- **Kebab-case** for all directory and file names (`my-plugin`, `my-skill`)
- Plugin names must be unique across the marketplace

### Writing Style for Skills
- **Description**: Third-person with specific trigger phrases ("This skill should be used when the user asks to...")
- **Body**: Imperative/infinitive form — verb-first instructions, not second person
- Avoid "you", "should", "can", "might" in skill body content

### Content Sizing (Progressive Disclosure)
- **Level 1 — Metadata**: Name + description always in context (~100 words)
- **Level 2 — SKILL.md body**: Loaded when skill triggers (target 1,500-2,000 words, max 5,000)
- **Level 3 — References/scripts**: Loaded as needed (no limit)

Keep SKILL.md lean; move detailed documentation to `references/`.

### Portable Paths
Use `${CLAUDE_PLUGIN_ROOT}` for all intra-plugin path references. Never hardcode absolute paths or use `~`.

### Licensing
Internal plugins use Apache 2.0. Include a `LICENSE` file.

## Common Tasks

### Adding a New Internal Plugin

1. Create `plugins/plugin-name/.claude-plugin/plugin.json` with at minimum a `name` field
2. Add skills, commands, agents, or hooks as needed
3. Add an entry to `.claude-plugin/marketplace.json` (maintain alphabetical order)
4. Include `README.md` and `LICENSE` (Apache 2.0)
5. Validate frontmatter: `bun .github/scripts/validate-frontmatter.ts <files>`
6. Validate marketplace: `bun .github/scripts/validate-marketplace.ts .claude-plugin/marketplace.json`

### Adding an External Plugin to the Marketplace

Add an entry to `.claude-plugin/marketplace.json` with `source` pointing to the external git repo or subdirectory, maintaining alphabetical sort order.

### Testing a Plugin Locally

```bash
cc --plugin-dir /path/to/plugin
```

No packaging or restart required — changes to plugin files are picked up automatically.

### Installing a Plugin

```bash
cc /plugin install {plugin-name}@claude-plugins-official
```

Or browse available plugins via `/plugin > Discover` in Claude Code.

### Validating All Changes Before Push

```bash
bun .github/scripts/validate-marketplace.ts .claude-plugin/marketplace.json
bun .github/scripts/check-marketplace-sorted.ts
bun .github/scripts/validate-frontmatter.ts <changed-frontmatter-files>
```

## Troubleshooting CI Failures

**"Marketplace is not sorted alphabetically"** — Auto-fix with:
```bash
bun .github/scripts/check-marketplace-sorted.ts --fix
```

**"Duplicate plugin name in marketplace.json"** — Two entries share the same `name`. Each plugin name must be unique across the entire marketplace, including between `plugins/` and `external_plugins/`.

**"Missing required field: description"** in frontmatter — The YAML frontmatter block must be delimited by `---\n` on its own lines at the very top of the file. A missing opening or closing delimiter will cause the parser to skip validation. For skills, either `description` or `when_to_use` satisfies the requirement.

**"YAML parse error"** in frontmatter — A value contains an unquoted special character. Quote the value with double quotes, especially for descriptions starting with `*`, `&`, `#`, `!`, `|`, `>`, `%`, `@`, or containing `{}`, `[]`, or `:` followed by a space.

**"External PR closed automatically"** — The `close-external-prs.yml` workflow closes PRs from users without write/admin access. External contributors must use the [plugin directory submission form](https://clau.de/plugin-directory-submission) instead.

## Additional Resources

- [Official Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [Plugin Directory Submission Form](https://clau.de/plugin-directory-submission) (for external contributors)
