# Personalize

Capture project-specific working preferences once and apply them automatically
in every Claude Code session.

## What It Does

- `/personalize` interviews the user about language, tone, verbosity, stack,
  testing, commit style, and custom rules.
- `/personalize-show` displays the active profile.
- A `SessionStart` hook adds the profile to Claude's context.

Preferences are stored in `.claude/personalize.local.md` in the current
project. The file is user-managed and intended to stay local rather than be
committed.

## Usage

Install the plugin:

```text
/plugin install personalize@claude-plugins-official
```

Create or update a profile:

```text
/personalize
```

Inspect the current profile:

```text
/personalize-show
```

To temporarily disable personalization, set `enabled: false` in the profile's
YAML frontmatter.

## Profile Example

```markdown
---
enabled: true
language: English
tone: direct
verbosity: concise
stack: TypeScript, React, PostgreSQL
test_preference: test changed behavior and edge cases
commit_style: conventional commits
---

# Custom Rules

- Explain architectural trade-offs before large changes.
- Prefer small, focused commits.
```

See `references/profile-schema.md` for the complete schema.
