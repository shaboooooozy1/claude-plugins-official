# Super App Plugin

Unified super app plugin for Claude Code that combines real-time web search capabilities (powered by the Perplexity Sonar API) with productivity integrations for a seamless research-to-action workflow.

## Features

### Skills (Model-Invoked)
- **fact-checker** — Verify claims and statements using real-time web evidence
- **financial-tracker** — Real-time market analysis, sentiment, and financial news
- **research-finder** — Deep research with citations and source synthesis
- **knowledge-lookup** — On-demand knowledge retrieval on any topic
- **health-info** — Medical and health information lookup with disclaimers

### Commands (User-Invoked)
- `/research-report <topic>` — Generate a full research report with optional Notion save and Gmail sharing
- `/market-brief <topic>` — Financial market briefing with optional integrations
- `/fact-check <claim>` — Quick fact verification with structured verdicts

### Agents
- **research-orchestrator** — Autonomous multi-step research: search, synthesize, save to Notion, create presentations, email summaries
- **market-analyst** — Financial intelligence: market analysis, CRM enrichment, briefing distribution

## Setup

### Required
- `PPLX_API_KEY` environment variable set to your Perplexity API key

### Install Dependencies
```bash
pip install -r scripts/requirements.txt
```

### MCP Integrations (Optional)
The plugin works with these MCP integrations when available:
- **Notion** — Save reports and research to Notion pages
- **Gmail** — Email summaries and briefings
- **Google Calendar** — Schedule review events and reminders
- **HubSpot CRM** — Enrich company and contact records with research
- **Gamma** — Generate presentations from research findings
- **Hugging Face** — Search for relevant ML models and papers
- **Canva** — Create visual content from research
- **Figma** — Design system documentation

## Usage

Install the plugin:
```bash
cc /plugin install super-app@claude-plugins-official
```

Or test locally:
```bash
cc --plugin-dir /path/to/plugins/super-app
```

## License

Apache 2.0
