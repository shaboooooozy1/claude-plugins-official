"""Shared error handling for the Semantic Scholar MCP server."""

from __future__ import annotations

import httpx


class SemanticScholarError(Exception):
    """Base error for Semantic Scholar operations."""


class MissingApiKeyError(SemanticScholarError):
    """Raised when an endpoint requires an API key that is not configured."""


def handle_api_error(exc: Exception) -> str:
    if isinstance(exc, MissingApiKeyError):
        return (
            "Error: This endpoint requires a Semantic Scholar API key. "
            "Set the SEMANTIC_SCHOLAR_API_KEY environment variable and "
            "restart the server. Request a key at "
            "https://www.semanticscholar.org/product/api#api-key"
        )
    if isinstance(exc, httpx.HTTPStatusError):
        status = exc.response.status_code
        if status == 400:
            return f"Error: Bad request (400). Response: {_truncate(exc.response.text)}"
        if status == 401:
            return "Error: Unauthorized (401). Your SEMANTIC_SCHOLAR_API_KEY appears invalid."
        if status == 403:
            return "Error: Forbidden (403). This resource is not accessible."
        if status == 404:
            return "Error: Resource not found (404). Double-check the paper or author ID."
        if status == 429:
            return "Error: Rate limit exceeded (429). Wait and retry. Set SEMANTIC_SCHOLAR_API_KEY for higher throughput."
        if 500 <= status < 600:
            return f"Error: Upstream server error ({status}). Retry shortly."
        return f"Error: API returned HTTP {status}. Response: {_truncate(exc.response.text)}"
    if isinstance(exc, httpx.TimeoutException):
        return "Error: Request timed out. Retry or reduce the requested limit."
    if isinstance(exc, httpx.RequestError):
        return f"Error: Network error: {exc!r}"
    if isinstance(exc, ValueError):
        return f"Error: {exc}"
    return f"Error: Unexpected {type(exc).__name__}: {exc}"


def _truncate(text: str, limit: int = 300) -> str:
    text = text.strip()
    return text if len(text) <= limit else text[:limit] + "..."
