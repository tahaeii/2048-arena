import { submitScore, type SubmitScoreResult } from './scores';

const PENDING_SCORES_KEY = 'arena2048.pendingScores';

interface PendingScore {
  name: string;
  score: number;
  fingerprint: string;
  savedAt: string;
}

function readQueue(): PendingScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PENDING_SCORES_KEY);
    return raw ? (JSON.parse(raw) as PendingScore[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingScore[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(queue));
}

/** Persists a score that failed to submit, so it can be retried later. */
export function enqueuePendingScore(entry: Omit<PendingScore, 'savedAt'>): void {
  const queue = readQueue().filter((item) => item.fingerprint !== entry.fingerprint);
  queue.push({ ...entry, savedAt: new Date().toISOString() });
  writeQueue(queue);
}

function removePendingScore(fingerprint: string): void {
  writeQueue(readQueue().filter((item) => item.fingerprint !== fingerprint));
}

/**
 * Attempts to resubmit every pending score, removing each on success.
 * Safe to call repeatedly (mount, reconnect) since entries that fail
 * again simply stay queued for the next attempt.
 */
export async function flushPendingScores(
  onEach?: (entry: PendingScore, result: SubmitScoreResult) => void,
): Promise<void> {
  const queue = readQueue();
  for (const entry of queue) {
    try {
      const result = await submitScore(entry.name, entry.score);
      removePendingScore(entry.fingerprint);
      onEach?.(entry, result);
    } catch {
      // Still offline / server unreachable — leave it queued, stop for now.
      break;
    }
  }
}