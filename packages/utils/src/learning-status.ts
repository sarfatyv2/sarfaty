import type { CourseStatus, EnrollmentStatus, CourseCategory } from '@nexus/types';
import type { StatusColor } from './client-status';

// --- Course Status ---

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, StatusColor> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

export const COURSE_STATUS_ICONS: Record<CourseStatus, string> = {
  draft: 'Pencil',
  published: 'CheckCircle2',
  archived: 'Archive',
};

// --- Enrollment Status ---

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  enrolled: 'Matriculado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  expired: 'Expirado',
};

export const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, StatusColor> = {
  enrolled: 'outline',
  in_progress: 'secondary',
  completed: 'default',
  expired: 'destructive',
};

export const ENROLLMENT_STATUS_ICONS: Record<EnrollmentStatus, string> = {
  enrolled: 'BookOpen',
  in_progress: 'PlayCircle',
  completed: 'CheckCircle2',
  expired: 'Clock',
};

// --- Course Category ---

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  onboarding: 'Onboarding',
  compliance: 'Compliance',
  product: 'Produto',
  process: 'Processo',
  skills: 'Habilidades',
  leadership: 'Liderança',
  other: 'Outros',
};

export const COURSE_CATEGORY_ICONS: Record<CourseCategory, string> = {
  onboarding: 'UserPlus',
  compliance: 'ShieldCheck',
  product: 'Package',
  process: 'Workflow',
  skills: 'Lightbulb',
  leadership: 'Crown',
  other: 'BookOpen',
};

// --- Helper functions ---

export function getCourseStatusLabel(status: string): string {
  return COURSE_STATUS_LABELS[status as CourseStatus] ?? status;
}

export function getCourseStatusColor(status: string): StatusColor {
  return COURSE_STATUS_COLORS[status as CourseStatus] ?? 'secondary';
}

export function getEnrollmentStatusLabel(status: string): string {
  return ENROLLMENT_STATUS_LABELS[status as EnrollmentStatus] ?? status;
}

export function getEnrollmentStatusColor(status: string): StatusColor {
  return ENROLLMENT_STATUS_COLORS[status as EnrollmentStatus] ?? 'secondary';
}

export function getCourseCategoryLabel(category: string): string {
  return COURSE_CATEGORY_LABELS[category as CourseCategory] ?? category;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}
