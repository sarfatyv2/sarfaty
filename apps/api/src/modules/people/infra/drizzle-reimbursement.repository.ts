import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { reimbursements } from '../../../database/schema/reimbursements';
import type {
  ReimbursementRepository,
  ReimbursementFilters,
} from '../domain/reimbursement.repository';
import type { Reimbursement } from '../domain/reimbursement.entity';
import { ReimbursementMapper } from './mappers/reimbursement.mapper';

@Injectable()
export class DrizzleReimbursementRepository implements ReimbursementRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<Reimbursement | null> {
    const rows = await this.db
      .select()
      .from(reimbursements)
      .where(eq(reimbursements.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return ReimbursementMapper.toDomain(row);
  }

  async findByFilters(
    filters: ReimbursementFilters,
  ): Promise<{ reimbursements: Reimbursement[]; total: number }> {
    const conditions = [];

    if (filters.collaboratorId) {
      conditions.push(eq(reimbursements.collaboratorId, filters.collaboratorId));
    }
    if (filters.collaboratorIds?.length) {
      conditions.push(inArray(reimbursements.collaboratorId, filters.collaboratorIds));
    }
    if (filters.status) {
      conditions.push(eq(reimbursements.status, filters.status));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select()
      .from(reimbursements)
      .where(whereClause)
      .orderBy(desc(reimbursements.createdAt));

    const total = rows.length;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const offset = (page - 1) * pageSize;
    const paginatedRows = rows.slice(offset, offset + pageSize);

    return {
      reimbursements: paginatedRows.map((row) => ReimbursementMapper.toDomain(row)),
      total,
    };
  }

  async create(data: {
    collaboratorId: string;
    title: string;
    description: string | null;
    category: string;
    amount: string;
    expenseDate: string;
    status?: string;
  }): Promise<Reimbursement> {
    const [row] = await this.db
      .insert(reimbursements)
      .values({
        collaboratorId: data.collaboratorId,
        title: data.title,
        description: data.description,
        category: data.category,
        amount: data.amount,
        expenseDate: data.expenseDate,
        status: data.status ?? 'pending',
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create reimbursement');
    }
    return ReimbursementMapper.toDomain(row);
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<Reimbursement | null> {
    await this.db
      .update(reimbursements)
      .set({ ...data, updatedAt: new Date() } as Record<string, unknown>)
      .where(eq(reimbursements.id, id));

    return this.findById(id);
  }
}
