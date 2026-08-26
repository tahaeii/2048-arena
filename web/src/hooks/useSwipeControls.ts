'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Direction } from '@/lib/game/types';

/** Minimum finger travel, in pixels, before a touch counts as a swipe. */
const SWIPE_THRESHOLD_PX = 24;

interface TouchPoint {
  x: number;
  y: number;
}

/** Binds single-finger swipe gestures on `ref` to `onMove`, for mobile play. */
export function useSwipeControls<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onMove: (direction: Direction) => void,
  enabled = true,
) {
  const startRef = useRef<TouchPoint | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchMove(event: TouchEvent) {
      // Block page scroll/pull-to-refresh while a swipe is in progress.
      if (startRef.current) event.preventDefault();
    }

    function handleTouchEnd(event: TouchEvent) {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) < SWIPE_THRESHOLD_PX) return;

      const direction: Direction = absX > absY ? (deltaX > 0 ? 'right' : 'left') : deltaY > 0 ? 'down' : 'up';

      onMove(direction);
    }

    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: false });
    node.addEventListener('touchend', handleTouchEnd);

    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onMove, enabled]);
}
