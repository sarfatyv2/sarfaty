import { Inject, Injectable } from '@nestjs/common';
import type { Reimbursement } from '../domain/reimbursement.entity';
import type { ReimbursementRepository } from '../domain/reimbursement.repository';
import { REIMBURSEMENT_REPOSITORY } from '../domain/reimbursement.repository';
import { COLLABORATOR_REPOSITORY } from '../domain/collaborator.repository';
import type { CollaboratorRepository } from '../domain/collaborator.repository';
import { PeopleStorageService } from '../infra/people-storage.service';

export interface UploadReceiptInput {
  reimbursementId: string;
  profileId: string;
  file: { buffer: Buffer; originalName: string; mimetype: string };
}

@Injectable()
export class UploadReceiptUseCase {
  constructor(
    @Inject(REIMBURSEMENT_REPOSITORY)
    private readonly reimbursementRepository: ReimbursementRepository,
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly storageService: PeopleStorageService,
  ) {}

  async execute(input: UploadReceiptInput): Promise<Reimbursement> {
    const reimbursement = await this.reimbursementRepository.findById(
      input.reimbursementId,
    );
    if (!reimbursement) {
      throw new Error('Reimbursement not found');
    }

    const canUpload =
      reimbursement.status === 'pending' || reimbursement.status === 'draft';
    if (!canUpload) {
      throw new Error(
        `Cannot upload receipt: reimbursement status is ${reimbursement.status}`,
      );
    }

    const collaborator = await this.collaboratorRepository.findByProfileId(
      input.profileId,
    );
    if (!collaborator || collaborator.id !== reimbursement.collaboratorId) {
      throw new Error(
        'Unauthorized: you can only upload receipt to your own reimbursements',
      );
    }

    const { path, size, mimeType } = await this.storageService.uploadReceipt(
      reimbursement.collaboratorId,
      reimbursement.id,
      input.file,
    );

    const updated = await this.reimbursementRepository.update(
      input.reimbursementId,
      {
        receiptPath: path,
        receiptFileName: input.file.originalName,
        receiptUploadedAt: new Date(),
        receiptFileSize: size,
        receiptMimeType: mimeType,
      },
    );

    if (!updated) {
      throw new Error('Failed to update reimbursement after receipt upload');
    }
    return updated;
  }
}
