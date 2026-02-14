import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, type NotificationRepository, type CreateNotificationInput } from '../domain/notification.repository';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  /**
   * Send a notification to a single profile.
   */
  async sendToProfile(input: CreateNotificationInput): Promise<void> {
    try {
      await this.notificationRepository.create(input);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send notification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Send the same notification to multiple profiles (bulk insert).
   */
  async sendToProfiles(
    profileIds: string[],
    notification: Omit<CreateNotificationInput, 'profileId'>,
  ): Promise<void> {
    if (profileIds.length === 0) return;

    const deduplicated = [...new Set(profileIds)];

    try {
      await this.notificationRepository.createMany(
        deduplicated.map((profileId) => ({
          profileId,
          ...notification,
        })),
      );
      this.logger.debug(
        `Dispatched "${notification.type}" to ${deduplicated.length} profiles`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to dispatch notifications: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
