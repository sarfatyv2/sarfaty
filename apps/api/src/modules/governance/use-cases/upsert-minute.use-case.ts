import { Inject, Injectable } from '@nestjs/common';
import type { UpsertMinuteDto } from '@nexus/validators';
import { MeetingMinute } from '../domain/meeting-minute.entity';
import {
  MEETING_REPOSITORY,
  MINUTE_REPOSITORY,
  type MeetingRepository,
  type MinuteRepository,
} from '../domain/meeting.repository';
import { MeetingNotFoundException } from '../domain/exceptions/meeting-not-found.exception';

@Injectable()
export class UpsertMinuteUseCase {
  constructor(
    @Inject(MEETING_REPOSITORY)
    private readonly meetingRepository: MeetingRepository,
    @Inject(MINUTE_REPOSITORY)
    private readonly minuteRepository: MinuteRepository,
  ) {}

  async execute(meetingId: string, dto: UpsertMinuteDto, userId: string): Promise<MeetingMinute> {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new MeetingNotFoundException(meetingId);
    }

    const existing = await this.minuteRepository.findByMeetingId(meetingId);

    if (existing) {
      const updated = await this.minuteRepository.update(existing.id, { content: dto.content });
      return updated!;
    }

    const minute = MeetingMinute.create({
      meetingId,
      content: dto.content ?? null,
      createdBy: userId,
    });

    return this.minuteRepository.save(minute);
  }
}
