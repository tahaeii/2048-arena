/** A row as stored in the `players` table. */
export interface PlayerRecord {
  name: string;
  best_score: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

/** A leaderboard entry as returned by the API, with its computed rank. */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  bestScore: number;
  gamesPlayed: number;
  updatedAt: string;
}

/** Response body for a score submission. */
export interface SubmitScoreResult {
  name: string;
  bestScore: number;
  gamesPlayed: number;
  isNewBest: boolean;
  rank: number;
}

/** The single highest score ever recorded, and who holds it. */
export interface TopScore {
  name: string;
  bestScore: number;
}
