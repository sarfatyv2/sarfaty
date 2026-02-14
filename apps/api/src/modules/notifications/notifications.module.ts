import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { ListNotificationsUseCase } from './use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from './use-cases/get-unread-count.use-case';
import { MarkAsReadUseCase } from './use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from './use-cases/mark-all-as-read.use-case';
import { DrizzleNotificationRepository } from './infra/drizzle-notification.repository';
import { NotificationDispatcherService } from './infra/notification-dispatcher.service';
import { NotificationResolverService } from './infra/notification-resolver.service';
import { NOTIFICATION_REPOSITORY } from './domain/notification.repository';
import { ClientNotificationHandler } from './handlers/client-notification.handler';
import { PeopleNotificationHandler } from './handlers/people-notification.handler';
import { LearningNotificationHandler } from './handlers/learning-notification.handler';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [
    // Use cases (API)
    ListNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkAsReadUseCase,
    MarkAllAsReadUseCase,
    // Infrastructure
    DrizzleNotificationRepository,
    { provide: NOTIFICATION_REPOSITORY, useClass: DrizzleNotificationRepository },
    NotificationDispatcherService,
    NotificationResolverService,
    // Event handlers
    ClientNotificationHandler,
    PeopleNotificationHandler,
    LearningNotificationHandler,
  ],
  exports: [NotificationDispatcherService, NotificationResolverService],
})
export class NotificationsModule {}
