import { Inject, Injectable } from '@nestjs/common';
import type { UploadDocumentDto } from '@nexus/validators';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository, type ClientDocumentRow } from '../domain/client-document.repository';
import { ClientStorageService } from '../infra/client-storage.service';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';

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

    return document;
  }
}
