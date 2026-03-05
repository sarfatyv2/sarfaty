import { Injectable, Inject, Logger } from '@nestjs/common';
import { SerasaDraweeReportRepository, SERASA_DRAWEE_REPORT_REPOSITORY } from '../domain/serasa-drawee-report.repository';
import { SerasaDraweeReport } from '../domain/serasa-drawee-report.entity';

@Injectable()
export class GetSerasaReportDraweeUseCase {
  private readonly logger = new Logger(GetSerasaReportDraweeUseCase.name);

  constructor(
    @Inject(SERASA_DRAWEE_REPORT_REPOSITORY)
    private readonly serasaDraweeReportRepository: SerasaDraweeReportRepository,
  ) {}

  async execute(draweeId: string): Promise<SerasaDraweeReport | null> {
    this.logger.debug(`Fetching latest Serasa report for drawee ${draweeId}`);
    return this.serasaDraweeReportRepository.getLatestByDraweeId(draweeId);
  }

  async executeAll(draweeId: string): Promise<SerasaDraweeReport[]> {
    this.logger.debug(`Fetching all Serasa reports for drawee ${draweeId}`);
    return this.serasaDraweeReportRepository.getByDraweeId(draweeId);
  }
}
