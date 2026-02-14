import { Inject, Injectable } from '@nestjs/common';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';

@Injectable()
export class RejectReimbursementUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
  ) {}

  async execute(
    reimbursementId: string,
    profileId: string,
    reason: string,
  ): Promise<Reimbursement> {
    const reimbursement = await this.reimbursementRepository.findById(reimbursementId);
    if (!reimbursement) {
      throw new Error('Reimbursement not found');
    }
    if (!reimbursement.canReject()) {
      throw new Error(`Cannot reject: reimbursement status is ${reimbursement.status}`);
    }
    if (!reason?.trim()) {
      throw new Error('Rejection reason is required');
    }

    const updated = await this.reimbursementRepository.update(reimbursementId, {
      status: 'rejected',
      rejectedBy: profileId,
      rejectedAt: new Date(),
      rejectionReason: reason.trim(),
    });

    if (!updated) {
      throw new Error('Failed to reject reimbursement');
    }
    return updated;
  }
}
