export interface CercConstatacao {
  id: string;
  codigo: string;
  algoritmo: {
    id: string;
    codigo: string;
    nome: string;
    tipo: string;
    dimensao: CercResultadoDimensao;
    escopo: string;
  };
  mensagem: string;
  impacto: CercResultadoImpacto;
  dados_utilizados: string;
  parametros_do_algoritmo: string;
  informacoes_complementares: string;
  data_conclusao: string;
}

export interface CercEvento {
  id?: string;
  cercValidationId: string;
  data: string;
  codigo: string;
  descricao: string | null;
  createdAt?: string;
}

export interface CercParte {
  id?: string;
  cercValidationId: string;
  role: string;
  documentoTipo: string;
  documentoNumero: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  uf: string | null;
  cep: string | null;
  municipio: string | null;
  dataDeAbertura: string | null;
  capitalSocial: string | null;
  situacaoCadastralStatus: string | null;
  atividadePrincipalCodigo: string | null;
  atividadePrincipalDescricao: string | null;
}

export interface CercDocFiscal {
  id?: string;
  cercValidationId: string;
  tipo: string;
  chaveAcesso: string | null;
  numero: string | null;
  serie: string | null;
  modelo: string | null;
  situacao: string | null;
  naturezaOperacao: string | null;
  dataEmissao: string | null;
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
}

export interface CercNfeDuplicata {
  id?: string;
  cercValidationId: string;
  numero: string;
  valor: string | null;
  vencimento: string | null;
}

export interface CercNfeProduto {
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
}

export interface CercNfeEventoFiscal {
  id?: string;
  cercValidationId: string;
  tipo: string | null;
  data: string | null;
  orgao: string | null;
  protocolo: string | null;
  evento: string | null;
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
  errorMessage: string | null;
  requestedAt: string;
  processedAt: string | null;
  eventos: CercEvento[];
  partes: CercParte[];
  docFiscal: CercDocFiscal | null;
  nfeDuplicatas: CercNfeDuplicata[];
  nfeProdutos: CercNfeProduto[];
  nfeEventosFiscais: CercNfeEventoFiscal[];
}

export interface CercValidationListItem {
  id: string;
  loteId: string | null;
  validacaoId: string | null;
  numeroDuplicata: string;
  valor: number;
  vencimento: string;
  cnpjCedente: string;
  cnpjCpfPagador: string;
  tipoPagador: 'cpf' | 'cnpj';
  referenciaExterna: string | null;
  status: CercValidationStatus;
  statusProcessamento: string | null;
  errorMessage: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export type CercResultadoImpacto = 'neutro' | 'alerta' | 'consistente' | 'critico';
export type CercResultadoDimensao = 'credito' | 'fiscal' | 'logistica' | 'mercantil';

export interface CercResultado {
  id: string;
  resultadoCercId: string;
  algoritmoTipo: string;
  algoritmoDimensao: CercResultadoDimensao;
  algoritmoEscopo: string;
  mensagem: string;
  impacto: CercResultadoImpacto;
  dadosUtilizados: string | null;
  parametrosDoAlgoritmo: string | null;
  informacoesComplementares: string | null;
  dataConclusao: string;
}
