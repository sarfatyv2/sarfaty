import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clients } from '../../../database/schema';
import { SerasaAdapter } from '../bureaus/serasa/serasa.adapter';
import { SerasaReport } from '../domain/serasa-report.entity';
import { SerasaReportRepository, SERASA_REPORT_REPOSITORY } from '../domain/serasa-report.repository';
import { SyncSerasaClientUseCase } from './sync-serasa-client.use-case';

const DEFAULT_FEATURES = [
  'SCORE_POSITIVO',
  'LIMITE_CREDITO',
  'QSA_AVANCADO',
  'DIVIDAS_ORGAOS_PUBLICOS',
  'LOCALIZACAO_PJ',
];

@Injectable()
export class RequestSerasaReportUseCase {
  private readonly logger = new Logger(RequestSerasaReportUseCase.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    @Inject(SERASA_REPORT_REPOSITORY)
    private readonly serasaReportRepository: SerasaReportRepository,
    private readonly serasaAdapter: SerasaAdapter,
    private readonly syncSerasaClientUseCase: SyncSerasaClientUseCase,
  ) {}

  async execute(
    clientId: string,
    reportName?: string,
    optionalFeatures?: string[],
  ): Promise<SerasaReport> {
    this.logger.log(`Requesting Serasa report for client ${clientId}`);

    const clientRows = await this.db
      .select({ cnpj: clients.cnpj })
      .from(clients)
      .where(eq(clients.id, clientId))
      .execute();

    const client = clientRows[0];
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }
    if (!client.cnpj) {
      throw new Error(`Client ${clientId} does not have a CNPJ`);
    }

    const features = optionalFeatures ?? DEFAULT_FEATURES;
    const report_name = reportName ?? 'RELATORIO_AVANCADO_PJ';

    try {
      const result = await this.serasaAdapter.getReport({
        cnpj: client.cnpj,
        reportName: report_name,
        optionalFeatures: features,
      });

      const report = SerasaReport.create({
        clientId,
        cnpj: client.cnpj.replaceAll(/\D/g, ''),
        reportName: report_name,
        optionalFeatures: features,
        statusCode: result.statusCode,
        rawResponse: result.data,
        errorMessage: result.error,
        requestId: result.requestId,
      });

      await this.serasaReportRepository.save(report);
      this.logger.log(`Serasa report saved (${result.statusCode}) for client ${clientId}`);

      if (report.isSuccess && result.data) {
        try {
          await this.syncSerasaClientUseCase.execute(clientId, result.data);
        } catch (syncError) {
          this.logger.error(
            `Serasa enrichment failed for client ${clientId}: ${(syncError as Error).message}`,
          );
        }
      }

      return report;
    } catch (error) {
      const report = SerasaReport.create({
        clientId,
        cnpj: client.cnpj.replaceAll(/\D/g, ''),
        reportName: report_name,
        optionalFeatures: features,
        statusCode: 0,
        rawResponse: null,
        errorMessage: (error as Error).message,
        requestId: null,
      });

      await this.serasaReportRepository.save(report);
      this.logger.error(`Serasa report failed for client ${clientId}`, (error as Error).stack);
      return report;
    }
  }
}
