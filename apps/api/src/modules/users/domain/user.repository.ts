import type { PaginationMeta } from '@nexus/types';
import type { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedUsers {
  users: User[];
  pagination: PaginationMeta;
}

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByFilters(filters: UserFilters): Promise<PaginatedUsers>;
}
