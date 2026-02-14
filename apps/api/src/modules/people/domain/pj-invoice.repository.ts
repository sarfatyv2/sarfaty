import type { PjInvoice } from './pj-invoice.entity';

export const PJ_INVOICE_REPOSITORY = Symbol('PJ_INVOICE_REPOSITORY');

export interface PjInvoiceFilters {
  collaboratorId?: string;
  collaboratorIds?: string[];
  status?: string;
  referenceYear?: number;
  referenceMonth?: number;
  page?: number;
  pageSize?: number;
}

export interface CreatePjInvoiceData {
  collaboratorId: string;
  referenceMonth: number;
  referenceYear: number;
  invoiceAmount: string;
  status: string;
}

export interface PjInvoiceRepository {
  findById(id: string): Promise<PjInvoice | null>;
  findByFilters(filters: PjInvoiceFilters): Promise<{ invoices: PjInvoice[]; total: number }>;
  findOverdue(): Promise<PjInvoice[]>;
  create(data: CreatePjInvoiceData): Promise<PjInvoice>;
  update(id: string, data: Record<string, unknown>): Promise<PjInvoice | null>;
}
