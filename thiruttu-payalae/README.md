# Movies MCP Server (Java + SQLite)

Small MCP server in Java that:

- Scrapes movie title + link entries from `https://moviesda18.com/tamil-2026-movies/` pages
- Stores them in SQLite
- Exposes MCP tools `search_movie` and `refresh_index`

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

Options:

- `--db=movies.db` SQLite file path

Note: indexing is intentionally not executed during MCP server startup.
Use `refresh_index` tool to update data on demand.

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
    "pages": { "type": "integer", "default": 8 }
  }
}
```

Example tool call arguments:

```json
{
  "baseUrl": "https://moviesda18.com/tamil-2026-movies/",
  "pages": 8
}
```

This manually scrapes and upserts latest records into SQLite while the MCP server is running.

## Example MCP client config

Use the built jar as stdio command in your MCP-capable client.

```json
{
  "mcpServers": {
    "movies-java": {
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
