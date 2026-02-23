import type { PaginationMeta } from '@nexus/types';
import type { Announcement } from './announcement.entity';

export const ANNOUNCEMENT_REPOSITORY = Symbol('ANNOUNCEMENT_REPOSITORY');

export interface AnnouncementFilters {
  status?: string;
  search?: string;
  targetRole?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedAnnouncements {
  announcements: Announcement[];
  pagination: PaginationMeta;
}

export interface AnnouncementRepository {
  save(announcement: Announcement): Promise<Announcement>;
  findById(id: string): Promise<Announcement | null>;
  findByFilters(filters: AnnouncementFilters): Promise<PaginatedAnnouncements>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<Announcement | null>;
  delete(id: string): Promise<boolean>;
}
