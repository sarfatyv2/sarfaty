import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientDocuments } from '../../../database/schema';
import type { ClientDocumentRepository, ClientDocumentData, ClientDocumentRow } from '../domain/client-document.repository';
import { ClientDocumentMapper } from './mappers/client-document.mapper';

@Injectable()
export class DrizzleClientDocumentRepository implements ClientDocumentRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: ClientDocumentData): Promise<ClientDocumentRow> {
    const [row] = await this.db
      .insert(clientDocuments)
      .values(data as typeof clientDocuments.$inferInsert)
      .returning();
    return ClientDocumentMapper.toDomain(row as unknown as Record<string, unknown>);
  }

  async findById(id: string): Promise<ClientDocumentRow | null> {
    const [row] = await this.db
      .select()
      .from(clientDocuments)
      .where(eq(clientDocuments.id, id))
      .limit(1);
    return row ? ClientDocumentMapper.toDomain(row as unknown as Record<string, unknown>) : null;
  }

  async findByClientId(clientId: string): Promise<ClientDocumentRow[]> {
    const rows = await this.db
      .select()
      .from(clientDocuments)
      .where(eq(clientDocuments.clientId, clientId));
    return rows.map((row) => ClientDocumentMapper.toDomain(row as unknown as Record<string, unknown>));
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(clientDocuments)
      .where(eq(clientDocuments.id, id));
  }
}
