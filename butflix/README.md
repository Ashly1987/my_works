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

## Deploy

This repo now includes a Render blueprint at `render.yaml` for deploying both apps from the monorepo:

- `butflix-backend` → Node web service
- `butflix-frontend` → static site built from Vite

### Recommended hosting

- Backend: Render web service
- Frontend: Render static site

### Deploy on Render

1. Push the current branch to GitHub.
2. In Render, create a new Blueprint and point it at this repository.
3. Render will detect `render.yaml` and propose two services.
4. Set these required environment variables before deploy:

Backend:

- `JWT_SECRET` → long random secret
- `CORS_ORIGIN` → your frontend Render URL, for example `https://butflix-frontend.onrender.com`
- `DATA_FILE` → use `/tmp/db.json` on free tier (default in blueprint)

Frontend:

- `VITE_API_BASE` → your backend Render URL, for example `https://butflix-backend.onrender.com`

Optional external catalog variables:

- `EXTERNAL_CATALOG_ENABLED`
- `EXTERNAL_CATALOG_BASE_URL`
- `EXTERNAL_CATALOG_LIST_PATH`
- `EXTERNAL_CATALOG_DETAIL_PATH`
- `EXTERNAL_CATALOG_AUTH_HEADER`
- `EXTERNAL_CATALOG_AUTH_TOKEN`

Optional persistent analytics variable:

- `ANALYTICS_DATABASE_URL` (Postgres connection string)

### Important persistence note

Butflix still uses a JSON file store for `users`, `watchEvents`, and fallback `content`.

On most cloud platforms, the local filesystem is ephemeral. That means data can reset on redeploy or restart unless you attach persistent storage.

For Render:

- free-tier default: use `DATA_FILE=/tmp/db.json` (app works, data is ephemeral)
- paid persistent option: attach a persistent disk to backend
- mount disk at `/var/data`
- then set `DATA_FILE=/var/data/db.json`

If you do not attach a disk, deployment will still work, but local file data is not durable.

### Persist analytics across redeploys (free-tier friendly)

Butflix can persist analytics counters in Postgres even when `DATA_FILE=/tmp/db.json`.

Set:

- `ANALYTICS_DATABASE_URL=postgres://...`

When set, backend analytics writes/reads from Postgres and survives redeploys.
The backend auto-creates `app_private.analytics_counters` (private schema, not `public`).
If not set, analytics falls back to local JSON file behavior.

## API endpoints (REST)

- POST /api/auth/register
- POST /api/auth/login
- GET /api/catalog
- GET /api/catalog/:id
- GET /api/analytics
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

- analytics.getSummary
- identity.register
- identity.login
- identity.validateSession
- catalog.list
- catalog.detail
- activity.recordWatchEvent
- activity.getHistory

## Lightweight analytics

Butflix now tracks lightweight backend request analytics in the JSON store.

- Daily call counts
- Monthly call counts
- Total request count
- Read access through REST and MCP

REST:

- `GET /api/analytics`

MCP:

- `analytics.getSummary`

Note: on free-tier Render with `DATA_FILE=/tmp/db.json`, analytics reset when the service restarts or redeploys.

## Next incremental features

1. Watchlist module
2. Admin content management
3. PostgreSQL migration
4. Cloud object storage for media
5. Recommendation engine
