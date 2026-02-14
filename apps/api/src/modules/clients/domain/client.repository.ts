import type { PaginationMeta } from '@nexus/types';
import type { Client } from './client.entity';

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export interface ClientFilters {
  status?: string;
  segmentId?: string;
  search?: string;
  assignedTo?: string;
  teamId?: string;
  regionId?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedClients {
  clients: Client[];
  pagination: PaginationMeta;
}

export interface ClientRepository {
  save(client: Client): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findByCnpj(cnpj: string): Promise<Client | null>;
  findByFilters(filters: ClientFilters): Promise<PaginatedClients>;
  update(id: string, data: Record<string, unknown>): Promise<Client | null>;
}
