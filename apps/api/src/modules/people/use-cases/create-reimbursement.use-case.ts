import { Inject, Injectable } from '@nestjs/common';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';

export interface CreateReimbursementInput {
  profileId: string;
  data: {
    title: string;
    description?: string;
    category: string;
    amount: string;
    expenseDate: string;
  };
}

@Injectable()
export class CreateReimbursementUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(input: CreateReimbursementInput): Promise<Reimbursement> {
    const collaborator = await this.collaboratorRepository.findByProfileId(input.profileId);
    if (!collaborator) {
      throw new Error('Collaborator not found');
    }

    const reimbursement = await this.reimbursementRepository.create({
      collaboratorId: collaborator.id,
      title: input.data.title,
      description: input.data.description ?? null,
      category: input.data.category,
      amount: input.data.amount,
      expenseDate: input.data.expenseDate,
      status: 'pending',
    });

    return reimbursement;
  }
}
