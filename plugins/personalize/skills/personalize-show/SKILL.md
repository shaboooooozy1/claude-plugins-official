---
name: personalize-show
description: Display and summarize the active project personalization profile.
allowed-tools: ["Read"]
---

# Show Personalization Profile

Inspect `.claude/personalize.local.md` in the current project.

## Workflow

1. Read the profile when it exists.
2. State whether personalization is enabled.
3. Summarize each configured frontmatter preference.
4. Reproduce custom rules accurately without exposing unrelated file content.
5. Identify malformed or unsupported fields and point to
   `${CLAUDE_PLUGIN_ROOT}/references/profile-schema.md`.
6. When the file does not exist, explain that no profile is configured and
   suggest running `/personalize`.

Do not modify the profile.
