import { Inject, Injectable, Logger } from '@nestjs/common';
import { env } from '../../../config/env';
import type { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import { FlashAdapter, normalizeBrazilianDocumentDigits } from '../integrations/flash/flash.adapter';

@Injectable()
export class RegisterCollaboratorToFlashUseCase {
  private readonly logger = new Logger(RegisterCollaboratorToFlashUseCase.name);

  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly flashAdapter: FlashAdapter,
  ) {}

  async execute(collaboratorId: string): Promise<Collaborator> {
    const existing = await this.collaboratorRepository.findById(collaboratorId);
    if (!existing) {
      throw new CollaboratorNotFoundException(collaboratorId);
    }

    if (!this.flashAdapter.isConfigured()) {
      this.logger.warn('RegisterCollaboratorToFlash skipped: FLASH_API_KEY not set');
      return existing;
    }

    if (existing.flashEmployeeId) {
      return existing;
    }

    const companyId = env.FLASH_COMPANY_ID?.trim();
    if (!companyId) {
      this.logger.warn('RegisterCollaboratorToFlash skipped: FLASH_COMPANY_ID not set');
      return existing;
    }

    const documentDigits = normalizeBrazilianDocumentDigits(existing.cpf ?? '');
    if (!documentDigits) {
      this.logger.warn(`RegisterCollaboratorToFlash skipped: collaborator ${collaboratorId} has no CPF`);
      return existing;
    }

    let managerFlashId: string | undefined;
    if (existing.managerId) {
      const manager = await this.collaboratorRepository.findById(existing.managerId);
      managerFlashId = manager?.flashEmployeeId ?? undefined;
    }

    const created = await this.flashAdapter.createEmployee({
      companyId,
      documentNumber: documentDigits,
      name: existing.fullName,
      email: existing.corporateEmail ?? existing.personalEmail ?? undefined,
      externalId: existing.id,
      phoneNumber: existing.phone ?? undefined,
      managerId: managerFlashId,
      invitationDate: existing.registrationDate
        ? `${existing.registrationDate}T12:00:00.000Z`
        : undefined,
    });

    const updated = await this.collaboratorRepository.update(collaboratorId, {
      flashEmployeeId: created.id,
    });

    if (!updated) {
      throw new CollaboratorNotFoundException(collaboratorId);
    }

    return updated;
  }
}
