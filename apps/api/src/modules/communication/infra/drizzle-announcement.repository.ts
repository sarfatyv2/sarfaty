import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, desc, asc, count, and, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { commAnnouncements } from '../../../database/schema';
import type {
  AnnouncementRepository,
  AnnouncementFilters,
  PaginatedAnnouncements,
} from '../domain/announcement.repository';
import { Announcement } from '../domain/announcement.entity';
import { AnnouncementMapper } from './mappers/announcement.mapper';

@Injectable()
export class DrizzleAnnouncementRepository implements AnnouncementRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(announcement: Announcement): Promise<Announcement> {
    const data = AnnouncementMapper.toPersistence(announcement);
    const [row] = await this.db
      .insert(commAnnouncements)
      .values(data as typeof commAnnouncements.$inferInsert)
      .returning();
    return AnnouncementMapper.toDomain(row!);
  }

  async findById(id: string): Promise<Announcement | null> {
    const [row] = await this.db
      .select()
      .from(commAnnouncements)
      .where(eq(commAnnouncements.id, id))
      .limit(1);
    return row ? AnnouncementMapper.toDomain(row) : null;
  }

  async findByFilters(filters: AnnouncementFilters): Promise<PaginatedAnnouncements> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(commAnnouncements.status, filters.status));
    }
    if (filters.search) {
      conditions.push(ilike(commAnnouncements.title, `%${filters.search}%`));
    }
    if (filters.targetRole) {
      conditions.push(
        sql`${commAnnouncements.targetRoles} @> ARRAY[${filters.targetRole}]::text[]`,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(commAnnouncements)
        .where(whereClause)
        .orderBy(orderFn(commAnnouncements.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(commAnnouncements)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      announcements: rows.map((row) => AnnouncementMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Announcement | null> {
    const [row] = await this.db
      .update(commAnnouncements)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof commAnnouncements.$inferInsert>)
      .where(eq(commAnnouncements.id, id))
      .returning();
    return row ? AnnouncementMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(commAnnouncements)
      .where(eq(commAnnouncements.id, id))
      .returning({ id: commAnnouncements.id });
    return result.length > 0;
  }
}
