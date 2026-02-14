export interface DependentProps {
  id: string;
  collaboratorId: string;
  relationship: string | null;
  fullName: string;
  dateOfBirth: string | null;
  cpf: string | null;
  isIrDependent: boolean;
  isHealthPlan: boolean;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export class Dependent {
  readonly id: string;
  readonly collaboratorId: string;
  readonly relationship: string | null;
  readonly fullName: string;
  readonly dateOfBirth: string | null;
  readonly cpf: string | null;
  readonly isIrDependent: boolean;
  readonly isHealthPlan: boolean;
  readonly notes: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;

  private constructor(props: DependentProps) {
    this.id = props.id;
    this.collaboratorId = props.collaboratorId;
    this.relationship = props.relationship;
    this.fullName = props.fullName;
    this.dateOfBirth = props.dateOfBirth;
    this.cpf = props.cpf;
    this.isIrDependent = props.isIrDependent;
    this.isHealthPlan = props.isHealthPlan;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<DependentProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Dependent {
    Dependent.validateFullName(props.fullName);

    return new Dependent({
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
      ...props,
    });
  }

  static reconstitute(props: DependentProps): Dependent {
    return new Dependent(props);
  }

  private static validateFullName(fullName: string): void {
    if ((fullName?.trim().length ?? 0) < 2) {
      throw new Error('Dependent full name must have at least 2 characters');
    }
  }

  toPlainObject(): DependentProps {
    return {
      id: this.id,
      collaboratorId: this.collaboratorId,
      relationship: this.relationship,
      fullName: this.fullName,
      dateOfBirth: this.dateOfBirth,
      cpf: this.cpf,
      isIrDependent: this.isIrDependent,
      isHealthPlan: this.isHealthPlan,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
