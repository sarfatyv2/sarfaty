import { Inject, Injectable } from '@nestjs/common';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import { FlashAdapter } from '../integrations/flash/flash.adapter';

@Injectable()
export class ReactivateFlashCollaboratorUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly flashAdapter: FlashAdapter,
  ) {}

  async execute(collaboratorId: string): Promise<void> {
    const collaborator = await this.collaboratorRepository.findById(collaboratorId);
    if (!collaborator?.flashEmployeeId) {
      return;
    }

    if (!this.flashAdapter.isConfigured()) {
      return;
    }

    await this.flashAdapter.reactivateEmployee(collaborator.flashEmployeeId);
  }
}
