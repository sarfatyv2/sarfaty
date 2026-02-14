import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientCreatedEvent, ClientSubmittedEvent } from '../domain/events/client-events';
import { NotificationDispatcherService } from '../infra/notification-dispatcher.service';
import { NotificationResolverService } from '../infra/notification-resolver.service';

@Injectable()
export class ClientNotificationHandler {
  private readonly logger = new Logger(ClientNotificationHandler.name);

  constructor(
    private readonly dispatcher: NotificationDispatcherService,
    private readonly resolver: NotificationResolverService,
  ) {}

  @OnEvent(ClientCreatedEvent.EVENT_NAME, { async: true })
  async handleClientCreated(event: ClientCreatedEvent): Promise<void> {
    this.logger.debug(`Handling ${ClientCreatedEvent.EVENT_NAME} for client ${event.clientId}`);

    let profileIds: string[] = [];

    if (event.teamId) {
      profileIds = await this.resolver.resolveByTeam(event.teamId, ['sales_supervisor']);
    }

    if (profileIds.length === 0) return;

    // Exclude the actor
    profileIds = profileIds.filter((id) => id !== event.actorId);

    await this.dispatcher.sendToProfiles(profileIds, {
      type: 'client_approved',
      title: 'Novo cliente cadastrado',
      message: `${event.actorName} cadastrou o cliente "${event.companyName}".`,
      clientId: event.clientId,
      metadata: { companyName: event.companyName },
    });
  }

  @OnEvent(ClientSubmittedEvent.EVENT_NAME, { async: true })
  async handleClientSubmitted(event: ClientSubmittedEvent): Promise<void> {
    this.logger.debug(`Handling ${ClientSubmittedEvent.EVENT_NAME} for client ${event.clientId}`);

    const profileIds = await this.resolver.resolveByRoles(['credit_analyst']);

    if (profileIds.length === 0) return;

    await this.dispatcher.sendToProfiles(profileIds, {
      type: 'new_client_in_queue',
      title: 'Novo cliente na fila de análise',
      message: `O cliente "${event.companyName}" foi enviado para análise de crédito por ${event.actorName}.`,
      clientId: event.clientId,
      metadata: { companyName: event.companyName },
    });
  }
}
