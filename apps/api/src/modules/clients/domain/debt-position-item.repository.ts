import type { DebtPositionItemProps } from './debt-position-item.entity';
import type { DebtPositionSource, DebtPositionConfidenceLevel } from '@nexus/types';

export const DEBT_POSITION_ITEM_REPOSITORY = Symbol('DEBT_POSITION_ITEM_REPOSITORY');

export interface CreateDebtPositionItemData {
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
}

export interface UpdateDebtPositionItemData {
  institution?: string;
  modality?: string | null;
  guarantee?: string | null;
  guaranteePercentage?: string | null;
  value?: string;
  notes?: string | null;
}

export interface DebtPositionItemRepository {
  create(data: CreateDebtPositionItemData): Promise<DebtPositionItemProps>;
  findById(id: string): Promise<DebtPositionItemProps | null>;
  findByClientId(clientId: string): Promise<DebtPositionItemProps[]>;
  findByDocumentId(documentId: string): Promise<DebtPositionItemProps[]>;
  update(id: string, data: UpdateDebtPositionItemData): Promise<DebtPositionItemProps>;
  delete(id: string): Promise<void>;
  deleteByDocumentId(documentId: string): Promise<void>;
}
