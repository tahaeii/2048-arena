import { GameContainer } from '@/components/game/GameContainer';

export default function HomePage() {
  return (
    <main className='flex min-h-dvh w-full items-center justify-center px-4 py-10 sm:py-16'>
      <GameContainer />
    </main>
  );
}
