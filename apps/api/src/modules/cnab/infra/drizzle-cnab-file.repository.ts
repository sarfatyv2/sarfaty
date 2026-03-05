import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { cnabRemittanceFiles } from '../../../database/schema';
import type { CnabFileRepository, CnabFileFilters, PaginatedCnabFiles } from '../domain/cnab-file.repository';
import { CnabFile } from '../domain/cnab-file.entity';
import { CnabFileMapper } from './mappers/cnab-file.mapper';

@Injectable()
export class DrizzleCnabFileRepository implements CnabFileRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(file: CnabFile): Promise<CnabFile> {
    const data = CnabFileMapper.toPersistence(file);
    const rows = await this.db
      .insert(cnabRemittanceFiles)
      .values(data as typeof cnabRemittanceFiles.$inferInsert)
      .returning();
    return CnabFileMapper.toDomain(rows[0]!);
  }

  async findById(id: string): Promise<CnabFile | null> {
    const [row] = await this.db
      .select()
      .from(cnabRemittanceFiles)
      .where(eq(cnabRemittanceFiles.id, id))
      .limit(1);
    return row ? CnabFileMapper.toDomain(row) : null;
  }

  async findByFilters(filters: CnabFileFilters): Promise<PaginatedCnabFiles> {
    const conditions = [];

    if (filters.clientId) conditions.push(eq(cnabRemittanceFiles.clientId, filters.clientId));
    if (filters.status) conditions.push(eq(cnabRemittanceFiles.status, filters.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(cnabRemittanceFiles)
        .where(whereClause)
        .orderBy(desc(cnabRemittanceFiles.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(cnabRemittanceFiles).where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      files: rows.map(CnabFileMapper.toDomain),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async updateStatus(id: string, status: string, extras?: Record<string, unknown>): Promise<CnabFile | null> {
    const [row] = await this.db
      .update(cnabRemittanceFiles)
      .set({ status, ...extras } as Partial<typeof cnabRemittanceFiles.$inferInsert>)
      .where(eq(cnabRemittanceFiles.id, id))
      .returning();
    return row ? CnabFileMapper.toDomain(row) : null;
  }
}
