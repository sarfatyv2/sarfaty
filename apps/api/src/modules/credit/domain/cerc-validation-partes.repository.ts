export interface CercValidationParteRow {
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
  createdAt?: Date;
}

export const CERC_VALIDATION_PARTES_REPOSITORY = 'CERC_VALIDATION_PARTES_REPOSITORY';

export interface CercValidationPartesRepository {
  saveMany(rows: CercValidationParteRow[]): Promise<void>;
  findByValidationId(cercValidationId: string): Promise<CercValidationParteRow[]>;
  deleteByValidationId(cercValidationId: string): Promise<void>;
}
