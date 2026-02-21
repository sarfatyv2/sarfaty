import { Inject, Injectable } from '@nestjs/common';
import { DRAWEE_REPOSITORY, type DraweeRepository } from '../domain/drawee.repository';
import type { ListDraweesQueryDto } from '@nexus/validators';

@Injectable()
export class ListDraweesUseCase {
  constructor(
    @Inject(DRAWEE_REPOSITORY)
    private readonly draweeRepository: DraweeRepository,
  ) {}

  async execute(query: ListDraweesQueryDto) {
    const result = await this.draweeRepository.findByFilters({
      search: query.search,
      status: query.status,
      personType: query.personType,
      segmentId: query.segmentId,
      isPep: query.isPep,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      data: result.drawees.map((d) => d.toPlainObject()),
      pagination: result.pagination,
    };
  }
}
