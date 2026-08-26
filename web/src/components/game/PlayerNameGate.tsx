'use client';

import { motion } from 'framer-motion';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PlayerNameGateProps {
  onSubmit: (name: string) => void;
}

/** Full-screen prompt shown once, before the player's first game, to collect a display name. */
export function PlayerNameGate({ onSubmit }: PlayerNameGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter a name to join the leaderboard.');
      return;
    }
    if (trimmed.length > 24) {
      setError('Keep it under 24 characters.');
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-ash-950/70 px-4 backdrop-blur-sm'>
      <motion.form
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onSubmit={handleSubmit}
        className='w-full max-w-sm rounded-2xl border border-ash-700/60 bg-ash-850 p-6 shadow-panel'>
        <p className='font-display text-xl font-bold text-ash-100'>Who's playing?</p>
        <p className='mt-1 text-sm text-ash-400'>
          Your name goes on the shared leaderboard so your best score is saved.
        </p>

        <input
          autoFocus
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          placeholder='Your name'
          maxLength={24}
          className='mt-4 w-full rounded-xl border border-ash-600/60 bg-ash-900 px-3.5 py-2.5 text-ash-100 placeholder:text-ash-500 focus:border-ember-400 focus:outline-none focus:ring-1 focus:ring-ember-400'
        />
        {error && <p className='mt-2 text-xs text-ember-300'>{error}</p>}

        <Button type='submit' className='mt-4 w-full'>
          Start playing
        </Button>
      </motion.form>
    </div>
  );
}
