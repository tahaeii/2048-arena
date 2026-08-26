'use client';

import { useEffect } from 'react';
import type { Direction } from '@/lib/game/types';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Binds arrow keys to `onMove`, for desktop play. */
export function useKeyboardControls(onMove: (direction: Direction) => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) return;
      // Prevent the page from scrolling while playing.
      event.preventDefault();
      onMove(direction);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, enabled]);
}
