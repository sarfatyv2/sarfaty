import { type pgfnCheckResults } from '../../../../database/schema/pgfn-check-results';
import { PgfnCheckResult } from '../../domain/pgfn-check-result.entity';

type DrizzlePgfnCheckResult = typeof pgfnCheckResults.$inferSelect;
type InsertPgfnCheckResult = typeof pgfnCheckResults.$inferInsert;

export class PgfnCheckResultMapper {
  static toDomain(raw: DrizzlePgfnCheckResult): PgfnCheckResult {
    return PgfnCheckResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      cnpj: raw.cnpj,
      hasDebt: raw.hasDebt,
      totalDebtAmount: raw.totalDebtAmount ? Number(raw.totalDebtAmount) : null,
      debtCount: raw.debtCount,
      summary: raw.summary,
      rawData: raw.rawData,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: PgfnCheckResult): InsertPgfnCheckResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
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
