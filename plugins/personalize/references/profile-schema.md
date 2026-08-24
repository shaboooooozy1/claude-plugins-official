# Personalization Profile Schema

The personalization profile lives at `.claude/personalize.local.md` in the
project root. It consists of YAML frontmatter followed by optional Markdown.

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `enabled` | boolean | yes | Enables or disables session injection |
| `language` | string | no | Preferred response language |
| `tone` | string | no | Communication tone, such as `direct` or `friendly` |
| `verbosity` | string | no | Desired response detail, such as `concise` |
| `stack` | string | no | Primary languages, frameworks, and infrastructure |
| `test_preference` | string | no | Expected test scope and methodology |
| `commit_style` | string | no | Preferred commit-message convention |

Unknown fields are preserved but are not guaranteed special handling.

## Example

```markdown
---
enabled: true
language: English
tone: direct and collaborative
verbosity: concise
stack: TypeScript, React, PostgreSQL
test_preference: test changed behavior and edge cases
commit_style: conventional commits
---

# Custom Rules

- Explain architectural trade-offs before large changes.
- Prefer small, focused commits.
```

## Storage Guidance

- Keep the profile local by adding `.claude/personalize.local.md` to the
  project's `.gitignore`.
- Do not store credentials, secrets, or sensitive personal information.
- Use the Markdown body only for durable instructions that do not fit the
  structured fields.
