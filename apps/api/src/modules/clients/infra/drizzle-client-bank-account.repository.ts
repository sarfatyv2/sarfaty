import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientBankAccounts } from '../../../database/schema';
import type { ClientBankAccountRepository } from '../domain/client-bank-account.repository';
import { ClientBankAccount } from '../domain/client-bank-account.entity';
import { ClientBankAccountMapper } from './mappers/client-bank-account.mapper';

@Injectable()
export class DrizzleClientBankAccountRepository implements ClientBankAccountRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllByClientId(clientId: string): Promise<ClientBankAccount[]> {
    const rows = await this.db
      .select()
      .from(clientBankAccounts)
      .where(eq(clientBankAccounts.clientId, clientId));
    return rows.map(ClientBankAccountMapper.toDomain);
  }

  async findById(id: string): Promise<ClientBankAccount | null> {
    const [row] = await this.db
      .select()
      .from(clientBankAccounts)
      .where(eq(clientBankAccounts.id, id))
      .limit(1);
    return row ? ClientBankAccountMapper.toDomain(row) : null;
  }

  async save(account: ClientBankAccount): Promise<ClientBankAccount> {
    const data = ClientBankAccountMapper.toPersistence(account);
    const [row] = await this.db
      .insert(clientBankAccounts)
      .values(data as typeof clientBankAccounts.$inferInsert)
      .returning();
    return ClientBankAccountMapper.toDomain(row!);
  }

  async update(id: string, data: Record<string, unknown>): Promise<ClientBankAccount | null> {
    const [row] = await this.db
      .update(clientBankAccounts)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof clientBankAccounts.$inferInsert>)
      .where(eq(clientBankAccounts.id, id))
      .returning();
    return row ? ClientBankAccountMapper.toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(clientBankAccounts).where(eq(clientBankAccounts.id, id));
  }
}
