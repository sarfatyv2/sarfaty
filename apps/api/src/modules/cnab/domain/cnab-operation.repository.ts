import type { CnabOperationEntity } from './cnab-operation.entity';

export const CNAB_OPERATION_REPOSITORY = Symbol('CNAB_OPERATION_REPOSITORY');

export interface CnabOperationFilters {
  clientId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedCnabOperations {
  operations: CnabOperationEntity[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface CnabOperationRepository {
  save(operation: CnabOperationEntity): Promise<CnabOperationEntity>;
  findById(id: string): Promise<CnabOperationEntity | null>;
  findByCnabFileId(cnabFileId: string): Promise<CnabOperationEntity | null>;
  findByFilters(filters: CnabOperationFilters): Promise<PaginatedCnabOperations>;
  updateTotalApprovedAmount(id: string, amount: string): Promise<CnabOperationEntity | null>;
  updateStatus(id: string, status: string): Promise<CnabOperationEntity | null>;
}
