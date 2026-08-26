/**
 * PM2 process definitions for running both halves of 2048 Arena on a
 * single server. Build first (`npm run build`), then:
 *
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 *
 * Each app keeps its own working directory, so each reads its own
 * `.env` file (see `server/.env.example` and `web/.env.local.example`
 * — for the web app, remember env vars prefixed `NEXT_PUBLIC_*` are
 * baked in at build time, not read at start time).
 */
module.exports = {
  apps: [
    {
      name: '2048-arena-server',
      cwd: './server',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
      },
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '300M',
    },
    {
      name: '2048-arena-web',
      cwd: './web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '500M',
    },
  ],
};
