import { Injectable, Inject } from '@nestjs/common';
import { ALLCHECK_RESULT_REPOSITORY, type AllcheckResultRepository } from '../domain/allcheck-result.repository';
import { AllcheckResult } from '../domain/allcheck-result.entity';

@Injectable()
export class GetAllcheckResultUseCase {
  constructor(
    @Inject(ALLCHECK_RESULT_REPOSITORY)
    private readonly repository: AllcheckResultRepository,
  ) {}

  async execute(clientId: string): Promise<AllcheckResult | null> {
    return this.repository.getLatestByClientId(clientId);
  }
}
