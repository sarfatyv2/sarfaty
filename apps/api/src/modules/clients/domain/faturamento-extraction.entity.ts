import type { FaturamentoExtractionStatus, FaturamentoConfidenceLevel, FaturamentoMonthlyRevenues } from '@nexus/types';

export interface FaturamentoExtractionProps {
  id: string;
  clientId: string;
  cnpj: string;
  year: number;
  cpf: string | null;
  companyName: string | null;
  monthlyRevenues: FaturamentoMonthlyRevenues | null;
  totalAnnualRevenue: string | null;
  documentDescription: string | null;
  extractionStatus: FaturamentoExtractionStatus;
  extractionConfidence: FaturamentoConfidenceLevel | null;
  ocrApplied: boolean;
  needsReview: boolean;
  extractionLog: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class FaturamentoExtraction {
  constructor(private readonly props: FaturamentoExtractionProps) {}

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get cnpj(): string { return this.props.cnpj; }
  get year(): number { return this.props.year; }
  get companyName(): string | null { return this.props.companyName; }
  get extractionStatus(): FaturamentoExtractionStatus { return this.props.extractionStatus; }
  get extractionConfidence(): FaturamentoConfidenceLevel | null { return this.props.extractionConfidence; }
  get needsReview(): boolean { return this.props.needsReview; }
  get monthlyRevenues(): FaturamentoMonthlyRevenues | null { return this.props.monthlyRevenues; }

  toProps(): FaturamentoExtractionProps {
    return { ...this.props };
  }

  isComplete(): boolean {
    const revenues = this.props.monthlyRevenues;
    if (!revenues) return false;
    const presentMonths = Object.values(revenues).filter((v) => v !== null).length;
    return presentMonths >= 6;
  }

  hasMissingMonths(): boolean {
    const revenues = this.props.monthlyRevenues;
    if (!revenues) return true;
    return Object.values(revenues).some((v) => v === null);
  }

  computeTotalFromMonthly(): number | null {
    const revenues = this.props.monthlyRevenues;
    if (!revenues) return null;
    const values = Object.values(revenues).filter((v): v is number => v !== null);
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0);
  }
}
