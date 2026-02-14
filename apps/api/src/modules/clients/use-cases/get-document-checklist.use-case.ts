import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { DocumentChecklistItem } from '@nexus/types';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';

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

    const result = await this.db.execute<ChecklistRow>(
      sql`SELECT * FROM get_document_checklist(${clientId}::uuid)`,
    );

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
    }));
  }
}
