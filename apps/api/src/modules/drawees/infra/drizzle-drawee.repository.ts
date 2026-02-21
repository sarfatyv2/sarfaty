import { Inject, Injectable } from '@nestjs/common';
import { eq, and, ilike, or, desc, asc, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { drawees } from '../../../database/schema';
import type { DraweeRepository, DraweeFilters, PaginatedDrawees } from '../domain/drawee.repository';
import { Drawee } from '../domain/drawee.entity';
import { DraweeMapper } from './mappers/drawee.mapper';

@Injectable()
export class DrizzleDraweeRepository implements DraweeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(drawee: Drawee): Promise<Drawee> {
    const data = DraweeMapper.toPersistence(drawee);
    const [row] = await this.db
      .insert(drawees)
      .values(data as typeof drawees.$inferInsert)
      .returning();
    return DraweeMapper.toDomain(row!);
  }

  async findById(id: string): Promise<Drawee | null> {
    const [row] = await this.db
      .select()
      .from(drawees)
      .where(eq(drawees.id, id))
      .limit(1);
    return row ? DraweeMapper.toDomain(row) : null;
  }

  async findByCnpj(cnpj: string): Promise<Drawee | null> {
    const [row] = await this.db
      .select()
      .from(drawees)
      .where(eq(drawees.cnpj, cnpj))
      .limit(1);
    return row ? DraweeMapper.toDomain(row) : null;
  }

  async findByCpf(cpf: string): Promise<Drawee | null> {
    const [row] = await this.db
      .select()
      .from(drawees)
      .where(eq(drawees.cpf, cpf))
      .limit(1);
    return row ? DraweeMapper.toDomain(row) : null;
  }

  async findByFilters(filters: DraweeFilters): Promise<PaginatedDrawees> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(drawees.status, filters.status));
    }
    if (filters.personType) {
      conditions.push(eq(drawees.personType, filters.personType));
    }
    if (filters.segmentId) {
      conditions.push(eq(drawees.segmentId, filters.segmentId));
    }
    if (filters.isPep !== undefined) {
      conditions.push(eq(drawees.isPep, filters.isPep));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(drawees.companyName, `%${filters.search}%`),
          ilike(drawees.cnpj, `%${filters.search}%`),
          ilike(drawees.cpf, `%${filters.search}%`),
          ilike(drawees.tradeName, `%${filters.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderColumn = filters.sortBy === 'companyName' ? drawees.companyName
      : filters.sortBy === 'status' ? drawees.status
      : drawees.createdAt;
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;
    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db.select().from(drawees).where(whereClause).orderBy(orderFn(orderColumn)).limit(filters.pageSize).offset(offset),
      this.db.select({ count: count() }).from(drawees).where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      drawees: rows.map(DraweeMapper.toDomain),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Record<string, unknown>): Promise<Drawee | null> {
    const [row] = await this.db
      .update(drawees)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof drawees.$inferInsert>)
      .where(eq(drawees.id, id))
      .returning();
    return row ? DraweeMapper.toDomain(row) : null;
  }
}
