import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';
import { PeopleStorageService } from '../infra/people-storage.service';

export interface GetReceiptUrlResult {
  url: string;
  fileName: string | null;
  mimeType: string | null;
}

@Injectable()
export class GetReceiptUrlUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
    private readonly storageService: PeopleStorageService,
  ) {}

  async execute(reimbursementId: string): Promise<GetReceiptUrlResult> {
    const reimbursement =
      await this.reimbursementRepository.findById(reimbursementId);

    if (!reimbursement) {
      throw new NotFoundException('Reimbursement not found');
    }

    if (!reimbursement.receiptPath) {
      throw new NotFoundException('No receipt attached to this reimbursement');
    }

    const url = await this.storageService.getSignedUrl(
      reimbursement.receiptPath,
    );

    if (!url) {
      throw new NotFoundException('Receipt file not found in storage');
    }

    return {
      url,
      fileName: reimbursement.receiptFileName,
      mimeType: reimbursement.receiptMimeType,
    };
  }
}
