export const COMMITTEE_FREQUENCIES = [
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'adhoc',
] as const;

export type CommitteeFrequency = (typeof COMMITTEE_FREQUENCIES)[number];

export const COMMITTEE_STATUSES = ['active', 'inactive'] as const;
export type CommitteeStatus = (typeof COMMITTEE_STATUSES)[number];

export const COMMITTEE_MEMBER_ROLES = ['president', 'secretary', 'member'] as const;
export type CommitteeMemberRole = (typeof COMMITTEE_MEMBER_ROLES)[number];

export const MEETING_STATUSES = ['scheduled', 'happening', 'completed', 'canceled'] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MINUTE_STATUSES = ['draft', 'published'] as const;
export type MinuteStatus = (typeof MINUTE_STATUSES)[number];

export const ACTION_ITEM_STATUSES = ['todo', 'in_progress', 'blocked', 'done'] as const;
export type ActionItemStatus = (typeof ACTION_ITEM_STATUSES)[number];

export interface Committee {
  id: string;
  name: string;
  description: string | null;
  regulation: string | null;
  frequency: CommitteeFrequency;
  status: CommitteeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeMember {
  id: string;
  committeeId: string;
  profileId: string;
  role: CommitteeMemberRole;
  invitedBy: string;
  createdAt: string;
  profile?: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: string;
  };
}

export interface Meeting {
  id: string;
  committeeId: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  locationOrLink: string | null;
  status: MeetingStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingMinute {
  id: string;
  meetingId: string;
  content: unknown;
  status: MinuteStatus;
  publishedAt: string | null;
  publishedBy: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  committeeId: string;
  minuteId: string | null;
  title: string;
  description: string | null;
  assigneeId: string | null;
  groupLabel: string | null;
  dueDate: string | null;
  status: ActionItemStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface ActionUpdate {
  id: string;
  actionItemId: string;
  authorId: string;
  comment: string;
  statusChange: string | null;
  createdAt: string;
  author?: {
    fullName: string;
    avatarUrl: string | null;
  };
}
