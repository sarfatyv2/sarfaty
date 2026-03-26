// ─── Status types ────────────────────────────────────────────────────────────

export type UpminerResultStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
export type UpminerParallelStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
export type BadgeType = 'success' | 'danger' | 'warning' | 'neutral';

// ─── DTOs from API ────────────────────────────────────────────────────────────

export interface UpminerResultDto {
  id: string;
  clientId: string;
  document: string;
  inputType: number;
  searchProfileId: number;
  batchId: number | null;
  status: UpminerResultStatus;
  dossiersData: Record<string, unknown> | null;
  errorMessage: string | null;
  parallelStatus: UpminerParallelStatus | null;
  requestedAt: string;
  processedAt: string | null;
}

// ─── Dossier source types ─────────────────────────────────────────────────────

export interface UpminerDossiersDataReceitaSecundaria {
  codigo: string | null;
  descricao: string | null;
  ordem: number;
}

export interface UpminerDossiersDataReceitaFederalPj {
  cnpj: string | null;
  tipo: string | null;
  dataAbertura: string | null;
  nomeEmpresarial: string | null;
  nomeFantasia: string | null;
  atividadeEconomicaPrincipal: string | null;
  secundarias: UpminerDossiersDataReceitaSecundaria[];
}

export interface UpminerDossiersDataQsaSocio {
  cpfCnpj: string | null;
  nome: string | null;
  entrada: string | null;
  qualificacao: string | null;
  participacao: string | null;
  situacao: string | null;
  pep: string | null;
  tipoSocio: string | null;
}

export interface UpminerDossiersDataQsa {
  cnpj: string | null;
  razaoSocial: string | null;
  capitalSocial: string | null;
  dataConsulta: string | null;
  pep: string | null;
  socios: UpminerDossiersDataQsaSocio[];
}

export interface UpminerDossiersDataCadeProtocolo {
  docProcesso: string | null;
  tipoDoc: string | null;
  dataDocumento: string | null;
  dataRegistro: string | null;
  unidade: string | null;
  linkPdf: string | null;
}

export interface UpminerDossiersDataCadeAndamento {
  dataHora: string | null;
  unidade: string | null;
  descricao: string | null;
}

export interface UpminerDossiersDataCadeProcesso {
  apiRowId: string | null;
  estado: string | null;
  processo: string | null;
  tipo: string | null;
  dataRegistro: string | null;
  resumoInt: string | null;
  interessados: string[] | null;
  protocolos: UpminerDossiersDataCadeProtocolo[];
  andamentos: UpminerDossiersDataCadeAndamento[];
}

export interface UpminerDossiersDataSource {
  method: string;
  name: string | null;
  hasResult: boolean;
  processedStatus: string | null;
}

export interface UpminerDossiersDataDossier {
  id: string;
  apiDossierId: number;
  criterionInput: string;
  criterionName: string | null;
  dossierStatus: string | null;
  dossierState: string | null;
  hasUpflag: boolean;
  searchProfileName: string | null;
  createdAtApi: string | null;
  processedAtApi: string | null;
  sources: UpminerDossiersDataSource[];
  receitaFederalPj: UpminerDossiersDataReceitaFederalPj | null;
  qsa: UpminerDossiersDataQsa | null;
  cadeProcessos: UpminerDossiersDataCadeProcesso[];
  certidoes?: UpminerDossiersDataCertidao[];
  sancaoHits?: UpminerDossiersDataSancaoHit[];
  sicaf?: UpminerDossiersDataSicaf | null;
  mpfProcessos?: UpminerDossiersDataMpfProcesso[];
  djenCitacoes?: UpminerDossiersDataDjenCitacao[];
  proconAnos?: UpminerDossiersDataProconAno[];
  reclameAqui?: UpminerDossiersDataReclameAqui | null;
  crsfnAcoes?: UpminerDossiersDataCrsfnAcao[];
  tcuProcessos?: UpminerDossiersDataTcuProcesso[];
  contratos?: UpminerDossiersDataContrato[];
  googleHits?: UpminerDossiersDataGoogleHit[];
}

export interface UpminerDossiersDataPayload {
  dossiers: UpminerDossiersDataDossier[];
}

// ─── Phase 1: Certidão ────────────────────────────────────────────────────────

export interface UpminerDossiersDataCertidao {
  method: string;
  nome: string | null;
  documento: string | null;
  conteudo: string | null;
  pdf: string | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  certidaoNumero: string | null;
  seloDigital: string | null;
}

// ─── Phase 2: Sanção ──────────────────────────────────────────────────────────

export interface UpminerDossiersDataSancaoHit {
  method: string;
  nome: string | null;
  cpfCnpj: string | null;
  tipoSancao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  orgaoSancionador: string | null;
  fundamentacao: string | null;
  pais: string | null;
  observacao: string | null;
}

export interface UpminerDossiersDataSicaf {
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacao: string | null;
  situacaoCadastral: string | null;
}

// ─── Phase 3: Administrative processes ───────────────────────────────────────

export interface UpminerDossiersDataMpfDetalhe {
  numProcesso: string | null;
  partes: string[] | null;
  orgaoPoder: string | null;
  vara: string | null;
  localizacaoAtual: string | null;
  classe: string | null;
  camara: string | null;
  dataAutuacao: string | null;
  assunto: string | null;
  distribuicao: string | null;
}

export interface UpminerDossiersDataMpfProcesso {
  apiId: string | null;
  nome: string | null;
  estado: string | null;
  detalhes: UpminerDossiersDataMpfDetalhe[];
}

export interface UpminerDossiersDataDjenDestinatario {
  nome: string | null;
  tipoDestinatario: string | null;
  numeroOab: string | null;
  ufOab: string | null;
}

export interface UpminerDossiersDataDjenCitacao {
  apiId: string | null;
  estado: string | null;
  data: string | null;
  sigla: string | null;
  tipoComunicacao: string | null;
  nomeOrgao: string | null;
  tipoDocumento: string | null;
  nomeClasse: string | null;
  numeroProcesso: string | null;
  numeroProcessoMascara: string | null;
  link: string | null;
  texto: string | null;
  destinatarios: UpminerDossiersDataDjenDestinatario[];
}

export interface UpminerDossiersDataProconReclamacao {
  descricao: string | null;
  atendida: string | null;
  naoAtendida: string | null;
}

export interface UpminerDossiersDataProconAno {
  nomeFantasia: string | null;
  razaoSocial: string | null;
  ano: string | null;
  reclamacoes: UpminerDossiersDataProconReclamacao[];
}

export interface UpminerDossiersDataReclameAqui {
  empresa: string | null;
  dataCadastro: string | null;
  site: string | null;
  telefone: string | null;
  classificacao: string | null;
  atendidas: string | null;
  solucao: string | null;
  voltaria: string | null;
  notaConsumidor: string | null;
  tempoMedioResposta: string | null;
  totalAtendidas: string | null;
  totalNaoAtendidas: string | null;
  totalReclamacoes: string | null;
  reclamacoes: string[];
}

export interface UpminerDossiersDataCrsfnAcao {
  processo: string | null;
  ementa: string | null;
  dataJulgamento: string | null;
  resultado: string | null;
  relator: string | null;
  recurso: string | null;
}

export interface UpminerDossiersDataTcuProcesso {
  numProcesso: string | null;
  tipo: string | null;
  assunto: string | null;
  situacao: string | null;
  orgao: string | null;
  acordao: string | null;
  dataAcordao: string | null;
}

// ─── Phase 4: Especiais ───────────────────────────────────────────────────────

export interface UpminerDossiersDataContrato {
  apiId: string | null;
  ano: string | null;
  mes: string | null;
  numeroContrato: string | null;
  objeto: string | null;
  fundamentoLegal: string | null;
  modalidadeCompra: string | null;
  situacaoCompra: string | null;
  nomeOrgaoSuperior: string | null;
  nomeOrgao: string | null;
  nomeUg: string | null;
  assinaturaContrato: string | null;
  publicacaoDou: string | null;
  inicioVigencia: string | null;
  fimVigencia: string | null;
  cnpj: string | null;
  nomeEmpresa: string | null;
  valorInicial: string | null;
  valorFinal: string | null;
}

export interface UpminerDossiersDataGoogleHit {
  pais: string | null;
  criterio: string | null;
  url: string | null;
  titulo: string | null;
  snippet: string | null;
}

// ─── Parallel data ────────────────────────────────────────────────────────────

export interface EmpresaPjEndereco {
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  ibge: string | null;
  logradouroTipo: string | null;
  logradouroNumero: string | null;
  logradouroComplemento: string | null;
  logradouro: string | null;
  latitude: string | null;
  longitude: string | null;
  ultimaAtualizacao: string | null;
}

export interface EmpresaPjTelefone {
  cnpj: string | null;
  apiId: string | null;
  dataLog: string | null;
  ddd: string | null;
  descricao: string | null;
  telefone: string | null;
  telefoneComDdd: string | null;
  rank: string | null;
}

export interface EmpresaPjEmail {
  enderecoEmail: string | null;
  ultimaAtualizacao: string | null;
}

export interface EmpresaPjSocio {
  documentoSocio: string | null;
  nome: string | null;
  tipoSocio: string | null;
  qualificacao: string | null;
  participacao: string | null;
  dataEntrada: string | null;
  dataCad: string | null;
  dataAlt: string | null;
  ano: string | null;
}

export interface EmpresaPjAtividadeSecundaria {
  codigo: string | null;
  descricao: string | null;
}

export interface EmpresaPjSimplesNacional {
  cnpj: string | null;
  dataConsulta: string | null;
  statusSimplesNacional: string | null;
  statusSimei: string | null;
  dataSimplesNacional: string | null;
  dataSimei: string | null;
}

export interface UpminerEmpresaPjData {
  id: string;
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
  numeroFiliais: number | null;
  capitalSocial: string | null;
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
  enderecos: EmpresaPjEndereco[];
  telefones: EmpresaPjTelefone[];
  emails: EmpresaPjEmail[];
  socios: EmpresaPjSocio[];
  atividadesSecundarias: EmpresaPjAtividadeSecundaria[];
  simplesNacional: EmpresaPjSimplesNacional[];
}

export interface ProcessoAssuntoCnj {
  titulo: string | null;
  codigoCnj: string | null;
  ePrincipal: boolean | null;
}

export interface ProcessoAdvogado {
  tipo: string | null;
  nome: string | null;
  cpf: string | null;
  oabUf: string | null;
  oabNumero: number | null;
  oabTipo: string | null;
  dataAtualizacao: string | null;
}

export interface ProcessoParte {
  tipo: string | null;
  nome: string | null;
  polo: string | null;
  cpf: string | null;
  cnpj: string | null;
  cnpjRaiz: string | null;
  origemDocumento: string | null;
  dataAtualizacao: string | null;
  advogados: ProcessoAdvogado[];
}

export interface ProcessoMovimento {
  indice: number | null;
  nomeOriginal: string[];
  classificacaoCnjCodigo: string | null;
  classificacaoCnjNome: string | null;
  data: string | null;
}

export interface ProcessoJulgamento {
  dataJulgamento: string | null;
  statusJulgamento: string | null;
  diasAteJulgamento: number | null;
  tipoJulgamento: string | null;
}

export interface ProcessoPenhora {
  data: string | null;
  tipo: string | null;
  trechoDecisao: string | null;
}

export interface UpminerProcessoData {
  id: string;
  apiProcessoId: string | null;
  urlProcesso: string | null;
  numeroProcessoUnico: string | null;
  numeroProcessoAntigo: string | null;
  statusObservacao: string | null;
  juiz: string | null;
  relator: string | null;
  orgaoJulgador: string | null;
  grauProcesso: number | null;
  area: string | null;
  tribunal: string | null;
  uf: string | null;
  dataDistribuicao: string | null;
  valorCausaMoeda: string | null;
  valorCausaValor: string | null;
  classeProcessualNome: string | null;
  eTutelaAntecipada: boolean | null;
  temInjuncao: boolean | null;
  eJusticaGratuita: boolean | null;
  ePrioritario: boolean | null;
  eSegredoJustica: boolean | null;
  eProcessoDigital: boolean | null;
  temAcordao: boolean | null;
  temSentenca: boolean | null;
  statusPredictusStatusProcesso: string | null;
  statusPredictusRamoDireito: string | null;
  assuntosCnj: ProcessoAssuntoCnj[];
  partes: ProcessoParte[];
  movimentos: ProcessoMovimento[];
  julgamentos: ProcessoJulgamento[];
  penhoras: ProcessoPenhora[];
}

export interface UpminerParallelData {
  empresaPj: UpminerEmpresaPjData | null;
  processos: UpminerProcessoData[];
}

export interface UpminerParallelDataResponse {
  data: UpminerParallelData | null;
  parallelStatus: UpminerParallelStatus | null;
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

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
