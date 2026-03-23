import { Inject, Injectable, Logger } from '@nestjs/common';
import type { UpdateCollaboratorAdminDto } from '@nexus/validators';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import type { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';
import { FlashAdapter } from '../integrations/flash/flash.adapter';

@Injectable()
export class UpdateCollaboratorUseCase {
  private readonly logger = new Logger(UpdateCollaboratorUseCase.name);

  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly flashAdapter: FlashAdapter,
  ) {}

  async execute(id: string, dto: UpdateCollaboratorAdminDto): Promise<Collaborator> {
    const existing = await this.collaboratorRepository.findById(id);

    if (!existing) {
      throw new CollaboratorNotFoundException(id);
    }

    const updated = await this.collaboratorRepository.update(id, dto as Record<string, unknown>);

    if (!updated) {
      throw new CollaboratorNotFoundException(id);
    }

    await this.syncFlashIfEnabled(updated);

    return updated;
  }

  private async syncFlashIfEnabled(updated: Collaborator): Promise<void> {
    if (!this.flashAdapter.isConfigured() || !updated.flashEmployeeId) {
      return;
    }

    try {
      let managerFlashEmployeeId: string | null = null;
      if (updated.managerId) {
        const manager = await this.collaboratorRepository.findById(updated.managerId);
        managerFlashEmployeeId = manager?.flashEmployeeId ?? null;
      }

      await this.flashAdapter.patchCollaboratorFromDomain(updated, managerFlashEmployeeId);
    } catch (error) {
      this.logger.warn(
        `Flash sync failed after collaborator update (${updated.id}): ${String(error)}`,
      );
    }
  }
}
