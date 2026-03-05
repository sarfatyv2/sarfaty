import { Inject, Injectable } from '@nestjs/common';
import { CNAB_OPERATION_REPOSITORY, type CnabOperationRepository } from '../domain/cnab-operation.repository';
import { TRADE_RECEIVABLE_REPOSITORY, type TradeReceivableRepository } from '../domain/trade-receivable.repository';
import { CnabOperationEntity } from '../domain/cnab-operation.entity';
import { TradeReceivableEntity } from '../domain/trade-receivable.entity';

export interface GetCnabOperationResult {
  operation: CnabOperationEntity;
  receivables: TradeReceivableEntity[];
}

@Injectable()
export class GetCnabOperationUseCase {
  constructor(
    @Inject(CNAB_OPERATION_REPOSITORY)
    private readonly operationRepo: CnabOperationRepository,
    @Inject(TRADE_RECEIVABLE_REPOSITORY)
    private readonly receivableRepo: TradeReceivableRepository,
  ) {}

  async executeById(id: string): Promise<GetCnabOperationResult | null> {
    const operation = await this.operationRepo.findById(id);
    if (!operation) return null;

    const receivables = await this.receivableRepo.findByCnabFileId(operation.cnabFileId);
    return { operation, receivables };
  }

  async executeByCnabFileId(cnabFileId: string): Promise<GetCnabOperationResult | null> {
    const operation = await this.operationRepo.findByCnabFileId(cnabFileId);
    if (!operation) return null;

    const receivables = await this.receivableRepo.findByCnabFileId(cnabFileId);
    return { operation, receivables };
  }
}
