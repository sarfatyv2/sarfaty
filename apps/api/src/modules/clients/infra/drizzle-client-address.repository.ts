import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientAddresses } from '../../../database/schema';
import type { ClientAddressRepository } from '../domain/client-address.repository';
import { ClientAddress } from '../domain/client-address.entity';
import { ClientAddressMapper } from './mappers/client-address.mapper';

@Injectable()
export class DrizzleClientAddressRepository implements ClientAddressRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByClientId(clientId: string): Promise<ClientAddress[]> {
    const rows = await this.db
      .select()
      .from(clientAddresses)
      .where(eq(clientAddresses.clientId, clientId));
    return rows.map(ClientAddressMapper.toDomain);
  }

  async findById(id: string): Promise<ClientAddress | null> {
    const [row] = await this.db
      .select()
      .from(clientAddresses)
      .where(eq(clientAddresses.id, id))
      .limit(1);
    return row ? ClientAddressMapper.toDomain(row) : null;
  }

  async findByClientAndSource(clientId: string, source: string): Promise<ClientAddress | null> {
    const [row] = await this.db
      .select()
      .from(clientAddresses)
      .where(and(eq(clientAddresses.clientId, clientId), eq(clientAddresses.source, source)))
      .limit(1);
    return row ? ClientAddressMapper.toDomain(row) : null;
  }

  async save(address: ClientAddress): Promise<ClientAddress> {
    const data = ClientAddressMapper.toPersistence(address);
    const [row] = await this.db
      .insert(clientAddresses)
      .values(data as typeof clientAddresses.$inferInsert)
      .returning();
    return ClientAddressMapper.toDomain(row!);
  }

  async update(id: string, data: Record<string, unknown>): Promise<ClientAddress | null> {
    const [row] = await this.db
      .update(clientAddresses)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof clientAddresses.$inferInsert>)
      .where(eq(clientAddresses.id, id))
      .returning();
    return row ? ClientAddressMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(clientAddresses).where(eq(clientAddresses.id, id));
  }
}
