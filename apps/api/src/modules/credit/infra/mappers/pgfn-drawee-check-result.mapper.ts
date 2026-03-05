import { type pgfnDraweeCheckResults } from '../../../../database/schema/pgfn-drawee-check-results';
import { PgfnDraweeCheckResult } from '../../domain/pgfn-drawee-check-result.entity';

type DrizzleRow = typeof pgfnDraweeCheckResults.$inferSelect;
type InsertRow = typeof pgfnDraweeCheckResults.$inferInsert;

export class PgfnDraweeCheckResultMapper {
  static toDomain(raw: DrizzleRow): PgfnDraweeCheckResult {
    return PgfnDraweeCheckResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      cnpj: raw.cnpj,
      hasDebt: raw.hasDebt,
      totalDebtAmount: raw.totalDebtAmount ? Number(raw.totalDebtAmount) : null,
      debtCount: raw.debtCount,
      summary: raw.summary,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: PgfnDraweeCheckResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
      cnpj: entity.cnpj,
      hasDebt: entity.hasDebt,
      totalDebtAmount: entity.totalDebtAmount ? String(entity.totalDebtAmount) : null,
      debtCount: entity.debtCount,
      summary: entity.summary,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
