import type { FaturamentoExtractionProps } from '../../domain/faturamento-extraction.entity';
import type { FaturamentoExtractionStatus, FaturamentoConfidenceLevel, FaturamentoMonthlyRevenues } from '@nexus/types';

export class FaturamentoExtractionMapper {
  static toDomain(row: Record<string, unknown>): FaturamentoExtractionProps {
    return {
      id: row.id as string,
      clientId: row.clientId as string,
      cnpj: row.cnpj as string,
      year: row.year as number,
      cpf: (row.cpf as string) ?? null,
      companyName: (row.companyName as string) ?? null,
      monthlyRevenues: (row.monthlyRevenues as FaturamentoMonthlyRevenues) ?? null,
      totalAnnualRevenue: (row.totalAnnualRevenue as string) ?? null,
      documentDescription: (row.documentDescription as string) ?? null,
      extractionStatus: (row.extractionStatus as FaturamentoExtractionStatus) ?? 'pending',
      extractionConfidence: (row.extractionConfidence as FaturamentoConfidenceLevel) ?? null,
      ocrApplied: (row.ocrApplied as boolean) ?? false,
      needsReview: (row.needsReview as boolean) ?? false,
      extractionLog: row.extractionLog ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt as string) : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt as string) : null,
    };
  }

  static toResponse(props: FaturamentoExtractionProps): Record<string, unknown> {
    return {
      id: props.id,
      clientId: props.clientId,
      cnpj: props.cnpj,
      year: props.year,
      cpf: props.cpf,
      companyName: props.companyName,
      monthlyRevenues: props.monthlyRevenues,
      totalAnnualRevenue: props.totalAnnualRevenue,
      documentDescription: props.documentDescription,
      extractionStatus: props.extractionStatus,
      extractionConfidence: props.extractionConfidence,
      ocrApplied: props.ocrApplied,
      needsReview: props.needsReview,
      createdAt: props.createdAt?.toISOString() ?? null,
      updatedAt: props.updatedAt?.toISOString() ?? null,
    };
  }
}
