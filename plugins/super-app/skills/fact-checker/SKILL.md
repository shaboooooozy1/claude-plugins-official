---
name: fact-checker
description: "This skill should be used when the user asks to \"fact check\", \"verify a claim\", \"is this true\", \"check accuracy\", \"debunk\", \"validate statement\", or wants to verify the truthfulness of a statement, article, or claim using real-time web search."
version: 1.0.0
---

# Fact Checker

Verify claims, statements, or articles for accuracy using the Perplexity Sonar API for real-time web search and evidence gathering.

## Approach

1. **Extract claims**: Identify the specific factual claims to verify from the user's input. If given a URL or article text, break it into individual checkable claims.

2. **Search for evidence**: Run the Sonar search script to find real-time evidence for each claim:
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
     --query "Is it true that [specific claim]? Provide evidence and sources." \
     --system-prompt "You are a rigorous fact-checker. Evaluate claims against current evidence. Cite specific sources. Rate each claim as TRUE, FALSE, MISLEADING, or UNVERIFIABLE." \
     --model sonar-pro
   ```

3. **Rate each claim** using these categories:
   - **TRUE** — Supported by multiple reliable sources
   - **FALSE** — Contradicted by reliable evidence
   - **MISLEADING** — Contains truth but presented in a deceptive way
   - **UNVERIFIABLE** — Insufficient evidence to determine

4. **Synthesize results**: Provide an overall assessment with:
   - Individual claim verdicts with explanations
   - Source citations from the Sonar API response
   - Overall reliability rating (MOSTLY TRUE / MIXED / MOSTLY FALSE)

## Environment Requirements

The `PPLX_API_KEY` environment variable must be set. Install dependencies: `pip install -r ${CLAUDE_PLUGIN_ROOT}/scripts/requirements.txt`

## Integration with MCP Tools

- **Notion**: Save fact-check reports to a Notion page for archiving
- **Gmail**: Email fact-check results to stakeholders
