import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { pjInvoices } from '../../../database/schema/pj-invoices';
import { billingCompanies } from '../../../database/schema/billing-companies';
import type {
  PjInvoiceRepository,
  PjInvoiceFilters,
  CreatePjInvoiceData,
} from '../domain/pj-invoice.repository';
import type { PjInvoice } from '../domain/pj-invoice.entity';
import { PjInvoiceMapper } from './mappers/pj-invoice.mapper';

@Injectable()
export class DrizzlePjInvoiceRepository implements PjInvoiceRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<PjInvoice | null> {
    const rows = await this.db
      .select({
        invoice: pjInvoices,
        billingCompanyName: billingCompanies.name,
      })
      .from(pjInvoices)
      .leftJoin(billingCompanies, eq(pjInvoices.billingCompanyId, billingCompanies.id))
      .where(eq(pjInvoices.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return PjInvoiceMapper.toDomain(row.invoice, row.billingCompanyName);
  }

  async findByCollaboratorAndPeriod(
    collaboratorId: string,
    referenceMonth: number,
    referenceYear: number,
  ): Promise<PjInvoice | null> {
    const rows = await this.db
      .select({
        invoice: pjInvoices,
        billingCompanyName: billingCompanies.name,
      })
      .from(pjInvoices)
      .leftJoin(billingCompanies, eq(pjInvoices.billingCompanyId, billingCompanies.id))
      .where(
        and(
          eq(pjInvoices.collaboratorId, collaboratorId),
          eq(pjInvoices.referenceMonth, referenceMonth),
          eq(pjInvoices.referenceYear, referenceYear),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return PjInvoiceMapper.toDomain(row.invoice, row.billingCompanyName);
  }

  async findByFilters(
    filters: PjInvoiceFilters,
  ): Promise<{ invoices: PjInvoice[]; total: number }> {
    const conditions = [];

    if (filters.collaboratorId) {
      conditions.push(eq(pjInvoices.collaboratorId, filters.collaboratorId));
    }
    if (filters.collaboratorIds?.length) {
      conditions.push(inArray(pjInvoices.collaboratorId, filters.collaboratorIds));
    }
    if (filters.status) {
      conditions.push(eq(pjInvoices.status, filters.status));
    }
    if (filters.referenceYear !== undefined) {
      conditions.push(eq(pjInvoices.referenceYear, filters.referenceYear));
    }
    if (filters.referenceMonth !== undefined) {
      conditions.push(eq(pjInvoices.referenceMonth, filters.referenceMonth));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        invoice: pjInvoices,
        billingCompanyName: billingCompanies.name,
      })
      .from(pjInvoices)
      .leftJoin(billingCompanies, eq(pjInvoices.billingCompanyId, billingCompanies.id))
      .where(whereClause)
      .orderBy(desc(pjInvoices.referenceYear), desc(pjInvoices.referenceMonth));

    const total = rows.length;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const offset = (page - 1) * pageSize;
    const paginatedRows = rows.slice(offset, offset + pageSize);

    return {
      invoices: paginatedRows.map((row) =>
        PjInvoiceMapper.toDomain(row.invoice, row.billingCompanyName),
      ),
      total,
    };
  }

  async create(data: CreatePjInvoiceData): Promise<PjInvoice> {
    const [row] = await this.db
      .insert(pjInvoices)
      .values({
        collaboratorId: data.collaboratorId,
        referenceMonth: data.referenceMonth,
        referenceYear: data.referenceYear,
        invoiceAmount: data.invoiceAmount,
        status: data.status,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create pj_invoice');
    }
    return PjInvoiceMapper.toDomain(row, null);
  }

  async findOverdue(): Promise<PjInvoice[]> {
    const rows = await this.db
      .select({
        invoice: pjInvoices,
        billingCompanyName: billingCompanies.name,
      })
      .from(pjInvoices)
      .leftJoin(billingCompanies, eq(pjInvoices.billingCompanyId, billingCompanies.id))
      .where(eq(pjInvoices.status, 'overdue'));

    return rows.map((row) => PjInvoiceMapper.toDomain(row.invoice, row.billingCompanyName));
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<PjInvoice | null> {
    await this.db
      .update(pjInvoices)
      .set({ ...data, updatedAt: new Date() } as Record<string, unknown>)
      .where(eq(pjInvoices.id, id));

    return this.findById(id);
  }
}
