import { Inject, Injectable } from '@nestjs/common';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import type { PjInvoiceRepository } from '../domain/pj-invoice.repository';
import { PJ_INVOICE_REPOSITORY } from '../domain/pj-invoice.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';
import { PeopleStorageService } from '../infra/people-storage.service';

export interface UploadInvoiceInput {
  invoiceId: string;
  profileId: string;
  file: { buffer: Buffer; originalName: string; mimetype: string };
  invoiceNumber: string;
  invoiceAmount: string;
}

@Injectable()
export class UploadInvoiceUseCase {
  constructor(
    @Inject(PJ_INVOICE_REPOSITORY)
    private readonly invoiceRepository: PjInvoiceRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly storageService: PeopleStorageService,
  ) {}

  async execute(input: UploadInvoiceInput): Promise<PjInvoice> {
    const invoice = await this.invoiceRepository.findById(input.invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (!invoice.canUpload()) {
      throw new Error(`Cannot upload: invoice status is ${invoice.status}`);
    }

    const collaborator = await this.collaboratorRepository.findByProfileId(input.profileId);
    if (!collaborator || collaborator.id !== invoice.collaboratorId) {
      throw new Error('Unauthorized: you can only upload to your own invoices');
    }

    const { path, size, mimeType } = await this.storageService.uploadInvoice(
      invoice.collaboratorId,
      invoice.referenceYear,
      invoice.referenceMonth,
      input.file,
    );

    const updated = await this.invoiceRepository.update(input.invoiceId, {
      invoicePath: path,
      invoiceFileName: input.file.originalName,
      invoiceNumber: input.invoiceNumber,
      invoiceAmount: input.invoiceAmount,
      uploadedAt: new Date(),
      uploadedBy: input.profileId,
      invoiceFileSize: size,
      invoiceMimeType: mimeType,
      status: 'pending_review',
    });

    if (!updated) {
      throw new Error('Failed to update invoice after upload');
    }
    return updated;
  }
}
