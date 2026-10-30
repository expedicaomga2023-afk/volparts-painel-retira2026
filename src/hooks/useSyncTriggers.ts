import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 15_000;

/**
 * Runs `sync` when the app opens, every few seconds while visible, when the window regains focus
 * and when the connection comes back — so every device converges on the latest cloud state.
 */
export function useSyncTriggers(sync: () => void) {
  const syncRef = useRef(sync);
  syncRef.current = sync;

  useEffect(() => {
    const run = () => {
      if (document.visibilityState === 'visible') syncRef.current();
    };

    run();
    const interval = window.setInterval(run, POLL_INTERVAL_MS);
    window.addEventListener('focus', run);
    window.addEventListener('online', run);
    document.addEventListener('visibilitychange', run);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', run);
      window.removeEventListener('online', run);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);
}
