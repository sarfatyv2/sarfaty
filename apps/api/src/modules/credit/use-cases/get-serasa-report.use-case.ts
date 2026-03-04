import { Injectable, Inject, Logger } from '@nestjs/common';
import { SerasaReportRepository, SERASA_REPORT_REPOSITORY } from '../domain/serasa-report.repository';
import { SerasaReport } from '../domain/serasa-report.entity';

@Injectable()
export class GetSerasaReportUseCase {
  private readonly logger = new Logger(GetSerasaReportUseCase.name);

  constructor(
    @Inject(SERASA_REPORT_REPOSITORY)
    private readonly serasaReportRepository: SerasaReportRepository,
  ) {}

  async execute(clientId: string): Promise<SerasaReport | null> {
    this.logger.debug(`Fetching latest Serasa report for client ${clientId}`);
    return this.serasaReportRepository.getLatestByClientId(clientId);
  }

  async executeAll(clientId: string): Promise<SerasaReport[]> {
    this.logger.debug(`Fetching all Serasa reports for client ${clientId}`);
    return this.serasaReportRepository.getByClientId(clientId);
  }
}
