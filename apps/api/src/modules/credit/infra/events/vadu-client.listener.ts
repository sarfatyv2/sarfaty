import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import { SyncVaduClientUseCase } from '../../use-cases/sync-vadu-client.use-case';
import { RequestSerasaReportUseCase } from '../../use-cases/request-serasa-report.use-case';
import { ClientSubmittedEvent, ClientCreatedEvent } from '../../../notifications/domain/events/client-events';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { clients, clientAuthorizedPersons } from '../../../../database/schema';

@Injectable()
export class VaduClientListener {
  private readonly logger = new Logger(VaduClientListener.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly syncVaduClientUseCase: SyncVaduClientUseCase,
    private readonly requestSerasaReportUseCase: RequestSerasaReportUseCase,
  ) {}

  @OnEvent(ClientCreatedEvent.EVENT_NAME, { async: true })
  @OnEvent(ClientSubmittedEvent.EVENT_NAME, { async: true })
  async handleClientSyncEvent(event: ClientCreatedEvent | ClientSubmittedEvent): Promise<void> {
    this.logger.log(`Handling bureau sync event for client ${event.clientId}`);

    try {
      const clientRows = await this.db
        .select({ cnpj: clients.cnpj })
        .from(clients)
        .where(eq(clients.id, event.clientId))
        .execute();

      const client = clientRows[0];
      if (!client) {
        this.logger.warn(`Client ${event.clientId} not found when running bureau integration`);
        return;
      }

      const personsRows = await this.db
        .select({
          id: clientAuthorizedPersons.id,
          cpf: clientAuthorizedPersons.cpf,
        })
        .from(clientAuthorizedPersons)
        .where(eq(clientAuthorizedPersons.clientId, event.clientId))
        .execute();

      const validPersons = personsRows
        .filter(p => p.cpf != null)
        .map(p => ({ id: p.id, cpf: p.cpf as string }));

      const results = await Promise.allSettled([
        this.syncVaduClientUseCase.execute({
          clientId: event.clientId,
          cnpj: client.cnpj || undefined,
          authorizedPersons: validPersons,
        }),
        client.cnpj
          ? this.requestSerasaReportUseCase.execute(event.clientId)
          : Promise.resolve(null),
      ]);

      for (const [idx, result] of results.entries()) {
        if (result.status === 'rejected') {
          const source = idx === 0 ? 'Vadu' : 'Serasa';
          this.logger.error(`${source} integration failed for client ${event.clientId}: ${result.reason}`);
        }
      }

    } catch (error) {
      this.logger.error(`Error executing bureau integration for client ${event.clientId}: ${(error as Error).message}`, (error as Error).stack);
    }
  }
}
