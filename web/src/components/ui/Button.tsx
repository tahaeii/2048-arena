import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-ember-500 text-ash-950 hover:bg-ember-400 active:bg-ember-600 shadow-tile',
  ghost: 'bg-ash-800/80 text-ash-200 hover:bg-ash-700 active:bg-ash-800 border border-ash-600/60',
};

/** Small, high-contrast action button used across the game UI. */
export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ash-900',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
