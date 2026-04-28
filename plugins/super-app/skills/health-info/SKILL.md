---
name: health-info
description: "This skill should be used when the user asks about \"health information\", \"disease\", \"symptoms\", \"medical condition\", \"treatment options\", \"medication\", \"diagnosis\", or needs health and medical information lookup with appropriate disclaimers."
version: 1.0.0
---

# Health Information Lookup

Retrieve health and medical information using the Perplexity Sonar API, providing well-sourced answers with appropriate medical disclaimers.

## Approach

1. **Identify the health query**: Determine whether the user needs information about symptoms, conditions, treatments, medications, or general health topics.

2. **Fetch medical information**:
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/sonar_search.py \
     --query "[health/medical question]" \
     --system-prompt "You are a health information specialist. Provide accurate, well-sourced medical information from reputable sources (NIH, WHO, Mayo Clinic, peer-reviewed journals). Always include appropriate disclaimers. Distinguish between established medical consensus and emerging research." \
     --model sonar-pro
   ```

3. **Structure the response**:
   - Clear, accessible explanation of the topic
   - Key facts from authoritative medical sources
   - Source citations (prioritizing medical authorities)

4. **Always include disclaimer**: Remind the user that this information is for educational purposes and does not replace professional medical advice. Recommend consulting a healthcare provider for personal medical decisions.

## Environment Requirements

The `PPLX_API_KEY` environment variable must be set. Install dependencies: `pip install -r ${CLAUDE_PLUGIN_ROOT}/scripts/requirements.txt`

## Integration with MCP Tools

- **Notion**: Save health research to a personal health knowledge base
