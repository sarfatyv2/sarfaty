import type { CercValidationResultado } from './cerc-validation-resultado.entity';

export const CERC_VALIDATION_RESULTADO_REPOSITORY = 'CERC_VALIDATION_RESULTADO_REPOSITORY';

export interface CercValidationResultadoRepository {
  saveMany(entities: CercValidationResultado[]): Promise<void>;
  getByValidationId(cercValidationId: string): Promise<CercValidationResultado[]>;
  deleteByValidationId(cercValidationId: string): Promise<void>;
}
