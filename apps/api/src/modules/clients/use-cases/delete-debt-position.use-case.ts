import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DEBT_POSITION_ITEM_REPOSITORY,
  type DebtPositionItemRepository,
} from '../domain/debt-position-item.repository';

export interface DeleteDebtPositionInput {
  clientId: string;
  itemId: string;
}

@Injectable()
export class DeleteDebtPositionUseCase {
  constructor(
    @Inject(DEBT_POSITION_ITEM_REPOSITORY)
    private readonly repo: DebtPositionItemRepository,
  ) {}

  async execute(input: DeleteDebtPositionInput): Promise<void> {
    const existing = await this.repo.findById(input.itemId);
    if (existing?.clientId !== input.clientId) {
      throw new NotFoundException(`Debt position item ${input.itemId} not found`);
    }
    await this.repo.delete(input.itemId);
  }
}
