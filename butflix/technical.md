# Butflix — 10-Minute Getting Started Guide

## Minute 1 — Prerequisites

Make sure you have these installed:

- **Node.js** v18+: `node -v`
- **npm** v9+: `npm -v`
- A terminal and a browser

---

## Minutes 2–3 — Backend setup

```bash
cd butflix/backend

# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env
```

Open `backend/.env` and check/set these values:

| Key                          | What it does                    | Value to use locally                          |
| ---------------------------- | ------------------------------- | --------------------------------------------- |
| `PORT`                       | Which port Express runs on      | `4000`                                        |
| `JWT_SECRET`                 | Signs login tokens              | Any long random string                        |
| `CORS_ORIGIN`                | Which frontend URLs are allowed | `http://localhost:5173,http://localhost:5174` |
| `DATA_FILE`                  | Where local data lives          | `./data/db.json`                              |
| `EXTERNAL_CATALOG_ENABLED`   | Pull shows from TVMaze?         | `true` for real data, `false` for local only  |
| `EXTERNAL_CATALOG_BASE_URL`  | TVMaze base URL                 | `https://api.tvmaze.com`                      |
| `EXTERNAL_CATALOG_LIST_PATH` | TVMaze path for show list       | `/shows`                                      |

```bash
# 3. Start the backend (auto-restarts on code changes)
npm run dev
```

You should see: `Server running on port 4000`

---

## Minutes 4–5 — Frontend setup

Open a **second terminal tab**, then:

```bash
cd butflix/frontend
npm install
npm run dev
```

Vite will print something like:

```
  ➜  Local:   http://localhost:5173/
```

Open that URL. You should see Butflix with a grid of shows.

> If Vite picks port **5174** instead of 5173, that's fine — CORS is already configured for both.

---

## Minute 6 — What you're looking at

```
User opens browser
      ↓
React app (frontend :5173)
      ↓  fetch("/api/catalog?limit=25&page=1")
Express API (backend :4000)
      ↓  EXTERNAL_CATALOG_ENABLED=true?
TVMaze API (https://api.tvmaze.com/shows)   ← real show data
      OR
data/db.json                                ← local fallback JSON
      ↓
JSON response → React renders cards → scroll down → loads next 25
```

---

## Minute 7 — The file map

### Backend (`backend/src/`)

| File/Folder                             | Role                                                                |
| --------------------------------------- | ------------------------------------------------------------------- |
| `server.js`                             | Entry point — starts Express on `PORT`                              |
| `app.js`                                | Wires all middleware (CORS, JSON, auth, routes) together            |
| `config/env.js`                         | Single source of truth for all env variables                        |
| `config/corsOptions.js`                 | Parses comma-separated `CORS_ORIGIN` into an allow-list             |
| `contracts/schemas.js`                  | Zod validation rules for every incoming request (e.g. limit max=50) |
| `domain/catalog/`                       | Business logic — get catalog, get one item, search                  |
| `domain/identity/`                      | Auth logic — register, login, JWT tokens                            |
| `domain/activity/`                      | Watch history logic                                                 |
| `adapters/rest/`                        | Express routes — REST API endpoints for web requests                |
| `adapters/mcp/`                         | Tool-calling adapter — flexible RPC-style interface                 |
| `integrations/externalCatalogSource.js` | Calls TVMaze and maps its shape to internal format                  |
| `data/db.json`                          | Local JSON "database" (dev only — not for production)               |
| `middleware/`                           | Auth guard middleware (validates JWT on protected routes)           |

### Frontend (`frontend/src/`)

| File/Folder                | Role                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| `main.jsx`                 | App entry point — mounts React into `index.html`                     |
| `App.jsx`                  | Root layout — router + fixed copyright footer                        |
| `index.css`                | All styles — design system, grid, nav, cards, responsive breakpoints |
| `pages/BrowsePage.jsx`     | Main page — fetches catalog, infinite scroll, search                 |
| `pages/WatchPage.jsx`      | Single show detail / watch view                                      |
| `pages/HistoryPage.jsx`    | Watch history list                                                   |
| `components/NavBar.jsx`    | Top navigation bar                                                   |
| `components/VideoCard.jsx` | Individual show card (thumbnail, title, badge)                       |
| `services/apiClient.js`    | Central fetch wrapper — adds base URL, handles errors                |
| `services/config.js`       | Reads `VITE_API_BASE` env var (falls back to `localhost:4000`)       |
| `services/restProvider.js` | All REST API calls (catalog, detail, search, history)                |
| `state/`                   | Shared React state / context (auth session, etc.)                    |

---

## Minute 7.5 — How the two adapters work

Butflix has **two ways** to call backend functions:

### REST Adapter (`adapters/rest/`)

Traditional HTTP routes. Frontend makes requests like:

```
GET  /api/catalog?search=action
POST /api/auth/login
POST /api/activity/record-watch
```

Each endpoint is explicit and standalone.

### MCP Adapter (`adapters/mcp/router.js`)

A **single tool-calling endpoint** that routes flexible function calls. Frontend sends:

```
POST /tools/call
{ "tool": "catalog.list", "input": { "search": "action", "page": 1 } }
{ "tool": "identity.login", "input": { "email": "user@test.com", "password": "..." } }
{ "tool": "activity.recordWatchEvent", "input": { "token": "...", "contentId": "123" } }
```

**Why MCP exists:**

- One endpoint handles all function calls
- Tool names are standardized (e.g., `domain.action`)
- Easier to extend — add a new tool without creating new routes
- Built-in authentication for sensitive operations
- Useful for AI agents that need a structured menu of capabilities

**Which should you use?**

- **REST** → Standard web requests, simpler to reason about
- **MCP** → Programmatic/AI agent access, or when you want all operations through one channel

Both are available simultaneously. `app.js` wires both into Express.

---

## Minute 7.6 — The TVMaze integration (external data source)

Butflix pulls show data from **TVMaze REST API** (no MCP server involved — they only expose REST).

### The Contract

Your `.env` defines the connection:

```
EXTERNAL_CATALOG_BASE_URL=https://api.tvmaze.com
EXTERNAL_CATALOG_LIST_PATH=/shows
EXTERNAL_CATALOG_DETAIL_PATH=/shows/:id
EXTERNAL_CATALOG_TIMEOUT_MS=4000
```

Your backend hits: `GET https://api.tvmaze.com/shows?search=action&page=1&limit=12` (though TVMaze ignores pagination — returns full list).

### TVMaze Response → Your Format

TVMaze returns raw JSON like:

```json
{
  "id": 1,
  "name": "Under the Dome",
  "genres": ["sci-fi"],
  "image": { "medium": "url-to-image", "original": "..." },
  "summary": "<p>A dome falls...</p>"
}
```

The **`externalCatalogSource.js`** adapter normalizes it to Butflix's internal schema:

```javascript
{
  id: "1",
  title: "Under the Dome",           // mapped from .name
  genre: "sci-fi",                   // first genre
  genres: ["sci-fi"],
  description: "A dome falls...",    // HTML stripped from .summary
  posterUrl: "url-to-image",         // mapped from .image.medium
  streamUrl: "",                     // TVMaze doesn't provide this
  downloadUrl: ""                    // TVMaze doesn't provide this
}
```

### How It Works

1. Frontend requests: `GET /api/catalog?search=action`
2. Backend's `catalogService` checks `EXTERNAL_CATALOG_ENABLED`
3. If `true`, calls `externalCatalogSource.listCatalog()`
4. Adapter fetches from TVMaze, normalizes each item, applies filters
5. Returns paginated results back to frontend
6. If TVMaze fails, or if external catalog is disabled, backend falls back to local `data/db.json`
7. React renders the returned items as cards

### What `data/db.json` actually stores

`data/db.json` is **not** a full backup or cached mirror of TVMaze.

It stores three local collections:

- `users` → registered users
- `watchEvents` → playback/watch history records
- `content` → a small seeded local catalog used for demo data and fallback behavior

The `content` array comes from the hardcoded `initialData` object in `backend/src/data/store.js`. On first startup, if the JSON file does not exist, the app creates it and writes that seed data.

Important detail: when TVMaze is enabled, catalog results are fetched live and returned to the client, but they are **not written back** into `data/db.json`.

### Key Features

| Feature                   | How it works                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Timeout**               | Requests abort after 4 seconds — prevents hanging if TVMaze is slow                                 |
| **Field mapping**         | Handles TVMaze's varied field names; gracefully falls back if fields missing                        |
| **Flexible parsing**      | TVMaze returns array directly; adapter handles wrapped structures (`.data`, `.results`, `.items`)   |
| **Client-side filtering** | Search and genre filters run locally after fetch (TVMaze returns unfiltered)                        |
| **Pagination**            | Client-side slicing (TVMaze returns full list; adapter pages it)                                    |
| **Fallback**              | If `EXTERNAL_CATALOG_ENABLED=false` or TVMaze fails, uses the small local catalog in `data/db.json` |

---

## Minute 7.7 — How external agents use your MCP server

Any external agent (AI, bot, script) can call your MCP tools via the single `POST /tools/call` endpoint.

### Request Format

```json
POST http://localhost:4000/tools/call
Content-Type: application/json

{
  "tool": "catalog.list",
  "input": {
    "search": "action",
    "genre": "sci-fi",
    "page": 1,
    "limit": 12
  }
}
```

### Available Tools

| Tool Name                   | Purpose                  | Input                                           | Auth Required |
| --------------------------- | ------------------------ | ----------------------------------------------- | ------------- |
| `identity.register`         | Create account           | `{ email, password }`                           | No            |
| `identity.login`            | Get JWT token            | `{ email, password }`                           | No            |
| `identity.validateSession`  | Check token validity     | `{ token }`                                     | No            |
| `catalog.list`              | Search shows             | `{ search?, genre?, page?, limit? }`            | No            |
| `catalog.detail`            | Get show info            | `{ contentId }`                                 | No            |
| `activity.recordWatchEvent` | Log watch event          | `{ token, contentId, eventType, positionSec? }` | **Yes**       |
| `activity.getHistory`       | Get user's watch history | `{ token }`                                     | **Yes**       |

### Success Response

```json
{
  "success": true,
  "requestId": "abc123def456",
  "data": {
    "items": [...],
    "total": 42,
    "page": 1,
    "limit": 12
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid or expired auth token"
}
```

### Agent Workflow

1. Agent calls `identity.login` → gets JWT token
2. Agent stores token (needed for auth-required tools)
3. Agent calls `catalog.list` with query parameters
4. Agent processes results, builds recommendations
5. Agent calls `activity.recordWatchEvent` with token to log user activity
6. Agent calls `activity.getHistory` to pull watch history for analysis

Each request is stateless — the server doesn't track agent sessions. Include the token in every protected call.

---

## Minute 8 — Change something to prove it works

Open `backend/src/contracts/schemas.js` and find this line:

```js
limit: z.coerce.number().min(1).max(50).default(25),
```

Change `25` to `5`, save. The backend auto-restarts (nodemon). Refresh the browser — you'll see only 5 cards load at first, then 5 more on each scroll. Change it back to `25` when done.

---

## Minute 9 — Common gotchas

| Symptom                       | Cause                              | Fix                                                 |
| ----------------------------- | ---------------------------------- | --------------------------------------------------- |
| Backend won't start           | `.env` missing                     | `cp .env.example .env`                              |
| No shows load                 | External catalog disabled          | Set `EXTERNAL_CATALOG_ENABLED=true` in `.env`       |
| CORS error in browser         | Frontend on unexpected port        | Add that port to `CORS_ORIGIN` in `.env`            |
| Favicon or title not updating | Browser cache                      | Hard refresh: `Cmd+Shift+R` (Mac) or open incognito |
| Changes not reflected         | Forgot to save, or nodemon stopped | Check the backend terminal for errors               |

---

## Minute 10 — When you're ready to go further

| Goal                | Where to start                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| Add a new API route | `backend/src/domain/catalog/` — add a handler, then wire it in `app.js`                            |
| Add a new page      | Create `frontend/src/pages/MyPage.jsx`, add a `<Route>` in `App.jsx`                               |
| Style something     | `frontend/src/index.css` — all variables are at the top under `:root`                              |
| Real database       | Replace `data/db.json` references — a Postgres adapter slot is already planned                     |
| Deploy              | Frontend → Vercel, Backend → Render. Set `VITE_API_BASE` and `CORS_ORIGIN` to your production URLs |
