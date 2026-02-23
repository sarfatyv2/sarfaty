import type { PaginationMeta } from '@nexus/types';
import type { Meeting } from './meeting.entity';
import type { MeetingMinute } from './meeting-minute.entity';

export const MEETING_REPOSITORY = Symbol('MEETING_REPOSITORY');
export const MINUTE_REPOSITORY = Symbol('MINUTE_REPOSITORY');

export interface MeetingFilters {
  committeeId: string;
  status?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedMeetings {
  meetings: Meeting[];
  pagination: PaginationMeta;
}

export interface MeetingRepository {
  save(meeting: Meeting): Promise<Meeting>;
  findById(id: string): Promise<Meeting | null>;
  findByCommittee(filters: MeetingFilters): Promise<PaginatedMeetings>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<Meeting | null>;
}

export interface MinuteRepository {
  save(minute: MeetingMinute): Promise<MeetingMinute>;
  findByMeetingId(meetingId: string): Promise<MeetingMinute | null>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<MeetingMinute | null>;
}
