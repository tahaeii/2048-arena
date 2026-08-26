# 2048 Arena — Web

A production-oriented rebuild of 2048 using Next.js 15, TypeScript & Tailwind CSS, with a unified dark "Copper
Clay" visual theme, plus a shared leaderboard backed by the API in [`../server`](../server).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point at your running backend
npm run dev
```

Open http://localhost:3000. The backend in `../server` must be running for the name gate and leaderboard to
work — see its own README.

## Controls

- **Desktop:** Arrow keys.
- **Mobile:** Swipe in any direction on the board.

## Architecture

```
src/
├── app/                  # Routing, layout, global styles (App Router)
├── components/
│   ├── game/             # Game-specific presentational components
│   └── ui/                 # Small generic UI primitives
├── hooks/                 # useGameEngine, useKeyboardControls, useSwipeControls, usePlayerName
└── lib/
    ├── api/                 # Fetch client for the leaderboard backend
    ├── game/                # Pure, framework-agnostic game logic
    │   ├── engine.ts          # move/spawn/game-over logic (no React, unit-testable)
    │   ├── types.ts
    │   └── constants.ts       # Board config + tile color tokens
    └── utils/
```

The game engine (`lib/game/engine.ts`) is intentionally framework-agnostic: it operates on plain arrays of
`Tile` objects and contains no React or DOM code. All React state lives in `useGameEngine`, a
`useReducer`-based hook that also persists the best score to `localStorage`.

Tile position animation is handled by `framer-motion`'s `layout="position"` engine: each tile is a CSS grid
item placed via `gridRow` / `gridColumn`, so moving a tile is just a style change that `framer-motion`
animates automatically (FLIP-style). Using `"position"` rather than the default `layout` skips the more
expensive size-recalculation step — tiles never change size, only position — which keeps moves smooth even on
low-end devices. Spawning and merging get their own separate, lightweight pop animations layered on top.

### Avoiding hydration mismatches

The very first render must be identical on the server and the client. The initial board used to be generated
with `Math.random()` / `crypto.randomUUID()` inside the `useReducer` initializer, which runs during SSR _and_
again on the client — producing two different boards and a hydration error. The board now starts empty on the
first render and is populated inside a `useEffect` (`START_GAME`), which only ever runs client-side, after
hydration has already succeeded.

## Leaderboard integration

- On first visit, `PlayerNameGate` asks for a name (stored in `localStorage` via `usePlayerName`) before the
  board becomes interactive.
- A game is submitted once to `POST /api/scores` when it ends — either by losing, or by reaching 2048 without
  choosing to keep playing. If the player keeps playing past 2048 and later loses, a second, higher-score
  submission follows; the API only ever raises a player's stored best.
- The header's three stats are: the live score, the player's own best (local), and the all-time best recorded
  on the server (`GET /api/scores/top`), refreshed after every submission.
- The "Leaderboard" button opens `LeaderboardPanel`, which fetches `GET /api/scores` and highlights the
  current player's row.
- Configure the backend's address with `NEXT_PUBLIC_API_URL` in `.env.local` — leave it empty to call a
  same-origin, reverse-proxied API (see the root README's single-server deployment section).

## Notes

- Built against Next.js `15.5.9`. If that exact patch isn't available when you install, bump the version in
  `package.json` to the latest `15.x`.
- Tailwind v3 is used for a stable, well-documented config surface.
