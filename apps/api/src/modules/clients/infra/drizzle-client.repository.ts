import { Inject, Injectable } from '@nestjs/common';
import { eq, and, ilike, or, desc, asc, count } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clients } from '../../../database/schema';
import type { ClientRepository, ClientFilters, PaginatedClients } from '../domain/client.repository';
import { Client } from '../domain/client.entity';
import { ClientMapper } from './mappers/client.mapper';

@Injectable()
export class DrizzleClientRepository implements ClientRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(client: Client): Promise<Client> {
    const data = ClientMapper.toPersistence(client);
    const rows = await this.db
      .insert(clients)
      .values(data as typeof clients.$inferInsert)
      .returning();
    const row = rows[0]!;
    return ClientMapper.toDomain(row);
  }

  async findById(id: string): Promise<Client | null> {
    const [row] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);
    return row ? ClientMapper.toDomain(row) : null;
  }

  async findByCnpj(cnpj: string): Promise<Client | null> {
    const [row] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.cnpj, cnpj))
      .limit(1);
    return row ? ClientMapper.toDomain(row) : null;
  }

  async findByFilters(filters: ClientFilters): Promise<PaginatedClients> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(clients.status, filters.status));
    }
    if (filters.segmentId) {
      conditions.push(eq(clients.segmentId, filters.segmentId));
    }
    if (filters.assignedTo) {
      conditions.push(eq(clients.assignedTo, filters.assignedTo));
    }
    if (filters.teamId) {
      conditions.push(eq(clients.teamId, filters.teamId));
    }
    if (filters.regionId) {
      conditions.push(eq(clients.regionId, filters.regionId));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(clients.companyName, `%${filters.search}%`),
          ilike(clients.cnpj, `%${filters.search}%`),
          ilike(clients.tradeName, `%${filters.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderColumn = filters.sortBy === 'companyName' ? clients.companyName
      : filters.sortBy === 'status' ? clients.status
      : clients.createdAt;
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;

    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(clients)
        .where(whereClause)
        .orderBy(orderFn(orderColumn))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(clients)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      clients: rows.map((row) => ClientMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Record<string, unknown>): Promise<Client | null> {
    const [row] = await this.db
      .update(clients)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof clients.$inferInsert>)
      .where(eq(clients.id, id))
      .returning();
    return row ? ClientMapper.toDomain(row) : null;
  }
}
