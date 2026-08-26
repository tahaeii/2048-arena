import { db } from '../db';
import type { LeaderboardEntry, PlayerRecord, SubmitScoreResult, TopScore } from '../types';

const getPlayerStmt = db.prepare<[string], PlayerRecord>('SELECT * FROM players WHERE name = ?');

const insertPlayerStmt = db.prepare<[string, number]>(
  `INSERT INTO players (name, best_score, games_played)
   VALUES (?, ?, 1)`,
);

const updatePlayerStmt = db.prepare<[number, string]>(
  `UPDATE players
   SET best_score = ?, games_played = games_played + 1, updated_at = datetime('now')
   WHERE name = ?`,
);

const leaderboardStmt = db.prepare<[number], PlayerRecord>(
  `SELECT * FROM players ORDER BY best_score DESC, updated_at ASC LIMIT ?`,
);

const rankStmt = db.prepare<[number], { rank: number }>(
  `SELECT COUNT(*) + 1 AS rank FROM players WHERE best_score > ?`,
);

const topScoreStmt = db.prepare<[], Pick<PlayerRecord, 'name' | 'best_score'>>(
  `SELECT name, best_score FROM players ORDER BY best_score DESC, updated_at ASC LIMIT 1`,
);

function toLeaderboardEntry(row: PlayerRecord, rank: number): LeaderboardEntry {
  return {
    rank,
    name: row.name,
    bestScore: row.best_score,
    gamesPlayed: row.games_played,
    updatedAt: row.updated_at,
  };
}

/** Normalizes a display name into a stable lookup key (trim + casefold). */
export function normalizeName(name: string): string {
  return name.trim();
}

/**
 * Records the outcome of one game for `name`. Creates the player on their
 * first submission; on every submission after that, increments their game
 * count and raises `best_score` only if the new score is higher.
 */
export function submitScore(name: string, score: number): SubmitScoreResult {
  const key = normalizeName(name);
  const existing = getPlayerStmt.get(key);

  if (!existing) {
    insertPlayerStmt.run(key, score);
  } else {
    const nextBest = Math.max(existing.best_score, score);
    updatePlayerStmt.run(nextBest, key);
  }

  const player = getPlayerStmt.get(key) as PlayerRecord;
  const { rank } = rankStmt.get(player.best_score) as { rank: number };

  return {
    name: player.name,
    bestScore: player.best_score,
    gamesPlayed: player.games_played,
    isNewBest: !existing || score > existing.best_score,
    rank,
  };
}

/** Returns the top `limit` players, ranked by best score. */
export function getLeaderboard(limit: number): LeaderboardEntry[] {
  const rows = leaderboardStmt.all(limit);
  return rows.map((row, index) => toLeaderboardEntry(row, index + 1));
}

/** Returns the single highest score ever recorded, or `null` if no games have been played yet. */
export function getTopScore(): TopScore | null {
  const row = topScoreStmt.get();
  if (!row) return null;
  return { name: row.name, bestScore: row.best_score };
}

/** Returns one player's record with their current rank, or `null`. */
export function getPlayer(name: string): LeaderboardEntry | null {
  const key = normalizeName(name);
  const player = getPlayerStmt.get(key);
  if (!player) return null;

  const { rank } = rankStmt.get(player.best_score) as { rank: number };
  return toLeaderboardEntry(player, rank);
}
