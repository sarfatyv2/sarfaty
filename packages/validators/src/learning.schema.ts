import { z } from 'zod';
import { uuidSchema } from './common';
import { paginationQuerySchema } from './pagination.schema';

const ROLE_VALUES = [
  'sales_rep',
  'sales_supervisor',
  'sales_manager',
  'sales_director',
  'credit_analyst',
  'compliance_officer',
  'approver',
  'backoffice',
  'legal',
  'risk_manager',
  'recovery',
  'litigation',
  'employee',
  'people_manager',
  'hr',
  'dp',
  'hr_admin',
  'admin',
] as const;

const COURSE_CATEGORY_VALUES = [
  'onboarding',
  'compliance',
  'product',
  'process',
  'skills',
  'leadership',
  'other',
] as const;

const quizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(3, 'Pergunta deve ter pelo menos 3 caracteres'),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
      }),
    )
    .min(2, 'Quiz deve ter pelo menos 2 opções'),
  correctOptionId: z.string().min(1),
});

const lessonMaterialSchema = z.object({
  name: z.string().min(1),
  storagePath: z.string().min(1),
});

// --- Course ---

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  category: z.enum(COURSE_CATEGORY_VALUES),
  targetRoles: z.array(z.enum(ROLE_VALUES)).min(1, 'Selecione pelo menos um perfil'),
  isMandatory: z.boolean().default(false),
  deadlineDays: z.coerce.number().int().positive().optional(),
});

export type CreateCourseDto = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();

export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;

// --- Module ---

export const createModuleSchema = z.object({
  title: z.string().min(2, 'Título do módulo deve ter pelo menos 2 caracteres'),
  courseId: uuidSchema,
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export type CreateModuleDto = z.infer<typeof createModuleSchema>;

export const updateModuleSchema = z.object({
  title: z.string().min(2).optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
});

export type UpdateModuleDto = z.infer<typeof updateModuleSchema>;

// --- Lesson ---

export const createLessonSchema = z.object({
  title: z.string().min(2, 'Título da aula deve ter pelo menos 2 caracteres'),
  moduleId: uuidSchema,
  youtubeVideoId: z.string().min(5, 'ID do vídeo YouTube inválido'),
  durationSeconds: z.coerce.number().int().positive('Duração deve ser positiva'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  materials: z.array(lessonMaterialSchema).optional(),
  quiz: z.array(quizQuestionSchema).optional(),
  minQuizScore: z.coerce.number().int().min(0).max(100).default(70),
});

export type CreateLessonDto = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = createLessonSchema
  .omit({ moduleId: true })
  .partial();

export type UpdateLessonDto = z.infer<typeof updateLessonSchema>;

// --- Query ---

export const listCoursesQuerySchema = paginationQuerySchema.extend({
  category: z.enum(COURSE_CATEGORY_VALUES).optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type ListCoursesQueryDto = z.infer<typeof listCoursesQuerySchema>;

// --- Progress ---

export const updateLessonProgressSchema = z.object({
  watchedPct: z.coerce.number().int().min(0).max(100),
});

export type UpdateLessonProgressDto = z.infer<typeof updateLessonProgressSchema>;

// --- Quiz ---

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionId: z.string().min(1),
      }),
    )
    .min(1, 'Responda pelo menos uma pergunta'),
});

export type SubmitQuizDto = z.infer<typeof submitQuizSchema>;
