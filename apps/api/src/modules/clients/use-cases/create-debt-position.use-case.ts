import { Inject, Injectable } from '@nestjs/common';
import {
  DEBT_POSITION_ITEM_REPOSITORY,
  type DebtPositionItemRepository,
} from '../domain/debt-position-item.repository';
import type { DebtPositionItemProps } from '../domain/debt-position-item.entity';
import type { CreateDebtPositionDto } from '@nexus/validators';

export interface CreateDebtPositionInput {
  clientId: string;
  dto: CreateDebtPositionDto;
}

@Injectable()
export class CreateDebtPositionUseCase {
  constructor(
    @Inject(DEBT_POSITION_ITEM_REPOSITORY)
    private readonly repo: DebtPositionItemRepository,
  ) {}

  async execute(input: CreateDebtPositionInput): Promise<DebtPositionItemProps> {
    return this.repo.create({
      clientId: input.clientId,
      documentId: null,
      institution: input.dto.institution,
      modality: input.dto.modality ?? null,
      guarantee: input.dto.guarantee ?? null,
      guaranteePercentage: input.dto.guaranteePercentage == null
        ? null
        : String(input.dto.guaranteePercentage),
      value: String(input.dto.value),
      notes: input.dto.notes ?? null,
      source: 'manual',
      extractionConfidence: null,
      isAiGenerated: false,
    });
  }
}
