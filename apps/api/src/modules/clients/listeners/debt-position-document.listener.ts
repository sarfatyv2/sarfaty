import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProcessDebtPositionDocumentUseCase } from '../use-cases/process-debt-position-document.use-case';

export interface DebtPositionDocumentUploadedPayload {
  documentId: string;
  clientId: string;
  storagePath: string;
  mimeType: string;
}

@Injectable()
export class DebtPositionDocumentListener {
  private readonly logger = new Logger(DebtPositionDocumentListener.name);

  constructor(
    private readonly processDebtPositionDocument: ProcessDebtPositionDocumentUseCase,
  ) {}

  @OnEvent('document.uploaded.debt_position', { async: true })
  async handleDebtPositionDocumentUploaded(payload: DebtPositionDocumentUploadedPayload): Promise<void> {
    this.logger.log(`Received debt_position upload event for document ${payload.documentId}`);

    try {
      await this.processDebtPositionDocument.execute({
        documentId: payload.documentId,
        clientId: payload.clientId,
        storagePath: payload.storagePath,
        mimeType: payload.mimeType,
      });
    } catch (error) {
      this.logger.error(
        `Debt position processing failed for document ${payload.documentId}: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
