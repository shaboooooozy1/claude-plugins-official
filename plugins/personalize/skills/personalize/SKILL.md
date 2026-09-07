---
name: personalize
description: Create or update a project-specific Claude Code personalization profile through a guided interview.
argument-hint: "[preferences to apply]"
allowed-tools: ["Read", "Write", "AskUserQuestion"]
---

# Personalize Claude Code

Create or update `.claude/personalize.local.md` in the current project.

## Workflow

1. Read `.claude/personalize.local.md` when it exists.
2. Treat `$ARGUMENTS` as requested preferences and use them to prefill the
   interview.
3. Ask concise questions for any preference not supplied:
   - response language
   - communication tone
   - verbosity
   - primary technology stack
   - testing preference
   - commit message style
   - optional custom rules
4. Confirm the proposed profile before writing it.
5. Create the `.claude` directory when needed.
6. Write valid YAML frontmatter using the schema in
   `${CLAUDE_PLUGIN_ROOT}/references/profile-schema.md`.
7. Preserve existing values when the user skips a question.
8. Preserve the existing markdown body unless new custom rules are explicitly
   supplied.
9. Recommend adding `.claude/personalize.local.md` to `.gitignore` when it is
   not already ignored. Do not modify `.gitignore` without confirmation.
10. Report the saved path and note that the profile applies on the next
    session start.

## Writing Rules

- Always include `enabled: true` for a newly created profile.
- Quote YAML strings containing special characters.
- Store simple preferences in frontmatter and free-form instructions under a
  `# Custom Rules` heading.
- Avoid recording secrets, credentials, personal identifiers, or unrelated
  project state.
- Keep the profile focused on durable working preferences rather than a
  single task.
