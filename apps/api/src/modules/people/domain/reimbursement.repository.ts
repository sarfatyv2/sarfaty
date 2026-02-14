import type { Reimbursement } from './reimbursement.entity';

export const REIMBURSEMENT_REPOSITORY = Symbol('REIMBURSEMENT_REPOSITORY');

export interface ReimbursementFilters {
  collaboratorId?: string;
  collaboratorIds?: string[];
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateReimbursementData {
  collaboratorId: string;
  title: string;
  description: string | null;
  category: string;
  amount: string;
  expenseDate: string;
  status?: string;
}

export interface ReimbursementRepository {
  findById(id: string): Promise<Reimbursement | null>;
  findByFilters(filters: ReimbursementFilters): Promise<{ reimbursements: Reimbursement[]; total: number }>;
  create(data: CreateReimbursementData): Promise<Reimbursement>;
  update(id: string, data: Record<string, unknown>): Promise<Reimbursement | null>;
}
