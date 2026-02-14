import { Inject, Injectable } from '@nestjs/common';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import type { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async execute(profileId: string): Promise<Collaborator> {
    const collaborator = await this.collaboratorRepository.findByProfileId(profileId);

    if (!collaborator) {
      throw new CollaboratorNotFoundException(profileId);
    }

    return collaborator;
  }
}
