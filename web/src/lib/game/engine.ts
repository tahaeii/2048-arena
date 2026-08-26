import { BOARD_SIZE, INITIAL_TILE_COUNT, SPAWN_FOUR_PROBABILITY, WIN_VALUE } from './constants';
import type { Direction, MoveResult, Tile } from './types';

/**
 * Generates a unique tile id. Falls back to a manual generator when
 * `crypto.randomUUID` is unavailable (older browsers / non-secure contexts).
 */
function createTileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `tile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Builds a `size x size` grid of tile values (null = empty cell). */
function buildValueGrid(tiles: Tile[], size: number): Array<Array<number | null>> {
  const grid: Array<Array<number | null>> = Array.from({ length: size }, () =>
    Array<number | null>(size).fill(null),
  );
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile.value;
  }
  return grid;
}

/** Returns the coordinates of every empty cell on the board. */
function getEmptyCells(tiles: Tile[], size: number): Array<{ row: number; col: number }> {
  const occupied = new Set(tiles.map((tile) => `${tile.row}:${tile.col}`));
  const empty: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!occupied.has(`${row}:${col}`)) empty.push({ row, col });
    }
  }
  return empty;
}

/** Spawns one new tile (value 2 or 4) on a random empty cell, if any exist. */
export function spawnRandomTile(tiles: Tile[], size: number = BOARD_SIZE): Tile[] {
  const emptyCells = getEmptyCells(tiles, size);
  if (emptyCells.length === 0) return tiles;

  const spot = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < SPAWN_FOUR_PROBABILITY ? 4 : 2;

  return [...tiles, { id: createTileId(), value, row: spot.row, col: spot.col, isNew: true }];
}

/** Creates the starting board for a fresh game. */
export function createInitialTiles(size: number = BOARD_SIZE): Tile[] {
  let tiles: Tile[] = [];
  for (let i = 0; i < INITIAL_TILE_COUNT; i += 1) {
    tiles = spawnRandomTile(tiles, size);
  }
  return tiles;
}

/**
 * Groups tiles into ordered "lines" along the axis of travel.
 * Each line is sorted so index 0 is the tile closest to the edge
 * it is sliding toward — this makes the collapse step a simple sweep.
 */
function buildOrderedLines(tiles: Tile[], size: number, direction: Direction): Tile[][] {
  const isHorizontal = direction === 'left' || direction === 'right';
  const isReversed = direction === 'right' || direction === 'down';

  const lines: Tile[][] = Array.from({ length: size }, () => []);
  for (const tile of tiles) {
    const lineIndex = isHorizontal ? tile.row : tile.col;
    lines[lineIndex].push(tile);
  }

  return lines.map((line) =>
    [...line].sort((a, b) => {
      const posA = isHorizontal ? a.col : a.row;
      const posB = isHorizontal ? b.col : b.row;
      return isReversed ? posB - posA : posA - posB;
    }),
  );
}

/** Maps a (line index, position-within-line) pair back to board coordinates. */
function resolvePosition(
  direction: Direction,
  lineIndex: number,
  posIndex: number,
  size: number,
): { row: number; col: number } {
  switch (direction) {
    case 'left':
      return { row: lineIndex, col: posIndex };
    case 'right':
      return { row: lineIndex, col: size - 1 - posIndex };
    case 'up':
      return { row: posIndex, col: lineIndex };
    case 'down':
      return { row: size - 1 - posIndex, col: lineIndex };
    default:
      return { row: lineIndex, col: posIndex };
  }
}

/**
 * Collapses one ordered line: adjacent equal-value tiles merge into the
 * leading tile, doubling its value. A merged tile never merges again in
 * the same move, matching classic 2048 rules.
 */
function collapseLine(line: Tile[]): { result: Tile[]; scoreGained: number } {
  const result: Tile[] = [];
  let scoreGained = 0;
  let i = 0;

  while (i < line.length) {
    const current = line[i];
    const next = line[i + 1];

    if (next && next.value === current.value) {
      const mergedValue = current.value * 2;
      result.push({ ...current, value: mergedValue, isMerged: true, isNew: false });
      scoreGained += mergedValue;
      i += 2;
    } else {
      result.push({ ...current, isMerged: false, isNew: false });
      i += 1;
    }
  }

  return { result, scoreGained };
}

/**
 * Slides and merges the whole board one step in `direction`.
 * Returns the resulting tiles, points gained, and whether anything changed
 * (a no-op move should not spawn a new tile or count as a turn).
 */
export function move(tiles: Tile[], direction: Direction, size: number = BOARD_SIZE): MoveResult {
  const lines = buildOrderedLines(tiles, size, direction);
  const nextTiles: Tile[] = [];
  let scoreGained = 0;
  let moved = false;

  lines.forEach((line, lineIndex) => {
    const { result, scoreGained: gained } = collapseLine(line);
    scoreGained += gained;
    if (result.length !== line.length) moved = true;

    result.forEach((tile, posIndex) => {
      const { row, col } = resolvePosition(direction, lineIndex, posIndex, size);
      if (tile.row !== row || tile.col !== col) moved = true;
      nextTiles.push({ ...tile, row, col });
    });
  });

  return { tiles: nextTiles, scoreGained, moved };
}

/** True once any tile has reached the win value. */
export function hasWinningTile(tiles: Tile[]): boolean {
  return tiles.some((tile) => tile.value >= WIN_VALUE);
}

/** True when the board is full and no adjacent tiles share a value. */
export function isGameOver(tiles: Tile[], size: number = BOARD_SIZE): boolean {
  if (tiles.length < size * size) return false;

  const grid = buildValueGrid(tiles, size);
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const value = grid[row][col];
      const right = col + 1 < size ? grid[row][col + 1] : null;
      const down = row + 1 < size ? grid[row + 1][col] : null;
      if (value === right || value === down) return false;
    }
  }
  return true;
}
