# Technical Overview (Beginner Friendly)

This document explains how the Java classes in this project work together.

## High-level flow

1. Start the application.
2. Open SQLite database and ensure table exists.
3. Start MCP server loop on stdin/stdout.
4. Wait for MCP tool calls from Copilot.
5. For search requests, query SQLite.
6. For refresh requests, crawl website pages and upsert results.

## Class-by-class explanation

### Main

File: src/main/java/com/example/moviesmcp/Main.java

Purpose:

- Application entry point.
- Reads startup args.
- Creates database helper and starts MCP server.

What it does:

1. Parses optional --db argument (defaults to movies.db).
2. Calls database.initialize() to create table/index if missing.
3. Starts McpServer with System.in/System.out.

### McpServer

File: src/main/java/com/example/moviesmcp/McpServer.java

Purpose:

- Handles MCP protocol communication.
- Exposes tools and routes tool calls.

Supported MCP methods:

1. initialize
2. tools/list
3. tools/call
4. ping

Exposed tools:

1. search_movie

- Inputs: query (required), limit (optional)
- Action: searches SQLite titles and returns links.

2. refresh_index

- Inputs: baseUrl (optional), pages (optional), maxDepth (optional)
- Action: crawls website data and upserts into SQLite.

Protocol note:

- Uses newline-delimited JSON-RPC for MCP stdio.
- Also supports Content-Length framing for compatibility.

### Database

File: src/main/java/com/example/moviesmcp/Database.java

Purpose:

- Encapsulates all SQLite operations.

Schema:

- Table: movies
- Key columns: title, url (unique), year, page

Important methods:

1. initialize()

- Creates table and title index.

2. upsertMovies(movies)

- Inserts new rows.
- Updates existing rows when url already exists.

3. searchMovies(query, limit)

- Case-insensitive LIKE search on title.

4. countMovies()

- Returns total number of rows.

### MovieIndexer

File: src/main/java/com/example/moviesmcp/MovieIndexer.java

Purpose:

- Crawls list/category pages and extracts movie links.

What it extracts:

1. Latest update links from main div.latest.
2. Folder/category links from main div.f.
3. Movie-like URLs from discovered pages.
4. Nested folders recursively (bounded by maxDepth).

Safety controls:

1. maxPagesPerList limits pagination per list.
2. maxDepth limits recursion depth.
3. visited sets prevent re-crawling same URLs.

### MovieRecord

File: src/main/java/com/example/moviesmcp/MovieRecord.java

Purpose:

- Simple immutable data model for one movie row.

Fields:

1. title
2. url
3. year
4. page

## End-to-end request flow

### search_movie flow

1. Client sends tools/call for search_movie.
2. McpServer validates input.
3. Database.searchMovies() runs SQL query.
4. McpServer returns formatted text + structured JSON.

### refresh_index flow

1. Client sends tools/call for refresh_index.
2. McpServer creates MovieIndexer with options.
3. MovieIndexer crawls pages and builds MovieRecord list.
4. Database.upsertMovies() writes/updates rows.
5. McpServer returns summary with upserted count.

## Why startup is fast now

- Indexing is not run at startup anymore.
- The server starts immediately.
- Data refresh happens only when refresh_index is called.

## Practical usage pattern

1. Start server.
2. Call refresh_index when you want to update DB.
3. Use search_movie for user queries.
4. Periodically call countMovies() via SQL to monitor growth.

Check listener
lsof -nP -iTCP:8080 -sTCP:LISTEN

Kill existing process (replace PID)
kill -9 PID

Start server
cd "/Users/ash/Desktop/Project/Full Stack/React-projects/my_works/thiruttu-payalae"
./run.sh --db=movies.db

Direct jar run (manual alternative)
java -jar target/movies-mcp-server-1.0.0-jar-with-dependencies.jar --db=movies.db
