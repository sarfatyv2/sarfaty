import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';
import { ReimbursementApprovedEvent } from '../../notifications/domain/events/people-events';

@Injectable()
export class ApproveReimbursementUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(reimbursementId: string, profileId: string): Promise<Reimbursement> {
    const reimbursement = await this.reimbursementRepository.findById(reimbursementId);
    if (!reimbursement) {
      throw new Error('Reimbursement not found');
    }
    if (!reimbursement.canApprove()) {
      throw new Error(`Cannot approve: reimbursement status is ${reimbursement.status}`);
    }

    const updated = await this.reimbursementRepository.update(reimbursementId, {
      status: 'approved',
      approvedBy: profileId,
      approvedAt: new Date(),
      rejectionReason: null,
    });

    if (!updated) {
      throw new Error('Failed to approve reimbursement');
    }

    this.eventEmitter.emit(
      ReimbursementApprovedEvent.EVENT_NAME,
      new ReimbursementApprovedEvent(
        reimbursementId,
        reimbursement.collaboratorId,
        reimbursement.title,
        profileId,
      ),
    );

    return updated;
  }
}
