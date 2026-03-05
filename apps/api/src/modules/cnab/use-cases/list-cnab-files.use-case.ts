import { Inject, Injectable } from '@nestjs/common';
import {
  CNAB_FILE_REPOSITORY,
  type CnabFileRepository,
  type CnabFileFilters,
  type PaginatedCnabFiles,
} from '../domain/cnab-file.repository';

@Injectable()
export class ListCnabFilesUseCase {
  constructor(
    @Inject(CNAB_FILE_REPOSITORY)
    private readonly repo: CnabFileRepository,
  ) {}

  async execute(filters: CnabFileFilters): Promise<PaginatedCnabFiles> {
    return this.repo.findByFilters(filters);
  }
}
