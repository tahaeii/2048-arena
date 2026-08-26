import cors from 'cors';
import express, { type Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { scoresRouter } from './routes/scores.routes';

/** Builds a fully configured Express app (kept separate from `listen()` for testability). */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      methods: ['GET', 'POST'],
    }),
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Only the score-submission endpoint needs rate limiting; reads are cheap.
  const submitLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: env.RATE_LIMIT_PER_MINUTE,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many submissions — please slow down.' },
  });
  app.use('/api/scores', (req, res, next) => {
    if (req.method === 'POST') return submitLimiter(req, res, next);
    next();
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/scores', scoresRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
