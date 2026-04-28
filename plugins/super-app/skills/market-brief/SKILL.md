---
name: market-brief
description: "Generate a financial market briefing on a topic, sector, or asset with real-time data and optional Notion/Gmail/Calendar integration"
argument-hint: "<topic-or-ticker> [--save-notion] [--email <address>] [--schedule-review]"
allowed-tools: [Read, Glob, Grep, Bash, Agent]
---

# Market Brief Generator

Generate a concise financial market briefing with real-time data and analysis.

## Arguments

The user invoked this with: $ARGUMENTS

Parse the arguments:
- **topic-or-ticker** (required): Market topic, sector, or stock ticker
- **--save-notion** (optional): Save the brief to Notion
- **--email** (optional): Email the brief to the specified address
- **--schedule-review** (optional): Create a calendar event to review the analysis

## Workflow

### Step 1: Gather Market Intelligence
Run Sonar searches for current market data:
```bash
python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
  --query "Current market analysis for [topic]: price action, key news, analyst sentiment, upcoming catalysts" \
  --system-prompt "You are a financial market analyst. Provide current, specific market data including prices, percentages, volumes where relevant. Include analyst ratings and price targets. Cite financial news sources." \
  --model sonar-pro
```

### Step 2: Compile Market Brief
Structure the brief:
1. **Market Snapshot** — Current state with key numbers
2. **Sentiment** — BULLISH / BEARISH / NEUTRAL with reasoning
3. **Key Drivers** — What is moving the market
4. **Risk Factors** — Current and emerging risks
5. **Opportunities** — Potential areas of interest
6. **Outlook** — Short-term and medium-term expectations
7. **Sources** — Citation list

### Step 3: Optional Integrations
- If `--save-notion`, use Notion MCP tools to save the brief as a database entry
- If `--email`, use Gmail MCP tools to draft the brief as an email
- If `--schedule-review`, use Google Calendar MCP tools to create a review event for tomorrow

### Step 4: Present Results
Display the formatted brief to the user.
