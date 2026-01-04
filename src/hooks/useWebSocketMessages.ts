import { useEffect } from 'react';
import { webSocketService, MessageEvent } from '@/src/services/WebSocketService';

export function useWebSocketMessages({
  enabled,
  token,
  threadId,
  onEvent,
}: {
  enabled: boolean;
  token: string | null;
  threadId: string | null;
  onEvent: (event: MessageEvent) => void;
}) {
  useEffect(() => {
    if (!enabled || !token || !threadId) return;

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const start = async () => {
      await webSocketService.connect(token);
      if (cancelled) return;
      unsubscribe = webSocketService.subscribeToThreadMessages(threadId, onEvent);
    };

    void start();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [enabled, token, threadId, onEvent]);
}
