---
name: knowledge-lookup
description: "This skill should be used when the user asks for an \"interesting fact about\", \"tell me about\", \"what is\", \"explain\", \"how does\", \"daily knowledge\", \"learn about\", or wants on-demand knowledge retrieval on any general topic with real-time sourcing."
version: 1.0.0
---

# Knowledge Lookup

Retrieve and present knowledge on any topic using the Perplexity Sonar API for real-time, sourced information retrieval.

## Approach

1. **Identify the knowledge domain**: Determine the topic area and depth of information needed.

2. **Fetch real-time knowledge**:
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
     --query "[topic or question]" \
     --system-prompt "You are a knowledgeable educator. Provide accurate, well-sourced information that is engaging and informative. Include interesting details and context. Cite your sources." \
     --model sonar
   ```

3. **Present information** in an engaging, accessible format:
   - Key facts and context
   - Interesting details or surprising findings
   - Historical background where relevant
   - Source citations for verification

4. **Offer follow-up directions**: Suggest related topics or deeper questions the user might explore.

## Environment Requirements

The `PPLX_API_KEY` environment variable must be set. Install dependencies: `pip install -r ${CLAUDE_PLUGIN_ROOT}/scripts/requirements.txt`

## Integration with MCP Tools

- **Notion**: Save interesting findings to a knowledge base in Notion
- **Google Calendar**: Schedule daily learning sessions
