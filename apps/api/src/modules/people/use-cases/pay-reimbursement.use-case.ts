import { Inject, Injectable } from '@nestjs/common';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';

export interface PayReimbursementInput {
  reimbursementId: string;
  profileId: string;
  paymentReference?: string;
}

@Injectable()
export class PayReimbursementUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
  ) {}

  async execute(input: PayReimbursementInput): Promise<Reimbursement> {
    const reimbursement = await this.reimbursementRepository.findById(input.reimbursementId);
    if (!reimbursement) {
      throw new Error('Reimbursement not found');
    }
    if (!reimbursement.canPay()) {
      throw new Error(`Cannot pay: reimbursement status is ${reimbursement.status}`);
    }

    const updated = await this.reimbursementRepository.update(input.reimbursementId, {
      status: 'paid',
      paidBy: input.profileId,
      paidAt: new Date(),
      paymentReference: input.paymentReference ?? null,
    });

    if (!updated) {
      throw new Error('Failed to mark reimbursement as paid');
    }
    return updated;
  }
}
