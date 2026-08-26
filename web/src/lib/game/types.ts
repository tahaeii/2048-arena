/** Cardinal direction the player can slide the board in. */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** A single numbered tile living on the board. */
export interface Tile {
  /** Stable identity used for animation continuity across renders. */
  id: string;
  /** Current numeric value (always a power of two). */
  value: number;
  row: number;
  col: number;
  /** True for exactly one render frame after the tile spawns. */
  isNew?: boolean;
  /** True for exactly one render frame after two tiles merge into this one. */
  isMerged?: boolean;
}

/** Lifecycle status of a single game session. */
export type GameStatus = 'playing' | 'won' | 'lost';

/** Full serializable state of the game session. */
export interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  status: GameStatus;
  /** Board is `size x size`. */
  size: number;
  /** Set once the player has dismissed the "you won" overlay to keep playing. */
  keepPlayingAfterWin: boolean;
}

/** Result of attempting to slide the board in a direction. */
export interface MoveResult {
  tiles: Tile[];
  scoreGained: number;
  moved: boolean;
}
