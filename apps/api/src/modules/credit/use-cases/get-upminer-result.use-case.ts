import { Injectable, Inject } from '@nestjs/common';
import { type UpminerResult } from '../domain/upminer-result.entity';
import { type UpminerResultRepository, UPMINER_RESULT_REPOSITORY } from '../domain/upminer-result.repository';

@Injectable()
export class GetUpminerResultUseCase {
  constructor(
    @Inject(UPMINER_RESULT_REPOSITORY)
    private readonly upminerRepository: UpminerResultRepository,
  ) {}

  async execute(clientId: string): Promise<UpminerResult | null> {
    return this.upminerRepository.getLatestByClientId(clientId);
  }

  async executeAll(clientId: string): Promise<UpminerResult[]> {
    return this.upminerRepository.getByClientId(clientId);
  }
}
