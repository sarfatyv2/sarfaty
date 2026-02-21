import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import { SyncVaduClientUseCase } from '../../use-cases/sync-vadu-client.use-case';
import { ClientSubmittedEvent } from '../../../notifications/domain/events/client-events';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';
import { clients, clientAuthorizedPersons } from '../../../../database/schema';

@Injectable()
export class VaduClientListener {
  private readonly logger = new Logger(VaduClientListener.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
    private readonly syncVaduClientUseCase: SyncVaduClientUseCase,
  ) {}

  @OnEvent(ClientSubmittedEvent.EVENT_NAME, { async: true })
  async handleClientSubmittedEvent(event: ClientSubmittedEvent): Promise<void> {
    this.logger.log(`Handling ClientSubmittedEvent for client ${event.clientId}`);

    try {
      // 1. Fetch client CNPJ
      const clientRows = await this.db
        .select({ cnpj: clients.cnpj })
        .from(clients)
        .where(eq(clients.id, event.clientId))
        .execute();

      const client = clientRows[0];
      if (!client) {
        this.logger.warn(`Client ${event.clientId} not found when running Vadu integration`);
        return;
      }

      // 2. Fetch authorized persons CPFs
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

      // 3. Call use case to sync with VADU
      await this.syncVaduClientUseCase.execute({
        clientId: event.clientId,
        cnpj: client.cnpj || undefined,
        authorizedPersons: validPersons,
      });

    } catch (error) {
      this.logger.error(`Error executing Vadu integration for client ${event.clientId}: ${(error as Error).message}`, (error as Error).stack);
      // We don't throw here to avoid failing the main event loop / causing unhandled rejections
    }
  }
}
