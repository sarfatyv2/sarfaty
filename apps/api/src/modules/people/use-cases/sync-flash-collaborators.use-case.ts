import { Inject, Injectable, Logger } from '@nestjs/common';
import { env } from '../../../config/env';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import { FlashAdapter, normalizeBrazilianDocumentDigits } from '../integrations/flash/flash.adapter';

const FLASH_SYNC_BATCH_SIZE = 40;

export interface SyncFlashCollaboratorsResult {
  linked: number;
}

@Injectable()
export class SyncFlashCollaboratorsUseCase {
  private readonly logger = new Logger(SyncFlashCollaboratorsUseCase.name);

  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly flashAdapter: FlashAdapter,
  ) {}

  async execute(): Promise<SyncFlashCollaboratorsResult> {
    if (!this.flashAdapter.isConfigured()) {
      this.logger.warn('SyncFlashCollaborators skipped: FLASH_API_KEY not set');
      return { linked: 0 };
    }

    const candidates = await this.collaboratorRepository.findCollaboratorsWithCpfNotNull();
    const companyId = env.FLASH_COMPANY_ID?.trim();
    let linked = 0;

    for (let offset = 0; offset < candidates.length; offset += FLASH_SYNC_BATCH_SIZE) {
      const batch = candidates.slice(offset, offset + FLASH_SYNC_BATCH_SIZE);
      const documentNumbers = batch
        .map((c) => normalizeBrazilianDocumentDigits(c.cpf!))
        .filter((digits) => digits.length > 0)
        .join(',');

      if (!documentNumbers) {
        continue;
      }

      const response = await this.flashAdapter.listEmployees({
        page: 1,
        limit: 200,
        companyId: companyId || undefined,
        documentNumbers,
      });

      const byDigits = new Map(
        batch.map((c) => [normalizeBrazilianDocumentDigits(c.cpf!), c] as const),
      );

      for (const record of response.records) {
        const digits = normalizeBrazilianDocumentDigits(record.documentNumber ?? '');
        const collab = byDigits.get(digits);
        if (!collab || !record.id) {
          continue;
        }
        if (collab.flashEmployeeId === record.id) {
          continue;
        }

        const updated = await this.collaboratorRepository.update(collab.id, {
          flashEmployeeId: record.id,
        });
        if (updated) {
          linked += 1;
        }
      }
    }

    return { linked };
  }
}
