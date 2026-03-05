import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { drawees } from '../../../database/schema';
import { SerasaAdapter } from '../bureaus/serasa/serasa.adapter';
import { SerasaDraweeReport } from '../domain/serasa-drawee-report.entity';
import { SerasaDraweeReportRepository, SERASA_DRAWEE_REPORT_REPOSITORY } from '../domain/serasa-drawee-report.repository';
import { SyncSerasaDraweeUseCase } from './sync-serasa-drawee.use-case';

const DEFAULT_FEATURES = [
  'SCORE_POSITIVO',
  'LIMITE_CREDITO',
  'QSA_AVANCADO',
  'DIVIDAS_ORGAOS_PUBLICOS',
  'LOCALIZACAO_PJ',
];

@Injectable()
export class RequestSerasaReportDraweeUseCase {
  private readonly logger = new Logger(RequestSerasaReportDraweeUseCase.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    @Inject(SERASA_DRAWEE_REPORT_REPOSITORY)
    private readonly serasaDraweeReportRepository: SerasaDraweeReportRepository,
    private readonly serasaAdapter: SerasaAdapter,
    private readonly syncSerasaDraweeUseCase: SyncSerasaDraweeUseCase,
  ) {}

  async execute(
    draweeId: string,
    reportName?: string,
    optionalFeatures?: string[],
  ): Promise<SerasaDraweeReport> {
    this.logger.log(`Requesting Serasa report for drawee ${draweeId}`);

    const draweeRows = await this.db
      .select({ cnpj: drawees.cnpj })
      .from(drawees)
      .where(eq(drawees.id, draweeId))
      .execute();

    const drawee = draweeRows[0];
    if (!drawee) {
      throw new NotFoundException(`Drawee with ID ${draweeId} not found`);
    }
    if (!drawee.cnpj) {
      this.logger.warn(`Drawee ${draweeId} does not have a CNPJ, skipping Serasa`);
      return SerasaDraweeReport.create({
        draweeId,
        cnpj: '',
        reportName: 'RELATORIO_AVANCADO_PJ',
        optionalFeatures: DEFAULT_FEATURES,
        statusCode: 0,
        rawResponse: null,
        errorMessage: 'Drawee has no CNPJ',
        requestId: null,
      });
    }

    const features = optionalFeatures ?? DEFAULT_FEATURES;
    const report_name = reportName ?? 'RELATORIO_AVANCADO_PJ';
    const cleanCnpj = drawee.cnpj.replaceAll(/\D/g, '');

    try {
      const result = await this.serasaAdapter.getReport({
        cnpj: cleanCnpj,
        reportName: report_name,
        optionalFeatures: features,
      });

      const report = SerasaDraweeReport.create({
        draweeId,
        cnpj: cleanCnpj,
        reportName: report_name,
        optionalFeatures: features,
        statusCode: result.statusCode,
        rawResponse: result.data,
        errorMessage: result.error,
        requestId: result.requestId,
      });

      await this.serasaDraweeReportRepository.save(report);
      this.logger.log(`Serasa report saved (${result.statusCode}) for drawee ${draweeId}`);

      if (report.isSuccess && result.data) {
        try {
          await this.syncSerasaDraweeUseCase.execute(draweeId, result.data);
        } catch (syncError) {
          this.logger.error(
            `Serasa enrichment failed for drawee ${draweeId}: ${(syncError as Error).message}`,
          );
        }
      }

      return report;
    } catch (error) {
      const report = SerasaDraweeReport.create({
        draweeId,
        cnpj: cleanCnpj,
        reportName: report_name,
        optionalFeatures: features,
        statusCode: 0,
        rawResponse: null,
        errorMessage: (error as Error).message,
        requestId: null,
      });

      await this.serasaDraweeReportRepository.save(report);
      this.logger.error(`Serasa report failed for drawee ${draweeId}`, (error as Error).stack);
      return report;
    }
  }
}
