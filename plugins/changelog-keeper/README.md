# Changelog Keeper

Create and maintain `CHANGELOG.md` files following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) convention and [Semantic Versioning](https://semver.org/).

## What this plugin provides

- A model-invoked **skill** that gives Claude consistent guidance on how to read, edit, and reason about `CHANGELOG.md` files.
- Three **slash commands** that handle the most common changelog workflows:
  - `/changelog-init` — scaffold a new `CHANGELOG.md` in the repository.
  - `/changelog-add` — add an entry to the `[Unreleased]` section.
  - `/changelog-release` — promote `[Unreleased]` into a versioned release.

## Commands

### `/changelog-init`

Creates a `CHANGELOG.md` at the repository root if one does not already exist, using the standard Keep a Changelog header and an empty `[Unreleased]` section with the canonical change-type subsections.

### `/changelog-add <type> <message>`

Appends an entry to the `[Unreleased]` section under the appropriate change-type heading. `<type>` must be one of:

- `added` — new features
- `changed` — changes in existing functionality
- `deprecated` — soon-to-be removed features
- `removed` — now-removed features
- `fixed` — bug fixes
- `security` — vulnerability fixes

Example:

```
/changelog-add added Support for HTTP/2 in the API client
/changelog-add fixed Race condition when closing the connection pool
```

### `/changelog-release <version> [date]`

Renames the current `[Unreleased]` section to `[<version>] - <date>` (date defaults to today, ISO 8601), creates a fresh empty `[Unreleased]` section above it, and updates the comparison links at the bottom of the file when present.

`<version>` should be a valid Semantic Version such as `1.4.0` or `2.0.0-rc.1`.

## Skill

The bundled `changelog-keeper` skill activates whenever the user mentions changelogs, release notes, "what changed", or asks Claude to summarize work for a release. It teaches Claude to:

- Preserve the existing changelog structure and link references.
- Group entries into the standard Keep a Changelog categories.
- Write entries in the imperative mood, focused on user-visible impact.
- Avoid duplicating entries already present under `[Unreleased]`.

## Layout

```
changelog-keeper/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── changelog-add.md
│   ├── changelog-init.md
│   └── changelog-release.md
├── skills/
│   └── changelog-keeper/
│       └── SKILL.md
└── README.md
```
