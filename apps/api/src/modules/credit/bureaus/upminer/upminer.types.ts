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

/** Banco Central: CRSFN — Ementas e Acórdãos (`exato` is boolean per API). */
export interface UpminerBancoCentralCrsfnBatchParameterization {
  parameters: {
    exato: boolean;
  };
}

/** Optional keys per capture/source (e.g. `cade`, `bancoCentralCrsfnEmentasAcordaos`). */
export interface UpminerCreateBatchParameterization {
  bancoCentralCrsfnEmentasAcordaos?: UpminerBancoCentralCrsfnBatchParameterization;
  cade?: {
    auto_relevante?: boolean;
    parameters: {
      pesquisa?: string[];
      target?: string;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

export interface UpminerCreateBatchRequest {
  inputs: string[];
  input_type: number;
  search_profile_id: number;
  break_batches: boolean;
  parameterization?: UpminerCreateBatchParameterization;
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

// --- Direct Source Query ---

export interface UpminerSourceQueryRequest {
  params: Record<string, string>;
}

export interface UpminerSource15SocioItem {
  cpf_cnpj: string;
  nome: string;
  entrada: string | null;
  qualificacao: string;
  participacao: string;
  pep: string | null;
}

export interface UpminerSource15DataItem {
  cnpj: string;
  razao_social: string;
  data_consulta: string | null;
  aSocio: UpminerSource15SocioItem[];
  pep: string | null;
}

export interface UpminerSource15ResultItem {
  uuid: string;
  data: UpminerSource15DataItem[];
  message: string;
}

export type UpminerSource15Response = UpminerSource15ResultItem[];

// --- Source 285 (Empresa PJ Enriquecida) ---

export interface UpminerSource285Endereco {
  Bairro: string | null;
  Cidade: string | null;
  UF: string | null;
  CEP: string | null;
  IBGE: string | null;
  LogradouroTipo: string | null;
  LogradouroNumero: string | null;
  LogradouroComplemento: string | null;
  Logradouro: string | null;
  Latitude: number | null;
  Longitude: number | null;
  UltimaAtualizacao: string | null;
}

export interface UpminerSource285Telefone {
  CNPJ: string | null;
  ID: string | null;
  DataLog: string | number | null;
  DDD: string | null;
  Descricao: string | null;
  Telefone: string | null;
  TelefoneComDDD: string | null;
  Rank: string | null;
}

export interface UpminerSource285Email {
  EnderecoEmail: string | null;
  UltimaAtualizacao: string | null;
}

export interface UpminerSource285Socio {
  documento_socio: string | null;
  nome: string | null;
  tipo_socio: string | null;
  qualificacao: string | null;
  participacao: string | null;
  data_entrada: string | number | null;
  data_cad: string | number | null;
  data_alt: string | number | null;
  ano: string | null;
}

export interface UpminerSource285AtividadeSecundaria {
  codigo: string | null;
  descricao: string | null;
}

export interface UpminerSource285SimplesNacional {
  CNPJ: string | null;
  DataConsulta: string | null;
  StatusSimplesNacional: string | null;
  StatusSimei: string | null;
  DataSimplesNacional: string | null;
  DataSimei: string | null;
}

export interface UpminerSource285Response {
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  matriz: string | null;
  dataAbertura: string | null;
  situacaoCadastral: string | null;
  dataSituacao: string | null;
  naturezaJuridicaCodigo: string | null;
  naturezaJuridicaDescricao: string | null;
  tipoCnae: string | null;
  cnae: string | null;
  cnaeSegmento: string | null;
  cnaeDescricao: string | null;
  dominio: string | null;
  catchall: string | null;
  optanteSimples: string | null;
  numeroFiliais: number | string | null;
  capitalSocial: number | null;
  porte: string | null;
  setor: string | null;
  faixaFuncionarios: string | null;
  faturamentoAnualEstimado: string | null;
  tipo: string | null;
  tipoEstabelecimento: string | null;
  operacionalidade: string | null;
  motivoSituacao: string | null;
  classeRisco: string | null;
  ultimaAtualizacao: string | null;
  dataConsulta: string | null;
  enderecos: UpminerSource285Endereco[];
  telefones: UpminerSource285Telefone[];
  emails: UpminerSource285Email[];
  socios: UpminerSource285Socio[];
  atividadesSecundarias: (UpminerSource285AtividadeSecundaria | null)[];
  simplesNacional: UpminerSource285SimplesNacional | UpminerSource285SimplesNacional[] | null;
}

// --- Source 410 (Processos Judiciais) ---

export interface UpminerSource410ValorCausa {
  moeda: string | null;
  valor: number | null;
}

export interface UpminerSource410ClasseProcessual {
  nome: string | null;
  codigoCNJ: string | number | null;
}

export interface UpminerSource410AssuntoCNJ {
  titulo: string | null;
  codigoCNJ: string | number | null;
  ePrincipal: boolean | null;
}

export interface UpminerSource410OAB {
  uf: string | null;
  tipo: string | null;
  numero: number | null;
}

export interface UpminerSource410Advogado {
  tipo: string | null;
  nome: string | null;
  cpf: string | null;
  oab: UpminerSource410OAB | null;
  dataAtualizacao: string | null;
}

export interface UpminerSource410Parte {
  tipo: string | null;
  nome: string | null;
  polo: string | null;
  cpf: string | null;
  cnpj: string | null;
  cnpjRaiz: string | null;
  origemDocumento: string | null;
  dataAtualizacao: string | null;
  advogados: UpminerSource410Advogado[];
}

export interface UpminerSource410ClassificacaoCNJ {
  codigoCNJ: string | number | null;
  nome: string | null;
}

export interface UpminerSource410Movimento {
  eMovimento: boolean | null;
  indice: number | null;
  nomeOriginal: string[];
  classificacaoCNJ: UpminerSource410ClassificacaoCNJ | null;
  data: string | null;
}

export interface UpminerSource410ProcessoRelacionado {
  numeroProcesso: string | null;
}

export interface UpminerSource410Julgamento {
  dataJulgamento: string | null;
  statusJulgamento: string | null;
  diasAteJulgamento: number | null;
  tipoJulgamento: string | null;
}

export interface UpminerSource410Penhor {
  data: string | null;
  tipo: string | null;
  trechoDecisao: string | null;
}

export interface UpminerSource410StatusPredictus {
  statusProcesso: string | null;
  julgamentos: UpminerSource410Julgamento[];
  ramoDireito: string | null;
  justicaGratuita: string | null;
  penhoras: UpminerSource410Penhor[];
}

export interface UpminerSource410Processo {
  id: string | null;
  urlProcesso: string | null;
  numeroProcessoUnico: string | null;
  numeroProcessoAntigo: string | null;
  statusObservacao: string | null;
  juiz: string | null;
  relator: string | null;
  orgaoJulgador: string | null;
  unidadeOrigem: string | null;
  grauProcesso: number | null;
  area: string | null;
  sistema: string | null;
  segmento: string | null;
  tribunalOrigem: string | null;
  uf: string | null;
  tribunal: string | null;
  dataDistribuicao: string | null;
  dataProcessamento: string | null;
  dataAutuacao: string | null;
  valorCausa: UpminerSource410ValorCausa | null;
  classeProcessual: UpminerSource410ClasseProcessual | null;
  assuntosCNJ: UpminerSource410AssuntoCNJ[];
  partes: UpminerSource410Parte[];
  movimentos: UpminerSource410Movimento[];
  processosRelacionados: UpminerSource410ProcessoRelacionado[];
  eTutelaAntecipada: boolean | null;
  temInjuncao: boolean | null;
  eJusticaGratuita: boolean | null;
  ePrioritario: boolean | null;
  eSegredoJustica: boolean | null;
  eProcessoDigital: boolean | null;
  temAcordao: boolean | null;
  temSentenca: boolean | null;
  statusPredictus: UpminerSource410StatusPredictus | null;
}

export type UpminerSource410Response = UpminerSource410Processo[];

// --- Parallel Item Result ---

export interface UpminerParallelItemResult<T = unknown> {
  id: string;
  source_id: number;
  status: string;
  parameters: Record<string, string>;
  results: T | null;
  errors: unknown | null;
  created_at: string;
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
