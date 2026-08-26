import { createApp } from './app';
import { env } from './config/env';
import './db'; // runs the migration as a side effect on import

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`2048 Arena leaderboard API listening on http://localhost:${env.PORT}`);
  console.log(`Allowed origins: ${env.corsOrigins.join(', ')}`);
});
