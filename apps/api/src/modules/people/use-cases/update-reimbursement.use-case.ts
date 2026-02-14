import { Inject, Injectable } from '@nestjs/common';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';

export interface UpdateReimbursementInput {
  reimbursementId: string;
  profileId: string;
  data: Partial<{
    title: string;
    description: string;
    category: string;
    amount: string;
    expenseDate: string;
  }>;
}

@Injectable()
export class UpdateReimbursementUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(input: UpdateReimbursementInput): Promise<Reimbursement> {
    const reimbursement = await this.reimbursementRepository.findById(input.reimbursementId);
    if (!reimbursement) {
      throw new Error('Reimbursement not found');
    }
    if (!reimbursement.canUpdate()) {
      throw new Error(`Cannot update: reimbursement status is ${reimbursement.status}`);
    }

    const collaborator = await this.collaboratorRepository.findByProfileId(input.profileId);
    if (!collaborator || collaborator.id !== reimbursement.collaboratorId) {
      throw new Error('Unauthorized: you can only update your own reimbursements');
    }

    const updated = await this.reimbursementRepository.update(input.reimbursementId, input.data);
    if (!updated) {
      throw new Error('Failed to update reimbursement');
    }
    return updated;
  }
}
