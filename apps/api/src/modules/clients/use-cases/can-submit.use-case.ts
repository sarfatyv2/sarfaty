import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { CanSubmitResult } from '@nexus/types';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';

@Injectable()
export class CanSubmitUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async execute(clientId: string): Promise<CanSubmitResult> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundException(clientId);
    }

    const result = await this.db.execute<{
      can_submit: boolean;
      total_required: number;
      total_uploaded: number;
      missing_documents: string[] | null;
    }>(sql`SELECT * FROM can_submit_for_analysis(${clientId}::uuid)`);

    const row = result[0];

    return {
      canSubmit: row?.can_submit ?? false,
      totalRequired: row?.total_required ?? 0,
      totalUploaded: row?.total_uploaded ?? 0,
      missingDocuments: row?.missing_documents ?? [],
    };
  }
}
