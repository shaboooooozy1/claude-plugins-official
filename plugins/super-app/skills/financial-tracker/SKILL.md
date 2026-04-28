---
name: financial-tracker
description: "This skill should be used when the user asks about \"market news\", \"financial analysis\", \"stock market\", \"market sentiment\", \"economic outlook\", \"investment\", \"trading\", \"sector performance\", \"earnings\", or wants real-time financial market intelligence and analysis."
version: 1.0.0
---

# Financial Tracker

Fetch and analyze real-time financial news, market sentiment, and economic data using the Perplexity Sonar API.

## Approach

1. **Identify the financial query**: Determine whether the user wants market overview, sector analysis, specific stock/asset tracking, or economic indicator review.

2. **Fetch real-time data**: Run the Sonar search script:
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
     --query "[financial query with specific tickers, sectors, or topics]" \
     --system-prompt "You are a financial analyst. Provide current market data, news, and analysis. Include specific numbers, percentages, and trends. Cite sources. Structure output as: Market Sentiment, Key Drivers, Risks, Opportunities, and Actionable Insights." \
     --model sonar-pro
   ```

3. **Analyze and structure results**:
   - **Market Sentiment**: BULLISH / BEARISH / NEUTRAL with reasoning
   - **Key Drivers**: Top factors moving the market
   - **Risks**: Current and emerging risks
   - **Opportunities**: Potential areas of interest
   - **News Items**: Ranked by impact (HIGH/MEDIUM/LOW)

4. **Present findings** with source citations and timestamps for data freshness.

## Environment Requirements

The `PPLX_API_KEY` environment variable must be set. Install dependencies: `pip install -r ${CLAUDE_PLUGIN_ROOT}/scripts/requirements.txt`

## Integration with MCP Tools

- **Notion**: Save market analysis to a Notion database for tracking over time
- **Gmail**: Send market briefs to recipients
- **Google Calendar**: Schedule recurring market review sessions
- **HubSpot CRM**: Cross-reference market data with client portfolios
