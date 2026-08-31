'use client';

import { useEffect, useRef, useState } from 'react';
import { ControlsHint } from '@/components/game/ControlsHint';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { GameOverlay } from '@/components/game/GameOverlay';
import { LeaderboardPanel } from '@/components/game/LeaderboardPanel';
import { PlayerNameGate } from '@/components/game/PlayerNameGate';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { usePlayerName } from '@/hooks/usePlayerName';
import { fetchTopScore, submitScore, type TopScoreResult } from '@/lib/api/scores';
import { enqueuePendingScore, flushPendingScores } from '@/lib/api/scoreQueue';

type SubmissionState = 'idle' | 'saving' | 'saved' | 'error';

/** Composes the full playable game: name gate, header, board, overlay and leaderboard. */
export function GameContainer() {
  const { state, makeMove, restart, keepPlaying } = useGameEngine();
  const { name, isLoaded, setName } = usePlayerName();

  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [submission, setSubmission] = useState<{ state: SubmissionState; rank?: number }>({
    state: 'idle',
  });
  const [globalTop, setGlobalTop] = useState<TopScoreResult | null>(null);

  const interactive = state.status === 'playing' || (state.status === 'won' && state.keepPlayingAfterWin);
  useKeyboardControls(makeMove, interactive);

  // Load the all-time best score once on mount, for the header's third stat.
  useEffect(() => {
    let cancelled = false;
    fetchTopScore()
      .then((top) => {
        if (!cancelled) setGlobalTop(top);
      })
      .catch(() => {
        // Non-critical: the header simply shows "—" until it can load.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Submit the final score exactly once per finished game. A game "finishes"
  // either by losing, or by reaching 2048 without choosing to keep playing —
  // both count, so a win the player doesn't continue is never lost from the
  // leaderboard. The tile-id fingerprint changes on every new game (and
  // again after "keep playing" produces new merges), so it doubles as a
  // per-attempt token that lets the same session submit twice: once on
  // "won", and again with a higher score if they keep playing and later lose.
  // const submittedForGameRef = useRef<string | null>(null);
  // useEffect(() => {
  //   if (state.status !== 'lost' && state.status !== 'won') return;
  //   if (!name) return;

  //   const gameFingerprint = state.tiles.map((tile) => tile.id).join(',');
  //   if (submittedForGameRef.current === gameFingerprint) return;
  //   submittedForGameRef.current = gameFingerprint;

  //   setSubmission({ state: 'saving' });
  //   submitScore(name, state.score)
  //     .then((result) => {
  //       setSubmission({ state: 'saved', rank: result.rank });
  //       // The submission may have set a new all-time record; refresh it.
  //       fetchTopScore()
  //         .then(setGlobalTop)
  //         .catch(() => {});
  //     })
  //     .catch(() => setSubmission({ state: 'error' }));
  // }, [state.status, state.score, state.tiles, name]);
  const submittedForGameRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.status !== 'lost' && state.status !== 'won') return;
    if (!name) return;

    const gameFingerprint = state.tiles.map((tile) => tile.id).join(',');
    if (submittedForGameRef.current === gameFingerprint) return;
    submittedForGameRef.current = gameFingerprint;

    setSubmission({ state: 'saving' });
    submitScore(name, state.score)
      .then((result) => {
        setSubmission({ state: 'saved', rank: result.rank });
        fetchTopScore()
          .then(setGlobalTop)
          .catch(() => {});
      })
      .catch(() => {
        // Request failed (most likely the connection dropped). Persist it
        // locally so it isn't lost — it's retried automatically once the
        // connection returns (see the effect below).
        enqueuePendingScore({ name, score: state.score, fingerprint: gameFingerprint });
        setSubmission({ state: 'error' });
      });
  }, [state.status, state.score, state.tiles, name]);

  // Retry any scores that failed earlier: once on mount (in case the page
  // reloaded while offline) and again whenever the browser reconnects.
  useEffect(() => {
    function retryPending() {
      flushPendingScores((entry, result) => {
        if (entry.fingerprint === submittedForGameRef.current) {
          setSubmission({ state: 'saved', rank: result.rank });
        }
      })
        .then(() => fetchTopScore().then(setGlobalTop).catch(() => {}))
        .catch(() => {});
    }

    retryPending();
    window.addEventListener('online', retryPending);
    return () => window.removeEventListener('online', retryPending);
  }, []);
  function handleRestart() {
    setSubmission({ state: 'idle' });
    restart();
  }

  return (
    <div className='flex w-full max-w-md animate-fade-up flex-col gap-5'>
      {isLoaded && !name && <PlayerNameGate onSubmit={setName} />}

      <GameHeader
        score={state.score}
        bestScore={state.bestScore}
        globalTop={globalTop}
        onRestart={handleRestart}
        onShowLeaderboard={() => setLeaderboardOpen(true)}
      />

      <div className='relative'>
        <GameBoard tiles={state.tiles} size={state.size} onMove={makeMove} interactive={interactive} />
        <GameOverlay
          status={state.status}
          onRestart={handleRestart}
          onKeepPlaying={keepPlaying}
          submission={submission}
        />
      </div>

      <ControlsHint />

      <LeaderboardPanel
        isOpen={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentPlayerName={name}
      />
    </div>
  );
}
