import { Inject, Injectable } from '@nestjs/common';
import {
  DEBT_POSITION_ITEM_REPOSITORY,
  type DebtPositionItemRepository,
} from '../domain/debt-position-item.repository';
import type { DebtPositionItemProps } from '../domain/debt-position-item.entity';

@Injectable()
export class ListDebtPositionsUseCase {
  constructor(
    @Inject(DEBT_POSITION_ITEM_REPOSITORY)
    private readonly repo: DebtPositionItemRepository,
  ) {}

  async execute(clientId: string): Promise<DebtPositionItemProps[]> {
    return this.repo.findByClientId(clientId);
  }
}
