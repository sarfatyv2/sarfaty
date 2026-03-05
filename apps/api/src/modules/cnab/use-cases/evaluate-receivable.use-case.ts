import { Inject, Injectable } from '@nestjs/common';
import { TRADE_RECEIVABLE_REPOSITORY, type TradeReceivableRepository } from '../domain/trade-receivable.repository';
import { CNAB_OPERATION_REPOSITORY, type CnabOperationRepository } from '../domain/cnab-operation.repository';
import { TradeReceivableEntity } from '../domain/trade-receivable.entity';

export interface EvaluateReceivableInput {
  receivableId: string;
  evaluationStatus: 'approved' | 'rejected';
  rejectionReason?: string | null;
}

@Injectable()
export class EvaluateReceivableUseCase {
  constructor(
    @Inject(TRADE_RECEIVABLE_REPOSITORY)
    private readonly receivableRepo: TradeReceivableRepository,
    @Inject(CNAB_OPERATION_REPOSITORY)
    private readonly operationRepo: CnabOperationRepository,
  ) {}

  async execute(input: EvaluateReceivableInput): Promise<TradeReceivableEntity | null> {
    const receivable = await this.receivableRepo.findById(input.receivableId);
    if (!receivable || !receivable.operationId) return null;

    const updated = await this.receivableRepo.updateEvaluation(
      input.receivableId,
      input.evaluationStatus,
      input.rejectionReason,
    );
    if (!updated) return null;

    await this.recalculateTotalApprovedAmount(receivable.operationId);
    return updated;
  }

  private async recalculateTotalApprovedAmount(operationId: string): Promise<void> {
    const totalApproved = await this.receivableRepo.sumApprovedFaceValueByOperationId(operationId);
    await this.operationRepo.updateTotalApprovedAmount(operationId, totalApproved);
  }
}
