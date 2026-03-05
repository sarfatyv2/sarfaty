import type { CnabOperationStatus } from '@nexus/types';

export interface CnabOperationProps {
  id: string;
  clientId: string;
  cnabFileId: string;
  status: CnabOperationStatus;
  totalSubmittedAmount: string;
  totalApprovedAmount: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class CnabOperationEntity {
  readonly id: string;
  readonly clientId: string;
  readonly cnabFileId: string;
  readonly status: CnabOperationStatus;
  readonly totalSubmittedAmount: string;
  readonly totalApprovedAmount: string;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: CnabOperationProps) {
    Object.assign(this, props);
    this.id = props.id;
    this.clientId = props.clientId;
    this.cnabFileId = props.cnabFileId;
    this.status = props.status;
    this.totalSubmittedAmount = props.totalSubmittedAmount;
    this.totalApprovedAmount = props.totalApprovedAmount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<CnabOperationProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): CnabOperationEntity {
    return new CnabOperationEntity({
      ...props,
      id: props.id ?? '',
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: CnabOperationProps): CnabOperationEntity {
    return new CnabOperationEntity(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      cnabFileId: this.cnabFileId,
      status: this.status,
      totalSubmittedAmount: this.totalSubmittedAmount,
      totalApprovedAmount: this.totalApprovedAmount,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
