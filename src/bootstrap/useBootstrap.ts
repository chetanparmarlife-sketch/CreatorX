import { useCallback, useEffect, useRef, useState } from 'react';
import { bootstrapApp } from '@/src/bootstrap/bootstrap';
import { useAuth } from '@/src/context/AuthContext';
import { useApp } from '@/src/context';

export function useBootstrap() {
  const { initialized, isAuthenticated, signOut } = useAuth();
  const { refreshData } = useApp();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const running = useRef(false);

  useEffect(() => {
    if (!initialized || running.current || error) return;
    running.current = true;

    const run = async () => {
      try {
        const { requiresReauth } = await bootstrapApp();

        if (requiresReauth && isAuthenticated) {
          await signOut();
        } else if (isAuthenticated) {
          await refreshData();
        }
        setReady(true);
      } catch (err) {
        const resolvedError = err instanceof Error ? err : new Error('Bootstrap failed');
        setError(resolvedError);
        setReady(false);
      } finally {
        running.current = false;
      }
    };

    run();
  }, [attempt, initialized, isAuthenticated, refreshData, signOut, error]);

  const retry = useCallback(() => {
    if (running.current) return;
    setError(null);
    setReady(false);
    setAttempt((prev) => prev + 1);
  }, []);

  return { ready, error, retry };
}
