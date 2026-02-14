import type { ClientDocumentRow } from '../../domain/client-document.repository';

export class ClientDocumentMapper {
  static toDomain(row: Record<string, unknown>): ClientDocumentRow {
    return {
      id: row.id as string,
      clientId: row.clientId as string,
      documentType: row.documentType as string,
      documentCategory: row.documentCategory as string,
      documentLabel: (row.documentLabel as string) ?? null,
      referenceYear: (row.referenceYear as number) ?? null,
      referenceMonth: (row.referenceMonth as number) ?? null,
      partnerName: (row.partnerName as string) ?? null,
      segmentTemplateId: (row.segmentTemplateId as string) ?? null,
      productTemplateId: (row.productTemplateId as string) ?? null,
      guaranteeTemplateId: (row.guaranteeTemplateId as string) ?? null,
      clientGuaranteeId: (row.clientGuaranteeId as string) ?? null,
      storagePath: row.storagePath as string,
      fileName: row.fileName as string,
      fileSize: (row.fileSize as number) ?? null,
      mimeType: (row.mimeType as string) ?? null,
      validationStatus: (row.validationStatus as string) ?? null,
      validationResult: row.validationResult ?? null,
      validatedAt: row.validatedAt ? new Date(row.validatedAt as string) : null,
      extractedData: row.extractedData ?? null,
      uploadedBy: row.uploadedBy as string,
      createdAt: row.createdAt ? new Date(row.createdAt as string) : null,
    };
  }

  static toResponse(doc: ClientDocumentRow): Record<string, unknown> {
    return {
      id: doc.id,
      clientId: doc.clientId,
      documentType: doc.documentType,
      documentCategory: doc.documentCategory,
      documentLabel: doc.documentLabel,
      referenceYear: doc.referenceYear,
      referenceMonth: doc.referenceMonth,
      partnerName: doc.partnerName,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      validationStatus: doc.validationStatus,
      validationResult: doc.validationResult,
      validatedAt: doc.validatedAt?.toISOString() ?? null,
      uploadedBy: doc.uploadedBy,
      createdAt: doc.createdAt?.toISOString() ?? null,
    };
  }
}
