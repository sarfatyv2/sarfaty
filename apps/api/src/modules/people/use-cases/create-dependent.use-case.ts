import { Inject, Injectable } from '@nestjs/common';
import type { CreateDependentDto } from '@nexus/validators';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import {
  DEPENDENT_REPOSITORY,
  type DependentRepository,
} from '../domain/dependent.repository';
import type { Dependent } from '../domain/dependent.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';

@Injectable()
export class CreateDependentUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    @Inject(DEPENDENT_REPOSITORY)
    private readonly dependentRepository: DependentRepository,
  ) {}

  async execute(collaboratorId: string, dto: CreateDependentDto): Promise<Dependent> {
    const collaborator = await this.collaboratorRepository.findById(collaboratorId);

    if (!collaborator) {
      throw new CollaboratorNotFoundException(collaboratorId);
    }

    return this.dependentRepository.create({
      collaboratorId,
      fullName: dto.fullName,
      relationship: dto.relationship,
      dateOfBirth: dto.dateOfBirth ?? null,
      cpf: dto.cpf ?? null,
      isIrDependent: dto.isIrDependent,
      isHealthPlan: dto.isHealthPlan,
      notes: dto.notes ?? null,
    });
  }
}
