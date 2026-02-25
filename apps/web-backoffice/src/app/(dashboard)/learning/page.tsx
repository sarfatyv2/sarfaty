import type { Metadata } from 'next';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/api-server';
import { Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '@nexus/ui';
import { CourseCard } from './_components/course-card';
import { CourseFilters } from './_components/course-filters';

export const metadata: Metadata = {
  title: 'Treinamentos | Sarfaty',
  description: 'Cursos e treinamentos corporativos',
};

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
  status: string;
  totalDurationSeconds: number;
  isMandatory: boolean;
  targetRoles: string[];
}

interface EnrollmentRow {
  id: string;
  courseId: string;
  status: string;
  progressPct: number;
  courseTitle: string;
  courseCategory: string;
  courseThumbnailUrl: string | null;
  courseTotalDurationSeconds: number;
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function MyEnrollments() {
  try {
    const response = await serverFetch<EnrollmentRow[]>('/learning/my-enrollments');
    const enrollments = response.data ?? [];

    if (enrollments.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Você ainda não está matriculado em nenhum curso.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Explore o catálogo para encontrar cursos disponíveis.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {enrollments.map((enrollment) => (
          <CourseCard
            key={enrollment.id}
            course={{
              id: enrollment.courseId,
              title: enrollment.courseTitle,
              description: null,
              thumbnailUrl: enrollment.courseThumbnailUrl,
              category: enrollment.courseCategory,
              status: 'published',
              totalDurationSeconds: enrollment.courseTotalDurationSeconds,
              isMandatory: false,
              targetRoles: [],
            }}
            enrollmentProgress={enrollment.progressPct}
            enrollmentStatus={enrollment.status}
          />
        ))}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar matrículas.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

async function CourseCatalog({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: Record<string, string | number | boolean | undefined> = {
    page: searchParams.page ?? '1',
    pageSize: '20',
    status: 'published',
  };

  if (searchParams.search) params.search = searchParams.search;
  if (searchParams.category) params.category = searchParams.category;

  try {
    const response = await serverFetch<CourseRow[]>('/learning/courses', params);
    const courses = response.data ?? [];

    if (courses.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso encontrado.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar cursos.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={`skel-${String(i)}`} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default async function LearningPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-normal">Treinamentos</h1>
        <p className="text-sm text-muted-foreground">
          Cursos e capacitações para o seu desenvolvimento profissional
        </p>
      </div>

      <Tabs defaultValue="my-courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="space-y-6">
          <Suspense fallback={<GridSkeleton />}>
            <MyEnrollments />
          </Suspense>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <Suspense fallback={null}>
            <CourseFilters />
          </Suspense>

          <Suspense fallback={<GridSkeleton />}>
            <CourseCatalog searchParams={resolvedParams} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
