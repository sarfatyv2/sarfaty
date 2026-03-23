// --- Auth ---

export interface CercAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

// --- Shared ---

export interface CercDocumentoIdentificador {
  numero: string;
}

export interface CercDocumento {
  identificador: CercDocumentoIdentificador;
  tipo: 'cnpj' | 'cpf';
}

export interface CercParte {
  documento: CercDocumento;
}

export interface CercVeiculo {
  id: string;
}

export interface CercDocumentoFiscal {
  identificador: CercDocumentoIdentificador;
  tipo: string;
}

export interface CercRecebivel {
  tipo: string;
  identificador: {
    numero: string;
  };
  vencimento: string;
  valor: number;
  documento_fiscal: CercDocumentoFiscal;
  partes: {
    originador: CercParte;
    pagador: CercParte;
  };
}

// --- Lotes de Validações ---

export interface CercValidacaoInput {
  recebivel: CercRecebivel;
  cedente: CercParte;
  referencia_externa?: string;
  /** Plano de cobrança — usar 6 para ativar avaliação Serasa integrada */
  plano_de_cobranca?: number;
}

export interface CercLoteSubItem {
  correlationId?: string;
  originalPayload?: Record<string, unknown>;
}

export interface CercCriarLoteValidacoesRequest {
  veiculo: CercVeiculo;
  monitoramento: boolean;
  disponibilizacao_arquivo_retorno: boolean;
  aguardar_documentos: boolean;
  buscar_documentos: boolean;
  validacoes: CercValidacaoInput[];
  originalPayload?: Record<string, unknown>;
  subItems?: CercLoteSubItem[];
}

export interface CercCriarLoteValidacoesResponse {
  lote_id: string;
  status: string;
  created_at?: string;
}

// --- Busca de Validações ---

export interface CercPaginacao {
  por_pagina: number;
  pagina: number;
}

export interface CercBuscaValidacoesDuplicataRequest {
  veiculo: CercVeiculo;
  lote_ids?: string[];
  chaves_nfe?: string[];
  referencias_externas?: string[];
  status_de_processamento?: string;
  paginacao?: CercPaginacao;
}

export interface CercValidacaoItem {
  id: string;
  lote_id: string;
  referencia_externa?: string;
  status_de_processamento: string;
  recebivel: CercRecebivel;
  cedente: CercParte;
  created_at: string;
  updated_at?: string;
}

export interface CercBuscaValidacoesResponse {
  validacoes: CercValidacaoItem[];
  paginacao?: {
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
  };
}

// --- Documento Fiscal da Validação ---

export interface CercDocumentoFiscalDetail {
  chave: string;
  tipo: string;
  numero: string;
  serie?: string;
  data_emissao?: string;
  valor_total?: number;
  emitente?: CercDocumento;
  destinatario?: CercDocumento;
}

export interface CercGetDocumentoFiscalResponse {
  validacao_id: string;
  documento_fiscal: CercDocumentoFiscalDetail;
}

// --- Constatações ---

export interface CercConstatacao {
  tipo: string;
  descricao?: string;
  created_at?: string;
  dados?: Record<string, unknown>;
}

export interface CercGetConstatacoeResponse {
  validacao_id: string;
  constatacoes: CercConstatacao[];
}

// --- Eventos ---

export interface CercEvento {
  tipo: string;
  descricao?: string;
  created_at: string;
  dados?: Record<string, unknown>;
}

export interface CercGetEventosResponse {
  validacao_id: string;
  eventos: CercEvento[];
}

// --- Partes ---

export interface CercPartesDetail {
  originador?: CercParte & { nome?: string };
  pagador?: CercParte & { nome?: string };
  cedente?: CercParte & { nome?: string };
}

export interface CercGetPartesResponse {
  validacao_id: string;
  partes: CercPartesDetail;
}
