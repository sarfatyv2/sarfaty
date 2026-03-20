// --- Auth ---

export interface UpminerAuthRequest {
  grant_type: 'client_credentials';
  client_id: string;
  client_secret: string;
  scope: string;
}

export interface UpminerAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// --- Batch ---

export interface UpminerCreateBatchRequest {
  inputs: string[];
  input_type: number;
  search_profile_id: number;
  break_batches: boolean;
}

export interface UpminerCreateBatchResponse {
  batchID: number;
}

export interface UpminerBatchStatusItem {
  batch_id: number;
  in_queue: boolean;
  status: string;
  parent_batch_id: number | boolean | null;
}

export type UpminerBatchStatusResponse = UpminerBatchStatusItem[];

export interface UpminerBatchWorkflowStatusItem {
  dossier_id: number;
  workflow: {
    status: string;
  };
}

export type UpminerBatchWorkflowStatusResponse = UpminerBatchWorkflowStatusItem[];

export interface UpminerBatchDossierCriterion {
  input: string;
  name: string;
}

export interface UpminerBatchDossierItem {
  criterion: UpminerBatchDossierCriterion;
  processing_at: string;
  sources: Record<string, number>;
  workflow: {
    status: string;
  };
}

export interface UpminerBatchResponse {
  sources: Record<string, string>;
  dossiers: UpminerBatchDossierItem[];
}

export interface UpminerAddQueueResponse {
  message: string;
}

// --- Batch Errors ---

export type UpminerBatchErrorsResponse = Record<string, Array<Record<string, string>>>;

export interface UpminerFixParamsRequest {
  fix: Record<string, Record<string, string>>;
}

export interface UpminerFixParamsResponse {
  message: string;
}

// --- Duplicates ---

export interface UpminerCheckDuplicatesRequest {
  criterions: string[];
}

export interface UpminerDuplicateUser {
  name: string;
  group: string;
}

export interface UpminerDuplicateBatch {
  dossier_id: number;
  batch_id: number;
  input: string;
  status: string;
  created_at: string;
  user: UpminerDuplicateUser;
}

export interface UpminerCheckDuplicatesResponse {
  duplicity_days: number;
  total_batches: number;
  batches: UpminerDuplicateBatch[];
  upflags: unknown[];
}

// --- Profiles ---

export interface UpminerProfile {
  id: number;
  name: string;
  version: number;
  profile_type: number;
}

export type UpminerProfileListResponse = UpminerProfile[];

// --- Batch Dossiers ---

export interface UpminerBatchDossierCriterionDetail {
  input: string;
  name: string;
}

export interface UpminerBatchDossierMonitoring {
  id: boolean | number | null;
  diffs: boolean | null;
}

export interface UpminerBatchDossierWorkflow {
  status: boolean | string;
}

export interface UpminerBatchDossierListItem {
  id: number;
  criterion: UpminerBatchDossierCriterionDetail;
  status: string;
  state: string;
  has_upflag: boolean;
  monitoring: UpminerBatchDossierMonitoring;
  workflow: UpminerBatchDossierWorkflow;
  children_batches: unknown[];
  created_at: string;
  processed_at: string;
}

export interface UpminerBatchDossiersResponse {
  id: number;
  status: string;
  input_type: number;
  in_queue: boolean;
  has_workflow: boolean;
  has_parent_dossier: boolean;
  user_id: number;
  dossiers: UpminerBatchDossierListItem[];
}

// --- Dossier Detail ---

export interface UpminerDossierBatch {
  id: number;
  status: string;
}

export interface UpminerDossierUser {
  id: number;
  name: string;
}

export interface UpminerDossierCriterion {
  input: string;
  name: string;
}

export interface UpminerDossierWorkflow {
  name: string;
  levels: string;
  created_at: string;
  approvers: unknown[];
  responsible: string;
  final_status: string;
  final_status_date_analysis: string;
  automatic_approval: boolean;
}

export interface UpminerDossierSourceItem {
  name: string;
  method: string;
  detail: boolean;
  processed_status: string;
  criterion: string[];
  has_result: boolean;
  processed_at: string;
}

export interface UpminerDossierSources {
  groups: string[];
  items: UpminerDossierSourceItem[];
}

export interface UpminerDossierDetailResponse {
  id: string;
  type: number;
  status: string;
  batch: UpminerDossierBatch;
  user: UpminerDossierUser;
  search_profile_name: string;
  criterion: UpminerDossierCriterion;
  homonyms: number;
  created_at: string;
  updated_at: string;
  workflow: UpminerDossierWorkflow;
  sources: UpminerDossierSources;
  has_parent: boolean;
}

// --- Dossier Comment ---

export interface UpminerAddCommentRequest {
  comment: string;
}

export interface UpminerCommentUser {
  id: number;
  name: string;
}

export interface UpminerCommentResponse {
  id: number;
  dossier_id: number;
  user: UpminerCommentUser;
  comment: string;
  display_pdf: boolean;
  created_at: string;
}

// --- PDF ---

export interface UpminerPdfRequestRequest {
  notification_url?: string;
}

export interface UpminerPdfRequestResponse {
  id_processo: string;
}

export interface UpminerPdfDownloadResponse {
  id: string;
  status: string;
  url: string | null;
  created_at: string;
  end_at: string | null;
}

// --- Parallel Sources ---

export interface UpminerParallelSourceItem {
  id: number;
  params: Record<string, string>;
}

export interface UpminerParallelRequest {
  sources: UpminerParallelSourceItem[];
  notification_url?: string;
}

export interface UpminerParallelCreateResponse {
  id: string;
  company_id: number;
  user_id: number;
  status: string;
  notification_url: string;
  processed_end_at: string | null;
}

export interface UpminerParallelResultItem {
  id: string;
  source_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UpminerParallelStatusResponse {
  id: string;
  status: string;
  processed_start_at: string | null;
  processed_end_at: string | null;
  items: UpminerParallelResultItem[];
}
