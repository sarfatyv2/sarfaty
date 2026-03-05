import { Inject, Injectable } from '@nestjs/common';
import { CNAB_FILE_REPOSITORY, type CnabFileRepository } from '../domain/cnab-file.repository';
import { CnabFile } from '../domain/cnab-file.entity';
import { CnabFileNotFoundException } from '../domain/exceptions/cnab-file-not-found.exception';

@Injectable()
export class GetCnabFileUseCase {
  constructor(
    @Inject(CNAB_FILE_REPOSITORY)
    private readonly cnabFileRepo: CnabFileRepository,
  ) {}

  async execute(id: string): Promise<CnabFile> {
    const file = await this.cnabFileRepo.findById(id);
    if (!file) throw new CnabFileNotFoundException(id);
    return file;
  }
}
