import { useEffect } from 'react';
import { webSocketService, ThreadEvent } from '@/src/services/WebSocketService';

export function useWebSocketThreads({
  enabled,
  token,
  onEvent,
}: {
  enabled: boolean;
  token: string | null;
  onEvent: (event: ThreadEvent) => void;
}) {
  useEffect(() => {
    if (!enabled || !token) return;

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const start = async () => {
      await webSocketService.connect(token);
      if (cancelled) return;
      unsubscribe = webSocketService.subscribeToThreads(onEvent);
    };

    void start();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [enabled, token, onEvent]);
}
