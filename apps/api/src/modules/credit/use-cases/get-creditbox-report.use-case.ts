import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreditboxReport } from '../domain/creditbox-report.entity';
import { CreditboxRepository, CREDITBOX_REPOSITORY } from '../domain/creditbox.repository';

@Injectable()
export class GetCreditboxReportUseCase {
  private readonly logger = new Logger(GetCreditboxReportUseCase.name);

  constructor(
    @Inject(CREDITBOX_REPOSITORY)
    private readonly creditboxRepository: CreditboxRepository,
  ) {}

  async execute(clientId: string): Promise<CreditboxReport | null> {
    this.logger.debug(`Getting latest CreditBox report for client ${clientId}`);
    return this.creditboxRepository.getLatestByClientId(clientId);
  }
}
