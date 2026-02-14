import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { sql } from 'drizzle-orm';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { clientStatusHistory } from '../../../database/schema';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';
import { MissingRequiredDocumentsException } from '../domain/exceptions/missing-required-documents.exception';
import type { Client } from '../domain/client.entity';
import { ClientSubmittedEvent } from '../../notifications/domain/events/client-events';

@Injectable()
export class SubmitForAnalysisUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, changedBy: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundException(id);
    }

    if (!client.canSubmitForAnalysis()) {
      throw new Error(`Client cannot be submitted in status '${client.status}'`);
    }

    // Check if all required documents are uploaded via SQL function
    const result = await this.db.execute<{
      can_submit: boolean;
      total_required: number;
      total_uploaded: number;
      missing_documents: string[] | null;
    }>(sql`SELECT * FROM can_submit_for_analysis(${id}::uuid)`);

    const checkResult = result[0];

    if (!checkResult?.can_submit) {
      throw new MissingRequiredDocumentsException(
        checkResult?.missing_documents ?? ['Unknown'],
      );
    }

    // Transition status
    client.validateStatusTransition('document_validation');

    const updated = await this.clientRepository.update(id, {
      status: 'document_validation',
      submittedAt: new Date(),
    });

    // Record status change in history
    await this.db.insert(clientStatusHistory).values({
      clientId: id,
      fromStatus: client.status,
      toStatus: 'document_validation',
      changedBy,
    });

    if (!updated) {
      throw new ClientNotFoundException(id);
    }

    this.eventEmitter.emit(
      ClientSubmittedEvent.EVENT_NAME,
      new ClientSubmittedEvent(id, updated.companyName, changedBy, updated.companyName),
    );

    return updated;
  }
}
