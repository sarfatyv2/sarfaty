import { Inject, Injectable } from '@nestjs/common';
import type { ListCommitteesQueryDto } from '@nexus/validators';
import {
  COMMITTEE_REPOSITORY,
  type CommitteeRepository,
  type PaginatedCommittees,
} from '../domain/committee.repository';

@Injectable()
export class ListCommitteesUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
  ) {}

  async execute(query: ListCommitteesQueryDto): Promise<PaginatedCommittees> {
    return this.committeeRepository.findByFilters({
      status: query.status,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
  }
}
