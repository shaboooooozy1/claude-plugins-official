# Security Guidance

Security reminder hook that warns about potential security issues when editing files — command injection, XSS, and other unsafe code patterns.

## Structure

```
security-guidance/
├── .claude-plugin/
│   └── plugin.json                  # Plugin metadata
├── hooks/
│   ├── hooks.json                   # Hook event configuration
│   └── security_reminder_hook.py    # Hook implementation (Python 3)
└── LICENSE
```

## Usage

Once the plugin is enabled, the hook runs automatically as a `PreToolUse` matcher on `Edit`, `Write`, and `MultiEdit` calls. Before each file modification it inspects the proposed change and surfaces a reminder when it spots patterns commonly associated with security risks (shell injection, unescaped HTML, unsafe deserialization, hardcoded secrets, etc.).

The hook is advisory — it does not block the tool call. It is intended to nudge the agent to fix insecure code immediately rather than after the fact.

Requires `python3` on `PATH`.
