import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientAuthorizedPersons } from '../../../database/schema';
import type { ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';
import { ClientAuthorizedPerson } from '../domain/client-authorized-person.entity';
import { ClientAuthorizedPersonMapper } from './mappers/client-authorized-person.mapper';

@Injectable()
export class DrizzleClientAuthorizedPersonRepository implements ClientAuthorizedPersonRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByClientId(clientId: string): Promise<ClientAuthorizedPerson[]> {
    const rows = await this.db
      .select()
      .from(clientAuthorizedPersons)
      .where(eq(clientAuthorizedPersons.clientId, clientId));
    return rows.map(ClientAuthorizedPersonMapper.toDomain);
  }

  async findById(id: string): Promise<ClientAuthorizedPerson | null> {
    const [row] = await this.db
      .select()
      .from(clientAuthorizedPersons)
      .where(eq(clientAuthorizedPersons.id, id))
      .limit(1);
    return row ? ClientAuthorizedPersonMapper.toDomain(row) : null;
  }

  async findByClientAndSource(clientId: string, source: string): Promise<ClientAuthorizedPerson[]> {
    const rows = await this.db
      .select()
      .from(clientAuthorizedPersons)
      .where(and(
        eq(clientAuthorizedPersons.clientId, clientId),
        eq(clientAuthorizedPersons.source, source),
      ));
    return rows.map(ClientAuthorizedPersonMapper.toDomain);
  }

  async save(person: ClientAuthorizedPerson): Promise<ClientAuthorizedPerson> {
    const data = ClientAuthorizedPersonMapper.toPersistence(person);
    const [row] = await this.db
      .insert(clientAuthorizedPersons)
      .values(data as typeof clientAuthorizedPersons.$inferInsert)
      .returning();
    return ClientAuthorizedPersonMapper.toDomain(row!);
  }

  async update(id: string, data: Record<string, unknown>): Promise<ClientAuthorizedPerson | null> {
    const [row] = await this.db
      .update(clientAuthorizedPersons)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof clientAuthorizedPersons.$inferInsert>)
      .where(eq(clientAuthorizedPersons.id, id))
      .returning();
    return row ? ClientAuthorizedPersonMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(clientAuthorizedPersons).where(eq(clientAuthorizedPersons.id, id));
  }
}
