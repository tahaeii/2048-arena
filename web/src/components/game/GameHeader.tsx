import { ScoreCard } from '@/components/game/ScoreCard';
import { Button } from '@/components/ui/Button';
import type { TopScoreResult } from '@/lib/api/scores';

interface GameHeaderProps {
  score: number;
  bestScore: number;
  /** The single highest score recorded across every player, or `null` until loaded / if none yet. */
  globalTop: TopScoreResult | null;
  onRestart: () => void;
  onShowLeaderboard: () => void;
}

/**
 * Top section: title + actions on one row, then a full-width row of three
 * stats — the live score, the player's own best, and the all-time best
 * recorded on the server — so all three are legible on any screen size.
 */
export function GameHeader({ score, bestScore, globalTop, onRestart, onShowLeaderboard }: GameHeaderProps) {
  return (
    <header className='flex w-full flex-col gap-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='font-display text-4xl font-bold tracking-tight text-ash-100 sm:text-5xl'>2048</h1>
          <p className='mt-1 max-w-[220px] text-sm leading-snug text-ash-400'>
            Combine tiles of the same value to reach the ember gold tile.
          </p>
        </div>
        <div className='flex shrink-0 gap-2'>
          <Button variant='ghost' onClick={onShowLeaderboard} className='text-xs'>
            Leaderboard
          </Button>
          <Button variant='ghost' onClick={onRestart} className='text-xs'>
            New game
          </Button>
        </div>
      </div>

      <div className='flex gap-2'>
        <ScoreCard label='Score' value={score} />
        <ScoreCard label='Your best' value={bestScore} />
        <ScoreCard
          label='Global best'
          value={globalTop ? globalTop.bestScore : '—'}
          caption={globalTop?.name}
          accent
        />
      </div>
    </header>
  );
}
