# Project Notes

## Goal

Build a Java MCP server and companion website that can search movie names and open matching links stored in SQLite.

## Architecture

- `MovieIndexer`: Scrapes paginated list pages and extracts title + URL, then attempts to collect image/rating metadata from movie pages.
- `Database`: Stores records in SQLite and supports title search with optional `image_url` and `rating` fields.
- `McpServer`: Implements MCP over stdio (`initialize`, `tools/list`, `tools/call`, `ping`).
- `WebServer`: Serves website assets and JSON API (`/api/movies`) from SQLite.
- `Main`: Bootstraps database and starts MCP server.

## Tool Exposed

- `search_movie`
  - Input: `query` (required), `limit` (optional, default 10)
  - Output: text content and structured results list
- `refresh_index`
  - Input: `baseUrl` (optional), `pages` (optional, default 8), `maxDepth` (optional, default 2)
  - Output: upsert summary and crawl parameters

## Run Modes

- MCP server startup does not run indexing.
- Server starts immediately and serves search calls from existing SQLite data.
- Website starts by default on `127.0.0.1:8080` and reads from same DB.
- Website tiles now show a Play button and render poster/rating when available (with fallbacks).
- Index refresh is manual through the `refresh_index` MCP tool, including latest links and nested category folders.

Startup flags:

- `--db=<path>` database path
- `--web-host=<host>` website bind host
- `--web-port=<port>` website port
- `--no-web` disable website server

Helper script:

- `./run.sh` starts server and kills any existing listener on selected web port before launch.
- Supports `--db`, `--web-host`, `--web-port`, and `--no-web`.

## Current Constraints

- Site structure is assumed to follow `main div.f a[href]` format.
- Page count defaults to 8 and is configurable.
- Maven is required for dependency resolution and packaging.
