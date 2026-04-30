# Productivity Tracking

Track what you accomplish during Claude Code sessions. Set goals at the start, log tasks as you complete them, and get a time-on-task summary at any point.

## Commands

| Command | Description |
|---|---|
| `/productivity:start [goal1; goal2; ...]` | Start a new session with optional goals |
| `/productivity:log <task>` | Log a completed task |
| `/productivity:summary` | Show elapsed time, goals, and task log |

## How It Works

Sessions are stored as JSON at `~/.claude/productivity/active-session.json`. A Stop hook increments a turn counter each time Claude finishes responding, giving you a rough measure of how many exchanges the session took.

## Example

```
/productivity:start Build auth module; Write unit tests; Update API docs

→ Session started at 14:23 UTC
  Goals: Build auth module · Write unit tests · Update API docs

... (work happens) ...

/productivity:log Implemented JWT middleware
/productivity:log Added login and refresh endpoints
/productivity:log Wrote 12 unit tests

/productivity:summary

Session Summary
─────────────────────────────────
Started:   2025-04-30 14:23 UTC
Elapsed:   1h 8m
Turns:     14

Goals (3):
  · Build auth module
  · Write unit tests
  · Update API docs

Completed Tasks (3):
  14:31  Implemented JWT middleware
  14:45  Added login and refresh endpoints
  15:08  Wrote 12 unit tests
```

## License

Apache 2.0
