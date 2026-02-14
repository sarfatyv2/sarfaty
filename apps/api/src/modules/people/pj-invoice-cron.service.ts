import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GenerateMonthlyPjInvoicesUseCase } from './use-cases/generate-monthly-pj-invoices.use-case';

@Injectable()
export class PjInvoiceCronService {
  private readonly logger = new Logger(PjInvoiceCronService.name);

  constructor(
    private readonly generateMonthlyPjInvoicesUseCase: GenerateMonthlyPjInvoicesUseCase,
  ) {}

  /**
   * Gera NFs mensais PJ no dia 20 de cada mês (9h BRT).
   * Conforme spec: CRON cria pj_invoices com status pending_upload para todos PJs ativos.
   */
  @Cron('0 0 9 20 * *', {
    name: 'generate-monthly-pj-invoices',
    timeZone: 'America/Sao_Paulo',
  })
  async handleGenerateMonthlyInvoices() {
    const now = new Date();
    const referenceYear = now.getFullYear();
    const referenceMonth = now.getMonth() + 1; // 1-12

    this.logger.log(
      `Running generate monthly PJ invoices for ${referenceMonth}/${referenceYear}`,
    );

    try {
      const result = await this.generateMonthlyPjInvoicesUseCase.execute(
        referenceYear,
        referenceMonth,
      );
      this.logger.log(
        `Generated ${result.created} invoices, skipped ${result.skipped} (already exist)`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to generate monthly PJ invoices: ${message}`);
    }
  }
}
