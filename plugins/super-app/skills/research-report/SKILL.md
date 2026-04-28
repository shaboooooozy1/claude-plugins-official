---
name: research-report
description: "Generate a comprehensive research report on a topic using real-time web search, with optional Notion save and Gmail sharing"
argument-hint: "<topic> [--save-notion] [--email <address>]"
allowed-tools: [Read, Glob, Grep, Bash, Agent]
---

# Research Report Generator

Generate a comprehensive, citation-rich research report on the provided topic.

## Arguments

The user invoked this with: $ARGUMENTS

Parse the arguments:
- **topic** (required): The research topic or question
- **--save-notion** (optional): Save the report to Notion
- **--email** (optional): Email the report summary to the specified address

## Workflow

### Step 1: Decompose Topic
Break the topic into 3-5 specific research sub-questions for thorough coverage.

### Step 2: Execute Research
For each sub-question, run a Sonar search:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
  --query "[sub-question]" \
  --system-prompt "You are a senior research analyst. Provide detailed, well-sourced findings. Include data points, statistics, and expert opinions. Cite all sources." \
  --model sonar-pro
```

### Step 3: Compile Report
Synthesize all search results into a structured report:
1. **Executive Summary** (2-3 paragraphs)
2. **Key Findings** (organized by theme)
3. **Detailed Analysis** (section per sub-question)
4. **Conclusions and Implications**
5. **Sources** (numbered citation list)

### Step 4: Optional Integrations
- If `--save-notion` was specified, use the Notion MCP tools to create a new page with the report content
- If `--email` was specified, use the Gmail MCP tools to draft an email with the executive summary and a note that the full report is available

### Step 5: Present Results
Display the full report to the user with clear formatting and citations.
