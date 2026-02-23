import { Announcement, type AnnouncementProps } from '../../domain/announcement.entity';
import type { AnnouncementStatus } from '@nexus/types';
import type { commAnnouncements } from '../../../../database/schema';

type AnnouncementRow = typeof commAnnouncements.$inferSelect;

export class AnnouncementMapper {
  static toDomain(row: AnnouncementRow): Announcement {
    const props: AnnouncementProps = {
      id: row.id,
      title: row.title,
      content: row.content,
      coverImageUrl: row.coverImageUrl,
      targetRoles: row.targetRoles ?? [],
      authorId: row.authorId,
      status: row.status as AnnouncementStatus,
      publishedAt: row.publishedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Announcement.reconstitute(props);
  }

  static toPersistence(announcement: Announcement): Record<string, unknown> {
    return {
      title: announcement.title,
      content: announcement.content,
      coverImageUrl: announcement.coverImageUrl,
      targetRoles: announcement.targetRoles,
      authorId: announcement.authorId,
      status: announcement.status,
      publishedAt: announcement.publishedAt,
      expiresAt: announcement.expiresAt,
    };
  }
}
