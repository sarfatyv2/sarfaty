'use client';

import { useEffect, useRef } from 'react';
import { createRealtimeClient } from '@/lib/supabase/realtime-client';
import { toast } from 'sonner';

interface UseNotificationRealtimeOptions {
  userId: string | null;
  onNewNotification: () => void;
}

export function useNotificationRealtime({ userId, onNewNotification }: UseNotificationRealtimeOptions) {
  const channelRef = useRef<ReturnType<ReturnType<typeof createRealtimeClient>['channel']> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createRealtimeClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          const record = payload.new as { title?: string; message?: string };
          if (record.title) {
            toast.info(record.title, {
              description: record.message,
              duration: 5000,
            });
          }
          onNewNotification();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, onNewNotification]);
}
