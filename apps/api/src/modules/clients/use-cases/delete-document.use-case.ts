import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { CLIENT_DOCUMENT_REPOSITORY, type ClientDocumentRepository } from '../domain/client-document.repository';
import { ClientStorageService } from '../infra/client-storage.service';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(CLIENT_DOCUMENT_REPOSITORY)
    private readonly documentRepository: ClientDocumentRepository,
    private readonly storageService: ClientStorageService,
  ) {}

  async execute(clientId: string, documentId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundException(clientId);
    }

    if (!client.canDeleteDocuments()) {
      throw new Error(`Cannot delete documents in status '${client.status}'`);
    }

    const document = await this.documentRepository.findById(documentId);
    if (!document || document.clientId !== clientId) {
      throw new Error('Document not found');
    }

    // Delete from storage
    await this.storageService.deleteDocument(document.storagePath);

    // Delete from database
    await this.documentRepository.delete(documentId);
  }
}
