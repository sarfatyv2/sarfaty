import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import {
  COLLABORATOR_REPOSITORY,
  type CollaboratorRepository,
} from '../domain/collaborator.repository';
import type { Collaborator } from '../domain/collaborator.entity';
import { CollaboratorNotFoundException } from '../domain/exceptions/collaborator-not-found.exception';

export interface CollaboratorWithRole {
  collaborator: Collaborator;
  role: string | null;
}

@Injectable()
export class GetCollaboratorUseCase {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorRepository: CollaboratorRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async execute(id: string): Promise<CollaboratorWithRole> {
    const collaborator = await this.collaboratorRepository.findById(id);

    if (!collaborator) {
      throw new CollaboratorNotFoundException(id);
    }

    let role: string | null = null;
    if (collaborator.profileId) {
      const [row] = await this.db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, collaborator.profileId))
        .limit(1);
      role = row?.role ?? null;
    }

    return { collaborator, role };
  }
}
