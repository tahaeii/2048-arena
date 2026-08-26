import type { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler';
import { getLeaderboard, getPlayer, getTopScore, submitScore } from '../services/scores.service';

/** A player name: short, human-typed, Unicode-friendly (supports Persian names). */
export const submitScoreSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(24, 'Name must be 24 characters or fewer'),
  score: z.number().int().min(0).max(1_000_000),
});

export function postScore(req: Request, res: Response): void {
  const { name, score } = req.body as z.infer<typeof submitScoreSchema>;
  const result = submitScore(name, score);
  res.status(200).json(result);
}

export function getLeaderboardHandler(req: Request, res: Response): void {
  const limitParam = Number.parseInt(String(req.query.limit ?? '50'), 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;
  res.status(200).json({ entries: getLeaderboard(limit) });
}

/** GET /api/scores/top — the single highest score ever recorded, across every player. */
export function getTopScoreHandler(req: Request, res: Response): void {
  res.status(200).json({ top: getTopScore() });
}

export function getPlayerHandler(req: Request, res: Response): void {
  const player = getPlayer(req.params.name);
  if (!player) {
    throw new HttpError(404, `No record found for "${req.params.name}"`);
  }
  res.status(200).json(player);
}
