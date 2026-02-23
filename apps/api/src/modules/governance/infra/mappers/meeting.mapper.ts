import { Meeting, type MeetingProps } from '../../domain/meeting.entity';
import type { MeetingStatus } from '@nexus/types';
import type { govMeetings } from '../../../../database/schema';

type MeetingRow = typeof govMeetings.$inferSelect;

export class MeetingMapper {
  static toDomain(row: MeetingRow): Meeting {
    const props: MeetingProps = {
      id: row.id,
      committeeId: row.committeeId,
      title: row.title,
      description: row.description,
      scheduledAt: row.scheduledAt,
      locationOrLink: row.locationOrLink,
      status: row.status as MeetingStatus,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Meeting.reconstitute(props);
  }

  static toPersistence(meeting: Meeting): Record<string, unknown> {
    return {
      committeeId: meeting.committeeId,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduledAt,
      locationOrLink: meeting.locationOrLink,
      status: meeting.status,
      createdBy: meeting.createdBy,
    };
  }
}
