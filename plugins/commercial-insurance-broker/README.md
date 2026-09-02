# Commercial Insurance Broker

Guided workflows for commercial property and casualty (P&C) brokerage work:
intake, marketing, quoting, proposals, binding, policy checking, certificates,
contract insurance review, endorsements, renewals, claims, broker of record,
premium audits, cancellations, and exposure-schedule cleanup.

## What It Does

Use when producing broker work product for a commercial account. The plugin
routes the request to a structured checklist, then drafts the next artifact
(intake memo, submission summary, quote comparison, bind checklist, COI draft,
contract gap table, schedule data-quality report, and similar).

This plugin does not bind coverage, issue certificates, or give licensed
insurance advice. A licensed producer must review carrier forms, surplus-lines
rules, and agency procedures before anything is sent to a client or market.

## Usage

Install:

```text
/plugin install commercial-insurance-broker@claude-plugins-official
```

Ask in natural language:

```text
run new-business intake for this contractor
compare these three GL quotes
review this GC insurance exhibit
policy-check this issued package against the binder
draft a COI with additional insured wording
clean up this vehicle CSV for the auto submission
```

Or invoke a specific workflow:

```text
/broker-workflow intake
/broker-workflow contract-review
/broker-workflow quotes
/broker-workflow schedules
```

Supported workflow names: `intake`, `submission`, `quotes`, `proposal`,
`bind`, `policy-check`, `coi`, `contract-review`, `endorsement`, `renewal`,
`claims`, `loss-runs`, `bor`, `audit`, `cancellation`, `schedules`.

## Layout

- `skills/` — model-invoked broker skill and `/broker-workflow`
- `agents/broker-producer.md` — autonomous producer work-product agent
- `references/` — checklists, lines, ACORD data, contracts, schedules, templates
- `examples/` — sample memo and quote-matrix shape (fictional)

## References

- `references/coverage-lines.md` — common commercial lines and typical asks
- `references/acord-and-data.md` — application and submission data to collect
- `references/workflows.md` — step-by-step checklists for each workflow
- `references/contract-requirements.md` — insurance-exhibit mapping
- `references/schedules-and-exports.md` — CSV / AMS export handling
- `references/artifact-templates.md` — draft memo and email outlines
