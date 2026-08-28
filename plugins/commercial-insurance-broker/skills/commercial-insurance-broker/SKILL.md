---
name: commercial-insurance-broker
description: "This skill should be used when the user asks to run commercial insurance broker work, new-business intake, market submissions, quote comparisons, bind checklists, policy checking, certificates of insurance, contract insurance exhibits, endorsements, renewals, FNOL, claims, broker of record, premium audits, cancellations, or schedule/CSV exposure files for commercial P&C accounts."
---

# Commercial Insurance Broker Workflows

Run structured commercial P&C brokerage work. Produce the next broker artifact.
Do not invent bound coverage, premiums, or form numbers.

## Guardrails

- Treat output as draft work product for a licensed producer.
- Flag missing facts instead of filling them with plausible values.
- Separate known facts, assumptions, and open questions.
- Call out surplus-lines, non-admitted, and subjectivities when relevant.
- Never fabricate ACORD answers, loss runs, or carrier quotes.

Load `${CLAUDE_PLUGIN_ROOT}/references/workflows.md` for the selected workflow.
Load `${CLAUDE_PLUGIN_ROOT}/references/coverage-lines.md` when choosing lines.
Load `${CLAUDE_PLUGIN_ROOT}/references/acord-and-data.md` for intake and submissions.
Load `${CLAUDE_PLUGIN_ROOT}/references/contract-requirements.md` for insurance exhibits.
Load `${CLAUDE_PLUGIN_ROOT}/references/schedules-and-exports.md` for CSV or AMS exports.
Load `${CLAUDE_PLUGIN_ROOT}/references/artifact-templates.md` when drafting emails or memos.

## Route the request

| User intent | Workflow |
|---|---|
| new account, qualification, missing info | `intake` |
| market list, submission package, underwriter email | `submission` |
| quote comparison, coverage gaps | `quotes` |
| client proposal or RFP response | `proposal` |
| bind order, subjectivities, binder review | `bind` |
| issued policy vs quote/binder | `policy-check` |
| certificate, additional insured, waiver of subrogation | `coi` |
| contract exhibit, insurance requirements | `contract-review` |
| mid-term change, add location/vehicle/named insured | `endorsement` |
| expiration, remarket, stewardship | `renewal` |
| FNOL, claim notice, coverage investigation | `claims` |
| loss history request or summary | `loss-runs` |
| broker of record | `bor` |
| premium audit, payroll audit | `audit` |
| cancellation, non-renewal, rewrite | `cancellation` |
| SOV, vehicle, driver, payroll, or claims CSV | `schedules` |

If the workflow is unclear, ask one clarifying question, then proceed.

## Standard output shape

1. **Account snapshot** — named insured, operations, geographies, lines in play.
2. **Facts vs gaps** — collected data, then blocking missing items.
3. **Recommended next action** — who needs to do what, and in what order.
4. **Draft artifact** — email, checklist, comparison table, or memo.
5. **Compliance notes** — surplus lines, subjectivities, form-to-verify items.

Use tables for quote, policy, contract, and schedule comparisons. Use
checklists for intake, bind, audit, and COI requests.

## Artifact rules

- Label every premium, limit, deductible, and form ID as `stated` or `unverified`.
- Prefer carrier, wholesale, and AMS/CRM source documents over memory.
- When comparing quotes, align limit, deductible, form edition, and exclusions
  on the same row.
- For certificates, draft requested wording and list what the policy must
  actually contain before the certificate is issued.
- For spreadsheets, classify the export and report data quality before marketing.
