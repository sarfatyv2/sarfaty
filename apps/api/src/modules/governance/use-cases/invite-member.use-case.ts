import { Inject, Injectable } from '@nestjs/common';
import type { InviteMemberDto } from '@nexus/validators';
import type { CommitteeMember } from '@nexus/types';
import {
  COMMITTEE_MEMBER_REPOSITORY,
  type CommitteeMemberRepository,
} from '../domain/committee-member.repository';
import { COMMITTEE_REPOSITORY, type CommitteeRepository } from '../domain/committee.repository';
import { CommitteeNotFoundException } from '../domain/exceptions/committee-not-found.exception';
import { MemberAlreadyExistsException } from '../domain/exceptions/member-already-exists.exception';

@Injectable()
export class InviteMemberUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
    @Inject(COMMITTEE_MEMBER_REPOSITORY)
    private readonly memberRepository: CommitteeMemberRepository,
  ) {}

  async execute(committeeId: string, dto: InviteMemberDto, invitedBy: string): Promise<CommitteeMember> {
    const committee = await this.committeeRepository.findById(committeeId);
    if (!committee) {
      throw new CommitteeNotFoundException(committeeId);
    }

    const existing = await this.memberRepository.findByCommitteeAndProfile(
      committeeId,
      dto.profileId,
    );
    if (existing) {
      throw new MemberAlreadyExistsException(committeeId, dto.profileId);
    }

    return this.memberRepository.save({
      id: '',
      committeeId,
      profileId: dto.profileId,
      role: dto.role,
      invitedBy,
      createdAt: new Date().toISOString(),
    });
  }
}
