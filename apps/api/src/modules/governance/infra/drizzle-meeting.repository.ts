import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { govMeetings, govMeetingMinutes } from '../../../database/schema';
import type {
  MeetingRepository,
  MinuteRepository,
  MeetingFilters,
  PaginatedMeetings,
} from '../domain/meeting.repository';
import { Meeting } from '../domain/meeting.entity';
import { MeetingMinute } from '../domain/meeting-minute.entity';
import { MeetingMapper } from './mappers/meeting.mapper';
import { MeetingMinuteMapper } from './mappers/meeting-minute.mapper';

@Injectable()
export class DrizzleMeetingRepository implements MeetingRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(meeting: Meeting): Promise<Meeting> {
    const data = MeetingMapper.toPersistence(meeting);
    const [row] = await this.db
      .insert(govMeetings)
      .values(data as typeof govMeetings.$inferInsert)
      .returning();
    return MeetingMapper.toDomain(row!);
  }

  async findById(id: string): Promise<Meeting | null> {
    const [row] = await this.db
      .select()
      .from(govMeetings)
      .where(eq(govMeetings.id, id))
      .limit(1);
    return row ? MeetingMapper.toDomain(row) : null;
  }

  async findByCommittee(filters: MeetingFilters): Promise<PaginatedMeetings> {
    const conditions = [eq(govMeetings.committeeId, filters.committeeId)];
    if (filters.status) {
      conditions.push(eq(govMeetings.status, filters.status));
    }

    const whereClause = and(...conditions);
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(govMeetings)
        .where(whereClause)
        .orderBy(orderFn(govMeetings.scheduledAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(govMeetings)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      meetings: rows.map((row) => MeetingMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Meeting | null> {
    const [row] = await this.db
      .update(govMeetings)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof govMeetings.$inferInsert>)
      .where(eq(govMeetings.id, id))
      .returning();
    return row ? MeetingMapper.toDomain(row) : null;
  }
}

@Injectable()
export class DrizzleMinuteRepository implements MinuteRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(minute: MeetingMinute): Promise<MeetingMinute> {
    const data = MeetingMinuteMapper.toPersistence(minute);
    const [row] = await this.db
      .insert(govMeetingMinutes)
      .values(data as typeof govMeetingMinutes.$inferInsert)
      .returning();
    return MeetingMinuteMapper.toDomain(row!);
  }

  async findByMeetingId(meetingId: string): Promise<MeetingMinute | null> {
    const [row] = await this.db
      .select()
      .from(govMeetingMinutes)
      .where(eq(govMeetingMinutes.meetingId, meetingId))
      .limit(1);
    return row ? MeetingMinuteMapper.toDomain(row) : null;
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<MeetingMinute | null> {
    const [row] = await this.db
      .update(govMeetingMinutes)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof govMeetingMinutes.$inferInsert>)
      .where(eq(govMeetingMinutes.id, id))
      .returning();
    return row ? MeetingMinuteMapper.toDomain(row) : null;
  }
}
