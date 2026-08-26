import { cn } from '@/lib/utils/cn';

interface ScoreCardProps {
  label: string;
  value: number | string;
  /** Optional small caption under the value, e.g. the record holder's name. */
  caption?: string;
  /** Gives the card a subtle ember-tinted border, for the standout stat. */
  accent?: boolean;
}

/** Small numeric readout used for the live score, personal best, and global best. */
export function ScoreCard({ label, value, caption, accent }: ScoreCardProps) {
  return (
    <div
      className={cn(
        'min-w-0 flex-1 rounded-xl border bg-ash-850/80 px-3 py-2 text-center shadow-tile backdrop-blur-sm',
        accent ? 'border-ember-500/40' : 'border-ash-700/60',
      )}>
      <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-ash-400'>{label}</p>
      <p className='font-display text-lg font-bold tabular-nums text-ash-100 sm:text-xl'>{value}</p>
      {caption && <p className='mt-0.5 truncate text-[10px] text-ash-500'>{caption}</p>}
    </div>
  );
}
