import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DEBT_POSITION_ITEM_REPOSITORY,
  type DebtPositionItemRepository,
} from '../domain/debt-position-item.repository';
import type { DebtPositionItemProps } from '../domain/debt-position-item.entity';
import type { UpdateDebtPositionDto } from '@nexus/validators';

export interface UpdateDebtPositionInput {
  clientId: string;
  itemId: string;
  dto: UpdateDebtPositionDto;
}

@Injectable()
export class UpdateDebtPositionUseCase {
  constructor(
    @Inject(DEBT_POSITION_ITEM_REPOSITORY)
    private readonly repo: DebtPositionItemRepository,
  ) {}

  async execute(input: UpdateDebtPositionInput): Promise<DebtPositionItemProps> {
    const existing = await this.repo.findById(input.itemId);
    if (existing?.clientId !== input.clientId) {
      throw new NotFoundException(`Debt position item ${input.itemId} not found`);
    }

    return this.repo.update(input.itemId, {
      institution: input.dto.institution,
      modality: input.dto.modality ?? null,
      guarantee: input.dto.guarantee ?? null,
      guaranteePercentage: input.dto.guaranteePercentage == null
        ? undefined
        : String(input.dto.guaranteePercentage),
      value: input.dto.value == null ? undefined : String(input.dto.value),
      notes: input.dto.notes ?? null,
    });
  }
}
