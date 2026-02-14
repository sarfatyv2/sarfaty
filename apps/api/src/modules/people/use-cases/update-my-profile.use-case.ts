import { Inject, Injectable } from '@nestjs/common';
import type { UpdateCollaboratorSelfDto } from '@nexus/validators';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(profileId: string, dto: UpdateCollaboratorSelfDto): Promise<Collaborator> {
    const existing = await this.collaboratorRepository.findByProfileId(profileId);

    if (!existing) {
      throw new CollaboratorNotFoundException(profileId);
    }

    // Filter to only self-editable fields
    const safeData = Collaborator.filterSelfEditableFields(dto as Record<string, unknown>);

    const updated = await this.collaboratorRepository.update(existing.id, safeData);

    if (!updated) {
      throw new CollaboratorNotFoundException(existing.id);
    }

    return updated;
  }
}
