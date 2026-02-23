import type { CommitteeFrequency, CommitteeStatus } from '@nexus/types';

export interface CommitteeProps {
  id: string;
  name: string;
  description: string | null;
  regulation: string | null;
  frequency: CommitteeFrequency;
  status: CommitteeStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Committee {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly regulation: string | null;
  readonly frequency: CommitteeFrequency;
  readonly status: CommitteeStatus;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CommitteeProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.regulation = props.regulation;
    this.frequency = props.frequency;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CommitteeProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Committee {
    Committee.validateName(props.name);
    return new Committee({
      ...props,
      id: '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CommitteeProps): Committee {
    return new Committee(props);
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      regulation: this.regulation,
      frequency: this.frequency,
      status: this.status,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private static validateName(name: string): void {
    if ((name?.trim().length ?? 0) < 2) {
      throw new Error('Committee name must have at least 2 characters');
    }
  }
}
