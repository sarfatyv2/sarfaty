import { Notification } from '../../domain/notification.entity';
import type { InferSelectModel } from 'drizzle-orm';
import type { notifications } from '../../../../database/schema/notifications';

export class NotificationMapper {
  static toDomain(row: InferSelectModel<typeof notifications>): Notification {
    return Notification.reconstitute({
      id: row.id,
      profileId: row.profileId,
      type: row.type,
      title: row.title,
      message: row.message,
      clientId: row.clientId,
      metadata: (row.metadata as Record<string, unknown>) ?? null,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  }
}
