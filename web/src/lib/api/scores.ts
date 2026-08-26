/** Base URL of the leaderboard API. Configure via NEXT_PUBLIC_API_URL. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  bestScore: number;
  gamesPlayed: number;
  updatedAt: string;
}

export interface SubmitScoreResult {
  name: string;
  bestScore: number;
  gamesPlayed: number;
  isNewBest: boolean;
  rank: number;
}

export interface TopScoreResult {
  name: string;
  bestScore: number;
}

/** Submits a finished game's score for `name`. The backend only keeps the best. */
export async function submitScore(name: string, score: number): Promise<SubmitScoreResult> {
  const response = await fetch(`${API_URL}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit score (${response.status})`);
  }
  return response.json();
}

/** Fetches the top `limit` players, best score first. */
export async function fetchLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_URL}/api/scores?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to load leaderboard (${response.status})`);
  }
  const data = (await response.json()) as { entries: LeaderboardEntry[] };
  return data.entries;
}

/** Fetches the single highest score ever recorded across every player, or `null` if none yet. */
export async function fetchTopScore(): Promise<TopScoreResult | null> {
  const response = await fetch(`${API_URL}/api/scores/top`);
  if (!response.ok) {
    throw new Error(`Failed to load top score (${response.status})`);
  }
  const data = (await response.json()) as { top: TopScoreResult | null };
  return data.top;
}
