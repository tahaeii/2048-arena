import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env';

const databasePath = resolve(process.cwd(), env.DATABASE_PATH);
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);

// WAL mode gives much better concurrent read/write behavior for a small
// multi-user app like an internal leaderboard.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** Creates the schema if it doesn't already exist. Safe to run on every boot. */
function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      name         TEXT PRIMARY KEY,
      best_score   INTEGER NOT NULL DEFAULT 0,
      games_played INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_players_best_score ON players (best_score DESC);
  `);
}

migrate();
