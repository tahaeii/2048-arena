'use client';

import { motion } from 'framer-motion';
import { getTileStyle } from '@/lib/game/constants';
import type { Tile } from '@/lib/game/types';
import { cn } from '@/lib/utils/cn';

interface GameTileProps {
  tile: Tile;
}

/** Font size shrinks as digit count grows, so large values never clip. */
function getFontSizeClass(value: number): string {
  if (value >= 1000) return 'text-lg sm:text-2xl';
  if (value >= 100) return 'text-xl sm:text-3xl';
  return 'text-2xl sm:text-4xl';
}

/**
 * A single animated tile. Position changes are driven by framer-motion's
 * `layout="position"` engine reacting to `gridRow` / `gridColumn` — since
 * tiles never change size (only position), animating position alone
 * skips the more expensive size/FLIP measurement, keeping every move
 * smooth even on low-end devices. Spawning and merging get their own
 * lightweight, explicit pop animations.
 */
export function GameTile({ tile }: GameTileProps) {
  const style = getTileStyle(tile.value);
  const isHighValue = tile.value >= 128;

  return (
    <motion.div
      layout='position'
      initial={tile.isNew ? { scale: 0.35, opacity: 0 } : false}
      animate={{
        scale: tile.isMerged ? [1, 1.14, 1] : 1,
        opacity: 1,
      }}
      transition={{
        layout: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.14 },
        scale: { duration: 0.18, ease: 'easeOut' },
        opacity: { duration: 0.12 },
      }}
      style={{
        gridRow: tile.row + 1,
        gridColumn: tile.col + 1,
        background: style.bg,
        color: style.text,
      }}
      className={cn(
        'flex aspect-square items-center justify-center rounded-lg font-display font-bold shadow-tile sm:rounded-xl',
        'will-change-transform',
        getFontSizeClass(tile.value),
        isHighValue && 'animate-glow',
      )}>
      {tile.value}
    </motion.div>
  );
}
