# Semantic Scholar MCP Plugin

An installable Claude Code plugin providing a comprehensive
[Semantic Scholar](https://www.semanticscholar.org/) MCP server with 18 tools
covering papers, authors, citations, recommendations, and datasets.

## Install

```bash
claude plugin add semantic-scholar-mcp
```

Or add manually to your MCP client config:

```json
{
  "mcpServers": {
    "semantic-scholar": {
      "command": "uvx",
      "args": ["semantic-scholar-mcp"],
      "env": {
        "SEMANTIC_SCHOLAR_API_KEY": "..."
      }
    }
  }
}
```

## Configuration

| Env var | Required? | Description |
| --- | --- | --- |
| `SEMANTIC_SCHOLAR_API_KEY` | No | Raises rate limits. Required for `s2_get_dataset_download_links`. |

## Tools

18 tools prefixed `s2_` covering paper search, paper details, authors,
recommendations, datasets, and identifier resolution.
