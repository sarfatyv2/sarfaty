import { Inject, Injectable } from '@nestjs/common';
import { CNAB_OPERATION_REPOSITORY, type CnabOperationRepository } from '../domain/cnab-operation.repository';
import { TRADE_RECEIVABLE_REPOSITORY, type TradeReceivableRepository } from '../domain/trade-receivable.repository';
import { CnabOperationEntity } from '../domain/cnab-operation.entity';

export interface CreateCnabOperationInput {
  clientId: string;
  cnabFileId: string;
  totalSubmittedAmount: string;
  receivableIds: string[];
}

@Injectable()
export class CreateCnabOperationUseCase {
  constructor(
    @Inject(CNAB_OPERATION_REPOSITORY)
    private readonly operationRepo: CnabOperationRepository,
    @Inject(TRADE_RECEIVABLE_REPOSITORY)
    private readonly receivableRepo: TradeReceivableRepository,
  ) {}

  async execute(input: CreateCnabOperationInput): Promise<CnabOperationEntity> {
    const operation = CnabOperationEntity.create({
      clientId: input.clientId,
      cnabFileId: input.cnabFileId,
      status: 'under_evaluation',
      totalSubmittedAmount: input.totalSubmittedAmount,
      totalApprovedAmount: '0',
    });

    const saved = await this.operationRepo.save(operation);

    if (input.receivableIds.length > 0) {
      await this.receivableRepo.updateOperationId(input.receivableIds, saved.id);
    }

    return saved;
  }
}
