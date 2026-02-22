import { describe, expect, it, vi } from 'vitest';
import { UploadInvoiceUseCase } from '../../src/modules/people/use-cases/upload-invoice.use-case';
import { UploadReceiptUseCase } from '../../src/modules/people/use-cases/upload-receipt.use-case';

describe('IDOR protection on uploads (security)', () => {
  it('rejects invoice upload when profile tries to upload to another collaborator invoice', async () => {
    const invoiceRepository = {
      findById: vi.fn().mockResolvedValue({
        collaboratorId: 'collaborator-owner',
        referenceYear: 2026,
        referenceMonth: 2,
        status: 'draft',
        canUpload: () => true,
      }),
      update: vi.fn(),
    };
    const collaboratorRepository = {
      findByProfileId: vi.fn().mockResolvedValue({
        id: 'collaborator-other',
      }),
    };
    const storageService = {
      uploadInvoice: vi.fn(),
    };

    const useCase = new UploadInvoiceUseCase(
      invoiceRepository as any,
      collaboratorRepository as any,
      storageService as any,
    );

    await expect(
      useCase.execute({
        invoiceId: 'invoice-id',
        profileId: 'profile-id',
        file: {
          buffer: Buffer.from('fake'),
          originalName: 'invoice.pdf',
          mimetype: 'application/pdf',
        },
        invoiceNumber: '123',
        invoiceAmount: '100.00',
      }),
    ).rejects.toThrow('Unauthorized: you can only upload to your own invoices');

    expect(storageService.uploadInvoice).not.toHaveBeenCalled();
    expect(invoiceRepository.update).not.toHaveBeenCalled();
  });

  it('rejects receipt upload when profile tries to upload to another collaborator reimbursement', async () => {
    const reimbursementRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'reimbursement-id',
        collaboratorId: 'collaborator-owner',
        status: 'pending',
      }),
      update: vi.fn(),
    };
    const collaboratorRepository = {
      findByProfileId: vi.fn().mockResolvedValue({
        id: 'collaborator-other',
      }),
    };
    const storageService = {
      uploadReceipt: vi.fn(),
    };

    const useCase = new UploadReceiptUseCase(
      reimbursementRepository as any,
      collaboratorRepository as any,
      storageService as any,
    );

    await expect(
      useCase.execute({
        reimbursementId: 'reimbursement-id',
        profileId: 'profile-id',
        file: {
          buffer: Buffer.from('fake'),
          originalName: 'receipt.pdf',
          mimetype: 'application/pdf',
        },
      }),
    ).rejects.toThrow('Unauthorized: you can only upload receipt to your own reimbursements');

    expect(storageService.uploadReceipt).not.toHaveBeenCalled();
    expect(reimbursementRepository.update).not.toHaveBeenCalled();
  });
});
