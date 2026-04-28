---
name: research-finder
description: "This skill should be used when the user asks to \"research\", \"find papers\", \"literature review\", \"academic search\", \"deep dive into\", \"investigate\", \"survey the field\", or needs comprehensive research with citations on any topic."
version: 1.0.0
---

# Research Finder

Conduct deep research on any topic using the Perplexity Sonar API, producing comprehensive findings with citations and source analysis.

## Approach

1. **Decompose the research question**: Break broad topics into specific sub-queries for targeted searching.

2. **Execute multi-query research**: Run multiple Sonar searches to cover different angles:
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
     --query "[specific research sub-question]" \
     --system-prompt "You are a research assistant. Provide detailed, well-sourced information. Include academic papers, reports, and authoritative sources where available. Distinguish between established facts and emerging findings." \
     --model sonar-pro
   ```

3. **Synthesize across queries**: Combine results from multiple searches into a coherent narrative that:
   - Identifies key themes and consensus views
   - Notes areas of disagreement or ongoing debate
   - Highlights gaps in current knowledge
   - Provides a comprehensive citation list

4. **Structure the output**:
   - Executive Summary
   - Key Findings (organized by theme)
   - Detailed Analysis
   - Sources and Citations
   - Suggested Further Reading

## Environment Requirements

The `PPLX_API_KEY` environment variable must be set. Install dependencies: `pip install -r ${CLAUDE_PLUGIN_ROOT}/scripts/requirements.txt`

## Integration with MCP Tools

- **Notion**: Save research reports as structured Notion pages
- **Gamma**: Generate presentation slides from research findings
- **Gmail**: Share research summaries with collaborators
- **Hugging Face**: Search for relevant ML models or datasets related to the research topic
