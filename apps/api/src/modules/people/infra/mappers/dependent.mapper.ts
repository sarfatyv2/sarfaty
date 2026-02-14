import { Dependent, type DependentProps } from '../../domain/dependent.entity';

export interface DependentRow {
  id: string;
  collaboratorId: string | null;
  relationship: string | null;
  fullName: string;
  dateOfBirth: string | null;
  cpf: string | null;
  isIrDependent: boolean | null;
  isHealthPlan: boolean | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class DependentMapper {
  static toDomain(row: DependentRow): Dependent {
    const props: DependentProps = {
      id: row.id,
      collaboratorId: row.collaboratorId ?? '',
      relationship: row.relationship,
      fullName: row.fullName,
      dateOfBirth: row.dateOfBirth,
      cpf: row.cpf,
      isIrDependent: row.isIrDependent ?? false,
      isHealthPlan: row.isHealthPlan ?? false,
      notes: row.notes,
      createdAt: row.createdAt?.toISOString() ?? null,
      updatedAt: row.updatedAt?.toISOString() ?? null,
    };

    return Dependent.reconstitute(props);
  }
}
