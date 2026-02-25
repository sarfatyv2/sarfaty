import type { FaturamentoExtractionProps } from './faturamento-extraction.entity';

export const FATURAMENTO_EXTRACTION_REPOSITORY = Symbol('FATURAMENTO_EXTRACTION_REPOSITORY');

export interface FaturamentoExtractionUpsertData extends Omit<FaturamentoExtractionProps, 'id' | 'createdAt' | 'updatedAt'> {}

export interface FaturamentoExtractionSourceData {
  extractionId: string;
  documentId: string;
  fileHash: string | null;
  pageCount: number | null;
  ocrApplied: boolean;
  ocrQuality: number | null;
}

export interface FaturamentoExtractionRepository {
  upsert(data: FaturamentoExtractionUpsertData): Promise<FaturamentoExtractionProps>;
  findById(id: string): Promise<FaturamentoExtractionProps | null>;
  findByCnpjAndYear(cnpj: string, year: number): Promise<FaturamentoExtractionProps | null>;
  findByClientId(clientId: string): Promise<FaturamentoExtractionProps[]>;
  /** Returns all extractions produced by the same source file (multi-year documents yield multiple). */
  findAllByFileHash(fileHash: string): Promise<FaturamentoExtractionProps[]>;
  createSource(data: FaturamentoExtractionSourceData): Promise<void>;
}
