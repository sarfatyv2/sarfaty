import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoursePublishedEvent } from '../domain/events/learning-events';
import { NotificationDispatcherService } from '../infra/notification-dispatcher.service';
import { NotificationResolverService } from '../infra/notification-resolver.service';

@Injectable()
export class LearningNotificationHandler {
  private readonly logger = new Logger(LearningNotificationHandler.name);

  constructor(
    private readonly dispatcher: NotificationDispatcherService,
    private readonly resolver: NotificationResolverService,
  ) {}

  @OnEvent(CoursePublishedEvent.EVENT_NAME, { async: true })
  async handleCoursePublished(event: CoursePublishedEvent): Promise<void> {
    this.logger.debug(`Handling ${CoursePublishedEvent.EVENT_NAME} for course ${event.courseId}`);

    const profileIds = await this.resolver.resolveByRoles(event.targetRoles);

    if (profileIds.length === 0) return;

    // Exclude the actor who published
    const recipients = profileIds.filter((id) => id !== event.actorId);
    if (recipients.length === 0) return;

    await this.dispatcher.sendToProfiles(recipients, {
      type: 'review_cycle_open',
      title: 'Novo curso disponível',
      message: `O curso "${event.courseTitle}" foi publicado e está disponível para você.`,
      metadata: { courseId: event.courseId, courseTitle: event.courseTitle },
    });
  }
}
