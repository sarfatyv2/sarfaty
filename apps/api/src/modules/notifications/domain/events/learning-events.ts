import type { Role } from '@nexus/types';

export class CoursePublishedEvent {
  static readonly EVENT_NAME = 'course.published';

  constructor(
    public readonly courseId: string,
    public readonly courseTitle: string,
    public readonly targetRoles: Role[],
    public readonly actorId: string,
  ) {}
}
