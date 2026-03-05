import type { TradeReceivableEntity } from './trade-receivable.entity';

export const TRADE_RECEIVABLE_REPOSITORY = Symbol('TRADE_RECEIVABLE_REPOSITORY');

export interface TradeReceivableFilters {
  clientId?: string;
  draweeId?: string;
  cnabFileId?: string;
  operationId?: string;
  status?: string;
  evaluationStatus?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedTradeReceivables {
  receivables: TradeReceivableEntity[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface TradeReceivableRepository {
  saveMany(items: TradeReceivableEntity[]): Promise<TradeReceivableEntity[]>;
  findById(id: string): Promise<TradeReceivableEntity | null>;
  findByFilters(filters: TradeReceivableFilters): Promise<PaginatedTradeReceivables>;
  findByCnabFileId(cnabFileId: string): Promise<TradeReceivableEntity[]>;
  updateEvaluation(
    id: string,
    evaluationStatus: 'approved' | 'rejected',
    rejectionReason?: string | null,
  ): Promise<TradeReceivableEntity | null>;
  updateOperationId(ids: string[], operationId: string): Promise<void>;
  sumApprovedFaceValueByOperationId(operationId: string): Promise<string>;
}
