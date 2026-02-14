import { Inject, Injectable } from '@nestjs/common';
import type { ListCollaboratorsQueryDto } from '@nexus/validators';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
  type PaginatedCollaborators,
} from '../domain/collaborator.repository';

@Injectable()
export class ListCollaboratorsUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(query: ListCollaboratorsQueryDto): Promise<PaginatedCollaborators> {
    return this.collaboratorRepository.findByFilters({
      isActive: query.isActive,
      employmentType: query.employmentType,
      department: query.department,
      directorate: query.directorate,
      search: query.search,
      managerId: query.managerId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
