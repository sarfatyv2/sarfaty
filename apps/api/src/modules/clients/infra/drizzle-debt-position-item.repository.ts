import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../database/database.module';
import { debtPositionItems } from '../../database/schema';
import type {
  DebtPositionItemRepository,
  CreateDebtPositionItemData,
  UpdateDebtPositionItemData,
} from '../domain/debt-position-item.repository';
import type { DebtPositionItemProps } from '../domain/debt-position-item.entity';
import { DebtPositionItemMapper } from './mappers/debt-position-item.mapper';

@Injectable()
export class DrizzleDebtPositionItemRepository implements DebtPositionItemRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: CreateDebtPositionItemData): Promise<DebtPositionItemProps> {
    const [row] = await this.db
      .insert(debtPositionItems)
      .values({
        clientId: data.clientId,
        documentId: data.documentId,
        institution: data.institution,
        modality: data.modality,
        guarantee: data.guarantee,
        guaranteePercentage: data.guaranteePercentage,
        value: data.value,
        notes: data.notes,
        source: data.source,
        extractionConfidence: data.extractionConfidence,
        isAiGenerated: data.isAiGenerated,
      })
      .returning();

    return DebtPositionItemMapper.toDomain(row as unknown as Record<string, unknown>);
  }

  async findById(id: string): Promise<DebtPositionItemProps | null> {
    const [row] = await this.db
      .select()
      .from(debtPositionItems)
      .where(eq(debtPositionItems.id, id))
      .limit(1);
    return row ? DebtPositionItemMapper.toDomain(row as unknown as Record<string, unknown>) : null;
  }

  async findByClientId(clientId: string): Promise<DebtPositionItemProps[]> {
    const rows = await this.db
      .select()
      .from(debtPositionItems)
      .where(eq(debtPositionItems.clientId, clientId))
      .orderBy(debtPositionItems.createdAt);
    return rows.map((row) => DebtPositionItemMapper.toDomain(row as unknown as Record<string, unknown>));
  }

  async findByDocumentId(documentId: string): Promise<DebtPositionItemProps[]> {
    const rows = await this.db
      .select()
      .from(debtPositionItems)
      .where(eq(debtPositionItems.documentId, documentId));
    return rows.map((row) => DebtPositionItemMapper.toDomain(row as unknown as Record<string, unknown>));
  }

  async update(id: string, data: UpdateDebtPositionItemData): Promise<DebtPositionItemProps> {
    const [row] = await this.db
      .update(debtPositionItems)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(debtPositionItems.id, id))
      .returning();

    return DebtPositionItemMapper.toDomain(row as unknown as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(debtPositionItems).where(eq(debtPositionItems.id, id));
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.db.delete(debtPositionItems).where(eq(debtPositionItems.documentId, documentId));
  }
}
