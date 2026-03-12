import { Injectable, Inject } from '@nestjs/common';
import { ALLCHECK_DRAWEE_RESULT_REPOSITORY, type AllcheckDraweeResultRepository } from '../domain/allcheck-drawee-result.repository';
import { AllcheckDraweeResult } from '../domain/allcheck-drawee-result.entity';

@Injectable()
export class GetAllcheckDraweeResultUseCase {
  constructor(
    @Inject(ALLCHECK_DRAWEE_RESULT_REPOSITORY)
    private readonly repository: AllcheckDraweeResultRepository,
  ) {}

  async execute(draweeId: string): Promise<AllcheckDraweeResult | null> {
    return this.repository.getLatestByDraweeId(draweeId);
  }
}
