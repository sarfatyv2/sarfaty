import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ACTION_ITEM_REPOSITORY,
  type ActionItemRepository,
} from '../domain/action-item.repository';
import { NotificationDispatcherService } from '../../notifications/infra/notification-dispatcher.service';

const DUE_SOON_DAYS = 3;

@Injectable()
export class ActionReminderScheduler {
  private readonly logger = new Logger(ActionReminderScheduler.name);

  constructor(
    @Inject(ACTION_ITEM_REPOSITORY)
    private readonly actionItemRepository: ActionItemRepository,
    private readonly notificationDispatcher: NotificationDispatcherService,
  ) {}

  /**
   * Runs every morning at 8am.
   * Checks for action items due in the next 3 days and sends reminders.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDueSoonReminders(): Promise<void> {
    this.logger.log('Running due-soon action item reminders...');

    try {
      const items = await this.actionItemRepository.findDueSoon(DUE_SOON_DAYS);
      const itemsWithAssignees = items.filter((item) => item.assigneeId !== null);

      if (itemsWithAssignees.length === 0) {
        this.logger.log('No due-soon actions found.');
        return;
      }

      const grouped = new Map<string, typeof itemsWithAssignees>();
      for (const item of itemsWithAssignees) {
        const assigneeId = item.assigneeId!;
        if (!grouped.has(assigneeId)) {
          grouped.set(assigneeId, []);
        }
        grouped.get(assigneeId)!.push(item);
      }

      for (const [assigneeId, assigneeItems] of grouped) {
        await this.notificationDispatcher.sendToProfile({
          profileId: assigneeId,
          type: 'approval_sla_warning',
          title: 'Ação com prazo próximo',
          message: `Você tem ${assigneeItems.length} ação(ões) com prazo vencendo nos próximos ${DUE_SOON_DAYS} dias.`,
          metadata: {
            actionItemIds: assigneeItems.map((i) => i.id),
            actionItemTitles: assigneeItems.map((i) => i.title),
          },
        });
      }

      this.logger.log(`Sent due-soon reminders to ${grouped.size} assignees.`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send due-soon reminders: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Runs every morning at 9am.
   * Checks for overdue action items and notifies the assignees.
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendOverdueReminders(): Promise<void> {
    this.logger.log('Running overdue action item reminders...');

    try {
      const result = await this.actionItemRepository.findByFilters({
        page: 1,
        pageSize: 500,
        sortOrder: 'asc',
      });
      const overdueItems = result.actionItems.filter((item) =>
        item.isOverdue() && item.assigneeId !== null,
      );

      if (overdueItems.length === 0) {
        this.logger.log('No overdue actions found.');
        return;
      }

      const grouped = new Map<string, typeof overdueItems>();
      for (const item of overdueItems) {
        const assigneeId = item.assigneeId!;
        if (!grouped.has(assigneeId)) {
          grouped.set(assigneeId, []);
        }
        grouped.get(assigneeId)!.push(item);
      }

      for (const [assigneeId, assigneeItems] of grouped) {
        await this.notificationDispatcher.sendToProfile({
          profileId: assigneeId,
          type: 'approval_sla_warning',
          title: 'Ações em atraso',
          message: `Você tem ${assigneeItems.length} ação(ões) com prazo vencido. Atualize o status para manter o acompanhamento.`,
          metadata: {
            actionItemIds: assigneeItems.map((i) => i.id),
          },
        });
      }

      this.logger.log(`Sent overdue reminders to ${grouped.size} assignees.`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send overdue reminders: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
