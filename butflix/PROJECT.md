# PROJECT: Butflix Architecture Notes

## Goal

Deliver a 1-2 week MVP with stable architecture that supports incremental feature growth.

## Architecture

- Domain services hold business logic:
  - identity service
  - catalog service
  - activity service
- Protocol adapters:
  - REST adapter for browser app
  - MCP adapter for tool-based access
- Rule: adapter parity. REST and MCP return equivalent payload shapes where applicable.

## Layer map

1. UI layer (React app)
2. Orchestration layer (service clients + route handlers)
3. Domain layer (business logic)
4. Infrastructure layer (data store, runtime env)

## Current modules

- Identity: backend module retained, frontend login flow temporarily disabled
- Catalog: list/detail with title search, infinite loading, and client-side genre filtering in browse UI
- Catalog source strategy: external API adapter (optional) with local-store fallback
- Playback: watch screen with stream metadata, poster-based external links, and back navigation
- Activity: backend module retained, frontend history temporarily disabled
- Analytics: backend request counters for daily/monthly totals exposed via REST and MCP

## Deployment shape

- Monorepo deployment via Render blueprint in `render.yaml`
- Backend deploys as a Node web service from `backend/`
- Frontend deploys as a static Vite build from `frontend/`
- Frontend talks to backend through `VITE_API_BASE`
- Backend CORS allow-list must include the deployed frontend origin

## Current production constraint

- File-based storage is still used for `users`, `watchEvents`, and fallback `content`
- File-based storage also holds lightweight analytics counters
- Free-tier deployment uses `DATA_FILE=/tmp/db.json` so app can boot without a paid disk
- `tmp` storage is ephemeral, so stored JSON data can reset on restart/redeploy
- For durable data, upgrade to persistent disk and set `DATA_FILE=/var/data/db.json`
- Analytics can be made durable without disk by setting `ANALYTICS_DATABASE_URL` to Postgres

## Current frontend mode

- Guest mode is enabled.
- Protected routes and login UI are removed for now.
- History page shows a placeholder until auth is re-enabled.

## Incremental growth order

1. Extend domain service
2. Expose via REST adapter
3. Expose via MCP adapter
4. Wire frontend UI
5. Add contract checks

## External source integration pattern

1. External source adapter maps third-party payloads into domain catalog shape.
2. Domain catalog service calls external source first.
3. On source failure, service falls back to local store data.
4. REST and MCP adapters stay unchanged because they depend on domain service only.

## Immediate backlog

1. Watchlist domain and UI
2. Admin add/remove content
3. Metrics and request tracing
4. Rate limiting and refresh token flow
5. Move from file store to PostgreSQL
