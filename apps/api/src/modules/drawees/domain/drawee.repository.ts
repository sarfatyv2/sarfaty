import type { Drawee } from './drawee.entity';

export const DRAWEE_REPOSITORY = Symbol('DRAWEE_REPOSITORY');

export interface DraweeFilters {
  search?: string;
  status?: string;
  personType?: string;
  segmentId?: string;
  isPep?: boolean;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedDrawees {
  drawees: Drawee[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface DraweeRepository {
  save(drawee: Drawee): Promise<Drawee>;
  findById(id: string): Promise<Drawee | null>;
  findByCnpj(cnpj: string): Promise<Drawee | null>;
  findByCpf(cpf: string): Promise<Drawee | null>;
  findByFilters(filters: DraweeFilters): Promise<PaginatedDrawees>;
  update(id: string, data: Record<string, unknown>): Promise<Drawee | null>;
}
