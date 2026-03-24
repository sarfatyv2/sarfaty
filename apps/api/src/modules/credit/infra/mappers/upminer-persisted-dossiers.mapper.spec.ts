import { UPMINER_PERSISTED_SCHEMA_VERSION } from '@nexus/types';
import { UpminerPersistedDossiersMapper } from './upminer-persisted-dossiers.mapper';
import type { UpminerBatchDossiersResponse, UpminerDossierDetailResponse } from '../../bureaus/upminer/upminer.types';

describe('UpminerPersistedDossiersMapper', () => {
  const batchList: UpminerBatchDossiersResponse = {
    id: 1,
    status: '5',
    input_type: 2,
    in_queue: false,
    has_workflow: false,
    has_parent_dossier: false,
    user_id: 1,
    dossiers: [
      {
        id: 10,
        criterion: { input: '00.000.000/0001-91', name: 'ACME' },
        status: '5',
        state: '5',
        has_upflag: false,
        monitoring: { id: false, diffs: false },
        workflow: { status: false },
        children_batches: [],
        created_at: '01/01/2024 10:00:00',
        processed_at: '01/01/2024 10:00:00',
      },
    ],
  };

  const dossierDetail: UpminerDossierDetailResponse = {
    id: '10',
    type: 2,
    status: '4',
    batch: { id: 1, status: '5' },
    user: { id: 1, name: 'Test' },
    search_profile_name: 'Consulta PJ',
    criterion: { input: '00.000.000/0001-91', name: 'ACME' },
    homonyms: 0,
    created_at: '01/01/2024',
    updated_at: '01/01/2024',
    workflow: {
      name: '',
      levels: '',
      created_at: '',
      approvers: [],
      responsible: '',
      final_status: '',
      final_status_date_analysis: '',
      automatic_approval: false,
    },
    sources: {
      groups: ['cadastro'],
      items: [
        {
          name: 'RF',
          method: 'receitaFederalPj',
          detail: false,
          processed_status: '4',
          criterion: [],
          has_result: true,
          processed_at: '01/01/2024',
        },
        {
          name: 'Empty',
          method: 'proconSp',
          detail: false,
          processed_status: '4',
          criterion: [],
          has_result: false,
          processed_at: '01/01/2024',
        },
      ],
    },
    has_parent: false,
  };

  it('toPersistenceV1 builds schema v1 snapshot', () => {
    const row = UpminerPersistedDossiersMapper.toPersistenceV1({
      batchId: 1,
      batchDossiersList: batchList,
      dossierDetail,
      sourcesByMethod: { receitaFederalPj: { cnpj: '00.000.000/0001-91' } },
    });
    expect(row.schemaVersion).toBe(UPMINER_PERSISTED_SCHEMA_VERSION);
    expect(row.batchId).toBe(1);
    expect(row.batchDossiersList.dossiers).toHaveLength(1);
    expect(row.dossierDetail?.criterion.name).toBe('ACME');
    expect(row.sourcesByMethod.receitaFederalPj).toEqual({ cnpj: '00.000.000/0001-91' });
  });

  it('methodsWithResult returns only methods with has_result', () => {
    expect(UpminerPersistedDossiersMapper.methodsWithResult(dossierDetail)).toEqual(['receitaFederalPj']);
  });
});
