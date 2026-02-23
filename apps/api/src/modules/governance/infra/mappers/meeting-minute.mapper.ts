import { MeetingMinute, type MeetingMinuteProps } from '../../domain/meeting-minute.entity';
import type { MinuteStatus } from '@nexus/types';
import type { govMeetingMinutes } from '../../../../database/schema';

type MinuteRow = typeof govMeetingMinutes.$inferSelect;

export class MeetingMinuteMapper {
  static toDomain(row: MinuteRow): MeetingMinute {
    const props: MeetingMinuteProps = {
      id: row.id,
      meetingId: row.meetingId,
      content: row.content,
      status: row.status as MinuteStatus,
      publishedAt: row.publishedAt,
      publishedBy: row.publishedBy,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return MeetingMinute.reconstitute(props);
  }

  static toPersistence(minute: MeetingMinute): Record<string, unknown> {
    return {
      meetingId: minute.meetingId,
      content: minute.content,
      status: minute.status,
      publishedAt: minute.publishedAt,
      publishedBy: minute.publishedBy,
      createdBy: minute.createdBy,
    };
  }
}
