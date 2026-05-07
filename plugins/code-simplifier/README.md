# Code Simplifier

Agent that simplifies and refines code for clarity, consistency, and maintainability while preserving functionality.

## Structure

```
code-simplifier/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── agents/
│   └── code-simplifier.md       # Autonomous agent definition
└── LICENSE
```

## Usage

The `code-simplifier` agent is delegated to via the `Agent` tool with `subagent_type: "code-simplifier"`. It analyzes recently modified code and applies refinements that:

- Preserve exact functionality — only how the code does its job changes.
- Apply project standards from `CLAUDE.md` (module style, naming, return-type annotations, error handling).
- Reduce nesting, eliminate redundant abstractions, and improve names.
- Avoid over-cleverness — explicit code is preferred over dense one-liners and nested ternaries.

By default the agent scopes its work to code touched in the current session unless explicitly asked to review a wider area. See `agents/code-simplifier.md` for the full prompt and trigger contexts.
