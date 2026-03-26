export interface CercValidationEventoRow {
  id?: string;
  cercValidationId: string;
  data: Date;
  codigo: string;
  descricao: string | null;
  createdAt?: Date;
}

export const CERC_VALIDATION_EVENTOS_REPOSITORY = 'CERC_VALIDATION_EVENTOS_REPOSITORY';

export interface CercValidationEventosRepository {
  saveMany(rows: CercValidationEventoRow[]): Promise<void>;
  findByValidationId(cercValidationId: string): Promise<CercValidationEventoRow[]>;
  deleteByValidationId(cercValidationId: string): Promise<void>;
}
