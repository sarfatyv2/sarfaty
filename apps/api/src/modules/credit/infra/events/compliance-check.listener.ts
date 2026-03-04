import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import { SyncComplianceChecksUseCase } from '../../use-cases/sync-compliance-checks.use-case';
import { ClientSubmittedEvent, ClientCreatedEvent } from '../../../notifications/domain/events/client-events';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { clients, clientAuthorizedPersons, clientAddresses } from '../../../../database/schema';

@Injectable()
export class ComplianceCheckListener {
  private readonly logger = new Logger(ComplianceCheckListener.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly syncComplianceChecksUseCase: SyncComplianceChecksUseCase,
  ) {}

  @OnEvent(ClientCreatedEvent.EVENT_NAME, { async: true })
  @OnEvent(ClientSubmittedEvent.EVENT_NAME, { async: true })
  async handleClientSyncEvent(event: ClientCreatedEvent | ClientSubmittedEvent): Promise<void> {
    this.logger.log(`Handling compliance checks for client ${event.clientId}`);

    try {
      const clientRows = await this.db
        .select({
          cnpj: clients.cnpj,
          companyName: clients.companyName,
          tradeName: clients.tradeName,
          email: clients.email,
        })
        .from(clients)
        .where(eq(clients.id, event.clientId))
        .execute();

      const client = clientRows[0];
      if (!client) {
        this.logger.warn(`Client ${event.clientId} not found for compliance checks`);
        return;
      }

      const personsRows = await this.db
        .select({
          cpf: clientAuthorizedPersons.cpf,
          fullName: clientAuthorizedPersons.fullName,
        })
        .from(clientAuthorizedPersons)
        .where(eq(clientAuthorizedPersons.clientId, event.clientId))
        .execute();

      const validPersons = personsRows
        .filter((p): p is typeof p & { cpf: string } => p.cpf != null)
        .map(p => ({ cpf: p.cpf, name: p.fullName || '' }));

      const addressRows = await this.db
        .select({
          zipCode: clientAddresses.zipCode,
          street: clientAddresses.street,
          city: clientAddresses.city,
          state: clientAddresses.state,
        })
        .from(clientAddresses)
        .where(and(eq(clientAddresses.clientId, event.clientId), eq(clientAddresses.isPrimary, true)))
        .limit(1)
        .execute();

      const primaryAddress = addressRows[0];

      await this.syncComplianceChecksUseCase.execute({
        clientId: event.clientId,
        cnpj: client.cnpj || undefined,
        companyName: client.companyName || undefined,
        tradeName: client.tradeName || undefined,
        cep: primaryAddress?.zipCode || undefined,
        registeredStreet: primaryAddress?.street || undefined,
        registeredCity: primaryAddress?.city || undefined,
        registeredState: primaryAddress?.state || undefined,
        email: client.email || undefined,
        authorizedPersons: validPersons,
      });
    } catch (error) {
      this.logger.error(
        `Error executing compliance checks for client ${event.clientId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
