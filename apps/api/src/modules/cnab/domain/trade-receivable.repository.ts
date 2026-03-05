import type { TradeReceivableEntity } from './trade-receivable.entity';

export const TRADE_RECEIVABLE_REPOSITORY = Symbol('TRADE_RECEIVABLE_REPOSITORY');

export interface TradeReceivableFilters {
  clientId?: string;
  draweeId?: string;
  cnabFileId?: string;
  status?: string;
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
}
