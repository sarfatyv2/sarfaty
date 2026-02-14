import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ReimbursementApprovedEvent,
  ReimbursementRejectedEvent,
  ReimbursementPendingApprovalEvent,
  InvoiceApprovedEvent,
  InvoiceRejectedEvent,
} from '../domain/events/people-events';
import { NotificationDispatcherService } from '../infra/notification-dispatcher.service';
import { NotificationResolverService } from '../infra/notification-resolver.service';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

@Injectable()
export class PeopleNotificationHandler {
  private readonly logger = new Logger(PeopleNotificationHandler.name);

  constructor(
    private readonly dispatcher: NotificationDispatcherService,
    private readonly resolver: NotificationResolverService,
  ) {}

  @OnEvent(ReimbursementApprovedEvent.EVENT_NAME, { async: true })
  async handleReimbursementApproved(event: ReimbursementApprovedEvent): Promise<void> {
    this.logger.debug(`Handling ${ReimbursementApprovedEvent.EVENT_NAME}`);

    const profileId = await this.resolver.resolveProfileByCollaboratorId(event.collaboratorId);
    if (!profileId) return;

    await this.dispatcher.sendToProfile({
      profileId,
      type: 'reimbursement_approved',
      title: 'Reembolso aprovado',
      message: `Seu reembolso "${event.title}" foi aprovado.`,
      metadata: { reimbursementId: event.reimbursementId },
    });
  }

  @OnEvent(ReimbursementRejectedEvent.EVENT_NAME, { async: true })
  async handleReimbursementRejected(event: ReimbursementRejectedEvent): Promise<void> {
    this.logger.debug(`Handling ${ReimbursementRejectedEvent.EVENT_NAME}`);

    const profileId = await this.resolver.resolveProfileByCollaboratorId(event.collaboratorId);
    if (!profileId) return;

    await this.dispatcher.sendToProfile({
      profileId,
      type: 'reimbursement_rejected',
      title: 'Reembolso recusado',
      message: `Seu reembolso "${event.title}" foi recusado. Motivo: ${event.reason}`,
      metadata: { reimbursementId: event.reimbursementId, reason: event.reason },
    });
  }

  @OnEvent(ReimbursementPendingApprovalEvent.EVENT_NAME, { async: true })
  async handleReimbursementPendingApproval(event: ReimbursementPendingApprovalEvent): Promise<void> {
    this.logger.debug(`Handling ${ReimbursementPendingApprovalEvent.EVENT_NAME}`);

    const managerIds = await this.resolver.resolveManagerForCollaborator(event.collaboratorId);
    if (managerIds.length === 0) return;

    await this.dispatcher.sendToProfiles(managerIds, {
      type: 'reimbursement_pending_approval',
      title: 'Reembolso pendente de aprovação',
      message: `Novo reembolso "${event.title}" (R$ ${event.amount}) aguardando sua aprovação.`,
      metadata: { reimbursementId: event.reimbursementId, amount: event.amount },
    });
  }

  @OnEvent(InvoiceApprovedEvent.EVENT_NAME, { async: true })
  async handleInvoiceApproved(event: InvoiceApprovedEvent): Promise<void> {
    this.logger.debug(`Handling ${InvoiceApprovedEvent.EVENT_NAME}`);

    const profileId = await this.resolver.resolveProfileByCollaboratorId(event.collaboratorId);
    if (!profileId) return;

    const monthName = MONTH_NAMES[event.referenceMonth - 1] ?? String(event.referenceMonth);

    await this.dispatcher.sendToProfile({
      profileId,
      type: 'pj_invoice_uploaded',
      title: 'Nota fiscal aprovada',
      message: `Sua NF de ${monthName}/${event.referenceYear} foi aprovada.`,
      metadata: { invoiceId: event.invoiceId },
    });
  }

  @OnEvent(InvoiceRejectedEvent.EVENT_NAME, { async: true })
  async handleInvoiceRejected(event: InvoiceRejectedEvent): Promise<void> {
    this.logger.debug(`Handling ${InvoiceRejectedEvent.EVENT_NAME}`);

    const profileId = await this.resolver.resolveProfileByCollaboratorId(event.collaboratorId);
    if (!profileId) return;

    const monthName = MONTH_NAMES[event.referenceMonth - 1] ?? String(event.referenceMonth);

    await this.dispatcher.sendToProfile({
      profileId,
      type: 'pj_invoice_overdue',
      title: 'Nota fiscal rejeitada',
      message: `Sua NF de ${monthName}/${event.referenceYear} foi rejeitada. Motivo: ${event.reason}`,
      metadata: { invoiceId: event.invoiceId, reason: event.reason },
    });
  }
}
