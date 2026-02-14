import { Inject, Injectable } from '@nestjs/common';
import type { UpdateCollaboratorAdminDto } from '@nexus/validators';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import type { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';

@Injectable()
export class UpdateCollaboratorUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
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

    return updated;
  }
}
