import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProcessFaturamentoDocumentUseCase } from '../use-cases/process-faturamento-document.use-case';

export interface FaturamentoDocumentUploadedPayload {
  documentId: string;
  clientId: string;
  storagePath: string;
  mimeType: string;
  referenceYear: number | null;
}

@Injectable()
export class FaturamentoDocumentListener {
  private readonly logger = new Logger(FaturamentoDocumentListener.name);

  constructor(
    private readonly processFaturamentoDocument: ProcessFaturamentoDocumentUseCase,
  ) {}

  @OnEvent('document.uploaded.faturamento', { async: true })
  async handleFaturamentoDocumentUploaded(payload: FaturamentoDocumentUploadedPayload): Promise<void> {
    this.logger.log(`Received faturamento upload event for document ${payload.documentId}`);

    try {
      await this.processFaturamentoDocument.execute({
        documentId: payload.documentId,
        clientId: payload.clientId,
        storagePath: payload.storagePath,
        mimeType: payload.mimeType,
        referenceYear: payload.referenceYear,
      });
    } catch (error) {
      // Log the error but do NOT re-throw — this prevents blocking the upload response
      this.logger.error(
        `Faturamento processing failed for document ${payload.documentId}: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
