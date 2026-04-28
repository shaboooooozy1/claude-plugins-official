---
name: fact-check
description: "Quickly verify a claim or article URL for accuracy using real-time web search"
argument-hint: "<claim-or-url>"
allowed-tools: [Read, Glob, Grep, Bash]
---

# Quick Fact Check

Verify a specific claim or article for accuracy using real-time web evidence.

## Arguments

The user invoked this with: $ARGUMENTS

The argument is either:
- A **claim/statement** to verify (e.g., "The Earth's population exceeded 8 billion in 2022")
- A **URL** to an article to fact-check

## Workflow

### Step 1: Identify Claims
- If a direct claim: use it as-is
- If a URL: note the URL for the user and ask them to paste the article text or key claims, since the search script cannot fetch URLs directly

### Step 2: Verify with Real-Time Search
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
  --query "Fact check: [claim]. Is this accurate? Provide specific evidence for or against this claim from reliable sources." \
  --system-prompt "You are a professional fact-checker. Evaluate the following claim against current evidence. Provide a clear verdict (TRUE, FALSE, MISLEADING, or UNVERIFIABLE) with specific supporting evidence and source citations." \
  --model sonar-pro
```

### Step 3: Present Verdict
Format the result as:
- **Claim**: The statement being checked
- **Verdict**: TRUE / FALSE / MISLEADING / UNVERIFIABLE
- **Evidence**: Key evidence supporting the verdict
- **Sources**: Cited sources from the search
- **Context**: Any important nuance or caveats
