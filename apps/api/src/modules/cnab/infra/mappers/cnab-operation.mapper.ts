import { CnabOperationEntity, type CnabOperationProps } from '../../domain/cnab-operation.entity';
import type { CnabOperationStatus } from '@nexus/types';
import type { cnabOperations } from '../../../../database/schema';

type CnabOperationRow = typeof cnabOperations.$inferSelect;

export class CnabOperationMapper {
  static toDomain(row: CnabOperationRow): CnabOperationEntity {
    const props: CnabOperationProps = {
      id: row.id,
      clientId: row.clientId,
      cnabFileId: row.cnabFileId,
      status: (row.status ?? 'draft') as CnabOperationStatus,
      totalSubmittedAmount: row.totalSubmittedAmount ?? '0',
      totalApprovedAmount: row.totalApprovedAmount ?? '0',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return CnabOperationEntity.reconstitute(props);
  }

  static toPersistence(entity: CnabOperationEntity): Record<string, unknown> {
    return {
      clientId: entity.clientId,
      cnabFileId: entity.cnabFileId,
      status: entity.status,
      totalSubmittedAmount: entity.totalSubmittedAmount,
      totalApprovedAmount: entity.totalApprovedAmount,
    };
  }
}
