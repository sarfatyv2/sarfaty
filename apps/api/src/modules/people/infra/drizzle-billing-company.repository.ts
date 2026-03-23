import { Inject, Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { billingCompanies } from '../../../database/schema/billing-companies';
import type {
  BillingCompanyRepository,
  CreateBillingCompanyData,
  UpdateBillingCompanyData,
} from '../domain/billing-company.repository';
import { BillingCompany } from '../domain/billing-company.entity';

@Injectable()
export class DrizzleBillingCompanyRepository implements BillingCompanyRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(includeInactive = false): Promise<BillingCompany[]> {
    const base = this.db.select().from(billingCompanies);
    const rows = includeInactive
      ? await base.orderBy(asc(billingCompanies.name))
      : await base.where(eq(billingCompanies.isActive, true)).orderBy(asc(billingCompanies.name));

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<BillingCompany | null> {
    const [row] = await this.db
      .select()
      .from(billingCompanies)
      .where(eq(billingCompanies.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateBillingCompanyData): Promise<BillingCompany> {
    const [row] = await this.db
      .insert(billingCompanies)
      .values({
        name: data.name,
        tradeName: data.tradeName,
        cnpj: data.cnpj,
        isActive: data.isActive,
      })
      .returning();
    if (!row) {
      throw new Error('Failed to create billing company');
    }
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateBillingCompanyData): Promise<BillingCompany | null> {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.tradeName !== undefined) patch.tradeName = data.tradeName;
    if (data.cnpj !== undefined) patch.cnpj = data.cnpj;
    if (data.isActive !== undefined) patch.isActive = data.isActive;
    if (Object.keys(patch).length === 0) {
      return this.findById(id);
    }
    patch.updatedAt = new Date();
    await this.db.update(billingCompanies).set(patch).where(eq(billingCompanies.id, id));
    return this.findById(id);
  }

  private toDomain(row: typeof billingCompanies.$inferSelect): BillingCompany {
    return new BillingCompany({
      id: row.id,
      name: row.name,
      tradeName: row.tradeName,
      cnpj: row.cnpj,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
