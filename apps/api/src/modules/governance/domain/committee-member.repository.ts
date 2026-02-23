import type { CommitteeMember } from '@nexus/types';

export const COMMITTEE_MEMBER_REPOSITORY = Symbol('COMMITTEE_MEMBER_REPOSITORY');

export interface CommitteeMemberRepository {
  save(member: CommitteeMember): Promise<CommitteeMember>;
  findByCommitteeId(committeeId: string): Promise<CommitteeMember[]>;
  findByCommitteeAndProfile(committeeId: string, profileId: string): Promise<CommitteeMember | null>;
  updateRole(id: string, role: string): Promise<CommitteeMember | null>;
  delete(id: string): Promise<boolean>;
}
