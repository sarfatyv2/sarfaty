import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, and, desc, asc, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { govCommittees } from '../../../database/schema';
import type {
  CommitteeRepository,
  CommitteeFilters,
  PaginatedCommittees,
} from '../domain/committee.repository';
import { Committee } from '../domain/committee.entity';
import { CommitteeMapper } from './mappers/committee.mapper';

@Injectable()
export class DrizzleCommitteeRepository implements CommitteeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(committee: Committee): Promise<Committee> {
    const data = CommitteeMapper.toPersistence(committee);
    const [row] = await this.db
      .insert(govCommittees)
      .values(data as typeof govCommittees.$inferInsert)
      .returning();
    return CommitteeMapper.toDomain(row!);
  }

  async findById(id: string): Promise<Committee | null> {
    const [row] = await this.db
      .select()
      .from(govCommittees)
      .where(eq(govCommittees.id, id))
      .limit(1);
    return row ? CommitteeMapper.toDomain(row) : null;
  }

  async findByFilters(filters: CommitteeFilters): Promise<PaginatedCommittees> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(govCommittees.status, filters.status));
    }
    if (filters.search) {
      conditions.push(ilike(govCommittees.name, `%${filters.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(govCommittees)
        .where(whereClause)
        .orderBy(orderFn(govCommittees.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(govCommittees)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      committees: rows.map((row) => CommitteeMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Partial<Record<string, unknown>>): Promise<Committee | null> {
    const [row] = await this.db
      .update(govCommittees)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof govCommittees.$inferInsert>)
      .where(eq(govCommittees.id, id))
      .returning();
    return row ? CommitteeMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(govCommittees)
      .where(eq(govCommittees.id, id))
      .returning({ id: govCommittees.id });
    return result.length > 0;
  }
}
