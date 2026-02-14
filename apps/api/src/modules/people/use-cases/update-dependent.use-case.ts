import { Inject, Injectable } from '@nestjs/common';
import type { UpdateDependentDto } from '@nexus/validators';
import {
  DEPENDENT_REPOSITORY,
  type DependentRepository,
} from '../domain/dependent.repository';
import type { Dependent } from '../domain/dependent.entity';
import { DependentNotFoundException } from '../domain/exceptions/dependent-not-found.exception';

@Injectable()
export class UpdateDependentUseCase {
  constructor(
    @Inject(DEPENDENT_REPOSITORY)
    private readonly dependentRepository: DependentRepository,
  ) {}

  async execute(id: string, dto: UpdateDependentDto): Promise<Dependent> {
    const existing = await this.dependentRepository.findById(id);

    if (!existing) {
      throw new DependentNotFoundException(id);
    }

    const updated = await this.dependentRepository.update(id, dto as Record<string, unknown>);

    if (!updated) {
      throw new DependentNotFoundException(id);
    }

    return updated;
  }
}
