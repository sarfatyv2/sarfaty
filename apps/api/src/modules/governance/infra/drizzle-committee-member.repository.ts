import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { govCommitteeMembers, profiles } from '../../../database/schema';
import type { CommitteeMemberRepository } from '../domain/committee-member.repository';
import type { CommitteeMember } from '@nexus/types';

@Injectable()
export class DrizzleCommitteeMemberRepository implements CommitteeMemberRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(member: CommitteeMember): Promise<CommitteeMember> {
    const [row] = await this.db
      .insert(govCommitteeMembers)
      .values({
        committeeId: member.committeeId,
        profileId: member.profileId,
        role: member.role,
        invitedBy: member.invitedBy,
      })
      .returning();

    return this.toCommitteeMember(row!);
  }

  async findByCommitteeId(committeeId: string): Promise<CommitteeMember[]> {
    const rows = await this.db
      .select({
        id: govCommitteeMembers.id,
        committeeId: govCommitteeMembers.committeeId,
        profileId: govCommitteeMembers.profileId,
        role: govCommitteeMembers.role,
        invitedBy: govCommitteeMembers.invitedBy,
        createdAt: govCommitteeMembers.createdAt,
        fullName: profiles.fullName,
        email: profiles.email,
        avatarUrl: profiles.avatarUrl,
        profileRole: profiles.role,
      })
      .from(govCommitteeMembers)
      .innerJoin(profiles, eq(govCommitteeMembers.profileId, profiles.id))
      .where(eq(govCommitteeMembers.committeeId, committeeId));

    return rows.map((row) => ({
      id: row.id,
      committeeId: row.committeeId,
      profileId: row.profileId,
      role: row.role as CommitteeMember['role'],
      invitedBy: row.invitedBy,
      createdAt: row.createdAt.toISOString(),
      profile: {
        fullName: row.fullName,
        email: row.email,
        avatarUrl: row.avatarUrl,
        role: row.profileRole,
      },
    }));
  }

  async findByCommitteeAndProfile(
    committeeId: string,
    profileId: string,
  ): Promise<CommitteeMember | null> {
    const [row] = await this.db
      .select()
      .from(govCommitteeMembers)
      .where(
        and(
          eq(govCommitteeMembers.committeeId, committeeId),
          eq(govCommitteeMembers.profileId, profileId),
        ),
      )
      .limit(1);

    return row ? this.toCommitteeMember(row) : null;
  }

  async updateRole(id: string, role: string): Promise<CommitteeMember | null> {
    const [row] = await this.db
      .update(govCommitteeMembers)
      .set({ role })
      .where(eq(govCommitteeMembers.id, id))
      .returning();
    return row ? this.toCommitteeMember(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(govCommitteeMembers)
      .where(eq(govCommitteeMembers.id, id))
      .returning({ id: govCommitteeMembers.id });
    return result.length > 0;
  }

  private toCommitteeMember(row: typeof govCommitteeMembers.$inferSelect): CommitteeMember {
    return {
      id: row.id,
      committeeId: row.committeeId,
      profileId: row.profileId,
      role: row.role as CommitteeMember['role'],
      invitedBy: row.invitedBy,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
