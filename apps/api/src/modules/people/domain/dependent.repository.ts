import type { Dependent } from './dependent.entity';

export const DEPENDENT_REPOSITORY = Symbol('DEPENDENT_REPOSITORY');

export interface DependentRepository {
  findByCollaboratorId(collaboratorId: string): Promise<Dependent[]>;
  findById(id: string): Promise<Dependent | null>;
  create(data: {
    collaboratorId: string;
    fullName: string;
    relationship: string | null;
    dateOfBirth: string | null;
    cpf: string | null;
    isIrDependent: boolean;
    isHealthPlan: boolean;
    notes: string | null;
  }): Promise<Dependent>;
  update(id: string, data: Record<string, unknown>): Promise<Dependent | null>;
  delete(id: string): Promise<void>;
}
