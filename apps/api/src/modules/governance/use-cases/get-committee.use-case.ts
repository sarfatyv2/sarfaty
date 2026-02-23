import { Inject, Injectable } from '@nestjs/common';
import { COMMITTEE_REPOSITORY, type CommitteeRepository } from '../domain/committee.repository';
import { Committee } from '../domain/committee.entity';
import { CommitteeNotFoundException } from '../domain/exceptions/committee-not-found.exception';

@Injectable()
export class GetCommitteeUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
  ) {}

  async execute(id: string): Promise<Committee> {
    const committee = await this.committeeRepository.findById(id);
    if (!committee) {
      throw new CommitteeNotFoundException(id);
    }
    return committee;
  }
}
