'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button, Badge } from '@nexus/ui';
import { Bell, CheckCheck, Check, ChevronLeft, ChevronRight, icons } from 'lucide-react';
import { getNotificationTypeLabel, getNotificationTypeIcon } from '@nexus/utils';

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

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNotificationLink(notification: NotificationItem): string | null {
  if (notification.clientId) {
    return `/clients/${notification.clientId}`;
  }
  const meta = notification.metadata;
  if (meta?.reimbursementId) return '/people/me/reimbursements';
  if (meta?.invoiceId) return '/people/me/invoices';
  if (meta?.courseId) return `/learning/${meta.courseId as string}`;
  return null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async (page: number, unreadOnly: boolean) => {
    setIsLoading(true);
    try {
      const result = await api.get<NotificationItem[]>('/notifications', {
        page,
        pageSize: 20,
        unreadOnly,
      });
      setNotifications(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications(1, filter === 'unread');
  }, [filter, fetchNotifications]);

  async function handleMarkAsRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch {
      // Silent fail
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
    } catch {
      // Silent fail
    }
  }

  function handlePageChange(newPage: number) {
    void fetchNotifications(newPage, filter === 'unread');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-muted-foreground" />
          <h1 className="text-3xl font-normal tracking-tight">Notificações</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-l-lg transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-r-lg transition-colors ${filter === 'unread' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setFilter('unread')}
            >
              Não lidas
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} className="mr-1" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Carregando notificações...
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Bell size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {filter === 'unread'
                ? 'Nenhuma notificação não lida'
                : 'Nenhuma notificação'}
            </p>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <div className="divide-y">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const iconName = getNotificationTypeIcon(notification.type);
              const IconComponent = icons[iconName as keyof typeof icons] ?? Bell;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 px-4 sm:px-6 py-4 transition-colors ${notification.readAt ? '' : 'bg-primary/5'}`}
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.readAt ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-tight ${notification.readAt ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {getNotificationTypeLabel(notification.type)}
                      </Badge>
                      {link && (
                        <Link
                          href={link}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver detalhes
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.readAt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 mt-0.5"
                      title="Marcar como lida"
                      onClick={() => void handleMarkAsRead(notification.id)}
                    >
                      <Check size={16} />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} notificações)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Próxima
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
