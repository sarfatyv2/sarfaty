export interface CercConstatacao {
  tipo: string;
  descricao?: string;
  created_at?: string;
  dados?: Record<string, unknown>;
}

export interface CercEvento {
  tipo: string;
  descricao?: string;
  created_at: string;
  dados?: Record<string, unknown>;
}

export interface CercParteDetalhe {
  documento: {
    identificador: { numero: string };
    tipo: 'cnpj' | 'cpf';
  };
  nome?: string;
}

export interface CercPartes {
  originador?: CercParteDetalhe;
  pagador?: CercParteDetalhe;
  cedente?: CercParteDetalhe;
}

export interface CercDocumentoFiscal {
  chave?: string;
  tipo?: string;
  numero?: string;
  serie?: string;
  data_emissao?: string;
  valor_total?: number;
  emitente?: CercParteDetalhe;
  destinatario?: CercParteDetalhe;
}

export interface CercValidacaoData {
  id: string;
  lote_id?: string;
  referencia_externa?: string;
  status_de_processamento: string;
  recebivel?: {
    tipo: string;
    identificador?: { numero: string };
    vencimento?: string;
    valor?: number;
    documento_fiscal?: { identificador?: { numero: string }; tipo?: string };
    partes?: {
      originador?: CercParteDetalhe;
      pagador?: CercParteDetalhe;
    };
  };
  cedente?: CercParteDetalhe;
  created_at?: string;
  updated_at?: string;
}

export type CercValidationStatus = 'PENDING' | 'POLLING' | 'PROCESSED' | 'ERROR';

export interface CercValidationRecord {
  id: string;
  loteId: string | null;
  validacaoId: string | null;
  veiculoId: string;
  numeroDuplicata: string;
  chaveNfe: string;
  valor: number;
  vencimento: string;
  cnpjCedente: string;
  cnpjCpfPagador: string;
  tipoPagador: 'cpf' | 'cnpj';
  cnpjOriginador: string;
  referenciaExterna: string | null;
  planodeCobranca: number;
  status: CercValidationStatus;
  statusProcessamento: string | null;
  requestPayload: Record<string, unknown> | null;
  validacaoData: CercValidacaoData | null;
  constatacoesDados: { validacao_id: string; constatacoes: CercConstatacao[] } | null;
  eventosDados: { validacao_id: string; eventos: CercEvento[] } | null;
  partesDados: { validacao_id: string; partes: CercPartes } | null;
  docFiscalDados: { validacao_id: string; documento_fiscal: CercDocumentoFiscal } | null;
  errorMessage: string | null;
  requestedAt: string;
  processedAt: string | null;
}
