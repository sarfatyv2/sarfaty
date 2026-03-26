export interface CercValidationDocFiscalRow {
  id?: string;
  cercValidationId: string;
  tipo: string;
  chaveAcesso: string | null;
  numero: string | null;
  serie: string | null;
  modelo: string | null;
  situacao: string | null;
  naturezaOperacao: string | null;
  dataEmissao: Date | null;
  valorTotal: string | null;
  emitenteNome: string | null;
  emitenteCnpj: string | null;
  emitenteUf: string | null;
  destinatarioNome: string | null;
  destinatarioCnpj: string | null;
  destinatarioCpf: string | null;
  destinatarioUf: string | null;
  faturaNumero: string | null;
  faturaValorOriginal: string | null;
  faturaValorLiquido: string | null;
  modalidadeFrete: string | null;
  transportadorNome: string | null;
  transportadorCnpj: string | null;
  valorIcms: string | null;
  valorPis: string | null;
  valorCofins: string | null;
  valorProdutos: string | null;
  createdAt?: Date;
}

export interface CercValidationNfeDuplicataRow {
  id?: string;
  cercValidationId: string;
  numero: string;
  valor: string | null;
  vencimento: string | null;
  createdAt?: Date;
}

export interface CercValidationNfeProdutoRow {
  id?: string;
  cercValidationId: string;
  num: string;
  codigo: string | null;
  descricao: string;
  ncm: string | null;
  cfop: string | null;
  unidade: string | null;
  quantidade: string | null;
  valorUnitario: string | null;
  valorTotal: string | null;
  createdAt?: Date;
}

export interface CercValidationNfeEventoFiscalRow {
  id?: string;
  cercValidationId: string;
  tipo: string | null;
  data: Date | null;
  orgao: string | null;
  protocolo: string | null;
  evento: string | null;
  createdAt?: Date;
}

export interface CercValidationDocFiscalAggregate {
  docFiscal: CercValidationDocFiscalRow | null;
  duplicatas: CercValidationNfeDuplicataRow[];
  produtos: CercValidationNfeProdutoRow[];
  eventosFiscais: CercValidationNfeEventoFiscalRow[];
}

export const CERC_VALIDATION_DOC_FISCAL_REPOSITORY = 'CERC_VALIDATION_DOC_FISCAL_REPOSITORY';

export interface CercValidationDocFiscalRepository {
  save(aggregate: CercValidationDocFiscalAggregate): Promise<void>;
  findByValidationId(cercValidationId: string): Promise<CercValidationDocFiscalAggregate>;
  deleteByValidationId(cercValidationId: string): Promise<void>;
}
