# Session Report

Generate an explorable HTML report of Claude Code session usage — tokens, cache efficiency, subagents, skills, and the most expensive prompts — from local `~/.claude/projects` transcripts.

## Structure

```
session-report/
├── .claude-plugin/
│   └── plugin.json                   # Plugin metadata
├── skills/
│   └── session-report/
│       ├── SKILL.md                  # Model-invoked skill instructions
│       ├── analyze-sessions.mjs      # Transcript analyzer (Node)
│       └── template.html             # Self-contained HTML template
└── LICENSE
```

## Usage

The skill activates when the user asks for a session report (e.g. “generate a session report”, “which projects burned the most tokens this week”). It runs `analyze-sessions.mjs` to summarize the local Claude Code transcripts under `~/.claude/projects`, then fills in `template.html` with the JSON results plus 3–5 narrative findings.

Time ranges:

- Default: last 7 days (`--since 7d`).
- Other accepted ranges: `24h`, `30d`, `all` (omit `--since` for all-time).

The report is written to the current working directory as `session-report-YYYYMMDD-HHMM.html` and is fully self-contained — open it in any browser.

## Privacy

All analysis runs locally against transcripts on disk. No data leaves the machine.
