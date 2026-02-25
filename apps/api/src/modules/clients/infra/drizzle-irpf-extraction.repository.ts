import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { irpfExtractions, irpfExtractionSources } from '../../../database/schema';
import type {
  IrpfExtractionRepository,
  IrpfExtractionUpsertData,
  IrpfExtractionSourceData,
} from '../domain/irpf-extraction.repository';
import type { IrpfExtractionProps } from '../domain/irpf-extraction.entity';
import { IrpfExtractionMapper } from './mappers/irpf-extraction.mapper';

@Injectable()
export class DrizzleIrpfExtractionRepository implements IrpfExtractionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(data: IrpfExtractionUpsertData): Promise<IrpfExtractionProps> {
    const values = {
      clientId: data.clientId,
      authorizedPersonId: data.authorizedPersonId,
      cpf: data.cpf,
      exerciseYear: data.exerciseYear,
      calendarYear: data.calendarYear,
      fullName: data.fullName,
      birthDate: data.birthDate,
      occupation: data.occupation,
      occupationCode: data.occupationCode,
      nationality: data.nationality,
      naturality: data.naturality,
      phone: data.phone,
      email: data.email,
      addressStreet: data.addressStreet,
      addressNumber: data.addressNumber,
      addressComplement: data.addressComplement,
      addressNeighborhood: data.addressNeighborhood,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressZip: data.addressZip,
      spouseName: data.spouseName,
      spouseCpf: data.spouseCpf,
      declarationType: data.declarationType,
      taxationOption: data.taxationOption,
      receiptNumber: data.receiptNumber,
      deliveryTimestamp: data.deliveryTimestamp,
      totalTaxableIncome: data.totalTaxableIncome,
      totalExemptIncome: data.totalExemptIncome,
      totalExclusiveIncome: data.totalExclusiveIncome,
      totalDeductions: data.totalDeductions,
      taxableBase: data.taxableBase,
      taxDue: data.taxDue,
      taxPaid: data.taxPaid,
      taxRefund: data.taxRefund,
      taxBalance: data.taxBalance,
      totalAssetsCurrentYear: data.totalAssetsCurrentYear,
      totalAssetsPreviousYear: data.totalAssetsPreviousYear,
      totalDebtsCurrentYear: data.totalDebtsCurrentYear,
      totalDebtsPreviousYear: data.totalDebtsPreviousYear,
      dependents: data.dependents,
      taxableIncomeItems: data.taxableIncomeItems,
      exemptIncomeItems: data.exemptIncomeItems,
      exclusiveIncomeItems: data.exclusiveIncomeItems,
      payments: data.payments,
      assets: data.assets,
      debts: data.debts,
      extractionStatus: data.extractionStatus,
      extractionConfidence: data.extractionConfidence,
      ocrApplied: data.ocrApplied,
      needsReview: data.needsReview,
      conflicts: data.conflicts,
      extractionLog: data.extractionLog,
      updatedAt: new Date(),
    } as typeof irpfExtractions.$inferInsert;

    const [row] = await this.db
      .insert(irpfExtractions)
      .values(values)
      .onConflictDoUpdate({
        target: [irpfExtractions.cpf, irpfExtractions.exerciseYear],
        set: {
          ...values,
          updatedAt: new Date(),
        },
      })
      .returning();

    return IrpfExtractionMapper.toDomain(row as unknown as Record<string, unknown>);
  }

  async findById(id: string): Promise<IrpfExtractionProps | null> {
    const [row] = await this.db
      .select()
      .from(irpfExtractions)
      .where(eq(irpfExtractions.id, id))
      .limit(1);
    return row ? IrpfExtractionMapper.toDomain(row as unknown as Record<string, unknown>) : null;
  }

  async findByCpfAndExercise(cpf: string, exerciseYear: number): Promise<IrpfExtractionProps | null> {
    const [row] = await this.db
      .select()
      .from(irpfExtractions)
      .where(
        and(
          eq(irpfExtractions.cpf, cpf),
          eq(irpfExtractions.exerciseYear, exerciseYear),
        ),
      )
      .limit(1);
    return row ? IrpfExtractionMapper.toDomain(row as unknown as Record<string, unknown>) : null;
  }

  async findByClientId(clientId: string): Promise<IrpfExtractionProps[]> {
    const rows = await this.db
      .select()
      .from(irpfExtractions)
      .where(eq(irpfExtractions.clientId, clientId));
    return rows.map((row) => IrpfExtractionMapper.toDomain(row as unknown as Record<string, unknown>));
  }

  async findByFileHash(fileHash: string): Promise<IrpfExtractionProps | null> {
    const [source] = await this.db
      .select({ extractionId: irpfExtractionSources.extractionId })
      .from(irpfExtractionSources)
      .where(eq(irpfExtractionSources.fileHash, fileHash))
      .limit(1);

    if (!source) return null;
    return this.findById(source.extractionId);
  }

  async createSource(data: IrpfExtractionSourceData): Promise<void> {
    await this.db.insert(irpfExtractionSources).values({
      extractionId: data.extractionId,
      documentId: data.documentId,
      documentSubtype: data.documentSubtype,
      fileHash: data.fileHash,
      pageCount: data.pageCount,
      ocrApplied: data.ocrApplied,
      ocrQuality: data.ocrQuality === null ? null : String(data.ocrQuality),
    });
  }

  async findSourcesByExtractionId(extractionId: string): Promise<Array<{ documentId: string }>> {
    const rows = await this.db
      .select({ documentId: irpfExtractionSources.documentId })
      .from(irpfExtractionSources)
      .where(eq(irpfExtractionSources.extractionId, extractionId));
    return rows;
  }
}
