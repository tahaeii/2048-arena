import type { Config } from 'tailwindcss';

/**
 * Tailwind theme for the "Copper Clay" palette: a warm, dark, slightly
 * worn color story. Every neutral & every accent shares the same
 * brown/amber hue family (instead of a generic gray + unrelated accent),
 * so the UI reads as one deliberate, cohesive material.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Neutral surface ramp. Deepened at the dark end for more depth
         * on OLED-style screens; the mid/light steps stayed close to the
         * original values so existing contrast pairings stay legible.
         */
        ash: {
          950: '#19140f',
          900: '#201a14',
          850: '#28211a',
          800: '#332920',
          700: '#42352a',
          600: '#544435',
          500: '#75604e',
          400: '#9c876f',
          300: '#c4b09a',
          200: '#e3d5c1',
          100: '#f6efe4',
        },
        /**
         * Warm accent ramp — used for the primary action, focus rings,
         * glows and the leaderboard's highlighted score.
         */
        ember: {
          900: '#3f2a10',
          700: '#8a5518',
          600: '#b6721c',
          500: '#dd8f22',
          400: '#f0a83c',
          300: '#f8c563',
          200: '#ffdf8f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        tile: '0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.15)',
        panel: '0 24px 70px -24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
        glowSm: '0 0 0 1px rgba(240,168,60,0.15), 0 4px 16px -4px rgba(240,168,60,0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        glow: 'glow 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
