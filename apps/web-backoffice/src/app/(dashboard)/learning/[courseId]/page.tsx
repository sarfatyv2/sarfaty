import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Badge, Skeleton } from '@nexus/ui';
import { ArrowLeft, Clock, Users, BookOpen, CheckCircle2 } from 'lucide-react';
import { getCourseCategoryLabel, getEnrollmentStatusLabel, formatDuration } from '@nexus/utils';
import { ModuleAccordion } from './_components/module-accordion';
import { EnrollButton } from './_components/enroll-button';

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
  status: string;
  totalDurationSeconds: number;
  isMandatory: boolean;
  targetRoles: string[];
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

interface MyEnrollment {
  id: string;
  courseId: string;
  collaboratorId: string;
  status: string;
  progressPct: number;
  enrolledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  deadlineAt: string | null;
  completedLessonIds: string[];
}

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  try {
    const response = await serverFetch<CourseDetail>(`/learning/courses/${courseId}`);
    return {
      title: `${response.data.title} | Treinamentos | Sarfaty`,
    };
  } catch {
    return { title: 'Curso | Sarfaty' };
  }
}

async function CourseContent({ courseId }: { courseId: string }) {
  try {
    const [courseResponse, enrollmentResponse] = await Promise.all([
      serverFetch<CourseDetail>(`/learning/courses/${courseId}`),
      serverFetch<MyEnrollment | null>(`/learning/courses/${courseId}/my-enrollment`).catch(() => ({
        data: null,
      })),
    ]);

    const course = courseResponse.data;
    const enrollment = enrollmentResponse.data;
    const isEnrolled = enrollment !== null;
    const isCompleted = enrollment?.status === 'completed';

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-96 shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <BookOpen size={64} className="text-primary/30" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getCourseCategoryLabel(course.category)}</Badge>
              {course.isMandatory && (
                <Badge variant="destructive">Obrigatorio</Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 size={12} className="mr-1" />
                  Concluido
                </Badge>
              )}
              {isEnrolled && !isCompleted && (
                <Badge variant="secondary">
                  {getEnrollmentStatusLabel(enrollment.status)}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            {course.description && (
              <p className="text-muted-foreground">{course.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatDuration(course.totalDurationSeconds)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                {course.totalLessons} aulas
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {course.modules.length} modulos
              </span>
            </div>

            {/* Enrollment actions */}
            {isEnrolled && !isCompleted && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${enrollment.progressPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{enrollment.progressPct}%</span>
                </div>
              </div>
            )}

            {!isEnrolled && course.status === 'published' && (
              <EnrollButton courseId={course.id} />
            )}
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Conteudo do Curso</h2>
          <ModuleAccordion
            modules={course.modules}
            courseId={course.id}
            enrollmentId={enrollment?.id}
            completedLessonIds={enrollment?.completedLessonIds}
          />
        </div>
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar curso.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function CourseSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="lg:w-96 aspect-video rounded-lg" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`skel-${String(i)}`} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;

  return (
    <div className="space-y-6">
      <Link href="/learning" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} />
        Voltar aos treinamentos
      </Link>

      <Suspense fallback={<CourseSkeleton />}>
        <CourseContent courseId={courseId} />
      </Suspense>
    </div>
  );
}
