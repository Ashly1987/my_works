# Project Notes

## Goal

Build a Java MCP server and companion website that can search movie names and open matching links stored in SQLite or Supabase Postgres.

## Architecture

- `MovieIndexer`: Scrapes paginated list pages and extracts title + URL, then attempts to collect image/rating metadata from movie pages.
- `Database`: Stores records in SQLite or PostgreSQL and supports title search with optional `image_url` and `rating` fields.
- `McpServer`: Implements MCP over stdio (`initialize`, `tools/list`, `tools/call`, `ping`).
- `WebServer`: Serves website assets and JSON API (`/api/movies`) from the configured database.
- `Main`: Bootstraps database, performs startup refresh, and starts MCP server.

## Tool Exposed

- `search_movie`
  - Input: `query` (required), `limit` (optional, default 10)
  - Output: text content and structured results list
- `refresh_index`
  - Input: `baseUrl` (optional), `pages` (optional, default 8), `maxDepth` (optional, default 2)
  - Output: upsert summary and crawl parameters

## Run Modes

- MCP server startup runs indexing by default and upserts latest records.
- Server startup can skip indexing with `--skip-startup-refresh` or `STARTUP_REFRESH=false`.
- Website starts by default on `127.0.0.1:8080` and reads from same DB.
- Website tiles now show a Play button and render poster/rating when available (with fallbacks).
- Website listing is sorted newest-first by year and first-seen timestamp.
- Index refresh is manual through the `refresh_index` MCP tool, including latest links and nested category folders.

Startup flags:

- `--db=<path>` database path
- `--jdbc-url=<jdbc-url>` database JDBC URL (for Postgres/Supabase)
- `--web-host=<host>` website bind host
- `--web-port=<port>` website port
- `--no-web` disable website server
- `--skip-startup-refresh` disable refresh during startup
- `--startup-base-url=<url>` startup refresh base list URL
- `--startup-pages=<n>` startup refresh page count (1-200)
- `--startup-max-depth=<n>` startup refresh recursion depth (0-10)
- `--startup-replace-existing` clears rows before startup refresh upsert
- `--startup-fetch-metadata` enables per-movie metadata scraping (slower)
- `--startup-metadata-limit=<n>` caps metadata detail-page fetches during startup refresh

Environment variables:

- `DATABASE_URL` fallback database URL (`jdbc:postgresql://`, `postgresql://`, or `postgres://`)
- `PORT` fallback website port
- `STARTUP_REFRESH=false` disables startup refresh
- `STARTUP_BASE_URL` startup refresh base list URL
- `STARTUP_PAGES` startup refresh page count
- `STARTUP_MAX_DEPTH` startup refresh recursion depth
- `STARTUP_REPLACE_EXISTING=true` clears rows before startup refresh
- `STARTUP_FETCH_METADATA=false` speeds startup refresh by skipping metadata scrape
- `STARTUP_METADATA_LIMIT` caps metadata detail-page fetches during startup refresh

Helper script:

- `./run.sh` starts server and kills any existing listener on selected web port before launch.
- Supports `--db`, `--jdbc-url`, `--web-host`, `--web-port`, `--no-web`, and `--skip-startup-refresh`.
- Prints a health confirmation once the web port begins listening.

Deployment artifacts:

- `render.yaml` is included for Render Blueprint deployment.
- In multi-project repositories, use one root `render.yaml` with separate service entries and `rootDir` per project.
- Render expects `DATABASE_URL` to be provided (Supabase Postgres JDBC URL).
- Render deployment for this Java service uses Docker runtime (`runtime: docker`) with `Dockerfile`.

## Current Constraints

- Site structure is assumed to follow `main div.f a[href]` format.
- Page count defaults to 8 and is configurable.
- Maven is required for dependency resolution and packaging.
- Startup refresh performs live network scraping; startup can be slower depending on target site latency.
- Crawling "all" links is best-effort and depends on source site structure, availability, and configured pages/depth limits.
- "Upserted" count in logs is processed rows (insert+update), not the final unique row count.
- Supabase project/database must be created in Supabase dashboard; app-side schema/table bootstrap is automatic at first run.
