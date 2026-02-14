import { Inject, Injectable } from '@nestjs/common';
import {
  DEPENDENT_REPOSITORY,
  type DependentRepository,
} from '../domain/dependent.repository';
import { DependentNotFoundException } from '../domain/exceptions/dependent-not-found.exception';

@Injectable()
export class DeleteDependentUseCase {
  constructor(
    @Inject(DEPENDENT_REPOSITORY)
    private readonly dependentRepository: DependentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.dependentRepository.findById(id);

    if (!existing) {
      throw new DependentNotFoundException(id);
    }

    await this.dependentRepository.delete(id);
  }
}
