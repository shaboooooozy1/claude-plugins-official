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
- **`plugins/plugin-dev`** — Comprehensive plugin development toolkit with 7 skills and full documentation

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

### .mcp.json Format

```json
{
  "server-name": {
    "type": "http",
    "url": "https://example.com/mcp",
    "oauth": {
      "clientId": "...",
      "callbackPort": 3118
    }
  }
}
```

### hooks.json Format

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

## CI/CD & Validation

All CI runs on **Bun** runtime. Three GitHub Actions workflows enforce quality:

### 1. Frontmatter Validation (`validate-frontmatter.yml`)

Triggered on changes to `**/agents/*.md`, `**/skills/*/SKILL.md`, `**/commands/*.md`.

Validation rules:
- **Agents**: Must have `name` (string) and `description` (string)
- **Skills**: Must have `description` or `when_to_use`
- **Commands**: Must have `description` (string)

YAML special characters (`* & # ! | > % @ {} []`) must be quoted in frontmatter values.

Run locally:
```bash
bun .github/scripts/validate-frontmatter.ts <file1> [file2...]
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

## Additional Resources

- [Official Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [Plugin Directory Submission Form](https://clau.de/plugin-directory-submission) (for external contributors)
