'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { BEST_SCORE_STORAGE_KEY, BOARD_SIZE } from '@/lib/game/constants';
import { createInitialTiles, hasWinningTile, isGameOver, move, spawnRandomTile } from '@/lib/game/engine';
import type { Direction, GameState, GameStatus } from '@/lib/game/types';

type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'RESTART' }
  | { type: 'KEEP_PLAYING' }
  | { type: 'HYDRATE_BEST_SCORE'; bestScore: number }
  | { type: 'START_GAME'; tiles: GameState['tiles'] };

/**
 * The very first render must be identical on the server and the client, so
 * it must NOT contain randomly generated tiles (that would make the server
 * HTML and the client's first render diverge and trigger a hydration
 * mismatch). The board starts empty and is filled in via `START_GAME`
 * inside a `useEffect`, which only ever runs on the client.
 */
function createInitialState(): GameState {
  return {
    tiles: [],
    score: 0,
    bestScore: 0,
    status: 'playing',
    size: BOARD_SIZE,
    keepPlayingAfterWin: false,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return { ...state, tiles: action.tiles };
    }
    case 'MOVE': {
      if (state.status === 'lost') return state;
      if (state.status === 'won' && !state.keepPlayingAfterWin) return state;

      const result = move(state.tiles, action.direction, state.size);
      if (!result.moved) return state;

      const tilesWithSpawn = spawnRandomTile(result.tiles, state.size);
      const score = state.score + result.scoreGained;
      const bestScore = Math.max(state.bestScore, score);

      let status: GameStatus = state.status;
      if (!state.keepPlayingAfterWin && hasWinningTile(tilesWithSpawn)) {
        status = 'won';
      } else if (isGameOver(tilesWithSpawn, state.size)) {
        status = 'lost';
      }

      return { ...state, tiles: tilesWithSpawn, score, bestScore, status };
    }
    case 'KEEP_PLAYING': {
      return { ...state, status: 'playing', keepPlayingAfterWin: true };
    }
    case 'RESTART': {
      return { ...createInitialState(), bestScore: state.bestScore, tiles: createInitialTiles(BOARD_SIZE) };
    }
    case 'HYDRATE_BEST_SCORE': {
      return { ...state, bestScore: Math.max(state.bestScore, action.bestScore) };
    }
    default:
      return state;
  }
}

/**
 * Owns the full lifecycle of a game session: move dispatching, win/lose
 * detection, and best-score persistence in `localStorage`.
 */
export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  // Spawn the real starting tiles after mount only — doing this during the
  // initial render would run on both server and client with different
  // random output and break hydration.
  useEffect(() => {
    dispatch({ type: 'START_GAME', tiles: createInitialTiles(BOARD_SIZE) });
  }, []);

  // Hydrate the persisted best score once, on mount (client only).
  useEffect(() => {
    const stored = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    const bestScore = stored ? Number.parseInt(stored, 10) : 0;
    if (Number.isFinite(bestScore) && bestScore > 0) {
      dispatch({ type: 'HYDRATE_BEST_SCORE', bestScore });
    }
  }, []);

  // Persist the best score whenever it improves.
  useEffect(() => {
    if (state.bestScore > 0) {
      window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(state.bestScore));
    }
  }, [state.bestScore]);

  const makeMove = useCallback((direction: Direction) => {
    dispatch({ type: 'MOVE', direction });
  }, []);

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const keepPlaying = useCallback(() => dispatch({ type: 'KEEP_PLAYING' }), []);

  return useMemo(() => ({ state, makeMove, restart, keepPlaying }), [state, makeMove, restart, keepPlaying]);
}
