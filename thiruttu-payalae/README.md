# Movies MCP Server (Java + SQLite)

Small MCP server in Java that:

- Scrapes movie title + link entries from `https://moviesda18.com/tamil-2026-movies/` pages
- Stores them in SQLite
- Exposes MCP tools `search_movie` and `refresh_index`
- Serves a website UI that reads movie links from the same SQLite DB

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
- `--web-port=8080`
- `--web-host=127.0.0.1`
- `--no-web`

Options:

- `--db=movies.db` SQLite file path
- `--web-port=8080` Website HTTP port
- `--web-host=127.0.0.1` Website bind host
- `--no-web` Disable website server

Website URL (default):

- `http://127.0.0.1:8080`

Note: indexing is intentionally not executed during MCP server startup.
Use `refresh_index` tool to update data on demand.

## Website API

Endpoint:

- `GET /api/movies?query=<text>&page=<n>&limit=<n>`

Example:

```bash
curl "http://127.0.0.1:8080/api/movies?query=leo&page=1&limit=12"
```

Response contains:

- `total`: total matching records
- `totalPages`: number of pages for given `limit`
- `results`: list of `title`, `url`, `year`, `page`, `imageUrl`, `rating`

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

Returns matching movie titles and links from SQLite.

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

This manually scrapes and upserts latest records into SQLite while the MCP server is running. It now indexes:

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
