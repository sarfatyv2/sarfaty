import type { CnabFile } from './cnab-file.entity';

export const CNAB_FILE_REPOSITORY = Symbol('CNAB_FILE_REPOSITORY');

export interface CnabFileFilters {
  clientId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedCnabFiles {
  files: CnabFile[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface CnabFileRepository {
  save(file: CnabFile): Promise<CnabFile>;
  findById(id: string): Promise<CnabFile | null>;
  findByFilters(filters: CnabFileFilters): Promise<PaginatedCnabFiles>;
  updateStatus(id: string, status: string, extras?: Record<string, unknown>): Promise<CnabFile | null>;
}
