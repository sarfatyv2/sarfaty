import { Inject, Injectable } from '@nestjs/common';
import type { CreateMeetingDto } from '@nexus/validators';
import { Meeting } from '../domain/meeting.entity';
import { MEETING_REPOSITORY, type MeetingRepository } from '../domain/meeting.repository';
import { COMMITTEE_REPOSITORY, type CommitteeRepository } from '../domain/committee.repository';
import { CommitteeNotFoundException } from '../domain/exceptions/committee-not-found.exception';

@Injectable()
export class CreateMeetingUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
    @Inject(MEETING_REPOSITORY)
    private readonly meetingRepository: MeetingRepository,
  ) {}

  async execute(committeeId: string, dto: CreateMeetingDto, createdBy: string): Promise<Meeting> {
    const committee = await this.committeeRepository.findById(committeeId);
    if (!committee) {
      throw new CommitteeNotFoundException(committeeId);
    }

    const meeting = Meeting.create({
      committeeId,
      title: dto.title,
      description: dto.description ?? null,
      scheduledAt: new Date(dto.scheduledAt),
      locationOrLink: dto.locationOrLink ?? null,
      createdBy,
    });

    return this.meetingRepository.save(meeting);
  }
}
