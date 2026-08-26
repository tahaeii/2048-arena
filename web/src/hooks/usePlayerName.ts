'use client';

import { useCallback, useEffect, useState } from 'react';

const PLAYER_NAME_STORAGE_KEY = '2048-arena:player-name';

/**
 * Tracks the player's display name, persisted in `localStorage`.
 * Returns `null` until the client has checked storage, so callers can tell
 * "not loaded yet" apart from "genuinely has no name".
 */
export function usePlayerName() {
  const [name, setNameState] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setNameState(window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY));
  }, []);

  const setName = useCallback((value: string) => {
    const trimmed = value.trim();
    window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmed);
    setNameState(trimmed);
  }, []);

  return { name, isLoaded: name !== undefined, setName };
}
