import type { NextConfig } from "next";

/**
 * Next.js configuration.
 * `reactStrictMode` is kept on to surface unsafe side-effects early,
 * which matters here because the game engine relies on client-only state.
 */
const nextConfig: NextConfig = { reactStrictMode: true };

export default nextConfig;
