'use client';

import { AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { GameCell } from '@/components/game/GameCell';
import { GameTile } from '@/components/game/GameTile';
import { useSwipeControls } from '@/hooks/useSwipeControls';
import type { Direction, Tile } from '@/lib/game/types';

interface GameBoardProps {
  tiles: Tile[];
  size: number;
  onMove: (direction: Direction) => void;
  interactive: boolean;
}

/**
 * Renders the board surface (static cells) and the tile layer (animated,
 * absolutely aligned via a matching CSS grid) on top of it. Handles touch
 * swipes for mobile play.
 */
export function GameBoard({ tiles, size, onMove, interactive }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  useSwipeControls(boardRef, onMove, interactive);

  const gridStyle = { gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` };

  return (
    <div
      ref={boardRef}
      className='relative touch-none select-none rounded-2xl border border-ash-700/50 bg-ash-850/90 p-3 shadow-panel sm:p-4'
      role='group'
      aria-label='2048 game board'>
      <div className='grid gap-3 sm:gap-4' style={gridStyle}>
        {Array.from({ length: size * size }).map((_, index) => (
          <GameCell key={index} />
        ))}
      </div>

      <div className='absolute inset-3 grid gap-3 sm:inset-4 sm:gap-4' style={gridStyle}>
        <AnimatePresence>
          {tiles.map((tile) => (
            <GameTile key={tile.id} tile={tile} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
