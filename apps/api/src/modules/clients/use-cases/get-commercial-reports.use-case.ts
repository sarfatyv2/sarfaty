import { Injectable, Inject } from '@nestjs/common';
import { COMMERCIAL_REPORT_REPOSITORY, CommercialReportRepository } from '../domain/commercial-report.repository';

@Injectable()
export class GetCommercialReportsUseCase {
  constructor(
    @Inject(COMMERCIAL_REPORT_REPOSITORY)
    private readonly commercialReportRepository: CommercialReportRepository,
  ) {}

  async execute(clientId: string, latestOnly = false) {
    if (latestOnly) {
      const latest = await this.commercialReportRepository.findLatestByClientId(clientId);
      return latest ? [latest.toJSON()] : [];
    }
    
    const reports = await this.commercialReportRepository.findByClientId(clientId);
    return reports.map(r => r.toJSON());
  }
}