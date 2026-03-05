import { Inject, Injectable } from '@nestjs/common';
import { TRADE_RECEIVABLE_REPOSITORY, type TradeReceivableRepository } from '../domain/trade-receivable.repository';
import { CNAB_OPERATION_REPOSITORY, type CnabOperationRepository } from '../domain/cnab-operation.repository';
import { TradeReceivableEntity } from '../domain/trade-receivable.entity';

export interface BatchEvaluateItem {
  receivableId: string;
  evaluationStatus: 'approved' | 'rejected';
  rejectionReason?: string | null;
}

export interface BatchEvaluateReceivablesInput {
  operationId: string;
  items: BatchEvaluateItem[];
}

export interface BatchEvaluateReceivablesResult {
  updated: TradeReceivableEntity[];
  failed: string[];
}

@Injectable()
export class BatchEvaluateReceivablesUseCase {
  constructor(
    @Inject(TRADE_RECEIVABLE_REPOSITORY)
    private readonly receivableRepo: TradeReceivableRepository,
    @Inject(CNAB_OPERATION_REPOSITORY)
    private readonly operationRepo: CnabOperationRepository,
  ) {}

  async execute(input: BatchEvaluateReceivablesInput): Promise<BatchEvaluateReceivablesResult> {
    const updated: TradeReceivableEntity[] = [];
    const failed: string[] = [];

    for (const item of input.items) {
      const receivable = await this.receivableRepo.findById(item.receivableId);
      if (!receivable || receivable.operationId !== input.operationId) {
        failed.push(item.receivableId);
        continue;
      }

      const result = await this.receivableRepo.updateEvaluation(
        item.receivableId,
        item.evaluationStatus,
        item.rejectionReason,
      );
      if (result) {
        updated.push(result);
      } else {
        failed.push(item.receivableId);
      }
    }

    if (updated.length > 0) {
      const totalApproved = await this.receivableRepo.sumApprovedFaceValueByOperationId(input.operationId);
      await this.operationRepo.updateTotalApprovedAmount(input.operationId, totalApproved);
    }

    return { updated, failed };
  }
}
