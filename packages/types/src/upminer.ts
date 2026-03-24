/**
 * Shapes for upMiner bureau data persisted in `upminer_results.dossiers_data` (JSONB).
 * Raw API responses vary by profile; unknown fields may appear at runtime.
 */

export const UPMINER_PERSISTED_SCHEMA_VERSION = 1 as const;

// --- Batch list (`GET .../batches/{id}/dossiers`) — persisted subset ---

export interface UpminerBatchDossierCriterionPersisted {
  input: string;
  name: string;
}

export interface UpminerBatchDossierListItemPersisted {
  id: number;
  criterion: UpminerBatchDossierCriterionPersisted;
  status: string;
  state: string;
  has_upflag: boolean;
  monitoring: { id: boolean | number | null; diffs: boolean | null };
  workflow: { status: boolean | string };
  children_batches: unknown[];
  created_at: string;
  processed_at: string;
}

export interface UpminerBatchDossiersListPersisted {
  id: number;
  status: string;
  input_type: number;
  in_queue: boolean;
  has_workflow: boolean;
  has_parent_dossier: boolean;
  user_id: number;
  dossiers: UpminerBatchDossierListItemPersisted[];
}

// --- Dossier detail (`GET .../dossiers/{id}`) ---

export interface UpminerDossierSourceItemPersisted {
  name: string;
  method: string;
  detail?: boolean;
  processed_status: string;
  criterion: string[];
  has_result: boolean;
  processed_at: string;
}

export interface UpminerDossierDetailPersisted {
  id: string;
  type: number;
  status: string;
  batch: { id: number; status: string };
  user: { id: number; name: string };
  search_profile_name: string;
  criterion: { input: string; name: string };
  homonyms: number;
  created_at: string;
  updated_at: string;
  workflow: {
    name: string;
    levels: string;
    created_at: string;
    approvers: unknown[];
    responsible: string;
    final_status: string;
    final_status_date_analysis: string;
    automatic_approval: boolean | null;
  };
  sources: {
    groups: string[];
    items: UpminerDossierSourceItemPersisted[];
  };
  has_parent: boolean;
}

// --- Source payloads (`GET .../dossiers/{id}/sources/{method}`) ---

export interface UpminerReceitaFederalPjActivity {
  codigo: string;
  descricao: string;
  atividade_economica_secundaria?: string;
}

export interface UpminerReceitaFederalPjPayload {
  cnpj: string;
  tipo?: string;
  data_abertura?: string;
  nome_empresarial?: string;
  nome_fantasia?: string;
  atividade_economica_principal?: string;
  aAtividadeSecundaria?: UpminerReceitaFederalPjActivity[];
  [key: string]: unknown;
}

export interface UpminerQsaSocioPersisted {
  cpf_cnpj: string;
  nome: string;
  entrada?: string | null;
  qualificacao?: string;
  participacao?: string;
  situacao?: string;
  capital_social?: string;
  matriz?: string;
  pep?: string | null;
  tipo_socio?: string;
  [key: string]: unknown;
}

/** QSA / Quadro de Sócios (e.g. source `baseEmpresas`). */
export interface UpminerBaseEmpresasPayload {
  cnpj: string;
  razao_social?: string;
  capital_social?: string;
  data_consulta?: string | null;
  aSocio?: UpminerQsaSocioPersisted[];
  pep?: string | null;
  resumeParams?: string;
  [key: string]: unknown;
}

export interface UpminerCadeAutuacaoPersisted {
  processo?: string;
  tipo?: string;
  data_registro?: string;
  interessados?: string[];
  resumo_int?: string;
  [key: string]: unknown;
}

export interface UpminerCadeProtocoloPersisted {
  doc_processo?: string;
  tipo_doc?: string;
  data_documento?: string;
  data_registro?: string;
  unidade?: string;
  link_pdf?: string;
  [key: string]: unknown;
}

export interface UpminerCadeAndamentoPersisted {
  data_hora?: string;
  unidade?: string;
  descricao?: string;
  [key: string]: unknown;
}

export interface UpminerCadeProcessoDadosPersisted {
  autuacao?: UpminerCadeAutuacaoPersisted;
  protocolos?: UpminerCadeProtocoloPersisted[];
  andamentos?: UpminerCadeAndamentoPersisted[];
  [key: string]: unknown;
}

export interface UpminerCadeProcessoItemPersisted {
  estado?: string;
  id?: string;
  dados?: UpminerCadeProcessoDadosPersisted;
  [key: string]: unknown;
}

/** CADE returns an array of process blocks. */
export type UpminerCadePayload = UpminerCadeProcessoItemPersisted[];

/**
 * Known source `method` keys we typed payloads for; others still stored under `sourcesByMethod`.
 */
export type UpminerWellKnownSourceMethod =
  | 'receitaFederalPj'
  | 'baseEmpresas'
  | 'cade';

/** Aggregate stored in JSONB — extend with new versions if schema changes. */
export interface UpminerPersistedDossiersDataV1 {
  schemaVersion: typeof UPMINER_PERSISTED_SCHEMA_VERSION;
  /** ISO-8601 when this snapshot was built. */
  capturedAt: string;
  batchId: number;
  batchDossiersList: UpminerBatchDossiersListPersisted;
  /** Present when full dossier detail was fetched. */
  dossierDetail?: UpminerDossierDetailPersisted;
  /**
   * Raw per-method payloads from `GET .../dossiers/{id}/sources/{method}`.
   * Keys are API `method` strings; values are arrays or objects depending on the source.
   */
  sourcesByMethod: Record<string, unknown>;
}

export function isUpminerPersistedDossiersDataV1(
  value: unknown,
): value is UpminerPersistedDossiersDataV1 {
  if (value === null || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    o['schemaVersion'] === UPMINER_PERSISTED_SCHEMA_VERSION && typeof o['batchId'] === 'number'
  );
}
