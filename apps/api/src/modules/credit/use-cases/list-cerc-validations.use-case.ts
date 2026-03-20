import { Injectable, Inject } from '@nestjs/common';
import { CERC_VALIDATION_REPOSITORY, type CercValidationRepository } from '../domain/cerc-validation.repository';
import type { CercValidation } from '../domain/cerc-validation.entity';

@Injectable()
export class ListCercValidationsUseCase {
  constructor(
    @Inject(CERC_VALIDATION_REPOSITORY)
    private readonly repository: CercValidationRepository,
  ) {}

  async execute(): Promise<CercValidation[]> {
    return this.repository.getAll();
  }
}
