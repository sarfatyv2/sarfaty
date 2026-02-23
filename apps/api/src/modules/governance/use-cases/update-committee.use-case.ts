import { Inject, Injectable } from '@nestjs/common';
import type { UpdateCommitteeDto } from '@nexus/validators';
import { COMMITTEE_REPOSITORY, type CommitteeRepository } from '../domain/committee.repository';
import { Committee } from '../domain/committee.entity';
import { CommitteeNotFoundException } from '../domain/exceptions/committee-not-found.exception';

@Injectable()
export class UpdateCommitteeUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
  ) {}

  async execute(id: string, dto: UpdateCommitteeDto): Promise<Committee> {
    const existing = await this.committeeRepository.findById(id);
    if (!existing) {
      throw new CommitteeNotFoundException(id);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.regulation !== undefined) updateData.regulation = dto.regulation;
    if (dto.frequency !== undefined) updateData.frequency = dto.frequency;
    if (dto.status !== undefined) updateData.status = dto.status;

    const updated = await this.committeeRepository.update(id, updateData);
    if (!updated) {
      throw new CommitteeNotFoundException(id);
    }

    return updated;
  }
}
