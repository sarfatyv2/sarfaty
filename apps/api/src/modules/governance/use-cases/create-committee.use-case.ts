import { Inject, Injectable } from '@nestjs/common';
import type { CreateCommitteeDto } from '@nexus/validators';
import { Committee } from '../domain/committee.entity';
import { COMMITTEE_REPOSITORY, type CommitteeRepository } from '../domain/committee.repository';

@Injectable()
export class CreateCommitteeUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
  ) {}

  async execute(dto: CreateCommitteeDto, createdBy: string): Promise<Committee> {
    const committee = Committee.create({
      name: dto.name,
      description: dto.description ?? null,
      regulation: dto.regulation ?? null,
      frequency: dto.frequency,
      createdBy,
    });

    return this.committeeRepository.save(committee);
  }
}
