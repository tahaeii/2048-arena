import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  DATABASE_PATH: z.string().min(1).default('./data/leaderboard.sqlite3'),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(30),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable message instead of a cryptic runtime error.
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/** Parsed and validated environment variables, safe to import anywhere. */
export const env = {
  ...parsed.data,
  /** Allowed CORS origins, split from the comma-separated env value. */
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
};
