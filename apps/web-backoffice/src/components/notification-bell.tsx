'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@nexus/ui';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { getNotificationTypeLabel } from '@nexus/utils';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  clientId: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string | null;
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await api.get<{ count: number }>('/notifications/unread-count');
      setUnreadCount(result.data.count);
    } catch {
      // Silent fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.get<NotificationItem[]>('/notifications', {
        page: 1,
        pageSize: 8,
      });
      setNotifications(result.data);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(() => void fetchUnreadCount(), 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  async function handleMarkAllAsRead() {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
    } catch {
      // Silent fail
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch {
      // Silent fail
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-muted/50 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Notificações"
        >
          <Bell size={20} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} />
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Carregando...</div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        )}
        {!isLoading && notifications.length > 0 && (
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 cursor-pointer py-3"
                onClick={() => {
                  if (!notification.readAt) {
                    void handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={`text-sm font-medium leading-tight ${notification.readAt ? 'text-muted-foreground' : 'text-foreground'}`}
                  >
                    {notification.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    {!notification.readAt && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {notification.message}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {getNotificationTypeLabel(notification.type)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Link href="/notifications" className="flex items-center gap-1 text-sm text-primary">
            <ExternalLink size={14} />
            Ver todas as notificações
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
