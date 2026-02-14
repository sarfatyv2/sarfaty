import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, type NotificationRepository } from '../domain/notification.repository';

@Injectable()
export class MarkAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(notificationId: string, profileId: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(notificationId, profileId);
  }
}
