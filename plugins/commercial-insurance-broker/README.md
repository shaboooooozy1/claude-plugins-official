# Commercial Insurance Broker

Guided workflows for commercial property and casualty (P&C) brokerage work:
intake, marketing, quoting, binding, policy checking, certificates,
endorsements, renewals, and claims.

## What It Does

Use when producing broker work product for a commercial account. The plugin
routes the request to a structured checklist, then drafts the next artifact
(intake memo, submission summary, quote comparison, bind checklist, COI draft,
and similar).

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
policy-check this issued package against the binder
draft a COI with additional insured wording
```

Or invoke a specific workflow:

```text
/broker-workflow intake
/broker-workflow quotes
/broker-workflow policy-check
/broker-workflow coi
```

Supported workflow names: `intake`, `submission`, `quotes`, `bind`,
`policy-check`, `coi`, `endorsement`, `renewal`, `claims`.

## References

- `references/coverage-lines.md` — common commercial lines and typical asks
- `references/acord-and-data.md` — application and submission data to collect
- `references/workflows.md` — step-by-step checklists for each workflow
