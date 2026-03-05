import { Inject, Injectable } from '@nestjs/common';
import { CNAB_FILE_REPOSITORY, type CnabFileRepository } from '../domain/cnab-file.repository';
import { CnabFile } from '../domain/cnab-file.entity';

export interface UploadCnabFileInput {
  clientId: string;
  storagePath: string;
  originalFilename: string;
  bankCode: string;
}

@Injectable()
export class UploadCnabFileUseCase {
  constructor(
    @Inject(CNAB_FILE_REPOSITORY)
    private readonly cnabFileRepo: CnabFileRepository,
  ) {}

  async execute(input: UploadCnabFileInput): Promise<CnabFile> {
    const file = CnabFile.create({
      clientId: input.clientId,
      fileType: 'remittance',
      layoutVersion: 'cnab400',
      bankCode: input.bankCode,
      bankName: null,
      cedentCode: null,
      cedentName: null,
      remittanceDate: null,
      sequentialNumber: null,
      storagePath: input.storagePath,
      originalFilename: input.originalFilename,
      totalRecords: null,
      totalAmount: null,
      status: 'uploaded',
      parsingErrors: null,
      processedAt: null,
    });

    return this.cnabFileRepo.save(file);
  }
}
