import { Inject, Injectable } from '@nestjs/common';
import { MeetingMinute } from '../domain/meeting-minute.entity';
import { MINUTE_REPOSITORY, type MinuteRepository } from '../domain/meeting.repository';
import { DomainException } from '@nexus/types';

export class MinuteAlreadyPublishedException extends DomainException {
  readonly code = 'MINUTE_ALREADY_PUBLISHED';
  readonly httpStatus = 409;

  constructor(meetingId: string) {
    super(`Meeting minute for meeting ${meetingId} is already published`);
  }
}

export class MinuteNotFoundException extends DomainException {
  readonly code = 'MINUTE_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(meetingId: string) {
    super(`No minute found for meeting ${meetingId}`);
  }
}

@Injectable()
export class PublishMinuteUseCase {
  constructor(
    @Inject(MINUTE_REPOSITORY)
    private readonly minuteRepository: MinuteRepository,
  ) {}

  async execute(meetingId: string, publishedBy: string): Promise<MeetingMinute> {
    const existing = await this.minuteRepository.findByMeetingId(meetingId);
    if (!existing) {
      throw new MinuteNotFoundException(meetingId);
    }

    if (!existing.canPublish()) {
      throw new MinuteAlreadyPublishedException(meetingId);
    }

    const updated = await this.minuteRepository.update(existing.id, {
      status: 'published',
      publishedAt: new Date(),
      publishedBy,
    });

    return updated!;
  }
}
