import { Inject, Injectable } from '@nestjs/common';
import {
  DEPENDENT_REPOSITORY,
  type DependentRepository,
} from '../domain/dependent.repository';
import type { Dependent } from '../domain/dependent.entity';

@Injectable()
export class ListDependentsUseCase {
  constructor(
    @Inject(DEPENDENT_REPOSITORY)
    private readonly dependentRepository: DependentRepository,
  ) {}

  async execute(collaboratorId: string): Promise<Dependent[]> {
    return this.dependentRepository.findByCollaboratorId(collaboratorId);
  }
}
