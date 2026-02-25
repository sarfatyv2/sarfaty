import type { IrpfExtractionProps } from './irpf-extraction.entity';
import type { IrpfDocumentSubtype } from '@nexus/types';

export const IRPF_EXTRACTION_REPOSITORY = Symbol('IRPF_EXTRACTION_REPOSITORY');

export interface IrpfExtractionUpsertData extends Omit<IrpfExtractionProps, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IrpfExtractionSourceData {
  extractionId: string;
  documentId: string;
  documentSubtype: IrpfDocumentSubtype | 'unknown';
  fileHash: string | null;
  pageCount: number | null;
  ocrApplied: boolean;
  ocrQuality: number | null;
}

export interface IrpfExtractionRepository {
  upsert(data: IrpfExtractionUpsertData): Promise<IrpfExtractionProps>;
  findById(id: string): Promise<IrpfExtractionProps | null>;
  findByCpfAndExercise(cpf: string, exerciseYear: number): Promise<IrpfExtractionProps | null>;
  findByClientId(clientId: string): Promise<IrpfExtractionProps[]>;
  findByFileHash(fileHash: string): Promise<IrpfExtractionProps | null>;
  createSource(data: IrpfExtractionSourceData): Promise<void>;
  findSourcesByExtractionId(extractionId: string): Promise<Array<{ documentId: string }>>;
}
