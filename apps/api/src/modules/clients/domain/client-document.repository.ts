export const CLIENT_DOCUMENT_REPOSITORY = Symbol('CLIENT_DOCUMENT_REPOSITORY');

export interface ClientDocumentData {
  clientId: string;
  documentType: string;
  documentCategory: string;
  documentLabel: string | null;
  referenceYear: number | null;
  referenceMonth: number | null;
  partnerName: string | null;
  segmentTemplateId: string | null;
  productTemplateId: string | null;
  guaranteeTemplateId: string | null;
  clientGuaranteeId: string | null;
  storagePath: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
}

export interface ClientDocumentRow {
  id: string;
  clientId: string;
  documentType: string;
  documentCategory: string;
  documentLabel: string | null;
  referenceYear: number | null;
  referenceMonth: number | null;
  partnerName: string | null;
  segmentTemplateId: string | null;
  productTemplateId: string | null;
  guaranteeTemplateId: string | null;
  clientGuaranteeId: string | null;
  storagePath: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  validationStatus: string | null;
  validationResult: unknown;
  validatedAt: Date | null;
  extractedData: unknown;
  uploadedBy: string;
  createdAt: Date | null;
}

export interface ClientDocumentExtractionUpdate {
  extractedData: unknown;
  validationStatus: string;
  validatedAt: Date;
}

export interface ClientDocumentRepository {
  create(data: ClientDocumentData): Promise<ClientDocumentRow>;
  findById(id: string): Promise<ClientDocumentRow | null>;
  findByClientId(clientId: string): Promise<ClientDocumentRow[]>;
  delete(id: string): Promise<void>;
  updateExtraction(id: string, data: ClientDocumentExtractionUpdate): Promise<void>;
}
