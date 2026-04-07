# Butflix MVP

Butflix is a full-stack streaming MVP built with React + Express using an MCP-first architecture. Core business logic is shared across REST and MCP adapters so features can be extended one by one without rewrites.

## Implemented in this iteration

- Guest browsing flow (authentication UI disabled for now)
- Catalog: title-only search with 25-item pages and Load More pagination
- Playback page: video player when source is browser-playable
- Watch page external-source mode: clickable movie poster + source link
- Watch page includes Back to Home navigation
- History page placeholder (to be re-enabled with auth)
- MCP adapter: tools for identity, catalog, and activity
- Optional external catalog source adapter (website/API integration-ready)

## Tech stack

- Frontend: React (Vite), React Router
- Backend: Node.js, Express, JWT, Zod
- Data storage: JSON file store (fast MVP baseline)

## Run locally

## 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server default: http://localhost:4000

## 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App default: http://localhost:5173

## API endpoints (REST)

- POST /api/auth/register
- POST /api/auth/login
- GET /api/catalog
- GET /api/catalog/:id
- POST /api/activity/watch-events (auth)
- GET /api/activity/history (auth)

Note: auth and activity APIs remain implemented in backend, but frontend is currently running in guest mode and does not use login/history APIs.

## External website/API integration (MCP + REST)

Butflix now supports plugging an external catalog source behind both REST and MCP adapters.
When enabled, `/api/catalog*` and `catalog.*` MCP tools use your external API first and automatically fallback to local JSON data if the external source is unavailable.

Set these in backend `.env`:

```ini
EXTERNAL_CATALOG_ENABLED=true
EXTERNAL_CATALOG_BASE_URL=https://your-domain-or-api.com
EXTERNAL_CATALOG_LIST_PATH=/api/catalog
EXTERNAL_CATALOG_DETAIL_PATH=/api/catalog/:id
EXTERNAL_CATALOG_TIMEOUT_MS=4000
EXTERNAL_CATALOG_AUTH_HEADER=Authorization
EXTERNAL_CATALOG_AUTH_TOKEN=Bearer your-token
```

Supported list response shapes:

- array directly
- object with `items`
- object with `results`
- object with `data`

Supported detail response shapes:

- item object directly
- object with `data` as item

## MCP endpoint

- POST /mcp/tools/call

Body format:

```json
{
  "tool": "catalog.list",
  "input": {
    "search": "orbit",
    "page": 1,
    "limit": 25
  }
}
```

Example tool names:

- identity.register
- identity.login
- identity.validateSession
- catalog.list
- catalog.detail
- activity.recordWatchEvent
- activity.getHistory

## Next incremental features

1. Watchlist module
2. Admin content management
3. PostgreSQL migration
4. Cloud object storage for media
5. Recommendation engine
