import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { InvoicesController } from '../../src/modules/people/controllers/invoices.controller';

function createController() {
  return new InvoicesController(
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
    { execute: vi.fn() } as any,
  );
}

describe('InvoicesController upload validation (security)', () => {
  it('rejects upload when file is missing', async () => {
    const controller = createController();

    await expect(
      controller.upload('invoice-id', { body: {} }, { id: 'profile-id' }),
    ).rejects.toThrow(new BadRequestException('File is required'));
  });

  it('rejects upload when invoiceAmount is missing', async () => {
    const controller = createController();

    await expect(
      controller.upload(
        'invoice-id',
        {
          body: {
            file: {
              filename: 'invoice.pdf',
              mimetype: 'application/pdf',
              toBuffer: async () => Buffer.from('%PDF-1.7'),
            },
          },
        },
        { id: 'profile-id' },
      ),
    ).rejects.toThrow(new BadRequestException('invoiceAmount is required'));
  });
});
