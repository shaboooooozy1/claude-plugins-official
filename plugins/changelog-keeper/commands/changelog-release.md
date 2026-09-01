---
description: Promote the [Unreleased] section of CHANGELOG.md into a versioned release
argument-hint: <version> [YYYY-MM-DD]
allowed-tools: [Read, Glob, Edit, Write, Bash]
---

# /changelog-release

Promote the current `[Unreleased]` section of `CHANGELOG.md` into a versioned release block, then start a fresh empty `[Unreleased]` section above it.

The user invoked this command with: `$ARGUMENTS`

## Instructions

1. Parse `$ARGUMENTS` into:
   - `version` — the first whitespace-separated token (required). Strip a leading `v` if present.
   - `date` — the second token if provided; otherwise today's date in `YYYY-MM-DD` (use `date -u +%Y-%m-%d`).

   Validate that `version` looks like a Semantic Version (e.g. `1.2.3`, `2.0.0-rc.1`). If it does not, ask the user to confirm before continuing.

2. Locate `CHANGELOG.md` at the repository root. If it does not exist, instruct the user to run `/changelog-init` first and stop.

3. Read the file and find the `## [Unreleased]` heading.
   - If the `[Unreleased]` section is empty (no bullet entries under any subsection), tell the user there is nothing to release and stop without modifying the file.
   - If the requested `version` already appears as a heading in the file, stop and report the conflict — do not overwrite an existing release.

4. Transform the file as follows, in order, in a single edit:

   a. Replace the line `## [Unreleased]` with two sections:

      ```
      ## [Unreleased]

      ## [<version>] - <date>
      ```

      so that the previous `[Unreleased]` content (its `### Added`, `### Changed`, etc. subsections) now lives under the new `## [<version>] - <date>` heading, and the new `## [Unreleased]` section above it is empty.

   b. Remove any change-type subsections under the new empty `[Unreleased]` section — it must contain no `###` subsections until new entries are added.

5. Update link reference definitions at the bottom of the file if they exist.
   - Detect the comparison URL pattern from the existing `[Unreleased]` link (e.g. `https://github.com/owner/repo/compare/vPREV...HEAD`).
   - Update `[Unreleased]` to compare `v<version>...HEAD`.
   - Insert a new `[<version>]` link comparing the previous version tag to `v<version>`, placed immediately below the `[Unreleased]` link and above the next existing version link.
   - If no link references currently exist, do not invent a repository URL — leave the link section unchanged.

6. Save the file, preserving any other content and trailing newline.

7. Report to the user:
   - The new release heading that was created.
   - Whether link references were updated.
   - A reminder to update any other version metadata (e.g. `package.json`, `pyproject.toml`, `Cargo.toml`) and to tag the release in git when ready.
