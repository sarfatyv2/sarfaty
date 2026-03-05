import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { cnabOperations } from '../../../database/schema';
import type {
  CnabOperationRepository,
  CnabOperationFilters,
  PaginatedCnabOperations,
} from '../domain/cnab-operation.repository';
import { CnabOperationEntity } from '../domain/cnab-operation.entity';
import { CnabOperationMapper } from './mappers/cnab-operation.mapper';

@Injectable()
export class DrizzleCnabOperationRepository implements CnabOperationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(operation: CnabOperationEntity): Promise<CnabOperationEntity> {
    const data = CnabOperationMapper.toPersistence(operation);
    const rows = await this.db
      .insert(cnabOperations)
      .values(data as typeof cnabOperations.$inferInsert)
      .returning();
    return CnabOperationMapper.toDomain(rows[0]!);
  }

  async findById(id: string): Promise<CnabOperationEntity | null> {
    const [row] = await this.db
      .select()
      .from(cnabOperations)
      .where(eq(cnabOperations.id, id))
      .limit(1);
    return row ? CnabOperationMapper.toDomain(row) : null;
  }

  async findByCnabFileId(cnabFileId: string): Promise<CnabOperationEntity | null> {
    const [row] = await this.db
      .select()
      .from(cnabOperations)
      .where(eq(cnabOperations.cnabFileId, cnabFileId))
      .limit(1);
    return row ? CnabOperationMapper.toDomain(row) : null;
  }

  async findByFilters(filters: CnabOperationFilters): Promise<PaginatedCnabOperations> {
    const conditions = [];

    if (filters.clientId) conditions.push(eq(cnabOperations.clientId, filters.clientId));
    if (filters.status) conditions.push(eq(cnabOperations.status, filters.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(cnabOperations)
        .where(whereClause)
        .orderBy(desc(cnabOperations.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(cnabOperations).where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      operations: rows.map(CnabOperationMapper.toDomain),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async updateTotalApprovedAmount(id: string, amount: string): Promise<CnabOperationEntity | null> {
    const [row] = await this.db
      .update(cnabOperations)
      .set({ totalApprovedAmount: amount, updatedAt: new Date() })
      .where(eq(cnabOperations.id, id))
      .returning();
    return row ? CnabOperationMapper.toDomain(row) : null;
  }

  async updateStatus(id: string, status: string): Promise<CnabOperationEntity | null> {
    const [row] = await this.db
      .update(cnabOperations)
      .set({ status, updatedAt: new Date() })
      .where(eq(cnabOperations.id, id))
      .returning();
    return row ? CnabOperationMapper.toDomain(row) : null;
  }
}
