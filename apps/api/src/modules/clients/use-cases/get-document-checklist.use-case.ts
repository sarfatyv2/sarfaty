import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { DocumentChecklistItem } from '@nexus/types';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';
import { clientDocuments } from '../../../database/schema';

// Document types that support multiple uploads per checklist slot
const MULTI_UPLOAD_TYPES: string[] = [];

interface ChecklistRow {
  document_type: string;
  document_label: string;
  description: string | null;
  category: string;
  is_required: boolean;
  guarantee_id: string | null;
  status: string;
  document_id: string | null;
  file_name: string | null;
  validation_status: string | null;
  partner_name: string | null;
  partner_cpf: string | null;
  reference_year: number | null;
  rejection_reason: string | null;
  [key: string]: unknown;
}

@Injectable()
export class GetDocumentChecklistUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async execute(clientId: string): Promise<DocumentChecklistItem[]> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundException(clientId);
    }

    const [result, multiDocs] = await Promise.all([
      this.db.execute<ChecklistRow>(
        sql`SELECT * FROM get_document_checklist(${clientId}::uuid)`,
      ),
      this.db
        .select({
          id: clientDocuments.id,
          documentType: clientDocuments.documentType,
          fileName: clientDocuments.fileName,
          validationStatus: clientDocuments.validationStatus,
        })
        .from(clientDocuments)
        .where(
          and(
            eq(clientDocuments.clientId, clientId),
            inArray(clientDocuments.documentType, MULTI_UPLOAD_TYPES),
          ),
        )
        .orderBy(clientDocuments.createdAt),
    ]);

    // Group all uploaded docs by document type for fast lookup
    const multiDocsByType = new Map<string, typeof multiDocs>();
    for (const doc of multiDocs) {
      const list = multiDocsByType.get(doc.documentType) ?? [];
      list.push(doc);
      multiDocsByType.set(doc.documentType, list);
    }

    return [...result].map((row) => ({
      documentType: row.document_type,
      documentLabel: row.document_label,
      description: row.description ?? null,
      category: row.category as DocumentChecklistItem['category'],
      isRequired: row.is_required,
      guaranteeId: row.guarantee_id ?? null,
      status: (row.status as DocumentChecklistItem['status']) ?? 'missing',
      documentId: row.document_id ?? null,
      fileName: row.file_name ?? null,
      validationStatus: row.validation_status ?? null,
      partnerName: (row.partner_name as string) ?? null,
      partnerCpf: (row.partner_cpf as string) ?? null,
      referenceYear: (row.reference_year as number) ?? null,
      rejectionReason: (row.rejection_reason as string) ?? null,
      uploadedDocuments: (multiDocsByType.get(row.document_type) ?? []).map((d) => ({
        id: d.id,
        fileName: d.fileName ?? '',
        validationStatus: d.validationStatus ?? null,
      })),
    }));
  }
}
