import type { DebtPositionItemProps } from '../../domain/debt-position-item.entity';
import type { DebtPositionSource, DebtPositionConfidenceLevel } from '@nexus/types';

export class DebtPositionItemMapper {
  static toDomain(row: Record<string, unknown>): DebtPositionItemProps {
    return {
      id: row.id as string,
      clientId: row.clientId as string,
      documentId: (row.documentId as string) ?? null,
      institution: row.institution as string,
      modality: (row.modality as string) ?? null,
      guarantee: (row.guarantee as string) ?? null,
      guaranteePercentage: (row.guaranteePercentage as string) ?? null,
      value: row.value as string,
      notes: (row.notes as string) ?? null,
      source: (row.source as DebtPositionSource) ?? 'manual',
      extractionConfidence: (row.extractionConfidence as DebtPositionConfidenceLevel) ?? null,
      isAiGenerated: (row.isAiGenerated as boolean) ?? false,
      createdAt: row.createdAt ? new Date(row.createdAt as string) : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt as string) : null,
    };
  }

  static toResponse(props: DebtPositionItemProps): Record<string, unknown> {
    return {
      id: props.id,
      clientId: props.clientId,
      documentId: props.documentId,
      institution: props.institution,
      modality: props.modality,
      guarantee: props.guarantee,
      guaranteePercentage: props.guaranteePercentage,
      value: props.value,
      notes: props.notes,
      source: props.source,
      extractionConfidence: props.extractionConfidence,
      isAiGenerated: props.isAiGenerated,
      createdAt: props.createdAt?.toISOString() ?? null,
      updatedAt: props.updatedAt?.toISOString() ?? null,
    };
  }
}
