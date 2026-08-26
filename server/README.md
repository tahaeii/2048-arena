# 2048 Arena — Server

A small, production-shaped Express + TypeScript API that stores each player's best score in SQLite, so a group
of players like [Ferdowsi Cloud](https://ferdowsi.cloud/en) can see a shared leaderboard.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The API listens on `http://localhost:4000` by default and creates its SQLite database file automatically on
first run (at `DATABASE_PATH`).

For production:

```bash
npm run build
npm start
```

## Endpoints

| Method | Path                | Body / Query           | Description                                   |
| ------ | ------------------- | ---------------------- | --------------------------------------------- |
| GET    | `/health`           | —                      | Liveness check.                               |
| GET    | `/api/scores`       | `?limit=50` (optional) | Top players, best score first.                |
| GET    | `/api/scores/top`   | —                      | The single highest score ever recorded.       |
| GET    | `/api/scores/:name` | —                      | One player's best score and rank.             |
| POST   | `/api/scores`       | `{ "name", "score" }`  | Submit a finished game. Only raises the best. |

**POST `/api/scores`** response:

```json
{
  "name": "Sara",
  "bestScore": 2148,
  "gamesPlayed": 4,
  "isNewBest": true,
  "rank": 1
}
```

A player's `best_score` only ever goes up — submitting a lower score still increments `games_played` but
leaves `best_score` untouched.

## Architecture

```
src/
├── server.ts             # Entry point — starts the HTTP listener
├── app.ts                # Express app factory: security middleware, routes
├── config/env.ts         # Validated environment variables (zod)
├── db/index.ts           # SQLite connection + schema migration
├── services/              # Business logic, no Express types in sight
├── controllers/           # Thin request handlers
├── routes/                 # Router wiring
├── middleware/             # Validation + centralized error handling
└── types/                  # Shared domain types
```

- **SQLite via `better-sqlite3`**: synchronous, fast, zero external services to run — a good fit for an
  internal tool. `journal_mode = WAL` allows concurrent reads while a write is in progress.
- **Validation**: `zod` schemas validate every request body; invalid input never reaches the database layer.
- **Security/production basics**: `helmet` for HTTP headers, `cors` restricted to `CORS_ORIGIN`,
  `express-rate-limit` on score submissions, `morgan` request logging, and a centralized error handler that
  never leaks internal error details to clients.

## Connecting your own frontend

Any client can use this API — point `NEXT_PUBLIC_API_URL` (or your frontend's equivalent) at wherever this
server is deployed, and make sure its origin is listed in `CORS_ORIGIN`.

## Growing beyond this

This is intentionally simple (SQLite, no auth) — right-sized for an internal game with friends or coworkers.
If you outgrow it: swap `better-sqlite3` for a hosted Postgres and an ORM (the `services/` layer is the only
place that touches the database, so the swap is contained there), and add an auth layer if you need to stop
people from submitting scores under someone else's name.
