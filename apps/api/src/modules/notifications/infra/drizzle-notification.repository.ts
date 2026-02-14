import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, isNull, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { notifications } from '../../../database/schema/notifications';
import type {
  NotificationRepository,
  NotificationListFilters,
  PaginatedNotifications,
  CreateNotificationInput,
} from '../domain/notification.repository';
import type { Notification } from '../domain/notification.entity';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: CreateNotificationInput): Promise<Notification> {
    const [row] = await this.db
      .insert(notifications)
      .values({
        profileId: data.profileId,
        type: data.type,
        title: data.title,
        message: data.message,
        clientId: data.clientId ?? null,
        metadata: data.metadata ?? null,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create notification');
    }

    return NotificationMapper.toDomain(row);
  }

  async createMany(data: CreateNotificationInput[]): Promise<void> {
    if (data.length === 0) return;

    await this.db.insert(notifications).values(
      data.map((d) => ({
        profileId: d.profileId,
        type: d.type,
        title: d.title,
        message: d.message,
        clientId: d.clientId ?? null,
        metadata: d.metadata ?? null,
      })),
    );
  }

  async findByProfileId(filters: NotificationListFilters): Promise<PaginatedNotifications> {
    const conditions = [eq(notifications.profileId, filters.profileId)];
    if (filters.unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }

    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(notifications)
        .where(and(...conditions)),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
      notifications: rows.map((row) => NotificationMapper.toDomain(row)),
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / filters.pageSize),
      },
    };
  }

  async countUnreadByProfileId(profileId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.profileId, profileId), isNull(notifications.readAt)));

    return Number(result?.count ?? 0);
  }

  async markAsRead(id: string, profileId: string): Promise<boolean> {
    const [row] = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.profileId, profileId)))
      .returning({ id: notifications.id });

    return row !== undefined;
  }

  async markAllAsRead(profileId: string): Promise<number> {
    const result = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.profileId, profileId), isNull(notifications.readAt)))
      .returning({ id: notifications.id });

    return result.length;
  }

  async findById(id: string): Promise<Notification | null> {
    const [row] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return row ? NotificationMapper.toDomain(row) : null;
  }
}
