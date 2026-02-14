import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, type NotificationRepository } from '../domain/notification.repository';

@Injectable()
export class MarkAllAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(profileId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(profileId);
  }
}
