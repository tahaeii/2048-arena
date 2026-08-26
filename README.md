# 2048 Arena

2048, but competitive. Play the classic tile-merging game, set your best score & climb the shared leaderboard
to prove you're the best :)

![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-informational)

## Monorepo layout

```
2048-arena/
├── web/       Next.js 15 + TypeScript + Tailwind
├── server/    Express + TypeScript + SQLite
```

Each half is independent (its own `package.json`, its own README) & can be deployed separately. The root just
wires them together with npm workspaces so the whole project installs & runs with one command.

## Quick start (local development)

Requires Node.js ≥ 18.18.

```bash
git clone https://github.com/tahaeii/2048-arena.git
cd 2048-arena
npm install                 # installs both workspaces
cp server/.env.example server/.env
cp web/.env.local.example web/.env.local
npm run dev                 # runs the API and the web app together
```

Open **http://localhost:3000**, enter a name & play. The API listens on **http://localhost:4000**. Both
processes log to the same terminal (color- prefixed) & stopping one stops both (`Ctrl+C`).

Prefer separate terminals, or don't want npm workspaces? Each half also runs completely standalone — see
[`web/README.md`](web/README.md) & [`server/README.md`](server/README.md).

## What's in the game

- **Board:** classic 4×4, arrow keys on desktop, swipe on mobile.
- **Live stats, always visible:** your current score, your personal best (kept in `localStorage`) & the
  all-time highest score ever recorded on the server, with its holder's name.
- **Shared leaderboard:** every finished game (a loss, or a win the player doesn't continue past) is submitted
  once; the "Leaderboard" button shows the top players.
- **Design:** a single cohesive dark "Copper Clay" color story (no generic gray-plus-accent), a subtle
  textured background, & lag-free tile animation — moves animate position only (no expensive size
  recalculation), with separate, lightweight pop effects for spawning & merging.

## Root-level scripts

Run from the repository root; each delegates to both workspaces.

| Command         | What it does                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| `npm run dev`   | Starts the API (`:4000`) and the web app (`:3000`) together, with hot reload. |
| `npm run build` | Builds the API, then the web app, for production.                             |
| `npm run start` | Starts both built apps (run `build` first).                                   |

## Deploying to a single server

The typical case: one VPS running both the API & the frontend behind one domain, managed as long-running
processes & reverse-proxied by Nginx.

1. **Build both apps:**

   ```bash
   npm ci
   npm run build
   ```

2. **Configure environment.** For a single-domain deployment behind a reverse proxy (recommended — no CORS to
   configure):

   ```bash
   # server/.env
   PORT=4000
   CORS_ORIGIN=https://your-domain.example.com
   NODE_ENV=production

   # web/.env.local — empty means "call the API on the same origin, at /api"
   NEXT_PUBLIC_API_URL=
   ```

   Rebuild `web` after changing `NEXT_PUBLIC_API_URL` — Next.js inlines `NEXT_PUBLIC_*` variables at build
   time, not at process start.

3. **Run both processes with [PM2](https://pm2.keymetrics.io/)** (see
   [`ecosystem.config.js`](ecosystem.config.js)):

   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup   # follow the printed command so both survive a reboot
   ```

4. **Reverse-proxy both under one domain with Nginx** (see
   [`deploy/nginx.conf.example`](deploy/nginx.conf.example)): `/api/*` and `/health` route to the API on port
   4000, everything else routes to Next.js on port 3000. Add HTTPS afterward with `certbot --nginx`.

This keeps each half independently restartable and log-separated, while players only ever see one domain.

### Running the halves on separate hosts instead

Just as valid: deploy `server/` anywhere Node runs, deploy `web/` anywhere Next.js runs (a VM, a container, a
platform like Vercel), and point `NEXT_PUBLIC_API_URL` at the API's full URL. Add that URL to the API's
`CORS_ORIGIN` (comma-separated for multiple origins) and everything works the same way.

## Security & production basics (backend)

`helmet` security headers, `cors` restricted to configured origins, `express-rate-limit` on score submissions,
request logging via `morgan`, `zod`-validated input on every write, and a centralized error handler that never
leaks internals to clients. Full details in [`server/README.md`](server/README.md).

## License

[MIT](LICENSE) — do whatever you'd like with it.
