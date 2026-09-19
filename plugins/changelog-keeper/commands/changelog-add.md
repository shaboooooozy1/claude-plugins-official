---
description: Add an entry to the [Unreleased] section of CHANGELOG.md under the given Keep a Changelog category
argument-hint: <added|changed|deprecated|removed|fixed|security> <message>
allowed-tools: [Read, Glob, Edit, Write, Bash]
---

# /changelog-add

Add an entry to the `[Unreleased]` section of `CHANGELOG.md` under the appropriate Keep a Changelog category.

The user invoked this command with: `$ARGUMENTS`

## Instructions

1. Parse `$ARGUMENTS` into:
   - `type` — the first whitespace-separated token, lowercased.
   - `message` — the remainder of the argument string, trimmed.

   Valid `type` values are: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`.

   If `type` is missing, invalid, or `message` is empty, explain the expected usage (`/changelog-add <type> <message>`) and stop without modifying any files.

2. Locate `CHANGELOG.md` at the repository root (use `git rev-parse --show-toplevel` when available). If it does not exist, instruct the user to run `/changelog-init` first and stop.

3. Read the file and locate the `## [Unreleased]` heading.
   - If there is no `## [Unreleased]` section, insert one immediately after the introductory paragraph (or at the top if there is none) before continuing.

4. Within the `[Unreleased]` section, locate the matching `### <Type>` subsection (capitalize `type`, e.g. `### Added`).
   - If the subsection does not exist, insert it in the canonical order: Added, Changed, Deprecated, Removed, Fixed, Security. Insert it immediately before the next subsection that should come after it, or at the end of the `[Unreleased]` section if none follows.

5. Append the new entry as a single bullet `- <message>` at the end of that subsection.
   - Capitalize the first letter of `<message>` if it is not already.
   - Do **not** add a trailing period unless the message contains multiple sentences.
   - Skip the addition (and inform the user) if an identical bullet already exists in that subsection.

6. Save the file, preserving existing line endings and any link reference definitions at the bottom.

7. Report to the user a one-line summary of the change made, e.g. `Added under "Added": Support for HTTP/2 in the API client`.
