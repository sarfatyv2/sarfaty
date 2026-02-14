import type { PaginationMeta } from '@nexus/types';
import type { Collaborator } from './collaborator.entity';

export const COLLABORATOR_REPOSITORY = Symbol('COLLABORATOR_REPOSITORY');

export interface CollaboratorFilters {
  isActive?: boolean;
  employmentType?: string;
  department?: string;
  directorate?: string;
  search?: string;
  managerId?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedCollaborators {
  collaborators: Collaborator[];
  pagination: PaginationMeta;
}

export interface CollaboratorRepository {
  findById(id: string): Promise<Collaborator | null>;
  findByProfileId(profileId: string): Promise<Collaborator | null>;
  findByFilters(filters: CollaboratorFilters): Promise<PaginatedCollaborators>;
  update(id: string, data: Record<string, unknown>): Promise<Collaborator | null>;
}
