#!/usr/bin/env python3
"""
Sonar Search - Reusable wrapper for the Perplexity Sonar API.

Provides real-time web search capabilities for fact-checking, research,
financial analysis, and general knowledge retrieval.

Usage:
  python sonar_search.py --query "your search query"
  python sonar_search.py --query "query" --model sonar-pro
  python sonar_search.py --query "query" --system-prompt "You are a fact checker"
  python sonar_search.py --query "query" --json-schema '{"type": "object", ...}'

Environment:
  PPLX_API_KEY - Perplexity API key (required)
"""

import argparse
import json
import os
import sys
from typing import Any, Dict, Optional

import requests
from requests.exceptions import RequestException


API_URL = "https://api.perplexity.ai/chat/completions"
DEFAULT_MODEL = "sonar-pro"
VALID_MODELS = ["sonar", "sonar-pro", "sonar-reasoning", "sonar-reasoning-pro"]


def get_api_key() -> str:
    """Get API key from environment variable."""
    api_key = os.environ.get("PPLX_API_KEY")
    if not api_key:
        print("Error: PPLX_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)
    return api_key


def search(
    query: str,
    model: str = DEFAULT_MODEL,
    system_prompt: Optional[str] = None,
    json_schema: Optional[Dict[str, Any]] = None,
    temperature: float = 0.2,
    max_tokens: int = 4096,
) -> Dict[str, Any]:
    """
    Execute a search query against the Perplexity Sonar API.

    Args:
        query: The search query or question.
        model: Sonar model to use.
        system_prompt: Optional system prompt to guide response style.
        json_schema: Optional JSON schema for structured output.
        temperature: Sampling temperature (0.0-1.0).
        max_tokens: Maximum response tokens.

    Returns:
        Dict with 'content' (response text), 'citations' (list of URLs),
        and 'model' (model used).
    """
    api_key = get_api_key()

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": query})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if json_schema and model in VALID_MODELS:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": {"schema": json_schema},
        }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        data = response.json()

        content = data["choices"][0]["message"]["content"]
        citations = data.get("citations", [])

        return {
            "content": content,
            "citations": citations,
            "model": data.get("model", model),
        }
    except RequestException as e:
        print(f"API request failed: {e}", file=sys.stderr)
        if hasattr(e, "response") and e.response is not None:
            print(f"Response: {e.response.text}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Search using Perplexity Sonar API")
    parser.add_argument("--query", "-q", required=True, help="Search query")
    parser.add_argument(
        "--model", "-m", default=DEFAULT_MODEL, choices=VALID_MODELS, help="Model to use"
    )
    parser.add_argument("--system-prompt", "-s", help="System prompt")
    parser.add_argument("--json-schema", help="JSON schema string for structured output")
    parser.add_argument("--temperature", "-t", type=float, default=0.2)
    parser.add_argument("--max-tokens", type=int, default=4096)

    args = parser.parse_args()

    json_schema = None
    if args.json_schema:
        json_schema = json.loads(args.json_schema)

    result = search(
        query=args.query,
        model=args.model,
        system_prompt=args.system_prompt,
        json_schema=json_schema,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
    )

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
