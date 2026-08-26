/** Board dimensions (4x4 is the classic 2048 layout). */
export const BOARD_SIZE = 4;

/** Value that triggers the "win" overlay. */
export const WIN_VALUE = 2048;

/** Probability of spawning a `4` instead of a `2` on a new tile. */
export const SPAWN_FOUR_PROBABILITY = 0.1;

/** Number of tiles placed on the board when a new game starts. */
export const INITIAL_TILE_COUNT = 2;

/** localStorage key used to persist the best score between sessions. */
export const BEST_SCORE_STORAGE_KEY = '2048-arena:best-score';

/**
 * Visual tokens per tile value, in the "Copper Clay" palette. Each entry
 * is a two-stop diagonal gradient for a subtle glossy, tactile look, and
 * the ramp moves from muted clay at low values to a glowing ember gold
 * at 2048 — every step is a distinct, purposeful shade in the same
 * warm hue family.
 */
export const TILE_STYLES: Record<number, { bg: string; text: string }> = {
  2: { bg: 'linear-gradient(155deg, #46392c 0%, #362b21 100%)', text: '#ece0cd' },
  4: { bg: 'linear-gradient(155deg, #59493a 0%, #443626 100%)', text: '#f6ecd9' },
  8: { bg: 'linear-gradient(155deg, #7a4f28 0%, #61401f 100%)', text: '#fbeed7' },
  16: { bg: 'linear-gradient(155deg, #96591c 0%, #7c4816 100%)', text: '#fff2de' },
  32: { bg: 'linear-gradient(155deg, #b5661a 0%, #985416 100%)', text: '#fff4e2' },
  64: { bg: 'linear-gradient(155deg, #d17318 0%, #b25f14 100%)', text: '#fff7ea' },
  128: { bg: 'linear-gradient(155deg, #e6941f 0%, #cf7c17 100%)', text: '#241a10' },
  256: { bg: 'linear-gradient(155deg, #efac2b 0%, #e0921c 100%)', text: '#241a10' },
  512: { bg: 'linear-gradient(155deg, #f7c548 0%, #eeac26 100%)', text: '#241a10' },
  1024: { bg: 'linear-gradient(155deg, #ffdb76 0%, #f8c348 100%)', text: '#241a10' },
  2048: { bg: 'linear-gradient(155deg, #ffe8a0 0%, #ffd066 100%)', text: '#241a10' },
};

/** Fallback style used for any tile value beyond 2048 — a warm ember-red, still in-family. */
export const OVERFLOW_TILE_STYLE = {
  bg: 'linear-gradient(155deg, #e2624a 0%, #c1402a 100%)',
  text: '#2a0f09',
};

/** Returns the visual style tokens for a given tile value. */
export function getTileStyle(value: number): { bg: string; text: string } {
  return TILE_STYLES[value] ?? OVERFLOW_TILE_STYLE;
}
