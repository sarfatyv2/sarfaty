import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, type NotificationRepository } from '../domain/notification.repository';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(profileId: string): Promise<number> {
    return this.notificationRepository.countUnreadByProfileId(profileId);
  }
}
