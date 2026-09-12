---
name: changelog-keeper
description: This skill should be used when the user asks to update, edit, summarize, or generate a CHANGELOG.md or release notes, mentions "Keep a Changelog", asks "what changed since the last release", or requests help drafting entries for an upcoming version. Provides conventions for maintaining changelog files in the Keep a Changelog format.
version: 1.0.0
---

# Changelog Keeper

Guidance for reading, editing, and writing `CHANGELOG.md` files that follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) convention together with [Semantic Versioning](https://semver.org/).

## When this skill applies

Activate this skill when the user's request involves:

- Creating, editing, or reviewing a `CHANGELOG.md` (or similarly named) file.
- Drafting release notes for an upcoming version.
- Promoting an `[Unreleased]` section into a tagged release.
- Summarizing recent commits, pull requests, or work into changelog entries.

## File structure

A standard Keep a Changelog file looks like this:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ...

### Changed
- ...

## [1.2.0] - 2025-03-14

### Added
- ...

[Unreleased]: https://github.com/owner/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/owner/repo/compare/v1.1.0...v1.2.0
```

Always preserve:

- The top-level `# Changelog` heading and the introductory blurb if present.
- The `[Unreleased]` section at the top, even when empty.
- Any link reference definitions at the bottom of the file.

## Change-type categories

Group entries under exactly these subsections, in this order, omitting any that are empty:

| Subsection      | Use for                                       |
| --------------- | --------------------------------------------- |
| `### Added`     | New features.                                 |
| `### Changed`   | Changes to existing functionality.            |
| `### Deprecated`| Features marked for future removal.           |
| `### Removed`   | Features that have been removed.              |
| `### Fixed`     | Bug fixes.                                    |
| `### Security`  | Vulnerability fixes or hardening changes.     |

Do not invent additional categories (e.g. `### Internal`, `### Misc`). Map such items to one of the categories above or omit them.

## Writing entries

- Write each entry as a single bullet starting with a capital letter and using the imperative mood ("Add", "Fix", "Remove"). The verb may be omitted when the line reads naturally as a noun phrase ("Support for HTTP/2 in the API client").
- Focus on user-visible impact, not implementation details. Prefer "Fix crash when opening empty projects" over "Add null check in `Project::open`".
- Keep entries terse — one line each whenever possible. Wrap long entries with a sub-bullet for additional context.
- Reference issues or pull requests in parentheses when helpful, e.g. `(#1234)`.
- Do **not** duplicate an entry that already exists in `[Unreleased]`. Update the existing entry instead if it needs more detail.

## Cutting a release

When promoting `[Unreleased]` to a versioned release:

1. Choose a version number that follows SemVer based on the kinds of entries present (`Removed`/breaking `Changed` → major; `Added`/`Deprecated` → minor; only `Fixed`/`Security` → patch).
2. Replace the `## [Unreleased]` heading with `## [<version>] - <YYYY-MM-DD>` using today's date.
3. Insert a fresh empty `## [Unreleased]` section above it that contains no subsections (they will be added back as entries are recorded).
4. If link reference definitions exist at the bottom:
   - Update the `[Unreleased]` link to compare `v<version>...HEAD`.
   - Add a new `[<version>]` link comparing the previous version to `v<version>`.
5. Never delete or rewrite historical release sections.

## Reading a changelog for context

When the user asks "what changed since version X", read the relevant sections from the existing `CHANGELOG.md` first before falling back to git history. Trust the changelog as the curated source of truth; only supplement it with `git log` when the changelog is missing or out of date.

## Common pitfalls to avoid

- Editing or reordering historical release sections.
- Removing the `[Unreleased]` section entirely after a release.
- Mixing categories within a single bullet ("Added and fixed ...").
- Bumping the version inside the changelog without ensuring the project's version metadata (e.g. `package.json`, `pyproject.toml`, `Cargo.toml`) is updated separately if required by the project.
