import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientContacts } from '../../../database/schema';
import type { ClientContactRepository } from '../domain/client-contact.repository';
import { ClientContact } from '../domain/client-contact.entity';
import { ClientContactMapper } from './mappers/client-contact.mapper';

@Injectable()
export class DrizzleClientContactRepository implements ClientContactRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByClientId(clientId: string): Promise<ClientContact[]> {
    const rows = await this.db
      .select()
      .from(clientContacts)
      .where(eq(clientContacts.clientId, clientId));
    return rows.map(ClientContactMapper.toDomain);
  }

  async findById(id: string): Promise<ClientContact | null> {
    const [row] = await this.db
      .select()
      .from(clientContacts)
      .where(eq(clientContacts.id, id))
      .limit(1);
    return row ? ClientContactMapper.toDomain(row) : null;
  }

  async save(contact: ClientContact): Promise<ClientContact> {
    const data = ClientContactMapper.toPersistence(contact);
    const [row] = await this.db
      .insert(clientContacts)
      .values(data as typeof clientContacts.$inferInsert)
      .returning();
    return ClientContactMapper.toDomain(row!);
  }

  async update(id: string, data: Record<string, unknown>): Promise<ClientContact | null> {
    const [row] = await this.db
      .update(clientContacts)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof clientContacts.$inferInsert>)
      .where(eq(clientContacts.id, id))
      .returning();
    return row ? ClientContactMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(clientContacts).where(eq(clientContacts.id, id));
  }
}
