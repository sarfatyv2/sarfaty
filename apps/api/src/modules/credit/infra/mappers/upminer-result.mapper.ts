import { UpminerResult, type UpminerResultStatus, type UpminerParallelStatus } from '../../domain/upminer-result.entity';

export class UpminerResultMapper {
  static toDomain(raw: any): UpminerResult {
    return UpminerResult.reconstruct({
      id: raw.id,
      clientId: raw.clientId,
      document: raw.document,
      inputType: raw.inputType,
      searchProfileId: raw.searchProfileId,
      batchId: raw.batchId ?? null,
      status: raw.status as UpminerResultStatus,
      dossiersData: raw.dossiersData ?? null,
      errorMessage: raw.errorMessage ?? null,
      parallelProcessId: raw.parallelProcessId ?? null,
      parallelStatus: (raw.parallelStatus ?? null) as UpminerParallelStatus | null,
      requestedAt: new Date(raw.requestedAt),
      processedAt: raw.processedAt ? new Date(raw.processedAt) : null,
    });
  }

  static toPersistence(entity: UpminerResult): any {
    return {
      id: entity.id,
      clientId: entity.clientId,
      document: entity.document,
      inputType: entity.inputType,
      searchProfileId: entity.searchProfileId,
      batchId: entity.batchId,
      status: entity.status,
      dossiersData: entity.dossiersData,
      errorMessage: entity.errorMessage,
      parallelProcessId: entity.parallelProcessId,
      parallelStatus: entity.parallelStatus,
      requestedAt: entity.requestedAt,
      processedAt: entity.processedAt,
    };
  }
}
