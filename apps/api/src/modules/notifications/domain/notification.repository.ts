import type { Notification } from './notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface NotificationListFilters {
  profileId: string;
  unreadOnly?: boolean;
  page: number;
  pageSize: number;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateNotificationInput {
  profileId: string;
  type: string;
  title: string;
  message: string;
  clientId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationRepository {
  create(data: CreateNotificationInput): Promise<Notification>;
  createMany(data: CreateNotificationInput[]): Promise<void>;
  findByProfileId(filters: NotificationListFilters): Promise<PaginatedNotifications>;
  countUnreadByProfileId(profileId: string): Promise<number>;
  markAsRead(id: string, profileId: string): Promise<boolean>;
  markAllAsRead(profileId: string): Promise<number>;
  findById(id: string): Promise<Notification | null>;
}
