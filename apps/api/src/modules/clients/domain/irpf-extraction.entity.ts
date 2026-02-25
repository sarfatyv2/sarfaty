import type { IrpfConflict, IrpfExtractionStatus, IrpfConfidenceLevel } from '@nexus/types';

export interface IrpfExtractionProps {
  id: string;
  clientId: string;
  authorizedPersonId: string | null;
  cpf: string;
  exerciseYear: number;
  calendarYear: number;
  fullName: string | null;
  birthDate: string | null;
  occupation: string | null;
  occupationCode: string | null;
  nationality: string | null;
  naturality: string | null;
  phone: string | null;
  email: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  spouseName: string | null;
  spouseCpf: string | null;
  declarationType: string | null;
  taxationOption: string | null;
  receiptNumber: string | null;
  deliveryTimestamp: Date | null;
  totalTaxableIncome: string | null;
  totalExemptIncome: string | null;
  totalExclusiveIncome: string | null;
  totalDeductions: string | null;
  taxableBase: string | null;
  taxDue: string | null;
  taxPaid: string | null;
  taxRefund: string | null;
  taxBalance: string | null;
  totalAssetsCurrentYear: string | null;
  totalAssetsPreviousYear: string | null;
  totalDebtsCurrentYear: string | null;
  totalDebtsPreviousYear: string | null;
  dependents: unknown;
  taxableIncomeItems: unknown;
  exemptIncomeItems: unknown;
  exclusiveIncomeItems: unknown;
  payments: unknown;
  assets: unknown;
  debts: unknown;
  extractionStatus: IrpfExtractionStatus;
  extractionConfidence: IrpfConfidenceLevel | null;
  ocrApplied: boolean;
  needsReview: boolean;
  conflicts: IrpfConflict[] | null;
  extractionLog: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class IrpfExtraction {
  constructor(private readonly props: IrpfExtractionProps) {}

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get cpf(): string { return this.props.cpf; }
  get exerciseYear(): number { return this.props.exerciseYear; }
  get calendarYear(): number { return this.props.calendarYear; }
  get fullName(): string | null { return this.props.fullName; }
  get extractionStatus(): IrpfExtractionStatus { return this.props.extractionStatus; }
  get extractionConfidence(): IrpfConfidenceLevel | null { return this.props.extractionConfidence; }
  get needsReview(): boolean { return this.props.needsReview; }
  get conflicts(): IrpfConflict[] | null { return this.props.conflicts; }

  toProps(): IrpfExtractionProps {
    return { ...this.props };
  }

  hasConflictRequiringReview(): boolean {
    return (this.props.conflicts ?? []).some((c) => c.needsReview);
  }

  isComplete(): boolean {
    return (
      this.props.cpf !== null &&
      this.props.cpf.length === 11 &&
      this.props.exerciseYear !== null &&
      this.props.calendarYear !== null &&
      this.props.totalTaxableIncome !== null
    );
  }

  hasValidYearConsistency(): boolean {
    return this.props.exerciseYear === this.props.calendarYear + 1;
  }
}
