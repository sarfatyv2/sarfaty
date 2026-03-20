import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import type { CercValidation } from '../domain/cerc-validation.entity';

@Injectable()
export class GetCercValidationUseCase {
  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly repository: CercValidationRepository,
  ) {}

  async execute(id: string): Promise<CercValidation> {
    const entity = await this.repository.getById(id);
    if (!entity) throw new NotFoundException(`CercValidation not found: ${id}`);
    return entity;
  }
}
