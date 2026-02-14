import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, type NotificationRepository, type PaginatedNotifications } from '../domain/notification.repository';
import type { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(profileId: string, query: ListNotificationsQueryDto): Promise<PaginatedNotifications> {
    return this.notificationRepository.findByProfileId({
      profileId,
      unreadOnly: query.unreadOnly,
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
