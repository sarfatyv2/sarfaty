import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreditboxAdapter } from '../bureaus/creditbox/creditbox.adapter';
import { CreditboxReport } from '../domain/creditbox-report.entity';
import { CreditboxRepository, CREDITBOX_REPOSITORY } from '../domain/creditbox.repository';

@Injectable()
export class SyncCreditboxReportUseCase {
  private readonly logger = new Logger(SyncCreditboxReportUseCase.name);

  constructor(
    @Inject(CREDITBOX_REPOSITORY)
    private readonly creditboxRepository: CreditboxRepository,
    private readonly creditboxAdapter: CreditboxAdapter,
  ) {}

  async execute(clientId: string): Promise<CreditboxReport | null> {
    this.logger.log(`Syncing CreditBox report for client ${clientId}`);

    // 1. Get the latest report for the client
    const report = await this.creditboxRepository.getLatestByClientId(clientId);

    if (!report) {
      this.logger.debug(`No CreditBox report found for client ${clientId}`);
      return null; // Nothing to sync
    }

    // 2. We only need to sync if it's PENDING or PROCESSING
    if (report.status === 'COMPLETED' || report.status === 'ERROR') {
      this.logger.debug(`CreditBox report for client ${clientId} is already ${report.status}`);
      return report;
    }

    const processId = report.processId;
    if (!processId) {
      this.logger.error(`Report ${report.id} is PENDING but has no processId. Marking as ERROR.`);
      report.markAsError('Missing processId');
      await this.creditboxRepository.update(report);
      return report;
    }

    try {
      // 3. Consult the status
      const result = await this.creditboxAdapter.consultReport(processId);

      // 4. Update based on result
      if (result.erro) {
        const errorMsg = result.mensagem || 'Consult returned error status';
        this.logger.warn(`CreditBox sync failed for client ${clientId}: ${errorMsg}`);
        report.markAsError(errorMsg);
        await this.creditboxRepository.update(report);
        return report;
      }

      if (result.concluido) {
        this.logger.log(`CreditBox report completed for client ${clientId}`);
        // Report is ready!
        report.markAsCompleted(
          result.json || null,
          result.pdfBase64 || null
        );
        await this.creditboxRepository.update(report);
        return report;
      }

      // If neither erro nor concluido, it's still processing
      // We could optionally update status to 'PROCESSING' if it was 'PENDING'
      // but keeping it as is also fine. Let's make it PROCESSING for clearer state.
      if (report.status === 'PENDING') {
        const updatedReport = CreditboxReport.reconstruct({
          ...report['props'],
          status: 'PROCESSING'
        });
        await this.creditboxRepository.update(updatedReport);
        return updatedReport;
      }

      return report;
    } catch (error) {
      this.logger.error(`Error syncing CreditBox report for client ${clientId}`, (error as Error).stack);
      // We don't mark as error immediately on network failures during polling
      // to avoid failing a long-running report generation just because of a hiccup.
      // We just return the current report state.
      return report;
    }
  }
}
