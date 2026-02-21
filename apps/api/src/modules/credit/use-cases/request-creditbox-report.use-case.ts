import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clients } from '../../../database/schema';
import { CreditboxAdapter } from '../bureaus/creditbox/creditbox.adapter';
import { CreditboxReport } from '../domain/creditbox-report.entity';
import { CreditboxRepository, CREDITBOX_REPOSITORY } from '../domain/creditbox.repository';

@Injectable()
export class RequestCreditboxReportUseCase {
  private readonly logger = new Logger(RequestCreditboxReportUseCase.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    @Inject(CREDITBOX_REPOSITORY)
    private readonly creditboxRepository: CreditboxRepository,
    private readonly creditboxAdapter: CreditboxAdapter,
  ) {}

  async execute(clientId: string): Promise<CreditboxReport> {
    this.logger.log(`Requesting CreditBox report for client ${clientId}`);

    // 1. Fetch client CNPJ
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

    // 2. Initial record creation
    let report = CreditboxReport.create({
      clientId,
      processId: null,
      status: 'PENDING',
      reportJson: null,
      pdfBase64: null,
      errorMessage: null,
      completedAt: null,
    });

    try {
      // 3. Call adapter to start report generation
      const result = await this.creditboxAdapter.requestReport({
        documento: client.cnpj,
      });

      // 4. Handle response
      if (result.iniciado && result.id) {
        // Successfully started
        report = CreditboxReport.reconstruct({
          ...report['props'],
          processId: result.id,
          status: 'PENDING', // Could also be PROCESSING depending on definition
        });
        await this.creditboxRepository.save(report);
      } else {
        // Failed to start (e.g. "Cadastro não encontrado")
        const errorMsg = result.mensagem || 'Failed to start report generation';
        this.logger.warn(`CreditBox generation failed for client ${clientId}: ${errorMsg}`);
        report.markAsError(errorMsg);
        await this.creditboxRepository.save(report);
      }

      return report;
    } catch (error) {
      this.logger.error(`Error requesting CreditBox report for client ${clientId}`, (error as Error).stack);
      report.markAsError((error as Error).message);
      await this.creditboxRepository.save(report);
      return report;
    }
  }
}
