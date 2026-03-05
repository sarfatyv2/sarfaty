import { Inject, Injectable } from '@nestjs/common';
import {
  TRADE_RECEIVABLE_REPOSITORY,
  type TradeReceivableRepository,
  type PaginatedTradeReceivables,
  type TradeReceivableFilters,
} from '../domain/trade-receivable.repository';

@Injectable()
export class ListTradeReceivablesUseCase {
  constructor(
    @Inject(TRADE_RECEIVABLE_REPOSITORY)
    private readonly repo: TradeReceivableRepository,
  ) {}

  async execute(filters: TradeReceivableFilters): Promise<PaginatedTradeReceivables> {
    return this.repo.findByFilters(filters);
  }
}
