import type { PaginationMeta } from '@nexus/types';
import type { Course } from './course.entity';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface CourseFilters {
  category?: string;
  status?: string;
  search?: string;
  targetRole?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedCourses {
  courses: Course[];
  pagination: PaginationMeta;
}

export interface CourseWithModulesAndLessons {
  course: Course;
  modules: {
    id: string;
    title: string;
    sortOrder: number;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      youtubeVideoId: string;
      durationSeconds: number;
      sortOrder: number;
      hasQuiz: boolean;
    }[];
  }[];
  totalLessons: number;
}

export interface CourseRepository {
  save(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findByIdWithModulesAndLessons(id: string): Promise<CourseWithModulesAndLessons | null>;
  findByFilters(filters: CourseFilters): Promise<PaginatedCourses>;
  update(id: string, data: Record<string, unknown>): Promise<Course | null>;
}
