import { useEffect, useRef } from 'react';
import { MESSAGE_FEATURE_FLAGS } from '@/lib/config/featureFlags';

const BASE_INTERVAL_MS = 12000;
const MAX_INTERVAL_MS = 48000;

export function useMessagePolling({
  enabled,
  refetch,
}: {
  enabled: boolean;
  refetch: () => Promise<unknown>;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const backoffRef = useRef(BASE_INTERVAL_MS);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!MESSAGE_FEATURE_FLAGS.USE_POLLING_MESSAGES) return;
    if (MESSAGE_FEATURE_FLAGS.USE_WS_MESSAGES) return;
    if (!enabled) return;
    if (typeof document === 'undefined') return;

    const schedule = (delay: number) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(run, delay);
    };

    const run = async () => {
      if (!isMountedRef.current || !enabled) return;
      if (document.hidden) {
        schedule(backoffRef.current);
        return;
      }
      if (inFlightRef.current) {
        schedule(backoffRef.current);
        return;
      }
      inFlightRef.current = true;
      try {
        await refetch();
        backoffRef.current = BASE_INTERVAL_MS;
      } catch {
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_INTERVAL_MS);
      } finally {
        inFlightRef.current = false;
        if (!isMountedRef.current) return;
        schedule(backoffRef.current);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      backoffRef.current = BASE_INTERVAL_MS;
      schedule(0);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    schedule(0);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, refetch]);
}
