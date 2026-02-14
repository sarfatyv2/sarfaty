'use client';

import { useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

interface YouTubePlayerProps {
  videoId: string;
  enrollmentId?: string;
  lessonId: string;
  onProgressUpdate?: (pct: number) => void;
}

export function YouTubePlayer({
  videoId,
  enrollmentId,
  lessonId,
  onProgressUpdate,
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedPctRef = useRef(0);

  const saveProgress = useCallback(
    async (watchedPct: number) => {
      if (!enrollmentId || watchedPct <= lastSavedPctRef.current) return;
      lastSavedPctRef.current = watchedPct;
      onProgressUpdate?.(watchedPct);

      try {
        await api.patch(
          `/learning/enrollments/${enrollmentId}/lessons/${lessonId}/progress`,
          { watchedPct },
        );
      } catch {
        // Silent fail — will retry on next interval
      }
    },
    [enrollmentId, lessonId, onProgressUpdate],
  );

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('yt-player', {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              // Start polling every 10 seconds
              if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                  if (playerRef.current) {
                    const currentTime = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();
                    if (duration > 0) {
                      const pct = Math.min(Math.round((currentTime / duration) * 100), 100);
                      if (pct >= 90) {
                        void saveProgress(100);
                      } else if (pct > lastSavedPctRef.current + 5) {
                        void saveProgress(pct);
                      }
                    }
                  }
                }, 10_000);
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              void saveProgress(100);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              // Save on pause
              if (playerRef.current) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                  const pct = Math.min(Math.round((currentTime / duration) * 100), 100);
                  void saveProgress(pct);
                }
              }
            }
          },
        },
      });
    };

    if (window.YT) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, saveProgress]);

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <div id="yt-player" className="w-full h-full" />
    </div>
  );
}
