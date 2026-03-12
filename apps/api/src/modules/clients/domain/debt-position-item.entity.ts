import type { DebtPositionSource, DebtPositionConfidenceLevel } from '@nexus/types';

export interface DebtPositionItemProps {
  id: string;
  clientId: string;
  documentId: string | null;
  institution: string;
  modality: string | null;
  guarantee: string | null;
  guaranteePercentage: string | null;
  value: string;
  notes: string | null;
  source: DebtPositionSource;
  extractionConfidence: DebtPositionConfidenceLevel | null;
  isAiGenerated: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class DebtPositionItem {
  constructor(private readonly props: DebtPositionItemProps) {}

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get documentId(): string | null { return this.props.documentId; }
  get institution(): string { return this.props.institution; }
  get modality(): string | null { return this.props.modality; }
  get guarantee(): string | null { return this.props.guarantee; }
  get guaranteePercentage(): string | null { return this.props.guaranteePercentage; }
  get value(): string { return this.props.value; }
  get notes(): string | null { return this.props.notes; }
  get source(): DebtPositionSource { return this.props.source; }
  get extractionConfidence(): DebtPositionConfidenceLevel | null { return this.props.extractionConfidence; }
  get isAiGenerated(): boolean { return this.props.isAiGenerated; }

  toProps(): DebtPositionItemProps {
    return { ...this.props };
  }
}
