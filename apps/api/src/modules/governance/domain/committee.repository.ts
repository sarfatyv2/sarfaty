import type { PaginationMeta } from '@nexus/types';
import type { Committee } from './committee.entity';

export const COMMITTEE_REPOSITORY = Symbol('COMMITTEE_REPOSITORY');

export interface CommitteeFilters {
  status?: string;
  search?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedCommittees {
  committees: Committee[];
  pagination: PaginationMeta;
}

export interface CommitteeRepository {
  save(committee: Committee): Promise<Committee>;
  findById(id: string): Promise<Committee | null>;
  findByFilters(filters: CommitteeFilters): Promise<PaginatedCommittees>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<Committee | null>;
  delete(id: string): Promise<boolean>;
}
