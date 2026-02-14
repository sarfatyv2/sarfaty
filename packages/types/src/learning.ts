export const COURSE_STATUSES = ['draft', 'published', 'archived'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const ENROLLMENT_STATUSES = ['enrolled', 'in_progress', 'completed', 'expired'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const COURSE_CATEGORIES = [
  'onboarding',
  'compliance',
  'product',
  'process',
  'skills',
  'leadership',
  'other',
] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface LessonMaterial {
  name: string;
  storagePath: string;
}
