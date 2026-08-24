---
name: broker-workflow
description: Run a named commercial insurance broker workflow and draft the next work product.
argument-hint: "<intake|submission|quotes|bind|policy-check|coi|endorsement|renewal|claims> [account notes]"
---

# Broker Workflow

Run the named commercial P&C workflow from `$ARGUMENTS`.

## Steps

1. Parse the first token as the workflow name. Remaining text is account context.
2. If the name is missing or invalid, ask which workflow to run from:
   `intake`, `submission`, `quotes`, `bind`, `policy-check`, `coi`,
   `endorsement`, `renewal`, `claims`.
3. Load `${CLAUDE_PLUGIN_ROOT}/references/workflows.md` and follow that
   workflow's checklist.
4. Load `${CLAUDE_PLUGIN_ROOT}/references/coverage-lines.md` and
   `${CLAUDE_PLUGIN_ROOT}/references/acord-and-data.md` when the checklist
   calls for them.
5. Follow the output shape and guardrails in
   `${CLAUDE_PLUGIN_ROOT}/skills/commercial-insurance-broker/SKILL.md`.
6. Produce one primary draft artifact plus blocking gaps.

Do not skip missing-data collection. Do not present drafts as issued documents.
