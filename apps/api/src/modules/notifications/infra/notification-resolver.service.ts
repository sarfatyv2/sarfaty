import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles, collaborators } from '../../../database/schema';

@Injectable()
export class NotificationResolverService {
  private readonly logger = new Logger(NotificationResolverService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  /**
   * Resolve profile IDs for users with any of the given roles.
   */
  async resolveByRoles(roles: string[]): Promise<string[]> {
    const rows = await this.db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(inArray(profiles.role, roles), eq(profiles.isActive, true)));

    return rows.map((r) => r.id);
  }

  /**
   * Resolve profile IDs for users in a specific team.
   */
  async resolveByTeam(teamId: string, roles?: string[]): Promise<string[]> {
    const conditions = [eq(profiles.teamId, teamId), eq(profiles.isActive, true)];
    if (roles && roles.length > 0) {
      conditions.push(inArray(profiles.role, roles));
    }

    const rows = await this.db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(...conditions));

    return rows.map((r) => r.id);
  }

  /**
   * Resolve the profile ID of a collaborator by their collaborator ID.
   */
  async resolveProfileByCollaboratorId(collaboratorId: string): Promise<string | null> {
    const [row] = await this.db
      .select({ profileId: collaborators.profileId })
      .from(collaborators)
      .where(eq(collaborators.id, collaboratorId))
      .limit(1);

    return row?.profileId ?? null;
  }

  /**
   * Resolve the manager's profile ID for a collaborator's team.
   */
  async resolveManagerForCollaborator(collaboratorId: string): Promise<string[]> {
    const [collab] = await this.db
      .select({
        profileId: collaborators.profileId,
      })
      .from(collaborators)
      .where(eq(collaborators.id, collaboratorId))
      .limit(1);

    if (!collab?.profileId) return [];

    const [profile] = await this.db
      .select({ teamId: profiles.teamId })
      .from(profiles)
      .where(eq(profiles.id, collab.profileId))
      .limit(1);

    if (!profile?.teamId) return [];

    return this.resolveByTeam(profile.teamId, ['people_manager', 'sales_supervisor']);
  }
}
