'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { GameStatus } from '@/lib/game/types';

interface GameOverlayProps {
  status: GameStatus;
  onRestart: () => void;
  onKeepPlaying: () => void;
  submission?: { state: 'idle' | 'saving' | 'saved' | 'error'; rank?: number };
}

const COPY: Record<Exclude<GameStatus, 'playing'>, { title: string; subtitle: string }> = {
  won: { title: 'You reached 2048', subtitle: 'Keep merging for a higher score, or start fresh.' },
  lost: { title: 'No moves left', subtitle: 'The board is full and nothing can merge.' },
};

function SubmissionStatus({ submission }: { submission: GameOverlayProps['submission'] }) {
  if (!submission || submission.state === 'idle') return null;
  if (submission.state === 'saving') {
    return <p className='mt-3 text-xs text-ash-500'>Saving your score…</p>;
  }
  if (submission.state === 'error') {
    return <p className='mt-3 text-xs text-ash-500'>Couldn't reach the leaderboard server.</p>;
  }
  return (
    <p className='mt-3 text-xs text-ember-300'>
      Saved to the leaderboard{submission.rank ? ` — rank #${submission.rank}` : ''}.
    </p>
  );
}

/** Dims the board and shows a win/lose message with next-step actions. */
export function GameOverlay({ status, onRestart, onKeepPlaying, submission }: GameOverlayProps) {
  return (
    <AnimatePresence>
      {(status === 'won' || status === 'lost') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-ash-950/80 text-center backdrop-blur-sm'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
            className='px-6'>
            <p className='font-display text-2xl font-bold text-ash-100 sm:text-3xl'>{COPY[status].title}</p>
            <p className='mt-2 text-sm text-ash-400'>{COPY[status].subtitle}</p>
            {(status === 'lost' || status === 'won') && <SubmissionStatus submission={submission} />}
            <div className='mt-6 flex justify-center gap-3'>
              {status === 'won' && (
                <Button variant='ghost' onClick={onKeepPlaying}>
                  Keep playing
                </Button>
              )}
              <Button variant='primary' onClick={onRestart}>
                New game
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
