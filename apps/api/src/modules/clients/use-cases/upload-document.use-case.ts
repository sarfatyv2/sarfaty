import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { UploadDocumentDto } from '@nexus/validators';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository, type ClientDocumentRow } from '../domain/client-document.repository';
import { ClientStorageService } from '../infra/client-storage.service';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';
import type { IrpfDocumentUploadedPayload } from '../listeners/irpf-document.listener';
import type { FaturamentoDocumentUploadedPayload } from '../listeners/faturamento-document.listener';
import type { DebtPositionDocumentUploadedPayload } from '../listeners/debt-position-document.listener';

export interface UploadDocumentInput {
  clientId: string;
  dto: UploadDocumentDto;
  file: { buffer: Buffer; originalName: string; mimetype: string };
  uploadedBy: string;
}

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ClientDocumentRepository,
    private readonly storageService: ClientStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: UploadDocumentInput): Promise<ClientDocumentRow> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new ClientNotFoundException(input.clientId);
    }

    if (!client.canUploadDocuments()) {
      throw new Error(`Cannot upload documents in status '${client.status}'`);
    }

    // Upload to storage
    const uploadResult = await this.storageService.uploadDocument(
      input.clientId,
      input.dto.documentType,
      input.file,
    );

    // Save metadata to database
    const document = await this.documentRepository.create({
      clientId: input.clientId,
      documentType: input.dto.documentType,
      documentCategory: input.dto.documentCategory,
      documentLabel: input.dto.documentLabel ?? null,
      referenceYear: input.dto.referenceYear ?? null,
      referenceMonth: input.dto.referenceMonth ?? null,
      partnerName: input.dto.partnerName ?? null,
      segmentTemplateId: input.dto.segmentTemplateId ?? null,
      productTemplateId: input.dto.productTemplateId ?? null,
      guaranteeTemplateId: input.dto.guaranteeTemplateId ?? null,
      clientGuaranteeId: input.dto.clientGuaranteeId ?? null,
      storagePath: uploadResult.path,
      fileName: input.file.originalName,
      fileSize: uploadResult.size,
      mimeType: uploadResult.mimeType,
      uploadedBy: input.uploadedBy,
    });

    // If client is in draft, transition to pending_documents
    if (client.status === 'draft') {
      await this.clientRepository.update(input.clientId, {
        status: 'pending_documents',
      });
    }

    // Trigger async IRPF extraction agent
    if (input.dto.documentType === 'irpf') {
      const payload: IrpfDocumentUploadedPayload = {
        documentId: document.id,
        clientId: input.clientId,
        storagePath: uploadResult.path,
        authorizedPersonId: null,
        partnerName: input.dto.partnerName ?? null,
        referenceYear: input.dto.referenceYear ?? null,
      };
      this.eventEmitter.emit('document.uploaded.irpf', payload);
    }

    // Trigger async faturamento extraction agent
    // 'revenue' is the checklist document type for faturamento documents
    if (input.dto.documentType === 'faturamento' || input.dto.documentType === 'revenue') {
      const payload: FaturamentoDocumentUploadedPayload = {
        documentId: document.id,
        clientId: input.clientId,
        storagePath: uploadResult.path,
        mimeType: input.file.mimetype,
        referenceYear: input.dto.referenceYear ?? null,
      };
      this.eventEmitter.emit('document.uploaded.faturamento', payload);
    }

    // Trigger async debt position extraction agent
    if (input.dto.documentType === 'debt_position') {
      const payload: DebtPositionDocumentUploadedPayload = {
        documentId: document.id,
        clientId: input.clientId,
        storagePath: uploadResult.path,
        mimeType: input.file.mimetype,
      };
      this.eventEmitter.emit('document.uploaded.debt_position', payload);
    }

    return document;
  }
}
