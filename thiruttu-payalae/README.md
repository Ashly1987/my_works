# Movies MCP Server (Java + SQLite/Postgres)

Small MCP server in Java that:

- Scrapes movie title + link entries from `https://moviesda18.com/tamil-2026-movies/` pages
- Stores them in SQLite or PostgreSQL (Supabase)
- Exposes MCP tools `search_movie` and `refresh_index`
- Serves a website UI that reads movie links from the same database
- Tracks website visits (daily and total) with a daily report

## Requirements

- Java 17+
- Maven 3.9+

## Build

```bash
mvn -q -DskipTests package
```

Creates:

- `target/movies-mcp-server-1.0.0-jar-with-dependencies.jar`

## Run

```bash
java -jar target/movies-mcp-server-1.0.0-jar-with-dependencies.jar --db=movies.db
```

Or use the helper script (kills any process already listening on the selected web port before starting):

```bash
./run.sh
```

Script options:

- `--db=movies.db`
- `--jdbc-url=jdbc:postgresql://...`
- `--web-port=8080`
- `--web-host=127.0.0.1`
- `--no-web`
- `--skip-startup-refresh`
- `--startup-base-url=https://moviesda18.com/tamil-2026-movies/`
- `--startup-pages=8`
- `--startup-max-depth=2`
- `--startup-replace-existing`
- `--startup-fetch-metadata`
- `--startup-metadata-limit=150`

Options:

- `--db=movies.db` SQLite file path
- `--jdbc-url=...` JDBC URL (for Supabase/Postgres). When set, this is used instead of `--db`.
- `--web-port=8080` Website HTTP port
- `--web-host=127.0.0.1` Website bind host
- `--no-web` Disable website server
- `--skip-startup-refresh` Disable automatic refresh during startup
- `--startup-base-url=...` Base URL for startup refresh crawl
- `--startup-pages=...` Number of list pages to crawl during startup refresh (1-200)
- `--startup-max-depth=...` Folder recursion depth during startup refresh (0-10)
- `--startup-replace-existing` Clear existing rows before startup refresh upsert
- `--startup-fetch-metadata` Enable per-movie metadata scraping during startup refresh (slower)
- `--startup-metadata-limit=...` Maximum movie detail pages to scrape for metadata in one startup run

Environment variables:

- `DATABASE_URL` database URL fallback when `--jdbc-url` is not provided. Supports `jdbc:postgresql://`, `postgresql://`, and `postgres://`.
- `PORT` Website port fallback for cloud platforms (for example Render)
- `STARTUP_REFRESH=false` Disable startup refresh without changing command line
- `STARTUP_BASE_URL` Base URL for startup refresh crawl
- `STARTUP_PAGES` Number of pages for startup refresh crawl
- `STARTUP_MAX_DEPTH` Recursion depth for startup refresh crawl
- `STARTUP_REPLACE_EXISTING=true` Clears movies table before startup refresh (useful for one-time full rebuild)
- `STARTUP_FETCH_METADATA=false` Skip per-movie metadata fetch on startup for faster indexing
- `STARTUP_METADATA_LIMIT=150` Caps metadata detail-page fetches per startup run

Website URL (default):

- `http://127.0.0.1:8080`

By default, indexing executes during startup (every restart/deploy) and upserts fresh records.
Use `--skip-startup-refresh` (or `STARTUP_REFRESH=false`) to disable this behavior.
Tune crawl coverage by increasing `STARTUP_PAGES` and `STARTUP_MAX_DEPTH`.

Note: "Upserted X records" means rows processed in that refresh run (inserts + updates). The actual unique catalog size is shown by API `total` and refresh status `total rows`.

For Render/free-tier deployments with ephemeral storage, startup refresh helps repopulate data on each restart.

## Supabase (Postgres) setup

1. Create a Supabase project and copy the Postgres connection string from Connect.
2. Prefer session pooler for Render-style persistent web services.
3. Ensure SSL mode is enabled.
4. Start app with JDBC URL:

```bash
java -jar target/movies-mcp-server-1.0.0-jar-with-dependencies.jar \
  --jdbc-url="jdbc:postgresql://<HOST>:6543/postgres?user=postgres.<PROJECT_REF>&password=<PASSWORD>&sslmode=require" \
  --web-host=0.0.0.0 \
  --web-port=${PORT:-8080}
```

Or set environment variable:

```bash
export DATABASE_URL="jdbc:postgresql://<HOST>:6543/postgres?user=postgres.<PROJECT_REF>&password=<PASSWORD>&sslmode=require"
java -jar target/movies-mcp-server-1.0.0-jar-with-dependencies.jar --web-host=0.0.0.0 --web-port=${PORT:-8080}
```

You can also use Supabase-native URL forms directly in `DATABASE_URL`:

```bash
export DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require"
```

or

```bash
export DATABASE_URL="postgres://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require"
```

The app converts them to JDBC automatically.

## Render deployment (with Supabase)

This repo now includes `render.yaml` for one-click-ish Render setup.
If your repository contains multiple projects, keep a single root `render.yaml` and add one service block per project using `rootDir`.

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from this repo.
3. In Render service env vars, set:

- `DATABASE_URL` to your Supabase JDBC URL.

4. Deploy.

Render uses:

- Docker runtime via `Dockerfile` (Blueprint uses `runtime: docker`)
- App command inside container: `java -jar /app/movies-mcp-server.jar --web-host=0.0.0.0 --web-port=$PORT`

Local helper startup now prints a health line once the web listener is up.

## Website API

Endpoint:

- `GET /api/movies?query=<text>&page=<n>&limit=<n>`
- `GET /api/view-stats?days=<n>`

Example:

```bash
curl "http://127.0.0.1:8080/api/movies?query=leo&page=1&limit=12&sort=rating_desc"
```

Response contains:

- `total`: total matching records
- `totalPages`: number of pages for given `limit`
- `sort`: active sort key (`latest`, `rating_desc`, `year_desc`, `year_asc`, `title_asc`, `title_desc`)
- `results`: list of `title`, `url`, `year`, `page`, `imageUrl`, `rating`

View stats response contains:

- `todayViews`: visit count for current day
- `totalViews`: cumulative visit count
- `report`: list of `{ day, views }`, newest day first

Website views report page:

- `GET /view-report.html` opens a detailed report in a new tab
- Includes quick filters for last `7`, `14`, or `30` days

Default listing order is newest-first (higher `year`, then latest first-seen records), with `Love Insurance Kompany (2026)` pinned to the top when it matches the current query.

## MCP Tool

Tool name: `search_movie`

Input schema:

```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "limit": { "type": "integer", "default": 10 }
  },
  "required": ["query"]
}
```

Example tool call arguments:

```json
{
  "query": "Sarkar",
  "limit": 5
}
```

Returns matching movie titles and links from the configured database.

Tool name: `refresh_index`

Input schema:

```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "default": "https://moviesda18.com/tamil-2026-movies/"
    },
    "pages": { "type": "integer", "default": 8 },
    "maxDepth": { "type": "integer", "default": 2 }
  }
}
```

Example tool call arguments:

```json
{
  "baseUrl": "https://moviesda18.com/tamil-2026-movies/",
  "pages": 8,
  "maxDepth": 2
}
```

This manually scrapes and upserts latest records while the MCP server is running. It now indexes:

- Latest updates links (`main div.latest a[href]`)
- Category folder links (`main div.f a[href]`)
- Nested folders up to `maxDepth`
- Best-effort movie metadata from detail pages: poster image URL and rating

## Example MCP client config

Use the built jar as stdio command in your MCP-capable client.

```json
{
  "servers": {
    "movies-java": {
      "type": "stdio",
      "command": "java",
      "args": [
        "-jar",
        "/absolute/path/to/target/movies-mcp-server-1.0.0-jar-with-dependencies.jar",
        "--db=/absolute/path/to/movies.db"
      ]
    }
  }
}
```
