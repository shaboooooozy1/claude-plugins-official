---
description: Create a new CHANGELOG.md at the repository root using the Keep a Changelog template
allowed-tools: [Read, Glob, Write, Bash]
---

# /changelog-init

Scaffold a new `CHANGELOG.md` at the repository root following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## Instructions

1. Determine the repository root. Prefer `git rev-parse --show-toplevel`; if that fails, fall back to the current working directory.
2. Check whether a `CHANGELOG.md` (case-insensitive: also `CHANGELOG.markdown`, `HISTORY.md`) already exists at the root.
   - If one exists, do **not** overwrite it. Report its path to the user and stop.
3. Otherwise create `CHANGELOG.md` at the repository root with exactly the following content:

   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
   and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

   ## [Unreleased]
   ```

4. Confirm to the user with the relative path of the file that was created and remind them they can now use `/changelog-add <type> <message>` to record changes.
