import { Inject, Injectable } from '@nestjs/common';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository, ReimbursementFilters } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';

export interface ListReimbursementsInput {
  profileId: string;
  role: string;
  collaboratorId?: string;
  managerCollaboratorId?: string;
  filters?: {
    status?: string;
    page?: number;
    pageSize?: number;
  };
}

@Injectable()
export class ListReimbursementsUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(input: ListReimbursementsInput): Promise<{ reimbursements: Reimbursement[]; total: number }> {
    const repoFilters: ReimbursementFilters = {
      page: input.filters?.page ?? 1,
      pageSize: input.filters?.pageSize ?? 50,
      status: input.filters?.status,
    };

    const dpRoles = ['dp', 'hr_admin', 'admin'];
    if (dpRoles.includes(input.role)) {
      return this.reimbursementRepository.findByFilters(repoFilters);
    }

    if (input.role === 'people_manager' && input.managerCollaboratorId) {
      const teamResult = await this.collaboratorRepository.findByFilters({
        managerId: input.managerCollaboratorId,
        page: 1,
        pageSize: 500,
        sortBy: 'fullName',
        sortOrder: 'asc',
      });
      const teamIds = teamResult.collaborators.map((c) => c.id);
      repoFilters.collaboratorIds = teamIds;
      return this.reimbursementRepository.findByFilters(repoFilters);
    }

    const collaboratorId = input.collaboratorId ?? (await this.resolveCollaboratorId(input.profileId));
    if (!collaboratorId) {
      return { reimbursements: [], total: 0 };
    }

    repoFilters.collaboratorId = collaboratorId;
    return this.reimbursementRepository.findByFilters(repoFilters);
  }

  private async resolveCollaboratorId(profileId: string): Promise<string | null> {
    const collaborator = await this.collaboratorRepository.findByProfileId(profileId);
    return collaborator?.id ?? null;
  }
}
