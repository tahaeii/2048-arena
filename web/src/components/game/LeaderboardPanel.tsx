'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/api/scores';
import { cn } from '@/lib/utils/cn';

interface LeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName: string | null | undefined;
}

type LoadState = 'loading' | 'ready' | 'error';

/** Modal listing the top players from the shared leaderboard API. */
export function LeaderboardPanel({ isOpen, onClose, currentPlayerName }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoadState('loading');

    fetchLeaderboard(20)
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-ash-950/70 px-4 backdrop-blur-sm'
          onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className='flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-ash-700/60 bg-ash-850 p-5 shadow-panel'>
            <div className='flex items-center justify-between'>
              <p className='font-display text-lg font-bold text-ash-100'>Leaderboard</p>
              <button
                onClick={onClose}
                aria-label='Close leaderboard'
                className='rounded-lg px-2 py-1 text-ash-400 transition-colors hover:bg-ash-800 hover:text-ash-100'>
                ✕
              </button>
            </div>

            <div className='-mx-1 mt-3 flex-1 overflow-y-auto px-1'>
              {loadState === 'loading' && (
                <p className='py-8 text-center text-sm text-ash-400'>Loading scores…</p>
              )}

              {loadState === 'error' && (
                <p className='py-8 text-center text-sm text-ash-400'>
                  Couldn't reach the leaderboard server.
                </p>
              )}

              {loadState === 'ready' && entries.length === 0 && (
                <p className='py-8 text-center text-sm text-ash-400'>
                  No scores yet — be the first to finish a game.
                </p>
              )}

              {loadState === 'ready' &&
                entries.map((entry) => (
                  <div
                    key={entry.name}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                      entry.name === currentPlayerName ? 'bg-ember-900/40' : 'odd:bg-ash-800/40',
                    )}>
                    <div className='flex items-center gap-3'>
                      <span className='w-5 text-right font-display font-bold text-ash-400'>{entry.rank}</span>
                      <span className='text-ash-100'>{entry.name}</span>
                    </div>
                    <span className='font-display font-bold tabular-nums text-ember-300'>
                      {entry.bestScore}
                    </span>
                  </div>
                ))}
            </div>

            <Button variant='ghost' onClick={onClose} className='mt-4 w-full'>
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
