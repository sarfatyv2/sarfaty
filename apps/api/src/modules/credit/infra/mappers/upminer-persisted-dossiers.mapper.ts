import {
  UPMINER_PERSISTED_SCHEMA_VERSION,
  type UpminerPersistedDossiersDataV1,
} from '@nexus/types';
import type { UpminerBatchDossiersResponse, UpminerDossierDetailResponse } from '../../bureaus/upminer/upminer.types';

export interface BuildUpminerPersistedV1Input {
  batchId: number;
  batchDossiersList: UpminerBatchDossiersResponse;
  dossierDetail?: UpminerDossierDetailResponse;
  /** Key = API source `method`, value = JSON body from `GET .../sources/{method}`. */
  sourcesByMethod?: Record<string, unknown>;
}

/**
 * Builds the JSONB snapshot for `upminer_results.dossiers_data` (schema v1).
 */
export class UpminerPersistedDossiersMapper {
  static toPersistenceV1(input: BuildUpminerPersistedV1Input): UpminerPersistedDossiersDataV1 {
    return {
      schemaVersion: UPMINER_PERSISTED_SCHEMA_VERSION,
      capturedAt: new Date().toISOString(),
      batchId: input.batchId,
      batchDossiersList: input.batchDossiersList as UpminerPersistedDossiersDataV1['batchDossiersList'],
      dossierDetail: input.dossierDetail as UpminerPersistedDossiersDataV1['dossierDetail'],
      sourcesByMethod: { ...input.sourcesByMethod },
    };
  }

  /** Source `method` values where `has_result` is true (candidates for `GET .../sources/{method}`). */
  static methodsWithResult(detail: UpminerDossierDetailResponse): string[] {
    return detail.sources.items
      .filter((item) => item.has_result === true && Boolean(item.method))
      .map((item) => item.method);
  }
}
