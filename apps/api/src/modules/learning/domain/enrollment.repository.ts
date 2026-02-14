import type { Enrollment } from './enrollment.entity';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

export interface LessonCompletionData {
  enrollmentId: string;
  lessonId: string;
  watchedPct: number;
  quizScore?: number;
  quizPassed?: boolean;
  completedAt?: Date;
}

export interface LessonCompletion {
  id: string;
  enrollmentId: string;
  lessonId: string;
  watchedPct: number;
  quizScore: number | null;
  quizPassed: boolean | null;
  completedAt: Date | null;
  createdAt: Date | null;
}

export interface EnrollmentWithCourse extends Enrollment {
  courseTitle: string;
  courseCategory: string;
  courseThumbnailUrl: string | null;
  courseTotalDurationSeconds: number;
}

export interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  category: string;
  isMandatory: boolean;
  totalEnrolled: number;
  inProgress: number;
  completed: number;
  avgProgressPct: number;
}

export interface EnrollmentWithCollaborator {
  enrollmentId: string;
  collaboratorId: string;
  collaboratorName: string;
  department: string | null;
  jobTitle: string | null;
  status: string;
  progressPct: number;
  enrolledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  deadlineAt: Date | null;
}

export interface CourseEnrollmentFilters {
  status?: string;
  search?: string;
}

export interface EnrollmentRepository {
  save(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: string): Promise<Enrollment | null>;
  findByCollaboratorAndCourse(collaboratorId: string, courseId: string): Promise<Enrollment | null>;
  findByCollaboratorWithCourse(collaboratorId: string): Promise<EnrollmentWithCourse[]>;
  findByCourse(courseId: string): Promise<Enrollment[]>;
  update(id: string, data: Record<string, unknown>): Promise<Enrollment | null>;
  saveLessonCompletion(data: LessonCompletionData): Promise<void>;
  findLessonCompletion(enrollmentId: string, lessonId: string): Promise<LessonCompletion | null>;
  countCompletedLessons(enrollmentId: string): Promise<number>;
  countTotalLessonsForCourse(courseId: string): Promise<number>;
  findCompletedLessonIdsByEnrollment(enrollmentId: string): Promise<string[]>;
  getProgressSummaryByCourse(): Promise<CourseProgressSummary[]>;
  getEnrollmentsByCourseWithCollaborator(
    courseId: string,
    filters?: CourseEnrollmentFilters,
  ): Promise<EnrollmentWithCollaborator[]>;
}
