# Project Notes

## Goal

Build a small Java MCP server that can search movie names and return matching links.

## Architecture

- `MovieIndexer`: Scrapes paginated list pages and extracts title + URL.
- `Database`: Stores records in SQLite and supports title search.
- `McpServer`: Implements MCP over stdio (`initialize`, `tools/list`, `tools/call`, `ping`).
- `Main`: Bootstraps database and starts MCP server.

## Tool Exposed

- `search_movie`
  - Input: `query` (required), `limit` (optional, default 10)
  - Output: text content and structured results list
- `refresh_index`
  - Input: `baseUrl` (optional), `pages` (optional, default 8)
  - Output: upsert summary and crawl parameters

## Run Modes

- MCP server startup does not run indexing.
- Server starts immediately and serves search calls from existing SQLite data.
- Index refresh is manual through the `refresh_index` MCP tool.

## Current Constraints

- Site structure is assumed to follow `main div.f a[href]` format.
- Page count defaults to 8 and is configurable.
- Maven is required for dependency resolution and packaging.
