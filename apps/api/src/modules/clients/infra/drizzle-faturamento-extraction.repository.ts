import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { faturamentoExtractions, faturamentoExtractionSources } from '../../../database/schema';
import type {
  FaturamentoExtractionRepository,
  FaturamentoExtractionUpsertData,
  FaturamentoExtractionSourceData,
} from '../domain/faturamento-extraction.repository';
import type { FaturamentoExtractionProps } from '../domain/faturamento-extraction.entity';
import { FaturamentoExtractionMapper } from './mappers/faturamento-extraction.mapper';

@Injectable()
export class DrizzleFaturamentoExtractionRepository implements FaturamentoExtractionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(data: FaturamentoExtractionUpsertData): Promise<FaturamentoExtractionProps> {
    const values = {
      clientId: data.clientId,
      cnpj: data.cnpj,
      year: data.year,
      cpf: data.cpf,
      companyName: data.companyName,
      monthlyRevenues: data.monthlyRevenues,
      totalAnnualRevenue: data.totalAnnualRevenue,
      documentDescription: data.documentDescription,
      extractionStatus: data.extractionStatus,
      extractionConfidence: data.extractionConfidence,
      ocrApplied: data.ocrApplied,
      needsReview: data.needsReview,
      extractionLog: data.extractionLog,
      updatedAt: new Date(),
    } as typeof faturamentoExtractions.$inferInsert;

    const [row] = await this.db
      .insert(faturamentoExtractions)
      .values(values)
      .onConflictDoUpdate({
        target: [faturamentoExtractions.cnpj, faturamentoExtractions.year],
        set: {
          ...values,
          updatedAt: new Date(),
        },
      })
      .returning();

    return FaturamentoExtractionMapper.toDomain(row as unknown as Record<string, unknown>);
  }

  async findById(id: string): Promise<FaturamentoExtractionProps | null> {
    const [row] = await this.db
      .select()
      .from(faturamentoExtractions)
      .where(eq(faturamentoExtractions.id, id))
      .limit(1);
    return row ? FaturamentoExtractionMapper.toDomain(row as unknown as Record<string, unknown>) : null;
  }

  async findByCnpjAndYear(cnpj: string, year: number): Promise<FaturamentoExtractionProps | null> {
    const [row] = await this.db
      .select()
      .from(faturamentoExtractions)
      .where(
        and(
          eq(faturamentoExtractions.cnpj, cnpj),
          eq(faturamentoExtractions.year, year),
        ),
      )
      .limit(1);
    return row ? FaturamentoExtractionMapper.toDomain(row as unknown as Record<string, unknown>) : null;
  }

  async findByClientId(clientId: string): Promise<FaturamentoExtractionProps[]> {
    const rows = await this.db
      .select()
      .from(faturamentoExtractions)
      .where(eq(faturamentoExtractions.clientId, clientId));
    return rows.map((row) => FaturamentoExtractionMapper.toDomain(row as unknown as Record<string, unknown>));
  }

  async findAllByFileHash(fileHash: string): Promise<FaturamentoExtractionProps[]> {
    const sources = await this.db
      .select({ extractionId: faturamentoExtractionSources.extractionId })
      .from(faturamentoExtractionSources)
      .where(eq(faturamentoExtractionSources.fileHash, fileHash));

    if (sources.length === 0) return [];

    const results = await Promise.all(sources.map((s) => this.findById(s.extractionId)));
    return results.filter((r): r is FaturamentoExtractionProps => r !== null);
  }

  async createSource(data: FaturamentoExtractionSourceData): Promise<void> {
    await this.db.insert(faturamentoExtractionSources).values({
      extractionId: data.extractionId,
      documentId: data.documentId,
      fileHash: data.fileHash,
      pageCount: data.pageCount,
      ocrApplied: data.ocrApplied,
      ocrQuality: data.ocrQuality === null ? null : String(data.ocrQuality),
    });
  }
}
