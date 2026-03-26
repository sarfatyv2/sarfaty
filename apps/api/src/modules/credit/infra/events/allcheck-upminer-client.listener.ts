import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncAllcheckClientUseCase } from '../../use-cases/sync-allcheck-client.use-case';
import { RequestUpminerBatchUseCase } from '../../use-cases/request-upminer-batch.use-case';
import {
  ClientCreatedEvent,
  ClientSubmittedEvent,
} from '../../../notifications/domain/events/client-events';

@Injectable()
export class AllcheckUpminerClientListener {
  private readonly logger = new Logger(AllcheckUpminerClientListener.name);

  constructor(
    private readonly syncAllcheckClientUseCase: SyncAllcheckClientUseCase,
    private readonly requestUpminerBatchUseCase: RequestUpminerBatchUseCase,
  ) {}

  @OnEvent(ClientCreatedEvent.EVENT_NAME, { async: true })
  @OnEvent(ClientSubmittedEvent.EVENT_NAME, { async: true })
  async handleClientSyncEvent(event: ClientCreatedEvent | ClientSubmittedEvent): Promise<void> {
    this.logger.log(`Handling Allcheck/upMiner sync for client ${event.clientId}`);

    const results = await Promise.allSettled([
      this.syncAllcheckClientUseCase.execute({ clientId: event.clientId }),
      this.requestUpminerBatchUseCase.execute(event.clientId),
    ]);

    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        const source = index === 0 ? 'Allcheck' : 'upMiner';
        this.logger.error(
          `${source} integration failed for client ${event.clientId}: ${String(result.reason)}`,
        );
      }
    }
  }
}
