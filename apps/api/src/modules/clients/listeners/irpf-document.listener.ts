import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProcessIrpfDocumentUseCase } from '../use-cases/process-irpf-document.use-case';

export interface IrpfDocumentUploadedPayload {
  documentId: string;
  clientId: string;
  storagePath: string;
  authorizedPersonId: string | null;
  partnerName: string | null;
  referenceYear: number | null;
}

@Injectable()
export class IrpfDocumentListener {
  private readonly logger = new Logger(IrpfDocumentListener.name);

  constructor(
    private readonly processIrpfDocument: ProcessIrpfDocumentUseCase,
  ) {}

  @OnEvent('document.uploaded.irpf', { async: true })
  async handleIrpfDocumentUploaded(payload: IrpfDocumentUploadedPayload): Promise<void> {
    this.logger.log(`Received IRPF upload event for document ${payload.documentId}`);

    try {
      await this.processIrpfDocument.execute({
        documentId: payload.documentId,
        clientId: payload.clientId,
        storagePath: payload.storagePath,
        authorizedPersonId: payload.authorizedPersonId,
        partnerName: payload.partnerName,
        referenceYear: payload.referenceYear,
      });
    } catch (error) {
      // Log the error but do NOT re-throw — this prevents blocking the upload response
      this.logger.error(
        `IRPF processing failed for document ${payload.documentId}: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
