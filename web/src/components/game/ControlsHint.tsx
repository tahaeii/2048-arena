/** Short instructional line, shown beneath the board. */
export function ControlsHint() {
  return (
    <div className='relative text-center text-xs text-ash-500'>
      <p className='font-medium'>
        <span className='hidden sm:inline'>Use the arrow keys to move</span>
        <span className='sm:hidden'>Swipe in any direction to move.</span>
      </p>

      <span className='absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap'>
        Built by Taha Aref · Part of{' '}
        <a
          href='https://ferdowsi.cloud/en'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:underline'>
          Ferdowsi Cloud
        </a>
      </span>
    </div>
  );
}
