import { Router } from 'express';
import {
  getLeaderboardHandler,
  getPlayerHandler,
  getTopScoreHandler,
  postScore,
  submitScoreSchema,
} from '../controllers/scores.controller';
import { validateBody } from '../middleware/validate';

export const scoresRouter = Router();

/** GET /api/scores?limit=50 — top players, best score first. */
scoresRouter.get('/', getLeaderboardHandler);

/**
 * GET /api/scores/top — the single highest score ever recorded.
 * Registered before the `/:name` route below so the literal path "top"
 * is never swallowed by the dynamic `:name` segment.
 */
scoresRouter.get('/top', getTopScoreHandler);

/** GET /api/scores/:name — one player's best score and rank. */
scoresRouter.get('/:name', getPlayerHandler);

/** POST /api/scores { name, score } — submit a finished game's score. */
scoresRouter.post('/', validateBody(submitScoreSchema), postScore);
