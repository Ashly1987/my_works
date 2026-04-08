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
