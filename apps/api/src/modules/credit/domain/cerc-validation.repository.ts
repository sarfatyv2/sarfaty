import type { CercValidation } from './cerc-validation.entity';

export const CERC_VALIDATION_REPOSITORY = 'CERC_VALIDATION_REPOSITORY';

export interface CercValidationRepository {
  save(entity: CercValidation): Promise<void>;
  update(entity: CercValidation): Promise<void>;
  getById(id: string): Promise<CercValidation | null>;
  getByLoteId(loteId: string): Promise<CercValidation | null>;
  getAll(): Promise<CercValidation[]>;
  getPending(): Promise<CercValidation[]>;
}
